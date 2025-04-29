import axios from 'axios';
import { API_URL } from '../config/constants';

// Tạo instance axios với interceptor
export const axiosPrivate = axios.create();

// Thêm interceptor để tự động thêm token vào header
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Blindates Admin API
export const getBlindates = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/blindates`, { params });
    return response.data;
  } catch (error) {
    console.warn('Blindates API not available, using mock data');
    // Trả về dữ liệu mẫu nếu API chưa được triển khai
    const statuses = ['pending', 'accepted', 'completed', 'cancelled', 'rejected'];
    const locations = [
      'Highlands Coffee - Nguyễn Huệ',
      'The Coffee House - Lê Lợi',
      'Phúc Long Coffee & Tea - Đồng Khởi',
      'Trung Nguyên Legend - Lê Thánh Tôn',
      'Starbucks - Nguyễn Thị Nghĩa',
      'Gong Cha - Nguyễn Trãi',
      'KOI Thé - Lê Văn Sỹ',
      'TocoToco - Cách Mạng Tháng 8',
      'Ding Tea - Võ Văn Tần',
      'Bobapop - Nguyễn Đình Chiểu'
    ];
    
    const mockBlindates = Array(20).fill().map((_, index) => ({
      _id: `blindate_${index + 1}`,
      users: [
        {
          _id: `user_${index * 2 + 1}`,
          fullName: `Người dùng ${index * 2 + 1}`,
          avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${(index * 2 + 1) % 99}.jpg`
        },
        {
          _id: `user_${index * 2 + 2}`,
          fullName: `Người dùng ${index * 2 + 2}`,
          avatar: `https://randomuser.me/api/portraits/${index % 2 === 1 ? 'men' : 'women'}/${(index * 2 + 2) % 99}.jpg`
        }
      ],
      matchScore: Math.floor(Math.random() * 50) + 50,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
      time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      notes: Math.random() > 0.7 ? 'Ghi chú cho cuộc hẹn này' : null
    }));

    return {
      blindates: mockBlindates,
      pagination: {
        total: 100,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: Math.ceil(100 / (params.limit || 10))
      }
    };
  }
};

export const getBlindateById = async (blindateId) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/blindates/${blindateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blindate details:', error);
    throw error;
  }
};

export const updateBlindateStatus = async (blindateId, status) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/blindates/${blindateId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating blindate status:', error);
    throw error;
  }
};

export const deleteBlinddate = async (blindateId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/admin/blindates/${blindateId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting blindate:', error);
    throw error;
  }
};

// Matches Admin API
export const getAllMatches = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/matches`, { params });
    return response.data;
  } catch (error) {
    console.warn('Matches API not available, using mock data');
    // Trả về dữ liệu mẫu nếu API chưa được triển khai
    const mockMatches = Array(20).fill().map((_, index) => ({
      _id: `match_${index + 1}`,
      users: [
        {
          _id: `user_${index * 2 + 1}`,
          fullName: `Người dùng ${index * 2 + 1}`,
          avatar: `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${(index * 2 + 1) % 99}.jpg`
        },
        {
          _id: `user_${index * 2 + 2}`,
          fullName: `Người dùng ${index * 2 + 2}`,
          avatar: `https://randomuser.me/api/portraits/${index % 2 === 1 ? 'men' : 'women'}/${(index * 2 + 2) % 99}.jpg`
        }
      ],
      matchScore: Math.floor(Math.random() * 50) + 50,
      status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      messageCount: Math.floor(Math.random() * 100)
    }));

    return {
      matches: mockMatches,
      pagination: {
        total: 100,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: Math.ceil(100 / (params.limit || 10))
      }
    };
  }
};

export const getMatchById = async (matchId) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching match details:', error);
    throw error;
  }
};

export const deleteMatch = async (matchId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/admin/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};

