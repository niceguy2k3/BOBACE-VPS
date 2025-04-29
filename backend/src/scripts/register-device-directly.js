/**
 * Script to directly register a device for a specific user in the database
 * This bypasses all the normal checks and directly inserts a device document
 */

require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Connect to MongoDB directly without using models
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function registerDeviceDirectly() {
  try {
    // Wait for connection to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userId = '680ba73804e735df8bbdde42'; // The specific user ID from the error logs
    console.log(`Directly registering device for user ${userId}`);
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid user ID format: ${userId}`);
      return;
    }
    
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Use models directly
    const User = require('../models/user.model');
    const Device = require('../models/device.model');
    
    // Check if user exists
    const user = await User.findById(userIdObj);
    
    if (!user) {
      console.error(`User ${userId} not found in database`);
      return;
    }
    
    console.log(`Found user: ${user.fullName} (${user.email})`);
    
    // Check for existing devices
    const existingDevices = await Device.find({ user: userIdObj });
    console.log(`Found ${existingDevices.length} existing devices for user`);
    
    // Generate a unique token
    const token = `emergency_${crypto.randomBytes(16).toString('hex')}`;
    
    // Create a new device document
    const newDevice = new Device({
      user: userIdObj,
      token: token,
      platform: 'web',
      deviceName: 'Emergency registered device',
      lastActive: new Date()
    });
    
    // Save the device
    await newDevice.save();
    console.log(`Created device with ID: ${newDevice._id}`);
    
    // Verify the device was created
    const verifyDevice = await Device.findById(newDevice._id);
    if (verifyDevice) {
      console.log('Device created successfully!');
      console.log('Device details:', {
        id: verifyDevice._id,
        token: verifyDevice.token.substring(0, 10) + '...',
        platform: verifyDevice.platform,
        user: verifyDevice.user
      });
    } else {
      console.error('Failed to create device - not found after save');
    }
    
    // Update user's lastLoginAt field
    user.lastLoginAt = new Date();
    user.lastActive = new Date();
    await user.save();
    console.log('Updated user lastLoginAt and lastActive fields');
    
    // Count devices again to confirm
    const finalCount = await Device.countDocuments({ user: userIdObj });
    console.log(`User now has ${finalCount} devices registered`);
    
    console.log('Device registration completed');
  } catch (error) {
    console.error('Error registering device:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

registerDeviceDirectly()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });