import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import webPushService from '../services/webPushService';

/**
 * Component quản lý thông báo đẩy
 * - Đăng ký token thiết bị với Firebase
 * - Xử lý thông báo khi ứng dụng đang mở (foreground)
 * - Hiển thị thông báo trong ứng dụng
 */
const PushNotificationManager = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  // Khởi tạo thông báo đẩy khi người dùng đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser._id) {
      console.log('Người dùng đã đăng nhập, khởi tạo thông báo đẩy...');
      initializeNotifications();
    }
  }, [isAuthenticated, currentUser]);

  // Hàm khởi tạo thông báo đẩy
  const initializeNotifications = async () => {
    // Kiểm tra xem trình duyệt có hỗ trợ thông báo không
    if (!webPushService.isNotificationSupported()) {
      console.log('Trình duyệt này không hỗ trợ thông báo đẩy.');
      return;
    }

    try {
      // Đảm bảo người dùng đã đăng nhập
      if (!currentUser || !currentUser._id) {
        console.error('Người dùng chưa đăng nhập, không thể đăng ký thông báo');
        return;
      }
      
      console.log(`Khởi tạo thông báo đẩy cho người dùng: ${currentUser._id}`);
      
      // Kiểm tra xem đã có quyền thông báo chưa
      if (Notification.permission === 'granted') {
        // Nếu đã có quyền, cập nhật subscription
        console.log('Đã có quyền thông báo, đang cập nhật subscription...');
        
        // Cập nhật subscription
        const result = await webPushService.updateSubscriptionUser();
        
        if (result) {
          console.log('Đã cập nhật subscription thành công');
          setupNotificationListeners();
          
          // Lưu thông tin người dùng đã đăng ký thông báo
          localStorage.setItem('notification_registered', 'true');
          localStorage.setItem('notification_user_id', currentUser._id);
        } else {
          console.error('Không thể cập nhật subscription mặc dù đã được cấp quyền');
        }
      } else if (Notification.permission !== 'denied') {
        // Nếu chưa yêu cầu quyền, yêu cầu quyền và đăng ký subscription
        console.log('Chưa được cấp quyền thông báo, yêu cầu quyền...');
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const subscription = await webPushService.requestNotificationPermission();
          if (subscription) {
            console.log('Đã đăng ký subscription thành công');
            setupNotificationListeners();
            
            // Lưu thông tin người dùng đã đăng ký thông báo
            localStorage.setItem('notification_registered', 'true');
            localStorage.setItem('notification_user_id', currentUser._id);
          }
        }
      } else {
        console.log('Người dùng đã từ chối quyền thông báo');
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo thông báo đẩy:', error);
      
      // Thử lại sau 5 giây nếu có lỗi
      setTimeout(() => {
        console.log('Thử lại việc khởi tạo thông báo đẩy...');
        initializeNotifications();
      }, 5000);
    }
  };

  // Thiết lập lắng nghe thông báo
  const setupNotificationListeners = () => {
    // Lắng nghe sự kiện khi người dùng click vào thông báo
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        handleNotificationClick(event.data.notification);
      }
    });

    // Thiết lập kiểm tra định kỳ để đảm bảo service worker luôn hoạt động
    const checkInterval = setInterval(async () => {
      try {
        if (!navigator.onLine) {
          console.log('Thiết bị đang offline, bỏ qua kiểm tra service worker');
          return;
        }

        // Kiểm tra xem service worker có đang hoạt động không
        const registration = await navigator.serviceWorker.getRegistration('/web-push-sw.js');
        
        if (!registration) {
          console.log('Service worker không còn đăng ký, đăng ký lại...');
          await webPushService.requestNotificationPermission();
        } else {
          // Kiểm tra subscription
          const subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            console.log('Subscription không tồn tại, đăng ký lại...');
            await webPushService.requestNotificationPermission();
          } else {
            console.log('Service worker và subscription vẫn đang hoạt động');
          }
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra service worker:', error);
      }
    }, 60 * 60 * 1000); // Kiểm tra mỗi 1 giờ

    // Trả về hàm cleanup
    return () => {
      clearInterval(checkInterval);
    };
  };

  // Xử lý thông báo khi ứng dụng đang mở
  // Web Push API không hỗ trợ foreground message trực tiếp như Firebase
  // Thông báo sẽ được hiển thị bởi Service Worker

  // Xử lý khi người dùng click vào thông báo
  const handleNotificationClick = (payload) => {
    // Điều hướng đến trang tương ứng
    if (payload.data && payload.data.linkTo) {
      navigate(payload.data.linkTo);
    } else if (payload.url) {
      navigate(payload.url);
    } else if (payload.linkTo) {
      navigate(payload.linkTo);
    }
  };

  // Component này không render gì cả, chỉ xử lý logic
  return null;
};

export default PushNotificationManager;