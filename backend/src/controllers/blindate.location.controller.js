const Blindate = require('../models/blindate.model');
const NegotiationChat = require('../models/negotiation-chat.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { createNotification } = require('../utils/notification-helper');
const socketIO = require('../socket');

// Gửi vote địa điểm
exports.voteLocation = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { location } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!location || !location.name || !location.address) {
      return res.status(400).json({ message: 'Thông tin địa điểm không đầy đủ' });
    }

    // Kiểm tra ID blindate
    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có đang ở trạng thái accepted không
    if (blindate.status !== 'accepted') {
      return res.status(400).json({ message: 'Cuộc hẹn chưa được chấp nhận' });
    }

    // Xác định vị trí của người dùng trong mảng users
    const userIndex = blindate.users.findIndex(id => id.toString() === userId);
    const isFirstUser = userIndex === 0;

    // Khởi tạo locationVoting nếu chưa có
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'pending',
        chatRoomId: ''
      };
    }

    // Cập nhật vote địa điểm của người dùng
    if (isFirstUser) {
      blindate.locationVoting.user1VoteLocation = {
        name: location.name,
        address: location.address,
        coordinates: location.coordinates || [0, 0],
        votedAt: new Date()
      };
    } else {
      blindate.locationVoting.user2VoteLocation = {
        name: location.name,
        address: location.address,
        coordinates: location.coordinates || [0, 0],
        votedAt: new Date()
      };
    }

    // Kiểm tra xem cả hai người dùng đã vote chưa
    const user1Voted = blindate.locationVoting.user1VoteLocation && blindate.locationVoting.user1VoteLocation.name;
    const user2Voted = blindate.locationVoting.user2VoteLocation && blindate.locationVoting.user2VoteLocation.name;

    if (user1Voted && user2Voted) {
      // Kiểm tra xem hai người dùng có chọn cùng một địa điểm không
      const sameLocation = 
        blindate.locationVoting.user1VoteLocation.name === blindate.locationVoting.user2VoteLocation.name &&
        blindate.locationVoting.user1VoteLocation.address === blindate.locationVoting.user2VoteLocation.address;

      if (sameLocation) {
        // Nếu cùng một địa điểm, cập nhật finalLocation và đổi status thành confirmed
        blindate.locationVoting.finalLocation = {
          name: blindate.locationVoting.user1VoteLocation.name,
          address: blindate.locationVoting.user1VoteLocation.address,
          coordinates: blindate.locationVoting.user1VoteLocation.coordinates,
          confirmedAt: new Date()
        };
        blindate.locationVoting.status = 'confirmed';

        // Cập nhật thông tin địa điểm trong dateDetails
        blindate.dateDetails.location = {
          name: blindate.locationVoting.finalLocation.name,
          address: blindate.locationVoting.finalLocation.address,
          coordinates: blindate.locationVoting.finalLocation.coordinates
        };

        // Gửi thông báo cho cả hai người dùng
        const otherUserId = blindate.users.find(id => id.toString() !== userId);
        await createNotification({
          recipient: otherUserId,
          sender: userId,
          type: 'location_confirmed',
          content: `Địa điểm hẹn hò đã được xác nhận: ${blindate.locationVoting.finalLocation.name}`,
          reference: {
            type: 'blindate',
            id: blindate._id
          }
        });
      } else {
        // Nếu khác địa điểm, đổi status thành negotiating và tạo phòng chat nếu chưa có
        blindate.locationVoting.status = 'negotiating';
        
        if (!blindate.locationVoting.chatRoomId) {
          const chatRoomId = uuidv4();
          blindate.locationVoting.chatRoomId = chatRoomId;
          
          // Tạo phòng chat mới
          const newChatRoom = new NegotiationChat({
            blindateId: blindate._id,
            chatRoomId,
            messages: [{
              sender: userId,
              content: 'Phòng chat thương lượng địa điểm đã được tạo',
              timestamp: new Date(),
              isSystemMessage: true
            }],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await newChatRoom.save();
          
          // Gửi thông báo cho người dùng khác
          const otherUserId = blindate.users.find(id => id.toString() !== userId);
          await createNotification({
            recipient: otherUserId,
            sender: userId,
            type: 'negotiation_started',
            content: 'Cần thương lượng về địa điểm hẹn hò',
            reference: {
              type: 'blindate',
              id: blindate._id
            }
          });
        }
      }
    }

    // Lưu thay đổi
    await blindate.save();

    // Gửi thông báo qua socket.io
    const io = socketIO.getIO();
    io.to(`blindate_${blindateId}`).emit('location_vote_updated', {
      blindateId,
      locationVoting: blindate.locationVoting
    });

    return res.status(200).json({
      message: 'Đã gửi lựa chọn địa điểm thành công',
      status: blindate.locationVoting.status,
      locationVoting: blindate.locationVoting
    });
  } catch (error) {
    console.error('Error voting location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Kiểm tra trạng thái vote địa điểm
exports.getLocationStatus = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    // Kiểm tra ID blindate
    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của cuộc hẹn này' });
    }

    // Nếu chưa có locationVoting, trả về trạng thái mặc định
    if (!blindate.locationVoting) {
      return res.status(200).json({
        status: 'pending',
        message: 'Chưa có ai chọn địa điểm'
      });
    }

    // Xác định vị trí của người dùng trong mảng users
    const userIndex = blindate.users.findIndex(id => id.toString() === userId);
    const isFirstUser = userIndex === 0;

    // Kiểm tra xem người dùng đã vote chưa
    const userVoted = isFirstUser 
      ? blindate.locationVoting.user1VoteLocation && blindate.locationVoting.user1VoteLocation.name
      : blindate.locationVoting.user2VoteLocation && blindate.locationVoting.user2VoteLocation.name;

    // Kiểm tra xem người dùng kia đã vote chưa
    const otherUserVoted = isFirstUser
      ? blindate.locationVoting.user2VoteLocation && blindate.locationVoting.user2VoteLocation.name
      : blindate.locationVoting.user1VoteLocation && blindate.locationVoting.user1VoteLocation.name;

    let message = '';
    if (!userVoted && !otherUserVoted) {
      message = 'Chưa có ai chọn địa điểm';
    } else if (userVoted && !otherUserVoted) {
      message = 'Bạn đã chọn địa điểm, đang chờ đối phương';
    } else if (!userVoted && otherUserVoted) {
      message = 'Đối phương đã chọn địa điểm, đang chờ bạn';
    } else if (blindate.locationVoting.status === 'confirmed') {
      message = 'Địa điểm đã được xác nhận';
    } else if (blindate.locationVoting.status === 'negotiating') {
      message = 'Cần thương lượng về địa điểm';
    }

    return res.status(200).json({
      status: blindate.locationVoting.status,
      message,
      locationVoting: blindate.locationVoting,
      userVoted,
      otherUserVoted
    });
  } catch (error) {
    console.error('Error getting location status:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Tạo phòng chat thương lượng
exports.initiateNegotiationChat = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;

    // Kiểm tra ID blindate
    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có đang ở trạng thái accepted không
    if (blindate.status !== 'accepted') {
      return res.status(400).json({ message: 'Cuộc hẹn chưa được chấp nhận' });
    }

    // Khởi tạo locationVoting nếu chưa có
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'negotiating',
        chatRoomId: ''
      };
    }

    // Kiểm tra xem đã có phòng chat chưa
    if (blindate.locationVoting.chatRoomId) {
      // Kiểm tra xem phòng chat có tồn tại không
      const existingChat = await NegotiationChat.findOne({ chatRoomId: blindate.locationVoting.chatRoomId });
      if (existingChat) {
        return res.status(200).json({
          message: 'Phòng chat đã tồn tại',
          chatRoomId: blindate.locationVoting.chatRoomId
        });
      }
    }

    // Tạo phòng chat mới
    const chatRoomId = uuidv4();
    blindate.locationVoting.chatRoomId = chatRoomId;
    blindate.locationVoting.status = 'negotiating';

    const newChatRoom = new NegotiationChat({
      blindateId: blindate._id,
      chatRoomId,
      messages: [{
        sender: userId,
        content: 'Phòng chat thương lượng địa điểm đã được tạo',
        timestamp: new Date(),
        isSystemMessage: true
      }],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newChatRoom.save();
    await blindate.save();

    // Gửi thông báo cho người dùng khác
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'negotiation_started',
      content: 'Cần thương lượng về địa điểm hẹn hò',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    // Gửi thông báo qua socket.io
    const io = socketIO.getIO();
    io.to(`blindate_${blindateId}`).emit('negotiation_chat_created', {
      blindateId,
      chatRoomId
    });

    return res.status(201).json({
      message: 'Đã tạo phòng chat thương lượng thành công',
      chatRoomId
    });
  } catch (error) {
    console.error('Error initiating negotiation chat:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Chốt địa điểm cuối cùng
exports.confirmFinalLocation = async (req, res) => {
  try {
    const { blindateId } = req.params;
    const { userId } = req;
    const { location } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!location || !location.name || !location.address) {
      return res.status(400).json({ message: 'Thông tin địa điểm không đầy đủ' });
    }

    // Kiểm tra ID blindate
    if (!mongoose.Types.ObjectId.isValid(blindateId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của cuộc hẹn này' });
    }

    // Kiểm tra xem blindate có đang ở trạng thái accepted không
    if (blindate.status !== 'accepted') {
      return res.status(400).json({ message: 'Cuộc hẹn chưa được chấp nhận' });
    }

    // Khởi tạo locationVoting nếu chưa có
    if (!blindate.locationVoting) {
      blindate.locationVoting = {
        status: 'pending',
        chatRoomId: ''
      };
    }

    // Cập nhật địa điểm cuối cùng
    blindate.locationVoting.finalLocation = {
      name: location.name,
      address: location.address,
      coordinates: location.coordinates || [0, 0],
      confirmedAt: new Date()
    };
    blindate.locationVoting.status = 'confirmed';

    // Cập nhật thông tin địa điểm trong dateDetails
    blindate.dateDetails.location = {
      name: location.name,
      address: location.address,
      coordinates: location.coordinates || [0, 0]
    };

    // Lưu thay đổi
    await blindate.save();

    // Nếu có phòng chat, thêm tin nhắn hệ thống
    if (blindate.locationVoting.chatRoomId) {
      const chatRoom = await NegotiationChat.findOne({ chatRoomId: blindate.locationVoting.chatRoomId });
      if (chatRoom) {
        chatRoom.messages.push({
          sender: userId,
          content: `Địa điểm đã được chốt: ${location.name}`,
          timestamp: new Date(),
          isSystemMessage: true
        });
        await chatRoom.save();

        // Gửi thông báo qua socket.io
        const io = socketIO.getIO();
        io.to(blindate.locationVoting.chatRoomId).emit('location_confirmed', {
          blindateId,
          location: blindate.locationVoting.finalLocation
        });
      }
    }

    // Gửi thông báo cho người dùng khác
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'location_confirmed',
      content: `Địa điểm hẹn hò đã được xác nhận: ${location.name}`,
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    return res.status(200).json({
      message: 'Đã chốt địa điểm thành công',
      location: blindate.locationVoting.finalLocation
    });
  } catch (error) {
    console.error('Error confirming final location:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};