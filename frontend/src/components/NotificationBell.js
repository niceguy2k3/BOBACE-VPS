import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaRegBell, FaHeart, FaStar } from 'react-icons/fa';
import { BiCoffeeTogo } from 'react-icons/bi';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Loader from './Loader';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const notificationRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(false);
    }
  }, [currentUser]);
  
  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Thiết lập polling để cập nhật thông báo theo thời gian thực
  useEffect(() => {
    if (!currentUser) return;
    
    // Cập nhật thông báo mỗi 30 giây
    const notificationInterval = setInterval(() => {
      if (!showNotifications) { // Chỉ cập nhật khi dropdown không hiển thị
        fetchNotifications(false); // Không hiển thị loading
      }
    }, 30000);
    
    return () => clearInterval(notificationInterval);
  }, [showNotifications, currentUser]);

  // Lắng nghe sự kiện thông báo mới từ socket
  useEffect(() => {
    if (socket && currentUser) {
      // Lắng nghe thông báo mới
      socket.on('newNotification', (data) => {
        console.log('New notification received:', data);
        // Khi nhận được thông báo mới, lấy lại danh sách thông báo từ API
        fetchNotifications(false);
      });
      
      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket, currentUser]);

  // Lấy thông báo từ API
  const fetchNotifications = async (showLoading = true) => {
    if (!currentUser) return;
    
    try {
      if (showLoading) {
        setNotificationsLoading(true);
      }
      
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 10,  // Giới hạn số lượng thông báo hiển thị trong bell
          page: 1
        }
      };
      
      // Gọi API để lấy thông báo
      const response = await axios.get(`${API_URL}/api/notifications`, config);
      
      console.log("API Response in NotificationBell:", response.data);
      
      // Kiểm tra cấu trúc dữ liệu trả về
      let notificationsData = [];
      
      if (response.data && response.data.notifications) {
        // Cấu trúc mới: { notifications: [...], pagination: {...} }
        notificationsData = response.data.notifications;
      } else {
        // Cấu trúc cũ hoặc không có dữ liệu
        notificationsData = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log("Notifications data before processing:", notificationsData);
      
      // Xử lý dữ liệu thông báo để hiển thị đúng nội dung
      notificationsData = notificationsData.map(notification => {
        // Log từng thông báo để debug
        console.log("Chi tiết thông báo gốc trong NotificationBell:", notification);
        
        // Tạo bản sao của notification để không ảnh hưởng đến dữ liệu gốc
        const processedNotification = { ...notification };
        
        // Trích xuất thông tin người gửi và người nhận từ nhiều nguồn khác nhau
        const senderName = 
          processedNotification.senderName || 
          (processedNotification.sender && (processedNotification.sender.fullName || processedNotification.sender.name || processedNotification.sender.username)) ||
          (processedNotification.from && (processedNotification.from.fullName || processedNotification.from.name || processedNotification.from.username)) ||
          (processedNotification.user && (processedNotification.user.fullName || processedNotification.user.name || processedNotification.user.username));
        
        const targetName = 
          processedNotification.targetName || 
          (processedNotification.target && (processedNotification.target.fullName || processedNotification.target.name || processedNotification.target.username)) ||
          (processedNotification.to && (processedNotification.to.fullName || processedNotification.to.name || processedNotification.to.username)) ||
          (processedNotification.recipient && (processedNotification.recipient.fullName || processedNotification.recipient.name || processedNotification.recipient.username));
        
        // Cập nhật thông tin người gửi và người nhận
        processedNotification.senderName = senderName;
        processedNotification.targetName = targetName;
        
        // Xử lý thông tin bổ sung nếu có
        if (!processedNotification.additionalInfo && processedNotification.data) {
          if (typeof processedNotification.data === 'string') {
            try {
              const parsedData = JSON.parse(processedNotification.data);
              if (parsedData.message) {
                processedNotification.additionalInfo = parsedData.message;
              }
            } catch (e) {
              // Nếu không phải JSON, sử dụng trực tiếp
              processedNotification.additionalInfo = processedNotification.data;
            }
          } else if (typeof processedNotification.data === 'object') {
            processedNotification.additionalInfo = processedNotification.data.message || JSON.stringify(processedNotification.data);
          }
        }
        
        // Lưu lại nội dung gốc để debug
        processedNotification.originalContent = notification.content;
        processedNotification.originalText = notification.text;
        processedNotification.originalMessage = notification.message;
        
        // Đảm bảo các trường cần thiết luôn tồn tại
        if (!processedNotification.title) {
          if (processedNotification.type === 'message') {
            processedNotification.title = 'Tin nhắn mới';
          } else if (processedNotification.type === 'match') {
            processedNotification.title = 'Kết nối mới';
          } else if (processedNotification.type === 'admirer') {
            processedNotification.title = 'Người thích mới';
          } else if (processedNotification.type === 'system') {
            processedNotification.title = 'Thông báo hệ thống';
          } else {
            processedNotification.title = 'Thông báo mới';
          }
        }
        
        console.log("Processed notification:", processedNotification);
        
        return processedNotification;
      });
      
      console.log("Dữ liệu thông báo trong NotificationBell:", notificationsData);
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Không hiển thị dữ liệu mẫu nữa
      setNotifications([]);
    } finally {
      if (showLoading) {
        setNotificationsLoading(false);
      }
    }
  };

  // Xử lý đánh dấu thông báo đã đọc
  const markNotificationAsRead = async (id, linkTo) => {
    if (!id) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Gọi API để đánh dấu thông báo đã đọc
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, config);
      
      // Cập nhật state
      setNotifications(
        notifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Vẫn cập nhật UI để trải nghiệm người dùng tốt hơn
      setNotifications(
        notifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const markAllNotificationsAsRead = async () => {
    if (!Array.isArray(notifications) || notifications.length === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Gọi API để đánh dấu tất cả thông báo đã đọc
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, config);
      
      // Cập nhật state
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Vẫn cập nhật UI để trải nghiệm người dùng tốt hơn
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  // Định dạng thời gian tương đối
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Không xác định";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(date.getTime())) {
        return "Không xác định";
      }
      
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Vừa xong';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} ngày trước`;
      }
      
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} tháng trước`;
      }
      
      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears} năm trước`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Không xác định";
    }
  };

  // Animation variants
  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0.4)",
        "0 0 0 4px rgba(239, 68, 68, 0)",
        "0 0 0 0 rgba(239, 68, 68, 0.4)"
      ],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  if (!currentUser) return null;

  // Xử lý đánh dấu thông báo đã đọc và điều hướng
  const handleNotificationClick = (id, linkTo) => {
    markNotificationAsRead(id);
    // Không đóng dropdown
  };

  return (
    <div className="relative" ref={notificationRef}>
      <motion.button 
        className={`p-2 relative flex items-center justify-center rounded-full transition-all duration-300 ${
          showNotifications 
            ? 'bg-yellow-50 text-yellow-500 shadow-inner' 
            : 'text-neutral-600 hover:text-yellow-500 hover:bg-yellow-50/50'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) {
            fetchNotifications(); // Tải lại thông báo khi mở dropdown
          }
        }}
        aria-label="Thông báo"
      >
        <AnimatePresence mode="wait">
          {showNotifications ? (
            <motion.div
              key="open-bell"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaRegBell size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="closed-bell"
              initial={{ rotate: 30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaBell size={22} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {Array.isArray(notifications) && notifications.some(n => !n.read) && (
          <motion.div 
            className="absolute -top-1 -right-1 flex items-center justify-center"
            variants={pulseVariants}
            animate="pulse"
          >
            <span className="absolute w-4 h-4 bg-red-500 rounded-full"></span>
            <span className="relative text-[10px] font-bold text-white">
              {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
            </span>
          </motion.div>
        )}
      </motion.button>
      
      {/* Notifications dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-16 md:top-auto md:mt-2 w-auto md:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-yellow-100"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện lan truyền
          >
            <div className="p-4 border-b border-yellow-100 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-yellow-100/30">
              <h3 className="font-medium text-neutral-800 flex items-center">
                <FaBell className="mr-2 text-yellow-500" size={16} /> 
                <span>Thông báo</span>
                {Array.isArray(notifications) && notifications.some(n => !n.read) && (
                  <span>
                  </span>
                )}
              </h3>
              <button 
                className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-medium px-2 py-1 rounded-full transiti on-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                  markAllNotificationsAsRead();
                }}
                disabled={!Array.isArray(notifications) || !notifications.some(n => !n.read)}
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
            <div className="max-h-[70vh] md:max-h-96 overflow-y-auto">
              {notificationsLoading ? (
                <div className="p-6 flex justify-center">
                  <Loader />
                </div>
              ) : notifications.length > 0 ? (
                <div className="py-1">
                  {notifications.map(notification => (
                    <Link 
                      key={notification.id}
                      to={notification.linkTo || '#'}
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                        handleNotificationClick(notification.id, notification.linkTo);
                      }}
                      className="block"
                    >
                      <motion.div 
                        className={`p-4 mx-1 my-1 rounded-lg border-b border-neutral-100 hover:bg-yellow-50/30 transition-all duration-200 ${
                          !notification.read 
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-50/30 border-l-4 border-l-yellow-400' 
                            : ''
                        }`}
                        whileHover={{ x: 5, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện lan truyền
                      >
                        <div className="flex items-start">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 shadow-sm ${
                            notification.type === 'match' 
                              ? 'bg-red-100' 
                              : notification.type === 'message' 
                                ? 'bg-blue-100' 
                                : notification.type === 'admirer' 
                                  ? 'bg-purple-100' 
                                  : 'bg-yellow-100'
                          }`}>
                            {notification.type === 'match' ? (
                              <FaHeart className="text-red-500" size={18} />
                            ) : notification.type === 'message' ? (
                              <FaBell className="text-blue-500" size={18} />
                            ) : notification.type === 'admirer' ? (
                              <FaStar className="text-purple-500" size={18} />
                            ) : (
                              <BiCoffeeTogo className="text-yellow-500" size={18} />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-bold mb-1 ${!notification.read ? 'text-amber-600' : 'text-gray-700'}`}>
                              {notification.title || "Thông báo mới"}
                            </h4>
                            
                            <p className={`text-sm ${!notification.read ? 'font-medium text-neutral-800' : 'text-neutral-600'}`}>
                              {notification.originalContent || notification.originalText || notification.originalMessage || notification.content || notification.text || notification.message || "Bạn có thông báo mới"}
                            </p>
                            
                            {/* Hiển thị thông tin người gửi hoặc người nhận nếu có */}
                            {notification.type === 'message' && notification.senderName && (
                              <p className="text-xs text-amber-500 font-medium mt-0.5">
                                Từ: {notification.senderName}
                              </p>
                            )}
                            
                            {notification.type === 'match' && notification.targetName && (
                              <p className="text-xs text-amber-500 font-medium mt-0.5">
                                Kết nối với: {notification.targetName}
                              </p>
                            )}
                            
                            {notification.type === 'admirer' && notification.senderName && (
                              <p className="text-xs text-amber-500 font-medium mt-0.5">
                                Người thích: {notification.senderName}
                              </p>
                            )}
                            
                            {/* Hiển thị thông tin bổ sung nếu có */}
                            {notification.additionalInfo && (
                              <p className="text-xs text-gray-600 bg-gray-50 p-1 rounded-md mt-1">
                                {notification.additionalInfo}
                              </p>
                            )}
                            
                            <p className="text-xs text-neutral-400 mt-1 flex items-center">
                              <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-neutral-300"></span>
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <motion.div 
                              className="h-3 w-3 bg-yellow-500 rounded-full flex-shrink-0 mt-2"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: [0.8, 1.1, 0.8] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            ></motion.div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <FaBell className="text-yellow-300" size={32} />
                    </motion.div>
                  </div>
                  <p className="text-neutral-600 font-medium mb-2">Không có thông báo mới</p>
                  <p className="text-sm text-neutral-400 max-w-xs mx-auto">
                    Bạn sẽ nhận được thông báo khi có người thích bạn, khi có match mới hoặc khi nhận được tin nhắn.
                  </p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-yellow-100 bg-yellow-50/30 text-center">
              <Link 
                to="/notifications" 
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium inline-flex items-center"
                onClick={() => setShowNotifications(false)}
              >
                <span>Xem tất cả thông báo</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;