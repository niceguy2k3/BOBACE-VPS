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
  const response = await axiosPrivate.get(`${API_URL}/api/admin/blindates`, { params });
  return response.data;
};

export const getBlindateById = async (blindateId) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/blindates/${blindateId}`);
  return response.data;
};

export const updateBlindateStatus = async (blindateId, status) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/blindates/${blindateId}`, { status });
  return response.data;
};

export const deleteBlinddate = async (blindateId) => {
  const response = await axiosPrivate.delete(`${API_URL}/api/admin/blindates/${blindateId}`);
  return response.data;
};

// Matches Admin API
export const getAllMatches = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/matches`, { params });
  return response.data;
};

export const getMatchById = async (matchId) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/matches/${matchId}`);
  return response.data;
};

export const deleteMatch = async (matchId) => {
  const response = await axiosPrivate.delete(`${API_URL}/api/admin/matches/${matchId}`);
  return response.data;
};

// Messages Admin API
export const getAllMessages = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/messages`, { params });
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axiosPrivate.delete(`${API_URL}/api/admin/messages/${messageId}`);
  return response.data;
};

// Reports Admin API
export const getAllReports = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/reports`, { params });
  return response.data;
};

export const getReportById = async (reportId) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/reports/${reportId}`);
  return response.data;
};

export const updateReportStatus = async (reportId, status) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/reports/${reportId}`, { status });
  return response.data;
};

// Safety Reports Admin API
export const getAllSafetyReports = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/reports`, { params });
  return response.data;
};

export const getSafetyReportById = async (reportId) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/reports/${reportId}`);
  return response.data;
};

export const updateSafetyReportStatus = async (reportId, status) => {
  const response = await axiosPrivate.patch(`${API_URL}/api/admin/safety/reports/${reportId}/status`, { status });
  return response.data;
};

export const getSafetyLocations = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/safety/locations`, { params });
  return response.data;
};

export const updateSafetyLocationStatus = async (locationId, status) => {
  const response = await axiosPrivate.patch(`${API_URL}/api/admin/safety/locations/${locationId}/status`, { status });
  return response.data;
};

// Notifications Admin API
export const getAllNotifications = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/notifications`, { params });
  return response.data;
};

export const createNotification = async (notificationData) => {
  const response = await axiosPrivate.post(`${API_URL}/api/admin/notifications`, notificationData);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await axiosPrivate.delete(`${API_URL}/api/admin/notifications/${notificationId}`);
  return response.data;
};

// Dashboard Stats API
export const getDashboardStats = async (timeRange = 'month') => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/dashboard`, { params: { timeRange } });
    return response.data;
  } catch (error) {
    console.warn('Dashboard API not available, using mock data');
    // Trả về dữ liệu mẫu nếu API chưa được triển khai
    return {
      users: {
        total: 1250,
        newToday: 15,
        newThisWeek: 87,
        newThisMonth: 320,
        newThisYear: 950,
        premium: 180,
        verified: 750,
        active: 980,
        gender: {
          male: 650,
          female: 580,
          other: 20
        }
      },
      blindates: {
        total: 850,
        today: 35,
        pending: 120,
        accepted: 430,
        completed: 250,
        rejected: 30,
        cancelled: 20
      },
      matches: {
        total: 620,
        today: 28
      },
      messages: {
        total: 15800,
        today: 450
      },
      reports: {
        total: 75,
        pending: 12
      },
      safety: {
        total: 45,
        pending: 8
      }
    };
  }
};

// Activity Stats API
export const getActivityStats = async (range = 'month') => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/admin/statistics/activity`, { params: { range } });
    return response.data;
  } catch (error) {
    console.warn('Activity Stats API not available, using mock data');
    // Trả về dữ liệu mẫu nếu API chưa được triển khai
    const mockData = {
      users: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        newUsers: [65, 78, 90, 85, 92, 110, 120, 115, 95, 85, 75, 80],
        activeUsers: [120, 125, 130, 140, 150, 160, 170, 165, 155, 145, 140, 135]
      },
      blindates: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        created: [45, 52, 60, 65, 70, 75, 80, 85, 75, 70, 65, 60],
        completed: [30, 35, 40, 45, 50, 55, 60, 65, 60, 55, 50, 45]
      },
      matches: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        created: [35, 40, 45, 50, 55, 60, 65, 70, 65, 60, 55, 50]
      },
      messages: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        sent: [350, 400, 450, 500, 550, 600, 650, 700, 650, 600, 550, 500]
      }
    };
    
    // Điều chỉnh dữ liệu dựa trên range
    if (range === 'week') {
      mockData.users.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      mockData.users.newUsers = mockData.users.newUsers.slice(0, 7).map(val => Math.floor(val / 4));
      mockData.users.activeUsers = mockData.users.activeUsers.slice(0, 7).map(val => Math.floor(val / 4));
      
      mockData.blindates.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      mockData.blindates.created = mockData.blindates.created.slice(0, 7).map(val => Math.floor(val / 4));
      mockData.blindates.completed = mockData.blindates.completed.slice(0, 7).map(val => Math.floor(val / 4));
      
      mockData.matches.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      mockData.matches.created = mockData.matches.created.slice(0, 7).map(val => Math.floor(val / 4));
      
      mockData.messages.labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      mockData.messages.sent = mockData.messages.sent.slice(0, 7).map(val => Math.floor(val / 4));
    } else if (range === 'year') {
      mockData.users.labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
      mockData.users.newUsers = [450, 650, 850, 1050, 1250, 1450];
      mockData.users.activeUsers = [350, 550, 750, 950, 1150, 1350];
      
      mockData.blindates.labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
      mockData.blindates.created = [250, 350, 450, 550, 650, 750];
      mockData.blindates.completed = [150, 250, 350, 450, 550, 650];
      
      mockData.matches.labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
      mockData.matches.created = [200, 300, 400, 500, 600, 700];
      
      mockData.messages.labels = ['2019', '2020', '2021', '2022', '2023', '2024'];
      mockData.messages.sent = [2000, 3000, 4000, 5000, 6000, 7000];
    }
    
    return mockData;
  }
};

// System Stats API
export const getSystemStats = async () => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/system/stats`);
  return response.data;
};

// User Management API
export const getAllUsers = async (params = {}) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/users`, { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosPrivate.get(`${API_URL}/api/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosPrivate.delete(`${API_URL}/api/admin/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/role`, { role });
  return response.data;
};

export const verifyUser = async (userId, isVerified, method) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/verify`, { isVerified, method });
  return response.data;
};

export const togglePremium = async (userId, premium) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/premium`, { premium });
  return response.data;
};

export const banUser = async (userId, reason) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/ban`, { reason });
  return response.data;
};

export const unbanUser = async (userId) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/users/${userId}/unban`);
  return response.data;
};

// Maintenance Mode API
export const toggleMaintenanceMode = async (maintenanceData) => {
  const response = await axiosPrivate.put(`${API_URL}/api/admin/system/maintenance`, maintenanceData);
  return response.data;
};