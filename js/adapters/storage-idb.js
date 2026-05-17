/**
 * IndexedDB 存储适配器 — Web/PWA 环境使用
 *
 * 统一接口：load / save / getBlob / setBlob / removeBlob / listBlobKeys
 * 向后兼容导出：openDB / storageAdapter（供 image.js 直接使用）
 */

const DB_NAME = 'knit_db';
const DB_VERSION = 1;
const STORAGE_KEY = 'crochet_v4';
const OLD_KEYS = ['crochet_v3_fixed', 'crochet_v3'];

let _db = null;

export async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('main')) {
        db.createObjectStore('main');
      }
      if (!db.objectStoreNames.contains('covers')) {
        db.createObjectStore('covers');
      }
    };
    req.onsuccess = e => {
      _db = e.target.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

export const storageAdapter = {
  async get(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main', 'readonly');
      const req = tx.objectStore('main').get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  async set(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main', 'readwrite');
      const req = tx.objectStore('main').put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  async remove(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('main', 'readwrite');
      const req = tx.objectStore('main').delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
};

// ═══════════════════════════════════════════
//  Unified adapter interface
// ═══════════════════════════════════════════

export async function load() {
  let d = null;

  // 优先读 IndexedDB
  try {
    d = await storageAdapter.get(STORAGE_KEY);
  } catch { /* ignore */ }

  // 回退到 localStorage 旧 key（结构化检查）
  if (!d) {
    const candidates = [
      { key: 'crochet_v3_fixed', check: (v) => v && v.projects && v.projects.length > 0 },
      { key: 'crochet_v3', check: (v) => v && v.projects && v.projects.length > 0 }
    ];

    for (const { key, check } of candidates) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (check(parsed)) { d = parsed; break; }
        }
      } catch { /* ignore */ }
    }

    if (!d) {
      for (const key of OLD_KEYS) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) { d = JSON.parse(raw); break; }
        } catch { /* ignore */ }
      }
    }

    // 迁移到 IndexedDB 后清理
    if (d) {
      for (const key of OLD_KEYS) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
      }
    }
  }

  return d || null;
}

export async function save(data) {
  await storageAdapter.set(STORAGE_KEY, data);
}

// ── Blob 操作（covers store）──

export async function getBlob(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readonly');
    const req = tx.objectStore('covers').get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function setBlob(key, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readwrite');
    const req = tx.objectStore('covers').put(blob, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function removeBlob(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readwrite');
    const req = tx.objectStore('covers').delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function listBlobKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readonly');
    const req = tx.objectStore('covers').getAllKeys();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

// ── 一次性迁移：localStorage → IndexedDB ──

export async function migrateFromLocalStorage() {
  // 迁移主数据
  const oldData = localStorage.getItem(STORAGE_KEY);
  if (oldData) {
    try {
      await storageAdapter.set(STORAGE_KEY, JSON.parse(oldData));
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { console.warn('migrateFromLocalStorage main failed:', e); }
  }

  // 迁移封面图片（base64 → Blob）
  const keys = Object.keys(localStorage).filter(k => k.startsWith('img_'));
  for (const key of keys) {
    const base64 = localStorage.getItem(key);
    if (base64) {
      try {
        const res = await fetch(base64);
        const blob = await res.blob();
        const projId = key.replace('img_', '');
        await setBlob(projId, blob);
        localStorage.removeItem(key);
      } catch (e) { console.warn('migrateFromLocalStorage cover failed:', key, e); }
    }
  }

  // 清理旧 key
  for (const key of OLD_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}
