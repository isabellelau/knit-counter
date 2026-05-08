const HTML_PATH = './index.html';

const PRECACHE = [
  HTML_PATH,
  './stitches.js',
  './styles.css',
  './js/state.js',
  './js/storage.js',
  './js/ui.js',
  './js/voice.js'
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

let CACHE_NAME = 'crochet-v1';

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

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── 缓存策略 ──
// HTML：网络优先（确保总是拿到最新版本）
// 其他资源：缓存优先，后台更新
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // 对主 HTML 使用网络优先
  if (request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((resp) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, resp.clone());
            return resp;
          })
        )
        .catch(() => caches.match(request).then((c) => c || caches.match(HTML_PATH)))
    );
    return;
  }

  // 其他资源：缓存优先，后台回源更新
  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((resp) => {
          if (resp.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, resp.clone()));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
