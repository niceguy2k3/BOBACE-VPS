const cron = require('node-cron');
const axios = require('axios');
const User = require('./models/user.model');

// Hàm kiểm tra và cập nhật trạng thái premium trực tiếp từ database
const checkPremiumStatus = async () => {
  try {
    console.log('Đang chạy cron job kiểm tra trạng thái premium...');
    
    // Tìm tất cả người dùng có premium=true và premiumUntil < thời gian hiện tại
    const expiredUsers = await User.find({
      premium: true,
      premiumUntil: { $lt: new Date() }
    });
    
    if (expiredUsers.length === 0) {
      console.log('Không có người dùng premium nào hết hạn');
      return;
    }
    
    console.log(`Tìm thấy ${expiredUsers.length} người dùng premium đã hết hạn`);
    
    // Cập nhật trạng thái premium của những người dùng đã hết hạn
    const updatePromises = expiredUsers.map(user => {
      console.log(`Cập nhật người dùng ${user.email}: premium = false`);
      user.premium = false;
      // Giữ lại premiumUntil để biết khi nào hết hạn
      return user.save();
    });
    
    await Promise.all(updatePromises);
    
    console.log(`Đã cập nhật trạng thái premium cho ${expiredUsers.length} người dùng hết hạn`);
  } catch (error) {
    console.error('Lỗi khi chạy cron job kiểm tra premium:', error.message);
  }
};

// Lịch trình các công việc định kỳ

// Kiểm tra trạng thái premium hàng ngày vào lúc 00:01
const premiumCheckJob = cron.schedule('1 0 * * *', checkPremiumStatus, {
  scheduled: false, // Không tự động chạy khi khởi tạo
  timezone: 'Asia/Ho_Chi_Minh' // Múi giờ Việt Nam
});

module.exports = {
  start: () => {
    // Khởi động các cron job
    premiumCheckJob.start();
    console.log('Đã khởi động các cron job');
    
    // Chạy kiểm tra premium ngay khi khởi động server (để test)
    setTimeout(checkPremiumStatus, 5000);
  },
  
  stop: () => {
    // Dừng các cron job
    premiumCheckJob.stop();
    console.log('Đã dừng các cron job');
  },
  
  // Xuất các hàm để có thể gọi trực tiếp khi cần
  checkPremiumStatus
};