## Beauty council — grok-1

Art direction, silhouette, composition, variety. Read-only. Homepage and archive judged separately against the original MP4 stills. The reference reconstruction is a control, not one of the two verdicts.

### Verdict

**Homepage: no.** **Archive: partly.**

The homepage pictures are one soft emblem repeated ten times. The archive is in the same medium as the original — fine luminous lines on black, with real silhouette differences across the ten — and still falls short of that drawing’s density, irregular overlap, and outline-changing motion.

### Evidence actually inspected

- Original MP4 stills `original-01.png` through `original-04.png` (capture note: sampled every two seconds).
- `comparison.jpg`, `motion-comparison.jpg`, `gallery-comparison.jpg`, plus the attached atlas and the attached water/checkpoint filmstrip.
- Reference reconstruction at 0, π/2, and π.
- Homepage phase stills: all ten programs at the atlas phase; water-total and confirmed-checkpoints at 0/25/50/75; water-total, evidence-ledger, and needs-triage at 0 and 50.
- Archive phase pairs at 0 and π: echoweaver, lanternkeeper, swarmwarden, memorybloom, tidemender, wayfinder. Phase 0 only, beyond the contact sheet: seedbank, pulsekeeper, threadsorter. Raincatcher seen on the contact sheet.
- `capture.json`, the reference sampler in `tweet-reference/index.html`, and the draw paths in `living-thoughts.js`, `lifeform-renderer.js`, `gallery.js`, `anatomy.js`, `morphology.js`, `chroma.js`.

Not inspected: every quarter-phase of every specimen, and no continuous playback.

### Original, as a picture

Four files, two poses. `original-01` and `original-03` are the same left-falling drape. `original-02` and `original-04` are the same more upright mass with tendrils falling the other way. Each still is already a full drawing: a bright tangled core, ribbons that cross, long sparse dotted fringes, large black voids, asymmetric outline. White points on black. Overlap is what makes the hot knots. Nothing in the still is a filled solid.

The reconstruction at 0 and at π is the same kind of picture: white filaments, dotted decay at the tips, and a different outline at the second phase. It is evidence that this look can be sampled. It is not the homepage and it is not the archive.

### Scores

Scores are for these stills. Motion scores are pose-change across the sampled phases. They are not smoothness scores.

| Axis | Original | Homepage | Archive |
|---|---:|---:|---:|
| Form | 9 | 3 | 6 |
| Motion | 8 | 2 | 5 |
| Light / texture | 9 | 4 | 7 |
| Color coherence | 9 | 6 | 5 |
| Variety | 8 | 2 | 7 |

Original variety is internal variety of one body. Homepage and archive variety are across the ten, with internal repetition counted against them. The original being one work is why its variety number is not a library score.

Homepage form is the horizontal oval, two side arms, and one raised curl, small in a dark teal field. Arm height, oval proportion, and which band is gold or teal do change (evidence-ledger’s uneven lifted arms against needs-triage’s flat pair). The part list does not. Archive form is a set of distinct emblems. The stronger ones are echoweaver’s bell and fringe, swarmwarden’s fan, wayfinder’s diagonal wing, lanternkeeper’s vertical flame, seedbank’s pod of lines. memorybloom, threadsorter, pulsekeeper, and tidemender are closed, regular symbols: star, sideways figure-eight, ring, spiral.

### Observations

1. Homepage quarter-phases barely move the outline. On water-total, confirmed-checkpoints, evidence-ledger, and needs-triage, 0 and 50 keep the same oval, the same arms, and the same curl. Tips sag or straighten slightly. The original’s two sampled poses move the mass from one side of the black field to the other.
2. Homepage light is a stippled solid. The oval carries hard horizontal stripes (teal, blue, green, gold, sometimes a pink curl tip). Edges are blunt. Strokes do not cross into white knots, and tips do not dissolve into sparse dots. The field behind the body is dark teal, so the mid-value body sits at low contrast.
3. Archive lines are the right kind of mark: thin strokes and fine points on black, with dotted passages in lanternkeeper, tidemender, seedbank, and pulsekeeper. Opposite phases move the interior and flex the outline locally. Echoweaver’s crown peaks and the fringe rearranges, and the bell remains a bell. Tidemender’s inner loops shift, and the spiral-plus-tail remains. Swarmwarden stays a fan. Memorybloom stays a radial star. Wayfinder stays one diagonal wing; the trailing tip tightens. The original changes outline class between its two poses.
4. Archive color splits many bodies into coequal hues: rose, gold, cyan, blue, green in one organism (echoweaver, memorybloom, pulsekeeper). Seedbank and lanternkeeper hold together better, as a green-to-blue or teal-to-gold run. The original uses one white. Brightness comes from how many points land in the same place.
5. Archive specimens repeat one module until the silhouette is full: identical hanging strands, identical petals, identical loops. The original’s crossings are irregular. Negative space inside the original is jagged. Negative space inside threadsorter and pulsekeeper is a clean hole.

