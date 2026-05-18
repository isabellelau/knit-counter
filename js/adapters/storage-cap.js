/**
 * Capacitor 存储适配器 — iOS/Android 原生环境使用
 *
 * 统一接口：load / save / getBlob / setBlob / removeBlob / listBlobKeys
 * 向后兼容导出：openDB（mock）/ storageAdapter（Preferences 封装）
 *
 * 插件通过 window.Capacitor.Plugins 全局对象访问（无打包器环境）。
 */

import { showToast } from '../ui.js';

const MAIN_KEY = 'crochet_v4';
const KV_PREFIX = 'kv_';
const BLOB_DIR = 'blobs';
const DIR_DATA = 'DATA'; // Capacitor Filesystem Directory.Data 字符串值

let _Preferences = null;
let _Filesystem = null;
let _ready = false;

async function _ensurePlugins() {
  if (_ready) return;

  // 从 Capacitor 全局对象取插件（WebView 无打包器，裸模块 import 不可用）
  const prefs = window.Capacitor?.Plugins?.Preferences;
  const fs = window.Capacitor?.Plugins?.Filesystem;

  if (prefs && fs) {
    _Preferences = prefs;
    _Filesystem = fs;
    _ready = true;
    window.__dbg && window.__dbg('plugins ready');
    return;
  }

  // 等 Capacitor 初始化完成
  await new Promise(r => setTimeout(r, 100));

  const prefs2 = window.Capacitor?.Plugins?.Preferences;
  const fs2 = window.Capacitor?.Plugins?.Filesystem;

  if (prefs2 && fs2) {
    _Preferences = prefs2;
    _Filesystem = fs2;
    _ready = true;
    window.__dbg && window.__dbg('plugins ready (100ms wait)');
    return;
  }

  const keys = JSON.stringify(Object.keys(window.Capacitor?.Plugins || {}));
  window.__dbg && window.__dbg('plugins NOT found. Available: ' + keys);
  console.error('[cap storage] Capacitor plugins not available. Plugins:', keys);
  throw new Error('Capacitor plugins not available: ' + keys);
}

let _blobDirReady = false;

async function _ensureBlobDir() {
  if (_blobDirReady) return;
  await _ensurePlugins();
  try {
    await _Filesystem.mkdir({
      path: BLOB_DIR,
      directory: DIR_DATA,
      recursive: true,
    });
  } catch (e) {
    // EEXIST / directory already exists is expected after first launch
    if (!e.message?.includes('exist') && !e.message?.includes('EXIST')) {
      console.error('[cap storage] mkdir error:', e.message, e.code);
      showToast('[DEBUG] mkdir: ' + e.message, null, 8000);
      window.__dbg && window.__dbg('mkdir: ' + e.message);
    }
  }
  _blobDirReady = true;
}

// ═══════════════════════════════════════════
//  Unified adapter interface
// ═══════════════════════════════════════════

export async function load() {
  await _ensurePlugins();
  try {
    const { value } = await _Preferences.get({ key: MAIN_KEY });
    if (!value) return null;
    return JSON.parse(value);
  } catch (err) {
    console.error('[cap storage] load error:', err.message, err.code);
    showToast('[DEBUG] load: ' + err.message, null, 8000);
    window.__dbg && window.__dbg('load: ' + err.message);
    return null;
  }
}

export async function save(data) {
  await _ensurePlugins();
  try {
    await _Preferences.set({ key: MAIN_KEY, value: JSON.stringify(data) });
  } catch (err) {
    console.error('[cap storage] save error:', err.message, err.code);
    showToast('[DEBUG] save: ' + err.message, null, 8000);
    window.__dbg && window.__dbg('save: ' + err.message);
    throw err;
  }
}

// ── Blob 操作（Capacitor Filesystem）──

