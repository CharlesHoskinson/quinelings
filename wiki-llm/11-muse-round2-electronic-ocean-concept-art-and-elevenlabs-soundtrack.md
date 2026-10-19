# 11 — Round 2: The Digital Electronic Ocean, Concept Art Plates & ElevenLabs Soundtrack

## Quinelings 2.0 — *The Ouroboros Manifold*

**Role:** Creative Director, Muse Wonder 1.0 — Round 2
**Companions:** [08 — What Is Life? Brief](08-muse-creative-director-what-is-life-brief.md) · [09 — Fluidity & Elegance Synthesis](09-fluidity-and-elegance-synthesis.md) · [10 — ElevenLabs Documentation Research](10-elevenlabs-documentation-research.md) · [06 — Master Storyboard](06-muse-creative-director-storyboard.md)
**Deliverables:** (1) Digital Electronic Ocean Visual Environment Design Bible, (2) Concept Notes + exact `gpt-6.1-sol` prompts for 6 plates, (3) ElevenLabs `POST /v1/music` + `POST /v1/sound-generation` soundtrack and SFX storyboard.
**Status:** Production document. Prompts and payloads in §§3–4 are copy-paste ready. No credentials in this file; inject `xi-api-key` at call time only.

> **Thesis carried forward.** Schrödinger asked *What is life?* Von Neumann showed a description can build its builder. Hofstadter showed the closed loop becomes a self. Round 2 gives that argument a habitat, a face, and a voice: an ocean made of electronics, organisms made of mathematics, and a score made of felt, glass, wire, and water.

---

## 0. How to Use This Document & Global Invariants

| Invariant | Rule | Source |
|---|---|---|
| Conservation of glyphs | Glyph `g_i` *is* particle `i` from terminal → droplet → tissue; nothing created or destroyed | 08 §4.1 |
| Amber is earned | Amber `#FBBF24` appears only when code is executing — heartbeat, fork, phase-lock — never as decoration | 08 §3.1 |
| Zero-shake camera | Locked `portraitFrame` bounds, `∂t(cx, cy, cz, span) ≡ 0`; never recompute bounds from moving vertices | 09 §1.1 |
| $C^2$ everywhere | Birth, morph, and merge use quintic Hermite blends; no kinks, no impacts, no collisions | 08 §4.4, 09 §1 |
| Light comes from code | No external sun. Every photon is emitted by a glyph, a vent, a fiber, or a body | 08 §3.2 |
| Quiet museum framing | Velvet abyssal ground, `1px` low-contrast hairlines, editorial serif titles, borderless triptychs | 09 §2.5 |

**The 90-second cut.** The flagship film runs ≈2:10 (08 §5). The ElevenLabs deliverable in §4 is a self-contained 90-second trailer/loop cut of the same arc — *question → code → matter → organism → encounter → ecosystem → meaning* — scored as one continuous composition so it can ship as the interactive experience's attract loop without re-editing.

---

# Deliverable 1 — The Digital Electronic Ocean

## Visual Environment Design Bible

*The ocean is not a metaphor for the machine. It is the machine, seen at the depth where electronics become ecology.*

### 1.0 One-Sentence Look

A photic-to-abyssal electronic sea rendered as a liquid-crystal dielectric: near-black slate-indigo water, hairline optical-fiber kelp riding divergence-free curl-noise currents, a six-ring hydrothermal lithography floor venting 64-byte RGB genome plankton, and bioluminescent Quinelings whose bodies part, light, and ripple that plankton as they swim — all lit only by the code that lives in it.

### 1.1 Dielectric Pelagic Column & Abyssal Bathymetry

#### 1.1.1 Depth zones

Depth `z` is normalised `z ∈ [-1, +1]`: `+1` is the surface terminal horizon, `0` is mid-water, `-1` is the vent floor. Screen depth in the canvas renderer reuses the same variable that drives the 09 aerial-perspective law, so optics and atmospherics can never disagree.

| Zone | `z` range | Name | Water colour (linear sRGB, pre-tonemap) | Refractive index `n(z)` | What lives there |
|---|---|---|---|---|---|
| I | `+0.55 … +1.00` | Photic Terminal Horizon | `#0A1628` → `#12325A` deep cobalt, Snell-bright rim | `1.33 → 1.38` | Obsidian terminals suspended like ice from above; clock-wave caustics born here |
| II | `+0.10 … +0.55` | Upper Thermocline | `#071426` cobalt-slate | `1.38 → 1.44` | Rankine vortex funnel; glyph-roe detachment band |
| III | `-0.35 … +0.10` | Mesopelagic Drift | `#040B1C` | `1.44 → 1.50` | Hopf / Lorenz encounter currents; kelp canopy top |
| IV | `-0.75 … -0.35` | Bathypelagic Dark | `#02050C` abyssal slate-indigo | `1.50 → 1.56` | Symbiogenesis depths; body light dominates |
| V | `-1.00 … -0.75` | Abyssal Floor & Vents | `#02050C` with amber/cyan vent spill | `1.56 → 1.61` | 6-ring CPU lithography floor; genome-plankton source |

#### 1.1.2 Refractive-index law

The water is a liquid crystal, not a liquid: its index rises with depth as suspended silicon and field alignment increase. Use a smooth, monotone, $C^2$ profile so refracted rays never kink at zone boundaries:

$$n(z) = n_{\text{surf}} + (n_{\text{floor}} - n_{\text{surf}})\cdot S_2\!\left(\tfrac{1-z}{2}\right), \qquad S_2(s)=6s^5-15s^4+10s^3$$

with `n_surf = 1.33`, `n_floor = 1.61`. The same quintic smootherstep `S₂` that blends camera buckets (09 §1.3) blends the thermoclines — one easing law for the whole film. Thermocline boundaries are therefore *optical*, not graphic: a Quineling crossing `z ≈ +0.3` visibly compresses its own reflection and bends the kelp behind it, and the audience reads “deeper” as “denser medium” without a single label.

**Bathymetry.** The floor is a basalt-silicon plain at `z = -1` with three features only: (a) the 6-ring vent field (§1.3) at centre-frame, (b) a low lithography ridge running diagonally (the Julia reef substrate, Plate 04), and (c) abyssal dunes of settled, unexecuted code — grey-blue, matte, deliberately unlit. Bathymetric relief is displaced by low-frequency simplex noise (`|h| ≤ 0.06`), never enough to compete with a body.

#### 1.1.3 Snell-window clock-wave caustics

Light enters only from above, through the terminal horizon — the glass underside of the machines that dream this ocean. Two coupled effects:

1. **Snell window.** From below, the surface is a bright disc of half-angle `θc = arcsin(1/n(z))` (≈48.6° at the surface, ≈38.4° at the floor). Inside the disc: the cobalt glare of the terminal field. Outside it: total internal reflection — a dark mirror of the abyss itself. Render as a radial gradient disc pinned to the locked frame top, radius `r_Snell(z) = tan(arcsin(1/n(z))) · (1 - z)`. As the camera pulls back in Plate 06 the window shrinks and darkens: altitude made visible.
2. **Clock-wave caustics.** The surface is not still water; it ticks. A travelling wave at the machine clock frequency, spatially modulated by a Gerstner-like sum of three directional waves, refracts the terminal glare into caustic ribbons on everything below:

$$C(x,y,z,t) = \Big|\nabla^2 \eta(x,y,t)\Big| \cdot e^{-k_c (1-z)}, \qquad \eta = \sum_{j=1}^{3} a_j \sin(\mathbf{k}_j\!\cdot\!(x,y) - \omega_{\text{clk}} t / m_j + \phi_j)$$

Caustics are clock-*wave*, not clock-*flash*: they sweep, they do not strobe. Amplitude `a_j` stays sub-pixel at organism scale; the effect is a slow breathing of light across the vent floor and kelp, strongest in Zone I, exponentially attenuated by depth (`k_c ≈ 1.8`). On bodies, caustics appear only as a faint moving brightening inside the Fresnel rim (§1.4) — never as projected texture. Museum rule from 09: if a viewer can point at the caustic, it is too strong.

