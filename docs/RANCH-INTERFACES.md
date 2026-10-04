# Experimental ranch implementation interfaces

Normative integration contract after the nine candidate audits, 2026-10-04. Read RANCH-CANDIDATE.md and RANCH-AUDIT-RESOLUTION.md. The language remains experimental. Implementations must not claim execution/formal/performance evidence until measured. Root integrates shared modules, source validation, Runtime, browser bundle, adapters and formal gates. Assigned workers edit only their listed files.

## Pure offspring module

UMD/CommonJS `offspring.js` exports global `QuinelingOffspring` and Node module. Dependencies are existing Q/T/A/D/K plus shared `ranch-crypto.js` (root supplies it). Export `POLICIES`, `TRAITS`, `validateInput(input)`, `intentHash(intentOrNull)`, `build(parents,input)`; no stores, clocks, callbacks, interpreter calls, action calculations or run records. Root provides detached parent artifacts with canonical complete constructor sources and optional companions. Revalidate independently; reject getters/cycles/unknown fields before property evaluation. Errors have code/message/path (existing schema/refinement errors may be wrapped).

Input:

```
{parents:[{artifactId,intentHash:string|null},{artifactId,intentHash:string|null}],
 recipe:{kind:'compose',donorOutput:string,recipientInput:string} |
        {kind:'mate',donorNode:string,replaceNode:string} |
        {kind:'merge'} | {kind:'body',base:0|1},
 nonce:uint32, style:{mutation:'none'|'gentle',traits?:completeSixTraits},
 origin:{kind:'manual'} |
        {kind:'pairing',worldId:string,proposalId:string,
         parentResidents:[string,string],epochs:[integer,integer]}}
```

Complete traits are six integer fields elongation/spread/curvature/gestureGain/tempo/pigmentGain in[-1000,1000]. Overrides require mutation:none. All records are recursively closed. `parents` and `parentResidents` are ordered roles. Null intent hash means absent, not unknown. Any supplied pin mismatch rejects. Task recipes require both exact graph-matching companions, normalized recomputed types, disjoint injective namespaces and <=64 child nodes. Both substitution recipes protect all original recipient actions and their transitive Boolean guard cones, require an integrated donor→recipient nonliteral→output witness, and reject action donor closures/eager action branches. Merge adds report labels a0.. then b0.. preserving nested types, at most16 combined outputs. Task recipes repeats1 with diagnostic; body preserves complete base task projection, repeats and compatible metadata, with separate body derivation description. Recovered source does not invent units/English/lineage.

`build` returns a detached Candidate:

```
{candidateId,derivationId,childSourceHash,
 child:{id,source,program,graph,design,intent?,contract?,sourceMap,harmonics,colors},
 changes:{sourceChanged,taskSyntaxChanged,bodyChanged},
 classification:string,diagnostics:Diagnostic[],lineage:Derivation}
```

Derivation is bounded <=32KiB, contains `id`, candidateId, childArtifactId, childSourceHash, ordered parent pins, complete construction input, policies, classification/changes, ordered `origins` rows `{nodeId,parent:0|1|'generated',parentNodeId?:string}` for every child node, trait draws/changes/legacy measurement labels, and seam when applicable `{donorNode,recipientNode,type,integrationNode}`. It contains no ancestor recursion, credentials, run records or fabricated thought spans. Child candidate <=2MiB. Refuse neither-task-nor-body novelty; source identity alone is insufficient. Body changes ignore asserted heredity, task/name spelling and mechanically renamed owner IDs.

Construction key is exactly `{domain:'quineling-ranch-construction-experimental',parents:[{sourceHash,intentHash},...],recipe,style,nonce,policies}` with sourceHash64 lowercase hex, ordered parents, and complete style. Source ID is ql_+SHA256(source). Candidate ID is qc_+SHA256(Q.canon(key)); seedDigest is SHA256('quineling-ranch-seed-experimental\n'+Q.canon(key)); Anatomy seed is first4 digest bytes big-endian. Derivation ID is qd_+SHA256(Q.canon({candidateId,childSourceHash,origin:input.origin})). Origin is excluded from source generation but included in derivation identity and admission payload; distinct social histories can produce the same complete source. World revision is an admission precondition. Policies are named experimental constants; no stable-language version claim.

