const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['emergency', 'unsafe', 'suspicious', 'other'],
    required: true
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['blindate', 'user', 'message', 'other'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedTo.type'
    }
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'],
    default: 'chờ_xử_lý'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolution: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const SafetyReport = mongoose.model('SafetyReport', safetyReportSchema);

// Schema cho lịch sử vị trí được chia sẻ
const locationShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: String, // Email hoặc số điện thoại của người được chia sẻ
    required: true
  }],
  blindateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blindate',
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },
  trackingCode: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  locations: [{
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const LocationShare = mongoose.model('LocationShare', locationShareSchema);

// Schema cho danh sách địa điểm an toàn được xác minh
const safeLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  type: {
    type: String,
    enum: ['cafe', 'restaurant', 'bar', 'public_space', 'other'],
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  safetyFeatures: {
    hasCCTV: {
      type: Boolean,
      default: false
    },
    hasSecurityStaff: {
      type: Boolean,
      default: false
    },
    isWellLit: {
      type: Boolean,
      default: false
    },
    hasPublicTransport: {
      type: Boolean,
      default: false
    }
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  photos: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SafeLocation = mongoose.model('SafeLocation', safeLocationSchema);

module.exports = {
  SafetyReport,
  LocationShare,
  SafeLocation
};