import axios from 'axios';
import { API_URL } from '../config/constants';

// VAPID public key - sẽ được lấy từ server
let VAPID_PUBLIC_KEY = 'BB--F3UbmfESF1YffFPvg3MPcNb9pm8t0msGl0aug99AWbPgYNT640mxW0ws1za7pJuMGrnMMsGV8X-Uupn3KUM';

// Hàm lấy VAPID public key từ server
async function getVapidPublicKey() {
  try {
    const response = await axios.get(`${API_URL}/api/web-push/vapid-public-key`);
    if (response.data && response.data.vapidPublicKey) {
      VAPID_PUBLIC_KEY = response.data.vapidPublicKey;
      console.log('Đã lấy VAPID public key từ server:', VAPID_PUBLIC_KEY);
    }
  } catch (error) {
    console.error('Lỗi khi lấy VAPID public key:', error);
  }
}

// Chuyển đổi VAPID key thành Uint8Array
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

// Kiểm tra xem trình duyệt có hỗ trợ thông báo không
export const isNotificationSupported = () => {
  return 'Notification' in window && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
};

// Đăng ký service worker
async function registerServiceWorker() {
  try {
    // Chỉ đăng ký một service worker duy nhất
    let registration;
    
    // Đăng ký web-push-sw.js
    try {
      registration = await navigator.serviceWorker.register('/web-push-sw.js', {
        scope: '/'
      });
      console.log('Đã đăng ký web-push-sw.js thành công:', registration);
      
      // Kiểm tra xem service worker có cần cập nhật không
      if (registration.updateViaCache) {
        await registration.update();
        console.log('Đã kiểm tra cập nhật cho service worker');
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký web-push-sw.js:', error);
      throw error;
    }
    
    // Đảm bảo service worker đã active
    if (registration.installing) {
      console.log('Service worker đang cài đặt, đợi cho đến khi active...');
      
      await new Promise((resolve) => {
        const serviceWorker = registration.installing;
        
        serviceWorker.addEventListener('statechange', (e) => {
          console.log('Service worker state changed:', e.target.state);
          if (e.target.state === 'activated') {
            console.log('Service worker đã active');
            resolve();
          }
        });
      });
    } else if (registration.waiting) {
      // Nếu service worker đang waiting, kích hoạt nó
      console.log('Service worker đang waiting, kích hoạt...');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Thiết lập kiểm tra định kỳ để đảm bảo service worker luôn hoạt động
    setInterval(async () => {
      try {
        const freshRegistration = await navigator.serviceWorker.getRegistration('/web-push-sw.js');
        if (!freshRegistration) {
          console.log('Service worker không còn đăng ký, đăng ký lại...');
          await registerServiceWorker();
        } else {
          console.log('Service worker vẫn đang hoạt động');
        }
      } catch (checkError) {
        console.error('Lỗi khi kiểm tra service worker:', checkError);
      }
    }, 30 * 60 * 1000); // Kiểm tra mỗi 30 phút
    
    return registration;
  } catch (error) {
    console.error('Lỗi khi đăng ký Service Worker:', error);
    throw error;
  }
}

// Yêu cầu quyền thông báo và đăng ký subscription
export const requestNotificationPermission = async () => {
  try {
    // Lấy VAPID public key từ server
    await getVapidPublicKey();
    
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

    // Yêu cầu quyền thông báo
    let permission;
    
    // Nếu quyền đã được cấp, không cần yêu cầu lại
    if (Notification.permission === 'granted') {
      permission = 'granted';
      console.log('Quyền thông báo đã được cấp trước đó');
    } else {
      // Yêu cầu quyền thông báo
      permission = await Notification.requestPermission();
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
    }

    // Đăng ký service worker
    const registration = await registerServiceWorker();

    // Kiểm tra xem đã có subscription chưa
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Đã có subscription, sử dụng lại:', subscription);
    } else {
      // Tạo subscription mới
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      console.log('Đã tạo subscription mới:', subscription);
    }

    // Đăng ký subscription với server
    await registerSubscription(subscription);
    
    // Lưu thông tin vào localStorage
    localStorage.setItem('notification_registered', 'true');
    
    return subscription;
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error);
    return null;
  }
};

// Đăng ký subscription với server
async function registerSubscription(subscription) {
  try {
    const authToken = localStorage.getItem('token');
    
    if (!authToken) {
      throw new Error('Không có token xác thực');
    }
    
    const subscriptionData = {
      subscription: JSON.stringify(subscription),
      platform: 'web',
      deviceName: navigator.userAgent
    };
    
    const response = await axios.post(`${API_URL}/api/web-push/register`, subscriptionData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Đã đăng ký subscription với server:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký subscription với server:', error);
    throw error;
  }
}

// Hủy đăng ký subscription
export const unregisterNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.getRegistration('/web-push-sw.js');
    
    if (!registration) {
      console.log('Không tìm thấy service worker registration');
      return false;
    }
    
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('Không tìm thấy subscription');
      return false;
    }
    
    // Hủy đăng ký subscription với server
    const authToken = localStorage.getItem('token');
    
    if (authToken) {
      try {
        await axios.delete(`${API_URL}/api/web-push/unregister`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          data: {
            subscription: JSON.stringify(subscription)
          }
        });
        
        console.log('Đã hủy đăng ký subscription với server');
      } catch (serverError) {
        console.error('Lỗi khi hủy đăng ký subscription với server:', serverError);
      }
    }
    
    // Hủy đăng ký subscription
    const result = await subscription.unsubscribe();
    console.log('Kết quả hủy đăng ký subscription:', result);
    
    // Xóa thông tin từ localStorage
    localStorage.removeItem('notification_registered');
    
    return result;
  } catch (error) {
    console.error('Lỗi khi hủy đăng ký thông báo:', error);
    return false;
  }
};

// Cập nhật subscription khi người dùng đăng nhập
export const updateSubscriptionUser = async () => {
  try {
    // Kiểm tra xem trình duyệt có hỗ trợ thông báo không
    if (!isNotificationSupported()) {
      console.log('Trình duyệt không hỗ trợ thông báo đẩy');
      return false;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      console.log('Người dùng chưa đăng nhập, không thể cập nhật subscription');
      return false;
    }

    // Kiểm tra xem quyền thông báo đã được cấp chưa
    if (Notification.permission !== 'granted') {
      console.log('Quyền thông báo chưa được cấp');
      return false;
    }

    // Lấy service worker registration
    const registration = await navigator.serviceWorker.getRegistration('/web-push-sw.js');
    if (!registration) {
      console.log('Không tìm thấy service worker registration');
      return false;
    }

    // Lấy subscription hiện tại
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.log('Không tìm thấy subscription, tạo mới...');
      
      // Tạo subscription mới
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      } catch (subscribeError) {
        console.error('Lỗi khi tạo subscription mới:', subscribeError);
        return false;
      }
    }

    // Đăng ký subscription với server (sẽ cập nhật user ID)
    await registerSubscription(subscription);
    
    // Lưu thông tin vào localStorage
    localStorage.setItem('notification_registered', 'true');
    
    console.log('Đã cập nhật subscription thành công');
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật subscription:', error);
    return false;
  }
};

export default {
  isNotificationSupported,
  requestNotificationPermission,
  unregisterNotification,
  updateSubscriptionUser
};