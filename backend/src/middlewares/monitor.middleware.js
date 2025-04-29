/**
 * Middleware giám sát hệ thống
 * Cung cấp giao diện web để theo dõi hiệu suất hệ thống
 */
const statusMonitor = require('express-status-monitor')({
  title: 'BOBACE API Status',
  path: '/status',
  spans: [
    {
      interval: 1,     // Mỗi 1 giây
      retention: 60    // Giữ 60 mẫu
    },
    {
      interval: 5,     // Mỗi 5 giây
      retention: 60    // Giữ 60 mẫu
    },
    {
      interval: 15,    // Mỗi 15 giây
      retention: 60    // Giữ 60 mẫu
    }
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: [
    {
      protocol: 'http',
      host: 'localhost',
      path: '/',
      port: process.env.PORT || 5000
    }
  ]
});

// Middleware bảo vệ trang giám sát
const protectMonitor = (req, res, next) => {
  // Chỉ cho phép truy cập từ localhost hoặc IP cụ thể
  const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  
  if (process.env.NODE_ENV === 'production' && !allowedIPs.includes(req.ip)) {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  
  next();
};

module.exports = {
  statusMonitor,
  protectMonitor
};