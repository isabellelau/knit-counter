import { state, uid, getProj } from './state.js';
import { showSheet, showToast, closeSheet, esc } from './ui.js';
import { saveData } from './storage.js';
import { t } from './i18n.js';

const APP_URL = 'https://isabellelau.github.io/knit-counter/';

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
      customPalette: part.customPalette,
      markers: part.markers,
      rounds: (part.rounds || []).map(r => ({
        instruction: r.instruction || '',
        seq: r.seq || [],
        ...(r.expectedCount != null ? { expectedCount: r.expectedCount } : {}),
        ...(r.isTextCard ? { isTextCard: true } : {}),
        ...(r.isLoopMarker ? { isLoopMarker: true } : {}),
        ...(r.loopFrom != null ? { loopFrom: r.loopFrom } : {}),
        ...(r.loopTo != null ? { loopTo: r.loopTo } : {}),
        ...(r.roundNum != null ? { roundNum: r.roundNum } : {})
      }))
    }))
  };
}

async function compressAndEncode(data) {
  const json = JSON.stringify(data);
  // CompressionStream 在部分浏览器中会导致流挂起，暂时走无压缩 fallback
  const bytes = new TextEncoder().encode(json);
  return { compressed: false, data: uint8ArrayToBase64(bytes) };
}

function generateFullProjectText(proj, encoded) {
  return `【织影项目】${proj.name}\nKNIT1:${encoded}\n用织影App导入可直接使用 #织影`;
}

// ── Import: decode / decompress ──
async function decodeAndDecompress(b64) {
  try {
    const bytes = base64ToUint8Array(b64);

    // 对应导出的无压缩 fallback：先尝试直接解析
    try {
      const json = new TextDecoder().decode(bytes);
      console.log('[import] decompressed length (direct):', json.length);
      console.log('[import] json preview:', json.slice(0, 200));
      return JSON.parse(json);
    } catch {
      // 直接解析失败，说明是 gzip 压缩数据
    }

    if (typeof DecompressionStream === 'undefined') {
      return null;
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
      const json = new TextDecoder().decode(combined);
      console.log('[import] decompressed length (gzip):', json.length);
      console.log('[import] json preview (gzip):', json.slice(0, 200));
      return JSON.parse(json);
    } catch {
      return null;
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
  try {
    const proj = getProj(projId);
    if (!proj) return;
    const stripped = stripProjectForExport(proj);
    const { data } = await compressAndEncode(stripped);
    const text = generateFullProjectText(proj, data);
    await copyToClipboard(text);
    showToast(t('share_full_copied'));
  } catch (e) {
    console.error('Full project export failed:', e);
    showToast(t('share_copy_failed'));
  } finally {
    closeSheet();
  }
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

  console.log('[import] raw input length:', raw.length);
  console.log('[import] KNIT1 match:', /KNIT1:(\S+)/.test(raw));

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

  console.log('[import] parsed proj name:', data.name);
  console.log('[import] parts count:', data.parts?.length);
  console.log('[import] first part rounds:', data.parts?.[0]?.rounds?.length);

  const newId = uid();
  const proj = {
    id: newId,
    name: data.name || t('imported_project'),
    useRowTerms: data.useRowTerms || false,
    parts: (data.parts || []).map(part => ({
      ...part,
      id: uid(),
      rounds: (part.rounds || []).map(r => ({
        ...r,
        id: uid(),
        seq: r.seq || [],
        instruction: r.instruction || ''
      }))
    })),
    createdAt: Date.now(),
    lastModified: Date.now()
  };

  // 兼容 v12 旧数据：移除 clusterRanges，seq 保持单针
  proj.parts.forEach(part => {
    (part.rounds || []).forEach(r => {
      delete r.clusterRanges;
    });
  });

  // 询问导入模式：跟织模式 / 作为自己项目
  state.flowState.pendingImportProj = proj;

  console.log('[import] showing mode dialog');

  const html = `
    <div class="sheet-handle"></div>
    <div class="sheet-title">${t('import_mode_title')}</div>
    <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">
      <div onclick="window._applyImportMode('follow')" style="background:var(--card);border:2px solid var(--accent);border-radius:14px;padding:18px 16px;cursor:pointer;">
        <div style="font-size:15px;font-weight:700;">${t('import_mode_follow')}</div>
        <div style="font-size:12px;color:var(--muted)">${t('import_mode_follow_sub')}</div>
      </div>
      <div onclick="window._applyImportMode('own')" style="background:var(--card);border:2px solid var(--border);border-radius:14px;padding:18px 16px;cursor:pointer;">
        <div style="font-size:15px;font-weight:700;">${t('import_mode_own')}</div>
        <div style="font-size:12px;color:var(--muted)">${t('import_mode_own_sub')}</div>
      </div>
    </div>
  `;
  showSheet(html);
};

window._applyImportMode = function(mode) {
  const proj = state.flowState.pendingImportProj;
  if (!proj) return;
  state.flowState.pendingImportProj = null;

  if (mode === 'own') {
    // 作为自己项目：清空 seq，只保留图解文字
    proj.parts.forEach(part => {
      part.rounds.forEach(r => {
        r.seq = [];
      });
    });
  }
  // 跟织模式：保留原有 seq（已包含 cluster token）

  state.data.projects.push(proj);
  console.log('[import] total projects now:', state.data.projects.length);
  console.log('[import] imported proj id:', proj.id);
  saveData();
  closeSheet();
  window.openProject(proj.id);
};
