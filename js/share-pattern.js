import { state, getProj } from './state.js';
import { showSheet, showToast, closeSheet, esc } from './ui.js';
import { t } from './i18n.js';

const APP_URL = 'https://isabellelau.github.io/knit-counter/';
const QR_MAX_BYTES = 2000;

// ── Pro gate ──
function isPro() { return state.data.settings.isPro === true; }

function requirePro() {
  if (!isPro()) { showToast(t('share_pro_required')); return false; }
  return true;
}

// ── Clipboard helpers ──
function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('execCommand failed'));
    } catch (e) { reject(e); }
  });
}

// ── Text pattern generation ──
function generateTextPattern(proj) {
  const lines = [];
  lines.push(`【${t('app_name')}${t('share_pattern_title')}】${proj.name}`);
  lines.push('');

  const parts = proj.parts || [];
  parts.forEach((part, pi) => {
    if (parts.length > 1) {
      lines.push(part.title || `${t('unnamed')} ${pi + 1}`);
    }
    let hasRound = false;
    (part.rounds || []).forEach(r => {
      const instr = (r.instruction || '').trim();
      if (!instr) return;
      lines.push(instr);
      hasRound = true;
    });
    if (hasRound && pi < parts.length - 1) lines.push('');
  });

  lines.push('');
  lines.push(t('share_text_footer'));
  lines.push(APP_URL);

  return lines.join('\n');
}

// ── Sequence payload (Pro: stripped-down export) ──
function getSequencePayload(proj) {
  return {
    version: 1,
    type: 'sequence',
    exportedAt: new Date().toISOString(),
    project: {
      name: proj.name,
      useRowTerms: proj.useRowTerms,
      parts: (proj.parts || []).map(part => ({
        title: part.title,
        rounds: (part.rounds || [])
          .filter(r => !r.isTextCard && !r.isLoopMarker)
          .map(r => ({
            instruction: r.instruction || '',
            seq: r.seq || [],
            ...(r.expectedCount != null ? { expectedCount: r.expectedCount } : {})
          }))
      }))
    }
  };
}

function triggerDownload(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── QR code ──
let _qrLoaded = false;
let _qrLoading = null;

function loadQRCode() {
  if (_qrLoaded) return Promise.resolve();
  if (_qrLoading) return _qrLoading;
  _qrLoading = new Promise((resolve, reject) => {
    if (window.QRCode) { _qrLoaded = true; resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => { _qrLoaded = true; resolve(); };
    script.onerror = () => { _qrLoading = null; reject(new Error('QR code library load failed')); };
    document.head.appendChild(script);
  });
  return _qrLoading;
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

// ═══════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════

export function openShareSheet(projId) {
  const proj = getProj(projId);
  if (!proj) return;

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${t('share_pattern_title')}</div>

    <button class="sheet-item" onclick="window._copyTextPattern('${projId}');closeSheet()">
      <span class="sheet-item-icon">📝</span> ${esc(t('share_copy_text'))}
    </button>

    <button class="sheet-item" onclick="window._exportStitchSeq('${projId}')">
      <span class="sheet-item-icon">🧵</span> ${esc(t('share_export_seq'))}<span class="pro-badge">PRO</span>
    </button>

    <button class="sheet-item" onclick="window._exportFullProj('${projId}')">
      <span class="sheet-item-icon">📦</span> ${esc(t('share_export_full'))}<span class="pro-badge">PRO</span>
    </button>

    <button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>
  `;
  showSheet(html);
}

window._copyTextPattern = function(projId) {
  const proj = getProj(projId);
  if (!proj) return;
  const text = generateTextPattern(proj);
  copyToClipboard(text).then(() => {
    showToast(t('share_copied'));
  }).catch(() => {
    showToast(t('share_copied'));
  });
};

window._exportStitchSeq = function(projId) {
  if (!requirePro()) return;
  const proj = getProj(projId);
  if (!proj) return;
  const payload = getSequencePayload(proj);
  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(payload, `${proj.name}_seq_${date}.knt`);
  closeSheet();
};

window._exportFullProj = function(projId) {
  if (!requirePro()) return;
  const proj = getProj(projId);
  if (!proj) return;

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    project: proj
  };

  const date = new Date().toISOString().slice(0, 10);
  triggerDownload(payload, `${proj.name}_${date}.knt`);

  // Re-render sheet with QR toggle
  showQRSheet(projId, payload);
};

// ── QR sheet (shown after full project export) ──
function showQRSheet(projId, payload) {
  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${t('share_pattern_title')}</div>
    <div style="padding:8px 16px 12px;text-align:center;font-size:13px;font-weight:600;color:var(--success)">
      ✓ ${t('share_exported')}
    </div>
    <div class="share-preview-toggle-row">
      <span class="share-preview-toggle-label">${t('share_qr_label')}</span>
      <span class="settings-toggle" id="shareQRToggle" onclick="window._toggleShareQR('${projId}')">
        <span class="settings-toggle-knob"></span>
      </span>
    </div>
    <div id="share-qr-container" style="display:none">
      <div class="share-qr-wrap">
        <div id="share-qr-code"></div>
        <div style="font-size:11px;color:var(--muted);margin-top:8px">${t('share_qr_hint')}</div>
      </div>
    </div>
    <button class="sheet-cancel" onclick="closeSheet()">${t('close')}</button>
  `;
  showSheet(html);
  // stash payload for toggle handler
  window._shareQRPayload = payload;
  window._shareQRProjectId = projId;
}

window._toggleShareQR = async function(projId) {
  const toggle = document.getElementById('shareQRToggle');
  const container = document.getElementById('share-qr-container');
  if (!toggle || !container) return;

  const isOn = !toggle.classList.contains('on');
  toggle.classList.toggle('on', isOn);

  if (!isOn) {
    container.style.display = 'none';
    return;
  }

  const payload = window._shareQRPayload;
  if (!payload) return;

  const json = JSON.stringify(payload);
  if (json.length > QR_MAX_BYTES) {
    showToast(t('share_qr_too_large'));
    toggle.classList.remove('on');
    return;
  }

  container.style.display = 'block';
  const qrDiv = document.getElementById('share-qr-code');
  if (!qrDiv) return;
  qrDiv.innerHTML = '';

  try {
    await loadQRCode();
    new window.QRCode(qrDiv, {
      text: toBase64(json),
      width: 200,
      height: 200,
      colorDark: '#2D1E20',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel.L
    });
  } catch (e) {
    console.warn('QR code generation failed:', e);
    showToast('QR code generation failed');
    container.style.display = 'none';
    toggle.classList.remove('on');
  }
};
