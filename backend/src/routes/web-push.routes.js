const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const webPushService = require('../services/web-push.service');
const Subscription = require('../models/subscription.model');

// Đăng ký subscription
router.post('/api/web-push/register', authenticate, async (req, res) => {
  try {
    const { subscription, platform, deviceName } = req.body;
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }
    
    const userId = req.user._id;
    
    // Đăng ký subscription
    const deviceInfo = {
      platform: platform || 'web',
      deviceName: deviceName || 'Unknown device'
    };
    
    const result = await webPushService.registerSubscription(userId, subscription, deviceInfo);
    
    if (!result) {
      return res.status(500).json({ message: 'Failed to register subscription' });
    }
    
    return res.status(200).json({ 
      message: 'Subscription registered successfully',
      subscription: result
    });
  } catch (error) {
    console.error('Error registering subscription:', error);
    return res.status(500).json({ 
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

// Lấy VAPID public key
router.get('/api/web-push/vapid-public-key', (req, res) => {
  try {
    // Lấy VAPID public key từ biến môi trường hoặc từ service
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 
      'BB--F3UbmfESF1YffFPvg3MPcNb9pm8t0msGl0aug99AWbPgYNT640mxW0ws1za7pJuMGrnMMsGV8X-Uupn3KUM';
    
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
    
    // Tìm subscription của người dùng
    const subscriptions = await Subscription.find({ user: userId });
    
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found for this user' });
    }
    
    // Gửi thông báo test
    const notification = {
      title: 'Thông báo test',
      text: 'Đây là thông báo test từ Bobace',
      icon: '/logo192.png',
      linkTo: '/',
      type: 'system'
    };
    
    const result = await webPushService.sendNotificationToUser(userId, notification);
    
    if (!result) {
      return res.status(500).json({ message: 'Failed to send test notification' });
    }
    
    return res.status(200).json({ 
      message: 'Test notification sent successfully',
      subscriptionsCount: subscriptions.length
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ 
      message: 'An error occurred while sending test notification',
      error: error.message
    });
  }
});

module.exports = router;