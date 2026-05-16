import { state, getProj, getActivePart } from './state.js';
import { extractStitches, ALIAS_TO_ID, STITCH_LIB, resolveColor } from '../stitches.js';
import { getShowSymbol } from './i18n.js';
import { _getClusterRanges } from './stitch.js';

// ── 针法 token 模式（ALIAS_TO_ID 全部 key，长优先，避免短缩写截断）──
const STITCH_KEYS = Object.keys(ALIAS_TO_ID).sort((a, b) => b.length - a.length);
const STITCH_RE = new RegExp(
  STITCH_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// ═══════════════════════════════════════
//  tokenize — 将图解指令拆成 token 数组
// ═══════════════════════════════════════
function tokenize(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    // 空白 & 分隔符
    if (/[\s,、，·　]/.test(str[i])) { i++; continue; }

    // 跳过 R+数字 前缀（R4: R12-15: 等）
    const rPrefix = str.slice(i).match(/^R\d+/i);
    if (rPrefix) {
      i += rPrefix[0].length;
      const tail = str.slice(i).match(/^[\-~—]\d+/);
      if (tail) i += tail[0].length;
      const sep = str.slice(i).match(/^[:：.]?\s*/);
      if (sep) i += sep[0].length;
      continue;
    }

    // 跳过中文圈前缀：第N圈 / 第N行
    const cnPrefix = str.slice(i).match(/^第\s*\d+\s*(圈|行|round|row)/i);
    if (cnPrefix) {
      i += cnPrefix[0].length;
      const sep = str.slice(i).match(/^[:：.]?\s*/);
      if (sep) i += sep[0].length;
      continue;
    }

    // 跳过 Round N: / Row N:
    const enPrefix = str.slice(i).match(/^(Round|Row)\s*\d+/i);
    if (enPrefix) {
      i += enPrefix[0].length;
      const sep = str.slice(i).match(/^[:：.]?\s*/);
      if (sep) i += sep[0].length;
      continue;
    }

    // 跳过无关字符 * - .
    if (/^[*\-.]/.test(str[i])) { i++; continue; }

    // 跳过汉字数字（避免「第一针」等描述性文字被误识别）
    if (/^[一二三四五六七八九十百千万]/.test(str[i])) { i++; continue; }

    // 数字
    const numMatch = str.slice(i).match(/^\d+/);
    if (numMatch) {
      tokens.push({ type: 'NUMBER', value: parseInt(numMatch[0], 10) });
      i += numMatch[0].length;
      continue;
    }

    // 括号（半角 + 全角）
    if (str[i] === '(' || str[i] === '（') {
      tokens.push({ type: 'LPAREN' });
      i++;
      continue;
    }
    if (str[i] === ')' || str[i] === '）') {
      tokens.push({ type: 'RPAREN' });
      i++;
      continue;
    }

    // 针法缩写（含中文别名）
    const stitchRe = new RegExp('^(?:' + STITCH_RE.source + ')', 'i');
    const stitchMatch = str.slice(i).match(stitchRe);
    if (stitchMatch) {
      tokens.push({ type: 'STITCH', value: stitchMatch[0].toUpperCase() });
      i += stitchMatch[0].length;
      continue;
    }

    // unknown alphabetic token → 原样保留
    const unknownMatch = str.slice(i).match(/^[A-Za-z]+/);
    if (unknownMatch) {
      tokens.push({ type: 'STITCH', value: unknownMatch[0].toUpperCase() });
      i += unknownMatch[0].length;
      continue;
    }

    // 无法识别 → 跳过
    i++;
  }

  return tokens;
}

// ── 针法 ID 标准化 ──
function normalizeStitchId(token) {
  const upper = token.toUpperCase();
  if (ALIAS_TO_ID[upper]) return ALIAS_TO_ID[upper];
  if (STITCH_LIB[upper]) return upper;
  return upper;
}

// ═══════════════════════════════════════
//  parseTokens — 递归下降解析，返回 {sid, count}[] 组
//              外层乘数向内分发（乘性分布）
// ═══════════════════════════════════════

