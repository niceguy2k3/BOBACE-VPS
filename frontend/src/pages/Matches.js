import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSearch, FaComments, FaUserFriends, FaFilter, FaEllipsisH, FaUserCheck } from 'react-icons/fa';
import { BiMessageRoundedDetail, BiCoffeeTogo } from 'react-icons/bi';
import { RiCupLine, RiUserHeartLine } from 'react-icons/ri';
import { API_URL } from '../config/constants';
import Loader from '../components/Loader';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'unread'
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchMatches();
  }, []);
  
  // Refresh function for pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setTimeout(() => setRefreshing(false), 800); // Add slight delay for better UX
  };
  
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/matches`, config);
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Không thể tải danh sách match');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Nếu là hôm nay
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Nếu là tuần này
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    }
    
    // Nếu là năm nay
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
    
    // Nếu là năm khác
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };
  
  // Filter matches based on search term and active tab
  const filteredMatches = matches.filter(match => {
    // safely grab fullName or fallback to empty string
    const fullName = match.user?.fullName?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
  
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'new') return matchesSearch && !match.lastMessage;
    if (activeTab === 'unread') {
      return (
        matchesSearch &&
        match.lastMessage &&
        !match.lastMessage.read &&
        match.lastMessage.sender !== match.currentUserId
      );
    }
  
    return matchesSearch;
  });
  
  // Sort matches: unread first, then by last message date
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    // Unread messages first
    const aUnread = a.lastMessage && !a.lastMessage.read && a.lastMessage.sender !== a.currentUserId;
    const bUnread = b.lastMessage && !b.lastMessage.read && b.lastMessage.sender !== b.currentUserId;
    
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    
    // Then sort by date (newest first)
    const aDate = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
    const bDate = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
    
    return bDate - aDate;
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24, duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 }
    }
  };
  
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };
  

  
  return (
    <div className="min-h-screen relative">
      {/* Background gradient with subtle pattern */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-neutral-50 to-neutral-100 z-0 opacity-80" 
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f59e0b' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")"
        }}
      >
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full py-6 px-4 pt-16">
        <motion.div 
          className="w-full max-w-2xl mx-auto mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with animated notification bell */}
          <div className="flex items-center justify-between mb-6 mt-6">
            <motion.h1 
              className="text-2xl font-bold text-neutral-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="text-yellow-500">Trò chuyện</span> & Kết nối
            </motion.h1>
            <div className="flex space-x-3">
              <motion.button 
                className="p-2 text-neutral-500 hover:text-yellow-500 transition-colors relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
              >
                <FaUserFriends size={20} />
              </motion.button>
            </div>
          </div>
      
      {/* Search bar with filter button */}
      <motion.div 
        className="relative mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 shadow-sm"
            />
          </div>
          <motion.button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 rounded-r-xl flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
          </motion.button>
        </div>
        
        {/* Expandable filter options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="mt-2 p-4 bg-white rounded-xl shadow-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <BiCoffeeTogo className="text-yellow-500" />
                  <span className="text-sm text-neutral-700">Thích trà sữa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RiUserHeartLine className="text-yellow-500" />
                  <span className="text-sm text-neutral-700">Gần đây</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Tabs with animations */}
      <motion.div 
        className="flex border-b border-neutral-200 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm relative ${
            activeTab === 'all' 
              ? 'text-yellow-500' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Tất cả
          {activeTab === 'all' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
              layoutId="activeTabIndicator"
            />
          )}
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 font-medium text-sm relative ${
            activeTab === 'unread' 
              ? 'text-yellow-500' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Chưa đọc
          {activeTab === 'unread' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
              layoutId="activeTabIndicator"
            />
          )}
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 font-medium text-sm relative ${
            activeTab === 'new' 
              ? 'text-yellow-500' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Mới match
          {activeTab === 'new' && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"
              layoutId="activeTabIndicator"
            />
          )}
        </motion.button>
      </motion.div>
      
      {loading ? (
        <motion.div 
          className="flex justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader />
        </motion.div>
      ) : refreshing ? (
        <motion.div 
          className="flex justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader />
        </motion.div>
      ) : matches.length === 0 ? (
        <motion.div 
          className="text-center py-12 bg-white rounded-2xl shadow-lg"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.div
              variants={pulseVariants}
              animate="pulse"
            >
              <FaHeart className="text-yellow-500 text-3xl" />
            </motion.div>
          </motion.div>
          <motion.h3 
            className="text-2xl font-bold text-neutral-800 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Chưa có match nào
          </motion.h3>
          <motion.p 
            className="text-neutral-600 mb-8 max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Hãy bắt đầu tìm kiếm và match với những người có cùng sở thích về trà sữa
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              to="/home" 
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-300 shadow-lg inline-block font-medium"
            >
              <span className="flex items-center">
                <BiCoffeeTogo className="mr-2" size={20} />
                Tìm kiếm ngay
              </span>
            </Link>
          </motion.div>
        </motion.div>
      ) : filteredMatches.length === 0 ? (
        <motion.div 
          className="text-center py-10 bg-white rounded-2xl shadow-md"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <FaSearch className="text-neutral-400 text-2xl" />
          </motion.div>
          <motion.h3 
            className="text-xl font-semibold text-neutral-800 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Không tìm thấy kết quả
          </motion.h3>
          <motion.p 
            className="text-neutral-600 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Không tìm thấy match nào phù hợp với tìm kiếm của bạn
          </motion.p>
          <motion.button 
            onClick={() => {
              setSearchTerm('');
              setActiveTab('all');
              setShowFilters(false);
            }}
            className="text-yellow-500 font-medium hover:text-yellow-600 flex items-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FaFilter className="mr-2" /> Xóa bộ lọc
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {sortedMatches.map(match => {
              // ensure match.user is always an object
              const user = match.user || {};
              const hasUnread = match.lastMessage &&
                                !match.lastMessage.read &&
                                match.lastMessage.sender !== match.currentUserId;
              
              return (
                <motion.div
                  key={match._id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  whileHover="hover"
                  className="overflow-hidden"
                >
                  <Link 
                    to={`/chat/${match._id}`}
                    className={`bg-white rounded-xl p-4 flex items-center shadow-sm transition-all duration-300 ${
                      hasUnread ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <motion.div 
                        className="h-16 w-16 rounded-full overflow-hidden border-2 border-neutral-100"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.fullName || ''} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-yellow-200 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                              {(user.fullName?.charAt(0) || '').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </motion.div>
                      
                      {user.online && (
                        <motion.div 
                          className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      )}
                    </div>
                    
                    <div className="flex-1 ml-4 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold text-lg ${hasUnread ? 'text-neutral-900' : 'text-neutral-700'}`}>
                          <div className="flex items-center">
                            <span>{user.fullName || ''}</span>
                            {user.verified && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <FaUserCheck className="mr-1" size={10} />
                                Đã xác minh
                              </span>
                            )}
                            {user.teaPreferences && user.teaPreferences.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <RiCupLine className="mr-1" />
                                {user.teaPreferences[0]}
                              </span>
                            )}
                          </div>
                        </h3>
                        <p className={`text-xs ${hasUnread ? 'text-yellow-500 font-medium' : 'text-neutral-500'}`}>
                          {match.lastMessage 
                            ? formatDate(match.lastMessage.createdAt)
                            : formatDate(match.createdAt)
                          }
                        </p>
                      </div>
                      
                      {match.lastMessage ? (
                        <div className="flex items-center mt-1">
                          <p className={`text-sm truncate ${hasUnread ? 'text-neutral-800 font-medium' : 'text-neutral-500'}`}>
                            {match.lastMessage.content}
                          </p>
                          
                          {hasUnread && (
                            <motion.div 
                              className="ml-2 h-3 w-3 bg-yellow-500 rounded-full flex-shrink-0"
                              variants={pulseVariants}
                              animate="pulse"
                            ></motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-neutral-600 mt-1 bg-yellow-50 rounded-full px-3 py-1 inline-block">
                          <FaHeart className="text-yellow-500 mr-2" size={14} />
                          <p className="font-medium">Đã match - Bắt đầu trò chuyện</p>
                        </div>
                      )}
                      
                      {/* Additional user info */}
                      <div className="flex mt-2 text-xs text-neutral-500">
                        {user.city && (
                          <span className="mr-3">{user.city}</span>
                        )}
                        {user.birthDate && (
                          <span>
                            {new Date().getFullYear() - new Date(user.birthDate).getFullYear()} tuổi
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <motion.div 
                      className="ml-2 text-neutral-400"
                      whileHover={{ scale: 1.2, color: '#f59e0b' }}
                    >
                      <FaEllipsisH />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
        </motion.div>
        
        {/* Floating action button */}
        <motion.div
          className="fixed bottom-24 md:bottom-6 right-6 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <Link
            to="/home"
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full shadow-lg text-white"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <BiCoffeeTogo size={24} />
            </motion.div>
          </Link>
        </motion.div>
        
        {/* Pull to refresh indicator */}
        {refreshing && (
          <motion.div 
            className="absolute top-0 left-0 right-0 flex justify-center"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
          >
            <div className="bg-yellow-500 text-white px-4 py-1 rounded-b-lg shadow-md text-sm">
              Đang cập nhật...
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matches;