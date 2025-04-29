const admin = require('firebase-admin');
const Device = require('../models/device.model');
const path = require('path');
const fs = require('fs');

let firebaseInitialized = false;

// Export initialization status for troubleshooting
exports.isFirebaseInitialized = firebaseInitialized;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    console.log('Firebase Admin SDK already initialized');
    return;
  }

  try {
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
    let serviceAccount;

    if (fs.existsSync(serviceAccountPath)) {
      console.log('Loading Firebase service account from file:', serviceAccountPath);
      serviceAccount = require(serviceAccountPath);
    } else {
      console.log('Service account file not found, attempting to load from environment variables');
      if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('No Firebase service account file or environment variable found');
      }
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Invalid service account configuration: missing required fields');
    }

    console.log('Initializing Firebase Admin SDK with project ID:', serviceAccount.project_id);

    try {
      admin.app();
      console.log('Firebase app already initialized');
      firebaseInitialized = true;
      return;
    } catch (error) {
      // Not initialized, proceed
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
    });

    firebaseInitialized = true;
    exports.isFirebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

exports.sendNotificationToUser = async (userId, notification) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    if (!firebaseInitialized) {
      console.error('Firebase Admin SDK not initialized');
      return false;
    }

    console.log(`Fetching devices for user ${userId}`);
    
    // Ensure userId is a valid ObjectId
    const mongoose = require('mongoose');
    let userIdObj;
    
    try {
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        userIdObj = new mongoose.Types.ObjectId(userId);
      } else if (userId instanceof mongoose.Types.ObjectId) {
        userIdObj = userId;
      } else {
        console.error(`Invalid user ID format: ${userId}`);
        return false;
      }
      
      console.log(`Using ObjectId for query: ${userIdObj.toString()}`);
      const devices = await Device.find({ user: userIdObj });

      if (!devices || devices.length === 0) {
        console.log(`No devices found for user ${userId}`);
        console.log('Query used:', { user: userIdObj });

        const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
        if (skipFcm) {
          console.log('Skipping FCM notification sending in development mode');
          return true;
        }

        try {
          const User = require('../models/user.model');
          const user = await User.findById(userIdObj);
          
          if (user) {
            console.log(`User ${userId} last login:`, user.lastLoginAt || user.lastActive || 'Unknown');
            
            // Check if user has any devices registered
            const deviceCount = await Device.countDocuments({ user: userIdObj });
            console.log(`Total devices registered for user ${userId}: ${deviceCount}`);
            
            // Try to update user's lastLoginAt field if it's missing
            if (!user.lastLoginAt && user.lastActive) {
              await User.findByIdAndUpdate(userIdObj, { lastLoginAt: user.lastActive });
              console.log(`Updated user ${userId} lastLoginAt to match lastActive`);
            }
            
            // Không tự động tạo thiết bị nữa vì không thể gửi thông báo đến thiết bị không có subscription
            console.log(`User ${userId} needs to register a device and subscription through the frontend`);
            return [];
          } else {
            console.error(`User ${userId} not found in database`);
          }
        } catch (err) {
          console.error('Error fetching user info:', err.message);
        }

        return false;
      }
      
      const tokens = devices
        .map((device) => device.token)
        .filter((token) => token && typeof token === 'string');

      if (tokens.length === 0) {
        console.log(`No valid tokens found for user ${userId}`);
        await Device.deleteMany({ user: userIdObj, token: { $in: [null, ''] } });
        return false;
      }

      // Filter out auto-generated tokens for FCM sending
      const fcmTokens = tokens.filter(token => !token.startsWith('auto_'));
      const autoTokens = tokens.filter(token => token.startsWith('auto_'));
      
      if (autoTokens.length > 0) {
        console.log(`Found ${autoTokens.length} auto-generated tokens that will be skipped for FCM sending`);
      }
      
      if (fcmTokens.length === 0 && autoTokens.length > 0) {
        console.log(`User ${userId} only has auto-generated tokens, skipping FCM sending`);
        return true; // Return success since we've recorded the notification in the database
      }
      
      console.log('Tokens found for user:', tokens.map(t => t.substring(0, 10) + '...'));

      const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
      if (skipFcm) {
        console.log('Development mode: Skipping actual FCM notification sending');
        console.log('Would have sent notification to tokens:', fcmTokens.length);
        return true;
      }

      // If we only have auto-generated tokens, return success
      if (fcmTokens.length === 0) {
        console.log('No valid FCM tokens found, but notification was recorded in database');
        return true;
      }

      let successCount = 0;
      let failureCount = 0;
      const errors = [];

      for (const token of fcmTokens) {
        // Correct FCM message format based on test results
        const message = {
          token: token,
          notification: {
            title: notification.title || 'BobaLove',
            body: notification.text || notification.message || notification.content || 'New notification',
          },
          data: {
            type: (notification.type || 'system').toString(),
            linkTo: (notification.linkTo || '/').toString(),
            createdAt: (notification.createdAt || new Date().toISOString()).toString(),
            ...(notification.data ? Object.fromEntries(
              Object.entries(notification.data).map(([k, v]) => [k, v?.toString() || ''])
            ) : {}),
          },
          webpush: {
            notification: {
              icon: notification.icon || '/logo192.png',
            },
            fcm_options: {
              link: notification.linkTo || 'https://bobace.com',
            },
          },
        };

        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          try {
            console.log(`Sending FCM message to token ${token.substring(0, 10)}...`, JSON.stringify(message, null, 2));
            const response = await admin.messaging().send(message);
            console.log(`Successfully sent message to token ${token.substring(0, 10)}...:`, response);
            successCount++;
            break;
          } catch (error) {
            console.error(`FCM Error for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.code, error.message);
            console.error('Raw server response:', error.response?.data || 'No response data');
            console.error('Message that failed:', JSON.stringify(message, null, 2));
            
            retryCount++;
            if (retryCount > maxRetries) {
              console.error(`Max retries reached for token ${token.substring(0, 10)}...`);
              failureCount++;
              errors.push({ token, error: error.message });
              break;
            }

            console.log(`Retrying FCM send for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
      if (failureCount > 0) {
        console.warn('Notification errors:', errors);
        const failedTokens = errors.map(e => e.token);
        if (failedTokens.length > 0) {
          await Device.deleteMany({ token: { $in: failedTokens } });
          console.log(`Removed ${failedTokens.length} invalid tokens`);
        }
      }

      return successCount > 0;
    } catch (error) {
      console.error(`Error processing notification for user ${userId}:`, error.message);
      return false;
    }
  } catch (error) {
    console.error('General error in push notification service:', error.message);
    console.error('Stack trace:', error.stack);

    const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
    if (skipFcm) {
      console.log('Development mode: Ignoring push notification error');
      return true;
    }

    return false;
  }
};

