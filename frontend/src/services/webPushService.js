import axios from 'axios';
import { API_URL } from '../config/constants';

// VAPID public key - sẽ được lấy từ server
let VAPID_PUBLIC_KEY = 'BGI9uiAxwDw9C8IGsV2uebaH8OdIsGFOPDog5iAm0XeGChG299dCHbJbbIHzLPRpk6pgV7UfzXk2U5vAvmroevM';

// Hàm lấy VAPID public key từ server
async function getVapidPublicKey() {
  try {
    console.log('Đang gọi API để lấy VAPID key từ:', `${API_URL}/api/web-push/vapid-public-key`);
    const response = await axios.get(`${API_URL}/api/web-push/vapid-public-key`);
    console.log('Response từ server:', response.data);
    
    // Hỗ trợ cả hai format: vapidPublicKey và publicKey
    const key = response.data?.vapidPublicKey || response.data?.publicKey;
    
    if (key && key !== 'your-vapid-public-key' && key.length > 50) {
      // Validate key format (phải là base64url string hợp lệ)
      const isValidKey = /^[A-Za-z0-9_-]+$/.test(key);
      
      if (isValidKey) {
        VAPID_PUBLIC_KEY = key;
        console.log('Đã cập nhật VAPID public key:', VAPID_PUBLIC_KEY);
      } else {
        console.warn('VAPID key không hợp lệ, sử dụng key mặc định');
      }
    } else {
      console.warn('Server không trả về VAPID key hợp lệ, sử dụng key mặc định');
    }
  } catch (error) {
    console.error('Lỗi khi lấy VAPID public key từ server:', error);
    console.warn('Sử dụng VAPID key mặc định:', VAPID_PUBLIC_KEY);
  }
}

// Chuyển đổi VAPID key thành Uint8Array
function urlBase64ToUint8Array(base64String) {
  try {
    // Validate input
    if (!base64String || typeof base64String !== 'string') {
      throw new Error('VAPID key must be a valid string');
    }
    
    // Kiểm tra nếu là placeholder
    if (base64String === 'your-vapid-public-key' || base64String.length < 50) {
      throw new Error('Invalid VAPID key: key appears to be a placeholder or too short');
    }
    
    console.log('Chuyển đổi VAPID key (độ dài:', base64String.length, ')');
    
    // Chuyển đổi từ base64url sang base64 chuẩn
    // Base64url: - thay cho +, _ thay cho /, và không có padding =
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Validate base64 string trước khi decode
    if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
      throw new Error('Invalid base64 format after conversion');
    }

    console.log('Base64 sau khi chuyển đổi (độ dài:', base64.length, ')');
    
    // Decode base64
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    // Validate độ dài của key (VAPID public key phải là 65 bytes khi decode)
    if (outputArray.length !== 65) {
      console.warn(`VAPID key có độ dài bất thường: ${outputArray.length} bytes (kỳ vọng: 65 bytes)`);
    }
    
    console.log('Đã chuyển đổi thành công, độ dài:', outputArray.length);
    return outputArray;
  } catch (error) {
    console.error('Lỗi khi chuyển đổi VAPID key:', error);
    console.error('Key gây lỗi:', base64String);
    console.error('Độ dài key:', base64String?.length);
    throw new Error(`Failed to convert VAPID key: ${error.message}`);
  }
}

