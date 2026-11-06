// Service Worker for Giffú Cloud PWA
const CACHE_NAME = 'giffu-cloud-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through without interfering with media streams, api queries or mutations
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/stream')) {
    return;
  }
  // Standard fetch pass-through to ensure PWA criteria
  return;
});
