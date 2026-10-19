/**
 * Real Moriarty Sherlock (`moriarty-sherlock-draft/1` & `sherlock-k-a/1`) Language Engine
 *
 * Provides:
 * 1. Full in-browser lexer, parser, monomorphic typechecker (`draft_typecheck.rs`),
 *    `ProgramImage` builder (`program_image.rs`), 39-rule `sherlock-k-a/1` `ImageMachine`
 *    (`image_reference.rs`), L4 `MachineImage` usage encoder (`machine_image.rs`),
 *    `aux/1` scan probes (`layout_a/auxiliary.rs`), `aux/2` 16-byte UInt128 limb & fuel
 *    witnesses (`arithmetic_witness.rs`), and `ReferenceSlice` (1/2/4/8) folding (`reference_slice.rs`).
 * 2. Live bridge to the compiled native Rust `sherlock-runner` binary via `/api/trace`.
 */

import { annotateTraceWithFunctionalDeltas } from './functionalStructures.js';

export const DRAFT_LANGUAGE = 'moriarty-sherlock-draft/1';
const MAX_UINT128 = (1n << 128n) - 1n;

export const PRESET_PROGRAMS = [
  {
    id: 'factorial',
    title: 'Factorial(4)',
    category: 'Recursion // UInt128',
    badge: 'SH-FACT',
    defaultFuel: 200,
    defaultStackLimit: 16,
    description: 'Recursive factorial descending the continuation well with Left/Right/Return/Scope frames and Aux/2 limb multiplication.',
    source: `language "moriarty-sherlock-draft/1";

program Factorial {
  fn fact(n: UInt): UInt {
    if n == 0 {
      1
    } else {
      n * fact(n - 1)
    }
  }

  entry fact(4);
}`,
  },
  {
    id: 'list_fold',
    title: 'List Pattern Fold',
    category: 'ADT // Cons & Nil',
    badge: 'SH-LIST',
    defaultFuel: 120,
    defaultStackLimit: 16,
    description: 'Constructs a 3-element cons spine [5, 8, 3] and folds it via structural match arms (nil | cons(head, tail)).',
    source: `language "moriarty-sherlock-draft/1";

program ListFold {
  fn sum_list(xs: List): UInt {
    match xs {
      nil => 0,
      cons(h, t) => h + sum_list(t)
    }
  }

  entry sum_list(cons(5, cons(8, cons(3, nil))));
}`,
  },
  {
    id: 'tree_fold',
    title: 'Binary Tree Fold',
    category: 'ADT // Branch & Leaf',
    badge: 'SH-TREE',
    defaultFuel: 140,
    defaultStackLimit: 16,
    description: 'Constructs a 3D binary tree branch(leaf(7), branch(leaf(4), leaf(9))) and recursively folds left and right subtrees.',
    source: `language "moriarty-sherlock-draft/1";

program TreeFold {
  fn sum_tree(t: Tree): UInt {
    match t {
      leaf(x) => x,
      branch(l, r) => sum_tree(l) + sum_tree(r)
    }
  }

  entry sum_tree(branch(leaf(7), branch(leaf(4), leaf(9))));
}`,
  },
  {
    id: 'mutual_even_odd',
    title: 'Mutual Recursion (Even/Odd)',
    category: 'Control // Bool & Call',
    badge: 'SH-BOOL',
    defaultFuel: 120,
    defaultStackLimit: 16,
    description: 'Alternates between is_even(n) and is_odd(n) across lexical scopes, exercising Aux/1 FindScan and Bool prisms.',
    source: `language "moriarty-sherlock-draft/1";

program ParityCheck {
  fn is_even(n: UInt): Bool {
    if n == 0 {
      true
    } else {
      is_odd(n - 1)
    }
  }

  fn is_odd(n: UInt): Bool {
    if n == 0 {
      false
    } else {
      is_even(n - 1)
    }
  }

  entry is_even(4);
}`,
  },
  {
    id: 'lexical_let',
    title: 'Lexical Let & Wide Mul',
    category: 'EnvRoot // Aux/2 Mul',
    badge: 'SH-LET',
    defaultFuel: 120,
    defaultStackLimit: 16,
    description: 'Nested let-bindings with lexical shadowing and multi-byte UInt128 multiplication across the 32-diagonal Aux/2 matrix.',
    source: `language "moriarty-sherlock-draft/1";

program LexicalCube {
  fn cube_plus(x: UInt, offset: UInt): UInt {
    let sq = x * x in
    let cb = sq * x in
    cb + offset
  }

  entry let seed = 12 in cube_plus(seed, 272);
}`,
  },
  {
    id: 'checked_underflow',
    title: 'Checked Underflow (Err 10)',
    category: 'Fault // Rule A225',
    badge: 'SH-ERR10',
    defaultFuel: 120,
    defaultStackLimit: 16,
    description: 'Triggers deterministic UInt128 subtraction underflow (3 - 9), lighting Aux/2 borrow bo[16]=1 and publishing Rejected(10).',
    source: `language "moriarty-sherlock-draft/1";

program CheckedUnderflow {
  fn clamp_sub(a: UInt, b: UInt): UInt {
    a - b
  }

  entry clamp_sub(3, 9);
}`,
  },
  {
    id: 'stack_overflow',
    title: 'Stack Horizon Trap (Err 4)',
    category: 'Fault // Rule A140',
    badge: 'SH-ERR04',
    defaultFuel: 120,
    defaultStackLimit: 5,
    description: 'Attempts deep recursion against a tight stack_limit=5 horizon, triggering Rule 140 Frame limit -> Error(4).',
    source: `language "moriarty-sherlock-draft/1";

program StackTrap {
  fn dive(n: UInt): UInt {
    if n == 0 {
      0
    } else {
      1 + dive(n - 1)
    }
  }

  entry dive(6);
}`,
  },
  {
    id: 'fuel_exhaustion',
    title: 'Fuel Exhaustion (Rule 84)',
    category: 'Budget // Rule A084',
    badge: 'SH-FUEL0',
    defaultFuel: 14,
    defaultStackLimit: 16,
    description: 'Runs with a constrained 14-step fuel budget until FuelWitness zeroProbe zp[16]=1 triggers free publication Rule 84: Exhausted.',
    source: `language "moriarty-sherlock-draft/1";

program FuelBound {
  fn count_down(n: UInt): UInt {
    if n == 0 {
      100
    } else {
      count_down(n - 1)
    }
  }

  entry count_down(5);
}`,
  },
];

const RESERVED_WORDS = new Set([
  'language', 'program', 'fn', 'entry', 'if', 'else', 'let', 'in', 'match',
  'UInt', 'Bool', 'List', 'Tree', 'nil', 'cons', 'leaf', 'branch', 'not',
]);

export const RULE_NAMES = {
  80: 'Done (Free Publication)',
  82: 'Rejected (Free Publication)',
  84: 'Exhausted (Free Publication)',
  102: 'Literal',
  108: 'Var found',
  111: 'Var missing -> error(3)',
  114: 'Let',
  117: 'Binary left',
  120: 'Unary',
  123: 'If',
  126: 'Match',
  129: 'Call()',
  131: 'Call(args)',
  135: 'Push frame',
  140: 'Frame limit -> error(4)',
  145: 'Bind let',
  149: 'Right operand',
  153: 'Binary primitive',
  157: 'Unary primitive',
  161: 'If true',
  165: 'If false',
  169: 'If non-bool -> error(5)',
  173: 'Start cases',
  177: 'Next arg',
  181: 'Finish args',
  185: 'Return type ok',
  190: 'Return type mismatch -> error(6)',
  195: 'Restore scope',
  200: 'Lookup fn',
  202: 'Missing fn -> error(7)',
  204: 'Bind params',
  206: 'Bind arity/type -> error(8)',
  208: 'Schedule body',
  212: 'No match -> error(9)',
  214: 'Try pattern',
  217: 'Pattern miss',
  220: 'Match arm body',
  223: 'Primitive ok',
  225: 'Primitive error(10/11)',
};

function uint128ToLeBytes(val) {
  let n = BigInt(val) & MAX_UINT128;
  const bytes = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return bytes;
}

const ZERO_16 = Object.freeze(new Array(16).fill(0));
const ZERO_17 = Object.freeze(new Array(17).fill(0));
const ZERO_32 = Object.freeze(new Array(32).fill(0));
const INACTIVE_ARITHMETIC_WITNESS = Object.freeze({
  active: false,
  op: 'none',
  lhs: '0',
  rhs: '0',
  result: '0',
  overflow: false,
  lhsBytes: ZERO_16,
  rhsBytes: ZERO_16,
  resultBytes: ZERO_16,
  carries: ZERO_17,
  borrows: ZERO_17,
  diagonals: ZERO_32,
});

export function materializeArithmeticWitness(op, lhsBig, rhsBig) {
  const active = Boolean(op && lhsBig != null && rhsBig != null);
  if (!active) return INACTIVE_ARITHMETIC_WITNESS;
  const out = {
    active: true,
    op: op || 'none',
    lhs: String(lhsBig),
    rhs: String(rhsBig),
    result: '0',
    overflow: false,
    lhsBytes: uint128ToLeBytes(lhsBig),
    rhsBytes: uint128ToLeBytes(rhsBig),
    resultBytes: new Array(16).fill(0),
    carries: new Array(17).fill(0),
    borrows: new Array(17).fill(0),
    diagonals: new Array(32).fill(0),
  };

  const a = out.lhsBytes;
  const b = out.rhsBytes;

  if (op === '+') {
    for (let i = 0; i < 16; i++) {
      const total = a[i] + b[i] + out.carries[i];
      out.resultBytes[i] = total % 256;
      out.carries[i + 1] = total >= 256 ? 1 : 0;
    }
    out.overflow = out.carries[16] === 1;
    const sum = BigInt(lhsBig) + BigInt(rhsBig);
    out.result = out.overflow ? 'overflow(err 10)' : String(sum);
  } else if (op === '-' || op === '<' || op === '==') {
    for (let i = 0; i < 16; i++) {
      const subtrahend = b[i] + out.borrows[i];
      out.borrows[i + 1] = a[i] < subtrahend ? 1 : 0;
      out.resultBytes[i] = a[i] + 256 * out.borrows[i + 1] - subtrahend;
    }
    if (op === '-') {
      out.overflow = out.borrows[16] === 1;
      out.result = out.overflow ? 'overflow(err 10)' : String(BigInt(lhsBig) - BigInt(rhsBig));
    } else if (op === '<') {
      out.result = String(out.borrows[16] === 1);
    } else {
      out.result = String(BigInt(lhsBig) === BigInt(rhsBig));
    }
  } else if (op === '*') {
    const mulC = new Array(33).fill(0);
    const highBytes = new Array(16).fill(0);
    for (let k = 0; k < 32; k++) {
      let total = mulC[k];
      for (let i = 0; i < 16; i++) {
        if (k >= i && k - i < 16) {
          total += a[i] * b[k - i];
        }
      }
      const digit = total % 256;
      if (k < 16) {
        out.resultBytes[k] = digit;
      } else {
        highBytes[k - 16] = digit;
      }
      out.diagonals[k] = digit;
      mulC[k + 1] = Math.floor(total / 256);
    }
    for (let i = 0; i < 17; i++) out.carries[i] = mulC[i];
    const hSum = highBytes.reduce((acc, x) => acc + x, 0);
    out.overflow = hSum !== 0;
    out.result = out.overflow ? 'overflow(err 10)' : String(BigInt(lhsBig) * BigInt(rhsBig));
  }
  return out;
}

