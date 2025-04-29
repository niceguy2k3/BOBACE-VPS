const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reported: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['inappropriate_content', 'harassment', 'fake_profile', 'spam', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'],
    default: 'chờ_xử_lý'
  },
  evidence: [{
    type: String // URLs to evidence images/screenshots
  }],
  adminNotes: {
    type: String
  },
  adminAction: {
    type: String,
    enum: ['none', 'warning', 'ban_temporary', 'ban_permanent', 'content_removed'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Thêm index để tìm kiếm nhanh hơn
reportSchema.index({ reporter: 1 });
reportSchema.index({ reported: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ createdAt: -1 });

// Thêm plugin phân trang nếu cần
if (mongoose.plugins && mongoose.plugins.length > 0) {
  const foundPlugin = mongoose.plugins.find(plugin => plugin[0].toString().includes('paginate'));
  if (!foundPlugin) {
    const mongoosePaginate = require('mongoose-paginate-v2');
    reportSchema.plugin(mongoosePaginate);
  }
} else {
  try {
    const mongoosePaginate = require('mongoose-paginate-v2');
    reportSchema.plugin(mongoosePaginate);
  } catch (error) {
    console.warn('mongoose-paginate-v2 not available, pagination will not work for Report model');
  }
}

module.exports = mongoose.model('Report', reportSchema);