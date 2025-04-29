const Message = require('../models/message.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const socketModule = require('../socket');
const notificationController = require('./notification.controller');

// Get messages for a match
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.matchId;
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    if (!match.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem tin nhắn của match này' });
    }
    
    // Get messages
    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        matchId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Create a new message
exports.createMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.matchId;
    const { content, messageType, imageUrl } = req.body;
    
    // Validate input based on message type
    if (messageType === 'image') {
      if (!imageUrl) {
        return res.status(400).json({ message: 'URL hình ảnh không được để trống' });
      }
    } else {
      // For text and emoji messages
      if (!content) {
        return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
      }
    }
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    if (!match.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền gửi tin nhắn trong match này' });
    }
    
    // Check if the other user has blocked the sender
    const otherUserId = match.users.find(id => id.toString() !== userId.toString());
    const otherUser = await User.findById(otherUserId);
    
    if (otherUser.blockedUsers && otherUser.blockedUsers.includes(userId)) {
      return res.status(403).json({ message: 'Không thể gửi tin nhắn cho người dùng này' });
    }
    
    // Check if sender has blocked the recipient
    const currentUser = await User.findById(userId);
    if (currentUser.blockedUsers && currentUser.blockedUsers.includes(otherUserId)) {
      return res.status(403).json({ message: 'Bạn đã chặn người dùng này' });
    }
    
    // Create message object based on message type
    const messageData = {
      matchId,
      sender: userId,
      readBy: [userId], // Mark as read by sender
      messageType: messageType || 'text'
    };
    
    // Add content or imageUrl based on message type
    if (messageType === 'image') {
      messageData.imageUrl = imageUrl;
    } else {
      messageData.content = content;
    }
    
    // Create message
    const message = await Message.create(messageData);
    
    // Populate sender information for the response
    const populatedMessage = await Message.findById(message._id).populate({
      path: 'sender',
      select: '_id fullName avatar'
    });
    
    // Update match with last message
    await Match.findByIdAndUpdate(matchId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });
    
    // Get sender details for the notification
    const sender = await User.findById(userId).select('_id fullName avatar');
    
    // Send realtime notification to the other user
    try {
      const io = socketModule.getIO();
      
      // Emit to the match room for all connected clients
      io.to(matchId).emit('newMessage', populatedMessage);
      
      if (otherUserId) {
        // Emit to the other user's personal room
        io.to(`user_${otherUserId}`).emit('newMessage', {
          matchId,
          message: populatedMessage,
          sender: userId,
          senderDetails: sender,
          content: messageData.content || '',
          imageUrl: messageData.imageUrl || '',
          messageType: messageData.messageType,
          createdAt: new Date()
        });
        
        // Tạo thông báo cho người nhận
        await notificationController.createNotification(otherUserId, {
          text: `${sender.fullName} đã gửi cho bạn một tin nhắn mới`,
          type: 'message',
          linkTo: `/chat/${matchId}`
        });
        
        // Gửi thông báo qua socket
        io.to(`user_${otherUserId}`).emit('newNotification', { type: 'message' });
      }
    } catch (error) {
      console.error('Socket error when sending message notification:', error);
    }
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

// Mark message as read
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.id;
    
    // Find message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
    }
    
    // Check if user is part of the match
    const match = await Match.findById(message.matchId);
    
    if (!match || !match.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh dấu tin nhắn này' });
    }
    
    // Mark as read
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }
    
    res.json({ message: 'Đã đánh dấu tin nhắn là đã đọc' });
  } catch (error) {
    next(error);
  }
};

// Mark all messages in a match as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matchId = req.params.matchId;
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Không tìm thấy match' });
    }
    
    if (!match.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh dấu tin nhắn trong match này' });
    }
    
    // Mark all messages as read
    await Message.updateMany(
      { 
        matchId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.json({ message: 'Đã đánh dấu tất cả tin nhắn là đã đọc' });
  } catch (error) {
    next(error);
  }
};

// Get unread messages count
exports.getUnreadMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find all matches for this user
    const matches = await Match.find({ users: userId })
      .populate('users', '_id fullName avatar')
      .populate('lastMessage');
    
    // Get unread messages for each match
    const unreadMessages = [];
    
    for (const match of matches) {
      // Count unread messages
      const count = await Message.countDocuments({
        matchId: match._id,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      });
      
      if (count > 0) {
        // Get the other user in the match
        const otherUser = match.users.find(user => user._id.toString() !== userId.toString());
        
        // Get the last message content
        const lastMessage = match.lastMessage ? match.lastMessage.content : '';
        
        unreadMessages.push({
          matchId: match._id,
          count,
          lastMessage,
          user: otherUser
        });
      }
    }
    
    res.json(unreadMessages);
  } catch (error) {
    next(error);
  }
};