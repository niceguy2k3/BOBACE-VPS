const webpush = require('web-push');
const Subscription = require('../models/subscription.model');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Hàm chuyển đổi base64 sang base64url
function base64ToBase64Url(base64String) {
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Hàm tạo khóa ECDH hợp lệ
function generateValidECDHKeys() {
  // Tạo cặp khóa ECDH
  const ecdh = crypto.createECDH('prime256v1');
  ecdh.generateKeys();
  
  // Lấy khóa công khai dưới dạng buffer
  const publicKey = ecdh.getPublicKey();
  
  // Kiểm tra độ dài của khóa (phải là 65 bytes)
  if (publicKey.length !== 65) {
    console.log(`Generated key has invalid length: ${publicKey.length} bytes, regenerating...`);
    return generateValidECDHKeys(); // Tạo lại nếu không đúng độ dài
  }
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = publicKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Hàm tạo auth key hợp lệ
function generateValidAuthKey() {
  // Tạo khóa ngẫu nhiên 16 bytes
  const authKey = crypto.randomBytes(16);
  
  // Chuyển đổi sang base64 rồi sang base64url
  const base64 = authKey.toString('base64');
  return base64ToBase64Url(base64);
}

// Cấu hình VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BGI9uiAxwDw9C8IGsV2uebaH8OdIsGFOPDog5iAm0XeGChG299dCHbJbbIHzLPRpk6pgV7UfzXk2U5vAvmroevM',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'lt948XU1iP988OakK1YSA9CesgMKsdGA_MIiZrt0wiA'
};

// Cấu hình web-push
webpush.setVapidDetails(
  'mailto:contact@bobace.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Đăng ký subscription
exports.registerSubscription = async (userId, subscriptionData, deviceInfo = {}) => {
  try {
    if (!userId || !subscriptionData) {
      console.error('Missing userId or subscription data');
      return false;
    }

    // Chuyển đổi userId thành ObjectId nếu cần
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId;
    }

    // Parse subscription data nếu là string
    let subscription;
    try {
      subscription = typeof subscriptionData === 'string' 
        ? JSON.parse(subscriptionData) 
        : subscriptionData;
    } catch (parseError) {
      console.error('Error parsing subscription data:', parseError);
      return false;
    }

    // Kiểm tra subscription có hợp lệ không
    if (!subscription || !subscription.endpoint) {
      console.error('Invalid subscription data');
      return false;
    }

    // Validate subscription object có đầy đủ thông tin
    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      console.error('Subscription missing required keys');
      return false;
    }

    // Đảm bảo keys là base64url (loại bỏ padding và convert)
    const normalizedKeys = {
      p256dh: base64ToBase64Url(subscription.keys.p256dh),
      auth: base64ToBase64Url(subscription.keys.auth)
    };

    // Normalize subscription object - chỉ lưu các field cần thiết
    const normalizedSubscription = {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime || null,
      keys: normalizedKeys
    };

    // Validate keys format
    if (!/^[A-Za-z0-9\-_]+$/.test(normalizedKeys.p256dh) || 
        !/^[A-Za-z0-9\-_]+$/.test(normalizedKeys.auth)) {
      console.error('Invalid keys format after normalization');
      return false;
    }

    console.log(`Registering subscription for user ${userIdObj}, endpoint: ${normalizedSubscription.endpoint.substring(0, 50)}...`);

    // Tìm subscription hiện có
    const existingSubscription = await Subscription.findOne({
      user: userIdObj,
      'subscription.endpoint': normalizedSubscription.endpoint
    });

    if (existingSubscription) {
      // Kiểm tra xem subscription có thực sự thay đổi không
      const endpointChanged = existingSubscription.subscription?.endpoint !== normalizedSubscription.endpoint;
      const keysChanged = existingSubscription.subscription?.keys?.p256dh !== normalizedKeys.p256dh ||
                         existingSubscription.subscription?.keys?.auth !== normalizedKeys.auth;
      
      // Nếu subscription không thay đổi, chỉ cập nhật lastActive
      if (!endpointChanged && !keysChanged) {
        existingSubscription.lastActive = new Date();
        existingSubscription.platform = deviceInfo.platform || existingSubscription.platform || 'web';
        existingSubscription.deviceName = deviceInfo.deviceName || existingSubscription.deviceName || 'Unknown device';
        
        try {
          await existingSubscription.save();
          console.log(`✅ Updated lastActive for existing subscription ${existingSubscription._id} (no changes needed)`);
          return existingSubscription;
        } catch (saveError) {
          console.warn(`Warning: Could not update lastActive for subscription ${existingSubscription._id}:`, saveError.message);
          // Không xóa, chỉ return subscription hiện có
          return existingSubscription;
        }
      }
      
      // Cập nhật subscription hiện có nếu có thay đổi
      existingSubscription.subscription = normalizedSubscription;
      existingSubscription.platform = deviceInfo.platform || 'web';
      existingSubscription.deviceName = deviceInfo.deviceName || 'Unknown device';
      existingSubscription.lastActive = new Date();
      
      try {
        await existingSubscription.save();
        console.log(`✅ Updated existing subscription for user ${userIdObj}, subscription ID: ${existingSubscription._id}`);
        return existingSubscription;
      } catch (validationError) {
        console.error('Validation error when updating subscription:', validationError);
        console.error('Validation error details:', validationError.errors || validationError.message);
        
        // KHÔNG xóa subscription khi validation fail
        // Có thể do race condition hoặc lỗi tạm thời
        // Thử lại với dữ liệu hiện có, chỉ update lastActive
        try {
          existingSubscription.lastActive = new Date();
          await existingSubscription.save();
          console.log(`⚠️ Could not update subscription, but kept existing one and updated lastActive`);
          return existingSubscription;
        } catch (retryError) {
          console.error('Error updating lastActive after validation failure:', retryError);
          // Trả về subscription hiện có dù không save được, để không mất dữ liệu
          return existingSubscription;
        }
      }
    }

    // Tạo subscription mới (hoặc recreate nếu update failed)
    try {
      const newSubscription = new Subscription({
        user: userIdObj,
        subscription: normalizedSubscription,
        platform: deviceInfo.platform || 'web',
        deviceName: deviceInfo.deviceName || 'Unknown device',
        lastActive: new Date()
      });
      
      await newSubscription.save();
      console.log(`✅ Created new subscription for user ${userIdObj}, subscription ID: ${newSubscription._id}`);
      return newSubscription;
    } catch (saveError) {
      console.error('Error saving subscription to database:', saveError);
      if (saveError.errors) {
        console.error('Validation errors:', JSON.stringify(saveError.errors, null, 2));
      }
      return false;
    }
  } catch (error) {
    console.error('Error registering subscription:', error);
    return false;
  }
};

