const Blindate = require('../models/blindate.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const NegotiationChat = require('../models/negotiation-chat.model');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification-helper');
const socketIO = require('../socket');
const { 
  validateStatusTransition, 
  validateDateDetails, 
  buildMatchFilterCriteria, 
  formatMatchResults,
  sendBlindateNotification 
} = require('../utils/blindate-helper');

// Import location-related functions from the separate controller
const locationController = require('./blindate.location.controller');

// Export location-related functions
exports.voteLocation = locationController.voteLocation;
exports.getLocationStatus = locationController.getLocationStatus;
exports.initiateNegotiationChat = locationController.initiateNegotiationChat;
exports.confirmFinalLocation = locationController.confirmFinalLocation;

// Tạo hoặc cập nhật một blindate
exports.createBlindate = async (req, res) => {
  try {
    const { userId } = req;
    const { partnerId } = req.body;

    // Kiểm tra xem partnerId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    // Kiểm tra xem người dùng có tồn tại không
    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra xem người dùng có bị chặn bởi đối phương hoặc đã chặn đối phương không
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Kiểm tra xem người dùng đã được xác minh chưa
    if (!currentUser.verification || !currentUser.verification.isVerified) {
      return res.status(403).json({ message: 'Bạn cần xác minh tài khoản để sử dụng tính năng Blind Date. Vui lòng vào trang Hồ sơ để xác minh.' });
    }

    // Kiểm tra xem đối tác đã được xác minh chưa
    if (!partner.verification || !partner.verification.isVerified) {
      return res.status(403).json({ message: 'Người dùng này chưa xác minh tài khoản nên không thể tham gia Blind Date.' });
    }

    // Kiểm tra xem người dùng hiện tại có trong danh sách bị chặn của đối phương không
    if (partner.blockedUsers && partner.blockedUsers.includes(userId)) {
      return res.status(403).json({ message: 'Không thể gửi lời mời hẹn hò đến người dùng này' });
    }

    // Kiểm tra xem đối phương có trong danh sách bị chặn của người dùng hiện tại không
    if (currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId)) {
      return res.status(403).json({ message: 'Bạn đã chặn người dùng này trước đó' });
    }

    // Tìm tất cả blinddate giữa hai người dùng (cả active và inactive)
    const allExistingBlindates = await Blindate.find({
      $and: [
        { users: userId },
        { users: partnerId }
      ]
    });

    // Kiểm tra xem có blinddate active nào không
    const activeBlinddate = allExistingBlindates.find(bd => bd.isActive);
    
    let blindateResult;
    let statusCode = 201; // Mặc định là created
    let responseMessage = 'Đã gửi lời mời hẹn hò thành công';
    
    // Biến để lưu trữ blinddate hiện có (nếu có)
    let existingBlindate = null;

    // Kiểm tra xem có blinddate active nào không
    if (activeBlinddate) {
      return res.status(200).json({ 
        message: 'Đã có lời mời hẹn hò giữa hai người dùng',
        blindate: activeBlinddate
      });
    }

    // Kiểm tra xem có blinddate bị từ chối trước đó không
    const rejectedBlinddate = allExistingBlindates.find(bd => bd.status === 'rejected');
    if (rejectedBlinddate) {
      return res.status(403).json({ 
        message: 'Lời mời hẹn hò đã bị từ chối trước đó, không thể gửi lại'
      });
    }

    // Nếu có blinddate inactive (cancelled/completed), kích hoạt lại
    const inactiveBlinddate = allExistingBlindates.find(bd => !bd.isActive);
    if (inactiveBlinddate) {
      existingBlindate = inactiveBlinddate;
      existingBlindate.isActive = true;
      existingBlindate.status = 'pending';
      
      // Cập nhật phản hồi của người dùng
      const userResponseIndex = existingBlindate.userResponses.findIndex(
        resp => resp.user.toString() === userId
      );
      
      if (userResponseIndex !== -1) {
        existingBlindate.userResponses[userResponseIndex].response = 'accepted';
        existingBlindate.userResponses[userResponseIndex].respondedAt = new Date();
      } else {
        existingBlindate.userResponses.push({
          user: userId,
          response: 'accepted',
          respondedAt: new Date()
        });
      }
      
      const partnerResponseIndex = existingBlindate.userResponses.findIndex(
        resp => resp.user.toString() === partnerId
      );
      
      if (partnerResponseIndex !== -1) {
        existingBlindate.userResponses[partnerResponseIndex].response = 'pending';
        existingBlindate.userResponses[partnerResponseIndex].respondedAt = null;
      } else {
        existingBlindate.userResponses.push({
          user: partnerId,
          response: 'pending',
          respondedAt: null
        });
      }
      
      await existingBlindate.save();
      blindateResult = existingBlindate;
      statusCode = 200; // OK
      responseMessage = 'Đã gửi lại lời mời hẹn hò thành công';
    } else {
      // Nếu chưa có blindate nào, tạo mới
      const newBlindate = new Blindate({
        users: [userId, partnerId],
        userResponses: [
          {
            user: userId,
            response: 'accepted', // Người tạo tự động chấp nhận
            respondedAt: new Date()
          },
          {
            user: partnerId,
            response: 'pending',
            respondedAt: null
          }
        ]
      });

      await newBlindate.save();
      blindateResult = newBlindate;
    }

    // Tạo thông báo cho người nhận
    await createNotification({
      recipient: partnerId,
      sender: userId,
      type: 'blindate_request',
      content: 'Bạn đã nhận được lời mời Blind date',
      reference: {
        type: 'blindate',
        id: blindateResult._id
      }
    });

    return res.status(statusCode).json({
      message: responseMessage,
      blindate: blindateResult
    });
  } catch (error) {
    console.error('Error creating blindate:', error);
    
    // Xử lý lỗi từ MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
    } else if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID không hợp lệ', error: error.message });
    }
    
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy danh sách blindate của người dùng
exports.getUserBlindates = async (req, res) => {
  try {
    const { userId } = req;
    const { status } = req.query;

    // Lấy thông tin người dùng hiện tại để biết danh sách người dùng bị chặn
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    let query = {
      users: userId,
      isActive: true
    };

    // Lọc theo trạng thái nếu có
    if (status) {
      query.status = status;
    }

    // Lấy tất cả blindate của người dùng
    const blindates = await Blindate.find(query)
      .populate('users', 'fullName avatar birthDate gender occupation blockedUsers')
      .populate('userResponses.user', 'fullName')
      .sort({ createdAt: -1 });

    // Lọc ra các blindate không chứa người dùng bị chặn
    const filteredBlindates = blindates.filter(blindate => {
      // Kiểm tra xem có người dùng nào trong blindate đã bị chặn không
      const otherUser = blindate.users.find(user => user._id.toString() !== userId);
      
      // Nếu không có người dùng khác, bỏ qua blindate này
      if (!otherUser) return false;
      
      // Kiểm tra xem người dùng hiện tại có bị chặn bởi người dùng khác không
      const isBlockedByOther = otherUser.blockedUsers && 
                              otherUser.blockedUsers.some(id => id.toString() === userId);
      
      // Kiểm tra xem người dùng khác có bị chặn bởi người dùng hiện tại không
      const isBlockingOther = currentUser.blockedUsers && 
                             currentUser.blockedUsers.some(id => id.toString() === otherUser._id.toString());
      
      // Chỉ giữ lại các blindate mà không có ai bị chặn
      return !isBlockedByOther && !isBlockingOther;
    });

    // Loại bỏ thông tin blockedUsers trước khi trả về
    const sanitizedBlindates = filteredBlindates.map(blindate => {
      const blindateObj = blindate.toObject();
      blindateObj.users = blindateObj.users.map(user => {
        delete user.blockedUsers;
        return user;
      });
      return blindateObj;
    });

    return res.status(200).json(sanitizedBlindates);
  } catch (error) {
    console.error('Error fetching blindates:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy chi tiết một blindate
exports.getBlindate = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin người dùng hiện tại để biết danh sách người dùng bị chặn
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    const blindate = await Blindate.findById(blindateId)
      .populate('users', 'fullName avatar birthDate gender occupation bio interests hobbies education blockedUsers')
      .populate('userResponses.user', 'fullName')
      .populate('reviews.user', 'fullName avatar');

    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.some(user => user._id.toString() === userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem cuộc hẹn này' });
    }

    // Kiểm tra xem người dùng có bị chặn bởi bất kỳ người dùng nào khác trong blindate không
    const otherUser = blindate.users.find(user => user._id.toString() !== userId);
    
    if (otherUser) {
      // Kiểm tra xem người dùng hiện tại có bị chặn bởi người dùng khác không
      const isBlockedByOther = otherUser.blockedUsers && 
                              otherUser.blockedUsers.some(id => id.toString() === userId);
      
      // Kiểm tra xem người dùng khác có bị chặn bởi người dùng hiện tại không
      const isBlockingOther = currentUser.blockedUsers && 
                             currentUser.blockedUsers.some(id => id.toString() === otherUser._id.toString());
      
      if (isBlockedByOther || isBlockingOther) {
        return res.status(403).json({ message: 'Không thể xem chi tiết cuộc hẹn này' });
      }
    }

    // Loại bỏ thông tin blockedUsers trước khi trả về
    const sanitizedBlindate = blindate.toObject();
    sanitizedBlindate.users = sanitizedBlindate.users.map(user => {
      delete user.blockedUsers;
      return user;
    });

    return res.status(200).json(sanitizedBlindate);
  } catch (error) {
    console.error('Error fetching blindate details:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Phản hồi lời mời blindate
exports.respondToBlindate = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { response } = req.body;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Phản hồi không hợp lệ' });
    }

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const blindate = await Blindate.findById(blindateId);

    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có đang ở trạng thái pending không
    if (blindate.status !== 'pending') {
      return res.status(400).json({ message: `Không thể thay đổi trạng thái cuộc hẹn ${blindate.status}` });
    }

    // Cập nhật phản hồi của người dùng
    const userResponseIndex = blindate.userResponses.findIndex(
      ur => ur.user.toString() === userId
    );

    if (userResponseIndex === -1) {
      return res.status(400).json({ message: 'Không tìm thấy thông tin phản hồi của bạn' });
    }

    blindate.userResponses[userResponseIndex].response = response;
    blindate.userResponses[userResponseIndex].respondedAt = new Date();

    // Lấy ID của đối phương
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Kiểm tra xem tất cả người dùng đã phản hồi chưa
    const allResponded = blindate.userResponses.every(ur => ur.response !== 'pending');

    if (allResponded) {
      // Kiểm tra xem tất cả người dùng có chấp nhận không
      const allAccepted = blindate.userResponses.every(ur => ur.response === 'accepted');
      
      if (allAccepted) {
        blindate.status = 'accepted';
      } else {
        blindate.status = 'rejected';
      }
    } else if (response === 'rejected') {
      blindate.status = 'rejected';
    }

    // Lưu thay đổi blindate
    await blindate.save();

    // Xử lý các hành động sau khi lưu blindate
    if (blindate.status === 'rejected' && response === 'rejected') {
      // Tạo thông báo cho người bị từ chối
      const acceptedUser = blindate.userResponses.find(ur => ur.response === 'accepted');
      if (acceptedUser) {
        await createNotification({
          recipient: acceptedUser.user,
          sender: userId,
          type: 'blindate_rejected',
          content: 'Lời mời Blind date của bạn đã bị từ chối',
          reference: {
            type: 'blindate',
            id: blindate._id
          }
        });
      }
      
      // Xử lý chặn người dùng sau khi đã lưu blindate
      // Bạn có thể thêm logic để cho phép người dùng chọn chặn hay không
      // thay vì tự động chặn như trước
      const currentUser = await User.findById(userId);
      if (currentUser && otherUserId) {
        if (!currentUser.blockedUsers.includes(otherUserId)) {
          currentUser.blockedUsers.push(otherUserId);
          await currentUser.save();
        }
      }
      
      const otherUser = await User.findById(otherUserId);
      if (otherUser && userId) {
        if (!otherUser.blockedUsers.includes(userId)) {
          otherUser.blockedUsers.push(userId);
          await otherUser.save();
        }
      }
    } else if (blindate.status === 'accepted') {
      // Tạo thông báo cho người còn lại
      await createNotification({
        recipient: otherUserId,
        sender: userId,
        type: 'blindate_accepted',
        content: 'Lời mời Blind date của bạn đã được chấp nhận',
        reference: {
          type: 'blindate',
          id: blindate._id
        }
      });
    }

    return res.status(200).json({
      message: `Đã ${response === 'accepted' ? 'chấp nhận' : 'từ chối'} lời mời hẹn hò`,
      blindate
    });
  } catch (error) {
    console.error('Error responding to blindate:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Cập nhật thông tin cuộc hẹn
exports.updateBlindate = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { dateDetails } = req.body;
    
    console.log('Updating blindate:', { blindateId, userId, dateDetails });
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    // Kiểm tra dateDetails có tồn tại
    if (!dateDetails) {
      return res.status(400).json({ message: 'Thiếu thông tin cuộc hẹn' });
    }
    
    const blindate = await Blindate.findById(blindateId);
    
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }
    
    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.some(id => id.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật cuộc hẹn này' });
    }
    
    // Kiểm tra xem blindate có ở trạng thái accepted không
    if (blindate.status !== 'accepted') {
      return res.status(400).json({
        message: `Không thể cập nhật cuộc hẹn với trạng thái ${blindate.status}`,
        status: blindate.status
      });
    }
    
    // Kiểm tra cấu trúc dateDetails
    const validation = validateDateDetails(dateDetails);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }
    
    // Cập nhật thông tin cuộc hẹn
    blindate.dateDetails = {
      ...blindate.dateDetails || {},
      ...dateDetails
    };
    
    // Đảm bảo các trường dữ liệu đúng định dạng
    if (blindate.dateDetails.duration) {
      blindate.dateDetails.duration = parseInt(blindate.dateDetails.duration);
    }
    
    if (blindate.dateDetails.scheduledFor) {
      const scheduledDate = new Date(blindate.dateDetails.scheduledFor);
      if (!isNaN(scheduledDate.getTime())) {
        blindate.dateDetails.scheduledFor = scheduledDate;
      }
    }
    
    await blindate.save();
    
    // Tạo thông báo cho người còn lại
    const otherUserId = blindate.users.find(id => id.toString() !== userId.toString());
    
    if (otherUserId) {
      await createNotification({
        recipient: otherUserId,
        sender: userId,
        type: 'blindate_updated',
        content: 'Thông tin cuộc hẹn bí ẩn đã được cập nhật',
        reference: {
          type: 'blindate',
          id: blindate._id
        }
      });
    }
    
    return res.status(200).json({
      message: 'Đã cập nhật thông tin cuộc hẹn',
      blindate
    });
  } catch (error) {
    console.error('Error updating blindate:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đánh giá cuộc hẹn
exports.reviewBlindate = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá không hợp lệ (1-5)' });
    }

    const blindate = await Blindate.findById(blindateId);

    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá cuộc hẹn này' });
    }

    // Kiểm tra xem cuộc hẹn có ở trạng thái phù hợp không
    if (!['accepted', 'completed'].includes(blindate.status)) {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá cuộc hẹn đã được chấp nhận hoặc hoàn thành' });
    }

    // Kiểm tra nếu cuộc hẹn bị hủy
    if (blindate.status === 'cancelled') {
      return res.status(400).json({ message: 'Không thể đánh giá cuộc hẹn đã bị hủy' });
    }

    // Kiểm tra xem cuộc hẹn đã diễn ra chưa
    if (!blindate.dateDetails || !blindate.dateDetails.scheduledFor || new Date(blindate.dateDetails.scheduledFor) > now) {
      return res.status(400).json({ message: 'Chỉ có thể đánh giá cuộc hẹn đã diễn ra' });
    }

    // Kiểm tra xem người dùng đã đánh giá chưa
    const existingReviewIndex = blindate.reviews.findIndex(
      review => review.user.toString() === userId
    );

    if (existingReviewIndex !== -1) {
      // Cập nhật đánh giá hiện có
      blindate.reviews[existingReviewIndex].rating = rating;
      blindate.reviews[existingReviewIndex].comment = comment || '';
      blindate.reviews[existingReviewIndex].createdAt = now;
    } else {
      // Thêm đánh giá mới
      blindate.reviews.push({
        user: userId,
        rating,
        comment: comment || '',
        createdAt: now
      });
    }

    // Kiểm tra trạng thái hoàn thành dựa trên thời gian
    const now = new Date();
    const scheduledDate = new Date(blindate.dateDetails.scheduledFor);
    const daysSinceScheduled = (now - scheduledDate) / (1000 * 60 * 60 * 24);

    // Kiểm tra xem tất cả người dùng đã đánh giá chưa
    const allReviewed = blindate.users.every(userId =>
      blindate.reviews.some(review => review.user.toString() === userId.toString())
    );

    // Tự động chuyển trạng thái thành hoàn thành sau 7 ngày nếu ít nhất 1 người đã đánh giá
    if (daysSinceScheduled > 7 && blindate.reviews.length > 0) {
      blindate.status = 'completed';
    } else if (allReviewed) {
      blindate.status = 'completed';
    }

    await blindate.save();

    // Tạo thông báo cho người còn lại
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'blindate_reviewed',
      content: 'Đối phương đã đánh giá cuộc hẹn bí ẩn',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    return res.status(200).json({
      message: 'Đã đánh giá cuộc hẹn thành công',
      blindate
    });
  } catch (error) {
    console.error('Error reviewing blindate:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Hủy cuộc hẹn
exports.cancelBlindate = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const blindate = await Blindate.findById(blindateId);

    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có thể hủy không
    if (['completed', 'cancelled'].includes(blindate.status)) {
      return res.status(400).json({ message: 'Không thể hủy cuộc hẹn đã hoàn thành hoặc đã hủy' });
    }

    // Cập nhật trạng thái
    blindate.status = 'cancelled';
    blindate.notes = reason || 'Đã hủy bởi người dùng';
    blindate.isActive = false;

    await blindate.save();

    // Tạo thông báo cho người còn lại
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'blindate_cancelled',
      content: 'Cuộc hẹn bí ẩn đã bị hủy',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    return res.status(200).json({
      message: 'Đã hủy cuộc hẹn thành công',
      blindate
    });
  } catch (error) {
    console.error('Error cancelling blindate:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy danh sách địa điểm gợi ý cho cuộc hẹn
exports.getSuggestedLocations = async (req, res) => {
  try {
    // Danh sách địa điểm gợi ý cố định
    const suggestedLocations = [
      {
        name: 'Highlands Coffee',
        address: '141 Nguyễn Du, Quận 1, TP.HCM',
        coordinates: [106.6957, 10.7765],
        type: 'cafe'
      },
      {
        name: 'The Coffee House',
        address: '86-88 Cao Thắng, Quận 3, TP.HCM',
        coordinates: [106.6789, 10.7732],
        type: 'cafe'
      },
      {
        name: 'Phúc Long Coffee & Tea',
        address: 'TTTM Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
        coordinates: [106.7032, 10.7772],
        type: 'cafe'
      },
      {
        name: 'Gong Cha',
        address: '188 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        coordinates: [106.6876, 10.7745],
        type: 'cafe'
      },
      {
        name: 'Nhà hàng Kichi Kichi',
        address: 'TTTM Crescent Mall, Quận 7, TP.HCM',
        coordinates: [106.7180, 10.7286],
        type: 'restaurant'
      },
      {
        name: 'Nhà hàng Hoàng Yến Cuisine',
        address: 'TTTM Vivo City, Quận 7, TP.HCM',
        coordinates: [106.7042, 10.7292],
        type: 'restaurant'
      },
      {
        name: 'Nhà hàng Buffet Sen',
        address: '60 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
        coordinates: [106.6912, 10.7756],
        type: 'restaurant'
      },
      {
        name: 'Qui Lounge & Bar',
        address: '22 Lê Thánh Tôn, Quận 1, TP.HCM',
        coordinates: [106.7042, 10.7772],
        type: 'bar'
      },
      {
        name: 'Broma Not A Bar',
        address: '41 Nguyễn Huệ, Quận 1, TP.HCM',
        coordinates: [106.7032, 10.7732],
        type: 'bar'
      },
      {
        name: 'Saigon Ranger',
        address: '5/7 Nguyễn Siêu, Quận 1, TP.HCM',
        coordinates: [106.7042, 10.7734],
        type: 'bar'
      }
    ];

    return res.status(200).json(suggestedLocations);
  } catch (error) {
    console.error('Error fetching suggested locations:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Tạo link video call cho cuộc hẹn trực tuyến
exports.createVideoCallLink = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const blindate = await Blindate.findById(blindateId);

    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là một phần của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền tạo link video call cho cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có ở trạng thái accepted không
    if (blindate.status !== 'accepted') {
      return res.status(400).json({ message: 'Chỉ có thể tạo link video call cho cuộc hẹn đã được chấp nhận' });
    }

    // Kiểm tra xem loại cuộc hẹn có phải là online không
    if (blindate.dateDetails.type !== 'online') {
      return res.status(400).json({ message: 'Chỉ có thể tạo link video call cho cuộc hẹn trực tuyến' });
    }

    // Tạo link video call (giả lập)
    const meetingId = Math.random().toString(36).substring(2, 15);
    const videoCallLink = `https://meet.bobace.com/${meetingId}`;

    // Cập nhật thông tin cuộc hẹn
    blindate.dateDetails.videoCallLink = videoCallLink;
    await blindate.save();

    // Tạo thông báo cho người còn lại
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'blindate_video_link',
      content: 'Link video call cho cuộc hẹn bí ẩn đã được tạo',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    return res.status(200).json({
      message: 'Đã tạo link video call thành công',
      videoCallLink,
      blindate
    });
  } catch (error) {
    console.error('Error creating video call link:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Tìm kiếm người dùng phù hợp cho blindate
exports.findBlinDateMatches = async (req, res) => {
  try {
    const { userId } = req;
    const { buildMatchFilterCriteria, formatMatchResults } = require('../utils/blindate-helper');
    
    // Lấy thông tin người dùng hiện tại
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
    }

    // Lấy danh sách ID của những người đã có blindate với người dùng hiện tại
    const blindateUserIds = await getExistingBlindateUserIds(userId);

    // Xây dựng tiêu chí lọc cơ bản
    const filterCriteria = buildMatchFilterCriteria(currentUser);
    
    // Thêm điều kiện lọc loại trừ những người đã có blindate
    filterCriteria._id = { 
      $ne: userId,
      $nin: blindateUserIds
    };
    
    // Thêm điều kiện về quyền riêng tư nếu có
    if (currentUser.settings && currentUser.settings.privacy) {
      filterCriteria['settings.privacy.showProfile'] = true;
    }
    
    // Thêm điều kiện về hiển thị trong khám phá nếu có
    if (currentUser.showInDiscovery !== undefined) {
      filterCriteria.showInDiscovery = true;
    }
    
    // Tìm kiếm người dùng phù hợp
    const potentialMatches = await User.find(filterCriteria)
      .select('_id fullName gender birthDate occupation education bio interests hobbies photos avatar city distance teaPreferences sugarLevel iceLevel favoriteTea lookingFor')
      .limit(10);

    // Chuyển đổi kết quả trả về
    const formattedMatches = formatMatchResults(potentialMatches);
    
    return res.status(200).json(formattedMatches);
  } catch (error) {
    console.error('Error finding blindate matches:', error);
    
    // Xử lý các loại lỗi cụ thể
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ', error: error.message });
    } else if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
    } else {
      return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
    }
  }
};

/**
 * Helper function to get IDs of users who already have blindates with the current user
 * @param {string} userId - The current user ID
 * @returns {Array} - Array of user IDs
 */
async function getExistingBlindateUserIds(userId) {
  // Tìm tất cả các blindate đang hoạt động của người dùng hiện tại
  const activeBlindates = await Blindate.find({
    users: userId,
    isActive: true,
    // Chỉ lấy các blindate đã được chấp nhận hoặc đang chờ phản hồi
    $or: [
      { status: 'accepted' },
      { status: 'pending' }
    ]
  });

  // Lấy danh sách ID của những người đã có blindate với người dùng hiện tại
  const blindateUserIds = [];
  activeBlindates.forEach(blindate => {
    blindate.users.forEach(user => {
      if (user.toString() !== userId.toString()) {
        blindateUserIds.push(user);
      }
    });
  });

  return blindateUserIds;
}

// Hàm tính tuổi từ ngày sinh
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};