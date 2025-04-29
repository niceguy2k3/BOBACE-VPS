const Like = require('../models/like.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const { addSecretAdmirer } = require('./secretAdmirer.controller');
const socketModule = require('../socket');
const notificationController = require('./notification.controller');

// Các hằng số cho giới hạn lượt thích
const DAILY_LIKE_LIMIT = 50; // Giới hạn 50 lượt thích mỗi ngày
const RESET_INTERVAL = 8 * 60 * 60 * 1000; // 8 giờ tính bằng milliseconds

// Hàm lấy thông tin giới hạn lượt thích
exports.getLikesLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Nếu người dùng là premium, không có giới hạn
    if (user.premium) {
      return res.json({
        premium: true,
        unlimited: true,
        message: 'Bạn là thành viên Premium và có lượt thích không giới hạn!'
      });
    }
    
    // Kiểm tra xem đã đến thời gian reset chưa
    const now = new Date();
    
    // Đảm bảo trường dailyLikes tồn tại
    if (!user.dailyLikes) {
      user.dailyLikes = {
        count: 0,
        lastReset: now
      };
      await user.save();
    }
    
    const lastReset = user.dailyLikes.lastReset || new Date(0);
    const timeSinceLastReset = now - lastReset;
    
    let likesUsed = user.dailyLikes.count || 0;
    let nextResetTime = new Date(lastReset.getTime() + RESET_INTERVAL);
    
    // Nếu đã đến thời gian reset, cập nhật lại thông tin
    if (timeSinceLastReset >= RESET_INTERVAL) {
      likesUsed = 0;
      nextResetTime = new Date(now.getTime() + RESET_INTERVAL);
      
      // Cập nhật trong database
      user.dailyLikes = {
        count: 0,
        lastReset: now
      };
      await user.save();
    }
    
    // Tính thời gian còn lại đến lần reset tiếp theo
    const timeUntilReset = Math.max(0, nextResetTime - now);
    const hoursUntilReset = Math.floor(timeUntilReset / (60 * 60 * 1000));
    const minutesUntilReset = Math.floor((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));
    
    res.json({
      premium: false,
      likesUsed,
      likesLimit: DAILY_LIKE_LIMIT,
      likesRemaining: Math.max(0, DAILY_LIKE_LIMIT - likesUsed),
      nextResetTime,
      timeUntilReset: {
        hours: hoursUntilReset,
        minutes: minutesUntilReset,
        formatted: `${hoursUntilReset}h ${minutesUntilReset}m`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create like or dislike
exports.createLike = async (req, res, next) => {
  try {
    const { to, type } = req.body;
    const from = req.user._id;
    
    // Validate input
    if (!to || !type) {
      return res.status(400).json({ message: 'Thiếu thông tin người dùng hoặc loại tương tác' });
    }
    
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Loại tương tác không hợp lệ' });
    }
    
    // Check if user is trying to like themselves
    if (to.toString() === from.toString()) {
      return res.status(400).json({ message: 'Không thể tương tác với chính mình' });
    }
    
    // Check if the target user has blocked the current user
    const targetUser = await User.findById(to);
    if (targetUser.blockedUsers && targetUser.blockedUsers.includes(from)) {
      return res.status(403).json({ message: 'Không thể tương tác với người dùng này' });
    }
    
    // Check if current user has blocked the target user
    const currentUser = await User.findById(from);
    if (currentUser.blockedUsers && currentUser.blockedUsers.includes(to)) {
      return res.status(403).json({ message: 'Bạn đã chặn người dùng này' });
    }
    
    // Kiểm tra giới hạn lượt thích nếu là like và không phải premium
    if (type === 'like' && !currentUser.premium) {
      try {
        const now = new Date();
        // Đảm bảo trường dailyLikes tồn tại
        if (!currentUser.dailyLikes) {
          currentUser.dailyLikes = {
            count: 0,
            lastReset: now
          };
        }
        
        const lastReset = currentUser.dailyLikes.lastReset || new Date(0);
        const timeSinceLastReset = now - lastReset;
        
        // Kiểm tra xem đã đến thời gian reset chưa
        if (timeSinceLastReset >= RESET_INTERVAL) {
          // Reset lượt thích
          currentUser.dailyLikes = {
            count: 1, // Tính cả lượt thích hiện tại
            lastReset: now
          };
          await currentUser.save();
        } else {
          // Kiểm tra xem đã đạt giới hạn chưa
          const currentCount = currentUser.dailyLikes.count || 0;
          
          if (currentCount >= DAILY_LIKE_LIMIT) {
            return res.status(403).json({ 
              message: 'Bạn đã đạt giới hạn lượt thích hôm nay. Nâng cấp Premium để có lượt thích không giới hạn!',
              likesUsed: currentCount,
              likesLimit: DAILY_LIKE_LIMIT,
              nextResetTime: new Date(lastReset.getTime() + RESET_INTERVAL)
            });
          }
          
          // Tăng số lượt thích
          currentUser.dailyLikes.count = currentCount + 1;
          await currentUser.save();
        }
      } catch (error) {
        console.error('Error handling like limits:', error);
        // Không trả về lỗi ở đây, cho phép tiếp tục xử lý like
      }
    }
    
    // Check if like/dislike already exists
    const existingLike = await Like.findOne({ from, to });
    
    if (existingLike) {
      // Update existing like
      existingLike.type = type;
      await existingLike.save();
    } else {
      // Create new like
      await Like.create({ from, to, type });
    }
    
    // Check for match if this is a like
    let isMatch = false;
    let matchId = null;
    
    if (type === 'like') {
      // Add to secret admirers
      await addSecretAdmirer(to, from);
      
      // Send realtime notification to the user who was liked
      try {
        // Get admirer count for the user who was liked
        const SecretAdmirer = require('../models/secretAdmirer.model');
        const secretAdmirer = await SecretAdmirer.findOne({ user: to })
          .populate({
            path: 'admirers.user',
            select: '_id'
          });
        
        if (secretAdmirer) {
          const count = secretAdmirer.admirers.filter(
            admirer => !admirer.revealed && admirer.user
          ).length;
          
          // Emit event to the user's personal room
          try {
            const io = socketModule.getIO();
            io.to(`user_${to}`).emit('newAdmirer', { count });
          } catch (error) {
            console.error('Socket not initialized yet:', error);
          }
        }
      } catch (error) {
        console.error('Error sending admirer notification:', error);
      }
      
      // Check if the other user has liked this user
      const otherLike = await Like.findOne({
        from: to,
        to: from,
        type: 'like'
      });
      
      if (otherLike) {
        isMatch = true;
        
        // Create a match
        const newMatch = await Match.create({
          users: [from, to]
        });
        
        matchId = newMatch._id;
        
        // Tạo thông báo cho cả hai người dùng về match mới
        try {
          // Lấy thông tin người dùng để hiển thị trong thông báo
          const currentUserInfo = await User.findById(from, 'fullName');
          const otherUserInfo = await User.findById(to, 'fullName');
          
          // Tạo thông báo cho người dùng hiện tại
          await notificationController.createNotification(from, {
            text: `Bạn đã match với ${otherUserInfo.fullName}! Hãy bắt đầu cuộc trò chuyện ngay.`,
            type: 'match',
            linkTo: `/chat/${matchId}`
          });
          
          // Tạo thông báo cho người dùng kia
          await notificationController.createNotification(to, {
            text: `Bạn đã match với ${currentUserInfo.fullName}! Hãy bắt đầu cuộc trò chuyện ngay.`,
            type: 'match',
            linkTo: `/chat/${matchId}`
          });
          
          // Gửi thông báo qua socket
          try {
            const io = socketModule.getIO();
            io.to(`user_${from}`).emit('newNotification', { type: 'match' });
            io.to(`user_${to}`).emit('newNotification', { type: 'match' });
          } catch (error) {
            console.error('Socket not initialized yet:', error);
          }
        } catch (error) {
          console.error('Error creating match notifications:', error);
        }
        
        // Remove from secret admirers when matched
        try {
          const SecretAdmirer = require('../models/secretAdmirer.model');
          
          // Remove the current user from the other user's secret admirers
          const otherUserAdmirers = await SecretAdmirer.findOne({ user: to });
          if (otherUserAdmirers) {
            // Mark as revealed or remove
            const admirerIndex = otherUserAdmirers.admirers.findIndex(
              admirer => admirer.user.toString() === from.toString()
            );
            
            if (admirerIndex !== -1) {
              otherUserAdmirers.admirers[admirerIndex].revealed = true;
              await otherUserAdmirers.save();
              
              // Send updated count notification
              const count = otherUserAdmirers.admirers.filter(
                admirer => !admirer.revealed && admirer.user
              ).length;
              
              try {
                const io = socketModule.getIO();
                io.to(`user_${to}`).emit('newAdmirer', { count });
              } catch (error) {
                console.error('Socket not initialized yet:', error);
              }
            }
          }
          
          // Also remove the other user from current user's secret admirers if exists
          const currentUserAdmirers = await SecretAdmirer.findOne({ user: from });
          if (currentUserAdmirers) {
            const admirerIndex = currentUserAdmirers.admirers.findIndex(
              admirer => admirer.user.toString() === to.toString()
            );
            
            if (admirerIndex !== -1) {
              currentUserAdmirers.admirers[admirerIndex].revealed = true;
              await currentUserAdmirers.save();
              
              // Send updated count notification
              const count = currentUserAdmirers.admirers.filter(
                admirer => !admirer.revealed && admirer.user
              ).length;
              
              try {
                const io = socketModule.getIO();
                io.to(`user_${from}`).emit('newAdmirer', { count });
              } catch (error) {
                console.error('Socket not initialized yet:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error updating secret admirers after match:', error);
        }
      }
    }
    
    // Lấy thông tin giới hạn lượt thích nếu người dùng không phải premium
    let likesInfo = {};
    if (type === 'like' && !currentUser.premium) {
      
      likesInfo = {
        likesUsed: currentUser.dailyLikes?.count || 0,
        likesLimit: DAILY_LIKE_LIMIT,
        nextResetTime: new Date(currentUser.dailyLikes?.lastReset.getTime() + RESET_INTERVAL)
      };
    }
    
    res.status(201).json({
      message: type === 'like' ? 'Đã thích người dùng' : 'Đã bỏ qua người dùng',
      isMatch,
      matchId,
      ...likesInfo
    });
  } catch (error) {
    next(error);
  }
};