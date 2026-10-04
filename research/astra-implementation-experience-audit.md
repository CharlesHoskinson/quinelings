# Astra implementation audit: experience and rendering

Reviewed the integrated proposal, beauty/rendering/experience/integration workstreams, the production index, translation, gallery, morphology and chroma modules, and the saved assembly preview and concept images. This is an implementation decision record, not new evidence that beauty or browser performance has passed. Existing dirty gallery and chromamapping files were left untouched.

## Release decision

Implement one complete generated-specimen workspace on the existing static page, with its own controller and compiled assembly renderer. Keep the authored collection and its walkthrough as examples. The first release must construct new executable graphs and source-authored anatomical expressions. Choosing an existing family, matching free text to a gallery item, or drawing the research wire skeleton does not meet that scope.

Use a finite supported recipe interface plus an explicit typed-plan import. A free-text field is justified only if its visible coverage is exact: a supported bounded parser or a configured proposal service. An arbitrary sentence must never receive a successful body merely because it contains a recognized keyword. Explicitly preserve unsupported clauses and missing data as obligations. A schema-valid service response still needs local lowering, semantics checks and reviewable interpretation.

## Concrete defects to avoid carrying forward

1. `gallery.js:82` implements reproduction by calling `run()` again before executing a fresh child. The generated workspace should require an existing current-source emitted record, then execute only the child and append a child RunRecord. Disable copy before that record exists. If a copy fails, preserve the parent and do not advance lineage.
2. `gallery.js:83` executes on recovery. Generated source/genome import and recovery must decode, validate and install a still ready specimen without task execution. Explicit Run creates its first result.
3. `gallery.js:16` clears the recording on every authored edit. Keep immutable run history and mark older-source records stale; source-matched scalar color must never use them. View actions preserve source and records.
4. `translation.js:7–24` contains example-specific prose and rosette/family equations. It cannot explain assembly geometry truthfully. Generated explanations must join clause IDs to actual ordered graph ports and actual declared material regions. Render fields using `textContent`, including imported/service text.
5. `Chroma.compile` invents a level/lane owner partition for legacy surfaces. A generated assembly must consume its committed owner regions instead. Operation colors and `resolveLens` are reusable, but the material owner function is not.
6. `gallery.js:101–126` draws all tissue before all crests, rebuilds per-frame buckets and uses square marks. A fresh assembly renderer should interleave both material and crests in the same depth bins, reuse buffers and use cached round splats or batched round paths.
7. The existing assembly screenshot is a sparse wire diagram: isolated ovoids with narrow stems and little visible material mass. Its exact sockets and motion are useful engineering evidence, but it is not a production beauty baseline.

## Minimum visual implementation

The compiler should derive a principal axis from dependency depth, paired asymmetric attached structures from fanout, and one dominant chamber from convergence. Use a continuous main trunk/chamber with small attached tapering spines first. Never allocate a detached component for every task node: total owner coverage can partition a single chamber into multiple longitudinal/circumferential territories. Sixteen parts must still cover up to 64 operations.

Give each assembly a visible, restrained translucent membrane, 2–4 long structural crests, and fine fringe occupying only a subordinate area. The coarse primary mass should dominate the image. Root collars must visibly overlap the parent's tissue without a conspicuous bright double cap. Keep enough negative space to distinguish silhouette variants. Color identifies fixed operation roles; light should reveal curvature and depth without bleaching the entire membrane white.

Three candidate designs can vary primary elongation, chamber eccentricity, branch placement and curvature. Their expanded geometry and gesture must be in source. Their graph is byte-identical; their full source identities differ. Graph-derived topology and continuous proportions must distinguish new tasks beyond these three candidates. A fixed family enum may remain as a backwards-compatible fallback field, but must not choose generated geometry.

Compile rest samples, material owners and crest coordinates once. At frame time compute shared parent/child transforms and posed buffers. Phase zero must be a complete composed pose. Phase scrubbing is deterministic. Each part's root and attachment socket use the same transform; decorative independent phase noise is unnecessary for the first pass. Portrait bounds should use a stable conservative extent over the gesture, avoiding camera zoom on each pose.

Use ≤24,000 tissue samples and ≤1,806 crest vertices for the entire animal. Start around 8,000–12,000 for a focused view and 4,200 for candidate thumbnails, normalized for optical weight. A low tier must retain every owner/attachment. Animate only the focused visible portrait. Exact owner boundaries and picking use material IDs, not nearest decorative graph nodes.

## Scoped module contract

Keep generated rendering and UI isolated from the already edited gallery implementation. The shared validator/compiler author owns the canonical anatomy schema. These are interface responsibilities; adapt names once that schema is fixed.

```js
// No execution, DOM, network, or hidden family choice.
compileBody(graph, validatedDesign) => {
  sourceDesignKey, ownerIds, components, restSamples, crestSamples,
  anchors, extent, sampleCount, crestVertexCount
}
poseBody(compiled, phase, reusableBuffers) => {
  positions, normalsOrLight, owners, crests, operationAnchors
}
drawBody(ctx, compiled, phase, {
  width, height, selectedNode, showProgram, ownerPalette, quality
}) => { projectedAnchors, materialHitRegions, metrics }
```

