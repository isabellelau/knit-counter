import { strict as assert } from 'node:assert';

const { parsePattern, normalizeStitch, ALIAS_TO_ID, OLD_ID_MAP }
  = await import('../stitches.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('✓ ' + name);
  } catch (e) {
    failed++;
    const msg = e.code === 'ERR_ASSERTION'
      ? `expected ${JSON.stringify(e.expected)} got ${JSON.stringify(e.actual)}`
      : e.message;
    console.log('✗ ' + name + ': ' + msg);
  }
}

function eq(actual, expected) {
  assert.deepStrictEqual(actual, expected);
}

// ═══════════════════════════════════════════
//  normalizeStitch
// ═══════════════════════════════════════════

test('normalizeStitch: "短针" → "X"', () => {
  eq(normalizeStitch('短针'), 'X');
});

test('normalizeStitch: "sc" → "X"', () => {
  eq(normalizeStitch('sc'), 'X');
});

test('normalizeStitch: "dc" → "F"', () => {
  eq(normalizeStitch('dc'), 'F');
});

test('normalizeStitch: "长针" → "F"', () => {
  eq(normalizeStitch('长针'), 'F');
});

test('normalizeStitch: unknown input returns null', () => {
  eq(normalizeStitch('zzz'), null);
});

test('normalizeStitch: numeric prefix stripped ("6X" → "X")', () => {
  eq(normalizeStitch('6X'), 'X');
});

test('normalizeStitch: "HDC" → "T"', () => {
  eq(normalizeStitch('HDC'), 'T');
});

test('normalizeStitch: "chain" (old ID, not in aliases) → null', () => {
  eq(normalizeStitch('chain'), null);
});

// ═══════════════════════════════════════════
//  parsePattern
// ═══════════════════════════════════════════

test('parsePattern: "R1: 6X" → 1 round, seq ["X"] (does not expand counts)', () => {
  const r = parsePattern('R1: 6X');
  eq(r.length, 1);
  eq(r[0].type, 'round');
  eq(r[0].roundNum, 1);
  eq(r[0].seq, ['X']);
});

test('parsePattern: "R2: 3(X,V)" → 1 round, seq ["X","V"] (parentheses ignored, no expansion)', () => {
  const r = parsePattern('R2: 3(X,V)');
  eq(r.length, 1);
  eq(r[0].roundNum, 2);
  eq(r[0].seq, ['X', 'V']);
});

test('parsePattern: "R3: 30X" → 1 round, seq ["X"]', () => {
  const r = parsePattern('R3: 30X');
  eq(r.length, 1);
  eq(r[0].roundNum, 3);
  eq(r[0].seq, ['X']);
});

test('parsePattern: empty string → []', () => {
  const r = parsePattern('');
  eq(r, []);
});

test('parsePattern: whitespace-only string → []', () => {
  const r = parsePattern('   \n  \n  ');
  eq(r, []);
});

test('parsePattern: malformed "hello" → 1 text card, no crash', () => {
  const r = parsePattern('hello');
  eq(r.length, 1);
  eq(r[0].type, 'text');
  eq(r[0].instruction, 'hello');
  eq(r[0].seq, []);
  eq(r[0].roundNum, null);
});

test('parsePattern: chinese 第 prefix ("第1: 6X") — "圈" not in separator set', () => {
  const r = parsePattern('第1: 6X');
  eq(r.length, 1);
  eq(r[0].roundNum, 1);
  eq(r[0].seq, ['X']);
});

test('parsePattern: range prefix ("R5-7: 10X") → 3 rounds', () => {
  const r = parsePattern('R5-7: 10X');
  eq(r.length, 3);
  eq(r[0].roundNum, 5);
  eq(r[1].roundNum, 6);
  eq(r[2].roundNum, 7);
  r.forEach(item => eq(item.seq, ['X']));
});

test('parsePattern: first line without prefix is treated as 起针 (round 0)', () => {
  const r = parsePattern('环起6X');
  eq(r.length, 1);
  eq(r[0].type, 'round');
  eq(r[0].roundNum, 0);
  eq(r[0].seq, ['X']);
});

test('parsePattern: multi-line mixed input', () => {
  const r = parsePattern('R1: 6X\nR2: 6V\n备注：完成后断线');
  eq(r.length, 3);
  eq(r[0].type, 'round');
  eq(r[0].roundNum, 1);
  eq(r[0].seq, ['X']);
  eq(r[1].type, 'round');
  eq(r[1].roundNum, 2);
  eq(r[1].seq, ['V']);
  eq(r[2].type, 'text');
  eq(r[2].instruction, '备注：完成后断线');
  eq(r[2].seq, []);
});

test('parsePattern: roundNum in instruction field', () => {
  const r = parsePattern('R1: 6X');
  eq(r[0].instruction, 'R1: 6X');
});

test('parsePattern: raw field preserved', () => {
  const r = parsePattern('R1: 6X');
  eq(r[0].raw, 'R1: 6X');
});

// ═══════════════════════════════════════════
//  ALIAS_TO_ID
// ═══════════════════════════════════════════

test('ALIAS_TO_ID: "短针" → "X"', () => {
  eq(ALIAS_TO_ID['短针'], 'X');
});

test('ALIAS_TO_ID: "DC" → "F"', () => {
  eq(ALIAS_TO_ID['DC'], 'F');
});

test('ALIAS_TO_ID: "锁针" → "CH"', () => {
  eq(ALIAS_TO_ID['锁针'], 'CH');
});

test('ALIAS_TO_ID: "TR" → "E"', () => {
  eq(ALIAS_TO_ID['TR'], 'E');
});

test('ALIAS_TO_ID: "引拔针" → "SL"', () => {
  eq(ALIAS_TO_ID['引拔针'], 'SL');
});

test('ALIAS_TO_ID: self-mapping "CH" → "CH"', () => {
  eq(ALIAS_TO_ID['CH'], 'CH');
});

// ═══════════════════════════════════════════
//  OLD_ID_MAP
// ═══════════════════════════════════════════

test('OLD_ID_MAP: sc → X', () => {
  eq(OLD_ID_MAP.sc, 'X');
});

test('OLD_ID_MAP: dc → F', () => {
  eq(OLD_ID_MAP.dc, 'F');
});

test('OLD_ID_MAP: chain → CH', () => {
  eq(OLD_ID_MAP.chain, 'CH');
});

test('OLD_ID_MAP: sc_inc → V', () => {
  eq(OLD_ID_MAP.sc_inc, 'V');
});

test('OLD_ID_MAP: hdc → T', () => {
  eq(OLD_ID_MAP.hdc, 'T');
});

// ═══════════════════════════════════════════
//  Summary
// ═══════════════════════════════════════════

const total = passed + failed;
console.log('\n' + passed + '/' + total + ' tests passed');
if (failed > 0) process.exit(1);
