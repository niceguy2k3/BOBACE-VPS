// Service Worker cho Web Push Notifications
const CACHE_NAME = 'bobalove-push-cache-v1';

// Sự kiện install - cài đặt service worker
self.addEventListener('install', (event) => {
  console.log('Web Push Service Worker đang được cài đặt');
  // Kích hoạt service worker ngay lập tức mà không đợi trang tải lại
  event.waitUntil(self.skipWaiting());
});

// Sự kiện activate - kích hoạt service worker
self.addEventListener('activate', (event) => {
  console.log('Web Push Service Worker đã được kích hoạt');
  // Yêu cầu quyền kiểm soát tất cả các clients ngay lập tức
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Xóa cache cũ
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});

// Xử lý sự kiện push - nhận thông báo đẩy
self.addEventListener('push', (event) => {
  console.log('Đã nhận thông báo đẩy:', event);

  try {
    // Parse dữ liệu thông báo
    const data = event.data ? event.data.json() : {};
    console.log('Dữ liệu thông báo:', data);

    // Tạo options cho thông báo
    const options = {
      body: data.body || 'Bạn có thông báo mới',
      icon: data.icon || '/logo192.png',
      badge: '/logo192.png',
      image: data.image,
      tag: data.tag || 'default-tag', // Tag giúp gom nhóm thông báo
      data: {
        url: data.url || '/',
        ...data.data
      },
      vibrate: [200, 100, 200],
      requireInteraction: true, // Thông báo không tự động biến mất
      actions: data.actions || [
        {
          action: 'view',
          title: 'Xem ngay'
        }
      ],
      // Thêm timestamp để hiển thị thời gian
      timestamp: data.timestamp || Date.now()
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
        vibrate: [200, 100, 200],
        requireInteraction: true
      })
    );
  }
});

// Xử lý sự kiện click vào thông báo
self.addEventListener('notificationclick', (event) => {
  console.log('Người dùng đã nhấp vào thông báo:', event);
  
  // Đóng thông báo
  event.notification.close();
  
  // Lấy URL từ dữ liệu thông báo
  const url = event.notification.data?.url || '/';
  
  // Xử lý các action khác nhau
  if (event.action === 'view') {
    console.log('Người dùng chọn action "Xem ngay"');
  }
  
  // Mở URL khi người dùng nhấp vào thông báo
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
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

// Xử lý sự kiện đóng thông báo
self.addEventListener('notificationclose', (event) => {
  console.log('Người dùng đã đóng thông báo:', event.notification);
});

// Xử lý sự kiện push subscription thay đổi
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription đã thay đổi');
  
  // Lấy subscription mới
  const newSubscription = event.newSubscription;
  
  // Gửi subscription mới lên server
  event.waitUntil(
    fetch('/api/web-push/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${self.localStorage?.getItem('token') || ''}`
      },
      body: JSON.stringify({
        subscription: newSubscription,
        platform: 'web',
        deviceName: 'Auto-updated subscription'
      })
    })
  );
});