export function materializeFuelWitness(enEvt, isTerm, preFuel) {
  const preBytes = uint128ToLeBytes(preFuel);
  const z = new Array(16).fill(0);
  const zp = new Array(17).fill(0);
  const bw = new Array(17).fill(0);
  const postBytes = [...preBytes];

  zp[0] = enEvt ? 1 : 0;
  for (let i = 0; i < 16; i++) {
    z[i] = enEvt && preBytes[i] === 0 ? 1 : 0;
    zp[i + 1] = zp[i] && z[i] ? 1 : 0;
  }
  const charged = enEvt && !isTerm && zp[16] === 0;
  bw[0] = charged ? 1 : 0;
  for (let i = 0; i < 16; i++) {
    bw[i + 1] = bw[i] && z[i] ? 1 : 0;
    postBytes[i] = preBytes[i] + 256 * bw[i + 1] - bw[i];
  }
  const afterFuel = charged ? Math.max(0, Number(preFuel) - 1) : Number(preFuel);
  return {
    before: Number(preFuel),
    after: afterFuel,
    beforeBytes: preBytes,
    afterBytes: postBytes,
    zeroProbe: zp,
    borrows: bw,
  };
}

export function lexDraftSource(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    const start = i;
    if (ch === '"') {
      i++;
      while (i < source.length && source[i] !== '"') {
        if (source[i] === '\\' && i + 1 < source.length) i += 2;
        else i++;
      }
      if (i >= source.length) throw new Error('Unterminated string literal');
      i++;
      tokens.push({ kind: 'String', start, end: i, text: source.slice(start, i) });
      continue;
    }
    if (/[0-9]/.test(ch)) {
      while (i < source.length && /[0-9_]/.test(source[i])) i++;
      tokens.push({ kind: 'Number', start, end: i, text: source.slice(start, i) });
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) i++;
      const text = source.slice(start, i);
      const kind = text === 'true' ? 'KwTrue' : text === 'false' ? 'KwFalse' : 'Ident';
      tokens.push({ kind, start, end: i, text });
      continue;
    }
    i++;
    const punctMap = {
      ';': 'Semicolon', '{': 'LBrace', '}': 'RBrace', '(': 'LParen', ')': 'RParen',
      ':': 'Colon', ',': 'Comma', '=': 'Eq', '<': 'Lt', '>': 'Gt',
      '+': 'Plus', '-': 'Minus', '*': 'Star',
    };
    const kind = punctMap[ch];
    if (!kind) throw new Error(`Unexpected character '${ch}' at byte ${start}`);
    tokens.push({ kind, start, end: i, text: ch });
  }
  tokens.push({ kind: 'Eof', start: source.length, end: source.length, text: '' });
  return tokens;
}

function lineNumberAt(source, byteOffset) {
  let line = 1;
  const limit = Math.min(byteOffset, source.length);
  for (let i = 0; i < limit; i++) {
    if (source[i] === '\n') line++;
  }
  return line;
}

