// Service Worker cho BoBace PWA
const CACHE_NAME = 'bobace-pwa-v1';
const RUNTIME_CACHE = 'bobace-runtime-v1';
const ASSETS_CACHE = 'bobace-assets-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/assets/images/logo192.png',
  '/assets/images/logo512.png',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    Promise.all([
      caches.open(ASSETS_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting() // Activate immediately
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE && 
                cacheName !== ASSETS_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Take control immediately
    ])
  );
});

// Fetch event - Cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache strategy based on request type
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (url.pathname.startsWith('/static/') || 
        url.pathname.startsWith('/assets/') ||
        url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/)) {
      event.respondWith(cacheFirst(request));
    }
    // HTML pages - Network First, fallback to cache
    else if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(networkFirst(request));
    }
    // API requests - Network only
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkOnly(request));
    }
    // Other requests - Network First
    else {
      event.respondWith(networkFirst(request));
    }
  }
});

// Cache First Strategy - Fast but might show stale content
async function cacheFirst(request) {
  try {
    const cache = await caches.open(ASSETS_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first error:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy - Fresh content priority
async function networkFirst(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    
    try {
      const response = await fetch(request);
      
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (networkError) {
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('[SW] Network first error:', error);
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      const cache = await caches.open(ASSETS_CACHE);
      return cache.match('/index.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Network Only Strategy - Always fetch from network
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network only error:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Push event - Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }
  
  const options = {
    body: data.body || 'Bạn có thông báo mới từ BoBace',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    image: data.image,
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
      ...data.data
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'BoBace', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Try to find existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.navigate(url).then((client) => client.focus());
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification);
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.applicationServerKey
    }).then((subscription) => {
      // Send new subscription to server
      return fetch('/api/web-push/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription,
          platform: 'web',
          deviceName: 'Auto-updated subscription'
        })
      });
    })
  );
});

// Sync event (background sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Background sync function for messages
async function syncMessages() {
  try {
    // Implement your sync logic here
    console.log('[SW] Syncing messages...');
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

// Message event - Communication with clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});


