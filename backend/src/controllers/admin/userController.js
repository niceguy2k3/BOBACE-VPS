const User = require('../../models/user.model');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { isValidObjectId } = mongoose;

/**
 * Lấy danh sách người dùng với các bộ lọc và phân trang
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search = '',
      gender,
      premium,
      verified,
      role,
      active
    } = req.query;

    // Xây dựng query
    const query = {};

    // Tìm kiếm theo tên hoặc email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo giới tính
    if (gender) {
      query.gender = gender;
    }

    // Lọc theo premium
    if (premium === 'true') {
      query.premium = true;
    } else if (premium === 'false') {
      query.premium = false;
    }

    // Lọc theo xác minh
    if (verified === 'true') {
      query['verification.isVerified'] = true;
    } else if (verified === 'false') {
      query['verification.isVerified'] = false;
    }

    // Lọc theo vai trò
    if (role) {
      query.role = role;
    }

    // Lọc theo trạng thái hoạt động
    if (active === 'true') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      query.lastActive = { $gte: oneHourAgo };
    } else if (active === 'false') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      query.lastActive = { $lt: oneHourAgo };
    }

    // Thực hiện truy vấn với phân trang
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sort]: order === 'asc' ? 1 : -1 },
      select: '-password -refreshToken',
      lean: true
    };

    const result = await User.paginate(query, options);

    // Thêm trường online cho mỗi người dùng
    const users = result.docs.map(user => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const isOnline = user.lastActive && new Date(user.lastActive) >= oneHourAgo;
      return {
        ...user,
        online: isOnline
      };
    });

    return res.status(200).json({
      users,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        limit: result.limit,
        pages: result.totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
  }
};

/**
 * Lấy thông tin chi tiết người dùng theo ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Thêm trường online
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isOnline = user.lastActive && new Date(user.lastActive) >= oneHourAgo;

    return res.status(200).json({
      ...user.toObject(),
      online: isOnline
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
  }
};

/**
 * Cập nhật thông tin người dùng
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Xóa các trường nhạy cảm khỏi dữ liệu cập nhật
    delete updateData.password;
    delete updateData.refreshToken;
    delete updateData.role; // Vai trò được cập nhật qua API riêng

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật thông tin người dùng
    Object.keys(updateData).forEach(key => {
      user[key] = updateData[key];
    });

    await user.save();

    return res.status(200).json({
      message: 'Cập nhật thông tin người dùng thành công',
      user: user.toObject({ getters: true, virtuals: true, transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
      }})
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin người dùng' });
  }
};

/**
 * Xóa người dùng
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Xóa người dùng
    await User.findByIdAndDelete(id);

    // TODO: Xóa các dữ liệu liên quan (matches, messages, likes, v.v.)

    return res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa người dùng' });
  }
};

/**
 * Cập nhật vai trò người dùng
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    if (!role || !['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật vai trò
    user.role = role;
    await user.save();

    return res.status(200).json({
      message: 'Cập nhật vai trò người dùng thành công',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật vai trò người dùng' });
  }
};

/**
 * Xác minh người dùng
 */
exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, method } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật trạng thái xác minh
    if (isVerified === true && !method) {
      return res.status(400).json({ message: 'Phương thức xác minh là bắt buộc' });
    }

    user.verification = {
      isVerified: !!isVerified,
      method: isVerified ? method : user.verification?.method,
      verifiedAt: isVerified ? new Date() : null
    };

    await user.save();

    return res.status(200).json({
      message: `${isVerified ? 'Xác minh' : 'Hủy xác minh'} người dùng thành công`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        verification: user.verification
      }
    });
  } catch (error) {
    console.error('Error in verifyUser:', error);
    return res.status(500).json({ message: 'Lỗi server khi xác minh người dùng' });
  }
};

/**
 * Cập nhật trạng thái premium
 */
exports.togglePremium = async (req, res) => {
  try {
    const { id } = req.params;
    const { premium, days } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    if (premium === undefined) {
      return res.status(400).json({ message: 'Trạng thái premium là bắt buộc' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật trạng thái premium
    user.premium = !!premium;
    
    // Xử lý thời hạn premium
    if (premium) {
      // Nếu có số ngày cụ thể
      if (days && Number.isInteger(days) && days > 0) {
        user.premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      } 
      // Nếu đã có thời hạn và muốn gia hạn thêm 30 ngày
      else if (user.premiumUntil && user.premiumUntil > new Date()) {
        user.premiumUntil = new Date(user.premiumUntil.getTime() + 30 * 24 * 60 * 60 * 1000);
      } 
      // Mặc định là 30 ngày từ hiện tại
      else {
        user.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Nếu hạ cấp, xóa thời hạn
      user.premiumUntil = null;
    }

    await user.save();

    return res.status(200).json({
      message: `${premium ? 'Nâng cấp' : 'Hạ cấp'} tài khoản thành công`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        premium: user.premium,
        premiumUntil: user.premiumUntil
      }
    });
  } catch (error) {
    console.error('Error in togglePremium:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái premium' });
  }
};

/**
 * Cấm người dùng
 */
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Lý do cấm là bắt buộc' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cấm người dùng
    user.banned = true;
    user.banReason = reason;
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;

    await user.save();

    return res.status(200).json({
      message: 'Cấm người dùng thành công',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        banned: user.banned,
        banReason: user.banReason,
        bannedAt: user.bannedAt
      }
    });
  } catch (error) {
    console.error('Error in banUser:', error);
    return res.status(500).json({ message: 'Lỗi server khi cấm người dùng' });
  }
};

