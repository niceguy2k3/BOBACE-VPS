import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaUserSecret, 
         FaChevronLeft, FaChevronRight, FaShieldAlt, FaInfoCircle, FaStar, 
         FaCompass, FaGlasses, FaFire, FaRegLightbulb, FaUserCheck } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { RiHeartPulseFill, RiUserHeartFill } from 'react-icons/ri';
import { API_URL } from '../config/constants';
import { getWithFallback, postWithFallback } from '../utils/api-helper';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/Loader';
import BlindateCard from '../components/BlindateCard';
import BlindateModal from '../components/BlindateModal';
import DateScheduler from '../components/DateScheduler';

// Import custom styles
import '../styles/blindate.css';

const Blindate = () => {
  const navigate = useNavigate();
  const { blindateId } = useParams();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeBlindates, setActiveBlindates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBlindate, setSelectedBlindate] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [locations, setLocations] = useState([]);
  
  // Hàm xáo trộn mảng (Fisher-Yates shuffle algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch potential matches and active blindates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Vui lòng đăng nhập lại');
          navigate('/login');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // If blindateId is provided in the URL, fetch that specific blindate
        if (blindateId) {
          try {
            console.log('Fetching specific blindate with ID:', blindateId);
            const response = await axios.get(`${API_URL}/api/blindates/${blindateId}`, config);
            
            if (response.data) {
              // Set the selected blindate and show the modal
              setSelectedBlindate(response.data);
              setShowModal(true);
              
              // Also fetch active blindates for the background
              const blindatesResponse = await getWithFallback('/api/blindates', config)
                .catch(err => {
                  console.error('Failed to fetch blindates:', err);
                  return { data: [] };
                });
                
              if (blindatesResponse.data && Array.isArray(blindatesResponse.data)) {
                setActiveBlindates(blindatesResponse.data);
              }
              
              // Fetch locations for scheduling
              const locationsResponse = await getWithFallback('/api/blindates/locations/suggested', config)
                .catch(err => {
                  console.error('Failed to fetch locations:', err);
                  return { data: [] };
                });
                
              if (locationsResponse.data && Array.isArray(locationsResponse.data)) {
                setLocations(locationsResponse.data);
              } else {
                setLocations(getMockLocations());
              }
            } else {
              toast.error('Không tìm thấy thông tin cuộc hẹn');
            }
          } catch (error) {
            console.error('Error fetching specific blindate:', error);
            toast.error('Không thể tải thông tin cuộc hẹn');
          }
        } else {
          // Normal flow - fetch all data
          try {
            // Use Promise.all with our helper functions that have multiple URL fallbacks
            const [matchesResponse, blindatesResponse, locationsResponse] = await Promise.all([
              // Fetch potential matches
              getWithFallback('/api/blindates/matches/find', config)
                .catch(err => {
                  console.error('Failed to fetch matches:', err);
                  return { data: [] };
                }),
              
              // Fetch active blindates
              getWithFallback('/api/blindates', config)
                .catch(err => {
                  console.error('Failed to fetch blindates:', err);
                  return { data: [] };
                }),
              
              // Fetch suggested locations
              getWithFallback('/api/blindates/locations/suggested', config)
                .catch(err => {
                  console.error('Failed to fetch locations:', err);
                  return { data: [] };
                })
            ]);
            
            // Process matches and shuffle them for randomness
            if (matchesResponse.data && Array.isArray(matchesResponse.data)) {
              // Xáo trộn danh sách đối tượng trước khi hiển thị
              const shuffledMatches = shuffleArray(matchesResponse.data);
              
              // Log để kiểm tra ID của các đối tượng
              console.log('Potential matches IDs:', shuffledMatches.map(match => match._id));
              
              setPotentialMatches(shuffledMatches);
              setCurrentIndex(0);
            } else {
              console.warn('Invalid matches data format, using mock data');
              loadMockData();
            }
            
            // Process blindates
            if (blindatesResponse.data && Array.isArray(blindatesResponse.data)) {
              setActiveBlindates(blindatesResponse.data);
            } else {
              console.warn('Invalid blindates data format, using empty array');
              setActiveBlindates([]);
            }
            
            // Process locations
            if (locationsResponse.data && Array.isArray(locationsResponse.data)) {
              setLocations(locationsResponse.data);
            } else {
              console.warn('Invalid locations data format, using mock locations');
              setLocations(getMockLocations());
            }
          } catch (apiError) {
            console.error('API error in fetchData:', apiError);
            
            // Use mock data for all endpoints
            loadMockData();
            setActiveBlindates([]);
            setLocations(getMockLocations());
            
            toast.info('Đang sử dụng dữ liệu mẫu cho ứng dụng.');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        
        // Use mock data as fallback
        loadMockData();
        setActiveBlindates([]);
        setLocations(getMockLocations());
        
        toast.info('Đang sử dụng dữ liệu mẫu cho ứng dụng.');
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, blindateId]);
  
  // Cung cấp địa điểm mẫu khi API thất bại
  const getMockLocations = () => {
    return [
      {
        name: 'Highlands Coffee',
        address: '141 Nguyễn Du, Quận 1, TP.HCM',
        coordinates: [106.6957, 10.7765],
        type: 'cafe'
      },
      {
        name: 'The Coffee House',
        address: '86-88 Cao Thắng, Quận 3, TP.HCM',
        coordinates: [106.6789, 10.7732],
        type: 'cafe'
      },
      {
        name: 'Phúc Long Coffee & Tea',
        address: 'TTTM Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
        coordinates: [106.7032, 10.7772],
        type: 'cafe'
      },
      {
        name: 'Gong Cha',
        address: '188 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        coordinates: [106.6876, 10.7745],
        type: 'cafe'
      },
      {
        name: 'Nhà hàng Kichi Kichi',
        address: 'TTTM Crescent Mall, Quận 7, TP.HCM',
        coordinates: [106.7180, 10.7286],
        type: 'restaurant'
      }
    ];
  };
  
  // Handle like/dislike
  const handleResponse = async (response) => {
    if (potentialMatches.length === 0) return;
    
    const currentMatch = potentialMatches[currentIndex];
    
    // Loại bỏ đối phương hiện tại khỏi danh sách ngay lập tức
    // để tránh người dùng nhấn nhiều lần
    const updatedMatches = [...potentialMatches];
    updatedMatches.splice(currentIndex, 1);
    setPotentialMatches(updatedMatches);
    
    if (response === 'like') {
      try {
        const token = localStorage.getItem('token');
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Check if this is a mock ID (starts with 'mock')
        if (currentMatch._id && currentMatch._id.toString().startsWith('mock')) {
          // For mock data, just show success message without API call
          toast.success('Đã gửi lời mời Blind date! (Dữ liệu mẫu)', {
            icon: '💌',
            style: {
              borderRadius: '10px',
              background: '#fff',
              color: '#333',
            },
          });
        } else {
          // Create blindate for real data
          try {
            // Gửi yêu cầu tạo blindate trực tiếp
            const response = await postWithFallback(
              '/api/blindates',
              { partnerId: currentMatch._id },
              config
            );
            
            // Hiển thị thông báo gửi lời mời với hiệu ứng đẹp hơn
            toast.success(
              <div className="flex flex-col items-center">
                <div className="text-lg font-semibold mb-1">Đã gửi lời mời Blind date!</div>
                <div className="text-sm">Bạn sẽ nhận được thông báo khi đối phương phản hồi</div>
              </div>,
              {
                icon: '💌',
                style: {
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#333',
                },
                autoClose: 4000
              }
            );
          } catch (apiError) {
            console.error('Error creating blindate:', apiError);
            
            // Xử lý tất cả các loại lỗi liên quan đến lời mời đã tồn tại
            if (
              // Kiểm tra thông báo lỗi từ API
              (apiError.response && 
               apiError.response.data && 
               apiError.response.data.message && 
               apiError.response.data.message.includes('Đã có lời mời hẹn hò')) ||
              // Kiểm tra lỗi MongoDB duplicate key
              (apiError.message && apiError.message.includes('E11000 duplicate key error'))
            ) {
              toast.info('Bạn đã có lời mời hẹn hò với người này rồi.', {
                icon: '💌',
                style: {
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#333',
                }
              });
            } else if (apiError.response && apiError.response.status === 403) {
              // Xử lý lỗi 403 Forbidden - thường là do chưa xác minh tài khoản
              const errorMessage = apiError.response.data && apiError.response.data.message 
                ? apiError.response.data.message 
                : 'Bạn cần xác minh tài khoản để sử dụng tính năng Blind Date.';
                
              // Hiển thị thông báo cảnh báo với màu vàng/amber thay vì màu đỏ
              toast.warning(
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <FaUserCheck className="text-amber-500 mr-2" />
                    <span className="font-bold text-amber-700">{errorMessage}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    <p className="text-sm text-amber-800">
                      Tính năng Blind Date chỉ dành cho tài khoản đã xác minh để đảm bảo an toàn cho người dùng.
                    </p>
                  </div>
                </div>,
                {
                  icon: false,
                  style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#333',
                    padding: '16px',
                  },
                  autoClose: 7000 // Hiển thị lâu hơn để người dùng có thể đọc
                }
              );
              
              // Thêm thông báo hướng dẫn
              setTimeout(() => {
                toast.info(
                  <div className="flex flex-col">
                    <div className="font-semibold mb-1 text-white-800">Hướng dẫn xác minh tài khoản:</div>
                    <div className="text-sm bg-gray-100 p-2 rounded-lg border border-gray-300">
                      <span className="font-bold text-gray-700">Vào Hồ sơ &gt; Cài đặt tài khoản &gt; Xác minh để hoàn tất xác minh.</span> 
                    </div>
                  </div>,
                  {
                    icon: '💡',
                    style: {
                      borderRadius: '10px',
                      background: '#fff',
                      color: '#333',
                    },
                    autoClose: 7000
                  }
                );
              }, 1000);
            } else if (apiError.response && apiError.response.status === 400) {
              // Xử lý lỗi 400 Bad Request
              const errorMessage = apiError.response.data && apiError.response.data.message 
                ? apiError.response.data.message 
                : 'Bạn đã có lời mời hẹn hò với người này rồi.';
                
              toast.info(errorMessage, {
                icon: '💌',
                style: {
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#333',
                }
              });
            } else if (apiError.response && apiError.response.data && apiError.response.data.message) {
              // Các lỗi khác từ API
              toast.warning(apiError.response.data.message || 'Không thể gửi lời mời. Vui lòng thử lại sau.');
            } else {
              // Lỗi không xác định
              toast.warning('Không thể gửi lời mời. Vui lòng thử lại sau.');
            }
          }
        }
      } catch (error) {
        console.error('Error in handleResponse:', error);
        toast.warning('Đang sử dụng chế độ mẫu cho ứng dụng.');
      }
    } else {
      // Hiển thị thông báo bỏ qua nhẹ nhàng
      toast.info('Đã bỏ qua đối tượng này', {
        icon: '👋',
        autoClose: 2000,
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      });
    }
    
    // Nếu không còn đối phương nào sau khi loại bỏ, tải thêm
    if (updatedMatches.length === 0) {
      toast.info('Đã xem hết tất cả các đề xuất. Đang tải thêm...', {
        icon: '🔍',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      });
      fetchMoreMatches();
    } else if (currentIndex >= updatedMatches.length) {
      // Nếu đã xóa người cuối cùng, quay lại người đầu tiên
      setCurrentIndex(0);
    }
    // Nếu không thì giữ nguyên currentIndex vì người tiếp theo sẽ tự động "trượt" vào vị trí hiện tại
  };
  
  // Fetch more matches
  const fetchMoreMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      try {
        // Fetch potential matches using our helper with multiple URL fallbacks
        const matchesResponse = await getWithFallback(
          '/api/blindates/matches/find', 
          config
        );
        
        if (matchesResponse.data && Array.isArray(matchesResponse.data)) {
          // Xáo trộn danh sách đối tượng trước khi hiển thị
          const shuffledMatches = shuffleArray(matchesResponse.data);
          setPotentialMatches(shuffledMatches);
          setCurrentIndex(0);
          
          if (matchesResponse.data.length === 0) {
            toast.info('Không tìm thấy đề xuất phù hợp. Vui lòng thử lại sau.');
          }
        } else {
          console.warn('Invalid response format:', matchesResponse.data);
          // Use mock data if response is invalid
          loadMockData();
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Use mock data if API call fails
        loadMockData();
        
        // Show a less alarming message
        toast.info('Đang sử dụng dữ liệu mẫu cho đề xuất.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchMoreMatches:', error);
      
      // Use mock data as fallback
      loadMockData();
      
      setLoading(false);
    }
  };
  
  // Chỉ hiển thị thông báo lỗi, không sử dụng dữ liệu mẫu nữa
  const loadMockData = () => {
    toast.error('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.');
    setPotentialMatches([]);
    setCurrentIndex(0);
  };
  
  // Handle blindate selection
  const handleBlindateSelect = async (blindate) => {
    setSelectedBlindate(blindate);
    setShowModal(true);
  };
  
  // Handle blindate response
  const handleBlindateResponse = async (blindateId, response) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Respond to blindate
      await axios.post(
        `${API_URL}/api/blindates/${blindateId}/respond`,
        { response },
        config
      );
      
      // Hiển thị thông báo phản hồi
      if (response === 'accepted') {
        toast.success('Đã chấp nhận lời mời Blind date!', {
          icon: '💖',
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
          },
        });
      } else {
        toast.info('Đã từ chối lời mời Blind date.', {
          icon: '👋',
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
          },
        });
      }
      
      // Refresh active blindates
      const blindatesResponse = await axios.get(
        `${API_URL}/api/blindates`, 
        config
      );
      
      setActiveBlindates(blindatesResponse.data);
      setShowModal(false);
    } catch (error) {
      console.error('Error responding to blindate:', error);
      toast.error('Không thể phản hồi lời mời. Vui lòng thử lại sau.');
    }
  };
  
  // Handle date scheduling
  const handleScheduleDate = async (blindate) => {
    try {
      // Lấy thông tin location status trước khi hiển thị modal lên lịch hẹn
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/blindates/${blindate._id}/location-status`, config);
      
      // Cập nhật thông tin blindate với locationStatus
      setSelectedBlindate({
        ...blindate,
        locationStatus: response.data
      });
      
      setShowScheduler(true);
    } catch (error) {
      console.error('Error fetching location status:', error);
      toast.error('Không thể tải thông tin địa điểm. Vui lòng thử lại sau.');
    }
  };
  
  // Handle date update
  const handleDateUpdate = async (dateDetails) => {
    try {
      // Hiển thị thông báo đang xử lý để tránh người dùng nhấn nhiều lần
      toast.info('Đang lưu lịch hẹn...', { autoClose: 2000 });
      
      const token = localStorage.getItem('token');
      
      // Đảm bảo scheduledFor là string ISO format
      if (dateDetails.scheduledFor instanceof Date) {
        dateDetails.scheduledFor = dateDetails.scheduledFor.toISOString();
      }
      
      // Đảm bảo duration là số
      dateDetails.duration = parseInt(dateDetails.duration || 60);
      
      // Đảm bảo luôn có thông tin địa điểm
      if (!dateDetails.location || !dateDetails.location.name) {
        // Nếu đã có thông tin locationStatus trong selectedBlindate
        if (selectedBlindate.locationStatus?.status === 'confirmed' && 
            selectedBlindate.locationStatus.locationVoting?.finalLocation) {
          dateDetails.location = selectedBlindate.locationStatus.locationVoting.finalLocation;
        } else {
          dateDetails.location = {
            name: "Địa điểm đã thống nhất",
            address: "Địa chỉ đã được xác nhận trước đó",
            coordinates: [0, 0]
          };
        }
      }
      
      // Ghi log để kiểm tra dữ liệu
      console.log('Dữ liệu cập nhật:', { blindateId: selectedBlindate._id, dateDetails });
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Update blindate
      const response = await axios.put(
        `${API_URL}/api/blindates/${selectedBlindate._id}`,
        { dateDetails },
        config
      );
      
      toast.success('Đã cập nhật thông tin cuộc hẹn!');
      
      // Refresh active blindates
      const blindatesResponse = await axios.get(
        `${API_URL}/api/blindates`, 
        config
      );
      
      setActiveBlindates(blindatesResponse.data);
      setShowScheduler(false);
    } catch (error) {
      console.error('Error updating blindate:', error);
      const errorMsg = error.response?.data?.message || 'Không thể cập nhật cuộc hẹn. Vui lòng thử lại sau.';
      toast.error(errorMsg);
    }
  };
  
  // Handle video call creation
  const handleCreateVideoCall = async (blindateId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Create video call
      const response = await axios.post(
        `${API_URL}/api/blindates/${blindateId}/video-call`,
        {},
        config
      );
      
      toast.success('Đã tạo link video call!');
      
      // Copy link to clipboard
      navigator.clipboard.writeText(response.data.videoCallLink);
      toast.info('Đã sao chép link vào clipboard');
      
      // Refresh active blindates
      const blindatesResponse = await axios.get(
        `${API_URL}/api/blindates`, 
        config
      );
      
      setActiveBlindates(blindatesResponse.data);
    } catch (error) {
      console.error('Error creating video call:', error);
      toast.error('Không thể tạo video call. Vui lòng thử lại sau.');
    }
  };
  
  // Handle blindate cancellation
  const handleCancelBlindate = async (blindateId) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Cancel blindate
      await axios.post(
        `${API_URL}/api/blindates/${blindateId}/cancel`,
        { reason: 'Đã hủy bởi người dùng' },
        config
      );
      
      toast.success('Đã hủy cuộc hẹn!');
      
      // Refresh active blindates
      const blindatesResponse = await axios.get(
        `${API_URL}/api/blindates`, 
        config
      );
      
      setActiveBlindates(blindatesResponse.data);
      setShowModal(false);
    } catch (error) {
      console.error('Error cancelling blindate:', error);
      toast.error('Không thể hủy cuộc hẹn. Vui lòng thử lại sau.');
    }
  };
  
  // Handle blindate review
  const handleReviewBlindate = async (blindateId, rating, comment) => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Review blindate
      await axios.post(
        `${API_URL}/api/blindates/${blindateId}/review`,
        { rating, comment },
        config
      );
      
      toast.success('Đã đánh giá cuộc hẹn!');
      
      // Refresh active blindates
      const blindatesResponse = await axios.get(
        `${API_URL}/api/blindates`, 
        config
      );
      
      setActiveBlindates(blindatesResponse.data);
      setShowModal(false);
    } catch (error) {
      console.error('Error reviewing blindate:', error);
      toast.error('Không thể đánh giá cuộc hẹn. Vui lòng thử lại sau.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center boba-bg">
        <Loader />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen boba-bg py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl responsive-padding">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 mt-12"
        >
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-bold boba-title mb-3 responsive-heading">
              Blind date
            </h1>
            <motion.div 
              className="absolute -bottom-2 left-0 right-0 h-1 bg-[#c8a47e] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
          <p className="boba-text mt-4 max-w-2xl mx-auto text-lg responsive-text">
            Khám phá kết nối thực sự dựa trên tính cách và sở thích, không phải ngoại hình
          </p>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 responsive-grid">
          {/* Phần tìm kiếm đối tượng - 3 cột */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 boba-card overflow-hidden"
          >
            <div className="boba-header flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <RiUserHeartFill className="mr-3 text-2xl" />
                  <span>Tìm Bạn Hữu Duyên</span>
                </h2>
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <HiSparkles className="text-white text-xl" />
                </div>
              </div>
              <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
                <div className="flex items-center text-white text-sm">
                  <FaUserCheck className="mr-2 text-green-300" />
                  <span><strong>Chỉ tài khoản đã xác minh mới sử dụng được tính năng này!</strong></span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {potentialMatches.length > 0 ? (
                <div className="relative mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.4 
                      }}
                      className="bg-white rounded-xl p-6 shadow-md border border-[#d9c5ad] min-h-[400px] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold boba-title flex items-center">
                            <FaUserSecret className="mr-2 text-[#8c6d4f]" />
                            <span>
                              Bạn Hữu Duyên #{currentIndex + 1}
                            </span>
                          </h3>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className="text-[#c8a47e]" />
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-[#f5efe6] rounded-lg p-3 border border-[#d9c5ad] flex items-start">
                            <div className="bg-[#e8d7c3] p-2 rounded-full mr-3">
                              <FaGlasses className="text-[#8c6d4f]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#8c6d4f]">Thông tin cơ bản</p>
                              <p className="boba-text mt-1">
                                {potentialMatches[currentIndex].gender === 'male' ? 'Nam' : potentialMatches[currentIndex].gender === 'female' ? 'Nữ' : 'Khác'}, {potentialMatches[currentIndex].age} tuổi
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-[#f5efe6] rounded-lg p-3 border border-[#d9c5ad] flex items-start">
                            <div className="bg-[#e8d7c3] p-2 rounded-full mr-3">
                              <FaRegLightbulb className="text-[#8c6d4f]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#8c6d4f]">Nghề nghiệp</p>
                              <p className="boba-text mt-1">{potentialMatches[currentIndex].occupation}</p>
                            </div>
                          </div>
                          
                          <div className="bg-[#f5efe6] rounded-lg p-3 border border-[#d9c5ad] flex items-start">
                            <div className="bg-[#e8d7c3] p-2 rounded-full mr-3">
                              <FaCompass className="text-[#8c6d4f]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#8c6d4f]">Học vấn</p>
                              <p className="boba-text mt-1">{potentialMatches[currentIndex].education}</p>
                            </div>
                          </div>
                          
                          <div className="bg-[#f5efe6] rounded-lg p-3 border border-[#d9c5ad] flex items-start">
                            <div className="bg-[#e8d7c3] p-2 rounded-full mr-3">
                              <FaFire className="text-[#8c6d4f]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#8c6d4f]">Tính cách</p>
                              <p className="boba-text mt-1">
                                {potentialMatches[currentIndex].personality || "Hướng ngoại, Sáng tạo"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {potentialMatches[currentIndex].interests && potentialMatches[currentIndex].interests.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold boba-text mb-2 flex items-center">
                              <RiHeartPulseFill className="mr-2 text-[#8c6d4f]" />
                              Sở thích
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {potentialMatches[currentIndex].interests.map((interest, index) => (
                                <span key={index} className="boba-tag">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {potentialMatches[currentIndex].hobbies && potentialMatches[currentIndex].hobbies.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold boba-text mb-2 flex items-center">
                              <FaCompass className="mr-2 text-[#8c6d4f]" />
                              Hoạt động yêu thích
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {potentialMatches[currentIndex].hobbies.map((hobby, index) => (
                                <span key={index} className="boba-tag">
                                  {hobby}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center gap-6 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleResponse('dislike')}
                          className="boba-button-secondary flex items-center"
                        >
                          <FaTimes className="mr-2 text-gray-500" />
                          Bỏ qua
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleResponse('like')}
                          className="boba-button-primary flex items-center"
                        >
                          <FaHeart className="mr-2" />
                          Mời hẹn hò
                        </motion.button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex justify-center gap-2 mt-4">
                    {potentialMatches.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.8 }}
                        animate={{ 
                          scale: index === currentIndex ? 1.2 : 1,
                          backgroundColor: index === currentIndex ? '#c8a47e' : '#e8d7c3'
                        }}
                        className={`h-2 w-2 rounded-full`}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-md border border-[#d9c5ad] min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#e8d7c3] rounded-full flex items-center justify-center mb-4">
                      <FaUserSecret className="text-[#8c6d4f] text-3xl" />
                    </div>
                    <p className="boba-text text-center mb-6 text-lg responsive-text">
                      Không tìm thấy người bí ẩn phù hợp. Vui lòng thử lại sau.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchMoreMatches}
                      className="boba-button-primary"
                    >
                      Tìm kiếm lại
                    </motion.button>
                  </div>
                </div>
              )}
              
              <div className="mt-8 boba-info-box">
                <h3 className="text-xl font-bold boba-title mb-4 flex items-center">
                  <HiSparkles className="mr-2 text-[#8c6d4f]" />
                  Blind date là gì?
                </h3>
                <div className="space-y-3 boba-text responsive-text">
                  <p className="flex items-start">
                    <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1">
                      <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                    </span>
                    Blind date là cách để bạn kết nối với người khác mà không cần biết trước ngoại hình của họ.
                  </p>
                  <p className="flex items-start">
                    <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1">
                      <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                    </span>
                    Bạn sẽ chỉ nhận được thông tin cơ bản về đối phương và quyết định có muốn hẹn hò hay không.
                  </p>
                  <p className="flex items-start">
                    <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1">
                      <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                    </span>
                    Nếu cả hai đồng ý, bạn có thể sắp xếp cuộc hẹn trực tuyến qua video call hoặc tại một địa điểm an toàn.
                  </p>
                </div>
                
                <div className="mt-6 boba-safety-box">
                  <h4 className="font-bold text-[#8c6d4f] flex items-center mb-3">
                    <FaShieldAlt className="mr-2" />
                    Lưu ý an toàn
                  </h4>
                  <ul className="text-[#5c4935] space-y-2 responsive-text">
                    <li className="flex items-start p-2 rounded-lg">
                      <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1 flex-shrink-0">
                        <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                      </span>
                      <span>Luôn gặp gỡ ở nơi công cộng đông người</span>
                    </li>
                    <li className="flex items-start p-2 rounded-lg">
                      <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1 flex-shrink-0">
                        <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                      </span>
                      <span>Thông báo cho bạn bè/người thân về lịch hẹn và địa điểm</span>
                    </li>
                    <li className="flex items-start p-2 rounded-lg">
                      <span className="bg-[#e8d7c3] p-1 rounded-full mr-2 mt-1 flex-shrink-0">
                        <FaInfoCircle className="text-[#8c6d4f] text-xs" />
                      </span>
                      <span>Sử dụng tính năng "An toàn" trong chi tiết cuộc hẹn để chia sẻ vị trí hoặc báo cáo khẩn cấp</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Phần cuộc hẹn đang hoạt động - 2 cột */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2 boba-card overflow-hidden"
          >
            <div className="boba-header flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <FaCalendarAlt className="mr-3 text-2xl" />
                  <span>Cuộc Hẹn Của Bạn</span>
                </h2>
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <FaVideo className="text-white text-xl" />
                </div>
              </div>
              
              {!currentUser?.verified && (
                <div className="mt-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30">
                  <div className="flex items-center text-white text-sm">
                    <FaUserCheck className="mr-2 text-yellow-300" />
                    <span><strong>Xác minh tài khoản để sử dụng tính năng Blind Date!</strong></span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              {activeBlindates.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeBlindates.map((blindate, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      key={blindate._id}
                    >
                      <BlindateCard
                        blindate={blindate}
                        currentUser={currentUser}
                        onSelect={() => handleBlindateSelect(blindate)}
                        onSchedule={() => handleScheduleDate(blindate)}
                        onVideoCall={() => handleCreateVideoCall(blindate._id)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-md border border-[#d9c5ad] min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#e8d7c3] rounded-full flex items-center justify-center mb-4">
                      <FaCalendarAlt className="text-[#8c6d4f] text-3xl" />
                    </div>
                    <p className="boba-text text-center mb-6 text-lg responsive-text">
                      Bạn chưa có cuộc hẹn ẩn danh nào. Hãy gửi lời mời cho những bạn hữu duyên mà bạn quan tâm!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="boba-button-primary"
                    >
                      Tìm bạn hữu duyên
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Modal chi tiết cuộc hẹn */}
      <AnimatePresence>
        {showModal && selectedBlindate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <BlindateModal
              blindate={selectedBlindate}
              currentUser={currentUser}
              onClose={() => setShowModal(false)}
              onRespond={handleBlindateResponse}
              onSchedule={() => handleScheduleDate(selectedBlindate)}
              onVideoCall={() => handleCreateVideoCall(selectedBlindate._id)}
              onCancel={() => handleCancelBlindate(selectedBlindate._id)}
              onReview={handleReviewBlindate}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal lên lịch hẹn */}
      <AnimatePresence>
        {showScheduler && selectedBlindate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <DateScheduler
              blindate={selectedBlindate}
              locations={locations}
              onClose={() => setShowScheduler(false)}
              onSave={handleDateUpdate}
              confirmedLocation={selectedBlindate.locationStatus?.status === 'confirmed' ? 
                selectedBlindate.locationStatus.locationVoting?.finalLocation : null}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blindate;