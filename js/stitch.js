import { state, uid, getProj, getActivePart, addDailyCount } from './state.js';
import { showSheet, closeSheet, showToast, esc, showConfirmDialog } from './ui.js';
import { saveData } from './storage.js';
import { STITCH_LIB, STITCHES, SM, extractStitches, resolveColor, ALIAS_TO_ID, STITCH_IDS, getTokenRE, setTokenRE, setOnBeforeExtract } from '../stitches.js';
import { updateVoiceButton } from './voice.js';
import { getNextStitchSid, renderHighlightReel, expandInstructionFull } from './highlight.js';
import { getRefImage, addRefImage } from './image.js';
import { setActiveRound } from './round.js';
import { normalizeRoundNums } from './pattern.js';
import { t, term, getShowSymbol } from './i18n.js';

// ── 动态 token 正则：合并内置针法 + 自定义针法 ──

export function rebuildDynamicTokenRE() {
  const customStitches = state.data?.settings?.globalCustomStitches ?? {};
  const customIds = Object.keys(customStitches);

  // 注册自定义针法 id 到别名表（自引用）
  for (const id of customIds) {
    ALIAS_TO_ID[id.toUpperCase()] = id;
  }

  const allIds = [...new Set([...customIds, ...STITCH_IDS])]
    .sort((a, b) => b.length - a.length);

  setTokenRE(new RegExp(`\\b(\\d*)\\s*(${allIds.join('|')})(?![a-zA-Z])`, 'gi'));
}

// 每次 extractStitches 调用前自动刷新正则（幂等，开销极低）
setOnBeforeExtract(rebuildDynamicTokenRE);

export function getUnitLabel(proj) {
  const p = proj || getProj(state.curProjId);
  return p && p.useRowTerms ? term('row') : term('round');
}

export function toggleRowTerms() {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  proj.useRowTerms = !proj.useRowTerms;
  proj.lastModified = Date.now();
  saveData();
  window.renderProject();
}

function resolveLabel(sid) {
  const globalCustoms = state.data?.settings?.globalStitchCustomizations;
  if (globalCustoms?.names?.[sid]) return globalCustoms.names[sid];
  const cs = state.data?.settings?.globalCustomStitches?.[sid];
  if (cs?.label) return cs.label;
  return term(sid);
}

export const ALL_THEMES = {
  morandi: null,
  night: {
    X: "#5F85B2", T: "#8E7CA3", F: "#6B8E83", E: "#A67C65",
    V: "#45628A", W: "#2F425C", TV: "#6B5D7B", TW: "#4A4055",
    FV: "#4F6B62", FW: "#354742", EV: "#C9A38E",
    A: "#8AA4C4", M: "#B4C4D7", TA: "#A99BB9", TM: "#C4BBCF",
    FA: "#8AA79D", FM: "#A9C0B7", EA: "#523D32",
    CH: "#94A3B8", SL: "#64748B", SK: "#475569",
    G: "#CAB382", Q: "#B3A08B"
  },
  float: {
    X: "#7BAAF4", T: "#A78BFA", F: "#2DD4BF", E: "#FB923C",
    V: "#60A5FA", W: "#4B89ED", TV: "#8B5CF6", TW: "#6D28D9",
    FV: "#0D9488", FW: "#115E59", EV: "#E25D28",
    A: "#93C5FD", M: "#DBEAFE", TA: "#C4B5FD", TM: "#DDD6FE",
    FA: "#99F6E4", FM: "#CCFBF1", EA: "#FDD6A3",
    CH: "#64748B", SL: "#475569", SK: "#D4D4D8",
    G: "#F9086C", Q: "#9D1717"
  }
};

export function getCustomStitchesGlobal() {
  return state.data?.settings?.globalCustomStitches ?? {};
}

export function getProjColor(sid) {
  if (!STITCH_LIB[sid] && !getCustomStitchesGlobal()[sid]) {
    return 'var(--muted)';
  }
  const stitchKey = state.data?.settings?.stitchTheme || "morandi";
  const ext = ALL_THEMES[stitchKey];
  if (ext && ext[sid]) return ext[sid];
  const color = resolveColor(sid, state.data.settings);
  if (color !== '#ccc') return color;
  const cs = getCustomStitchesGlobal()[sid];
  return cs?.color || (color !== '#ccc' ? color : '#A8A29E');
}

export function getStitchInfo(sid) {
  // 复合针法：(5F), (3X) 等
  const compoundMatch = sid.match(/^\((\d+)([A-Z]+)\)$/i);
  if (compoundMatch) {
    const count = parseInt(compoundMatch[1], 10);
    const innerSid = compoundMatch[2].toUpperCase();
    const innerLib = STITCH_LIB[innerSid] || getCustomStitchesGlobal()[innerSid];
    const label = innerLib ? resolveLabel(innerSid) : innerSid;
    return {
      id: sid,
      label: count + label,
      abbr: innerLib?.abbr || innerSid,
      color: getProjColor(innerSid),
      category: innerLib?.category || 'basic',
      isCompound: true,
      innerCount: count,
      innerSid
    };
  }

  const cs = getCustomStitchesGlobal()[sid];
  const lib = STITCH_LIB[sid];
  if (!cs && !lib) return null;
  return {
    id: sid,
    label: resolveLabel(sid),
    abbr: cs ? cs.id : (lib?.abbr || sid),
    color: getProjColor(sid),
    category: cs?.category || lib?.category || 'basic',
    isCustom: !!cs
  };
}

function getAllStitchesForProject() {
  const list = STITCHES.map(s => ({
    ...s,
    label: resolveLabel(s.id),
    color: getProjColor(s.id)
  }));
  const allCustomStitches = getCustomStitchesGlobal();
  Object.values(allCustomStitches).forEach(cs => {
    list.push({
      id: cs.id,
      label: resolveLabel(cs.id),
      abbr: cs.id,
      color: getProjColor(cs.id),
      category: cs.category || 'basic'
    });
  });
  return list;
}

export function findRound(proj, roundId) {
  if (!proj || !proj.parts) return null;
  for (const part of proj.parts) {
    const r = part.rounds.find(r => r.id === roundId);
    if (r) return r;
  }
  return null;
}

export function openInstructionEdit(roundId) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;

  const part = getActivePart(proj);
  state.flowState.instructionBuffer = r.instruction || '';
  state.flowState.instructionEditRoundId = roundId;

  // Build stitch list (same logic as bottom palette)
  let displayIds;
  if (part && part.customPalette && part.customPalette.length > 0) {
    displayIds = part.customPalette.filter(sid => STITCH_LIB[sid] || getCustomStitchesGlobal()[sid]);
  } else {
    const hasPattern = part && part.rounds.some(r => r.instruction && r.instruction.trim());
    if (hasPattern) {
      const planned = new Set();
      part.rounds.forEach(r => {
        if (r.instruction) extractStitches(r.instruction).forEach(sid => planned.add(sid));
      });
      displayIds = Array.from(planned);
    } else {
      displayIds = ['CH', 'X', 'V', 'A', 'T', 'F', 'SL'];
    }
  }
  if (!part || !part.customPalette || part.customPalette.length === 0) {
    Object.keys(getCustomStitchesGlobal()).forEach(sid => {
      if (!displayIds.includes(sid)) displayIds.push(sid);
    });
  }
  displayIds = [...new Set(displayIds)];

  const buf = state.flowState.instructionBuffer;
  const placeholder = esc(t('instruction_placeholder'));

  const stitchBtns = displayIds.map(sid => {
    const info = getStitchInfo(sid);
    if (!info) return '';
    return `<button class="instr-editor-stitch-btn" style="background:${info.color}" onclick="instrEditorInsert('${sid}')">${sid}</button>`;
  }).join('');

  const numBtns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n =>
    `<button class="instr-editor-num-btn" onclick="instrEditorInsertNum('${n}')">${n}</button>`
  ).join('');

  const html = `<div class="sheet-handle"></div>
<div class="sheet-title">${t('edit_instruction')}</div>

<div class="instr-editor-preview-wrap">
  <div class="instr-editor-preview-bar">
    <div class="instr-editor-preview" id="instr-editor-preview">${buf ? esc(buf) : `<span class="instr-editor-placeholder">${placeholder}</span>`}</div>
    <textarea id="instruction-edit-area" class="instr-editor-textarea" style="display:none" placeholder="${placeholder}">${esc(buf)}</textarea>
    <button class="instr-editor-kb-toggle" id="instr-editor-kb-toggle" onclick="instrEditorToggleKB()">${t('instr_editor_kb_toggle')}</button>
  </div>
</div>

<div class="instr-editor-tap-area" id="instr-editor-tap-area">
  <div class="instr-editor-section-label">${t('instr_editor_stitches_label')}</div>
  <div class="instr-editor-stitch-grid">${stitchBtns}</div>

  <div class="instr-editor-numpad">${numBtns}</div>

  <div class="instr-editor-symbols">
    <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol('(')">(</button>
    <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(')')">)</button>
    <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(',')">,</button>
    <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol('×')">×</button>
    <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(' ')">${t('instr_editor_space')}</button>
    <button class="instr-editor-sym-btn instr-editor-sym-btn--action" onclick="instrEditorBackspace()">←</button>
    <button class="instr-editor-sym-btn instr-editor-sym-btn--danger" onclick="instrEditorClear()">${t('instr_editor_clear_btn')}</button>
    <button class="instr-editor-sym-btn instr-editor-sym-btn--confirm" onclick="instrEditorConfirm('${roundId}')">${t('confirm')}</button>
  </div>
</div>

<div style="padding:0 14px 10px">
  <button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>
</div>`;

  showSheet(html);
}

function _refreshInstrPreview() {
  const preview = document.getElementById('instr-editor-preview');
  if (!preview) return;
  const buf = state.flowState.instructionBuffer || '';
  if (buf.length === 0) {
    preview.innerHTML = `<span class="instr-editor-placeholder">${esc(t('instruction_placeholder'))}</span>`;
  } else {
    preview.textContent = buf;
  }
  preview.scrollLeft = preview.scrollWidth;
  const textarea = document.getElementById('instruction-edit-area');
  if (textarea && textarea.style.display !== 'none') {
    textarea.value = buf;
  }
  _refreshMultiRoundNav();
}

export function instrEditorInsert(sid) {
  state.flowState.instructionBuffer = (state.flowState.instructionBuffer || '') + sid;
  _refreshInstrPreview();
}

export function instrEditorInsertNum(n) {
  state.flowState.instructionBuffer = (state.flowState.instructionBuffer || '') + String(n);
  _refreshInstrPreview();
}

export function instrEditorInsertSymbol(c) {
  state.flowState.instructionBuffer = (state.flowState.instructionBuffer || '') + c;
  _refreshInstrPreview();
}

export function instrEditorBackspace() {
  const buf = state.flowState.instructionBuffer || '';
  state.flowState.instructionBuffer = buf.slice(0, -1);
  _refreshInstrPreview();
}

export function instrEditorClear() {
  state.flowState.instructionBuffer = '';
  _refreshInstrPreview();
}