### Code inference

Separated from the pictures. These are reasons the pictures look like that, not extra visual claims.

- Homepage stills match `living-thoughts.js` `draw`: budget 4000, which matches `capture.json`, each sample a disc of radius 1.5 at alpha 0.43 under `screen`, crests stroked in a constant `#dbeed2`. Role color comes from `Chroma.colorFor`. `chroma.js` keeps six role hues (`input`, `process`, `decision`, `quote`, `action`, `report`) and says they are body-role colors, distinct from the opcode palette.
- The oval-and-arms picture matches `anatomy.js` `generate` / `generateV1`: one chamber plus a few short spines, with axes and spine length clamped into a narrow band. Gesture templates are a few hundredths in scale, lean, and opening, then multiplied by stored strength. `pose()` turns that into a small scale and a small rotation. That agrees with the almost-still filmstrip. `portraitFrame` pads to the full gesture envelope and comments that the bounds are fixed so the fit does not breathe.
- Archive stills match `gallery.js` `render` plus `morphology.js` `strandPoint`: family envelopes (bell, fan, spiral, star, wing, pod), points with alpha from a depth channel, crests in the owner’s color. Default rhythm breath is 0.06 and wave is 0.055. Validated ceilings in `qdl.js` are 0.18 for both. Motion is specified as a separate clock from execution.

### Three deficits

1. **One homepage silhouette.** All ten current homepage bodies are the same three-part emblem. Sampled phases do not trade that emblem for another outline. The original’s two poses do.
2. **Homepage material is a banded solid.** Stipple fills the oval. Horizontal stripes are the strongest internal event. There is no stacked-line core and no dotted fringe. The original and the reconstruction are built from those two things.
3. **Archive emblems hold, and hue cuts the body apart.** Across phase 0 and phase π the family outline stays the family outline. Interior lines travel inside it. Full-strength hue regions make one organism read as several materials.

### Three fixes

Proposals only. No new anatomy, no rewritten program source, no change to task execution, no change to the role-hue table. `ROLES` and `ROLE_MAP` stay as they are. Opcode hues, where a specimen uses them, stay the names of those operations.

1. **Homepage mark, in `living-thoughts.js` `draw` only.** Draw the existing samples as hard points on black, on the order of the reference’s 2×2 dots at alpha about 0.38, and stop using radius-1.5 discs under `screen`. Stroke `frame.ridges` in the owner’s existing role color, thin and light, instead of one pale constant stroke. Ownership, anchors, and role hex values stay. This is aimed at deficit 2. The outer oval will remain until the line, rather than the fill, is what the eye meets.
2. **Homepage contours from parts that are already in the frozen assembly.** In that same draw path, stroke a few offsets of each existing crest, inside the part’s current radii, with alpha falling on the outer offsets so the edge becomes dots. Drive a phase shift along those crests from the phase the page already passes in. Do not call `generate` or `generateV1`, and do not write anatomy or gesture back into source. This is aimed at deficit 1’s texture and at the visible stillness. It will make the frozen oval read as a bundle of lines. It will not produce ten species. The chamber-and-short-spine assemblies, and gesture deltas of a few hundredths, are in the frozen sources and templates. Equivalent silhouette range waits on new anatomy, which this pass excludes.
3. **Archive portrait only, in `gallery.js` `render` and the displacement already computed in `morphology.js`.** Draw the membrane in the neutral ink, with alpha carrying the light, and keep each owner’s current hue on its crest alone, so the hue still identifies the role and the body has one material. Raise the drawn traveling-wave and bell contraction toward the validated ceilings (wave and breath at most 0.18) without writing those numbers into program JSON. Leave `motion.clock` separate from execution. This is aimed at deficit 3: opposite phases should move the fringe, fan, wing, or crown enough to change the outer contour, and a body should stop splitting into a spectral legend.

### Evidence limits

Phase stills cannot show whether motion is smooth, stepped, or alive between the samples. They cannot support a claim about universal beauty. The original record here is one eight-second work seen as four stills in two poses. The library is ten authored bodies. A high archive variety score is variety across that set, not proof that any one archive body equals the original. Reconstruction similarity shows the reference equation still draws the original language. It does not transfer that score to the homepage or the archive.
