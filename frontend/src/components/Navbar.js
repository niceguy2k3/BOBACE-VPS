import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaHome, FaHeart, FaCog, FaBars, FaTimes, FaCompass, FaBell, FaStar, FaEyeSlash, FaUserSecret, FaShieldAlt, FaInfoCircle, FaListUl, FaEnvelope, FaFileAlt, FaUsers, FaCalendarAlt, FaExclamationTriangle, FaBullhorn, FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import NotificationBell from './NotificationBell';
import IncognitoModeModal from './IncognitoModeModal';
import logo from '../images/logo2.png';

const Navbar = () => {
  const { currentUser, logout, toggleIncognitoMode } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showIncognitoModal, setShowIncognitoModal] = useState(false);
  const [isIncognitoEnabled, setIsIncognitoEnabled] = useState(false);
  const dropdownRef = useRef(null);
  const avatarButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  
  // Check if the current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Update incognito state when currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.settings && currentUser.settings.privacy) {
      setIsIncognitoEnabled(currentUser.settings.privacy.incognitoMode || false);
    }
  }, [currentUser]);

  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close menus when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);
  
  // Handle click outside to close dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if clicked outside
      if (
        isDropdownOpen && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      
      // Close mobile menu if clicked outside
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMenuOpen]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };
  
  const toggleMenu = () => {
    // Đóng menu hiện tại nếu đang mở, hoặc mở menu và đóng dropdown nếu đang đóng
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
      // Đóng dropdown nếu đang mở
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    }
  };

  const toggleDropdown = () => {
    // Đóng dropdown hiện tại nếu đang mở, hoặc mở dropdown và đóng menu nếu đang đóng
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
      // Đóng mobile menu nếu đang mở
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
    } border-b border-yellow-100 mb-10`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative transition-transform duration-300 group-hover:scale-105">
              <img src={logo} alt="BOBACE" className="h-10 sm:h-11 mr-2 sm:mr-3 drop-shadow-sm" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent hidden sm:block transition-all duration-300 group-hover:from-yellow-600 group-hover:to-yellow-800">
              BOBACE
            </span>
          </Link>
          
          {/* Navigation Links - Desktop */}
          {currentUser ? (
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link 
                to="/" 
                className={`flex items-center transition-all duration-200 px-3 lg:px-4 py-2 rounded-full ${
                  isActive('/') 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                }`}
              >
                <FaHome className="mr-1.5 lg:mr-2" /> 
                <span className="text-sm lg:text-base">Trang chủ</span>
              </Link>
              <Link 
                to="/explore" 
                className={`flex items-center transition-all duration-200 px-3 lg:px-4 py-2 rounded-full ${
                  isActive('/explore') 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                }`}
              >
                <FaCompass className="mr-1.5 lg:mr-2" /> 
                <span className="text-sm lg:text-base">Khám phá</span>
              </Link>
              <Link 
                to="/matches" 
                className={`flex items-center transition-all duration-200 px-3 lg:px-4 py-2 rounded-full ${
                  isActive('/matches') 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                }`}
              >
                <FaHeart className="mr-1.5 lg:mr-2" /> 
                <span className="text-sm lg:text-base">Matches</span>
              </Link>
              <Link 
                to="/admirers" 
                className={`flex items-center transition-all duration-200 px-3 lg:px-4 py-2 rounded-full ${
                  isActive('/admirers') 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                }`}
              >
                <FaStar className="mr-1.5 lg:mr-2" /> 
                <span className="text-sm lg:text-base">Người thích</span>
              </Link>
              <Link 
                to="/blindate" 
                className={`flex items-center transition-all duration-200 px-3 lg:px-4 py-2 rounded-full ${
                  isActive('/blindate') 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                }`}
              >
                <FaUserSecret className="mr-1.5 lg:mr-2" /> 
                <span className="text-sm lg:text-base">Blind date</span>
              </Link>
              <div className="mx-1">
                <NotificationBell />
              </div>
              <div className="relative group">
                <button 
                  ref={avatarButtonRef}
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="Mở menu người dùng"
                >
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-yellow-400 transition-all duration-300 hover:ring-yellow-500 shadow-md">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-bold">
                        {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl py-2 z-10 border border-yellow-100 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-3 border-b border-yellow-100 bg-yellow-50/30">
                        <p className="font-medium text-neutral-800">{currentUser.fullName}</p>
                        <p className="text-sm text-neutral-500 truncate">{currentUser.email}</p>
                      </div>
                      <div className="py-1">
                        <motion.div whileHover={{ x: 5 }}>
                          <Link 
                            to="/profile" 
                            className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FaUser className="mr-3 text-yellow-500" /> Hồ sơ cá nhân
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }}>
                          <Link 
                            to="/settings" 
                            className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FaCog className="mr-3 text-yellow-500" /> Cài đặt
                          </Link>
                        </motion.div>
                        {isAdmin && (
                          <>
                            <div className="px-4 py-2 text-sm text-neutral-500 font-medium border-t border-yellow-100 mt-1">Quản trị viên</div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Link 
                                to="/admin/users" 
                                className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaUsers className="mr-3 text-yellow-500" /> Người dùng
                              </Link>
                            </motion.div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Link 
                                to="/admin/blindates" 
                                className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaCalendarAlt className="mr-3 text-yellow-500" /> Blind dates
                              </Link>
                            </motion.div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Link 
                                to="/admin/matches" 
                                className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaHeart className="mr-3 text-yellow-500" /> Matches
                              </Link>
                            </motion.div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Link 
                                to="/admin/reports" 
                                className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FaExclamationTriangle className="mr-3 text-yellow-500" /> Báo cáo
                              </Link>
                            </motion.div>
                          </>
                        )}
                        <motion.div whileHover={{ x: 5 }}>
                          <button 
                            className={`flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 ${
                              isIncognitoEnabled ? 'bg-yellow-50' : ''
                            }`}
                            onClick={async () => {
                              try {
                                const response = await toggleIncognitoMode();
                                setIsIncognitoEnabled(response.incognitoMode);
                                setShowIncognitoModal(true);
                                setIsDropdownOpen(false);
                              } catch (error) {
                                console.error('Error toggling incognito mode:', error);
                                setIsDropdownOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-center">
                              <FaEyeSlash className="mr-3 text-yellow-500" /> 
                              <span className="flex-grow">
                                {isIncognitoEnabled 
                                  ? 'Tắt chế độ ẩn danh' 
                                  : 'Bật chế độ ẩn danh'}
                              </span>
                              {!currentUser?.premium && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full flex items-center">
                                  Premium
                                </span>
                              )}
                            </div>
                          </button>
                        </motion.div>
                      </div>
                      <div className="border-t border-yellow-100 my-1"></div>
                      <div className="py-1">
                        <motion.div whileHover={{ x: 5 }}>
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                          >
                            <FaSignOutAlt className="mr-3 text-red-500" /> Đăng xuất
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 mr-2">
                <Link 
                  to="/about" 
                  className={`flex items-center transition-all duration-200 px-3 py-2 rounded-full ${
                    isActive('/about') 
                      ? 'text-yellow-600 bg-yellow-50 font-medium' 
                      : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                  }`}
                >
                  <FaInfoCircle className="mr-1.5" /> 
                  <span className="text-sm">Giới thiệu</span>
                </Link>
                <Link 
                  to="/features" 
                  className={`flex items-center transition-all duration-200 px-3 py-2 rounded-full ${
                    isActive('/features') 
                      ? 'text-yellow-600 bg-yellow-50 font-medium' 
                      : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                  }`}
                >
                  <FaListUl className="mr-1.5" /> 
                  <span className="text-sm">Tính năng</span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`flex items-center transition-all duration-200 px-3 py-2 rounded-full ${
                    isActive('/contact') 
                      ? 'text-yellow-600 bg-yellow-50 font-medium' 
                      : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                  }`}
                >
                  <FaEnvelope className="mr-1.5" /> 
                  <span className="text-sm">Liên hệ</span>
                </Link>
                <Link 
                  to="/legal" 
                  className={`flex items-center transition-all duration-200 px-3 py-2 rounded-full ${
                    isActive('/legal') 
                      ? 'text-yellow-600 bg-yellow-50 font-medium' 
                      : 'text-neutral-700 hover:text-yellow-500 hover:bg-yellow-50/50'
                  }`}
                >
                  <FaFileAlt className="mr-1.5" /> 
                  <span className="text-sm">Pháp lý</span>
                </Link>
              </div>
              <Link 
                to="/login" 
                className="px-5 py-2 rounded-full text-neutral-700 hover:text-yellow-600 transition-colors duration-200"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Đăng ký
              </Link>
            </div>
          )}
          
          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Notification Bell for Mobile */}
            {currentUser && (
              <div className="relative">
                <NotificationBell />
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <motion.button 
              ref={mobileMenuButtonRef}
              onClick={toggleMenu}
              className="p-2 rounded-full text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 focus:outline-none transition-all duration-200 shadow-sm hover:shadow"
              aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaTimes size={22} className="text-yellow-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBars size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            ref={mobileMenuRef}
            className="md:hidden py-3 border-t border-yellow-100 bg-white shadow-lg max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentUser ? (
              <div className="flex flex-col">
                <div className="flex items-center space-x-3 p-4 border-b border-yellow-100 bg-yellow-50/30">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-yellow-400 shadow-md">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-500 text-white font-bold">
                        {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{currentUser.fullName}</p>
                    <p className="text-sm text-neutral-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHome className="mr-3" /> Trang chủ
              </Link>
              <Link 
                to="/explore" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/explore') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaCompass className="mr-3" /> Khám phá
              </Link>
              <Link 
                to="/matches" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/matches') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHeart className="mr-3" /> Matches
              </Link>
              <Link 
                to="/admirers" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/admirers') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaStar className="mr-3" /> Người thích
              </Link>
              <Link 
                to="/blindate" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/blindate') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUserSecret className="mr-3" /> Blind date
              </Link>
              <Link 
                to="/profile" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/profile') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser className="mr-3" /> Hồ sơ cá nhân
              </Link>
              <Link 
                to="/settings" 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                  isActive('/settings') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaCog className="mr-3" /> Cài đặt
              </Link>
              {isAdmin && (
                <>
                  <div className="border-t border-yellow-100 my-2 mx-2"></div>
                  <div className="px-4 py-2 text-sm text-neutral-500 font-medium">Quản trị viên</div>
                  <Link 
                    to="/admin/users" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/users') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUsers className="mr-3" /> Người dùng
                  </Link>
                  <Link 
                    to="/admin/blindates" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/blindates') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCalendarAlt className="mr-3" /> Blind dates
                  </Link>
                  <Link 
                    to="/admin/matches" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/matches') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaHeart className="mr-3" /> Matches
                  </Link>
                  <Link 
                    to="/admin/reports" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/reports') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaExclamationTriangle className="mr-3" /> Báo cáo
                  </Link>
                  <Link 
                    to="/admin/system-notifications" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/system-notifications') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaBullhorn className="mr-3" /> Thông báo hệ thống
                  </Link>
                  <Link 
                    to="/admin/statistics" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/statistics') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaChartBar className="mr-3" /> Thống kê
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-200 ${
                      isActive('/admin/settings') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="mr-3" /> Cài đặt Admin
                  </Link>
                </>
              )}
              <motion.button 
                className={`flex items-center px-4 py-3 my-1 mx-2 rounded-lg text-left transition-all duration-200 ${
                  isIncognitoEnabled 
                    ? 'text-yellow-600 bg-yellow-50 font-medium' 
                    : 'text-neutral-700 hover:bg-yellow-50/50'
                }`}
                onClick={async () => {
                  try {
                    const response = await toggleIncognitoMode();
                    setIsIncognitoEnabled(response.incognitoMode);
                    setShowIncognitoModal(true);
                    setIsMenuOpen(false);
                  } catch (error) {
                    console.error('Error toggling incognito mode:', error);
                  }
                }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEyeSlash className="mr-3" /> 
                {isIncognitoEnabled 
                  ? 'Tắt chế độ ẩn danh' 
                  : 'Bật chế độ ẩn danh'}
              </motion.button>
              <div className="border-t border-neutral-100 my-2 mx-2"></div>
              <motion.button 
                onClick={handleLogout}
                className="flex items-center px-4 py-3 my-1 mx-2 rounded-lg text-left text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSignOutAlt className="mr-3" /> Đăng xuất
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col p-4 space-y-3">
              <div className="mb-2 border-b border-neutral-100 pb-2">
                <Link 
                  to="/about" 
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 ${
                    isActive('/about') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaInfoCircle className="mr-3" /> Giới thiệu
                </Link>
                <Link 
                  to="/features" 
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 ${
                    isActive('/features') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaListUl className="mr-3" /> Tính năng
                </Link>
                <Link 
                  to="/contact" 
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 ${
                    isActive('/contact') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaEnvelope className="mr-3" /> Liên hệ
                </Link>
                <Link 
                  to="/legal" 
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-200 ${
                    isActive('/legal') ? 'text-yellow-600 bg-yellow-50 font-medium' : 'text-neutral-700 hover:bg-yellow-50/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaFileAlt className="mr-3" /> Pháp lý
                </Link>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/login" 
                  className="block w-full py-3 px-4 rounded-lg border border-neutral-200 text-center text-neutral-700 hover:border-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  to="/register" 
                  className="block w-full py-3 px-4 rounded-lg bg-yellow-500 text-center text-white hover:bg-yellow-600 transition-colors duration-200 shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </motion.div>
            </div>
          )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Incognito Mode Modal */}
      <IncognitoModeModal 
        isOpen={showIncognitoModal}
        onClose={() => setShowIncognitoModal(false)}
        isIncognitoEnabled={isIncognitoEnabled}
      />
    </nav>
  );
};

export default Navbar;