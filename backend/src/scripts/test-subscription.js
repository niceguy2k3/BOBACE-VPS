/**
 * Script để kiểm tra một subscription cụ thể
 * Chạy với lệnh: node src/scripts/test-subscription.js 680ce5a4f3c57e9f1ca06a32
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const webpush = require('web-push');

// Load environment variables
dotenv.config();

// Cấu hình VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BL1KlibuyrMrW-NGZiHWdG8GdneqZrcKC1lmu1Uyvn7TbAd0CvFfzWAtu8lqwkK3fhnV3s02cQlPjESJnCpe_wI',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'meLMgaJh3n7XJdW3e-e0g9YpvikvdU1FEmOQYIf9suc'
};

// Cấu hình web-push
webpush.setVapidDetails(
  'mailto:contact@bobace.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Import models
const Subscription = require('../models/subscription.model');

// Lấy subscription ID từ tham số dòng lệnh
const subscriptionId = process.argv[2];

if (!subscriptionId) {
  console.error('Vui lòng cung cấp ID của subscription cần kiểm tra');
  console.error('Ví dụ: node src/scripts/test-subscription.js 680ce5a4f3c57e9f1ca06a32');
  process.exit(1);
}

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hen-ho-tra-sua', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
  testSubscription(subscriptionId);
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Hàm kiểm tra subscription
async function testSubscription(id) {
  try {
    console.log(`Testing subscription with ID: ${id}`);
    
    // Tìm subscription
    const subscription = await Subscription.findById(id);
    
    if (!subscription) {
      console.error(`Subscription with ID ${id} not found`);
      mongoose.connection.close();
      process.exit(1);
      return;
    }
    
    console.log(`Found subscription for user ${subscription.user}`);
    console.log('Subscription details:', JSON.stringify(subscription.subscription, null, 2));
    
    // Kiểm tra khóa p256dh
    try {
      const p256dh = subscription.subscription.keys.p256dh;
      const p256dhBuffer = Buffer.from(p256dh, 'base64');
      
      console.log(`p256dh key length: ${p256dhBuffer.length} bytes`);
      
      // Thử tạo một đối tượng ECDH và đặt khóa công khai
      const ecdh = crypto.createECDH('prime256v1');
      ecdh.setPublicKey(p256dhBuffer);
      
      console.log('p256dh key is valid for ECDH');
    } catch (ecdhError) {
      console.error('Error validating p256dh key:', ecdhError.message);
    }
    
    // Thử gửi thông báo test
    try {
      console.log('Sending test notification...');
      
      const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification to verify subscription',
        icon: '/logo192.png',
        url: '/',
        type: 'system',
        data: { test: true },
        createdAt: new Date().toISOString()
      });
      
      await webpush.sendNotification(subscription.subscription, payload);
      console.log('Test notification sent successfully!');
    } catch (pushError) {
      console.error('Error sending test notification:', pushError.message);
      console.error('Stack trace:', pushError.stack);
    }
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error testing subscription:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}