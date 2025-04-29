const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'emoji'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create index for faster queries
messageSchema.index({ matchId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;