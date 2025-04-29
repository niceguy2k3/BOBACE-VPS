const User = require('../models/user.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');
const Message = require('../models/message.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { DEFAULT_PAGE_SIZE } = require('../config/constants');

// Get potential matches (users to swipe)
exports.getPotentialMatches = async (req, res, next) => {
  try {
    const currentUser = req.user;
    
    // Get pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * limit;
    
    // Get filter params
    const minAge = parseInt(req.query.minAge) || currentUser.agePreference?.min || 18;
    const maxAge = parseInt(req.query.maxAge) || currentUser.agePreference?.max || 100;
    const maxDistance = parseInt(req.query.maxDistance) || currentUser.distancePreference || 50; // km
    const teaPreferences = req.query.teaPreferences 
      ? req.query.teaPreferences.split(',') 
      : [];
    const genderPreferences = req.query.gender 
      ? req.query.gender.split(',') 
      : currentUser.interestedIn.length > 0 ? currentUser.interestedIn : ['male', 'female'];
    const minHeight = parseInt(req.query.minHeight) || 0;
    const maxHeight = parseInt(req.query.maxHeight) || 250;
    
    // Get users already liked or disliked
    const interactions = await Like.find({ from: currentUser._id });
    const interactedUserIds = interactions.map(like => like.to);
    
    // Add current user to excluded list
    interactedUserIds.push(currentUser._id);
    
    // Add blocked users to excluded list
    if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
      interactedUserIds.push(...currentUser.blockedUsers);
    }
    
    // Also exclude users who have blocked the current user
    const usersWhoBlockedMe = await User.find({ 
      blockedUsers: { $in: [currentUser._id] } 
    }).select('_id');
    
    if (usersWhoBlockedMe.length > 0) {
      interactedUserIds.push(...usersWhoBlockedMe.map(user => user._id));
    }
    
    // Build query
    const query = {
      _id: { $nin: interactedUserIds },
      birthDate: {
        $lte: new Date(new Date().setFullYear(new Date().getFullYear() - minAge)),
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - maxAge))
      },
      gender: { $in: genderPreferences },
      showInDiscovery: true,
      'settings.privacy.incognitoMode': { $ne: true } // Exclude users in incognito mode
    };
    
    // Add tea preferences filter if provided
    if (teaPreferences.length > 0) {
      query.teaPreferences = { $in: teaPreferences };
    }
    
    // Add height filter if provided
    if (minHeight > 0) {
      query.height = { ...query.height, $gte: minHeight };
    }
    
    if (maxHeight < 250) {
      query.height = { ...query.height, $lte: maxHeight };
    }
    
    // Add geospatial query if user has location
    let geoNearStage = {};
    if (currentUser.location && 
        currentUser.location.coordinates && 
        currentUser.location.coordinates[0] !== 0 && 
        currentUser.location.coordinates[1] !== 0) {
      
      geoNearStage = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          distanceField: 'distance',
          maxDistance: maxDistance * 1000, // convert km to meters
          spherical: true
        }
      };
    }
    
    // Build aggregation pipeline
    const pipeline = [];
    
    // Add geoNear stage if available
    if (Object.keys(geoNearStage).length > 0) {
      pipeline.push(geoNearStage);
    }
    
    // Add match stage
    pipeline.push({ $match: query });
    
    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });
    
    // Add projection to exclude sensitive fields
    pipeline.push({
      $project: {
        password: 0,
        __v: 0
      }
    });
    
    // Execute query
    const usersFromAggregate = await User.aggregate(pipeline);
    
    // Lấy các người dùng từ database để có thể sử dụng phương thức getPublicProfile
    const userIds = usersFromAggregate.map(user => user._id);
    const users = await User.find({ _id: { $in: userIds } });
    
    // Thêm trường verified và trả về
    const usersWithVerified = users.map(user => {
      const publicProfile = user.getPublicProfile();
      return publicProfile;
    });
    
    res.json(usersWithVerified);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    
    // Check for invalid userId values
    if (!userId || userId === 'unknown' || userId === 'undefined') {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    
    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không đúng định dạng' });
    }
    
    // Kiểm tra nếu người dùng hiện tại có vị trí
    const hasCurrentUserLocation = currentUser.location && 
                                  currentUser.location.coordinates && 
                                  currentUser.location.coordinates[0] !== 0 && 
                                  currentUser.location.coordinates[1] !== 0;
    
    // Nếu có vị trí, sử dụng aggregation để tính khoảng cách
    if (hasCurrentUserLocation) {
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: currentUser.location.coordinates
            },
            distanceField: 'distance',
            spherical: true,
            query: { _id: mongoose.Types.ObjectId(userId) }
          }
        }
      ];
      
      const users = await User.aggregate(pipeline);
      
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      // Lấy người dùng từ database để có thể sử dụng phương thức getPublicProfile
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      
      // Thêm trường distance từ kết quả aggregate
      const publicProfile = user.getPublicProfile();
      publicProfile.distance = users[0].distance;
      
      return res.json(publicProfile);
    } 
    
    // Nếu không có vị trí, sử dụng phương thức thông thường
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Error in getUserById:', error);
    // Send a more user-friendly error message
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { 
      fullName, bio, birthDate, gender, teaPreferences, location,
      height, occupation, company, education, school, interests,
      interestedIn, distancePreference, agePreference, showInDiscovery,
      // Thông tin địa chỉ
      address, city,
      // Thông tin về trà sữa
      favoriteTea, teaFrequency, sugarLevel, iceLevel, toppings,
      // Sở thích và thông tin cá nhân
      hobbies, lookingFor, lifestyle, languages, zodiacSign,
      // Bộ sưu tập ảnh
      photos
    } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (birthDate) updateData.birthDate = birthDate;
    if (gender) updateData.gender = gender;
    if (teaPreferences) updateData.teaPreferences = teaPreferences;
    if (location) updateData.location = location;
    if (height) updateData.height = height;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (company !== undefined) updateData.company = company;
    if (education !== undefined) updateData.education = education;
    if (school !== undefined) updateData.school = school;
    if (interests) updateData.interests = interests;
    if (interestedIn) updateData.interestedIn = interestedIn;
    if (distancePreference) updateData.distancePreference = distancePreference;
    if (agePreference) updateData.agePreference = agePreference;
    if (showInDiscovery !== undefined) updateData.showInDiscovery = showInDiscovery;
    
    // Thông tin địa chỉ
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    
    // Thông tin về trà sữa
    if (favoriteTea !== undefined) updateData.favoriteTea = favoriteTea;
    if (teaFrequency !== undefined) updateData.teaFrequency = teaFrequency;
    if (sugarLevel !== undefined) updateData.sugarLevel = sugarLevel;
    if (iceLevel !== undefined) updateData.iceLevel = iceLevel;
    if (toppings) updateData.toppings = toppings;
    
    // Sở thích và thông tin cá nhân
    if (hobbies) updateData.hobbies = hobbies;
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor;
    if (lifestyle) updateData.lifestyle = lifestyle;
    if (languages) updateData.languages = languages;
    if (zodiacSign !== undefined) updateData.zodiacSign = zodiacSign;
    
    // Bộ sưu tập ảnh
    if (photos) updateData.photos = photos;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user.getPublicProfile());
  } catch (error) {
    next(error);
  }
};