export function instrEditorConfirm(roundId) {
  const textarea = document.getElementById('instruction-edit-area');
  if (textarea) {
    if (textarea.style.display === 'none') {
      textarea.value = state.flowState.instructionBuffer || '';
    } else {
      state.flowState.instructionBuffer = textarea.value;
    }
  }
  saveRoundInstruction(roundId);
}

export function instrEditorToggleKB() {
  const tapArea = document.getElementById('instr-editor-tap-area');
  const textarea = document.getElementById('instruction-edit-area');
  const preview = document.getElementById('instr-editor-preview');
  const toggleBtn = document.getElementById('instr-editor-kb-toggle');
  if (!tapArea || !textarea || !preview || !toggleBtn) return;

  const isKbMode = textarea.style.display !== 'none';

  if (isKbMode) {
    state.flowState.instructionBuffer = textarea.value;
    tapArea.style.display = '';
    textarea.style.display = 'none';
    preview.style.display = '';
    toggleBtn.textContent = t('instr_editor_kb_toggle');
    _refreshInstrPreview();
  } else {
    textarea.value = state.flowState.instructionBuffer || '';
    tapArea.style.display = 'none';
    textarea.style.display = '';
    preview.style.display = 'none';
    toggleBtn.textContent = t('instr_editor_tap_toggle');
    textarea.focus();
  }
}

// ═════════════════════════════════════
//  Multi-round instruction editor
// ═════════════════════════════════════

function _persistInstrBuffer(roundId) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return false;
  const textarea = document.getElementById('instruction-edit-area');
  if (textarea && textarea.style.display !== 'none') {
    state.flowState.instructionBuffer = textarea.value;
  }
  r.instruction = (state.flowState.instructionBuffer || '').trim();
  r.expectedCount = null;
  proj.lastModified = Date.now();
  saveData();
  return true;
}

function _refreshMultiRoundNav() {
  const navPrev = document.getElementById('mr-nav-prev');
  const navCurrent = document.getElementById('mr-nav-current');
  const navIndicator = document.getElementById('mr-nav-indicator');
  if (!navPrev || !navCurrent || !navIndicator) return;

  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;

  const rounds = part.rounds;
  const currentRoundId = state.flowState.instructionEditRoundId;
  const currentIdx = rounds.findIndex(r => r.id === currentRoundId);
  if (currentIdx < 0) return;

  if (currentIdx > 0) {
    const prev = rounds[currentIdx - 1];
    navPrev.textContent = `R${prev.roundNum || currentIdx}: ${prev.instruction || t('multi_round_nav_prev_empty')}`;
  } else {
    navPrev.textContent = `R0: ${t('multi_round_nav_prev_empty')}`;
  }

  const buf = state.flowState.instructionBuffer || '';
  const cur = rounds[currentIdx];
  const rn = cur.roundNum || (currentIdx + 1);
  navCurrent.innerHTML = `<span class="mr-nav-current-label">R${rn}:</span> ${esc(buf)}<span class="mr-nav-cursor">|</span>`;

  navIndicator.textContent = t('multi_round_nav_indicator')
    .replace('{n}', rn)
    .replace('{total}', rounds.length);
}

// ── Multi-editor ref area helpers ──

let _meRefIndex = 0;
let _meRefKeys = [];
let _meRefSwipeInited = false;

async function _loadRefImagesInEditor() {
  const track = document.getElementById('multi-editor-ref-track');
  const pagination = document.getElementById('multi-editor-ref-pagination');
  if (!track || !_meRefKeys.length) return;

  const imgs = track.querySelectorAll('.multi-editor-ref-img');
  for (let i = 0; i < Math.min(imgs.length, _meRefKeys.length); i++) {
    const src = await getRefImage(_meRefKeys[i]);
    if (src) imgs[i].src = src;
  }

  _updateRefPagination();
  _updateRefTrackPos();
}

function _updateRefPagination() {
  const pagination = document.getElementById('multi-editor-ref-pagination');
  if (pagination && _meRefKeys.length > 1) {
    pagination.textContent = `${_meRefIndex + 1}/${_meRefKeys.length}`;
    pagination.style.display = '';
  } else if (pagination) {
    pagination.style.display = 'none';
  }
}

function _updateRefTrackPos() {
  const track = document.getElementById('multi-editor-ref-track');
  if (track) {
    track.style.transform = `translateX(-${_meRefIndex * 100}%)`;
  }
  const fullscreenBtn = document.querySelector('.multi-editor-ref-fullscreen');
  if (fullscreenBtn && _meRefKeys[_meRefIndex]) {
    fullscreenBtn.onclick = () => {
      if (window.openRefImageViewer) openRefImageViewer(state.curProjId, _meRefKeys[_meRefIndex]);
    };
  }
}

function _initEditorRefSwipe() {
  if (_meRefSwipeInited) return;
  const refArea = document.getElementById('multi-editor-ref');
  if (!refArea) return;
  _meRefSwipeInited = true;

  let startX = 0, startY = 0, started = false;
  refArea.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      started = true;
    }
  }, { passive: true });

  refArea.addEventListener('touchend', e => {
    if (!started) return;
    started = false;
    const dx = (e.changedTouches[0]?.clientX || startX) - startX;
    const dy = Math.abs((e.changedTouches[0]?.clientY || startY) - startY);
    // Only swipe if horizontal movement dominates
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      if (dx < 0 && _meRefIndex < _meRefKeys.length - 1) {
        _meRefIndex++;
        _updateRefPagination();
        _updateRefTrackPos();
      } else if (dx > 0 && _meRefIndex > 0) {
        _meRefIndex--;
        _updateRefPagination();
        _updateRefTrackPos();
      }
    }
  });
}

function _initEditorDividerDrag() {
  const divider = document.getElementById('multi-editor-divider');
  const refArea = document.getElementById('multi-editor-ref');
  if (!divider || !refArea) return;

  let dragStartY = 0;
  let dragStartH = 0;
  let maxAvail = 340;
  let snapPoints = [80, 200, 340];

  divider.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      // Measure available flex space for this session
      const savedH = refArea.style.height;
      refArea.style.height = '';
      maxAvail = refArea.offsetHeight;
      refArea.style.height = savedH || '';
      snapPoints = [80, Math.round(maxAvail * 0.5), Math.round(maxAvail * 0.85)];

      dragStartY = e.touches[0].clientY;
      dragStartH = refArea.offsetHeight;
      refArea.style.transition = 'none';
    }
  }, { passive: true });

  divider.addEventListener('touchmove', e => {
    if (dragStartY === 0) return;
    const dy = e.touches[0].clientY - dragStartY;
    const newH = Math.max(80, Math.min(maxAvail, dragStartH + dy));
    refArea.style.height = newH + 'px';
  }, { passive: true });

  divider.addEventListener('touchend', () => {
    if (dragStartY === 0) return;
    const currentH = refArea.offsetHeight;
    let closest = snapPoints[0];
    let minDiff = Math.abs(currentH - snapPoints[0]);
    for (let i = 1; i < snapPoints.length; i++) {
      const diff = Math.abs(currentH - snapPoints[i]);
      if (diff < minDiff) { minDiff = diff; closest = snapPoints[i]; }
    }
    refArea.style.transition = 'height 0.2s ease';
    refArea.style.height = closest + 'px';
    dragStartY = 0;
  });
}

function _pickRefForMultiEditor(projId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async () => {
    const files = Array.from(input.files || []);
    for (const file of files) {
      await addRefImage(projId, file);
    }
    if (files.length > 0) {
      _refreshMultiEditorRefArea(projId);
    }
  };
  input.click();
}

function _refreshMultiEditorRefArea(projId) {
  const proj = getProj(projId);
  if (!proj) return;
  const refKeys = [...(proj.refImages || [])];
  _meRefKeys = refKeys;
  _meRefIndex = Math.min(_meRefIndex, Math.max(0, refKeys.length - 1));

  const refArea = document.getElementById('multi-editor-ref');
  if (!refArea) return;

  if (refKeys.length === 0) {
    refArea.style.height = '';
    refArea.innerHTML = `<div class="multi-editor-ref-empty" onclick="_pickRefForMultiEditor('${projId}')">＋ ${t('add_ref_image')}</div>`;
    return;
  }

  refArea.style.height = refArea.style.height || '';
  refArea.innerHTML = `
    <div class="multi-editor-ref-track" id="multi-editor-ref-track">
      ${refKeys.map((key, i) => `
        <div class="multi-editor-ref-slide">
          <img class="multi-editor-ref-img" data-key="${key}" src="" alt="">
        </div>
      `).join('')}
    </div>
    <div class="multi-editor-ref-pagination" id="multi-editor-ref-pagination" style="${refKeys.length > 1 ? '' : 'display:none'}">1/${refKeys.length}</div>
    <button class="multi-editor-ref-fullscreen" onclick="window.openRefImageViewer && openRefImageViewer('${projId}','${refKeys[_meRefIndex]}')">⤢</button>
  `;
  _loadRefImagesInEditor();
  _initEditorRefSwipe();
}

window._pickRefForMultiEditor = _pickRefForMultiEditor;

