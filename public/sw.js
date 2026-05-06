// Service Worker para deshabilitar caché en producción
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());