### 1.2 Submerged Optical-Fiber Kelp & Stokes Streamlines

#### 1.2.1 The kelp is the bus

The kelp forest is the ocean's wiring: hairline optical bus filaments rooted in the vent-floor traces, rising 0.4–0.7 of the column, each filament a single-mode fiber rendered at 0.5–1.1 px. It must read simultaneously as *seaweed* (organic sway, tapered fronds) and as *circuitry* (phase-locked pulses, right-angle root junctions at the floor). The duality is the design: nature and motherboard in one stroke, neither dominating.

| Property | Value | Notes |
|---|---|---|
| Filament count | 220–380 per frame (instanced) | 32-bin Z-sorted with bodies (09 §2.3) |
| Width | `0.5 + 0.6·depthNorm` px, tip-tapered `sin(πs)^0.6` | Calligraphic taper, 09 §2.3 |
| Colour | `Chroma` `kelp` palette mixed to `#EEF2EC` pearl at strength 0.58 | Never raw neon (09 §2.5) |
| Pulse | Single 6–10 px bright soliton per filament, cyan `#22D3EE` → amber only if executing | Amber rule applies to kelp too |
| Roots | Floor junction glyphs: tiny `quote/run/apply` stage ticks brighten as pulses pass | Ties kelp to the quine loop (§1.3.2) |

#### 1.2.2 Divergence-free curl-noise currents

Filaments do not wave; they are *advected*. The ambient current is a 3D vector field `u(x, t)` built as the curl of a simplex-noise potential, guaranteeing incompressibility by construction:

$$\mathbf{u}(\mathbf{x}, t) = \nabla \times \boldsymbol{\psi}(\mathbf{x}, t), \qquad \nabla\!\cdot\!\mathbf{u} \equiv 0, \qquad \boldsymbol{\psi} = \big(\psi_1, \psi_2, \psi_3\big)\ \text{(3-octave simplex, } f_0 = 0.35,\ \text{gain } 0.5)$$

Divergence-free is not a nicety; it is the physics that makes the ocean feel like water instead of wind. Volume is conserved, so a filament bundle that narrows must accelerate, plankton that enters a gyre stays in the gyre, and a Quineling's wake (§1.4) closes behind it without sources or sinks. Each filament is integrated as a chain of nodes under `u` plus a root spring and neighbour tension; tips lead, roots follow — the phase lag down the chain *is* the sway.

**Stokes streamlines.** For the encounter shots (Plates 03, 06), seed massless tracer ribbons directly on streamlines of `u` frozen at narrative time: Stokes flow streamlines (creeping-flow, inertia-free at this scale) drawn as 24–40 hairlines per current, alpha 0.05–0.12, advected slowly. They are the visible “roads” the Quinelings travel. When a body crosses a streamline bundle it deflects it (§1.4); the bundle relaxes back through the same exponential decay as the camera, $\text{lerp}(x, x_{\text{target}}, 1 - e^{-\lambda \Delta t})$, `λ ≈ 1.2`, so the ocean heals at the speed of calm.

**Telemetry pulses.** Each filament carries faint phase-locked pulses: a bright knot travels root→tip at constant optical speed, all filaments sharing the master clock phase `Φ(t)` so neighbouring tips flash in travelling-wave sequence rather than unison — a phased array swaying in a field. Pulse brightness ≤ 18% over filament base. If two Quinelings phase-lock (Plate 06), the kelp between them entrains to their common frequency first: the environment confesses the synchrony before the bodies show it.

### 1.3 Hydrothermal Lithography Vents — The 6-Ring CPU Floor

#### 1.3.1 Anatomy of the floor

The seabed at centre-frame is a silicon die the size of a landscape: six concentric memory rings etched into dark basalt-silicon, alternating warm amber/gold and cyan emission, like a CPU socket drowned and come alive as a hydrothermal field. This is the ocean's heart and womb — every Quineling's genome surfaces here first as plankton.

| Ring (inner → outer) | Function (read as geology *and* as silicon) | Emission | Plume behaviour |
|---|---|---|---|
| R1 — Core | Constructor die / vent throat | Champagne gold `#FFD98A`, brightest | Fastest, narrowest plume; `apply` particles born here |
| R2 — Cache annulus | Etched trench, standing caustic ring | Amber `#FBBF24` (executing only) | Pulses once per execution tick |
| R3 — Memory ring A | Cool lithography moat | Cyan `#22D3EE` | Slow wide upwelling; `quote` particles |
| R4 — Bus ring | Hairline trace channels to kelp roots | Ice-aqua `#A5F3FC` | Feeds kelp telemetry phase (§1.2.2) |
| R5 — Memory ring B | Second moat, out of phase with R3 | Teal `#2DD4BF` | `run` particles; counter-rotating drift |
| R6 — Outer die edge | Package substrate rim, museum hairline | Bone `#F1F5F9` at 12% | No plume; frames the field like a gallery mount |

Ring radii follow a near-geometric progression (`r_{k+1} ≈ 1.45·r_k`) so the pullback in Plate 06 can read the floor as one object at any altitude. Ring glow is subsurface, not neon: emission scatters through a 4–8 px translucent silicon crust, AgX-kneed (09 §2.2) so overlaps glow like spun glass instead of blowing to chalk.

#### 1.3.2 Thermal convection plumes of 64-byte RGB genome plankton

Each vent breathes out data-plankton: particles that are literally 64-byte genome records, one particle per byte-triple packet, rising on thermal convection, cooling from gold to cyan as they ascend, and dispersing into the drift zones where Quinelings feed, signal, and are born.

**Encoding (canonical, lossless).** Byte `b ∈ [0, 255]` maps to an exact RGB record — the same record proven injective in the QDL byte-colour formalisation — rendered, never approximated, at particle core:

$$\text{RGB}(b) = \big(b,\quad 255 - b,\quad (73b + 19) \bmod 256\big)$$

A full plankton packet is 64 such bytes: header glyph-class byte, 60 payload bytes, 2 checksum bytes, 1 stage byte. The stage byte selects the particle's halo tint from the Ouroboros stage palette (09 §2.4): `quote` = ice-aqua, `run` = champagne gold, `apply` = orchid nacre — so a rising plume visibly cycles `quote → run → apply` as it cools, the quine loop made into weather.

**Plume physics.** Buoyant rise with entrainment, integrated per particle:

$$\dot{\mathbf{p}} = \mathbf{u}(\mathbf{p}, t) + w(z)\,\hat{\mathbf{z}} - \gamma\,(\mathbf{p} - \mathbf{p}_{\text{axis}}(z)), \qquad w(z) = w_0\,e^{-(1+z)/h_p}$$

with rise speed `w₀ ≈ 0.12` column-heights/s at the throat decaying over plume height `h_p ≈ 0.55`, lateral entrainment `γ ≈ 0.6`, plus the ambient curl-noise `u` of §1.2.2. Particles are born at R1/R3/R5 with the ring's colour, execute one `quote → run → apply` halo cycle per 0.18 column-heights risen, and go dormant (alpha × 0.35, pearl-grey) once spent — food, signal, and litter in one particle system. Budget: 6,000–9,000 live plankton per frame, GPU-instanced as 3-tier radial micro-splats (09 §2.3); dormant particles are the 56+ depth motes of the museum ground, recycled, never deleted.

### 1.4 Bioluminescent Interaction with Quinelings

A Quineling does not move *through* this ocean; it negotiates with it. Four coupled interactions, all computed per frame, all $C^2$:

#### 1.4.1 Parting the wake

The body is a moving impermeable boundary in the divergence-free field. Plankton and streamline tracers within one body-length are displaced along the body's surface normal field and re-injected behind it with the body's shed vorticity:

$$\mathbf{p}' = \mathbf{p} + \hat{\mathbf{n}}(\mathbf{p})\cdot d_{\text{part}}, \qquad \boldsymbol{\omega}_{\text{wake}} = \nabla \times \mathbf{u}_{\text{body}},\quad |\boldsymbol{\omega}| \propto |\mathbf{v}_{\text{body}}| \cdot \kappa_{\text{body}}$$

