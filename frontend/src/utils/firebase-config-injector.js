/**
 * Script để gửi cấu hình Firebase đến Service Worker
 * Cần được gọi trong index.js hoặc App.js
 */
const injectFirebaseConfigToServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Cấu hình Firebase từ biến môi trường
    const firebaseConfig = {
      apiKey: "AIzaSyCkmey25hWd8ZDfGF1DIyQxykBhWoBhLcY",
      authDomain: "bobace-bb837.firebaseapp.com",
      projectId: "bobace-bb837",
      storageBucket: "bobace-bb837.firebasestorage.app",
      messagingSenderId: "556629068030",
      appId: "1:556629068030:web:cb11dfe4a0921da9167daf",
      measurementId: "G-0ERC5D9MLS"
    };

    // Đợi service worker sẵn sàng
    navigator.serviceWorker.ready.then(registration => {
      // Gửi cấu hình Firebase đến Service Worker
      if (registration.active) {
        console.log('Gửi cấu hình Firebase đến Service Worker');
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig
        });
      }
    });

    // Lắng nghe message từ Service Worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'FIREBASE_CONFIG_RECEIVED') {
        if (event.data.success) {
          console.log('Service Worker đã nhận được cấu hình Firebase');
        } else {
          console.error('Lỗi khi gửi cấu hình Firebase:', event.data.error);
        }
      } else if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('Người dùng đã click vào thông báo:', event.data.notification);
        // Xử lý khi người dùng click vào thông báo
        handleNotificationClick(event.data.notification);
      }
    });
  }
};

// Xử lý khi người dùng click vào thông báo
const handleNotificationClick = (notification) => {
  // Điều hướng đến trang tương ứng
  if (notification.data && notification.data.linkTo) {
    window.location.href = notification.data.linkTo;
  }
};

export default injectFirebaseConfigToServiceWorker;