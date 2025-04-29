/**
 * Script để dọn dẹp các thiết bị tự động và subscription giả
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/device.model');
const Subscription = require('../models/subscription.model');

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

async function cleanupAutoDevices() {
  try {
    console.log('Starting cleanup of auto-generated devices and subscriptions...');
    
    // Xóa các thiết bị tự động
    const deviceResult = await Device.deleteMany({
      token: { $regex: /^auto_/ }
    });
    
    console.log(`Deleted ${deviceResult.deletedCount} auto-generated devices`);
    
    // Xóa các subscription giả
    const subscriptionResult = await Subscription.deleteMany({
      'subscription.endpoint': { $regex: /auto-generated-endpoint/ }
    });
    
    console.log(`Deleted ${subscriptionResult.deletedCount} auto-generated subscriptions`);
    
    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Chạy script
cleanupAutoDevices();