// Kiểm tra xem trình duyệt có hỗ trợ thông báo không
export const isNotificationSupported = () => {
  const hasNotification = 'Notification' in window;
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  
  console.log('[isNotificationSupported] Checking support:');
  console.log('  - Notification:', hasNotification);
  console.log('  - ServiceWorker:', hasServiceWorker);
  console.log('  - PushManager:', hasPushManager);
  console.log('  - Overall:', hasNotification && hasServiceWorker && hasPushManager);
  
  return hasNotification && hasServiceWorker && hasPushManager;
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
    await getVapidPublicKey().catch(err => {
      console.warn('Không thể lấy VAPID key từ server, sử dụng key mặc định:', err);
    });
    
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
    
    try {
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
    } catch (permissionError) {
      console.error('Lỗi khi yêu cầu quyền thông báo:', permissionError);
      return null;
    }
    
    // Thử hiển thị thông báo test để xác nhận quyền (optional)
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
      // Không return null, tiếp tục với việc đăng ký subscription
    }

    // Đăng ký service worker
    let registration;
    try {
      registration = await registerServiceWorker();
    } catch (swError) {
      console.error('Lỗi khi đăng ký service worker:', swError);
      return null;
    }

    // Kiểm tra xem đã có subscription chưa
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('✅ Đã có subscription từ trước, kiểm tra tính hợp lệ...');
      console.log('Endpoint:', subscription.endpoint?.substring(0, 50) + '...');
      
      // Kiểm tra subscription có hợp lệ không (có endpoint và keys)
      if (subscription.endpoint && subscription.keys && subscription.keys.p256dh && subscription.keys.auth) {
        console.log('Subscription hợp lệ, sử dụng lại và sync với server');
        
        // Sync subscription hiện có với server (đảm bảo nó được lưu trong DB)
        try {
          await registerSubscription(subscription);
          console.log('✅ Đã sync subscription hiện có với server');
          
          // Lưu thông tin vào localStorage
          localStorage.setItem('notification_registered', 'true');
          
          return subscription;
        } catch (syncError) {
          console.warn('Lỗi khi sync subscription với server, sẽ tạo mới:', syncError);
          // Nếu sync fail, unsubscribe và tạo mới
          try {
            await subscription.unsubscribe();
            console.log('Đã hủy subscription cũ do lỗi sync');
          } catch (unsubError) {
            console.error('Lỗi khi hủy subscription cũ:', unsubError);
          }
          subscription = null;
        }
      } else {
        console.warn('Subscription không hợp lệ (thiếu endpoint hoặc keys), sẽ tạo mới');
        try {
          await subscription.unsubscribe();
        } catch (unsubError) {
          console.error('Lỗi khi hủy subscription không hợp lệ:', unsubError);
        }
        subscription = null;
      }
    }
    
    // Nếu không có subscription hoặc subscription không hợp lệ, tạo mới
    if (!subscription) {
      console.log('Tạo subscription mới...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        console.log('✅ Đã tạo subscription mới thành công');
        console.log('Endpoint:', subscription.endpoint?.substring(0, 50) + '...');
      } catch (subscribeError) {
        console.error('❌ Lỗi khi tạo subscription mới:', subscribeError);
        // Không throw, chỉ log và return null
        return null;
      }
    }

    // Đăng ký subscription với server (nếu chưa được sync)
    try {
      await registerSubscription(subscription);
      console.log('✅ Đã đăng ký subscription với server');
    } catch (registerError) {
      console.error('❌ Lỗi khi đăng ký subscription với server:', registerError);
      // Không throw, chỉ log và return null để không block login flow
      return null;
    }
    
    // Lưu thông tin vào localStorage
    try {
      localStorage.setItem('notification_registered', 'true');
    } catch (storageError) {
      console.warn('Không thể lưu vào localStorage:', storageError);
      // Không return null, vì subscription đã được tạo thành công
    }
    
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
    
    console.log('Đang gửi subscription lên server...');
    console.log('Endpoint:', subscription.endpoint?.substring(0, 50) + '...');
    console.log('Keys có sẵn:', !!subscription.keys);
    
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
    
    if (response.data && response.data.success) {
      console.log('✅ Đã đăng ký subscription với server thành công!');
      console.log('Subscription ID:', response.data.subscription?.id);
      console.log('Platform:', response.data.subscription?.platform);
      console.log('Device:', response.data.subscription?.deviceName);
    } else {
      console.warn('Server response không có success flag:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký subscription với server:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Kiểm tra subscription status và tự động đăng ký lại nếu cần
export const checkAndReRegisterSubscription = async () => {
  try {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      console.log('[ReRegister] Không có token, bỏ qua');
      return false;
    }

    // Kiểm tra quyền thông báo
    if (Notification.permission !== 'granted') {
      console.log('[ReRegister] Quyền thông báo chưa được cấp');
      return false;
    }

    // Kiểm tra subscription trong browser
    const registration = await navigator.serviceWorker.getRegistration('/web-push-sw.js');
    if (!registration) {
      console.log('[ReRegister] Không có service worker registration');
      return false;
    }

    let browserSubscription = null;
    try {
      browserSubscription = await registration.pushManager.getSubscription();
    } catch (error) {
      console.warn('[ReRegister] Lỗi khi lấy browser subscription:', error);
    }

    // Kiểm tra subscription trong DB
    try {
      const response = await axios.get(`${API_URL}/api/web-push/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const dbSubscriptions = response.data?.subscriptions || [];
      const hasDbSubscription = dbSubscriptions.length > 0;

      console.log('[ReRegister] Status check:');
      console.log('  - Browser subscription:', browserSubscription ? 'Có' : 'Không');
      console.log('  - DB subscriptions:', dbSubscriptions.length);

      // Nếu không có subscription trong DB hoặc browser, đăng ký lại
      if (!hasDbSubscription || !browserSubscription) {
        console.log('[ReRegister] ⚠️ Phát hiện subscription bị mất, tự động đăng ký lại...');
        
        // Nếu có browser subscription nhưng không có trong DB, sync lại
        if (browserSubscription && !hasDbSubscription) {
          console.log('[ReRegister] Browser có subscription nhưng DB không có, sync lại...');
          try {
            await registerSubscription(browserSubscription);
            console.log('[ReRegister] ✅ Đã sync subscription với DB');
            return true;
          } catch (syncError) {
            console.error('[ReRegister] Lỗi khi sync:', syncError);
          }
        }

        // Tạo subscription mới nếu cần
        if (!browserSubscription) {
          console.log('[ReRegister] Tạo subscription mới...');
          try {
            const newSubscription = await requestNotificationPermission();
            if (newSubscription) {
              console.log('[ReRegister] ✅ Đã tự động đăng ký lại subscription thành công');
              return true;
            }
          } catch (registerError) {
            console.error('[ReRegister] Lỗi khi đăng ký lại:', registerError);
            return false;
          }
        }
      } else {
        console.log('[ReRegister] ✅ Subscription vẫn còn, không cần đăng ký lại');
        return true;
      }
    } catch (error) {
      console.error('[ReRegister] Lỗi khi check subscription status:', error);
      // Nếu lỗi, vẫn thử đăng ký lại nếu có browser subscription
      if (browserSubscription) {
        console.log('[ReRegister] Thử sync subscription hiện có...');
        try {
          await registerSubscription(browserSubscription);
          return true;
        } catch (syncError) {
          console.error('[ReRegister] Lỗi khi sync:', syncError);
        }
      }
      return false;
    }

    return false;
  } catch (error) {
    console.error('[ReRegister] Lỗi khi check và đăng ký lại subscription:', error);
    return false;
  }
};

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
    
    if (subscription) {
      // Validate subscription có hợp lệ không
      if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
        console.warn('Subscription hiện có không hợp lệ, sẽ tạo mới');
        try {
          await subscription.unsubscribe();
        } catch (unsubError) {
          console.error('Lỗi khi hủy subscription không hợp lệ:', unsubError);
        }
        subscription = null;
      } else {
        console.log('✅ Tìm thấy subscription hợp lệ, sync với server...');
        console.log('Endpoint:', subscription.endpoint?.substring(0, 50) + '...');
      }
    }
    
    if (!subscription) {
      console.log('Không tìm thấy subscription hợp lệ, tạo mới...');
      
      // Tạo subscription mới
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        console.log('✅ Đã tạo subscription mới');
      } catch (subscribeError) {
        console.error('❌ Lỗi khi tạo subscription mới:', subscribeError);
        return false;
      }
    }

    // Đăng ký subscription với server (sẽ cập nhật user ID nếu cần)
    try {
      await registerSubscription(subscription);
      console.log('✅ Đã sync subscription với server');
    } catch (registerError) {
      console.error('❌ Lỗi khi sync subscription với server:', registerError);
      return false;
    }
    
    // Lưu thông tin vào localStorage
    localStorage.setItem('notification_registered', 'true');
    
    console.log('✅ Đã cập nhật subscription thành công');
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
  updateSubscriptionUser,
  checkAndReRegisterSubscription
};