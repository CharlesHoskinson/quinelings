# Sherlock Chip 7-Designer Architecture & Data Contract

Each designer builds a self-contained ES module in `/home/charles/sherlock-bench/src/designers/` that imports `* as THREE from 'three'` and utilities from `'./theme.js'`.

## Spatial Layout & Coordinate System
- **Bench Floor**: `y = -0.34` (optical reticle plane & shadows)
- **BGA/PGA Substrate & Pins (Designer 1)**: `x, z ∈ [-2.35, 2.35]`, `y ∈ [-0.30, 0.08]`, with gull-wing pins extending out to `±2.72`.
- **Titanium Lid & Iris Aperture (Designer 1)**: Lid surface at `y = 0.08..0.11`, outer perimeter `[-2.20, 2.20]`, inner square/octagonal aperture `[-1.08, 1.08]`. Mechanical shutter blades sit at `y = 0.095`.
- **Recursion Well & 39-Rule Silicon Decoder Floor (Designer 2)**: Inside aperture `x, z ∈ [-1.06, 1.06]`, descending from `y = 0.02` down to `y = -2.35`. The 39-rule `sherlock-k-a/1` matrix (`A080`..`A225`) sits on the illuminated silicon floor at `y = -2.28`, with vertical TSV bus traces rising along the 4 inner walls of the well.
- **9-Variant Suspended Frame Stack & EnvRoot Chains (Designer 3)**: Suspended inside the well `x, z ∈ [-0.88, 0.88]`, `y ∈ [-1.95, 0.22]`. Each active `Frame` in `step.after.frames` is rendered with variant-specific 3D geometry (`Let`, `Left`, `Right`, `Unary`, `If`, `Match`, `Args`, `Return`, `Scope`), a high-DPI label plaque, and linked 3D lexical environment binding satellites (`env_roots`).
- **Live Semantic Value Arena & ProgramImage ROM Cartridge (Designer 4)**: Above the aperture `x, z ∈ [-0.95, 0.95]`, `y ∈ [0.28, 1.35]`. Dynamically renders the active `Control` value / scrutinee / return value (`UInt` 128-bit crystal + limb rings, `Bool` prism, `List` linked spine of `Cons` cells, `Tree` 3D recursive branching tree of `Branch`/`Leaf` nodes), plus the incoming `ProgramImage` ROM cartridge during ingestion (`y ≈ 1.45`).
- **L4 Machine Image Arenas & Aux/1 + Aux/2 Witness Micro-Architecture (Designer 5)**: On the lid deck (`y = 0.11..0.18`) across the 4 quadrants surrounding the central aperture:
  - **NW Quadrant (`x ∈ [-2.08, -1.14], z ∈ [-2.08, -0.15]`)**: `ProgramBlock` ROM table (`ExprRow` array, highlighting `control_origin` `ExprId`).
  - **NE Quadrant (`x ∈ [1.14, 2.08], z ∈ [-2.08, -0.15]`)**: `StateBlock` L4 arenas (`Data`/`Values`, `EnvCells`/`Bindings`, `ControlRows`/`Frames`) showing active vs padded rows (`HostImageUsage`).
  - **SW Quadrant (`x ∈ [-2.08, -1.14], z ∈ [0.15, 2.08]`)**: `aux/1` helper scan lanes (`EnvGetScan`, `FindScan`, `BindPreflight`, `EqScratch`).
  - **SE Quadrant (`x ∈ [1.14, 2.08], z ∈ [0.15, 2.08]`)**: `aux/2` 16-byte UInt128 ALU limb array (`r[0..15]`, carries `c[0..16]`, borrows `bo[0..16]`, wide-mul diagonals) + 16-byte `FuelWitness` (`zp[0..16]`, `bw[0..16]`).
- **ReferenceSlice (1/2/4/8) & IVC Proof-History Composition Loom (Designer 6)**: Along the rear and upper perimeter (`x ∈ [-2.25, 2.25]`, `z ∈ [-1.35, -2.35]`, `y ∈ [0.16, 1.35]`), grouping executed `StepRecord`s into `ReferenceSlice` brackets (width 1, 2, 4, or 8), rendering step nodes, slice brackets, accumulation arcs, and the central Ledger-9 Custom-Decider proof crystal.
- **Custom GLSL Shaders, 3D Raycast Inspector & Camera Choreography (Designer 7)**: Volumetric well glow shader, signal pulse shader, interactive raycaster targeting objects tagged with `tagInspectable(obj, meta)`, 3D selection highlight reticle, and 8 camera lens presets (`overview`, `well`, `frames`, `arena`, `circuit`, `loom`, `aux2`, `cinema`).