export function openMultiRoundEditor(projId) {
  const proj = getProj(projId);
  if (!proj) return;
  const part = getActivePart(proj);
  if (!part) return;

  if (part.rounds.length === 0) {
    const r = { id: uid(), seq: [], instruction: '', isTextCard: false };
    part.rounds.push(r);
    if (window.normalizeRoundNums) window.normalizeRoundNums(part.rounds);
    state.expandedRounds.add(r.id);
    part.activeRoundId = r.id;
    proj.lastModified = Date.now();
    saveData();
  }

  const activeRoundId = part.activeRoundId || part.rounds[0].id;
  const activeRound = part.rounds.find(r => r.id === activeRoundId);

  state.flowState.instructionBuffer = activeRound ? (activeRound.instruction || '') : '';
  state.flowState.instructionEditRoundId = activeRoundId;

  let displayIds;
  if (part.customPalette && part.customPalette.length > 0) {
    displayIds = part.customPalette.filter(sid => STITCH_LIB[sid] || getCustomStitchesGlobal()[sid]);
  } else {
    const hasPattern = part.rounds.some(r => r.instruction && r.instruction.trim());
    if (hasPattern) {
      const planned = new Set();
      part.rounds.forEach(r => {
        if (r.instruction) extractStitches(r.instruction).forEach(sid => planned.add(sid));
      });
      displayIds = Array.from(planned);
    } else {
      displayIds = ['CH', 'X', 'V', 'A', 'T', 'F', 'SL'];
    }
  }
  if (!part.customPalette || part.customPalette.length === 0) {
    Object.keys(getCustomStitchesGlobal()).forEach(sid => {
      if (!displayIds.includes(sid)) displayIds.push(sid);
    });
  }
  displayIds = [...new Set(displayIds)];

  const buf = state.flowState.instructionBuffer;
  const placeholder = esc(t('instruction_placeholder'));

  const stitchBtns = displayIds.map(sid => {
    const info = getStitchInfo(sid);
    if (!info) return '';
    return `<button class="instr-editor-stitch-btn" style="background:${info.color}" onclick="instrEditorInsert('${sid}')">${sid}</button>`;
  }).join('');

  const numBtns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n =>
    `<button class="instr-editor-num-btn" onclick="instrEditorInsertNum('${n}')">${n}</button>`
  ).join('');

  // ── Ref images ──
  const refKeys = [...(proj.refImages || [])];
  _meRefKeys = refKeys;
  _meRefIndex = 0;
  _meRefSwipeInited = false;

  let refAreaHTML;
  if (refKeys.length > 0) {
    refAreaHTML = `
    <div class="multi-editor-ref-track" id="multi-editor-ref-track">
      ${refKeys.map((key) => `
        <div class="multi-editor-ref-slide">
          <img class="multi-editor-ref-img" data-key="${key}" src="" alt="">
        </div>
      `).join('')}
    </div>
    <div class="multi-editor-ref-pagination" id="multi-editor-ref-pagination" style="${refKeys.length > 1 ? '' : 'display:none'}">1/${refKeys.length}</div>
    <button class="multi-editor-ref-fullscreen" onclick="window.openRefImageViewer && openRefImageViewer('${projId}','${refKeys[_meRefIndex]}')">⤢</button>`;
  } else {
    refAreaHTML = `<div class="multi-editor-ref-empty" onclick="_pickRefForMultiEditor('${projId}')">＋ ${t('add_ref_image')}</div>`;
  }

  const html = `<div class="sheet-title">${t('multi_round_editor_title')}</div>

<div class="multi-editor-ref" id="multi-editor-ref">
  ${refAreaHTML}
</div>

<div class="multi-editor-divider" id="multi-editor-divider">
  <span class="multi-editor-divider-grip">━━</span>
</div>

<div class="multi-editor-preview" id="multi-editor-preview">
  <div class="multi-editor-preview-text">
    <div class="mr-nav-prev" id="mr-nav-prev"></div>
    <div class="mr-nav-current" id="mr-nav-current"></div>
    <div class="mr-nav-indicator" id="mr-nav-indicator"></div>
  </div>
  <div class="multi-editor-nav">
    <button class="multi-editor-nav-btn" onclick="instrEditorPrevRound()" title="${t('multi_round_prev_round')}">↑</button>
    <button class="multi-editor-nav-btn" onclick="instrEditorNextRound()" title="${t('multi_round_next_round')}">↓</button>
  </div>
  <button class="instr-editor-kb-toggle" id="instr-editor-kb-toggle" onclick="instrEditorToggleKB()">${t('instr_editor_kb_toggle')}</button>
</div>

<div class="multi-editor-keyboard" id="multi-editor-keyboard">
  <div class="instr-editor-preview-wrap">
    <div class="instr-editor-preview-bar">
      <div class="instr-editor-preview" id="instr-editor-preview">${buf ? esc(buf) : `<span class="instr-editor-placeholder">${placeholder}</span>`}</div>
      <textarea id="instruction-edit-area" class="instr-editor-textarea" style="display:none" placeholder="${placeholder}">${esc(buf)}</textarea>
    </div>
  </div>

  <div class="instr-editor-tap-area" id="instr-editor-tap-area">
    <div class="instr-editor-section-label">${t('instr_editor_stitches_label')}</div>
    <div class="multi-editor-stitch-row">${stitchBtns}</div>

    <div class="instr-editor-numpad">${numBtns}</div>

    <div class="instr-editor-symbols">
      <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol('(')">(</button>
      <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(')')">)</button>
      <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(',')">,</button>
      <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol('×')">×</button>
      <button class="instr-editor-sym-btn" onclick="instrEditorInsertSymbol(' ')">${t('instr_editor_space')}</button>
      <button class="instr-editor-sym-btn instr-editor-sym-btn--action" onclick="instrEditorBackspace()">←</button>
      <button class="instr-editor-sym-btn instr-editor-sym-btn--danger" onclick="instrEditorClear()">${t('instr_editor_clear_btn')}</button>
      <button class="instr-editor-sym-btn instr-editor-sym-btn--confirm" onclick="instrEditorConfirmMulti()">${t('confirm')}</button>
    </div>
  </div>
</div>

<div style="padding:0 14px 10px">
  <button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>
</div>`;

  showSheet(html);
  const sheet = document.getElementById('sheet');
  if (sheet) sheet.classList.add('multi-editor-sheet');
  _refreshMultiRoundNav();

  if (refKeys.length > 0) {
    _loadRefImagesInEditor();
    setTimeout(() => _initEditorRefSwipe(), 100);
  }
  setTimeout(() => _initEditorDividerDrag(), 100);
}

export function instrEditorPrevRound() {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;

  const currentRoundId = state.flowState.instructionEditRoundId;
  const rounds = part.rounds;
  const currentIdx = rounds.findIndex(r => r.id === currentRoundId);
  if (currentIdx <= 0) return;

  _persistInstrBuffer(currentRoundId);

  const prevRound = rounds[currentIdx - 1];
  state.flowState.instructionEditRoundId = prevRound.id;
  state.flowState.instructionBuffer = prevRound.instruction || '';

  _refreshInstrPreview();
}

export function instrEditorNextRound() {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;

  const currentRoundId = state.flowState.instructionEditRoundId;
  const rounds = part.rounds;
  const currentIdx = rounds.findIndex(r => r.id === currentRoundId);

  _persistInstrBuffer(currentRoundId);

  if (currentIdx >= rounds.length - 1) {
    const r = { id: uid(), seq: [], instruction: '', isTextCard: false };
    part.rounds.push(r);
    if (window.normalizeRoundNums) window.normalizeRoundNums(part.rounds);
    state.expandedRounds.add(r.id);
    part.activeRoundId = r.id;
    proj.lastModified = Date.now();
    saveData();

    state.flowState.instructionEditRoundId = r.id;
    state.flowState.instructionBuffer = '';
  } else {
    const nextRound = rounds[currentIdx + 1];
    state.flowState.instructionEditRoundId = nextRound.id;
    state.flowState.instructionBuffer = nextRound.instruction || '';
  }

  _refreshInstrPreview();
}

export function instrEditorConfirmMulti() {
  const roundId = state.flowState.instructionEditRoundId;
  if (!roundId) return;

  const textarea = document.getElementById('instruction-edit-area');
  if (textarea) {
    if (textarea.style.display === 'none') {
      textarea.value = state.flowState.instructionBuffer || '';
    } else {
      state.flowState.instructionBuffer = textarea.value;
    }
  }
  saveRoundInstruction(roundId);
}

export function saveRoundInstruction(roundId) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;

  let newValue;
  const textarea = document.getElementById('instruction-edit-area');
  if (textarea) {
    newValue = textarea.value.trim();
  }
  if (!newValue && state.flowState.instructionBuffer) {
    newValue = state.flowState.instructionBuffer.trim();
  }
  if (newValue == null) return;
  r.instruction = newValue;
  r.expectedCount = null;
  proj.lastModified = Date.now();
  saveData();
  closeSheet();

  const part = getActivePart(proj);
  if (part && part.activeRoundId === roundId) {
    const slide = document.getElementById('task-slide');
    if (slide) slide.outerHTML = renderTaskSlide(proj);
  }

  window.renderProject();

  if (state.highlightMode) {
    const result = getNextStitchSid(proj);
    if (result.status === 'ok' || result.status === 'round_complete') {
      showToast(t('instruction_calibrated'));
    }
    renderDynamicPalette(proj);
    renderHighlightReel(proj);
  }

  state.flowState.instructionBuffer = null;
  state.flowState.instructionEditRoundId = null;
}

export function getRoundStitches(round) {
  if (!round || !round.instruction || !round.instruction.trim()) return [];
  return [...new Set(extractStitches(round.instruction))];
}

export function renderSpillHTML(sid, idx, r, proj) {
  const info = getStitchInfo(sid);
  if (!info) return '';
  const sel = state.selectedStitch && state.selectedStitch.roundId === r.id && state.selectedStitch.idx === idx;
  const bg = info.color + "28";
  const compoundClass = info.isCompound ? ' spill--compound' : '';
  const marker = proj.markers && proj.markers.find(m => m.roundId === r.id && m.index === idx);
  const markerDot = marker ? `<span class="spill-marker-dot" style="background:${marker.color}"></span>` : '';
  return `<span class="spill${sel ? " selected" : ""}${compoundClass}"
    style="position:relative;background:${bg};border-color:${info.color};color:${info.color}"
    onclick="stitchTap('${r.id}',${idx})">
    <span class="spill-idx">${idx + 1}</span>
    <span class="spill-abbr">${esc(info.label)}${getShowSymbol() ? ` (${sid})` : ''}</span>
    ${markerDot}
  </span>`;
}

export function updateRoundHeader(r, proj) {
  const roundEl = document.getElementById("round-" + r.id);
  if (!roundEl) return;
  const countEl = roundEl.querySelector('.round-count');
  if (countEl) {
    const total = r.seq.length;
    const dots = r.seq.slice(-8).map(sid => {
      const c = getProjColor(sid);
      return `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c};margin-right:2px"></span>`;
    }).join("");
    countEl.innerHTML = `${total} ${term('stitches')} ${dots}`;
  }
}

export function updateHeaderStats(proj) {
  const allRounds = (proj.parts || []).reduce((s, pt) => s + (pt.rounds?.length || 0), 0);
  const allNeedles = (proj.parts || []).reduce((s, pt) => s + (pt.rounds || []).reduce((ss, r) => ss + (r.seq?.length || 0), 0), 0);
  const largeTitleSub = document.getElementById("large-title-sub");
  const unit = getUnitLabel(proj);
  if (largeTitleSub) largeTitleSub.textContent = t('header_stats').replace('{parts}', (proj.parts||[]).length).replace('{rounds}', allRounds).replace('{unit}', unit).replace('{stitches}', allNeedles);
}

function updateTaskSlideProgress(r) {
  const proj = getProj(state.curProjId);
  const slide = document.getElementById('task-slide');
  if (!slide) return;
  slide.outerHTML = renderTaskSlide(proj);
}

export function reindexSpills(seqWrap, roundId) {
  const spills = seqWrap.querySelectorAll('.spill');
  spills.forEach((spill, i) => {
    const idxEl = spill.querySelector('.spill-idx');
    if (idxEl) idxEl.textContent = i + 1;
    spill.setAttribute('onclick', `stitchTap('${roundId}',${i})`);
    if (state.selectedStitch && state.selectedStitch.roundId === roundId && state.selectedStitch.idx === i) {
      spill.classList.add('selected');
    } else {
      spill.classList.remove('selected');
    }
  });
}

// ═════════════════════════════════════
//  钩织进度记忆
// ═════════════════════════════════════

