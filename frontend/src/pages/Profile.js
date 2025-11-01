import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import { 
  TEA_PREFERENCES, 
  TEA_TOPPINGS, 
  HOBBIES, 
  LANGUAGES, 
  LOOKING_FOR_OPTIONS,
  LIFESTYLE_OPTIONS,
  TEA_FREQUENCY_OPTIONS,
  SUGAR_ICE_LEVELS,
  ZODIAC_SIGNS,
  VIETNAM_CITIES,
  API_URL
} from '../config/constants';
import Loader from '../components/Loader';
import ImageUploader from '../components/ImageUploader';
import { 
  FaUser, FaBirthdayCake, FaMapMarkerAlt, FaBriefcase, 
  FaGraduationCap, FaMugHot, FaRunning, FaLanguage, 
  FaStar, FaGlassCheers, FaSmoking, FaUtensils, FaEye, FaSearch,
  FaUserCheck, FaCrown
} from 'react-icons/fa';

const Profile = () => {
  const { currentUser, updateProfile, updateAvatar, uploadVerificationPhoto } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    birthDate: '',
    gender: '',
    teaPreferences: [],
    avatarUrl: '',
    photos: [],
    height: '',
    occupation: '',
    company: '',
    education: '',
    school: '',
    interests: [],
    interestedIn: [],
    distancePreference: 50,
    agePreference: {
      min: 18,
      max: 100
    },
    showInDiscovery: true,
    // Thông tin địa chỉ
    address: '',
    city: '',
    // Thông tin về trà sữa
    favoriteTea: '',
    teaFrequency: '',
    sugarLevel: '',
    iceLevel: '',
    toppings: [],
    // Sở thích và thông tin cá nhân
    hobbies: [],
    lookingFor: '',
    lifestyle: {
      smoking: '',
      drinking: '',
      exercise: '',
      diet: ''
    },
    languages: [],
    zodiacSign: ''
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  
  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      console.log('Current user data:', JSON.stringify(currentUser, null, 2));
      console.log('Verification status:', currentUser.verification);
      console.log('Verified field:', currentUser.verified);
      
      setFormData({
        fullName: currentUser.fullName || '',
        bio: currentUser.bio || '',
        birthDate: currentUser.birthDate ? new Date(currentUser.birthDate).toISOString().split('T')[0] : '',
        gender: currentUser.gender || '',
        teaPreferences: currentUser.teaPreferences || [],
        avatarUrl: currentUser.avatar || '',
        photos: currentUser.photos || [],
        height: currentUser.height || '',
        occupation: currentUser.occupation || '',
        company: currentUser.company || '',
        education: currentUser.education || '',
        school: currentUser.school || '',
        interests: currentUser.interests || [],
        interestedIn: currentUser.interestedIn || [],
        distancePreference: currentUser.distancePreference || 50,
        agePreference: currentUser.agePreference || {
          min: 18,
          max: 100
        },
        showInDiscovery: currentUser.showInDiscovery !== undefined ? currentUser.showInDiscovery : true,
        // Thông tin địa chỉ
        address: currentUser.address || '',
        city: currentUser.city || '',
        // Thông tin về trà sữa
        favoriteTea: currentUser.favoriteTea || '',
        teaFrequency: currentUser.teaFrequency || '',
        sugarLevel: currentUser.sugarLevel || '',
        iceLevel: currentUser.iceLevel || '',
        toppings: currentUser.toppings || [],
        // Sở thích và thông tin cá nhân
        hobbies: currentUser.hobbies || [],
        lookingFor: currentUser.lookingFor || '',
        lifestyle: currentUser.lifestyle || {
          smoking: '',
          drinking: '',
          exercise: '',
          diet: ''
        },
        languages: currentUser.languages || [],
        zodiacSign: currentUser.zodiacSign || ''
      });
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generic handler for array-type preferences
  const handleArrayPreferenceChange = (field, item) => {
    setFormData(prev => {
      const currentArray = [...prev[field]];
      
      if (currentArray.includes(item)) {
        // Remove if already selected
        return {
          ...prev,
          [field]: currentArray.filter(i => i !== item)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [field]: [...currentArray, item]
        };
      }
    });
  };
  
  const handleTeaPreferenceChange = (tea) => {
    handleArrayPreferenceChange('teaPreferences', tea);
  };
  
  const handleHobbyChange = (hobby) => {
    handleArrayPreferenceChange('hobbies', hobby);
  };
  
  const handleToppingChange = (topping) => {
    handleArrayPreferenceChange('toppings', topping);
  };
  
  const handleLanguageChange = (language) => {
    handleArrayPreferenceChange('languages', language);
  };
  
  // Handle lifestyle changes
  const handleLifestyleChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [category]: value
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Update profile
      await updateProfile({
        fullName: formData.fullName,
        bio: formData.bio,
        birthDate: formData.birthDate,
        gender: formData.gender,
        teaPreferences: formData.teaPreferences,
        height: formData.height ? parseInt(formData.height) : undefined,
        occupation: formData.occupation,
        company: formData.company,
        education: formData.education,
        school: formData.school,
        interests: formData.interests,
        interestedIn: formData.interestedIn,
        distancePreference: parseInt(formData.distancePreference),
        agePreference: formData.agePreference,
        showInDiscovery: formData.showInDiscovery,
        // Thông tin địa chỉ
        address: formData.address,
        city: formData.city,
        // Thông tin về trà sữa
        favoriteTea: formData.favoriteTea,
        teaFrequency: formData.teaFrequency,
        sugarLevel: formData.sugarLevel,
        iceLevel: formData.iceLevel,
        toppings: formData.toppings,
        // Sở thích và thông tin cá nhân
        hobbies: formData.hobbies,
        lookingFor: formData.lookingFor,
        lifestyle: formData.lifestyle,
        languages: formData.languages,
        zodiacSign: formData.zodiacSign,
        // Thêm photos vào dữ liệu cập nhật
        photos: formData.photos
      });
      
      // Update avatar if provided and changed
      // Lưu ý: Nếu sử dụng ImageUploader, avatar sẽ được cập nhật trực tiếp
      // Với base64, không cần kiểm tra URL http nữa, chỉ cần kiểm tra khác nhau
      if (formData.avatarUrl && formData.avatarUrl !== currentUser.avatar) {
        // Nếu là base64 hoặc data URI, update luôn
        if (formData.avatarUrl.startsWith('data:image/') || !formData.avatarUrl.startsWith('http')) {
          await updateAvatar({ avatarUrl: formData.avatarUrl });
        }
      }
      
        toast.success('Cập nhật hồ sơ thành công', {
        autoClose: 3000, // Tự động đóng sau 3 giây
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast(error.response?.data?.message || 'Cập nhật hồ sơ thất bại', {
        autoClose: 3000, // Tự động đóng sau 3 giây
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        closeButton: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return <Loader />;
  }
  
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            <span className="hidden sm:inline">Hồ sơ cá nhân</span>
            <span className="sm:hidden">Hồ sơ</span>
          </h2>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser?.premium && (
              <div className="flex items-center bg-yellow-100 px-2 sm:px-4 py-2 rounded-full">
                <FaCrown className="text-yellow-600 mr-1 sm:mr-2" />
                <span className="font-medium text-yellow-800 text-sm sm:text-base">Premium</span>
                {currentUser?.premiumUntil && (
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-yellow-600 hidden md:inline">
                    (Còn {Math.max(0, Math.ceil((new Date(currentUser.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24)))} ngày)
                  </span>
                )}
              </div>
            )}
            
            {currentUser?.verified && (
              <div className="flex items-center bg-green-100 px-2 sm:px-4 py-2 rounded-full">
                <FaUserCheck className="text-green-600 mr-1 sm:mr-2" />
                <span className="font-medium text-green-800 text-sm sm:text-base">Đã xác minh</span>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="mb-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Ảnh đại diện</h3>
            <ImageUploader 
              type="avatar"
              currentImage={formData.avatarUrl}
              onImageUploaded={(imageUrl) => {
                setFormData({
                  ...formData,
                  avatarUrl: imageUrl
                });
              }}
            />
            
            {/* Legacy URL input - hidden but kept for backward compatibility */}
            <div className="hidden">
              <input
                type="text"
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Photo Gallery */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Bộ sưu tập ảnh</h3>
            <p className="text-sm text-gray-600 mb-4">
              Thêm tối đa 6 ảnh để hiển thị trong hồ sơ của bạn
            </p>
            <ImageUploader 
              type="multiple"
              currentImages={formData.photos}
              maxImages={6}
              onImageUploaded={(photos) => {
                setFormData({
                  ...formData,
                  photos: photos
                });
              }}
            />
          </div>
          
          {/* Tabs for different sections */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'basic' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaUser className="h-3 w-3 text-yellow-600" />
                    </div>
                    Thông tin cơ bản
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tea')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'tea' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaMugHot className="h-3 w-3 text-yellow-600" />
                    </div>
                    Sở thích trà sữa
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'personal' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaUser className="h-3 w-3 text-yellow-600" />
                    </div>
                    Thông tin cá nhân
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lifestyle')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'lifestyle' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaGlassCheers className="h-3 w-3 text-yellow-600" />
                    </div>
                    Lối sống
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('verification')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'verification' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaUserCheck className="h-3 w-3 text-yellow-600" />
                    </div>
                    Xác minh tài khoản
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'preview' 
                      ? 'border-yellow-500 text-yellow-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-1">
                      <FaEye className="h-3 w-3 text-yellow-600" />
                    </div>
                    Xem hồ sơ
                  </span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'basic' && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h3>
              </div>
              
              <div className="bg-yellow-50 p-5 rounded-lg mb-6 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  Thông tin cơ bản giúp mọi người hiểu rõ hơn về bạn. Hãy cung cấp thông tin chính xác để tìm được người phù hợp nhất!
                </p>
              </div>
              
              {/* Personal Info Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
                <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin cá nhân
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <label 
                      htmlFor="fullName" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Họ và tên
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label 
                      htmlFor="birthDate" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Ngày sinh
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 relative group">
                  <label 
                    htmlFor="gender" 
                    className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                  >
                    Giới tính
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none"
                      required
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="non-binary">Phi nhị nguyên</option>
                      <option value="transgender">Chuyển giới</option>
                      <option value="genderqueer">Phi giới tính</option>
                      <option value="genderfluid">Giới tính linh hoạt</option>
                      <option value="agender">Không xác định giới tính</option>
                      <option value="other">Khác</option>
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
                <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Giới thiệu bản thân
                </h4>
                
                <div className="relative group">
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="Viết vài điều về bản thân..."
                  ></textarea>
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {formData.bio.length}/500
                  </div>
                </div>
              </div>
              
              {/* Physical Attributes Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
                <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Đặc điểm ngoại hình
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <label 
                      htmlFor="height" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Chiều cao (cm)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        min="140"
                        max="220"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Ví dụ: 170"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label 
                      htmlFor="weight" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Cân nặng (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        min="30"
                        max="200"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Ví dụ: 65"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
                <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Địa điểm
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <label 
                      htmlFor="address" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Địa chỉ của bạn"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <label 
                      htmlFor="city" 
                      className="block text-gray-700 text-sm font-medium mb-2 group-hover:text-yellow-600 transition-colors"
                    >
                      Thành phố
                    </label>
                    <div className="relative">
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none"
                      >
                        <option value="">Chọn thành phố</option>
                        {VIETNAM_CITIES.map((city) => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Zodiac Sign Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 transition-all hover:shadow-md">
                <h4 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Cung hoàng đạo
                </h4>
                
                <div className="relative group">
                  <div className="relative">
                    <select
                      id="zodiacSign"
                      name="zodiacSign"
                      value={formData.zodiacSign}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Chọn cung hoàng đạo</option>
                      {ZODIAC_SIGNS.map((sign, index) => (
                        <option key={index} value={sign.value}>
                          {sign.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tea Preferences Section */}
          {activeTab === 'tea' && (
            <div className="mb-8 animate-fade-in">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <FaMugHot className="h-6 w-6 text-yellow-600" />
                </div>
                Sở thích trà sữa
              </h3>
            
            <div className="mb-4">
              <label 
                htmlFor="favoriteTea" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Loại trà sữa yêu thích nhất
              </label>
              <input
                type="text"
                id="favoriteTea"
                name="favoriteTea"
                value={formData.favoriteTea}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ví dụ: Trà sữa trân châu đường đen"
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="teaFrequency" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Tần suất uống trà sữa
              </label>
              <select
                id="teaFrequency"
                name="teaFrequency"
                value={formData.teaFrequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn tần suất</option>
                {TEA_FREQUENCY_OPTIONS.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label 
                  htmlFor="sugarLevel" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Lượng đường ưa thích
                </label>
                <select
                  id="sugarLevel"
                  name="sugarLevel"
                  value={formData.sugarLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Chọn lượng đường</option>
                  {SUGAR_ICE_LEVELS.map((level, index) => (
                    <option key={index} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="iceLevel" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Lượng đá ưa thích
                </label>
                <select
                  id="iceLevel"
                  name="iceLevel"
                  value={formData.iceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Chọn lượng đá</option>
                  {SUGAR_ICE_LEVELS.map((level, index) => (
                    <option key={index} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Các loại trà sữa yêu thích
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TEA_PREFERENCES.map((tea, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tea-${index}`}
                      checked={formData.teaPreferences.includes(tea)}
                      onChange={() => handleTeaPreferenceChange(tea)}
                      className="mr-2"
                    />
                    <label htmlFor={`tea-${index}`} className="text-sm text-gray-700">
                      {tea}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Topping yêu thích
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TEA_TOPPINGS.map((topping, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`topping-${index}`}
                      checked={formData.toppings.includes(topping)}
                      onChange={() => handleToppingChange(topping)}
                      className="mr-2"
                    />
                    <label htmlFor={`topping-${index}`} className="text-sm text-gray-700">
                      {topping}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
          
          {/* Personal Info Section */}
          {activeTab === 'personal' && (
            <div className="mb-8 animate-fade-in">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <FaUser className="h-6 w-6 text-yellow-600" />
                </div>
                Thông tin cá nhân
              </h3>
            
            <div className="mb-4">
              <label 
                htmlFor="occupation" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Nghề nghiệp
              </label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Nghề nghiệp của bạn"
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="company" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Công ty
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Nơi bạn đang làm việc"
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="education" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Trình độ học vấn
              </label>
              <input
                type="text"
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ví dụ: Đại học, Cao đẳng, ..."
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="school" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Trường học
              </label>
              <input
                type="text"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Trường bạn đã/đang học"
              />
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="lookingFor" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Bạn đang tìm kiếm gì?
              </label>
              <select
                id="lookingFor"
                name="lookingFor"
                value={formData.lookingFor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn mục đích</option>
                {LOOKING_FOR_OPTIONS.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Sở thích
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {HOBBIES.map((hobby, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`hobby-${index}`}
                      checked={formData.hobbies.includes(hobby)}
                      onChange={() => handleHobbyChange(hobby)}
                      className="mr-2"
                    />
                    <label htmlFor={`hobby-${index}`} className="text-sm text-gray-700">
                      {hobby}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Ngôn ngữ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LANGUAGES.map((language, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`language-${index}`}
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageChange(language)}
                      className="mr-2"
                    />
                    <label htmlFor={`language-${index}`} className="text-sm text-gray-700">
                      {language}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
          
          {/* Lifestyle Section */}
          {activeTab === 'lifestyle' && (
            <div className="mb-8 animate-fade-in">
              <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <FaGlassCheers className="h-6 w-6 text-yellow-600" />
                </div>
                Lối sống
              </h3>
            
            <div className="mb-4">
              <label 
                htmlFor="smoking" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Hút thuốc
              </label>
              <select
                id="smoking"
                name="smoking"
                value={formData.lifestyle.smoking}
                onChange={(e) => handleLifestyleChange('smoking', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn tùy chọn</option>
                {LIFESTYLE_OPTIONS.smoking.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="drinking" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Uống rượu bia
              </label>
              <select
                id="drinking"
                name="drinking"
                value={formData.lifestyle.drinking}
                onChange={(e) => handleLifestyleChange('drinking', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn tùy chọn</option>
                {LIFESTYLE_OPTIONS.drinking.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="exercise" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Tập thể dục
              </label>
              <select
                id="exercise"
                name="exercise"
                value={formData.lifestyle.exercise}
                onChange={(e) => handleLifestyleChange('exercise', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn tùy chọn</option>
                {LIFESTYLE_OPTIONS.exercise.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label 
                htmlFor="diet" 
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Chế độ ăn
              </label>
              <select
                id="diet"
                name="diet"
                value={formData.lifestyle.diet}
                onChange={(e) => handleLifestyleChange('diet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn tùy chọn</option>
                {LIFESTYLE_OPTIONS.diet.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
          
          {/* Verification Tab - User verification */}
          {activeTab === 'verification' && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Xác minh tài khoản</h3>
              <p className="text-sm text-gray-600 mb-4">
                Xác minh tài khoản để sử dụng tính năng Blind Date và tăng độ tin cậy cho hồ sơ của bạn.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Ảnh xác minh của bạn sẽ chỉ được sử dụng để xác minh danh tính và sẽ không được hiển thị công khai.
                    </p>
                  </div>
                </div>
              </div>
              
              {currentUser?.verification?.isVerified ? (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Tài khoản của bạn đã được xác minh! Bạn có thể sử dụng tất cả các tính năng của ứng dụng.
                      </p>
                    </div>
                  </div>
                </div>
              ) : currentUser?.verification?.verificationStatus === 'pending' ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Yêu cầu xác minh của bạn đang được xử lý. Vui lòng chờ quản trị viên xác nhận.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Để xác minh tài khoản, vui lòng tải lên một ảnh selfie của bạn. Ảnh này sẽ được quản trị viên xem xét để xác minh danh tính của bạn.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh selfie xác minh
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="verification-photo" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                            <span>Tải lên ảnh</span>
                            <input 
                              id="verification-photo" 
                              name="verification-photo" 
                              type="file" 
                              className="sr-only"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  
                                  // Validate file
                                  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                                  if (!validTypes.includes(file.type)) {
                                    toast.error('Chỉ chấp nhận file PNG, JPG, JPEG');
                                    return;
                                  }
                                  
                                  if (file.size > 5 * 1024 * 1024) {
                                    toast.error('Kích thước file quá lớn. Tối đa 5MB');
                                    return;
                                  }
                                  
                                  // Gọi API tải lên ảnh xác minh (truyền File object)
                                  uploadVerificationPhoto(file)
                                    .then(response => {
                                      toast.success('Tải lên ảnh xác minh thành công. Vui lòng chờ quản trị viên xác nhận.');
                                    })
                                    .catch(error => {
                                      console.error('Verification photo upload error:', error);
                                      toast.error(error.response?.data?.message || 'Lỗi khi tải lên ảnh xác minh');
                                    });
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo và thả</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG tối đa 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {currentUser?.verification?.selfiePhoto && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Ảnh đã tải lên:</p>
                      <div className="relative w-40 h-40 mx-auto">
                        <img 
                          src={currentUser.verification.selfiePhoto} 
                          alt="Verification" 
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            // Gọi API xóa ảnh (base64 - chỉ cần xóa khỏi database)
                            axios.delete(`${API_URL}/api/upload/image`, {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json'
                              },
                              data: {
                                imageUrl: currentUser.verification.selfiePhoto,
                                type: 'verification'
                              }
                            })
                            .then(response => {
                              // Cập nhật thông tin người dùng trong formData
                              if (currentUser) {
                                updateProfile({
                                  verification: {
                                    ...currentUser.verification,
                                    selfiePhoto: '',
                                    verificationStatus: ''
                                  }
                                });
                              }
                              toast.success('Đã xóa ảnh xác minh');
                            })
                            .catch(error => {
                              console.error('Error deleting verification photo:', error);
                              toast.error(error.response?.data?.message || 'Lỗi khi xóa ảnh xác minh');
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-2">Lợi ích của việc xác minh tài khoản:</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  <li>Sử dụng tính năng Blind Date để gặp gỡ những người dùng khác</li>
                  <li>Tăng độ tin cậy cho hồ sơ của bạn</li>
                  <li>Được ưu tiên hiển thị trong kết quả tìm kiếm</li>
                  <li>Bảo vệ cộng đồng khỏi tài khoản giả mạo</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Preview Tab - Show profile as others see it */}
          {activeTab === 'preview' && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <FaEye className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Xem hồ sơ của bạn</h3>
              </div>
              
              <div className="bg-yellow-50 p-5 rounded-lg mb-6 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">
                  Đây là cách người khác nhìn thấy hồ sơ của bạn. Kiểm tra xem mọi thông tin đã đầy đủ và chính xác chưa!
                </p>
              </div>
              
              {/* Profile Preview Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                {/* Cover Image */}
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80')] bg-cover bg-center opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    
                    <div className="absolute bottom-4 right-8 text-white flex items-center space-x-3">
                      {formData.zodiacSign && (
                        <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                          <span className="mr-2 text-2xl">
                            {formData.zodiacSign === 'Bạch Dương' && '♈'}
                            {formData.zodiacSign === 'Kim Ngưu' && '♉'}
                            {formData.zodiacSign === 'Song Tử' && '♊'}
                            {formData.zodiacSign === 'Cự Giải' && '♋'}
                            {formData.zodiacSign === 'Sư Tử' && '♌'}
                            {formData.zodiacSign === 'Xử Nữ' && '♍'}
                            {formData.zodiacSign === 'Thiên Bình' && '♎'}
                            {formData.zodiacSign === 'Bọ Cạp' && '♏'}
                            {formData.zodiacSign === 'Nhân Mã' && '♐'}
                            {formData.zodiacSign === 'Ma Kết' && '♑'}
                            {formData.zodiacSign === 'Bảo Bình' && '♒'}
                            {formData.zodiacSign === 'Song Ngư' && '♓'}
                          </span>
                          <span className="font-medium">{formData.zodiacSign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Section with Avatar and Name */}
                  <div className="relative px-8 pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-10">
                      {/* Avatar */}
                      <div>
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl relative group">
                          {formData.avatarUrl ? (
                            <img 
                              src={formData.avatarUrl} 
                              alt={formData.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-5xl font-bold">
                              {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* User Name and Bio */}
                      <div className="flex-1 pt-4 md:pt-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2 bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                          {formData.fullName || "Chưa cập nhật tên"}
                        </h1>
                        
                        <p className="text-neutral-600 mb-4 text-sm md:text-base max-w-2xl">
                          {formData.bio || "Chào mừng bạn đến với hồ sơ của tôi! Hãy kết nối để trò chuyện nhé."}
                        </p>
                        
                        {/* Quick Info Badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.birthDate && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full text-amber-800 text-sm">
                              <FaBirthdayCake className="mr-1.5" />
                              <span>
                                {(() => {
                                  if (!formData.birthDate) return null;
                                  const today = new Date();
                                  const birth = new Date(formData.birthDate);
                                  let age = today.getFullYear() - birth.getFullYear();
                                  const monthDiff = today.getMonth() - birth.getMonth();
                                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                                    age--;
                                  }
                                  return `${age} tuổi`;
                                })()}
                              </span>
                            </div>
                          )}
                          
                          {formData.gender && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full text-amber-800 text-sm">
                              <span className="mr-1.5">⚥</span>
                              <span>
                                {formData.gender === 'male' ? 'Nam' : 
                                 formData.gender === 'female' ? 'Nữ' : 
                                 formData.gender === 'non-binary' ? 'Phi nhị nguyên' : 
                                 formData.gender === 'transgender' ? 'Chuyển giới' : 
                                 formData.gender === 'genderqueer' ? 'Phi giới tính' : 
                                 formData.gender === 'genderfluid' ? 'Giới tính linh hoạt' : 
                                 formData.gender === 'agender' ? 'Không xác định giới tính' : 
                                 formData.gender === 'other' ? 'Khác' : 
                                 formData.gender === 'everyone' ? 'Tất cả' : formData.gender}
                              </span>
                            </div>
                          )}
                          
                          {formData.city && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full text-amber-800 text-sm">
                              <FaMapMarkerAlt className="mr-1.5" />
                              <span>{formData.city}</span>
                            </div>
                          )}
                          
                          {formData.occupation && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full text-amber-800 text-sm">
                              <FaBriefcase className="mr-1.5" />
                              <span>{formData.occupation}</span>
                            </div>
                          )}
                          
                          {currentUser?.premium && (
                            <div className="flex items-center bg-yellow-100 px-3 py-1.5 rounded-full text-yellow-800 text-sm">
                              <FaCrown className="mr-1.5 text-yellow-600" />
                              <span>Premium</span>
                              {currentUser?.premiumUntil && (
                                <span className="ml-1 text-xs text-yellow-600">
                                  ({Math.max(0, Math.ceil((new Date(currentUser.premiumUntil) - new Date()) / (1000 * 60 * 60 * 24)))} ngày)
                                </span>
                              )}
                            </div>
                          )}
                          
                          {currentUser?.verified && (
                            <div className="flex items-center bg-green-100 px-3 py-1.5 rounded-full text-green-800 text-sm">
                              <FaUserCheck className="mr-1.5 text-green-600" />
                              <span>Đã xác minh</span>
                            </div>
                          )}
                          
                          {formData.height && (
                            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-full text-amber-800 text-sm">
                              <span className="mr-1.5">📏</span>
                              <span>{formData.height} cm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Photo Gallery */}
                {formData.photos && formData.photos.length > 0 && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bộ sưu tập ảnh</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-100">
                          <img src={photo} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education and Work */}
                {(formData.education || formData.school || formData.company) && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaGraduationCap className="mr-2 text-yellow-500" />
                      Học vấn & Công việc
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(formData.education || formData.school) && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Học vấn</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {formData.education && (
                              <p className="text-gray-700 font-medium">{formData.education}</p>
                            )}
                            {formData.school && (
                              <p className="text-gray-600 text-sm">{formData.school}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {(formData.occupation || formData.company) && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Công việc</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {formData.occupation && (
                              <p className="text-gray-700 font-medium">{formData.occupation}</p>
                            )}
                            {formData.company && (
                              <p className="text-gray-600 text-sm">{formData.company}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                                
                {/* Looking For */}
                {formData.lookingFor && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang tìm kiếm</h3>
                    <p className="text-gray-700">
                      {formData.lookingFor === 'relationship' ? 'Mối quan hệ nghiêm túc' : 
                       formData.lookingFor === 'friendship' ? 'Tình bạn' : 
                       formData.lookingFor === 'casual' ? 'Hẹn hò không ràng buộc' : 
                       formData.lookingFor === 'marriage' ? 'Hướng đến hôn nhân' : 
                       formData.lookingFor === 'not-sure' ? 'Chưa chắc chắn' : 
                       formData.lookingFor}
                    </p>
                  </div>
                )}
                
                {/* Address Information */}
                {(formData.address || formData.city) && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-yellow-500" />
                      Địa chỉ
                    </h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {formData.address && (
                        <p className="text-gray-700 mb-1">{formData.address}</p>
                      )}
                      {formData.city && (
                        <p className="text-gray-600">{formData.city}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tea Preferences */}
                {(formData.teaPreferences.length > 0 || formData.favoriteTea || formData.toppings.length > 0 || 
                  formData.sugarLevel || formData.iceLevel || formData.teaFrequency) && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaMugHot className="mr-2 text-yellow-500" />
                      Sở thích trà sữa
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.teaPreferences.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Loại trà yêu thích</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.teaPreferences.map((tea, index) => (
                              <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                {tea}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formData.favoriteTea && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Trà sữa yêu thích</h4>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {formData.favoriteTea}
                          </span>
                        </div>
                      )}
                      
                      {formData.toppings.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Topping yêu thích</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.toppings.map((topping, index) => (
                              <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                {topping}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formData.teaFrequency && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Tần suất uống trà sữa</h4>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {formData.teaFrequency}
                          </span>
                        </div>
                      )}
                      
                      {formData.sugarLevel && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Mức đường</h4>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {formData.sugarLevel}
                          </span>
                        </div>
                      )}
                      
                      {formData.iceLevel && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Mức đá</h4>
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                            {formData.iceLevel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Hobbies and Interests */}
                {(formData.hobbies.length > 0 || formData.languages.length > 0 || formData.interests.length > 0) && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaRunning className="mr-2 text-yellow-500" />
                      Sở thích và kỹ năng
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.hobbies.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Sở thích</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.hobbies.map((hobby, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formData.interests.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Sở thích khác</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.interests.map((interest, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formData.languages.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <FaLanguage className="mr-1 text-blue-500" />
                            Ngôn ngữ
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.languages.map((language, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Lifestyle */}
                {(formData.lifestyle.smoking || formData.lifestyle.drinking || 
                  formData.lifestyle.exercise || formData.lifestyle.diet) && (
                  <div className="px-8 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaStar className="mr-2 text-yellow-500" />
                      Lối sống
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.lifestyle.smoking && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaSmoking className="text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-700">Hút thuốc</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {formData.lifestyle.smoking === 'never' && 'Không bao giờ'}
                            {formData.lifestyle.smoking === 'sometimes' && 'Thỉnh thoảng'}
                            {formData.lifestyle.smoking === 'often' && 'Thường xuyên'}
                            {formData.lifestyle.smoking === 'quitting' && 'Đang cai'}
                          </p>
                        </div>
                      )}
                      
                      {formData.lifestyle.drinking && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaGlassCheers className="text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-700">Uống rượu bia</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {formData.lifestyle.drinking === 'never' && 'Không bao giờ'}
                            {formData.lifestyle.drinking === 'sometimes' && 'Thỉnh thoảng'}
                            {formData.lifestyle.drinking === 'often' && 'Thường xuyên'}
                            {formData.lifestyle.drinking === 'quitting' && 'Đang cai'}
                          </p>
                        </div>
                      )}
                      
                      {formData.lifestyle.exercise && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaRunning className="text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-700">Tập thể dục</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {formData.lifestyle.exercise === 'never' && 'Không bao giờ'}
                            {formData.lifestyle.exercise === 'sometimes' && 'Thỉnh thoảng'}
                            {formData.lifestyle.exercise === 'often' && 'Thường xuyên'}
                            {formData.lifestyle.exercise === 'daily' && 'Hàng ngày'}
                          </p>
                        </div>
                      )}
                      
                      {formData.lifestyle.diet && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-2">
                            <FaUtensils className="text-gray-500 mr-2" />
                            <h4 className="font-medium text-gray-700">Chế độ ăn</h4>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {formData.lifestyle.diet === 'omnivore' && 'Ăn tạp'}
                            {formData.lifestyle.diet === 'vegetarian' && 'Ăn chay'}
                            {formData.lifestyle.diet === 'vegan' && 'Ăn thuần chay'}
                            {formData.lifestyle.diet === 'pescatarian' && 'Ăn chay và hải sản'}
                            {formData.lifestyle.diet === 'keto' && 'Keto'}
                            {formData.lifestyle.diet === 'other' && 'Khác'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Đây chỉ là bản xem trước của hồ sơ. Một số thông tin có thể hiển thị khác đi tùy thuộc vào thiết bị và trình duyệt của người xem.
                </p>
              </div>
            </div>
          )}
          
          {/* Submit Button - Always visible */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? <Loader /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;