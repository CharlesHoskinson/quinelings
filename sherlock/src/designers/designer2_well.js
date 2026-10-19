import * as THREE from 'three/webgpu';
import {
  PALETTE,
  CSS_COLORS,
  clamp,
  lerp,
  roundRect,
  createBrushedMetalTexture,
  createPlaqueTexture,
  tagInspectable,
} from './theme.js';

/**
 * Complete 39-rule semantic decoder table for `sherlock-k-a/1` (Lines A080..A225).
 * Ordered into 6 architectural groups on the 6x7 flush micro-LED floor matrix (y = -2.18).
 */
export const SHERLOCK_K_RULES = [
  // 1. Terminal free rules (charge 0)
  {
    index: 0,
    id: 'A080',
    line: 80,
    shortName: 'Done',
    fullName: 'Done (Normal Termination)',
    charge: 0,
    category: 'terminal',
    categoryLabel: 'Terminal Free Rule (Charge 0)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 0,
    description: 'Publishes terminal Done(v) outcome when evaluation reaches Return with empty frame stack.',
  },
  {
    index: 1,
    id: 'A082',
    line: 82,
    shortName: 'Rejected',
    fullName: 'Rejected (Runtime Error)',
    charge: 0,
    category: 'terminal',
    categoryLabel: 'Terminal Free Rule (Charge 0)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 0,
    description: 'Publishes terminal Rejected(code) outcome on runtime error control state without charging fuel.',
  },
  {
    index: 2,
    id: 'A084',
    line: 84,
    shortName: 'Exhausted',
    fullName: 'Exhausted (Zero Fuel)',
    charge: 0,
    category: 'terminal',
    categoryLabel: 'Terminal Free Rule (Charge 0)',
    color: PALETTE.amber,
    css: CSS_COLORS.amber,
    wallSide: 0,
    description: 'Publishes terminal Exhausted outcome when fuel reaches 0 before a charged step can fire.',
  },

  // 2. Expression dispatch (charge 1)
  {
    index: 3,
    id: 'A102',
    line: 102,
    shortName: 'Literal',
    fullName: 'Literal Constant Evaluation',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.goldBright,
    css: CSS_COLORS.goldBright,
    wallSide: 0,
    description: 'Evaluates an immediate literal constant from ProgramBlock into a Return control value.',
  },
  {
    index: 4,
    id: 'A108',
    line: 108,
    shortName: 'VarFound',
    fullName: 'Variable Lookup Hit',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.gold,
    css: CSS_COLORS.gold,
    wallSide: 0,
    description: 'Resolves lexical identifier via aux/1 EnvGetScan hit and transitions to Return(value).',
  },
  {
    index: 5,
    id: 'A111',
    line: 111,
    shortName: 'VarMissing',
    fullName: 'Error(3): Unbound variable',
    errorCode: 'E3',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 0,
    description: 'Error(3): Unbound variable — raised when aux/1 EnvGetScan misses across all bindings in the active lexical environment.',
  },
  {
    index: 6,
    id: 'A114',
    line: 114,
    shortName: 'Let',
    fullName: 'Let Binding Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 1,
    description: 'Schedules evaluation of let-bound RHS expression and prepares a Let continuation frame.',
  },
  {
    index: 7,
    id: 'A117',
    line: 117,
    shortName: 'BinLeft',
    fullName: 'Binary Left Operand Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.amber,
    css: CSS_COLORS.amber,
    wallSide: 1,
    description: 'Dispatches left operand of binary operator and schedules a Left frame holding RHS & operator.',
  },
  {
    index: 8,
    id: 'A120',
    line: 120,
    shortName: 'Unary',
    fullName: 'Unary Operand Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.copper,
    css: CSS_COLORS.copper,
    wallSide: 1,
    description: 'Dispatches inner operand of unary operator and schedules a Unary continuation frame.',
  },
  {
    index: 9,
    id: 'A123',
    line: 123,
    shortName: 'If',
    fullName: 'Conditional Condition Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 1,
    description: 'Dispatches boolean condition expression of if-then-else and schedules an If branch frame.',
  },
  {
    index: 10,
    id: 'A126',
    line: 126,
    shortName: 'Match',
    fullName: 'Pattern Match Scrutinee Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 1,
    description: 'Dispatches match scrutinee expression and schedules a Match continuation frame.',
  },
  {
    index: 11,
    id: 'A129',
    line: 129,
    shortName: 'Call0',
    fullName: 'Zero-Arg Function Call',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.steelBright,
    css: CSS_COLORS.steelBright,
    wallSide: 1,
    description: 'Directly invokes a zero-argument function call without pushing an Args accumulator frame.',
  },
  {
    index: 12,
    id: 'A131',
    line: 131,
    shortName: 'CallArgs',
    fullName: 'Multi-Arg Call Dispatch',
    charge: 1,
    category: 'dispatch',
    categoryLabel: 'Expression Dispatch (Charge 1)',
    color: PALETTE.amber,
    css: CSS_COLORS.amber,
    wallSide: 1,
    description: 'Evaluates first call argument and schedules an Args continuation frame for remaining arguments.',
  },

  // 3. Frame push & limit (charge 1)
  {
    index: 13,
    id: 'A135',
    line: 135,
    shortName: 'PushFrame',
    fullName: 'Push Frame Below StackLimit',
    charge: 1,
    category: 'stack',
    categoryLabel: 'Frame Push & Limit (Charge 1)',
    color: PALETTE.heatBright,
    css: CSS_COLORS.heatBright,
    wallSide: 2,
    description: 'Verifies current stack depth < stackLimit, commits pending frame onto ControlRows, and enters sub-eval.',
  },
  {
    index: 14,
    id: 'A140',
    line: 140,
    shortName: 'FrameErr',
    fullName: 'Error(4): Stack limit reached',
    errorCode: 'E4',
    charge: 1,
    category: 'stack',
    categoryLabel: 'Frame Push & Limit (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 2,
    description: 'Error(4): Stack limit reached — triggered when Push attempts to exceed the configured stackLimit horizon.',
  },

  // 4. Continuation & operators (charge 1)
  {
    index: 15,
    id: 'A145',
    line: 145,
    shortName: 'BindLet',
    fullName: 'Bind Let Variable & Eval Body',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 2,
    description: 'Rewrites Let frame into Scope frame, binds evaluated value into extended environment, and evaluates let body.',
  },
  {
    index: 16,
    id: 'A149',
    line: 149,
    shortName: 'RightOp',
    fullName: 'Binary Right Operand Transition',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.goldBright,
    css: CSS_COLORS.goldBright,
    wallSide: 2,
    description: 'Replaces Left frame with Right(lhs) frame in-place and begins evaluating the right-hand operand.',
  },
  {
    index: 17,
    id: 'A153',
    line: 153,
    shortName: 'BinPrim',
    fullName: 'Binary Primitive Execution',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.goldBright,
    css: CSS_COLORS.goldBright,
    wallSide: 2,
    description: 'Pops Right frame and dispatches UInt128 / Bool binary operation to the aux/2 ALU array.',
  },
  {
    index: 18,
    id: 'A157',
    line: 157,
    shortName: 'UnPrim',
    fullName: 'Unary Primitive Execution',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.copper,
    css: CSS_COLORS.copper,
    wallSide: 2,
    description: 'Pops Unary frame and computes unary primitive result.',
  },
  {
    index: 19,
    id: 'A161',
    line: 161,
    shortName: 'IfTrue',
    fullName: 'Conditional True Branch',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 2,
    description: 'Pops If frame on Bool(true) and dispatches the consequent (then) expression.',
  },
  {
    index: 20,
    id: 'A165',
    line: 165,
    shortName: 'IfFalse',
    fullName: 'Conditional False Branch',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 2,
    description: 'Pops If frame on Bool(false) and dispatches the alternative (else) expression.',
  },
  {
    index: 21,
    id: 'A169',
    line: 169,
    shortName: 'IfErr',
    fullName: 'Error(5): Non-boolean condition',
    errorCode: 'E5',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 2,
    description: 'Error(5): Non-boolean condition — raised if conditional test evaluates to a non-boolean value.',
  },
  {
    index: 22,
    id: 'A173',
    line: 173,
    shortName: 'StartCases',
    fullName: 'Begin Match Case Scanning',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 2,
    description: 'Pops Match frame and enters Cases control state with evaluated scrutinee value.',
  },
  {
    index: 23,
    id: 'A177',
    line: 177,
    shortName: 'NextArg',
    fullName: 'Evaluate Next Call Argument',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.amber,
    css: CSS_COLORS.amber,
    wallSide: 2,
    description: 'Appends evaluated argument to Args vector in-place and dispatches the next pending argument expression.',
  },
  {
    index: 24,
    id: 'A181',
    line: 181,
    shortName: 'FinishArgs',
    fullName: 'Complete Call Arguments & Invoke',
    charge: 1,
    category: 'continuation',
    categoryLabel: 'Continuation & Operators (Charge 1)',
    color: PALETTE.gold,
    css: CSS_COLORS.gold,
    wallSide: 2,
    description: 'Pops completed Args frame and transitions to Invoke(fn, args).',
  },

  // 5. Function & scope (charge 1)
  {
    index: 25,
    id: 'A185',
    line: 185,
    shortName: 'RetOk',
    fullName: 'Function Return Contract OK',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 3,
    description: 'Verifies return value matches declared return type and pops Return contract frame.',
  },
  {
    index: 26,
    id: 'A190',
    line: 190,
    shortName: 'RetErr',
    fullName: 'Error(6): Return type mismatch',
    errorCode: 'E6',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 3,
    description: 'Error(6): Return type mismatch — raised when function return value violates declared return type.',
  },
  {
    index: 27,
    id: 'A195',
    line: 195,
    shortName: 'RestoreScope',
    fullName: 'Restore Lexical Caller Scope',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 3,
    description: 'Pops Scope frame and restores caller lexical environment after block or call completion.',
  },
  {
    index: 28,
    id: 'A200',
    line: 200,
    shortName: 'LookupFn',
    fullName: 'Function Table Lookup Hit',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.gold,
    css: CSS_COLORS.gold,
    wallSide: 3,
    description: 'Locates target function entry in ProgramBlock function table via aux/1 FindScan.',
  },
  {
    index: 29,
    id: 'A202',
    line: 202,
    shortName: 'MissingFn',
    fullName: 'Error(7): Undefined function',
    errorCode: 'E7',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 3,
    description: 'Error(7): Undefined function — raised when invoked function name is absent from ProgramBlock.',
  },
  {
    index: 30,
    id: 'A204',
    line: 204,
    shortName: 'BindParams',
    fullName: 'Bind Formal Function Parameters',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 3,
    description: 'Validates argument types and binds formal parameters into fresh call environment.',
  },
  {
    index: 31,
    id: 'A206',
    line: 206,
    shortName: 'BindErr',
    fullName: 'Error(8): Parameter binding mismatch',
    errorCode: 'E8',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 3,
    description: 'Error(8): Parameter binding mismatch — raised when call arguments fail arity or parameter type preflight check.',
  },
  {
    index: 32,
    id: 'A208',
    line: 208,
    shortName: 'SchedBody',
    fullName: 'Schedule Function Body Execution',
    charge: 1,
    category: 'function',
    categoryLabel: 'Function & Scope (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 3,
    description: 'Pushes caller Return continuation frame onto Slot A and enters function body expression.',
  },

  // 6. Pattern matching & primitives (charge 1)
  {
    index: 33,
    id: 'A212',
    line: 212,
    shortName: 'NoMatchErr',
    fullName: 'Error(9): Non-exhaustive match',
    errorCode: 'E9',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 3,
    description: 'Error(9): Non-exhaustive match — raised when scrutinee exhausts all match cases without a matching pattern.',
  },
  {
    index: 34,
    id: 'A214',
    line: 214,
    shortName: 'TryPat',
    fullName: 'Test Structural Pattern Arm',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.violet,
    css: CSS_COLORS.violet,
    wallSide: 3,
    description: 'Tests current pattern arm against scrutinee structure and extracts candidate bindings.',
  },
  {
    index: 35,
    id: 'A217',
    line: 217,
    shortName: 'PatMiss',
    fullName: 'Pattern Mismatch Advance',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.steel,
    css: CSS_COLORS.steel,
    wallSide: 0,
    description: 'Advances Cases cursor to the next match arm after a structural pattern mismatch.',
  },
  {
    index: 36,
    id: 'A220',
    line: 220,
    shortName: 'MatchBody',
    fullName: 'Pattern Hit & Eval Arm Body',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.resolveBright,
    css: CSS_COLORS.resolveBright,
    wallSide: 1,
    description: 'Commits destructured pattern bindings to lexical scope and evaluates matched arm body.',
  },
  {
    index: 37,
    id: 'A223',
    line: 223,
    shortName: 'PrimOk',
    fullName: 'Commit Valid Primitive Result',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.goldBright,
    css: CSS_COLORS.goldBright,
    wallSide: 2,
    description: 'Commits verified aux/2 primitive result (no overflow/underflow) into Return(value).',
  },
  {
    index: 38,
    id: 'A225',
    line: 225,
    shortName: 'PrimErr',
    fullName: 'Error(10/11): Checked arithmetic or primitive error',
    errorCode: 'E10/11',
    charge: 1,
    category: 'pattern',
    categoryLabel: 'Pattern Matching & Primitives (Charge 1)',
    color: PALETTE.errorRed,
    css: CSS_COLORS.errorRed,
    wallSide: 3,
    description: 'Error(10/11): Checked arithmetic or primitive error — Error(10) on UInt128 overflow/underflow or Error(11) on invalid primitive domain.',
  },
];

// ============================================================================
// SPATIAL & ARCHITECTURAL CONSTANTS
// ============================================================================
const FUEL_RING_Y = 0.095;
const FUEL_RING_RADIUS = 1.03;
const FUEL_SEGMENTS = 48;

const HOROLOGICAL_RING_COUNT = 6; // R1..R6
const HALF_ARC_SLOT_COUNT = 12;   // R1.A, R1.B .. R6.A, R6.B
const RING_TOP_Y = 0.06;
const RING_BOTTOM_Y = -0.21;
const RING_OUTER_R_TOP = 0.95;
const RING_OUTER_R_BOTTOM = 0.31;

// Nominal 180° Half-Arc slots (machined 165.6° = 0.92π) separated by 14.4° (0.08π) bridge gaps at North (0.5π) and South (1.5π)
const WEST_THETA_START = 0.54 * Math.PI;
const EAST_THETA_START = -0.46 * Math.PI;
const HALF_ARC_THETA_LENGTH = 0.92 * Math.PI;
const LIGHT_PIPE_THETA_LENGTH = 0.88 * Math.PI;

// Central True Open-Bore 10-Sector Control Optical Stator (y = -0.24, clear sightline for r < 0.135)
const CONTROL_STATOR_Y = -0.24;
const OPEN_BORE_RADIUS = 0.135;
const STATOR_INNER_R = 0.142;
const STATOR_OUTER_R = 0.216;
const STATOR_MID_R = (STATOR_INNER_R + STATOR_OUTER_R) * 0.5;
const STATOR_SECTOR_COUNT = 10;

