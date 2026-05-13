import { term } from './js/i18n.js';

// ═══════════════════════════════════════════
//  全能针法库（补全别名 aliases 以修复 forEach 报错）
// ═══════════════════════════════════════════
export const STITCH_LIB = {
  // --- 短针类 (Basic & Variants) ---
  X: { id: "X", label: term('X'), abbr: "X", description: "基础短针", category: "basic", aliases: ["X", "SC", "短针"] },
  V: { id: "V", label: term('V'), abbr: "V", description: "1个针目里钩2个短针", category: "increase", aliases: ["V", "INC", "短针加针", "加针"] },
  A: { id: "A", label: term('A'), abbr: "A", description: "2个针目合并为1个短针", category: "decrease", aliases: ["A", "DEC", "短针减针", "减针"] },
  W: { id: "W", label: term('W'), abbr: "W", description: "1个针目里钩3个短针", category: "increase", aliases: ["W", "短针加加针"] },
  M: { id: "M", label: term('M'), abbr: "M", description: "3个针目合并为1个短针", category: "decrease", aliases: ["M", "短针减减针"] },

  // --- 中长针类 (Half Double Crochet) ---
  T: { id: "T", label: term('T'), abbr: "T", description: "基础中长针", category: "basic", aliases: ["T", "HDC", "中长针"] },
  TV: { id: "TV", label: term('TV'), abbr: "TV", description: "1个针目里钩2个中长针", category: "increase", aliases: ["TV", "HDCINC", "中长针加针"] },
  TA: { id: "TA", label: term('TA'), abbr: "TA", description: "2个针目合并为1个中长针", category: "decrease", aliases: ["TA", "HDCDEC", "中长针减针"] },
  TW: { id: "TW", label: term('TW'), abbr: "TW", description: "1个针目里钩3个中长针", category: "increase", aliases: ["TW", "中长针加加针"] },
  TM: { id: "TM", label: term('TM'), abbr: "TM", description: "3个针目合并为1个中长针", category: "decrease", aliases: ["TM", "中长针减减针"] },

  // --- 长针类 (Double Crochet) ---
  F: { id: "F", label: term('F'), abbr: "F", description: "基础长针", category: "basic", aliases: ["F", "DC", "长针"] },
  FV: { id: "FV", label: term('FV'), abbr: "FV", description: "1个针目里钩2个长针", category: "increase", aliases: ["FV", "DCINC", "长针加针"] },
  FA: { id: "FA", label: term('FA'), abbr: "FA", description: "2个针目合并为1个长针", category: "decrease", aliases: ["FA", "DCDEC", "长针减针"] },
  FW: { id: "FW", label: term('FW'), abbr: "FW", description: "1个针目里钩3个长针", category: "increase", aliases: ["FW", "长针加加针"] },
  FM: { id: "FM", label: term('FM'), abbr: "FM", description: "3个针目合并为1个长针", category: "decrease", aliases: ["FM", "长针减减针"] },

  // --- 长长针类 (Treble Crochet) ---
  E: { id: "E", label: term('E'), abbr: "E", description: "基础长长针", category: "basic", aliases: ["E", "TR", "长长针"] },
  EV: { id: "EV", label: term('EV'), abbr: "EV", description: "1个针目里钩2个长长针", category: "increase", aliases: ["EV", "TRINC", "长长针加针"] },
  EA: { id: "EA", label: term('EA'), abbr: "EA", description: "2个针目合并为1个长长针", category: "decrease", aliases: ["EA", "TRDEC", "长长针减针"] },

  // --- 基础功能 (Utility) ---
  CH: { id: "CH", label: term('CH'), abbr: "CH", description: "基础锁针", category: "basic", aliases: ["CH", "锁针", "辫子针"] },
  SL: { id: "SL", label: term('SL'), abbr: "SL", description: "引拔连接", category: "basic", aliases: ["SL", "引拔", "引拔针"] },
  SK: { id: "SK", label: term('SK'), abbr: "SK", description: "跳过不钩", category: "basic", aliases: ["SK", "空针", "SKIP"] },

  // --- 特殊/针目构造 (Specialty) ---
  G: { id: "G", label: term('G'), abbr: "G", description: "5针长针的爆米花", category: "special", aliases: ["G", "爆米花针"] },
  Q: { id: "Q", label: term('Q'), abbr: "Q", description: "3针中长针的未完成针", category: "special", aliases: ["Q", "枣形针", "枣针"] },
};

// 旧系统 id → 新缩写 id（数据迁移专用）
export const OLD_ID_MAP = {
  sc: "X", sc_inc: "V", sc_dec: "A",
  dc: "F", hdc: "T", chain: "CH"
};

// 别名反向查找表：别名（大写）→ 缩写 id
export const ALIAS_TO_ID = {};
Object.entries(STITCH_LIB).forEach(([id, s]) => {
  s.aliases.forEach(a => ALIAS_TO_ID[a.toUpperCase()] = id);
  ALIAS_TO_ID[id.toUpperCase()] = id;
});

