import { getProj } from './state.js';
import { saveData } from './storage.js';
import { showToast } from './ui.js';
import { renderHome } from './render.js';

export function compressImage(file, maxSize = 300) {
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
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

export function saveProjImage(projId, base64) {
  const proj = getProj(projId);
  if (!proj) return;
  proj.coverImage = base64;
  saveData();
}

export function getProjImage(projId) {
  return getProj(projId)?.coverImage || null;
}

export function setProjectCover(projectId, input) {
  const file = input.files?.[0];
  if (!file) return;
  compressImage(file).then(dataUrl => {
    const proj = getProj(projectId);
    if (!proj) return;
    proj.coverImage = dataUrl;
    saveData();
    window.renderHome();
    showToast('封面已更新');
  }).catch(() => showToast('图片处理失败'));
  input.value = '';
}

export function removeProjectCover(projectId) {
  const proj = getProj(projectId);
  if (!proj) return;
  proj.coverImage = null;
  saveData();
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
