import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { showInfoToast, showSuccessToast, showErrorToast } from '../utils/toastHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes, FaFilter, FaList, FaTh, FaMapMarkerAlt, FaRegHeart, FaSearch, FaChevronDown, FaChevronUp, FaInfoCircle, FaRandom, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { API_URL } from '../config/constants';
import { 
  TEA_PREFERENCES, 
  HOBBIES, 
  ZODIAC_SIGNS, 
  LIFESTYLE_OPTIONS,
  LOOKING_FOR_OPTIONS
} from '../config/constants';
import Loader from '../components/Loader';

// Hiển thị thông tin giới tính bằng tiếng Việt
const getGenderText = (gender) => {
  if (!gender) return '';
  
  // Chuyển đổi giá trị tiếng Anh sang tiếng Việt
  const genderMap = {
    'male': 'Nam',
    'female': 'Nữ',
    'non-binary': 'Phi nhị nguyên',
    'transgender': 'Chuyển giới',
    'genderqueer': 'Phi giới tính',
    'genderfluid': 'Giới tính linh hoạt',
    'agender': 'Không xác định giới tính',
    'other': 'Khác'
  };
  
  return genderMap[gender] || gender;
};

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Lưu trữ chỉ mục ảnh hiện tại cho mỗi người dùng
  const [imageIndexes, setImageIndexes] = useState({});
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 50,
    maxDistance: 50,
    teaPreferences: [],
    hobbies: [],
    zodiacSigns: [],
    lookingFor: [],
    lifestyle: {
      smoking: [],
      drinking: [],
      exercise: []
    }
  });
  
  // Refs
  const filtersRef = useRef(null);
  
  useEffect(() => {
    fetchUsers();
    
    // Click outside to close filters
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Khởi tạo chỉ mục ảnh cho mỗi người dùng khi danh sách người dùng thay đổi
  useEffect(() => {
    // Khởi tạo chỉ mục ảnh cho mỗi người dùng
    const newImageIndexes = {};
    
    // Đặt chỉ mục ảnh ban đầu cho mỗi người dùng
    users.forEach(user => {
      // Đảm bảo rằng mỗi người dùng có một chỉ mục ảnh, ngay cả khi họ không có ảnh
      newImageIndexes[user._id] = 0;
    });
    
    setImageIndexes(newImageIndexes);
    
  }, [users]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          minAge: filters.minAge,
          maxAge: filters.maxAge,
          maxDistance: filters.maxDistance,
          teaPreferences: filters.teaPreferences.join(','),
          hobbies: filters.hobbies.join(','),
          zodiacSigns: filters.zodiacSigns.join(','),
          lookingFor: filters.lookingFor.join(','),
          smoking: filters.lifestyle.smoking.join(','),
          drinking: filters.lifestyle.drinking.join(','),
          exercise: filters.lifestyle.exercise.join(',')
        }
      };
      
      const response = await axios.get(`${API_URL}/api/users`, config);
      console.log('Explore - Users data from API:', response.data);
      setUsers(response.data);
      setCurrentIndex(0);
      setLikedUsers([]);
      setDislikedUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
      showErrorToast('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayFilterChange = (category, item) => {
    setFilters(prev => {
      const items = [...prev[category]];
      
      if (items.includes(item)) {
        // Remove if already selected
        return {
          ...prev,
          [category]: items.filter(i => i !== item)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [category]: [...items, item]
        };
      }
    });
  };
  
  const handleLifestyleFilterChange = (category, value) => {
    setFilters(prev => {
      const values = [...prev.lifestyle[category]];
      
      if (values.includes(value)) {
        // Remove if already selected
        return {
          ...prev,
          lifestyle: {
            ...prev.lifestyle,
            [category]: values.filter(v => v !== value)
          }
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          lifestyle: {
            ...prev.lifestyle,
            [category]: [...values, value]
          }
        };
      }
    });
  };
  
  const handleTeaPreferenceChange = (tea) => {
    handleArrayFilterChange('teaPreferences', tea);
  };
  
  const handleHobbyChange = (hobby) => {
    handleArrayFilterChange('hobbies', hobby);
  };
  
  const handleZodiacChange = (zodiac) => {
    handleArrayFilterChange('zodiacSigns', zodiac.value);
  };
  
  const handleLookingForChange = (option) => {
    handleArrayFilterChange('lookingFor', option.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
    setShowFilters(false);
  };
  
  const handleLike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Prevent duplicate likes
      if (likedUsers.includes(userId)) {
        return;
      }
      
      // Gửi yêu cầu API để thích người dùng
      const response = await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'like'
      }, config);
      
      // Cập nhật trạng thái cục bộ
      setLikedUsers(prev => [...prev, userId]);
      
      // Hiển thị thông báo thành công
      if (response.data.isMatch) {
        showSuccessToast('Bạn đã có một kết đôi mới!');
      } else {
        showSuccessToast('Đã thích người dùng này!');
      }
      
      // Move to next user in swipe mode
      if (viewMode === 'swipe' && currentIndex < users.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error liking user:', error);
      
      // Kiểm tra nếu lỗi là do đạt giới hạn lượt thích
      if (error.response?.status === 403 && error.response?.data?.message?.includes('giới hạn lượt thích')) {
        showErrorToast('Bạn đã sử dụng hết lượt thích hôm nay!');
      } else if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        showErrorToast(error.response?.data?.message || 'Không thể thích người dùng này');
      } else {
        console.error('Chi tiết lỗi:', error);
        showErrorToast('Đã xảy ra lỗi khi thích người dùng. Vui lòng thử lại sau.');
      }
    }
  };
  
  const handleDislike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Prevent duplicate dislikes
      if (dislikedUsers.includes(userId)) {
        return;
      }
      
      // Gửi yêu cầu API để bỏ qua người dùng
      await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'dislike'
      }, config);
      
      // Cập nhật trạng thái cục bộ
      setDislikedUsers(prev => [...prev, userId]);
      
      // Move to next user in swipe mode
      if (viewMode === 'swipe' && currentIndex < users.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error disliking user:', error);
      
      if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        showErrorToast(error.response?.data?.message || 'Không thể bỏ qua người dùng này');
      } else {
        console.error('Chi tiết lỗi:', error);
        showErrorToast('Đã xảy ra lỗi khi bỏ qua người dùng. Vui lòng thử lại sau.');
      }
    }
  };
  
  const handleUserClick = (user) => {
    setActiveUser(user);
    setShowUserDetail(true);
  };
  
  const handleRandomize = () => {
    // Shuffle users array
    const shuffled = [...users].sort(() => 0.5 - Math.random());
    setUsers(shuffled);
    showInfoToast('Đã xáo trộn danh sách người dùng!');
  };
  
  const resetFilters = () => {
    setFilters({
      minAge: 18,
      maxAge: 50,
      maxDistance: 50,
      teaPreferences: [],
      hobbies: [],
      zodiacSigns: [],
      lookingFor: [],
      lifestyle: {
        smoking: [],
        drinking: [],
        exercise: []
      }
    });
    showInfoToast('Đã đặt lại bộ lọc!');
  };
  
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  return (
    <div className="min-h-screen relative">
      {/* Background gradient - full screen */}
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 z-0"></div>
      <div className="relative z-10 w-full py-6 px-4 pt-20">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header with title and controls */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-center mb-8 mt-6"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4 md:mb-0 mt-2">
              <span className="text-yellow-500 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Khám phá</span> 
              <span className="relative ml-2">
                người dùng
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></span>
              </span>
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* View mode toggle */}
              <div className="bg-white rounded-2xl shadow-md p-2 flex flex-wrap gap-2 backdrop-blur-sm bg-white/80 border border-white/20">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2.5 rounded-xl flex items-center ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-all duration-300`}
                  title="Chế độ lưới"
                >
                  <FaTh className="mr-0 md:mr-2" />
                  <span className="hidden md:inline font-medium">Lưới</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2.5 rounded-xl flex items-center ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-all duration-300`}
                  title="Chế độ danh sách"
                >
                  <FaList className="mr-0 md:mr-2" />
                  <span className="hidden md:inline font-medium">Danh sách</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setViewMode('swipe')}
                  className={`px-4 py-2.5 rounded-xl flex items-center ${
                    viewMode === 'swipe' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-all duration-300`}
                  title="Chế độ vuốt"
                >
                  <FaHeart className="mr-0 md:mr-2" />
                  <span className="hidden md:inline font-medium">Vuốt</span>
                </motion.button>
              </div>
              
              {/* Randomize button */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5 }}
                onClick={handleRandomize}
                className="p-2.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-md text-gray-600 hover:bg-white hover:text-yellow-500 transition-all duration-300 border border-white/20"
                title="Xáo trộn ngẫu nhiên"
              >
                <FaRandom />
              </motion.button>
              
              {/* Filter button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl shadow-md flex items-center transition-all duration-300 ${showFilters ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-white/20'}`}
              >
                <FaFilter className="mr-2" />
                <span className="hidden md:inline font-medium">Bộ lọc</span>
              </motion.button>
            </div>
          </motion.div>
          
          {/* Filters panel - slide down when active */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                ref={filtersRef}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8 overflow-hidden border border-white/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                      <FaSearch className="text-white" />
                    </span>
                    Tìm kiếm nâng cao
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="text-sm font-medium text-yellow-500 hover:text-orange-500 transition-colors duration-300 flex items-center"
                  >
                    <span className="mr-1">Đặt lại bộ lọc</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Basic filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-white/50">
                      <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        Độ tuổi
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="minAge"
                          value={filters.minAge}
                          onChange={handleFilterChange}
                          min="18"
                          max="100"
                          className="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm"
                        />
                        <span className="mx-2 text-gray-400">-</span>
                        <input
                          type="number"
                          name="maxAge"
                          value={filters.maxAge}
                          onChange={handleFilterChange}
                          min="18"
                          max="100"
                          className="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-white/50">
                      <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <FaMapMarkerAlt className="text-yellow-600 text-xs" />
                        </span>
                        Khoảng cách tối đa
                      </label>
                      <div className="relative px-1">
                        <input
                          type="range"
                          name="maxDistance"
                          value={filters.maxDistance}
                          onChange={handleFilterChange}
                          min="1"
                          max="500"
                          className="w-full h-2 bg-gradient-to-r from-yellow-200 to-orange-300 rounded-lg appearance-none cursor-pointer"
                          style={{
                            WebkitAppearance: 'none',
                            appearance: 'none'
                          }}
                        />
                        <style jsx>{`
                          input[type=range]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: #fff;
                            border: 2px solid #f59e0b;
                            cursor: pointer;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                          }
                        `}</style>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-gray-500">1km</span>
                          <span className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">{filters.maxDistance}km</span>
                          <span className="text-xs text-gray-500">500km</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-white/50">
                      <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </span>
                        Đang tìm kiếm
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {LOOKING_FOR_OPTIONS.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`looking-for-${index}`}
                              checked={filters.lookingFor.includes(option.value)}
                              onChange={() => handleLookingForChange(option)}
                              className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded-md"
                            />
                            <label htmlFor={`looking-for-${index}`} className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Collapsible sections */}
                  <div className="space-y-5">
                    {/* Tea preferences */}
                    <motion.div 
                      className="border border-white/50 rounded-xl overflow-hidden bg-white/60 shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, showTeaPreferences: !prev.showTeaPreferences }))}
                        className="w-full px-5 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 flex justify-between items-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-semibold text-gray-700 flex items-center">
                          <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </span>
                          Sở thích trà sữa
                        </span>
                        <motion.div
                          animate={{ rotate: filters.showTeaPreferences ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <FaChevronDown className="text-yellow-500 text-xs" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {filters.showTeaPreferences && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {TEA_PREFERENCES.map((tea, index) => (
                                  <div key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`tea-filter-${index}`}
                                      checked={filters.teaPreferences.includes(tea)}
                                      onChange={() => handleTeaPreferenceChange(tea)}
                                      className="mr-2 h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded-md"
                                    />
                                    <label htmlFor={`tea-filter-${index}`} className="text-sm text-gray-700 hover:text-yellow-600 cursor-pointer">
                                      {tea}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Hobbies */}
                    <motion.div 
                      className="border border-white/50 rounded-xl overflow-hidden bg-white/60 shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, showHobbies: !prev.showHobbies }))}
                        className="w-full px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-semibold text-gray-700 flex items-center">
                          <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          Sở thích
                        </span>
                        <motion.div
                          animate={{ rotate: filters.showHobbies ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <FaChevronDown className="text-blue-500 text-xs" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {filters.showHobbies && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {HOBBIES.map((hobby, index) => (
                                  <div key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`hobby-filter-${index}`}
                                      checked={filters.hobbies.includes(hobby)}
                                      onChange={() => handleHobbyChange(hobby)}
                                      className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded-md"
                                    />
                                    <label htmlFor={`hobby-filter-${index}`} className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                                      {hobby}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Zodiac signs */}
                    <motion.div 
                      className="border border-white/50 rounded-xl overflow-hidden bg-white/60 shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, showZodiac: !prev.showZodiac }))}
                        className="w-full px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-semibold text-gray-700 flex items-center">
                          <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </span>
                          Cung hoàng đạo
                        </span>
                        <motion.div
                          animate={{ rotate: filters.showZodiac ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <FaChevronDown className="text-purple-500 text-xs" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {filters.showZodiac && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {ZODIAC_SIGNS.map((zodiac, index) => (
                                  <div key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`zodiac-filter-${index}`}
                                      checked={filters.zodiacSigns.includes(zodiac.value)}
                                      onChange={() => handleZodiacChange(zodiac)}
                                      className="mr-2 h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded-md"
                                    />
                                    <label htmlFor={`zodiac-filter-${index}`} className="text-sm text-gray-700 hover:text-purple-600 cursor-pointer">
                                      {zodiac.value}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Lifestyle */}
                    <motion.div 
                      className="border border-white/50 rounded-xl overflow-hidden bg-white/60 shadow-sm"
                      whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, showLifestyle: !prev.showLifestyle }))}
                        className="w-full px-5 py-4 bg-gradient-to-r from-green-50 to-teal-50 flex justify-between items-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-semibold text-gray-700 flex items-center">
                          <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </span>
                          Lối sống
                        </span>
                        <motion.div
                          animate={{ rotate: filters.showLifestyle ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <FaChevronDown className="text-green-500 text-xs" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {filters.showLifestyle && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/50 p-3 rounded-lg">
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                    </span>
                                    Hút thuốc
                                  </h4>
                                  {LIFESTYLE_OPTIONS.smoking.map((option, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <input
                                        type="checkbox"
                                        id={`smoking-filter-${index}`}
                                        checked={filters.lifestyle.smoking.includes(option.value)}
                                        onChange={() => handleLifestyleFilterChange('smoking', option.value)}
                                        className="mr-2 h-4 w-4 text-red-500 focus:ring-red-400 border-gray-300 rounded-md"
                                      />
                                      <label htmlFor={`smoking-filter-${index}`} className="text-sm text-gray-700 hover:text-red-600 cursor-pointer">
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="bg-white/50 p-3 rounded-lg">
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </span>
                                    Uống rượu
                                  </h4>
                                  {LIFESTYLE_OPTIONS.drinking.map((option, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <input
                                        type="checkbox"
                                        id={`drinking-filter-${index}`}
                                        checked={filters.lifestyle.drinking.includes(option.value)}
                                        onChange={() => handleLifestyleFilterChange('drinking', option.value)}
                                        className="mr-2 h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded-md"
                                      />
                                      <label htmlFor={`drinking-filter-${index}`} className="text-sm text-gray-700 hover:text-amber-600 cursor-pointer">
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="bg-white/50 p-3 rounded-lg">
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </span>
                                    Tập thể dục
                                  </h4>
                                  {LIFESTYLE_OPTIONS.exercise.map((option, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <input
                                        type="checkbox"
                                        id={`exercise-filter-${index}`}
                                        checked={filters.lifestyle.exercise.includes(option.value)}
                                        onChange={() => handleLifestyleFilterChange('exercise', option.value)}
                                        className="mr-2 h-4 w-4 text-green-500 focus:ring-green-400 border-gray-300 rounded-md"
                                      />
                                      <label htmlFor={`exercise-filter-${index}`} className="text-sm text-gray-700 hover:text-green-600 cursor-pointer">
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 mr-3 hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm"
                    >
                      Hủy
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(251, 146, 60, 0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 shadow-md font-medium transition-all duration-300"
                    >
                      <FaSearch className="inline mr-2" />
                      Tìm kiếm
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* User List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[25px] shadow-md">
              <div className="text-yellow-500 text-5xl mb-4 flex justify-center">
                <FaSearch className="opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy người dùng phù hợp</h3>
              <p className="text-gray-500 mb-6">Hãy thử điều chỉnh bộ lọc của bạn để xem nhiều kết quả hơn</p>
              <button
                onClick={resetFilters}
                className="mt-4 mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-white/30"
                    >
                      <div className="relative h-72 overflow-hidden group">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.fullName} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : user.photos && user.photos.length > 0 ? (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.img 
                                key={imageIndexes[user._id] || 0}
                                src={user.photos[(imageIndexes[user._id] || 0) % user.photos.length]} 
                                alt={`${user.fullName} - ảnh ${(imageIndexes[user._id] || 0) + 1}`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            </AnimatePresence>
                            
                            {/* Hiển thị điều khiển slide khi có nhiều hơn 1 ảnh */}
                            {user.photos.length > 1 && (
                              <>
                                {/* Nút điều hướng trái */}
                                <button 
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = imageIndexes[user._id] || 0;
                                    const newIndex = currentIndex === 0 ? user.photos.length - 1 : currentIndex - 1;
                                    setImageIndexes(prev => ({...prev, [user._id]: newIndex}));
                                  }}
                                  aria-label="Ảnh trước"
                                >
                                  <FaChevronLeft />
                                </button>
                                
                                {/* Nút điều hướng phải */}
                                <button 
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = imageIndexes[user._id] || 0;
                                    const newIndex = (currentIndex + 1) % user.photos.length;
                                    setImageIndexes(prev => ({...prev, [user._id]: newIndex}));
                                  }}
                                  aria-label="Ảnh tiếp theo"
                                >
                                  <FaChevronRight />
                                </button>
                                
                                {/* Chỉ báo vị trí ảnh */}
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-10">
                                  {user.photos.map((_, index) => (
                                    <button
                                      key={index}
                                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === (imageIndexes[user._id] || 0) 
                                          ? 'bg-white scale-125' 
                                          : 'bg-white/50 hover:bg-white/80'
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageIndexes(prev => ({...prev, [user._id]: index}));
                                      }}
                                      aria-label={`Chuyển đến ảnh ${index + 1}`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center">
                            <span className="text-white text-5xl font-bold drop-shadow-md">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
                        
                        {/* User basic info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-xl font-bold drop-shadow-sm">
                            {user.fullName}, {calculateAge(user.birthDate)}
                          </h3>
                          {user.city && (
                            <p className="text-white/90 flex items-center mt-1 text-sm drop-shadow-sm">
                              <FaMapMarkerAlt className="mr-1" size={12} />
                              {user.city}
                            </p>
                          )}
                        </div>
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex space-x-3 items-center">
                            <motion.button
                              whileHover={{ scale: 1.1, y: -5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDislike(user._id);
                              }}
                              className={`p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all ${dislikedUsers.includes(user._id) ? 'bg-red-50 text-red-500' : ''}`}
                              title="Không thích"
                            >
                              <FaTimes size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.2, y: -8 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUserClick(user)}
                              className="p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-all"
                              title="Xem chi tiết"
                            >
                              <FaInfoCircle size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, y: -5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(user._id);
                              }}
                              className={`p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-all ${likedUsers.includes(user._id) ? 'bg-pink-50 text-pink-500' : ''}`}
                              title="Thích"
                            >
                              {likedUsers.includes(user._id) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Basic Info Row */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {user.gender && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center">
                              <span className="mr-1">👤</span> {getGenderText(user.gender)}
                            </span>
                          )}
                          {user.zodiacSign && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center">
                              <span className="mr-1">✨</span> {user.zodiacSign}
                            </span>
                          )}
                          {user.height && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
                              <span className="mr-1">📏</span> {user.height} cm
                            </span>
                          )}
                        </div>
                        
                        {/* Occupation & Education */}
                        <div className="mb-2">
                          {user.occupation && (
                            <div className="flex items-center text-sm text-gray-700 mb-1">
                              <span className="mr-1.5 text-yellow-500">💼</span>
                              <span className="font-medium">{user.occupation}</span>
                              {user.company && <span className="ml-1 text-gray-500">tại {user.company}</span>}
                            </div>
                          )}
                          {user.education && (
                            <div className="flex items-center text-sm text-gray-700">
                              <span className="mr-1.5 text-blue-500">🎓</span>
                              <span className="font-medium">{user.education}</span>
                              {user.school && <span className="ml-1 text-gray-500">tại {user.school}</span>}
                            </div>
                          )}
                        </div>
                        
                        {/* Looking For */}
                        {user.lookingFor && (
                          <div className="mb-2">
                            <span className="text-sm text-yellow-700 font-medium flex items-center">
                              <span className="mr-1.5 text-pink-500">❤️</span>
                              {LOOKING_FOR_OPTIONS.find(option => option.value === user.lookingFor)?.label || user.lookingFor}
                            </span>
                          </div>
                        )}
                        
                        {/* Bio */}
                        {user.bio && (
                          <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                        
                        {/* Lifestyle Section */}
                        {(user.lifestyle?.smoking || user.lifestyle?.drinking || 
                          user.lifestyle?.exercise || user.lifestyle?.diet) && (
                          <div className="mt-3 mb-2">
                            <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                              <span className="mr-1">🌿</span> Lối sống
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {user.lifestyle?.smoking && user.lifestyle.smoking !== '' && (
                                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                                  {user.lifestyle.smoking === 'never' ? 'Không hút thuốc' : 
                                    user.lifestyle.smoking === 'sometimes' ? 'Hút thuốc thỉnh thoảng' : 
                                    user.lifestyle.smoking === 'often' ? 'Hút thuốc thường xuyên' : 
                                    user.lifestyle.smoking === 'quitting' ? 'Đang cai thuốc' : ''}
                                </span>
                              )}
                              {user.lifestyle?.drinking && user.lifestyle.drinking !== '' && (
                                <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                                  {user.lifestyle.drinking === 'never' ? 'Không uống rượu' : 
                                    user.lifestyle.drinking === 'sometimes' ? 'Uống rượu thỉnh thoảng' : 
                                    user.lifestyle.drinking === 'often' ? 'Uống rượu thường xuyên' : 
                                    user.lifestyle.drinking === 'quitting' ? 'Đang cai rượu' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {/* Tea Preferences Section */}
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                              <span className="mr-1">🧋</span> Trà sữa
                            </p>
                            
                            {/* Tea Preferences */}
                            {user.teaPreferences && user.teaPreferences.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {user.teaPreferences.slice(0, 2).map((tea, index) => (
                                  <span 
                                    key={index} 
                                    className="px-2 py-0.5 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 text-xs rounded-full border border-yellow-200 shadow-sm"
                                  >
                                    {tea}
                                  </span>
                                ))}
                                {user.teaPreferences.length > 2 && (
                                  <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200 shadow-sm">
                                    +{user.teaPreferences.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Additional Tea Info */}
                            <div className="flex flex-wrap gap-1.5">
                              {user.favoriteTea && (
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                  Yêu thích: {user.favoriteTea}
                                </span>
                              )}
                              {user.sugarLevel && (
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                  Đường: {user.sugarLevel}
                                </span>
                              )}
                              {user.iceLevel && (
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                  Đá: {user.iceLevel}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Hobbies & Languages */}
                          <div className="flex flex-wrap gap-4">
                            {/* Hobbies */}
                            {user.hobbies && user.hobbies.length > 0 && (
                              <div className="flex-1 min-w-[45%]">
                                <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                  <span className="mr-1">🎮</span> Sở thích
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {user.hobbies.slice(0, 2).map((hobby, index) => (
                                    <span 
                                      key={index} 
                                      className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full border border-blue-200 shadow-sm"
                                    >
                                      {hobby}
                                    </span>
                                  ))}
                                  {user.hobbies.length > 2 && (
                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200 shadow-sm">
                                      +{user.hobbies.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Languages */}
                            {user.languages && user.languages.length > 0 && (
                              <div className="flex-1 min-w-[45%]">
                                <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                  <span className="mr-1">🗣️</span> Ngôn ngữ
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {user.languages.map((language, index) => (
                                    <span 
                                      key={index} 
                                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200 shadow-sm"
                                    >
                                      {language}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-5">
                  {users.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-white/30"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-56 h-56 sm:h-auto relative overflow-hidden group">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.fullName} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center">
                              <span className="text-white text-5xl font-bold drop-shadow-md">
                                {user.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                          
                          {/* Hover info */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUserClick(user)}
                              className="p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-all"
                              title="Xem chi tiết"
                            >
                              <FaInfoCircle size={20} />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="p-5 flex-1">
                          {/* Header with name, age, gender */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 flex items-center flex-wrap gap-2">
                                {user.fullName}, {calculateAge(user.birthDate)}
                                {user.gender && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center">
                                    <span className="mr-1">👤</span> {getGenderText(user.gender)}
                                  </span>
                                )}
                                {user.zodiacSign && (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center">
                                    <span className="mr-1">✨</span> {user.zodiacSign}
                                  </span>
                                )}
                              </h3>
                              
                              {/* Location and Occupation */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                {user.city && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <FaMapMarkerAlt className="mr-1.5 text-gray-500" size={14} />
                                    {user.city}
                                  </p>
                                )}
                                {user.occupation && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <span className="mr-1.5 text-yellow-500">💼</span>
                                    {user.occupation}
                                    {user.company && <span className="ml-1 text-gray-500">tại {user.company}</span>}
                                  </p>
                                )}
                              </div>
                              
                              {/* Education */}
                              {user.education && (
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <span className="mr-1.5 text-blue-500">🎓</span>
                                  {user.education}
                                  {user.school && <span className="ml-1 text-gray-500">tại {user.school}</span>}
                                </p>
                              )}
                              
                              {/* Looking For */}
                              {user.lookingFor && (
                                <p className="text-sm text-yellow-600 font-medium mt-2 flex items-center">
                                  <span className="mr-1.5 text-pink-500">❤️</span>
                                  {LOOKING_FOR_OPTIONS.find(option => option.value === user.lookingFor)?.label || user.lookingFor}
                                </p>
                              )}
                            </div>
                            
                            {/* Right side info */}
                            <div className="flex flex-col items-end space-y-1.5">
                              {user.height && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
                                  <span className="mr-1">📏</span> {user.height} cm
                                </span>
                              )}
                              {user.online && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Online
                                </span>
                              )}
                              {!user.online && user.lastActive && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span> 
                                  {new Date(user.lastActive).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Bio */}
                          {user.bio && (
                            <div className="mt-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                              <p className="text-gray-600 text-sm">
                                {user.bio}
                              </p>
                            </div>
                          )}
                          
                          {/* Lifestyle Section */}
                          {(user.lifestyle?.smoking || user.lifestyle?.drinking || 
                            user.lifestyle?.exercise || user.lifestyle?.diet) && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                <span className="mr-1">🌿</span> Lối sống
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {user.lifestyle?.smoking && user.lifestyle.smoking !== '' && (
                                  <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                                    {user.lifestyle.smoking === 'never' ? 'Không hút thuốc' : 
                                      user.lifestyle.smoking === 'sometimes' ? 'Hút thuốc thỉnh thoảng' : 
                                      user.lifestyle.smoking === 'often' ? 'Hút thuốc thường xuyên' : 
                                      user.lifestyle.smoking === 'quitting' ? 'Đang cai thuốc' : ''}
                                  </span>
                                )}
                                {user.lifestyle?.drinking && user.lifestyle.drinking !== '' && (
                                  <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                                    {user.lifestyle.drinking === 'never' ? 'Không uống rượu' : 
                                      user.lifestyle.drinking === 'sometimes' ? 'Uống rượu thỉnh thoảng' : 
                                      user.lifestyle.drinking === 'often' ? 'Uống rượu thường xuyên' : 
                                      user.lifestyle.drinking === 'quitting' ? 'Đang cai rượu' : ''}
                                  </span>
                                )}
                                {user.lifestyle?.exercise && user.lifestyle.exercise !== '' && (
                                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                                    {user.lifestyle.exercise === 'never' ? 'Không tập thể dục' : 
                                      user.lifestyle.exercise === 'sometimes' ? 'Tập thỉnh thoảng' : 
                                      user.lifestyle.exercise === 'often' ? 'Tập thường xuyên' : 
                                      user.lifestyle.exercise === 'daily' ? 'Tập hàng ngày' : ''}
                                  </span>
                                )}
                                {user.lifestyle?.diet && user.lifestyle.diet !== '' && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                                    {user.lifestyle.diet === 'omnivore' ? 'Ăn tạp' : 
                                      user.lifestyle.diet === 'vegetarian' ? 'Ăn chay' : 
                                      user.lifestyle.diet === 'vegan' ? 'Thuần chay' : 
                                      user.lifestyle.diet === 'pescatarian' ? 'Ăn hải sản' : 
                                      user.lifestyle.diet === 'keto' ? 'Keto' : 
                                      user.lifestyle.diet === 'other' ? 'Chế độ ăn khác' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Tea Preferences and Hobbies */}
                          <div className="mt-4 flex flex-wrap gap-4">
                            {/* Tea Preferences */}
                            <div className="flex-1 min-w-[45%]">
                              <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                <span className="mr-1">🧋</span> Trà sữa
                              </p>
                              
                              {/* Tea Preferences */}
                              {user.teaPreferences && user.teaPreferences.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-1.5">
                                  {user.teaPreferences.map((tea, index) => (
                                    <span 
                                      key={index} 
                                      className="px-2 py-0.5 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 text-xs rounded-full border border-yellow-200 shadow-sm"
                                    >
                                      {tea}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Additional Tea Info */}
                              <div className="flex flex-wrap gap-1.5">
                                {user.favoriteTea && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    Yêu thích: {user.favoriteTea}
                                  </span>
                                )}
                                {user.sugarLevel && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    Đường: {user.sugarLevel}
                                  </span>
                                )}
                                {user.iceLevel && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    Đá: {user.iceLevel}
                                  </span>
                                )}
                                {user.teaFrequency && (
                                  <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                                    Tần suất: {user.teaFrequency === 'daily' ? 'Hàng ngày' : 
                                      user.teaFrequency === 'weekly' ? 'Hàng tuần' : 
                                      user.teaFrequency === 'monthly' ? 'Hàng tháng' : 
                                      user.teaFrequency === 'rarely' ? 'Hiếm khi' : ''}
                                  </span>
                                )}
                              </div>
                              
                              {/* Toppings */}
                              {user.toppings && user.toppings.length > 0 && (
                                <div className="mt-1.5">
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.toppings.map((topping, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100"
                                      >
                                        {topping}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Hobbies and Languages */}
                            <div className="flex-1 min-w-[45%]">
                              {/* Hobbies */}
                              {user.hobbies && user.hobbies.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                    <span className="mr-1">🎮</span> Sở thích
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.hobbies.slice(0, 5).map((hobby, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full border border-blue-200 shadow-sm"
                                      >
                                        {hobby}
                                      </span>
                                    ))}
                                    {user.hobbies.length > 5 && (
                                      <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200 shadow-sm">
                                        +{user.hobbies.length - 5}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Languages */}
                              {user.languages && user.languages.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center">
                                    <span className="mr-1">🗣️</span> Ngôn ngữ
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.languages.map((language, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200 shadow-sm"
                                      >
                                        {language}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5 flex flex-row sm:flex-row justify-center items-center space-x-3 sm:space-x-3 sm:space-y-0 border-t sm:border-t-0 sm:border-l border-gray-100 bg-gradient-to-b from-gray-50/50 to-white/50">
                          <motion.button
                            whileHover={{ scale: 1.1, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDislike(user._id);
                            }}
                            className={`p-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-500 transition-all duration-300 ${dislikedUsers.includes(user._id) ? 'bg-red-50 text-red-500 shadow-md' : 'bg-white shadow-sm'}`}
                            title="Không thích"
                          >
                            <FaTimes size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(user._id)}
                            className={`p-3 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-all duration-300 ${likedUsers.includes(user._id) ? 'bg-pink-50 text-pink-500 shadow-md' : 'bg-white shadow-sm'}`}
                            title="Thích"
                          >
                            {likedUsers.includes(user._id) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Swipe View */}
              {viewMode === 'swipe' && (
                <div className="flex justify-center">
                  <div className="w-full max-w-lg">
                    {users.length > 0 && currentIndex < users.length ? (
                      <motion.div
                        key={users[currentIndex]._id}
                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/30"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = offset.x;
                          if (swipe < -100) {
                            handleDislike(users[currentIndex]._id);
                          } else if (swipe > 100) {
                            handleLike(users[currentIndex]._id);
                          }
                        }}
                      >
                        {/* Card Header - Photo */}
                        <div className="relative h-[500px] overflow-hidden">
                          {users[currentIndex].avatar ? (
                            <img 
                              src={users[currentIndex].avatar} 
                              alt={users[currentIndex].fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : users[currentIndex].photos && users[currentIndex].photos.length > 0 ? (
                            <>
                              <AnimatePresence mode="wait">
                                <motion.img 
                                  key={imageIndexes[users[currentIndex]._id] || 0}
                                  src={users[currentIndex].photos[imageIndexes[users[currentIndex]._id] || 0]} 
                                  alt={`${users[currentIndex].fullName} - ảnh ${(imageIndexes[users[currentIndex]._id] || 0) + 1}`} 
                                  className="w-full h-full object-cover"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                />
                              </AnimatePresence>
                              
                              {/* Hiển thị điều khiển slide khi có nhiều hơn 1 ảnh */}
                              {users[currentIndex].photos.length > 1 && (
                                <>
                                  {/* Nút điều hướng trái */}
                                  <button 
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm z-10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentUser = users[currentIndex];
                                      const currentIdx = imageIndexes[currentUser._id] || 0;
                                      const newIndex = currentIdx === 0 ? currentUser.photos.length - 1 : currentIdx - 1;
                                      setImageIndexes(prev => ({...prev, [currentUser._id]: newIndex}));
                                    }}
                                    aria-label="Ảnh trước"
                                  >
                                    <FaChevronLeft size={20} />
                                  </button>
                                  
                                  {/* Nút điều hướng phải */}
                                  <button 
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm z-10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentUser = users[currentIndex];
                                      const currentIdx = imageIndexes[currentUser._id] || 0;
                                      const newIndex = (currentIdx + 1) % currentUser.photos.length;
                                      setImageIndexes(prev => ({...prev, [currentUser._id]: newIndex}));
                                    }}
                                    aria-label="Ảnh tiếp theo"
                                  >
                                    <FaChevronRight size={20} />
                                  </button>
                                  
                                  {/* Chỉ báo vị trí ảnh */}
                                  <div className="absolute bottom-24 left-0 right-0 flex justify-center space-x-2 z-10">
                                    {users[currentIndex].photos.map((_, index) => (
                                      <button
                                        key={index}
                                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                          index === (imageIndexes[users[currentIndex]._id] || 0) 
                                            ? 'bg-white scale-125' 
                                            : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setImageIndexes(prev => ({...prev, [users[currentIndex]._id]: index}));
                                        }}
                                        aria-label={`Chuyển đến ảnh ${index + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
                              <span className="text-white text-8xl font-bold drop-shadow-lg">
                                {users[currentIndex].fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Gradient overlay - smoother gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                          
                          {/* User info overlay - cleaner layout */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            {/* Tags row - Basic Info */}
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              {users[currentIndex].zodiacSign && (
                                <span className="px-3 py-1 bg-yellow-500/40 text-white text-xs font-medium rounded-full backdrop-blur-md border border-yellow-400/30 shadow-sm flex items-center">
                                  <span className="mr-1">✨</span> {users[currentIndex].zodiacSign}
                                </span>
                              )}
                              {users[currentIndex].gender && (
                                <span className="px-3 py-1 bg-purple-500/40 text-white text-xs font-medium rounded-full backdrop-blur-md border border-purple-400/30 shadow-sm flex items-center">
                                  <span className="mr-1">👤</span> {getGenderText(users[currentIndex].gender)}
                                </span>
                              )}
                              {users[currentIndex].lookingFor && (
                                <span className="px-3 py-1 bg-pink-500/40 text-white text-xs font-medium rounded-full backdrop-blur-md border border-pink-400/30 shadow-sm flex items-center">
                                  <span className="mr-1">❤️</span> {LOOKING_FOR_OPTIONS.find(option => option.value === users[currentIndex].lookingFor)?.label || users[currentIndex].lookingFor}
                                </span>
                              )}
                              {users[currentIndex].height && (
                                <span className="px-3 py-1 bg-green-500/40 text-white text-xs font-medium rounded-full backdrop-blur-md border border-green-400/30 shadow-sm flex items-center">
                                  <span className="mr-1">📏</span> {users[currentIndex].height}cm
                                </span>
                              )}
                            </div>
                            
                            {/* Name and age - larger and more prominent */}
                            <h3 className="text-3xl font-bold drop-shadow-md mb-1">
                              {users[currentIndex].fullName}, {calculateAge(users[currentIndex].birthDate)}
                            </h3>
                            
                            {/* Location and Occupation */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                              {users[currentIndex].city && (
                                <p className="text-white/90 flex items-center text-sm font-medium">
                                  <FaMapMarkerAlt className="mr-1.5" size={14} />
                                  {users[currentIndex].city}
                                </p>
                              )}
                              {users[currentIndex].occupation && (
                                <p className="text-white/90 flex items-center text-sm font-medium">
                                  <span className="mr-1.5">💼</span>
                                  {users[currentIndex].occupation}
                                  {users[currentIndex].company && ` tại ${users[currentIndex].company}`}
                                </p>
                              )}
                              {users[currentIndex].education && (
                                <p className="text-white/90 flex items-center text-sm font-medium">
                                  <span className="mr-1.5">🎓</span>
                                  {users[currentIndex].education}
                                  {users[currentIndex].school && ` tại ${users[currentIndex].school}`}
                                </p>
                              )}
                            </div>
                            
                            {/* Bio in a clean card */}
                            {users[currentIndex].bio && (
                              <div className="mt-2 p-3 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                                <p className="text-white/95 text-sm leading-relaxed">
                                  {users[currentIndex].bio}
                                </p>
                              </div>
                            )}
                            
                            {/* Lifestyle section */}
                            {(users[currentIndex].lifestyle?.smoking || users[currentIndex].lifestyle?.drinking || 
                              users[currentIndex].lifestyle?.exercise || users[currentIndex].lifestyle?.diet) && (
                              <div className="mt-3">
                                <p className="text-white/90 text-xs font-medium mb-1.5 flex items-center">
                                  <span className="mr-1">🌿</span> Lối sống
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {users[currentIndex].lifestyle?.smoking && users[currentIndex].lifestyle.smoking !== '' && (
                                    <span className="px-2 py-0.5 bg-red-500/40 text-white text-xs rounded-full backdrop-blur-md border border-red-400/30">
                                      Hút thuốc: {users[currentIndex].lifestyle.smoking === 'never' ? 'Không bao giờ' : 
                                        users[currentIndex].lifestyle.smoking === 'sometimes' ? 'Thỉnh thoảng' : 
                                        users[currentIndex].lifestyle.smoking === 'often' ? 'Thường xuyên' : 
                                        users[currentIndex].lifestyle.smoking === 'quitting' ? 'Đang cai' : ''}
                                    </span>
                                  )}
                                  {users[currentIndex].lifestyle?.drinking && users[currentIndex].lifestyle.drinking !== '' && (
                                    <span className="px-2 py-0.5 bg-purple-500/40 text-white text-xs rounded-full backdrop-blur-md border border-purple-400/30">
                                      Rượu bia: {users[currentIndex].lifestyle.drinking === 'never' ? 'Không bao giờ' : 
                                        users[currentIndex].lifestyle.drinking === 'sometimes' ? 'Thỉnh thoảng' : 
                                        users[currentIndex].lifestyle.drinking === 'often' ? 'Thường xuyên' : 
                                        users[currentIndex].lifestyle.drinking === 'quitting' ? 'Đang cai' : ''}
                                    </span>
                                  )}
                                  {users[currentIndex].lifestyle?.exercise && users[currentIndex].lifestyle.exercise !== '' && (
                                    <span className="px-2 py-0.5 bg-green-500/40 text-white text-xs rounded-full backdrop-blur-md border border-green-400/30">
                                      Tập thể dục: {users[currentIndex].lifestyle.exercise === 'never' ? 'Không bao giờ' : 
                                        users[currentIndex].lifestyle.exercise === 'sometimes' ? 'Thỉnh thoảng' : 
                                        users[currentIndex].lifestyle.exercise === 'often' ? 'Thường xuyên' : 
                                        users[currentIndex].lifestyle.exercise === 'daily' ? 'Hàng ngày' : ''}
                                    </span>
                                  )}
                                  {users[currentIndex].lifestyle?.diet && users[currentIndex].lifestyle.diet !== '' && (
                                    <span className="px-2 py-0.5 bg-blue-500/40 text-white text-xs rounded-full backdrop-blur-md border border-blue-400/30">
                                      Chế độ ăn: {users[currentIndex].lifestyle.diet === 'omnivore' ? 'Ăn tạp' : 
                                        users[currentIndex].lifestyle.diet === 'vegetarian' ? 'Ăn chay' : 
                                        users[currentIndex].lifestyle.diet === 'vegan' ? 'Thuần chay' : 
                                        users[currentIndex].lifestyle.diet === 'pescatarian' ? 'Ăn hải sản' : 
                                        users[currentIndex].lifestyle.diet === 'keto' ? 'Keto' : 
                                        users[currentIndex].lifestyle.diet === 'other' ? 'Khác' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Tea Preferences - Detailed */}
                            <div className="mt-3 flex flex-wrap gap-3">
                              {users[currentIndex].teaPreferences && users[currentIndex].teaPreferences.length > 0 && (
                                <div className="flex-1 min-w-[45%]">
                                  <p className="text-white/90 text-xs font-medium mb-1.5 flex items-center">
                                    <span className="mr-1">🧋</span> Trà sữa yêu thích
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {users[currentIndex].teaPreferences.map((tea, index) => (
                                      <span 
                                        key={index} 
                                        className="px-2 py-0.5 bg-yellow-500/40 text-white text-xs rounded-full backdrop-blur-md border border-yellow-400/30"
                                      >
                                        {tea}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {/* Additional Tea Info */}
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {users[currentIndex].favoriteTea && (
                                      <span className="px-2 py-0.5 bg-amber-500/40 text-white text-xs rounded-full backdrop-blur-md border border-amber-400/30">
                                        Yêu thích: {users[currentIndex].favoriteTea}
                                      </span>
                                    )}
                                    {users[currentIndex].sugarLevel && (
                                      <span className="px-2 py-0.5 bg-amber-500/40 text-white text-xs rounded-full backdrop-blur-md border border-amber-400/30">
                                        Đường: {users[currentIndex].sugarLevel}
                                      </span>
                                    )}
                                    {users[currentIndex].iceLevel && (
                                      <span className="px-2 py-0.5 bg-amber-500/40 text-white text-xs rounded-full backdrop-blur-md border border-amber-400/30">
                                        Đá: {users[currentIndex].iceLevel}
                                      </span>
                                    )}
                                    {users[currentIndex].teaFrequency && (
                                      <span className="px-2 py-0.5 bg-amber-500/40 text-white text-xs rounded-full backdrop-blur-md border border-amber-400/30">
                                        Tần suất: {users[currentIndex].teaFrequency === 'daily' ? 'Hàng ngày' : 
                                          users[currentIndex].teaFrequency === 'weekly' ? 'Hàng tuần' : 
                                          users[currentIndex].teaFrequency === 'monthly' ? 'Hàng tháng' : 
                                          users[currentIndex].teaFrequency === 'rarely' ? 'Hiếm khi' : ''}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Toppings */}
                                  {users[currentIndex].toppings && users[currentIndex].toppings.length > 0 && (
                                    <div className="mt-1.5">
                                      <div className="flex flex-wrap gap-1.5">
                                        {users[currentIndex].toppings.map((topping, index) => (
                                          <span 
                                            key={index} 
                                            className="px-2 py-0.5 bg-amber-500/40 text-white text-xs rounded-full backdrop-blur-md border border-amber-400/30"
                                          >
                                            {topping}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Hobbies and Languages */}
                              <div className="flex-1 min-w-[45%]">
                                {users[currentIndex].hobbies && users[currentIndex].hobbies.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-white/90 text-xs font-medium mb-1.5 flex items-center">
                                      <span className="mr-1">🎮</span> Sở thích
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {users[currentIndex].hobbies.slice(0, 5).map((hobby, index) => (
                                        <span 
                                          key={index} 
                                          className="px-2 py-0.5 bg-blue-500/40 text-white text-xs rounded-full backdrop-blur-md border border-blue-400/30"
                                        >
                                          {hobby}
                                        </span>
                                      ))}
                                      {users[currentIndex].hobbies.length > 5 && (
                                        <span className="px-2 py-0.5 bg-gray-500/40 text-white text-xs rounded-full backdrop-blur-md border border-gray-400/30">
                                          +{users[currentIndex].hobbies.length - 5}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {users[currentIndex].languages && users[currentIndex].languages.length > 0 && (
                                  <div>
                                    <p className="text-white/90 text-xs font-medium mb-1.5 flex items-center">
                                      <span className="mr-1">🗣️</span> Ngôn ngữ
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {users[currentIndex].languages.map((language, index) => (
                                        <span 
                                          key={index} 
                                          className="px-2 py-0.5 bg-indigo-500/40 text-white text-xs rounded-full backdrop-blur-md border border-indigo-400/30"
                                        >
                                          {language}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Swipe hint overlay */}
                          <div className="absolute inset-0 flex justify-between items-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="h-full w-1/3 bg-gradient-to-r from-red-500/20 to-transparent flex items-center justify-center">
                              <div className="bg-white/80 p-3 rounded-full shadow-lg">
                                <FaTimes className="text-red-500" size={24} />
                              </div>
                            </div>
                            <div className="h-full w-1/3 bg-gradient-to-l from-pink-500/20 to-transparent flex items-center justify-center">
                              <div className="bg-white/80 p-3 rounded-full shadow-lg">
                                <FaHeart className="text-pink-500" size={24} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons - modern floating design */}
                        <div className="relative">
                          <div className="absolute -top-8 left-0 right-0 flex justify-center space-x-4">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDislike(users[currentIndex]._id)}
                              className="p-4 bg-white rounded-full text-red-500 shadow-xl hover:bg-red-50 transition-all duration-300 border border-gray-100"
                            >
                              <FaTimes size={24} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUserClick(users[currentIndex])}
                              className="p-4 bg-white rounded-full text-blue-500 shadow-xl hover:bg-blue-50 transition-all duration-300 border border-gray-100"
                            >
                              <FaInfoCircle size={24} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLike(users[currentIndex]._id)}
                              className="p-4 bg-white rounded-full text-pink-500 shadow-xl hover:bg-pink-50 transition-all duration-300 border border-gray-100"
                            >
                              <FaHeart size={24} />
                            </motion.button>
                          </div>
                          
                          {/* Progress indicator - cleaner design */}
                          <div className="px-6 py-8 pt-12 bg-white">
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / users.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full"
                              ></motion.div>
                            </div>
                            <p className="text-center text-gray-400 text-xs mt-2 font-medium">
                              {currentIndex + 1} / {users.length}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30"
                      >
                        <div className="text-yellow-500 text-6xl mb-6 flex justify-center">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            <FaHeart className="opacity-80" />
                          </motion.div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">Đã xem hết tất cả người dùng</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Hãy thử điều chỉnh bộ lọc để xem thêm người dùng khác</p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3 px-6">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setCurrentIndex(0);
                              setLikedUsers([]);
                              setDislikedUsers([]);
                            }}
                            className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 shadow-md font-medium"
                          >
                            Xem lại từ đầu
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetFilters}
                            className="px-5 py-3 border border-yellow-400 text-yellow-500 rounded-xl hover:bg-yellow-50 font-medium"
                          >
                            Đặt lại bộ lọc
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserDetail && activeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4
              }}
              className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/30"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-80 overflow-hidden">
                {activeUser.photos && activeUser.photos.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={imageIndexes[activeUser._id] || 0}
                        src={activeUser.photos[imageIndexes[activeUser._id] || 0]} 
                        alt={`${activeUser.fullName} - ảnh ${(imageIndexes[activeUser._id] || 0) + 1}`} 
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>
                    
                    {/* Hiển thị điều khiển slide khi có nhiều hơn 1 ảnh */}
                    {activeUser.photos.length > 1 && (
                      <>
                        {/* Nút điều hướng trái */}
                        <button 
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIdx = imageIndexes[activeUser._id] || 0;
                            const newIndex = currentIdx === 0 ? activeUser.photos.length - 1 : currentIdx - 1;
                            setImageIndexes(prev => ({...prev, [activeUser._id]: newIndex}));
                          }}
                          aria-label="Ảnh trước"
                        >
                          <FaChevronLeft size={20} />
                        </button>
                        
                        {/* Nút điều hướng phải */}
                        <button 
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIdx = imageIndexes[activeUser._id] || 0;
                            const newIndex = (currentIdx + 1) % activeUser.photos.length;
                            setImageIndexes(prev => ({...prev, [activeUser._id]: newIndex}));
                          }}
                          aria-label="Ảnh tiếp theo"
                        >
                          <FaChevronRight size={20} />
                        </button>
                        
                        {/* Chỉ báo vị trí ảnh */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                          {activeUser.photos.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                index === (imageIndexes[activeUser._id] || 0) 
                                  ? 'bg-white scale-125' 
                                  : 'bg-white/50 hover:bg-white/80'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageIndexes(prev => ({...prev, [activeUser._id]: index}));
                              }}
                              aria-label={`Chuyển đến ảnh ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : activeUser.avatar ? (
                  <img 
                    src={activeUser.avatar} 
                    alt={activeUser.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
                    <span className="text-white text-7xl font-bold drop-shadow-lg">
                      {activeUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* User basic info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    {activeUser.gender && (
                      <span className="px-3 py-1 bg-purple-500/30 text-white text-sm rounded-full backdrop-blur-sm border border-purple-400/30 shadow-lg">
                        {getGenderText(activeUser.gender)}
                      </span>
                    )}
                    {activeUser.zodiacSign && (
                      <span className="px-3 py-1 bg-yellow-500/30 text-white text-sm rounded-full backdrop-blur-sm border border-yellow-400/30 shadow-lg">
                        {activeUser.zodiacSign}
                      </span>
                    )}
                    {activeUser.height && (
                      <span className="px-3 py-1 bg-green-500/30 text-white text-sm rounded-full backdrop-blur-sm border border-green-400/30 shadow-lg">
                        {activeUser.height} cm
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold drop-shadow-md">
                    {activeUser.fullName}, {calculateAge(activeUser.birthDate)}
                  </h2>
                  {activeUser.city && (
                    <p className="text-white/90 flex items-center mt-2">
                      <FaMapMarkerAlt className="mr-2" size={16} />
                      {activeUser.city}
                      {activeUser.distance && (
                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                          {activeUser.distance} km
                        </span>
                      )}
                    </p>
                  )}
                  {activeUser.lastActive && !activeUser.online && (
                    <p className="text-white/80 flex items-center mt-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
                      Hoạt động: {new Date(activeUser.lastActive).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {activeUser.online && (
                    <p className="text-white/90 flex items-center mt-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                      Đang hoạt động
                    </p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUserDetail(false)}
                  className="absolute top-5 right-5 p-2.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  <FaTimes size={18} />
                </motion.button>
              </div>
              
              <div className="p-8">
                {activeUser.lookingFor && (
                  <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Đang tìm kiếm
                    </h3>
                    <p className="text-yellow-700 font-medium">
                      {LOOKING_FOR_OPTIONS.find(option => option.value === activeUser.lookingFor)?.label || activeUser.lookingFor}
                    </p>
                  </div>
                )}
                
                {/* Thông tin cá nhân: Học vấn và Công việc */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeUser.education && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        Học vấn
                      </h3>
                      <p className="text-gray-700">
                        {activeUser.education}
                      </p>
                    </div>
                  )}
                  
                  {activeUser.occupation && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Công việc
                      </h3>
                      <p className="text-gray-700">
                        {activeUser.occupation}
                      </p>
                    </div>
                  )}
                </div>
                
                {activeUser.bio && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Giới thiệu
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {activeUser.bio}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {activeUser.teaPreferences && activeUser.teaPreferences.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Sở thích trà sữa
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeUser.teaPreferences.map((tea, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-yellow-100/70 text-yellow-700 text-sm rounded-full border border-yellow-200 shadow-sm"
                          >
                            {tea}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeUser.hobbies && activeUser.hobbies.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sở thích
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeUser.hobbies.map((hobby, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-blue-100/70 text-blue-700 text-sm rounded-full border border-blue-200 shadow-sm"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {(activeUser.lifestyle?.smoking || activeUser.lifestyle?.drinking || activeUser.lifestyle?.exercise) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Lối sống
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {activeUser.lifestyle?.smoking && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl border border-red-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Hút thuốc
                          </p>
                          <p className="text-red-700 font-medium">
                            {LIFESTYLE_OPTIONS.smoking.find(option => option.value === activeUser.lifestyle.smoking)?.label || activeUser.lifestyle.smoking}
                          </p>
                        </div>
                      )}
                      
                      {activeUser.lifestyle?.drinking && (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-xl border border-amber-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Uống rượu
                          </p>
                          <p className="text-amber-700 font-medium">
                            {LIFESTYLE_OPTIONS.drinking.find(option => option.value === activeUser.lifestyle.drinking)?.label || activeUser.lifestyle.drinking}
                          </p>
                        </div>
                      )}
                      
                      {activeUser.lifestyle?.exercise && (
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl border border-green-100 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tập thể dục
                          </p>
                          <p className="text-green-700 font-medium">
                            {LIFESTYLE_OPTIONS.exercise.find(option => option.value === activeUser.lifestyle.exercise)?.label || activeUser.lifestyle.exercise}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleDislike(activeUser._id);
                      setShowUserDetail(false);
                    }}
                    className="px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm font-medium"
                  >
                    <FaTimes className="inline mr-2" />
                    Không thích
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(244, 114, 182, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleLike(activeUser._id);
                      setShowUserDetail(false);
                    }}
                    className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md font-medium"
                  >
                    <FaHeart className="inline mr-2" />
                    Thích
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;