// Service Worker for persistent background notifications & focus management
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// Handle notification click to bring app window/tab to the front
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Notify all matching clients to forcefully mount/trigger walking mascot reminder
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        try {
          client.postMessage({
            type: 'AQUA_REMINDER_TRIGGER',
            action: event.action || 'click',
            timestamp: Date.now(),
          });
        } catch (err) {
          console.warn('Failed to postMessage to client:', err);
        }
      }

      // If Aqua tab is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }

      // If no open tab is found, open a new window to Aqua root
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