// Messages Admin API
export const getAllMessages = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/messages`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/admin/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Reports Admin API
export const getAllReports = async (params = {}) => {
  try {
    // Kiểm tra và xử lý tham số status
    const validParams = { ...params };
    
    // Đảm bảo status là giá trị hợp lệ
    if (validParams.status && !['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed', ''].includes(validParams.status)) {
      console.warn('Invalid status value:', validParams.status);
      validParams.status = ''; // Đặt về giá trị mặc định nếu không hợp lệ
    }
    
    console.log('Fetching reports with params:', validParams);
    const response = await axiosPrivate.get(`${API_URL}/api/admin/reports`, { params: validParams });
    console.log('Reports API response:', response.data);
    
    // Ensure each report has an _id property
    if (response.data.reports && Array.isArray(response.data.reports)) {
      response.data.reports = response.data.reports.map(report => {
        if (!report._id && report.reportId) {
          report._id = report.reportId;
        }
        return report;
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const getReportById = async (reportId) => {
  try {
    console.log('Fetching report details for ID:', reportId);
    const response = await axiosPrivate.get(`${API_URL}/api/admin/reports/${reportId}`);
    console.log('Report details response:', response.data);
    
    // Ensure the report has an _id property
    if (response.data && !response.data._id && response.data.reportId) {
      response.data._id = response.data.reportId;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching report details:', error);
    throw error;
  }
};

export const updateReportStatus = async (reportId, data) => {
  try {
    // Kiểm tra reportId
    if (!reportId) {
      throw new Error('Report ID is required');
    }
    
    // Kiểm tra status hợp lệ
    if (data && data.status && 
        !['chờ_xử_lý', 'in_progress', 'resolved', 'dismissed'].includes(data.status)) {
      console.warn('Invalid status value:', data.status);
      throw new Error('Invalid status value');
    }
    
    console.log('Updating report status:', { reportId, data });
    
    // Thử sử dụng PUT trước
    try {
      const response = await axiosPrivate.put(`${API_URL}/api/admin/reports/${reportId}/status`, data);
      return response.data;
    } catch (putError) {
      console.log('PUT request failed, trying with POST as fallback');
      // Nếu PUT không thành công, thử sử dụng POST với _method=PATCH
      const response = await axiosPrivate.post(`${API_URL}/api/admin/reports/${reportId}/status`, {
        ...data,
        _method: 'PATCH' // Thêm tham số này để backend có thể xử lý như một PATCH request
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Safety Reports Admin API
export const getAllSafetyReports = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/reports`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching safety reports:', error);
    throw error;
  }
};

export const getSafetyReportById = async (reportId) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching safety report details:', error);
    throw error;
  }
};

