var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/css/first.css',
  '/css/style.css',
  '/js/hammer.min.js',
  '/js/app.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ready');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // We look if the request fits an element in the cache
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          // We return the element in the cache
          return response;
        }
        // Otherwise we let the request look into the network
        return fetch(event.request);
      })
    );
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // We remove all the cache except the ones in cacheWhitelist array
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function(event) {
  var title = "We reached a milestone.";
  var body = "Come quick! The counter is going crazy!";
  var icon = 'images/icons/icon-android-152x152.png';
  event.waitUntil(
    self.registration.showNotification(title, {
      'body': body,
      'icon': icon
    }));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