function parseTokens(tokens) {
  const groups = [];
  let i = 0;
  while (i < tokens.length) {
    i = parseOne(tokens, i, groups);
  }
  // 展开为 flat array
  const result = [];
  for (const { sid, count } of groups) {
    for (let n = 0; n < count; n++) result.push(sid);
  }
  return result;
}

function parseOne(tokens, i, groups) {
  if (i >= tokens.length) return i;

  let count = 1;
  if (tokens[i].type === 'NUMBER') {
    const next = (i + 1 < tokens.length) ? tokens[i + 1] : null;
    if (next && (next.type === 'STITCH' || next.type === 'LPAREN')) {
      count = tokens[i].value;
      i++;
    } else {
      i++; // discard orphaned NUMBER (followed by text / punctuation / another NUMBER)
      return i;
    }
  }

  const next = tokens[i];
  if (!next) return i;

  if (next.type === 'LPAREN') {
    i++; // skip LPAREN

    // 检测单 token 复合针法：(5F) 或 (F)
    // 模式：NUMBER? STITCH RPAREN
    const isCompound = (
      (i + 2 < tokens.length &&
       tokens[i].type === 'NUMBER' &&
       tokens[i + 1].type === 'STITCH' &&
       tokens[i + 2].type === 'RPAREN') ||
      (i + 1 < tokens.length &&
       tokens[i].type === 'STITCH' &&
       tokens[i + 1].type === 'RPAREN')
    );

    if (isCompound) {
      let innerCount = 1;
      let stitchToken;
      if (tokens[i].type === 'NUMBER') {
        innerCount = tokens[i].value;
        stitchToken = tokens[i + 1];
        i += 3; // NUMBER, STITCH, RPAREN
      } else {
        stitchToken = tokens[i];
        i += 2; // STITCH, RPAREN
      }
      const sid = normalizeStitchId(stitchToken.value);
      // cluster 拆开为独立针（心流模式逐针推进）
      for (let n = 0; n < innerCount; n++) {
        groups.push({ sid, count });
      }
    } else {
      // 普通括号组（重复组）
      const inner = [];
      while (i < tokens.length && tokens[i].type !== 'RPAREN') {
        i = parseOne(tokens, i, inner);
      }
      i++; // skip RPAREN
      // 外层乘数：将括号内整体作为一组顺序重复 count 次
      for (let n = 0; n < count; n++) {
        for (const g of inner) {
          groups.push({ sid: g.sid, count: g.count });
        }
      }
    }
  } else if (next.type === 'STITCH') {
    const sid = normalizeStitchId(next.value);
    i++;
    if (sid) {
      groups.push({ sid, count });
    }
  } else {
    i++; // skip unexpected
  }

  return i;
}

// ═══════════════════════════════════════
//  expandInstructionFull — 独立解析器（心流模式专用）
// ═══════════════════════════════════════
export function expandInstructionFull(instruction) {
  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) return null;
  try {
    const tokens = tokenize(instruction);
    const result = parseTokens(tokens);
    return result.length > 0 ? result : null;
  } catch (e) {
    return null;
  }
}

