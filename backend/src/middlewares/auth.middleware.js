const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user (support both id and userId in token)
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Kiểm tra xem người dùng có bị cấm không
    if (user.banned) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị cấm. ' + (user.bannedReason ? 'Lý do: ' + user.bannedReason : 'Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'),
        banned: true
      });
    }
    
    // Attach user and userId to request
    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    }
    
    res.status(500).json({ message: 'Lỗi xác thực' });
  }
};

// Middleware kiểm tra quyền admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin người dùng' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Lỗi xác thực quyền admin' });
  }
};

// Middleware kiểm tra quyền moderator hoặc admin
exports.isModeratorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin người dùng' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    next();
  } catch (error) {
    console.error('Moderator middleware error:', error);
    res.status(500).json({ message: 'Lỗi xác thực quyền quản trị' });
  }
};