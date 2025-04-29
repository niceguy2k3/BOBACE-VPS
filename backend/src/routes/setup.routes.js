const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Endpoint này chỉ nên được sử dụng trong môi trường phát triển
// Và nên bị vô hiệu hóa trong môi trường sản xuất
router.post('/create-admin', async (req, res) => {
  try {
    // Kiểm tra xem đã có admin nào chưa
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ 
        message: 'Đã tồn tại tài khoản admin trong hệ thống' 
      });
    }
    
    const { email, password, fullName } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp đầy đủ thông tin: email, password, fullName' 
      });
    }
    
    // Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'Email đã được sử dụng' 
      });
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo tài khoản admin
    const admin = new User({
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
      verification: {
        isVerified: true,
        method: 'system',
        verifiedAt: new Date()
      },
      premium: true,
      createdAt: new Date(),
      lastActive: new Date()
    });
    
    await admin.save();
    
    res.status(201).json({
      message: 'Tạo tài khoản admin thành công',
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Lỗi khi tạo tài khoản admin' });
  }
});

module.exports = router;