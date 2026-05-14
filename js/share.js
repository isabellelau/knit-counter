import { state, getProj } from './state.js';
import { getProjImage } from './image.js';
import { getTotalFocusTime, formatFocusTime } from './project.js';
import { resolveColor } from '../stitches.js';
import { showSheet, showToast } from './ui.js';
import { showLoading, hideLoading } from './pattern.js';
import { t } from './i18n.js';

let _html2canvasReady = false;

function loadHtml2canvas() {
  return new Promise((resolve, reject) => {
    if (_html2canvasReady) return resolve(window.html2canvas);
    if (window.html2canvas) { _html2canvasReady = true; return resolve(window.html2canvas); }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => { _html2canvasReady = true; resolve(window.html2canvas); };
    script.onerror = () => reject(new Error('Failed to load html2canvas'));
    document.head.appendChild(script);
  });
}

const COVER_COLORS = ['#EAD8DA', '#E6D7CF', '#D8CFC7', '#D8D0DA', '#D3D9D1'];

function getCoverColor(projectId) {
  return COVER_COLORS[projectId % COVER_COLORS.length];
}

function getProjectInitial(name) {
  return name?.trim()?.[0]?.toUpperCase() || '🧶';
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export async function generateShareImage(projId) {
  const proj = getProj(projId);
  if (!proj) throw new Error('Project not found');

  await loadHtml2canvas();

  const coverSrc = await getProjImage(projId);

  const allRounds = (proj.parts || []).reduce((s, pt) => s + (pt.rounds?.length || 0), 0);
  const allNeedles = (proj.parts || []).reduce((s, pt) =>
    s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0);
  const focusMs = getTotalFocusTime(proj);
  const focusStr = formatFocusTime(focusMs) === '—' ? '—' : formatFocusTime(focusMs);

  const stitchCounts = new Map();
  (proj.parts || []).forEach(pt => {
    (pt.rounds || []).forEach(r => {
      (r.seq || []).forEach(sid => {
        stitchCounts.set(sid, (stitchCounts.get(sid) || 0) + 1);
      });
    });
  });
  const topStitches = [...stitchCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([sid]) => sid);
  const extraCount = Math.max(0, stitchCounts.size - 5);

  const bgColor = cssVar('--bg') || '#FAF5F5';
  const accentColor = cssVar('--accent') || '#C9969F';

  let coverHTML;
  if (coverSrc) {
    coverHTML = `<img src="${coverSrc}" style="width:390px;height:286px;object-fit:cover;display:block;" crossorigin="anonymous">`;
  } else {
    const initial = getProjectInitial(proj.name);
    const color = getCoverColor(proj.id);
    coverHTML = `<div style="width:390px;height:286px;background:${color};display:flex;align-items:center;justify-content:center;font-size:96px;color:rgba(255,255,255,0.7);font-family:sans-serif;">${initial}</div>`;
  }

  let capsulesHTML = topStitches.map(sid => {
    const color = resolveColor(sid, state.data.settings);
    return `<span style="display:inline-block;padding:4px 10px;border-radius:10px;font-size:12px;font-weight:600;background:${color}28;border:1px solid ${color};color:${color};margin:0 5px 6px 0;font-family:sans-serif;">${sid}</span>`;
  }).join('');
  if (extraCount > 0) {
    capsulesHTML += `<span style="display:inline-block;padding:4px 10px;border-radius:10px;font-size:12px;background:#eee;color:#999;margin:0 5px 6px 0;font-family:sans-serif;">+${extraCount}</span>`;
  }

  const shareHTML = `
<div style="width:390px;height:520px;background:${bgColor};overflow:hidden;font-family:'LXGW WenKai','PingFang SC','Microsoft YaHei',sans-serif;">
  ${coverHTML}
  <div style="height:160px;background:#fff;padding:18px 20px;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;">
    <div style="font-size:20px;font-weight:700;color:#333;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${proj.name}</div>
    <div style="margin-bottom:12px;line-height:1.4;">${capsulesHTML}</div>
    <div style="display:flex;text-align:center;">
      <div style="flex:1;">
        <div style="font-size:24px;font-weight:700;color:#333;line-height:1.2;">${allNeedles.toLocaleString()}</div>
        <div style="font-size:11px;color:#999;margin-top:1px;">${t('share_total_stitches')}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:24px;font-weight:700;color:#333;line-height:1.2;">${allRounds}</div>
        <div style="font-size:11px;color:#999;margin-top:1px;">${t('share_total_rounds')}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:24px;font-weight:700;color:#333;line-height:1.2;">${focusStr}</div>
        <div style="font-size:11px;color:#999;margin-top:1px;">${t('home_stats_focus')}</div>
      </div>
    </div>
  </div>
  <div style="height:74px;background:${accentColor};display:flex;align-items:center;justify-content:space-between;padding:0 20px;box-sizing:border-box;">
    <div>
      <div style="font-size:18px;font-weight:700;color:#fff;line-height:1.3;">${t('app_name')}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.75);line-height:1.3;">${t('home_empty_moti')}</div>
    </div>
    <div style="width:28px;height:28px;background:rgba(255,255,255,0.25);border-radius:7px;flex-shrink:0;"></div>
  </div>
</div>`;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:390px;height:520px;';
  container.innerHTML = shareHTML;
  document.body.appendChild(container);

  if (coverSrc) {
    const img = container.querySelector('img');
    if (img && !img.complete) {
      await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    }
  }

  await new Promise(r => setTimeout(r, 150));

  try {
    const canvas = await window.html2canvas(container.firstElementChild, {
      width: 390,
      height: 520,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });
    return canvas.toDataURL('image/png');
  } finally {
    document.body.removeChild(container);
  }
}

export async function handleGenerateShare(projId) {
  showLoading(t('loading'));
  try {
    const dataUrl = await generateShareImage(projId);
    hideLoading();
    showShareSheet(projId, dataUrl);
  } catch (e) {
    hideLoading();
    showToast('生成分享图失败: ' + e.message);
  }
}

export function showShareSheet(projId, imageDataUrl) {
  const proj = getProj(projId);
  if (!proj) return;

  const safeName = proj.name.replace(/[\/\\:*?"<>|]/g, '_');
  const filename = `织影_${safeName}.png`;

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${t('share_preview_title')}</div>
    <div class="share-preview-wrap">
      <img class="share-preview-img" src="${imageDataUrl}" alt="">
    </div>
    <div class="share-preview-actions">
      <button class="sheet-item share-preview-btn" onclick="downloadShareImage('${imageDataUrl}','${filename.replace(/'/g, "\\'")}');closeSheet()">${t('share_save')}</button>
      <button class="sheet-item share-preview-btn" onclick="shareImageNative('${imageDataUrl}','${filename.replace(/'/g, "\\'")}','${proj.name.replace(/'/g, "\\'")}')">${t('share_share')}</button>
    </div>
    <button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>
  `;

  showSheet(html);
}

export function downloadShareImage(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareImageNative(dataUrl, filename, projName) {
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: projName });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  downloadShareImage(dataUrl, filename);
  showToast(t('share_saved_hint'));
}
