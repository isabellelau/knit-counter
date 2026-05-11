/**
 * STORAGE SCHEMA VERSIONING
 * =========================
 * Current version: LATEST_SCHEMA (currently 2)
 *
 * Version history:
 *   v1 — initial versioned schema; added schemaVersion field;
 *         restructured migrateData() to version-gated blocks
 *   v2 — cover images moved out of project JSON into separate
 *         localStorage keys (img_{projId}); proj.coverImage removed
 *
 * Rule: whenever you change the shape of state.data, you MUST:
 *   1. Bump LATEST_SCHEMA by 1
 *   2. Add a new migration block: if (d.schemaVersion < N) { ... }
 *   3. Document the change in the version history above
 *   4. Update AI-FEATURE-MAP.md under "数据层 - 数据迁移逻辑"
 */

import { state, uid } from './state.js';
import { STITCH_LIB, OLD_ID_MAP } from '../stitches.js';
import { showToast } from './ui.js';

const storageAdapter = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch(e) {
      console.warn('storage.get failed:', e);
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch(e) {
      console.warn('storage.set failed:', e);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch(e) {
      console.warn('storage.remove failed:', e);
    }
  }
};

const STORAGE_KEY = 'crochet_v4';
const OLD_KEYS = ['crochet_v3_fixed', 'crochet_v3'];
const LATEST_SCHEMA = 2;

export function saveData() {
  const json = JSON.stringify(state.data);
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      showToast('⚠️ 存储空间不足，请删除部分封面图片');
    }
  }
}

export function loadData() {
  let d = null;
  let sourceKey = null;

  // 优先读新 key
  const rawNew = storageAdapter.get(STORAGE_KEY);
  if (rawNew) {
    try {
      d = JSON.parse(rawNew);
      sourceKey = STORAGE_KEY;
    } catch (e) { /* ignore */ }
  }

  // 回退到旧 key（一次性迁移）
  if (!d) {
    const candidates = [
      { key: 'crochet_v3_fixed', check: (v) => v && v.projects && v.projects.length > 0 },
      { key: 'crochet_v3', check: (v) => v && v.projects && v.projects.length > 0 }
    ];

    for (const { key, check } of candidates) {
      try {
        const raw = storageAdapter.get(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (check(parsed)) {
            d = parsed;
            sourceKey = key;
            break;
          }
        }
      } catch (e) { /* ignore */ }
    }

    if (!d) {
      for (const key of OLD_KEYS) {
        try {
          const raw = storageAdapter.get(key);
          if (raw) {
            d = JSON.parse(raw);
            sourceKey = key;
            break;
          }
        } catch (e) { /* ignore */ }
      }
    }
  }

  if (d) {
    Object.keys(state.data).forEach(k => delete state.data[k]);
    Object.assign(state.data, d);
  }
  // 保底结构
  if (!state.data || typeof state.data !== "object") {
    console.warn('[loadData] state.data invalid, resetting');
    Object.keys(state.data).forEach(k => delete state.data[k]);
  }
  if (!Array.isArray(state.data.projects)) {
    console.warn('[loadData] state.data.projects not array, resetting');
    state.data.projects = [];
  }
  if (!state.data.settings || typeof state.data.settings !== "object") {
    state.data.settings = { theme: "morandi", customColors: {}, voiceEnabled: false };
  }

  // 迁移旧数据
  migrateData(state.data);
  saveData();

  // 清理旧 key（一次性，迁移后删除）
  if (sourceKey && sourceKey !== STORAGE_KEY) {
    OLD_KEYS.forEach(k => storageAdapter.remove(k));
  }
}

// ── 数据迁移：版本门控 ──

export function migrateData(d) {
  if (!d.schemaVersion || d.schemaVersion < 1) {
    d.projects.forEach(p => {
      // 补全 customSettings
      if (!p.customSettings) p.customSettings = { names: {}, colors: {}, customStitches: {} };
      if (!p.customSettings.customStitches) p.customSettings.customStitches = {};
      if (p.archived === undefined) p.archived = false;

      // 旧版 → 新版：将顶层 rounds 封装为 parts
      if (!p.parts && p.rounds) {
        const partId = uid();
        p.parts = [{
          id: partId,
          title: '主图解',
          rawPattern: '',
          rounds: p.rounds || [],
          activeRoundId: p.activeRoundId || (p.rounds?.length ? p.rounds[p.rounds.length - 1].id : null),
          customPalette: p.customPalette || null
        }];
        p.activePartId = partId;
        delete p.rounds;
        delete p.activeRoundId;
        delete p.customPalette;
      }

      // 保底：确保 parts 数组存在
      if (!p.parts || !Array.isArray(p.parts)) {
        const partId = uid();
        p.parts = [{ id: partId, title: '主图解', rawPattern: '', rounds: [], activeRoundId: null, customPalette: null }];
        p.activePartId = partId;
      }

      // 保底 activePartId
      if (!p.activePartId || !p.parts.find(pt => pt.id === p.activePartId)) {
        p.activePartId = p.parts[0]?.id || null;
      }

      // 迁移每个 part 内的 rounds
      p.parts.forEach(part => {
        if (!part.rounds) part.rounds = [];
        if (part.customPalette === undefined) part.customPalette = null;
        if (!part.rawPattern && part.rawPattern !== '') part.rawPattern = '';
        if (!part.title) part.title = '未命名';

        part.rounds.forEach(r => {
          if (!r.instruction && r.instruction !== "") r.instruction = "";
          if (r.isTextCard === undefined) r.isTextCard = false;
          if (Array.isArray(r.seq)) {
            r.seq = r.seq.map(sid => OLD_ID_MAP[sid] || sid)
              .filter(sid => STITCH_LIB[sid]);
          }
        });

        // 保底 activeRoundId
        if (!part.activeRoundId && part.rounds.length) {
          part.activeRoundId = part.rounds[part.rounds.length - 1].id;
        }
      });
    });
  }

  // if (d.schemaVersion < 3) { ...未来迁移... }

  // v1 → v2: 将 coverImage 从项目对象迁移到独立 localStorage key
  if (d.schemaVersion < 2) {
    d.projects.forEach(p => {
      if (p.coverImage) {
        try { localStorage.setItem('img_' + p.id, p.coverImage); } catch(e) { /* ignore */ }
      }
      delete p.coverImage;
    });
  }

  d.schemaVersion = LATEST_SCHEMA;
}

export function exportPDF() {
  window.print();
}

// ── 数据导出/导入 ──
export function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `织影备份_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSingleProject(id) {
  const proj = state.data.projects.find(p => String(p.id) === String(id));
  if (!proj) return;

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    project: proj
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `${proj.name}_${date}.knt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const guide = document.getElementById('backup-guide');
  if (guide) {
    guide.style.display = 'block';
    guide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