export function parseAndCheckDraft(source) {
  const tokens = lexDraftSource(source);
  let cursor = 0;
  let lastEnd = 0;

  const peek = (ahead = 0) => tokens[Math.min(cursor + ahead, tokens.length - 1)];
  const isWord = (tok) => tok.kind === 'Ident' || tok.kind === 'KwTrue' || tok.kind === 'KwFalse';
  const word = (w) => isWord(peek(0)) && peek(0).text === w;
  const bump = () => {
    const t = peek(0);
    lastEnd = t.end;
    if (t.kind !== 'Eof') cursor++;
    return t;
  };
  const fail = (expected) => {
    const t = peek(0);
    const line = lineNumberAt(source, t.start);
    throw new Error(`Syntax error on line ${line}: expected ${expected}, found '${t.text || 'EOF'}'`);
  };
  const expect = (kind, label) => {
    if (peek(0).kind !== kind) fail(label);
    return bump();
  };
  const expectWord = (w) => {
    if (!word(w)) fail(`'${w}'`);
    return bump();
  };
  const parseName = () => {
    const t = peek(0);
    if (t.kind !== 'Ident' || RESERVED_WORDS.has(t.text)) fail('identifier');
    bump();
    return { name: t.text, span: { start: t.start, end: t.end } };
  };
  const parseType = () => {
    const t = peek(0);
    if (!['UInt', 'Bool', 'List', 'Tree'].includes(t.text)) {
      fail('type (UInt, Bool, List, or Tree)');
    }
    bump();
    return t.text;
  };

  function parseBlock() {
    expect('LBrace', '{');
    const expr = parseExpression(0);
    expect('RBrace', '}');
    return expr;
  }

  function currentBinary() {
    const t0 = peek(0);
    const t1 = peek(1);
    if (t0.kind === 'Eq' && t1.kind === 'Eq') return { op: '==', prec: 1, width: 2 };
    if (t0.kind === 'Lt') return { op: '<', prec: 1, width: 1 };
    if (t0.kind === 'Plus') return { op: '+', prec: 2, width: 1 };
    if (t0.kind === 'Minus') return { op: '-', prec: 2, width: 1 };
    if (t0.kind === 'Star') return { op: '*', prec: 3, width: 1 };
    return null;
  }

  function parseExpression(minPrec = 0) {
    let left = parseAtom();
    while (true) {
      const bin = currentBinary();
      if (!bin || bin.prec < minPrec) break;
      for (let i = 0; i < bin.width; i++) bump();
      const right = parseExpression(bin.prec + 1);
      left = {
        kind: 'Binary',
        op: bin.op,
        left,
        right,
        children: [left, right],
        span: { start: left.span.start, end: right.span.end },
      };
    }
    return left;
  }

  function parseArguments() {
    expect('LParen', '(');
    const args = [];
    if (peek(0).kind !== 'RParen') {
      while (true) {
        args.push(parseExpression(0));
        if (peek(0).kind !== 'Comma') break;
        bump();
      }
    }
    expect('RParen', ')');
    return args;
  }

  function parsePattern() {
    const start = peek(0).start;
    if (word('nil')) {
      bump();
      return { kind: 'Nil', binders: [], span: { start, end: lastEnd } };
    }
    if (word('cons') || word('leaf') || word('branch')) {
      const ctor = bump().text;
      expect('LParen', '(');
      const first = parseName();
      const binders = [first.name];
      if (ctor !== 'leaf') {
        expect('Comma', ',');
        binders.push(parseName().name);
      }
      expect('RParen', ')');
      return {
        kind: ctor === 'leaf' ? 'Leaf' : ctor === 'cons' ? 'Cons' : 'Branch',
        binders,
        span: { start, end: lastEnd },
      };
    }
    const v = parseName();
    return { kind: 'Var', binders: [v.name], span: v.span };
  }

  function parseAtom() {
    const start = peek(0).start;
    if (word('let')) {
      bump();
      const binder = parseName();
      expect('Eq', '=');
      const value = parseExpression(0);
      expectWord('in');
      const body = parseExpression(0);
      return {
        kind: 'Let',
        name: binder.name,
        value,
        body,
        children: [value, body],
        span: { start, end: body.span.end },
      };
    }
    if (word('if')) {
      bump();
      const condition = parseExpression(0);
      const yes = parseBlock();
      expectWord('else');
      const no = parseBlock();
      return {
        kind: 'If',
        condition,
        yes,
        no,
        children: [condition, yes, no],
        span: { start, end: lastEnd },
      };
    }
    if (word('match')) {
      bump();
      const scrutinee = parseExpression(0);
      expect('LBrace', '{');
      const arms = [];
      const children = [scrutinee];
      while (true) {
        const pattern = parsePattern();
        expect('Eq', '=>');
        expect('Gt', '=>');
        const body = parseExpression(0);
        arms.push({ pattern, body });
        children.push(body);
        if (peek(0).kind !== 'Comma') break;
        bump();
      }
      expect('RBrace', '}');
      return {
        kind: 'Match',
        scrutinee,
        arms,
        children,
        span: { start, end: lastEnd },
      };
    }
    if (peek(0).kind === 'LParen') {
      bump();
      const inner = parseExpression(0);
      expect('RParen', ')');
      inner.span = { start, end: lastEnd };
      return inner;
    }
    if (peek(0).kind === 'Number') {
      const t = bump();
      const raw = t.text.replace(/_/g, '');
      const big = BigInt(raw);
      if (big < 0n || big > MAX_UINT128) {
        throw new Error(`UInt128 literal out of range: ${t.text}`);
      }
      return {
        kind: 'Literal',
        litValue: { kind: 'UInt', value: big },
        children: [],
        span: { start: t.start, end: t.end },
      };
    }
    if (peek(0).kind === 'KwTrue' || peek(0).kind === 'KwFalse') {
      const t = bump();
      return {
        kind: 'Literal',
        litValue: { kind: 'Bool', value: t.kind === 'KwTrue' },
        children: [],
        span: { start, end: lastEnd },
      };
    }
    if (word('nil')) {
      bump();
      return {
        kind: 'Literal',
        litValue: { kind: 'List', elements: [] },
        children: [],
        span: { start, end: lastEnd },
      };
    }
    if (word('cons') || word('leaf') || word('branch') || word('not')) {
      const ctor = bump().text;
      const args = parseArguments();
      if (ctor === 'leaf' && args.length === 1) {
        return { kind: 'Unary', op: 'leaf', operand: args[0], children: args, span: { start, end: lastEnd } };
      }
      if (ctor === 'not' && args.length === 1) {
        return { kind: 'Unary', op: 'not', operand: args[0], children: args, span: { start, end: lastEnd } };
      }
      if ((ctor === 'cons' || ctor === 'branch') && args.length === 2) {
        return {
          kind: 'Binary',
          op: ctor,
          left: args[0],
          right: args[1],
          children: args,
          span: { start, end: lastEnd },
        };
      }
      fail(`valid arity for constructor '${ctor}'`);
    }
    const ident = parseName();
    if (peek(0).kind === 'LParen') {
      const args = parseArguments();
      return {
        kind: 'Call',
        name: ident.name,
        args,
        children: args,
        span: { start, end: lastEnd },
      };
    }
    return {
      kind: 'Var',
      name: ident.name,
      children: [],
      span: ident.span,
    };
  }

  expectWord('language');
  const langTok = expect('String', 'language string');
  const langStr = langTok.text.slice(1, -1);
  if (langStr !== DRAFT_LANGUAGE) {
    throw new Error(`Unsupported language '${langStr}', expected "${DRAFT_LANGUAGE}"`);
  }
  expect('Semicolon', ';');
  expectWord('program');
  const progName = parseName().name;
  expect('LBrace', '{');
  const functions = [];
  while (word('fn')) {
    bump();
    const fnName = parseName().name;
    expect('LParen', '(');
    const params = [];
    const seenParams = new Set();
    if (peek(0).kind !== 'RParen') {
      while (true) {
        const pName = parseName().name;
        if (seenParams.has(pName)) {
          throw new Error(`Type error: duplicate parameter '${pName}' in fn ${fnName}`);
        }
        seenParams.add(pName);
        expect('Colon', ':');
        const pType = parseType();
        params.push({ name: pName, type: pType });
        if (peek(0).kind !== 'Comma') break;
        bump();
      }
    }
    expect('RParen', ')');
    expect('Colon', ':');
    const returnType = parseType();
    const body = parseBlock();
    functions.push({ id: functions.length, name: fnName, params, returnType, body });
  }
  expectWord('entry');
  const entry = parseExpression(0);
  expect('Semicolon', ';');
  expect('RBrace', '}');
  expect('Eof', 'end of program');

  // Monomorphic type check (draft_typecheck.rs)
  const fnSigs = new Map();
  for (const fn of functions) {
    if (!fnSigs.has(fn.name)) fnSigs.set(fn.name, fn);
  }

  function inferType(node, env) {
    switch (node.kind) {
      case 'Literal':
        return node.litValue.kind;
      case 'Var': {
        const t = env.get(node.name);
        if (!t) throw new Error(`Typecheck error: unknown variable '${node.name}'`);
        return t;
      }
      case 'Let': {
        const vt = inferType(node.value, env);
        const nextEnv = new Map(env);
        nextEnv.set(node.name, vt);
        return inferType(node.body, nextEnv);
      }
      case 'Unary': {
        const ot = inferType(node.operand, env);
        if (node.op === 'leaf') {
          if (ot !== 'UInt') throw new Error(`Typecheck error: leaf() expects UInt, got ${ot}`);
          return 'Tree';
        }
        if (node.op === 'not') {
          if (ot !== 'Bool') throw new Error(`Typecheck error: not() expects Bool, got ${ot}`);
          return 'Bool';
        }
        throw new Error(`Unknown unary op ${node.op}`);
      }
      case 'Binary': {
        const lt = inferType(node.left, env);
        const rt = inferType(node.right, env);
        if (['+', '-', '*'].includes(node.op)) {
          if (lt !== 'UInt' || rt !== 'UInt') {
            throw new Error(`Typecheck error: '${node.op}' expects (UInt, UInt), got (${lt}, ${rt})`);
          }
          return 'UInt';
        }
        if (node.op === '<') {
          if (lt !== 'UInt' || rt !== 'UInt') {
            throw new Error(`Typecheck error: '<' expects (UInt, UInt), got (${lt}, ${rt})`);
          }
          return 'Bool';
        }
        if (node.op === '==') {
          if (lt !== rt) throw new Error(`Typecheck error: '==' requires identical types, got ${lt} and ${rt}`);
          return 'Bool';
        }
        if (node.op === 'cons') {
          if (lt !== 'UInt' || rt !== 'List') {
            throw new Error(`Typecheck error: cons() expects (UInt, List), got (${lt}, ${rt})`);
          }
          return 'List';
        }
        if (node.op === 'branch') {
          if (lt !== 'Tree' || rt !== 'Tree') {
            throw new Error(`Typecheck error: branch() expects (Tree, Tree), got (${lt}, ${rt})`);
          }
          return 'Tree';
        }
        throw new Error(`Unknown binary op ${node.op}`);
      }
      case 'If': {
        const ct = inferType(node.condition, env);
        if (ct !== 'Bool') throw new Error(`Typecheck error: if condition must be Bool, got ${ct}`);
        const yt = inferType(node.yes, env);
        const nt = inferType(node.no, env);
        if (yt !== nt) throw new Error(`Typecheck error: if branches disagree (${yt} vs ${nt})`);
        return yt;
      }
      case 'Call': {
        const sig = fnSigs.get(node.name);
        if (!sig) throw new Error(`Typecheck error: unknown function '${node.name}'`);
        if (node.args.length !== sig.params.length) {
          throw new Error(`Typecheck error: ${node.name} expects ${sig.params.length} args, got ${node.args.length}`);
        }
        for (let i = 0; i < node.args.length; i++) {
          const at = inferType(node.args[i], env);
          if (at !== sig.params[i].type) {
            throw new Error(`Typecheck error: arg ${i + 1} of ${node.name} expects ${sig.params[i].type}, got ${at}`);
          }
        }
        return sig.returnType;
      }
      case 'Match': {
        const st = inferType(node.scrutinee, env);
        let expectedArmType = null;
        for (const arm of node.arms) {
          const armEnv = new Map(env);
          const p = arm.pattern;
          if (p.kind === 'Nil') {
            if (st !== 'List') throw new Error(`Pattern 'nil' requires List scrutinee, got ${st}`);
          } else if (p.kind === 'Cons') {
            if (st !== 'List') throw new Error(`Pattern 'cons' requires List scrutinee, got ${st}`);
            if (p.binders[0] === p.binders[1]) throw new Error(`Duplicate pattern binder '${p.binders[0]}'`);
            armEnv.set(p.binders[0], 'UInt');
            armEnv.set(p.binders[1], 'List');
          } else if (p.kind === 'Leaf') {
            if (st !== 'Tree') throw new Error(`Pattern 'leaf' requires Tree scrutinee, got ${st}`);
            armEnv.set(p.binders[0], 'UInt');
          } else if (p.kind === 'Branch') {
            if (st !== 'Tree') throw new Error(`Pattern 'branch' requires Tree scrutinee, got ${st}`);
            if (p.binders[0] === p.binders[1]) throw new Error(`Duplicate pattern binder '${p.binders[0]}'`);
            armEnv.set(p.binders[0], 'Tree');
            armEnv.set(p.binders[1], 'Tree');
          } else if (p.kind === 'Var') {
            armEnv.set(p.binders[0], st);
          }
          const bt = inferType(arm.body, armEnv);
          if (expectedArmType === null) expectedArmType = bt;
          else if (expectedArmType !== bt) {
            throw new Error(`Match arm type mismatch: expected ${expectedArmType}, got ${bt}`);
          }
        }
        return expectedArmType;
      }
      default:
        throw new Error(`Unhandled AST node ${node.kind}`);
    }
  }

  for (const fn of functions) {
    const fEnv = new Map();
    for (const p of fn.params) fEnv.set(p.name, p.type);
    const bodyType = inferType(fn.body, fEnv);
    if (bodyType !== fn.returnType) {
      throw new Error(`Typecheck error: fn ${fn.name} declared ${fn.returnType} but body has type ${bodyType}`);
    }
  }
  const entryType = inferType(entry, new Map());

  // Build ProgramImage expression table (preorder: entry, then each function body)
  const expressions = [];
  function assignExprIds(node, ownerPrefix, path = []) {
    const id = expressions.length;
    node.exprId = id;
    const astPath = `${ownerPrefix}/${path.join('.')}`;
    node.astPath = astPath;
    const row = {
      id,
      kind: node.kind,
      op: node.op || (node.kind === 'Let' ? '=' : node.kind === 'If' ? 'if' : node.kind === 'Call' ? 'call' : node.kind === 'Match' ? 'match' : ''),
      name: node.name || '',
      children: [],
      line: lineNumberAt(source, node.span.start),
      start: node.span.start,
      end: node.span.end,
      astPath,
      text: source.slice(node.span.start, node.span.end),
    };
    expressions.push(row);
    const children = node.children || [];
    for (let i = 0; i < children.length; i++) {
      const childId = assignExprIds(children[i], ownerPrefix, [...path, i]);
      row.children.push(childId);
    }
    return id;
  }

  assignExprIds(entry, 'entry', []);
  const fnRows = functions.map((fn, fi) => {
    const bodyExpr = assignExprIds(fn.body, `fn[${fi}]:${fn.name}`, []);
    return {
      id: fi,
      name: fn.name,
      params: fn.params,
      returnType: fn.returnType,
      bodyExpr,
    };
  });

  return {
    programName: progName,
    entryType,
    entry,
    functions,
    programImage: {
      expressions,
      functions: fnRows,
    },
  };
}

function formatValueSummary(v) {
  if (!v) return 'null';
  if (v.kind === 'UInt') return String(v.value);
  if (v.kind === 'Bool') return String(v.value);
  if (v.kind === 'List') return `[${v.elements.map(String).join(', ')}]`;
  if (v.kind === 'Tree') return formatTreeSummary(v.tree);
  return String(v);
}

