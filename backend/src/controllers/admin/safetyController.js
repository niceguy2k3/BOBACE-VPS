const mongoose = require('mongoose');

/**
 * Lấy danh sách báo cáo an toàn với phân trang và lọc
 */
exports.getAllSafetyReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Tạo mock data cho báo cáo an toàn
    const mockReports = [];
    for (let i = 0; i < 20; i++) {
      mockReports.push({
        _id: `safety_report_${i + 1}`,
        user: {
          _id: `user_${i + 1}`,
          fullName: `Người dùng ${i + 1}`,
          avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${(i + 1) % 99}.jpg`,
          email: `user${i + 1}@example.com`
        },
        location: {
          name: `Địa điểm ${i + 1}`,
          address: `Địa chỉ ${i + 1}, Quận ${i % 10 + 1}, TP Hồ Chí Minh`,
          coordinates: {
            lat: 10.7769 + (Math.random() - 0.5) * 0.1,
            lng: 106.7009 + (Math.random() - 0.5) * 0.1
          }
        },
        type: ['unsafe', 'suspicious', 'harassment', 'other'][Math.floor(Math.random() * 4)],
        description: `Mô tả báo cáo an toàn ${i + 1}`,
        status: ['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
        photos: Math.random() > 0.5 ? ['https://via.placeholder.com/300'] : []
      });
    }

    // Lọc theo trạng thái nếu có
    let filteredReports = mockReports;
    if (status) {
      filteredReports = mockReports.filter(report => report.status === status);
    }

    // Sắp xếp
    filteredReports.sort((a, b) => {
      if (order === 'asc') {
        return new Date(a[sort]) - new Date(b[sort]);
      } else {
        return new Date(b[sort]) - new Date(a[sort]);
      }
    });

    // Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    return res.status(200).json({
      reports: paginatedReports,
      pagination: {
        total: filteredReports.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredReports.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllSafetyReports:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo an toàn' });
  }
};

/**
 * Lấy thông tin chi tiết báo cáo an toàn theo ID
 */
exports.getSafetyReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tạo mock data cho báo cáo an toàn chi tiết
    const mockReport = {
      _id: id,
      user: {
        _id: `user_1`,
        fullName: `Người dùng báo cáo`,
        avatar: `https://randomuser.me/api/portraits/men/1.jpg`,
        email: `reporter@example.com`,
        phone: '0901234567'
      },
      location: {
        name: 'Quán cà phê XYZ',
        address: '123 Nguyễn Huệ, Quận 1, TP Hồ Chí Minh',
        coordinates: {
          lat: 10.7769,
          lng: 106.7009
        }
      },
      type: 'unsafe',
      description: 'Địa điểm này có dấu hiệu không an toàn, nhiều người lạ theo dõi',
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      photos: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
      adminNotes: 'Cần kiểm tra địa điểm này và liên hệ với chủ quán',
      emergencyContact: Math.random() > 0.5
    };

    return res.status(200).json(mockReport);
  } catch (error) {
    console.error('Error in getSafetyReportById:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin báo cáo an toàn' });
  }
};

/**
 * Cập nhật trạng thái báo cáo an toàn
 */
exports.updateSafetyReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Tạo mock data cho báo cáo an toàn đã cập nhật
    const mockReport = {
      _id: id,
      user: {
        _id: `user_1`,
        fullName: `Người dùng báo cáo`,
        avatar: `https://randomuser.me/api/portraits/men/1.jpg`,
        email: `reporter@example.com`,
        phone: '0901234567'
      },
      location: {
        name: 'Quán cà phê XYZ',
        address: '123 Nguyễn Huệ, Quận 1, TP Hồ Chí Minh',
        coordinates: {
          lat: 10.7769,
          lng: 106.7009
        }
      },
      type: 'unsafe',
      description: 'Địa điểm này có dấu hiệu không an toàn, nhiều người lạ theo dõi',
      status: status,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      photos: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
      adminNotes: adminNotes || 'Cần kiểm tra địa điểm này và liên hệ với chủ quán',
      emergencyContact: Math.random() > 0.5
    };

    return res.status(200).json({
      message: 'Cập nhật trạng thái báo cáo an toàn thành công',
      report: mockReport
    });
  } catch (error) {
    console.error('Error in updateSafetyReportStatus:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái báo cáo an toàn' });
  }
};

/**
 * Lấy danh sách địa điểm an toàn
 */
exports.getSafetyLocations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      sort = 'createdAt', 
      order = 'desc' 
    } = req.query;

    // Tạo mock data cho địa điểm an toàn
    const mockLocations = [];
    for (let i = 0; i < 20; i++) {
      mockLocations.push({
        _id: `location_${i + 1}`,
        name: `Địa điểm ${i + 1}`,
        address: `Địa chỉ ${i + 1}, Quận ${i % 10 + 1}, TP Hồ Chí Minh`,
        coordinates: {
          lat: 10.7769 + (Math.random() - 0.5) * 0.1,
          lng: 106.7009 + (Math.random() - 0.5) * 0.1
        },
        type: ['cafe', 'restaurant', 'park', 'mall', 'other'][Math.floor(Math.random() * 5)],
        status: ['active', 'inactive', 'pending_review'][Math.floor(Math.random() * 3)],
        safetyRating: Math.floor(Math.random() * 5) + 1,
        reportCount: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        photos: Math.random() > 0.5 ? ['https://via.placeholder.com/300'] : []
      });
    }

    // Lọc theo trạng thái nếu có
    let filteredLocations = mockLocations;
    if (status) {
      filteredLocations = mockLocations.filter(location => location.status === status);
    }

    // Sắp xếp
    filteredLocations.sort((a, b) => {
      if (order === 'asc') {
        return new Date(a[sort]) - new Date(b[sort]);
      } else {
        return new Date(b[sort]) - new Date(a[sort]);
      }
    });

    // Phân trang
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

    return res.status(200).json({
      locations: paginatedLocations,
      pagination: {
        total: filteredLocations.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredLocations.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getSafetyLocations:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách địa điểm an toàn' });
  }
};

/**
 * Cập nhật trạng thái địa điểm an toàn
 */
exports.updateSafetyLocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['active', 'inactive', 'pending_review'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    // Tạo mock data cho địa điểm an toàn đã cập nhật
    const mockLocation = {
      _id: id,
      name: 'Quán cà phê XYZ',
      address: '123 Nguyễn Huệ, Quận 1, TP Hồ Chí Minh',
      coordinates: {
        lat: 10.7769,
        lng: 106.7009
      },
      type: 'cafe',
      status: status,
      safetyRating: 4,
      reportCount: 2,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      photos: ['https://via.placeholder.com/300'],
      adminNotes: adminNotes || 'Địa điểm này đã được kiểm tra và xác nhận an toàn'
    };

    return res.status(200).json({
      message: 'Cập nhật trạng thái địa điểm an toàn thành công',
      location: mockLocation
    });
  } catch (error) {
    console.error('Error in updateSafetyLocationStatus:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái địa điểm an toàn' });
  }
};