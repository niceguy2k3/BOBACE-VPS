import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { VIETNAM_CITIES } from '../config/constants';
import Loader from '../components/Loader';
import logo from '../images/logo2.png';
import { FaCheck, FaTimes, FaCamera, FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';
import axios from 'axios';
import { API_URL } from '../config/constants';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthDate: '',
    gender: '',
    // Thông tin bổ sung
    bio: '',
    city: '',
    height: '',
    occupation: '',
    education: '',
    // Sở thích
    teaPreferences: [],
    favoriteTea: '',
    sugarLevel: '',
    iceLevel: '',
    // Tìm kiếm
    interestedIn: [],
    lookingFor: '',
    // Thông tin khác
    hobbies: [],
    zodiacSign: '',
    // Hình ảnh
    avatar: '',
    photos: []
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const avatarInputRef = useRef(null);
  const photosInputRef = useRef(null);
  
  // Kiểm tra độ mạnh của mật khẩu
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };
  
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  
  // Xác định màu và thông báo dựa trên độ mạnh
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Yếu';
    if (passwordStrength <= 3) return 'Trung bình';
    return 'Mạnh';
  };
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [name]: [...prev[name], value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: prev[name].filter(item => item !== value)
      }));
    }
  };
  
  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.email || !formData.password || !formData.confirmPassword || 
          !formData.fullName || !formData.birthDate || !formData.gender) {
        showErrorToast('Vui lòng điền đầy đủ thông tin cơ bản');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        showErrorToast('Vui lòng nhập một địa chỉ email hợp lệ');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        showErrorToast('Mật khẩu không khớp');
        return;
      }
      
      // Kiểm tra độ mạnh của mật khẩu
      if (formData.password.length < 8) {
        showErrorToast('Mật khẩu phải có ít nhất 8 ký tự');
        return;
      }
      
      if (passwordStrength < 3) {
        showErrorToast('Mật khẩu quá yếu. Vui lòng tạo mật khẩu mạnh hơn với chữ hoa, chữ thường, số và ký tự đặc biệt');
        return;
      }
      
      // Calculate minimum age (18 years ago)
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
      
      if (new Date(formData.birthDate) > minAgeDate) {
        showErrorToast('Bạn phải đủ 18 tuổi để đăng ký');
        return;
      }
    } else if (currentStep === 2) {
      // Validate additional info
      if (!formData.city) {
        showErrorToast('Vui lòng chọn thành phố của bạn');
        return;
      }
      
      if (formData.interestedIn.length === 0) {
        showErrorToast('Vui lòng chọn ít nhất một giới tính bạn quan tâm');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  // Xử lý upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra loại file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showErrorToast('Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)');
      return;
    }
    
    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Kích thước file quá lớn. Tối đa 5MB');
      return;
    }
    
    try {
      setUploadingAvatar(true);
      
      // Convert file to base64 using Promise
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
      
      console.log('Base64 conversion successful, length:', base64.length);
      
      // Upload to backend
      const response = await axios.post(`${API_URL}/api/upload/register/avatar`, 
        { avatar: base64 },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000 // 60 seconds timeout
        }
      );
      
      console.log('Upload response:', response.data);
      
      setFormData(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));
      
      showSuccessToast('Tải lên ảnh đại diện thành công');
    } catch (error) {
      console.error('Avatar upload error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      
      if (error.code === 'ECONNABORTED') {
        showErrorToast('Quá thời gian tải lên. Vui lòng thử lại với ảnh nhỏ hơn.');
      } else if (error.message === 'Network Error') {
        showErrorToast('Lỗi kết nối. Vui lòng kiểm tra lại kết nối mạng và thử lại.');
      } else {
        showErrorToast(error.response?.data?.message || 'Không thể tải lên ảnh đại diện');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Xử lý upload nhiều ảnh
  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Kiểm tra số lượng ảnh
    const totalPhotos = formData.photos.length + files.length;
    if (totalPhotos > 6) {
      showErrorToast(`Bạn chỉ có thể tải lên tối đa 6 ảnh. Hiện tại đã có ${formData.photos.length} ảnh.`);
      return;
    }
    
    // Kiểm tra loại file và kích thước
    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showErrorToast(`File "${file.name}" không phải là hình ảnh hợp lệ`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`File "${file.name}" có kích thước quá lớn. Tối đa 5MB`);
        return;
      }
    }
    
    try {
      setUploadingPhotos(true);
      
      // Convert all files to base64
      const base64Promises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result);
            } else {
              reject(new Error(`Failed to read file ${index + 1}`));
            }
          };
          reader.onerror = (error) => {
            reject(new Error(`Error reading file ${index + 1}: ${error.message}`));
          };
          reader.readAsDataURL(file);
        });
      });
      
      const base64Images = await Promise.all(base64Promises);
      console.log('Base64 conversion successful, images count:', base64Images.length);
      
      const response = await axios.post(`${API_URL}/api/upload/register/photos`, 
        { images: base64Images },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000 // 120 seconds timeout for multiple images
        }
      );
      
      console.log('Upload response:', response.data);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...response.data.photos]
      }));
      
      showSuccessToast('Tải lên hình ảnh thành công');
    } catch (error) {
      console.error('Photos upload error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      
      if (error.code === 'ECONNABORTED') {
        showErrorToast('Quá thời gian tải lên. Vui lòng thử lại với ảnh nhỏ hơn.');
      } else if (error.message === 'Network Error') {
        showErrorToast('Lỗi kết nối. Vui lòng kiểm tra lại kết nối mạng và thử lại.');
      } else {
        showErrorToast(error.response?.data?.message || 'Không thể tải lên hình ảnh');
      }
    } finally {
      setUploadingPhotos(false);
    }
  };
  
  // Xóa ảnh
  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };
  
  // Xóa avatar
  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Kiểm tra xem đã upload avatar chưa
      if (!formData.avatar) {
        showErrorToast('Vui lòng tải lên ảnh đại diện');
        setLoading(false);
        return;
      }
      
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registerData } = formData;
      
      // Convert height to number if provided
      if (registerData.height) registerData.height = Number(registerData.height);
      
      // Thêm trường requireEmailVerification
      registerData.requireEmailVerification = true;
      
      const response = await axios.post(`${API_URL}/api/auth/register`, registerData);
      
      // Lưu email để sử dụng trong trang xác thực
      localStorage.setItem('pendingVerificationEmail', formData.email);
      
      showSuccessToast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', {
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true
      });
      
      // Chuyển hướng đến trang chờ xác thực email
      navigate('/pending-verification');
    } catch (error) {
      console.error('Registration error:', error);
      showErrorToast(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Danh sách các loại trà sữa phổ biến
  const teaOptions = [
    'Trà sữa truyền thống',
    'Trà sữa trân châu đường đen',
    'Trà sữa matcha',
    'Trà sữa socola',
    'Trà sữa khoai môn',
    'Trà sữa dâu',
    'Trà đào',
    'Trà vải',
    'Trà chanh',
    'Trà đen',
    'Trà xanh',
    'Trà ô long'
  ];

  // Danh sách sở thích
  const hobbyOptions = [
    'Đọc sách',
    'Xem phim',
    'Du lịch',
    'Nấu ăn',
    'Âm nhạc',
    'Thể thao',
    'Chơi game',
    'Nhiếp ảnh',
    'Vẽ tranh',
    'Yoga',
    'Thiền',
    'Mua sắm'
  ];
  
  return (
    <div className="flex justify-center items-center min-h-screen relative">
      {/* Background gradient - full screen */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-50 to-neutral-100 z-0"></div>
      <div className="relative z-10 w-full flex justify-center items-center py-16">
        <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="BOBACE" className="h-24" />
        </div>
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-6">
          Đăng ký tài khoản
        </h2>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-xs mt-1">Thông tin cơ bản</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-xs mt-1">Thông tin bổ sung</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-xs mt-1">Hình ảnh</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${currentStep >= 4 ? 'text-yellow-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                4
              </div>
              <span className="text-xs mt-1">Sở thích</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <>
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="fullName" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="birthDate" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Bạn phải đủ 18 tuổi để đăng ký</p>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="gender" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                  <option value="Khác">Khác</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="password" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Tối thiểu 8 ký tự"
                  required
                />
                
                {/* Hiển thị độ mạnh của mật khẩu */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Độ mạnh mật khẩu: {getPasswordStrengthText()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full rounded-full ${getPasswordStrengthColor()}`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Hiển thị các yêu cầu mật khẩu */}
                    {passwordFocus && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-xs font-medium mb-2">Mật khẩu phải có:</p>
                        <ul className="space-y-1">
                          <li className="text-xs flex items-center">
                            {passwordChecks.length ? (
                              <FaCheck className="text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="text-red-500 mr-2" />
                            )}
                            Ít nhất 8 ký tự
                          </li>
                          <li className="text-xs flex items-center">
                            {passwordChecks.uppercase ? (
                              <FaCheck className="text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="text-red-500 mr-2" />
                            )}
                            Ít nhất 1 chữ hoa (A-Z)
                          </li>
                          <li className="text-xs flex items-center">
                            {passwordChecks.lowercase ? (
                              <FaCheck className="text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="text-red-500 mr-2" />
                            )}
                            Ít nhất 1 chữ thường (a-z)
                          </li>
                          <li className="text-xs flex items-center">
                            {passwordChecks.number ? (
                              <FaCheck className="text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="text-red-500 mr-2" />
                            )}
                            Ít nhất 1 số (0-9)
                          </li>
                          <li className="text-xs flex items-center">
                            {passwordChecks.special ? (
                              <FaCheck className="text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="text-red-500 mr-2" />
                            )}
                            Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                {formData.password && formData.confirmPassword && (
                  <div className="mt-1 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-xs text-green-500 flex items-center">
                        <FaCheck className="mr-1" /> Mật khẩu khớp
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 flex items-center">
                        <FaTimes className="mr-1" /> Mật khẩu không khớp
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 text-white py-2 px-6 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          
          {/* Step 2: Additional Information */}
          {currentStep === 2 && (
            <>
              <div className="mb-4">
                <label 
                  htmlFor="bio" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Giới thiệu bản thân
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Viết vài điều về bản thân (tối đa 500 ký tự)"
                  rows="3"
                  maxLength="500"
                />
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="city" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                >
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="height" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="140"
                  max="220"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ví dụ: 170"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
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
                    placeholder="Ví dụ: Kỹ sư phần mềm"
                  />
                </div>
                
                <div>
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
                    placeholder="Ví dụ: Đại học"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Bạn quan tâm đến giới tính nào? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="interestedIn"
                      value="male"
                      checked={formData.interestedIn.includes('male')}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <span>Nam</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="interestedIn"
                      value="female"
                      checked={formData.interestedIn.includes('female')}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <span>Nữ</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="interestedIn"
                      value="non-binary"
                      checked={formData.interestedIn.includes('non-binary')}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <span>Phi nhị nguyên</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="interestedIn"
                      value="other"
                      checked={formData.interestedIn.includes('other')}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <span>Khác</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Chọn ít nhất một lựa chọn</p>
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="lookingFor" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Bạn đang tìm kiếm điều gì?
                </label>
                <select
                  id="lookingFor"
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Chọn mục đích</option>
                  <option value="relationship">Mối quan hệ nghiêm túc</option>
                  <option value="friendship">Tình bạn</option>
                  <option value="casual">Hẹn hò không ràng buộc</option>
                  <option value="marriage">Hướng đến hôn nhân</option>
                  <option value="not-sure">Chưa chắc chắn</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-yellow-500 text-white py-2 px-6 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          
          {/* Step 3: Upload Images */}
          {currentStep === 3 && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-700 mb-4">Hình ảnh của bạn</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hãy tải lên ảnh đại diện và bộ sưu tập ảnh để tăng cơ hội kết nối với những người khác.
                </p>
                
                {/* Avatar upload section */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Ảnh đại diện <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Đây là ảnh chính hiển thị trên hồ sơ của bạn</p>
                  
                  <div className="flex items-center justify-center mb-4">
                    {formData.avatar ? (
                      <div className="relative">
                        <img 
                          src={formData.avatar} 
                          alt="Avatar" 
                          className="w-40 h-40 object-cover rounded-full border-4 border-yellow-400"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Xóa ảnh đại diện"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => avatarInputRef.current.click()}
                        className="w-40 h-40 rounded-full bg-gray-200 flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-gray-300 hover:border-yellow-400 transition-colors"
                      >
                        <FaCamera size={32} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Tải lên ảnh đại diện</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current.click()}
                      disabled={uploadingAvatar}
                      className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <Loader size="sm" />
                      ) : (
                        <>
                          <FaUpload className="mr-2" /> 
                          {formData.avatar ? 'Thay đổi ảnh đại diện' : 'Tải lên ảnh đại diện'}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-red-500 mt-1 text-center">
                    Bắt buộc phải có ảnh đại diện để hoàn tất đăng ký
                  </p>
                </div>
                
                {/* Photos upload section */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Bộ sưu tập ảnh <span className="text-gray-500">(không bắt buộc)</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Tải lên tối đa 6 ảnh để giới thiệu thêm về bản thân</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Existing photos */}
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <img 
                          src={photo} 
                          alt={`Photo ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload placeholder */}
                    {formData.photos.length < 6 && (
                      <div 
                        onClick={() => photosInputRef.current.click()}
                        className="aspect-square rounded-lg bg-gray-100 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-yellow-400 transition-colors"
                      >
                        <FaImage size={24} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 text-center px-2">Thêm ảnh</span>
                      </div>
                    )}
                    
                    {/* Empty placeholders to maintain grid */}
                    {Array.from({ length: Math.max(0, 5 - formData.photos.length) }).map((_, index) => (
                      <div 
                        key={`empty-${index}`}
                        className="aspect-square rounded-lg bg-gray-50 border border-gray-200"
                      ></div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <input
                      type="file"
                      ref={photosInputRef}
                      onChange={handlePhotosUpload}
                      accept="image/jpeg,image/png,image/gif"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photosInputRef.current.click()}
                      disabled={uploadingPhotos || formData.photos.length >= 6}
                      className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 flex items-center disabled:opacity-50"
                    >
                      {uploadingPhotos ? (
                        <Loader size="sm" />
                      ) : (
                        <>
                          <FaUpload className="mr-2" /> 
                          Tải lên ảnh bộ sưu tập
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Đã tải lên {formData.photos.length}/6 ảnh
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.avatar}
                  className="bg-yellow-500 text-white py-2 px-6 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}
          
          {/* Step 4: Preferences and Interests */}
          {currentStep === 4 && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Loại trà sữa yêu thích
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {teaOptions.map((tea, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="teaPreferences"
                        value={tea}
                        checked={formData.teaPreferences.includes(tea)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      />
                      <span className="text-sm">{tea}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label 
                  htmlFor="favoriteTea" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Trà sữa yêu thích nhất
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
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
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
                    <option value="0%">0%</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                  </select>
                </div>
                
                <div>
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
                    <option value="0%">0%</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Sở thích khác
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {hobbyOptions.map((hobby, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="hobbies"
                        value={hobby}
                        checked={formData.hobbies.includes(hobby)}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                      />
                      <span className="text-sm">{hobby}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label 
                  htmlFor="zodiacSign" 
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Cung hoàng đạo
                </label>
                <select
                  id="zodiacSign"
                  name="zodiacSign"
                  value={formData.zodiacSign}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Chọn cung hoàng đạo</option>
                  <option value="Bạch Dương">Bạch Dương (21/3 - 19/4)</option>
                  <option value="Kim Ngưu">Kim Ngưu (20/4 - 20/5)</option>
                  <option value="Song Tử">Song Tử (21/5 - 21/6)</option>
                  <option value="Cự Giải">Cự Giải (22/6 - 22/7)</option>
                  <option value="Sư Tử">Sư Tử (23/7 - 22/8)</option>
                  <option value="Xử Nữ">Xử Nữ (23/8 - 22/9)</option>
                  <option value="Thiên Bình">Thiên Bình (23/9 - 23/10)</option>
                  <option value="Bọ Cạp">Bọ Cạp (24/10 - 21/11)</option>
                  <option value="Nhân Mã">Nhân Mã (22/11 - 21/12)</option>
                  <option value="Ma Kết">Ma Kết (22/12 - 19/1)</option>
                  <option value="Bảo Bình">Bảo Bình (20/1 - 18/2)</option>
                  <option value="Song Ngư">Song Ngư (19/2 - 20/3)</option>
                </select>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.avatar}
                  className="bg-yellow-500 text-white py-2 px-6 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 disabled:opacity-50"
                >
                  {loading ? <Loader /> : 'Hoàn tất đăng ký'}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-yellow-600 hover:text-yellow-700">
              Đăng nhập
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;