const Notification = require('../models/notification.model');
const socketModule = require('../socket');

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} options.recipient - User ID of the recipient
 * @param {string} options.sender - User ID of the sender (optional)
 * @param {string} options.type - Type of notification
 * @param {string} options.content - Notification content/message
 * @param {Object} options.reference - Reference object (optional)
 * @param {string} options.reference.type - Type of reference (e.g., 'blindate', 'message')
 * @param {string} options.reference.id - ID of the referenced object
 * @returns {Promise<Object>} The created notification
 */
exports.createNotification = async (options) => {
  try {
    const { recipient, sender, type, content, reference } = options;
    
    if (!recipient || !type || !content) {
      console.error('Missing required notification parameters');
      return null;
    }
    
    // Validate notification type
    if (!exports.isValidType(type)) {
      console.error(`Invalid notification type: ${type}`);
      return null;
    }
    
    // Generate link based on reference if provided
    let linkTo = '/';
    if (reference) {
      if (reference.type === 'blindate') {
        linkTo = `/blindates/${reference.id}`;
      } else if (reference.type === 'message') {
        linkTo = `/messages/${reference.id}`;
      }
    }
    
    const notification = new Notification({
      user: recipient,
      text: content,
      type: type,
      linkTo: linkTo,
      read: false,
      createdAt: new Date()
    });
    
    await notification.save();
    
    // Send notification via socket if available
    try {
      const io = socketModule.getIO();
      if (io) {
        io.to(`user_${recipient}`).emit('newNotification', {
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
    } catch (socketError) {
      console.error('Socket error when sending notification:', socketError);
    }
    
    // Send web push notification
    try {
      const webPushService = require('../services/web-push.service');
      
      // Send the notification
      await webPushService.sendNotificationToUser(recipient, {
        title: 'BobaLove',
        text: notification.text,
        type: notification.type,
        linkTo: notification.linkTo,
        data: {
          notificationId: notification._id.toString()
        }
      });
    } catch (pushError) {
      console.error('Web Push notification error:', pushError);
    }
    
    // Send push notification
    try {
      const pushNotificationService = require('../services/push-notification.service');
      
      // Send the notification
      await pushNotificationService.sendNotificationToUser(recipient, {
        title: 'BobaLove',
        text: notification.text,
        type: notification.type,
        linkTo: notification.linkTo,
        data: {
          notificationId: notification._id.toString()
        }
      });
    } catch (pushError) {
      console.error('Push notification error:', pushError);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} The updated notification
 */
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

/**
 * Get unread notifications count for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<number>} Count of unread notifications
 */
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * Check if notification type is valid
 * @param {string} type - Notification type
 * @returns {boolean} Whether the type is valid
 */
exports.isValidType = (type) => {
  // Define valid types directly to avoid any schema loading issues
  const validTypes = [
    'like', 'match', 'message', 'admirer', 'system', 
    'blindate', 'blindate_request', 'blindate_accepted', 'blindate_rejected',
    'blindate_updated', 'blindate_reviewed', 'blindate_cancelled', 'blindate_video_link'
  ];
  
  // Log for debugging
  console.log(`Checking if notification type '${type}' is valid. Valid types:`, validTypes);
  
  return validTypes.includes(type);
};
