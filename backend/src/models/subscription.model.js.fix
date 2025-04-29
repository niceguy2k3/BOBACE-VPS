const mongoose = require('mongoose');

// Hàm kiểm tra chuỗi base64url hợp lệ
function isBase64Url(str) {
  // Kiểm tra xem chuỗi có chứa ký tự không hợp lệ không
  return /^[A-Za-z0-9\-_]*$/.test(str);
}

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: Object,
    required: true,
    validate: {
      validator: function(subscription) {
        // Kiểm tra subscription có endpoint không
        if (!subscription || !subscription.endpoint) {
          return false;
        }
        
        // Kiểm tra subscription có keys không
        if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
          return false;
        }
        
        // Kiểm tra p256dh và auth có phải là chuỗi base64url hợp lệ không
        return isBase64Url(subscription.keys.p256dh) && isBase64Url(subscription.keys.auth);
      },
      message: 'Subscription không hợp lệ'
    }
  },
  platform: {
    type: String,
    enum: ['web', 'mobile'],
    default: 'web'
  },
  deviceName: {
    type: String,
    default: 'Unknown device'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Đảm bảo mỗi người dùng chỉ có một subscription cho mỗi endpoint
subscriptionSchema.index({ user: 1, 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);