function formatTreeSummary(t) {
  if (!t) return 'leaf(0)';
  if (t.kind === 'Leaf') return `leaf(${t.value})`;
  return `branch(${formatTreeSummary(t.left)}, ${formatTreeSummary(t.right)})`;
}

function serializeValue(v) {
  if (!v) return null;
  if (v.kind === 'UInt') {
    const big = BigInt(v.value);
    return {
      kind: 'UInt',
      value: String(big),
      number: big <= 9007199254740991n ? Number(big) : 9007199254740991,
      limbs: uint128ToLeBytes(big),
      summary: String(big),
    };
  }
  if (v.kind === 'Bool') {
    return { kind: 'Bool', value: Boolean(v.value), summary: String(v.value) };
  }
  if (v.kind === 'List') {
    return {
      kind: 'List',
      elements: v.elements.map((x) => Number(x)),
      length: v.elements.length,
      summary: formatValueSummary(v),
    };
  }
  if (v.kind === 'Tree') {
    return {
      kind: 'Tree',
      tree: serializeTree(v.tree),
      summary: formatValueSummary(v),
    };
  }
  return null;
}

function serializeTree(t) {
  if (t.kind === 'Leaf') {
    return { kind: 'Leaf', value: Number(t.value), label: `leaf(${t.value})` };
  }
  return {
    kind: 'Branch',
    left: serializeTree(t.left),
    right: serializeTree(t.right),
    label: 'branch',
  };
}

function valuesEqual(a, b) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'UInt') return BigInt(a.value) === BigInt(b.value);
  if (a.kind === 'Bool') return Boolean(a.value) === Boolean(b.value);
  if (a.kind === 'List') {
    if (a.elements.length !== b.elements.length) return false;
    return a.elements.every((x, i) => BigInt(x) === BigInt(b.elements[i]));
  }
  if (a.kind === 'Tree') return treesEqual(a.tree, b.tree);
  return false;
}

function treesEqual(a, b) {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'Leaf') return BigInt(a.value) === BigInt(b.value);
  return treesEqual(a.left, b.left) && treesEqual(a.right, b.right);
}

function exprShortText(node) {
  if (!node) return '';
  switch (node.kind) {
    case 'Literal': return formatValueSummary(node.litValue);
    case 'Var': return node.name;
    case 'Let': return `let ${node.name} = ...`;
    case 'Binary': return `(${exprShortText(node.left)} ${node.op} ${exprShortText(node.right)})`;
    case 'Unary': return `${node.op}(${exprShortText(node.operand)})`;
    case 'If': return `if ${exprShortText(node.condition)} { ... }`;
    case 'Match': return `match ${exprShortText(node.scrutinee)} (${node.arms.length} arms)`;
    case 'Call': return `${node.name}(${node.args.map(exprShortText).join(', ')})`;
    default: return node.kind;
  }
}

export function groupSlices(steps, sliceWidth = 4) {
  const width = Math.max(1, Number(sliceWidth) || 4);
  const slices = [];
  let cursor = 0;
  let idx = 0;
  while (cursor < steps.length) {
    const chunk = steps.slice(cursor, cursor + width);
    const prefixWork = [0];
    let acc = 0;
    for (const s of chunk) {
      acc += Number(s.charge || 0);
      prefixWork.push(acc);
    }
    const endStep = cursor + chunk.length - 1;
    const isTerminal = endStep === steps.length - 1 && chunk[chunk.length - 1]?.charge === 0;
    slices.push({
      index: idx++,
      startStep: cursor,
      endStep,
      count: chunk.length,
      prefixWork,
      work: acc,
      terminal: isTerminal,
    });
    cursor += chunk.length;
  }
  return slices;
}

/**
 * Full 39-rule `sherlock-k-a/1` ImageMachine execution in JS
 */
