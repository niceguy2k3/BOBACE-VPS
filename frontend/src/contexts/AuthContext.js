import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config/constants';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Khởi tạo trạng thái quyền vị trí từ localStorage nếu có
  const [locationPermission, setLocationPermission] = useState(() => {
    const savedPermission = localStorage.getItem('locationPermissionStatus');
    return savedPermission || 'pending'; // 'granted', 'denied', 'pending'
  });

  // Lưu trạng thái quyền vị trí vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (locationPermission !== 'pending') {
      localStorage.setItem('locationPermissionStatus', locationPermission);
    }
  }, [locationPermission]);

  // Tạo instance axios với interceptor
  const authAxios = axios.create();
  
  // Thêm interceptor để tự động thêm token vào header
  authAxios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Thêm interceptor để xử lý lỗi 401 (token hết hạn)
  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    // Check if user is logged in on mount
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Kiểm tra xem token có hợp lệ không
        try {
          // Giải mã token để kiểm tra thời hạn
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiry = payload.exp * 1000; // Chuyển đổi từ giây sang mili giây
          
          // Nếu token đã hết hạn
          if (Date.now() >= expiry) {
            console.log('Token has expired');
            // Nếu không có ghi nhớ đăng nhập, đăng xuất người dùng
            if (!localStorage.getItem('rememberMe')) {
              localStorage.removeItem('token');
              sessionStorage.removeItem('currentUser');
              setCurrentUser(null);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error checking token validity:', e);
        }
        
        // Sử dụng cache để tránh gọi API liên tục
        const cachedUser = sessionStorage.getItem('currentUser');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setCurrentUser(userData);
            setLoading(false);
            
            // Vẫn gọi API để cập nhật dữ liệu mới nhất, nhưng không chờ đợi
            authAxios.get(`${API_URL}/api/auth/me`)
              .then(response => {
                setCurrentUser(response.data);
                sessionStorage.setItem('currentUser', JSON.stringify(response.data));
              })
              .catch(error => {
                console.error('Error refreshing user data:', error);
                if (error.response && error.response.status === 401) {
                  sessionStorage.removeItem('currentUser');
                }
              });
              
            return;
          } catch (e) {
            console.error('Error parsing cached user:', e);
            sessionStorage.removeItem('currentUser');
          }
        }
        
        // Nếu không có cache, gọi API và chờ đợi
        const response = await authAxios.get(`${API_URL}/api/auth/me`);
        setCurrentUser(response.data);
        sessionStorage.setItem('currentUser', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      // Nếu yêu cầu xác thực email, không lưu token và không đặt currentUser
      if (userData.requireEmailVerification) {
        return response.data;
      } else {
        // Nếu không yêu cầu xác thực email (trường hợp cũ), tiếp tục như trước
        localStorage.setItem('token', response.data.token);
        setCurrentUser(response.data.user);
        return response.data;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký');
      throw error;
    }
  };
  
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, { token });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setCurrentUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi xác thực email');
      throw error;
    }
  };
  
  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/resend-verification`, { email });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi lại email xác thực');
      throw error;
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password,
        rememberMe 
      });
      localStorage.setItem('token', response.data.token);
      
      // Lưu thông tin về việc ghi nhớ đăng nhập
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      setCurrentUser(response.data.user);
      
      // Yêu cầu quyền thông báo và đăng ký subscription cho người dùng hiện tại
      try {
        // Đợi 1 giây để đảm bảo token đã được lưu
        setTimeout(async () => {
          try {
            // Import webPushService
            const { requestNotificationPermission } = await import('../services/webPushService');
            
            // Kiểm tra xem trình duyệt có hỗ trợ thông báo không
            if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
              // Yêu cầu quyền thông báo
              const subscription = await requestNotificationPermission();
              if (subscription) {
                console.log('Đăng ký thông báo thành công:', subscription);
              } else {
                console.log('Người dùng từ chối quyền thông báo hoặc đã xảy ra lỗi');
              }
            } else {
              console.log('Trình duyệt không hỗ trợ thông báo đẩy');
            }
          } catch (err) {
            console.error('Lỗi khi đăng ký thông báo:', err);
          }
        }, 1000);
      } catch (subError) {
        console.error('Lỗi khi đăng ký thông báo:', subError);
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/users/${currentUser._id}`, profileData, config);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ');
      throw error;
    }
  };

  const updateAvatar = async (formData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(`${API_URL}/api/users/avatar`, formData, config);
      setCurrentUser({
        ...currentUser,
        avatar: response.data.avatar
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật ảnh đại diện');
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`${API_URL}/api/users/account`, config);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi xóa tài khoản');
      throw error;
    }
  };

  const blockUser = async (userId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/api/users/block/${userId}`, {}, config);
      
      // Update current user with new blocked users list
      setCurrentUser({
        ...currentUser,
        blockedUsers: [...(currentUser.blockedUsers || []), userId]
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi chặn người dùng');
      throw error;
    }
  };

  const unblockUser = async (userId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.delete(`${API_URL}/api/users/block/${userId}`, config);
      
      // Update current user with new blocked users list
      setCurrentUser({
        ...currentUser,
        blockedUsers: (currentUser.blockedUsers || []).filter(id => id !== userId)
      });
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi bỏ chặn người dùng');
      throw error;
    }
  };

  const getBlockedUsers = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/users/blocked`, config);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi lấy danh sách người dùng bị chặn');
      throw error;
    }
  };

  const reportUser = async (userId, reason, description) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/api/users/report`, {
        userId,
        reason,
        description
      }, config);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi báo cáo người dùng');
      throw error;
    }
  };
  
  // Hàm yêu cầu và cập nhật vị trí người dùng
  const updateUserLocation = async () => {
    try {
      // Kiểm tra xem trình duyệt có hỗ trợ Geolocation API không
      if (!navigator.geolocation) {
        setLocationPermission('unsupported');
        return { success: false, message: 'Trình duyệt của bạn không hỗ trợ định vị' };
      }
      
      // Hiển thị thông báo đang lấy vị trí
      toast.info('Đang lấy vị trí của bạn...');
      
      // Yêu cầu quyền truy cập vị trí với timeout dài hơn
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000, // Tăng timeout lên 15 giây
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Kiểm tra tính hợp lệ của tọa độ
      if (isNaN(latitude) || isNaN(longitude)) {
        setLocationPermission('error');
        return { success: false, message: 'Tọa độ vị trí không hợp lệ' };
      }
      
      // Cập nhật vị trí lên server
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const locationData = {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
        }
      };
      
      // Log dữ liệu trước khi gửi
      console.log('Sending location data:', locationData);
      
      const response = await axios.put(`${API_URL}/api/users/${currentUser._id}`, locationData, config);
      
      // Cập nhật thông tin người dùng hiện tại
      setCurrentUser({
        ...currentUser,
        location: response.data.location
      });
      
      // Cập nhật trạng thái quyền truy cập vị trí
      setLocationPermission('granted');
      
      // Lưu trạng thái đã cấp quyền vào localStorage
      localStorage.setItem('locationPermissionGranted', 'true');
      
      return { success: true, message: 'Đã cập nhật vị trí thành công' };
    } catch (error) {
      console.error('Error updating location:', error);
      
      // Xác định loại lỗi
      if (error.code === 1) { // PERMISSION_DENIED
        setLocationPermission('denied');
        return { 
          success: false, 
          message: 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng kiểm tra cài đặt quyền trong trình duyệt và thử lại.' 
        };
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        setLocationPermission('unavailable');
        return { 
          success: false, 
          message: 'Không thể xác định vị trí của bạn. Vui lòng kiểm tra kết nối mạng và GPS của bạn.' 
        };
      } else if (error.code === 3) { // TIMEOUT
        setLocationPermission('timeout');
        return { 
          success: false, 
          message: 'Quá thời gian xác định vị trí. Vui lòng thử lại sau.' 
        };
      } else if (error.response) {
        // Lỗi từ server
        setLocationPermission('error');
        return { 
          success: false, 
          message: error.response.data?.message || 'Lỗi server khi cập nhật vị trí' 
        };
      }
      
      setLocationPermission('error');
      return { 
        success: false, 
        message: 'Đã xảy ra lỗi khi cập nhật vị trí. Vui lòng thử lại sau.' 
      };
    }
  };

  // Toggle incognito mode
  const toggleIncognitoMode = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/api/users/incognito`, {}, config);
      
      // Update current user with new incognito mode status
      if (currentUser && currentUser.settings) {
        const updatedSettings = {
          ...currentUser.settings,
          privacy: {
            ...(currentUser.settings.privacy || {}),
            incognitoMode: response.data.incognitoMode
          }
        };
        
        setCurrentUser({
          ...currentUser,
          settings: updatedSettings
        });
      }
      
      return response.data;
    } catch (error) {
      // Kiểm tra xem lỗi có phải do tính năng premium không
      if (error.response?.data?.isPremiumFeature) {
        toast.error('Chế độ ẩn danh chỉ khả dụng cho người dùng premium. Vui lòng nâng cấp tài khoản để sử dụng tính năng này.');
      } else {
        setError(error.response?.data?.message || 'Đã xảy ra lỗi khi thay đổi chế độ ẩn danh');
      }
      throw error;
    }
  };

  // Upload verification photo
  const uploadVerificationPhoto = async (formData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(`${API_URL}/api/upload/verification`, formData, config);
      
      // Cập nhật thông tin người dùng hiện tại
      if (response.data && response.data.verificationPhoto) {
        setCurrentUser(prev => ({
          ...prev,
          verification: {
            ...prev.verification,
            selfiePhoto: response.data.verificationPhoto,
            verificationStatus: 'pending'
          }
        }));
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Đã xảy ra lỗi khi tải lên ảnh xác minh');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    locationPermission,
    register,
    login,
    logout,
    updateProfile,
    updateAvatar,
    deleteAccount,
    blockUser,
    unblockUser,
    getBlockedUsers,
    reportUser,
    updateUserLocation,
    toggleIncognitoMode,
    uploadVerificationPhoto,
    verifyEmail,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};