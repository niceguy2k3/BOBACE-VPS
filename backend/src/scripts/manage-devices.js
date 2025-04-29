/**
 * Device Management Script
 * 
 * This script helps manage device registrations for push notifications.
 * It can:
 * - List all devices
 * - List devices for a specific user
 * - Clean up invalid devices
 * - Register a test device for a user
 * 
 * Usage:
 * node src/scripts/manage-devices.js [command] [options]
 * 
 * Commands:
 * - list-all: List all devices
 * - list-user [userId]: List devices for a specific user
 * - cleanup: Clean up invalid devices
 * - register [userId]: Register a test device for a user
 * 
 * Examples:
 * node src/scripts/manage-devices.js list-all
 * node src/scripts/manage-devices.js list-user 680ba73804e735df8bbdde42
 * node src/scripts/manage-devices.js cleanup
 * node src/scripts/manage-devices.js register 680ba73804e735df8bbdde42
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/device.model');
const User = require('../models/user.model');
const crypto = require('crypto');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// List all devices
async function listAllDevices() {
  try {
    const devices = await Device.find({}).populate('user', 'fullName email');
    console.log(`Found ${devices.length} devices`);
    
    // Group devices by user
    const devicesByUser = {};
    devices.forEach(device => {
      const userId = device.user ? device.user._id.toString() : 'Unknown';
      if (!devicesByUser[userId]) {
        devicesByUser[userId] = {
          user: device.user ? `${device.user.fullName} (${device.user.email})` : 'Unknown User',
          devices: []
        };
      }
      devicesByUser[userId].devices.push({
        id: device._id,
        token: device.token ? `${device.token.substring(0, 10)}...` : 'No token',
        platform: device.platform,
        deviceName: device.deviceName,
        lastActive: device.lastActive
      });
    });
    
    // Print devices by user
    Object.keys(devicesByUser).forEach(userId => {
      const userData = devicesByUser[userId];
      console.log(`\nUser: ${userData.user} (${userId})`);
      console.log(`Devices (${userData.devices.length}):`);
      userData.devices.forEach((device, index) => {
        console.log(`  ${index + 1}. ${device.deviceName} (${device.platform}) - Token: ${device.token} - Last active: ${device.lastActive}`);
      });
    });
  } catch (error) {
    console.error('Error listing devices:', error);
  }
}

// List devices for a specific user
async function listUserDevices(userId) {
  try {
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
    
    console.log(`User: ${user.fullName} (${user.email})`);
    console.log(`Last active: ${user.lastActive}`);
    console.log(`Last login: ${user.lastLoginAt || 'Not set'}`);
    
    // Get devices for user
    const devices = await Device.find({ user: userIdObj });
    console.log(`\nFound ${devices.length} devices for user`);
    
    if (devices.length === 0) {
      console.log('No devices found');
    } else {
      devices.forEach((device, index) => {
        console.log(`\nDevice ${index + 1}:`);
        console.log(`  ID: ${device._id}`);
        console.log(`  Token: ${device.token ? device.token : 'No token'}`);
        console.log(`  Platform: ${device.platform}`);
        console.log(`  Device Name: ${device.deviceName}`);
        console.log(`  Last Active: ${device.lastActive}`);
        console.log(`  Created At: ${device.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error listing user devices:', error);
  }
}

// Clean up invalid devices
async function cleanupDevices() {
  try {
    console.log('Cleaning up invalid devices...');
    
    // Remove devices with null or empty tokens
    const emptyTokenResult = await Device.deleteMany({ token: { $in: [null, ''] } });
    console.log(`Removed ${emptyTokenResult.deletedCount} devices with empty tokens`);
    
    // Remove devices with auto-generated tokens
    const autoTokenResult = await Device.deleteMany({ token: /^auto_/ });
    console.log(`Removed ${autoTokenResult.deletedCount} devices with auto-generated tokens`);
    
    // Remove devices for non-existent users
    const allDevices = await Device.find({});
    const userIds = [...new Set(allDevices.map(device => device.user ? device.user.toString() : null))].filter(id => id);
    
    const existingUsers = await User.find({ _id: { $in: userIds } }, '_id');
    const existingUserIds = existingUsers.map(user => user._id.toString());
    
    const orphanedDevices = allDevices.filter(device => 
      device.user && !existingUserIds.includes(device.user.toString())
    );
    
    if (orphanedDevices.length > 0) {
      const orphanedIds = orphanedDevices.map(device => device._id);
      const orphanResult = await Device.deleteMany({ _id: { $in: orphanedIds } });
      console.log(`Removed ${orphanResult.deletedCount} devices for non-existent users`);
    } else {
      console.log('No orphaned devices found');
    }
    
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error cleaning up devices:', error);
  }
}

// Register a test device for a user
async function registerTestDevice(userId) {
  try {
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
    
    console.log(`Registering test device for user: ${user.fullName} (${user.email})`);
    
    // Generate a test token
    const testToken = `test_${crypto.randomBytes(16).toString('hex')}`;
    
    // Create a new device
    const newDevice = new Device({
      user: userIdObj,
      token: testToken,
      platform: 'web',
      deviceName: 'Test Device',
      lastActive: new Date()
    });
    
    await newDevice.save();
    console.log(`Created test device with ID: ${newDevice._id}`);
    console.log(`Token: ${testToken}`);
    
    // Update user's lastLoginAt field if missing
    if (!user.lastLoginAt) {
      user.lastLoginAt = new Date();
      await user.save();
      console.log(`Updated user's lastLoginAt to ${user.lastLoginAt}`);
    }
    
    console.log('Test device registered successfully');
  } catch (error) {
    console.error('Error registering test device:', error);
  }
}

// Main function
async function main() {
  try {
    const command = process.argv[2];
    const param = process.argv[3];
    
    if (!command) {
      console.log('Please provide a command. Available commands:');
      console.log('- list-all: List all devices');
      console.log('- list-user [userId]: List devices for a specific user');
      console.log('- cleanup: Clean up invalid devices');
      console.log('- register [userId]: Register a test device for a user');
      return;
    }
    
    switch (command) {
      case 'list-all':
        await listAllDevices();
        break;
      case 'list-user':
        if (!param) {
          console.error('Please provide a user ID');
          return;
        }
        await listUserDevices(param);
        break;
      case 'cleanup':
        await cleanupDevices();
        break;
      case 'register':
        if (!param) {
          console.error('Please provide a user ID');
          return;
        }
        await registerTestDevice(param);
        break;
      default:
        console.error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

main()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });