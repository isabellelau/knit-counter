/**
 * STORAGE SCHEMA VERSIONING
 * =========================
 * Current version: LATEST_SCHEMA (currently 16)
 *
 * Version history:
 *   v1 — initial versioned schema; added schemaVersion field;
 *         restructured migrateData() to version-gated blocks
 *   v2 — cover images moved out of project JSON into separate
 *         localStorage keys (img_{projId}); proj.coverImage removed
 *   v3 — 新增 state.data.settings.highlightEnabled
 *   v4 — 新增 project.lastModified
 *   v5 — 新增 state.data.settings.globalCustomStitches
 *   v6 — 新增 state.data.settings.profile
 *   v7 — 针法库全面全局化
 *   v8 — 新增 project.refImages
 *   v9 — 新增 project.focusSessions + project.dailyCount
 *   v10 — 新增 project.markers
 *   v11 — 新增 part.lastPosition
 *   v12 — 新增 round.clusterRanges
 *   v13 — clusterRanges → seq 内 cluster token
 *   v14 — cluster token 展开为独立针
 *   v15 — 新增语音设置字段
 *   v16 — 新增心流语音联动开关 voiceFlowSync
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
import { t } from './i18n.js';
// 运行时检测 Capacitor 环境，避免静态 buildTarget 在浏览器打开 App 版时误判

const STORAGE_KEY = 'crochet_v4';
const OLD_KEYS = ['crochet_v3_fixed', 'crochet_v3'];
const LATEST_SCHEMA = 16;

// ═══════════════════════════════════════════
//  Adapter routing
// ═══════════════════════════════════════════

let _adapter = null;

async function getAdapter() {
  if (_adapter) return _adapter;
  const isNative = window.Capacitor?.isNativePlatform() ?? false;
  window.__dbg && window.__dbg('isNative: ' + isNative);
  if (isNative) {
    _adapter = await import('./adapters/storage-cap.js');
  } else {
    _adapter = await import('./adapters/storage-idb.js');
  }
  return _adapter;
}

// ═══════════════════════════════════════════
//  Re-exports proxied to adapter
// ═══════════════════════════════════════════

export async function openDB() {
  const a = await getAdapter();
  return a.openDB();
}

export const storageAdapter = {
  async get(key) {
    const a = await getAdapter();
    return a.storageAdapter.get(key);
  },
  async set(key, value) {
    const a = await getAdapter();
    return a.storageAdapter.set(key, value);
  },
  async remove(key) {
    const a = await getAdapter();
    return a.storageAdapter.remove(key);
  }
};

// ═══════════════════════════════════════════
//  save / load
// ═══════════════════════════════════════════

export async function saveData() {
  try {
    const a = await getAdapter();
    await a.save(state.data);
  } catch (e) {
    if (e?.name === 'QuotaExceededError') {
      showToast('存储空间不足，请导出备份后清理数据');
    } else {
      console.error('[saveData] unexpected error:', e);
      showToast('保存失败，请检查设备存储状态');
    }
  }
  checkStorageQuota();
}

// ═══════════════════════════════════════════
//  存储用量检测（使用超过 80% 时提示）
// ═══════════════════════════════════════════

export async function checkStorageQuota() {
  if (!navigator.storage?.estimate) return;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    const ratio = usage / quota;
    if (ratio >= 0.8) {
      const usedMB = (usage / 1024 / 1024).toFixed(1);
      const quotaMB = (quota / 1024 / 1024).toFixed(0);
      showToast(
        t('storage_usage').replace('{used}', usedMB).replace('{quota}', quotaMB),
        null,
        6000
      );
    }
  } catch {
    // 静默失败，不影响主流程
  }
}

export async function loadData() {
  window.__dbg && window.__dbg('loadData called');
  const a = await getAdapter();
  if (window.Capacitor?.isNativePlatform()) {
    window.__dbg && window.__dbg('cap load start');
  }
  const d = await a.load();

  if (d) {
    // 上界检查：拒绝来自更新版本的数据
    if (d.schemaVersion > LATEST_SCHEMA) {
      showToast('该备份来自更新版本的织影，请先升级应用');
      return;
    }
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
    state.data.settings = { theme: "morandi", customColors: {}, globalCustomStitches: {}, voiceEnabled: false };
  }

  // 紧急备份恢复：崩溃前未落盘的数据
  const emergencyBackup = localStorage.getItem('knit_emergency_backup');
  if (emergencyBackup) {
    try {
      const backup = JSON.parse(emergencyBackup);
      if (backup.projects?.length > (state.data.projects?.length || 0)) {
        showToast('检测到未保存的数据，已自动恢复');
        Object.keys(state.data).forEach(k => delete state.data[k]);
        Object.assign(state.data, backup);
      }
    } catch { /* ignore */ }
    localStorage.removeItem('knit_emergency_backup');
  }

  // 1) 先跑 schema 迁移
  const result = migrateData(state.data);
  if (result !== state.data) {
    showToast('数据升级失败，已恢复至上次版本，建议导出备份', null, 6000);
  }

  // 2) 再跑 localStorage → IndexedDB 迁移（仅 Web 环境有实际逻辑）
  if (a.migrateFromLocalStorage) {
    await a.migrateFromLocalStorage();
  }

  // 3) 落盘
  await saveData();
}