export const updateSafetyReportStatus = async (reportId, status) => {
  try {
    const response = await axiosPrivate.patch(`${API_URL}/api/admin/safety/reports/${reportId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating safety report status:', error);
    throw error;
  }
};

export const getSafetyLocations = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/locations`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching safety locations:', error);
    throw error;
  }
};

export const updateSafetyLocationStatus = async (locationId, status) => {
  try {
    const response = await axiosPrivate.patch(`${API_URL}/api/admin/safety/locations/${locationId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating safety location status:', error);
    throw error;
  }
};

// Notifications Admin API
export const getAllNotifications = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/notifications`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await axiosPrivate.post(`${API_URL}/api/admin/notifications`, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/admin/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const sendSystemNotification = async (notificationData) => {
  try {
    const response = await axiosPrivate.post(`${API_URL}/api/admin/notifications/system`, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error sending system notification:', error);
    throw error;
  }
};

// Dashboard Stats API
export const getDashboardStats = async (timeRange = 'month') => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/dashboard`, { params: { timeRange } });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Activity Stats API
export const getActivityStats = async (range = 'month') => {
  try {
    // Import tryMultipleUrls from api-helper
    const { tryMultipleUrls } = await import('../utils/api-helper');
    
    // Use tryMultipleUrls instead of direct axios call
    const response = await tryMultipleUrls('/api/admin/statistics/activity', { 
      params: { range },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }, 'get');
    
    return response.data;
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    // Không throw error để tránh làm crash UI
    // Trả về dữ liệu mẫu nếu có lỗi
    return {
      users: {
        labels: range === 'week' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : 
                range === 'month' ? Array.from({length: 30}, (_, i) => `${i+1}`) : 
                Array.from({length: 12}, (_, i) => `T${i+1}`),
        newUsers: range === 'week' ? [5, 8, 12, 7, 10, 15, 20] : 
                  range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 20) + 5) : 
                  Array.from({length: 12}, () => Math.floor(Math.random() * 100) + 50),
        activeUsers: range === 'week' ? [25, 30, 28, 32, 40, 45, 50] : 
                     range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 30) + 20) : 
                     Array.from({length: 12}, () => Math.floor(Math.random() * 200) + 100)
      },
      blindates: {
        labels: range === 'week' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : 
                range === 'month' ? Array.from({length: 30}, (_, i) => `${i+1}`) : 
                Array.from({length: 12}, (_, i) => `T${i+1}`),
        created: range === 'week' ? [3, 5, 4, 7, 8, 12, 10] : 
                 range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 10) + 2) : 
                 Array.from({length: 12}, () => Math.floor(Math.random() * 50) + 20),
        completed: range === 'week' ? [2, 3, 2, 5, 6, 8, 7] : 
                   range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 8) + 1) : 
                   Array.from({length: 12}, () => Math.floor(Math.random() * 40) + 15)
      },
      matches: {
        labels: range === 'week' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : 
                range === 'month' ? Array.from({length: 30}, (_, i) => `${i+1}`) : 
                Array.from({length: 12}, (_, i) => `T${i+1}`),
        created: range === 'week' ? [10, 12, 15, 14, 18, 22, 25] : 
                 range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 15) + 10) : 
                 Array.from({length: 12}, () => Math.floor(Math.random() * 80) + 40)
      },
      messages: {
        labels: range === 'week' ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : 
                range === 'month' ? Array.from({length: 30}, (_, i) => `${i+1}`) : 
                Array.from({length: 12}, (_, i) => `T${i+1}`),
        sent: range === 'week' ? [45, 60, 55, 70, 85, 100, 120] : 
              range === 'month' ? Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 40) : 
              Array.from({length: 12}, () => Math.floor(Math.random() * 300) + 200)
      }
    };
  }
};

// System Stats API
export const getSystemStats = async () => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/system/stats`);
    return response.data;
  } catch (error) {
    console.warn('System Stats API not available, using mock data');
    // Trả về dữ liệu mẫu nếu API chưa được triển khai
    return {
      server: {
        uptime: 1209600, // 14 days in seconds
        memory: {
          total: 8192, // MB
          used: 4096, // MB
          free: 4096 // MB
        },
        cpu: {
          usage: 35, // percentage
          cores: 4
        },
        disk: {
          total: 500, // GB
          used: 250, // GB
          free: 250 // GB
        }
      },
      database: {
        size: 250, // MB
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
          average: 120, // ms
          p95: 350, // ms
          p99: 500 // ms
        }
      }
    };
  }
};

// Kiểm tra và cập nhật trạng thái premium của người dùng
export const checkPremiumStatus = async () => {
  try {
    const response = await axiosPrivate.post(`${API_URL}/api/admin/system/check-premium`);
    return response.data;
  } catch (error) {
    console.error('Error checking premium status:', error);
    throw error;
  }
};

// User Management API
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/users`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const verifyUser = async (userId, isVerified, method) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/verify`, { isVerified, method });
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

export const togglePremium = async (userId, premium) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/premium`, { premium });
    return response.data;
  } catch (error) {
    console.error('Error toggling premium status:', error);
    throw error;
  }
};

export const banUser = async (userId, reason) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/ban`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

// Maintenance Mode API
export const toggleMaintenanceMode = async (maintenanceData) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/admin/system/maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    throw error;
  }
};

// Remove the export from adminApi.js to avoid duplicate exports
// export * from '../utils/adminApi';