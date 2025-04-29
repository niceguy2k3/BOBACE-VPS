/**
 * Script để sửa chữa một subscription cụ thể
 * Chạy với lệnh: node src/scripts/fix-specific-subscription.js 680ce5a4f3c57e9f1ca06a32
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// Import models
const Subscription = require('../models/subscription.model');
const Device = require('../models/device.model');

// Hàm tạo khóa ECDH hợp lệ
function generateValidP256DHKey() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Kiểm tra độ dài của khóa (phải là 65 bytes)
  if (publicKey.length !== 65) {
    console.log(`Generated key has invalid length: ${publicKey.length} bytes, regenerating...`);
    return generateValidP256DHKey(); // Tạo lại nếu không đúng độ dài
  }
  
  // Trả về khóa công khai dưới dạng base64
  return publicKey.toString('base64');
}

// Lấy subscription ID từ tham số dòng lệnh
const subscriptionId = process.argv[2];

if (!subscriptionId) {
  console.error('Vui lòng cung cấp ID của subscription cần sửa');
  console.error('Ví dụ: node src/scripts/fix-specific-subscription.js 680ce5a4f3c57e9f1ca06a32');
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
    
    // Tạo khóa ECDH hợp lệ mới
    const p256dh = generateValidP256DHKey();
    const auth = crypto.randomBytes(16).toString('base64');
    
    // Lưu thông tin subscription cũ
    const oldSubscription = JSON.stringify(subscription.subscription);
    
    // Cập nhật subscription với khóa mới
    subscription.subscription.keys = {
      p256dh: p256dh,
      auth: auth
    };
    
    // Lưu subscription đã cập nhật
    await subscription.save();
    
    console.log('Subscription updated successfully');
    console.log('Old subscription:', oldSubscription);
    console.log('New subscription keys:', JSON.stringify(subscription.subscription.keys));
    
    // Kiểm tra khóa mới
    try {
      const p256dhBuffer = Buffer.from(p256dh, 'base64');
      const ecdh = crypto.createECDH('prime256v1');
      ecdh.setPublicKey(p256dhBuffer);
      console.log(`Verified: New p256dh key is valid, length: ${p256dhBuffer.length} bytes`);
    } catch (error) {
      console.error('Error verifying new key:', error.message);
    }
    
    // Đóng kết nối
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error fixing subscription:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}