export function saveLastPosition(proj, part) {
  if (!proj || !part) return;
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r) return;
  const stitchIndex = r.seq.length - 1;
  // 验证：stitchIndex 必须在有效范围（-1 表示空圈，不作为恢复目标时不写入）
  if (stitchIndex < -1) return;
  part.lastPosition = {
    roundId: r.id,
    roundNum: r.roundNum != null ? r.roundNum : (part.rounds.indexOf(r) + 1),
    stitchIndex,
    savedAt: Date.now()
  };
  saveData();
}

export function checkResumePosition(proj, part) {
  if (!proj || !part) return;
  const lp = part.lastPosition;
  if (!lp || lp.stitchIndex < 0) return;
  const round = part.rounds.find(r => r.id === lp.roundId);
  if (!round || lp.stitchIndex >= round.seq.length) {
    part.lastPosition = null;
    saveData();
    return;
  }

  const rn = lp.roundNum || (part.rounds.indexOf(round) + 1);
  const d = new Date(lp.savedAt);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${mm}/${dd} ${hh}:${mi}`;

  const msg = t('resume_progress_msg')
    .replace('{roundNum}', rn)
    .replace('{stitchIndex}', lp.stitchIndex + 1)
    .replace('{time}', timeStr);

  showConfirmDialog(msg, (ok) => {
    if (ok) {
      part.activeRoundId = lp.roundId;
      state.expandedRounds.add(lp.roundId);
      proj.lastModified = Date.now();
      saveData();
      window.renderProject();
      setTimeout(() => {
        const roundEl = document.getElementById('round-' + lp.roundId);
        if (roundEl) {
          roundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const spill = roundEl.querySelectorAll('.spill')[lp.stitchIndex];
          if (spill) {
            spill.classList.add('spill--resume');
            setTimeout(() => spill.classList.remove('spill--resume'), 1500);
          }
        }
      }, 150);
    }
  }, {
    title: t('resume_progress_title'),
    confirmLabel: t('resume_continue'),
    cancelLabel: t('resume_skip')
  });
}

export function pushStitch(sid) {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r) return;

  r.seq.push(sid);

  proj.lastModified = Date.now();
  saveData();
  saveLastPosition(proj, part);
  addDailyCount(1);
  window.bumpDailyCount(proj, 1);
  window.tickFocusSession();
  state.highlightIndex++;

  if (state.immersiveMode) {
    renderImmersive(proj);
    return;
  }

  const roundEl = document.getElementById("round-" + r.id);
  if (roundEl) {
    const seqWrap = roundEl.querySelector('.seq-wrap');
    if (seqWrap) {
      const emptySpan = seqWrap.querySelector('.seq-empty');
      if (emptySpan) emptySpan.remove();
      const idx = r.seq.length - 1;
      seqWrap.insertAdjacentHTML('beforeend', renderSpillHTML(sid, idx, r, proj));
    }
    updateRoundHeader(r, proj);
    updateHeaderStats(proj);
    updateTaskSlideProgress(r);
    roundEl.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    window.renderProject();
    const el = document.getElementById("round-" + r.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  renderHighlightReel(proj);
  if (state.highlightMode) refreshBottomBar(proj);
}

export function undoStitch() {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r || !r.seq.length) return;
  r.seq.pop();
  proj.lastModified = Date.now();
  saveData();
  saveLastPosition(proj, part);
  addDailyCount(-1);
  window.bumpDailyCount(proj, -1);
  window.tickFocusSession();
  state.highlightIndex = Math.max(0, state.highlightIndex - 1);

  if (state.immersiveMode) {
    renderImmersive(proj);
    return;
  }

  const roundEl = document.getElementById("round-" + r.id);
  if (roundEl) {
    const seqWrap = roundEl.querySelector('.seq-wrap');
    if (seqWrap) {
      const lastSpill = seqWrap.querySelector('.spill:last-child');
      if (lastSpill) lastSpill.remove();
      if (r.seq.length === 0) {
        seqWrap.innerHTML = '<span class="seq-empty">' + t('empty_round_hint') + '</span>';
      }
    }
    updateRoundHeader(r, proj);
    updateHeaderStats(proj);
    updateTaskSlideProgress(r);
  } else {
    window.renderProject();
  }
  renderHighlightReel(proj);
  if (state.highlightMode) refreshBottomBar(proj);
}

export function stitchTap(roundId, idx) {
  state.selectedStitch = { roundId, idx };
  openStitchSheet(roundId, idx);
}

function openStitchSheet(roundId, idx) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  const sid = r.seq[idx];
  const s = SM[sid];
  const projColor = getProjColor(sid);
  const projLabel = resolveLabel(sid);

  const info = getStitchInfo(sid);
  const isCompound = info && info.isCompound;

  let html = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('stitch_detail_title').replace('{idx}', idx + 1)} · <span style="color:${projColor};font-weight:700">${esc(projLabel)}</span></div>`;

  if (isCompound) {
    const innerLabel = resolveLabel(info.innerSid);
    html += `<div style="padding:8px 14px;margin:0 14px;font-size:12px;color:var(--accent);background:var(--accent-bg);border-radius:10px;text-align:center">${t('compound_stitch_warning').replace('{count}', info.innerCount).replace('{stitch}', innerLabel)}</div>`;
  }

  html += `<div class="sheet-section">${t('change_to')}</div>`;
  html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 14px">`;
  getAllStitchesForProject(proj).forEach(st => {
    if (st.id === sid) return;
    html += `<button class="picker-btn" style="background:${st.color}" onclick="changeStitch('${roundId}',${idx},'${st.id}')">${esc(st.label)}</button>`;
  });
  html += `</div>`;

  html += `<div class="sheet-section" style="margin-top:4px">${t('insert_stitch')}</div>`;
  html += `<div class="sheet-item" onclick="startInsert('${roundId}',${idx},'before')">
    <div class="sheet-item-icon" style="background:#EFF6FF;color:#3B82F6">↑</div>
    <div><div class="sheet-item-label">${t('insert_before')}</div><div class="sheet-item-sub">${t('insert_before_sub').replace('{idx}', idx + 1)}</div></div>
  </div>`;
  html += `<div class="sheet-item" onclick="startInsert('${roundId}',${idx},'after')">
    <div class="sheet-item-icon" style="background:#F0FDF4;color:#22C55E">↓</div>
    <div><div class="sheet-item-label">${t('insert_after')}</div><div class="sheet-item-sub">${t('insert_after_sub').replace('{idx}', idx + 1)}</div></div>
  </div>`;

  html += `<div class="sheet-item sheet-del" onclick="deleteStitch('${roundId}',${idx})">
    <div class="sheet-item-icon" style="background:#FEF2F2;color:#EF4444">×</div>
    <div><div class="sheet-item-label" style="color:#EF4444">${t('delete_stitch')}</div></div>
  </div>`;

  // Marker section
  const marker = proj.markers && proj.markers.find(m => m.roundId === roundId && m.index === idx);
  html += `<div class="sheet-divider"></div>`;
  if (marker) {
    html += `<div class="sheet-item" onclick="openMarkerSheet('${roundId}',${idx})">
      <div class="sheet-item-icon" style="background:${marker.color};color:#fff">🔖</div>
      <div><div class="sheet-item-label">${t('marker_edit')}</div></div>
    </div>`;
    html += `<div class="sheet-item sheet-item--danger" onclick="removeMarker('${roundId}',${idx});closeSheet();renderProject()">
      <div class="sheet-item-icon" style="background:#FEF2F2;color:#EF4444">🗑</div>
      <div><div class="sheet-item-label">${t('marker_remove')}</div></div>
    </div>`;
  } else {
    html += `<div class="sheet-item" onclick="openMarkerSheet('${roundId}',${idx})">
      <div class="sheet-item-icon" style="background:var(--accent-bg);color:var(--accent)">🔖</div>
      <div><div class="sheet-item-label">${t('marker_add')}</div></div>
    </div>`;
  }

  html += `<button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>`;
  showSheet(html);
}

// ═════════════════════════════════════
//  Stitch Markers (记号扣)
// ═════════════════════════════════════

const MARKER_PRESETS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export function openMarkerSheet(roundId, idx) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;
  const existing = proj.markers && proj.markers.find(m => m.roundId === roundId && m.index === idx);
  const selColor = existing ? existing.color : MARKER_PRESETS[0];
  const selNote = existing ? existing.note : '';

  const presetBtns = MARKER_PRESETS.map(c =>
    `<button class="marker-color-btn" data-color="${c}" style="background:${c};width:28px;height:28px;border-radius:50%;border:${c === selColor ? '2px solid var(--text)' : '2px solid transparent'};cursor:pointer;flex-shrink:0" onclick="markerSelectColor('${c}')"></button>`
  ).join('');

  const html = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('marker_title')}</div>

  <div style="padding:12px 16px 6px">
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:600">${t('marker_color')}</div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap" id="marker-color-row">
      ${presetBtns}
      <input type="color" id="marker-custom-color" value="${selColor}"
        style="width:28px;height:28px;border:none;border-radius:50%;cursor:pointer;background:none;padding:0;flex-shrink:0"
        onchange="markerSelectColor(this.value)">
    </div>
  </div>

  <div style="padding:6px 16px 12px">
    <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('marker_note')}</div>
    <input id="marker-note-input" type="text" placeholder="${t('marker_note_placeholder')}" maxlength="30" value="${esc(selNote)}"
      style="width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;background:var(--bg);color:var(--text);outline:none;font-family:inherit">
  </div>

  <div style="padding:6px 16px 10px;display:flex;gap:8px">
    <button class="bar-btn" style="flex:1" onclick="closeSheet()">${t('cancel')}</button>
    <button class="bar-btn primary" style="flex:2" onclick="saveMarker('${roundId}',${idx})">${t('confirm')}</button>
  </div>`;

  state.flowState._markerColor = selColor;
  showSheet(html);
}

export function markerSelectColor(c) {
  state.flowState._markerColor = c;
  const btns = document.querySelectorAll('.marker-color-btn');
  btns.forEach(b => {
    b.style.border = b.dataset.color === c ? '2px solid var(--text)' : '2px solid transparent';
  });
  const customInput = document.getElementById('marker-custom-color');
  if (customInput) customInput.value = c;
}

export function saveMarker(roundId, idx) {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  if (!proj.markers) proj.markers = [];

  const color = state.flowState._markerColor || MARKER_PRESETS[0];
  const noteInput = document.getElementById('marker-note-input');
  const note = noteInput ? noteInput.value.trim() : '';

  const existingIdx = proj.markers.findIndex(m => m.roundId === roundId && m.index === idx);
  if (existingIdx >= 0) {
    proj.markers[existingIdx].color = color;
    proj.markers[existingIdx].note = note;
  } else {
    proj.markers.push({ id: uid(), roundId, index: idx, color, note });
  }

  proj.lastModified = Date.now();
  state.flowState._markerColor = null;
  saveData();
  closeSheet();
  window.renderProject();
}

export function removeMarker(roundId, idx) {
  const proj = getProj(state.curProjId);
  if (!proj || !proj.markers) return;
  proj.markers = proj.markers.filter(m => !(m.roundId === roundId && m.index === idx));
  proj.lastModified = Date.now();
  saveData();
}

export function openMarkersReviewSheet(roundId) {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  const r = findRound(proj, roundId);
  if (!r) return;
  const markers = (proj.markers || []).filter(m => m.roundId === roundId);
  if (markers.length === 0) {
    closeSheet();
    return;
  }

  let itemsHtml = markers.map(m => {
    const pos = m.index + 1;
    return `<div class="sheet-item" style="display:flex;align-items:center;gap:10px">
      <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${m.color};border:1.5px solid #fff;flex-shrink:0;box-shadow:0 0 0 1px var(--border)"></span>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text)">${t('marker_pos').replace('{n}', pos)}</div>
        ${m.note ? `<div style="font-size:11px;color:var(--muted);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.note)}</div>` : ''}
      </div>
      <button class="bar-btn" style="flex:0;padding:4px 10px;font-size:11px;color:var(--danger);border-color:var(--danger-bg);background:var(--danger-bg)" onclick="event.stopPropagation();removeMarker('${roundId}',${m.index});openMarkersReviewSheet('${roundId}')">${t('marker_remove')}</button>
    </div>`;
  }).join('');

  const html = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('marker_review_title').replace('{count}', markers.length)}</div>
  <div style="padding:4px 0">${itemsHtml}</div>
  <div style="padding:10px 14px">
    <button class="sheet-cancel" style="width:100%;margin:0" onclick="closeSheet()">${t('done')}</button>
  </div>`;

  showSheet(html);
}

