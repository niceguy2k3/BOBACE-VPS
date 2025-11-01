const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const webPushService = require('../services/web-push.service');
const Subscription = require('../models/subscription.model');
const mongoose = require('mongoose');

// Lấy danh sách subscriptions của user
router.get('/api/web-push/subscriptions', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Chuyển đổi userId thành ObjectId nếu cần
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId;
    }
    
    const subscriptions = await Subscription.find({ user: userIdObj }).sort({ lastActive: -1 });
    
    // Chuyển đổi subscriptions thành format giống devices
    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub._id,
      token: sub.subscription.endpoint.substring(0, 50) + '...', // Truncate endpoint
      platform: sub.platform,
      deviceName: sub.deviceName,
      lastActive: sub.lastActive,
      createdAt: sub.createdAt
    }));
    
    return res.status(200).json({ 
      subscriptions: formattedSubscriptions 
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return res.status(500).json({ 
      message: 'An error occurred while getting subscriptions',
      error: error.message
    });
  }
});

// Đăng ký subscription
router.post('/api/web-push/register', authenticate, async (req, res) => {
  try {
    const { subscription, platform, deviceName } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ 
        success: false,
        message: 'Subscription data is required' 
      });
    }
    
    const userId = req.user._id;
    
    console.log(`[Register Subscription] User: ${userId}, Platform: ${platform || 'web'}`);
    
    // Đăng ký subscription
    const deviceInfo = {
      platform: platform || 'web',
      deviceName: deviceName || 'Unknown device'
    };
    
    const result = await webPushService.registerSubscription(userId, subscription, deviceInfo);
    
    if (!result) {
      console.error(`[Register Subscription] Failed for user ${userId}`);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to register subscription. Please check server logs for details.' 
      });
    }
    
    console.log(`[Register Subscription] Success for user ${userId}, Subscription ID: ${result._id}`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Subscription registered successfully',
      subscription: {
        id: result._id,
        platform: result.platform,
        deviceName: result.deviceName,
        lastActive: result.lastActive,
        createdAt: result.createdAt
      }
    });
  } catch (error) {
    console.error('[Register Subscription] Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while registering subscription',
      error: error.message
    });
  }
});

// Hủy đăng ký subscription
router.delete('/api/web-push/unregister', authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }
    
    const userId = req.user._id;
    
    // Hủy đăng ký subscription
    const result = await webPushService.unregisterSubscription(userId, subscription);
    
    if (!result) {
      return res.status(500).json({ message: 'Failed to unregister subscription' });
    }
    
    return res.status(200).json({ 
      message: 'Subscription unregistered successfully' 
    });
  } catch (error) {
    console.error('Error unregistering subscription:', error);
    return res.status(500).json({ 
      message: 'An error occurred while unregistering subscription',
      error: error.message
    });
  }
});

// Xóa subscription bằng ID
router.delete('/api/web-push/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Chuyển đổi userId thành ObjectId
    let userIdObj;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObj = new mongoose.Types.ObjectId(userId);
    } else if (userId instanceof mongoose.Types.ObjectId) {
      userIdObj = userId;
    } else {
      userIdObj = userId;
    }
    
    // Xóa subscription
    const result = await Subscription.deleteOne({ 
      _id: id,
      user: userIdObj 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    return res.status(200).json({ 
      message: 'Subscription deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return res.status(500).json({ 
      message: 'An error occurred while deleting subscription',
      error: error.message
    });
  }
});