// ── 旧版（保留，不再被心流模式使用）──
export function expandInstruction(instruction) {
  if (!instruction || typeof instruction !== 'string') return null;
  try {
    const result = extractStitches(instruction);
    if (!result || result.length === 0) return null;
    return result;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════
//  心流模式：获取下一针的 sid
// ═══════════════════════════════════════
export function getNextStitchSid(proj) {
  const part = getActivePart(proj);
  if (!part) return { status: 'no_instruction' };
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r || !r.instruction) return { status: 'no_instruction' };

  const expanded = expandInstructionFull(r.instruction);
  if (expanded === null) return { status: 'parse_error' };
  if (expanded.length === 0) return { status: 'no_instruction' };

  const idx = state.highlightIndex;
  if (idx >= expanded.length) return { status: 'round_complete' };

  const token = expanded[idx];
  // 所有元素均为单针，index 与 stitchIndex 一致
  const result = { status: 'ok', sid: token, index: idx, total: expanded.length, stitchIndex: idx, stitchTotal: expanded.length };
  return result;
}

// ═══════════════════════════════════════
//  renderHighlightReel — 心流模式序列滚动条
// ═══════════════════════════════════════
export function renderHighlightReel(proj) {
  const container = document.getElementById('highlight-reel-container');
  if (!container) return;

  if (!state.highlightMode) {
    container.innerHTML = '';
    return;
  }

  const part = getActivePart(proj);
  if (!part) { container.innerHTML = ''; return; }
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r || !r.instruction) { container.innerHTML = ''; return; }

  const expanded = expandInstructionFull(r.instruction);
  if (!expanded || expanded.length === 0) { container.innerHTML = ''; return; }

  const idx = state.highlightIndex;
  const settings = state.data?.settings || {};
  const clusterRanges = _getClusterRanges(r.instruction);

  // 增量更新：已渲染且 round 未切换
  const existingReel = container.querySelector('.highlight-reel');
  if (existingReel && existingReel.dataset.roundId === String(r.id)) {
    const tokens = existingReel.querySelectorAll('.reel-token');
    tokens.forEach(el => {
      const start = parseInt(el.dataset.start, 10);
      const len = parseInt(el.dataset.len, 10);
      const end = start + len;
      el.classList.toggle('reel-done', end <= idx);
      el.classList.toggle('reel-current', start <= idx && idx < end);
    });

    // 更新 cluster 内部 mini 颜色
    const minis = existingReel.querySelectorAll('.reel-mini');
    minis.forEach(mini => {
      const globalIdx = parseInt(mini.dataset.idx, 10);
      const isDone = globalIdx < idx;
      const sid = mini.textContent;
      mini.style.color = isDone ? resolveColor(sid, settings) : 'var(--muted)';
    });

    requestAnimationFrame(() => {
      const cur = existingReel.querySelector('.reel-current');
      if (cur) {
        cur.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    return;
  }

  // 首次渲染：生成所有 token
  const items = [];
  let i = 0;
  while (i < expanded.length) {
    const cr = clusterRanges.find(c => c.start === i);
    if (cr) {
      const stitches = expanded.slice(i, i + cr.length);
      const sid = stitches[0];
      const color = resolveColor(sid, settings);
      const isCurrent = i <= idx && idx < i + cr.length;
      const isDone = i + cr.length <= idx;

      let cls = 'reel-token';
      if (isDone) cls += ' reel-done';
      else if (isCurrent) cls += ' reel-current';

      const style = `--reel-color:${color}`;
      const minis = stitches.map((s, j) => {
        const globalIdx = i + j;
        const miniDone = globalIdx < idx;
        const miniColor = miniDone ? resolveColor(s, settings) : 'var(--muted)';
        return `<span class="reel-mini" data-idx="${globalIdx}" style="color:${miniColor}">${s}</span>`;
      }).join('');
      items.push(`<div class="${cls} reel-cluster" style="${style}" data-start="${i}" data-len="${cr.length}">${minis}</div>`);
      i += cr.length;
    } else {
      const sid = expanded[i];
      const lib = STITCH_LIB[sid];
      const label = lib ? lib.label : sid;
      const color = resolveColor(sid, settings);

      let cls = 'reel-token';
      if (i < idx) cls += ' reel-done';
      else if (i === idx) cls += ' reel-current';

      const style = `--reel-color:${color}`;
      const sidDisplay = getShowSymbol() ? ` (${sid})` : '';
      items.push(`<div class="${cls}" style="${style}" title="${label}" data-start="${i}" data-len="1">${label}${sidDisplay}</div>`);
      i++;
    }
  }

  container.innerHTML = `<div class="highlight-reel" data-round-id="${r.id}"><div class="highlight-reel-track">${items.join('')}</div></div>`;

  requestAnimationFrame(() => {
    const reel = container.querySelector('.highlight-reel');
    const cur = reel.querySelector('.reel-current');
    if (cur) {
      cur.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}