Trait order is fixed as above. Named draw is SHA256(seedDigest+'\n'+label). First4bytes big-endian modulo3 choose A/B/floor-midpoint. Gentle mutation selects two distinct loci by modulo6 and then modulo5 among remaining sorted loci; signed deltas from named draws (even positive/odd negative) magnitude1+draw%80; saturate [-1000,1000], record actual deltas. Explicit overrides bypass draws/mutation. Legacy measurements follow candidate section3; they are approximation, not inverse/identity promises. Mutation:none means no additional trait perturbation, not identical child morphology.

Fresh Anatomy.generate(childGraph,seed) is the substrate for every recipe. Traits affect only resolved visual fields. Axial multiplier 1+.12*g; radial 1+.10*g; bendX offset .025*g; gesture strength .65+.10*g; phase .038+.007*g; pigment .85+.10*g. Clamp each existing accepted field domain; Math.round(x*1e6)/1e6 and -0 normalization are the explicit ECMAScript quantization policy. Never modify hinges, owners or task literals; root validates final QDL/source. Drop incompatible scalar lenses with diagnostics. Full source contains optional strict design.heredity `{model:'bounded-traits-experimental',parents:[hashA,hashB],seedDigest,nonce,traits}`. These are asserted parent hashes; external derivation/replay is separate. Expose saturation/legacy labels. Source task is independently executable, not an authenticated companion proof.

## Pure world module

UMD/CommonJS `ranch-world.js` global `QuinelingWorld`. Export `LIMITS`, `SPAWNS`, `CLEARINGS`, `create(config)`, `command(world,input,context)`, `admit(world,input,context)`, `annotate(world,artifactId,newIntentHash)`, `validate(world)`. All transitions return detached `{world,result}` without modifying input, and throw before returning on rejection. `create` returns world directly. No task evaluator or new artifacts. Context is detached data, never an external callback.

WorldCreate `{worldKey:string,seed:uint32,affinity?:'structural'|'neutral'}` normalizes absent affinity to structural and uses id qw_+SHA256(Q.canon(normalizedConfig)), with key1..64 characters. One world per Runtime. Same config returns same existing snapshot; different config rejects. World exposes `{id,worldKey,seed,affinity,tick,revision,nextResident, nextSequence,residents,pairs,proposals,events,droppedEvents,receipts}` with bounded fields. IDs are wr_<monotonic integer> scoped by world. Residents contain `id,artifactId,sourceHash,intentHash,epoch,enabled,energy,rest,nurseryUntil,readyAfterTick,x,y,heading,invitation,partner,pendingProposal` plus bounded structural role/gesture data for affinity. Pairs expose ordered residents, slots, immutable start/approach/attempt deadlines and dwell. Proposals expose id, ordered parentResidents, artifact/source/intent pins, epochs, createdTick, expiry. Events are informational ring256, not admission evidence. Receipts window256 bound command payload hashes and acknowledgements.

WorldCommand `{worldId,expectedRevision,sequence,command}` where command is one of:

```
{kind:'import',artifactId} | {kind:'retire',residentId} |
{kind:'participate',residentId,enabled:boolean} |
{kind:'invite',residentId,partnerId} | {kind:'cancelProposal',proposalId} |
{kind:'advance',ticks:1|2|3|4}
```

Context for import is `{artifact:{id,sourceHash,intentHash,roles:string[],gestureKind:string}}`; otherwise empty. Success returns `{worldId,revision,sequence,tick,residentId?,proposalId?,appliedTicks?}`. Every new successful mutation increments revision once; advance batch stages all requested ticks. Only exact nextSequence executes; matching old sequence/payload returns saved result before freshness checks; conflicting/stale-discarded/gap sequence rejects. Never wraps counters ceiling1e6. Failed transition leaves all state unchanged. No autonomous wall-clock work; explicit advance drives social invitations/reciprocity/movement. Import starts adult energy60 disabled. Child admission starts40, nursery200, disabled, no record.

