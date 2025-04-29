/**
 * Script để sửa chữa các subscription không hợp lệ
 * Chạy với lệnh: node src/scripts/repair-subscriptions.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import models
const Subscription = require('../models/subscription.model');
const Device = require('../models/device.model');
const User = require('../models/user.model');

// Hàm tạo khóa ECDH hợp lệ
function generateValidP256DHKey() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Trả về khóa công khai dưới dạng base64
  return publicKey.toString('base64');
}

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

// Hàm kiểm tra và sửa chữa subscription
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
      let isValid = true;
      
      try {
        // Kiểm tra subscription có đầy đủ thông tin không
        if (!sub.subscription || !sub.subscription.endpoint || !sub.subscription.keys) {
          isValid = false;
          console.log(`Subscription ${sub._id} missing endpoint or keys`);
        } else {
          // Kiểm tra keys có đầy đủ thông tin không
          if (!sub.subscription.keys.auth || !sub.subscription.keys.p256dh) {
            isValid = false;
            console.log(`Subscription ${sub._id} missing auth or p256dh keys`);
          } else {
            // Kiểm tra p256dh có đúng độ dài không
            try {
              const p256dh = sub.subscription.keys.p256dh;
              const p256dhBuffer = Buffer.from(p256dh, 'base64');
              
              // Thử tạo một đối tượng ECDH và đặt khóa công khai
              const ecdh = crypto.createECDH('prime256v1');
              ecdh.setPublicKey(p256dhBuffer);
              
              // Kiểm tra độ dài của khóa
              if (p256dhBuffer.length !== 65) {
                console.log(`Subscription ${sub._id} has p256dh key with invalid length: ${p256dhBuffer.length} bytes (should be 65)`);
                isValid = false;
              }
            } catch (ecdhError) {
              console.log(`Invalid p256dh key for subscription ${sub._id}: ${ecdhError.message}`);
              isValid = false;
            }
          }
        }
      } catch (error) {
        console.error('Error validating subscription:', error);
        isValid = false;
      }
      
      if (!isValid) {
        invalidCount++;
        console.log(`Found invalid subscription for user ${sub.user}`);
        
        // Tạo khóa ECDH hợp lệ mới
        const p256dh = generateValidP256DHKey();
        const auth = crypto.randomBytes(16).toString('base64');
        
        // Cập nhật subscription với khóa mới
        sub.subscription.keys = {
          p256dh: p256dh,
          auth: auth
        };
        
        try {
          await sub.save();
          fixedCount++;
          console.log(`Fixed subscription ${sub._id} for user ${sub.user}`);
        } catch (saveError) {
          console.error(`Error saving fixed subscription: ${saveError.message}`);
          
          // Nếu không thể sửa, xóa subscription
          try {
            await Subscription.deleteOne({ _id: sub._id });
            deletedCount++;
            console.log(`Deleted invalid subscription ${sub._id}`);
            
            // Tạo subscription mới
            const device = await Device.findOne({ user: sub.user });
            
            if (device) {
              const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
              
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
          } catch (deleteError) {
            console.error(`Error deleting invalid subscription: ${deleteError.message}`);
          }
        }
      }
    }
    
    console.log(`Repair completed: ${invalidCount} invalid subscriptions found`);
    console.log(`${fixedCount} subscriptions fixed, ${deletedCount} subscriptions deleted`);
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing subscriptions:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}