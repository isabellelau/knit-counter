// ═══════════════════════════════════════════
//  State
// ═══════════════════════════════════════════
export let data = {
  projects: [],
  settings: {
    theme: "macaron",
    customColors: {},
    voiceEnabled: false
  }
};
export let curProjId = null;
export let expandedRounds = new Set();
export let selectedStitch = null;
export let pendingInsert = null;
export let dlgCallback = null;
export let confirmCallback = null;
export let filterByRound = true;
export let editingPartId = null;
export let currentTab = 'projects';
export let voiceMode = false;
export let recognition = null;

// Sync editingPartId with window for inline HTML handlers
Object.defineProperty(window, 'editingPartId', {
  get() { return editingPartId; },
  set(v) { editingPartId = v; }
});

// ── UI 流程状态（替代散落的 window._ flag）──
export const flowState = {
  importMode: null,        // null | 'create'
  newProjectFlow: false,   // 新建项目流程是否进行中
  setupMode: null,         // null | 'create' | 'edit'
  setupSelections: null,   // 针法选择器的临时勾选状态 { [sid]: boolean }
  customizingSid: null,    // 当前正在自定义的针法 id
  pendingParsed: null,     // 解析图解的缓冲结果 Array | null
  projMenuId: null,        // 当前展开菜单的项目 id
  captureEdit: null,       // 部件名称编辑状态捕获
  glowTimer: null,         // 语音边缘发光的 timer id
};

// ── 单步撤销（仅用于 deleteRound）──
export let _lastDeletedRound = null;
// 结构：{ round: {...}, partId: string, index: number, activeRoundId: string } | null

export const NUMBER_MAP = {
  '一': 1, '幺': 1, '1': 1, '一号': 1, '一针': 1, '第一': 1,
  '二': 2, '两': 2, '俩': 2, '2': 2, '二号': 2, '二针': 2, '第二': 2,
  '三': 3, '3': 3, '三号': 3, '三针': 3, '第三': 3,
  '四': 4, '4': 4, '四号': 4, '四针': 4, '第四': 4,
  '五': 5, '5': 5, '五号': 5, '五针': 5, '第五': 5,
  '六': 6, '6': 6, '六号': 6, '六针': 6, '第六': 6,
  '七': 7, '7': 7, '七号': 7, '七针': 7, '第七': 7,
  '八': 8, '8': 8, '八号': 8, '八针': 8, '第八': 8,
  '九': 9, '9': 9, '九号': 9, '九针': 9, '第九': 9,
};

// ── helpers ──
export function uid() { return String(Date.now() + Math.random()); }
export function getProj(id) { return data.projects.find(p => String(p.id) === String(id)); }
export function getActivePart(proj) {
  if (!proj || !proj.parts || !proj.parts.length) return null;
  return proj.parts.find(p => p.id === proj.activePartId) || proj.parts[0];
}
export function isPartEmpty(part) {
  if (!part) return true;
  const hasNoRounds = part.rounds.length === 0;
  const hasOnlyEmptyRound = part.rounds.length === 1 &&
    part.rounds[0].seq.length === 0 &&
    !part.rounds[0].instruction &&
    !part.rounds[0].isTextCard;
  return hasNoRounds || hasOnlyEmptyRound;
}
export function getEditingPartId() { return editingPartId; }
