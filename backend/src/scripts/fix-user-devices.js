/**
 * Script to diagnose and fix device registration issues for specific users
 * 
 * Usage: 
 * node src/scripts/fix-user-devices.js <userId>
 * 
 * Example:
 * node src/scripts/fix-user-devices.js 680ba73804e735df8bbdde42
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Device = require('../models/device.model');
const crypto = require('crypto');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function fixUserDevices(userId) {
  try {
    console.log(`Diagnosing device issues for user ${userId}`);
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid user ID format: ${userId}`);
      return;
    }
    
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Check if user exists
    const user = await User.findById(userIdObj);
    if (!user) {
      console.error(`User ${userId} not found in database`);
      return;
    }
    
    console.log(`Found user: ${user.fullName} (${user.email})`);
    console.log(`Last active: ${user.lastActive}`);
    console.log(`Last login: ${user.lastLoginAt || 'Not set'}`);
    
    // Update lastLoginAt if missing
    if (!user.lastLoginAt) {
      user.lastLoginAt = user.lastActive || new Date();
      await user.save();
      console.log(`Updated lastLoginAt to ${user.lastLoginAt}`);
    }
    
    // Check for devices
    const devices = await Device.find({ user: userIdObj });
    console.log(`Found ${devices.length} devices for user`);
    
    if (devices.length === 0) {
      console.log('Creating a default device for user...');
      
      // Create a default device
      const defaultToken = `fix_${crypto.randomBytes(16).toString('hex')}`;
      const newDevice = new Device({
        user: userIdObj,
        token: defaultToken,
        platform: 'web',
        deviceName: 'Auto-fixed web device',
        lastActive: new Date()
      });
      
      await newDevice.save();
      console.log(`Created default device with token: ${defaultToken.substring(0, 10)}...`);
      
      // Verify the device was created
      const verifyDevice = await Device.findOne({ user: userIdObj, token: defaultToken });
      if (verifyDevice) {
        console.log('Device created successfully!');
      } else {
        console.error('Failed to create device - not found after save');
      }
    } else {
      // List all devices
      console.log('User devices:');
      devices.forEach((device, index) => {
        console.log(`${index + 1}. ${device._id} - ${device.platform} - ${device.token.substring(0, 10)}... - Last active: ${device.lastActive}`);
      });
      
      // Check for invalid tokens
      const invalidTokens = devices.filter(d => !d.token || d.token === '');
      if (invalidTokens.length > 0) {
        console.log(`Found ${invalidTokens.length} devices with invalid tokens, removing...`);
        await Device.deleteMany({ user: userIdObj, token: { $in: [null, ''] } });
      }
    }
    
    console.log('Device diagnosis and fix completed');
  } catch (error) {
    console.error('Error fixing user devices:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Get userId from command line arguments
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID as an argument');
  process.exit(1);
}

fixUserDevices(userId)
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });