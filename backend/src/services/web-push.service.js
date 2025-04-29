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
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BB--F3UbmfESF1YffFPvg3MPcNb9pm8t0msGl0aug99AWbPgYNT640mxW0ws1za7pJuMGrnMMsGV8X-Uupn3KUM',
  privateKey: process.env.VAPID_PRIVATE_KEY || '_yvG4XuHfmZ1ttiiQZq3Mvq_FSe8grK5qmc3Jj9zzSU'
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

    // Đảm bảo keys là base64url
    if (subscription.keys) {
      if (subscription.keys.p256dh) {
        subscription.keys.p256dh = base64ToBase64Url(subscription.keys.p256dh);
      }
      if (subscription.keys.auth) {
        subscription.keys.auth = base64ToBase64Url(subscription.keys.auth);
      }
    }

    // Tìm subscription hiện có
    const existingSubscription = await Subscription.findOne({
      user: userIdObj,
      'subscription.endpoint': subscription.endpoint
    });

    if (existingSubscription) {
      // Cập nhật subscription hiện có
      existingSubscription.subscription = subscription;
      existingSubscription.platform = deviceInfo.platform || 'web';
      existingSubscription.deviceName = deviceInfo.deviceName || 'Unknown device';
      existingSubscription.lastActive = new Date();
      
      await existingSubscription.save();
      console.log(`Updated existing subscription for user ${userIdObj}`);
      return existingSubscription;
    } else {
      // Tạo subscription mới
      const newSubscription = new Subscription({
        user: userIdObj,
        subscription,
        platform: deviceInfo.platform || 'web',
        deviceName: deviceInfo.deviceName || 'Unknown device',
        lastActive: new Date()
      });
      
      await newSubscription.save();
      console.log(`Created new subscription for user ${userIdObj}`);
      return newSubscription;
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
        console.error(`Error sending notification to subscription ${sub._id}:`, error);
        
        // Kiểm tra lỗi để xác định xem subscription có hết hạn không
        if (error.statusCode === 404 || error.statusCode === 410 || 
            error.message.includes('invalid public key') || 
            error.message.includes('Public key is not valid') ||
            error.message.includes('ENOTFOUND')) {
          console.log(`Subscription ${sub._id} is expired or invalid, removing...`);
          await Subscription.deleteOne({ _id: sub._id });
          console.log(`Removed invalid subscription ${sub._id} for user ${sub.user}`);
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: error.message
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
        console.error(`Error sending notification to subscription ${sub._id}:`, error);
        
        // Kiểm tra lỗi để xác định xem subscription có hết hạn không
        if (error.statusCode === 404 || error.statusCode === 410 || 
            error.message.includes('invalid public key') || 
            error.message.includes('Public key is not valid') ||
            error.message.includes('ENOTFOUND')) {
          console.log(`Subscription ${sub._id} is expired or invalid, removing...`);
          await Subscription.deleteOne({ _id: sub._id });
          console.log(`Removed invalid subscription ${sub._id} for user ${sub.user}`);
        }
        
        errors.push({
          subscriptionId: sub._id,
          error: error.message
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