// Deep Hollow 3D Chamber & 39-Rule Floor (spacious 3.12 × 3.12 × 3.40 interior atrium)
const CHAMBER_TOP_Y = -0.35;
const CHAMBER_BOTTOM_Y = -3.35;
const WELL_FLOOR_Y = -3.38;
const WELL_BASE_Y = -3.40;
const OUTER_HALF = 1.68;
const TERRACE_COUNT = 8; // D0..D7 clean stepped depth terraces

// 3 Semantic Frame Color Families (`ENV`, `OP`, `GATE`) with Distinct Variant Hues
// - ENV Family: Return = Deep Emerald-Teal (0x0d9488), Scope = Luminous Sky-Cyan (0x38bdf8)
// - OP Family: Left/Unary = Warm Amber (0xf59e0b), Args (0 evaluated) = Copper-Orange (0xf97316), Right & Args (>0 evaluated) = Luminous Gold (0xfbbf24)
// - GATE Family: If = Royal Indigo (0x6366f1), Match = Electric Violet (0x8b5cf6), Let = Amethyst (0xc084fc)
const HEX_ENV_RETURN_TEAL = 0x0d9488;
const HEX_ENV_SCOPE_CYAN = 0x38bdf8;
const HEX_ENV_CYAN = 0x2dd4bf;
const HEX_OP_AMBER = 0xf59e0b;
const HEX_OP_COPPER = 0xf97316;
const HEX_OP_GOLD = 0xfbbf24;
const HEX_GATE_INDIGO = 0x6366f1;
const HEX_GATE_VIOLET = 0x8b5cf6;
const HEX_GATE_AMETHYST = 0xc084fc;
const HEX_IDLE_SLATE = 0x1e293b;
const HEX_CRIMSON = 0xe11d48;

const CSS_ENV_RETURN_TEAL = '#0d9488';
const CSS_ENV_SCOPE_CYAN = '#38bdf8';
const CSS_ENV_CYAN = '#2dd4bf';
const CSS_OP_AMBER = '#f59e0b';
const CSS_OP_COPPER = '#f97316';
const CSS_OP_GOLD = '#fbbf24';
const CSS_GATE_INDIGO = '#6366f1';
const CSS_GATE_VIOLET = '#8b5cf6';
const CSS_GATE_AMETHYST = '#c084fc';
const CSS_CRIMSON = '#e11d48';
const CSS_IDLE_SLATE = '#475569';

/**
 * The 10 radial `Control` sectors (`0..9`) of `reference_types.rs`:
 * `['EVAL', 'PUSH', 'RETURN', 'INVOKE', 'ENTER', 'BOUND', 'CASES', 'MATCH', 'PRIM', 'ERROR']`
 */
const CONTROL_STATOR_SECTORS = [
  { index: 0, label: 'EVAL',   badge: 'EVAL',   color: HEX_OP_GOLD,     css: CSS_OP_GOLD },
  { index: 1, label: 'PUSH',   badge: 'PUSH',   color: HEX_OP_AMBER,    css: CSS_OP_AMBER },
  { index: 2, label: 'RETURN', badge: 'RET',    color: HEX_ENV_CYAN,    css: CSS_ENV_CYAN },
  { index: 3, label: 'INVOKE', badge: 'INVOKE', color: HEX_OP_AMBER,    css: CSS_OP_AMBER },
  { index: 4, label: 'ENTER',  badge: 'ENTER',  color: HEX_OP_AMBER,    css: CSS_OP_AMBER },
  { index: 5, label: 'BOUND',  badge: 'BOUND',  color: HEX_ENV_CYAN,    css: CSS_ENV_CYAN },
  { index: 6, label: 'CASES',  badge: 'CASES',  color: HEX_OP_AMBER,    css: CSS_OP_AMBER },
  { index: 7, label: 'MATCH',  badge: 'MATCH',  color: HEX_ENV_CYAN,    css: CSS_ENV_CYAN },
  { index: 8, label: 'PRIM',   badge: 'PRIM',   color: HEX_OP_GOLD,     css: CSS_OP_GOLD },
  { index: 9, label: 'ERROR',  badge: 'ERR',    color: HEX_CRIMSON,     css: CSS_CRIMSON },
];

// Pre-allocated module-scope scratch objects for zero-allocation `.update(stepState)`
const _scratchMat4 = new THREE.Matrix4();
const _scratchPos = new THREE.Vector3();
const _scratchQuat = new THREE.Quaternion();
const _scratchScale = new THREE.Vector3(1, 1, 1);
const _scratchEuler = new THREE.Euler();
const _scratchColor = new THREE.Color();
const _scratchColorB = new THREE.Color();

/**
 * Maps a recursion terrace index (0..7) to its physical Y center in the deep hollow 3D chamber (`y = -0.35` down to `-3.35`).
 */
function getTerraceY(terraceIndex) {
  const d = clamp(terraceIndex, 0, TERRACE_COUNT - 1);
  return lerp(CHAMBER_TOP_Y - 0.18, CHAMBER_BOTTOM_Y + 0.18, d / (TERRACE_COUNT - 1));
}

/**
 * Maps a recursion terrace index (0..7) to its stepped inner half-width inside the spacious 3.12 × 3.12 atrium.
 */
function getTerraceInnerHalf(terraceIndex) {
  const d = clamp(terraceIndex, 0, TERRACE_COUNT - 1);
  return lerp(1.56, 1.52, d / (TERRACE_COUNT - 1));
}

/**
 * Returns true when a `Frame::Args` has locked in at least 1 evaluated argument (via Rule 177 `NextArg`).
 */
function isArgsFrameLocked(frame) {
  if (!frame || frame.kind !== 'Args') return false;
  if (typeof frame.evaluatedCount === 'number') return frame.evaluatedCount > 0;
  if (Array.isArray(frame.evaluated)) return frame.evaluated.length > 0;
  if (Array.isArray(frame.values)) return frame.values.length > 0;
  const detail = frame.detail;
  if (typeof detail === 'string' && detail.startsWith('done:')) {
    return !detail.startsWith('done: 0');
  }
  const label = frame.label;
  if (typeof label === 'string' && label.includes('/')) {
    return !label.includes('(0/');
  }
  return false;
}

/**
 * Classifies a Sherlock `Frame` into its distinct variant hue within the 3 Semantic Families (`ENV`, `OP`, `GATE`):
 * - `ENV`: `Return` -> Deep Emerald-Teal (`0x0d9488`), `Scope` -> Luminous Sky-Cyan (`0x38bdf8`)
 * - `OP`: `Left` / `Unary` -> Warm Amber (`0xf59e0b`), `Right` -> Luminous Gold (`0xfbbf24`),
 *         `Args` -> Copper-Orange (`0xf97316`) when 0 args evaluated, shifting to Luminous Gold (`0xfbbf24`) after Rule 177 (`NextArg`)
 * - `GATE`: `If` -> Royal Indigo (`0x6366f1`), `Match` -> Electric Violet (`0x8b5cf6`), `Let` -> Amethyst (`0xc084fc`)
 */
function getFrameSemanticHex(frame) {
  if (!frame) return HEX_IDLE_SLATE;
  const kind = frame.kind || '';
  if (kind === 'Return') return HEX_ENV_RETURN_TEAL;
  if (kind === 'Scope') return HEX_ENV_SCOPE_CYAN;
  if (kind === 'Right') return HEX_OP_GOLD;
  if (kind === 'Args') return isArgsFrameLocked(frame) ? HEX_OP_GOLD : HEX_OP_COPPER;
  if (kind === 'Left' || kind === 'Unary') return HEX_OP_AMBER;
  if (kind === 'If') return HEX_GATE_INDIGO;
  if (kind === 'Match') return HEX_GATE_VIOLET;
  if (kind === 'Let') return HEX_GATE_AMETHYST;
  return HEX_OP_AMBER;
}

function getFrameSemanticCss(frame) {
  if (!frame) return CSS_IDLE_SLATE;
  const kind = frame.kind || '';
  if (kind === 'Return') return CSS_ENV_RETURN_TEAL;
  if (kind === 'Scope') return CSS_ENV_SCOPE_CYAN;
  if (kind === 'Right') return CSS_OP_GOLD;
  if (kind === 'Args') return isArgsFrameLocked(frame) ? CSS_OP_GOLD : CSS_OP_COPPER;
  if (kind === 'Left' || kind === 'Unary') return CSS_OP_AMBER;
  if (kind === 'If') return CSS_GATE_INDIGO;
  if (kind === 'Match') return CSS_GATE_VIOLET;
  if (kind === 'Let') return CSS_GATE_AMETHYST;
  return CSS_OP_AMBER;
}

function getFrameFamilyBadge(frame) {
  if (!frame) return 'IDLE';
  const kind = frame.kind || '';
  if (kind === 'Return' || kind === 'Scope') return 'ENV';
  if (kind === 'If' || kind === 'Match' || kind === 'Let') return 'GATE';
  return 'OP';
}

/**
 * Maps a Sherlock `Control` kind or terminal state to its 10-sector stator index (`0..9`).
 */
function resolveControlSectorIndex(controlKind, isDoneState, isErrorState) {
  if (isErrorState || controlKind === 'Error' || controlKind === 'Rejected' || controlKind === 'Exhausted') {
    return 9; // ERROR
  }
  if (isDoneState || controlKind === 'Done' || controlKind === 'Return') {
    return 2; // RETURN
  }
  switch (controlKind) {
    case 'Eval':
      return 0;
    case 'Push':
      return 1;
    case 'Invoke':
      return 3;
    case 'Enter':
      return 4;
    case 'Bound':
      return 5;
    case 'Cases':
      return 6;
    case 'CaseResult':
    case 'Match':
      return 7;
    case 'PrimitiveResult':
    case 'Prim':
      return 8;
    default:
      return 0;
  }
}

/**
 * Formats a concise binding string (`n = 4` or `root`) for a chronological frame slot
 * without allocating intermediate arrays in the hot path when unchanged.
 */
function formatSlotEnvCompact(chronoFrames, slotIdx, activeBindings) {
  const frame = chronoFrames[slotIdx];
  if (!frame) return 'idle';
  const bindings = frame.bindings;
  if (Array.isArray(bindings) && bindings.length > 0) {
    const b0 = bindings[0];
    return `${b0.name}=${b0.valueSummary}`;
  }
  if (frame.kind === 'Return' || frame.kind === 'Scope') {
    return 'root';
  }
  // For Frame::Right / Frame::Unary (which do not store an Environment in reference_types.rs),
  // the enclosing activation's lexical environment is either saved in the next chronological
  // Return/Scope frame (pushed by Rule 208 when calling the child function) or in activeBindings.
  for (let j = slotIdx + 1; j < chronoFrames.length; j += 1) {
    const nextFrame = chronoFrames[j];
    if (nextFrame && Array.isArray(nextFrame.bindings) && nextFrame.bindings.length > 0) {
      const b0 = nextFrame.bindings[0];
      return `${b0.name}=${b0.valueSummary}`;
    }
  }
  if (Array.isArray(activeBindings) && activeBindings.length > 0) {
    const b0 = activeBindings[0];
    return `${b0.name}=${b0.valueSummary}`;
  }
  return 'root';
}

/**
 * Formats the top-surface Half-Arc Slot Micro-Plaque (`R1A · RET:UInt (root)` or `R1B · 4 * [?] (n=4)`).
 */
function formatHalfArcPlaqueCopy(slotCode, frame, envSummary) {
  if (!frame) {
    return {
      title: `${slotCode} · IDLE`,
      subtitle: 'Unoccupied half-ring slot',
      badge: 'IDLE',
    };
  }
  const kind = frame.kind || 'Frame';
  const rawLabel = String(frame.label || kind)
    .replace(/\[hole\]/gi, '[?]')
    .replace(/^return\s*:\s*/i, 'RET:')
    .replace(/^restore scope$/i, 'SCOPE')
    .trim();

  let shortExpr = rawLabel;
  if (kind === 'If') {
    shortExpr = 'IF [?]';
  } else if (kind === 'Match') {
    shortExpr = 'MATCH [?]';
  } else if (kind === 'Let') {
    shortExpr = rawLabel.replace(/\s*=\s*\[\?\]$/, '=[?]');
  } else if (shortExpr.length > 15) {
    shortExpr = `${shortExpr.slice(0, 14)}…`;
  }

  return {
    title: `${slotCode} · ${shortExpr} (${envSummary})`,
    subtitle: `${getFrameFamilyBadge(frame)} · ${kind} · ${frame.detail || envSummary}`,
    badge: getFrameFamilyBadge(frame),
  };
}

/**
 * Formats the Central Open Sapphire Live Readout Lens plaque copy (`EVAL · n * fact(n-1)`, `Rule A149 · n = 4`, `CTRL // EVAL`).
 */