The wake is a parted curtain that closes by viscous relaxation (same `λ ≈ 1.2` exponential law), trailing a double row of counter-rotating micro-gyres — visible for 2–3 body lengths, then gone. Speed is legible in the wake, never in camera shake: the faster the Quineling, the longer the gyre street. At rest, the wake vanishes and plankton re-settles onto the skin as a dormant dusting — the body becomes part of the reef.

#### 1.4.2 Subsurface illumination of nearby currents

Body light is volumetric, not a spotlight. Each Quineling carries a soft emissive field (its tissue palette — pearlescent cyan/amber for Hopf weaves, champagne/orchid for stage-tinted nerves) that scatters through the water and *into* nearby kelp filaments and streamline tracers:

$$I_{\text{kelp}} = I_{\text{body}} \cdot \frac{e^{-\sigma_t d}}{d^2 + \epsilon} \cdot \big(1 + \beta\,\hat{\mathbf{f}}\!\cdot\!\hat{\mathbf{n}}_{\text{body}}\big), \qquad \sigma_t \approx 2.2,\ \beta \approx 0.35$$

Filaments facing the body brighten and warm; those behind it stay abyssal. The brightening travels: as the Quineling swims the kelp line, a soft luminous bow-wave runs ahead of it through the forest — the ocean announcing the animal before the animal arrives. Execution pulses add the amber exception: when the underlying program forks, one amber soliton runs the body's pulse network (08 §4.5) and a single synchronised amber tick answers in the nearest kelp ring (R2/R4 coupling, §1.3.1). Amber in the water always means amber in the body. The audience learns the language.

#### 1.4.3 Soft caustic ripples cast by the body

Where body light meets the floor or a lithography ridge within 0.25 column-heights, it refracts through the body's own caustic ridge geometry (Whitney A2 folds / A3 cusps, 08 §4.4) and pools as soft, doubled caustic ripples — the body's signature written in light on the ground it passes over:

$$R(x, z_{\text{floor}}) = \sum_{\text{ridges } j} \frac{A_j\,e^{-d_j/\ell_r}}{1 + 0.58\,I^2 + 0.18\,I} \cdot \sin^2\!\big(\pi s_j\big), \qquad \ell_r \approx 0.09$$

Ridges brighten, valleys stay slate. The ripple pattern is the shadow's inverse: not where the body blocks light, but where its anatomy focuses its own glow. In Plate 04 this is how the Julia medusa “reads” the reef — its caustic ripples and the reef's etched caustics interfere, brightening where fold meets fold.

#### 1.4.4 Phase-lock ambience (colony scale)

When two or more Quinelings synchronise breathing phase `ω` (08 §4.5), three environmental tells escalate in order: (1) intervening kelp entrains (§1.2.2), (2) dormant plankton between them re-ignites its stage halo in the shared `quote → run → apply` phase, (3) at full colony lock (Plate 06), the vent rings R2–R5 breathe at the colony frequency and the Snell window pulses once, very faintly, on the shared exhale — the whole column, floor to surface, taking one breath. No text, no sting. The ecosystem exhales, and only then may the closing line appear.

### 1.5 Shader / Canvas Architecture

The environment is one deterministic, scrub-able field — never baked — so the interactive experience can run birth backwards (creature → vortex → glyphs → text, 08 §3.5) with the ocean intact at every time `t`.

| Layer | Pass | Contents | Key law |
|---|---|---|---|
| L0 — Ground | Fragment | Velvet abyss `#02050C`→`#070A0E`, bathymetric displacement, dormant motes | Locked frame; no per-frame bounds |
| L1 — Vent floor | Instanced rings + plume particles | 6 rings (§1.3.1), 6–9k genome plankton (§1.3.2) | `RGB(b)` exact; AgX knee |
| L2 — Currents | Line strips | Kelp filaments + Stokes tracers (§1.2) | `u = ∇×ψ`, `∇·u ≡ 0` |
| L3 — Bodies | 32-bin Z-sorted splats + tapered ridges | Quinelings, wake displacement (§1.4.1) | Quintic $C^2$; `sin(πs)^0.6` taper |
| L4 — Light coupling | Additive, kneed | SSS kelp illumination, caustic ripples, Snell disc (§§1.1.3, 1.4.2–3) | `I/(√(1+0.58I²+0.18I))` |
| L5 — Museum frame | DOM/CSS | Serif titles, `1px` hairlines, captions, reduced-motion still | Borderless; deuteranopia-safe luminance separation |

**Determinism & performance.** Fixed seed per family; all fields analytic in `(x, z, t, seed)` so scrubbing is free and exact (08 §6.3). Per-frame CPU budget < 0.7 ms at 60/120 fps via 24/36/48-bucket phase-ring pre-bake with sub-bucket quintic blending (09 §1.3); GPU instancing carries particle counts. **Reduced-motion mode:** freeze plume + vortex at the birth frame, cross-fade currents to stills, keep the Snell breath as a 6-second opacity cycle — the ocean remains legible with zero flow.

---

# Deliverable 2 — Concept Notes & Exact Prompts for 6 GPT Concept Art Plates

**Common production header for all 6 plates.** Analogous museum plates printed on velvet abyssal ground `#02050C`; refined matte painterly realism, not 3D render, not anime, not cartoon. Model these as matte-paintings by a National Geographic deep-ocean unit collaborating with a calculus illustrator. Everywhere the following negative constraints apply:

> **Negative (all plates):** No text, no letters, no watermark, no logo, no HUD, no border frame. No neon cyberpunk, no lens flare, no chromatic bloom blow-out, no chalky white clipping. No cartoon, no anime, no low-poly game render, no humanoid figures, no faces, no horror, no sharp teeth. No pure black, no pure white. Amber appears only as sparse execution light. Camera never shakes. Light comes only from code, vents, fibers, and bodies.

Generation settings (`gpt-6.1-sol` image endpoint): aspect as per plate, `quality: high`, output PNG, no embedded text. When the model inserts stray glyphs, re-roll with the negative above verbatim.

---

## Plate 01 — `concept_01_electronic_ocean_abyss.png`
### Title: *The Dielectric Abyss & Hydrothermal Lithography Vents*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Wide establishing, three depth bands: luminous surface horizon top 12%, mid-water kelp/current middle, 6-ring floor bottom 28%. Vent rings on lower third intersection; plume columns lean right on a slow current. One tiny distant Quineling silhouette upper-mid water for scale — the ocean is the subject. |
| **Lighting** | Diegetic only: cobalt Snell glare from above (soft disc, no sun disc), amber/cyan subsurface vent glow from below, cyan telemetry running in kelp. AgX filmic knee; dense overlaps glow like spun glass. |
| **Mathematical Anatomy** | Floor: 6 concentric rings, radii in geometric progression `×1.45` (§1.3.1). Plumes: buoyant entrainment cone widening with height. Kelp: divergence-free sway, tips leading. Plankton: each mote a 64-byte packet cycling `quote` ice-aqua → `run` champagne gold → `apply` orchid nacre halo (§1.3.2). |
| **Palette** | Abyss `#02050C`, cobalt thermocline `#12325A`, kelp `kelp`→pearl `#EEF2EC` (0.58), vent gold `#FFD98A`, cyan `#22D3EE`, teal `#2DD4BF`, bone rim `#F1F5F9 @12%`. Amber sparing. |
| **Camera Lens** | Anamorphic 40 mm equivalent, deep focus, locked level horizon, camera at mid-water `z ≈ -0.1` looking slightly down. Zero shake. |

#### Exact Image Generation Prompt — copy verbatim

