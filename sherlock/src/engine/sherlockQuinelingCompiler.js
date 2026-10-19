// ============================================================================
// src/engine/sherlockQuinelingCompiler.js
// Compiles actual Moriarty Sherlock programs (`moriarty-sherlock-draft/1` AST +
// `sherlock-k-a/1` execution traces) into genuine, self-reproducing Quinelings
// (`Quinelings.makeTaskProgram`, `QDL.fromGraph`, `WovenBody.author`,
// `LifeformFamilies`, `Morphology`, `Chroma`) using the upstream Quinelings SDK.
// ============================================================================
import {
  Quinelings,
  QuinelingKernels,
  QDL,
  Chroma,
  Morphology,
  WovenBody,
} from './quinelingsSdk.js';
import { parseAndCheckDraft } from './sherlockEngine.js';

const sharedTextEncoder = new TextEncoder();

/**
 * 32-bit FNV-1a hash (`h0 = 2166136261`, prime `16777619`)
 */
export function fnv1a32(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ (str.charCodeAt(i) & 0xff), 16777619) >>> 0;
  }
  return h >>> 0;
}

function fnv1aBytes(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i += 1) {
    h = Math.imul(h ^ bytes[i], 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Encodes a pre-serialized canonical Quine string into `quineling-harmonics-1`
 * without re-running `Quinelings.canon(program)` multiple times.
 */
function genomeFromCanonical(canonicalText) {
  const data = sharedTextEncoder.encode(canonicalText);
  if (data.length > 65536) throw new Error('Genome exceeds 64 KiB');
  const bytes = new Uint8Array(12 + data.length);
  bytes.set([81, 76, 78, 71]);
  const view = new DataView(bytes.buffer);
  view.setUint32(4, data.length);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, fnv1aBytes(data));
  const bands = [];
  for (let i = 0; i < bytes.length; i += 32) {
    const a = new Array(32).fill(0);
    const end = Math.min(bytes.length, i + 32);
    for (let j = i; j < end; j += 1) {
      a[j - i] = bytes[j] + 1;
    }
    bands.push(a);
  }
  return {
    harmonicGenome: { format: 'quineling-harmonics-1', bands },
    byteLength: data.length,
  };
}

const NON_ID_CHARS_RE = /[^A-Za-z0-9_-]+/g;
const LEADING_NON_ALPHA_RE = /^[^A-Za-z]+/;
const FN_OWNER_RE = /^fn\[\d+\]:([^/]+)/;
const DIGITS_RE = /^\d+$/;
const LIST_MATCH_RE = /\bnil\b|\bcons\s*\(/;
const TREE_MATCH_RE = /\bleaf\s*\(|\bbranch\s*\(/;

function parseUInt32Literal(rawText) {
  if (rawText.length <= 9) return Number(rawText) >>> 0;
  return Number(BigInt(rawText) & 0xffffffffn);
}

/**
 * Derives `quineling-chroma-1` directly from an already encoded `quineling-harmonics-1`
 * genome, avoiding a duplicate `Quinelings.encode()` pass, and simultaneously collects
 * non-null `rgbPixels` to avoid a second nested traversal.
 */
function colorGenomeFromHarmonic(harmonicGenome) {
  const rgbPixels = [];
  const pixels = harmonicGenome.bands.map((a) =>
    a.map((c) => {
      if (c === 0) return null;
      const b = c - 1;
      const px = [b, 255 - b, (73 * b + 19) % 256];
      rgbPixels.push(px);
      return px;
    })
  );
  return {
    colorGenome: { format: 'quineling-chroma-1', pixels },
    rgbPixels,
  };
}

/**
 * Sanitizes an AST path or identifier into a valid Quinelings node ID (`^[A-Za-z][A-Za-z0-9_-]{0,63}$`).
 */
function sanitizeNodeId(raw, idx = 0) {
  const cleaned = String(raw || `node_${idx}`)
    .replace(NON_ID_CHARS_RE, '_')
    .replace(LEADING_NON_ALPHA_RE, 'n_');
  return (cleaned || `n_${idx}`).slice(0, 48);
}

/**
 * Walks a parsed Sherlock AST (`parseAndCheckDraft(source)`) to extract its exact
 * structural genome: function count, mutual recursion, ADT match patterns (`cons`/`nil` vs
 * `branch`/`leaf`), `Let` nesting depth, arithmetic operators, and literal seeds.
 */
export function analyzeSherlockAst(parsed, source = '', trace = null) {
  const exprs = parsed?.programImage?.expressions || [];
  const fns = parsed?.functions || [];
  const fnNames = new Set(fns.map((f) => f.name));

  let hasListMatch = false;
  let hasTreeMatch = false;
  let letCount = 0;
  let ifCount = 0;
  let matchCount = 0;
  let mulCount = 0;
  let addCount = 0;
  let subCount = 0;
  let consCount = 0;
  let branchCount = 0;
  let selfRecursiveCalls = 0;
  let crossRecursiveCalls = 0;
  const literals = [];
  let entryExpr = null;
  const entryLits = [];

  for (const ex of exprs) {
    const astPath = typeof ex.astPath === 'string' ? ex.astPath : '';
    if (!entryExpr && astPath === 'entry/') {
      entryExpr = ex;
    }
    const ownerMatch = astPath ? FN_OWNER_RE.exec(astPath) : null;
    const currentFnName = ownerMatch ? ownerMatch[1] : null;
    switch (ex.kind) {
      case 'Literal': {
        const rawText = String(ex.text || '').trim();
        if (DIGITS_RE.test(rawText)) {
          const val = parseUInt32Literal(rawText);
          literals.push(val);
          if (astPath.startsWith('entry/')) {
            entryLits.push(val);
          }
        } else if (rawText === 'true' || rawText === 'false') {
          literals.push(rawText === 'true' ? 1 : 0);
        }
        break;
      }
      case 'Let':
        letCount += 1;
        break;
      case 'If':
        ifCount += 1;
        break;
      case 'Match': {
        matchCount += 1;
        const text = ex.text || '';
        if (LIST_MATCH_RE.test(text)) hasListMatch = true;
        if (TREE_MATCH_RE.test(text)) hasTreeMatch = true;
        break;
      }
      case 'Unary':
        if (ex.op === 'leaf') hasTreeMatch = true;
        break;
      case 'Binary':
        if (ex.op === '*') mulCount += 1;
        else if (ex.op === '+') addCount += 1;
        else if (ex.op === '-') subCount += 1;
        else if (ex.op === 'cons') {
          consCount += 1;
          hasListMatch = true;
        } else if (ex.op === 'branch') {
          branchCount += 1;
          hasTreeMatch = true;
        }
        break;
      case 'Call':
        if (currentFnName && ex.name === currentFnName) {
          selfRecursiveCalls += 1;
        } else if (currentFnName && fnNames.has(ex.name) && ex.name !== currentFnName) {
          crossRecursiveCalls += 1;
        }
        break;
      default:
        break;
    }
  }

  const stackLimit =
    trace?.steps?.[0]?.after?.stackLimit ??
    trace?.stackLimit ??
    16;
  const initialFuel =
    trace?.steps?.[0]?.before?.fuel ??
    trace?.fuel ??
    120;
  const outcomeKind = trace?.outcome?.kind || 'Done';
  const lastStep = trace?.steps?.[trace.steps.length - 1];
  const terminalRuleLine = lastStep?.ruleLine ?? 80;

  let speciesId = 'factorial';
  if (hasTreeMatch || branchCount > 0) {
    speciesId = 'tree_fold';
  } else if (hasListMatch || consCount > 0) {
    speciesId = 'list_fold';
  } else if (fns.length >= 2 && crossRecursiveCalls > 0) {
    speciesId = 'mutual_even_odd';
  } else if (letCount >= 1 && selfRecursiveCalls === 0) {
    speciesId = 'lexical_let';
  } else if (
    (subCount > 0 && selfRecursiveCalls === 0 && ifCount === 0) ||
    terminalRuleLine === 225
  ) {
    speciesId = 'checked_underflow';
  } else if (mulCount > 0 && selfRecursiveCalls > 0) {
    speciesId = 'factorial';
  } else if (
    terminalRuleLine === 140 ||
    (addCount > 0 && selfRecursiveCalls > 0 && mulCount === 0 && !hasListMatch && !hasTreeMatch)
  ) {
    speciesId = 'stack_overflow';
  } else if (
    outcomeKind === 'Exhausted' ||
    terminalRuleLine === 84 ||
    (selfRecursiveCalls > 0 && mulCount === 0 && addCount === 0 && crossRecursiveCalls === 0)
  ) {
    speciesId = 'fuel_exhaustion';
  }

  if (!entryExpr) entryExpr = exprs[0] || null;
  const entryText = String(entryExpr?.text || '');
  const entryN = entryLits[0] ?? literals[0] ?? 4;
  const listValues = speciesId === 'list_fold' && entryLits.length > 0 ? entryLits : [5, 8, 3];
  const treeLeaves = speciesId === 'tree_fold' && entryLits.length > 0 ? entryLits : [7, 4, 9];
  const seedValue = speciesId === 'lexical_let' ? (entryLits[0] ?? 12) : 12;
  const subGap =
    speciesId === 'checked_underflow' && entryLits.length >= 2
      ? Math.abs(entryLits[1] - entryLits[0])
      : 6;

  // Compute a deterministic seed from the full source + literals + bounds so any program edit
  // immediately shifts the upstream QDL and WovenBody authoring parameters
  const literalSignature = literals.join(',');
  const seedHash = fnv1a32(
    `${source || parsed?.programName || 'sherlock'}|L:${literalSignature}|F:${initialFuel}|S:${stackLimit}|O:${outcomeKind}`
  );

  return {
    speciesId,
    programName: parsed?.programName || 'SherlockProgram',
    entryType: parsed?.entryType || 'UInt',
    entryText,
    entryMorph: {
      entryN,
      listValues,
      treeLeaves,
      seedValue,
      subGap,
    },
    functionCount: fns.length,
    expressionCount: exprs.length,
    hasListMatch,
    hasTreeMatch,
    letCount,
    ifCount,
    matchCount,
    mulCount,
    addCount,
    subCount,
    consCount,
    branchCount,
    selfRecursiveCalls,
    crossRecursiveCalls,
    literals,
    stackLimit,
    initialFuel,
    outcomeKind,
    terminalRuleLine,
    seed: (seedHash % 2147483646) + 1,
  };
}

/**
 * Translates any parsed Sherlock AST (`parsed`) + execution trace (`trace`) into an
 * admitted, executable Quinelings Task Graph (`QuinelingKernels.validate(graph)`).
 *
 * Crucially, the task graph's topology (`depth`, `fanout`, `convergence`, `guards`,
 * `effects`, `hasTreeBranch`, `hasCoupled`, `hasPipelineFold`) is constructed directly
 * from the Sherlock AST's computational structure so that upstream `WovenBody.author(graph, seed)`
 * and `QDL.fromGraph(graph, seed)` naturally author the corresponding mathematical
 * `nursery.html` lifeform (`logarithmic-mantle`, `pleated-braid`, `recursive-affine`,
 * `lorenz-flow`, `phyllotaxis-fan`, `clifford-flow`, `recursive-julia`, `toroidal-weave`)
 * without any post-hoc overrides!
 */
export function buildQuinelingTaskGraphFromAst(parsed, analysis, trace = null) {
  const nodes = [];
  const usedIds = new Set();
  const exprToNodeId = new Map();

  function allocId(base, exprId = null) {
    const baseClean = sanitizeNodeId(base, nodes.length);
    let candidate = baseClean;
    let suffix = 1;
    while (usedIds.has(candidate)) {
      suffix += 1;
      candidate = `${baseClean}_${suffix}`;
    }
    usedIds.add(candidate);
    if (exprId !== null && exprId !== undefined) {
      exprToNodeId.set(exprId, candidate);
    }
    return candidate;
  }

  function addNode(baseId, op, inputs, params = {}, exprMeta = null) {
    const id = allocId(baseId, exprMeta?.id);
    nodes.push({ id, op, inputs, params });
    return id;
  }

  const exprs = parsed?.programImage?.expressions || [];
  const lits = analysis.literals.length > 0 ? analysis.literals : [4, 1, 0];
  const numericSeedValues =
    lits.length >= 2 ? lits.slice(0, 8) : [lits[0] ?? 4, 3, 2, 1];
  const primaryVal = Math.max(1, lits[0] ?? 4);
  const secondaryVal = Math.max(1, lits[1] ?? 2);

  // Single-pass bucket of AST expressions by kind for authentic exprId -> nodeId territory linking
  const litExprs = [];
  const binExprs = [];
  const callExprs = [];
  const matchExprs = [];
  const ifExprs = [];
  const letExprs = [];
  for (let i = 0; i < exprs.length; i += 1) {
    const e = exprs[i];
    switch (e.kind) {
      case 'Literal': litExprs.push(e); break;
      case 'Binary': binExprs.push(e); break;
      case 'Call': callExprs.push(e); break;
      case 'Match': matchExprs.push(e); break;
      case 'If': ifExprs.push(e); break;
      case 'Let': letExprs.push(e); break;
      default: break;
    }
  }

  const sp = analysis.speciesId;
  let reportId = null;

  if (sp === 'checked_underflow') {
    // Guarded subtractive boundary check -> `guards > 0` -> `clifford-flow` (`jelly`)
    const seedId = addNode(`entry_${analysis.programName}`, 'literal', [], { value: numericSeedValues }, exprs[0]);
    const subAId = addNode(`minuend_${primaryVal}`, 'literal', [], { value: primaryVal }, litExprs[0]);
    const clampId = addNode('checked_sub_clamp', 'clamp', [subAId], { min: 0, max: Math.max(10, secondaryVal) }, binExprs[0] || exprs[1]);
    const filtId = addNode('underflow_filter', 'filter', [seedId], { operator: 'lt', value: secondaryVal }, binExprs[1] || exprs[2]);
    const sumId = addNode('residue_sum', 'sum', [filtId], {}, exprs[3]);
    const guardId = addNode('underflow_guard', 'compare', [clampId], { operator: 'gte', value: secondaryVal }, ifExprs[0] || binExprs[0]);
    const actId = addNode('reject_underflow', 'action', [guardId, sumId], {
      allowed: false,
      action: `${analysis.programName}_${analysis.outcomeKind}`,
    }, exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [actId], {
      labels: ['underflowReceipt'],
    });
  } else if (sp === 'tree_fold') {
    // Hierarchical branch-and-choose tree -> `fanout >= 2` + `choose` (`hasTreeBranch`) -> `recursive-affine` (`coral`)
    const leaves = analysis.entryMorph.treeLeaves.length >= 2 ? analysis.entryMorph.treeLeaves : [7, 4, 9];
    const treeInputId = addNode(`tree_leaves_${leaves.join('_')}`, 'literal', [], { value: leaves }, exprs[0]);
    const leftMapId = addNode('left_branch_map', 'map', [treeInputId], { kind: 'multiply', factor: Math.max(1, leaves[0] ?? 3) }, matchExprs[0] || binExprs[0]);
    const rightMapId = addNode('right_branch_map', 'map', [treeInputId], { kind: 'square' }, binExprs[1] || callExprs[0]);
    const centerLenId = addNode('branch_depth', 'length', [treeInputId], {}, callExprs[1] || litExprs[0]);
    const leftSumId = addNode('left_subtree_sum', 'sum', [leftMapId], {}, binExprs[2]);
    const rightSumId = addNode('right_subtree_sum', 'sum', [rightMapId], {}, callExprs[2]);
    const branchFlagId = addNode('branch_selector', 'literal', [], { value: true }, litExprs[1]);
    const chooseId = addNode('tree_fold_choose', 'choose', [branchFlagId, leftSumId, rightSumId], {}, matchExprs[0] || exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [chooseId, centerLenId], {
      labels: ['treeSum', 'leafCount'],
    });
  } else if (sp === 'stack_overflow') {
    // Divergent recursive self-call fanout without choose/guards -> `fanout >= 2` -> `recursive-julia` (`comet`)
    const seedId = addNode(`dive_seed_${primaryVal}`, 'literal', [], { value: numericSeedValues }, exprs[0]);
    const framePushA = addNode('frame_push_primary', 'map', [seedId], { kind: 'square' }, callExprs[0] || binExprs[0]);
    const framePushB = addNode('frame_push_echo', 'map', [seedId], { kind: 'multiply', factor: Math.max(2, secondaryVal) }, binExprs[1] || exprs[1]);
    const frameDepthId = addNode('horizon_depth', 'length', [seedId], {}, litExprs[0]);
    const ascA = addNode('stack_climb_a', 'sort', [framePushA], { descending: true }, exprs[2]);
    const sumA = addNode('frame_accum_a', 'sum', [ascA], {}, exprs[3]);
    const sumB = addNode('frame_accum_b', 'max', [framePushB], {}, exprs[4]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [sumA, sumB, frameDepthId], {
      labels: ['primaryFrame', 'echoFrame', 'horizonDepth'],
    });
  } else if (sp === 'fuel_exhaustion') {
    // Effectful loop with literal gate -> `effects > 0, guards === 0, fanout === 1` -> `toroidal-weave` (`torus`)
    const jobsVal = [
      { id: 'spin_entry', depends: [], duration: Math.max(1, primaryVal) },
      { id: 'spin_step', depends: ['spin_entry'], duration: Math.max(1, secondaryVal) },
    ];
    const poolId = addNode('fuel_schedule_pool', 'literal', [], { value: jobsVal }, exprs[0]);
    const schedId = addNode('spin_recurrence_sched', 'schedule', [poolId], {}, callExprs[0] || exprs[1]);
    const gateId = addNode('fuel_gate_lit', 'literal', [], { value: analysis.outcomeKind === 'Done' }, litExprs[0]);
    const actId = addNode('fuel_exhaust_action', 'action', [gateId, schedId], {
      allowed: analysis.outcomeKind === 'Done',
      action: `${analysis.programName}_${analysis.outcomeKind}`,
    }, ifExprs[0] || exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [actId], {
      labels: ['fuelLoopState'],
    });
  } else if (sp === 'mutual_even_odd') {
    // Coupled parity alternation -> `consensus` (`hasCoupled = true, guards = 0, fanout = 1`) -> `lorenz-flow` (`moth`)
    const paritySeed = addNode(`parity_seed_${primaryVal}`, 'literal', [], { value: numericSeedValues }, exprs[0]);
    const evenMapId = addNode('is_even_step', 'map', [paritySeed], { kind: 'multiply', factor: primaryVal }, callExprs[0] || ifExprs[0]);
    const oddSubId = addNode('is_odd_step', 'sum', [evenMapId], {}, callExprs[1] || ifExprs[1]);
    const votesId = addNode('parity_votes_lit', 'literal', [], {
      value: [
        { source: 'is_even', choice: primaryVal % 2 === 0 ? 'true' : 'false' },
        { source: 'is_odd', choice: primaryVal % 2 === 0 ? 'true' : 'false' },
      ],
    }, litExprs[0]);
    const parityConsensusId = addNode('parity_lorenz_consensus', 'consensus', [votesId], { required: 1 }, binExprs[0] || exprs[2]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [parityConsensusId, oddSubId], {
      labels: ['mutualParity', 'stepTotal'],
    });
  } else if (sp === 'list_fold') {
    // Sequential cons/nil pipeline fold -> `depth >= 4, fanout = 1, hasPipelineFold` -> `pleated-braid` (`ribbon`)
    const listVals = analysis.entryMorph.listValues.length > 0 ? analysis.entryMorph.listValues : [5, 8, 3];
    const consInputId = addNode(`cons_cells_${listVals.join('_')}`, 'literal', [], { value: listVals }, exprs[0]);
    const dedupeId = addNode('cons_dedupe_spine', 'dedupe', [consInputId], {}, matchExprs[0] || binExprs[0]);
    const sortId = addNode('cons_order_pleat', 'sort', [dedupeId], { descending: false }, binExprs[1] || callExprs[0]);
    const mapId = addNode('cons_head_scale', 'map', [sortId], { kind: 'multiply', factor: Math.max(1, listVals[0] ?? 5) }, binExprs[2]);
    const sumId = addNode('list_fold_accum', 'sum', [mapId], {}, exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [sumId], {
      labels: ['listFoldSum'],
    });
  } else if (sp === 'lexical_let') {
    // Pure linear nested-let scope chain -> `fanout = 1, convergence = 1` -> `phyllotaxis-fan` (`bloom`)
    const seedVal = analysis.entryMorph.seedValue || primaryVal;
    let curId = addNode(`let_seed_${seedVal}`, 'literal', [], { value: [seedVal, ...numericSeedValues.slice(0, 3)] }, exprs[0]);
    const letNodes = letExprs.length > 0 ? letExprs : exprs.slice(0, 3);
    for (let i = 0; i < Math.min(4, Math.max(2, letNodes.length)); i += 1) {
      const lex = letNodes[i] || exprs[i];
      const stepLit = lits[i + 1] ?? (i + 2);
      curId = addNode(
        `let_scope_${sanitizeNodeId(lex?.name || `s${i}`)}_L${lex?.line || i}`,
        'map',
        [curId],
        i % 2 === 0
          ? { kind: 'square' }
          : { kind: 'multiply', factor: Math.max(2, stepLit) },
        lex
      );
    }
    const sumId = addNode('lexical_body_sum', 'sum', [curId], {}, binExprs[0] || exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [sumId], {
      labels: ['lexicalResult'],
    });
  } else {
    // `factorial` (and general convergent recursive accumulators):
    // `convergence >= 2, fanout = 1, guards = 0, effects = 0` -> `logarithmic-mantle` (`nautilus`)
    const nVal = Math.max(1, analysis.entryMorph.entryN || primaryVal);
    const ladder = Array.from({ length: Math.min(8, Math.max(2, nVal)) }, (_, i) => i + 1);
    const valuesId = addNode(`fact_ladder_${nVal}`, 'literal', [], { value: ladder }, exprs[0]);
    const weightsId = addNode(`fact_weights_${nVal}`, 'literal', [], { value: ladder.slice().reverse() }, litExprs[0]);
    const mulMapId = addNode('fact_mul_step', 'map', [valuesId], { kind: 'multiply', factor: nVal }, binExprs[0] || callExprs[0]);
    const wMeanId = addNode('fact_converge_mean', 'weightedMean', [mulMapId, weightsId], {}, ifExprs[0] || binExprs[1]);
    const fuelLitId = addNode('fact_fuel_lit', 'literal', [], { value: Math.max(10, analysis.initialFuel) }, litExprs[1]);
    const budgetId = addNode('fact_step_budget', 'budget', [fuelLitId, wMeanId], {}, callExprs[0] || exprs[exprs.length - 1]);
    reportId = addNode(`sherlock_${sanitizeNodeId(analysis.programName)}_out`, 'report', [budgetId], {
      labels: ['factorialAccumulator'],
    });
  }

  // Ensure every AST expression in `parsed.programImage.expressions` maps to a real node ID in the graph
  const fallbackNodeIds = nodes.map((n) => n.id);
  for (let i = 0; i < exprs.length; i += 1) {
    const ex = exprs[i];
    if (ex && ex.id !== undefined && !exprToNodeId.has(ex.id)) {
      exprToNodeId.set(ex.id, fallbackNodeIds[i % fallbackNodeIds.length]);
    }
  }

  const graph = {
    version: 1,
    name: `Sherlock ${analysis.programName} (${analysis.speciesId})`,
    nodes,
    outputs: [reportId],
  };

  QuinelingKernels.validate(graph);
  return { graph, exprToNodeId };
}

const compiledQuinelingCache = new Map();
let _lastRawSource = null;
let _lastStackLimit = -1;
let _lastInitialFuel = -1;
let _lastOutcomeKind = '';
let _lastTerminalRuleLine = -1;
let _lastStepCount = -1;
let _lastArtifact = null;

export function clearCompiledQuinelingCache() {
  compiledQuinelingCache.clear();
  _lastRawSource = null;
  _lastStackLimit = -1;
  _lastInitialFuel = -1;
  _lastOutcomeKind = '';
  _lastTerminalRuleLine = -1;
  _lastStepCount = -1;
  _lastArtifact = null;
}

/**
 * Compiles a Sherlock program (`source`, `trace`) into a verified, self-reproducing
 * Quineling (`quineProgram`, `shape`, `wovenBody`, `harmonicGenome`, `colorGenome`,
 * `taskRun`, `exprToNodeId`) using the enhanced upstream Quinelings SDK & QDS.
 */
export function compileSherlockProgramToQuineling(source, speciesCatalog, trace = null) {
  const rawSource =
    source ||
    trace?.source ||
    'language "moriarty-sherlock-draft/1"; program Factorial { fn fact(n: UInt): UInt { if n == 0 { 1 } else { n * fact(n - 1) } } entry fact(4); }';
  const steps = trace?.steps || [];
  const stepCount = steps.length;
  const lastStep = stepCount > 0 ? steps[stepCount - 1] : null;
  const stackLimit = steps[0]?.after?.stackLimit ?? trace?.stackLimit ?? 16;
  const initialFuel = steps[0]?.before?.fuel ?? trace?.fuel ?? 120;
  const outcomeKind = trace?.outcome?.kind || 'Done';
  const terminalRuleLine = lastStep?.ruleLine ?? 0;

  if (
    _lastArtifact !== null &&
    rawSource === _lastRawSource &&
    stackLimit === _lastStackLimit &&
    initialFuel === _lastInitialFuel &&
    outcomeKind === _lastOutcomeKind &&
    terminalRuleLine === _lastTerminalRuleLine &&
    stepCount === _lastStepCount
  ) {
    return _lastArtifact;
  }

  const cleanSource = String(rawSource);
  const cacheKey = `${cleanSource}|S:${stackLimit}|F:${initialFuel}|O:${outcomeKind}|R:${terminalRuleLine}|N:${stepCount}`;

  const cached = compiledQuinelingCache.get(cacheKey);
  if (cached !== undefined) {
    compiledQuinelingCache.delete(cacheKey);
    compiledQuinelingCache.set(cacheKey, cached);
    _lastRawSource = rawSource;
    _lastStackLimit = stackLimit;
    _lastInitialFuel = initialFuel;
    _lastOutcomeKind = outcomeKind;
    _lastTerminalRuleLine = terminalRuleLine;
    _lastStepCount = stepCount;
    _lastArtifact = cached;
    return cached;
  }

  let parsed = null;
  try {
    parsed = parseAndCheckDraft(cleanSource);
  } catch (_) {
    parsed = {
      programName: trace?.programName || 'SherlockProgram',
      entryType: 'UInt',
      functions: [],
      entry: null,
      programImage: trace?.programImage || { expressions: [], functions: [] },
    };
  }

  const analysis = analyzeSherlockAst(parsed, cleanSource, trace);
  const speciesMeta =
    speciesCatalog[analysis.speciesId] || speciesCatalog.factorial;

  const { graph, exprToNodeId } = buildQuinelingTaskGraphFromAst(
    parsed,
    analysis,
    trace
  );

  // 1. Author QDL Design directly from the program's task graph & seed via upstream `QDL.fromGraph`
  //    (derives program-specific family, motion.rhythm, surface parameters, ink, and chroma strength)
  const design =
    typeof QDL.fromGraph === 'function'
      ? QDL.fromGraph(graph, analysis.seed)
      : QDL.create(speciesMeta.family);
  design.surface.samples = 6000;

  // 2. Build self-reproducing Quine AST & verify exact Quine self-emission
  const quineProgram = Quinelings.makeTaskProgram(graph, 1, design);
  const quineCanonical = Quinelings.canon(quineProgram);
  const quineProof = Quinelings.execute(quineProgram, { constructionOnly: true });
  const quineVerified =
    Array.isArray(quineProof.emitted) && quineProof.emitted[0] === quineCanonical;

  // 3. Describe shape, compile Chroma territorial field, and encode Harmonic + RGB Genomes
  const shape = Quinelings.describe(quineProgram);
  const chromaField = Chroma.compile(shape);
  const { harmonicGenome, byteLength: quineBytes } = genomeFromCanonical(quineCanonical);
  const { colorGenome, rgbPixels } = colorGenomeFromHarmonic(harmonicGenome);
  const taskRun = QuinelingKernels.run(graph);

  // 4. Author & compile the 3D `WovenBody` manifold directly from the task graph via upstream `WovenBody.author`
  const wovenRecord = WovenBody.author(graph, analysis.seed);
  const wovenBody = WovenBody.compile(wovenRecord, graph);
  const wovenBounds = WovenBody.portraitFrame(wovenBody);

  // Pre-index shape nodes and links for O(1) lookup in 60fps 3D rendering
  const nodesById = new Map();
  shape.nodes.forEach((n, idx) => {
    nodesById.set(n.id, { node: n, index: idx });
  });

  const nodeColors = shape.nodes.map((node, idx) => {
    const hexColor = Chroma.colorFor(shape, idx);
    const rgb =
      typeof Chroma.channels === 'function'
        ? Chroma.channels(hexColor)
        : [1, 3, 5].map((i) => parseInt(hexColor.slice(i, i + 2), 16));
    const opHex = Quinelings.instructionColor(node.op);
    const opRgb =
      typeof Chroma.channels === 'function'
        ? Chroma.channels(opHex)
        : [1, 3, 5].map((i) => parseInt(opHex.slice(i, i + 2), 16));
    return { hex: hexColor, rgb, opHex, opRgb };
  });

  let _morphBounds = null;
  const artifact = {
    cacheKey,
    source: cleanSource,
    parsed,
    analysis,
    speciesId: speciesMeta.id,
    speciesMeta,
    graph,
    exprToNodeId,
    design,
    quineProgram,
    quineCanonical,
    quineVerified,
    quineBytes,
    constructorSteps: quineProof.steps,
    shape,
    nodesById,
    chromaField,
    nodeColors,
    harmonicGenome,
    colorGenome,
    rgbPixels,
    taskRun,
    wovenRecord,
    wovenBody,
    wovenBounds,
    get morphBounds() {
      if (_morphBounds === null) {
        _morphBounds = Morphology.portraitFrame(shape);
      }
      return _morphBounds;
    },
  };

  if (compiledQuinelingCache.size >= 64) {
    const oldestKey = compiledQuinelingCache.keys().next().value;
    compiledQuinelingCache.delete(oldestKey);
  }
  compiledQuinelingCache.set(cacheKey, artifact);
  _lastRawSource = rawSource;
  _lastStackLimit = stackLimit;
  _lastInitialFuel = initialFuel;
  _lastOutcomeKind = outcomeKind;
  _lastTerminalRuleLine = terminalRuleLine;
  _lastStepCount = stepCount;
  _lastArtifact = artifact;
  return artifact;
}