function _checkMarkerDrift(roundId) {
  const proj = getProj(state.curProjId);
  if (!proj || !proj.markers) return;
  const count = proj.markers.filter(m => m.roundId === roundId).length;
  if (count > 0) {
    showToast(
      t('marker_drift_warning').replace('{n}', count),
      { label: t('marker_drift_check'), onClick: () => openMarkersReviewSheet(roundId) },
      6000
    );
  }
}

export function changeStitch(roundId, idx, sid) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;
  r.seq[idx] = sid;
  proj.lastModified = Date.now();
  saveData(); closeSheet();

  const roundEl = document.getElementById("round-" + r.id);
  if (roundEl) {
    const seqWrap = roundEl.querySelector('.seq-wrap');
    if (seqWrap) {
      const spills = seqWrap.querySelectorAll('.spill');
      if (spills[idx]) {
        const info = getStitchInfo(sid);
        if (info) {
          const bg = info.color + "28";
          spills[idx].style.background = bg;
          spills[idx].style.borderColor = info.color;
          spills[idx].style.color = info.color;
          const abbrEl = spills[idx].querySelector('.spill-abbr');
          if (abbrEl) abbrEl.textContent = esc(info.label) + (getShowSymbol() ? ` (${sid})` : '');
        }
      }
    }
    updateRoundHeader(r, proj);
  } else {
    window.renderProject();
  }
}

export function deleteStitch(roundId, idx) {
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;
  r.seq.splice(idx, 1);
  proj.lastModified = Date.now();
  saveData(); closeSheet();
  _checkMarkerDrift(roundId);

  const roundEl = document.getElementById("round-" + r.id);
  if (roundEl) {
    const seqWrap = roundEl.querySelector('.seq-wrap');
    if (seqWrap) {
      const spills = seqWrap.querySelectorAll('.spill');
      if (spills[idx]) spills[idx].remove();
      if (r.seq.length === 0) {
        seqWrap.innerHTML = '<span class="seq-empty">' + t('empty_round_hint') + '</span>';
      } else {
        reindexSpills(seqWrap, roundId);
      }
    }
    updateRoundHeader(r, proj);
    updateHeaderStats(proj);
    if (state.selectedStitch && state.selectedStitch.roundId === roundId) {
      if (state.selectedStitch.idx === idx) {
        state.selectedStitch = null;
      } else if (state.selectedStitch.idx > idx) {
        state.selectedStitch.idx--;
      }
    }
  } else {
    window.renderProject();
  }
}