export async function getBlob(key) {
  await _ensurePlugins();
  try {
    const { data } = await _Filesystem.readFile({
      path: `${BLOB_DIR}/${key}`,
      directory: DIR_DATA,
    });
    const res = await fetch(`data:application/octet-stream;base64,${data}`);
    return await res.blob();
  } catch (err) {
    // 文件不存在是正常情况，getBlob 应静默返回 null
    if (!err.message?.includes('does not exist')) {
      console.error('[cap storage] getBlob error:', err.message, err.code);
      showToast('[DEBUG] getBlob: ' + err.message, null, 8000);
      window.__dbg && window.__dbg('getBlob: ' + err.message);
    }
    return null;
  }
}

export async function setBlob(key, blob) {
  await _ensureBlobDir();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  await _Filesystem.writeFile({
    path: `${BLOB_DIR}/${key}`,
    data: base64,
    directory: DIR_DATA,
    recursive: true,
  });
}

export async function removeBlob(key) {
  await _ensurePlugins();
  try {
    await _Filesystem.deleteFile({
      path: `${BLOB_DIR}/${key}`,
      directory: DIR_DATA,
    });
  } catch (err) {
    console.error('[cap storage] removeBlob error:', err.message, err.code);
    showToast('[DEBUG] removeBlob: ' + err.message, null, 8000);
    window.__dbg && window.__dbg('removeBlob: ' + err.message);
  }
}

export async function listBlobKeys() {
  await _ensureBlobDir();
  try {
    const { files } = await _Filesystem.readdir({
      path: BLOB_DIR,
      directory: DIR_DATA,
    });
    return (files || []).map(f => f.name);
  } catch (err) {
    console.error('[cap storage] listBlobKeys error:', err.message, err.code);
    showToast('[DEBUG] listBlobKeys: ' + err.message, null, 8000);
    window.__dbg && window.__dbg('listBlobKeys: ' + err.message);
    return [];
  }
}

// ═══════════════════════════════════════════
//  向后兼容：openDB（mock）→ 供 image.js 使用
// ═══════════════════════════════════════════

function _createMockDB() {
  const coversStore = {
    async get(key) { return await getBlob(key); },
    async put(value, key) { await setBlob(key, value); return key; },
    async delete(key) { await removeBlob(key); },
    async getAllKeys() { return await listBlobKeys(); },
  };

  const mainStore = {
    async get(key) { return await storageAdapter.get(key); },
    async put(value, key) { await storageAdapter.set(key, value); return key; },
    async delete(key) { await storageAdapter.remove(key); },
  };

  return {
    objectStoreNames: {
      contains(name) { return name === 'main' || name === 'covers'; }
    },
    transaction(storeName, _mode) {
      return {
        objectStore(name) {
          if (name === 'covers') return coversStore;
          if (name === 'main') return mainStore;
          throw new Error(`Unknown store: ${name}`);
        }
      };
    }
  };
}

let _mockDB = null;

export async function openDB() {
  if (!_mockDB) _mockDB = _createMockDB();
  return _mockDB;
}

// ═══════════════════════════════════════════
//  向后兼容：storageAdapter（Preferences 封装）
// ═══════════════════════════════════════════

export const storageAdapter = {
  async get(key) {
    await _ensurePlugins();
    try {
      const { value } = await _Preferences.get({ key: KV_PREFIX + key });
      return value ?? null;
    } catch (err) {
      console.error('[cap storage] storageAdapter.get error:', err.message, err.code);
      showToast('[DEBUG] adapter.get: ' + err.message, null, 8000);
      window.__dbg && window.__dbg('adapter.get: ' + err.message);
      return null;
    }
  },
  async set(key, value) {
    await _ensurePlugins();
    await _Preferences.set({ key: KV_PREFIX + key, value });
  },
  async remove(key) {
    await _ensurePlugins();
    try {
      await _Preferences.remove({ key: KV_PREFIX + key });
    } catch (err) {
      console.error('[cap storage] storageAdapter.remove error:', err.message, err.code);
      showToast('[DEBUG] adapter.remove: ' + err.message, null, 8000);
      window.__dbg && window.__dbg('adapter.remove: ' + err.message);
    }
  }
};

// Capacitor 环境下无需 localStorage→IDB 迁移
export async function migrateFromLocalStorage() {
  // no-op
}
