const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  resetCode: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Mã hết hạn sau 15 phút
      return new Date(Date.now() + 15 * 60 * 1000);
    }
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Tự động xóa các mã đặt lại đã hết hạn sau 1 giờ
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;