export function startInsert(roundId, idx, dir) {
  state.pendingInsert = { roundId, idx, dir };
  const proj = getProj(state.curProjId);
  let html = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('select_stitch_to_insert')}</div>
  <div class="picker-grid">`;
  getAllStitchesForProject(proj).forEach(s => {
    html += `<button class="picker-btn" style="background:${s.color}" onclick="doInsert('${s.id}')">${esc(s.label)}</button>`;
  });
  html += `</div><button class="sheet-cancel" onclick="closeSheet()">${t('cancel')}</button>`;
  showSheet(html);
}

export function doInsert(sid) {
  if (!state.pendingInsert) return;
  const { roundId, idx, dir } = state.pendingInsert;
  const proj = getProj(state.curProjId);
  const r = findRound(proj, roundId);
  if (!r) return;
  const pos = dir === "before" ? idx : idx + 1;
  r.seq.splice(pos, 0, sid);
  state.pendingInsert = null;
  proj.lastModified = Date.now();
  saveData(); closeSheet();
  _checkMarkerDrift(roundId);

  const roundEl = document.getElementById("round-" + r.id);
  if (roundEl) {
    const seqWrap = roundEl.querySelector('.seq-wrap');
    if (seqWrap) {
      const emptySpan = seqWrap.querySelector('.seq-empty');
      if (emptySpan) emptySpan.remove();

      const spills = seqWrap.querySelectorAll('.spill');
      const spillHtml = renderSpillHTML(sid, pos, r, proj);

      if (spills[pos]) {
        spills[pos].insertAdjacentHTML('beforebegin', spillHtml);
      } else if (spills.length > 0) {
        spills[spills.length - 1].insertAdjacentHTML('afterend', spillHtml);
      } else {
        seqWrap.insertAdjacentHTML('beforeend', spillHtml);
      }
      reindexSpills(seqWrap, roundId);
    }
    updateRoundHeader(r, proj);
    updateHeaderStats(proj);
    if (state.selectedStitch && state.selectedStitch.roundId === roundId && state.selectedStitch.idx >= pos) {
      state.selectedStitch.idx++;
    }
  } else {
    window.renderProject();
  }
}

function calcExpectedCount(instruction) {
  if (!instruction) return null;

  // 优先用智能解析器（正确处理括号嵌套）
  try {
    const expanded = expandInstructionFull(instruction);
    if (expanded !== null && expanded.length > 0) return expanded.length;
  } catch {}

  // 回退：剥离前缀后交给旧逻辑（处理 [...]*N 方括号等语法）
  let body = instruction
    .replace(/^第[一二三四五六七八九十百零\d]+[圈行环][:：]?\s*/i, '')
    .replace(/^[Rr]\d+[:：]?\s*/, '');

  if (!body.trim()) return null;

  let total = 0;
  let found = false;

  let remaining = body;

  const groupRe = /(\d+)\s*\([^)]+\)/gi;
  let groupMatch;
  while ((groupMatch = groupRe.exec(body)) !== null) {
    total += parseInt(groupMatch[1], 10);
    found = true;
    remaining = remaining.replace(groupMatch[0], ' ');
  }

  const repeatRes = [
    /\[([^\]]+)\]\s*[*×x]\s*(\d+)/gi,
    /\[([^\]]+)\]\s*(?:重复|钩|织|做|组|遍)\s*(\d+)(?:次|组|遍|个)?/gi,
  ];

  for (const repeatRe of repeatRes) {
    let match;
    while ((match = repeatRe.exec(body)) !== null) {
      const inner = match[1];
      const times = parseInt(match[2], 10);
      const innerCount = countTokens(inner);
      if (innerCount > 0) {
        total += innerCount * times;
        found = true;
      }
      remaining = remaining.replace(match[0], ' ');
    }
  }

  const rest = countTokens(remaining);
  if (rest > 0) { total += rest; found = true; }

  if (!found) {
    const hint = body.match(/(?:共|总计|合计|总)\s*[:：]?\s*(\d+)\s*针/);
    if (hint) return parseInt(hint[1], 10);
  }

  return found ? total : null;
}

function countTokens(text) {
  if (!text) return 0;

  const abbrs = 'BLO|FLO|TV|TA|TW|TM|FV|FA|FW|FM|EV|EA|SL|CH|SK|X|V|A|F|T|E|W|M|G|Q';
  const cnNames = '短针|长针|中长针|长长针|长长长针|加针|减针|枣形针|枣针|引拔针|锁针|辫子针|起立针|空针|跳针|内半针|外半针|爆米花针|狗牙针|短加针|长加针|中长加针';
  const allStitches = `(?:${abbrs}|${cnNames})`;

  let sum = 0;
  let found = false;

  text = text.replace(new RegExp(`(\\d+)(?:个|针)?\\s*${allStitches}`, 'gi'), (m, num) => {
    sum += parseInt(num, 10);
    found = true;
    return ' ';
  });

  text = text.replace(new RegExp(`${allStitches}\\s*(\\d+)(?:针|个)?`, 'gi'), (m, num) => {
    sum += parseInt(num, 10);
    found = true;
    return ' ';
  });

  text = text.replace(new RegExp(allStitches, 'gi'), () => {
    sum += 1;
    found = true;
    return ' ';
  });

  text = text.replace(/(\d+)\s*针/gi, (m, num) => {
    sum += parseInt(num, 10);
    found = true;
    return ' ';
  });

  return found ? sum : 0;
}

export function renderTaskSlide(proj) {
  const part = getActivePart(proj);
  const activeRound = part ? part.rounds.find(r => r.id === part.activeRoundId) : null;
  const instruction = activeRound?.instruction;

  if (!instruction) {
    return `<div class="task-slide" id="task-slide">
      <span class="task-slide-empty">${t('empty_instruction_hint')}</span>
    </div>`;
  }

  const done = activeRound.seq?.length || 0;
  const autoExpected = calcExpectedCount(instruction);
  const expected = activeRound.expectedCount != null ? activeRound.expectedCount : autoExpected;
  const expectedDisplay = expected != null ? expected : '--';
  const hasProgress = expected !== null && expected > 0;

  let progressHtml = '';
  if (hasProgress) {
    const pct = Math.min(done / expected, 1);
    const isOver = done > expected;
    const progressColor = isOver ? '#EF4444' : 'var(--accent)';
    const doneSpan = `<span style="color:${isOver ? '#EF4444' : 'var(--accent)'};font-weight:700">${done}</span>`;
    const expectedSpan = `<span class="exp-count" onclick="editExpectedCount(this)">${expectedDisplay}</span>`;
    const baseText = isOver
      ? t('progress_over').replace('{diff}', done - expected)
      : t('progress_normal');
    const countText = baseText.replace('{done}', doneSpan).replace('{expected}', expectedSpan);

    progressHtml = `
      <div style="margin-top:6px;width:100%">
        <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${(pct*100).toFixed(1)}%;background:${progressColor};border-radius:2px;transition:width .2s ease"></div>
        </div>
        <div style="margin-top:3px;font-size:12px;color:var(--muted);text-align:center">${countText}</div>
      </div>`;
  } else if (done > 0) {
    progressHtml = `<div style="margin-top:4px;font-size:12px;color:var(--muted);text-align:center">${t('progress_no_expected').replace('{done}', `<span style="color:var(--accent);font-weight:700">${done}</span>`)}</div>`;
  }

  return `<div class="task-slide" id="task-slide">
    <div style="width:100%">
      <div class="task-slide-text" id="task-slide-text">${esc(instruction)}</div>
      ${progressHtml}
    </div>
  </div>`;
}

export function editExpectedCount(el) {
  const currentVal = el.textContent === '--' ? '' : el.textContent;
  const input = document.createElement('input');
  input.type = 'number';
  input.value = currentVal;
  input.className = 'exp-count-input';

  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  const activeRound = part?.rounds.find(r => r.id === part.activeRoundId);
  const instruction = activeRound?.instruction;
  const parsedCount = instruction ? calcExpectedCount(instruction) : null;

  const wrapper = document.createElement('span');
  wrapper.className = 'exp-count-edit-wrap';
  wrapper.appendChild(input);

  if (parsedCount != null && parsedCount > 0) {
    const hint = document.createElement('div');
    hint.className = 'exp-count-hint';
    hint.textContent = t('expected_count_hint').replace('{parsed}', parsedCount);
    wrapper.appendChild(hint);
  }

  const save = () => {
    const val = input.value.trim();
    const num = val === '' ? null : parseInt(val, 10);
    if (activeRound) {
      activeRound.expectedCount = (num === null || isNaN(num) || num === 0) ? null : num;
      proj.lastModified = Date.now();
      saveData();
    }
    const slide = document.getElementById('task-slide');
    if (slide) slide.outerHTML = renderTaskSlide(proj);
    if (state.highlightMode) {
      const p = getProj(state.curProjId);
      if (p) renderHighlightReel(p);
    }
  };

  input.onblur = save;
  input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } };

  el.replaceWith(wrapper);
  input.focus();
  input.select();
}

export function renderDynamicPalette(proj) {
  const part = getActivePart(proj);
  if (!part) return '<div class="palette"></div>';

  // ── 智能高亮 ──
  const highlight = state.highlightMode;
  let next = null;
  if (highlight) {
    next = getNextStitchSid(proj);
  }

  let displayIds;
  if (part.customPalette && part.customPalette.length > 0) {
    displayIds = part.customPalette.filter(sid => STITCH_LIB[sid] || getCustomStitchesGlobal()[sid]);
  } else {
    const hasPattern = part.rounds.some(r => r.instruction && r.instruction.trim());
    if (hasPattern) {
      const planned = new Set();
      part.rounds.forEach(r => {
        if (r.instruction) extractStitches(r.instruction).forEach(sid => planned.add(sid));
      });
      displayIds = Array.from(planned);
    } else {
      displayIds = ['CH', 'X', 'V', 'A', 'T', 'F', 'SL'];
    }
  }

  if (state.filterByRound) {
    const activeRound = part.rounds.find(r => r.id === part.activeRoundId);
    const roundStitches = getRoundStitches(activeRound);
    if (roundStitches.length > 0) {
      const roundSet = new Set(roundStitches);
      const filtered = displayIds.filter(sid => roundSet.has(sid));
      if (filtered.length > 0) displayIds = filtered;
    }
  }

  if (!part.customPalette || part.customPalette.length === 0) {
    const customIds = Object.keys(getCustomStitchesGlobal());
    if (customIds.length > 0) {
      displayIds = [...displayIds, ...customIds];
    }
  }

  let html = '';

  // ── 高亮状态栏 ──
  if (highlight && next) {
    if (next.status === 'ok') {
      html += `<div class="palette-status-bar">${t('highlight_status_current').replace('{n}', next.index + 1).replace('{total}', next.total)}</div>`;
    } else if (next.status === 'round_complete') {
      html += `<div class="palette-status-bar palette-status-bar--complete">${t('highlight_status_done')}</div>`;
    } else if (next.status === 'parse_error') {
      html += `<div class="palette-status-bar palette-status-bar--error" onclick="openInstructionEdit('${part.activeRoundId || ''}')">${t('highlight_status_calibrate')}</div>`;
    }
  }

  // ── 针法按钮 ──
  const dimBtn = highlight && next && (next.status === 'ok' || next.status === 'round_complete');
  html += `<div class="palette">`;
  displayIds.forEach((sid, idx) => {
    const info = getStitchInfo(sid);
    if (!info) return;

    let btnClass = 'pal-btn';
    let btnExtra = '';

    if (highlight && next) {
      if (next.status === 'ok') {
        if (sid === next.sid) {
          btnClass += ' palette-btn--highlight';
        } else {
          btnExtra = 'opacity:0.3;pointer-events:none';
        }
      } else if (next.status === 'round_complete') {
        btnExtra = 'opacity:0.3;pointer-events:none';
      }
    }

    html += `<button class="${btnClass}" data-sid="${sid}" style="background:${info.color};${btnExtra}" onclick="pushStitch('${sid}')">
      ${state.voiceMode ? `<span style="font-size:22px;font-weight:900;line-height:1">${idx + 1}</span><br><small style="opacity:.8;font-size:11px">${esc(info.label)}${getShowSymbol() ? `(${sid})` : ''}</small>` : `${esc(info.label)}${getShowSymbol() ? `<br><small style="opacity:.8">${sid}</small>` : ''}`}
    </button>`;
  });

  // 增减按钮：高亮模式下 okl/round_complete 时禁用；沉浸模式下隐藏
  if (!state.immersiveMode) {
    const addBtnExtra = dimBtn ? 'opacity:0.3;pointer-events:none' : '';
    html += `<button class="pal-btn" style="background:var(--bg);color:var(--accent);border:2px dashed var(--accent);font-size:18px;${addBtnExtra}" onclick="openStitchSetup('edit')" title="${t('add_remove_stitches_title')}">
      ＋<br><small style="opacity:.7;font-size:11px">${t('add_remove_stitches')}</small>
    </button>`;
  }
  html += `</div>`;
  return html;
}

export function toggleFilterByRound() {
  state.filterByRound = !state.filterByRound;
  const proj = getProj(state.curProjId);
  if (!proj) return;
  refreshBottomBar(proj);
}

export function renderFilterToggle() {
  const dotBg = state.filterByRound ? 'var(--accent)' : 'var(--border)';
  const dotPos = state.filterByRound ? '18px' : '2px';
  const unit = getUnitLabel();
  return `<div style="display:flex;align-items:center;justify-content:flex-end;padding:2px 4px 6px;gap:6px;cursor:pointer" onclick="toggleFilterByRound()">
    <span style="font-size:10px;color:var(--muted);user-select:none">${t('filter_by_round').replace('{unit}', unit)}</span>
    <span style="display:inline-block;width:34px;height:20px;border-radius:10px;background:${dotBg};position:relative;transition:background .2s;flex-shrink:0">
      <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;left:${dotPos};transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></span>
    </span>
  </div>`;
}

export function renderImmersiveToggle() {
  const active = state.immersiveMode;
  return `<button class="bar-btn" id="immersive-mode-btn" onclick="toggleImmersiveMode()" style="font-size:11px;padding:4px 8px;${active ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : ''}">
    ${active ? t('immersive_exit') : t('immersive_enter')}
  </button>`;
}

export function renderToggleRow() {
  return `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
    ${renderImmersiveToggle()}
    ${renderFilterToggle()}
  </div>`;
}

export function renderBarRow() {
  const unit = getUnitLabel();
  const hint = state.voiceMode
    ? `<div style="text-align:center;font-size:11px;color:#EF4444;padding:2px 0 4px;opacity:.8">${t('voice_hint_bar')}</div>`
    : '';
  return `${hint}<div class="bar-row">
    <button class="bar-btn" onclick="undoStitch()">${t("immersive_undo")}</button>
    <button class="bar-btn" onclick="openPatternPasteSheet()">${t("import_pattern")}</button>
    <button class="bar-btn" id="voice-mode-btn" onclick="toggleVoiceMode()">${t("voice_btn")}</button>
    <button class="bar-btn" id="highlight-mode-btn" onclick="toggleHighlightMode()" style="position:relative">
      ${t('highlight_btn')}
    </button>
    <button class="bar-btn primary" onclick="addRound()">${t('add_round_btn').replace('{unit}', unit)}</button>
  </div>`;
}

export function renderImmersive(proj) {
  const part = getActivePart(proj);
  const unit = getUnitLabel(proj);
  const activeRid = part && part.rounds.length ? (part.rounds.find(r => r.id === part.activeRoundId)?.id || part.rounds[part.rounds.length - 1].id) : null;
  const r = part?.rounds.find(r => r.id === activeRid);
  if (!r) return;

  let html = '';

  /* ① task-slide */
  html += `<div class="sticky-wrap">`;
  html += renderTaskSlide(proj);
  html += `<div id="highlight-reel-container"></div>`;
  html += `</div>`;

  /* ③ 当前活跃圈卡片 */
  html += `<div class="rounds-wrap">`;
  const total = r.seq.length;

  html += `<div class="round-card" id="round-${r.id}">
    <div class="round-hdr" onclick="toggleRound('${r.id}')">
      <div class="round-badge active">${r.isTextCard ? t('note').charAt(0) : (r.roundNum === 0 ? term('cast_on').charAt(0) : r.roundNum)}</div>
      <div class="round-info">
        <div class="round-label">${r.isTextCard ? (r.instruction || t('note')) : (r.roundNum === 0 ? term('cast_on') : t('round_label').replace('{n}', r.roundNum).replace('{unit}', unit))} <span style='font-size:11px;font-weight:var(--weight-semibold);background:var(--accent);color:#fff;border-radius:6px;padding:2px 7px;margin-left:6px'>${term('active')}</span></div>
        <div class="round-count">${t('round_count_label').replace('{total}', total)}</div>
      </div>
      <button class="round-edit-btn" onclick="showToast(t('immersive_edit_blocked'))" title="${t('edit_instruction')}" style="font-size:12px;color:var(--muted);background:none;border:none;cursor:pointer;padding:2px 6px;white-space:nowrap"><span style="font-size:13px;color:var(--muted);letter-spacing:1px;">🪡</span></button>
      <span class="round-chev open">›</span>
    </div>
    <div class="round-body open">
      <div class="seq-wrap">`;
  r.seq.forEach((sid, idx) => {
    html += renderSpillHTML(sid, idx, r, proj);
  });
  if (r.seq.length === 0) {
    html += `<span class="seq-empty">${t('empty_round_hint')}</span>`;
  }
  html += `</div>
    </div>
  </div>`;
  html += `</div>`;

  document.getElementById("screen-content").innerHTML = html;

  /* 底部栏：三个按键 → 针法面板（针法永远在画面最底部） */
  const bar = document.getElementById("bottom-bar");
  if (bar) bar.style.display = "block";
  refreshBottomBar(proj);
  const barH = bar ? bar.offsetHeight : 0;
  if (barH) document.documentElement.style.setProperty('--bottom-bar-h', barH + 'px');
  renderHighlightReel(proj);
}

export function goNextRound() {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;

  const rounds = part.rounds;
  const currentIndex = rounds.findIndex(r => r.id === part.activeRoundId);
  const nextRound = rounds[currentIndex + 1];

  if (nextRound) {
    setActiveRound(proj, nextRound.id);
  } else {
    showToast(t('last_round_immersive_hint'));
  }
}

// ═════════════════════════════════════
//  Copy round structure
// ═════════════════════════════════════

export function copyRoundStructure(sourceRoundId) {
  const proj = getProj(state.curProjId);
  const part = getActivePart(proj);
  if (!part) return;

  const sourceRound = findRound(proj, sourceRoundId);
  if (!sourceRound) return;

  // ── 循环标记：批量复制 loopFrom→loopTo 的所有圈 ──
  if (sourceRound.isLoopMarker && sourceRound.loopFrom && sourceRound.loopTo) {
    const from = sourceRound.loopFrom;
    const to = sourceRound.loopTo;
    const sourceRounds = part.rounds.filter(r =>
      !r.isLoopMarker && !r.isTextCard && r.roundNum != null && r.roundNum >= from && r.roundNum <= to
    );
    if (sourceRounds.length === 0) {
      showToast(t('copy_structure_empty'));
      return;
    }
    const markerIdx = part.rounds.findIndex(r => r.id === sourceRoundId);
    const insertIdx = markerIdx >= 0 ? markerIdx + 1 : part.rounds.length;
    const newIds = [];
    sourceRounds.forEach(sr => {
      const r = { id: uid(), seq: [...sr.seq], instruction: sr.instruction || '', isTextCard: false };
      part.rounds.splice(insertIdx + newIds.length, 0, r);
      newIds.push(r.id);
      state.expandedRounds.add(r.id);
    });
    normalizeRoundNums(part.rounds);
    proj.lastModified = Date.now();
    saveData();
    closeSheet();
    window.renderProject();
    const unit = getUnitLabel(proj);
    showToast(t('copy_loop_structure_done').replace('{from}', from).replace('{to}', to).replace('{count}', sourceRounds.length).replace('{unit}', unit));
    return;
  }

  // ── 普通圈：复制单个 seq ──
  if (sourceRound.seq.length === 0) {
    showToast(t('copy_structure_empty'));
    return;
  }

  const r = { id: uid(), seq: [...sourceRound.seq], instruction: '', isTextCard: false };
  part.rounds.push(r);
  normalizeRoundNums(part.rounds);
  state.expandedRounds.add(r.id);
  proj.lastModified = Date.now();
  saveData();
  setActiveRound(proj, r.id);
  closeSheet();
  window.renderProject();
  setTimeout(() => {
    const el = document.getElementById('round-' + r.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

export function toggleImmersiveMode() {
  state.immersiveMode = !state.immersiveMode;
  const proj = getProj(state.curProjId);
  if (!proj) return;
  const navBar = document.getElementById('nav-bar');
  const html = document.documentElement;
  if (state.immersiveMode) {
    if (navBar) navBar.style.display = 'none';
    html.classList.add('immersive-mode');
    renderImmersive(proj);
  } else {
    if (navBar) navBar.style.display = '';
    html.classList.remove('immersive-mode');
    window.renderProject();
  }
}

// ═════════════════════════════════════
//  智能高亮开关
// ═════════════════════════════════════

export function toggleHighlightMode() {
  state.highlightMode = !state.highlightMode;

  if (state.highlightMode) {
    const proj = getProj(state.curProjId);
    const part = getActivePart(proj);
    const activeRound = part?.rounds.find(r => r.id === part.activeRoundId);
    state.highlightIndex = activeRound?.seq?.length ?? 0;

    const result = getNextStitchSid(proj);
    if (result.status === 'parse_error') {
      showToast(t('highlight_need_calibration'));
      openInstructionEdit(part.activeRoundId);
    }
  } else {
    state.highlightIndex = 0;
  }

  updateHighlightButton();
  const proj = getProj(state.curProjId);
  if (proj) {
    refreshBottomBar(proj);
    renderHighlightReel(proj);
    if (window.matchMedia('(min-width: 768px) and (orientation: landscape)').matches) {
      window._renderSplitLeft(proj);
    }
  }
}

export function updateHighlightButton() {
  const btn = document.getElementById('highlight-mode-btn');
  if (!btn) return;
  if (state.highlightMode) {
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--accent)';
  } else {
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
  }
}

export function updateImmersiveButton() {
  const btn = document.getElementById('immersive-mode-btn');
  if (!btn) return;
  if (state.immersiveMode) {
    btn.style.background = 'var(--accent)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'var(--accent)';
    btn.textContent = t('immersive_exit');
  } else {
    btn.style.background = '';
    btn.style.color = '';
    btn.style.borderColor = '';
    btn.textContent = t('immersive_enter');
  }
}

export function refreshBottomBar(proj) {
  if (!proj) proj = getProj(state.curProjId);
  if (!proj) return;

  const bar = document.getElementById('bottom-bar');
  if (!bar) return;

  if (state.immersiveMode) {
    let bhtml = `<div class="bar-row">
      <button class="bar-btn" onclick="undoStitch()">${t('immersive_undo')}</button>
      <button class="bar-btn primary" onclick="goNextRound()">${t('immersive_next_round')}</button>
      <button class="bar-btn" onclick="toggleImmersiveMode()">${t('immersive_exit_short')}</button>
    </div>`;
    bhtml += renderDynamicPalette(proj);
    bar.innerHTML = bhtml;
    return;
  }

  let bhtml = renderDynamicPalette(proj);
  bhtml += renderToggleRow();
  bhtml += renderBarRow();
  bar.innerHTML = bhtml;
  updateVoiceButton();
  updateHighlightButton();
}

export function openStitchSetup(mode) {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  const part = getActivePart(proj);
  if (!part) return;

  let selected;
  if (state.flowState.setupSelections) {
    selected = new Set();
    Object.entries(state.flowState.setupSelections).forEach(([sid, checked]) => {
      if (checked) selected.add(sid);
    });
    state.flowState.setupSelections = null;
  } else {
    const initial = part.customPalette || [];
    selected = new Set(initial);

    if (initial.length === 0 && mode === 'create') {
      selected.add('CH');
    }

    if (initial.length === 0 && mode === 'edit') {
      const hasPattern = part.rounds.some(r => r.instruction && r.instruction.trim());
      if (hasPattern) {
        part.rounds.forEach(r => {
          if (r.instruction) extractStitches(r.instruction).forEach(sid => selected.add(sid));
        });
      } else {
        Object.keys(STITCH_LIB).forEach(sid => selected.add(sid));
        Object.keys(getCustomStitchesGlobal()).forEach(sid => selected.add(sid));
      }
    }
  }

  const categories = {
    basic: t('category_basic'),
    increase: t('category_increase'),
    decrease: t('category_decrease'),
    special: t('category_special')
  };

  const customByCat = { basic: [], increase: [], decrease: [], special: [] };
  const allCustomStitches2 = getCustomStitchesGlobal();
  Object.values(allCustomStitches2).forEach(cs => {
    const cat = cs.category || 'basic';
    if (customByCat[cat]) customByCat[cat].push(cs);
    else customByCat.basic.push(cs);
  });

  let html = `<div class="sheet-handle"></div>
  <div class="sheet-title">${t('choose_stitches')}</div>
  <div style="font-size:10px;color:var(--muted);text-align:center;padding:0 14px 6px">${t('customize_hint')}</div>
  <div style="max-height:55vh;overflow-y:auto;padding:0 14px">`;

  Object.entries(categories).forEach(([cat, catLabel]) => {
    const presetItems = Object.values(STITCH_LIB).filter(s => s.category === cat);
    const customItems = customByCat[cat] || [];
    const items = [...presetItems, ...customItems];
    if (items.length === 0) return;
    html += `<div class="sheet-section">${catLabel}</div>`;
    html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 0 12px">`;
    items.forEach(s => {
      const isSel = selected.has(s.id);
      const color = getProjColor(s.id);
      const label = resolveLabel(s.id);
      const bg = isSel ? color : 'var(--bg)';
      const col = isSel ? '#fff' : 'var(--text)';
      const border = isSel ? color : 'var(--border)';
      const hasCustom = !!(state.data.settings.globalStitchCustomizations?.names?.[s.id]) || !!(state.data.settings.globalStitchCustomizations?.colors?.[s.id]);
      const isCustomStitch = !!getCustomStitchesGlobal()[s.id];
      const dotMark = (hasCustom || isCustomStitch) ? '<span style="position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;background:#FACC15;display:inline-block"></span>' : '';
      const borderStyle = isCustomStitch ? 'border-style:dashed' : '';
      html += `<button id="setup-btn-${s.id}" class="picker-btn"
        style="position:relative;background:${bg};color:${col};border:2px solid ${border};${borderStyle}font-size:12px;padding:10px 4px"
        onclick="toggleSetupStitch('${s.id}')"
        data-checked="${isSel}"
        data-color="${color}"
      >${dotMark}${esc(label)}<br><small style="display:block;line-height:1.4">${s.id}</small><small style="display:block;color:var(--accent);font-size:10px;cursor:pointer;line-height:1.2" onclick="event.stopPropagation();openStitchCustomize('${s.id}')">${t('customize_btn')}</small></button>`;
    });
    html += `</div>`;
  });

  html += `</div>`;
  html += `<div style="padding:10px 14px 6px;display:flex;gap:8px">
    <button class="bar-btn" style="flex:1" id="select-all-btn" onclick="toggleSelectAllInSetup()">${t('select_all')}</button>
    <button class="bar-btn" style="flex:1;color:var(--accent);border-color:var(--accent)" onclick="startImportFromSetup()">${t('import_pattern')}</button>
  </div>`;
  html += `<div style="padding:2px 14px 6px">
    <button class="bar-btn" style="width:100%;border-style:dashed;color:var(--accent);border-color:var(--accent)" onclick="openNewStitchForm()">${t('new_stitch')}</button>
  </div>`;
  // unknown token hint
  const partRounds = part.rounds;
  const unknownTokens = new Set();
  partRounds.forEach(r => {
    if (r.instruction) {
      const tokens = extractStitches(r.instruction);
      tokens.forEach(sid => {
        if (!STITCH_LIB[sid] && !getCustomStitchesGlobal()[sid]) {
          unknownTokens.add(sid);
        }
      });
    }
  });
  if (unknownTokens.size > 0) {
    const list = [...unknownTokens].join(', ');
    const firstUnknown = [...unknownTokens][0];
    html += `<div style="padding:6px 14px;font-size:11px;color:var(--muted);text-align:center;line-height:1.5">
      发现未知针法：${list} · 已自动归为灰色，可
      <span style="color:var(--accent);cursor:pointer;text-decoration:underline" onclick="openNewStitchForm('${firstUnknown}')">创建自定义针法</span>为其上色
    </div>`;
  }

  html += `<div style="padding:6px 14px 10px;display:flex;gap:8px">
    <button class="bar-btn" style="flex:1" onclick="closeSetupSheet()">${t('cancel')}</button>
    <button class="bar-btn primary" style="flex:2" onclick="saveProjectStitches('${mode}')">${mode === 'create' ? t('start_knitting') : t('update_config')}</button>
  </div>`;

  state.flowState.setupMode = mode;
  showSheet(html);
}