// Update other functions similarly
exports.sendNotificationToUsers = async (userIds, notification) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    if (!firebaseInitialized) {
      console.error('Firebase Admin SDK not initialized');
      return false;
    }

    // Ensure userIds are valid ObjectIds
    const mongoose = require('mongoose');
    const validUserIds = [];
    
    for (const userId of userIds) {
      try {
        if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
          validUserIds.push(new mongoose.Types.ObjectId(userId));
        } else if (userId instanceof mongoose.Types.ObjectId) {
          validUserIds.push(userId);
        } else {
          console.error(`Invalid user ID format: ${userId}, skipping`);
        }
      } catch (err) {
        console.error(`Error processing user ID ${userId}:`, err.message);
      }
    }
    
    if (validUserIds.length === 0) {
      console.error('No valid user IDs provided');
      return false;
    }
    
    console.log(`Fetching devices for users ${validUserIds.map(id => id.toString()).join(', ')}`);
    const devices = await Device.find({ user: { $in: validUserIds } });

    if (!devices || devices.length === 0) {
      console.log(`No devices found for users ${validUserIds.map(id => id.toString()).join(', ')}`);
      
      // Log which users have no devices
      try {
        const User = require('../models/user.model');
        for (const userId of validUserIds) {
          const deviceCount = await Device.countDocuments({ user: userId });
          const user = await User.findById(userId);
          console.log(`User ${userId} has ${deviceCount} devices, last active: ${user?.lastActive || 'Unknown'}`);
        }
      } catch (err) {
        console.error('Error checking user devices:', err.message);
      }
      
      return false;
    }

    const tokens = devices
      .map((device) => device.token)
      .filter((token) => token && typeof token === 'string');

    if (tokens.length === 0) {
      console.log(`No valid tokens found for users ${validUserIds.map(id => id.toString()).join(', ')}`);
      await Device.deleteMany({ user: { $in: validUserIds }, token: { $in: [null, ''] } });
      return false;
    }

    // Filter out auto-generated tokens for FCM sending
    const fcmTokens = tokens.filter(token => !  token.startsWith('auto_'));
    const autoTokens = tokens.filter(token => token.startsWith('auto_'));
    
    if (autoTokens.length > 0) {
      console.log(`Found ${autoTokens.length} auto-generated tokens that will be skipped for FCM sending`);
    }
    
    if (fcmTokens.length === 0 && autoTokens.length > 0) {
      console.log(`Users only have auto-generated tokens, skipping FCM sending`);
      return true; // Return success since we've recorded the notification in the database
    }

    console.log('Tokens found:', tokens.map(t => t.substring(0, 10) + '...'));

    const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
    if (skipFcm) {
      console.log('Development mode: Skipping actual FCM notification sending');
      console.log('Would have sent notification to tokens:', fcmTokens.length);
      return true;
    }

    // If we only have auto-generated tokens, return success
    if (fcmTokens.length === 0) {
      console.log('No valid FCM tokens found, but notification was recorded in database');
      return true;
    }

    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (const token of fcmTokens) {
      // Correct FCM message format based on test results
      const message = {
        token: token,
        notification: {
          title: notification.title || 'BobaLove',
          body: notification.text || notification.message || notification.content || 'New notification',
        },
        data: {
          type: (notification.type || 'system').toString(),
          linkTo: (notification.linkTo || '/').toString(),
          createdAt: (notification.createdAt || new Date().toISOString()).toString(),
          ...(notification.data ? Object.fromEntries(
            Object.entries(notification.data).map(([k, v]) => [k, v?.toString() || ''])
          ) : {}),
        },
        webpush: {
          notification: {
            icon: notification.icon || '/logo192.png',
          },
          fcm_options: {
            link: notification.linkTo || 'https://bobace.com',
          },
        },
      };

      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          console.log(`Sending FCM message to token ${token.substring(0, 10)}...`, JSON.stringify(message, null, 2));
          const response = await admin.messaging().send(message);
          console.log(`Successfully sent message to token ${token.substring(0, 10)}...:`, response);
          successCount++;
          break;
        } catch (error) {
          console.error(`FCM Error for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.code, error.message);
          console.error('Raw server response:', error.response?.data || 'No response data');
          console.error('Message that failed:', JSON.stringify(message, null, 2));
          
          retryCount++;
          if (retryCount > maxRetries) {
            console.error(`Max retries reached for token ${token.substring(0, 10)}...`);
            failureCount++;
            errors.push({ token, error: error.message });
            break;
          }

          console.log(`Retrying FCM send for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
    if (failureCount > 0) {
      console.warn('Notification errors:', errors);
      const failedTokens = errors.map(e => e.token);
      if (failedTokens.length > 0) {
        await Device.deleteMany({ token: { $in: failedTokens } });
        console.log(`Removed ${failedTokens.length} invalid tokens`);
      }
    }

    return successCount > 0;
  } catch (error) {
    console.error('General error in push notification service:', error.message);
    console.error('Stack trace:', error.stack);

    const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
    if (skipFcm) {
      console.log('Development mode: Ignoring push notification error');
      return true;
    }

    return false;
  }
};