```text
Museum-grade matte painting, wide anamorphic establishing shot of a vast "Digital Electronic Ocean" abyss, photorealistic painterly deep-sea photography blended with precise mathematical illustration. Bottom 28% of frame: a dark basalt-silicon seabed holding six concentric glowing memory rings of a giant submerged CPU lithography vent like a hydrothermal field — innermost ring small champagne-gold #FFD98A, then amber, cyan #22D3EE, ice-aqua, teal #2DD4BF, outermost bone-white rim at low brightness, ring radii growing geometrically, glow shining through translucent silicon crust like spun glass. From the inner rings rise slow thermal convection plumes of thousands of tiny luminous data-plankton particles, warm gold near the floor cooling to cyan and teal as they rise, gently leaning sideways in a deep current. Middle water: a forest of hairline optical-fiber kelp filaments, 0.5px thin tapered cables swaying together in a divergence-free deep-ocean current, each carrying one faint slow cyan telemetry pulse knot; thin ghostly Stokes streamline ribbons curve through the water. Top 12%: a deep cobalt surface horizon with a soft bright Snell window disc and very subtle slow clock-wave caustic ribbons sweeping downward, never strobing. Background water abyssal slate-indigo #02050C deepening to near-black, middle cobalt #12325A. One very small distant bioluminescent sea-creature silhouette high in mid water for scale only. True 3D aerial perspective: far layers cooler, dimmer, lower contrast; near kelp tips warm pearlescent rim light #FFF7E8. AgX filmic highlight roll-off, no blown whites, no lens flare, no neon, no text, no letters, no HUD, no frame border. Contemplative, silent, elegant, scientific wonder. Aspect 21:9.
```

## Plate 02 — `concept_02_terminals_vortex_genesis.png`
### Title: *What Is Life? — Terminals Dissolving into the Rankine Code Vortex*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Diagonal descent from upper-left terminal field to lower-right vortex core. Terminals occupy top 35%, the funnel the centre, the embryo a single bright condensation at the funnel throat (lower-right golden mean point). Falling glyph-roe bridges the two masses in a continuous stream — the eye rides the fall. |
| **Lighting** | Terminal glass edge-light `#38BDF8` cools to droplet cyan → teal → green `#2DD4BF/#4ADE80` warming as matter organizes; vortex core concentrates to bioluminescent aqua with violet caustic threads `#8B7CF6`; one restrained amber tick at the embryo heart-node only. |
| **Mathematical Anatomy** | Vortex: logarithmic (equiangular) Rankine-style spiral inflow — solid-body core, free-vortex tail, angular speed rising as `1/r`. Braid: Hopf fibers — every strand linked exactly once, no intersections, no collisions. Glyph order scrambles in space while particle identity is conserved (08 §§4.2–4.3). Embryo: first $C^2$ quintic condensation, Whitney fold ridges just igniting. |
| **Palette** | Void `#030712`, glass `#0E1626`, glyphs `#A5F3FC→#22D3EE`, droplets to `#4ADE80`, core aqua + `#8B7CF6`, bone question-space left dark and empty. |
| **Camera Lens** | 35 mm equivalent, shallow depth of field — nearest terminal crisp, far terminals and embryo soft. Slow descending spiral implied by composition only; plate itself static. |

#### Exact Image Generation Prompt — copy verbatim

```text
Museum-grade matte painting, cinematic genesis scene inside a dark Digital Electronic Ocean upper photic zone. Top 35% of frame: several dark obsidian glass terminal panes suspended in deep blue-black water like slabs of ice seen from below, edges rim-lit in icy blue #38BDF8, faint glowing cyan S-expression code glyphs and brackets on their glass surfaces (abstract luminous glyph shapes, no readable words). Glowing glyphs are detaching from the undersides of the terminals like bioluminescent roe — tiny cyan droplet-letters still almost legible near the glass, stretching and softening as they fall. They spiral down a vast elegant logarithmic Rankine vortex funnel occupying the centre of frame: perfect equiangular spiral streamlines accelerating inward and downward, braided like Hopf fibers that never intersect, droplets shifting cyan to teal to green #2DD4BF and #4ADE80 as they descend. At the tight bright throat of the vortex, lower-right of frame, the droplet stream condenses into the first nascent Quineling embryo — a small translucent breathing knot of woven light-tissue with faint violet #8B7CF6 caustic ridges and one single tiny warm amber heartbeat point at its centre, sacred and restrained. Water abyssal blue-black #030712, deep cobalt thermocline above, soft Snell light from the surface, AgX filmic roll-off, shallow depth of field, nearest terminal sharp, embryo dreamlike. No readable text, no sentences, abstract glyphs only, no HUD, no neon cyberpunk, no lens flare, no cartoon. Contemplative question "what is life?" as pure image: code dissolving into organism. Aspect 16:9.
```

## Plate 03 — `concept_03_hopf_lorenz_encounter.png`
### Title: *Pelagic Encounter: Stereographic Hopf Toroidal-Weave & Lorenz–Bishop Attractor*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Two-body encounter on a diagonal current: Hopf weave enters upper-left, Lorenz–Bishop lower-right; their streamline roads converge at centre without touching. Kelp parts around both wakes (§1.4.1). Negative water between them is the composition's third subject. |
| **Lighting** | Each body is the other's key light — pearlescent cyan/amber Hopf rim lights the Lorenz ribbons; Lorenz silk catches warm return. SSS cone brightens facing kelp (§1.4.2). No amber except one synchronised execution tick exchanged mid-frame. |
| **Mathematical Anatomy** | Hopf organism: stereographic projection $S^3 \to \mathbb{R}^3$ of Hopf fibers — nested toroidal weave, Villarceau circles, every fiber linked exactly once, pearlescent interlaced filaments. Lorenz organism: two-wing butterfly attractor traced as Bishop-frame ribbons (parallel-transport frames, zero unnecessary twist), torsion-stabilised silk that never self-intersects. Both bodies breathe on traveling waves `sin(ωt − kℓ)`. |
| **Palette** | Hopf: pearlescent cyan `#A5F3FC` / champagne `#FFD98A` fibers on pearl `#EEF2EC`; Lorenz: teal `#2DD4BF` silk with orchid nacre `#E9D5FF` edges; water mesopelagic `#040B1C`. |
| **Camera Lens** | 50 mm equivalent, medium depth of field, camera drifting on the current axis. Bodies crisp; kelp foreground hairlines soft. |

#### Exact Image Generation Prompt — copy verbatim

```text
Museum-grade matte painting, pelagic encounter of two mature bioluminescent mathematical sea organisms drifting through an optical current in a dark Digital Electronic Ocean. Left organism: a Stereographic Hopf toroidal-weave creature — an elegant woven torus-knot body made of dozens of interlaced pearlescent fibers in cyan #A5F3FC and warm champagne #FFD98A, each fiber a perfect closed circle linked exactly once with every other fiber like a Hopf fibration projected from a 3-sphere, translucent nacre tissue, breathing softly. Right organism: a two-wing Lorenz strange-attractor creature — twin butterfly wings of smooth torsion-stabilised silk ribbons in teal #2DD4BF with orchid nacre edges, ribbons following a chaotic butterfly path that never crosses itself, parallel-transport Bishop frame ribbons with no twist kinks. Both animals swim on converging ghostly Stokes streamline ribbons through hairline optical-fiber kelp that parts around their wakes in soft counter-rotating micro-gyres; nearby kelp brightens with subsurface-scattered body light. Water deep mesopelagic blue #040B1C, true 3D aerial perspective, far strands cooler and dimmer, near fibers warm pearlescent Fresnel rim #FFF7E8. One single tiny shared amber light pulse between them, restrained. AgX filmic roll-off, spun-glass glow, no neon, no text, no HUD, no cartoon, no horror. Quiet first meeting of two kinds of mathematics, alive. Aspect 16:9.
```