// Hủy đăng ký subscription
exports.unregisterSubscription = async (userId, subscriptionData) => {
  try {
    if (!userId || !subscriptionData) {
      console.error('Missing userId or subscription data');
      return false;
    }

    // Chuyển đổi userId thành ObjectId nếu cần
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId;
    }

    // Parse subscription data nếu là string
    let subscription;
    try {
      subscription = typeof subscriptionData === 'string' 
        ? JSON.parse(subscriptionData) 
        : subscriptionData;
    } catch (parseError) {
      console.error('Error parsing subscription data:', parseError);
      return false;
    }

    // Kiểm tra subscription có hợp lệ không
    if (!subscription || !subscription.endpoint) {
      console.error('Invalid subscription data');
      return false;
    }

    // Xóa subscription
    const result = await Subscription.deleteOne({
      user: userIdObj,
      'subscription.endpoint': subscription.endpoint
    });

    console.log(`Unregistered subscription for user ${userIdObj}:`, result);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error unregistering subscription:', error);
    return false;
  }
};

// Gửi thông báo đến một người dùng
exports.sendNotificationToUser = async (userId, notification) => {
  try {
    if (!userId || !notification) {
      console.error('Missing userId or notification data');
      return false;
    }

    // Chuyển đổi userId thành ObjectId nếu cần
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId;
    }

    // Tìm tất cả subscription của người dùng
    const subscriptions = await Subscription.find({ user: userIdObj });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userIdObj}`);
      return false;
    }

    console.log(`Found ${subscriptions.length} subscriptions for user ${userIdObj}`);

    // Chuẩn bị payload
    const payload = JSON.stringify({
      title: notification.title || 'BobaLove',
      body: notification.text || notification.message || notification.content || 'Bạn có thông báo mới',
      icon: notification.icon || '/logo192.png',
      url: notification.linkTo || '/',
      type: notification.type || 'system',
      data: notification.data || {},
      createdAt: notification.createdAt || new Date().toISOString()
    });

    // Gửi thông báo đến tất cả subscription
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (const sub of subscriptions) {
      try {
        // Validate subscription object
        if (!sub.subscription) {
          console.error(`Subscription ${sub._id} has no subscription object`);
          failureCount++;
          errors.push({
            subscriptionId: sub._id,
            error: 'Missing subscription object'
          });
          continue;
        }
        
        if (!sub.subscription.endpoint) {
          console.error(`Subscription ${sub._id} has no endpoint`);
          failureCount++;
          errors.push({
            subscriptionId: sub._id,
            error: 'Missing endpoint'
          });
          continue;
        }
        
        // Kiểm tra xem endpoint có phải là endpoint giả không
        if (sub.subscription.endpoint.includes('auto-generated-endpoint')) {
          console.log(`Skipping auto-generated endpoint for subscription ${sub._id}`);
          await Subscription.deleteOne({ _id: sub._id });
          console.log(`Removed auto-generated subscription ${sub._id}`);
          continue;
        }
        
        // Validate keys
        if (!sub.subscription.keys || !sub.subscription.keys.p256dh || !sub.subscription.keys.auth) {
          console.error(`Subscription ${sub._id} has invalid keys`);
          failureCount++;
          errors.push({
            subscriptionId: sub._id,
            error: 'Invalid keys'
          });
          continue;
        }
        
        console.log(`Sending notification to subscription ${sub._id}, endpoint: ${sub.subscription.endpoint.substring(0, 50)}...`);
        
        // Gửi thông báo
        await webpush.sendNotification(sub.subscription, payload);
        successCount++;
        console.log(`✅ Successfully sent notification to subscription ${sub._id}`);
        
        // Cập nhật lastActive
        sub.lastActive = new Date();
        await sub.save();
      } catch (error) {
        failureCount++;
        console.error(`❌ Error sending notification to subscription ${sub._id}:`, error.message);
        console.error(`Error details:`, {
          statusCode: error.statusCode,
          endpoint: sub.subscription?.endpoint?.substring(0, 50),
          errorName: error.name
        });
        
        // CHỈ xóa subscription khi thực sự hết hạn hoặc invalid (404, 410)
        // KHÔNG xóa khi lỗi do network, VAPID key, hoặc lỗi tạm thời khác
        const isSubscriptionExpired = error.statusCode === 404 || error.statusCode === 410;
        const isEndpointNotFound = error.message?.includes('ENOTFOUND') && error.statusCode;
        
        if (isSubscriptionExpired || isEndpointNotFound) {
          console.log(`Subscription ${sub._id} is expired or invalid (status: ${error.statusCode}), removing...`);
          try {
            await Subscription.deleteOne({ _id: sub._id });
            console.log(`✅ Removed expired/invalid subscription ${sub._id} for user ${sub.user}`);
          } catch (deleteError) {
            console.error(`Error deleting expired subscription ${sub._id}:`, deleteError);
          }
        } else {
          // Lỗi tạm thời (network, VAPID key config, etc.) - KHÔNG xóa subscription
          console.warn(`⚠️ Subscription ${sub._id} failed but keeping it (status: ${error.statusCode || 'unknown'}). Error may be temporary.`);
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: error.message || 'Unknown error',
          statusCode: error.statusCode
        });
      }
    }

    console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
    
    if (errors.length > 0) {
      console.log('Notification errors:', errors);
    }

    return successCount > 0;
  } catch (error) {
    console.error('Error sending notification to user:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
};

// Gửi thông báo đến nhiều người dùng
exports.sendNotificationToUsers = async (userIds, notification) => {
  try {
    if (!userIds || !userIds.length || !notification) {
      console.error('Missing userIds or notification data');
      return false;
    }

    // Chuyển đổi userIds thành ObjectId nếu cần
    const userIdObjs = userIds.map(userId => {
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        return new mongoose.Types.ObjectId(userId);
      } else if (userId instanceof mongoose.Types.ObjectId) {
        return userId;
      } else {
        return userId;
      }
    });

    // Tìm tất cả subscription của các người dùng
    const subscriptions = await Subscription.find({ user: { $in: userIdObjs } });

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for users ${userIdObjs.map(id => id.toString()).join(', ')}`);
      return false;
    }

    console.log(`Found ${subscriptions.length} subscriptions for ${userIdObjs.length} users`);

    // Chuẩn bị payload
    const payload = JSON.stringify({
      title: notification.title || 'BobaLove',
      body: notification.text || notification.message || notification.content || 'Bạn có thông báo mới',
      icon: notification.icon || '/logo192.png',
      url: notification.linkTo || '/',
      type: notification.type || 'system',
      data: notification.data || {},
      createdAt: notification.createdAt || new Date().toISOString()
    });

    // Gửi thông báo đến tất cả subscription
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (const sub of subscriptions) {
      try {
        // Kiểm tra xem endpoint có phải là endpoint giả không
        if (sub.subscription.endpoint.includes('auto-generated-endpoint')) {
          console.log(`Skipping auto-generated endpoint for subscription ${sub._id}`);
          await Subscription.deleteOne({ _id: sub._id });
          console.log(`Removed auto-generated subscription ${sub._id}`);
          continue;
        }

        await webpush.sendNotification(sub.subscription, payload);
        successCount++;
        
        // Cập nhật lastActive
        sub.lastActive = new Date();
        await sub.save();
      } catch (error) {
        failureCount++;
        console.error(`❌ Error sending notification to subscription ${sub._id}:`, error.message);
        console.error(`Error details:`, {
          statusCode: error.statusCode,
          endpoint: sub.subscription?.endpoint?.substring(0, 50),
          errorName: error.name
        });
        
        // CHỈ xóa subscription khi thực sự hết hạn hoặc invalid (404, 410)
        // KHÔNG xóa khi lỗi do network, VAPID key, hoặc lỗi tạm thời khác
        const isSubscriptionExpired = error.statusCode === 404 || error.statusCode === 410;
        const isEndpointNotFound = error.message?.includes('ENOTFOUND') && error.statusCode;
        
        if (isSubscriptionExpired || isEndpointNotFound) {
          console.log(`Subscription ${sub._id} is expired or invalid (status: ${error.statusCode}), removing...`);
          try {
            await Subscription.deleteOne({ _id: sub._id });
            console.log(`✅ Removed expired/invalid subscription ${sub._id} for user ${sub.user}`);
          } catch (deleteError) {
            console.error(`Error deleting expired subscription ${sub._id}:`, deleteError);
          }
        } else {
          // Lỗi tạm thời (network, VAPID key config, etc.) - KHÔNG xóa subscription
          console.warn(`⚠️ Subscription ${sub._id} failed but keeping it (status: ${error.statusCode || 'unknown'}). Error may be temporary.`);
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: error.message || 'Unknown error',
          statusCode: error.statusCode
        });
      }
    }

    console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
    
    if (errors.length > 0) {
      console.log('Notification errors:', errors);
    }

    return successCount > 0;
  } catch (error) {
    console.error('Error sending notification to users:', error);
    return false;
  }
};

