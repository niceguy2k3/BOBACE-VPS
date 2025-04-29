const NegotiationChat = require('../models/negotiation-chat.model');
const Blindate = require('../models/blindate.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const socketIO = require('../socket');
const { createNotification } = require('../utils/notification-helper');

// Lấy tin nhắn trong phòng chat
exports.getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req;

    // Kiểm tra xem phòng chat có tồn tại không
    const chatRoom = await NegotiationChat.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(chatRoom.blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập phòng chat này' });
    }

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);
    
    // Chuyển đổi tin nhắn để ẩn danh
    const anonymizedMessages = chatRoom.messages.map(msg => {
      const isSender = msg.sender.toString() === userId;
      return {
        id: msg._id,
        sender: isSender ? 'Bạn' : 'Bạn Hữu Duyên',
        content: msg.content,
        timestamp: msg.timestamp,
        isSystemMessage: msg.isSystemMessage,
        isSender
      };
    });

    return res.status(200).json({
      chatRoomId: chatRoom.chatRoomId,
      messages: anonymizedMessages,
      status: chatRoom.status
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    // Kiểm tra xem phòng chat có tồn tại không
    const chatRoom = await NegotiationChat.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Kiểm tra xem phòng chat có đang hoạt động không
    if (chatRoom.status !== 'active') {
      return res.status(400).json({ message: 'Phòng chat đã đóng' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(chatRoom.blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền gửi tin nhắn trong phòng chat này' });
    }

    // Thêm tin nhắn mới
    const newMessage = {
      sender: userId,
      content,
      timestamp: new Date(),
      isSystemMessage: false
    };

    chatRoom.messages.push(newMessage);
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    // Lấy thông tin người dùng khác trong blindate
    const otherUserId = blindate.users.find(id => id.toString() !== userId);

    // Gửi thông báo cho người dùng khác
    await createNotification({
      recipient: otherUserId,
      sender: userId,
      type: 'chat_message',
      content: 'Bạn có tin nhắn mới trong cuộc thương lượng địa điểm',
      reference: {
        type: 'blindate',
        id: blindate._id
      }
    });

    // Gửi tin nhắn qua socket.io
    const io = socketIO.getIO();
    io.to(chatRoomId).emit('new_message', {
      id: newMessage._id,
      sender: 'Bạn Hữu Duyên',
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      isSystemMessage: newMessage.isSystemMessage,
      isSender: false
    });

    // Trả về tin nhắn đã gửi
    return res.status(201).json({
      id: newMessage._id,
      sender: 'Bạn',
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      isSystemMessage: newMessage.isSystemMessage,
      isSender: true
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Lấy thông tin phòng chat
exports.getChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req;

    // Kiểm tra xem phòng chat có tồn tại không
    const chatRoom = await NegotiationChat.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(chatRoom.blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập phòng chat này' });
    }

    return res.status(200).json({
      chatRoomId: chatRoom.chatRoomId,
      blindateId: chatRoom.blindateId,
      status: chatRoom.status,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt
    });
  } catch (error) {
    console.error('Error fetching chat room:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đóng phòng chat
exports.closeChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { userId } = req;

    // Kiểm tra xem phòng chat có tồn tại không
    const chatRoom = await NegotiationChat.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chat' });
    }

    // Lấy thông tin blindate
    const blindate = await Blindate.findById(chatRoom.blindateId);
    if (!blindate) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin cuộc hẹn' });
    }

    // Kiểm tra xem người dùng có phải là thành viên của blindate không
    if (!blindate.users.includes(userId)) {
      return res.status(403).json({ message: 'Bạn không có quyền đóng phòng chat này' });
    }

    // Đóng phòng chat
    chatRoom.status = 'closed';
    chatRoom.updatedAt = new Date();
    await chatRoom.save();

    // Thêm tin nhắn hệ thống
    const systemMessage = {
      sender: userId,
      content: 'Phòng chat đã được đóng',
      timestamp: new Date(),
      isSystemMessage: true
    };

    chatRoom.messages.push(systemMessage);
    await chatRoom.save();

    // Gửi thông báo qua socket.io
    const io = socketIO.getIO();
    io.to(chatRoomId).emit('chat_closed', {
      chatRoomId,
      message: 'Phòng chat đã được đóng'
    });

    return res.status(200).json({ message: 'Đã đóng phòng chat thành công' });
  } catch (error) {
    console.error('Error closing chat room:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};