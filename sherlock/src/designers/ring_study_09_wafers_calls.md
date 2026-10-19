# Ring Study 09 — Hollow 3D Chamber Wafers & Front Call-Tile Synchronizer

## 1. Executive Summary

This study documents the synchronization of **Designer 3** ([`designer3_frames.js`](file:///home/charles/sherlock-bench/src/designers/designer3_frames.js), Hollow 3D Chamber Continuation Wafers & Unwind Result Orb) and **Designer 4** ([`designer4_arena.js`](file:///home/charles/sherlock-bench/src/designers/designer4_arena.js), Front-Apron Call Tile Row) with the upgraded horological ring architecture, the **10-Sector `Control` Stator Core (`y = -0.24`)**, and the **3 Semantic Ring Families** from `reference_types.rs`.

Every visual element establishes an immediate **1-to-1 structural correspondence** across all three spatial tiers of the machine:
1. **Front-Apron Call Tiles (`z = 2.52, y = -0.31`)**: `R1 · fact(4)` through `R5 · fact(0)` show that **Call #k lives in Ring #k**.
2. **Concentric Split-Arc Rings (`R1..R6`)**: Each Ring `#k` is divided into two Half-Ring Slots (`Rk·A` for the `Return` frame, `Rk·B` for the pending `Right` operand frame).
3. **Hollow Chamber Continuation Wafers (`y = -0.48` down to `-1.92`)**: Chronological wafer index `chronoIdx` (`0..11`) maps directly to Half-Ring Slot ID `R${Math.floor(chronoIdx / 2) + 1}·${chronoIdx % 2 === 0 ? 'A' : 'B'}` (`R1·A`, `R1·B`, `R2·A`, `R2·B`, ...).

---

## 2. Three Semantic Ring Families (`designer3_frames.js`)

All 9 `Frame` variants from `reference_types.rs` are grouped into **3 Semantic Ring Families** with pre-allocated module-scope `THREE.Color` instances:

| Semantic Family | `Frame` Variants (`reference_types.rs`) | Rim & Badge Color | Hex / CSS | Role in `fact(4)` Trace |
| :--- | :--- | :--- | :--- | :--- |
| **`ENV`** | `Return`, `Scope` | **Cyan-Teal** | `0x2dd4bf` / `#2dd4bf` | Half-Ring Slot **A** (`R1·A` .. `R5·A`): Saved call environment & return contract check |
| **`OP` (Left/Args)** | `Left`, `Args`, `Unary` | **Amber-Copper** | `0xf59e0b` / `#f59e0b` | Pending left operand or argument vector evaluation |
| **`OP` (Right)** | `Right` (`4 × [?]`) | **Luminous Gold** | `0xfbbf24` / `#fbbf24` | Half-Ring Slot **B** (`R1·B` .. `R4·B`): Pending right operand multiplier `n × [?]` |
| **`GATE`** | `If`, `Match`, `Let` | **Royal Violet-Indigo** | `0x818cf8` / `#818cf8` | Conditional branch selector, structural pattern scrutinee, or let-binding continuation |

---

## 3. Hollow Chamber Wafer Material & Slot-ID Architecture (`designer3_frames.js`)

### 3.1 Wafer Chassis & Optical Plate Materials
Each of the 12 pre-allocated horizontal continuation wafers inside the hollow well (`x, z ∈ [-0.62, 0.62]`, `y ∈ [-0.48, -1.92]`) is composed of:
- **Outer Bevel (`waferOuterBevelGeo`, `sharedOuterBevelMat`)**: Machined **Brushed Silver-Rhodium (`0xd8dde6`)** (`roughness: 0.24`, `metalness: 0.88`, brushed metal streak texture) matching the new precision chip housing.
- **Optical Wafer Plate (`waferGlassGeo`, `sharedGlassMat`)**: Translucent **Sapphire-Slate Glass (`0x182232`)** (`roughness: 0.18`, `metalness: 0.14`, `clearcoat: 0.88`, `opacity: 0.80`) with a central circular opening (`r = 0.16`).
- **Semantic Inner Rim & Central Collar (`waferRimGeo`, `centralCollarGeo`, `rimMat`)**: Anodized metallic inner rim and central opening collar colored by the wafer's semantic family (`ENV` `0x2dd4bf`, `OP` `0xf59e0b` / `0xfbbf24`, `GATE` `0x818cf8`).

### 3.2 1-to-1 Half-Ring Slot ID (`R1·A`, `R1·B`, `R2·A`, `R2·B`, ...)
Because frames in the hollow chamber are ordered chronologically from oldest at the top (`chronoIdx = 0`) to newest at the bottom (`chronoIdx = numWafers - 1`), each wafer's chronological index maps deterministically to its split-arc ring slot above:

$$\text{Slot ID}(\text{chronoIdx}) = \text{R}\left(\lfloor \text{chronoIdx} / 2 \rfloor + 1\right)\cdot\begin{cases}\text{A} & \text{if } \text{chronoIdx} \bmod 2 = 0 \\ \text{B} & \text{if } \text{chronoIdx} \bmod 2 = 1\end{cases}$$

For `fact(4)` at peak recursion depth (9 frames):
- `chronoIdx = 0` $\rightarrow$ **`R1·A`** (`RETURN fact(4) · n = 4`, Cyan-Teal `0x2dd4bf`)
- `chronoIdx = 1` $\rightarrow$ **`R1·B`** (`4 × [?] · n = 4`, Luminous Gold `0xfbbf24`)
- `chronoIdx = 2` $\rightarrow$ **`R2·A`** (`RETURN fact(3) · n = 3`, Cyan-Teal `0x2dd4bf`)
- `chronoIdx = 3` $\rightarrow$ **`R2·B`** (`3 × [?] · n = 3`, Luminous Gold `0xfbbf24`)
- `chronoIdx = 4` $\rightarrow$ **`R3·A`** (`RETURN fact(2) · n = 2`, Cyan-Teal `0x2dd4bf`)
- `chronoIdx = 5` $\rightarrow$ **`R3·B`** (`2 × [?] · n = 2`, Luminous Gold `0xfbbf24`)
- `chronoIdx = 6` $\rightarrow$ **`R4·A`** (`RETURN fact(1) · n = 1`, Cyan-Teal `0x2dd4bf`)
- `chronoIdx = 7` $\rightarrow$ **`R4·B`** (`1 × [?] · n = 1`, Luminous Gold `0xfbbf24`)
- `chronoIdx = 8` $\rightarrow$ **`R5·A`** (`RETURN fact(0) · n = 0`, Cyan-Teal `0x2dd4bf`)

### 3.3 Rising Unwind Result Orb Target Height (`y = -0.24`)
When a frame pops during the `RETURN` / `RESOLVE` unwind phase, the Cyan-Teal (`0x2dd4bf`) **Unwind Result Orb (`orbMesh`, `radius = 0.045`)** rises along the central axis `(x = 0, z = 0)` through the `r = 0.16` wafer openings directly into the **10-Sector `Control` Stator Core at `y = -0.24`** (`CONTROL_CORE_Y = -0.24`). All inspectable metadata and tooltips reference the `"10-Sector Control Core"`.

---

## 4. Front-Apron Call Tiles (`designer4_arena.js`)

### 4.1 Warm Alabaster Porcelain Ceramic & Horological Metal Styling
Located calmly along the front bench apron at `z = 2.52, y = -0.31` (leaving `y > 0.15` 100% clear above the chip aperture), the 6 Call Tiles feature:
- **Tile Body (`bodyMat`)**: **Warm Alabaster Porcelain Ceramic (`0xebe5da`)** (`roughness: 0.28`, `metalness: 0.06`, `clearcoat: 0.36`), shifting subtly to Warm Ivory (`0xf3ede0`) when active and Celadon-Alabaster (`0xe6f0ee`) when returned.
- **Lower Plinth (`sharedPlatinumMat`)**: **Brushed Silver-Platinum (`0xd8dde6`)** (`roughness: 0.24`, `metalness: 0.88`).
- **Bezel & Hairline Rim (`edgeMat`, `rimMat`)**: **Champagne-Gold (`0xd4b475`)** metallic rim illuminated by call state:
  - **`waiting`**: **Amber-Gold (`#f59e0b` / `0xf59e0b`)**
  - **`active`**: **Luminous Gold/Orange (`#fbbf24` / `0xfbbf24`)** (or crimson `#d63230` on trap)
  - **`returned`**: **Cyan-Teal (`#2dd4bf` / `0x2dd4bf`)** displaying `= 24`, `= 6`, `= 2`, `= 1`

### 4.2 Ring-Correlated Badges (`Call #k lives in Ring #k`)
Each Call Tile computes its corresponding Horological Ring `R#k` (`resolveCallRingNumber(call)`) and renders both the pill badge (`R1`, `R2`, `R3`, `R4`, `R5`) and the porcelain plaque title:
- `R1 · fact(4)` (waiting: `#f59e0b` $\rightarrow$ returned: `= 24` in `#2dd4bf`)
- `R2 · fact(3)` (waiting: `#f59e0b` $\rightarrow$ returned: `= 6` in `#2dd4bf`)
- `R3 · fact(2)` (waiting: `#f59e0b` $\rightarrow$ returned: `= 2` in `#2dd4bf`)
- `R4 · fact(1)` (waiting: `#f59e0b` $\rightarrow$ returned: `= 1` in `#2dd4bf`)
- `R5 · fact(0)` (active: `#fbbf24` $\rightarrow$ returned: `= 1` in `#2dd4bf`)

---

## 5. WebGPU (`three/webgpu`) Performance Verification

- Both [`designer3_frames.js`](file:///home/charles/sherlock-bench/src/designers/designer3_frames.js) and [`designer4_arena.js`](file:///home/charles/sherlock-bench/src/designers/designer4_arena.js) import exclusively from `'three/webgpu'`.
- Zero `new THREE.Color()`, `new THREE.Vector3()`, `new THREE.Matrix4()`, or `new THREE.CanvasTexture()` allocations occur inside `.update(stepState)`.
- Plaque textures are memoized in bounded LRU caches (`MAX_CACHED_TEXTURES = 160` in Designer 3, `MAX_PLAQUE_CACHE = 128` in Designer 4) and only updated when the string signature changes.
