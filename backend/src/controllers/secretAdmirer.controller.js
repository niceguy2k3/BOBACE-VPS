const SecretAdmirer = require('../models/secretAdmirer.model');
const User = require('../models/user.model');
const notificationController = require('./notification.controller');
const socketModule = require('../socket');

// Get secret admirers count
exports.getSecretAdmirersCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find or create secret admirer document
    let secretAdmirer = await SecretAdmirer.findOne({ user: userId })
      .populate({
        path: 'admirers.user',
        select: '_id'
      });
    
    if (!secretAdmirer) {
      secretAdmirer = new SecretAdmirer({ user: userId, admirers: [] });
      await secretAdmirer.save();
    }
    
    // Clean up any admirers with deleted users
    const hasDeletedUsers = secretAdmirer.admirers.some(admirer => !admirer.user);
    if (hasDeletedUsers) {
      secretAdmirer.admirers = secretAdmirer.admirers.filter(admirer => admirer.user);
      await secretAdmirer.save();
    }
    
    // Get count of unrevealed admirers with existing users
    const count = secretAdmirer.admirers.filter(
      admirer => !admirer.revealed && admirer.user
    ).length;
    
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// Get blurred preview of secret admirers
exports.getSecretAdmirersPreview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find secret admirer document
    const secretAdmirer = await SecretAdmirer.findOne({ user: userId })
      .populate({
        path: 'admirers.user',
        select: 'avatar'
      });
    
    if (!secretAdmirer) {
      return res.json({ admirers: [] });
    }
    
    // Get unrevealed admirers with blurred avatars
    // Only include admirers whose user still exists (not null)
    const admirers = secretAdmirer.admirers
      .filter(admirer => !admirer.revealed && admirer.user)
      .map(admirer => ({
        id: admirer._id,
        blurredAvatar: admirer.user.avatar || '/default-avatar-blurred.jpg'
      }));
    
    // Clean up any admirers with deleted users
    const hasDeletedUsers = secretAdmirer.admirers.some(admirer => !admirer.user);
    if (hasDeletedUsers) {
      secretAdmirer.admirers = secretAdmirer.admirers.filter(admirer => admirer.user);
      await secretAdmirer.save();
    }
    
    res.json({ admirers });
  } catch (error) {
    next(error);
  }
};

// Reveal secret admirer (premium feature)
exports.revealSecretAdmirer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const admirerId = req.params.id;
    
    // Check if user is premium
    const user = await User.findById(userId);
    if (!user.premium) {
      return res.status(403).json({ message: 'Người đó đang thích bạn trong bí mật! Hãy khám phá xem người đó là ai' });
    }
    
    // Find secret admirer document
    const secretAdmirer = await SecretAdmirer.findOne({ user: userId });
    
    if (!secretAdmirer) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu người thích' });
    }
    
    // Find the specific admirer
    const admirer = secretAdmirer.admirers.id(admirerId);
    
    if (!admirer) {
      return res.status(404).json({ message: 'Không tìm thấy người thích này' });
    }
    
    // Check if the admirer user still exists
    const admirerUser = await User.findById(admirer.user);
    
    if (!admirerUser) {
      // Remove this admirer since the user no longer exists
      secretAdmirer.admirers = secretAdmirer.admirers.filter(
        a => a._id.toString() !== admirerId.toString()
      );
      await secretAdmirer.save();
      
      return res.status(404).json({ 
        message: 'Người dùng này đã xóa tài khoản hoặc không còn tồn tại' 
      });
    }
    
    // Mark as revealed
    admirer.revealed = true;
    await secretAdmirer.save();
    
    res.json({
      admirer: admirerUser.getPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

// Add secret admirer when someone likes a user
exports.addSecretAdmirer = async (userId, admirerId) => {
  try {
    // Find or create secret admirer document
    let secretAdmirer = await SecretAdmirer.findOne({ user: userId });
    
    if (!secretAdmirer) {
      secretAdmirer = new SecretAdmirer({ user: userId, admirers: [] });
    }
    
    // Check if this admirer already exists
    const existingAdmirer = secretAdmirer.admirers.find(
      admirer => admirer.user.toString() === admirerId.toString()
    );
    
    if (!existingAdmirer) {
      // Add new admirer
      secretAdmirer.admirers.push({
        user: admirerId,
        createdAt: new Date(),
        revealed: false
      });
      
      // Tạo thông báo cho người được thích
      try {
        const admirer = await User.findById(admirerId, 'fullName');
        
        await notificationController.createNotification(userId, {
          text: `Người đó đang thích bạn trong bí mật! Hãy khám phá xem người đó là ai`,
          type: 'admirer',
          linkTo: `/admirers`
        });
        
        // Gửi thông báo qua socket
        try {
          const io = socketModule.getIO();
          io.to(`user_${userId}`).emit('newNotification', { type: 'admirer' });
        } catch (error) {
          console.error('Socket not initialized yet:', error);
        }
      } catch (error) {
        console.error('Error creating admirer notification:', error);
      }
      
      await secretAdmirer.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error adding secret admirer:', error);
    return false;
  }
};