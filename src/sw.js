// Lightweight service worker to allow messages from the page to show notifications.
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Claim clients so the SW starts controlling pages immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const data = event.data || {}
  if (data && data.type === 'show-notification') {
    const { title, options } = data
    self.registration.showNotification(title, options)
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients && clients.length) {
        return clients[0].focus()
      }
      return self.clients.openWindow('/')
    })
  )
})
