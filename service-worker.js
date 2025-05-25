// service-worker.js

// Cache assets for offline use (optional, but good for PWA)
const CACHE_NAME = 'school-tasks-cache-v1';
const urlsToCache = [
  '/', // Adjusted to root path for GitHub Pages
  '/index.html', // Or your main HTML file
  '/manifest.json', // Adjusted to root path for GitHub Pages
  // Add other assets you want to cache, e.g., CSS, JS, images
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
  // Example for icons if they are at /images/icons/ in your GitHub Pages deployment
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event triggered.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Caching failed during install', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request);
      })
  );
});

// Add a listener for messages from the main thread (for notifications)
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'showNotification') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options)
            .then(() => {
                console.log('Notification shown successfully via Service Worker.');
            })
            .catch(error => {
                console.error('Error showing notification via Service Worker:', error);
            });
    }
});

// Optional: Handle notification clicks (e.g., open the app)
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.', event);
  event.notification.close(); // Close the notification

  // This looks for any open window of your app and focuses it, or opens a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) { // Check if the client URL matches the origin
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/'); // Adjusted to root path for GitHub Pages
      }
    })
  );
});

// Optional: Handle push events (if you were to send push notifications from a server)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received.', event);
  const data = event.data.json();
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || 'https://placehold.co/48x48/000000/FFFFFF?text=🔔',
    badge: data.badge || 'https://placehold.co/48x48/000000/FFFFFF?text=🔔',
    vibrate: [200, 100, 200],
    tag: 'push-notification'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
