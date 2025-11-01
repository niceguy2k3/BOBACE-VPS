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
    <>
      {/* Top Navbar - Desktop only */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden md:block ${
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
                            <FaUser className="mr-3 text-yellow-500" /> <span className="hidden lg:inline">Hồ sơ cá nhân</span><span className="lg:hidden">Hồ sơ</span>
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
          
          </div>
        </div>
      </nav>

      {/* Top Navbar for Mobile - Simple header */}
      <nav className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white shadow-md border-b border-yellow-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src={logo} alt="BOBACE" className="h-8 sm:h-9 mr-2 drop-shadow-sm" />
              <span className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
                BOBACE
              </span>
            </Link>
            
            {/* Notification Bell and Profile */}
            {currentUser && (
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <div className="relative">
                  <button 
                    ref={avatarButtonRef}
                    onClick={toggleDropdown}
                    className="focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 ring-2 ring-yellow-400 shadow-md">
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
                  
                  {/* Dropdown for mobile */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-10 border border-yellow-100 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-3 border-b border-yellow-100 bg-yellow-50/30">
                          <p className="font-medium text-neutral-800 text-sm">{currentUser.fullName}</p>
                          <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                        </div>
                        <div className="py-1">
                          <motion.div whileHover={{ x: 5 }}>
                            <Link 
                              to="/profile" 
                              className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 text-sm"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FaUser className="mr-3 text-yellow-500" /> Hồ sơ
                            </Link>
                          </motion.div>
                          <motion.div whileHover={{ x: 5 }}>
                            <Link 
                              to="/settings" 
                              className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 text-sm"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FaCog className="mr-3 text-yellow-500" /> Cài đặt
                            </Link>
                          </motion.div>
                          {isAdmin && (
                            <>
                              <div className="px-4 py-2 text-xs text-neutral-500 font-medium border-t border-yellow-100 mt-1">Admin</div>
                              <motion.div whileHover={{ x: 5 }}>
                                <Link 
                                  to="/admin/users" 
                                  className="flex items-center px-4 py-2 text-neutral-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all duration-200 text-sm"
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <FaUsers className="mr-3 text-yellow-500" /> Quản lý
                                </Link>
                              </motion.div>
                            </>
                          )}
                        </div>
                        <div className="border-t border-yellow-100 my-1"></div>
                        <div className="py-1">
                          <motion.div whileHover={{ x: 5 }}>
                            <button 
                              onClick={handleLogout}
                              className="flex items-center w-full text-left px-4 py-2 text-neutral-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm"
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
            )}
          </div>
        </div>
      </nav>
      
      {/* Bottom Navigation - Mobile Only */}
      {currentUser && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-yellow-200 shadow-2xl">
          <div className="flex justify-around items-center h-16 px-1">
            <Link 
              to="/" 
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 relative ${
                isActive('/') ? 'text-yellow-600' : 'text-neutral-400'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive('/') ? 'scale-110' : 'scale-100'}`}>
                <FaHome size={20} />
                {isActive('/') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive('/') ? 'text-yellow-600' : 'text-neutral-500'}`}>Trang chủ</span>
            </Link>
            <Link 
              to="/explore" 
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 relative ${
                isActive('/explore') ? 'text-yellow-600' : 'text-neutral-400'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive('/explore') ? 'scale-110' : 'scale-100'}`}>
                <FaCompass size={20} />
                {isActive('/explore') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive('/explore') ? 'text-yellow-600' : 'text-neutral-500'}`}>Khám phá</span>
            </Link>
            <Link 
              to="/matches" 
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 relative ${
                isActive('/matches') ? 'text-yellow-600' : 'text-neutral-400'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive('/matches') ? 'scale-110' : 'scale-100'}`}>
                <FaHeart size={20} />
                {isActive('/matches') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive('/matches') ? 'text-yellow-600' : 'text-neutral-500'}`}>Matches</span>
            </Link>
            <Link 
              to="/admirers" 
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 relative ${
                isActive('/admirers') ? 'text-yellow-600' : 'text-neutral-400'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive('/admirers') ? 'scale-110' : 'scale-100'}`}>
                <FaStar size={20} />
                {isActive('/admirers') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive('/admirers') ? 'text-yellow-600' : 'text-neutral-500'}`}>Thích</span>
            </Link>
            <Link 
              to="/blindate" 
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 relative ${
                isActive('/blindate') ? 'text-yellow-600' : 'text-neutral-400'
              }`}
            >
              <div className={`relative transition-all duration-200 ${isActive('/blindate') ? 'scale-110' : 'scale-100'}`}>
                <FaUserSecret size={20} />
                {isActive('/blindate') && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive('/blindate') ? 'text-yellow-600' : 'text-neutral-500'}`}>Blind</span>
            </Link>
          </div>
        </nav>
      )}
      
      {/* Incognito Mode Modal */}
      <IncognitoModeModal 
        isOpen={showIncognitoModal}
        onClose={() => setShowIncognitoModal(false)}
        isIncognitoEnabled={isIncognitoEnabled}
      />
    </>
  );
};

export default Navbar;