// Lấy VAPID public key
router.get('/api/web-push/vapid-public-key', (req, res) => {
  try {
    // Lấy VAPID public key từ biến môi trường hoặc sử dụng key mặc định hợp lệ
    // Key mặc định phải là base64url string hợp lệ
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 
      'BGI9uiAxwDw9C8IGsV2uebaH8OdIsGFOPDog5iAm0XeGChG299dCHbJbbIHzLPRpk6pgV7UfzXk2U5vAvmroevM';
    
    // Validate key format trước khi trả về
    if (!vapidPublicKey || typeof vapidPublicKey !== 'string') {
      console.error('Invalid VAPID_PUBLIC_KEY format');
      return res.status(500).json({ 
        message: 'VAPID public key is not configured properly',
        error: 'Invalid key format'
      });
    }
    
    // Kiểm tra nếu là placeholder
    if (vapidPublicKey === 'your-vapid-public-key' || vapidPublicKey.length < 50) {
      console.error('VAPID_PUBLIC_KEY appears to be a placeholder:', vapidPublicKey);
      return res.status(500).json({ 
        message: 'VAPID public key is not configured. Please set VAPID_PUBLIC_KEY environment variable.',
        error: 'Placeholder key detected'
      });
    }
    
    // Validate base64url format
    if (!/^[A-Za-z0-9_-]+$/.test(vapidPublicKey)) {
      console.error('Invalid VAPID_PUBLIC_KEY format (must be base64url)');
      return res.status(500).json({ 
        message: 'VAPID public key has invalid format',
        error: 'Invalid base64url format'
      });
    }
    
    return res.status(200).json({ vapidPublicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return res.status(500).json({ 
      message: 'An error occurred while getting VAPID public key',
      error: error.message
    });
  }
});

// Gửi thông báo test
router.post('/api/web-push/send-test', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`[Send Test] User ID: ${userId}`);
    
    // Tìm subscription của người dùng
    const subscriptions = await Subscription.find({ user: userId });
    
    console.log(`[Send Test] Found ${subscriptions?.length || 0} subscriptions`);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[Send Test] No subscriptions found for user ${userId}`);
      return res.status(404).json({ 
        success: false,
        message: 'No subscriptions found for this user. Please enable notifications first.',
        code: 'NO_SUBSCRIPTIONS'
      });
    }
    
    // Validate subscriptions
    const validSubscriptions = [];
    for (const sub of subscriptions) {
      if (sub.subscription && sub.subscription.endpoint && 
          sub.subscription.keys && sub.subscription.keys.p256dh && sub.subscription.keys.auth) {
        validSubscriptions.push(sub);
      } else {
        console.warn(`[Send Test] Invalid subscription ${sub._id}, skipping`);
      }
    }
    
    if (validSubscriptions.length === 0) {
      console.error(`[Send Test] No valid subscriptions found for user ${userId}`);
      return res.status(400).json({ 
        success: false,
        message: 'No valid subscriptions found. Please re-enable notifications.',
        code: 'INVALID_SUBSCRIPTIONS'
      });
    }
    
    console.log(`[Send Test] ${validSubscriptions.length} valid subscriptions found`);
    
    // Gửi thông báo test
    const notification = {
      title: 'Thông báo test',
      text: 'Đây là thông báo test từ Bobace',
      icon: '/logo192.png',
      linkTo: '/',
      type: 'system'
    };
    
    console.log('[Send Test] Calling sendNotificationToUser...');
    console.log('[Send Test] VAPID Public Key configured:', !!process.env.VAPID_PUBLIC_KEY);
    console.log('[Send Test] VAPID Public Key from env:', process.env.VAPID_PUBLIC_KEY ? 'Yes' : 'No (using default)');
    if (process.env.VAPID_PUBLIC_KEY) {
      console.log('[Send Test] VAPID Public Key preview:', process.env.VAPID_PUBLIC_KEY.substring(0, 30) + '...');
    }
    console.log('[Send Test] Valid subscriptions:', validSubscriptions.length);
    
    // Log subscription details
    for (const sub of validSubscriptions) {
      console.log(`[Send Test] Subscription ${sub._id}: endpoint=${sub.subscription.endpoint.substring(0, 60)}...`);
    }
    
    try {
      const result = await webPushService.sendNotificationToUser(userId, notification);
      
      if (!result) {
        console.error('[Send Test] sendNotificationToUser returned false - no notifications sent successfully');
        console.error('[Send Test] Check backend logs above for detailed error information');
        
        // Kiểm tra VAPID key
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        let errorMessage = 'Không thể gửi thông báo test. ';
        
        if (!vapidPublicKey || vapidPublicKey === 'your-vapid-public-key') {
          errorMessage += 'VAPID key chưa được cấu hình đúng. ';
        }
        
        errorMessage += 'Có thể do subscription đã hết hạn, VAPID key không đúng, hoặc lỗi kết nối. Vui lòng kiểm tra backend logs và thử bật lại thông báo.';
        
        return res.status(400).json({ 
          success: false,
          message: errorMessage,
          code: 'NOTIFICATION_SEND_FAILED',
          details: process.env.NODE_ENV === 'development' ? {
            subscriptionsCount: validSubscriptions.length,
            vapidKeyConfigured: !!vapidPublicKey && vapidPublicKey !== 'your-vapid-public-key'
          } : undefined
        });
      }
    } catch (sendError) {
      console.error('[Send Test] Error when calling sendNotificationToUser:', sendError);
      console.error('[Send Test] Error stack:', sendError.stack);
      
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi khi gửi thông báo test: ' + (sendError.message || 'Lỗi không xác định'),
        code: 'SEND_ERROR',
        error: process.env.NODE_ENV === 'development' ? sendError.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? sendError.stack : undefined
      });
    }
    
    console.log('[Send Test] Test notification sent successfully');
    return res.status(200).json({ 
      success: true,
      message: 'Test notification sent successfully',
      subscriptionsCount: validSubscriptions.length
    });
  } catch (error) {
    console.error('[Send Test] Error:', error);
    console.error('[Send Test] Stack:', error.stack);
    return res.status(500).json({ 
      success: false,
      message: 'An error occurred while sending test notification',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;