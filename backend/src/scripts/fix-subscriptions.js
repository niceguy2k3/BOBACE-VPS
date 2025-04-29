/**
 * Script để sửa chữa các subscription không hợp lệ
 * Chạy với lệnh: node src/scripts/fix-subscriptions.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import models
const Subscription = require('../models/subscription.model');
const Device = require('../models/device.model');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
  fixSubscriptions();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Hàm sửa chữa các subscription
async function fixSubscriptions() {
  try {
    console.log('Starting subscription repair...');
    
    // Lấy tất cả subscription
    const subscriptions = await Subscription.find({});
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    // Đếm số lượng subscription không hợp lệ
    let invalidCount = 0;
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (const sub of subscriptions) {
      // Kiểm tra subscription có hợp lệ không
      const isValid = isValidSubscription(sub.subscription);
      
      if (!isValid) {
        invalidCount++;
        console.log(`Found invalid subscription for user ${sub.user}`);
        
        // Xóa subscription không hợp lệ
        await Subscription.deleteOne({ _id: sub._id });
        deletedCount++;
        
        // Tạo subscription mới cho người dùng
        const device = await Device.findOne({ user: sub.user });
        
        if (device) {
          // Tạo subscription mới
          const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
          
          // Tạo p256dh đúng độ dài (65 bytes)
          const p256dh = crypto.randomBytes(65).toString('base64');
          const auth = crypto.randomBytes(16).toString('base64');
          
          const newSubscription = new Subscription({
            user: sub.user,
            subscription: {
              endpoint: autoEndpoint,
              expirationTime: null,
              keys: {
                auth: auth,
                p256dh: p256dh
              }
            },
            platform: 'web',
            deviceName: 'Auto-registered web device',
            lastActive: new Date()
          });
          
          await newSubscription.save();
          fixedCount++;
          console.log(`Created new subscription for user ${sub.user}`);
        }
      }
    }
    
    console.log(`Repair completed: ${invalidCount} invalid subscriptions found`);
    console.log(`${deletedCount} subscriptions deleted, ${fixedCount} new subscriptions created`);
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing subscriptions:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Hàm kiểm tra subscription có hợp lệ không
function isValidSubscription(subscription) {
  try {
    // Kiểm tra subscription có đầy đủ thông tin không
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return false;
    }
    
    // Kiểm tra keys có đầy đủ thông tin không
    if (!subscription.keys.auth || !subscription.keys.p256dh) {
      return false;
    }
    
    // Kiểm tra p256dh có đúng độ dài không
    // p256dh phải có độ dài 65 bytes khi decode từ base64
    const p256dh = subscription.keys.p256dh;
    const p256dhBuffer = Buffer.from(p256dh, 'base64');
    
    if (p256dhBuffer.length !== 65) {
      console.log(`Invalid p256dh length: ${p256dhBuffer.length} bytes (should be 65 bytes)`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating subscription:', error);
    return false;
  }
}