const HTML_PATH = './index.html';

const PRECACHE = [
  HTML_PATH,
  './stitches.js',
  './styles.css'
];

async function getVersionFromHtml() {
  try {
    const resp = await fetch(HTML_PATH, { cache: 'no-cache' });
    const text = await resp.text();
    const match = text.match(<meta\s+name=["']version["']\s+content=["']([^"']+)["']\s*>/i);
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

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(e.request)
        .then((resp) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resp.clone());
            return resp;
          })
        )
        .catch(() => caches.match(HTML_PATH));
    })
  );
});
