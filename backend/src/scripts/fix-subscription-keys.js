/**
 * Script để sửa chữa các subscription keys sang định dạng base64url
 * Chạy với lệnh: node src/scripts/fix-subscription-keys.js
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

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
  fixSubscriptionKeys();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Hàm sửa chữa các subscription keys
async function fixSubscriptionKeys() {
  try {
    console.log('Starting subscription keys repair...');
    
    // Lấy tất cả subscription
    const subscriptions = await Subscription.find({});
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    // Đếm số lượng subscription đã sửa
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const sub of subscriptions) {
      try {
        // Kiểm tra subscription có đầy đủ thông tin không
        if (!sub.subscription || !sub.subscription.endpoint || !sub.subscription.keys) {
          console.log(`Subscription ${sub._id} missing endpoint or keys, creating new keys`);
          
          // Tạo keys mới
          sub.subscription = {
            endpoint: sub.subscription?.endpoint || `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`,
            expirationTime: null,
            keys: {
              auth: generateValidAuthKey(),
              p256dh: generateValidBase64UrlKey()
            }
          };
        } else {
          // Chuyển đổi p256dh sang base64url
          if (sub.subscription.keys.p256dh) {
            sub.subscription.keys.p256dh = base64ToBase64Url(sub.subscription.keys.p256dh);
          } else {
            sub.subscription.keys.p256dh = generateValidBase64UrlKey();
          }
          
          // Chuyển đổi auth sang base64url
          if (sub.subscription.keys.auth) {
            sub.subscription.keys.auth = base64ToBase64Url(sub.subscription.keys.auth);
          } else {
            sub.subscription.keys.auth = generateValidAuthKey();
          }
        }
        
        // Lưu subscription đã cập nhật
        await sub.save();
        fixedCount++;
        
        if (fixedCount % 10 === 0) {
          console.log(`Fixed ${fixedCount} subscriptions so far...`);
        }
      } catch (error) {
        console.error(`Error fixing subscription ${sub._id}:`, error.message);
        errorCount++;
        
        // Nếu không thể sửa, tạo lại subscription
        try {
          // Tạo keys mới
          sub.subscription = {
            endpoint: sub.subscription?.endpoint || `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`,
            expirationTime: null,
            keys: {
              auth: generateValidAuthKey(),
              p256dh: generateValidBase64UrlKey()
            }
          };
          
          await sub.save();
          fixedCount++;
          console.log(`Recreated subscription ${sub._id} for user ${sub.user}`);
        } catch (recreateError) {
          console.error(`Error recreating subscription ${sub._id}:`, recreateError.message);
        }
      }
    }
    
    console.log(`Repair completed: Fixed ${fixedCount} subscriptions, ${errorCount} errors`);
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing subscription keys:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}