# Ring Study 10: Apple HIG Inspector UI & Editorial Ring-Language Synchronization

## 1. Executive Summary ("Less, but better")
Every element in the HTML Inspector (`index.html`, `src/styles.css`, `src/app.js`) and the Editorial Architecture Guide speaks the exact visual and semantic language of the 3D WebGPU die (`designer2_well.js`) and the formal `sherlock-k-a/1` Rust reference (`reference_types.rs` / `reference.rs`). User-facing HTML cards, inspector headers, and legends replace legacy "Ruby" terminology (while internal stage camera/preset hooks remain in `SherlockStage.js` / `designer7_cinema.js`) with:
1. **12-Frame Chronological Split-Arc Window (`R1.A..R6.B`, 6 Stacked Horizontal Rows: West `Slot A` | East `Slot B`)**: Ordered chronologically from the bottom of the stack (`R1.A = frames[len - 1]`) at the top row down to the active frontier (`frames[0]`) at the bottom row, with `stack_limit` governed independently by the frame-limit slider and depths `> 12` badged on `R6.B` as `+N overflow`.
2. **Semantic Frame Color Families & Sub-Variant Distinction (`reference_types.rs`)**:
   - **`ENV` (`Return` / `Scope`)**: Distinguishes **`Return` in Emerald-Teal (`#0d9488`)** (saving caller `Environment` + declared return-type check on `Rule 185`) from **`Scope` in Sky-Cyan (`#0284c7`)** (restoring shadowed `let` or `match` bindings on `Rule 195`).
   - **`OP` (`Left` / `Args` / `Unary` → `Right`)**: Distinguishes **`Left` / `Args` / `Unary` in Amber (`#d97706`)** from **`Right` in Gold (`#b45309`)**. **`Right` is never pushed directly**: `Rule 117` pushes `Left([?] * rhs)` (Amber), and when the left operand returns, **`Rule 149` rewrites `frames[0]` in-place from `Left` to `Right(4 * [?])` (Gold)** at constant stack depth (`Rule 177` similarly advances `Args` in-place).
   - **`GATE` (`If` / `Match` / `Let`) — Violet-Indigo (`#6e548a`)**: Branching gates, structural pattern scrutinees, and `Let` bindings (`Rule 145` rewrites `frames[0]` in-place from Violet `Let` to Sky-Cyan `Scope` at constant stack depth).
3. **10-Sector `Control` Stator Strip & Hemisphere Needle**: Displays the 10 `Control` variants of `sherlock-k-a/1` (`EVAL`, `PUSH`, `RET`, `INVOKE`, `ENTER`, `BOUND`, `CASES`, `MATCH`, `PRIM`, `ERR` — where `RET` and `MATCH` abbreviate `Control::Return` and `Control::CaseResult`, distinct from `Frame::Return` and `Frame::Match`), plus the needle's West (`Slot A`) or East (`Slot B`) hemisphere for the newest visible frame.

---

## 2. Chronological Outermost-to-Innermost Ring Mapping (`R1`..`R6`) & Two-Moment `fact(4)` Trace
In `reference.rs`, `Control::Push` inserts new continuation frames at `frames[0]` (top of stack), while the oldest frame sits at `frames[frames.len() - 1]` (bottom of stack).
- Reversing the stack into chronological order (`const chronoFrames = [...frames].reverse();`) keeps the root call anchored in **Ring 1 (`R1`)** while newer frames appear inward (`R1 -> R2 -> R3 -> R4 -> R5 -> R6`) and unwind outward.
- In `fact(4)`, each non-tail recursive call goes through an `If` branch test (`n == 0`), pops `If` (`Rule 165`), pushes `Left([?] * fact(n - 1))` (`Rule 117`), evaluates the left literal `n`, and rewrites `frames[0]` in-place to `Right(n * [?])` (`Rule 149`) before entering `fact(n - 1)`.

