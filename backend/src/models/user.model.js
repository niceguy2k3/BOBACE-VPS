const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'transgender', 'genderqueer', 'genderfluid', 'agender', 'other'],
    required: true
  },
  interestedIn: {
    type: [String],
    enum: ['male', 'female', 'non-binary', 'transgender', 'genderqueer', 'genderfluid', 'agender', 'other'],
    default: []
  },
  avatar: {
    type: String,
    default: ''
  },
  photos: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  // Thông tin địa chỉ chi tiết
  address: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  teaPreferences: {
    type: [String],
    default: []
  },
  // Thông tin về trà sữa
  favoriteTea: {
    type: String,
    default: '',
    trim: true
  },
  teaFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'rarely', ''],
    default: ''
  },
  sugarLevel: {
    type: String,
    enum: ['0%', '25%', '50%', '75%', '100%', ''],
    default: ''
  },
  iceLevel: {
    type: String,
    enum: ['0%', '25%', '50%', '75%', '100%', ''],
    default: ''
  },
  toppings: {
    type: [String],
    default: []
  },
  // Thông tin cơ bản
  height: {
    type: Number,
    min: 140,
    max: 220
  },

  // Thông tin nghề nghiệp
  occupation: {
    type: String,
    trim: true,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  school: {
    type: String,
    trim: true,
    default: ''
  },
  // Sở thích và thông tin cá nhân
  interests: {
    type: [String],
    default: []
  },
  hobbies: {
    type: [String],
    default: []
  },
  lookingFor: {
    type: String,
    enum: ['relationship', 'friendship', 'casual', 'marriage', 'not-sure', ''],
    default: ''
  },
  lifestyle: {
    smoking: {
      type: String,
      enum: ['never', 'sometimes', 'often', 'quitting', ''],
      default: ''
    },
    drinking: {
      type: String,
      enum: ['never', 'sometimes', 'often', 'quitting', ''],
      default: ''
    },
    exercise: {
      type: String,
      enum: ['never', 'sometimes', 'often', 'daily', ''],
      default: ''
    },
    diet: {
      type: String,
      enum: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'other', ''],
      default: ''
    }
  },
  // Thông tin khác
  languages: {
    type: [String],
    default: []
  },
  zodiacSign: {
    type: String,
    enum: ['Bạch Dương', 'Kim Ngưu', 'Song Tử', 'Cự Giải', 'Sư Tử', 'Xử Nữ', 
           'Thiên Bình', 'Bọ Cạp', 'Nhân Mã', 'Ma Kết', 'Bảo Bình', 'Song Ngư', ''],
    default: ''
  },
  premium: {
    type: Boolean,
    default: false
  },
  premiumUntil: {
    type: Date,
    default: null
  },
  dailyLikes: {
    count: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationTokenExpires: {
    type: Date,
    default: null
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['', 'phone', 'email', 'government_id', 'social_media', 'selfie'],
      default: ''
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    selfiePhoto: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['', 'pending', 'verified', 'rejected'],
      default: ''
    },
    documents: [{
      type: {
        type: String,
        enum: ['id_card', 'passport', 'driving_license', 'other'],
        required: true
      },
      documentNumber: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  banned: {
    type: Boolean,
    default: false
  },
  bannedReason: {
    type: String,
    default: ''
  },
  bannedAt: {
    type: Date,
    default: null
  },
  showInDiscovery: {
    type: Boolean,
    default: true
  },
  distancePreference: {
    type: Number,
    default: 50,
    min: 1,
    max: 100
  },
  agePreference: {
    min: {
      type: Number,
      default: 18,
      min: 18,
      max: 100
    },
    max: {
      type: Number,
      default: 100,
      min: 18,
      max: 100
    }
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  online: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    notifications: {
      newMatches: {
        type: Boolean,
        default: true
      },
      newMessages: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      allowLocationSearch: {
        type: Boolean,
        default: true
      },
      incognitoMode: {
        type: Boolean,
        default: false
      }
    }
  },
  reports: [{
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['fake_profile', 'inappropriate_content', 'harassment', 'spam', 'other'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Add index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Add pagination plugin
userSchema.plugin(mongoosePaginate);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's age
userSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Method to get public profile (without sensitive info)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  
  delete userObject.password;
  delete userObject.__v;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationTokenExpires;
  
  // Thêm trường verified dựa trên trạng thái xác minh
  userObject.verified = this.verification && this.verification.verificationStatus === 'verified';
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;