// Update user avatar (legacy method - using URL)
exports.updateAvatar = async (req, res, next) => {
  try {
    // This method is kept for backward compatibility
    // New uploads should use the /api/upload/avatar endpoint
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp URL ảnh đại diện' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );
    
    res.json({
      message: 'Cập nhật ảnh đại diện thành công',
      avatar: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

// Block a user
exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ID người dùng cần chặn' });
    }
    
    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Check if user is already blocked
    const currentUser = await User.findById(req.user._id);
    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'Người dùng này đã bị chặn' });
    }
    
    // Add user to blocked list
    currentUser.blockedUsers.push(userId);
    await currentUser.save();
    
    res.json({ 
      message: 'Đã chặn người dùng thành công',
      blockedUsers: currentUser.blockedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Unblock a user
exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ID người dùng cần bỏ chặn' });
    }
    
    // Remove user from blocked list
    const currentUser = await User.findById(req.user._id);
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userId
    );
    
    await currentUser.save();
    
    res.json({ 
      message: 'Đã bỏ chặn người dùng thành công',
      blockedUsers: currentUser.blockedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get blocked users
exports.getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('blockedUsers', 'fullName avatar');
    
    res.json(user.blockedUsers);
  } catch (error) {
    next(error);
  }
};

// Report a user
exports.reportUser = async (req, res, next) => {
  try {
    const { userId, reason, description } = req.body;
    
    // Validate input
    if (!userId || !reason) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp ID người dùng và lý do báo cáo' 
      });
    }
    
    // Check if user exists
    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Create report
    const currentUser = await User.findById(req.user._id);
    
    // Check if already reported
    const alreadyReported = currentUser.reports.some(
      report => report.reportedUser.toString() === userId
    );
    
    if (alreadyReported) {
      return res.status(400).json({ 
        message: 'Bạn đã báo cáo người dùng này trước đó' 
      });
    }
    
    // Add report
    currentUser.reports.push({
      reportedUser: userId,
      reason,
      description: description || '',
      createdAt: new Date(),
      status: 'pending'
    });
    
    await currentUser.save();
    
    res.json({ 
      message: 'Đã gửi báo cáo thành công',
      report: currentUser.reports[currentUser.reports.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// Update user settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { notifications, privacy } = req.body;
    const updateData = { settings: {} };

    // Update notification settings if provided
    if (notifications) {
      updateData.settings.notifications = notifications;
    }

    // Update privacy settings if provided
    if (privacy) {
      updateData.settings.privacy = privacy;
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({
      message: 'Cập nhật cài đặt thành công',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

// Toggle incognito mode
exports.toggleIncognitoMode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra xem người dùng có phải là premium không
    if (!user.premium) {
      return res.status(403).json({ 
        message: 'Chế độ ẩn danh chỉ khả dụng cho người dùng premium',
        isPremiumFeature: true
      });
    }
    
    // Ensure settings structure exists
    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) user.settings.privacy = {};
    
    // Toggle incognito mode
    const currentValue = user.settings.privacy.incognitoMode || false;
    user.settings.privacy.incognitoMode = !currentValue;
    
    await user.save();
    
    res.json({
      message: user.settings.privacy.incognitoMode 
        ? 'Đã bật chế độ ẩn danh' 
        : 'Đã tắt chế độ ẩn danh',
      incognitoMode: user.settings.privacy.incognitoMode
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
    
    // Set new password (will be hashed by pre-save middleware)
    user.password = newPassword;
    
    // Save user
    await user.save();
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};

// Delete account
exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find all matches involving this user
    const matches = await Match.find({ users: userId });
    const matchIds = matches.map(match => match._id);
    
    // Delete all messages in these matches
    await Message.deleteMany({ matchId: { $in: matchIds } });
    
    // Remove user from readBy arrays in all messages they've read
    await Message.updateMany(
      { readBy: userId },
      { $pull: { readBy: userId } }
    );
    
    // Delete all matches
    await Match.deleteMany({ users: userId });
    
    // Delete all likes involving this user
    await Like.deleteMany({ $or: [{ from: userId }, { to: userId }] });
    
    // Remove user from all secret admirers lists
    const SecretAdmirer = require('../models/secretAdmirer.model');
    
    // Find all secret admirer documents where this user is an admirer
    const secretAdmirerDocs = await SecretAdmirer.find({
      'admirers.user': userId
    });
    
    // Remove this user from admirers array in each document
    for (const doc of secretAdmirerDocs) {
      doc.admirers = doc.admirers.filter(admirer => 
        admirer.user.toString() !== userId.toString()
      );
      await doc.save();
    }
    
    // Delete user's own secret admirer document if exists
    await SecretAdmirer.findOneAndDelete({ user: userId });
    
    // Remove user from any notifications or references in other collections
    // This depends on your specific notification system
    // For example, if you have a Notification model:
    // await Notification.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] });
    
    // Finally, delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Tài khoản đã được xóa thành công' });
  } catch (error) {
    next(error);
  }
};