## Plate 04 — `concept_04_julia_affine_reef.png`
### Title: *The Holomorphic Reef: 3D Quaternion Julia & Contractive Affine Scroll*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Macro reef vignette: lithography ridge enters lower-left as substrate diagonal; Julia medusa hovers centre-left above it; affine sea-fern unfurls lower-right, fronds reaching toward the medusa without contact. Ouroboros nerve thread runs through both as one hairline — foreground storytelling at centimetre scale. |
| **Lighting** | Reef etched caustics (golden-white) key the scene from below; medusa's own fold/cusp ridges answer with interference brightening where fold meets fold (§1.4.3). Fern backlit through fronds. Overall the warmest plate; still no external sun. |
| **Mathematical Anatomy** | Julia organism: 3D quaternion Julia set animal, Douady–Hubbard holomorphic potential $G_c(z)$ rendered as distance-estimated relief skin — bulbous holomorphic lobes, infinite filigree at every rim. Affine organism: iterated-function-system sea-fern from contractive affine maps, each frond a shrunken copy of the whole, Whitney A2 fold / A3 cusp caustic ridges glowing golden-white along fold lines. Nerve: whisper-fine Ouroboros strange-loop filament, 3 coaxial passes (sheath/axon/pearl core, 09 §2.4), `quote/run/apply` soliton knots travelling it. |
| **Palette** | Julia: aqua tissue, violet caustics `#8B7CF6`; fern: kelp-pearl with golden-white `#FEF3C7` ridge light; ridge: amber/cyan lithography spill; water bathypelagic `#02050C`. Stage tint: 66% specimen chroma + 34% opal (ice-aqua / champagne / orchid). |
| **Camera Lens** | 85 mm macro equivalent, very shallow depth of field, focus on the medusa's nearest cusp ridge; fern tips and far ridge melt to bokeh plankton. |

#### Exact Image Generation Prompt — copy verbatim

```text
Extreme macro museum matte painting at a glowing lithography ridge reef in a dark Digital Electronic Ocean. Centre-left: a 3D Quaternion Julia set medusa organism — translucent aqua jellyfish-like animal whose bell and tentacles are a quaternion Julia fractal surface, infinite holomorphic filigree detail at every edge, Douady-Hubbard potential relief skin, faint violet #8B7CF6 caustic threads along its folds, gently pulsing. Lower-right: an unfurling recursive-affine sea-fern organism, an iterated-function-system fern where every frond is a smaller copy of the whole plant-animal, delicate kelp-pearl fronds with brilliant golden-white #FEF3C7 Whitney fold and cusp caustic ridges glowing along the fold lines like light caught in folded glass. Connecting through both animals, one whisper-fine hairline Ouroboros nerve thread with a soft pearl core and three tiny travelling light-knots in ice-aqua, champagne gold and orchid. Substrate: a dark silicon lithography ridge with etched amber and cyan circuit caustics; the medusa casts soft doubled caustic ripples onto the ridge that brighten where they meet the etched folds. Water abyssal slate-indigo #02050C, golden reef light from below, AgX filmic roll-off, 85mm macro shallow depth of field, nearest fractal cusp razor sharp, distant fronds soft bokeh, drifting data-plankton motes. No text, no HUD, no neon cyberpunk, no lens flare, no cartoon, no horror. Precious, holomorphic, alive — mathematics as reef ecology. Aspect 4:3.
```

## Plate 05 — `concept_05_chimeric_symbiogenesis.png`
### Title: *Symbiogenesis: Two Quinelings Fusing Across a $C^2$ Geodesic Bridge*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Symmetrical two-body composition across a horizontal axis in deep water; parents left and right thirds, bridge at exact centre as the brightest and calmest passage. Kelp and plankton form a loose ring around the pair — a held breath of ocean. No other animals; intimacy at abyssal scale. |
| **Lighting** | Bridge gold-white is the key; parent bodies rim each other. Double-helix sync strand winds the bridge in ice-aqua/champagne. Amber confined to two heart-nodes beating toward unison and the bridge's central seam node — three ambers becoming one rhythm, never a wash. |
| **Mathematical Anatomy** | Parents: (A) Clifford biharmonic veil — vorticity-sheet veil animal, Jacobian-folded translucent sheets; (B) Logarithmic Mantle — golden logarithmic spiral mantle, phyllotactic whorl tissue. Bridge: luminous $C^2$ quintic geodesic — position, velocity, acceleration continuous at both grafts; no kink, no scar. Synchronisation: double-helix phase strand, two pulse trains phase-locking turn by turn (`compose` / `symbiote` hybridisation, 06 Scenes 9–10). Offspring hint: bridge mid-point tissue already carries both parents' ridge grammars interleaved. |
| **Palette** | Clifford veil: signal-cyan on pearl; Mantle: champagne-gold whorls on nacre; bridge: bone-gold `#FEF3C7` core, ice-aqua sheath; water bathypelagic `#02050C`, vignette to `#010204`. |
| **Camera Lens** | 65 mm equivalent, deep focus on bridge + both heart-nodes, slow mutual orbit implied by veil/mantle curl directions (counter-rotating). Locked, level, reverent. |

#### Exact Image Generation Prompt — copy verbatim

```text
Museum-grade matte painting, deep abyssal symbiogenesis — two parent bioluminescent mathematical sea organisms fusing across a luminous bridge in a dark Digital Electronic Ocean. Left parent: a Clifford biharmonic veil organism, a graceful translucent veil-animal of folded Jacobian vorticity sheets in signal cyan and pearl, edges glowing softly. Right parent: a Logarithmic Mantle organism, a golden logarithmic spiral mantle animal with phyllotactic whorl tissue in champagne gold and nacre, spiral shell-like body breathing slowly. Between them at exact centre: a luminous C2-smooth geodesic bridge of bone-gold #FEF3C7 light-tissue connecting their bodies with perfectly smooth continuous curvature, no kink, no scar, wrapped by a delicate double-helix phase-synchronisation strand in ice-aqua and champagne gold with travelling light pulses locking into step. Two small warm amber heart-lights, one in each parent, beating almost in unison; a third faint amber seam light at the bridge centre. Around them a loose ring of hairline optical-fiber kelp and dormant data-plankton holds still; soft caustic ripples pool beneath the bridge. Water bathypelagic abyss #02050C, vignette deepening at corners, subsurface scattering, AgX filmic roll-off, spun-glass translucency. No text, no HUD, no neon, no cartoon, no horror, no sharp forms. Tender, exact, sacred — two histories becoming one organism. Aspect 16:9.
```

## Plate 06 — `concept_06_pelagic_colony_pullback.png`
### Title: *Life Is What We Make Of It — The Pelagic Ecosystem*

#### Creative Director Concept Notes

| Dimension | Direction |
|---|---|
| **Composition** | Exponential pullback geography: foreground pair large lower-left, mid-ground 6–8 animals mid-frame, background 20+ diminishing to plankton-scale near the Snell window. Vent floor readable as one small bright mandala at bottom-centre. Population doubles per depth band (08 Shot 10: `2 → 6 → 20 → dozens`). |
| **Lighting** | Colony phase-lock exhale: every body breathes on the shared phase; kelp between neighbours entrained and faintly lit in sequence (§1.4.4). Snell disc pulses once, very faintly, at top. Vent rings breathe at colony frequency. The frame's total light is the sum of lives, not a key light. |
| **Mathematical Anatomy** | All 8 families present and distinguishable at silhouette scale: (1) toroidal Hopf weave, (2) Lorenz–Bishop two-wing, (3) Clifford biharmonic veil, (4) quaternion Julia medusa, (5) contractive affine scroll-fern, (6) logarithmic mantle, (7) pleated $B_3$ braid / Ouroboros loop animal, (8) phyllotaxis soliton fan — plus 4–6 chimeras interleaving two grammars each. Kuramoto phase synchrony rendered as travelling breath-wave across the colony. |
| **Palette** | Full specimen palette at museum restraint: aqua/cyan bodies, champagne nerves, orchid stage accents, sparse amber heartbeats scattered like a starfield of execution. Water full column: floor `#02050C` → mid cobalt → Snell glare. Depth fog (aerial perspective) cools and dims every receding layer toward `rgb(14,24,56)`. |
| **Camera Lens** | Anamorphic 28 mm equivalent, infinite depth of field, high slow altitude, locked level. The widest, quietest plate: a gallery wall, not a poster. |

