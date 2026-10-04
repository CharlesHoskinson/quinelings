## Beauty council — grok-2

Mathematical motion, organic coherence, choreography. Read-only. Judgment is from the stills, not from other council reports.

### Verdict

**Homepage: no.** The ten current programs do not produce beauty equivalent to the original.

**Archive: partly.** The ten gallery bodies are real filament drawings, and a few are strong on their own terms. None joins the original’s density, broken asymmetry, overlap light, and large pose change in one image.

### Scores

Scale: 10 is the level of the original’s visible achievement on that axis. These are judgments, not measurements.

| Axis | Original (one work) | Homepage (ten programs) | Archive (ten bodies) |
|---|---:|---:|---:|
| Form | 9 | 3 | 6 |
| Motion | 8 | 2 | 5 |
| Light / texture | 9 | 3 | 6 |
| Color coherence | 9 | 5 | 6 |
| Variety | 8 within one body; library variety does not apply | 3 | 7 |

Original motion is scored only from four stills. Smoothness is unmeasured, so that 8 is not a claim about the running film.

### Evidence looked at

Original MP4 stills `original-01.png` through `original-04.png`, taken every two seconds. Reference reconstructions at 0, 1.57, 3.14, and 4.71 rad. Homepage phase stills for water-total, confirmed-checkpoints, needs-triage, evidence-ledger, gather-readiness, and craft-quote, plus the ten-program atlas. Gallery stills for lanternkeeper, wayfinder, memorybloom, seedbank, swarmwarden, echoweaver, tidemender, and threadsorter, including quarter phases where named. `capture.json`. The reference `sample(index, t)` in `tweet-reference/index.html`. Presentation code in `living-thoughts.js`, `anatomy.js`, `gallery.js`, and `morphology.js`.

The live pages and the MP4 were not watched as motion. `lifeform-renderer.js` is a different painter from the homepage stills.

### Observations

**Original.** All four frames are one white organism on black: a bright tangled core, irregular curls, and sparse dotted limbs. Frames at 0 s and 4 s share one draping, with the beaded fan on the left. Frames at 2 s and 6 s share the other, with that fan thrown to the right and the lower trails re-hung. The pose change is large. The return at four seconds is visible. The mark is overlap: crowded samples burn white; fast limbs break into beads. There is no second hue.

**Reference reconstruction.** The four phase stills are the same visual class as the MP4: white, asymmetric, core against beads, and a silhouette that swings from quarter to quarter. They are not frame-matches to the four MP4 samples. They confirm the reference field still makes that picture. They are not a Quinelings surface.

**Homepage.** Every inspected program is one small assembly on a wide dark field: a round or oval chamber, a short stem or hook, and two to four smooth tapered arms. Proportions differ. Water-total is a taller oval with a green lower third. Confirmed-checkpoints is rounder, with tan arms and a short pale stroke inside the disc at both 0% and 50%. Needs-triage and gather-readiness are flatter and carry an extra colored hook above the stem. Evidence-ledger spreads its arms wider. Craft-quote is rounder, with a gold stem tip. That is the whole range. No body fills the frame, branches, or breaks into beads.

Water-total at 0, 25, 50, and 75 percent is one pose. Confirmed-checkpoints at 0 and 50 is one pose. Arm angles, band order, and the stem do not exchange the way the original drapery does.

Light is a crosshatched cloth. Horizontal hue bands sit in stable stripes: teal, blue, olive, tan, with a separate pink hook on needs-triage and gather-readiness. The hues do not flicker between phases. They read as stripes on a solid, not as one light.

**Archive.** The ten bodies are different drawings.

- Lanternkeeper, 0 / 1.57 / 3.14 rad: one vertical ribbon. A fold migrates and a left-side notch appears by 3.14. Cyan crown, blue middle, gold lower run, rose tip stay put.
- Wayfinder, 0 versus 3.14: the left side stays a comb of parallel cyan strokes. The right end changes from a ribbed fin to a single point.
- Memorybloom, 0 and 1.57: the same radial nest of ellipses. Gold left, cyan right, blue below. The envelope does not change.
- Seedbank, 0 and 4.71: the same pole-to-pole spindle. Interior lines slide. Cyan cap, blue body, green base stay put.
- Echoweaver: a bell over a curtain of repeated hook-shaped tentacles, banded rose, teal, gold, and blue.
- Swarmwarden: the densest archive body. Overlapping curves, gold on the left, blue on the right, a cyan burst at the bottom. The strokes are still a fan of similar leaves.
- Tidemender: one logarithmic spiral, gold outer arc, blue coils, green tail.
- Threadsorter: a bilateral figure-eight, two matched lobes, green only at the crossing.