Geometry: 512x320, fixed axis-aligned half-width24 guard, touching edges allowed; interiors overlap iff abs(dx)<48 AND abs(dy)<48. All guards inside inset24. Spawn/reservation/insertion/movement use this same predicate. Deterministic exported spawn list and four exported clearings with two guard-safe slots each; practical simultaneous pairing may be limited by free clearings although theoretical cap16 remains. Select first free spawn, accounting all residents and live reservations. Pair slots must fit, be disjoint, avoid other residents/reservations (explicit parent-owner exception), and be within160 eight-way unit moves (Chebyshev distance) for both parents. Swept axis-aligned union box must avoid all other old guards and accepted swept boxes; waiting leaves old valid guards. No obstruction/congestion fairness guarantee.

Social: invitations120; eligibility enabled adult energy>=60, no rest/cooldown/partner/pending. Step may generate deterministic affinity invitations; only reciprocal invitations in one common snapshot form disjoint pairs. Neutral mode may use distance only; heuristic never implies typed compatibility. Define the chosen bounded formula/ties in module docs/tests. Invitation timers end on pair creation. Pair approach deadline=start+160; immutable overall deadline=start+240; court80 consecutive arrived ticks (first current-arrival tick counts1); approach deadline ends on first arrival but overall never resets. Expiry before movement/dwell. Pair abort cooldown40 (saturating); unilateral invitation expiry cooldown20. Proposal creation releases partner/invitation/reservations, enters cooldown200 (saturating), sets both pending links, expiry600 (must fit); no birth. Pending blocks invitations, not recovery.

Energy each20ticks is staged for all residents from one pre-cleanup snapshot, then low-energy pair/proposal cleanup runs. Priority nursery/rest +4; paired -2; cooldown +2; adult roam/invite -1; clamp0..100. Below20 sets rest and cancels pair/proposal; >=60 clears rest. Withdrawal/removal cancels both sides, increments epoch; reenabling cannot revive proposals. Maturation at tick>=nurseryUntil stays in place and releases nursery flag. Step order increment→maturity→energy/rest→expiry→automatic invitations/reciprocity→reserved movement→dwell/proposal. No phase/render cadence in decisions. All deadlines/counters preflight; frozen ticks refuse advance but inspect/safe management remain possible within revision/epoch capacity.

Pure world `admit` input `{origin,target:{kind:'world',worldId,expectedRevision},childArtifactId}` and context `{artifact:{id,sourceHash,intentHash,roles,gestureKind}}`. Recheck exact live proposal, ordered resident/epoch/artifact/source/intent pins, enabled adult/no rest, >=50 energy, deadline, count/spawn/bytes. Consume proposal once, clear pending links, deduct30 each, set cooldown200, insert nursery child, increment revision once. Return `{worldId,revision,tick,residentId,parentResidents}`. Runtime adds durable-in-session derivation/request acknowledgement. No recipe is chosen at courtship; explicit admission binds complete construction input+candidate/source identities. Annotation updates all matching resident pins/epochs and cancels their pairs/proposals in one draft.

## Public Runtime/adapters

Add eight methods and dispatch operations:

- `offspringPreview(input)` → `{status:'ready',candidate}` or `{status:'rejected',diagnostics}` for valid request whose recipe is refused; malformed data throws typed invalid-input.
- `offspringFrame({input,candidateId,childSourceHash,phase,options?})` → `{candidateId,childSourceHash,frame:Frame}`; stateless rebuild, existing4000..24000 budget and2..4 crests. No hidden candidate store.
- `offspringAdmit({input,candidateId,childSourceHash,target,requestId})` → `{requestId,candidateId,derivationId,artifactId,childSourceHash,worldId?,residentId?,revision?,tick?}`; target library or world. Origin agrees target. Request key1..128 characters.
- `lineage({artifactId?,cursor?,limit?})` → `{derivations,nextCursor?}` flat append-order pages, limit1..32 default16, cursor session-local numeric append index. Known artifact with no derivations returns empty. No recursive ancestor fetch.
- `annotate({artifactId,intent})` → detached enriched Artifact after exact graph match; first/identical only, never overwrite.
- `worldCreate(config)` → World snapshot.
- `worldInspect(worldId)` → detached World snapshot.
- `worldCommand(input)` → small command acknowledgement.

