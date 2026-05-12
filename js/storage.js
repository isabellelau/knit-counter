/**
 * STORAGE SCHEMA VERSIONING
 * =========================
 * Current version: LATEST_SCHEMA (currently 4)
 *
 * Version history:
 *   v1 — initial versioned schema; added schemaVersion field;
 *         restructured migrateData() to version-gated blocks
 *   v2 — cover images moved out of project JSON into separate
 *         localStorage keys (img_{projId}); proj.coverImage removed
 *   v3 — 新增 state.data.settings.highlightEnabled（智能高亮常驻开关，默认 false）
 *   v4 — 新增 project.lastModified（时间戳，为 CloudKit 同步冲突解决预留）
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

// ═══════════════════════════════════════
//  IndexedDB 适配层
// ═══════════════════════════════════════

const DB_NAME = 'knit_db';
const DB_VERSION = 1;

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

const storageAdapter = {
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

const STORAGE_KEY = 'crochet_v4';
const OLD_KEYS = ['crochet_v3_fixed', 'crochet_v3'];
const LATEST_SCHEMA = 4;

// ═══════════════════════════════════════
//  一次性迁移：localStorage → IndexedDB
// ═══════════════════════════════════════

async function migrateFromLocalStorage() {
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
        const db = await openDB();
        await new Promise((resolve, reject) => {
          const tx = db.transaction('covers', 'readwrite');
          const req = tx.objectStore('covers').put(blob, projId);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        localStorage.removeItem(key);
      } catch (e) { console.warn('migrateFromLocalStorage cover failed:', key, e); }
    }
  }

  // 清理旧 key
  for (const key of OLD_KEYS) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════
//  save / load
// ═══════════════════════════════════════

export async function saveData() {
  try {
    await storageAdapter.set(STORAGE_KEY, state.data);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showToast('存储空间不足，请删除部分封面图片');
    }
  }
  checkStorageQuota();
}

// ═══════════════════════════════════════
//  存储用量检测（使用超过 80% 时提示）
// ═══════════════════════════════════════

export async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    const ratio = usage / quota;
    if (ratio >= 0.8) {
      const usedMB = (usage / 1024 / 1024).toFixed(1);
      const quotaMB = (quota / 1024 / 1024).toFixed(0);
      showToast(
        `存储空间已用 ${usedMB}MB / ${quotaMB}MB · 建议导出备份后清理旧项目`,
        null,
        6000
      );
    }
  } catch {
    // 静默失败，不影响主流程
  }
}

export async function loadData() {
  let d = null;

  // 优先读 IndexedDB
  try {
    d = await storageAdapter.get(STORAGE_KEY);
  } catch (e) { /* ignore */ }

  // 回退到 localStorage 旧 key
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
      } catch (e) { /* ignore */ }
    }

    if (!d) {
      for (const key of OLD_KEYS) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) { d = JSON.parse(raw); break; }
        } catch (e) { /* ignore */ }
      }
    }

    // 迁移到 IndexedDB 后清理
    if (d) {
      for (const key of OLD_KEYS) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
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

  // 1) 先跑 schema 迁移（v1→v2 可能把 coverImage 写入 localStorage img_*）
  migrateData(state.data);

  // 2) 再跑 localStorage → IndexedDB 迁移（一次补齐封面）
  await migrateFromLocalStorage();

  // 3) 落盘
  await saveData();
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

  // v3 → v4: 补全 lastModified 时间戳
  if (d.schemaVersion < 4) {
    d.projects.forEach(p => {
      if (!p.lastModified) {
        p.lastModified = Date.now();
      }
    });
  }

  // v2 → v3: 补全 highlightEnabled 字段
  if (d.schemaVersion < 3) {
    if (!d.settings) d.settings = {};
    if (d.settings.highlightEnabled === undefined) {
      d.settings.highlightEnabled = false;
    }
  }

  // v1 → v2: 将 coverImage 从项目对象迁移到 localStorage key
  //          → migrateFromLocalStorage() 再迁到 IndexedDB covers store
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
  const json = JSON.stringify(state.data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
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