// 主题色彩 — morandi 按动作功能配色
export const COLOR_THEMES = {
  morandi: {
    X: "#C4A882", T: "#B8956A", F: "#A6845C", E: "#8E6E4A",
    V: "#F4A460", W: "#E07B3E", TV: "#FFB88C", TW: "#D9703A",
    FV: "#FFCC99", FW: "#CC7740", EV: "#FF9F5C",
    A: "#9B8EC4", M: "#7B6DA8", TA: "#B5ABD8", TM: "#66578D",
    FA: "#C8BFE8", FM: "#8A7DBF", EA: "#A89AD0",
    CH: "#9B8E7E", SL: "#B8A99A", SK: "#D4CBC0",
    G: "#E0705C", Q: "#8B5E7D"
  }
};

// ── 兼容层：现有 UI 仍依赖 STITCHES 数组和 SM 对象 ──
export const STITCHES = Object.values(STITCH_LIB).map(s => ({
  id: s.id,
  label: s.label,
  abbr: s.abbr,
  color: COLOR_THEMES.morandi[s.id] || "#ccc"
}));
export const SM = Object.fromEntries(STITCHES.map(s => [s.id, s]));

// ═══════════════════════════════════════════
//  图解解析引擎（纯函数，无副作用）
// ═══════════════════════════════════════════

const ROUND_PREFIX_RE = /^(?:R|Round|第)?\s*(\d+)\s*[:：.]\s*(.*)/i;

/**
 * 解析批量图解文本
 * @param {string} text - 用户粘贴的多行图解
 * @returns {Array<{type:'round'|'text', roundNum:number|null, instruction:string, seq:string[], raw:string}>}
 */
export function parsePattern(text) {
  const lines = text.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
  const results = [];

  lines.forEach((raw, lineIdx) => {
    // 1) 标准单圈前缀：R1: / Round 1: / 1.
    const match = raw.match(ROUND_PREFIX_RE);
    if (match) {
      const [, numStr, content] = match;
      const seq = extractStitches(content);
      results.push({
        type: "round",
        roundNum: parseInt(numStr, 10),
        instruction: `R${numStr}: ${content}`,
        seq,
        raw
      });
      return;
    }

    // 2) 范围圈前缀：R7-11: / R7~11: / 第7-11圈：
    const rangeMatch = raw.match(/^(?:R|Round|第)?\s*(\d+)\s*[\-~—]\s*(\d+)\s*[:：.]\s*(.*)/i);
    if (rangeMatch) {
      const [, startStr, endStr, content] = rangeMatch;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const seq = extractStitches(content);
      for (let i = start; i <= end; i++) {
        results.push({
          type: "round",
          roundNum: i,
          instruction: `R${start}-${end}: ${content}`,
          seq,
          raw
        });
      }
      return;
    }

    // 3) 起针行：第一行无 R 前缀但包含针法（如"起20CH""环起6X"）
    if (lineIdx === 0) {
      const seq = extractStitches(raw);
      if (seq.length > 0) {
        results.push({
          type: "round",
          roundNum: 0,
          instruction: `${term('cast_on')}: ${raw}`,
          seq,
          raw
        });
        return;
      }
    }

    // 4) 无明显前缀 → 文本卡片保留
    results.push({
      type: "text",
      roundNum: null,
      instruction: raw,
      seq: [],
      raw
    });
  });

  return results;
}

/**
 * 从单条图解文字中提取针法缩写序列
 * @param {string} text
 * @returns {string[]} 归一化后的针法 id 数组
 */
export function extractStitches(text) {
  // 匹配针法 token：支持 1X, X, 2V, CH, SL, TV, FV 等写法
  // 使用精确匹配已知缩写（从长到短排序，避免短前缀截断），避免误匹配 TEST 等无关字母组合
  const tokens = text.match(/\b\d*(?:BLO|FLO|TV|TA|TW|TM|FV|FA|FW|FM|EV|EA|SL|CH|SK|X|V|A|F|T|E|W|M|G|Q)\d*\b/gi) || [];
  const result = [];
  for (const t of tokens) {
    const countMatch = t.match(/^(\d+)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 1;
    const id = normalizeStitch(t);
    if (id) {
      for (let i = 0; i < count; i++) result.push(id);
    }
  }
  return result;
}

/**
 * 将单个 token 归一化为 STITCH_LIB 的 id
 * @param {string} token - 如 "1X", "V", "2CH"
 * @returns {string|null}
 */
export function normalizeStitch(token) {
  // 去掉头尾数字，得到纯字母核心
  const core = token.replace(/^\d+|\d+$/g, "").toUpperCase();
  return ALIAS_TO_ID[core] || null;
}

/**
 * 解析针法颜色
 * @param {string} id - 针法缩写 id
 * @param {object} settings - 全局设置
 * @returns {string} CSS 颜色值
 */
export function resolveColor(id, settings) {
  if (!id) return "#ccc";
  // 全局针法自定义颜色（最高优先级）
  if (settings?.globalStitchCustomizations?.colors?.[id]) return settings.globalStitchCustomizations.colors[id];
  // 旧全局自定义颜色（向后兼容）
  if (settings?.customColors?.[id]) return settings.customColors[id];
  // 全局自定义针法的默认颜色
  if (settings?.globalCustomStitches?.[id]?.color) return settings.globalCustomStitches[id].color;
  // 主题默认色
  const themeKey = settings?.theme || "morandi";
  const theme = COLOR_THEMES[themeKey] || COLOR_THEMES.morandi;
  return theme[id] || "#ccc";
}
