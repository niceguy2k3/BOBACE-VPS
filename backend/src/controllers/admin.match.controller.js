const Match = require('../models/match.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const mongoose = require('mongoose');

// Lấy tất cả matches với phân trang và lọc
exports.getAllMatches = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng query filter
    const filter = {};
    
    // Tìm kiếm theo ID của match hoặc ID người dùng
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
            matches: [],
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

    const matches = await Match.find(filter)
      .populate('users', 'fullName avatar email')
      .populate('lastMessage')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Populate thêm thông tin người gửi cho lastMessage
    for (let match of matches) {
      if (match.lastMessage) {
        match.lastMessage = await Message.findById(match.lastMessage._id)
          .populate('sender', 'fullName avatar');
      }
    }
    
    const total = await Match.countDocuments(filter);
    
    res.status(200).json({
      matches,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting all matches:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách matches' });
  }
};

// Lấy chi tiết một match
exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const match = await Match.findById(id)
      .populate('users', 'fullName avatar email gender birthDate')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'fullName avatar'
        }
      });
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    // Lấy 10 tin nhắn gần nhất
    const messages = await Message.find({
      $or: [
        { sender: match.users[0]._id, receiver: match.users[1]._id },
        { sender: match.users[1]._id, receiver: match.users[0]._id }
      ]
    })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      match,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Error getting match by id:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông tin match' });
  }
};

// Xóa match
exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    
    const match = await Match.findById(id);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    // Xóa tất cả tin nhắn liên quan đến match
    await Message.deleteMany({
      $or: [
        { sender: match.users[0], receiver: match.users[1] },
        { sender: match.users[1], receiver: match.users[0] }
      ]
    });
    
    // Xóa match
    await Match.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Đã xóa match thành công' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ message: 'Lỗi khi xóa match' });
  }
};