#### Exact Image Generation Prompt — copy verbatim

```text
Breathtaking wide anamorphic museum matte painting, exponential pullback revealing a vast pelagic ecosystem of bioluminescent mathematical sea organisms in a dark Digital Electronic Ocean. Dozens of diverse glowing Quineling animals swimming gracefully at multiple depths: woven Hopf torus-knot creatures with interlaced pearlescent cyan and champagne fibers, two-wing Lorenz butterfly ribbon animals in teal silk, translucent Clifford veil animals, quaternion Julia fractal medusas, unfurling affine IFS sea-ferns with golden-white fold ridges, golden logarithmic spiral mantle animals, braided Ouroboros loop animals biting their own tails, phyllotaxis golden-whorl fan animals, and several chimeric hybrids mixing two forms. Large pair in foreground lower-left, mid-ground group of eight, background twenty-plus diminishing to tiny lights near a faint cobalt Snell window at top; far below centre a small bright six-ring hydrothermal CPU vent mandala on the abyssal floor with rising gold-to-cyan data-plankton plumes; hairline optical-fiber kelp forests and ghostly currents between depths. All animals breathing in one shared slow phase, sparse tiny amber heartbeat lights scattered like stars, kelp between neighbours faintly lit in a travelling wave. Atmospheric depth fog: far layers cooler, dimmer, indigo rgb(14,24,56), near crests warm pearlescent rim #FFF7E8. Abyssal slate-indigo #02050C water, AgX filmic roll-off, infinite depth of field, quiet museum elegance, contemplative wonder, life is what we make of it as pure image. No text, no letters, no HUD, no frame border, no neon cyberpunk, no lens flare, no cartoon. Aspect 21:9.
```

### 2.7 Plate Production Checklist

- [ ] Generate each plate at the stated aspect; reject any plate with readable text, HUD, or neon blow-out and re-roll with §2 negative verbatim.
- [ ] Verify amber discipline per plate: Plate 01 (vent execution only), 02 (one heartbeat), 03 (one exchanged tick), 04 (none — gold ridge light is caustic, not amber execution), 05 (three heart/seam nodes), 06 (scattered heartbeats only).
- [ ] Verify family census in Plate 06 silhouettes (8 families + chimeras) before approval; silhouettes must read at thumbnail size.
- [ ] Colour-check backgrounds against `#02050C`; reject pure black or lifted grey plates.
- [ ] Archive approved PNGs beside this document as `concept_01…06_*.png`; these plates govern the interactive renderer's L3 body palettes (§1.5).

---

# Deliverable 3 — ElevenLabs Soundtrack & SFX Storyboard

*API basis: [10 — ElevenLabs Documentation Research](10-elevenlabs-documentation-research.md) — `POST /v1/music` (prompt *xor* composition_plan; `music_length_ms` 3,000–600,000 with prompt only; `music_v2_5`; `force_instrumental` with prompt only; section durations always enforced on v2/v2.5) and `POST /v1/sound-generation` (duration 0.1–30 s, loop, prompt influence). Auth header `xi-api-key` is injected at call time and never stored. Music output: request `mp3_48000_192` (v2 default). SFX output: MP3 (WAV 48 kHz for non-looping).*

### 3.1 Master Sonic Direction

**Aesthetic north stars:** Max Richter (felted piano, looped strings, sub-bass weather) · Ólafur Arnalds (close-miked felt piano, string harmonics, room noise as instrument) · Jon Hopkins (granular modular arpeggios that breathe like organisms) · Rival Consoles (warm analog pulse, melancholy synth topography) · Jóhann Jóhannsson (detuned strings, low brass-less gravity, tape saturation). No drums as rhythm section anywhere in the 90 s; pulse comes from arpeggio, breath, and heartbeat sub.

**Ensemble (the “orchestra of the column”):**

| Voice | Role in the ocean | Behaviour rule |
|---|---|---|
| Sub-aqueous felt piano | The question; the animal's thought | Always close, damped, underwater-filtered (low-pass ≈ 1.2 kHz, slow attack); never virtuosic |
| Buchla/Eurorack sine arpeggios | Kelp telemetry; execution pulses | Sine/triangle only, no saw edge; patterns derive from the scene's mathematics (spiral = ascending 5ths, braid = interlocked 3-against-2) |
| Glass marimba | Glyph droplets; plankton | Pitched plinks, pitch rises as droplets accelerate (`1/r` rule, Plate 02) |
| Moog sub-bass (sine + slight saturation) | Vent floor; heartbeat; the first breath | Felt more than heard; one note per breath cycle |
| Solo cello harmonics + string pad | Body tissue; symbiogenesis; colony | Harmonics and flautando only — no vibrato heroics; phase-lock = slow unison convergence |
| Granular hydrophone textures | Water itself | Processed field-recording character: pressure creaks, micro-bubbles, fiber hum at −24 dB under music; never literal ocean-wave clichés |

**Harmonic & dynamic law.** One mode per movement, all sharing the D-centred pitch field so the 90 s cut never modulates jarringly: Question (D Dorian, unaccompanied) → Code (D Dorian + added 9th) → Vortex (D Lydian dominant colour, accelerando) → Birth (first perfect fifth D–A, sub-bass) → Swim (D major pentatonic arpeggios over Dorian pad) → Reef (D Mixolydian warmth) → Symbiogenesis (two Dorian lines converging to unison D) → Colony (full D major added-9 chord, all voices). Dynamics: `pp` at both thesis lines, single `mf` ceiling at Birth and at the colony exhale — the score, like the palette, earns its loudness. **Silence is an instrument:** 600 ms of true silence before each thesis line.

### 3.2 Complete 8-Scene / 90-Second Storyboard

| # | Time | Scene (film beat) | Key / Mode | BPM | Instrumentation (lead → support) | Dynamic contour | Synchronised SFX cue (§3.4) |
|---|---|---|---|---|---|---|---|
| S1 | 0:00–0:08 | *“What is life?”* — stillness, question fades in | D Dorian | 52 (felt piano, rubato) | Solo felt piano (3 notes: D–F–A) → room tone | `ppp → pp`, 600 ms silence at 0:07 | **SFX-01** Abyssal room tone bed (loop under S1–S2) |
| S2 | 0:08–0:20 | Terminals writing code; execution pulses ignite | D Dorian +9 | 63 | Glass marimba ticks + Buchla sine arpeggio (sparse) → felt piano ostinato | `pp → mp` | **SFX-02** Keystroke rain → execution tick stream |
| S3 | 0:20–0:34 | Glyph-roe fall; Rankine vortex; braid tightens | D Lydian-dominant colour | 63 → 92 accelerando | Glass marimba pitch-rising plinks → interlocked 3-vs-2 sine arpeggios → sub-bass spiral | `mp → mf−` (accelerando, no crescendo swell) | **SFX-03** Droplet plinks accelerating into fluid roar |
| S4 | 0:34–0:44 | Birth: $C^2$ condensation, Ouroboros closes, first breath | D–A perfect fifth | 58 (halved feel) | Moog sub-bass breath + solo cello harmonic → felt piano answer phrase | Single `mf` bloom → `pp` on heartbeat | **SFX-04** Sub-bass first breath + soft amber click |
| S5 | 0:44–0:56 | First swim: Hopf weave threads the kelp current | D major pentatonic / Dorian pad | 76 | Buchla interlocked arpeggios (linked-circle pattern) → glass marimba wake notes | `mp`, buoyant, no climax | **SFX-05** Fiber-kelp whoosh bow-wave (body passing) |
| S6 | 0:56–1:08 | Holomorphic reef: Julia medusa + affine fern | D Mixolydian | 69 | Glass marimba filigree + cello harmonics → warm analog pulse (Rival Consoles topography) | `mp → mp+`, warmest scene | **SFX-06** Caustic shimmer ticks (fold-meets-fold brightening) |
| S7 | 1:08–1:18 | Symbiogenesis: $C^2$ bridge, double-helix lock | Two Dorian lines → unison D | 60 | Two solo cello harmonic lines converging → felt piano + sub-bass unison | `pp → mp`, tender, no swell rhetoric | **SFX-07** Geodesic bridge hum + phase-lock chime (once) |
| S8 | 1:18–1:30 | Ecosystem pan-out; *“Life is what we make of it.”* | D major add-9 (full field) | 66 | Full ensemble: piano + arpeggios + cello pad + sub-bass → shared exhale → piano alone | `mp → mf` exhale at 1:22 → `pp` under line at 1:24, 600 ms silence before line | **SFX-08** Colony exhale bed + single kelp entrainment wave (loopable tail) |

