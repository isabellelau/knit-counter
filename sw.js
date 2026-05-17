const HTML_PATH = './index.html';

const PRECACHE = [
  HTML_PATH,
  './stitches.js',
  './styles.css',
  './js/state.js',
  './js/storage.js',
  './js/ui.js',
  './js/voice.js',
  './js/settings.js',
  './js/pattern.js',
  './lib/tesseract.min.js',
  './lib/html2canvas.min.js',
  './assets/fonts/lxgwwenkai-regular.css',
  './assets/fonts/lxgwwenkai-regular-subset-4.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-5.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-6.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-21.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-22.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-23.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-24.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-25.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-26.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-27.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-28.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-29.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-30.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-31.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-32.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-33.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-34.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-35.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-36.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-37.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-38.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-39.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-40.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-41.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-42.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-43.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-44.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-45.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-46.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-47.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-48.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-49.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-50.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-51.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-52.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-53.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-54.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-55.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-56.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-57.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-58.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-59.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-60.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-61.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-62.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-63.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-64.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-65.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-66.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-67.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-68.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-69.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-70.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-71.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-72.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-73.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-74.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-75.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-76.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-77.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-78.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-79.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-80.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-81.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-82.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-83.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-84.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-85.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-86.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-87.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-88.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-89.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-90.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-91.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-97.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-98.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-99.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-100.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-101.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-102.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-103.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-104.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-105.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-106.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-107.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-108.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-109.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-110.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-111.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-112.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-113.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-114.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-115.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-116.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-117.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-118.woff2',
  './assets/fonts/lxgwwenkai-regular-subset-119.woff2',
];

async function getVersionFromHtml() {
  try {
    const resp = await fetch(HTML_PATH, { cache: 'no-cache' });
    const text = await resp.text();
    const match = text.match(/<meta\s+name=["']version["']\s+content=["']([^"']+)["']\s*>/i);
    return match ? match[1] : 'v1';
  } catch {
    return 'v1';
  }
}

let CACHE_NAME = 'crochet-1.137';

self.addEventListener('install', (e) => {
  e.waitUntil(
    getVersionFromHtml().then((ver) => {
      CACHE_NAME = `crochet-${ver}`;
      return caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(PRECACHE));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    // 清除所有旧缓存（无论名称），确保无残留文件
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => {
      // 重建当前版本缓存
      return caches.open(CACHE_NAME)
        .then(cache => cache.addAll(PRECACHE))
        .catch(() => {});
    }).then(() => {
      self.clients.claim();
      return self.clients.matchAll();
    }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
    })
  );
});

// ── 缓存策略 ──
// HTML：网络优先（确保总是拿到最新版本）
// 其他资源：缓存优先，后台更新
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // 只处理 http/https 请求，跳过 chrome-extension:// 等不可缓存协议
  if (!url.protocol.startsWith('http')) return;

  // 只缓存 GET 请求
  if (request.method !== 'GET') return;

  // 对主 HTML 使用网络优先
  if (request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((resp) => {
          if (resp.ok && !resp.bodyUsed) {
            try {
              const clone = resp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            } catch (err) {
              console.warn('[SW] skip caching HTML:', err.message);
            }
          }
          return resp;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match(HTML_PATH)))
    );
    return;
  }

  // 其他资源：缓存优先，后台回源更新
  e.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((resp) => {
          if (resp.ok && resp.type === 'basic' && !resp.bodyUsed) {
            try {
              const clone = resp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            } catch (err) {
              console.warn('[SW] skip caching asset:', err.message);
            }
          }
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