Dispatch request fields are `{operation,input}` for preview, `{operation,...frame/admit fields}` for those two, `{operation,...lineage/annotate fields}` for those, `{operation,worldKey,seed,affinity?}`, `{operation,worldId}`, and `{operation,...worldCommand fields}`. Unknown fields reject recursively. Public types/schema/MCP/A2A agree; preserve original eight methods and text create.

Root Runtime refactors artifact admission into pure prepare/infallible commit, counts aggregate serialized artifacts <=32MiB including companions/genomes, and stages all ranch stores before commit. Derivations128/4MiB, successful admission receipts128 (no eviction), candidate2MiB, derivation32KiB/64origins, world1MiB, acknowledgement4KiB. Same admission key/payload returns original acknowledgement before rebuilding/freshness; conflict rejects. Successful new world admission increments revision exactly once. Every first companion attachment, including legacy compile after recovery, updates affected resident interpretation epochs and cancels their pairs/proposals before commit. Compound birth plus metadata enrichment commits one public world revision. Source-companion conflict preserves old metadata. No rejection may partly enrich an artifact. Synchronous commit is not cancellable midway or crash-durable.

## Website and rendering

ranch.html/ranch.js/ranch.css consume browser bundle exporting the same Runtime. Ten graph-diverse residents, accessible resident/node lists, nursery, inspector thought→program→owned tissue and lineages, actual preview/admission/explicit fresh Run plus source/genome export/recovery. Default participation/social/gesture switches off. Family demo uses public commands and actual admission, then receipt-pinned render ceremony; parents remain present, child appears at acknowledged placement. Deduplicate by derivationID. No animation callback commits or runs tasks. Ceremonies queue8 foreground1, skip/reduced motion/context loss settles to child; transition picking disabled but DOM inspection retained. Never invent recovered thought/units/verified ancestry.

Root adds Anatomy restLayout(compiled,{budget1000..4000}) exposing local positions/normals/owner/component and reserved coverage; pose() already supplies matrices. One shared WebGL2 scene performs component transforms on GPU, role materials/bounded alpha coverage/batched ridges, projected phase-independent guard fit. Global tissue32000; ridge cap separate; finite physical sprite/glow footprint, density weights and dense pixel-work checks. One tissue draw per visible resident in meadow; inspector is separately labeled detail. Uniform framebuffer scaling, DPR1.5 desktop/1mobile, <=2M pixels. Canvas fallback16MiB pixels: all32 may have one240px pose, at most8 animate with five additional bins each (72frames total); miss shows closest available, prewarm bounded, no synchronous herd redraw. State limitation is visible.

DOM text/visible focus/non-hue states, no autonomous focus, bounded polite command status without tick spam, reduced-motion cut, pause all view/social clocks, hidden return paused, 320px internal source scroll/word wrap, focused portrait>=120px, final contrast checks. Gesture clock is presentation-only independent of explicit world ticks; neither affects task execution. Review actual sparse/dense/mobile/grayscale/context-loss/screenshots and measure CPU/frame/GPU when available; bounds alone prove neither beauty nor performance.

## Measured integration notes

The first ten spawn positions frame four clearings; later imports use a deterministic 48-unit grid. Movement adds Manhattan distance after Chebyshev distance to avoid diagonal wandering on equal-distance routes. Tissue opacity uses a fixed reference density of 1000, not the selected rendering budget. Locked exposure checks at 1000/2000/4000 samples passed declared 20% integrated-luminance and 25% silhouette-area tolerances; these are measured approximations, not exact invariance. Chromium SwiftShader dense-scene cadence was below 24fps. Hardware GPU cadence is unverified; CPU command-submission timings are not presented-frame or GPU timings.
