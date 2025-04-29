const mongoose = require('mongoose');

const negotiationChatSchema = new mongoose.Schema({
  blindateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blindate',
    required: true
  },
  chatRoomId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isSystemMessage: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
negotiationChatSchema.index({ blindateId: 1 });
negotiationChatSchema.index({ chatRoomId: 1 }, { unique: true });

const NegotiationChat = mongoose.model('NegotiationChat', negotiationChatSchema);

module.exports = NegotiationChat;