# Living motion: bounded authored rhythms

This change keeps animation a pure function of a described program and a supplied phase. It does not execute a task, change the graph, or change the stored source. The mathematical forms are original geometric constructions and artistic suggestions of motion, not a fluid or biological simulation.

## Common clock

For authored rate `r`, timing asymmetry `a`, and supplied phase `t`, the common tissue clock is

```
φ = r t
θ = φ + a sin φ
pulse = sin θ
secondary = [sin(2θ − lag) + overtone sin χ] / (1 + overtone)
χ = 3φ                  (periodic)
χ = √2 φ                (quasiperiodic)
```

Since `a ≤ .8`, `dθ/dφ = 1 + a cos φ ≥ .2`: contraction and recovery have different durations without reversing time or introducing a velocity discontinuity. Both scalar signals remain in `[-1,1]`. A periodic design repeats after `2π/r`; an authored nonzero irrational secondary component supplies a bounded quasiperiodic motion instead. The rendering clock still determines how quickly `t` advances, and freezing that clock freezes all geometry.

The common body expansion uses `sx = 1 + breath pulse`, `sy = 1/√sx`. Since breath is at most `.18`, horizontal scale remains `[.82,1.18]` and vertical scale stays finite. A small family-dependent rotation and lift share the secondary signal, so anatomy and material recoil together. The scale suggests elastic expansion; it does not claim exact 3D volume conservation.

Traveling waves use a fundamental plus normalized overtone with a spatial phase and authored lag. Open appendages multiply these by smooth tether envelopes, generally `u²`, which pin the base and increase movement toward the tip. The driver remains bounded for all times. Closed coordinates use periodic spatial formulas; the helper rounds spatial winding on closed tracks so fractional authored winding cannot split their seam.

## Distinct gestures

- Jelly: asymmetrical bell contraction, elastic vertical recovery, delayed tentacle waves, and an explicit lower lip attaching the tentacle roots to the bell. Roots and lip share a depth field at the same horizontal position.
- Moth: bilateral coupled wing strokes with delayed trailing-edge flex, and a quieter central body.
- Coral: a pinned base with increasing branch-tip shear, plus bounded secondary sway.
- Ribbon: traveling spinal curvature with phased ribbon folds.
- Nautilus: a logarithmic shell `radius(u) = .055 exp(log(.57/.055) u)`, with small mantle motion rather than unlimited shell rotation.
- Seed: fibers distributed by the golden angle `π(3−√5)`, shared swaying, and flexible tapered tips.
- Torus: closed `(1,3)` toroidal winding with traveling poloidal phase and a smaller counter-traveling component; this is a toroidal curve, not a claimed trefoil knot.
- Comet: a stable compact head and increasing wave amplitude along the tapering tail.
- Bloom: fixed petal count with delayed opening across layers and quiet secondary rotation.
- Filament: a traveling backbone with coupled envelope flex.

## Closed surfaces and framing

Moth, torus, and bloom now close their entire membrane, including its transverse thickness and lighting. Wrapped central differences yield matching endpoint tangents. Focus, taper, fold phase, and twist use circle-valued coordinates, avoiding the previous gap left by clamped tangents and linear nonperiodic phase.

Portrait fitting samples 16 phases normalized by the authored rhythm rate, including anatomy extents, and adds a motion-dependent allowance. This is an empirically stress-tested fit, not a proved global enclosure. The framing tests include late times and maximum supported motion/material parameters.

Public sampling functions obtain a validated cached motion state; internal surface sampling passes that state down once per frame to avoid per-point record comparisons. Cache snapshots detect in-place edits to an authored rhythm at the same phase. All sample positions are closed form, and no elapsed-time integration or random state accumulates between frames.

## Verification

`node verify-morphology.cjs` passes finite sampling, family distinctions, deterministic output, graph endpoint attachment, quine/source preservation, frame-rate independent clocks, closed-membrane C0/C1 continuity, complete periodic surface/anatomy closure, late-time/extreme-profile framing, and small sample budgets. The animation review agent separately performs browser visual, reduced-motion, and performance checks.

The paired Chromium review measured new full-render medians of 16.8–26.3 ms across the ten families, with surface generation at 9.3–16.9 ms. The live baseline measured 17.4–23.4 ms for full rendering in the same browser. These are local measurements rather than hardware-independent frame-rate guarantees. A randomized review of 30 valid profiles and 60,000 samples through phase 10,000 found a maximum normalized portrait half-extent of .366 against the .5 clipping boundary. The four-phase jelly/moth/torus filmstrip is saved in `research/living-motion-final-filmstrip.png`.
