# QDL v1 ranch: useful, inspectable collaboration

Status: specialist 8 research recommendation, 2026-10-04. This report changes no implementation. Reviewed the work plan, City context, language semantics, runtime/API, standard library, compatibility and security reports; `offspring.js`, `ranch-world.js`, `ranch.js`, SDK ranch types/runtime, and existing ranch contracts and tests. City requirements below use the already captured public material in `city-context.md`; all numerical scenarios are synthetic.

## Release recommendation and measured baseline

Preserve the current social simulation and atomic admission protocol. Add a source-aware collaboration inspector, v1 composition over real typed invocation ports, and a bounded session history that can be saved and restored. A meeting proposes a construction; it does not establish compatible tasks, create a child, execute a program or confirm a world result. Pair participation is an explicit local setting, not creature consent or external authority.

Read-only local verification on this checkout:

| Command | Result | Scope |
|---|---|---|
| `node verify-offspring.cjs` | passed, 17 successful builds / 39 rejections | Existing literal composition, guarded payload donation, exact codecs/source emission, limits and detached construction |
| `node verify-ranch-world.cjs` | passed, 20 checks | Existing reciprocal pairs, proposal/admission separation, atomic charges, expiry, withdrawal, nursery, guards and passive world operations |

These tests establish an experimental baseline. They do not test proposed v1 ports, declaration transformations, durable restoration or new UI. Keep their legacy expectations unchanged.

Actual gaps have direct code evidence. `offspring.js:assembleTask` requires graph-matching companions, replaces literals for compose and synthesizes a generic English thought with empty assumptions. It cannot compose the proposed source-carried declarations/runtime ports. `ranch-world.js:affinity` scores shared roles, gesture, source difference and distance; it does not inspect units or effect constraints. `ranch.js` keeps only one displayed run per artifact in its `records` map, downloads source/genomes and recreates the demo on page load. Source recovery in that same Runtime can reuse existing metadata, so it is not a test of history recovery in a fresh session. SDK has no checkpoint/restore surface. The 256-event ring is informational and explicitly drops old events; it is not a durable birth ledger.

Production interpreter freeze need not wait for persistence. If save/resume is absent, call the ranch a local session and state the history retention honestly. A release claiming saved collaboration history must meet the persistence gates below.

## 1. Meetings that explain the possible collaboration

Retain explicit reciprocal invitations, participation off on import/birth, social clock controls and proposal expiry. Do not make typed compatibility necessary for a social meeting: residents may meet without a useful seam. Keep social affinity labeled as a movement heuristic. Task compatibility is a separate passive analysis of a selected ordered pair and recipe.

At a proposal, show the exact parents/residents, source/profile pins, epochs, expiry and current admission eligibility. A selected recipe should show donor closure, recipient seam, normalized structural type/units, protected guard nodes, renamed nodes/ports, remaining required invocation bindings, repeats change and projected node/source budgets. Distinguish:

* `compatible`: static source/type/effect checks permit construction; dynamic input checks still apply.
* `incompatible`: selected seam fails, with a machine diagnostic and named node/path.
* `unavailable`: missing admitted parent or unsupported profile; no inferred units or declarations.

A successful construction preview is stronger than static compatibility: it includes the fully validated child source and exact candidate pin. Neither means admission remains eligible after parent withdrawal, retirement, annotation, revision change or proposal expiry. Display admission status separately. Recheck live conditions at admission, preserving current transactional behavior.

For the first UI, inspect the currently selected seam rather than searching all 64×64 node combinations. Each response contains at most 64 donor/protected/reference rows. No opaque aggregate compatibility score or autonomous recipe selection is needed. Users can see why `L` fits `L` and `mL` fails, or why a Boolean seam is protected despite matching type.

## 2. Bounded offspring over v1 source and runtime ports

Follow compatibility's discriminator inside the quoted constructor payload. Both ordered parents must be admitted under the same profile, registry digest and canonicalization. Mixed legacy/v1 parents refuse `profile-mismatch`; migration is explicit and leaves the original artifacts intact. A mixed scene is fine. Stable composition derives types/declarations from admitted source, not an optional companion. Legacy construction retains its companion requirement and exact behavior.

Keep four recipes. For v1, compose's `recipientInput` identifies an `input` node, not a literal. The node's port name is a distinct invocation key. Replacing a constant is an explicit mate operation; compose must never silently make constants bindable. Body preserves the base's complete task, declaration, ports and repeats; merge retains both tasks and returns labeled outputs; task-changing recipes use repeats 1 with an explicit diagnostic.

