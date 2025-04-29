const Notification = require('../models/notification.model');
const socketModule = require('../socket');
const webPushService = require('../services/web-push.service');

// Lấy tất cả thông báo của người dùng
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { includeSystem = 'true' } = req.query; // Mặc định là lấy cả thông báo hệ thống
    
    // Lấy thông báo cá nhân của người dùng
    const userNotifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    let allNotifications = [...userNotifications];
    
    // Chỉ lấy thông báo hệ thống nếu includeSystem là true
    if (includeSystem === 'true' && global.systemNotifications && global.systemNotifications.length > 0) {
      // Không cần kiểm tra trong DB vì ID không phải là ObjectId hợp lệ
      // Chỉ lấy thông báo hệ thống từ bộ nhớ tạm
      const systemNotifications = global.systemNotifications.map(notification => ({
        ...notification,
        // Đảm bảo thông báo hệ thống có định dạng giống với thông báo người dùng
        user: userId,
        // Tạo _id mới cho mỗi thông báo hệ thống
        _id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: notification.message || notification.content || notification.title,
        type: 'system',
        read: false,
        linkTo: notification.linkTo || '/',
        createdAt: notification.createdAt || notification.sentAt || new Date().toISOString()
      }));
      
      allNotifications = [...userNotifications, ...systemNotifications];
    }
    
    // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
    allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ notifications: allNotifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thông báo', error: error.message });
  }
};

// Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

// Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    next(error);
  }
};

// Xóa một thông báo
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }
    
    res.json({ message: 'Đã xóa thông báo' });
  } catch (error) {
    next(error);
  }
};

// Xóa tất cả thông báo
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    await Notification.deleteMany({ user: userId });
    
    res.json({ message: 'Đã xóa tất cả thông báo' });
  } catch (error) {
    next(error);
  }
};

// Tạo thông báo mới (được gọi từ các controller khác)
exports.createNotification = async (userId, notificationData) => {
  try {
    // Define valid types directly to avoid any schema loading issues
    const validTypes = [
      'like', 'match', 'message', 'admirer', 'system', 
      'blindate', 'blindate_request', 'blindate_accepted', 'blindate_rejected',
      'blindate_updated', 'blindate_reviewed', 'blindate_cancelled', 'blindate_video_link',
      'negotiation_message'
    ];
    
    const type = notificationData.type || 'system';
    
    // Log for debugging
    console.log(`Creating notification with type: ${type}`);
    console.log(`Valid notification types:`, validTypes);
    
    if (!validTypes.includes(type)) {
      console.error(`Invalid notification type: ${type}. Valid types are: ${validTypes.join(', ')}`);
      // Instead of returning null, use 'system' as a fallback
      notificationData.type = 'system';
      console.log(`Using fallback type 'system' instead`);
    }
    
    const notification = new Notification({
      user: userId,
      text: notificationData.text,
      type: notificationData.type || 'system',
      linkTo: notificationData.linkTo || '/',
      read: false
    });
    
    await notification.save();
    
    // Gửi thông báo qua socket nếu có thể
    try {
      const io = socketModule.getIO();
      if (io) {
        io.to(`user_${userId}`).emit('newNotification', {
          notification: {
            _id: notification._id,
            text: notification.text,
            type: notification.type,
            linkTo: notification.linkTo,
            read: notification.read,
            createdAt: notification.createdAt
          }
        });
      }
    } catch (error) {
      console.error('Socket error when sending notification:', error);
    }
    
    // Gửi thông báo đẩy đến thiết bị của người dùng
    try {
      // Convert userId to ObjectId if needed
      const mongoose = require('mongoose');
      let userIdObj;
      
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userIdObj)) {
        userIdObj = new mongoose.Types.ObjectId(userId);
      } else if (userId instanceof mongoose.Types.ObjectId) {
        userIdObj = userId;
      } else {
        userIdObj = userId; // Use as is if it's already an ObjectId
      }
      
      // Không cần kiểm tra thiết bị nữa vì chúng ta sử dụng Web Push API
      
      // Send the notification
      await webPushService.sendNotificationToUser(userIdObj, {
        title: 'BobaLove',
        text: notification.text,
        type: notification.type,
        linkTo: notification.linkTo,
        data: {
          notificationId: notification._id.toString()
        }
      });
    } catch (error) {
      console.error('Push notification error:', error);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Đồng bộ hóa thiết bị và subscription
exports.syncDevicesWithSubscriptions = async (req, res, next) => {
  try {
    const result = await webPushService.syncDevicesWithSubscriptions();
    res.json(result);
  } catch (error) {
    console.error('Error syncing devices with subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi đồng bộ hóa thiết bị và subscription',
      error: error.message
    });
  }
};

// Gửi thông báo hệ thống đến tất cả người dùng
exports.sendSystemNotification = async (notificationData) => {
  try {
    // Lưu thông báo hệ thống vào bộ nhớ tạm
    if (!global.systemNotifications) {
      global.systemNotifications = [];
    }
    
    const systemNotification = {
      _id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notificationData.title || 'BobaLove',
      message: notificationData.text || notificationData.message || notificationData.content,
      type: 'system',
      linkTo: notificationData.linkTo || '/',
      sentAt: new Date().toISOString()
    };
    
    global.systemNotifications.push(systemNotification);
    
    // Giới hạn số lượng thông báo hệ thống trong bộ nhớ tạm
    if (global.systemNotifications.length > 10) {
      global.systemNotifications = global.systemNotifications.slice(-10);
    }
    
    // Gửi thông báo qua socket nếu có thể
    try {
      const io = socketModule.getIO();
      if (io) {
        io.emit('systemNotification', {
          notification: systemNotification
        });
      }
    } catch (error) {
      console.error('Socket error when sending system notification:', error);
    }
    
    // Gửi thông báo đẩy đến tất cả thiết bị
    try {
      await webPushService.sendNotificationToAllUsers({
        title: systemNotification.title,
        text: systemNotification.message,
        type: 'system',
        linkTo: systemNotification.linkTo,
        createdAt: systemNotification.sentAt
      });
    } catch (error) {
      console.error('Push notification error:', error);
    }
    
    return systemNotification;
  } catch (error) {
    console.error('Error sending system notification:', error);
    return null;
  }
};