export function compileAndRunInBrowser(source, { fuel = 120, stackLimit = 16, sliceWidth = 4 } = {}) {
  let parsed;
  try {
    parsed = parseAndCheckDraft(source);
  } catch (err) {
    return {
      ok: false,
      engine: 'browser-sherlock-k-a/1',
      error: err.message || String(err),
    };
  }

  let control = { kind: 'Eval', expr: parsed.entry };
  let controlOrigin = parsed.entry.exprId || 0;
  let env = new Map();
  const frames = [];
  const frameOrigins = [];
  let remainingFuel = Math.max(0, Number(fuel));
  const maxStack = Math.max(1, Number(stackLimit));
  let outcome = { kind: 'Pending' };
  const steps = [];
  let lastFocusValue = null;

  const cloneEnv = (e) => new Map(e);

  function matchPattern(pattern, value, baseEnv) {
    const next = cloneEnv(baseEnv);
    if (pattern.kind === 'Nil' && value.kind === 'List' && value.elements.length === 0) {
      return next;
    }
    if (pattern.kind === 'Cons' && value.kind === 'List' && value.elements.length > 0) {
      if (pattern.binders[0] === pattern.binders[1]) return null;
      next.set(pattern.binders[0], { kind: 'UInt', value: BigInt(value.elements[0]) });
      next.set(pattern.binders[1], { kind: 'List', elements: value.elements.slice(1) });
      return next;
    }
    if (pattern.kind === 'Leaf' && value.kind === 'Tree' && value.tree.kind === 'Leaf') {
      next.set(pattern.binders[0], { kind: 'UInt', value: BigInt(value.tree.value) });
      return next;
    }
    if (pattern.kind === 'Branch' && value.kind === 'Tree' && value.tree.kind === 'Branch') {
      if (pattern.binders[0] === pattern.binders[1]) return null;
      next.set(pattern.binders[0], { kind: 'Tree', tree: value.tree.left });
      next.set(pattern.binders[1], { kind: 'Tree', tree: value.tree.right });
      return next;
    }
    if (pattern.kind === 'Var') {
      next.set(pattern.binders[0], value);
      return next;
    }
    return null;
  }

  function stepTransition(ctrl) {
    switch (ctrl.kind) {
      case 'Eval': {
        const e = ctrl.expr;
        if (e.kind === 'Literal') {
          return [102, { kind: 'Return', value: e.litValue }];
        }
        if (e.kind === 'Var') {
          if (env.has(e.name)) return [108, { kind: 'Return', value: env.get(e.name) }];
          return [111, { kind: 'Error', code: 3 }];
        }
        if (e.kind === 'Let') {
          return [114, {
            kind: 'Push',
            frame: { kind: 'Let', name: e.name, body: e.body, env: cloneEnv(env) },
            next: { kind: 'Eval', expr: e.value },
            env: cloneEnv(env),
          }];
        }
        if (e.kind === 'Binary') {
          return [117, {
            kind: 'Push',
            frame: { kind: 'Left', op: e.op, right: e.right, env: cloneEnv(env) },
            next: { kind: 'Eval', expr: e.left },
            env: cloneEnv(env),
          }];
        }
        if (e.kind === 'Unary') {
          return [120, {
            kind: 'Push',
            frame: { kind: 'Unary', op: e.op },
            next: { kind: 'Eval', expr: e.operand },
            env: cloneEnv(env),
          }];
        }
        if (e.kind === 'If') {
          return [123, {
            kind: 'Push',
            frame: { kind: 'If', yes: e.yes, no: e.no, env: cloneEnv(env) },
            next: { kind: 'Eval', expr: e.condition },
            env: cloneEnv(env),
          }];
        }
        if (e.kind === 'Match') {
          return [126, {
            kind: 'Push',
            frame: { kind: 'Match', arms: e.arms, env: cloneEnv(env) },
            next: { kind: 'Eval', expr: e.scrutinee },
            env: cloneEnv(env),
          }];
        }
        if (e.kind === 'Call') {
          if (e.args.length === 0) {
            return [129, { kind: 'Invoke', name: e.name, values: [] }];
          }
          return [131, {
            kind: 'Push',
            frame: { kind: 'Args', name: e.name, evaluated: [], remaining: e.args.slice(1), env: cloneEnv(env) },
            next: { kind: 'Eval', expr: e.args[0] },
            env: cloneEnv(env),
          }];
        }
        return [82, { kind: 'Error', code: 1 }];
      }
      case 'Push': {
        if (frames.length < maxStack) {
          frames.unshift(ctrl.frame);
          frameOrigins.unshift(controlOrigin);
          env = ctrl.env;
          return [135, ctrl.next];
        }
        return [140, { kind: 'Error', code: 4 }];
      }
      case 'Return': {
        const val = ctrl.value;
        const top = frames[0];
        if (!top) return [80, null];
        if (frameOrigins.length > 0 && frameOrigins[0] !== undefined) {
          controlOrigin = frameOrigins[0];
        }
        if (top.kind === 'Let') {
          const nextEnv = cloneEnv(top.env);
          nextEnv.set(top.name, val);
          frames[0] = { kind: 'Scope', env: top.env };
          env = nextEnv;
          return [145, { kind: 'Eval', expr: top.body }];
        }
        if (top.kind === 'Left') {
          frames[0] = { kind: 'Right', op: top.op, leftVal: val };
          env = top.env;
          return [149, { kind: 'Eval', expr: top.right }];
        }
        if (top.kind === 'Right') {
          frames.shift();
          frameOrigins.shift();
          const lv = top.leftVal;
          const rv = val;
          const op = top.op;
          if (op === '+' && lv.kind === 'UInt' && rv.kind === 'UInt') {
            const s = BigInt(lv.value) + BigInt(rv.value);
            return [153, { kind: 'PrimitiveResult', result: s <= MAX_UINT128 ? { ok: true, value: { kind: 'UInt', value: s } } : { ok: false, code: 10 } }];
          }
          if (op === '-' && lv.kind === 'UInt' && rv.kind === 'UInt') {
            const d = BigInt(lv.value) - BigInt(rv.value);
            return [153, { kind: 'PrimitiveResult', result: d >= 0n ? { ok: true, value: { kind: 'UInt', value: d } } : { ok: false, code: 10 } }];
          }
          if (op === '*' && lv.kind === 'UInt' && rv.kind === 'UInt') {
            const p = BigInt(lv.value) * BigInt(rv.value);
            return [153, { kind: 'PrimitiveResult', result: p <= MAX_UINT128 ? { ok: true, value: { kind: 'UInt', value: p } } : { ok: false, code: 10 } }];
          }
          if (op === '<' && lv.kind === 'UInt' && rv.kind === 'UInt') {
            return [153, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'Bool', value: BigInt(lv.value) < BigInt(rv.value) } } }];
          }
          if (op === '==' && lv.kind === rv.kind) {
            return [153, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'Bool', value: valuesEqual(lv, rv) } } }];
          }
          if (op === 'cons' && lv.kind === 'UInt' && rv.kind === 'List') {
            return [153, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'List', elements: [BigInt(lv.value), ...rv.elements] } } }];
          }
          if (op === 'branch' && lv.kind === 'Tree' && rv.kind === 'Tree') {
            return [153, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'Tree', tree: { kind: 'Branch', left: lv.tree, right: rv.tree } } } }];
          }
          return [153, { kind: 'PrimitiveResult', result: { ok: false, code: 11 } }];
        }
        if (top.kind === 'Unary') {
          frames.shift();
          frameOrigins.shift();
          if (top.op === 'leaf' && val.kind === 'UInt') {
            return [157, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'Tree', tree: { kind: 'Leaf', value: BigInt(val.value) } } } }];
          }
          if (top.op === 'not' && val.kind === 'Bool') {
            return [157, { kind: 'PrimitiveResult', result: { ok: true, value: { kind: 'Bool', value: !val.value } } }];
          }
          return [157, { kind: 'PrimitiveResult', result: { ok: false, code: 11 } }];
        }
        if (top.kind === 'If') {
          if (val.kind === 'Bool' && val.value === true) {
            frames.shift();
            frameOrigins.shift();
            env = top.env;
            return [161, { kind: 'Eval', expr: top.yes }];
          }
          if (val.kind === 'Bool' && val.value === false) {
            frames.shift();
            frameOrigins.shift();
            env = top.env;
            return [165, { kind: 'Eval', expr: top.no }];
          }
          return [169, { kind: 'Error', code: 5 }];
        }
        if (top.kind === 'Match') {
          frames.shift();
          frameOrigins.shift();
          return [173, { kind: 'Cases', value: val, arms: top.arms, env: top.env }];
        }
        if (top.kind === 'Args') {
          const nextEval = [...top.evaluated, val];
          if (top.remaining.length > 0) {
            const [headExpr, ...restExprs] = top.remaining;
            frames[0] = { ...top, evaluated: nextEval, remaining: restExprs };
            env = top.env;
            return [177, { kind: 'Eval', expr: headExpr }];
          }
          frames.shift();
          frameOrigins.shift();
          env = top.env;
          return [181, { kind: 'Invoke', name: top.name, values: nextEval }];
        }
        if (top.kind === 'Return') {
          if (val.kind === top.returnType) {
            frames.shift();
            frameOrigins.shift();
            env = top.env;
            return [185, { kind: 'Return', value: val }];
          }
          return [190, { kind: 'Error', code: 6 }];
        }
        if (top.kind === 'Scope') {
          frames.shift();
          frameOrigins.shift();
          env = top.env;
          return [195, { kind: 'Return', value: val }];
        }
        return [82, { kind: 'Error', code: 1 }];
      }
      case 'Invoke': {
        const fn = parsed.functions.find((f) => f.name === ctrl.name) || null;
        return [200, { kind: 'Enter', fn, values: ctrl.values }];
      }
      case 'Enter': {
        if (!ctrl.fn) return [202, { kind: 'Error', code: 7 }];
        const fn = ctrl.fn;
        if (fn.params.length !== ctrl.values.length) {
          return [204, { kind: 'Bound', env: null, returnType: fn.returnType, body: fn.body }];
        }
        const callEnv = new Map();
        for (let i = 0; i < fn.params.length; i++) {
          if (ctrl.values[i].kind !== fn.params[i].type) {
            return [204, { kind: 'Bound', env: null, returnType: fn.returnType, body: fn.body }];
          }
          callEnv.set(fn.params[i].name, ctrl.values[i]);
        }
        return [204, { kind: 'Bound', env: callEnv, returnType: fn.returnType, body: fn.body }];
      }
      case 'Bound': {
        if (!ctrl.env) return [206, { kind: 'Error', code: 8 }];
        return [208, {
          kind: 'Push',
          frame: { kind: 'Return', returnType: ctrl.returnType, env: cloneEnv(env) },
          next: { kind: 'Eval', expr: ctrl.body },
          env: ctrl.env,
        }];
      }
      case 'Cases': {
        if (!ctrl.arms || ctrl.arms.length === 0) {
          return [212, { kind: 'Error', code: 9 }];
        }
        const [firstArm, ...restArms] = ctrl.arms;
        const matchedEnv = matchPattern(firstArm.pattern, ctrl.value, ctrl.env);
        return [214, {
          kind: 'CaseResult',
          matchedEnv,
          value: ctrl.value,
          body: firstArm.body,
          restArms,
          savedEnv: ctrl.env,
        }];
      }
      case 'CaseResult': {
        if (!ctrl.matchedEnv) {
          return [217, { kind: 'Cases', value: ctrl.value, arms: ctrl.restArms, env: ctrl.savedEnv }];
        }
        return [220, {
          kind: 'Push',
          frame: { kind: 'Scope', env: ctrl.savedEnv },
          next: { kind: 'Eval', expr: ctrl.body },
          env: ctrl.matchedEnv,
        }];
      }
      case 'PrimitiveResult': {
        if (ctrl.result.ok) {
          return [223, { kind: 'Return', value: ctrl.result.value }];
        }
        return [225, { kind: 'Error', code: ctrl.result.code }];
      }
      default:
        return [82, { kind: 'Error', code: 1 }];
    }
  }

  let prevSerializedFrames = [];

  for (let stepIdx = 0; stepIdx < 1024; stepIdx++) {
    if (outcome.kind !== 'Pending' || !control) break;

    const beforeFuel = remainingFuel;
    const beforeFrameCount = frames.length;
    const beforeCtrl = control;
    const beforeTopFrame = frames[0] || null;
    const beforeEnvEntries = Array.from(env.entries());
    const beforeFramesSnapshot = prevSerializedFrames.map((f) => ({ ...f }));

    let ruleLine = 102;
    let charge = 1;

    if (control.kind === 'Return' && frames.length === 0) {
      outcome = { kind: 'Done', value: serializeValue(control.value), summary: formatValueSummary(control.value) };
      control = null;
      ruleLine = 80;
      charge = 0;
    } else if (control.kind === 'Error') {
      outcome = { kind: 'Rejected', code: control.code, summary: `Rejected(error ${control.code})` };
      control = null;
      ruleLine = 82;
      charge = 0;
    } else if (remainingFuel === 0) {
      outcome = { kind: 'Exhausted', summary: 'Exhausted (Fuel = 0)' };
      control = null;
      ruleLine = 84;
      charge = 0;
    } else {
      const [line, nextCtrl] = stepTransition(control);
      ruleLine = line;
      charge = 1;
      if (nextCtrl && nextCtrl.kind === 'Eval' && nextCtrl.expr?.exprId !== undefined) {
        controlOrigin = nextCtrl.expr.exprId;
      }
      control = nextCtrl;
      remainingFuel = Math.max(0, remainingFuel - 1);
    }

    // Determine control summary and value
    let ctrlKind = control ? control.kind : outcome.kind === 'Done' ? 'Return' : 'Error';
    let ctrlSummary = '';
    let ctrlValObj = null;

    if (control) {
      switch (control.kind) {
        case 'Eval':
          ctrlSummary = exprShortText(control.expr);
          break;
        case 'Return':
          ctrlSummary = `Return(${formatValueSummary(control.value)})`;
          ctrlValObj = serializeValue(control.value);
          break;
        case 'Push':
          ctrlSummary = `Push(${control.frame.kind})`;
          break;
        case 'Invoke':
          ctrlSummary = `Invoke(${control.name}(${control.values.map(formatValueSummary).join(', ')}))`;
          if (control.values[0]) ctrlValObj = serializeValue(control.values[0]);
          break;
        case 'Enter':
          ctrlSummary = `Enter(${control.fn ? control.fn.name : '?'})`;
          if (control.values[0]) ctrlValObj = serializeValue(control.values[0]);
          break;
        case 'Bound':
          ctrlSummary = `Bound(: ${control.returnType})`;
          break;
        case 'Cases':
          ctrlSummary = `Cases(${formatValueSummary(control.value)})`;
          ctrlValObj = serializeValue(control.value);
          break;
        case 'CaseResult':
          ctrlSummary = `CaseResult(${formatValueSummary(control.value)})`;
          ctrlValObj = serializeValue(control.value);
          break;
        case 'PrimitiveResult':
          if (control.result.ok) {
            ctrlSummary = `PrimOk(${formatValueSummary(control.result.value)})`;
            ctrlValObj = serializeValue(control.result.value);
          } else {
            ctrlSummary = `PrimErr(${control.result.code})`;
          }
          break;
        case 'Error':
          ctrlSummary = `Error(${control.code})`;
          break;
        default:
          ctrlSummary = control.kind;
      }
    } else if (outcome.kind === 'Done') {
      ctrlSummary = `Done(${outcome.summary})`;
      ctrlValObj = outcome.value;
    } else {
      ctrlSummary = outcome.summary;
    }

    if (ctrlValObj) {
      lastFocusValue = ctrlValObj;
    } else {
      for (const fr of frames) {
        if (fr.kind === 'Right' && fr.leftVal) {
          lastFocusValue = serializeValue(fr.leftVal);
          break;
        }
        if (fr.kind === 'Args' && fr.evaluated.length > 0) {
          lastFocusValue = serializeValue(fr.evaluated[fr.evaluated.length - 1]);
          break;
        }
      }
    }

    const exprMeta = parsed.programImage.expressions[controlOrigin] || parsed.programImage.expressions[0];

    const serializedFrames = frames.map((fr, fidx) => {
      const fOrigin = frameOrigins[fidx] ?? 0;
      const fExprMeta = parsed.programImage.expressions[fOrigin] || exprMeta;
      let label = fr.kind;
      let detail = '';
      let fEnv = fr.env || null;

      if (fr.kind === 'Let') {
        label = `let ${fr.name} = [hole]`;
        detail = exprShortText(fr.body);
      } else if (fr.kind === 'Left') {
        label = `[hole] ${fr.op} ${exprShortText(fr.right)}`;
        detail = `op: ${fr.op}`;
      } else if (fr.kind === 'Right') {
        label = `${formatValueSummary(fr.leftVal)} ${fr.op} [hole]`;
        detail = `lhs = ${formatValueSummary(fr.leftVal)}`;
      } else if (fr.kind === 'Unary') {
        label = `${fr.op}([hole])`;
        detail = `unary ${fr.op}`;
      } else if (fr.kind === 'If') {
        label = 'if [hole] { ... } else { ... }';
        detail = `then: ${exprShortText(fr.yes)} | else: ${exprShortText(fr.no)}`;
      } else if (fr.kind === 'Match') {
        label = `match [hole] (${fr.arms.length} arms)`;
        detail = 'pattern dispatch';
      } else if (fr.kind === 'Args') {
        const totalArgs = fr.evaluated.length + 1 + fr.remaining.length;
        label = `${fr.name}(${fr.evaluated.length}/${totalArgs} args)`;
        detail = `done: ${fr.evaluated.length}, pending: ${fr.remaining.length}`;
      } else if (fr.kind === 'Return') {
        label = `return : ${fr.returnType}`;
        detail = `contract check ${fr.returnType}`;
      } else if (fr.kind === 'Scope') {
        label = 'restore scope';
        detail = `${fEnv ? fEnv.size : 0} bindings`;
      }

      const bindings = fEnv
        ? Array.from(fEnv.entries()).map(([k, v]) => ({
            name: k,
            valueSummary: formatValueSummary(v),
            type: v.kind,
          }))
        : [];

      return {
        index: fidx,
        kind: fr.kind,
        label,
        detail,
        returnType: fr.returnType || null,
        fnName: fr.name && fr.kind === 'Args' ? fr.name : null,
        varName: fr.name && fr.kind === 'Let' ? fr.name : null,
        op: fr.op || null,
        evaluatedCount: fr.kind === 'Args' ? fr.evaluated.length : null,
        remainingCount: fr.kind === 'Args' ? fr.remaining.length : null,
        totalArgs: fr.kind === 'Args' ? fr.evaluated.length + 1 + fr.remaining.length : null,
        originExprId: fOrigin,
        astPath: fExprMeta.astPath,
        envId: fidx + 1,
        bindings,
      };
    });

    prevSerializedFrames = serializedFrames;

    const activeEnvBindings = Array.from(env.entries()).map(([k, v]) => ({
      name: k,
      valueSummary: formatValueSummary(v),
      type: v.kind,
    }));

    // Aux/1 telemetry
    let aux1 = { activeKind: 'None', targetName: '', probes: [] };
    if (ruleLine === 108 || ruleLine === 111) {
      const target = beforeCtrl.expr?.name || 'x';
      aux1 = {
        activeKind: 'EnvGetScan',
        targetName: target,
        probes: beforeEnvEntries.map(([k], pi) => ({ index: pi, name: k, hit: k === target })),
      };
    } else if (ruleLine === 200 || ruleLine === 202) {
      const target = beforeCtrl.name || 'fn';
      aux1 = {
        activeKind: 'FindScan',
        targetName: target,
        probes: parsed.functions.map((f, fi) => ({ index: fi, name: f.name, hit: f.name === target })),
      };
    } else if ([204, 206, 214, 217].includes(ruleLine)) {
      aux1 = { activeKind: 'BindPreflight', targetName: 'params', probes: [] };
    } else if (ruleLine === 153 && beforeTopFrame?.op === '==') {
      aux1 = { activeKind: 'EqScratch', targetName: '==', probes: [] };
    }

    // Aux/2 arithmetic + fuel witness
    let arith = materializeArithmeticWitness(null, null, null);
    if (
      ruleLine === 153 &&
      beforeTopFrame?.kind === 'Right' &&
      beforeTopFrame.leftVal?.kind === 'UInt' &&
      beforeCtrl?.kind === 'Return' &&
      beforeCtrl.value?.kind === 'UInt'
    ) {
      arith = materializeArithmeticWitness(
        beforeTopFrame.op,
        beforeTopFrame.leftVal.value,
        beforeCtrl.value.value,
      );
    }
    const fuelWitness = materializeFuelWitness(true, ruleLine === 80 || ruleLine === 82, beforeFuel);

    const exprCount = parsed.programImage.expressions.length;
    const valCount = 2 + activeEnvBindings.length + frames.length;
    const envCount = frames.length + 1;
    const bindCount = activeEnvBindings.length + serializedFrames.reduce((a, f) => a + f.bindings.length, 0);
    const frameCount = frames.length;
    const ctrlCount = control ? 1 : 0;

    steps.push({
      index: stepIdx,
      ruleId: `A${String(ruleLine).padStart(3, '0')}`,
      ruleLine,
      ruleName: RULE_NAMES[ruleLine] || 'Transition',
      charge,
      controlKind: ctrlKind,
      controlSummary: ctrlSummary,
      controlValue: ctrlValObj,
      focusValue: lastFocusValue,
      outcomeKind: outcome.kind,
      before: {
        fuel: beforeFuel,
        frameCount: beforeFrameCount,
        frames: beforeFramesSnapshot,
      },
      after: {
        fuel: remainingFuel,
        stackLimit: maxStack,
        control: {
          kind: ctrlKind,
          exprId: controlOrigin,
          summary: ctrlSummary,
          value: ctrlValObj,
        },
        controlOrigin: {
          exprId: controlOrigin,
          line: exprMeta.line,
          start: exprMeta.start,
          end: exprMeta.end,
          astPath: exprMeta.astPath,
          text: exprMeta.text,
        },
        frames: serializedFrames,
        envRoots: [{ id: 0, bindings: activeEnvBindings }],
        machineImage: {
          expressions: exprCount,
          values: valCount,
          environments: envCount,
          bindings: bindCount,
          frames: frameCount,
          controls: ctrlCount,
          usage: {
            rows: exprCount + valCount + envCount + bindCount + frameCount + ctrlCount,
            cells: exprCount * 2 + frameCount + bindCount,
            nameBytes: bindCount * 4 + parsed.functions.length * 6,
          },
        },
        aux1,
        aux2: {
          arithmetic: arith,
          fuel: fuelWitness,
        },
      },
    });
  }

  return {
    ok: true,
    engine: 'browser-sherlock-k-a/1',
    programName: parsed.programName,
    entryType: parsed.entryType,
    source,
    programImage: parsed.programImage,
    steps,
    slices: groupSlices(steps, sliceWidth),
    sliceWidth: Math.max(1, Number(sliceWidth) || 4),
    outcome,
  };
}

