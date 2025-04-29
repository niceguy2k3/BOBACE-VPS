/**
 * Script để sửa chữa một subscription cụ thể sang định dạng base64url
 * Chạy với lệnh: node src/scripts/fix-specific-subscription-keys.js 680ce5a4f3c57e9f1ca06a32
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import models
const Subscription = require('../models/subscription.model');

// Hàm chuyển đổi base64 sang base64url
function base64ToBase64Url(base64String) {
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Hàm tạo khóa ECDH hợp lệ dưới dạng base64url
function generateValidBase64UrlKey() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Kiểm tra độ dài của khóa (phải là 65 bytes)
  if (publicKey.length !== 65) {
    console.log(`Generated key has invalid length: ${publicKey.length} bytes, regenerating...`);
    return generateValidBase64UrlKey(); // Tạo lại nếu không đúng độ dài
  }
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = publicKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Hàm tạo auth key dưới dạng base64url
function generateValidAuthKey() {
  // Tạo khóa ngẫu nhiên 16 bytes
  const authKey = crypto.randomBytes(16);
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = authKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Lấy subscription ID từ tham số dòng lệnh
const subscriptionId = process.argv[2];

if (!subscriptionId) {
  console.error('Vui lòng cung cấp ID của subscription cần sửa');
  console.error('Ví dụ: node src/scripts/fix-specific-subscription-keys.js 680ce5a4f3c57e9f1ca06a32');
  process.exit(1);
}

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
  fixSpecificSubscription(subscriptionId);
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Hàm sửa chữa subscription cụ thể
async function fixSpecificSubscription(id) {
  try {
    console.log(`Fixing subscription with ID: ${id}`);
    
    // Tìm subscription
    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found`);
      mongoose.connection.close();
      process.exit(1);
      return;
    }
    
    console.log(`Found subscription for user ${subscription.user}`);
    
    // Lưu thông tin subscription cũ
    const oldSubscription = JSON.stringify(subscription.subscription);
    
    // Kiểm tra subscription có đầy đủ thông tin không
    if (!subscription.subscription || !subscription.subscription.endpoint || !subscription.subscription.keys) {
      console.log('Subscription missing endpoint or keys, creating new subscription');
      
      // Tạo subscription mới
      subscription.subscription = {
        endpoint: `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`,
        expirationTime: null,
        keys: {
          auth: generateValidAuthKey(),
          p256dh: generateValidBase64UrlKey()
        }
      };
    } else {
      // Chuyển đổi p256dh sang base64url
      if (subscription.subscription.keys.p256dh) {
        subscription.subscription.keys.p256dh = base64ToBase64Url(subscription.subscription.keys.p256dh);
      } else {
        subscription.subscription.keys.p256dh = generateValidBase64UrlKey();
      }
      
      // Chuyển đổi auth sang base64url
      if (subscription.subscription.keys.auth) {
        subscription.subscription.keys.auth = base64ToBase64Url(subscription.subscription.keys.auth);
      } else {
        subscription.subscription.keys.auth = generateValidAuthKey();
      }
    }
    
    // Lưu subscription đã cập nhật
    await subscription.save();
    
    console.log('Subscription updated successfully');
    console.log('Old subscription:', oldSubscription);
    console.log('New subscription:', JSON.stringify(subscription.subscription));
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing subscription:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}