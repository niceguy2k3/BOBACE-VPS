import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast, showErrorToast } from "../utils/toastHelper";
import { FaArrowLeft, FaBell, FaCheck, FaTrash, FaRegBell, FaChevronLeft, FaChevronRight, FaSync, FaFilter, FaSearch, FaCalendarAlt, FaHeart, FaComment, FaUserFriends, FaCog, FaBullhorn } from "react-icons/fa";
import { BiCoffeeTogo } from "react-icons/bi";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from "../services/notification.service";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8); // Tăng số lượng hiển thị
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, unread, message, match, admirer, system
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Tham chiếu đến interval và filter menu
  const intervalRef = useRef(null);
  const filterMenuRef = useRef(null);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Tạo hàm fetchNotifications với useCallback để có thể sử dụng trong useEffect và các hàm khác
  const fetchNotifications = useCallback(async (showLoading = true, isRefresh = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      if (isRefresh) {
        setRefreshing(true);
      }
      
      // Lấy tất cả thông báo (bao gồm cả thông báo hệ thống) từ service
      const response = await getNotifications();
      
      // Sử dụng trực tiếp thông báo từ response mà không cần gọi thêm API getSystemNotifications
      let notificationsData = [...(response.notifications || [])];
      
      console.log("Dữ liệu thông báo nhận được:", notificationsData);
      
      // Xử lý dữ liệu thông báo để hiển thị đúng nội dung
      notificationsData = notificationsData.map(notification => {
        // Log từng thông báo để debug
        console.log("Chi tiết thông báo gốc trong NotificationsPage:", notification);
        
        // Tạo bản sao của notification để không ảnh hưởng đến dữ liệu gốc
        const processedNotification = { ...notification };
        
        // Lưu lại nội dung gốc để debug
        processedNotification.originalContent = notification.content;
        processedNotification.originalText = notification.text;
        processedNotification.originalMessage = notification.message;
        
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
        
        // Đảm bảo các trường cần thiết luôn tồn tại
        if (!processedNotification.title) {
          if (processedNotification.type === 'message') {
            processedNotification.title = 'Tin nhắn mới';
          } else if (processedNotification.type === 'match') {
            processedNotification.title = 'Kết nối mới';
          } else if (processedNotification.type === 'admirer') {
            processedNotification.title = 'Người thích mới';
          } else if (processedNotification.type === 'system') {
            processedNotification.title = processedNotification.title || 'Thông báo hệ thống';
          } else {
            processedNotification.title = 'Thông báo mới';
          }
        }
        
        // Đảm bảo nội dung thông báo luôn có
        if (!processedNotification.text) {
          processedNotification.text = processedNotification.message || 
                                      processedNotification.content || 
                                      'Không có nội dung';
        }
        
        console.log("Processed notification in NotificationsPage:", processedNotification);
        
        return processedNotification;
      });
      
      // Sắp xếp thông báo theo thời gian (mới nhất lên đầu)
      notificationsData.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.sentAt || 0);
        const dateB = new Date(b.createdAt || b.sentAt || 0);
        return dateB - dateA;
      });
      
      setNotifications(notificationsData);
      setTotalPages(Math.ceil(notificationsData.length / itemsPerPage));
      setLastUpdate(new Date());
      
      if (isRefresh) {
        showSuccessToast("Đã cập nhật thông báo mới nhất");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (showLoading) {
        showErrorToast("Rất tiếc! Không thể tải thông báo lúc này");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [itemsPerPage]);

  // Hàm làm mới thông báo theo yêu cầu người dùng
  const handleRefresh = () => {
    fetchNotifications(false, true);
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      // Thiết lập cập nhật tự động mỗi 30 giây
      intervalRef.current = setInterval(() => {
        fetchNotifications(false);
      }, 30000);
    }
    
    // Dọn dẹp interval khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, fetchNotifications]);
  
  // Xử lý click outside cho menu lọc
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(true);
      console.log("Marking notification as read:", notificationId);

      // Gọi API từ service
      await markAsRead(notificationId);

      // Cập nhật state UI ngay lập tức
      setNotifications((prev) =>
        prev.map((notification) =>
          (notification._id === notificationId || notification.id === notificationId)
            ? { ...notification, read: true }
            : notification
        )
      );

      showSuccessToast("Đã đánh dấu là đã đọc");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      showErrorToast("Không thể đánh dấu thông báo là đã đọc");
      
      // Cập nhật UI dù có lỗi để trải nghiệm người dùng tốt hơn
      setNotifications((prev) =>
        prev.map((notification) =>
          (notification._id === notificationId || notification.id === notificationId)
            ? { ...notification, read: true }
            : notification
        )
      );
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      console.log("Deleting notification:", notificationId);

      // Gọi API từ service
      await deleteNotification(notificationId);

      // Cập nhật UI sau khi xóa thành công
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== notificationId && notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      setTotalPages(Math.ceil(updatedNotifications.length / itemsPerPage));
      
      // Điều chỉnh trang hiện tại nếu cần
      if (currentPage > Math.ceil(updatedNotifications.length / itemsPerPage) && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      showSuccessToast("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      showErrorToast("Không thể xóa thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAsRead(true);

      // Gọi API từ service
      await markAllAsRead();

      // Cập nhật state UI ngay lập tức
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      showSuccessToast("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      showErrorToast("Không thể đánh dấu tất cả thông báo là đã đọc");
      
      // Cập nhật UI dù có lỗi để trải nghiệm người dùng tốt hơn
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } finally {
      setMarkingAsRead(false);
    }
  };
  
  // Xử lý xóa tất cả thông báo
  const handleDeleteAllNotifications = async () => {
    try {
      // Gọi API từ service
      await deleteAllNotifications();

      // Cập nhật UI sau khi xóa thành công
      setNotifications([]);
      setTotalPages(1);
      setCurrentPage(1);

      showSuccessToast("Đã xóa tất cả thông báo");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      showErrorToast("Không thể xóa tất cả thông báo");
    }
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "Không xác định";
    
    try {
      const now = new Date();
      const notificationTime = new Date(timestamp);
      
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(notificationTime.getTime())) {
        return "Không xác định";
      }
      
      const diffInSeconds = Math.floor((now - notificationTime) / 1000);

      if (diffInSeconds < 60) {
        return "Vừa xong";
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      } else {
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      }
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Không xác định";
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  };
  
  // Xử lý lọc theo loại
  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
    setShowFilterMenu(false);
  };
  
  // Xử lý sắp xếp
  const handleSortChange = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };
  
  // Xử lý chế độ toàn màn hình
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Kiểm tra và xử lý dữ liệu thông báo trước khi hiển thị
  const processedNotifications = notifications
    .map(notification => {
      // Đảm bảo các trường cần thiết luôn tồn tại
      return {
        ...notification,
        // Sử dụng _id từ backend hoặc tạo id tạm thời nếu không có
        id: notification._id || notification.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        title: notification.title || "Thông báo mới",
        content: notification.content || "Bạn có thông báo mới",
        read: !!notification.read,
        createdAt: notification.createdAt || new Date().toISOString()
      };
    })
    // Lọc theo loại
    .filter(notification => {
      if (filterType === "all") return true;
      if (filterType === "unread") return !notification.read;
      return notification.type === filterType;
    })
    // Tìm kiếm
    .filter(notification => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (notification.title && notification.title.toLowerCase().includes(searchLower)) ||
        (notification.content && notification.content.toLowerCase().includes(searchLower)) ||
        (notification.senderName && notification.senderName.toLowerCase().includes(searchLower)) ||
        (notification.targetName && notification.targetName.toLowerCase().includes(searchLower))
      );
    })
    // Sắp xếp
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-100">
        <Loader />
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  const filterVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div 
      className={`
        min-h-screen
        w-full
        bg-white
        transition-all duration-500
        flex flex-col 
        pt-16
        relative
      `}
    >
      <div className={`mt-6 w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-500 flex-grow overflow-y-auto max-w-7xl bg-white`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg text-amber-600 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-300 mr-4"
              whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)" }}
              whileTap={{ scale: 0.9 }}
            >
              <FaArrowLeft className="h-4 w-4" />
            </motion.button>

            <motion.div
              className="flex items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <BiCoffeeTogo className="h-8 w-8 text-amber-600 mr-3" />
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-transparent bg-clip-text drop-shadow-sm">
                Thông Báo
              </h1>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <motion.div 
              className="relative w-full sm:w-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border-2 border-amber-200 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 bg-white/80 backdrop-blur-sm transition-all duration-300"
                />
                <FaSearch className="absolute left-3.5 top-3 text-amber-400" />
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleFullScreen}
                className={`p-2.5 rounded-full ${isFullScreen ? 'bg-amber-500 text-white' : 'bg-white text-amber-600'} shadow-md hover:shadow-lg transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isFullScreen ? "Thoát chế độ toàn màn hình" : "Chế độ toàn màn hình"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isFullScreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0m-5 0l0 5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0 -5M15 15l5 5m0 0l-5 0m5 0l0 -5" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                  )}
                </svg>
              </motion.button>
              
              <motion.div 
                className="relative"
                ref={filterMenuRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="p-2.5 rounded-full bg-white text-amber-600 shadow-md hover:shadow-lg transition-all duration-300 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Lọc thông báo"
                >
                  <FaFilter className="h-5 w-5" />
                  {filterType !== "all" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl z-20 border border-amber-100 overflow-hidden"
                      variants={filterVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="p-3 border-b border-amber-100 bg-amber-50">
                        <h3 className="font-medium text-amber-800">Lọc thông báo</h3>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => handleFilterChange("all")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "all" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaBell className="h-4 w-4" />
                          <span>Tất cả</span>
                        </button>
                        <button 
                          onClick={() => handleFilterChange("unread")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "unread" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaRegBell className="h-4 w-4" />
                          <span>Chưa đọc</span>
                        </button>
                        <button 
                          onClick={() => handleFilterChange("message")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "message" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaComment className="h-4 w-4" />
                          <span>Tin nhắn</span>
                        </button>
                        <button 
                          onClick={() => handleFilterChange("match")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "match" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaUserFriends className="h-4 w-4" />
                          <span>Kết nối</span>
                        </button>
                        <button 
                          onClick={() => handleFilterChange("admirer")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "admirer" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaHeart className="h-4 w-4" />
                          <span>Người thích</span>
                        </button>
                        <button 
                          onClick={() => handleFilterChange("system")}
                          className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 ${filterType === "system" ? "bg-amber-100 text-amber-800" : "hover:bg-amber-50"}`}
                        >
                          <FaCog className="h-4 w-4" />
                          <span>Hệ thống</span>
                        </button>
                      </div>
                      <div className="p-3 border-t border-amber-100 bg-amber-50">
                        <button 
                          onClick={handleSortChange}
                          className="w-full text-left px-4 py-2 rounded-lg flex items-center justify-between hover:bg-amber-100"
                        >
                          <div className="flex items-center space-x-3">
                            <FaCalendarAlt className="h-4 w-4" />
                            <span>Sắp xếp theo</span>
                          </div>
                          <span className="text-amber-600 font-medium">
                            {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/60 backdrop-blur-md rounded-xl shadow-xl mb-6 p-4 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <FaBell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">
                <span className="text-amber-600">{notifications.filter((n) => !n.read).length}</span> thông báo chưa đọc
              </h3>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="text-xs text-gray-500 flex items-center">
              <span>Cập nhật: {lastUpdate.toLocaleTimeString()}</span>
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="ml-2 text-amber-500 hover:text-amber-600 disabled:text-gray-400"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                title="Làm mới thông báo"
              >
                <FaSync className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">  
              {notifications.some((n) => !n.read) && (
                <motion.button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAsRead}
                  className="text-sm bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center space-x-2 px-4 py-2 rounded-full disabled:opacity-50 transition-all duration-300 font-medium border border-amber-200 hover:border-transparent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCheck className="h-3 w-3" />
                  <span>Đánh dấu tất cả là đã đọc</span>
                </motion.button>
              )}
              
              {notifications.length > 0 && (
                <motion.button
                  onClick={handleDeleteAllNotifications}
                  className="text-sm bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 font-medium border border-red-200 hover:border-transparent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTrash className="h-3 w-3" />
                  <span>Xóa tất cả thông báo</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hiển thị kết quả tìm kiếm và lọc */}
        {searchTerm || filterType !== "all" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 px-2"
          >
            <div className="flex items-center text-sm text-gray-600">
              <span>Hiển thị kết quả</span>
              {searchTerm && (
                <span className="ml-1">
                  cho <span className="font-medium text-amber-600">"{searchTerm}"</span>
                </span>
              )}
              {filterType !== "all" && (
                <span className="ml-1">
                  trong{" "}
                  <span className="font-medium text-amber-600">
                    {filterType === "unread" && "thông báo chưa đọc"}
                    {filterType === "message" && "tin nhắn"}
                    {filterType === "match" && "kết nối"}
                    {filterType === "admirer" && "người thích"}
                    {filterType === "system" && "hệ thống"}
                  </span>
                </span>
              )}
              <span className="ml-1">
                ({processedNotifications.length} kết quả)
              </span>
            </div>
          </motion.div>
        ) : null}

        {notifications.length === 0 || processedNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 50 }}
            className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 max-w-2xl mx-auto border border-amber-100"
          >
            <motion.div
              className="text-amber-500 mb-8"
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1, 
                rotate: [0, 10, -10, 10, 0],
                transition: { 
                  duration: 1.5, 
                  delay: 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 5
                }
              }}
            >
              {notifications.length === 0 ? (
                <FaRegBell className="h-24 w-24 mx-auto drop-shadow-lg" />
              ) : (
                <FaSearch className="h-24 w-24 mx-auto drop-shadow-lg" />
              )}
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-amber-600 to-orange-600 text-transparent bg-clip-text">
              {notifications.length === 0 ? "Không có thông báo nào" : "Không tìm thấy kết quả"}
            </h2>
            <p className="text-gray-600 text-xl mb-3">
              {notifications.length === 0 
                ? "Bạn chưa có thông báo nào." 
                : "Không tìm thấy thông báo phù hợp với điều kiện tìm kiếm."}
            </p>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              {notifications.length === 0 
                ? "Hãy tiếp tục khám phá để nhận thông báo mới về các hoạt động thú vị!" 
                : "Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc."}
            </p>

            <motion.button
              onClick={() => {
                if (notifications.length === 0) {
                  navigate("/");
                } else {
                  setSearchTerm("");
                  setFilterType("all");
                }
              }}
              className="mt-4 p bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white px-10 py-6 rounded-full font-medium shadow-lg hover:shadow-amber-200/50 transition-all duration-300 text-lg"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 15px 30px -5px rgba(245, 158, 11, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {notifications.length === 0 ? "Khám phá ngay" : "Xóa bộ lọc"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {currentItems.map((notification, index) => (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                  !notification.read 
                    ? "border-l-4 border-amber-500 border-t border-r border-b border-amber-100" 
                    : "border border-gray-100 hover:border-amber-100"
                }`}
              >
                <div className={`p-1 ${!notification.read ? "bg-gradient-to-r from-amber-50 to-yellow-50" : ""}`}>
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${!notification.read ? "bg-amber-500 animate-pulse" : "bg-gray-300"}`}></div>
                      <span className={`text-xs font-medium ${!notification.read ? "text-amber-600" : "text-gray-500"}`}>
                        {!notification.read ? "Chưa đọc" : "Đã đọc"}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      {notification.type === 'message' && (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <FaComment className="h-5 w-5" />
                        </div>
                      )}
                      {notification.type === 'match' && (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                          <FaUserFriends className="h-5 w-5" />
                        </div>
                      )}
                      {notification.type === 'admirer' && (
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                          <FaHeart className="h-5 w-5" />
                        </div>
                      )}
                      {notification.type === 'system' && (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                          <FaCog className="h-5 w-5" />
                        </div>
                      )}
                      {(!notification.type || !['message', 'match', 'admirer', 'system'].includes(notification.type)) && (
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                          <FaBell className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className={`text-base font-bold mb-1 ${
                        !notification.read ? "text-amber-600" : "text-gray-700"
                      }`}>
                        {notification.title || "Thông báo mới"}
                      </h4>
                      
                      <p className={`text-base ${
                        !notification.read ? "font-semibold text-gray-800" : "text-gray-700"
                      }`}>
                        {notification.originalContent || notification.originalText || notification.originalMessage || notification.content || notification.text || notification.message || "Bạn có thông báo mới"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hiển thị thông tin người gửi hoặc người nhận nếu có */}
                  {notification.type === 'message' && notification.senderName && (
                    <div className="mb-3 text-sm bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-lg inline-block">
                      Từ: {notification.senderName}
                    </div>
                  )}
                  
                  {notification.type === 'match' && notification.targetName && (
                    <div className="mb-3 text-sm bg-green-50 text-green-700 font-medium px-4 py-2 rounded-lg inline-block">
                      Kết nối với: {notification.targetName}
                    </div>
                  )}
                  
                  {notification.type === 'admirer' && notification.senderName && (
                    <div className="mb-3 text-sm bg-red-50 text-red-700 font-medium px-4 py-2 rounded-lg inline-block">
                      Người thích: {notification.senderName}
                    </div>
                  )}
                  
                  {/* Hiển thị thông tin bổ sung nếu có */}
                  {notification.additionalInfo && (
                    <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {notification.additionalInfo}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    {notification.actionLink ? (
                      <motion.button
                        onClick={() => navigate(notification.actionLink)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-1 hover:underline"
                        whileHover={{ x: 5 }}
                      >
                        <span>Xem chi tiết</span>
                        <span>→</span>
                      </motion.button>
                    ) : (
                      <div></div>
                    )}
                    
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <motion.button
                          onClick={() => handleMarkAsRead(notification._id || notification.id)}
                          disabled={markingAsRead}
                          className="text-gray-400 hover:text-amber-600 p-2 rounded-full hover:bg-amber-100 transition-all duration-300"
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          title="Đánh dấu là đã đọc"
                        >
                          <FaCheck className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => handleDeleteNotification(notification._id || notification.id)}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                        whileHover={{ scale: 1.15, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                        title="Xóa thông báo"
                      >
                        <FaTrash className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Phân trang */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center items-center mt-10 mb-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-md px-2 py-1 flex items-center">
              <motion.button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-full text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300 mx-1"
                whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
                title="Trang đầu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
              
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-full text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300 mx-1"
                whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.9 } : {}}
                title="Trang trước"
              >
                <FaChevronLeft className="h-4 w-4" />
              </motion.button>
              
              <div className="px-4 font-medium text-gray-700">
                <span className="text-amber-600">{currentPage}</span>
                <span className="mx-1">/</span>
                <span>{totalPages}</span>
              </div>
              
              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-full text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300 mx-1"
                whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
                whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
                title="Trang sau"
              >
                <FaChevronRight className="h-4 w-4" />
              </motion.button>
              
              <motion.button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-full text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-300 mx-1"
                whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
                whileTap={currentPage !== totalPages ? { scale: 0.9 } : {}}
                title="Trang cuối"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;