function parseArgsArity(frame) {
  if (!frame || frame.kind !== 'Args') return null;
  const fnName = frame.fnName || String(frame.label || '').split('(')[0].trim() || 'fn';
  if (typeof frame.evaluatedCount === 'number' && typeof frame.totalArgs === 'number') {
    return {
      fnName,
      evaluatedCount: frame.evaluatedCount,
      totalArgs: frame.totalArgs,
    };
  }
  const detailMatch = String(frame.detail || '').match(/done:\s*(\d+)\s*,\s*pending:\s*(\d+)/i);
  if (detailMatch) {
    const evaluatedCount = Number(detailMatch[1]);
    const remainingCount = Number(detailMatch[2]);
    return {
      fnName,
      evaluatedCount,
      totalArgs: evaluatedCount + 1 + remainingCount,
    };
  }
  const labelMatch = String(frame.label || '').match(/\((\d+)\/(\d+)\s*args\)/i);
  if (labelMatch) {
    return {
      fnName,
      evaluatedCount: Number(labelMatch[1]),
      totalArgs: Number(labelMatch[2]),
    };
  }
  return { fnName, evaluatedCount: 0, totalArgs: 1 };
}

function formatFrameFullLabel(frame) {
  if (!frame) return 'Idle';
  if (frame.kind === 'Args') {
    const arity = parseArgsArity(frame);
    if (arity) {
      return `${arity.fnName}(${arity.evaluatedCount}/${arity.totalArgs} args)`;
    }
  }
  return frame.label || frame.kind || 'Idle';
}

function normalizeTraceFrame(fr) {
  if (!fr || typeof fr !== 'object') return fr;
  if (fr.kind === 'Args') {
    const arity = parseArgsArity(fr);
    if (arity) {
      return {
        ...fr,
        fnName: arity.fnName,
        evaluatedCount: arity.evaluatedCount,
        totalArgs: arity.totalArgs,
        label: `${arity.fnName}(${arity.evaluatedCount}/${arity.totalArgs} args)`,
      };
    }
  }
  return { ...fr };
}

const IS_STATIC_HOST =
  typeof window !== 'undefined' &&
  window.__SHERLOCK_ENABLE_API_TRACE !== true &&
  (/\.github\.io$/i.test(window.location.hostname || '') ||
    window.location.protocol === 'file:' ||
    window.location.port !== '4377');

let rustBackendAvailable = !IS_STATIC_HOST;
const clientTraceCache = new Map();

export function clearClientTraceCache() {
  clientTraceCache.clear();
}

function rememberClientTrace(key, result) {
  if (clientTraceCache.has(key)) {
    clientTraceCache.delete(key);
  } else if (clientTraceCache.size >= 32) {
    const oldestKey = clientTraceCache.keys().next().value;
    clientTraceCache.delete(oldestKey);
  }
  clientTraceCache.set(key, result);
  return result;
}

/**
 * Runs the program through the native Rust `sherlock-runner` endpoint when available,
 * falling back seamlessly to the in-browser `sherlock-k-a/1` engine (and skipping network
 * calls altogether on static hosts like GitHub Pages).
 */
