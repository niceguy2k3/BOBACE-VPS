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
      // KHÔNG throw error, chỉ return false để caller có thể xử lý
      return false;
    }

    console.log(`Found ${subscriptions.length} subscriptions for user ${userIdObj}`);
    
    // Filter chỉ lấy subscriptions hợp lệ
    const validSubscriptions = subscriptions.filter(sub => {
      return sub.subscription && 
             sub.subscription.endpoint && 
             sub.subscription.keys && 
             sub.subscription.keys.p256dh && 
             sub.subscription.keys.auth;
    });
    
    if (validSubscriptions.length === 0) {
      console.warn(`No valid subscriptions found for user ${userIdObj} (all ${subscriptions.length} subscriptions are invalid)`);
      return false;
    }
    
    console.log(`Processing ${validSubscriptions.length} valid subscriptions out of ${subscriptions.length} total`);

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

    // Gửi thông báo đến tất cả subscription hợp lệ
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (const sub of validSubscriptions) {
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
        console.log(`Payload size: ${payload.length} bytes`);
        console.log(`Keys: p256dh length=${sub.subscription.keys.p256dh?.length}, auth length=${sub.subscription.keys.auth?.length}`);
        
        // Gửi thông báo
        try {
          await webpush.sendNotification(sub.subscription, payload);
          successCount++;
          console.log(`✅ Successfully sent notification to subscription ${sub._id}`);
          
          // Cập nhật lastActive
          sub.lastActive = new Date();
          await sub.save();
        } catch (sendError) {
          // Re-throw để catch block bên ngoài xử lý
          throw sendError;
        }
      } catch (error) {
        failureCount++;
        
        const statusCode = error.statusCode || error.status;
        const errorMessage = error.message || '';
        const errorBody = error.body || '';
        
        console.error(`❌ Error sending notification to subscription ${sub._id}:`, errorMessage);
        console.error(`Error details:`, {
          statusCode: statusCode,
          status: error.status,
          endpoint: sub.subscription?.endpoint?.substring(0, 50),
          errorName: error.name,
          errorCode: error.code,
          errorBody: errorBody?.substring(0, 200)
        });
        
        // Phân tích lỗi chi tiết - RẤT CẨN THẬN khi xóa subscription
        // CHỈ xóa khi CHẮC CHẮN 100% subscription đã expired, KHÔNG xóa khi nghi ngờ
        const has404or410 = statusCode === 404 || statusCode === 410;
        
        // Kiểm tra các dấu hiệu subscription expired (phải rất rõ ràng)
        const clearlyExpired = (
          errorMessage.includes('No subscription') || 
          errorMessage.includes('subscription has expired') ||
          errorMessage.includes('Subscription has expired') ||
          errorMessage.includes('expired subscription') ||
          errorMessage.includes('Invalid registration') ||
          (errorMessage.includes('expired') && errorMessage.includes('subscription')) ||
          errorBody?.includes('expired subscription') ||
          errorBody?.includes('No subscription') ||
          errorBody?.includes('subscription has expired')
        );
        
        // Kiểm tra các lỗi KHÔNG phải do subscription expired
        const isVapidKeyError = errorMessage?.toLowerCase().includes('invalid') && 
                                (errorMessage?.toLowerCase().includes('key') || 
                                 errorMessage?.toLowerCase().includes('vapid') ||
                                 errorMessage?.toLowerCase().includes('public key'));
        const isNetworkError = errorMessage?.includes('timeout') || 
                               errorMessage?.includes('ECONNREFUSED') ||
                               errorMessage?.includes('network') ||
                               errorMessage?.includes('ETIMEDOUT') ||
                               errorMessage?.includes('ENOTFOUND');
        const isConfigError = errorMessage?.includes('Public key') || 
                             errorMessage?.includes('VAPID') ||
                             errorMessage?.includes('authentication') ||
                             errorMessage?.includes('Invalid VAPID');
        const isUnspecified404 = has404or410 && !clearlyExpired && !errorMessage.includes('subscription');
        
        // CHỈ xóa khi:
        // 1. Có 404/410 VÀ
        // 2. Message RÕ RÀNG chỉ ra subscription expired (không phải lỗi khác) VÀ
        // 3. KHÔNG phải lỗi VAPID key, network, hoặc config VÀ
        // 4. KHÔNG phải lỗi 404 không rõ ràng (có thể do VAPID key)
        const shouldDelete = has404or410 && 
                            clearlyExpired && 
                            !isVapidKeyError && 
                            !isNetworkError && 
                            !isConfigError &&
                            !isUnspecified404;
        
        if (shouldDelete) {
          console.log(`⚠️ Subscription ${sub._id} is CONFIRMED expired (status: ${statusCode}), removing...`);
          console.log(`Expired indicators: ${errorMessage.substring(0, 200)}`);
          try {
            const userId = sub.user;
            await Subscription.deleteOne({ _id: sub._id });
            console.log(`✅ Removed expired subscription ${sub._id} for user ${userId}`);
            
            // Sau khi xóa subscription expired, trigger re-registration
            // Lưu thông tin vào DB để frontend có thể check và re-register
            try {
              const User = require('../models/user.model');
              await User.findByIdAndUpdate(userId, {
                $set: {
                  needsReSubscription: true,
                  lastReSubscriptionRequest: new Date()
                }
              }, { new: true });
              console.log(`✅ Flagged user ${userId} for re-subscription`);
            } catch (flagError) {
              console.warn(`Could not flag user for re-subscription:`, flagError.message);
            }
          } catch (deleteError) {
            console.error(`Error deleting expired subscription ${sub._id}:`, deleteError);
          }
        } else {
          // KHÔNG xóa subscription - an toàn hơn
          console.warn(`⚠️ Subscription ${sub._id} failed but KEEPING it (will NOT delete):`);
          console.warn(`  - Status code: ${statusCode || 'unknown'}`);
          console.warn(`  - Error message: ${errorMessage.substring(0, 150)}`);
          if (has404or410) {
            if (!clearlyExpired) {
              console.warn(`  - ⚠️ Has 404/410 but message doesn't clearly indicate expiration`);
              console.warn(`  - ⚠️ Likely VAPID key/config issue - NOT deleting subscription`);
            }
            if (isVapidKeyError || isConfigError) {
              console.warn(`  - ⚠️ Detected VAPID key/config error - fixable without deleting`);
            }
          }
          if (isNetworkError) {
            console.warn(`  - ⚠️ Network error - temporary, NOT deleting subscription`);
          }
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: errorMessage || 'Unknown error',
          statusCode: statusCode,
          kept: !(has404or410 && indicatesExpired && !isVapidKeyError && !isNetworkError && !isConfigError)
        });
      }
    }

    console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
    
    if (errors.length > 0) {
      console.log('Notification errors:', errors);
      const keptCount = errors.filter(e => e.kept).length;
      if (keptCount > 0) {
        console.log(`⚠️ ${keptCount} subscriptions failed but were kept (errors may be temporary or fixable)`);
      }
    }

    // Return true CHỈ KHI có ít nhất 1 notification được gửi thành công
    // KHÔNG return true chỉ vì subscription được keep khi lỗi
    // Vì mục đích là gửi notification, không phải keep subscription
    if (successCount > 0) {
      console.log(`✅ Successfully sent ${successCount} notification(s)`);
      return true;
    } else {
      console.warn(`⚠️ No notifications were sent successfully`);
      if (errors.length > 0) {
        console.warn(`All ${errors.length} attempts failed (but subscriptions were kept for retry)`);
      }
      return false;
    }
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
        
        const statusCode = error.statusCode || error.status;
        const errorMessage = error.message || '';
        const errorBody = error.body || '';
        
        console.error(`❌ Error sending notification to subscription ${sub._id}:`, errorMessage);
        console.error(`Error details:`, {
          statusCode: statusCode,
          status: error.status,
          endpoint: sub.subscription?.endpoint?.substring(0, 50),
          errorName: error.name,
          errorCode: error.code,
          errorBody: errorBody?.substring(0, 200)
        });
        
        // Phân tích lỗi chi tiết - RẤT CẨN THẬN khi xóa subscription
        const has404or410 = statusCode === 404 || statusCode === 410;
        
        // Kiểm tra các dấu hiệu subscription expired (phải rất rõ ràng)
        const clearlyExpired = (
          errorMessage.includes('No subscription') || 
          errorMessage.includes('subscription has expired') ||
          errorMessage.includes('Subscription has expired') ||
          errorMessage.includes('expired subscription') ||
          errorMessage.includes('Invalid registration') ||
          (errorMessage.includes('expired') && errorMessage.includes('subscription')) ||
          errorBody?.includes('expired subscription') ||
          errorBody?.includes('No subscription') ||
          errorBody?.includes('subscription has expired')
        );
        
        // Kiểm tra các lỗi KHÔNG phải do subscription expired
        const isVapidKeyError = errorMessage?.toLowerCase().includes('invalid') && 
                                (errorMessage?.toLowerCase().includes('key') || 
                                 errorMessage?.toLowerCase().includes('vapid') ||
                                 errorMessage?.toLowerCase().includes('public key'));
        const isNetworkError = errorMessage?.includes('timeout') || 
                               errorMessage?.includes('ECONNREFUSED') ||
                               errorMessage?.includes('network') ||
                               errorMessage?.includes('ETIMEDOUT') ||
                               errorMessage?.includes('ENOTFOUND');
        const isConfigError = errorMessage?.includes('Public key') || 
                             errorMessage?.includes('VAPID') ||
                             errorMessage?.includes('authentication') ||
                             errorMessage?.includes('Invalid VAPID');
        const isUnspecified404 = has404or410 && !clearlyExpired && !errorMessage.includes('subscription');
        
        // CHỈ xóa khi CHẮC CHẮN subscription expired
        const shouldDelete = has404or410 && 
                            clearlyExpired && 
                            !isVapidKeyError && 
                            !isNetworkError && 
                            !isConfigError &&
                            !isUnspecified404;
        
        if (shouldDelete) {
          console.log(`⚠️ Subscription ${sub._id} is CONFIRMED expired (status: ${statusCode}), removing...`);
          try {
            await Subscription.deleteOne({ _id: sub._id });
            console.log(`✅ Removed expired subscription ${sub._id} for user ${sub.user}`);
          } catch (deleteError) {
            console.error(`Error deleting expired subscription ${sub._id}:`, deleteError);
          }
        } else {
          // KHÔNG xóa subscription - an toàn hơn
          console.warn(`⚠️ Subscription ${sub._id} failed but KEEPING it (will NOT delete):`);
          console.warn(`  - Status code: ${statusCode || 'unknown'}`);
          console.warn(`  - Error message: ${errorMessage.substring(0, 150)}`);
          if (has404or410 && !clearlyExpired) {
            console.warn(`  - ⚠️ Has 404/410 but NOT clearly expired - likely VAPID key/config issue`);
          }
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: errorMessage || 'Unknown error',
          statusCode: statusCode,
          kept: !shouldDelete,
          reason: shouldDelete ? 'expired' : (isVapidKeyError ? 'VAPID key' : isNetworkError ? 'network' : isConfigError ? 'config' : 'unknown')
        });
      }
    }

    console.log(`Sent notifications: ${successCount} successes, ${failureCount} failures`);
    
    if (errors.length > 0) {
      console.log('Notification errors:', errors);
      const keptCount = errors.filter(e => e.kept).length;
      if (keptCount > 0) {
        console.log(`⚠️ ${keptCount} subscriptions failed but were kept (errors may be temporary or fixable)`);
      }
    }

    // Return true CHỈ KHI có ít nhất 1 notification được gửi thành công
    if (successCount > 0) {
      console.log(`✅ Successfully sent ${successCount} notification(s) to ${userIdObjs.length} user(s)`);
      return true;
    } else {
      console.warn(`⚠️ No notifications were sent successfully to any user`);
      if (errors.length > 0) {
        console.warn(`All ${errors.length} attempts failed (but subscriptions were kept for retry)`);
      }
      return false;
    }
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