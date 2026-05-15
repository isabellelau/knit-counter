import { state, uid, getProj } from './state.js';
import { showSheet, showToast, closeSheet, esc } from './ui.js';
import { saveData } from './storage.js';
import { t } from './i18n.js';

const APP_URL = 'https://isabellelau.github.io/knit-counter/';

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

// ── Binary helpers ──
function uint8ArrayToBase64(bytes) {
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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

// ── Full project export (Pro) ──
function stripProjectForExport(proj) {
  return {
    name: proj.name,
    useRowTerms: proj.useRowTerms,
    parts: (proj.parts || []).map(part => ({
      title: part.title,
      activeRoundId: part.activeRoundId,
      customPalette: part.customPalette,
      markers: part.markers,
      rounds: (part.rounds || []).map(r => ({
        instruction: r.instruction || '',
        seq: r.seq || [],
        ...(r.expectedCount != null ? { expectedCount: r.expectedCount } : {}),
        ...(r.isTextCard ? { isTextCard: true } : {}),
        ...(r.isLoopMarker ? { isLoopMarker: true } : {}),
        ...(r.roundNum != null ? { roundNum: r.roundNum } : {})
      }))
    }))
  };
}

async function compressAndEncode(data) {
  const json = JSON.stringify(data);
  if (typeof CompressionStream === 'undefined') {
    const bytes = new TextEncoder().encode(json);
    return { compressed: false, data: uint8ArrayToBase64(bytes) };
  }
  try {
    const bytes = new TextEncoder().encode(json);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    await writer.write(bytes);
    await writer.close();

    const reader = cs.readable.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const c of chunks) {
      combined.set(c, offset);
      offset += c.length;
    }
    return { compressed: true, data: uint8ArrayToBase64(combined) };
  } catch (e) {
    console.warn('Compression failed, falling back to uncompressed:', e);
    const bytes = new TextEncoder().encode(json);
    return { compressed: false, data: uint8ArrayToBase64(bytes) };
  }
}

function generateFullProjectText(proj, encoded) {
  return `【织影项目】${proj.name}\nKNIT1:${encoded}\n用织影App导入可直接使用 #织影`;
}

// ── Import: decode / decompress ──
async function decodeAndDecompress(b64) {
  try {
    const bytes = base64ToUint8Array(b64);

    if (typeof DecompressionStream === 'undefined') {
      return JSON.parse(new TextDecoder().decode(bytes));
    }

    try {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      await writer.write(bytes);
      await writer.close();

      const reader = ds.readable.getReader();
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const c of chunks) {
        combined.set(c, offset);
        offset += c.length;
      }
      return JSON.parse(new TextDecoder().decode(combined));
    } catch {
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch (e) {
    console.warn('decodeAndDecompress failed:', e);
    return null;
  }
}

function validateProjectData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.parts)) return false;
  for (const part of data.parts) {
    if (!Array.isArray(part.rounds)) return false;
  }
  return true;
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

    <button class="sheet-item" onclick="window._copyFullProject('${projId}')">
      <span class="sheet-item-icon">📦</span> ${esc(t('share_copy_full'))}<span class="pro-badge">PRO</span>
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

window._copyFullProject = async function(projId) {
  if (!requirePro()) return;
  const proj = getProj(projId);
  if (!proj) return;
  const stripped = stripProjectForExport(proj);
  const { data } = await compressAndEncode(stripped);
  const text = generateFullProjectText(proj, data);
  copyToClipboard(text).then(() => {
    showToast(t('share_full_copied'));
    closeSheet();
  }).catch(() => {
    showToast(t('share_full_copied'));
    closeSheet();
  });
};

// ── Import shared project sheet ──
export function openImportShareSheet() {
  document.getElementById("sheet").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
  state.flowState.importMode = 'create';

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${t('import_share_title')}</div>
    <div style="padding:8px 16px 12px">
      <textarea id="import-share-textarea" placeholder="${esc(t('import_share_placeholder'))}" style="width:100%;height:140px;border:1.5px solid var(--border);border-radius:10px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);box-sizing:border-box"></textarea>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">${t('import_share_hint')}</div>
    </div>
    <div style="display:flex;gap:8px;padding:0 16px 12px">
      <button class="sheet-cancel" onclick="closeSheet()" style="flex:1;margin:0">${t('cancel')}</button>
      <button class="sheet-item" onclick="window._doImportShared()" style="flex:1;margin:0;justify-content:center">${t('import')}</button>
    </div>
  `;
  showSheet(html);
}

window._doImportShared = async function() {
  const textarea = document.getElementById('import-share-textarea');
  if (!textarea) return;
  const raw = textarea.value.trim();
  if (!raw) return;

  const match = raw.match(/KNIT1:(\S+)/);
  if (!match || !match[1]) {
    showToast(t('import_share_error'));
    return;
  }

  const b64 = match[1];
  const data = await decodeAndDecompress(b64);
  if (!data || !validateProjectData(data)) {
    showToast(t('import_share_error'));
    return;
  }

  const newId = uid();
  const proj = {
    id: newId,
    name: data.name || t('imported_project'),
    useRowTerms: data.useRowTerms || false,
    parts: (data.parts || []).map(part => ({
      ...part,
      rounds: (part.rounds || []).map(r => ({
        ...r,
        seq: r.seq || [],
        instruction: r.instruction || ''
      }))
    })),
    createdAt: Date.now(),
    lastModified: Date.now()
  };

  state.data.projects[newId] = proj;
  saveData();
  closeSheet();
  window.openProject(newId);
};