function formatControlCoreLensCopy(step, sectorMeta, isDoneState, isErrorState, traceOutcome) {
  if (!step) {
    return {
      title: 'EVAL · Program Entry',
      subtitle: 'sherlock-k-a/1 · Ready',
      badge: 'CTRL // EVAL',
    };
  }

  const ruleId = step.ruleId || `A${String(step.ruleLine || 80).padStart(3, '0')}`;
  const activeBindings = step.after?.envRoots?.[0]?.bindings || [];
  const envStr =
    activeBindings.length > 0
      ? activeBindings
          .slice(0, 2)
          .map((b) => `${b.name} = ${b.valueSummary}`)
          .join(', ')
      : 'root scope';

  if (isDoneState) {
    const valText =
      traceOutcome?.summary ||
      step.controlValue?.summary ||
      String(step.controlSummary || '').replace(/^Done\((.*)\)$/i, '$1') ||
      'ok';
    return {
      title: `DONE · ${valText}`,
      subtitle: `Rule ${ruleId} · ${envStr}`,
      badge: 'CTRL // DONE',
    };
  }

  if (isErrorState) {
    const errText = step.controlSummary || traceOutcome?.summary || 'Fault';
    return {
      title: `ERROR · ${errText}`,
      subtitle: `Rule ${ruleId} · ${step.ruleName || 'Trap'}`,
      badge: 'CTRL // ERR',
    };
  }

  const rawCtrl = String(step.controlSummary || '')
    .replace(/\[hole\]/gi, '[?]')
    .trim();

  let detailText = rawCtrl;
  if (sectorMeta.label === 'PUSH') {
    const topFrame = step.after?.frames?.[0];
    if (topFrame) {
      const fClean = String(topFrame.label || topFrame.kind).replace(/\[hole\]/gi, '[?]');
      detailText = `${topFrame.kind}(${fClean})`;
    } else {
      detailText = rawCtrl.replace(/^Push\((.*)\)$/i, '$1');
    }
  } else if (sectorMeta.label === 'RETURN') {
    detailText = rawCtrl.replace(/^Return\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'INVOKE') {
    detailText = rawCtrl.replace(/^Invoke\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'ENTER') {
    detailText = rawCtrl.replace(/^Enter\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'BOUND') {
    detailText = rawCtrl.replace(/^Bound\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'CASES') {
    detailText = rawCtrl.replace(/^Cases\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'MATCH') {
    detailText = rawCtrl.replace(/^CaseResult\((.*)\)$/i, '$1');
  } else if (sectorMeta.label === 'PRIM') {
    detailText = rawCtrl.replace(/^PrimOk\((.*)\)$/i, '$1').replace(/^PrimErr\((.*)\)$/i, 'Err $1');
  }

  return {
    title: `${sectorMeta.label} · ${detailText}`,
    subtitle: `Rule ${ruleId} · ${envStr}`,
    badge: `CTRL // ${sectorMeta.badge}`,
  };
}

/**
 * Creates a precision-chamfered 3D annular arc geometry for a 180° Half-Ring Arc or a 10-Sector Stator Pad.
 * Uses `ExtrudeGeometry` on a closed 2D annular sector shape so both radial rims AND the North/South
 * bridge gap end-caps have crisp machined bevels.
 */
function createChamferedArcGeometry({
  innerR,
  outerR,
  thetaStart,
  thetaLength,
  thickness = 0.028,
  bevel = 0.004,
  curveSegments = 36,
}) {
  const shape = new THREE.Shape();
  const t0 = thetaStart;
  const t1 = thetaStart + thetaLength;
  const safeOuter = Math.max(innerR + 0.01, outerR - bevel);
  const safeInner = Math.max(0.01, innerR + bevel);

  shape.absarc(0, 0, safeOuter, t0, t1, false);
  shape.absarc(0, 0, safeInner, t1, t0, true);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments,
  });

  // Rotate into the horizontal XZ plane so top surface sits at y = 0
  geo.rotateX(-Math.PI * 0.5);
  geo.translate(0, -thickness, 0);
  return geo;
}

/**
 * Creates a crisp horological tick-graduation & slot inscription texture for a 180° Half-Arc.
 */
function createSplitArcDialTexture(slotCode, isEast) {
  if (typeof document === 'undefined') {
    const data = new Uint8Array([216, 221, 230, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);

  const tStart = isEast ? EAST_THETA_START : WEST_THETA_START;
  const tickCount = 28;
  for (let i = 0; i <= tickCount; i += 1) {
    const frac = i / tickCount;
    const theta = tStart + frac * HALF_ARC_THETA_LENGTH;
    const isMajor = i % 4 === 0;
    const rInner = size * (isMajor ? 0.432 : 0.448);
    const rOuter = size * 0.484;
    ctx.strokeStyle = isMajor ? 'rgba(20, 23, 31, 0.72)' : 'rgba(20, 23, 31, 0.34)';
    ctx.lineWidth = isMajor ? 2.4 : 1.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(theta) * rInner, cy - Math.sin(theta) * rInner);
    ctx.lineTo(cx + Math.cos(theta) * rOuter, cy - Math.sin(theta) * rOuter);
    ctx.stroke();
  }

  // Engraved slot code near the 2 quarter-arc shoulders of the half-ring
  ctx.fillStyle = 'rgba(20, 23, 31, 0.78)';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rText = size * 0.456;
  const shoulderOffsets = [-0.28 * Math.PI, 0.28 * Math.PI];
  const centerTheta = isEast ? 0 : Math.PI;

  for (let s = 0; s < shoulderOffsets.length; s += 1) {
    const theta = centerTheta + shoulderOffsets[s];
    const px = cx + Math.cos(theta) * rText;
    const py = cy - Math.sin(theta) * rText;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-theta + Math.PI * 0.5);
    ctx.fillText(slotCode, 0, 0);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a crisp static 10-sector dial ring texture for the central `Control` Stator Ring (`0..9`).
 * Aligned with `RingGeometry(STATOR_INNER_R, STATOR_OUTER_R, 80)` rotated by `rotation.x = -Math.PI * 0.5`.
 */
function createControlStatorDialTexture() {
  if (typeof document === 'undefined') {
    const data = new Uint8Array([22, 29, 41, 255]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  ctx.clearRect(0, 0, size, size);

  const sectorStep = (Math.PI * 2) / STATOR_SECTOR_COUNT;
  const rOuterPx = size * 0.49;
  const rInnerPx = size * (STATOR_INNER_R / STATOR_OUTER_R) * 0.5;
  const rMidPx = (rOuterPx + rInnerPx) * 0.5;

  // Fine radial degree ticks around the 10-sector stator perimeter
  const fineTicks = 100;
  for (let t = 0; t < fineTicks; t += 1) {
    const theta = (t / fineTicks) * Math.PI * 2;
    const isBoundary = t % 10 === 0;
    const r0 = isBoundary ? rInnerPx + 4 : rOuterPx - 16;
    const r1 = rOuterPx - 3;
    ctx.strokeStyle = isBoundary
      ? 'rgba(244, 240, 232, 0.65)'
      : 'rgba(244, 240, 232, 0.24)';
    ctx.lineWidth = isBoundary ? 2.6 : 1.2;
    const BoundaryTheta = theta - sectorStep * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(BoundaryTheta) * r0, cy - Math.sin(BoundaryTheta) * r0);
    ctx.lineTo(cx + Math.cos(BoundaryTheta) * r1, cy - Math.sin(BoundaryTheta) * r1);
    ctx.stroke();
  }

  // Engraved 10 `Control` variant inscriptions (`EVAL`, `PUSH`, `RETURN`, ...)
  for (let i = 0; i < STATOR_SECTOR_COUNT; i += 1) {
    const sector = CONTROL_STATOR_SECTORS[i];
    // Sector i is centered at angle theta_i (starting at North 0.5π and stepping clockwise)
    const theta = Math.PI * 0.5 - i * sectorStep;
    const px = cx + Math.cos(theta) * rMidPx;
    const py = cy - Math.sin(theta) * rMidPx;

    ctx.save();
    ctx.translate(px, py);
    let rot = -theta + Math.PI * 0.5;
    // Keep text upright on the lower hemisphere
    if (Math.sin(theta) < -0.15) {
      rot += Math.PI;
    }
    ctx.rotate(rot);

    // Subtle dark backing pill for maximum legibility over bright active sector pads
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    roundRect(ctx, -46, -15, 92, 30, 6);
    ctx.fill();

    ctx.strokeStyle = sector.css;
    ctx.lineWidth = 1.8;
    roundRect(ctx, -46, -15, 92, 30, 6);
    ctx.stroke();

    ctx.fillStyle = '#f4f0e8';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sector.label, 0, 1);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a clean 4-sided rectangular stepped terrace with a subtle top chamfer trim.
 * Exposes `southWallGroup` in `userData` so `interior` and `frames` cutaway views can smoothly retract the front-south wall.
 */
function createSteppedTerrace({
  outerHalf,
  innerHalf,
  yCenter,
  height,
  material,
  trimMaterial,
  trackGeo,
}) {
  const tierGroup = new THREE.Group();
  tierGroup.position.y = yCenter;

  const southWallGroup = new THREE.Group();
  tierGroup.add(southWallGroup);
  tierGroup.userData.southWallGroup = southWallGroup;

  const thickness = outerHalf - innerHalf;
  const wallMid = (outerHalf + innerHalf) * 0.5;
  const fullSpan = outerHalf * 2;
  const innerSpan = innerHalf * 2;

  const nsGeo = trackGeo(new THREE.BoxGeometry(fullSpan, height, thickness));
  const northMesh = new THREE.Mesh(nsGeo, material);
  northMesh.position.set(0, 0, -wallMid);
  northMesh.receiveShadow = true;

  const southMesh = new THREE.Mesh(nsGeo, material);
  southMesh.position.set(0, 0, wallMid);
  southMesh.receiveShadow = true;
  southWallGroup.add(southMesh);

  const weGeo = trackGeo(new THREE.BoxGeometry(thickness, height, innerSpan));
  const westMesh = new THREE.Mesh(weGeo, material);
  westMesh.position.set(-wallMid, 0, 0);
  westMesh.receiveShadow = true;

  const eastMesh = new THREE.Mesh(weGeo, material);
  eastMesh.position.set(wallMid, 0, 0);
  eastMesh.receiveShadow = true;

  tierGroup.add(northMesh, westMesh, eastMesh);

  if (trimMaterial) {
    const ledgeThick = 0.008;
    const ledgeH = 0.004;
    const ledgeMid = innerHalf + ledgeThick * 0.5;

    const ledgeNSGeo = trackGeo(
      new THREE.BoxGeometry(innerHalf * 2 + ledgeThick * 2, ledgeH, ledgeThick)
    );
    const ledgeWEGeo = trackGeo(new THREE.BoxGeometry(ledgeThick, ledgeH, innerHalf * 2));

    const ln = new THREE.Mesh(ledgeNSGeo, trimMaterial);
    ln.position.set(0, height * 0.5, -ledgeMid);
    const ls = new THREE.Mesh(ledgeNSGeo, trimMaterial);
    ls.position.set(0, height * 0.5, ledgeMid);
    southWallGroup.add(ls);

    const lw = new THREE.Mesh(ledgeWEGeo, trimMaterial);
    lw.position.set(-ledgeMid, height * 0.5, 0);
    const le = new THREE.Mesh(ledgeWEGeo, trimMaterial);
    le.position.set(ledgeMid, height * 0.5, 0);

    tierGroup.add(ln, lw, le);
  }

  return tierGroup;
}

/**
 * Creates a razor-thin 4-sided recessed light-ring loop at a given half-span.
 */
function createRecessedLightLoop(halfSpan, thickness, height, material, trackGeo) {
  const loopGroup = new THREE.Group();
  const nsGeo = trackGeo(new THREE.BoxGeometry(halfSpan * 2, height, thickness));
  const weGeo = trackGeo(new THREE.BoxGeometry(thickness, height, halfSpan * 2 - thickness * 2));

  const n = new THREE.Mesh(nsGeo, material);
  n.position.set(0, 0, -halfSpan);
  const s = new THREE.Mesh(nsGeo, material);
  s.position.set(0, 0, halfSpan);
  const w = new THREE.Mesh(weGeo, material);
  w.position.set(-halfSpan, 0, 0);
  const e = new THREE.Mesh(weGeo, material);
  e.position.set(halfSpan, 0, 0);

  loopGroup.add(n, s, w, e);
  loopGroup.userData.southMesh = s;
  return loopGroup;
}

/**
 * Creates a single static 2048x2048 floor label overlay texture containing all 39 rule
 * inscriptions (`A080 Done` .. `A225 PrimErr`) and the `SHERLOCK-K-A/1` ROM signature bar.
 * This allows the entire 39-rule floor to render with 1 `InstancedMesh` + 1 static overlay plane!
 */
function createStatic39RuleFloorOverlayTexture(gridConfig) {
  if (typeof document === 'undefined') {
    const data = new Uint8Array([0, 0, 0, 0]);
    const tex = new THREE.DataTexture(data, 1, 1);
    tex.needsUpdate = true;
    return tex;
  }

  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  const span = gridConfig.floorSpan;
  const halfSpan = span * 0.5;
  const toPxX = (worldX) => ((worldX + halfSpan) / span) * size;
  const toPxY = (worldZ) => ((worldZ + halfSpan) / span) * size;
  const pxPerUnit = size / span;

  const cellWpx = gridConfig.cellW * pxPerUnit;
  const cellDpx = gridConfig.cellD * pxPerUnit;

  for (let idx = 0; idx < SHERLOCK_K_RULES.length; idx += 1) {
    const rule = SHERLOCK_K_RULES[idx];
    const col = idx % gridConfig.cols;
    const row = Math.floor(idx / gridConfig.cols);
    const cellX = gridConfig.startX + col * gridConfig.stepX;
    const cellZ = gridConfig.startZ + row * gridConfig.stepZ;

    const x0 = toPxX(cellX) - cellWpx * 0.5;
    const y0 = toPxY(cellZ) - cellDpx * 0.5;

    // Subtle precision hairline bezel around each rule slot
    ctx.strokeStyle = 'rgba(244, 240, 232, 0.16)';
    ctx.lineWidth = 2;
    roundRect(ctx, x0 + 6, y0 + 6, cellWpx - 12, cellDpx - 12, 12);
    ctx.stroke();

    // Top-left Rule ID (e.g., A135)
    ctx.fillStyle = rule.css;
    ctx.font = '700 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(rule.id, x0 + 18, y0 + 36);

    // Top-right charge indicator (0F vs 1F)
    ctx.fillStyle = 'rgba(244, 240, 232, 0.45)';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(rule.charge === 0 ? '0F' : '1F', x0 + cellWpx - 18, y0 + 36);

    // Center rule shortName
    ctx.fillStyle = '#f4f0e8';
    ctx.font = '600 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(rule.shortName.slice(0, 11), x0 + 18, y0 + cellDpx * 0.53);

    // Bottom line number & category dot
    ctx.fillStyle = rule.css;
    ctx.beginPath();
    ctx.arc(x0 + 24, y0 + cellDpx - 32, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillText(`L${rule.line}`, x0 + 36, y0 + cellDpx - 31);
  }

  // Draw the 3-slot signature inscription bar in Row 6, Cols 3..5
  const hubX = gridConfig.startX + 4 * gridConfig.stepX;
  const hubZ = gridConfig.startZ + 6 * gridConfig.stepZ;
  const hubWpx = (gridConfig.stepX * 2 + gridConfig.cellW) * pxPerUnit;
  const hubDpx = gridConfig.cellD * pxPerUnit;
  const hx0 = toPxX(hubX) - hubWpx * 0.5;
  const hy0 = toPxY(hubZ) - hubDpx * 0.5;

  ctx.fillStyle = 'rgba(17, 22, 33, 0.94)';
  roundRect(ctx, hx0 + 4, hy0 + 4, hubWpx - 8, hubDpx - 8, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, hx0 + 4, hy0 + 4, hubWpx - 8, hubDpx - 8, 12);
  ctx.stroke();

  ctx.fillStyle = '#d4af37';
  ctx.font = '700 28px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHERLOCK · K-A/1 · 39-RULE ROM', hx0 + hubWpx * 0.5, hy0 + hubDpx * 0.5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Designer 2:
 * - Outer 48-Segment Draining Fuel Ring (`y = 0.095, r = 1.03`, 1 `THREE.InstancedMesh`)
 * - 6 Concentric Split-Arc Semantic Rings (`12` Independent 180° Half-Ring Arcs: `R1.A, R1.B .. R6.A, R6.B`, `y = 0.06` down to `-0.21`)
 * - Central 10-Sector `Control` Optical Stator, Directional Radial Transfer Pointer & Open Sapphire Live Readout Lens (`y = -0.24`, replacing the Ruby)
 * - Hollow 3D Stepped Chamber (`y = -0.35` to `-2.15`) + Flush Instanced 39-Rule Floor (`y = -2.18`)
 */
export function createWellSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer2_SplitArcRingsAndControlStatorCore';

  const disposableGeometries = [];
  const disposableMaterials = [];
  const disposableTextures = [];

  const trackGeo = (g) => {
    disposableGeometries.push(g);
    return g;
  };
  const trackMat = (m) => {
    disposableMaterials.push(m);
    return m;
  };
  const trackTex = (t) => {
    if (t) disposableTextures.push(t);
    return t;
  };

  // Shared cached brushed silver-rhodium texture from theme.js
  const brushedSilverTex = createBrushedMetalTexture({
    size: 256,
    baseHex: '#d8dde6',
    streakAlpha: 0.08,
  });

  // ==========================================================================
  // 1. OUTER DRAINING FUEL RING (`y = 0.095`, `radius = 1.03`)
  //    48 radial segments batched into a single `THREE.InstancedMesh` (1 draw call).
  // ==========================================================================
  const fuelRingGroup = new THREE.Group();
  fuelRingGroup.name = 'OuterDrainingFuelRing';
  fuelRingGroup.position.y = FUEL_RING_Y;
  group.add(fuelRingGroup);

  const fuelTrackGeo = trackGeo(
    new THREE.RingGeometry(FUEL_RING_RADIUS - 0.025, FUEL_RING_RADIUS + 0.025, 64)
  );
  const fuelTrackMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x141a26,
      roughness: 0.52,
      metalness: 0.55,
    })
  );
  const fuelTrackMesh = new THREE.Mesh(fuelTrackGeo, fuelTrackMat);
  fuelTrackMesh.rotation.x = -Math.PI * 0.5;
  fuelTrackMesh.position.y = -0.002;
  fuelRingGroup.add(fuelTrackMesh);

  const fuelSegGeo = trackGeo(new THREE.BoxGeometry(0.018, 0.008, 0.036));
  const fuelSegMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.24,
      metalness: 0.68,
    })
  );
  const fuelInstancedMesh = new THREE.InstancedMesh(fuelSegGeo, fuelSegMat, FUEL_SEGMENTS);
  fuelInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  for (let s = 0; s < FUEL_SEGMENTS; s += 1) {
    const angle = (s / FUEL_SEGMENTS) * Math.PI * 2 - Math.PI * 0.5;
    _scratchPos.set(
      Math.cos(angle) * FUEL_RING_RADIUS,
      0.004,
      Math.sin(angle) * FUEL_RING_RADIUS
    );
    _scratchEuler.set(0, -angle + Math.PI * 0.5, 0);
    _scratchQuat.setFromEuler(_scratchEuler);
    _scratchScale.set(1, 1, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    fuelInstancedMesh.setMatrixAt(s, _scratchMat4);

    _scratchColor.setHex(PALETTE.gold);
    fuelInstancedMesh.setColorAt(s, _scratchColor);
  }
  fuelInstancedMesh.instanceMatrix.needsUpdate = true;
  if (fuelInstancedMesh.instanceColor) {
    fuelInstancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    fuelInstancedMesh.instanceColor.needsUpdate = true;
  }
  fuelRingGroup.add(fuelInstancedMesh);

  tagInspectable(fuelRingGroup, {
    type: 'outer-fuel-ring',
    id: 'outer-draining-fuel-ring',
    title: 'Outer Draining Fuel Ring (48 Instanced Segments)',
    subtitle: 'Tracks Remaining Execution Fuel at y = 0.095, radius = 1.03',
    details: [
      'Placement: Perimeter rim at y = 0.095, radius = 1.03 around the central aperture',
      'WebGPU Batching: 48 radial segments rendered in 1 THREE.InstancedMesh draw call',
      'Behavior: Drains smoothly with step.after.fuel / initialFuel',
    ],
  });

  // ==========================================================================
  // 2. 6 CONCENTRIC SPLIT-ARC SEMANTIC RINGS (`12` INDEPENDENT 180° HALF-ARCS:
  //    `R1.A, R1.B .. R6.A, R6.B`, `y = 0.06` down to `-0.21`)
  //    - West 180° Half-Arc (`Slot A = 2r`, `θ ∈ [0.54π, 1.46π]`): Chronological frame `2r`
  //    - East 180° Half-Arc (`Slot B = 2r + 1`, `θ ∈ [-0.46π, 0.46π]`): Chronological frame `2r + 1`
  //    - Separated by crisp 14.4° architectural bridge gaps at North (12 o'clock) & South (6 o'clock)
  // ==========================================================================
  const splitRingsGroup = new THREE.Group();
  splitRingsGroup.name = 'SixSplitArcSemanticRings';
  group.add(splitRingsGroup);

  const halfArcOuterMatEven = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb4b8be,
      map: brushedSilverTex,
      roughness: 0.25,
      metalness: 0.90,
      clearcoat: 0.35,
      clearcoatRoughness: 0.22,
    })
  );
  const halfArcOuterMatOdd = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xc8a45d,
      roughness: 0.28,
      metalness: 0.90,
      clearcoat: 0.25,
      clearcoatRoughness: 0.25,
    })
  );
  const darkSapphireChannelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.52,
      metalness: 0.48,
    })
  );

  // 24 architectural bridge gap isolator clasps (2 per Half-Arc at North/South gap shoulders) in 1 InstancedMesh
  const claspGeo = trackGeo(new THREE.BoxGeometry(0.016, 0.014, 0.022));
  const claspMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      roughness: 0.26,
      metalness: 0.86,
    })
  );
  const bridgeClaspsInstancedMesh = new THREE.InstancedMesh(
    claspGeo,
    claspMat,
    HALF_ARC_SLOT_COUNT * 2
  );
  bridgeClaspsInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  splitRingsGroup.add(bridgeClaspsInstancedMesh);

  const halfArcSlots = [];
  const ringRadii = [];

  for (let r = 0; r < HOROLOGICAL_RING_COUNT; r += 1) {
    const baseY = lerp(RING_TOP_Y, RING_BOTTOM_Y, r / (HOROLOGICAL_RING_COUNT - 1));
    const outerR = lerp(RING_OUTER_R_TOP, RING_OUTER_R_BOTTOM, r / (HOROLOGICAL_RING_COUNT - 1));
    const arcWidth = r === HOROLOGICAL_RING_COUNT - 1 ? 0.078 : 0.092;
    const innerR = outerR - arcWidth;
    const midR = (outerR + innerR) * 0.5;
    ringRadii.push({ r, baseY, outerR, innerR, midR });

    const ringOuterMat = r % 2 === 0 ? halfArcOuterMatEven : halfArcOuterMatOdd;

    for (let side = 0; side < 2; side += 1) {
      const isEast = side === 1; // side 0 = West (Slot A = 2r), side 1 = East (Slot B = 2r + 1)
      const slotIdx = r * 2 + side;
      const slotLetter = isEast ? 'B' : 'A';
      const slotCode = `R${r + 1}${slotLetter}`;
      const thetaStart = isEast ? EAST_THETA_START : WEST_THETA_START;

      const halfArcGroup = new THREE.Group();
      halfArcGroup.name = `SplitArc_${slotCode}`;
      halfArcGroup.position.y = baseY - 0.016; // Starts in calm recessed idle position
      splitRingsGroup.add(halfArcGroup);

      // 2.1 Precision-chamfered Machined Silver-Platinum / Champagne-Gold Outer 180° Arc
      const outerArcGeo = trackGeo(
        createChamferedArcGeometry({
          innerR,
          outerR,
          thetaStart,
          thetaLength: HALF_ARC_THETA_LENGTH,
          thickness: 0.028,
          bevel: 0.004,
          curveSegments: 36,
        })
      );
      const outerArcMesh = new THREE.Mesh(outerArcGeo, ringOuterMat);
      outerArcMesh.castShadow = true;
      outerArcMesh.receiveShadow = true;
      halfArcGroup.add(outerArcMesh);

      // Horological tick graduation overlay on the machined arc (top and bottom soffit)
      const dialTex = trackTex(createSplitArcDialTexture(slotCode, isEast));
      const dialMat = trackMat(
        new THREE.MeshBasicMaterial({
          map: dialTex,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      const dialGeo = trackGeo(
        new THREE.RingGeometry(
          innerR + 0.004,
          outerR - 0.004,
          36,
          1,
          thetaStart,
          HALF_ARC_THETA_LENGTH
        )
      );
      const dialMesh = new THREE.Mesh(dialGeo, dialMat);
      dialMesh.rotation.x = -Math.PI * 0.5;
      dialMesh.position.y = 0.0045;
      halfArcGroup.add(dialMesh);

      const lowerDialMesh = new THREE.Mesh(dialGeo, dialMat);
      lowerDialMesh.rotation.x = Math.PI * 0.5;
      lowerDialMesh.position.y = -0.029;
      halfArcGroup.add(lowerDialMesh);

      // 2.2 Recessed Anodized Dark-Sapphire Inner Channel (top) & Wide Luminous Soffit Channel (bottom)
      const channelWidth = Math.max(0.024, arcWidth * 0.36);
      const channelGeo = trackGeo(
        new THREE.RingGeometry(
          midR - channelWidth * 0.5,
          midR + channelWidth * 0.5,
          36,
          1,
          thetaStart + 0.018,
          HALF_ARC_THETA_LENGTH - 0.036
        )
      );
      const channelMesh = new THREE.Mesh(channelGeo, darkSapphireChannelMat);
      channelMesh.rotation.x = -Math.PI * 0.5;
      channelMesh.position.y = 0.0048;
      halfArcGroup.add(channelMesh);

      // 2.3 Emissive Semantic Light-Pipe Arc (`TorusGeometry(midR, 0.012, 10, 36, 0.88 * Math.PI)`)
      // Mounted on BOTH the upper crown (y = +0.006) AND the lower soffit (y = -0.026), plus a wide underside luminous channel
      // so looking UP from inside the deep chip shows all 6 concentric rings glowing vividly across their full width!
      const lightPipeGeo = trackGeo(
        new THREE.TorusGeometry(midR, 0.012, 10, 36, LIGHT_PIPE_THETA_LENGTH)
      );
      lightPipeGeo.rotateZ(isEast ? -0.44 * Math.PI : 0.56 * Math.PI);
      lightPipeGeo.rotateX(-Math.PI * 0.5);

      const lightPipeMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: HEX_IDLE_SLATE,
          emissive: HEX_IDLE_SLATE,
          emissiveIntensity: 0.06,
          roughness: 0.18,
          metalness: 0.35,
        })
      );
      const lightPipeMesh = new THREE.Mesh(lightPipeGeo, lightPipeMat);
      lightPipeMesh.position.y = 0.006;
      halfArcGroup.add(lightPipeMesh);

      const lowerLightPipeMesh = new THREE.Mesh(lightPipeGeo, lightPipeMat);
      lowerLightPipeMesh.position.y = -0.026;
      halfArcGroup.add(lowerLightPipeMesh);

      const lowerChannelWidth = Math.max(0.036, arcWidth * 0.68);
      const lowerChannelGeo = trackGeo(
        new THREE.RingGeometry(
          midR - lowerChannelWidth * 0.5,
          midR + lowerChannelWidth * 0.5,
          36,
          1,
          thetaStart + 0.014,
          HALF_ARC_THETA_LENGTH - 0.028
        )
      );
      const lowerChannelMesh = new THREE.Mesh(lowerChannelGeo, lightPipeMat);
      lowerChannelMesh.rotation.x = Math.PI * 0.5;
      lowerChannelMesh.position.y = -0.0294;
      halfArcGroup.add(lowerChannelMesh);

      // Downward-facing underside expression plaque (`side: THREE.FrontSide`, normal pointing `-Y`):
      // 100% invisible from Top-Down Rings / Overview above, and crisp right-side-up when looking UP from inside!
      const plaqueMat = trackMat(
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0.96,
          depthWrite: false,
          side: THREE.FrontSide,
        })
      );
      const lowerPlaqueMesh = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(0.24, 0.060)),
        plaqueMat
      );
      const plaqueAzimuth = isEast
        ? (-0.24 + r * 0.10) * Math.PI
        : (1.24 - r * 0.10) * Math.PI;
      const plaqueR = Math.min(midR, 0.82);
      lowerPlaqueMesh.position.set(
        Math.cos(plaqueAzimuth) * plaqueR,
        -0.038,
        -Math.sin(plaqueAzimuth) * plaqueR
      );
      lowerPlaqueMesh.rotation.x = Math.PI * 0.5;
      lowerPlaqueMesh.visible = false;
      halfArcGroup.add(lowerPlaqueMesh);

      tagInspectable(halfArcGroup, {
        type: 'split-arc-half-ring',
        id: `split-arc-${slotCode.toLowerCase()}`,
        title: `Half-Ring Arc ${slotCode} (Chronological Slot ${slotIdx + 1})`,
        subtitle: `${isEast ? 'East 180° Half-Arc (Slot B)' : 'West 180° Half-Arc (Slot A)'} · Ring R${r + 1}`,
        details: [
          `Chronological Stack Index: ${slotIdx} (${isEast ? 'Odd Slot B = 2r + 1' : 'Even Slot A = 2r'})`,
          'ENV (Cyan-Teal): Return / Scope caller environment & contract',
          'OP (Amber -> Gold): Left / Args / Unary -> Right locked operand',
          'GATE (Violet-Indigo): If / Match / Let branch or binding gate',
        ],
      });

      halfArcSlots.push({
        slotIdx,
        ringIdx: r,
        isEast,
        slotCode,
        baseY,
        currentY: baseY - 0.016,
        currentRotY: 0,
        rewritePulse: 0,
        outerR,
        innerR,
        midR,
        thetaStart,
        group: halfArcGroup,
        lightPipeMat,
        dialMat,
        plaqueMat,
        lowerPlaqueMesh,
        lastKind: null,
        lastPlaqueKey: '',
      });
    }
  }

  // ==========================================================================
  // 3. CENTRAL TRUE OPEN-BORE 10-SECTOR `Control` OPTICAL STATOR,
  //    SHORTENED RADIAL POINTER & NORTH BRIDGE READOUT PLAQUE (`y = -0.24`)
  //    Leaves `r < 0.135` 100% open so the camera can see straight into the hollow chamber!
  // ==========================================================================
  const controlCoreGroup = new THREE.Group();
  controlCoreGroup.name = 'Control10SectorOpticalStatorCore';
  controlCoreGroup.position.set(0, CONTROL_STATOR_Y, 0);
  group.add(controlCoreGroup);

  // Two short North & South rhodium-gold bridge tabs (`r = 0.212..0.240`) aligned with the 14.4° split-arc gaps
  const bridgeStrutMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      roughness: 0.24,
      metalness: 0.88,
    })
  );
  const bridgeTabGeo = trackGeo(new THREE.BoxGeometry(0.016, 0.008, 0.032));
  const northBridgeTabMesh = new THREE.Mesh(bridgeTabGeo, bridgeStrutMat);
  northBridgeTabMesh.position.set(0, -0.004, -0.224);
  controlCoreGroup.add(northBridgeTabMesh);

  const southBridgeTabMesh = new THREE.Mesh(bridgeTabGeo, bridgeStrutMat);
  southBridgeTabMesh.position.set(0, -0.004, 0.224);
  controlCoreGroup.add(southBridgeTabMesh);

  // Base stator ring housing (`innerRadius = 0.138, outerRadius = 0.220`)
  const statorHousingGeo = trackGeo(
    createChamferedArcGeometry({
      innerR: STATOR_INNER_R - 0.004,
      outerR: STATOR_OUTER_R + 0.004,
      thetaStart: 0,
      thetaLength: Math.PI * 2,
      thickness: 0.022,
      bevel: 0.003,
      curveSegments: 64,
    })
  );
  const statorHousingMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: PALETTE.titaniumSilver || 0xe2e7f0,
      map: brushedSilverTex,
      roughness: 0.28,
      metalness: 0.84,
      clearcoat: 0.25,
    })
  );
  const statorHousingMesh = new THREE.Mesh(statorHousingGeo, statorHousingMat);
  statorHousingMesh.receiveShadow = true;
  controlCoreGroup.add(statorHousingMesh);

  // Outer & Inner champagne-gold collet rims around the 10-sector stator (top & bottom)
  const outerColletGeo = trackGeo(new THREE.TorusGeometry(STATOR_OUTER_R + 0.004, 0.004, 10, 64));
  const outerColletMesh = new THREE.Mesh(outerColletGeo, bridgeStrutMat);
  outerColletMesh.rotation.x = Math.PI * 0.5;
  outerColletMesh.position.y = 0.002;
  controlCoreGroup.add(outerColletMesh);

  const lowerOuterColletMesh = new THREE.Mesh(outerColletGeo, bridgeStrutMat);
  lowerOuterColletMesh.rotation.x = Math.PI * 0.5;
  lowerOuterColletMesh.position.y = -0.022;
  controlCoreGroup.add(lowerOuterColletMesh);

  const innerColletGeo = trackGeo(new THREE.TorusGeometry(OPEN_BORE_RADIUS, 0.004, 10, 64));
  const innerColletMesh = new THREE.Mesh(innerColletGeo, bridgeStrutMat);
  innerColletMesh.rotation.x = Math.PI * 0.5;
  innerColletMesh.position.y = 0.002;
  controlCoreGroup.add(innerColletMesh);

  const lowerInnerColletMesh = new THREE.Mesh(innerColletGeo, bridgeStrutMat);
  lowerInnerColletMesh.rotation.x = Math.PI * 0.5;
  lowerInnerColletMesh.position.y = -0.022;
  controlCoreGroup.add(lowerInnerColletMesh);

  // 3.1 `THREE.InstancedMesh` of 10 precision `Control` sector pads (`0..9`)
  // Extruded `thickness = 0.028` so they protrude through both top and bottom of the stator housing!
  const sectorStep = (Math.PI * 2) / STATOR_SECTOR_COUNT;
  const sectorPadSpan = sectorStep - 0.045;
  const sectorPadGeo = trackGeo(
    createChamferedArcGeometry({
      innerR: STATOR_INNER_R + 0.002,
      outerR: STATOR_OUTER_R - 0.002,
      thetaStart: -sectorPadSpan * 0.5,
      thetaLength: sectorPadSpan,
      thickness: 0.028,
      bevel: 0.002,
      curveSegments: 12,
    })
  );
  const sectorPadMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.55,
    })
  );
  const statorSectorsInstancedMesh = new THREE.InstancedMesh(
    sectorPadGeo,
    sectorPadMat,
    STATOR_SECTOR_COUNT
  );
  statorSectorsInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  for (let i = 0; i < STATOR_SECTOR_COUNT; i += 1) {
    const theta = Math.PI * 0.5 - i * sectorStep;
    _scratchPos.set(0, 0.004, 0);
    _scratchEuler.set(0, theta, 0);
    _scratchQuat.setFromEuler(_scratchEuler);
    _scratchScale.set(1, 1, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    statorSectorsInstancedMesh.setMatrixAt(i, _scratchMat4);

    _scratchColor.setHex(0x1e293b);
    statorSectorsInstancedMesh.setColorAt(i, _scratchColor);
  }
  statorSectorsInstancedMesh.instanceMatrix.needsUpdate = true;
  if (statorSectorsInstancedMesh.instanceColor) {
    statorSectorsInstancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    statorSectorsInstancedMesh.instanceColor.needsUpdate = true;
  }
  controlCoreGroup.add(statorSectorsInstancedMesh);

  // Static 10-sector dial ring overlay texture on BOTH top (`y = +0.0155`) and bottom (`y = -0.0255`)
  const statorDialTex = trackTex(createControlStatorDialTexture());
  const statorDialMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: statorDialTex,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  const statorDialGeo = trackGeo(new THREE.RingGeometry(STATOR_INNER_R, STATOR_OUTER_R, 80));
  const statorDialMesh = new THREE.Mesh(statorDialGeo, statorDialMat);
  statorDialMesh.rotation.x = -Math.PI * 0.5;
  statorDialMesh.position.y = 0.0155;
  controlCoreGroup.add(statorDialMesh);

  const lowerStatorDialMesh = new THREE.Mesh(statorDialGeo, statorDialMat);
  lowerStatorDialMesh.rotation.x = Math.PI * 0.5;
  lowerStatorDialMesh.scale.set(1, -1, 1);
  lowerStatorDialMesh.position.y = -0.0255;
  controlCoreGroup.add(lowerStatorDialMesh);

  // 3.2 Directional Radial Transfer Pointer (`transferNeedleGroup`)
  // Stays strictly inside `r ∈ [0.135, 0.215]` (with both upper and lower pointer arms so it is visible when looking up!)
  const transferNeedleGroup = new THREE.Group();
  transferNeedleGroup.name = 'DirectionalRadialTransferPointer';
  transferNeedleGroup.position.y = 0.017;
  controlCoreGroup.add(transferNeedleGroup);

  const needleArmMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      emissive: PALETTE.gold,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.88,
    })
  );
  const needleTipMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: HEX_OP_GOLD,
      emissive: HEX_OP_GOLD,
      emissiveIntensity: 1.15,
      roughness: 0.16,
      metalness: 0.45,
    })
  );

  // Pointer arm extending along local +X within the stator ring (`r = 0.138..0.212`)
  const needleStemGeo = trackGeo(new THREE.BoxGeometry(0.048, 0.005, 0.010));
  const needleStemMesh = new THREE.Mesh(needleStemGeo, needleArmMat);
  needleStemMesh.position.set(0.162, 0, 0);
  transferNeedleGroup.add(needleStemMesh);

  const lowerNeedleStemMesh = new THREE.Mesh(needleStemGeo, needleArmMat);
  lowerNeedleStemMesh.position.set(0.162, -0.044, 0);
  transferNeedleGroup.add(lowerNeedleStemMesh);

  const needleTipGeo = trackGeo(new THREE.ConeGeometry(0.012, 0.024, 4));
  needleTipGeo.rotateZ(-Math.PI * 0.5); // Point tip outward along +X
  const needleTipMesh = new THREE.Mesh(needleTipGeo, needleTipMat);
  needleTipMesh.position.set(0.196, 0, 0);
  transferNeedleGroup.add(needleTipMesh);

  const lowerNeedleTipMesh = new THREE.Mesh(needleTipGeo, needleTipMat);
  lowerNeedleTipMesh.position.set(0.196, -0.044, 0);
  transferNeedleGroup.add(lowerNeedleTipMesh);

  // 3.3 True Open-Bore Sapphire Annular Bezel (`r = 0.128..0.142`, open center `r < 0.128`)
  const sapphireLensMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x0b1528,
      emissive: 0x16243d,
      emissiveIntensity: 0.28,
      roughness: 0.10,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    })
  );
  const sapphireLensMesh = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(OPEN_BORE_RADIUS - 0.008, STATOR_INNER_R, 64)),
    sapphireLensMat
  );
  sapphireLensMesh.rotation.x = -Math.PI * 0.5;
  sapphireLensMesh.position.y = 0.004;
  controlCoreGroup.add(sapphireLensMesh);

  // Downward-facing underside Control Core readout plaque (`side: THREE.FrontSide`, normal pointing `-Y`):
  // Invisible from above, crisp right-side-up when looking up from inside the hollow chip!
  const lensPlaqueMat = trackMat(
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  );
  const lowerCorePlaqueMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.25, 0.070)),
    lensPlaqueMat
  );
  lowerCorePlaqueMesh.position.set(0, -0.034, -0.175);
  lowerCorePlaqueMesh.rotation.x = Math.PI * 0.5;
  controlCoreGroup.add(lowerCorePlaqueMesh);

  // Single clean expanding `outputWave` ring on a completed result (`Done`)
  const outputWaveMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: HEX_ENV_CYAN,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const outputWaveMesh = new THREE.Mesh(
    trackGeo(new THREE.RingGeometry(STATOR_OUTER_R + 0.01, STATOR_OUTER_R + 0.035, 64)),
    outputWaveMat
  );
  outputWaveMesh.rotation.x = -Math.PI * 0.5;
  outputWaveMesh.position.y = 0.018;
  outputWaveMesh.visible = false;
  controlCoreGroup.add(outputWaveMesh);

  tagInspectable(controlCoreGroup, {
    type: 'control-stator-core',
    id: 'control-10-sector-stator-core',
    title: '10-Sector Control Optical Stator & Open-Bore Readout',
    subtitle: 'True Open-Bore Stator at Center of 6th Ring (y = -0.24, Open Bore r < 0.135)',
    details: [
      '10 Radial Sectors: EVAL, PUSH, RETURN, INVOKE, ENTER, BOUND, CASES, MATCH, PRIM, ERROR',
      'Directional Transfer Pointer: Aims West (π) at Slot A or East (0) at Slot B inside r <= 0.215',
      'True Open Bore (r < 0.135): Unobstructed sightline down to the Continuation Wafers & 39-Rule Floor',
    ],
  });

  // ==========================================================================
  // 4. DEEP HOLLOW 3D INTERIOR CHAMBER (`y = -0.35` down to `-3.35`)
  //    Clean matte gunmetal-sapphire stepped chamber walls (`D0`..`D7`),
  //    full 360° machined stainless vault ceiling soffit ring, and 12 vertical stainless ribs.
  // ==========================================================================
  const wellStructureGroup = new THREE.Group();
  wellStructureGroup.name = 'HollowSteppedChamberWalls';
  group.add(wellStructureGroup);

  const matteAnodizedBlackMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.wellSlate || 0x161d29,
      roughness: 0.68,
      metalness: 0.38,
    })
  );
  const matteAnodizedSlateMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.graphite || 0x1c2331,
      roughness: 0.62,
      metalness: 0.42,
    })
  );
  const chamferTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.graphiteLight || 0x2a3446,
      roughness: 0.42,
      metalness: 0.68,
    })
  );

  // Machined Stainless-Steel Vault Ceiling Soffit Ring at y = -0.35 (`innerR = 0.955, outerR = 1.62`)
  // North/East/West 270° arc + South 90° plug (which stays closed inside the chip and retracts in Cross-Section!)
  const vaultCeilingGeo = trackGeo(
    createChamferedArcGeometry({
      innerR: 0.955,
      outerR: 1.62,
      thetaStart: -0.25 * Math.PI,
      thetaLength: 1.50 * Math.PI,
      thickness: 0.026,
      bevel: 0.004,
      curveSegments: 64,
    })
  );
  const vaultCeilingSouthGeo = trackGeo(
    createChamferedArcGeometry({
      innerR: 0.955,
      outerR: 1.62,
      thetaStart: -0.75 * Math.PI,
      thetaLength: 0.50 * Math.PI,
      thickness: 0.026,
      bevel: 0.004,
      curveSegments: 24,
    })
  );
  const vaultCeilingMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xb8bcc2,
      map: brushedSilverTex,
      roughness: 0.24,
      metalness: 0.92,
      clearcoat: 0.32,
      clearcoatRoughness: 0.20,
    })
  );
  const vaultCeilingMesh = new THREE.Mesh(vaultCeilingGeo, vaultCeilingMat);
  vaultCeilingMesh.position.y = CHAMBER_TOP_Y + 0.01;
  vaultCeilingMesh.receiveShadow = true;
  wellStructureGroup.add(vaultCeilingMesh);

  const vaultCeilingSouthMesh = new THREE.Mesh(vaultCeilingSouthGeo, vaultCeilingMat);
  vaultCeilingSouthMesh.position.y = CHAMBER_TOP_Y + 0.01;
  vaultCeilingSouthMesh.receiveShadow = true;
  wellStructureGroup.add(vaultCeilingSouthMesh);

  const depthRings = [];
  const terraceHeight = (CHAMBER_TOP_Y - CHAMBER_BOTTOM_Y) / TERRACE_COUNT;

  for (let d = 0; d < TERRACE_COUNT; d += 1) {
    const ringY = getTerraceY(d);
    const innerHalf = getTerraceInnerHalf(d);
    const terraceMat = d % 2 === 0 ? matteAnodizedBlackMat : matteAnodizedSlateMat;

    const terraceWall = createSteppedTerrace({
      outerHalf: OUTER_HALF,
      innerHalf,
      yCenter: ringY,
      height: terraceHeight,
      material: terraceMat,
      trimMaterial: chamferTrimMat,
      trackGeo,
    });
    wellStructureGroup.add(terraceWall);

    const ringMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: PALETTE.gold,
        emissiveIntensity: 0.03,
        roughness: 0.32,
        metalness: 0.65,
      })
    );

    const ringHalf = innerHalf - 0.003;
    const lightRingLoop = createRecessedLightLoop(ringHalf, 0.007, 0.006, ringMat, trackGeo);
    lightRingLoop.position.y = ringY + terraceHeight * 0.44;
    wellStructureGroup.add(lightRingLoop);

    const depthCode = `D${d}`;
    tagInspectable(lightRingLoop, {
      type: 'well-depth-ring',
      id: `depth-ring-${depthCode}`,
      title: `Chamber Terrace ${depthCode}`,
      subtitle: `Stepped Hollow Chamber Wall ${d} · y = ${ringY.toFixed(2)}`,
      details: [
        `Terrace Depth: ${depthCode} (Frame Stack Index ${d})`,
        `Inner Aperture: ±${innerHalf.toFixed(3)}`,
      ],
    });

    depthRings.push({
      index: d,
      code: depthCode,
      y: ringY,
      innerHalf,
      terraceWall,
      loop: lightRingLoop,
      material: ringMat,
    });
  }

  // 4.1 12 Machined Stainless-Steel Vertical Vault Pillar Ribs around the 3.12 × 3.12 atrium
  //     8 along North, West, and East walls + 4 along the South wall (which retract only in Cross-Section)
  const VAULT_RIB_COORDS = [
    [-1.49, -1.49, Math.PI * 0.25],
    [-0.54, -1.51, 0],
    [ 0.54, -1.51, 0],
    [ 1.49, -1.49, -Math.PI * 0.25],
    [-1.51, -0.54,  Math.PI * 0.5],
    [ 1.51, -0.54, -Math.PI * 0.5],
    [-1.51,  0.54,  Math.PI * 0.5],
    [ 1.51,  0.54, -Math.PI * 0.5],
  ];
  const SOUTH_VAULT_RIB_COORDS = [
    [-1.49,  1.49, -Math.PI * 0.25],
    [-0.54,  1.51, 0],
    [ 0.54,  1.51, 0],
    [ 1.49,  1.49,  Math.PI * 0.25],
  ];
  const vaultRibHeight = CHAMBER_TOP_Y - CHAMBER_BOTTOM_Y - 0.04;
  const vaultRibCenterY = (CHAMBER_TOP_Y + CHAMBER_BOTTOM_Y) * 0.5;
  const vaultRibGeo = trackGeo(new THREE.BoxGeometry(0.040, vaultRibHeight, 0.032));
  const vaultRibMat = vaultCeilingMat;
  const vaultRibsInstancedMesh = new THREE.InstancedMesh(
    vaultRibGeo,
    vaultRibMat,
    VAULT_RIB_COORDS.length
  );
  for (let i = 0; i < VAULT_RIB_COORDS.length; i += 1) {
    const [rx, rz, rotY] = VAULT_RIB_COORDS[i];
    _scratchPos.set(rx, vaultRibCenterY, rz);
    _scratchEuler.set(0, rotY, 0);
    _scratchQuat.setFromEuler(_scratchEuler);
    _scratchScale.set(1, 1, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    vaultRibsInstancedMesh.setMatrixAt(i, _scratchMat4);
  }
  vaultRibsInstancedMesh.instanceMatrix.needsUpdate = true;
  wellStructureGroup.add(vaultRibsInstancedMesh);

  const southVaultRibsInstancedMesh = new THREE.InstancedMesh(
    vaultRibGeo,
    vaultRibMat,
    SOUTH_VAULT_RIB_COORDS.length
  );
  for (let i = 0; i < SOUTH_VAULT_RIB_COORDS.length; i += 1) {
    const [rx, rz, rotY] = SOUTH_VAULT_RIB_COORDS[i];
    _scratchPos.set(rx, vaultRibCenterY, rz);
    _scratchEuler.set(0, rotY, 0);
    _scratchQuat.setFromEuler(_scratchEuler);
    _scratchScale.set(1, 1, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    southVaultRibsInstancedMesh.setMatrixAt(i, _scratchMat4);
  }
  southVaultRibsInstancedMesh.instanceMatrix.needsUpdate = true;
  wellStructureGroup.add(southVaultRibsInstancedMesh);

  // Hairline `stackLimit` Horizon Ring inside the hollow chamber
  const stackLimitGroup = new THREE.Group();
  stackLimitGroup.name = 'StackLimitHorizonRing';
  stackLimitGroup.position.y = getTerraceY(7);
  group.add(stackLimitGroup);

  const horizonRingMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      emissive: PALETTE.gold,
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.78,
    })
  );
  const horizonLoop = createRecessedLightLoop(1.50, 0.012, 0.010, horizonRingMat, trackGeo);
  stackLimitGroup.add(horizonLoop);

  tagInspectable(stackLimitGroup, {
    type: 'stack-limit-horizon',
    id: 'stack-limit-horizon-ring',
    title: 'Hairline stackLimit Horizon Ring',
    subtitle: 'Recursion Depth Guard Horizon (Rule A135 PushFrame / Rule A140 FrameErr)',
    details: [
      'Normal State: Calm champagne-gold hairline ring at configured stackLimit depth',
      'Fault State: Pulses crimson on Rule A140 (Frame limit error(4))',
    ],
  });

  // ==========================================================================
  // 5. 3D MICRO-SILICON 39-RULE CHIPLETS ON THE FLOOR (`y = -3.38`)
  //    - 39 gold-rimmed socket bezels (`ruleBezelInstancedMesh`)
  //    - 39 physical 3D silicon rule chiplets (`ruleTilesInstancedMesh`, height `0.052`)
  //    - 39 unlit emissive south-lip status bars (`ruleBeaconInstancedMesh`)
  //    - Plus 1 static high-contrast floor label overlay plane above the chiplets
  // ==========================================================================
  const floorGroup = new THREE.Group();
  floorGroup.name = 'FlushInstanced39RuleFloor';
  group.add(floorGroup);

  const gridConfig = {
    cols: 6,
    rows: 7,
    startX: -1.125,
    startZ: -1.17,
    stepX: 0.45,
    stepZ: 0.39,
    cellW: 0.395,
    cellD: 0.335,
    floorSpan: 2.92,
  };

  // Monolithic matte gunmetal-sapphire ceramic floor slab (`y = -3.40..-3.38`)
  const floorBaseMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(OUTER_HALF * 2, 0.024, OUTER_HALF * 2)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: PALETTE.graphiteDark || 0x111621,
        roughness: 0.68,
        metalness: 0.45,
      })
    )
  );
  floorBaseMesh.position.y = WELL_BASE_Y + 0.01;
  floorBaseMesh.receiveShadow = true;
  floorGroup.add(floorBaseMesh);

  // 5.1 39 Machined Champagne-Gold Socket Bezels around each 3D Rule Chiplet
  const bezelGeo = trackGeo(
    new THREE.BoxGeometry(gridConfig.cellW + 0.020, 0.018, gridConfig.cellD + 0.020)
  );
  const bezelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      roughness: 0.28,
      metalness: 0.86,
    })
  );
  const ruleBezelInstancedMesh = new THREE.InstancedMesh(
    bezelGeo,
    bezelMat,
    SHERLOCK_K_RULES.length
  );
  ruleBezelInstancedMesh.receiveShadow = true;

  // 5.2 39 Physical 3D Silicon Rule Chiplets (`height = 0.052`, rising on active rule!)
  const tileBaseGeo = trackGeo(new THREE.BoxGeometry(gridConfig.cellW, 0.052, gridConfig.cellD));
  const tileInstancedMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.58,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
    })
  );
  const ruleTilesInstancedMesh = new THREE.InstancedMesh(
    tileBaseGeo,
    tileInstancedMat,
    SHERLOCK_K_RULES.length
  );
  ruleTilesInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  ruleTilesInstancedMesh.castShadow = true;
  ruleTilesInstancedMesh.receiveShadow = true;

  // 5.3 39 Emissive South-Lip Status Bars on each 3D Rule Chiplet (vivid from oblique interior angles!)
  const beaconGeo = trackGeo(
    new THREE.BoxGeometry(gridConfig.cellW * 0.84, 0.018, 0.018)
  );
  const beaconMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
  );
  const ruleBeaconInstancedMesh = new THREE.InstancedMesh(
    beaconGeo,
    beaconMat,
    SHERLOCK_K_RULES.length
  );
  ruleBeaconInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // 5.4 39 Vertical Optical Beacon Posts on the South-East corner of each Rule Chiplet
  const beaconPostGeo = trackGeo(new THREE.BoxGeometry(0.015, 0.056, 0.015));
  const ruleBeaconPostInstancedMesh = new THREE.InstancedMesh(
    beaconPostGeo,
    beaconMat,
    SHERLOCK_K_RULES.length
  );
  ruleBeaconPostInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const ruleCells = [];
  const ruleCellsByLine = new Map();
  const ruleCellsById = new Map();

  for (let idx = 0; idx < SHERLOCK_K_RULES.length; idx += 1) {
    const rule = SHERLOCK_K_RULES[idx];
    const col = idx % gridConfig.cols;
    const row = Math.floor(idx / gridConfig.cols);
    const cellX = gridConfig.startX + col * gridConfig.stepX;
    const cellZ = gridConfig.startZ + row * gridConfig.stepZ;

    // Socket bezel matrix
    _scratchPos.set(cellX, WELL_FLOOR_Y + 0.009, cellZ);
    _scratchQuat.identity();
    _scratchScale.set(1, 1, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    ruleBezelInstancedMesh.setMatrixAt(idx, _scratchMat4);

    // 3D rule chiplet matrix (idle center at WELL_FLOOR_Y + 0.030 -> top at WELL_FLOOR_Y + 0.056)
    _scratchPos.set(cellX, WELL_FLOOR_Y + 0.030, cellZ);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    ruleTilesInstancedMesh.setMatrixAt(idx, _scratchMat4);

    _scratchColor.setHex(0x1b2536).lerp(_scratchColorB.setHex(rule.color), 0.16);
    ruleTilesInstancedMesh.setColorAt(idx, _scratchColor);

    // South-lip status bar matrix
    _scratchPos.set(cellX, WELL_FLOOR_Y + 0.050, cellZ + gridConfig.cellD * 0.46);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    ruleBeaconInstancedMesh.setMatrixAt(idx, _scratchMat4);
    _scratchColor.setHex(rule.color).multiplyScalar(0.32);
    ruleBeaconInstancedMesh.setColorAt(idx, _scratchColor);

    // Corner optical beacon post matrix
    _scratchPos.set(
      cellX + gridConfig.cellW * 0.42,
      WELL_FLOOR_Y + 0.044,
      cellZ + gridConfig.cellD * 0.40
    );
    _scratchScale.set(1, 0.35, 1);
    _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
    ruleBeaconPostInstancedMesh.setMatrixAt(idx, _scratchMat4);
    ruleBeaconPostInstancedMesh.setColorAt(idx, _scratchColor);

    const cellRecord = {
      index: idx,
      rule,
      col,
      row,
      x: cellX,
      z: cellZ,
      trail: 0,
    };
    ruleCells.push(cellRecord);
    ruleCellsByLine.set(rule.line, cellRecord);
    ruleCellsById.set(rule.id, cellRecord);
  }
  ruleBezelInstancedMesh.instanceMatrix.needsUpdate = true;
  ruleTilesInstancedMesh.instanceMatrix.needsUpdate = true;
  if (ruleTilesInstancedMesh.instanceColor) {
    ruleTilesInstancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    ruleTilesInstancedMesh.instanceColor.needsUpdate = true;
  }
  ruleBeaconInstancedMesh.instanceMatrix.needsUpdate = true;
  if (ruleBeaconInstancedMesh.instanceColor) {
    ruleBeaconInstancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    ruleBeaconInstancedMesh.instanceColor.needsUpdate = true;
  }
  ruleBeaconPostInstancedMesh.instanceMatrix.needsUpdate = true;
  if (ruleBeaconPostInstancedMesh.instanceColor) {
    ruleBeaconPostInstancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    ruleBeaconPostInstancedMesh.instanceColor.needsUpdate = true;
  }
  floorGroup.add(
    ruleBezelInstancedMesh,
    ruleTilesInstancedMesh,
    ruleBeaconInstancedMesh,
    ruleBeaconPostInstancedMesh
  );

  // 5.5 3D Raised Gold-Bezeled `SHERLOCK · K-A/1 · 39-RULE ROM` Hub Plaque at Row 6, Cols 3..5
  const romHubX = gridConfig.startX + 4 * gridConfig.stepX;
  const romHubZ = gridConfig.startZ + 6 * gridConfig.stepZ;
  const romHubW = gridConfig.stepX * 2 + gridConfig.cellW;
  const romHubD = gridConfig.cellD;
  const romBezelMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(romHubW + 0.024, 0.022, romHubD + 0.024)),
    bezelMat
  );
  romBezelMesh.position.set(romHubX, WELL_FLOOR_Y + 0.011, romHubZ);
  floorGroup.add(romBezelMesh);

  const romBodyMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(romHubW, 0.044, romHubD)),
    trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0x162032,
        roughness: 0.24,
        metalness: 0.65,
        clearcoat: 0.45,
      })
    )
  );
  romBodyMesh.position.set(romHubX, WELL_FLOOR_Y + 0.026, romHubZ);
  floorGroup.add(romBodyMesh);

  // Attach per-instance rule records so raycasting any 3D floor module inspects that exact rule!
  ruleTilesInstancedMesh.userData.ruleRecords = ruleCells;

  // 1 Static floor label overlay plane above the 39 instanced 3D rule chiplets
  // Positioned at WELL_FLOOR_Y + 0.092 so elevated active chiplets never cover their crisp labels
  const floorOverlayTex = trackTex(createStatic39RuleFloorOverlayTexture(gridConfig));
  const floorOverlayMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: floorOverlayTex,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
    })
  );
  const floorOverlayMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(gridConfig.floorSpan, gridConfig.floorSpan)),
    floorOverlayMat
  );
  floorOverlayMesh.rotation.x = -Math.PI * 0.5;
  floorOverlayMesh.position.y = WELL_FLOOR_Y + 0.092;
  floorGroup.add(floorOverlayMesh);

  tagInspectable(floorGroup, {
    type: 'k-decoder-bus-hub',
    id: 'k-a-1-decoder-bus-hub',
    title: 'sherlock-k-a/1 39-Rule 3D Silicon Decoder Floor (y = -3.38)',
    subtitle: 'Instanced 39-Rule 3D Silicon Chiplets (A080..A225)',
    details: [
      '39 Physical 3D Silicon Rule Chiplets with machined gold socket bezels & south-lip status bars',
      'Active State: Active rule chiplet elevates physically and illuminates its semantic status bar',
      'Hover or click any individual floor chiplet to inspect its rule line and fuel charge',
    ],
  });

  // Pre-allocated 12-element chronological frame buffer for zero-allocation `.update(stepState)`
  const _chronoFramesBuffer = new Array(HALF_ARC_SLOT_COUNT).fill(null);

  // State tracking for smooth transitions, fuel draining, pointer dynamics, and previous-rule trail
  let lastActiveCell = null;
  let prevTrailCell = null;
  let lastStepIndex = -1;
  let displayedFuelRatio = 1.0;
  let pointerAngle = Math.PI; // Starts pointing West (Slot A = 0)
  let pointerRadialReach = 0.196;
  let lastCorePlaqueKey = '';
  let lastActiveSectorIdx = -1;

  // ==========================================================================
  // 6. DYNAMIC `.update(stepState)` — ZERO HEAP ALLOCATIONS
  // ==========================================================================
  function update(stepState = {}) {
    const ambient = stepState.ambient ?? 0;
    const dt = clamp(stepState.dt ?? 0.016, 0.001, 0.1);
    const step = stepState.step ?? null;
    const stepIndex = stepState.stepIndex ?? 0;
    const stepFraction = clamp(stepState.stepFraction ?? 0, 0, 1);
    const phase = stepState.phase ?? 'STILL';
    const cutawayMix = clamp(stepState.cutawayMix ?? 0, 0, 1);
    const isStepChanged = stepIndex !== lastStepIndex;

    const alpha10 = 1.0 - Math.exp(-10.0 * dt);
    const alpha12 = 1.0 - Math.exp(-12.0 * dt);
    const alpha14 = 1.0 - Math.exp(-14.0 * dt);
    const alpha16 = 1.0 - Math.exp(-16.0 * dt);

    const activeRuleLine = step?.ruleLine ?? null;
    const activeRuleId = step?.ruleId ?? null;
    const frames = step?.after?.frames ?? [];
    const frameCount = frames.length;
    const beforeFrameCount = step?.before?.frameCount ?? frameCount;
    const stackLimit = clamp(step?.after?.stackLimit ?? 8, 1, TERRACE_COUNT);
    const activeBindings = step?.after?.envRoots?.[0]?.bindings ?? null;

    const isFrameLimitError =
      activeRuleLine === 140 ||
      activeRuleId === 'A140' ||
      (phase === 'ERROR' && frameCount >= stackLimit);

    const isDoneState =
      phase === 'EMBLEM' ||
      activeRuleLine === 80 ||
      activeRuleId === 'A080' ||
      (stepState.trace?.outcome?.kind === 'Done' &&
        stepState.totalSteps > 0 &&
        stepIndex >= stepState.totalSteps - 1);

    const isErrorState =
      phase === 'ERROR' ||
      activeRuleLine === 82 ||
      activeRuleLine === 84 ||
      activeRuleId === 'A082' ||
      activeRuleId === 'A084';

    const isInPlaceRewriteRule =
      activeRuleLine === 145 ||
      activeRuleLine === 149 ||
      activeRuleLine === 177 ||
      activeRuleId === 'A145' ||
      activeRuleId === 'A149' ||
      activeRuleId === 'A177';

    const isPopRule =
      frameCount < beforeFrameCount ||
      activeRuleLine === 153 ||
      activeRuleLine === 157 ||
      activeRuleLine === 161 ||
      activeRuleLine === 165 ||
      activeRuleLine === 173 ||
      activeRuleLine === 181 ||
      activeRuleLine === 185 ||
      activeRuleLine === 195;

    const isPushRule =
      frameCount > beforeFrameCount ||
      activeRuleLine === 135 ||
      step?.controlKind === 'Push' ||
      step?.after?.control?.kind === 'Push';

    // Populate `_chronoFramesBuffer` in chronological order (oldest frame at 0, newest at frameCount - 1)
    const telemetryRings = stepState.ringTelemetry?.rings;
    const telemetrySlots = stepState.ringTelemetry?.slots;
    for (let s = 0; s < HALF_ARC_SLOT_COUNT; s += 1) {
      if (Array.isArray(telemetrySlots) && telemetrySlots[s]?.frame) {
        _chronoFramesBuffer[s] = telemetrySlots[s].frame;
      } else if (s < frameCount) {
        _chronoFramesBuffer[s] = frames[frameCount - 1 - s];
      } else {
        _chronoFramesBuffer[s] = null;
      }
    }

    // ------------------------------------------------------------------------
    // A. Update Outer Draining Fuel Ring (`fuelInstancedMesh`, 48 segments)
    // ------------------------------------------------------------------------
    const traceSteps = stepState.trace?.steps;
    const firstStep = Array.isArray(traceSteps) && traceSteps.length > 0 ? traceSteps[0] : null;
    const initialFuel = Math.max(
      1,
      firstStep?.before?.fuel ??
        firstStep?.after?.fuel ??
        step?.after?.aux2?.fuel?.before ??
        step?.after?.fuel ??
        32
    );
    const currentFuel = Math.max(
      0,
      step?.after?.fuel ?? step?.after?.aux2?.fuel?.after ?? initialFuel
    );
    const targetFuelRatio = clamp(currentFuel / initialFuel, 0, 1);
    displayedFuelRatio = lerp(displayedFuelRatio, targetFuelRatio, alpha12);

    const litSegmentCount = displayedFuelRatio * FUEL_SEGMENTS;
    const isLowFuel = displayedFuelRatio < 0.28;
    const isExhausted = activeRuleLine === 84 || activeRuleId === 'A084' || currentFuel === 0;
    const leadingEdgeIdx = Math.floor(litSegmentCount);

    for (let s = 0; s < FUEL_SEGMENTS; s += 1) {
      const segFill = clamp(litSegmentCount - s, 0, 1);
      const isLeadingEdge = Math.abs(s - leadingEdgeIdx) <= 1 && step?.charge === 1;

      if (isExhausted) {
        const errPulse = 0.55 + 0.45 * Math.sin(ambient * 14 + s * 0.2);
        _scratchColor.setHex(PALETTE.errorRed).multiplyScalar(errPulse);
      } else if (segFill > 0.02) {
        const activeHex = isLeadingEdge
          ? PALETTE.heatBright
          : isLowFuel
            ? PALETTE.amber
            : PALETTE.gold;
        _scratchColor
          .setHex(activeHex)
          .multiplyScalar((isLeadingEdge ? 1.25 : 0.9) * (0.35 + 0.65 * segFill));
      } else {
        _scratchColor.setHex(0x1e293b);
      }
      fuelInstancedMesh.setColorAt(s, _scratchColor);
    }
    if (fuelInstancedMesh.instanceColor) {
      fuelInstancedMesh.instanceColor.needsUpdate = true;
    }

    // ------------------------------------------------------------------------
    // B. Update 6 Concentric Split-Arc Semantic Rings (`12` Independent Half-Arcs)
    // ------------------------------------------------------------------------
    const topChronoIdx = frameCount > 0 ? Math.min(HALF_ARC_SLOT_COUNT - 1, frameCount - 1) : -1;

    for (let s = 0; s < HALF_ARC_SLOT_COUNT; s += 1) {
      const slot = halfArcSlots[s];
      const frame = _chronoFramesBuffer[s];
      const ringTel = Array.isArray(telemetryRings) ? telemetryRings[slot.ringIdx] : null;
      const slotTel = ringTel ? (slot.isEast ? ringTel.slotB : ringTel.slotA) : null;
      const isOccupied = frame !== null || Boolean(slotTel?.occupied);
      const isTopOfStack = slotTel ? Boolean(slotTel.isTopOfStack) : isOccupied && s === topChronoIdx;

      // Detect in-place rewrite on top-of-stack slot (Rules 145 Let->Scope, 149 Left->Right, 177 Args)
      if (isStepChanged && isTopOfStack) {
        const kindChangedInPlace =
          frameCount === beforeFrameCount &&
          slot.lastKind !== null &&
          frame !== null &&
          slot.lastKind !== frame.kind;
        if (slotTel?.transition === 'REWRITTEN' || isInPlaceRewriteRule || kindChangedInPlace) {
          slot.rewritePulse = 1.0;
        }
      }
      // Detect popped slot for brief 1-step emerald-gold release afterglow
      if (isStepChanged && !isOccupied && (slotTel?.transition === 'POPPED' || slot.lastKind !== null)) {
        slot.popPulse = 1.0;
        slot.poppedKind = slotTel?.poppedKind || slot.lastKind || 'Return';
      } else if (isOccupied) {
        slot.popPulse = 0.0;
      }
      slot.lastKind = frame ? frame.kind : slotTel?.kind || null;
      slot.rewritePulse = Math.max(0, slot.rewritePulse - dt * 3.2);
      slot.popPulse = Math.max(0, (slot.popPulse || 0) - dt * 2.6);

      // Physical elevation & in-place rewrite lock-pulse
      const targetY = isOccupied
        ? slot.baseY + (isTopOfStack ? 0.022 : 0.015) + slot.rewritePulse * 0.018
        : slot.baseY - 0.016 + (slot.popPulse || 0) * 0.014;
      slot.currentY = lerp(slot.currentY, targetY, alpha14);
      slot.group.position.y = slot.currentY;

      const direction = slot.isEast ? 1 : -1;
      const targetRotY = slot.rewritePulse * direction * 0.048 * Math.sin(slot.rewritePulse * Math.PI);
      slot.currentRotY = lerp(slot.currentRotY, targetRotY, alpha16);
      slot.group.rotation.y = slot.currentRotY;

      // Semantic Light-Pipe Color & Intensity
      const semanticHex = getFrameSemanticHex(frame || (slotTel?.occupied ? { kind: slotTel.kind } : null));
      if (isOccupied) {
        const breath = 0.5 + 0.5 * Math.sin(ambient * 4.2 + s * 0.6);
        slot.lightPipeMat.color.setHex(semanticHex);
        slot.lightPipeMat.emissive.setHex(semanticHex);
        const baseIntensity = isTopOfStack ? 1.85 : 1.05;
        slot.lightPipeMat.emissiveIntensity =
          baseIntensity + slot.rewritePulse * 1.15 + breath * 0.22;
        slot.dialMat.opacity = isTopOfStack ? 0.98 : 0.88;
        slot.plaqueMat.opacity = isTopOfStack ? 1.0 : 0.94;
        if (slot.lowerPlaqueMesh) slot.lowerPlaqueMesh.visible = true;
      } else if ((slot.popPulse || 0) > 0.02) {
        const popHex = getFrameSemanticHex({ kind: slot.poppedKind || 'Return' });
        _scratchColor.setHex(popHex).lerp(_scratchColorB.setHex(HEX_ENV_CYAN), 0.45);
        slot.lightPipeMat.color.copy(_scratchColor);
        slot.lightPipeMat.emissive.copy(_scratchColor);
        slot.lightPipeMat.emissiveIntensity = 0.24 + slot.popPulse * 1.35;
        slot.dialMat.opacity = 0.52 + slot.popPulse * 0.35;
        slot.plaqueMat.opacity = 0.52 + slot.popPulse * 0.35;
        if (slot.lowerPlaqueMesh) slot.lowerPlaqueMesh.visible = true;
      } else {
        slot.lightPipeMat.color.setHex(0x334155);
        slot.lightPipeMat.emissive.setHex(0x334155);
        slot.lightPipeMat.emissiveIntensity = 0.22;
        slot.dialMat.opacity = 0.54;
        slot.plaqueMat.opacity = 0.0;
        if (slot.lowerPlaqueMesh) slot.lowerPlaqueMesh.visible = false;
      }

      // O(1) persistent Merkle hash fast-path: skip string formatting when slot & env hash unchanged
      const slotHash = stepState.functionalDelta?.slotHashes?.[s];
      if (slotHash === undefined || slotHash !== slot.lastSlotHash) {
        slot.lastSlotHash = slotHash;
        const resolvedEnv = formatSlotEnvCompact(_chronoFramesBuffer, s, activeBindings);
        const envSummary =
          resolvedEnv !== 'root' ? resolvedEnv : (slotTel?.envText || resolvedEnv);
        const plaqueKey = frame
          ? `${slot.slotCode}|${frame.kind}|${frame.label}|${envSummary}`
          : `${slot.slotCode}|IDLE`;

        if (plaqueKey !== slot.lastPlaqueKey) {
          slot.lastPlaqueKey = plaqueKey;
          const copy = formatHalfArcPlaqueCopy(slot.slotCode, frame, envSummary);
          slot.group.userData.title = copy.title;
          slot.group.userData.subtitle = copy.subtitle;
          if (frame) {
            slot.plaqueMat.map = createPlaqueTexture({
              title: copy.title,
              subtitle: copy.subtitle,
              badge: copy.badge,
              accent: getFrameSemanticCss(frame),
              dark: true,
              width: 384,
              height: 96,
            });
            slot.plaqueMat.needsUpdate = true;
          }
        }
      }

      // Update the 2 North/South bridge gap isolator clasps for this Half-Arc inside `bridgeClaspsInstancedMesh`
      const endThetaA = slot.thetaStart;
      const endThetaB = slot.thetaStart + HALF_ARC_THETA_LENGTH;
      const claspIdx0 = s * 2;
      const claspIdx1 = s * 2 + 1;

      _scratchPos.set(
        Math.cos(endThetaA) * slot.midR,
        slot.currentY - 0.002,
        -Math.sin(endThetaA) * slot.midR
      );
      _scratchEuler.set(0, endThetaA, 0);
      _scratchQuat.setFromEuler(_scratchEuler);
      _scratchScale.set(1, 1, 1);
      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      bridgeClaspsInstancedMesh.setMatrixAt(claspIdx0, _scratchMat4);

      _scratchPos.set(
        Math.cos(endThetaB) * slot.midR,
        slot.currentY - 0.002,
        -Math.sin(endThetaB) * slot.midR
      );
      _scratchEuler.set(0, endThetaB, 0);
      _scratchQuat.setFromEuler(_scratchEuler);
      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      bridgeClaspsInstancedMesh.setMatrixAt(claspIdx1, _scratchMat4);

      if (isOccupied) {
        _scratchColor.setHex(semanticHex);
      } else {
        _scratchColor.setHex(0x475569);
      }
      bridgeClaspsInstancedMesh.setColorAt(claspIdx0, _scratchColor);
      bridgeClaspsInstancedMesh.setColorAt(claspIdx1, _scratchColor);
    }

    bridgeClaspsInstancedMesh.instanceMatrix.needsUpdate = true;
    if (bridgeClaspsInstancedMesh.instanceColor) {
      bridgeClaspsInstancedMesh.instanceColor.needsUpdate = true;
    }

    // ------------------------------------------------------------------------
    // C. Update Central 10-Sector `Control` Stator, Directional Transfer Pointer
    //    & Open-Bore Readout (`y = -0.24`)
    // ------------------------------------------------------------------------
    const coreTel = stepState.controlCore || stepState.ringTelemetry?.controlCore || null;
    const rawControlKind = step?.after?.control?.kind || step?.controlKind || 'Eval';
    const activeSectorIdx =
      typeof coreTel?.sectorIndex === 'number'
        ? clamp(coreTel.sectorIndex, 0, STATOR_SECTOR_COUNT - 1)
        : resolveControlSectorIndex(rawControlKind, isDoneState, isErrorState);
    const activeSectorMeta = CONTROL_STATOR_SECTORS[activeSectorIdx] || CONTROL_STATOR_SECTORS[0];
    const sectorSwitched = activeSectorIdx !== lastActiveSectorIdx;
    lastActiveSectorIdx = activeSectorIdx;

    for (let i = 0; i < STATOR_SECTOR_COUNT; i += 1) {
      const isSectorActive = i === activeSectorIdx;
      if (!isSectorActive && !sectorSwitched) continue;

      const sector = CONTROL_STATOR_SECTORS[i];
      const theta = Math.PI * 0.5 - i * sectorStep;
      const padY = isSectorActive ? 0.012 : 0.003;

      _scratchPos.set(0, padY, 0);
      _scratchEuler.set(0, theta, 0);
      _scratchQuat.setFromEuler(_scratchEuler);
      _scratchScale.set(1.0, isSectorActive ? 1.45 : 1.0, 1.0);
      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      statorSectorsInstancedMesh.setMatrixAt(i, _scratchMat4);

      if (isSectorActive) {
        const pulse = 1.15 + 0.28 * Math.sin(ambient * 6.0);
        _scratchColor.setHex(sector.color).multiplyScalar(pulse);
      } else {
        _scratchColor.setHex(0x1e293b).lerp(_scratchColorB.setHex(sector.color), 0.38);
      }
      statorSectorsInstancedMesh.setColorAt(i, _scratchColor);
    }
    statorSectorsInstancedMesh.instanceMatrix.needsUpdate = true;
    if (statorSectorsInstancedMesh.instanceColor) {
      statorSectorsInstancedMesh.instanceColor.needsUpdate = true;
    }

    // Directional Radial Transfer Pointer (`transferNeedleGroup`):
    const targetSlotIdx =
      typeof coreTel?.activeSlotIndex === 'number'
        ? coreTel.activeSlotIndex
        : topChronoIdx >= 0
          ? topChronoIdx
          : 0;
    const isTargetingEastSlotB = targetSlotIdx % 2 === 1;
    const targetPointerAngle = isTargetingEastSlotB ? 0 : Math.PI;

    // Smooth shortest-arc angular interpolation for the transfer pointer
    let angleDiff = targetPointerAngle - pointerAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    pointerAngle += angleDiff * alpha14;
    transferNeedleGroup.rotation.y = pointerAngle;

    // Radial pulse stays strictly inside `r ∈ [0.180, 0.212]`
    const pulseWave = Math.sin(clamp(stepFraction, 0, 1) * Math.PI);
    let targetReach = 0.194;
    if (coreTel?.action === 'PUSH' || isPushRule) {
      targetReach = 0.204 + 0.008 * pulseWave;
      needleTipMat.color.setHex(HEX_OP_AMBER);
      needleTipMat.emissive.setHex(HEX_OP_AMBER);
      needleTipMat.emissiveIntensity = 1.5;
    } else if (coreTel?.action === 'REWRITE' || isInPlaceRewriteRule) {
      targetReach = 0.200 + 0.006 * Math.sin(ambient * 12);
      needleTipMat.color.setHex(HEX_OP_GOLD);
      needleTipMat.emissive.setHex(HEX_OP_GOLD);
      needleTipMat.emissiveIntensity = 1.85;
    } else if (coreTel?.action === 'POP' || isPopRule || rawControlKind === 'Return') {
      targetReach = 0.184 - 0.006 * pulseWave;
      needleTipMat.color.setHex(HEX_ENV_CYAN);
      needleTipMat.emissive.setHex(HEX_ENV_CYAN);
      needleTipMat.emissiveIntensity = 1.35;
    } else {
      needleTipMat.color.setHex(activeSectorMeta.color);
      needleTipMat.emissive.setHex(activeSectorMeta.color);
      needleTipMat.emissiveIntensity = 1.1;
    }
    pointerRadialReach = lerp(pointerRadialReach, targetReach, alpha16);
    needleTipMesh.position.x = pointerRadialReach;
    needleStemMesh.position.x = pointerRadialReach - 0.034;
    lowerNeedleTipMesh.position.x = pointerRadialReach;
    lowerNeedleStemMesh.position.x = pointerRadialReach - 0.034;

    // Central Open Sapphire Live Readout Lens & `outputWave`
    const lensCopy = formatControlCoreLensCopy(
      step,
      activeSectorMeta,
      isDoneState,
      isErrorState,
      stepState.trace?.outcome
    );
    const lensAccent = activeSectorMeta.css || CSS_OP_GOLD;
    const coreKey = `${lensCopy.title}|${lensCopy.subtitle}|${lensCopy.badge}|${lensAccent}`;
    if (coreKey !== lastCorePlaqueKey) {
      lastCorePlaqueKey = coreKey;
      controlCoreGroup.userData.title = lensCopy.title;
      controlCoreGroup.userData.subtitle = `${lensCopy.badge} · ${lensCopy.subtitle}`;
      lensPlaqueMat.map = createPlaqueTexture({
        title: lensCopy.title,
        subtitle: lensCopy.subtitle,
        badge: lensCopy.badge,
        accent: lensAccent,
        dark: true,
        width: 384,
        height: 108,
      });
      lensPlaqueMat.needsUpdate = true;
    }

    if (isErrorState) {
      const faultPulse = 0.5 + 0.5 * Math.sin(ambient * 12);
      sapphireLensMat.emissive.setHex(HEX_CRIMSON);
      sapphireLensMat.emissiveIntensity = 0.45 + faultPulse * 0.4;
      outputWaveMesh.visible = false;
      outputWaveMat.opacity = 0.0;
    } else if (isDoneState) {
      const doneBreath = 0.5 + 0.5 * Math.sin(ambient * 4.0);
      sapphireLensMat.emissive.setHex(HEX_ENV_CYAN);
      sapphireLensMat.emissiveIntensity = 0.42 + doneBreath * 0.35;

      const waveT =
        stepFraction > 0.001 && stepFraction < 0.999
          ? stepFraction
          : (ambient * 0.75) % 1.0;
      const waveScale = lerp(1.0, 4.2, waveT);
      outputWaveMesh.visible = true;
      outputWaveMesh.scale.set(waveScale, waveScale, 1);
      outputWaveMat.color.setHex(HEX_ENV_CYAN);
      outputWaveMat.opacity = (1.0 - waveT) * 0.65;
    } else {
      sapphireLensMat.emissive.setHex(activeSectorMeta.color);
      sapphireLensMat.emissiveIntensity = 0.22;
      outputWaveMesh.visible = false;
      outputWaveMat.opacity = 0.0;
    }

    // ------------------------------------------------------------------------
    // D. Update Hollow Chamber Terraces (`D0`..`D7`), Cutaway South Wall & `stackLimit` Horizon Ring
    // ------------------------------------------------------------------------
    const clampedDepthIdx = clamp(frameCount > 0 ? frameCount - 1 : 0, 0, TERRACE_COUNT - 1);
    const southRetractY = -cutawayMix * 3.15;
    const showSouthWall = cutawayMix < 0.85;

    vaultCeilingSouthMesh.position.y = CHAMBER_TOP_Y + 0.01 + southRetractY;
    vaultCeilingSouthMesh.visible = showSouthWall;
    southVaultRibsInstancedMesh.position.y = southRetractY;
    southVaultRibsInstancedMesh.visible = showSouthWall;

    for (let d = 0; d < depthRings.length; d += 1) {
      const ring = depthRings[d];
      const isOccupied = d < frameCount;
      const isDeepestOccupied = d === clampedDepthIdx && frameCount > 0;
      const depthRoleHex = getFrameSemanticHex(_chronoFramesBuffer[d] ?? frames[d] ?? null);

      const southWallGroup = ring.terraceWall?.userData?.southWallGroup;
      if (southWallGroup) {
        southWallGroup.position.y = southRetractY;
        southWallGroup.visible = showSouthWall;
      }
      const loopSouthMesh = ring.loop?.userData?.southMesh;
      if (loopSouthMesh) {
        loopSouthMesh.position.y = southRetractY;
        loopSouthMesh.visible = showSouthWall;
      }

      if (isFrameLimitError && d === stackLimit - 1) {
        const pulse = 0.5 + 0.5 * Math.sin(ambient * 16);
        ring.material.color.setHex(PALETTE.errorRed);
        ring.material.emissive.setHex(PALETTE.errorRed);
        ring.material.emissiveIntensity = 1.1 + pulse * 1.2;
      } else if (isDeepestOccupied) {
        const breath = 0.5 + 0.5 * Math.sin(ambient * 4.5);
        ring.material.color.setHex(depthRoleHex);
        ring.material.emissive.setHex(depthRoleHex);
        ring.material.emissiveIntensity = 0.85 + breath * 0.35;
      } else if (isOccupied) {
        ring.material.color.setHex(depthRoleHex);
        ring.material.emissive.setHex(depthRoleHex);
        ring.material.emissiveIntensity = 0.36;
      } else {
        ring.material.color.setHex(0x1e293b);
        ring.material.emissive.setHex(0x161d29);
        ring.material.emissiveIntensity = 0.02;
      }
    }

    const horizonSouthMesh = horizonLoop.userData?.southMesh;
    if (horizonSouthMesh) {
      horizonSouthMesh.position.y = southRetractY;
      horizonSouthMesh.visible = showSouthWall;
    }

    const limitTerraceIdx = clamp(stackLimit - 1, 0, TERRACE_COUNT - 1);
    const targetLimitY = getTerraceY(limitTerraceIdx) - terraceHeight * 0.46;
    stackLimitGroup.position.y = lerp(
      stackLimitGroup.position.y,
      targetLimitY,
      alpha10
    );

    if (isFrameLimitError) {
      const crimsonPulse = 0.5 + 0.5 * Math.sin(ambient * 18);
      horizonRingMat.color.setHex(PALETTE.errorRed);
      horizonRingMat.emissive.setHex(PALETTE.errorRed);
      horizonRingMat.emissiveIntensity = 1.5 + crimsonPulse * 1.5;
    } else {
      horizonRingMat.color.setHex(PALETTE.gold);
      horizonRingMat.emissive.setHex(PALETTE.gold);
      horizonRingMat.emissiveIntensity = 0.45;
    }

    // ------------------------------------------------------------------------
    // E. Update 3D Silicon 39-Rule Floor Chiplets (`ruleTilesInstancedMesh` & `ruleBeaconInstancedMesh`)
    // ------------------------------------------------------------------------
    let activeCell = null;
    if (activeRuleLine !== null && ruleCellsByLine.has(activeRuleLine)) {
      activeCell = ruleCellsByLine.get(activeRuleLine);
    } else if (activeRuleId && ruleCellsById.has(activeRuleId)) {
      activeCell = ruleCellsById.get(activeRuleId);
    }

    let tracePrevCell = null;
    if (Array.isArray(traceSteps) && stepIndex > 0 && traceSteps[stepIndex - 1]) {
      const prevLine = traceSteps[stepIndex - 1].ruleLine;
      const prevId = traceSteps[stepIndex - 1].ruleId;
      if (prevLine !== null && ruleCellsByLine.has(prevLine)) {
        tracePrevCell = ruleCellsByLine.get(prevLine);
      } else if (prevId && ruleCellsById.has(prevId)) {
        tracePrevCell = ruleCellsById.get(prevId);
      }
    }

    if (isStepChanged) {
      if (lastActiveCell && lastActiveCell !== activeCell) {
        prevTrailCell = lastActiveCell;
        prevTrailCell.trail = 0.65;
      }
      lastActiveCell = activeCell;
      lastStepIndex = stepIndex;
      if (activeCell) {
        floorGroup.userData.title = `${activeCell.rule.id} · ${activeCell.rule.line}:${activeCell.rule.shortName}`;
        floorGroup.userData.subtitle = `${activeCell.rule.fullName} · Charge ${activeCell.rule.charge}F`;
      }
    }

    const effectivePrevCell =
      tracePrevCell && tracePrevCell !== activeCell ? tracePrevCell : prevTrailCell;

    _scratchQuat.identity();
    let floorMutated = false;

    for (let i = 0; i < ruleCells.length; i += 1) {
      const cell = ruleCells[i];
      const isActive = cell === activeCell;
      const isPrev = cell === effectivePrevCell && !isActive;

      if (isActive) {
        cell.trail = 1.0;
      } else if (isPrev) {
        cell.trail = Math.max(cell.trail * (1 - dt * 2.2), 0.36);
      } else {
        cell.trail = Math.max(0, cell.trail - dt * 3.5);
      }

      const isHot = isActive || cell.trail > 0.04;
      if (!isHot && cell.wasSettled) {
        continue;
      }
      cell.wasSettled = !isHot;
      floorMutated = true;

      if (isActive) {
        const pulse = 0.98 + 0.28 * Math.sin(ambient * 6.0);
        _scratchColor.setHex(cell.rule.color).multiplyScalar(pulse);
        _scratchPos.set(cell.x, WELL_FLOOR_Y + 0.068, cell.z);
        _scratchScale.set(1.04, 1.72, 1.04);
      } else if (cell.trail > 0.04) {
        _scratchColor
          .setHex(0x1b2536)
          .lerp(_scratchColorB.setHex(cell.rule.color), 0.24 + cell.trail * 0.62);
        _scratchPos.set(cell.x, WELL_FLOOR_Y + 0.042, cell.z);
        _scratchScale.set(1, 1.18, 1);
      } else {
        _scratchColor.setHex(0x1b2536).lerp(_scratchColorB.setHex(cell.rule.color), 0.22);
        _scratchPos.set(cell.x, WELL_FLOOR_Y + 0.030, cell.z);
        _scratchScale.set(1, 1, 1);
      }

      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      ruleTilesInstancedMesh.setMatrixAt(i, _scratchMat4);
      ruleTilesInstancedMesh.setColorAt(i, _scratchColor);

      // Update south-lip beacon bar height & unlit emissive color
      const beaconY = isActive
        ? WELL_FLOOR_Y + 0.098
        : cell.trail > 0.04
          ? WELL_FLOOR_Y + 0.064
          : WELL_FLOOR_Y + 0.050;
      _scratchPos.set(cell.x, beaconY, cell.z + gridConfig.cellD * 0.46);
      _scratchScale.set(1.0, isActive ? 1.85 : 1.0, 1.0);
      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      ruleBeaconInstancedMesh.setMatrixAt(i, _scratchMat4);

      if (isActive) {
        _scratchColor.setHex(cell.rule.color).multiplyScalar(1.65);
      } else if (cell.trail > 0.04) {
        _scratchColor.setHex(cell.rule.color).multiplyScalar(0.42 + cell.trail * 0.75);
      } else {
        _scratchColor.setHex(cell.rule.color).multiplyScalar(0.38);
      }
      ruleBeaconInstancedMesh.setColorAt(i, _scratchColor);

      // Update corner optical beacon post
      const postScaleY = isActive ? 1.85 : cell.trail > 0.04 ? 0.85 : 0.42;
      const postY = isActive
        ? WELL_FLOOR_Y + 0.104
        : cell.trail > 0.04
          ? WELL_FLOOR_Y + 0.062
          : WELL_FLOOR_Y + 0.046;
      _scratchPos.set(
        cell.x + gridConfig.cellW * 0.42,
        postY,
        cell.z + gridConfig.cellD * 0.40
      );
      _scratchScale.set(isActive ? 1.45 : 1.0, postScaleY, isActive ? 1.45 : 1.0);
      _scratchMat4.compose(_scratchPos, _scratchQuat, _scratchScale);
      ruleBeaconPostInstancedMesh.setMatrixAt(i, _scratchMat4);
      ruleBeaconPostInstancedMesh.setColorAt(i, _scratchColor);
    }

    if (floorMutated) {
      ruleTilesInstancedMesh.instanceMatrix.needsUpdate = true;
      if (ruleTilesInstancedMesh.instanceColor) {
        ruleTilesInstancedMesh.instanceColor.needsUpdate = true;
      }
      ruleBeaconInstancedMesh.instanceMatrix.needsUpdate = true;
      if (ruleBeaconInstancedMesh.instanceColor) {
        ruleBeaconInstancedMesh.instanceColor.needsUpdate = true;
      }
      ruleBeaconPostInstancedMesh.instanceMatrix.needsUpdate = true;
      if (ruleBeaconPostInstancedMesh.instanceColor) {
        ruleBeaconPostInstancedMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  function dispose() {
    const instancedMeshes = [
      fuelInstancedMesh,
      bridgeClaspsInstancedMesh,
      statorSectorsInstancedMesh,
      vaultRibsInstancedMesh,
      southVaultRibsInstancedMesh,
      ruleBezelInstancedMesh,
      ruleTilesInstancedMesh,
      ruleBeaconInstancedMesh,
      ruleBeaconPostInstancedMesh,
    ];
    for (let i = 0; i < instancedMeshes.length; i += 1) {
      if (instancedMeshes[i] && typeof instancedMeshes[i].dispose === 'function') {
        instancedMeshes[i].dispose();
      }
    }
    for (let i = 0; i < disposableGeometries.length; i += 1) {
      disposableGeometries[i].dispose();
    }
    for (let i = 0; i < disposableMaterials.length; i += 1) {
      disposableMaterials[i].dispose();
    }
    for (let i = 0; i < disposableTextures.length; i += 1) {
      disposableTextures[i].dispose();
    }
    disposableGeometries.length = 0;
    disposableMaterials.length = 0;
    disposableTextures.length = 0;
  }

  update({ ambient: 0, dt: 0.016, stepFraction: 0 });

  return {
    group,
    update,
    dispose,
  };
}