// Send notification to all users
exports.sendNotificationToAllUsers = async (notification) => {
  try {
    if (!firebaseInitialized) {
      initializeFirebase();
    }

    if (!firebaseInitialized) {
      console.error('Firebase Admin SDK not initialized');
      return false;
    }

    // Get all devices
    const devices = await Device.find({});
    console.log(`Found ${devices.length} devices for all users`);

    if (!devices || devices.length === 0) {
      console.log('No devices found in the system');
      return false;
    }

    const tokens = devices
      .map((device) => device.token)
      .filter((token) => token && typeof token === 'string');

    if (tokens.length === 0) {
      console.log('No valid tokens found');
      await Device.deleteMany({ token: { $in: [null, ''] } });
      return false;
    }

    // Filter out auto-generated tokens for FCM sending
    const fcmTokens = tokens.filter(token => !token.startsWith('auto_'));
    const autoTokens = tokens.filter(token => token.startsWith('auto_'));
    
    if (autoTokens.length > 0) {
      console.log(`Found ${autoTokens.length} auto-generated tokens that will be skipped for FCM sending`);
    }
    
    if (fcmTokens.length === 0 && autoTokens.length > 0) {
      console.log(`Only auto-generated tokens found, skipping FCM sending`);
      return true; // Return success since we've recorded the notification in the database
    }

    console.log(`Found ${fcmTokens.length} valid FCM tokens`);

    const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
    if (skipFcm) {
      console.log('Development mode: Skipping actual FCM notification sending');
      console.log('Would have sent notification to tokens:', fcmTokens.length);
      return true;
    }

    // If we only have auto-generated tokens, return success
    if (fcmTokens.length === 0) {
      console.log('No valid FCM tokens found, but notification was recorded in database');
      return true;
    }

    // Send in batches of 500 to avoid rate limits
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < fcmTokens.length; i += batchSize) {
      batches.push(fcmTokens.slice(i, i + batchSize));
    }
    
    console.log(`Sending notifications in ${batches.length} batches`);
    
    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    const allErrors = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batchTokens = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batchTokens.length} tokens`);
      
      let successCount = 0;
      let failureCount = 0;
      const errors = [];

      for (const token of batchTokens) {
        // Correct FCM message format based on test results
        const message = {
          token: token,
          notification: {
            title: notification.title || 'BobaLove',
            body: notification.text || notification.message || notification.content || 'New notification',
          },
          data: {
            type: (notification.type || 'system').toString(),
            linkTo: (notification.linkTo || '/').toString(),
            createdAt: (notification.createdAt || new Date().toISOString()).toString(),
            ...(notification.data ? Object.fromEntries(
              Object.entries(notification.data).map(([k, v]) => [k, v?.toString() || ''])
            ) : {}),
          },
          webpush: {
            notification: {
              icon: notification.icon || '/logo192.png',
            },
            fcm_options: {
              link: notification.linkTo || 'https://bobace.com',
            },
          },
        };

        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          try {
            console.log(`Sending FCM message to token ${token.substring(0, 10)}...`);
            const response = await admin.messaging().send(message);
            console.log(`Successfully sent message to token ${token.substring(0, 10)}...:`, response);
            successCount++;
            break;
          } catch (error) {
            console.error(`FCM Error for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.code, error.message);
            
            retryCount++;
            if (retryCount > maxRetries) {
              console.error(`Max retries reached for token ${token.substring(0, 10)}...`);
              failureCount++;
              errors.push({ token, error: error.message });
              break;
            }

            console.log(`Retrying FCM send for token ${token.substring(0, 10)}... (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      console.log(`Batch ${batchIndex + 1} results: ${successCount} successes, ${failureCount} failures`);
      
      totalSuccessCount += successCount;
      totalFailureCount += failureCount;
      allErrors.push(...errors);
      
      // Wait a bit between batches to avoid rate limits
      if (batchIndex < batches.length - 1) {
        console.log('Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Total notifications sent: ${totalSuccessCount} successes, ${totalFailureCount} failures`);
    
    if (totalFailureCount > 0) {
      console.warn(`${totalFailureCount} notifications failed to send`);
      
      // Remove invalid tokens
      const failedTokens = allErrors.map(e => e.token);
      if (failedTokens.length > 0) {
        await Device.deleteMany({ token: { $in: failedTokens } });
        console.log(`Removed ${failedTokens.length} invalid tokens`);
      }
    }

    return totalSuccessCount > 0;
  } catch (error) {
    console.error('General error in push notification service:', error.message);
    console.error('Stack trace:', error.stack);

    const skipFcm = process.env.NODE_ENV === 'development' || process.env.SKIP_FCM === 'true';
    if (skipFcm) {
      console.log('Development mode: Ignoring push notification error');
      return true;
    }

    return false;
  }
};