Archive line work is closer to the original than the homepage mesh is. The repeated part is still obvious: equal tentacles, equal meridians, equal petals, matched lobes, parallel comb teeth.

### Evidence limits

Quarter-phase stills cannot show continuous smoothness, ease-in, or whether a path strobes between samples. A body can move well and still look quiet at these four times, or look different at four times and move badly between them. Subjective universal beauty is not established by one reviewer. The original is one organism sampled four times. The homepage and the archive are libraries of ten. A high archive variety score is about that library. It does not make any single archive body the original’s equal. No pixel deltas, optical-flow values, or preference rates were measured.

### Three observable deficits

1. **Homepage form is one low-frequency sprout.** Across the atlas and the individual stills, ten programs share a central oval, a short apical hook, and two to four smooth arms, small in the frame. The original frames are a frame-filling asymmetric thicket with a hot core and irregular limbs.
2. **Homepage quarter phases hold one pose.** Water-total at 0, 25, 50, and 75 percent, and confirmed-checkpoints at 0 and 50 percent, keep the same arm angles and band layout. The original samples two seconds apart exchange which side carries the beaded fan, and the four-second sample returns.
3. **The mark is either cloth or a ruled repeat.** Homepage samples read as a woven disc. In the archive, echoweaver’s tentacles, seedbank’s meridians, memorybloom’s ellipses, wayfinder’s comb, and threadsorter’s two lobes repeat a clean stroke. The original’s light is one white field: solid where samples pile up, beaded where the limb runs fast, with no copied part.

### Code inference

Separated from the verdict. The stills above stand without this.

The reference picture is 20,000 source-over squares, 2×2, alpha about 0.376, on `#090909`. Index and time are coupled: `k` oscillates with `cos(index/7)`, `q` carries `sin(6*e-5*d+2*t)`, and `angle = d-t` swings the mass.

Homepage `draw` asks `Anatomy.frame` for budget 4000 and 3 crests, then fills 1.5 px discs at alpha 0.43 with `screen`, plus a 0.8 px ridge. `frame()` stores a constant point weight 0.18. Its crests use a phase-independent `v`. Pose comes from `TEMPLATES` whose keyframes stay near 0.09 in scale, 0.08 in lean, and 0.10 in opening, multiplied by gesture strength about 0.55–0.70. That is one global scale, one small rotation, and a hinge. `portraitFrame` already pads for those maxima so the fit does not zoom the motion away. Component generation is a chamber plus a few spines. These constraints match the sprout and the still pose. They were not used to invent a difference the stills do not show.

Archive motion is a coupled harmonic with breath 0.06, wave 0.055, and overtone 0.17. `portraitFrame` refits sixteen phases, so global breath is cropped back to a stable envelope. Local `traveling()` terms remain. That matches a sliding fold on lanternkeeper and a stable spindle on seedbank. Ribbon phase is evenly spaced by index, which matches the ruled repeats. Opcode color stays on the owner. Region hues surviving a phase change matches that.

### Three fixes

Presentation only. Do not change task graphs, canonical source, quine checks, or role-to-hue assignment. `Chroma.colorFor` and gallery `instructionColor` stay the source of color.

1. **Homepage mark.** In `living-thoughts.js` `draw`, raise the budget inside the ceiling `frame()` already allows (4,000–24,000; the reference uses 20,000). Paint source-over, with a low per-sample alpha, so pile-up makes the core and sparse samples bead. Add crest polylines on the existing `(u, v)` charts whose transverse coordinate follows a phase term of the reference kind, `sin` of a spatial quantity plus `2*t`. Color those samples only by the owner index already stored on the frame.
2. **Homepage pose.** Raise the lean and opening keyframes in `TEMPLATES`, still inside `validateGesture` (strength 0–1, four integer ticks summing to 1,000, hinge path at most 0.35). Make crest `v` in `frame()` depend on phase. `portraitFrame` already reserves pad from those maxima, so the larger travel stays inside the fitted frame. Add no components and no edges.
3. **Archive curls without new families.** In `morphology.js`, apply the existing overtone and `traveling()` term at an amplitude on the order of ribbon width, in the transverse coordinate of `surfacePoint`. Fit `portraitFrame` to the low-order envelope only, so those curls are not padded out of view. Offset each ribbon’s phase by an incommensurate function of ribbon index so parallel strokes bead instead of ruling. Keep each family envelope: a bell stays a bell, a spindle stays a spindle, a flower stays a flower. Keep opcode hues.

### Scope

No files were edited. No live deployment, no subagents, no messages sent. The archive’s partial credit is carried most by swarmwarden’s density and lanternkeeper’s moving fold. It is not a match to the original.