export function toggleSetupStitch(sid) {
  const btn = document.getElementById(`setup-btn-${sid}`);
  if (!btn) return;
  const isChecked = btn.dataset.checked === 'true';
  const newChecked = !isChecked;
  btn.dataset.checked = String(newChecked);
  const color = btn.dataset.color;
  if (newChecked) {
    btn.style.background = color;
    btn.style.color = '#fff';
    btn.style.borderColor = color;
  } else {
    btn.style.background = 'var(--bg)';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
  }
}

export function openStitchCustomize(sid) {
  const proj = getProj(state.curProjId);
  if (!proj) return;

  const selections = {};
  document.querySelectorAll('[id^="setup-btn-"]').forEach(btn => {
    const id = btn.id.replace('setup-btn-', '');
    selections[id] = btn.dataset.checked === 'true';
  });
  state.flowState.setupSelections = selections;
  state.flowState.customizingSid = sid;

  const currentLabel = resolveLabel(sid);
  const currentColor = getProjColor(sid);
  const s = STITCH_LIB[sid];

  let html = `<div class="sheet-handle"></div>
      <div class="sheet-title">${t('customize_btn')} · <span style="font-weight:700">${esc(currentLabel)}</span> <small style="opacity:.5">(${sid})</small></div>
      <div style="padding:12px 16px">
        <div style="margin-bottom:14px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('name_field')}</div>
          <input id="custom-name" value="${esc(currentLabel)}" maxlength="20"
            style="width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;background:var(--bg);color:var(--text);outline:none;font-family:inherit">
        </div>
        <div style="margin-bottom:14px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('color_field')}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <input type="color" id="custom-color" value="${currentColor}"
              style="width:38px;height:38px;border:none;border-radius:8px;cursor:pointer;background:none;padding:0">
            <span style="font-size:12px;color:var(--muted);font-family:monospace" id="color-hex">${currentColor}</span>
            <button class="bar-btn" style="flex:0;padding:6px 10px;font-size:11px" onclick="resetStitchCustomize('${sid}')">${t('reset_default')}</button>
          </div>
        </div>
      </div>
      ${getCustomStitchesGlobal()[sid] ? `
      <div style="padding:0 16px 8px">
        <button class="bar-btn" style="width:100%;color:#E07070;border-color:#E07070" onclick="deleteCustomStitch('${sid}')">${t('delete_custom_stitch')}</button>
      </div>` : ''}
      <div style="padding:10px 16px;display:flex;gap:8px">
        <button class="bar-btn" style="flex:1" onclick="backToSetupGrid()">${t('back_btn')}</button>
        <button class="bar-btn primary" style="flex:2" onclick="saveStitchCustomize('${sid}')">${t('save_btn')}</button>
      </div>`;

  showSheet(html);

  const colorInput = document.getElementById('custom-color');
  const hexDisplay = document.getElementById('color-hex');
  if (colorInput && hexDisplay) {
    colorInput.addEventListener('input', () => { hexDisplay.textContent = colorInput.value; });
  }
}

