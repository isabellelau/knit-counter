import { state, getProj } from './state.js';
import { showToast } from './ui.js';
import { renderHome } from './render.js';
import { openDB, saveData, storageAdapter } from './storage.js';

// ── Blob 内存缓存：避免重复 URL.createObjectURL ──
const _coverCache = new Map(); // projId → { url, revoke }

function cacheCover(projId, blob) {
  // 先清理旧缓存
  const old = _coverCache.get(projId);
  if (old) URL.revokeObjectURL(old.url);
  const url = URL.createObjectURL(blob);
  _coverCache.set(projId, { url });
  return url;
}

export function compressImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(maxSize / width, maxSize / height, 1);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg', 0.72);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

// ── 封面存储（IndexedDB covers store）──

async function getCoverBlob(projId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readonly');
    const req = tx.objectStore('covers').get(projId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function setCoverBlob(projId, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readwrite');
    const req = tx.objectStore('covers').put(blob, projId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function removeCoverBlob(projId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('covers', 'readwrite');
    const req = tx.objectStore('covers').delete(projId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── 公开 API ──

/**
 * 获取封面图片 URL（异步，优先走内存缓存）
 */
export async function getProjImage(projId) {
  try {
    const cached = _coverCache.get(projId);
    if (cached) return cached.url;
    const blob = await getCoverBlob(projId);
    if (blob) return cacheCover(projId, blob);
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 设置项目封面（压缩 → Blob → IndexedDB）
 */
export async function setProjectCover(projectId, input) {
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';
  try {
    const blob = await compressImage(file);
    try {
      await setCoverBlob(projectId, blob);
      cacheCover(projectId, blob);
      const proj = getProj(projectId);
      if (proj) { proj.lastModified = Date.now(); saveData(); }
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        showToast('存储空间不足，封面保存失败 · 建议导出备份后清理旧项目');
      } else {
        showToast('封面保存失败，请重试');
      }
      return;
    }
    window.renderHome();
    showToast('封面已更新');
  } catch {
    showToast('图片处理失败，请重试');
  }
}

/**
 * 移除项目封面
 */
export async function removeProjectCover(projectId) {
  try {
    const cached = _coverCache.get(projectId);
    if (cached) {
      URL.revokeObjectURL(cached.url);
      _coverCache.delete(projectId);
    }
    await removeCoverBlob(projectId);
    const proj = getProj(projectId);
    if (proj) { proj.lastModified = Date.now(); saveData(); }
  } catch (e) {
    console.warn('removeProjectCover failed:', e);
  }
  window.renderHome();
  showToast('封面已移除');
}

export function pickCover(projectId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => setProjectCover(projectId, input);
  input.click();
}

// ── 本地头像（storageAdapter key: profile_avatar）──

export async function getProfileAvatar() {
  try {
    return await storageAdapter.get('profile_avatar');
  } catch {
    return null;
  }
}

export async function setProfileAvatar(base64) {
  await storageAdapter.set('profile_avatar', base64);
}

export async function removeProfileAvatar() {
  await storageAdapter.remove('profile_avatar');
}
