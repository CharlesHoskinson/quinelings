# Quinelings design language

A Quineling should first read as a coherent, breathing mathematical creature. Inspection reveals its program. Its identity comes from an asymmetric silhouette, a few bright structural filaments, and quieter detail, while its executable identity is preserved in exact source, harmonic bands, and a color strand.

## Reading the reference

Reference: [@yuruyurau’s sketch](https://x.com/yuruyurau/status/2106393812830708078). Grok examined the post and video, and the lab independently reconstructed its coordinate formula. The following separates observations from our design interpretation.

The original is a square, dark field containing an upright monochrome form. Dense points produce thin continuous-looking filaments, sparse dotted fringes, and bright ridges where marks overlap. A few long sweeping contours hold the whole shape together. The subject moves coherently while preserving its orientation. Its fine structure bends and changes depth; the figure does not simply spin as a rigid object. The interpretation as a dancer, spirit, or kite is perceptual, rather than an object explicitly defined by the source. [Original post](https://x.com/yuruyurau/status/2106393812830708078).

On the inspected first video frame, the foreground bounds are approximately x=204–554 and y=132–687 in an 800-square image. That is a narrow subject, about 44% of the frame width and 69% of its height, surrounded by generous negative space. These are useful proportions for the portrait family, not a requirement for every species.

### Six things that make it visually interesting

1. **A readable silhouette with ambiguous identity.** Large masses suggest a living subject without drawing literal eyes or limbs. Asymmetry gives a sense of posture. A vertical spine supplies orientation while trailing strands suggest movement.
2. **Density becomes material.** White points with partial opacity overlap into bright ribbons, while scattered points remain ghostlike. The contrast between those densities makes the form feel folded, translucent, and dimensional, despite the two-dimensional output.
3. **Structure appears at several scales.** At thumbnail size there is one body. At normal size there are long ribbons and chambers. Close inspection reveals dotted filaments and small folds. Detail earns its place by supporting the larger shape.
4. **Motion is coherent through depth.** A shared phase drives the form, with different depth layers offset from that phase. The body holds together as the surface flows. No random per-frame displacement is needed to imply life.
5. **Restraint makes the complex part legible.** A nearly black background, monochrome marks, and empty margins concentrate attention. There is no competing gradient backdrop, particle confetti, or permanent diagram labeling.
6. **A very small formula yields a surprising form.** Broad spatial envelopes combine with faster trigonometric folding. The result feels richer than its ingredients. This is a principle we can reuse with new formulas and explicit program mappings.

### How the mathematics produces those effects

The sketch samples 20,000 independent points per frame. A slowly changing sample parameter establishes height and envelope; a fast `cos(i/7)` term folds the samples into filaments. A radial magnitude supplies a depth-like value. The phase `depth − time` twists different heights differently, while another term uses twice the time frequency. Those components share a coherent clock. Time has a 2π period, so its π/120 increments repeat after 240 frames: four seconds at the video's 60 fps. Each frame clears the background. The apparent light comes from overlap within a frame, rather than persistent trails. [Posted source](https://x.com/yuruyurau/status/2106393812830708078).

The specific portrait is the artist's work. Quinelings should use our own formulas, proportions, and program-derived parameters; cite the reference rather than reproduce its figure as a species. The reference motivates the appearance, while our finite interpreter supplies meaning.

## Anatomy grammar

| Program information | Anatomical expression | Execution meaning |
| --- | --- | --- |
| Operation node | An organ with a stable anchor and a bounded trigonometric rosette | One declared operation |
| Ordered input port | Indexed attachment point on the organ | Operand order, not inferred from proximity |
| Dependency edge | Endpoint-pinned filament joining the relevant anchors | Explicit producer-to-consumer connection |
| Fanout | A divided filament system | The same value feeds multiple operations |
| Sequential depth | Position along the body's spine | Dependency order |
| Literal/observation source | Small peripheral sensory bud | A declared input or fixture |
| Guard/choice | Forked chamber; selected outlet briefly brightens | Boolean decision and selected data |
| Bounded repeat | Return ring with visible cycle count on inspection | Actual repeat operator with a finite bound |
| Quote | Nested, quieter chamber behind a double membrane | Inert code until explicitly activated |
| Simulated action | Terminal tendril with a brief outbound pulse | A local action receipt, not a world write |
| Emitted canonical source | A compact reproduction bud | Verified source output; child admission remains explicit |

The current kernel uses a finite DAG and an outer bounded-repeat expression. Its fanout is dataflow sharing; it is not automatically a conditional branch. Conditional operations and repeat counts must be explicitly labeled in inspection. A decorative ring does not introduce an executable cycle.

For an edge parameter u in [0,1], start with a straight interpolation between declared endpoints and add bounded normal displacement multiplied by sin(πu). This pins the filament to both organs while allowing it to breathe. For an organ, use radius R(1+a cos(mθ)+b cos(nθ+phase)), with |a|+|b|<1. Integer m carries operation identity; n reflects degree. Preserve the exact graph and source rather than infer them from visual crossings.

## Family and individuality

A species is a bounded morphology grammar, not a replacement program. Within a species, depth, branching, quotations, operation roles, and selected literal magnitudes change the anatomy. The same program keeps its identity while animation phase changes. Whole-source recovery comes from the complete harmonic/color genome, not from the low-frequency silhouette.

| Library program | Family | Dominant silhouette and motion |
| --- | --- | --- |
| Lanternkeeper | Filament | Upright asymmetric portrait; quiet head region and a few long repair tendrils |
| Wayfinder | Comet | Directional elongated body; selected route reads as a bright leading filament |
| Swarmwarden | Coral | Rooted branching fan; allocation splits into bounded tips |
| Echoweaver | Jelly | Bell with trailing threads; agreement gathers into a coherent central pulse |
| Raincatcher | Ribbon | Folded sheet around a narrow spine; sensor streams merge into a measured band |
| Tidemender | Nautilus | Curled chamber system; dependency levels open in sequence |
| Memorybloom | Bloom | Radial, layered petals with an asymmetric core; conflict separates two support regions |
| Pulsekeeper | Torus | Open loop with a dense seam; retry pulses advance to an explicit limit |
| Threadsorter | Moth | Bilateral broad wings with offset vein density; queue order appears along vein roots |
| Seedbank | Seed | Compact kernel with a small branched crown; conserved work returns inward |

These are design targets. A renderer must compute its body from program structure and family parameters; a named skin alone does not demonstrate these semantic correspondences. Validate distinct silhouettes in grayscale, at a fixed phase, before relying on accent colors.

## Color grammar

New designs carry persistent colored membrane territories. A territory follows its operation through material coordinates while motion changes its position. Keep the colored midtones visible, the recessed folds translucent, and a few long crests near neutral white. Opacity and depth retain the reference's density hierarchy.

The fixed `roles-1` dictionary uses cyan for inputs, blue for arithmetic, violet for transforms, amber for decisions, pink for evidence, orange for planning, coral for actions, green for reports, and lavender for reflection. This body palette groups related operations. The exact opcode palette, organ glyph/frequency, and inspection label still distinguish individual operations. Species never rotate these meanings.

An authored scalar lens can recolor bound territories from actual recorded values. Its name, units, fixed domain, and optional reference threshold appear with the scale; unbound tissue keeps its role color. Each territory shows its owner's recorded quantity without spatial averaging. A changed value can therefore change tissue color across unchanged program topology. Not-evaluated, invalid, stale, and out-of-domain states remain explicit. Values are never inferred from motion or decorative intensity, and changing the lens never executes the task. See [QDL chromamapping](QDL.md#authored-chromamapping) for the source contract.

Legacy designs without `chroma` retain neutral material. Exact opcode colors and the byte strand remain available independently of this optional tissue layer.

A separately indexed RGB strand carries exact source bytes. Byte b maps to (b,255−b,(73b+19) mod 256), with explicit padding. This is a lossless numerical color record checked by framing and checksum. Its saturated colors are shown on inspection, rather than covering the portrait with a rainbow. It is independent of the semantic role palette. Video compression, antialiasing, screen color correction, and a screenshot can alter those values; none is an exact source decoder.

## Motion and composition rules

Use one presentation clock and an authored `motion.rhythm`. A monotone sinusoidal phase warp gives a faster active stroke and a slower recovery. Shared expansion and opposing longitudinal recoil make attached tissues move as one creature; traveling waves and lag let tips follow their leading tissue. Periodic mode uses integer temporal harmonics; quasiperiodic mode adds a bounded irrational secondary frequency. Spatial waves respect closed-loop seams. These controls belong to source identity, while their current phase remains presentation state. When a thought executes, send one visible pulse along its relevant connections; persistent idle motion does not imply ongoing execution.

Give each portrait a clear margin. Aim for three dominant masses or fewer, one visual center, and a small number of bright ridges. Keep secondary ink substantially dimmer. Avoid uniform opaque linework, complete symmetry on every family, arbitrary per-frame noise, and labels across the creature's face. Reveal the topology through a dedicated inspection mode.

Animation time and program time are separate. Pause motion without changing the result. Replay a trace without repeating effects. Respect reduced-motion preferences and provide a still frame that retains species identity.

The family rhythm presets distinguish behavior as well as outline: jelly contracts its bell while threads lag behind it, moth wings share an active stroke, coral holds a rooted fan while tips sway, and comet threads follow a leading body. A logarithmic nautilus, golden-angle seed strands, and toroidal winding supply mathematical structure beyond decorative sine ripples. Coral and bloom have bounded quasiperiodic gestures. Authored amplitude limits and normalized harmonics keep these gestures finite and deterministic; there is no hidden simulation history.

## Acceptance for this library

All ten programs must run meaningful tasks, pass edge fixtures, emit exact canonical source, and reproduce through fresh interpreter runs. Harmonic samples and exact color records must recover that source. A failed identity check must prevent reproduction.

All ten portraits should remain distinguishable at a common phase in grayscale. Each should have a stable silhouette, visible hierarchy between core and secondary strands, a controlled motion cycle, and no clipping at its intended view. Execution highlights must refer to real recorded operations. The gallery should support pausing motion, inspecting topology, observing outputs, and checking reproduction without needing a developer console.

Visual interest is ultimately a perceptual judgment. Tests can verify finite coordinates, phase determinism, margins, palette behavior, and distinct structural signatures; a human visual review must still assess readability, rhythm, and character.

## Folded material: current experimental QDL

The eight design reviews converge on a continuous sculpture before its diagram. The current renderer samples folded ribbon surfaces around each family's spine. Graph fanout increases ribbon subdivisions; graph depth increases bounded fold count. Each ribbon carries its own stable offset within one shared traveling phase. Surface points, smooth crest contours, and organ anchors share the authored depth projection. The camera does not rotate or refit on every frame.

Material light comes from transverse projected compression and actual depth. Recesses stay faint, compressed folds brighten, and a few long connected crest contours carry the gesture. These contours sample the same surface; they are not a search for exact compression maxima. Dense points overlap into luminous veils. There is no independent confetti layer or broad glow filter. A portrait uses at most 24,000 points, with a reduced thumbnail budget.

Composition uses a fixed sampled envelope and an authored occupancy target of 60–84% of the available frame, reduced when dependency bends need extra clearance. Lean, yaw, pitch, taper, and asymmetric spread establish posture without a spinning camera. At rest the graph remains quiet; selecting a program line or enabling topology reveals the exact organs and dependencies. Authored role colors remain visible in the material at rest; inspection adds exact organ markers and trace attribution. A named scalar lens exposes recorded numerical data in its bound territories.

Perceptual acceptance targets are a connected focal gesture, a clear luminous crest against recessed material, a recognizable thumbnail silhouette, and coherent motion through folds. These are visual review targets, not schema guarantees. Numeric bounds guarantee finite controls, not beauty. Distinct families retain their own backbones and source-embedded surface presets.

QDL is experimental. We change this single language directly while testing its usefulness and visual range. The current `qdl:1` marker is a prototype syntax marker, not a frozen version 1 contract. Once the language is stable, we will freeze version 1 and specify how programs upgrade without silently changing meaning.
