# Ring Study 01: Sherlock Compiler, `ProgramImage`, and Ring-Slot Provenance

## 1. Executive Summary

This study documents how the frozen `sherlock-k-a/1` reference machine in Moriarty ([`reference_types.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference_types.rs) and [`reference.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference.rs)) manipulates its continuation stack (`Snapshot::frames: Vec<Frame>`) and `Control` register during execution, and establishes the exact provenance mapping from `Snapshot` states to the **6 Concentric Horological Rings (`R1`–`R6`, 12 Frame Slots `0..11`)** and the **10-Sector Central Control Core**.

---

## 2. Top-First Continuation Storage vs. Chronological Ring Order

### 2.1 Why `self.state.frames.insert(0, frame)` Stores Frames Top-First
In [`reference_types.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference_types.rs#L155-L171), `Snapshot` documents the K cell ordering invariant:

```rust
/// Complete post-startup K boundary state on the typed host common domain.
/// Frames are stored top first. `None` control represents K's `.K`.
pub struct Snapshot {
    pub program: Arc<Program>,
    pub control: Option<Control>,
    pub environment: Environment,
    pub frames: Vec<Frame>,
    pub stack_limit: usize,
    pub remaining_fuel: u128,
    pub initial_fuel: u128,
    pub outcome: Outcome,
}
```

In [`reference.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference.rs#L105-L113), **Rule 135 (`Push frame`)** prepends every newly pushed continuation frame to index `0`:

```rust
Control::Push(frame, next, environment) => {
    if self.state.frames.len() < self.state.stack_limit {
        self.state.frames.insert(0, frame);
        self.state.environment = environment;
        (135, *next)
    } else {
        (140, Control::Error(4))
    }
}
```

And in `return_value` ([`reference.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference.rs#L224-L294)), every continuation dispatch inspects `self.state.frames[0]`, either:
1. **Rewriting `self.state.frames[0]` in-place** without changing stack depth:
   - **Rule 145 (`Bind let`)**: `Frame::Let(name, body, env)` $\rightarrow$ `Frame::Scope(env)`
   - **Rule 149 (`Right operand`)**: `Frame::Left(op, right, env)` $\rightarrow$ `Frame::Right(op, left_val)`
   - **Rule 177 (`Next arg`)**: `Frame::Args(name, values, rest, env)` $\rightarrow$ `Frame::Args(name, values', rest', env)`
2. **Popping `self.state.frames.remove(0)`**:
   - **Rule 153 (`Binary primitive`)**: pops `Frame::Right`
   - **Rule 157 (`Unary primitive`)**: pops `Frame::Unary`
   - **Rule 161 / 165 (`If true` / `If false`)**: pops `Frame::If`
   - **Rule 173 (`Start cases`)**: pops `Frame::Match`
   - **Rule 181 (`Finish args`)**: pops `Frame::Args`
   - **Rule 185 (`Return type ok`)**: pops `Frame::Return`
   - **Rule 195 (`Restore scope`)**: pops `Frame::Scope`

Because `frames[0]` is always the **newest (innermost/top-of-stack)** continuation and `frames[frames.len() - 1]` is the **oldest (outermost/root)** continuation, rendering `frames` directly by raw array index would cause every push or pop at `frames[0]` to shift the index of every older frame on the stack.

### 2.2 Reversing `frames` into Chronological Order (`chronoFrames`)
By reversing the snapshot stack:

```js
const chronoFrames = [...(step.after.frames || [])].reverse();
```

we obtain a **stable chronological coordinate system** where:
- `chronoIdx = 0` is the **oldest frame at the bottom of the stack** (pushed first by the root call), and remains locked at `chronoIdx = 0` for the entire lifetime of that call until it finally pops at program completion.
- `chronoIdx = chronoFrames.length - 1` (`ringTelemetry.frontierSlotIndex`) is the **active top-of-stack (`isTopOfStack = true`)**, where all pushes (`PUSHED`), in-place rewrites (`REWRITTEN` on Rules 145, 149, 177), and pops (`POPPED`, retaining `poppedKind`, `poppedFamily`, `poppedLabel`, and `originExprId` from `prevFrame` for unwind visuals) occur.
- Grouping `chronoFrames` into pairs (`r = 0..5`, `slotA = 2*r`, `slotB = 2*r + 1`) maps:
  - **Outermost Ring 1 (`R1`, slots `0, 1`)** to the root call context (e.g., `fact(4): Return(:UInt) + Right(4 * [?])`).
  - **Innermost Ring 6 (`R6`, slots `10, 11`)** to the deepest physical ring pair (`chronoIdx = 10, 11`, e.g., `0 == 0` at base-case depth `11` in `fact(4)`).
  - When `chronoFrames.length > 12`, `slot 11` (`R6.B`) holds `chronoFrames[11]` (`isTopOfStack: false`), while the true stack frontier is exposed via `ringTelemetry.frontierSlotIndex = chronoFrames.length - 1` and `ringTelemetry.overflowTopFrame`.

---

## 3. Semantic Pairing: Why One Recursive Call = One Concentric Ring (2 Slots)

### 3.1 The 3 Semantic Frame Families
The 9 `Frame` variants in [`reference_types.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference_types.rs#L101-L112) partition cleanly into 3 architectural families:

| Family | Color Encoding | `Frame` Variants | Machine Role in `reference.rs` |
| :--- | :--- | :--- | :--- |
| **`ENV`** | Cyan-Teal | `Return(Type, Environment)`, `Scope(Environment)` | Saved caller/lexical environment & return-type contract check (Rules 185, 195, 208, 220) |
| **`OP`** | Amber-Gold | `Left(BinaryOp, ExprRef, Environment)`, `Right(BinaryOp, Value)`, `Unary(UnaryOp)`, `Args(Name, Vec<Value>, Vec<ExprRef>, Environment)` | Pending arithmetic/constructor operator or call-argument hole (`totalArgs = evaluated.len() + 1 + remaining.len()`, `ARGS k/totalArgs`) waiting for an operand value (Rules 117, 120, 131, 149, 153, 157, 177, 181) |
| **`GATE`** | Violet-Indigo | `If(ExprRef, ExprRef, Environment)`, `Match(Vec<Arm>, Environment)`, `Let(Name, ExprRef, Environment)` | Pending conditional branch, pattern dispatch, or lexical binding gate (Rules 114, 123, 126, 145, 161, 165, 173) |

### 3.2 How Non-Tail Recursion Pairs `Slot A` + `Slot B` on Each Ring
When a function `f(n)` makes a non-tail recursive call such as `n * fact(n - 1)`:
1. **Entering `fact(n)` (Rule 208 `Schedule body`)** pushes **`Frame::Return(Type::UInt, caller_env)`** into **`Slot A` (`chronoIdx = 2*r`)**. This frame guards the function boundary, remembers the caller's `Environment`, and checks `has_type(&value, ty)` upon exit (Rule 185).
2. **Evaluating the body `if n == 0 { 1 } else { n * fact(n - 1) }`**:
   - First, `Expr::If` pushes **`Frame::If(yes, no, {n})`** into **`Slot B` (`chronoIdx = 2*r + 1`)** (Rule 123 $\rightarrow$ 135).
   - Evaluating condition `n == 0` temporarily uses the next inner ring (`Slot A` of `R(r+1)`) for `Left([?] == 0)` $\rightarrow$ `Right(n == [?])`.
   - When `n == 0` returns `Bool(false)` (Rule 153 $\rightarrow$ 223), **Rule 165 (`If false`) pops `Frame::If` from `Slot B`** and transitions to `Control::Eval(n * fact(n - 1))`.
   - Immediately, **Rule 117 (`Binary left`) + Rule 135 (`Push frame`)** pushes `Frame::Left(Mul, fact(n - 1), {n})` back into that exact same **`Slot B` (`chronoIdx = 2*r + 1`)**!
   - Looking up `n` (Rule 108) and applying **Rule 149 (`Right operand`)** rewrites **`Slot B` in-place** to **`Frame::Right(Mul, n)`** (`n * [?]`).
   - Next, evaluating `fact(n - 1)` temporarily pushes `Frame::Args("fact", [], [], {n})` (`fact(0/1 args)`, `ARGS 0/1`) into `R(r+1).slotA` while `n - 1` is computed in `R(r+1).slotB`. As soon as `n - 1` finishes, **Rule 181 (`Finish args`) pops `Frame::Args`** and invokes `fact(n - 1)`, which pushes `fact(n - 1)`'s own **`Frame::Return(:UInt, {n})`** into `R(r+1).slotA`!

Thus, every suspended non-tail recursive activation `fact(k)` occupies **exactly one concentric ring `R_r`** with two slots:
- **`Slot A` (`2*r`, `ENV`)**: `Return(:UInt)` holding the caller's environment.
- **`Slot B` (`2*r + 1`, `OP`)**: `Right(k * [?])` holding the pending multiplication waiting for `fact(k - 1)`.

---

## 4. Concrete Program Traces Across the 6 Concentric Rings (`R1`–`R6`)

### 4.1 `fact(4)` — Peak Depth at Base Case `0 == 0` (11 Frames across `R1`–`R6`)
At the moment `fact(0)` evaluates its base-case condition `0 == 0` (Step 125, Rule 149 `Right operand`), the 11 active frames in `chronoFrames` populate `R1` through `R6` from outside in:

| Ring | Capacity | Slot A (`chronoIdx = 2r`) | Slot B (`chronoIdx = 2r + 1`) | Recursive Activation |
| :--- | :--- | :--- | :--- | :--- |
| **`R1`** (Outermost) | `02` | **Slot 0 (`ENV`)**: `RET:UInt` (`root`) | **Slot 1 (`OP`)**: `4 * [?]` (`lhs = 4`) | `fact(4)` suspended at `4 * fact(3)` |
| **`R2`** | `04` | **Slot 2 (`ENV`)**: `RET:UInt` (`n=4`) | **Slot 3 (`OP`)**: `3 * [?]` (`lhs = 3`) | `fact(3)` suspended at `3 * fact(2)` |
| **`R3`** | `06` | **Slot 4 (`ENV`)**: `RET:UInt` (`n=3`) | **Slot 5 (`OP`)**: `2 * [?]` (`lhs = 2`) | `fact(2)` suspended at `2 * fact(1)` |
| **`R4`** | `08` | **Slot 6 (`ENV`)**: `RET:UInt` (`n=2`) | **Slot 7 (`OP`)**: `1 * [?]` (`lhs = 1`) | `fact(1)` suspended at `1 * fact(0)` |
| **`R5`** | `10` | **Slot 8 (`ENV`)**: `RET:UInt` (`n=1`) | **Slot 9 (`GATE`)**: `IF [?]` (`n=0`) | `fact(0)` testing `if n == 0` |
| **`R6`** (Innermost) | `12` | **Slot 10 (`OP`, Top)**: `0 == [?]` (`lhs = 0`) | **Slot 11 (`IDLE`)**: *Empty* | Base-case equality `0 == 0` |

When `0 == 0` resolves to `true` and `fact(0)` returns `1`, the stack unwinds strictly from **`R6` outward to `R1`**:
- `R5` pops `IF [?]` and `RET:UInt`, returning `1` to `R4.slotB` (`1 * [?]`).
- `R4` pops `1 * [?]` $\rightarrow$ `1` and `RET:UInt`, returning `1` to `R3.slotB` (`2 * [?]`).
- `R3` pops `2 * [?]` $\rightarrow$ `2` and `RET:UInt`, returning `2` to `R2.slotB` (`3 * [?]`).
- `R2` pops `3 * [?]` $\rightarrow$ `6` and `RET:UInt`, returning `6` to `R1.slotB` (`4 * [?]`).
- `R1` pops `4 * [?]` $\rightarrow$ `24` and `RET:UInt`, publishing `Done(24)` via Rule 80!

### 4.2 `sum_list([5, 8, 3])` — Pattern Matching & Lexical `Scope` Frames
In `ListFold` (`entry sum_list(cons(5, cons(8, cons(3, nil))))`):
1. **Entry List Spine Construction**:
   - `Call("sum_list", ...)` pushes `sum_list(0/1 args)` (`ARGS 0/1`) into `R1.slotA` (`slot 0`).
   - Nested `cons(5, cons(8, cons(3, nil)))` pushes `5 cons [?]` (`slot 1`), `8 cons [?]` (`slot 2`), and `3 cons [?]` (`slot 3`), folding right-to-left into `[5, 8, 3]` before `ARGS 0/1` pops on Rule 181.
2. **Recursive `match xs` Unfolding**:
   - Each call to `sum_list(xs)` pushes `RET:UInt` (Rule 208 $\rightarrow$ 135), then `MATCH [?]` (Rule 126 $\rightarrow$ 135).
   - Rule 173 (`Start cases`) pops `MATCH [?]` and transitions to `Control::Cases`.
   - When `cons(h, t)` matches (Rule 214 $\rightarrow$ Rule 220 `Match arm body`), the machine pushes **`Frame::Scope(saved_env)`** (`SCOPE`, `ENV` family) to preserve the outer lexical scope while binding `h` and `t`, followed by `Left([?] + sum_list(t))` $\rightarrow$ `Right(h + [?])` (`OP` family).

### 4.3 `sum_tree(branch(leaf(7), branch(leaf(4), leaf(9))))` — Binary Tree Left/Right Subtree Rewriting
In `TreeFold`:
- When `branch(l, r) => sum_tree(l) + sum_tree(r)` matches:
  - While descending the **left subtree `sum_tree(l)`**, the binary addition slot holds **`Frame::Left`: `[?] + sum_tree(r)`** (saving `r` in the frame's captured environment).
  - When `sum_tree(l)` returns `7`, **Rule 149 (`Right operand`)** rewrites that exact slot in-place from `[?] + sum_tree(r)` to **`Frame::Right`: `7 + [?]`**, and the machine descends the **right subtree `sum_tree(r)`** using the inner rings!

### 4.4 `is_even(4)` — Mutual Tail Recursion (`is_even` $\leftrightarrow$ `is_odd`)
In `ParityCheck` (`entry is_even(4)`):
- Because `is_odd(n - 1)` and `is_even(n - 1)` are in **tail position** inside the `else` branch of `if n == 0`, both `Frame::If` (popped by Rule 165) and `Frame::Args` (popped by Rule 181 after `n - 1` evaluates) are popped *before* the recursive callee is entered.
- Consequently, each suspended caller leaves only its single **`Frame::Return(Type::Bool, caller_env)`** (`RET:Bool`) on the stack:
  - `R1.slotA` (`slot 0`): `RET:Bool` (`root`, from `is_even(4)`)
  - `R1.slotB` (`slot 1`): `RET:Bool` (`n=4`, from `is_odd(3)`)
  - `R2.slotA` (`slot 2`): `RET:Bool` (`n=3`, from `is_even(2)`)
  - `R2.slotB` (`slot 3`): `RET:Bool` (`n=2`, from `is_odd(1)`)
  - `R3` (`slots 4, 5`): holds `is_even(0)`'s `RET:Bool` (`n=1`) + `IF [?]` (`n=0`), while `R4.slotA` (`slot 6`) evaluates `0 == [?]`.

---

## 5. The 10-Sector Central `controlCore` Mapping

Replacing the unstructured central ornament, `stepState.controlCore.variant` maps the post-step `Snapshot.control` register variant of [`reference_types.rs`](file:///home/charles/repos/Moriarty/crates/mori-core/src/sherlock/reference_types.rs#L114-L126) (plus terminal outcomes) onto 10 deterministic angular dial sectors (`0..9`), while `stepState.controlCore.action` (`'EVAL' | 'PUSH' | 'REWRITE' | 'POP' | 'DONE' | 'ERROR'`) tracks the continuation stack transition executed by that step:

| Sector Index | `variant` | Post-Step `Snapshot.control` / `Outcome` | Rules Producing This Post-State `Control` | Rules Consuming This `Control` |
| :---: | :--- | :--- | :--- | :--- |
| `0` | `'EVAL'` | `Control::Eval(ExprRef)` | Rules 135, 145, 149, 161, 165, 177 | Rules 102, 108, 111, 114, 117, 120, 123, 126, 129, 131 |
| `1` | `'PUSH'` | `Control::Push(Frame, Box<Control>, Environment)` | Rules 114, 117, 120, 123, 126, 131, 208, 220 | Rules 135, 140 |
| `2` | `'RETURN'` | `Control::Return(Value)` / `Outcome::Done(Value)` (`isTerminalDone: true`) | Rules 80, 102, 108, 185, 195, 223 | Rules 80, 145, 149, 153, 157, 161, 165, 169, 173, 177, 181, 185, 190, 195 |
| `3` | `'INVOKE'` | `Control::Invoke(Name, Vec<Value>)` | Rules 129, 181 | Rule 200 |
| `4` | `'ENTER'` | `Control::Enter(Option<Function>, Vec<Value>)` | Rule 200 | Rules 202, 204 |
| `5` | `'BOUND'` | `Control::Bound(Option<Environment>, Type, ExprRef)` | Rule 204 | Rules 206, 208 |
| `6` | `'CASES'` | `Control::Cases(Value, Vec<Arm>, Environment)` | Rules 173, 217 | Rules 212, 214 |
| `7` | `'MATCH'` | `Control::CaseResult(...)` | Rule 214 | Rules 217, 220 |
| `8` | `'PRIM'` | `Control::PrimitiveResult(Result<Value, u8>)` | Rules 153, 157 | Rules 223, 225 |
| `9` | `'ERROR'` | `Control::Error(u8)` / `Outcome::Rejected(u8)` / `Outcome::Exhausted` | Rules 82, 84, 111, 140, 169, 190, 202, 206, 212, 225 | Rules 82, 84 |
