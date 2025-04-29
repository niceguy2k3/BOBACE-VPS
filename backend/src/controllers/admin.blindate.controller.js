const Blindate = require('../models/blindate.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Lấy tất cả cuộc hẹn với phân trang và lọc
exports.getAllBlindates = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      search = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng query filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    // Tìm kiếm theo ID của cuộc hẹn hoặc ID người dùng
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter.$or = [
          { _id: mongoose.Types.ObjectId(search) },
          { users: mongoose.Types.ObjectId(search) }
        ];
      } else {
        // Tìm người dùng theo tên
        const users = await User.find({
          fullName: { $regex: search, $options: 'i' }
        }).select('_id');
        
        const userIds = users.map(user => user._id);
        
        if (userIds.length > 0) {
          filter.users = { $in: userIds };
        } else {
          // Nếu không tìm thấy người dùng nào, trả về kết quả rỗng
          return res.status(200).json({
            blindates: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: 0
            }
          });
        }
      }
    }
    
    // Thực hiện query với phân trang và sắp xếp
    const sortOption = {};
    sortOption[sort] = order === 'asc' ? 1 : -1;

    const blindates = await Blindate.find(filter)
      .populate('users', 'fullName avatar email')
      .populate('userResponses.user', 'fullName')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blindate.countDocuments(filter);
    
    res.status(200).json({
      blindates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting all blindates:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách cuộc hẹn' });
  }
};

// Lấy chi tiết một cuộc hẹn
exports.getBlindateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const blindate = await Blindate.findById(id)
      .populate('users', 'fullName avatar email gender birthDate')
      .populate('userResponses.user', 'fullName')
      .populate('reviews.user', 'fullName avatar');
    
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }
    
    res.status(200).json(blindate);
  } catch (error) {
    console.error('Error getting blindate by id:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin cuộc hẹn' });
  }
};

// Cập nhật trạng thái cuộc hẹn
exports.updateBlindateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const blindate = await Blindate.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('users', 'fullName avatar email')
      .populate('userResponses.user', 'fullName');
    
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }
    
    res.status(200).json(blindate);
  } catch (error) {
    console.error('Error updating blindate status:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái cuộc hẹn' });
  }
};

// Xóa cuộc hẹn
exports.deleteBlinddate = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const blindate = await Blindate.findByIdAndDelete(id);
    
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn' });
    }
    
    res.status(200).json({ message: 'Đã xóa cuộc hẹn thành công' });
  } catch (error) {
    console.error('Error deleting blindate:', error);
    res.status(500).json({ message: 'Lỗi khi xóa cuộc hẹn' });
  }
};