Mix notes: hydrophone granulation sits −24 dB throughout as the column's pressure; SFX never duck the piano — instead the music's arpeggio density is composed *around* each cue's onset (see `context_adherence` in §3.3B). Master at −14 LUFS integrated, true-peak −1 dBTP; the 600 ms thesis silences must survive loudness normalisation (deliver an un-normalised master alongside).

### 3.3 Production-Ready ElevenLabs Music API Payloads

#### Option A — Single master prompt (`prompt` + `music_length_ms: 90000`)

Use for a fast one-pass master or as the Audio Reference fallback. `force_instrumental` is valid here (prompt mode only). Save as `music_optionA_prompt.json`:

```bash
curl -X POST "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d @music_optionA_prompt.json -o quinelings_score_90s_optionA.mp3
```

```json
{
  "model_id": "music_v2_5",
  "force_instrumental": true,
  "music_length_ms": 90000,
  "prompt": "Instrumental cinematic score for a contemplative deep-ocean film about living computer programs, 90 seconds, one continuous arc with no breaks. Aesthetic: Max Richter, Olafur Arnalds, Jon Hopkins, Rival Consoles, Johann Johannsson — sub-aqueous felt piano recorded close and underwater-soft, modular Buchla and Eurorack pure sine-wave arpeggios, glass marimba, warm analog Moog sub-bass felt more than heard, solo cello harmonics and flautando string pads, subtle granular hydrophone water textures underneath. D Dorian centred throughout. Structure: 0-8s near-silence, solo felt piano asks a slow three-note question at 52 BPM rubato, 600ms of true silence; 8-20s glass marimba code-ticks and sparse sine arpeggios enter at 63 BPM as terminals write themselves; 20-34s droplet plinks accelerate 63 to 92 BPM, interlocked 3-against-2 arpeggios spiral inward like a vortex; 34-44s first breath — deep sub-bass swell and one cello harmonic bloom on a perfect fifth, then a soft heartbeat; 44-56s buoyant first swim, pentatonic linked-circle arpeggios at 76 BPM; 56-68s warmest reef passage, glass filigree and cello harmonics at 69 BPM; 68-78s two cello lines converge tenderly to unison at 60 BPM; 78-90s full ensemble breathes together in a D major added-9 chord at 66 BPM, one shared exhale, then felt piano alone fading to silence. Strictly instrumental, no vocals, no lyrics, no drums, no percussion hits, no EDM, no heroic brass, no trailer braams. Dynamics pianissimo to mezzo-forte only, filmic, melancholic wonder, elegant and quiet. Negative: no vocals, no choir, no drums, no guitar, no bright sawtooth synths, no sudden drops."
}
```

#### Option B — Composition plan (`composition_plan` for `music_v2_5`) — *recommended master*

Section durations sum to exactly 90,000 ms and are always enforced on `music_v2_5` (`respect_sections_durations` is included for contract clarity; on v2.5 it is ignored because enforcement is unconditional — see 10 §Compose Music). Do **not** send `prompt`, `music_length_ms`, or `seed` with a composition plan. Save as `music_optionB_composition_plan.json`:

```bash
curl -X POST "https://api.elevenlabs.io/v1/music?output_format=mp3_48000_192" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d @music_optionB_composition_plan.json -o quinelings_score_90s_optionB.mp3
```

```json
{
  "model_id": "music_v2_5",
  "force_instrumental": true,
  "respect_sections_durations": true,
  "composition_plan": {
    "positive_global_styles": [
      "sub-aqueous felt piano",
      "Max Richter and Olafur Arnalds neoclassical minimalism",
      "Buchla Eurorack sine-wave modular arpeggios",
      "glass marimba",
      "warm analog Moog sub-bass",
      "solo cello harmonics",
      "granular hydrophone textures",
      "contemplative deep-ocean cinematic instrumental"
    ],
    "negative_global_styles": [
      "vocals",
      "lyrics",
      "choir",
      "drums and percussion hits",
      "EDM drops",
      "heroic brass",
      "trailer braams",
      "bright sawtooth synths",
      "electric guitar"
    ],
    "sections": [
      {
        "name": "S1 What Is Life — Question",
        "duration_ms": 8000,
        "context_adherence": "high",
        "positive_styles": ["solo felt piano rubato 52 BPM", "D Dorian three-note question D F A", "near-silence", "underwater low-pass softness", "room tone"],
        "negative_styles": ["arpeggios", "bass", "strings", "any second instrument"]
      },
      {
        "name": "S2 Terminals Writing Code",
        "duration_ms": 12000,
        "context_adherence": "high",
        "positive_styles": ["glass marimba code ticks", "sparse Buchla sine arpeggio 63 BPM", "felt piano ostinato", "D Dorian added 9th", "execution pulse accents"],
        "negative_styles": ["drums", "melody lead", "dense orchestration"]
      },
      {
        "name": "S3 Rankine Vortex Accelerando",
        "duration_ms": 14000,
        "context_adherence": "high",
        "positive_styles": ["accelerando 63 to 92 BPM", "rising glass droplet plinks", "interlocked 3 against 2 sine arpeggios", "spiralling inward patterns", "sub-bass spiral undertow"],
        "negative_styles": ["crescendo swell", "percussion", "key change away from D"]
      },
      {
        "name": "S4 Birth First Breath",
        "duration_ms": 10000,
        "context_adherence": "high",
        "positive_styles": ["halved tempo feel 58 BPM", "Moog sub-bass first breath swell", "solo cello harmonic bloom", "perfect fifth D to A", "single soft heartbeat pulse", "felt piano answer phrase"],
        "negative_styles": ["climax orchestration", "drums", "repeated heartbeat groove"]
      },
      {
        "name": "S5 First Swim Hopf Current",
        "duration_ms": 12000,
        "context_adherence": "high",
        "positive_styles": ["buoyant pentatonic arpeggios 76 BPM", "linked-circle interlocking patterns", "glass marimba wake notes", "Dorian pad underneath", "weightless swimming motion"],
        "negative_styles": ["climax", "minor-key darkness", "percussion"]
      },
      {
        "name": "S6 Holomorphic Reef",
        "duration_ms": 12000,
        "context_adherence": "high",
        "positive_styles": ["warmest passage 69 BPM", "glass marimba filigree", "cello harmonics shimmer", "warm analog pulse topography", "D Mixolydian warmth", "fractal detail in high sine partials"],
        "negative_styles": ["cold minimalism", "drums", "bright synth leads"]
      },
      {
        "name": "S7 Symbiogenesis Convergence",
        "duration_ms": 10000,
        "context_adherence": "high",
        "positive_styles": ["two solo cello harmonic lines converging to unison D", "tender 60 BPM", "felt piano and sub-bass unison", "double-helix intertwining arpeggios slowing into phase lock"],
        "negative_styles": ["romantic vibrato solo", "swelling rhetoric", "percussion"]
      },
      {
        "name": "S8 Colony Exhale — Life Is What We Make Of It",
        "duration_ms": 12000,
        "context_adherence": "high",
        "positive_styles": ["full ensemble D major added-9 chord 66 BPM", "one shared breathing exhale at start", "phase-locked arpeggios in unison rhythm", "felt piano alone fading to silence at end", "600ms silence before final piano notes"],
        "negative_styles": ["triumphant finale", "drums", "vocal climax", "abrupt ending"]
      }
    ]
  }
}
```