export async function compileAndRunSherlock(
  source,
  { fuel = 120, stackLimit = 16, sliceWidth = 4, preferRust = !IS_STATIC_HOST } = {}
) {
  const cacheKey = `${source}|F:${fuel}|S:${stackLimit}|W:${sliceWidth}`;
  const cached = clientTraceCache.get(cacheKey);
  if (cached !== undefined) {
    clientTraceCache.delete(cacheKey);
    clientTraceCache.set(cacheKey, cached);
    return cached;
  }

  if (preferRust && rustBackendAvailable && typeof fetch === 'function') {
    try {
      const resp = await fetch('./api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, fuel, stackLimit, sliceWidth }),
      });
      if (!resp.ok) {
        rustBackendAvailable = false;
      } else {
        const data = await resp.json();
        if (data && data.ok) {
          data.source = source;
          if (Array.isArray(data.steps)) {
            for (let i = 0; i < data.steps.length; i++) {
              const s = data.steps[i];
              if (Array.isArray(s.after?.frames)) {
                s.after.frames = s.after.frames.map(normalizeTraceFrame);
              }
              if (s.before) {
                const rawBefore = Array.isArray(s.before.frames)
                  ? s.before.frames
                  : i > 0
                    ? data.steps[i - 1].after?.frames || []
                    : [];
                s.before.frames = rawBefore.map(normalizeTraceFrame);
              }
              if (!s.outcomeKind) {
                s.outcomeKind =
                  s.ruleLine === 80
                    ? 'Done'
                    : s.ruleLine === 82
                      ? 'Rejected'
                      : s.ruleLine === 84
                        ? 'Exhausted'
                        : 'Pending';
              }
            }
          }
          return rememberClientTrace(cacheKey, data);
        }
        if (data && !data.ok) {
          const fallback = compileAndRunInBrowser(source, { fuel, stackLimit, sliceWidth });
          return rememberClientTrace(cacheKey, { ...fallback, rustError: data.error });
        }
      }
    } catch (_) {
      // Offline or static file mode; disable further `/api/trace` probes and use in-browser engine
      rustBackendAvailable = false;
    }
  }
  const browserResult = compileAndRunInBrowser(source, { fuel, stackLimit, sliceWidth });
  return rememberClientTrace(cacheKey, browserResult);
}

// Classification of the 9 Frame variants into 3 semantic families:
// 'ENV'  -> Return, Scope (Cyan-Teal: saved caller/lexical environment & return type)
// 'OP'   -> Left, Right, Unary, Args (Amber-Gold: pending arithmetic/operator/argument hole)
// 'GATE' -> If, Match, Let (Violet-Indigo: pending branch/pattern/let gate)
export const FRAME_FAMILY_BY_KIND = {
  Return: 'ENV',
  Scope: 'ENV',
  Left: 'OP',
  Right: 'OP',
  Unary: 'OP',
  Args: 'OP',
  If: 'GATE',
  Match: 'GATE',
  Let: 'GATE',
};

export const CONTROL_CORE_SECTORS = [
  'EVAL',
  'PUSH',
  'RETURN',
  'INVOKE',
  'ENTER',
  'BOUND',
  'CASES',
  'MATCH',
  'PRIM',
  'ERROR',
];

function normalizeOpTokens(str) {
  return String(str || '')
    .replace(/\bMul\b/g, '*')
    .replace(/\bAdd\b/g, '+')
    .replace(/\bSub\b/g, '-')
    .replace(/\bEq\b/g, '==')
    .replace(/\bLt\b/g, '<')
    .replace(/\bCons\b/g, 'cons')
    .replace(/\bBranch\b/g, 'branch')
    .replace(/\bLeaf\b/g, 'leaf')
    .replace(/\bNot\b/g, 'not');
}

function clampLabel14(str) {
  const clean = String(str || '').trim();
  return clean.length <= 14 ? clean : `${clean.slice(0, 13)}…`;
}

function formatSlotShortLabel(frame) {
  if (!frame) return 'IDLE';
  switch (frame.kind) {
    case 'Return': {
      const rt = frame.returnType || String(frame.label || '').replace(/^return\s*:\s*/i, '').trim() || 'UInt';
      return clampLabel14(`RET:${rt}`);
    }
    case 'Scope':
      return 'SCOPE';
    case 'Right':
    case 'Left': {
      const compact = normalizeOpTokens(frame.label)
        .replace(/\[hole\]/g, '[?]')
        .replace(/\(\s*([^()]+)\s*\)/g, '$1');
      return clampLabel14(compact);
    }
    case 'Unary': {
      const compact = normalizeOpTokens(frame.label).replace(/\[hole\]/g, '[?]');
      return clampLabel14(compact);
    }
    case 'Args': {
      const arity = parseArgsArity(frame);
      if (arity) {
        return clampLabel14(`ARGS ${arity.evaluatedCount}/${arity.totalArgs}`);
      }
      return 'ARGS 0/1';
    }
    case 'If':
      return 'IF [?]';
    case 'Match':
      return 'MATCH [?]';
    case 'Let': {
      const varName =
        frame.varName ||
        String(frame.label || '')
          .replace(/^let\s+/i, '')
          .split('=')[0]
          .trim() ||
        'x';
      return clampLabel14(`LET ${varName}=[?]`);
    }
    default:
      return clampLabel14(frame.kind || 'IDLE');
  }
}

function formatBindingsText(bindings, emptyFallback = 'root') {
  if (!Array.isArray(bindings) || bindings.length === 0) return emptyFallback;
  return bindings.map((b) => `${b.name}=${b.valueSummary}`).join(', ');
}

/**
 * Builds chronological 6-ring / 12-slot horological continuation telemetry (`ringTelemetry`)
 * and 10-sector central control indicator telemetry (`controlCore`) for a trace step.
 */
export function buildRingTelemetry(trace, stepIndex) {
  const steps = trace?.steps || [];
  const step = steps[stepIndex] || steps[0];

  const chronoFrames = [...(step?.after?.frames || [])].reverse();
  const rawPrevFrames =
    step?.before?.frames ??
    (stepIndex > 0 ? steps[stepIndex - 1]?.after?.frames : []) ??
    [];
  const prevChronoFrames = [...rawPrevFrames].reverse();

  const buildSlot = (chronoIdx, side) => {
    const frame = chronoFrames[chronoIdx] || null;
    const prevFrame = prevChronoFrames[chronoIdx] || null;
    const occupied = Boolean(frame);
    const isTopOfStack = Boolean(frame && chronoIdx === chronoFrames.length - 1);
    const kind = frame ? frame.kind : 'Idle';
    const family = frame ? (FRAME_FAMILY_BY_KIND[frame.kind] || 'OP') : 'IDLE';
    const fullLabel = frame ? formatFrameFullLabel(frame) : 'Idle';
    const prevFullLabel = prevFrame ? formatFrameFullLabel(prevFrame) : 'Idle';

    let transition = 'IDLE';
    if (isTopOfStack && chronoFrames.length > prevChronoFrames.length) {
      transition = 'PUSHED';
    } else if (
      isTopOfStack &&
      chronoFrames.length === prevChronoFrames.length &&
      prevFrame &&
      (prevFrame.kind !== frame.kind ||
        prevFrame.label !== frame.label ||
        prevFullLabel !== fullLabel ||
        step?.ruleLine === 145 ||
        step?.ruleLine === 149 ||
        step?.ruleLine === 177)
    ) {
      transition = 'REWRITTEN';
    } else if (!frame && prevFrame) {
      transition = 'POPPED';
    } else if (occupied) {
      transition = 'HELD';
    }

    const isPopped = transition === 'POPPED' && Boolean(prevFrame);
    const hasEnv = Boolean(frame && frame.kind !== 'Right' && frame.kind !== 'Unary');

    return {
      slotIndex: chronoIdx,
      side,
      occupied,
      isTopOfStack,
      kind,
      family,
      transition,
      shortLabel: formatSlotShortLabel(frame),
      envText: hasEnv ? formatBindingsText(frame.bindings, 'root') : '',
      fullLabel,
      originExprId: frame ? frame.originExprId : isPopped ? prevFrame.originExprId : null,
      poppedKind: isPopped ? prevFrame.kind : null,
      poppedFamily: isPopped ? (FRAME_FAMILY_BY_KIND[prevFrame.kind] || 'OP') : null,
      poppedLabel: isPopped ? prevFullLabel : null,
      poppedShortLabel: isPopped ? formatSlotShortLabel(prevFrame) : null,
      beforeKind: transition === 'REWRITTEN' && prevFrame ? prevFrame.kind : null,
      afterKind: transition === 'REWRITTEN' && frame ? frame.kind : null,
    };
  };

  const rings = [];
  for (let r = 0; r < 6; r++) {
    const slotA = buildSlot(r * 2, 'A');
    const slotB = buildSlot(r * 2 + 1, 'B');
    const filledSlots = (slotA.occupied ? 1 : 0) + (slotB.occupied ? 1 : 0);
    const isActiveRing = Boolean(slotA.isTopOfStack || slotB.isTopOfStack);
    rings.push({
      ringIndex: r,
      label: `R${r + 1}`,
      capacityLabel: String((r + 1) * 2).padStart(2, '0'),
      slotA,
      slotB,
      filledSlots,
      isActiveRing,
    });
  }

  const frontierSlotIndex = chronoFrames.length - 1;
  const topSlot =
    frontierSlotIndex >= 0
      ? buildSlot(frontierSlotIndex, frontierSlotIndex % 2 === 0 ? 'A' : 'B')
      : null;
  const trueTop =
    frontierSlotIndex >= 0 && topSlot
      ? {
          ...chronoFrames[frontierSlotIndex],
          ...topSlot,
          label: topSlot.fullLabel,
          chronoIndex: frontierSlotIndex,
        }
      : null;
  const overflowTopFrame = chronoFrames.length > 12 ? trueTop : null;

  const outcomeKind =
    step?.outcomeKind ||
    (step?.ruleLine === 80
      ? 'Done'
      : step?.ruleLine === 82
        ? 'Rejected'
        : step?.ruleLine === 84
          ? 'Exhausted'
          : 'Pending');

  const rawCtrlKind = step?.controlKind || 'Eval';
  const isTerminalDone = Boolean(outcomeKind === 'Done' || step?.ruleLine === 80 || rawCtrlKind === 'Done');
  let variant = 'EVAL';
  if (isTerminalDone) {
    variant = 'RETURN';
  } else if (
    outcomeKind === 'Rejected' ||
    outcomeKind === 'Exhausted' ||
    step?.ruleLine === 82 ||
    step?.ruleLine === 84 ||
    rawCtrlKind === 'Error' ||
    rawCtrlKind === 'Rejected' ||
    rawCtrlKind === 'Exhausted'
  ) {
    variant = 'ERROR';
  } else {
    const variantMap = {
      Eval: 'EVAL',
      Push: 'PUSH',
      Return: 'RETURN',
      Invoke: 'INVOKE',
      Enter: 'ENTER',
      Bound: 'BOUND',
      Cases: 'CASES',
      CaseResult: 'MATCH',
      PrimitiveResult: 'PRIM',
      Error: 'ERROR',
    };
    variant = variantMap[rawCtrlKind] || 'EVAL';
  }

  const sectorIndex = Math.max(0, CONTROL_CORE_SECTORS.indexOf(variant));
  const activeBindings = step?.after?.envRoots?.[0]?.bindings || [];
  const envSummary =
    activeBindings.length > 0
      ? formatBindingsText(activeBindings, 'env: root')
      : 'env: root';

  let action = 'EVAL';
  if (outcomeKind === 'Done' || step?.ruleLine === 80) {
    action = 'DONE';
  } else if (
    outcomeKind === 'Rejected' ||
    outcomeKind === 'Exhausted' ||
    step?.ruleLine === 82 ||
    step?.ruleLine === 84 ||
    variant === 'ERROR'
  ) {
    action = 'ERROR';
  } else if (chronoFrames.length > prevChronoFrames.length) {
    action = 'PUSH';
  } else if ([145, 149, 177].includes(step?.ruleLine)) {
    action = 'REWRITE';
  } else if (chronoFrames.length < prevChronoFrames.length) {
    action = 'POP';
  }

  const activeSlotIndex = chronoFrames.length > 0 ? Math.min(11, chronoFrames.length - 1) : 0;

  const controlCore = {
    variant,
    sectorIndex,
    isTerminalDone,
    headline: step?.controlSummary || 'Idle',
    subline: step ? `Rule ${step.ruleId} · ${step.ruleName}` : 'Idle',
    envSummary,
    action,
    activeSlotIndex,
    frontierSlotIndex,
  };

  return {
    rings,
    overflowFrames: Math.max(0, chronoFrames.length - 12),
    totalFrames: chronoFrames.length,
    activeSlotIndex,
    frontierSlotIndex,
    overflowTopFrame,
    trueTop,
    controlCore,
  };
}

