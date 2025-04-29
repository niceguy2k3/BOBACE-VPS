const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios', 'desktop'],
    default: 'web'
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

// Tạo index cho token để tìm kiếm nhanh
deviceSchema.index({ token: 1 });

// Tạo index cho user để tìm kiếm nhanh
deviceSchema.index({ user: 1 });

// Tự động xóa token không hoạt động sau 90 ngày
deviceSchema.index({ lastActive: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60 
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;