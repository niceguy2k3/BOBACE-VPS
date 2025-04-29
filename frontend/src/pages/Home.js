import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaExclamationTriangle, FaCheck, FaHeart, FaMugHot, FaSearch, FaUserFriends, FaChevronLeft, FaChevronRight, FaCrown, FaUserCheck } from 'react-icons/fa';
import { API_URL } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import UserCard from '../components/UserCard';
import Loader from '../components/Loader';

const Home = () => {
  const { currentUser, locationPermission, updateUserLocation } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [matchedUser, setMatchedUser] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [likesLimit, setLikesLimit] = useState(null);
  const [showLikesLimitModal, setShowLikesLimitModal] = useState(false);
  
  // State cho chỉ mục ảnh hiện tại
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Fetch likes limit info
  const fetchLikesLimit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/likes/limit`, config);
      setLikesLimit(response.data);
    } catch (error) {
      console.error('Error fetching likes limit:', error);
    }
  };

  useEffect(() => {
    // Kiểm tra xem người dùng đã có vị trí trong cơ sở dữ liệu chưa
    const hasLocation = currentUser?.location?.coordinates?.length === 2;
    
    // Fetch likes limit info
    fetchLikesLimit();
    
    // Kiểm tra xem người dùng đã chọn "Không hỏi lại" hoặc "Để sau" chưa
    const userDismissedPrompt = localStorage.getItem('locationPermanentlyDismissed') === 'true' || 
                               localStorage.getItem('locationPromptDismissed') === 'true';
    
    // Tải danh sách người dùng nếu đã có vị trí hoặc đã chọn bỏ qua
    if (hasLocation || (userDismissedPrompt && currentUser)) {
      fetchUsers();
    } else if (currentUser) {
      // Nếu đã đăng nhập nhưng chưa có vị trí và chưa chọn bỏ qua, không tải danh sách người dùng
      setLoading(false);
    }
    
    // Không cần cleanup function vì không còn sử dụng slideTimerRef
    return () => {};
  }, [currentUser]);
  
  // Chỉ reset chỉ mục ảnh khi người dùng hiện tại thay đổi
  useEffect(() => {
    // Nếu có người dùng hiển thị
    const currentUser = users[currentIndex];
    
    // Reset chỉ mục ảnh khi chuyển sang người dùng mới
    setCurrentPhotoIndex(0);
    
  }, [currentIndex, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/users`, config);
      console.log('Users data from API:', response.data);
      
      // Kiểm tra cấu trúc dữ liệu người dùng
      if (response.data && response.data.length > 0) {
        console.log('First user structure:', JSON.stringify(response.data[0], null, 2));
        console.log('Verification status:', response.data[0].verification);
        console.log('Verified field:', response.data[0].verified);
      }
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'like'
      }, config);
      
      // Update likes limit info
      if (response.data.likesUsed !== undefined) {
        const likesRemaining = response.data.likesLimit - response.data.likesUsed;
        
        setLikesLimit(prev => ({
          ...prev,
          likesUsed: response.data.likesUsed,
          likesRemaining: likesRemaining,
          nextResetTime: response.data.nextResetTime
        }));
        
        // Hiển thị thông báo khi sắp hết lượt thích
        if (likesRemaining <= 5 && likesRemaining > 0) {
          toast.warning(`Bạn chỉ còn ${likesRemaining} lượt thích hôm nay!`, {
            position: "top-center",
            autoClose: 3000
          });
        }
      }
      
      // Check if it's a match
      if (response.data.isMatch) {
        setMatchedUser(users[currentIndex]);
        setMatchId(response.data.matchId);
        setShowMatchModal(true);
      }
      
      goToNextUser();
      
      // Refresh likes limit info
      fetchLikesLimit();
    } catch (error) {
      console.error('Error liking user:', error);
      
      // Kiểm tra nếu lỗi là do đạt giới hạn lượt thích
      if (error.response?.status === 403 && error.response?.data?.message?.includes('giới hạn lượt thích')) {
        setLikesLimit(error.response.data);
        setShowLikesLimitModal(true);
        
        // Hiển thị thông báo toast
        toast.error('Bạn đã sử dụng hết lượt thích hôm nay!', {
          position: "top-center",
          autoClose: 3000
        });
      } else if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        toast.error(error.response?.data?.message || 'Không thể thích người dùng này');
      } else {
        console.error('Chi tiết lỗi:', error);
        toast.error('Đã xảy ra lỗi khi thích người dùng. Vui lòng thử lại sau.');
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
      
      await axios.post(`${API_URL}/api/likes`, {
        to: userId,
        type: 'dislike'
      }, config);
      
      goToNextUser();
    } catch (error) {
      console.error('Error disliking user:', error);
      if (error.response?.status === 403) {
        // Hiển thị thông báo lỗi từ server nếu có
        toast.error(error.response?.data?.message || 'Không thể bỏ qua người dùng này');
      } else {
        console.error('Chi tiết lỗi:', error);
        toast.error('Đã xảy ra lỗi khi bỏ qua người dùng. Vui lòng thử lại sau.');
      }
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const goToNextUser = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    fetchUsers();
  };

  // Current user to display
  const displayedUser = users[currentIndex];

  // User Profile Modal
  const UserProfileModal = ({ user, onClose }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    
    // Không còn sử dụng slideshow tự động
    useEffect(() => {
      // Đặt lại chỉ mục ảnh khi user thay đổi
      setCurrentPhotoIndex(0);
    }, [user.photos]);
    
    // Xử lý chuyển ảnh trước đó
    const handlePrevImage = (e) => {
      e.stopPropagation();
      if (user.photos && user.photos.length > 0) {
        setCurrentPhotoIndex(prevIndex => 
          prevIndex === 0 ? user.photos.length - 1 : prevIndex - 1
        );
      }
    };
    
    // Xử lý chuyển ảnh tiếp theo
    const handleNextImage = (e) => {
      e.stopPropagation();
      if (user.photos && user.photos.length > 0) {
        setCurrentPhotoIndex(prevIndex => 
          prevIndex === user.photos.length - 1 ? 0 : prevIndex + 1
        );
      }
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
    
    const getLookingForText = (value) => {
      switch(value) {
        case 'relationship': return 'Mối quan hệ nghiêm túc';
        case 'friendship': return 'Tình bạn';
        case 'casual': return 'Hẹn hò không ràng buộc';
        case 'marriage': return 'Hướng đến hôn nhân';
        case 'not-sure': return 'Chưa chắc chắn';
        default: return '';
      }
    };
    
    const getLifestyleText = (category, value) => {
      if (!value) return '';
      
      const options = {
        smoking: {
          'never': 'Không bao giờ',
          'sometimes': 'Thỉnh thoảng',
          'often': 'Thường xuyên',
          'quitting': 'Đang cai'
        },
        drinking: {
          'never': 'Không bao giờ',
          'sometimes': 'Thỉnh thoảng',
          'often': 'Thường xuyên',
          'quitting': 'Đang cai'
        },
        exercise: {
          'never': 'Không bao giờ',
          'sometimes': 'Thỉnh thoảng',
          'often': 'Thường xuyên',
          'daily': 'Hàng ngày'
        },
        diet: {
          'omnivore': 'Ăn tạp',
          'vegetarian': 'Ăn chay',
          'vegan': 'Ăn thuần chay',
          'pescatarian': 'Ăn chay và hải sản',
          'keto': 'Keto',
          'other': 'Khác'
        }
      };
      
      return options[category]?.[value] || '';
    };
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div 
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with image */}
          <div className="relative">
            {user.photos && user.photos.length > 0 ? (
              <div className="h-72 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentPhotoIndex}
                    src={user.photos[currentPhotoIndex % user.photos.length]} 
                    alt={`${user.fullName} - ảnh ${currentPhotoIndex + 1}`} 
                    className="w-full h-full object-cover"
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
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm z-10"
                      onClick={handlePrevImage}
                      aria-label="Ảnh trước"
                    >
                      <FaChevronLeft />
                    </button>
                    
                    {/* Nút điều hướng phải */}
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm z-10"
                      onClick={handleNextImage}
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
                            index === currentPhotoIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(index);
                          }}
                          aria-label={`Chuyển đến ảnh ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
            ) : user.avatar ? (
              <div className="h-72 overflow-hidden">
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
            ) : (
              <div className="h-72 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300"
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* User name and basic info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center">
                <h3 className="text-2xl font-bold">{user.fullName}, {calculateAge(user.birthDate)}</h3>
                <div className="flex ml-2 space-x-1">
                  {user.premium && (
                    <div className="flex items-center bg-yellow-400/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <FaCrown className="text-yellow-800 mr-1" size={12} />
                      <span className="text-xs font-medium text-yellow-800">Premium</span>
                    </div>
                  )}
                  {user.verified && (
                    <div className="flex items-center bg-green-400/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <FaCheck className="text-green-800 mr-1" size={10} />
                      <span className="text-xs font-medium text-green-800">Đã xác minh</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-1">
                {user.city && (
                  <div className="flex items-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{user.city}</span>
                  </div>
                )}
                {user.zodiacSign && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-sm">{user.zodiacSign}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-18rem)]">
            {/* Bio */}
            {user.bio && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Giới thiệu</h4>
                <p className="text-neutral-600">{user.bio}</p>
              </div>
            )}
            
            {/* Looking For */}
            {user.lookingFor && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Đang tìm kiếm</h4>
                <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  {getLookingForText(user.lookingFor)}
                </div>
              </div>
            )}
            
            {/* Thông tin cơ bản */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-800 mb-3">Thông tin cơ bản</h4>
              <div className="grid grid-cols-2 gap-4">
                {user.height && (
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <span className="text-neutral-500 text-sm block mb-1">Chiều cao</span>
                    <p className="text-neutral-800 font-medium">{user.height} cm</p>
                  </div>
                )}
                {user.occupation && (
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <span className="text-neutral-500 text-sm block mb-1">Nghề nghiệp</span>
                    <p className="text-neutral-800 font-medium">{user.occupation}</p>
                  </div>
                )}
                {user.education && (
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <span className="text-neutral-500 text-sm block mb-1">Học vấn</span>
                    <p className="text-neutral-800 font-medium">{user.education}</p>
                  </div>
                )}
                {user.school && (
                  <div className="bg-neutral-50 p-3 rounded-xl">
                    <span className="text-neutral-500 text-sm block mb-1">Trường</span>
                    <p className="text-neutral-800 font-medium">{user.school}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Thông tin về trà sữa */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-800 mb-3">
                <span className="inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Về Boba
                </span>
              </h4>
              
              <div className="space-y-4">
                {user.favoriteTea && (
                  <div className="bg-yellow-50 p-3 rounded-xl">
                    <span className="text-yellow-700 text-sm font-medium block mb-1">Yêu thích nhất</span>
                    <p className="text-neutral-800">{user.favoriteTea}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {user.teaFrequency && (
                    <div className="bg-yellow-50 p-3 rounded-xl">
                      <span className="text-yellow-700 text-sm font-medium block mb-1">Tần suất uống</span>
                      <p className="text-neutral-800">
                        {user.teaFrequency === 'daily' ? 'Hàng ngày' :
                         user.teaFrequency === 'weekly' ? 'Hàng tuần' :
                         user.teaFrequency === 'monthly' ? 'Hàng tháng' : 'Hiếm khi'}
                      </p>
                    </div>
                  )}
                  
                  {user.sugarLevel && (
                    <div className="bg-yellow-50 p-3 rounded-xl">
                      <span className="text-yellow-700 text-sm font-medium block mb-1">Đường</span>
                      <p className="text-neutral-800">{user.sugarLevel}</p>
                    </div>
                  )}
                  
                  {user.iceLevel && (
                    <div className="bg-yellow-50 p-3 rounded-xl">
                      <span className="text-yellow-700 text-sm font-medium block mb-1">Đá</span>
                      <p className="text-neutral-800">{user.iceLevel}</p>
                    </div>
                  )}
                </div>
                
                {user.teaPreferences && user.teaPreferences.length > 0 && (
                  <div>
                    <span className="text-yellow-700 text-sm font-medium block mb-2">Loại trà sữa yêu thích</span>
                    <div className="flex flex-wrap gap-2">
                      {user.teaPreferences.map((tea, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full"
                        >
                          {tea}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {user.toppings && user.toppings.length > 0 && (
                  <div>
                    <span className="text-yellow-700 text-sm font-medium block mb-2">Topping yêu thích</span>
                    <div className="flex flex-wrap gap-2">
                      {user.toppings.map((topping, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full"
                        >
                          {topping}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sở thích */}
            {user.hobbies && user.hobbies.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-800 mb-3">
                  <span className="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sở thích
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.hobbies.map((hobby, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Ngôn ngữ */}
            {user.languages && user.languages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-800 mb-3">
                  <span className="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Ngôn ngữ
                  </span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.languages.map((language, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Lối sống */}
            {user.lifestyle && Object.values(user.lifestyle).some(value => value) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-800 mb-3">
                  <span className="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Lối sống
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {user.lifestyle.smoking && (
                    <div className="bg-green-50 p-3 rounded-xl">
                      <span className="text-green-700 text-sm font-medium block mb-1">Hút thuốc</span>
                      <p className="text-neutral-800">{getLifestyleText('smoking', user.lifestyle.smoking)}</p>
                    </div>
                  )}
                  {user.lifestyle.drinking && (
                    <div className="bg-green-50 p-3 rounded-xl">
                      <span className="text-green-700 text-sm font-medium block mb-1">Uống rượu</span>
                      <p className="text-neutral-800">{getLifestyleText('drinking', user.lifestyle.drinking)}</p>
                    </div>
                  )}
                  {user.lifestyle.exercise && (
                    <div className="bg-green-50 p-3 rounded-xl">
                      <span className="text-green-700 text-sm font-medium block mb-1">Tập thể dục</span>
                      <p className="text-neutral-800">{getLifestyleText('exercise', user.lifestyle.exercise)}</p>
                    </div>
                  )}
                  {user.lifestyle.diet && (
                    <div className="bg-green-50 p-3 rounded-xl">
                      <span className="text-green-700 text-sm font-medium block mb-1">Chế độ ăn</span>
                      <p className="text-neutral-800">{getLifestyleText('diet', user.lifestyle.diet)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-neutral-100 bg-neutral-50">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Match Modal
  const MatchModal = ({ user, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div 
          className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated confetti background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute -inset-4"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-yellow-500 to-yellow-600"></div>
            </motion.div>
          </div>
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-yellow-500 opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0.7, 0.9, 0],
                    y: [0, -Math.random() * 100]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="relative">
            <motion.div 
              className="mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-20 w-20 mx-auto text-yellow-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </motion.svg>
            </motion.div>
            
            <motion.h3 
              className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Đã match!
            </motion.h3>
            
            <motion.p 
              className="mb-6 text-neutral-600 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Bạn và <span className="font-semibold text-yellow-600">{user.fullName}</span> đã match với nhau
            </motion.p>
            
            <motion.div 
              className="mb-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div 
                className="w-36 h-36 mx-auto rounded-full border-4 border-yellow-400 shadow-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 text-4xl font-bold">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
              </motion.div>
              
              {/* Animated decorative elements */}
              <motion.div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full"
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-0 left-1/4 translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full"
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              ></motion.div>
              <motion.div 
                className="absolute bottom-0 right-1/4 translate-y-1/2 w-6 h-6 bg-yellow-500 rounded-full"
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              ></motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                onClick={onClose}
                className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tiếp tục
              </motion.button>
              <motion.button
                onClick={() => {
                  onClose();
                  navigate(`/chat/${matchId}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Nhắn tin ngay
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Xử lý yêu cầu quyền truy cập vị trí
  const handleRequestLocation = async () => {
    setLocationLoading(true);
    try {
      const result = await updateUserLocation();
      if (result.success) {
        toast.success('Đã cập nhật vị trí thành công');
        // Sau khi cập nhật vị trí thành công, tải danh sách người dùng
        fetchUsers();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      toast.error('Không thể cập nhật vị trí');
    } finally {
      setLocationLoading(false);
    }
  };

  // Hiển thị màn hình yêu cầu vị trí
  const renderLocationRequest = () => {
    return (
      <div className="text-center py-16 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-100 rounded-tr-full opacity-50"></div>
        
        <div className="relative">
          <div className="text-yellow-500 mb-6">
            <motion.div
              initial={{ y: -5 }}
              animate={{ y: 5 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              <FaMapMarkerAlt className="h-20 w-20 mx-auto" />
            </motion.div>
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-800 mb-3">Chia sẻ vị trí của bạn</h2>
          <p className="text-neutral-600 mb-8">
            Để tìm những người dùng gần bạn, chúng tôi cần biết vị trí của bạn. 
            Thông tin này chỉ được sử dụng để tìm kiếm người phù hợp.
          </p>
          
          {locationPermission === 'denied' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start"
            >
              <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
              <p className="text-sm text-left">
                Bạn đã từ chối quyền truy cập vị trí. Vui lòng cấp quyền trong cài đặt trình duyệt 
                của bạn và làm mới trang để tiếp tục.
              </p>
            </motion.div>
          )}
          
          <motion.button
            onClick={handleRequestLocation}
            disabled={locationLoading}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {locationLoading ? (
              <div className="loading-spinner-small"></div>
            ) : (
              <>
                <FaMapMarkerAlt className="mr-2" />
                Chia sẻ vị trí của tôi
              </>
            )}
          </motion.button>
          
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <FaCheck className="text-green-500" />
              <span>Chỉ hiển thị người dùng gần bạn</span>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 mt-4">
            Bạn có thể thay đổi cài đặt vị trí bất kỳ lúc nào trong phần cài đặt tài khoản.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      {/* Background gradient - full screen */}
      <div className="fixed inset-0 bg-gradient-to-b from-yellow-50 via-neutral-50 to-neutral-100 z-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -inset-10 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
      </div>
      
      <div className="relative z-10 w-full pt-12 pb-10">
        <div className="w-full max-w-7xl mx-auto px-4 mt-12">
          {/* Likes Limit Indicator */}
          {!currentUser?.premium && likesLimit && (
            <motion.div 
              className="max-w-md mx-auto mb-8 bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center p-3">
                <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
                  <FaHeart className="text-yellow-500" />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-neutral-700">
                        Lượt thích hôm nay: <span className="font-bold">{likesLimit.likesUsed}/{likesLimit.likesLimit}</span>
                        {likesLimit.likesRemaining <= 5 && (
                          <span className="ml-2 text-xs text-red-500 font-medium animate-pulse">
                            (Sắp hết lượt!)
                          </span>
                        )}
                      </p>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            likesLimit.likesRemaining <= 5 
                              ? "bg-gradient-to-r from-red-400 to-red-500" 
                              : "bg-gradient-to-r from-yellow-400 to-yellow-500"
                          }`}
                          style={{ width: `${Math.min(100, (likesLimit.likesUsed / likesLimit.likesLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              BOBACE
            </motion.h1>
            <motion.p 
              className="text-neutral-600 max-w-md mx-auto mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Nơi những người yêu thích trà sữa tìm thấy nhau. Khám phá những mối quan hệ ngọt ngào như ly trà sữa yêu thích của bạn.
            </motion.p>
            
            {/* Feature Icons */}
            <motion.div 
              className="flex justify-center space-x-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <FaMugHot className="text-yellow-600 text-xl" />
                </div>
                <span className="text-sm text-neutral-600">Cùng sở thích</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <FaHeart className="text-pink-600 text-xl" />
                </div>
                <span className="text-sm text-neutral-600">Tìm người phù hợp</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <FaUserFriends className="text-blue-600 text-xl" />
                </div>
                <span className="text-sm text-neutral-600">Kết nối thực sự</span>
              </div>
            </motion.div>
          </motion.div>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-96"
            >
              <div className="loading-spinner"></div>
            </motion.div>
          ) : !currentUser?.location?.coordinates?.length && 
               localStorage.getItem('locationPermanentlyDismissed') !== 'true' && 
               localStorage.getItem('locationPromptDismissed') !== 'true' ? (
            // Hiển thị màn hình yêu cầu vị trí nếu chưa có vị trí và chưa chọn "Không hỏi lại" hoặc "Để sau"
            <motion.div
              key="location-request"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {renderLocationRequest()}
            </motion.div>
          ) : users.length === 0 ? (
            <motion.div 
              key="no-users"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              
              <div className="relative">
                <div className="text-yellow-500 mb-4">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-3">Không tìm thấy người dùng</h2>
                <p className="text-neutral-600 mb-8">Hiện tại không có người dùng phù hợp với bạn. Hãy thử làm mới hoặc quay lại sau.</p>
                <motion.button 
                  onClick={handleRefresh}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Làm mới
                </motion.button>
              </div>
            </motion.div>
          ) : currentIndex >= users.length ? (
            <motion.div 
              key="all-viewed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              
              <div className="relative">
                <div className="text-yellow-500 mb-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-3">Đã xem hết tất cả</h2>
                <p className="text-neutral-600 mb-8">Bạn đã xem hết tất cả người dùng. Hãy thử làm mới để tìm thêm người mới.</p>
                <motion.button 
                  onClick={handleRefresh}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Làm mới
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="user-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <UserCard 
                user={displayedUser}
                onLike={handleLike}
                onDislike={handleDislike}
                onViewProfile={handleViewProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
      
      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <UserProfileModal 
          user={selectedUser}
          onClose={() => setShowProfileModal(false)}
        />
      )}
      
      {/* Match Modal */}
      {showMatchModal && matchedUser && (
        <MatchModal 
          user={matchedUser}
          onClose={() => setShowMatchModal(false)}
        />
      )}
      
      {/* Likes Limit Modal */}
      {showLikesLimitModal && likesLimit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <FaHeart className="text-yellow-500 text-3xl" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Đã đạt giới hạn lượt thích</h3>
              <p className="text-neutral-600">
                Bạn đã sử dụng hết {likesLimit.likesLimit} lượt thích hôm nay.
              </p>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Lượt thích sẽ được làm mới sau: <br />
                  <span className="font-semibold">{likesLimit.timeUntilReset?.formatted || '8 giờ'}</span>
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Thời gian làm mới: {new Date(likesLimit.nextResetTime).toLocaleString('vi-VN')}
                </p>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center">
                  <FaUserCheck className="mr-2" />
                  <span>Nâng cấp Premium để có lượt thích không giới hạn!</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-3">     
              <motion.button
                className="w-full py-3 bg-white text-neutral-700 border border-neutral-300 rounded-full hover:bg-neutral-50 transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowLikesLimitModal(false)}
              >
                Đóng
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Home;