Geometry positions, crests, anchors and picking derive from the same posed material. `drawBody` cannot invoke the interpreter, alter source, or modify a RunRecord. Assembly data should enter through an additive dispatch in existing morphology only if legacy integration needs it; the standalone generated workspace can call this API directly without refactoring the library.

```js
// Compiler output consumed by the UI; all references validated.
artifact = {
  source, program, graph, design, sourceIdentity,
  interpretation: { status, summary, inputs, policies, assumptions, obligations },
  sourceMap: [{ clauseId, text, provenance, nodeIds }],
  materialMap: [{ nodeId, componentId, regionId }]
}
// Each entry is immutable and retained when source changes.
runRecord = {
  id, sourceIdentity, kind: 'run' | 'verified-copy',
  parentRunId, tasks, emittedSource, verification
}
```

Only the record adapter calls `Q.execute`. The UI should expose `build`, `watch`, `run`, `copy`, `import`, and `selectCandidate` as distinct operations. Canonical source is a sufficient in-memory equality identity; a stable digest may supplement it for exported display. Never label a compact checksum as cryptographic authorization.

## Complete interaction

Place the generated composer and large portrait before the authored examples. First view: a supplied example thought and explicitly labeled sample data, a Build button, a quiet complete still, and a short explanation of the supported recipe. Show input provenance beside the interpretation. Do not suggest sample requests were observed from the world.

Build validates the interpretation, compiles graph/design/source, installs the body and displays **Ready to run · no result yet**. Watch only toggles the presentation clock. Run appends an actual record and exposes exact output. Create verified copy becomes available only after emitted-source verification and appends a fresh execution/lineage record after successful admission. Make these four visible distinct actions.

Body / Program / Recorded result modes reuse the same specimen. Program mode displays clause selection, exact operation including ordered ports, and material-owner highlight. List every linked node where one clause lowers to multiple operations. All operations remain reachable from a keyboard list even if they have no direct clause; mark compiler-introduced operations honestly. Use a body click as a shortcut, never the only inspection path. Show equations in a disclosure specific to the generated primitive, not the legacy rosette formula.

Candidate changes preserve task semantics and previous runs, but install a new source and disable copy until a current-source run. Recorded result visibly says **Previous source** for earlier runs. Zero is a valid value. Missing/invalid/unbound values remain separately labeled and do not inherit a misleading saturated scalar color.

Failed build/import leaves the last working specimen visible with a separate failed-proposal status. Preserve the attempted thought and diagnostics; do not relabel the prior specimen as the successful new result. Successful import installs a ready still and zero new executions. Export source and artifact separately because only source is reproduced by the quine; intent provenance belongs to the companion artifact unless explicitly embedded.

On static Pages, recipe compilation and import work with no service. Show free-text service configuration only as an optional advanced feature. A failed/cancelled request keeps its unresolved status. Use bounded request/response sizes, request identity, cancellation and stale-response rejection. No provider secrets in source, generated artifacts, URLs or browser storage. Do not promise a backend that has not been implemented.

## Acceptance before claiming completion

- Supported build, ambiguous thought, unsupported operation, contradictory policy and missing data produce distinct correct states. Uncovered clauses prevent a ready artifact. Supplied data stays visibly distinct from sample data.
- Two unseen DAGs produce materially different connected silhouettes; three same-task variants preserve graph bytes while changing complete source. Inspect static grayscale thumbnails and full-motion strips. Do not call visual diversity established from hash differences alone.
- Every clause mapping resolves; every graph node has positive material territory and an inspectable anchor; all ordered dependency edges remain available. Selecting a node highlights only its real material and relevant edges.
- Instrument `Q.execute`: Build, Watch, selection, candidate switching, scrubbing, import, export and recovery add zero calls. Run adds one. Verified copy adds exactly one child execution using the existing current-source emission.
- Run, change body, select old result: record is stale. Select a view/phase/lens: source identity and records do not change. Copy before Run is disabled. Invalid child adds no lineage entry.
- Mobile at 390 px, keyboard-only and reduced-motion users complete build/run/inspect/copy/export. No automatic motion under reduced motion; status live regions update only on actions/state changes.
- Independent expected outcomes, three fresh generations, sampled-wave and RGB recovery apply to generated sources containing the full anatomical expression. Invalid sources retain prior state without executing.
- Measure at least 300 warm focused frames on the actual browser/device; report viewport/DPR, geometry/raster/total percentiles and heap behavior. Historical Node geometry timings and the sparse preview are not performance evidence for the finished renderer.

The practical first implementation is a generated workspace, bounded compiler, source-authored assembly and honest execution records. Optional provider synthesis, fins/loops and real game capabilities can remain explicitly unavailable. A beautiful connected renderer and a complete local create/run/copy path cannot be deferred while labeling this update complete.