const traceCallSpansCache = new WeakMap();
const traceStepTelemetryCache = new WeakMap();

function getTraceBaseCallSpans(trace) {
  if (!trace || typeof trace !== 'object') return { baseCalls: [], maxDepth: 0 };
  if (traceCallSpansCache.has(trace)) return traceCallSpansCache.get(trace);

  const steps = trace.steps || [];
  const baseCalls = [];
  const openStack = [];
  let maxDepth = 0;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const fLen = s.after?.frames?.length || 0;
    if (fLen > maxDepth) maxDepth = fLen;

    if (s.ruleLine === 200) {
      const prev = steps[Math.max(0, i - 1)];
      const raw = prev?.controlSummary || s.controlSummary || 'call()';
      const label = raw.replace(/^Invoke\((.*)\)$/, '$1').replace(/^Enter\((.*)\)$/, '$1');
      const callObj = {
        id: baseCalls.length,
        label,
        invokeStep: i,
        returnStep: null,
        returnValue: null,
        depth: openStack.length,
      };
      baseCalls.push(callObj);
      openStack.push(callObj);
    } else if (s.ruleLine === 185 && openStack.length > 0) {
      const finished = openStack.pop();
      finished.returnStep = i;
      finished.returnValue =
        s.controlValue?.summary ?? s.controlSummary?.replace(/^Return\((.*)\)$/, '$1') ?? '';
    }
  }

  const entry = { baseCalls, maxDepth };
  traceCallSpansCache.set(trace, entry);
  return entry;
}

/**
 * Builds crystal-clear recursion telemetry (call-chain lifecycle + live algebraic
 * hole-substitution equation) directly from the active continuation frame stack.
 */
export function buildRecursionTelemetry(trace, stepIndex) {
  const steps = trace?.steps || [];
  const step = steps[stepIndex] || steps[0];
  if (!step) {
    return {
      mode: 'IDLE',
      equation: '',
      calls: [],
      activeDepth: 0,
      maxDepth: 0,
    };
  }

  const { baseCalls, maxDepth } = getTraceBaseCallSpans(trace);
  const calls = new Array(baseCalls.length);
  const activeOpenCalls = [];
  let anyReturned = false;

  for (let i = 0; i < baseCalls.length; i++) {
    const bc = baseCalls[i];
    let status = 'waiting';
    if (stepIndex < bc.invokeStep) {
      status = 'future';
    } else if (bc.returnStep !== null && stepIndex >= bc.returnStep) {
      status = 'returned';
      anyReturned = true;
    }
    const callClone = { ...bc, status };
    calls[i] = callClone;
    if (status === 'waiting') {
      activeOpenCalls.push(callClone);
    }
  }
  if (activeOpenCalls.length > 0) {
    activeOpenCalls[activeOpenCalls.length - 1].status = 'active';
  }

  // 2. Construct live Algebraic Substitution Equation from the Right/Left/Let frames on the stack
  const frames = step.after?.frames || [];
  let focusAtom = step.controlSummary || '';
  focusAtom = focusAtom
    .replace(/^Return\((.*)\)$/, '$1')
    .replace(/^PrimOk\((.*)\)$/, '$1')
    .replace(/^Invoke\((.*)\)$/, '$1')
    .replace(/^Done\((.*)\)$/, '$1');
  if (focusAtom.length > 28) {
    focusAtom = step.after?.controlOrigin?.text || focusAtom.slice(0, 26) + '…';
  }

  let exprAcc = `[ ${focusAtom} ]`;
  for (let i = 0; i < frames.length; i++) {
    const fr = frames[i];
    if (fr.kind === 'Right') {
      const prefix = fr.label
        .replace(/\s*\[hole\].*$/, '')
        .replace(/Mul/g, '×')
        .replace(/Add/g, '+')
        .replace(/Sub/g, '-');
      exprAcc = `(${prefix} ${exprAcc})`;
    } else if (fr.kind === 'Left') {
      const suffix = fr.label
        .replace(/^\[hole\]\s*/, '')
        .replace(/Mul/g, '×')
        .replace(/Add/g, '+')
        .replace(/Sub/g, '-');
      exprAcc = `(${exprAcc} ${suffix})`;
    } else if (fr.kind === 'Let') {
      const varName = fr.label.replace(/^let\s+/, '').replace(/\s*=.*$/, '');
      exprAcc = `let ${varName} = ${exprAcc}`;
    }
  }
  if (exprAcc.startsWith('(') && exprAcc.endsWith(')')) {
    exprAcc = exprAcc.slice(1, -1);
  }

  let mode = 'UNFOLDING';
  if (step.ruleLine === 80) mode = 'RESOLVED';
  else if (step.ruleLine === 82 || step.ruleLine === 84 || step.controlKind === 'Error') mode = 'FAULT';
  else if (anyReturned && activeOpenCalls.length > 0) mode = 'UNWINDING';
  else if (activeOpenCalls.length > 0 && step.controlKind === 'Return') mode = 'BASE CASE';

  return {
    mode,
    equation: exprAcc,
    calls,
    activeDepth: frames.length,
    maxDepth: Math.max(1, maxDepth),
  };
}

function getCachedStepTelemetry(trace, stepIndex) {
  if (!trace || typeof trace !== 'object') {
    return {
      recursion: buildRecursionTelemetry(trace, stepIndex),
      ringTelemetry: buildRingTelemetry(trace, stepIndex),
    };
  }
  let stepMap = traceStepTelemetryCache.get(trace);
  if (!stepMap) {
    stepMap = new Map();
    traceStepTelemetryCache.set(trace, stepMap);
  }
  let entry = stepMap.get(stepIndex);
  if (!entry) {
    entry = {
      recursion: buildRecursionTelemetry(trace, stepIndex),
      ringTelemetry: buildRingTelemetry(trace, stepIndex),
    };
    stepMap.set(stepIndex, entry);
  }
  return entry;
}

/**
 * Compute the `stepState` object passed to all 7 Three.js designers on every animation frame.
 */
export function buildStepState({ trace, playhead = 0, ambient = 0, dt = 0.016 }) {
  if (trace && !trace._functionalAnnotated) {
    annotateTraceWithFunctionalDeltas(trace);
  }
  const steps = trace?.steps || [];
  const totalSteps = Math.max(1, steps.length);
  const maxStepIdx = Math.max(0, steps.length - 1);
  const clampedPlayhead = Math.max(0, Math.min(totalSteps - 0.0001, playhead));
  const stepIndex = Math.min(maxStepIdx, Math.floor(clampedPlayhead));
  const stepFraction = Math.max(0, clampedPlayhead - stepIndex);
  const progress = totalSteps <= 1 ? 1 : Math.min(1, clampedPlayhead / (totalSteps - 1));
  const step = steps[stepIndex] || steps[0];

  let phase = 'DESCEND';
  if (!step) {
    phase = 'STILL';
  } else if (stepIndex === 0 && stepFraction < 0.45) {
    phase = 'INGEST';
  } else if (step.ruleLine === 82 || step.ruleLine === 84 || step.controlKind === 'Error') {
    phase = 'ERROR';
  } else if (step.ruleLine === 80) {
    phase = 'EMBLEM';
  } else if (step.controlKind === 'Return' || step.controlKind === 'PrimitiveResult' || step.ruleLine === 185) {
    phase = step.after.frames.length === 0 ? 'RETURN' : 'RESOLVE';
  } else {
    phase = 'DESCEND';
  }

  let aperture = 0.92;
  if (phase === 'STILL') aperture = 0.18;
  else if (phase === 'INGEST') aperture = 0.45 + 0.5 * stepFraction;
  else if (phase === 'EMBLEM') aperture = 0.68;
  else if (phase === 'ERROR') aperture = 0.85;

  const { recursion, ringTelemetry } = getCachedStepTelemetry(trace, stepIndex);
  const controlCore = ringTelemetry.controlCore;

  return {
    ambient,
    dt,
    stepIndex,
    stepFraction,
    totalSteps,
    progress,
    phase,
    aperture,
    recursion,
    ringTelemetry,
    controlCore,
    functionalDelta: step?._functionalDelta || null,
    trace,
    step,
  };
}