// ═══════════════════════════════════════════
//  migrateData — 版本门控数据迁移
// ═══════════════════════════════════════════

export function migrateData(d) {
  d.schemaVersion = parseInt(d.schemaVersion, 10) || 0;
  try {
    if (!d.schemaVersion || d.schemaVersion < 1) {
    d.projects.forEach(p => {
      if (!p.customSettings) p.customSettings = { names: {}, colors: {}, customStitches: {} };
      if (!p.customSettings.customStitches) p.customSettings.customStitches = {};
      if (p.archived === undefined) p.archived = false;

      if (!p.parts && p.rounds) {
        const partId = uid();
        p.parts = [{
          id: partId,
          title: t('default_part_title'),
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

      if (!p.parts || !Array.isArray(p.parts)) {
        const partId = uid();
        p.parts = [{ id: partId, title: t('default_part_title'), rawPattern: '', rounds: [], activeRoundId: null, customPalette: null }];
        p.activePartId = partId;
      }

      if (!p.activePartId || !p.parts.find(pt => pt.id === p.activePartId)) {
        p.activePartId = p.parts[0]?.id || null;
      }

      p.parts.forEach(part => {
        if (!part.rounds) part.rounds = [];
        if (part.customPalette === undefined) part.customPalette = null;
        if (!part.rawPattern && part.rawPattern !== '') part.rawPattern = '';
        if (!part.title) part.title = t('unnamed');

        part.rounds.forEach(r => {
          if (!r.instruction && r.instruction !== "") r.instruction = "";
          if (r.isTextCard === undefined) r.isTextCard = false;
          if (Array.isArray(r.seq)) {
            r.seq = r.seq.map(sid => OLD_ID_MAP[sid] || sid)
              .filter(sid => STITCH_LIB[sid]);
          }
        });

        if (!part.activeRoundId && part.rounds.length) {
          part.activeRoundId = part.rounds[part.rounds.length - 1].id;
        }
      });
    });
  }

  if (d.schemaVersion < 4) {
    d.projects.forEach(p => {
      if (!p.lastModified) {
        p.lastModified = Date.now();
      }
    });
  }

  if (d.schemaVersion < 3) {
    if (!d.settings) d.settings = {};
    if (d.settings.highlightEnabled === undefined) {
      d.settings.highlightEnabled = false;
    }
  }

  if (d.schemaVersion < 2) {
    d.projects.forEach(p => {
      if (p.coverImage) {
        localStorage.setItem('img_' + p.id, p.coverImage);
        const verified = localStorage.getItem('img_' + p.id);
        if (!verified) throw new Error('v1→v2 coverImage write failed for ' + p.id);
      }
      delete p.coverImage;
    });
  }

  if (d.schemaVersion < 5) {
    if (!d.settings) d.settings = {};
    if (!d.settings.globalCustomStitches) {
      d.settings.globalCustomStitches = {};
    }
  }

  if (d.schemaVersion < 6) {
    if (!d.settings) d.settings = {};
    if (!d.settings.profile) {
      d.settings.profile = { name: '' };
    }
  }

  if (d.schemaVersion < 7) {
    if (!d.settings) d.settings = {};
    if (!d.settings.globalCustomStitches) d.settings.globalCustomStitches = {};
    if (!d.settings.globalStitchCustomizations) d.settings.globalStitchCustomizations = { names: {}, colors: {} };
    if (!d.settings.customColors) d.settings.customColors = {};

    const globalCustom = d.settings.globalCustomStitches;
    const globalNames = d.settings.globalStitchCustomizations.names;
    const globalColors = d.settings.globalStitchCustomizations.colors;

    Object.keys(d.settings.customColors).forEach(sid => {
      if (!globalColors[sid]) {
        globalColors[sid] = d.settings.customColors[sid];
      }
    });

    d.projects.forEach(p => {
      if (!p.customSettings) return;
      if (p.customSettings.customStitches) {
        Object.keys(p.customSettings.customStitches).forEach(sid => {
          if (!globalCustom[sid]) {
            globalCustom[sid] = { ...p.customSettings.customStitches[sid] };
          }
        });
      }
      if (p.customSettings.names) {
        Object.keys(p.customSettings.names).forEach(sid => {
          if (!globalNames[sid]) {
            globalNames[sid] = p.customSettings.names[sid];
          }
        });
      }
      if (p.customSettings.colors) {
        Object.keys(p.customSettings.colors).forEach(sid => {
          if (!globalColors[sid]) {
            globalColors[sid] = p.customSettings.colors[sid];
          }
        });
      }
      delete p.customSettings.customStitches;
      delete p.customSettings.names;
      delete p.customSettings.colors;
    });
  }

  if (d.schemaVersion < 8) {
    d.projects.forEach(p => {
      if (!Array.isArray(p.refImages)) p.refImages = [];
    });
  }

  if (d.schemaVersion < 9) {
    d.projects.forEach(p => {
      if (!Array.isArray(p.focusSessions)) p.focusSessions = [];
      if (!p.dailyCount || typeof p.dailyCount !== 'object') p.dailyCount = {};
    });
  }

  if (d.schemaVersion < 10) {
    d.projects.forEach(p => {
      if (!Array.isArray(p.markers)) p.markers = [];
    });
  }

  if (d.schemaVersion < 11) {
    d.projects.forEach(p => {
      (p.parts || []).forEach(part => {
        if (!part.lastPosition) part.lastPosition = null;
      });
    });
  }

  if (d.schemaVersion < 12) {
    d.projects.forEach(p => {
      (p.parts || []).forEach(part => {
        (part.rounds || []).forEach(r => {
          if (!Array.isArray(r.clusterRanges)) r.clusterRanges = [];
        });
      });
    });
  }

  if (d.schemaVersion < 13) {
    d.projects.forEach(p => {
      (p.parts || []).forEach(part => {
        (part.rounds || []).forEach(r => {
          if (Array.isArray(r.clusterRanges) && r.clusterRanges.length > 0 && Array.isArray(r.seq)) {
            const newSeq = [];
            let seqIdx = 0;
            const sortedRanges = [...r.clusterRanges].sort((a, b) => a.start - b.start);
            while (seqIdx < r.seq.length) {
              const cr = sortedRanges.find(c => c.start === seqIdx);
              if (cr) {
                newSeq.push({
                  type: 'cluster',
                  stitches: r.seq.slice(cr.start, cr.start + cr.length),
                  raw: cr.raw || `(${cr.length}${r.seq[cr.start]})`
                });
                seqIdx += cr.length;
              } else {
                newSeq.push(r.seq[seqIdx]);
                seqIdx++;
              }
            }
            r.seq = newSeq;
          }
          delete r.clusterRanges;
        });
      });
    });
  }

  if (d.schemaVersion < 14) {
    d.projects.forEach(p => {
      (p.parts || []).forEach(part => {
        (part.rounds || []).forEach(r => {
          if (Array.isArray(r.seq)) {
            const newSeq = [];
            for (const token of r.seq) {
              if (token && typeof token === 'object' && token.type === 'cluster') {
                for (const innerSid of token.stitches) {
                  newSeq.push(innerSid);
                }
              } else {
                newSeq.push(token);
              }
            }
            r.seq = newSeq;
          }
        });
      });
    });
  }

  if (d.schemaVersion < 15) {
    if (!d.settings) d.settings = {};
    d.settings.voiceSpeakFeedback = d.settings.voiceSpeakFeedback ?? true;
    d.settings.voiceWaitTimeout = d.settings.voiceWaitTimeout ?? 5000;
    d.settings.voiceRepeatDefault = d.settings.voiceRepeatDefault ?? 'ask';
  }

  if (d.schemaVersion < 16) {
    if (!d.settings) d.settings = {};
    d.settings.voiceFlowSync = d.settings.voiceFlowSync ?? false;
  }

  d.schemaVersion = LATEST_SCHEMA;
  } catch (err) {
    console.error('[Migration] snapshot or migration failed at schemaVersion', d.schemaVersion, err);
    return d;
  }
  return d;
}

// ═══════════════════════════════════════════
//  Export helpers
// ═══════════════════════════════════════════

export function exportPDF() {
  if (window.Capacitor?.isNativePlatform()) {
    showToast(t('export_pdf_app'), null, 5000);
    return;
  }
  if (/iPhone|iPad/.test(navigator.userAgent)) {
    showToast(t('export_pdf_ios'), null, 5000);
    return;
  }
  window.print();
}

export function exportData() {
  const json = JSON.stringify(state.data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = t('export_filename').replace(/[/\\:*?"<>|]/g, '_');
  a.download = safeName.replace('{date}', new Date().toISOString().slice(0, 10));
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
  const safeName = proj.name.replace(/[/\\:*?"<>|]/g, '_');
  a.download = `${safeName}_${date}.knt`;
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
