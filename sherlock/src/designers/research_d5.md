# Wave 2 Research Note — Designer 5: Apple M-Series Flush Die Lithography for L4 Arenas & Aux/1+Aux/2

## 1. Visual References & Scrapling Synthesis (Apple M1/M2/M3/M4 Die Floorplans)

From web search and Scrapling extraction of Apple M4 (TSMC N3E, 28B transistors) newsroom & technical floorplan analyses:
- **Zero-Relief Photolithographic Plane**: In Apple Silicon hardware presentations (M1–M4), functional blocks—CPU clusters, GPU cores, the 16-core Neural Engine (ANE), and System Level Cache (SLC) SRAM banks—are never rendered as protruding 3D bar charts or mechanical towers. Instead, they sit **whisper-flat (`height <= 0.004..0.010`)** inside precision-etched dark matte silicon pockets (`0x111215` / `0x16181d`), preserving an unbroken, monolithic chip silhouette.
- **SRAM Bank Progress Strips**: Apple visualizes high-density SRAM and cache arrays as sleek, parallel horizontal micro-tracks separated by hairline isolation trenches. Active memory utilization reads as a continuous champagne-gold or emerald photolithographic fill bar with a crisp leading-edge sense-amplifier hairline, leaving unallocated capacity as quiet matte dark silicon.
- **Laser-Line Instruction Addressing**: Rather than a bulky mechanical gantry sliding over ROM rows, Apple keynote motion graphics depict instruction fetch and decode as a **razor-thin gold laser scan slit** gliding across a flush 16-row micro-strip ROM array.
- **Neural Engine / Systolic Micro-LED Matrices**: Matrix and ALU engines (like the 38-TOPS M4 Neural Engine) are presented as **flush rectangular micro-pad arrays** where active arithmetic limbs, carry/borrow chains, and fuel witnesses ripple across the flat silicon surface with warm ember (`#e86446`) and champagne-gold (`#f2c66d`) micro-LED emission.
- **Generous Negative Space**: Wide, uncrowded margins of satin titanium lid and dark passivation frame each functional array so the viewer's eye stays focused on the central recursion well and live evaluation flow.

---

## 2. Translation to Sherlock `designer5_circuit.js` (`y = 0.106..0.116`, Max Relief `<= 0.012`)

1. **NW Quadrant (`ProgramBlock` ROM — `x ∈ [-2.04, -1.18], z ∈ [-1.98, -0.18]`)**:
   - Flush 16-row micro-strip array inset into the lid (`height = 0.004`, top at `y = 0.112`).
   - Each micro-strip encodes an `ExprRow` (`[addr | kindTag | wordStrip | senseDot]`) with subtle lithographic tinting.
   - A single **razor-thin gold Laser Scan Bar** (`height = 0.0025`, `y = 0.1145`) glides smoothly (`lerp`) to the active `controlOrigin.exprId` (`% 16`) row.

2. **NE Quadrant (`StateBlock` L4 Bounded Arenas — `x ∈ [1.18, 2.04], z ∈ [-1.98, -0.18]`)**:
   - 6 sleek, flush horizontal progress strips (`Exprs`, `Values`, `Envs`, `Bindings`, `Frames`, `Controls`) modeled after Apple Silicon SLC SRAM banks.
   - Dark matte recessed tracks (`height = 0.003`) that fill smoothly from left to right with champagne-gold and emerald light (`height = 0.004`) plus a razor-thin watermark cursor according to `step.after.machineImage`, paired with a subtle 3-line `HostImageUsage` (`rows`, `cells`, `nameBytes`) flush micro-meter at the south edge.

3. **SW Quadrant (`aux/1` Associative Scan Lanes — `x ∈ [-2.04, -1.18], z ∈ [0.18, 1.98]`)**:
   - 4 clean, flush horizontal micro-lanes (`EnvGet` / `EnvGetScan`, `FindFn` / `FindScan`, `Bind` / `BindPreflight`, `Eq` / `EqScratch`).
   - Each horizontal lane features a precision hairline waveguide and **8 tiny flush micro-LED dots** (`height = 0.003`), staying whisper-quiet in dark standby when `step.after.aux1.activeKind === 'None'` and lighting up with emerald (`hit: true`) or warm gold/amber (`hit: false`) scan pulses only when active.

4. **SE Quadrant (`aux/2` 16-Byte `UInt128` Limb & `FuelWitness` Matrix — `x ∈ [1.18, 2.04], z ∈ [0.18, 1.98]`)**:
   - Replaces all protruding byte towers with a **flush 16-column × 3-row micro-LED lithography matrix** (`height = 0.004`):
     - **Row 0 (`r[0..15]`)**: 16-byte `UInt128` result/operand limbs (with subtle diagonal/multiply shimmer when `*` fires).
     - **Row 1 (`c/bo[0..15]`)**: 16-column carry & borrow propagation micro-pads (`carries` / `borrows`).
     - **Row 2 (`fuel[0..15]`)**: 16-byte `FuelWitness` (`afterBytes`, zero-probe `zp`, and decrement borrow `bw`).
   - Active limbs glow warm ember/gold/emerald flush on the die surface, with a clean horizontal lithographic ripple animation when `+`, `-`, `*`, `<`, `==` or fuel decrement (`charge > 0`) fires.
