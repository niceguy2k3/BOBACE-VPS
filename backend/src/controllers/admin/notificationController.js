const mongoose = require('mongoose');
const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');

/**
 * Lấy danh sách thông báo với phân trang và lọc
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type = '', 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Tạo mock data cho thông báo
    let mockNotifications = [];
    const notificationTypes = ['system', 'user', 'match', 'blindate', 'message', 'report'];
    
    // Thêm các thông báo hệ thống đã lưu (nếu có)
    if (global.systemNotifications && global.systemNotifications.length > 0) {
      mockNotifications = [...global.systemNotifications];
    }

    // Lọc theo loại thông báo nếu có
    let filteredNotifications = mockNotifications;
    if (type) {
      filteredNotifications = mockNotifications.filter(notification => notification.type === type);
    }

    // Sắp xếp
    filteredNotifications.sort((a, b) => {
      if (order === 'asc') {
        return new Date(a[sort]) - new Date(b[sort]);
      } else {
        return new Date(b[sort]) - new Date(a[sort]);
      }
    });

    // Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    return res.status(200).json({
      notifications: paginatedNotifications,
      pagination: {
        total: filteredNotifications.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredNotifications.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllNotifications:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách thông báo' });
  }
};

/**
 * Tạo thông báo mới
 */
exports.createNotification = async (req, res) => {
  try {
    const { type, text, users, sendToAll, linkTo = '/' } = req.body;

    if (!type || !text) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Tạo mock data cho thông báo mới
    const mockNotification = {
      _id: `notification_${Date.now()}`,
      type,
      text,
      users: sendToAll ? 'all' : users,
      sendToAll,
      linkTo,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json({
      message: 'Tạo thông báo thành công',
      notification: mockNotification
    });
  } catch (error) {
    console.error('Error in createNotification:', error);
    return res.status(500).json({ message: 'Lỗi server khi tạo thông báo' });
  }
};

/**
 * Xóa thông báo
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    return res.status(200).json({
      message: 'Xóa thông báo thành công',
      id
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return res.status(500).json({ message: 'Lỗi server khi xóa thông báo' });
  }
};

/**
 * Gửi thông báo hệ thống tới tất cả người dùng
 */
exports.sendSystemNotification = async (req, res) => {
  try {
    const { title, message, linkTo = '/' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (tiêu đề và nội dung)' });
    }

    // Tạo ID duy nhất cho thông báo (không sử dụng làm MongoDB ObjectId)
    // Sử dụng một định danh duy nhất không phải là ObjectId
    const uniqueId = Date.now().toString();
    const currentTime = new Date();
    
    // Tạo thông báo hệ thống
    const systemNotification = {
      systemId: uniqueId, // Sử dụng systemId thay vì _id
      type: 'system',
      title,
      content: message, // Sử dụng content để phù hợp với model
      text: message,    // Thêm text để tương thích với frontend
      recipients: 'all',
      linkTo,
      read: false,
      createdAt: currentTime.toISOString(),
      updatedAt: currentTime.toISOString(),
      sentBy: req.user ? req.user._id : 'admin',
      sentToAll: true,
      status: 'sent',
      recipientCount: 1000 // Giả định có 1000 người dùng
    };

    // Khởi tạo mảng thông báo hệ thống nếu chưa tồn tại
    if (!global.systemNotifications) {
      global.systemNotifications = [];
    }
    
    // Kiểm tra xem thông báo này đã tồn tại chưa (tránh trùng lặp)
    const isDuplicate = global.systemNotifications.some(
      notification => notification.title === title && notification.content === message
    );
    
    if (!isDuplicate) {
      // Thêm thông báo mới vào đầu mảng
      global.systemNotifications.unshift(systemNotification);
      
      // Giới hạn số lượng thông báo lưu trong bộ nhớ
      if (global.systemNotifications.length > 100) {
        global.systemNotifications = global.systemNotifications.slice(0, 100);
      }
      
      // Log để debug
      console.log(`Đã gửi thông báo hệ thống: "${title}"`);
      console.log(`Số lượng thông báo hệ thống hiện tại: ${global.systemNotifications.length}`);
    } else {
      console.log(`Bỏ qua thông báo trùng lặp: "${title}"`);
    }

    // Trả về thông báo đã tạo
    return res.status(201).json({
      success: true,
      message: isDuplicate ? 'Thông báo tương tự đã tồn tại' : 'Đã gửi thông báo hệ thống tới tất cả người dùng',
      notification: systemNotification
    });
  } catch (error) {
    console.error('Error in sendSystemNotification:', error);
    return res.status(500).json({ message: 'Lỗi server khi gửi thông báo hệ thống' });
  }
};