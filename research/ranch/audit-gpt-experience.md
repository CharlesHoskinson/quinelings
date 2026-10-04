# GPT experience audit of the converged ranch candidate

Audited 2026-10-04. Scope: `docs/RANCH-CANDIDATE.md`, especially sections 1, 2, 4, 6 and 7. Read repository `AGENTS.md`, the experience/visual brainstorms, and relevant current Anatomy, QDL, renderer and SDK code. This is an independent candidate audit, not implementation approval. No ranch implementation, browser performance result, accessibility result or new formal proof is claimed. Only this report was edited.

Recommendation: correct the required items below before implementation. The candidate's explicit admission/Run separation, source-backed residents, bounded stores and honest experimental qualifiers are strong foundations. Mathematical bounds alone cannot establish beauty; the proposed visual review remains necessary.

## Required corrections

### E1 — High: world guards must bound projected ink, not an object-space portrait

**Candidate:** sections 4 and 7, “every full gesture envelope within its guard, using conservative portrait bounds.”

**Counterexample:** current `Anatomy.portraitFrame` returns object-space extents; `LifeformRenderer.draw` uses those extents for fitting, then applies source-authored yaw, pitch and lean. All three composition controls accept values in [-0.5, 0.5]. An accepted root chamber with axes [0.35, 0.35, 0.35], hover strength 0 and composition lean 0.5 has object-space right edge 0.35 but projected right edge approximately 0.566312. Its projected center is shifted by 0.175. I reproduced these numbers in an isolated Node sampling experiment against current code. This is evidence about current geometry, not a test of a future ranch. Even correctly projected centerline bounds exclude point-sprite glow, ridge width and selection rings. Reusing the current portrait fit can let visible tissue cross a world reservation or clip at the arena boundary.

**Exact correction:** specify a ranch screen-envelope function: transform all eight corners of the conservative phase-independent 3D box through the actual composition projection, calculate projected center/extents, then add the maximum finite ink footprint in arena units. Include sprite/glow cutoff, ridge half-width and any body selection marker; keep larger decorative ribbons explicitly outside the collision claim. Fix one scale per resident that fits this envelope inside its 48×48 guard for all gestures and permitted LODs. Specify arena-to-CSS scaling so mobile minimum sprite sizes cannot silently break that guarantee. The focused portrait can use a different fit.

**Independent obligation:** adversarial valid assemblies and composition extremes, continuous-bound reasoning or appropriately qualified sampling, all gesture templates/strengths, all LODs and DPRs; assert every rendered body footprint stays within its guard. Include the numeric chamber case above. Prove the reservation rule separately from this rendering envelope.

### E2 — High: compose can rewrite protected simulated-action guards

**Candidate:** section 2, compose versus mate.

**Counterexample:** recipient has a literal `false` directly guarding an allowed walk action. A different parent's pure Boolean output is `true`. Compose substitutes output into that literal input: types are exactly equal, donor contribution is real, and the recipient action survives. The child's explicit Run now performs the action the recipient deliberately skipped. Mate would reject the same replacement because it protects every ancestor of a direct Boolean guard; compose has no corresponding exclusion. A UI describing compose as an ordinary typed connection can conceal this authority-changing operation.

**Exact correction:** apply the same original-recipient action/guard-cone preservation predicate to compose and mate, before pruning and again after construction. Alternatively explicitly restrict compose recipients to pure DAGs; do not leave the weaker rule implicit. Preserve action names and allowed flags as already required for mate. Diagnostics must name the protected guard and show the attempted connection.

**Independent obligation:** construct true-output → false-literal-guard compose as a rejecting negative fixture, plus transitive guard ancestors and repeated guard uses. A same-typed payload connection outside the guard cone must still be accepted. Model this shared predicate, rather than proving only the mate branch.

### E3 — Medium: stateless previews lack a complete frame request contract

**Candidate:** sections 5 and 6, stateless preview and `offspringFrame`.

**Counterexample:** an agent receives a ready preview and wants its body frame before admission. Existing `Runtime.frame` requires a stored artifact ID, while preview explicitly stores no artifact or candidate. The candidate names `offspringFrame` but gives no input fields, identity checks, budget or response semantics. An implementation may accidentally admit the source, rely on a hidden candidate store, or fail after preview because an ID cannot be looked up.

**Exact correction:** define `offspringFrame` as a strict request carrying the complete offspring input, expected candidate ID, expected child source hash, phase and bounded frame options. Rebuild statelessly and compare both identities before returning geometry plus matching identities and owner/node mappings. Specify whether this uses the existing 4000..24000 inspection budget or the separate 1000..4000 ranch layout, and bound serialized output. Apply identical discovery schemas in TS, MCP and A2A. Do not accept an unvalidated candidate blob as authority.

**Independent obligation:** frame a preview before admission, repeat in a fresh runtime with the same parent artifacts, reject changed pins/hash/unknown nested fields, and instrument all stores/counters and task execution to establish passivity. Verify returned owner indices resolve to that exact child's ordered node list.

