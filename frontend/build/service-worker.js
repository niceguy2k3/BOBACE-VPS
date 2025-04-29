// Service Worker cho BobaLove
const CACHE_NAME = 'bobalove-cache-v1';

// Sự kiện install - cài đặt service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker đang được cài đặt');
  self.skipWaiting();
});

// Sự kiện activate - kích hoạt service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker đã được kích hoạt');
  return self.clients.claim();
});

// Xử lý sự kiện push - nhận thông báo đẩy
self.addEventListener('push', (event) => {
  console.log('Đã nhận thông báo đẩy:', event);

  try {
    // Parse dữ liệu thông báo
    const data = event.data.json();
    console.log('Dữ liệu thông báo:', data);

    // Tạo options cho thông báo
    const options = {
      body: data.body || 'Bạn có thông báo mới',
      icon: data.icon || '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: data.url || '/',
        ...data.data
      },
      vibrate: [200, 100, 200],
      requireInteraction: true
    };

    // Hiển thị thông báo
    event.waitUntil(
      self.registration.showNotification(data.title || 'BobaLove', options)
    );
  } catch (error) {
    console.error('Lỗi khi xử lý thông báo đẩy:', error);
    
    // Hiển thị thông báo mặc định nếu có lỗi
    event.waitUntil(
      self.registration.showNotification('BobaLove', {
        body: 'Bạn có thông báo mới',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200]
      })
    );
  }
});

// Xử lý sự kiện click vào thông báo
self.addEventListener('notificationclick', (event) => {
  console.log('Người dùng đã nhấp vào thông báo');
  
  // Đóng thông báo
  event.notification.close();
  
  // Lấy URL từ dữ liệu thông báo
  const url = event.notification.data?.url || '/';
  
  // Mở URL khi người dùng nhấp vào thông báo
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Kiểm tra xem đã có cửa sổ nào mở chưa
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Nếu đã có cửa sổ mở, chuyển đến URL mới
          return client.navigate(url).then(client => client.focus());
        }
      }
      
      // Nếu không có cửa sổ nào mở, mở cửa sổ mới
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});