/**
 * Bỏ cấm người dùng
 */
exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Bỏ cấm người dùng
    user.banned = false;
    user.banReason = null;
    user.bannedAt = null;
    user.bannedBy = null;

    await user.save();

    return res.status(200).json({
      message: 'Bỏ cấm người dùng thành công',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        banned: user.banned
      }
    });
  } catch (error) {
    console.error('Error in unbanUser:', error);
    return res.status(500).json({ message: 'Lỗi server khi bỏ cấm người dùng' });
  }
};

/**
 * Xác minh nhiều người dùng cùng lúc
 */
exports.bulkVerifyUsers = async (req, res) => {
  try {
    const { userIds, isVerified, method } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID người dùng không hợp lệ' });
    }

    if (isVerified === true && !method) {
      return res.status(400).json({ message: 'Phương thức xác minh là bắt buộc khi xác minh người dùng' });
    }

    // Lọc các ID hợp lệ
    const validUserIds = userIds.filter(id => isValidObjectId(id));
    
    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'Không có ID người dùng hợp lệ' });
    }

    // Cập nhật trạng thái xác minh cho nhiều người dùng
    const updateData = {
      'verification.isVerified': !!isVerified
    };
    
    if (isVerified) {
      updateData['verification.method'] = method;
      updateData['verification.verifiedAt'] = new Date();
    }

    const result = await User.updateMany(
      { _id: { $in: validUserIds } },
      { $set: updateData }
    );

    return res.status(200).json({
      message: `${isVerified ? 'Xác minh' : 'Hủy xác minh'} ${result.modifiedCount} người dùng thành công`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Error in bulkVerifyUsers:', error);
    return res.status(500).json({ message: 'Lỗi server khi xác minh người dùng hàng loạt' });
  }
};

/**
 * Cập nhật trạng thái premium cho nhiều người dùng
 */
exports.bulkTogglePremium = async (req, res) => {
  try {
    const { userIds, premium, days } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID người dùng không hợp lệ' });
    }

    if (premium === undefined) {
      return res.status(400).json({ message: 'Trạng thái premium là bắt buộc' });
    }

    // Lọc các ID hợp lệ
    const validUserIds = userIds.filter(id => isValidObjectId(id));
    
    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'Không có ID người dùng hợp lệ' });
    }

    // Cập nhật trạng thái premium cho nhiều người dùng
    const updateData = {
      premium: !!premium
    };
    
    if (premium) {
      // Nếu có số ngày cụ thể
      if (days && Number.isInteger(days) && days > 0) {
        updateData.premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      } else {
        // Mặc định là 30 ngày
        updateData.premiumUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Nếu hạ cấp, xóa thời hạn
      updateData.premiumUntil = null;
    }

    const result = await User.updateMany(
      { _id: { $in: validUserIds } },
      { $set: updateData }
    );

    return res.status(200).json({
      message: `${premium ? 'Nâng cấp' : 'Hạ cấp'} ${result.modifiedCount} tài khoản thành công`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
      premiumUntil: updateData.premiumUntil
    });
  } catch (error) {
    console.error('Error in bulkTogglePremium:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái premium hàng loạt' });
  }
};

/**
 * Cấm nhiều người dùng
 */
exports.bulkBanUsers = async (req, res) => {
  try {
    const { userIds, reason } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID người dùng không hợp lệ' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Lý do cấm là bắt buộc' });
    }

    // Lọc các ID hợp lệ
    const validUserIds = userIds.filter(id => isValidObjectId(id));
    
    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'Không có ID người dùng hợp lệ' });
    }

    // Cấm nhiều người dùng
    const result = await User.updateMany(
      { _id: { $in: validUserIds } },
      { 
        $set: {
          banned: true,
          banReason: reason,
          bannedAt: new Date(),
          bannedBy: req.user._id
        }
      }
    );

    return res.status(200).json({
      message: `Cấm ${result.modifiedCount} người dùng thành công`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Error in bulkBanUsers:', error);
    return res.status(500).json({ message: 'Lỗi server khi cấm người dùng hàng loạt' });
  }
};

/**
 * Bỏ cấm nhiều người dùng
 */
exports.bulkUnbanUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID người dùng không hợp lệ' });
    }

    // Lọc các ID hợp lệ
    const validUserIds = userIds.filter(id => isValidObjectId(id));
    
    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'Không có ID người dùng hợp lệ' });
    }

    // Bỏ cấm nhiều người dùng
    const result = await User.updateMany(
      { _id: { $in: validUserIds } },
      { 
        $set: {
          banned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null
        }
      }
    );

    return res.status(200).json({
      message: `Bỏ cấm ${result.modifiedCount} người dùng thành công`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Error in bulkUnbanUsers:', error);
    return res.status(500).json({ message: 'Lỗi server khi bỏ cấm người dùng hàng loạt' });
  }
};

/**
 * Xóa nhiều người dùng
 */
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID người dùng không hợp lệ' });
    }

    // Lọc các ID hợp lệ
    const validUserIds = userIds.filter(id => isValidObjectId(id));
    
    if (validUserIds.length === 0) {
      return res.status(400).json({ message: 'Không có ID người dùng hợp lệ' });
    }

    // Xóa nhiều người dùng
    const result = await User.deleteMany({ _id: { $in: validUserIds } });

    // TODO: Xóa các dữ liệu liên quan (matches, messages, likes, v.v.)

    return res.status(200).json({
      message: `Xóa ${result.deletedCount} người dùng thành công`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in bulkDeleteUsers:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa người dùng hàng loạt' });
  }
};