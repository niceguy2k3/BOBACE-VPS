const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure uniqueness and for faster queries
likeSchema.index({ from: 1, to: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;