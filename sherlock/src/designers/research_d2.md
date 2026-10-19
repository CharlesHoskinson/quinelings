# Wave 2 Research Synthesis — Designer 2: Serene Stepped Recursion Amphitheater & Flush 39-Rule Micro-LED Matrix

## 1. Sources Investigated (Web Search & Scrapling)
- **Bartosz Ciechanowski (`ciechanow.ski/mechanical-watch/`, `ciechanow.ski/lights-and-shadows/`)**:
  - *"Just as important as the presence of light is its absence. To talk about light we have to start in darkness."*
  - Ciechanowski achieves extraordinary mechanical legibility by pairing **calm, low-specular structural housings** (mainplates, bridges, stepped recesses) with **selective directional highlights** on the single active force-transfer path. Inactive components remain recessed in quiet, physically grounded matte surfaces so they never compete with the moving mechanism.
- **Bret Victor (`worrydream.com/LearnableProgramming/`)**:
  - **Make Meaning Transparent & Show the State**: Rather than forcing the viewer to "peek through a pinhole" or decode 40 simultaneously blinking indicators, state-space visualizations must establish an effortless figure-ground hierarchy.
  - **Follow the Flow (Focused Single-Element Highlighting + Soft Trail)**: At any instant of execution, only the **currently firing rule** and the **active stack depth** should command high luminance, accompanied by a gentle fading trail on the immediately preceding state transition to preserve temporal continuity.

## 2. Borrowed Architectural & Visual Principles for `designer2_well.js`
1. **Serene 8-Terrace Anodized Recursion Amphitheater (`D0`..`D7`, `x, z ∈ [-1.06, 1.06]`, `y ∈ [-2.30, 0.02]`)**:
   - Replaces busy alternating stripes and cluttered plaques with 8 precision-machined, matte space-black ceramic/anodized aluminum stepped terraces (`D0`..`D7`).
   - Each terrace features a **razor-thin recessed light-ring** that illuminates **ONLY down to the current recursion depth (`step.after.frames.length`)** (with the deepest active terrace softly highlighted), turning the entire amphitheater into an instant, unmistakable visual depth gauge.
2. **4 Clean Vertical Optical Light-Rails (N, S, E, W)**:
   - Replaces the 40 noisy vertical wall pipes with **4 clean, centered vertical optical light-rails** recessed into the North, South, East, and West inner walls.
   - During `DESCEND` (or when pushing a frame), a smooth, unmistakable **downward ember pulse (`#e86446`)** glides down the 4 rails into the well.
   - During `RESOLVE` / `RETURN` (when unwinding a frame), a smooth **upward emerald pulse (`#45937a`)** rises up the 4 rails toward the aperture.
3. **Hairline `stackLimit` Horizon Ring**:
   - A single crisp, hairline gold optical horizon ring positioned at the active `stackLimit` depth that stays calm champagne gold (`#d4a24c`) under normal operation and pulses crimson (`#d63230`) when `step.ruleLine === 140` (`140:FrameErr`).
4. **Flush Apple-Style 39-Rule Micro-LED Floor (`y = -2.28`)**:
   - Replaces the 42 tall pop-up piston stems and busy floor wiring with a **flush, high-contrast 6×7 micro-LED glass tile matrix** (`SHERLOCK_K_RULES` `A080`..`A225`).
   - Inactive rule tiles remain calm, dark matte slate (`0x18191d`) so the well floor is quiet and unobtrusive.
   - **ONLY the currently firing `step.ruleLine` tile** (plus a soft fading trail on the previously fired rule) illuminates with a crisp, luminous bevel and projects a **single clean vertical focus ring** rising toward the active continuation wafer.
