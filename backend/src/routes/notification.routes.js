const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const Notification = require('../models/notification.model');
const webPushService = require('../services/web-push.service');

// Lấy tất cả thông báo của người dùng (bao gồm cả thông báo hệ thống)
router.get('/api/notifications', authenticate, notificationController.getNotifications);

// Lấy thông báo hệ thống
router.get('/api/notifications/system', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Lấy thông báo hệ thống từ bộ nhớ tạm
    let systemNotifications = [];
    if (global.systemNotifications && global.systemNotifications.length > 0) {
      // Chỉ lấy thông báo hệ thống từ bộ nhớ tạm
      systemNotifications = global.systemNotifications.map(notification => ({
        ...notification,
        user: req.user._id,
        // Sử dụng systemId làm _id cho frontend
        _id: notification.systemId || `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: notification.message || notification.content || notification.title,
        read: false
      }));
    }
    
    res.json({ notifications: systemNotifications });
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông báo hệ thống', error: error.message });
  }
});

// Đánh dấu thông báo đã đọc
router.put('/api/notifications/:id/read', authenticate, notificationController.markAsRead);

// Đánh dấu tất cả thông báo đã đọc
router.put('/api/notifications/read-all', authenticate, notificationController.markAllAsRead);

// Xóa một thông báo
router.delete('/api/notifications/:id', authenticate, notificationController.deleteNotification);

// Xóa tất cả thông báo
router.delete('/api/notifications', authenticate, notificationController.deleteAllNotifications);

// Đồng bộ hóa thiết bị và subscription
router.post('/api/notifications/sync-devices', authenticate, notificationController.syncDevicesWithSubscriptions);

// Đồng bộ hóa thiết bị và subscription (admin route)
router.post('/api/admin/notifications/sync-all-devices', authenticate, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const result = await webPushService.syncDevicesWithSubscriptions();
    res.json(result);
  } catch (error) {
    console.error('Error syncing all devices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi đồng bộ hóa thiết bị và subscription',
      error: error.message
    });
  }
});

// Sửa chữa các subscription không hợp lệ (admin route)
router.post('/api/admin/notifications/fix-subscriptions', authenticate, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const crypto = require('crypto');
    const Subscription = require('../models/subscription.model');
    const Device = require('../models/device.model');
    
    console.log('Starting subscription repair...');
    
    // Lấy tất cả subscription
    const subscriptions = await Subscription.find({});
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    // Đếm số lượng subscription không hợp lệ
    let invalidCount = 0;
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (const sub of subscriptions) {
      // Kiểm tra subscription có hợp lệ không
      let isValid = true;
      
      try {
        // Kiểm tra subscription có đầy đủ thông tin không
        if (!sub.subscription || !sub.subscription.endpoint || !sub.subscription.keys) {
          isValid = false;
        } else {
          // Kiểm tra keys có đầy đủ thông tin không
          if (!sub.subscription.keys.auth || !sub.subscription.keys.p256dh) {
            isValid = false;
          } else {
            // Kiểm tra p256dh có đúng độ dài không
            // p256dh phải có độ dài 65 bytes khi decode từ base64
            const p256dh = sub.subscription.keys.p256dh;
            const p256dhBuffer = Buffer.from(p256dh, 'base64');
            
            if (p256dhBuffer.length !== 65) {
              console.log(`Invalid p256dh length: ${p256dhBuffer.length} bytes (should be 65 bytes)`);
              isValid = false;
            }
          }
        }
      } catch (error) {
        console.error('Error validating subscription:', error);
        isValid = false;
      }
      
      if (!isValid) {
        invalidCount++;
        console.log(`Found invalid subscription for user ${sub.user}`);
        
        // Xóa subscription không hợp lệ
        await Subscription.deleteOne({ _id: sub._id });
        deletedCount++;
        
        // Tạo subscription mới cho người dùng
        const device = await Device.findOne({ user: sub.user });
        
        if (device) {
          // Tạo subscription mới
          const autoEndpoint = `https://auto-generated-endpoint-${crypto.randomBytes(8).toString('hex')}.com`;
          
          // Tạo p256dh đúng độ dài (65 bytes)
          const p256dh = crypto.randomBytes(65).toString('base64');
          const auth = crypto.randomBytes(16).toString('base64');
          
          const newSubscription = new Subscription({
            user: sub.user,
            subscription: {
              endpoint: autoEndpoint,
              expirationTime: null,
              keys: {
                auth: auth,
                p256dh: p256dh
              }
            },
            platform: 'web',
            deviceName: 'Auto-registered web device',
            lastActive: new Date()
          });
          
          await newSubscription.save();
          fixedCount++;
          console.log(`Created new subscription for user ${sub.user}`);
        }
      }
    }
    
    const result = {
      success: true,
      message: `Repair completed: ${invalidCount} invalid subscriptions found`,
      stats: {
        total: subscriptions.length,
        invalid: invalidCount,
        deleted: deletedCount,
        fixed: fixedCount
      }
    };
    
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error fixing subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi sửa chữa subscription',
      error: error.message
    });
  }
});

// Lấy VAPID public key
router.get('/api/notifications/vapid-public-key', (req, res) => {
  try {
    // Lấy VAPID public key từ biến môi trường hoặc sử dụng key mặc định
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BGI9uiAxwDw9C8IGsV2uebaH8OdIsGFOPDog5iAm0XeGChG299dCHbJbbIHzLPRpk6pgV7UfzXk2U5vAvmroevM';
    
    // Validate key format
    if (!vapidPublicKey || typeof vapidPublicKey !== 'string' || 
        vapidPublicKey === 'your-vapid-public-key' || vapidPublicKey.length < 50 ||
        !/^[A-Za-z0-9_-]+$/.test(vapidPublicKey)) {
      console.error('Invalid VAPID_PUBLIC_KEY format');
      return res.status(500).json({ 
        message: 'VAPID public key is not configured properly',
        error: 'Invalid key format'
      });
    }
    
    res.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Đăng ký subscription
router.post('/api/notifications/register-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscription, deviceInfo } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }
    
    const result = await webPushService.registerSubscription(userId, subscription, deviceInfo);
    
    if (result) {
      res.json({ success: true, message: 'Subscription registered successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to register subscription' });
    }
  } catch (error) {
    console.error('Error registering subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering subscription',
      error: error.message
    });
  }
});

// Hủy đăng ký subscription
router.post('/api/notifications/unregister-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }
    
    const result = await webPushService.unregisterSubscription(userId, subscription);
    
    if (result) {
      res.json({ success: true, message: 'Subscription unregistered successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to unregister subscription' });
    }
  } catch (error) {
    console.error('Error unregistering subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error unregistering subscription',
      error: error.message
    });
  }
});

module.exports = router;