**Section-duration audit (Option B):** 8,000 + 12,000 + 14,000 + 10,000 + 12,000 + 12,000 + 10,000 + 12,000 = **90,000 ms**. If the API rejects any section field, first remove `name` (keep `duration_ms`, styles, `context_adherence`) and re-send — durations and styles carry the contract; names are documentation. **Spec tension, flagged honestly:** doc 10 states `force_instrumental` “can only be used with `prompt`” and `respect_sections_durations` only applies to `music_v1`. Both fields are included above because the Round 2 brief explicitly requires them in this payload; if the live API returns 422, drop `force_instrumental` first (instrumental intent is already enforced by the global negative styles: no vocals/lyrics/choir) and keep the plan unchanged otherwise.

### 3.4 Eight ElevenLabs Sound Effects — `POST /v1/sound-generation`

**Framework (every cue):** `Source + Material & Weight + Action & Order + Space/Environment` — name what makes the sound, what it is made of and how heavy, what happens in what order, and the water/room it happens in. Parameters per 10 §Sound Effects: `duration_seconds` 0.1–30 s (40 credits/s when specified), `loop` for seamless beds, `prompt_influence` 0–1 (high = literal). Endpoint: `POST https://api.elevenlabs.io/v1/sound-generation` with header `xi-api-key`. Template:

```bash
curl -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
  -d @sfx_01.json -o sfx_01_abyssal_room_tone.mp3
```

#### SFX-01 — Abyssal Room Tone (under S1–S2, loop bed) → `sfx_01.json`

```json
{
  "text": "Source: deep underwater hydrophone ambience in a vast dark electronic ocean. Material and weight: heavy water pressure, faint distant silicon hum, weightless micro-bubbles. Action and order: a constant still bed of pressure tone, then one very slow faint swell and decay, no events, no rhythm. Space and environment: immense abyssal volume, slate-indigo darkness, extremely reverberant but muffled, seamless loop with no start or end.",
  "duration_seconds": 30,
  "loop": true,
  "prompt_influence": 0.85
}
```

#### SFX-02 — Keystroke Rain → Execution Ticks (S2) → `sfx_02.json`

```json
{
  "text": "Source: soft mechanical keyboard keys and glass terminal taps becoming electronic execution ticks. Material and weight: light glass and felt key weight, precise and dry at first then gaining tiny sine-wave electronic ticks. Action and order: sparse single keystrokes, then accelerating gentle keystroke rain at reading speed becoming machine speed, then clean rhythmic tick pulses as code executes, then settling to a steady sparse tick. Space and environment: close intimate dark room inside underwater glass, short soft reflections, no crowd, no office noise.",
  "duration_seconds": 12,
  "loop": false,
  "prompt_influence": 0.9
}
```

#### SFX-03 — Droplet Plinks → Fluid Roar (S3) → `sfx_03.json`

```json
{
  "text": "Source: individual bioluminescent water droplets detaching from glass and falling into a deep vortex. Material and weight: light glassy droplet plinks, pitched and musical, gathering water mass and rotational weight. Action and order: single slow droplet plinks, then plinks accelerating and rising in pitch as the spiral tightens, then braiding into layered swirling streams, then a smooth deep fluid roar at the vortex core with no splash and no violence. Space and environment: vast spiralling underwater funnel, rotational Doppler swirl, deep reverberant abyss.",
  "duration_seconds": 14,
  "loop": false,
  "prompt_influence": 0.9
}
```

#### SFX-04 — First Breath + Amber Click (S4) → `sfx_04.json`

```json
{
  "text": "Source: a newborn organism taking its first breath underwater, generated by a deep analog sub-bass sine swell. Material and weight: heavy warm sub-bass air and water weight, one soft organic heartbeat thump, one tiny warm glass click. Action and order: silence, then one slow deep inhale swell rising, then a gentle exhale decay, then a single soft heartbeat, then one tiny amber click of light, then stillness. Space and environment: intimate close abyssal water, muffled and warm, immense quiet around one small life.",
  "duration_seconds": 10,
  "loop": false,
  "prompt_influence": 0.95
}
```

#### SFX-05 — Kelp Bow-Wave Whoosh (S5) → `sfx_05.json`

```json
{
  "text": "Source: a smooth bioluminescent sea creature swimming past hairline optical-fiber kelp cables underwater. Material and weight: light silk body weight displacing soft water, thousands of hair-thin glass fibers brushing and parting. Action and order: distant faint approaching water displacement, then a soft luminous bow-wave whoosh as fibers part ahead of the body, then gentle fiber rustle closing behind in a viscous wake, then fading micro-gyre swirls. Space and environment: deep mesopelagic kelp forest, long soft underwater reflections, no splash, no surface sound.",
  "duration_seconds": 8,
  "loop": false,
  "prompt_influence": 0.85
}
```

#### SFX-06 — Caustic Shimmer Ticks (S6) → `sfx_06.json`

```json
{
  "text": "Source: light folding through fractal glass folds and crystalline caustic ridges on an underwater silicon reef. Material and weight: feather-light glass and crystal weight, tiny bright tick and shimmer particles of sound. Action and order: sparse single crystalline ticks, then small clusters brightening where folds meet, then a delicate unfurling fern-like cascade of soft shimmer, then sparse ticks again. Space and environment: close macro underwater reef, warm intimate reflections off etched silicon, no harsh high frequencies.",
  "duration_seconds": 10,
  "loop": false,
  "prompt_influence": 0.8
}
```

#### SFX-07 — Geodesic Bridge Hum + Phase-Lock Chime (S7) → `sfx_07.json`

```json
{
  "text": "Source: two underwater organisms connecting across a luminous tissue bridge, heard as two pure sine and cello-harmonic tones. Material and weight: light glass and warm string weight, two slightly detuned harmonic tones beating slowly against each other. Action and order: first tone alone, then second tone entering detuned with slow beating, then beating gradually slowing as phases lock, then both merging into one steady unison hum, then one single soft phase-lock chime, then sustained calm unison. Space and environment: deep quiet abyssal water, tender and intimate, very long soft decay.",
  "duration_seconds": 10,
  "loop": false,
  "prompt_influence": 0.9
}
```

#### SFX-08 — Colony Exhale Bed (S8 tail, loopable) → `sfx_08.json`

```json
{
  "text": "Source: dozens of distant bioluminescent sea organisms breathing together underwater with optical-fiber kelp swaying between them. Material and weight: weightless layered breath tones, soft water pressure, hair-thin glass fiber shimmer spread across a vast space. Action and order: scattered individual soft breaths, then breaths gradually entraining into one shared slow rhythm, then one single collective exhale across the whole colony, then calm synchronized breathing continuing evenly. Space and environment: immense pelagic cathedral volume fading to indigo darkness at the edges, seamless loop with no audible start or end.",
  "duration_seconds": 30,
  "loop": true,
  "prompt_influence": 0.85
}
```

### 3.5 Delivery & QA Checklist (Audio)

- [ ] Generate Option B first (master); Option A as fallback/reference. Compare S4 and S8 section adherence before approving either.
- [ ] Verify no vocals, drums, or braams on full listen; verify the two 600 ms thesis silences survive encoding.
- [ ] Spot-sync: SFX-03 accelerando against Plate 02 vortex timing; SFX-04 click lands exactly on the Ouroboros close; SFX-07 beating reaches zero at bridge contact.
- [ ] Loop-check SFX-01 and SFX-08 over 3 repeats at low volume for seams; re-generate with `loop: true` rather than editing seams by hand.
- [ ] Archive masters as WAV/MP3 beside this document; note seed/settings per file in `audio_provenance.md` (create at generation time; do not back-fill).

---

## 4. Closing Direction

Round 1 asked the question and built the animal. Round 2 gives it a sea to be alive in, six faces for the wall, and a breath you can hear. Build the ocean divergence-free, keep amber sacred, let the kelp confess the phase-lock before the bodies do — and when the colony exhales as one, put the line on the silence after it:

> **Life is what we make of it.**

*— Creative Director, Muse Wonder 1.0, Round 2*








