import axios from 'axios';
import { API_URL } from '../config/constants';

// Kiểm tra xem trình duyệt có hỗ trợ Push API không
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Kiểm tra xem người dùng đã cấp quyền thông báo chưa
export const askUserPermission = async () => {
  try {
    const permissionResult = await Notification.requestPermission();
    return permissionResult;
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error);
    return 'denied';
  }
};

// Đăng ký service worker
export const registerServiceWorker = async () => {
  if (!isPushNotificationSupported()) {
    console.log('Trình duyệt không hỗ trợ thông báo đẩy');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker đã đăng ký thành công:', registration);
    return registration;
  } catch (error) {
    console.error('Lỗi khi đăng ký Service Worker:', error);
    return null;
  }
};

// Tạo subscription mới
export const createPushSubscription = async (registration) => {
  try {
    // Lấy VAPID public key từ server
    const response = await axios.get(`${API_URL}/api/notifications/vapid-public-key`);
    const vapidPublicKey = response.data.publicKey;

    // Chuyển đổi VAPID public key thành Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Đăng ký subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    console.log('Đã tạo subscription mới:', subscription);
    return subscription;
  } catch (error) {
    console.error('Lỗi khi tạo subscription:', error);
    return null;
  }
};

// Đăng ký subscription với server
export const sendSubscriptionToServer = async (subscription, deviceInfo = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Người dùng chưa đăng nhập');
      return false;
    }

    const response = await axios.post(
      `${API_URL}/api/notifications/register-subscription`,
      {
        subscription: JSON.stringify(subscription),
        deviceInfo
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Đã đăng ký subscription với server:', response.data);
    return true;
  } catch (error) {
    console.error('Lỗi khi đăng ký subscription với server:', error);
    return false;
  }
};

// Hủy đăng ký subscription
export const unregisterPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('Không tìm thấy service worker registration');
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log('Không tìm thấy subscription');
      return false;
    }

    // Hủy subscription
    const unsubscribed = await subscription.unsubscribe();
    if (unsubscribed) {
      // Thông báo cho server
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${API_URL}/api/notifications/unregister-subscription`,
          {
            subscription: JSON.stringify(subscription)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
    }

    return unsubscribed;
  } catch (error) {
    console.error('Lỗi khi hủy đăng ký thông báo đẩy:', error);
    return false;
  }
};

// Kiểm tra và đăng ký thông báo đẩy
export const initializePushNotifications = async () => {
  try {
    // Kiểm tra hỗ trợ
    if (!isPushNotificationSupported()) {
      console.log('Trình duyệt không hỗ trợ thông báo đẩy');
      return false;
    }

    // Yêu cầu quyền
    const permission = await askUserPermission();
    if (permission !== 'granted') {
      console.log('Người dùng không cấp quyền thông báo');
      return false;
    }

    // Đăng ký service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.log('Không thể đăng ký service worker');
      return false;
    }

    // Kiểm tra subscription hiện có
    let subscription = await registration.pushManager.getSubscription();
    
    // Nếu chưa có, tạo mới
    if (!subscription) {
      subscription = await createPushSubscription(registration);
      if (!subscription) {
        console.log('Không thể tạo subscription');
        return false;
      }
    }

    // Đăng ký với server
    const deviceInfo = {
      platform: 'web',
      deviceName: navigator.userAgent
    };
    
    const registered = await sendSubscriptionToServer(subscription, deviceInfo);
    return registered;
  } catch (error) {
    console.error('Lỗi khi khởi tạo thông báo đẩy:', error);
    return false;
  }
};

// Hàm chuyển đổi base64 URL sang Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}