## `stepState` Object Passed to `.update(stepState)`
```js
{
  // Continuous time & playback
  ambient: number,          // monotonically increasing seconds
  dt: number,               // delta time in seconds
  stepIndex: number,        // current integer step index (0..totalSteps-1)
  stepFraction: number,     // fractional interpolation within current step (0..1)
  totalSteps: number,       // total steps in current trace
  progress: number,         // 0..1 overall trace progress
  phase: 'STILL' | 'INGEST' | 'DESCEND' | 'RESOLVE' | 'RETURN' | 'EMBLEM' | 'ERROR',
  aperture: number,         // 0..1 iris opening factor

  // Real Sherlock Trace Data
  trace: {
    programName: string,
    source: string,
    programImage: {
      expressions: Array<{ id, kind, op, name, literal, children, span, astPath }>,
      functions: Array<{ id, name, params, returnType, bodyExpr }>,
      constants: Array<any>,
    },
    steps: Array<StepRecord>,
    slices: Array<ReferenceSlice>, // grouped by active sliceWidth (1, 2, 4, or 8)
    sliceWidth: number,
    outcome: { kind: 'Done' | 'Rejected' | 'Exhausted', value?: any, code?: number, message?: string },
  },

  // Current StepRecord (trace.steps[stepIndex])
  step: {
    index: number,
    ruleId: string,         // e.g. 'A102', 'A135', 'A153', 'A080'
    ruleLine: number,       // e.g. 102, 135, 153, 80
    ruleName: string,       // e.g. 'Push frame', 'Binary primitive', 'Done'
    charge: number,         // 1 for charged rules, 0 for terminal publication
    controlKind: string,    // 'Eval' | 'Return' | 'Push' | 'Invoke' | 'Enter' | 'Bound' | 'Cases' | 'CaseResult' | 'PrimitiveResult' | 'Error'
    controlSummary: string,
    controlValue: any,      // structured Value if present ({ kind: 'UInt'|'Bool'|'List'|'Tree', ... })
    focusValue: any,        // primary Value to visualize in Designer 4's semantic arena
    before: SnapshotSummary,
    after: {
      fuel: number,
      stackLimit: number,
      control: { kind: string, exprId: number | null, summary: string, value: any },
      controlOrigin: { exprId: number | null, line: number, start: number, end: number, astPath: string, text: string },
      frames: Array<{
        index: number,
        kind: 'Let' | 'Left' | 'Right' | 'Unary' | 'If' | 'Match' | 'Args' | 'Return' | 'Scope',
        label: string,
        detail: string,
        originExprId: number | null,
        astPath: string,
        envId: number,
        bindings: Array<{ name: string, valueSummary: string, type: string }>,
      }>,
      envRoots: Array<{
        id: number,
        bindings: Array<{ name: string, valueSummary: string, type: string }>,
      }>,
      machineImage: {
        expressions: number,
        values: number,
        environments: number,
        bindings: number,
        frames: number,
        controls: number,
        usage: { rows: number, cells: number, nameBytes: number },
      },
      aux1: {
        activeKind: 'EnvGetScan' | 'FindScan' | 'BindPreflight' | 'EqScratch' | 'None',
        targetName: string,
        probes: Array<{ index: number, name: string, hit: boolean }>,
      },
      aux2: {
        arithmetic: {
          active: boolean,
          op: string,        // '+', '-', '*', '==', '<', 'none'
          lhs: string,
          rhs: string,
          result: string,
          overflow: boolean,
          lhsBytes: number[],    // length 16 (little-endian UInt128 limbs)
          rhsBytes: number[],    // length 16
          resultBytes: number[], // length 16
          carries: number[],     // length 17
          borrows: number[],     // length 17
          diagonals: number[],   // length 32 for mulWide
        },
        fuel: {
          before: number,
          after: number,
          beforeBytes: number[], // length 16
          afterBytes: number[],  // length 16
          zeroProbe: number[],   // zp[0..16]
          borrows: number[],     // bw[0..16]
        },
      },
    },
  },
}
```


---

## Wave 2 Mandate: Apple Industrial Minimalism & Recursion Processing Clarity

All 7 designers MUST adhere to these Wave 2 redesign principles:

1. **Apple Silicon & Dieter Rams Restraint ("Less, but better")**:
   - **Eliminate Visual Clutter**: Remove noisy external greebles (no sticking-out gull-wing legs, no scattered SMD capacitors, no heavy truss gantries, no tall 3D bar-chart towers on the lid, no busy concentric shader grids).
   - **Monolithic Flush Profiles**: The chip must read as a single, precision-machined Apple M4 / R1 style monolithic module: matte space-black ceramic (`0x141518`), satin bead-blasted titanium (`0x6e6d68`), warm paper bench (`0xf3efe6`), and hairline gold/amber/emerald micro-LED accents.
   - **Generous Negative Space**: Leave clean, uncrowded margins between functional zones so the user's eye is drawn effortlessly to the **active motion** and **recursion processing**.

2. **Visceral Recursion Processing (Descent, Waiting Holes, Base Case, Unwind Cascade)**:
   - The centerpiece of the animation is **how Sherlock processes recursion**:
     - **Descent (`DESCEND` / `Push frame`)**: Each recursive call or sub-expression spawns a sleek, ultra-thin **Continuation Wafer** that glides down into the well, displaying its waiting hole equation (e.g., `4 * [ ? ]`, `h + [ ? ]`, `return : UInt`) and a taut vertical light-thread connecting its `[ ? ]` hole to the child evaluation below.
     - **Live Call-Tree / Recursion Chain**: Above the well, a clean floating **Recursion Call-Tree Arc** shows the live recursive call chain (`fact(4) → fact(3) → fact(2) → fact(1) → fact(0)` or tree/list recursion branches), distinguishing **active** (warm ember `#e86446`), **waiting on stack** (champagne gold `#d4a24c`), and **resolved/returned** (emerald `#45937a`).
     - **Unwind / Fold Ascent (`RESOLVE` / `RETURN`)**: When a base case or child call returns, a **glowing emerald Value Orb** travels UP the vertical light-thread into the waiting parent wafer's `[ ? ]` hole, visibly collapsing the stack upward layer-by-layer into the final result!

3. **Use `scrapling` & Web Search for Research First**:
   - Before writing code, use `search_web` and `/home/charles/.local/share/uv/tools/scrapling/bin/python` (`from scrapling.fetchers import Fetcher, DynamicFetcher`) to research real-world visual references for your subsystem, save a brief design note in `/home/charles/sherlock-bench/src/designers/research_dN.md`, and then rewrite your `designerN_*.js` module cleanly.
