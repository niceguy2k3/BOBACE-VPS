const mongoose = require('mongoose');

const blindateSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Trạng thái phản hồi của từng người dùng
  userResponses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }],
  // Thông tin cuộc hẹn
  dateDetails: {
    type: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // Thời lượng tính bằng phút
      default: 60
    },
    location: {
      name: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    // Link video call nếu là hẹn hò trực tuyến
    videoCallLink: {
      type: String,
      default: ''
    }
  },
  // Thông tin vote địa điểm
  locationVoting: {
    user1VoteLocation: {
      name: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      votedAt: {
        type: Date,
        default: null
      }
    },
    user2VoteLocation: {
      name: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      votedAt: {
        type: Date,
        default: null
      }
    },
    finalLocation: {
      name: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      confirmedAt: {
        type: Date,
        default: null
      }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'negotiating'],
      default: 'pending'
    },
    chatRoomId: {
      type: String,
      default: ''
    }
  },
  // Đánh giá sau buổi hẹn
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Nhắc nhở đã được gửi chưa
  reminders: {
    dayBefore: {
      type: Boolean,
      default: false
    },
    hourBefore: {
      type: Boolean,
      default: false
    }
  },
  // Ghi chú bổ sung
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Tạo index không unique để tối ưu truy vấn
blindateSchema.index({ users: 1 });
blindateSchema.index({ isActive: 1 });

// Xóa index cũ khi khởi động server
const dropOldIndex = async () => {
  try {
    const Blindate = mongoose.model('Blindate', blindateSchema);
    await Blindate.collection.dropIndex('users_1_isActive_1');
    console.log('Đã xóa index cũ thành công');
  } catch (err) {
    // Nếu index không tồn tại, bỏ qua lỗi
    if (err.code !== 27) {
      console.log('Lỗi khi xóa index:', err);
    }
  }
};

// Thực hiện xóa index sau khi kết nối MongoDB
mongoose.connection.once('open', () => {
  dropOldIndex();
});

const Blindate = mongoose.model('Blindate', blindateSchema);

module.exports = Blindate;