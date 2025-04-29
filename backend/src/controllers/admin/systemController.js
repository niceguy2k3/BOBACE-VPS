const os = require('os');

/**
 * Lấy thống kê hệ thống
 */
exports.getSystemStats = async (req, res) => {
  try {
    // Tạo mock data cho thống kê hệ thống
    const mockStats = {
      server: {
        uptime: os.uptime(),
        memory: {
          total: Math.round(os.totalmem() / (1024 * 1024)),
          free: Math.round(os.freemem() / (1024 * 1024)),
          used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024))
        },
        cpu: {
          usage: Math.floor(Math.random() * 100),
          cores: os.cpus().length
        },
        disk: {
          total: 500,
          used: 250,
          free: 250
        }
      },
      database: {
        size: 250,
        connections: 15,
        queries: {
          total: 15000000,
          perMinute: 250
        }
      },
      api: {
        requests: {
          total: 25000000,
          perMinute: 350
        },
        responseTime: {
          average: 120,
          p95: 350,
          p99: 500
        }
      }
    };

    return res.status(200).json(mockStats);
  } catch (error) {
    console.error('Error in getSystemStats:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thống kê hệ thống' });
  }
};

/**
 * Bật/tắt chế độ bảo trì
 */
exports.toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message, estimatedEndTime } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Trạng thái bảo trì không hợp lệ' });
    }

    // Tạo mock data cho chế độ bảo trì
    const mockMaintenanceMode = {
      enabled,
      message: message || 'Hệ thống đang trong chế độ bảo trì. Vui lòng quay lại sau.',
      estimatedEndTime: estimatedEndTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: req.user._id
    };

    return res.status(200).json({
      message: `Đã ${enabled ? 'bật' : 'tắt'} chế độ bảo trì thành công`,
      maintenanceMode: mockMaintenanceMode
    });
  } catch (error) {
    console.error('Error in toggleMaintenanceMode:', error);
    return res.status(500).json({ message: 'Lỗi server khi bật/tắt chế độ bảo trì' });
  }
};

/**
 * Kiểm tra và cập nhật trạng thái premium của người dùng
 * Hàm này sẽ được gọi bởi cron job hàng ngày
 */
exports.checkPremiumStatus = async (req, res) => {
  try {
    const User = require('../../models/user.model');
    
    // Tìm tất cả người dùng có premium=true và premiumUntil < thời gian hiện tại
    const expiredUsers = await User.find({
      premium: true,
      premiumUntil: { $lt: new Date() }
    });
    
    if (expiredUsers.length === 0) {
      return res.status(200).json({
        message: 'Không có người dùng premium nào hết hạn',
        expiredCount: 0
      });
    }
    
    // Cập nhật trạng thái premium của những người dùng đã hết hạn
    const updatePromises = expiredUsers.map(user => {
      user.premium = false;
      // Giữ lại premiumUntil để biết khi nào hết hạn
      return user.save();
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({
      message: `Đã cập nhật trạng thái premium cho ${expiredUsers.length} người dùng hết hạn`,
      expiredCount: expiredUsers.length,
      expiredUsers: expiredUsers.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        premiumUntil: user.premiumUntil
      }))
    });
  } catch (error) {
    console.error('Error in checkPremiumStatus:', error);
    return res.status(500).json({ message: 'Lỗi server khi kiểm tra trạng thái premium' });
  }
};

/**
 * Lấy log hệ thống
 */
exports.getSystemLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      level = '', 
      sort = 'timestamp', 
      order = 'desc' 
    } = req.query;

    // Tạo mock data cho log hệ thống
    const mockLogs = [];
    const logLevels = ['info', 'warn', 'error', 'debug'];
    
    for (let i = 0; i < 100; i++) {
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      let message;
      
      switch (level) {
        case 'info':
          message = `Thông tin hệ thống: Người dùng đăng nhập thành công (ID: user_${i + 1})`;
          break;
        case 'warn':
          message = `Cảnh báo: Nhiều lần đăng nhập thất bại từ IP 192.168.1.${i % 255}`;
          break;
        case 'error':
          message = `Lỗi: Không thể kết nối đến cơ sở dữ liệu (Mã lỗi: ERR_${i + 1000})`;
          break;
        case 'debug':
          message = `Debug: Thời gian phản hồi API: ${Math.floor(Math.random() * 500)}ms`;
          break;
        default:
          message = `Log hệ thống ${i + 1}`;
      }
      
      mockLogs.push({
        _id: `log_${i + 1}`,
        level,
        message,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        source: ['api', 'database', 'auth', 'system'][Math.floor(Math.random() * 4)],
        details: {
          ip: `192.168.1.${i % 255}`,
          user: Math.random() > 0.5 ? `user_${i + 1}` : null,
          endpoint: Math.random() > 0.5 ? `/api/endpoint/${i + 1}` : null
        }
      });
    }

    // Lọc theo level nếu có
    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = mockLogs.filter(log => log.level === level);
    }

    // Sắp xếp
    filteredLogs.sort((a, b) => {
      if (order === 'asc') {
        return new Date(a[sort]) - new Date(b[sort]);
      } else {
        return new Date(b[sort]) - new Date(a[sort]);
      }
    });

    // Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return res.status(200).json({
      logs: paginatedLogs,
      pagination: {
        total: filteredLogs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredLogs.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getSystemLogs:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy log hệ thống' });
  }
};