For v1 compose/mate, perform this deterministic transformation:

1. Validate/pin both canonical sources. Use injective role/index namespaces for nodes and role-prefixed port names; reject any resulting identifier/port bound violation. Do not coalesce equal names or equal values across parents.
2. Import the entire donor predecessor closure, including every required `input` and literal. Require it to be pure and action-free. A port is not a free variable: its declaration must survive, and its value must be supplied on explicit invocation. No donor results, cached bindings, parent run records, clocks or host services are captured into source.
3. Substitute the donor node for the chosen recipient node, rewrite all references, and prune only nodes no longer contributing to outputs. The replaced recipient port disappears only when no surviving input node declares it. Preserve repeated graph ports and output order.
4. Require exact normalized complete type equality, including units, optionality, record fields and refinements. No new subtyping solver or unit conversion in ranch v1. A compatible mean result can still violate budget nonnegativity at run time; compatibility is not a universal semantic proof.
5. Protect every recipient action and its entire Boolean guard ancestor cone. Preserve action name, simulation `allowed`, guard wiring/params/types under renaming. A guard input shared with payload is still protected. Require action-free donor closure and global eager-choose/action validation on the final child. Never add guard exceptions to make a demo pass.
6. Require donor → surviving original recipient computation → declared output integration, with a recorded witness. A terminal-output swap or discarded donor refuses. Retain the current checks for task/body novelty, not merely renamed IDs or asserted parent hashes.
7. Validate the complete child, declaration references, port closure, source constructor/design and bounds before candidate identity. At most 64 nodes, 16 declared outputs, 16 ports per node, source 65,536 UTF-8 bytes including both quoted payload copies; retain 2 MiB candidate and 32 KiB derivation/64 node-origin bounds. Declaration metadata consumes the existing complete-source budget.

Merge is parallel reporting, not guaranteed causal integration. Label it that way. Preserve unlike types in separate report fields, validate any retained simulated actions and keep the combined output/report limit. Body is visual inheritance with unchanged executable declaration, not a new task. Reproduction, frame inspection, social time, preview and admission must continue producing zero task runs.

### Public declaration references and truthful ancestry

The current generic generated thought is insufficient once observations/goals/decisions/tasks are in source. For task-changing v1 recipes require an explicitly supplied complete `childThought` using the language report's six-array grammar. Preview first returns the mechanical node/port map needed to author it; a passive mapping request is described below. Every reference must resolve to the generated graph or to another declared record. Require task coverage and valid goal completion/output links under the common validator. Generated clauses may describe wiring; they cannot claim a parent observed, chose or completed new work.

Do not blindly copy a parent observation's input path onto a replaced port, retain an old goal completion under a changed computation, or concatenate identical evidence as independent support. The author may explicitly restate a declaration against the new source, with its basis still authored/testimony/open as appropriate. Runtime observations arrive through new bindings. Base declarations are copied exactly for body; if a base declaration cannot be represented unchanged, refuse rather than rewriting it silently.

An external derivation adds bounded `declarationOrigins` rows mapping each child declaration ID to `generated` or `{parent:0|1,parentDeclarationId,relation:'copied'|'adapted'}`. All source references and IDs must exist in pinned parents/child; `copied` requires equal fields after a fully specified reference remap, `adapted` is an authored attribution. At most 96 rows, included in the 32 KiB derivation cap. This map is construction provenance, not verification of statements. It must participate in derivation identity/receipt, while the complete `childThought` participates in construction identity and source bytes. Same DAG plus different public declaration is a different source.

Source `design.heredity.parents` remains an assertion of parent hashes. Fresh recovery can inspect that assertion without parent artifacts. Rebuilding a child from supplied parents can establish `replayed-construction`; it cannot establish that those residents met or that an admission happened. A host-owned retained admission receipt can establish `session-admission-recorded` within that host's storage trust boundary. Imported historical receipts remain `imported-assertion`. Display these evidence origins separately, never a universal “verified ancestry” badge. Multiple real admissions/derivations may produce one source; do not collapse their histories by artifact ID.

## 3. History, explicit outcomes and nursery

Use runtime/API's whole-session snapshot rather than a second ranch-specific persistence system. Save canonical sources/profile pins, source-carried declarations, optional companions, ordered construction/admission receipts, world snapshot/command replay window and source/input-bound run records. Save input snapshots and digests once with referenced evidence metadata; omit rendered frames, active clocks, transport subscriptions and capabilities. Adopt the shared byte/count caps and atomic host checkpoint protocol. Save/restore is a host operation; source cannot choose filesystem paths.

Fresh source/genome recovery restores executable source and authored declaration only. Bundle import adds asserted companion/construction material. A trusted host checkpoint can resume retained local state/receipts; untrusted snapshot import creates a fresh session with imported history classifications. Validate closure and pins before replacement. Required parent artifacts for retained local construction replay are included in a session snapshot, even if residents have retired. An external parent hash in source ancestry need not resolve to an artifact; mark it unresolved instead of rejecting source-only recovery. Dangling references in a claimed locally complete admission/run ledger do reject.

Use the runtime's shared schema for input digests, occurrence, ordered traces, failed node/diagnostics and simulated receipt publication. Keep every retained run accessible by record ID; the UI's most-recent view is a selection, not storage replacement. Show `not-run`, `run-succeeded` or `run-failed` alongside goal completion (`true`, `false`, unavailable) and any supplied outcome state (`confirmed`, `pending`, `unknown`, etc.). Successful evaluation is not completion of every goal. A simulation receipt cannot become confirmed City work. Replaying a saved display does not evaluate; rerunning uses an explicit button and supplied bindings, producing a new record under the session retry contract.

Nursery remains a placement/cooldown mechanism: child starts disabled, energy 40, matures in place after 200 explicit ticks. At tick `birth+199` it remains nursery; at `birth+200` it is an adult and still disabled. No automatic task run, parent capability inheritance or readiness certification. Keep operational task status independent of nursery age: “adult · not run” is valid, and “nursery · last run failed” is valid. Optional user-authored example fixtures may be run explicitly while in nursery; they neither accelerate age nor enable participation. Avoid a mandatory new certification workflow.

## Exact proposed public API implications

All additions belong to the versioned v1 surface; legacy types/tool schemas stay unchanged. Resolve SourcePin spelling with compatibility/API work before implementation. Here `SourcePin` means artifact/source digest plus profile/registry digest/canonicalization, and `ThoughtDeclarationV1` is the shared source grammar.

```ts
type ParentPinV1 = { source: SourcePin }; // exactly two ordered pins
type ConstructionV1 = {
  parents: [ParentPinV1, ParentPinV1];
  recipe: OffspringRecipe; nonce: number; style: ExistingBoundedStyle;
  origin: ExistingManualOrPairingOrigin;
  // required for compose/mate/merge; absent for body
  childThought?: ThoughtDeclarationV1;
  declarationOrigins?: DeclarationOrigin[];
};
type CompatibilityRequestV1 = {
  operation: 'offspringCompatibility';
  parents: [ParentPinV1, ParentPinV1]; recipe: OffspringRecipe;
};
type CompatibilityV1 = {
  status: 'compatible' | 'incompatible' | 'unavailable';
  parents: [ParentPinV1, ParentPinV1]; recipe: OffspringRecipe;
  nodeMap: NodeOrigin[]; portMap: PortOrigin[];
  requiredInputs: {name:string,type:TypeV1}[];
  protectedNodes: string[];
  seam: TypedSeam | null;
  diagnostics: Diagnostic[];
};
```

`offspringCompatibility` is the sole new ranch operation. It returns the deterministic graph/reference map and exact surviving ports for the selected recipe without task evaluation, body generation or stores. `compatible` means static checks pass; final source/body byte budget and authored child declaration still require preview. Maps use the same transformation as preview and are checked again there. No opaque compatibility tokens or stored previews. Conditional fields are strict discriminated schemas, not permissive optional-field bags.

Retain operation names `offspringPreview`, `offspringFrame`, `offspringAdmit`, `lineage`, `worldCreate`, `worldInspect`, `worldCommand` on the versioned surface. Preview/frame/admit take `ConstructionV1` instead of companion-dependent legacy input. Candidate identities bind profile/registry/construction policy and child thought; origin continues to affect derivation/admission identity rather than generated source. Frame/admit statelessly rebuild and compare candidate/source pins. Lineage gains the bounded declaration map and explicit evidence origin; keep flat paging. Runtime v1 `run` takes required source pin and exact named inputs; no ranch-specific execution opcode. Snapshot/restore/requestInspect use the shared Session host APIs, not extra MCP tools for large private snapshots.

Keep the raw world geometry, epochs, proposal/pair schemas and sequenced commands initially unchanged. Versioned Runtime derives its social source pins from admitted artifacts; stable source annotations cannot overwrite source thought or types. Companion-only notes need not invalidate a stable proposal, whereas legacy interpretation changes retain the existing epoch invalidation. Admission still requires current parent existence, two explicitly enabled adults, ordered proposal pins/epochs and one atomic receipt. Library construction requires both parent artifacts but no social participation; it is labeled manual construction, never a meadow birth.

MCP/A2A advertise the new closed schemas/results only in their explicit v1 mode. Compatibility/preview/frame/lineage/inspection are passive; run/admission/commands retain their mutation semantics. Unknown fields, profile mismatch, absent declaration references and free inputs refuse with bounded code/path diagnostics before mutation. Do not flatten `protected-guard` or `profile-mismatch` into an opaque generic rejection that prevents repair.

## Independent examples and measurable acceptance

The companion `ranch-fixtures.json` contains hand-derived expected suboutputs and lifecycle assertions, not test results or executable production v1 sources. Initial demonstration: Reservoir measurements → Waterkeeper budget. It proves causal two-parent computation and fresh bindings without domain-specific extensions. Second: filtered quantities → weighted mean, whose dynamic length failure demonstrates honest limits. Third: receipt reconciliation → checkpoint classification, entirely pure; it separates supplied confirmed units from predicted craft quantity. Fourth: route + schedule merge with separate output fields, labeled parallel report.

Acceptance must verify the following in Node, the packaged consumer and actual browser:

1. Same source/ports with two supplied snapshots gives exact independently expected outputs and different input digests; source/ID/harmonics/RGB remain identical, including three fresh constructor generations without bindings. Fresh child import and explicit run require no parent artifacts.
2. Missing/extra/wrong-unit/refinement input, mixed profile, impure donor, free port, protected guard/shared guard input, dangling declaration and over-budget child each refuse at the proper stage. Admission rejection leaves every artifact/derivation/record count, world revision, both parent energies and pending links unchanged.
3. Compatibility/preview/frame/import/inspect/advance/admit/maturation/display replay call zero task runners/host effects. Admission adds zero run records. Withdrawal and reenabling cannot revive a stale proposal. An exact admission request replay returns the old receipt without another child/charge.
4. Recover source in a fresh session: declaration retained, source ancestry asserted, lineage/run history absent. Replay construction: reproducible relation, historical admission absent. Trusted checkpoint resume: retained records/receipt replay intact. Imported fake receipt remains asserted; missing local ledger artifact/run references reject before active-session replacement.
5. Bounded save/restore rejects duplicate IDs, conflicting source pins, corrupt/deep/oversized data and incompatible registries before replacement. Crash injection around host checkpoint commit yields either complete old state or complete new state; run/admission acknowledgement loss is resolved by request lookup/replay, not a second mutation. World event-ring overflow increments `droppedEvents` without claiming complete social history.
6. Nursery 199/200 boundary, pause/hidden return and reduced-motion ceremony do not alter execution or admission. Both parents remain present; retiring one later keeps the artifact/receipt relation. An old record is visibly tied to its old input snapshot, never presented as current observation.
7. Keyboard/320px users can inspect a proposal, normalized seam, missing binding, rejection and explicit outcome without reading canvas colors. Preserve node→owned tissue inspection, persistent focus, reduced motion and receipt-pinned ceremony. Review sparse/dense/mobile screenshots; renderer improvements are useful only if they improve these tasks. Existing SwiftShader cadence is not evidence of hardware GPU performance.

## Three strongest ranch upgrades, in delivery order

1. **Explain a selected meeting and seam.** Add passive compatibility/reference mapping and a proposal inspector, separating social heuristic, static task compatibility and current admission eligibility. Acceptance: users can identify the exact unit/guard/reference refusal and repair the selected recipe without blind trial and error.
2. **Compose reusable source-backed tasks.** Carry typed ports and authored declarations through bounded closure/substitution, protect guards, retain causal witnesses and run only with explicit fresh bindings. Acceptance: two independent Reservoir→Waterkeeper snapshots yield the expected different budgets with identical child source/genomes.
3. **Retain evidence across sessions.** Use shared bounded Session snapshots and receipt/run history, truthful ancestry labels and explicit nursery/run statuses. Acceptance: a saved admitted child resumes with its source/input-bound record and replay receipt; source-only recovery and imported/reconstructed history show their narrower evidence honestly.

Defer autonomous task scheduling, chat rooms, reputation markets, genetic optimization, live City adapters, authenticated ancestry/signing and new social species mechanics. They are unnecessary to make this bounded v1 collaboration environment useful.
