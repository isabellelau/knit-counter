import { state, getProj, getActivePart } from './state.js';
import { extractStitches } from '../stitches.js';

// ═══════════════════════════════════════
//  临时诊断：测试 extractStitches 解析能力
// ═══════════════════════════════════════
export function debugParseTest() {
  const cases = [
    { input: '6X',              expect: [{sid:'X', count:6}] },
    { input: '2V, 4A',          expect: [{sid:'V', count:2}, {sid:'A', count:4}] },
    { input: '10(X,V,X)',       expect: [{sid:'X', count:10}, {sid:'V', count:10}, {sid:'X', count:10}] },
    { input: '3(2X,V)',         expect: [{sid:'X', count:6}, {sid:'V', count:3}] },
    { input: '2(X,3V,A)',       expect: [{sid:'X', count:2}, {sid:'V', count:6}, {sid:'A', count:2}] },
  ];

  const groupBySid = (arr) => {
    const out = [];
    for (const sid of arr) {
      const last = out[out.length - 1];
      if (last && last.sid === sid) { last.count++; }
      else { out.push({ sid, count: 1 }); }
    }
    return out;
  };

  console.group('🔍 extractStitches 诊断');
  cases.forEach(({ input, expect }, i) => {
    const raw = extractStitches(input);
    const grouped = groupBySid(raw);
    const pass = JSON.stringify(grouped) === JSON.stringify(expect);
    console.log(`\n[${i + 1}] "${input}"`);
    console.log(`  期望: ${JSON.stringify(expect)}`);
    console.log(`  实际: ${JSON.stringify(grouped)}  (展开: [${raw.join(',')}])`);
    console.log(`  结果: ${pass ? '✅ 通过' : '❌ 失败'}`);
  });
  console.groupEnd();
}

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

export function getNextStitchSid(proj) {
  const part = getActivePart(proj);
  if (!part) return { status: 'no_instruction' };
  const r = part.rounds.find(x => x.id === part.activeRoundId);
  if (!r || !r.instruction) return { status: 'no_instruction' };

  const expanded = expandInstruction(r.instruction);
  if (expanded === null) return { status: 'parse_error' };
  if (expanded.length === 0) return { status: 'no_instruction' };

  const idx = state.highlightIndex;
  if (idx >= expanded.length) return { status: 'round_complete' };

  return { status: 'ok', sid: expanded[idx], index: idx, total: expanded.length };
}
