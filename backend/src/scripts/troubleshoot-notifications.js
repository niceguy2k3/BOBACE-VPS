/**
 * Script to troubleshoot notification issues
 * 
 * This script helps diagnose and fix issues with push notifications:
 * 1. Checks if a user has registered devices
 * 2. Verifies if the devices have valid FCM tokens
 * 3. Attempts to send a test notification
 * 4. Provides detailed logs for debugging
 * 
 * Usage: node src/scripts/troubleshoot-notifications.js [userId]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/device.model');
const User = require('../models/user.model');
const pushNotificationService = require('../services/push-notification.service');
const crypto = require('crypto');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function troubleshootNotifications(userId) {
  try {
    console.log('=== NOTIFICATION TROUBLESHOOTING ===');
    
    if (!userId) {
      console.error('Please provide a user ID');
      return;
    }
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid user ID format: ${userId}`);
      return;
    }
    
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Step 1: Check if user exists
    console.log(`\n1. Checking if user ${userId} exists...`);
    const user = await User.findById(userIdObj);
    
    if (!user) {
      console.error(`User ${userId} not found in database`);
      return;
    }
    
    console.log(`Found user: ${user.fullName} (${user.email})`);
    console.log(`Last active: ${user.lastActive || 'Unknown'}`);
    console.log(`Last login: ${user.lastLoginAt || 'Unknown'}`);
    
    // Step 2: Check for registered devices
    console.log(`\n2. Checking for registered devices...`);
    const devices = await Device.find({ user: userIdObj });
    
    if (!devices || devices.length === 0) {
      console.log(`No devices found for user ${userId}`);
      
      // Step 2.1: Register a test device
      console.log(`\n2.1. Registering a test device...`);
      
      try {
        const testToken = `test_${crypto.randomBytes(16).toString('hex')}`;
        
        const newDevice = new Device({
          user: userIdObj,
          token: testToken,
          platform: 'web',
          deviceName: 'Troubleshooting test device',
          lastActive: new Date()
        });
        
        await newDevice.save();
        console.log(`Created test device with token: ${testToken.substring(0, 10)}...`);
        
        // Update user's lastLoginAt field if missing
        if (!user.lastLoginAt) {
          user.lastLoginAt = new Date();
          await user.save();
          console.log(`Updated user's lastLoginAt to ${user.lastLoginAt}`);
        }
      } catch (regError) {
        console.error(`Error registering test device: ${regError.message}`);
      }
    } else {
      console.log(`Found ${devices.length} devices for user ${userId}`);
      
      // List all devices
      devices.forEach((device, index) => {
        console.log(`\nDevice ${index + 1}:`);
        console.log(`  ID: ${device._id}`);
        console.log(`  Token: ${device.token ? device.token.substring(0, 10) + '...' : 'No token'}`);
        console.log(`  Platform: ${device.platform}`);
        console.log(`  Device Name: ${device.deviceName}`);
        console.log(`  Last Active: ${device.lastActive}`);
        console.log(`  Created At: ${device.createdAt}`);
        console.log(`  Auto-generated: ${device.token && device.token.startsWith('auto_') ? 'Yes' : 'No'}`);
      });
      
      // Step 2.2: Check for invalid tokens
      console.log(`\n2.2. Checking for invalid tokens...`);
      const invalidTokens = devices.filter(d => !d.token || d.token === '');
      
      if (invalidTokens.length > 0) {
        console.log(`Found ${invalidTokens.length} devices with invalid tokens`);
        
        // Remove invalid tokens
        await Device.deleteMany({ user: userIdObj, token: { $in: [null, ''] } });
        console.log(`Removed ${invalidTokens.length} devices with invalid tokens`);
      } else {
        console.log(`No invalid tokens found`);
      }
      
      // Step 2.3: Check for auto-generated tokens
      console.log(`\n2.3. Checking for auto-generated tokens...`);
      const autoTokens = devices.filter(d => d.token && d.token.startsWith('auto_'));
      
      if (autoTokens.length > 0) {
        console.log(`Found ${autoTokens.length} devices with auto-generated tokens`);
        console.log(`These tokens will be skipped for FCM sending`);
      } else {
        console.log(`No auto-generated tokens found`);
      }
    }
    
    // Step 3: Send a test notification
    console.log(`\n3. Sending a test notification...`);
    
    try {
      const result = await pushNotificationService.sendNotificationToUser(userIdObj, {
        title: 'Test Notification',
        text: 'This is a test notification from the troubleshooting script',
        type: 'system',
        linkTo: '/',
        data: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`Test notification result: ${result ? 'Success' : 'Failed'}`);
    } catch (notifError) {
      console.error(`Error sending test notification: ${notifError.message}`);
    }
    
    // Step 4: Check notification settings
    console.log(`\n4. Checking notification settings...`);
    
    // Check if FCM is initialized
    console.log(`Firebase initialized: ${pushNotificationService.isFirebaseInitialized ? 'Yes' : 'No'}`);
    
    // Check if we're in development mode
    console.log(`Development mode: ${process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}`);
    console.log(`Skip FCM: ${process.env.SKIP_FCM === 'true' ? 'Yes' : 'No'}`);
    
    // Step 5: Provide recommendations
    console.log(`\n5. Recommendations:`);
    
    // Check if user has any valid devices
    const validDevices = await Device.find({ 
      user: userIdObj, 
      token: { $ne: null, $ne: '' },
      token: { $not: /^auto_/ }
    });
    
    if (validDevices.length === 0) {
      console.log(`- User needs to register a valid FCM token from their browser`);
      console.log(`- Guide the user to enable notifications in their browser settings`);
      console.log(`- Make sure the user is using a supported browser (Chrome, Firefox, Safari, Edge)`);
    } else {
      console.log(`- User has ${validDevices.length} valid device(s) registered`);
      console.log(`- Check if the user has enabled notifications in their browser`);
      console.log(`- Verify that the Firebase configuration is correct`);
    }
    
    // Check if user's lastLoginAt is set
    if (!user.lastLoginAt) {
      console.log(`- User's lastLoginAt is not set, this might cause issues`);
      console.log(`- Consider updating the user's lastLoginAt field`);
    }
    
    console.log('\nTroubleshooting completed');
  } catch (error) {
    console.error('Error in troubleshooting:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Get userId from command line arguments
const userId = process.argv[2];

troubleshootNotifications(userId)
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });