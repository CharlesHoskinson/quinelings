# Formal model for the experimental creation candidate

The candidate translates an explicit thought into a typed IntentIR, compiles a bounded task DAG, assigns every operation positive territory in an assembly, and packages the task, anatomy, gesture and color design inside the constructor quine. Viewing and recovering a source are passive. Running and running a reproduced child are explicit actions.

QDL remains experimental. Its existing `qdl: 1` marker is a compatibility discriminator, not a stable language release. Freeze a version and migration rules only after the candidate has survived implementation and review.

## What belongs in Quint

Use Quint for transitions and interactions where ordering matters. `spec/creation.qnt` is the creation lifecycle abstraction; `spec/design.qnt` covers the existing collection and chroma views. `spec/agent-session.qnt` explores paused task expiry, bounded history admission and protection of active tasks; its three-slot/three-tick constants abstract the A2A store’s configurable limits.

| Obligation | State and transitions | Check |
| --- | --- | --- |
| Honest interpretation | draft → supported, clarify, unsupported, inconsistent | Unresolved or rejected intent cannot execute. A proposal is data until the typed compiler accepts it. |
| Admission | compile graph + owners + complete source | Rejection of invalid ownership, unsupported operations and source above 65,536 UTF-8 bytes. |
| Passive display | build, animate, select, change palette, inspect, recover | No task executions, effects or children arise from viewing or recovery. |
| Fresh provenance | edit source/body/gesture; run; show lens | Editing invalidates the emitted source and execution record. Numeric display requires a successful record for the exact candidate. |
| Reproduction | emit → validate copy → admit → explicitly run child | Copy identity includes task, anatomy, gesture and chroma. Admission does not rerun the parent. |
| Runtime authority | authorize, guarded action, child admission | An eager DAG requires a direct action guard. Copying source does not copy external authority. |
| Finite resources | run/copy spending; refusal at exhaustion | Bounded children, source size, operation count, steps and explicit budgets. |
| Asynchronous proposals | request, edit, response, cancel | A late response cannot overwrite a newer draft; only its matching request may be accepted. The creation model includes request, matching response, edit invalidation and cancellation transitions. |

The creation model’s eight-energy/three-child cap bounds exploration; it is not a session cap imposed by the website. The SDK separately rejects additions to full artifact and record stores. Finite identity tokens abstract canonical source equality. Milliscale controls abstract some geometry domains. These assumptions must be documented: exploration of these models does not prove the byte codec, arbitrary real arithmetic, provider behavior or JavaScript implementation. Add deliberately unsafe transitions to regression tests so stale-source and implicit-execution checks are demonstrated to detect failures.

## What belongs in Lean

Use Lean for mathematical definitions, invariants over arbitrary finite structures, and reconstruction identities. Retain the existing quine, codec, design, rhythm and chroma proofs, then extend them around the final candidate syntax.

| Layer | Definition to formalize | Required theorem |
| --- | --- | --- |
| Intent and types | Closed sum of scalar/unit, boolean, string, null, array, record and optional types; explicit operator signatures | Accepted nodes have consistent input/output types and dimensions; graph dependency ordering is well founded. |
| Evaluation | Pure operators, explicit failure and finite resource accounting; guarded simulated actions | Progress-or-defined-error and preservation for the modeled interpreter; effects occur only at authorized, guarded action nodes. `choose` is data selection, not lazy control flow. |
| Assembly | Spine/chamber constructors; earlier-parent relation, unique IDs, sockets, depth/fanout bounds | Accepted assemblies form one rooted acyclic attachment tree with depth ≤4, fanout ≤4 and ≤16 components. |
| Ownership | Positive intervals forming exact component partitions, graph-node IDs | Every sampled interior has exactly one owner; every graph node has positive territory; endpoint convention resolves shared boundaries. |
| Geometry | Restricted bowed axial sweep, cap disks, chamber charts and affine pose | Positive radius; regular interior charts; finite unit normals; consistent socket transforms. Prove cap boundary agreement separately from differentiability across seams. |
| Gesture | Four integer tick durations summing to 1000; quintic interpolation; closed authored score | Positive durations; endpoint values and zero first/second derivatives; continuity at joins and repeat boundary; bounded deformation. |
| Rendering resources | Global area-weighted allocation with reserved owner/chart samples | Budget is feasible at its minimum, reservations survive rounding, and total tissue/crest vertices respect the global bound. |
| Source and recovery | Complete source AST containing task and visual design | Constructor emits exactly that source; recovery preserves it; future copies emit the same source. Source size is measured on the complete duplicated constructor, not just the graph. |
| Color | Operation-role territories and optional scalar lens | Ownership is stable under palette/phase changes; a scalar lens has well-defined domain and explicit missing/error behavior. Color appearance is not the exact source codec. |

Do not declare these obligations all discharged merely because scalar bounds or examples pass. `QDL/Assembly.lean` supplies local assembly mathematics; full typed IntentIR semantics, global partition/tree theorems and an implementation refinement remain separate work until actually proved.

## How the two models meet the implementation

After settling each candidate definition, record the same field names, enum choices, bounds and boundary conventions in the JSON schemas, validators and Lean definitions. Generate exact-rational Lean fixtures from accepted JavaScript examples. Check malformed graphs, invalid attachments, narrow ownership intervals, huge phases, overflow and minimum sampling budgets independently in runtime tests.

Replay selected Quint traces against the creation controller using instrumented execution counters and candidate identities. Test direct graphs as well as compiler-generated graphs: otherwise a safe compiler can conceal an unsafe runtime. Compare Lean-modeled reference functions against JavaScript at boundaries; such comparisons are useful evidence but are not a proof of implementation refinement.

Maintain a claim ledger with four labels: kernel-checked theorem, finite model exploration, runtime/browser test, and proposed obligation. Publish actual theorem counts and model commands with the site. Keep source interpretation assumptions and chart/seam limitations visible.

## What makes the final candidate useful

The essential properties are inspectability, reproducibility and useful bounded computation. A person should trace a clause to its operation, find that operation's colored territory, inspect its inputs and output, and recover the same executable source from the genome. Different thoughts should create new graphs and bodies without requiring a new hand-authored family.

Beauty is evaluated through visual review, silhouette diversity, coherent material and motion, mobile readability, performance and accessibility. English meaning requires explicit assumptions, clarification and user inspection of the typed plan. Neither is established by a theorem about a polynomial or a finite state machine.
