const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

// Thông tin admin
const ADMIN_EMAIL = 'nhunam1311@gmail.com';
const ADMIN_PASSWORD = 'Nhunam2014';
const ADMIN_FULLNAME = 'Nam Nam';

// Kết nối đến MongoDB
const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ Đã kết nối đến MongoDB');
    return true;
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    return false;
  }
};

// Tạo hoặc cập nhật tài khoản admin
const createAdmin = async () => {
  try {
    // Kiểm tra xem đã có user với email này chưa
    let admin = await User.findOne({ email: ADMIN_EMAIL });

    if (admin) {
      // Nếu đã có, cập nhật password và đảm bảo role là admin
      console.log(`📝 Đã tìm thấy user với email ${ADMIN_EMAIL}, đang cập nhật...`);
      
      // Set password (plaintext) - User model sẽ tự động hash khi save
      admin.password = ADMIN_PASSWORD;
      admin.role = 'admin';
      admin.fullName = ADMIN_FULLNAME;
      admin.verification = {
        isVerified: true,
        method: 'email',
        verifiedAt: new Date()
      };
      admin.premium = true;
      admin.emailVerified = true;
      
      await admin.save();
      console.log('✅ Đã cập nhật tài khoản admin thành công!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Tên: ${ADMIN_FULLNAME}`);
      console.log(`   Role: admin`);
    } else {
      // Nếu chưa có, tạo mới
      console.log('🔨 Đang tạo tài khoản admin mới...');
      
      // Tạo tài khoản admin với các thông tin bắt buộc
      // Password sẽ được hash tự động bởi User model pre-save hook
      admin = new User({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        fullName: ADMIN_FULLNAME,
        birthDate: new Date('2003-11-13'), // Ngày sinh mặc định
        gender: 'male', // Giới tính mặc định
        role: 'admin',
        verification: {
          isVerified: true,
          method: 'email',
          verifiedAt: new Date()
        },
        premium: true,
        emailVerified: true,
        createdAt: new Date(),
        lastActive: new Date()
      });
      
      await admin.save();
      console.log('✅ Đã tạo tài khoản admin thành công!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Tên: ${ADMIN_FULLNAME}`);
      console.log(`   Role: admin`);
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo/cập nhật admin:', error.message);
    throw error;
  }
};

// Hàm chính
const main = async () => {
  try {
    console.log('🚀 Bắt đầu tạo/cập nhật tài khoản admin...');
    
    const connected = await connectToDatabase();
    if (!connected) {
      console.error('❌ Không thể kết nối đến database. Script sẽ không tạo admin.');
      process.exit(1);
    }
    
    await createAdmin();
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('✅ Đã đóng kết nối MongoDB');
    console.log('✨ Hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  main();
}

module.exports = { createAdmin, connectToDatabase };

