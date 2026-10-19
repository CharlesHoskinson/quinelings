# Designer 6 Research Synthesis: Minimalist Floating `ReferenceSlice` Ribbon & IVC Proof Prism

## 1. Visual & Industrial Design Lineage
- **Dieter Rams / Braun & Apple Silicon Restraint ("Less, but better")**:
  - Replace heavy structural bridge trusses, bulky cantilever towers, and 32 oversized sockets with a **floating, weightless horological scale**.
  - On Braun Atelier receivers and Teenage Engineering's **OP-1 Field / TX-6**, timeline scales and parameter groups are communicated through **surgical hairline rules**, subtle matte-anodized titanium segments, and crisp micro-LED punctuation that illuminates only the active state while leaving inactive zones quiet.
- **Horological Retrograde Scales & Sapphire Accumulators**:
  - High-horology linear/retrograde indicators use a razor-thin segmented track suspended in open space where completed intervals settle into a calm jewel tone (`resolve` emerald `#45937a`), the active interval glows warm ember/gold (`#e86446` / `#f2c66d`) with a needle-thin vertical drop hairline to the die reference plane, and future intervals remain quiet matte slate (`#1c1d21` / `#436278`).
  - Rather than a busy multi-gimbal contraption with teeth and orbiting debris, the accumulator is realized as a single, serene **precision-cut octahedral glass-and-gold Proof Prism** encircled by one paper-thin gold halo ring.

## 2. Wave 2 Architectural Mapping (`designer6_loom.js`)
1. **Clean Floating Step & `ReferenceSlice` Ribbon (`x ∈ [-2.10, 2.10]`, `y = 0.24`, `z = -1.48`)**:
   - A razor-thin floating titanium-and-gold horizon bar (`height ≈ 0.012`, `depth ≈ 0.024`) with zero vertical support towers or heavy gantry trusses.
   - Cleanly segmented into the active `ReferenceSlice` brackets (`sliceWidth` = 1, 2, 4, or 8 from `reference_slice.rs`), with subtle micro-pip tick marks for individual steps along the bar:
     - **Past slices**: glow calm emerald (`PALETTE.resolve` / `PALETTE.resolveBright`).
     - **Active slice**: glows warm gold/ember (`PALETTE.goldBright` / `PALETTE.heatBright`) with a delicate vertical light-thread (`x = stepX`, `y = 0.11..0.24`, `z = -1.48`) dropping cleanly to the die edge and a minimal micro-reticle on the lid surface.
     - **Future slices**: subtle matte slate/titanium (`PALETTE.graphite` / `PALETTE.titanium`).
2. **Hairline Parabolic Folding Threads (`y = 0.26..0.82`)**:
   - Ultra-thin (`radius = 0.0045` + crisp `THREE.Line` core) parabolic light-threads arching from the center of each `ReferenceSlice` bracket (`y = 0.25, z = -1.48`) into the central Proof Prism (`x = 0, y = 0.86, z = -1.55`).
   - A single smooth **photon bead** glides along the active slice's thread into the prism (`t = (stepFraction + ambient) % 1`), visually folding each slice's execution trace into the running IVC proof.
3. **Minimalist Ledger-9 Proof Prism (`x = 0, y = 0.86, z = -1.55`)**:
   - One serene, precision-cut **octahedral glass-and-gold Proof Prism** with crisp gold edge wireframes and a luminous inner core, encircled by a **single paper-thin gold halo ring** (`radius ≈ 0.16`, `tube ≈ 0.0035`).
   - Crowned by a clean floating high-DPI plaque (`IVC FOLD · SLICE #k · WORK`) that updates dynamically as slices fold into the accumulator.