export function saveStitchCustomize(sid) {
  const proj = getProj(state.curProjId);
  if (!proj) return;

  const nameInput = document.getElementById('custom-name');
  const colorInput = document.getElementById('custom-color');
  const defaultLabel = STITCH_LIB[sid]?.label || sid;

  const g = state.data.settings.globalStitchCustomizations;
  if (!g.names) g.names = {};
  if (!g.colors) g.colors = {};

  if (nameInput && nameInput.value.trim() && nameInput.value.trim() !== defaultLabel) {
    g.names[sid] = nameInput.value.trim();
  } else {
    delete g.names[sid];
  }

  if (colorInput) {
    g.colors[sid] = colorInput.value;
  }

  proj.lastModified = Date.now();
  saveData();
  backToSetupGrid();
}

export function resetStitchCustomize(sid) {
  const g = state.data.settings.globalStitchCustomizations;
  if (g?.names) delete g.names[sid];
  if (g?.colors) delete g.colors[sid];
  saveData();

  openStitchCustomize(sid);
}

export function backToSetupGrid() {
  const mode = state.flowState.setupMode || 'edit';
  state.flowState.customizingSid = null;
  openStitchSetup(mode);
}

export function openNewStitchForm(prefillId) {
  const selections = {};
  document.querySelectorAll('[id^="setup-btn-"]').forEach(btn => {
    const id = btn.id.replace('setup-btn-', '');
    selections[id] = btn.dataset.checked === 'true';
  });
  state.flowState.setupSelections = selections;

  const prefillValue = prefillId || '';

  let html = `<div class="sheet-handle"></div>
      <div class="sheet-title">${t('new_stitch')}</div>
      <div style="padding:12px 16px">
        <div style="margin-bottom:14px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('stitch_id_label')}</div>
          <input id="new-stitch-id" placeholder="${t('stitch_id_placeholder')}" maxlength="10" value="${prefillValue}"
            style="width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;background:var(--bg);color:var(--text);outline:none;font-family:monospace;text-transform:uppercase"
            oninput="this.value=this.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()">
        </div>
        <div style="margin-bottom:14px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('stitch_name_label')}</div>
          <input id="new-stitch-label" placeholder="${t('stitch_name_placeholder')}" maxlength="16"
            style="width:100%;border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:14px;background:var(--bg);color:var(--text);outline:none;font-family:inherit">
        </div>
        <div style="margin-bottom:14px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('color_field')}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="color" id="new-stitch-color" value="#7DD3FC"
              style="width:38px;height:38px;border:none;border-radius:8px;cursor:pointer;background:none;padding:0">
            <span style="font-size:12px;color:var(--muted);font-family:monospace" id="new-color-hex">#7DD3FC</span>
          </div>
        </div>
        <div style="margin-bottom:8px">
          <div style="font-size:12px;color:var(--muted);margin-bottom:4px;font-weight:600">${t('category_field')}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${[{v:'basic',l:t('cat_basic_short')},{v:'increase',l:t('cat_increase_short')},{v:'decrease',l:t('cat_decrease_short')},{v:'special',l:t('cat_special_short')}].map(c =>
              `<label style="font-size:12px;color:var(--text);display:flex;align-items:center;gap:3px;cursor:pointer;padding:4px 8px;border:1px solid var(--border);border-radius:8px">
                <input type="radio" name="new-stitch-cat" value="${c.v}" ${c.v==='basic'?'checked':''}> ${c.l}
              </label>`
            ).join('')}
          </div>
        </div>
      </div>
      <div style="padding:10px 16px;display:flex;gap:8px">
        <button class="bar-btn" style="flex:1" onclick="backToSetupGrid()">${t('back_btn')}</button>
        <button class="bar-btn primary" style="flex:2" onclick="saveNewStitch()">${t('create_btn')}</button>
      </div>`;

  showSheet(html);

  const colorInput = document.getElementById('new-stitch-color');
  const hexDisplay = document.getElementById('new-color-hex');
  if (colorInput && hexDisplay) {
    colorInput.addEventListener('input', () => { hexDisplay.textContent = colorInput.value; });
  }
}

export function saveNewStitch() {
  const proj = getProj(state.curProjId);
  if (!proj) return;

  const idInput = document.getElementById('new-stitch-id');
  const labelInput = document.getElementById('new-stitch-label');
  const colorInput = document.getElementById('new-stitch-color');
  const catRadio = document.querySelector('input[name="new-stitch-cat"]:checked');

  const sid = idInput?.value?.trim().toUpperCase();
  if (!sid) { alert(t('stitch_id_required')); return; }
  if (STITCH_LIB[sid]) { alert(t('stitch_id_conflict')); return; }
  if (state.data.settings.globalCustomStitches?.[sid]) { alert(t('stitch_id_exists')); return; }

  const label = labelInput?.value?.trim() || sid;
  const color = colorInput?.value || '#7DD3FC';
  const category = catRadio?.value || 'basic';

  if (!state.data.settings.globalCustomStitches) state.data.settings.globalCustomStitches = {};
  state.data.settings.globalCustomStitches[sid] = { id: sid, label, color, category };

  proj.lastModified = Date.now();
  saveData();
  rebuildDynamicTokenRE();
  backToSetupGrid();
}

export function deleteCustomStitch(sid) {
  showConfirmDialog(t('delete_custom_stitch_confirm').replace('{name}', resolveLabel(sid)), (ok) => {
    if (!ok) return;

    if (state.data.settings.globalCustomStitches?.[sid]) {
      delete state.data.settings.globalCustomStitches[sid];
    }
    if (state.data.settings.globalStitchCustomizations?.names?.[sid]) {
      delete state.data.settings.globalStitchCustomizations.names[sid];
    }
    if (state.data.settings.globalStitchCustomizations?.colors?.[sid]) {
      delete state.data.settings.globalStitchCustomizations.colors[sid];
    }

    state.data.projects.forEach(p => {
      p.parts.forEach(part => {
        if (part.customPalette) {
          part.customPalette = part.customPalette.filter(id => id !== sid);
        }
      });
    });

    saveData();
    rebuildDynamicTokenRE();
    backToSetupGrid();
  });
}

export function saveProjectStitches(mode) {
  const proj = getProj(state.curProjId);
  if (!proj) return;
  const part = getActivePart(proj);
  if (!part) return;

  const allIds = [...Object.keys(STITCH_LIB), ...Object.keys(getCustomStitchesGlobal())];
  const manualIds = allIds.filter(sid => {
    const btn = document.getElementById(`setup-btn-${sid}`);
    return btn && btn.dataset.checked === 'true';
  });

  const planned = new Set(manualIds);
  part.rounds.forEach(r => {
    if (r.instruction) extractStitches(r.instruction).forEach(sid => planned.add(sid));
  });

  part.customPalette = Array.from(planned);
  proj.lastModified = Date.now();
  saveData();
  if (mode === 'create') state.flowState.newProjectFlow = false;
  state.flowState.setupMode = null;
  closeSheet();

  if (mode === 'create') {
    window.renderProject();
  } else {
    refreshBottomBar(proj);
  }
}

export function closeSetupSheet() {
  const mode = state.flowState.setupMode;
  state.flowState.newProjectFlow = false;
  state.flowState.setupMode = null;
  closeSheet();
  if (mode === 'create') {
    window.renderProject();
  }
}

export function triggerEdgeGlow(sid) {
  const color = sid ? getProjColor(sid) : '#9E8A74';
  const el = document.getElementById('edge-glow');
  if (!el) return;

  el.style.boxShadow = `inset 0 0 0 10px ${color}`;
  el.style.opacity = '1';

  clearTimeout(state.flowState.glowTimer);
  state.flowState.glowTimer = setTimeout(() => {
    el.style.transition = 'opacity 0.35s ease-out';
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.transition = 'opacity 0.08s ease-in';
    }, 400);
  }, 120);
}
