import axios from 'axios';
import { API_URL } from '../config/constants';

// Tạo instance axios với interceptor
const axiosPrivate = axios.create();

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

// Lấy tất cả thông báo của người dùng
export const getNotifications = async () => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/notifications`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Lấy thông báo hệ thống
export const getSystemNotifications = async () => {
  try {
    const response = await axiosPrivate.get(`${API_URL}/api/notifications/system`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    throw error;
  }
};

// Đánh dấu thông báo đã đọc
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = async () => {
  try {
    const response = await axiosPrivate.put(`${API_URL}/api/notifications/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Xóa một thông báo
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Xóa tất cả thông báo
export const deleteAllNotifications = async () => {
  try {
    const response = await axiosPrivate.delete(`${API_URL}/api/notifications`);
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};