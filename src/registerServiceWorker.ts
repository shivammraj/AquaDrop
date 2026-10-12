// Register a simple service worker that can show notifications when the app is installed as a PWA.
export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      // eslint-disable-next-line no-console
      console.log('Service Worker registered:', registration.scope)
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('Service Worker registration failed:', err)
    })
}

// Auto-register on import in browser contexts
if (typeof window !== 'undefined') {
  registerServiceWorker()
}
