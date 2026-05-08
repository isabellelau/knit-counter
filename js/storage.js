import { state, uid } from './state.js';
import { STITCH_LIB, OLD_ID_MAP } from '../stitches.js';

export function saveData() {
  localStorage.setItem("crochet_v3_fixed", JSON.stringify(state.data));
}

export function loadData() {
  try {
    const d = localStorage.getItem("crochet_v3_fixed") || localStorage.getItem("crochet_v3");
    console.log('[loadData] localStorage key found:', d ? 'yes (' + d.substring(0, 60) + '...)' : 'no');
    if (d) state.data = JSON.parse(d);
  } catch (e) {
    console.error('[loadData] parse error:', e);
  }

  // 保底结构
  if (!state.data || typeof state.data !== "object") {
    console.warn('[loadData] state.data invalid, resetting');
    state.data = {};
  }
  if (!Array.isArray(state.data.projects)) {
    console.warn('[loadData] state.data.projects not array, resetting');
    state.data.projects = [];
  }
  if (!state.data.settings || typeof state.data.settings !== "object") {
    state.data.settings = { theme: "macaron", customColors: {}, voiceEnabled: false };
  }

  // 迁移旧数据
  migrateData(state.data);
  saveData();
  console.log('[loadData] done, projects:', state.data.projects.length);
}

// ── 数据迁移：兼容旧版格式 ──
export function migrateData(d) {
  d.projects.forEach(p => {
    // 补全 customSettings
    if (!p.customSettings) p.customSettings = { names: {}, colors: {}, customStitches: {} };
    if (!p.customSettings.customStitches) p.customSettings.customStitches = {};
    if (p.archived === undefined) p.archived = false;
    if (p.coverImage === undefined) p.coverImage = null;

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

export function exportPDF() {
  window.print();
}

// ── 数据导出/导入 ──
export function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `钩织计数本备份_${new Date().toISOString().slice(0,10)}.json`;
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
