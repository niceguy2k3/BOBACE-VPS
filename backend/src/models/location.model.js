const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  type: {
    type: String,
    enum: ['cafe', 'restaurant', 'bar', 'public_space', 'mall', 'park', 'other'],
    default: 'cafe'
  },
  description: {
    type: String,
    default: ''
  },
  photos: [{
    type: String
  }],
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
  safetyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isSafe: {
    type: Boolean,
    default: true
  },
  safetyReports: [{
    type: Schema.Types.ObjectId,
    ref: 'SafetyReport'
  }],
  adminNotes: [{
    note: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Đánh index cho tọa độ để tìm kiếm địa lý
locationSchema.index({ 'coordinates.coordinates': '2dsphere' });

// Đánh index cho tên và địa chỉ để tìm kiếm nhanh
locationSchema.index({ name: 'text', address: 'text' });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;