### Moment A — Suspended at the multiplications, before `fact(0)` is entered (`8/12 slots`)
| Ring | Chronological Indices | West Half-Arc (`Slot A`, older) | East Half-Arc (`Slot B`, newer) | Inspector Track Readout |
| :--- | :--- | :--- | :--- | :--- |
| **`R1` (Outer)** | `chronoFrames[0..1]` | `Return` of `fact(4)`, root map | `Right(Mul, 4)` (after `Rule 149`) | `West A: RET:UInt (root)` · `East B: 4 × [?] (n=4)` |
| **`R2`** | `chronoFrames[2..3]` | `Return` of `fact(3)`, map `n=4` | `Right(Mul, 3)` (after `Rule 149`) | `West A: RET:UInt (n=4)` · `East B: 3 × [?] (n=3)` |
| **`R3`** | `chronoFrames[4..5]` | `Return` of `fact(2)`, map `n=3` | `Right(Mul, 2)` (after `Rule 149`) | `West A: RET:UInt (n=3)` · `East B: 2 × [?] (n=2)` |
| **`R4`** | `chronoFrames[6..7]` | `Return` of `fact(1)`, map `n=2` | `Right(Mul, 1)` (after `Rule 149`) | `West A: RET:UInt (n=2)` · `East B: 1 × [?] (n=1)` |
| **`R5`** | `chronoFrames[8..9]` | Idle | Idle | `West A: —` · `East B: —` |
| **`R6` (Inner)** | `chronoFrames[10..11]` | Idle | Idle | `West A: —` · `East B: —` |

### Moment B — Peak depth at the base-case test `0 == 0`, after `Rule 149` rewrites the equality (`11/12 slots`)
| Ring | Chronological Indices | West Half-Arc (`Slot A`, older) | East Half-Arc (`Slot B`, newer) | Inspector Track Readout |
| :--- | :--- | :--- | :--- | :--- |
| **`R1`–`R4`** | `chronoFrames[0..7]` | Unchanged from Moment A | Unchanged from Moment A | Settled `Return` + `Right` pairs for `4, 3, 2, 1` |
| **`R5`** | `chronoFrames[8..9]` | `Return` of `fact(0)`, map `n=1` | `If` of `fact(0)`, map `n=0` | `West A: RET:UInt (n=1)` · `East B: IF [?] (n=0)` |
| **`R6` (Inner)** | `chronoFrames[10..11]` | `Right(Eq, 0)` (after `Rule 149`) | Idle | `West A: 0 == [?] (n=0)` · `East B: —` |

- **Tail-Recursive & Structural Contrasts**: Tail-recursive `is_even(4)` / `is_odd` pops `If` and `Args` before entering the callee, pushing only `Frame::Return` (so two calls share one ring), while `sum_list` places `Match`, `Scope`, and binary operand frames across the split arcs.

---

## 3. Apple HIG Typography, Contrast & DOM Performance Architecture (`index.html`, `styles.css`, `app.js`)
- **WCAG AA Contrast & Minimum 11px–12px Type Floor**:
  - Raised `--muted` from `#8c887f` (3.2:1) to `#5c5850` (`>= 5.8:1` on `--paper` / `--paper-card`) and `--paper-border` to `#c8c0b0`, removed `opacity: 0.72` on `.slot-idle`, and enforced a `11px`–`12px` floor across all inspector labels, ring slot readouts, legend badges, and telemetry `<dl>` items.
  - Reserved `--heat` / `--error` red-orange strictly for faults (`Rejected` / `Exhausted`), styling normal `Evaluating` and active states in calm **Sapphire-Slate / Amber-Gold (`#1e293b` / `#b45309`)** and `Done` in **Emerald-Teal (`#0d9488`)**.
  - Enforced comfortable `min-height: 34px..38px`, `padding: 6px 12px` hit targets on transport, preset, camera view, and call-node buttons.
- **Paired West/East Split-Arc Rows + `R6.B` Overflow Badge**:
  - `#sixRingsGauge` renders 6 stacked horizontal split-arc rows (`R1` outermost at top down to `R6` innermost at bottom) with `[ R1 (02) ]  [ West A: ... ] | [ East B: ... ]` side-by-side, followed by the **10-Sector `Control` Stator Strip**.
  - When `frames.length > 12`, only `R6.B` receives `.slot-overflow` and a separate `+N overflow` badge rather than painting all of `R6` red.
- **Step-Gated & Signature-Cached DOM Updates**:
  - `#stepScrubber` uses integer `step="1"`, `Space` play/pause is gated so focused `<button>`, `<input>`, `<textarea>`, and `<select>` controls activate normally, and `syncStepUI` caches `lastRingsHtml`, `lastFramesHtml`, `lastCallsHtml`, and `lastActiveLine` so `innerHTML` is only touched when the rendered string actually changes.