// Đồng bộ hóa thiết bị và subscription
exports.syncDevicesWithSubscriptions = async () => {
  try {
    const Device = require('../models/device.model');
    const User = require('../models/user.model');
    
    console.log('Starting device-subscription synchronization...');
    
    // Lấy tất cả thiết bị
    const devices = await Device.find({});
    
    if (!devices || devices.length === 0) {
      console.log('No devices found to sync');
      return {
        success: false,
        message: 'No devices found'
      };
    }
    
    console.log(`Found ${devices.length} devices to sync`);
    
    // Lấy danh sách người dùng có thiết bị
    const userIds = [...new Set(devices.map(device => device.user.toString()))];
    
    console.log(`Found ${userIds.length} unique users with devices`);
    
    // Lấy tất cả subscription hiện có
    const subscriptions = await Subscription.find({ user: { $in: userIds } });
    
    console.log(`Found ${subscriptions.length} existing subscriptions`);
    
    // Tạo map người dùng -> subscription
    const userSubscriptionMap = {};
    
    for (const sub of subscriptions) {
      const userId = sub.user.toString();
      if (!userSubscriptionMap[userId]) {
        userSubscriptionMap[userId] = [];
      }
      userSubscriptionMap[userId].push(sub);
    }
    
    // Xóa tất cả subscription giả
    let removedCount = 0;
    for (const sub of subscriptions) {
      if (sub.subscription.endpoint.includes('auto-generated-endpoint')) {
        await Subscription.deleteOne({ _id: sub._id });
        removedCount++;
      }
    }
    
    console.log(`Removed ${removedCount} auto-generated subscriptions`);
    
    return {
      success: true,
      message: 'Device-subscription synchronization completed',
      stats: {
        devices: devices.length,
        users: userIds.length,
        existingSubscriptions: subscriptions.length,
        removedSubscriptions: removedCount
      }
    };
  } catch (error) {
    console.error('Error syncing devices with subscriptions:', error);
    return {
      success: false,
      message: 'Error syncing devices with subscriptions',
      error: error.message
    };
  }
};