### E4 — Medium: LOD needs an optical-density rule and a pixel-work limit

**Candidate:** section 7, analytic particle glow, 1000..4000 samples/body and total tissue ≤32000.

**Counterexample:** additive particles of fixed radius/intensity give roughly four times the accumulated light when sample count changes from 1000 to 4000. Keeping integrated light constant by quadrupling each low-detail particle's area instead can erase narrow owner territories and increase fragment overdraw. A 32000 vertex bound does not bound pixel work: many large glowing sprites can repeatedly cover the same drawing buffer. Current Canvas drawing already couples radius to budget, so copying its policy into the new renderer is not a sufficient independent specification.

**Exact correction:** define bounded particle radius in physical pixels, sample/area weights for additive intensity, and the intended LOD invariants for silhouette, material brightness and owner visibility. Count reserved samples consistently in the density rule; one reserved sample is not automatically equal-area tissue. Add a maximum glow footprint and measured overdraw/GPU acceptance gate for dense scenes, alongside the existing vertex and drawing-buffer caps. Specify separate handling for selected-owner highlights so low-detail samples cannot misrepresent tissue coverage.

**Independent obligation:** render identical source/pose at 1000, 2000 and 4000 samples with locked exposure and viewport; compare integrated luminance, silhouette and selected-owner readability against declared tolerances. Measure maximum-population dense scenes and inspect software rendering. The eight-body CPU target alone cannot validate the worst case. These are future obligations, not completed measurements.

### E5 — Medium: crossfades need identity-aware inspection and durable ceremony evidence

**Candidate:** sections 1, 5 and 7, committed-only ceremonies, bounded events, source-body crossfades and exact displayed anchors.

**Counterexample:** during a parent→child crossfade, the viewer clicks a visible parent-owned organ while the selection panel and pick map have already switched to child nodes. The visible tissue and reported source then disagree even though both meshes are valid. Separately, a committed birth can leave the 256 informational-event window before replay; an animation reconstructed from current selection or a reused source hash can show the wrong parents or no evidence of which derivation was committed.

**Exact correction:** each queued ceremony binds a successful admission receipt, derivation ID, ordered parent source/resident identities and child source/resident identity. Obtain immutable render inputs from pinned artifacts or a bounded validated snapshot; if unavailable, disclose that replay is unavailable. Crossfade layers carry separate source identities and owner maps. Either disable canvas operation picking during transitions while retaining labeled DOM inspection, or explicitly resolve clicks to a labeled layer. For reduced motion, skipping, eviction and context loss, settle immediately into the acknowledged child state. Never relabel visible parent tissue as child tissue.

**Independent obligation:** change selection mid-ceremony, replay after event-window eviction, recover context, queue more than eight ceremonies and exercise reduced motion/skip. Assert unchanged authoritative stores/run counts, correct receipt-bound parent order, and inspector/source/owner consistency at every interactive frame. Replay loss must not cause another admission.

### E6 — Medium: accessibility acceptance is too abbreviated to be executable

**Candidate:** section 7, “Keyboard, pause-all, 320px layout, reduced motion ... are complete.”

**Counterexample:** an implementation can supply Tab-accessible buttons yet move focus to every autonomous newborn, announce 20 ticks/second into a live region, rely exclusively on color for pairing state, or expose “Pause all” while a queued birth crossfade continues. Each can satisfy the candidate's broad shorthand while preventing usable inspection.

**Exact correction:** promote the experience brainstorm's concrete requirements into candidate acceptance: DOM resident and node lists expose all canvas actions; selection/state has text and visible focus; autonomous events never move focus; explicit command errors/successes use a bounded polite status region; tick/coordinate updates are not live announcements; reduced motion disables authored loops, travel decoration and ceremony fades; pause-all freezes every view clock and social controller without changing committed state. Hidden-tab return remains paused until explicit resume. Specify contrast checks for final controls/text and non-color state distinctions. Long hashes/source remain in labeled internal scrolling/wrapping containers at 320 CSS px.

**Independent obligation:** keyboard-only prepare/admit/Run flow, screen-reader checks during dense simulation, focus preservation during autonomous proposals, reduced-motion toggling mid-ceremony, pause-all and hidden-tab resume. Check both WebGL and fallback paths and default-off participation. Automated accessibility scanning alone does not cover these behaviors.

## Optional enhancements

- Add a compact receipt-backed three-stage display: “Candidate prepared”, “Resident admitted”, “Task run recorded”. It makes the already specified lifecycle easier to understand, but is not required if equivalent clear text is provided.
- Use two deliberately different fixtures in the initial garden and inspector walkthrough: useful pure computation and false-guard simulated action. This demonstrates that visual/social activity and executable task outcomes are independent.
- Review low-detail owner highlights in grayscale and against a monochrome background before adding decorative contours. Background simplicity is an artistic option; factual owner labeling is required.

No beauty theorem or performance speedup follows from this audit. The numeric projection experiment is the only experiment performed here; all independent tests/model checks listed above remain implementation obligations.
