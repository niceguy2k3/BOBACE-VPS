import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { API_URL } from '../../config/constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkmey25hWd8ZDfGF1DIyQxykBhWoBhLcY",
  authDomain: "bobace-bb837.firebaseapp.com",
  projectId: "bobace-bb837",
  storageBucket: "bobace-bb837.firebasestorage.app",
  messagingSenderId: "556629068030",
  appId: "1:556629068030:web:cb11dfe4a0921da9167daf",
  measurementId: "G-0ERC5D9MLS"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firebase Cloud Messaging
let messaging = null;

// Kiểm tra xem trình duyệt có hỗ trợ thông báo không
export const isNotificationSupported = () => {
  return 'Notification' in window && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
};

// Khởi tạo messaging nếu chưa được khởi tạo
const initializeMessaging = () => {
  if (!messaging && isNotificationSupported()) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Lỗi khi khởi tạo Firebase Messaging:', error);
    }
  }
  return messaging;
};

// Yêu cầu quyền thông báo và đăng ký token thiết bị
export const requestNotificationPermission = async () => {
  try {
    // Kiểm tra xem trình duyệt có hỗ trợ thông báo không
    if (!isNotificationSupported()) {
      console.error('Trình duyệt này không hỗ trợ thông báo đẩy');
      return null;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      console.error('Người dùng chưa đăng nhập, không thể đăng ký thông báo');
      return null;
    }

    // Kiểm tra xem đã có token FCM trong localStorage chưa
    const savedFCMToken = localStorage.getItem('fcm_token');
    if (savedFCMToken) {
      console.log('Đã có token FCM trong localStorage, sử dụng lại token này');
      
      // Kiểm tra quyền thông báo hiện tại
      if (Notification.permission === 'granted') {
        // Đăng ký lại token với server
        try {
          await registerDeviceToken(savedFCMToken);
          console.log('Đã đăng ký lại token FCM với server');
          return savedFCMToken;
        } catch (error) {
          console.error('Lỗi khi đăng ký lại token FCM:', error);
          // Tiếp tục để lấy token mới
        }
      }
    }

    // Yêu cầu quyền thông báo - sử dụng cách tiếp cận tương thích với nhiều trình duyệt
    let permission;
    
    // Nếu quyền đã được cấp, không cần yêu cầu lại
    if (Notification.permission === 'granted') {
      permission = 'granted';
      console.log('Quyền thông báo đã được cấp trước đó');
    } else {
      // Kiểm tra xem trình duyệt có hỗ trợ API mới không
      if (typeof Notification.requestPermission === 'function') {
        // Chrome, Firefox, Safari, Edge mới
        try {
          // Yêu cầu quyền thông báo - phải được gọi từ sự kiện người dùng (click)
          permission = await Notification.requestPermission();
        } catch (error) {
          // Một số trình duyệt cũ sử dụng callback thay vì Promise
          if (error instanceof TypeError) {
            permission = await new Promise((resolve) => {
              Notification.requestPermission((result) => {
                resolve(result);
              });
            });
          } else {
            throw error;
          }
        }
      } else if (Notification.permission) {
        // Safari cũ
        permission = Notification.permission;
      }
    }
    
    console.log('Kết quả yêu cầu quyền thông báo:', permission);
    
    if (permission !== 'granted') {
      console.log('Quyền thông báo không được cấp');
      return null;
    }
    
    // Thử hiển thị thông báo test để xác nhận quyền
    try {
      const testNotification = new Notification('Thông báo test', {
        body: 'Đây là thông báo test để xác nhận quyền thông báo đã được cấp',
        icon: '/logo192.png'
      });
      
      // Đóng thông báo test sau 3 giây
      setTimeout(() => {
        testNotification.close();
      }, 3000);
      
      console.log('Đã hiển thị thông báo test thành công');
    } catch (notificationError) {
      console.error('Lỗi khi hiển thị thông báo test:', notificationError);
      // Tiếp tục xử lý ngay cả khi không thể hiển thị thông báo test
    }

    // Khởi tạo messaging
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) {
      console.error('Không thể khởi tạo Firebase Messaging');
      return null;
    }

    // Đăng ký service worker
    let registration;
    try {
      registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) {
        console.log('Đăng ký Service Worker mới...');
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
      }
      
      // Đảm bảo service worker đã active
      if (registration.installing) {
        console.log('Service worker đang cài đặt, đợi cho đến khi active...');
        const serviceWorker = registration.installing || registration.waiting;
        
        await new Promise((resolve) => {
          serviceWorker.addEventListener('statechange', (e) => {
            if (e.target.state === 'activated') {
              console.log('Service worker đã active');
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký Service Worker:', error);
      throw error;
    }
    
    // Lấy token thiết bị
    let token;
    try {
      token = await getToken(messagingInstance, {
        vapidKey: "BAbhbthwibNklf7na6lN5Fe-u_H4O3arQAapPAVj9C4xPh_imRkNXTdEbuEzz5p3q_zppLo_x5YplUkBLzI2tTk",
        serviceWorkerRegistration: registration
      });
    } catch (tokenError) {
      console.error('Lỗi khi lấy token thiết bị:', tokenError);
      
      // Thử lại sau 1 giây
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Thử lại lấy token thiết bị...');
      token = await getToken(messagingInstance, {
        vapidKey: "BAbhbthwibNklf7na6lN5Fe-u_H4O3arQAapPAVj9C4xPh_imRkNXTdEbuEzz5p3q_zppLo_x5YplUkBLzI2tTk",
        serviceWorkerRegistration: registration
      });
    }

    if (token) {
      console.log('Token thiết bị:', token);
      
      // Lưu token vào localStorage để sử dụng lại sau này
      localStorage.setItem('fcm_token', token);
      
      try {
        // Đăng ký token với server
        await registerDeviceToken(token);
        console.log('Đăng ký token thiết bị thành công');
        return token;
      } catch (registerError) {
        console.error('Lỗi khi đăng ký token với server:', registerError);
        
        // Thử đăng ký lại sau 3 giây
        setTimeout(async () => {
          try {
            console.log('Thử đăng ký lại token thiết bị...');
            await registerDeviceToken(token);
            console.log('Đăng ký lại token thiết bị thành công');
          } catch (retryError) {
            console.error('Lỗi khi thử đăng ký lại token thiết bị:', retryError);
          }
        }, 3000);
        
        // Vẫn trả về token để UI có thể hiển thị thông báo thành công
        return token;
      }
    } else {
      console.log('Không thể lấy token thiết bị');
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error);
    return null;
  }
};

// Đăng ký token thiết bị với server
const registerDeviceToken = async (token) => {
  try {
    const platform = 'web';
    const deviceInfo = {
      token,
      platform,
      deviceName: navigator.userAgent
    };

    // Lấy token từ localStorage
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      console.error('Không có token xác thực, không thể đăng ký thiết bị');
      throw new Error('Không có token xác thực');
    }
    
    // Thử xóa token cũ trước nếu có
    try {
      await axios.delete(`${API_URL}/api/devices/unregister`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        data: { token }
      });
      console.log('Đã xóa token cũ nếu có');
    } catch (deleteError) {
      // Bỏ qua lỗi khi xóa token cũ
      console.log('Không có token cũ để xóa hoặc có lỗi khi xóa:', deleteError);
    }
    
    // Gọi API với token xác thực và base URL
    const response = await axios.post(`${API_URL}/api/devices/register`, deviceInfo, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Đã đăng ký token thiết bị với server:', response.data);
    
    // Kiểm tra xem thiết bị đã được đăng ký thành công chưa
    try {
      const checkResponse = await axios.get(`${API_URL}/api/devices/check`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (checkResponse.data.registered) {
        console.log('Xác nhận thiết bị đã được đăng ký thành công:', checkResponse.data);
      } else {
        console.error('Thiết bị chưa được đăng ký thành công:', checkResponse.data);
        
        // Thử đăng ký lại nếu chưa thành công
        console.log('Thử đăng ký lại token thiết bị...');
        const retryResponse = await axios.post(`${API_URL}/api/devices/register`, deviceInfo, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        console.log('Kết quả đăng ký lại:', retryResponse.data);
      }
    } catch (checkError) {
      console.error('Lỗi khi kiểm tra trạng thái đăng ký thiết bị:', checkError);
    }
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký token thiết bị với server:', error);
    
    // Thử lại một lần nữa sau 1 giây
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log('Thử lại đăng ký token thiết bị...');
          const platform = 'web';
          const deviceInfo = {
            token,
            platform,
            deviceName: navigator.userAgent
          };
          
          const authToken = localStorage.getItem('token');
          if (!authToken) {
            reject(new Error('Không có token xác thực'));
            return;
          }
          
          const retryResponse = await axios.post(`${API_URL}/api/devices/register`, deviceInfo, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          console.log('Đăng ký lại token thiết bị thành công:', retryResponse.data);
          resolve(retryResponse.data);
        } catch (retryError) {
          console.error('Lỗi khi thử lại đăng ký token thiết bị:', retryError);
          reject(retryError);
        }
      }, 1000);
    });
  }
};

// Lắng nghe thông báo khi ứng dụng đang mở
export const onForegroundMessage = (callback) => {
  const messagingInstance = initializeMessaging();
  
  if (!messagingInstance) {
    console.error('Firebase Messaging chưa được khởi tạo');
    return () => {};
  }

  return onMessage(messagingInstance, (payload) => {
    console.log('Nhận thông báo khi ứng dụng đang mở:', payload);
    callback(payload);
  });
};

export default {
  isNotificationSupported,
  requestNotificationPermission,
  onForegroundMessage
};