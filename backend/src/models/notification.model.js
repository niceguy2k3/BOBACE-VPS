const mongoose = require('mongoose');

const validNotificationTypes = [
  'like', 'match', 'message', 'admirer', 'system', 
  'blindate', 'blindate_request', 'blindate_accepted', 'blindate_rejected',
  'blindate_updated', 'blindate_reviewed', 'blindate_cancelled', 'blindate_video_link',
  'negotiation_message'
];

// Log the valid notification types for debugging
console.log('Valid notification types:', validNotificationTypes);

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: validNotificationTypes,
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  linkTo: {
    type: String,
    default: '/'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Tự động xóa thông báo cũ sau 30 ngày
notificationSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 
});

const Notification = mongoose.model('Notification', notificationSchema);

// Log the enum values from the schema for debugging
console.log('Notification schema type enum values:', Notification.schema.path('type').enumValues);

module.exports = Notification;