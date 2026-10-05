# Living Thoughts: QDL 1 task library

Ten reusable recipes for QDL 1. Each accepts supplied inputs and returns a local calculation or simulated action. The [language reference](QDL-V1.md) defines the types and execution rules; [qdl-v1-library.js](../qdl-v1-library.js) contains the recipes.

The library exports ten `{id,name,description,intent,fixtures}` records. `programs` is deeply frozen; `get(id)` returns detached data. Each intent contains named runtime ports, authored constants and a full six-array public declaration with observation references, a plan and task coverage. Where a goal is declared, its completion field is an explicitly exported Boolean result. Runtime observations never become source literals. All City-shaped snapshots are synthetic, supplied examples.

## Run a reusable recipe

From the repository root:

```js
const V = require('./qdl-v1.js');
const L = require('./qdl-v1-library.js');
const Q = require('./core.js');

const recipe = L.get('water-total');
const program = V.compile(recipe.intent);
const original = V.admit(program).source;

const first = V.execute(program, {readings: [1.5, 2, 0.5]});
const second = V.execute(program, {readings: []});
// first.occurrences[0].outputs: [{liters: 4, measurements: 3}]
// second.occurrences[0].outputs: [{liters: 0, measurements: 0}]
// Source and sourceHash agree; inputHash and outputs differ.

V.verifyQuine(program); // constructor only, no runtime readings required
const recovered = Q.decodeColors(Q.encodeColors(program));
V.admit(recovered);     // validates recovered executable source
```

Compile once and provide fresh named snapshots for each explicit invocation. Binding names must exactly match the recipe's runtime ports. Missing required data is a refusal. Absent domain data is an explicit empty collection or null in an optional field. Negative, fractional or duplicate values fail where the source schema declares the relevant refinement. No recipe accepts legacy literal overrides.

The SDK can consume the same detached intent through `new Session().compile(recipe.intent)` from `@quinelings/agent-sdk/v1`, then Run with `artifactId`, an immutable `requestId`, and `inputs`. The raw library data is a repository UMD/CommonJS module; this document does not claim a separate installed `agent-sdk/library` export.

## Ten programs

Numbers below are quantities with source-carried symbolic units. `Nat[u]` means nonnegative safe integer in unit u. Boolean freshness/current flags are explicitly supplied assertions; the language does not secretly obtain live state.

| ID | Runtime ports | Result and authored policy |
| --- | --- | --- |
| `gather-readiness` | checks, observedAt, now, maxAge | Six ordered Boolean checks and inclusive tick freshness gate one three-item local gather proposal; outputs receipt and ready |
| `craft-quote` | inventory, requested, freeCapacity | Fixed recipe uses two ore and one wood per batch, net two space; outputs requested/feasible/predicted consumption and fullRequest |
| `confirmed-checkpoints` | records, clock | Fresh observation support for both haul and arrival; outputs their evidence states and completed |
| `evidence-ledger` | records, claim, clock | Exact-claim observation/testimony/inference assessment with original used/skipped records and same-source conflicts |
| `route-preview` | streets, blocked, current | Ordered unweighted A→D BFS; outputs route, guarded local walking receipt and ready |
| `trade-preview` | offers, now, quantity, inventory, allowance | Fixed offer ID with inclusive expiry and exact quantity guards; outputs ready/quantity/predictedProceeds and ready |
| `needs-triage` | foods, hunger, current | Fresh edible food, restoration descending then item ID ascending; outputs guarded eating proposal and ready |
| `receipt-reconciliation` | receipts, policy | Preserve supplied partial confirmations and block retry advice for pending/unknown; outputs reconciliation ledger |
| `water-total` | readings | Nonnegative liter total and measurement count |
| `work-schedule` | jobs, deadline | Dependency schedule in ticks and inclusive deadline predicate; no workstation reservation or job completion |

### Gather readiness

`checks` is exactly six Booleans in this order: skill, route, reservation, capacity, owner permission, remaining uses. The source fixes this interpretation and length. `observedAt`, `now` and `maxAge` are Nat[tick]. Future observations and observations older than maxAge are unavailable; age equal to maxAge is fresh. Age calculation uses a safe minimum before nonnegative subtraction, so a future timestamp cannot underflow a Nat.

With all checks true, observedAt=10, now=12 and maxAge=2, ordered outputs are:

```json
[{"status":"simulated","action":"gather-proposal","payload":3},true]
```

A false reservation check, stale or future observation returns the same proposal label/payload with `status:"skipped"` and false. Missing observedAt refuses with missing-input. The receipt proposes three items; it does not reserve a source, gather a haul or increase inventory.

### Bounded craft quote

Inventory rows are exactly `{id:string,amount:Nat[item]}` with unique IDs. Requested is Nat[batch], freeCapacity Nat[space]. Authored material rates are 2 and 1 in item per batch; the net capacity rate is 2 space per batch. Selection of missing ore/wood uses a visible default amount zero. Feasible batches are the minimum of requested, floor(ore/2), floor(wood/1) and floor(capacity/2).

Ore7, wood8, requested4, capacity5 yields `{requested:4,feasible:2,oreUsed:4,woodUsed:2}` and fullRequest=false. Capacity100 instead gives feasible3, ore6, wood3. Missing ore gives zero feasibility. Zero requested with empty inventory and capacity0 gives zero quantities and fullRequest=true, meaning the empty requested quote is feasible. It does not claim any batch was crafted. Negative amounts and duplicate inventory IDs refuse.

This is a fixed two-material additive-capacity quote. It does not solve arbitrary stack packing, evaluate a mutable recipe catalog, check a live workstation or mutate inventory.

### Confirmed checkpoints

The source fixes two claims, `haul` and `arrival`, and permits only kind `observation`. Records and clock use the exact evidence schemas below. Each checkpoint completes only if its fresh eligible state is `supported`; completed is conjunction of both. Outputs retain the two states so false does not erase why a checkpoint failed.

At now12/maxAge2/minRevision1, observation support at tick10 for each claim gives `{haul:"supported",arrival:"supported"}` and true. Replacing haul with testimony or an observation at tick9 gives haul unknown and false. Adding a fresh contradictory haul observation gives haul conflict and false. Supplied source labels and confirmation claims remain caller assertions; neither a stored plan nor an action-proposal receipt is used as checkpoint evidence.

### Fresh evidence ledger

Evidence records are exactly:

```text
{id,source,claim,value,kind,observedAt,revision}
value: Boolean or explicit null
kind: observation | testimony | inference
observedAt: Nat[tick]; revision: Nat[revision]
clock: {now:Nat[tick],maxAge:Nat[tick],minRevision:Nat[revision]}
```

This recipe admits all three kinds while making them inspectable. It returns `{state,support,refute,sources,sourceConflicts,used,skipped}`. Identical same-source polarity counts once. One source supplying both polarities has support1/refute1/sources1 and appears once in sourceConflicts. Empty evidence is unknown with zero counts. A null value is skipped as unknown; stale values are skipped as stale. Tick age and revision boundaries are inclusive. The complete record is retained for every used/skipped entry.

Unlike the checkpoint recipe, testimony may contribute to this general ledger. That is an authored evidence policy, not proof that a testimony established a world event. Output identity includes the chosen claim and supplied clock through the run's binding digest.

### Reachable route preview

Street records have exactly A/B/C/D fields containing ordered string neighbor arrays. Blocked is a string array; current is Boolean. The authored route is A→D. For `{A:["C","B"],B:["D"],C:["D"],D:[]}`, the route is A,C,D at distance2 because BFS preserves neighbor order. Blocking D gives found=false/path[]/distance null. A stale snapshot (`current:false`) can still show the supplied map's route prediction, but its proposal is skipped and ready=false.

The local walking receipt carries the path; it does not prove movement or arrival. Routes minimize edge count, not weighted travel time or current terrain cost.

### Current offer quote

Offer rows are exactly `{id,price,expiry,available}` with unique IDs. Price is nonnegative N[crystal*item^-1], expiry Nat[tick], available Nat[item]. Quantity, inventory and allowance are Nat[item]; now is Nat[tick]. The source selects ID `offer`, uses an explicit zero/default record on absence, and requires found, now≤expiry, positive quantity, inventory≥quantity, stock≥quantity and allowance≥quantity.

Inventory5, price3, quantity2, allowance2, stock5 and now=expiry10 yields `{ready:true,quantity:2,predictedProceeds:6}` and true. Expiry passed, missing offer or allowance1 yields zero quoted quantity/proceeds and false. It quotes the requested exact quantity rather than silently dispatching a smaller allocation.

Crystals are a symbolic inventory quantity here. This recipe does not access wallets, spend funds, trade inventory or establish settlement. Confirmed outcomes belong in a separate receipt snapshot.

### Hunger and food triage

Food rows are exactly `{id,edible,fresh,restoration}` with unique IDs, Boolean edible/fresh and Nat[one] restoration. Hunger is Nat[one], current Boolean. The query requires edible=true/fresh=true and selects maximum restoration, breaking ties by ascending item ID.

Equal-restoration rows b then a choose a regardless of their input order. Hunger4/current=true produces a local `eat-proposal` receipt carrying a and ready=true. Hunger0, no food or stale needs produces skipped with empty-string payload and false. The source includes the visible no-match default; it is not invented food. No item is consumed and no hunger/health change is claimed.

### Partial result reconciliation

Receipt rows are exactly:

```text
{id,operation,attempt,sequence,status,units}
sequence: Nat[revision]; units: Nat[item]
status: confirmed | failed | pending | unknown
policy: {operation:string,requested:Nat[item],maxAttempts:Nat[count]}
```

The source refines maxAttempts to 1–8. It processes the supplied operation's complete history and returns state, confirmedUnits, the four attempt-status counts, attempts and mayRetry. Confirmed attempts contribute positive units once; others must contribute zero. Identical repeated acknowledgement IDs do not inflate units or attempts. Changed data under an ID, conflicting equal sequence or terminal regression produces a failed evaluation.

With requested4/maxAttempts4, three separate confirmed-one-item attempts and a failed fourth give exhausted/confirmedUnits3/confirmedAttempts3/failedAttempts1/attempts4/mayRetryfalse. An unknown attempt preserves prior confirmed units while state becomes unknown and mayRetryfalse. Pending is not confirmation. Empty history is ready/mayRetrytrue unless requested is zero. The recipe never resubmits a command; history completeness and genuine external confirmation remain adapter responsibilities.

### Water measurement total

Readings are an explicitly typed array of nonnegative N[L]. Readings1.5/2/0.5 yield `{liters:4,measurements:3}`; [] yields zero/zero; [2.25] yields 2.25/one. Negative readings refuse. Values are supplied measurements, not hidden sensors, converted mL or an accumulated persistent history.

### Bounded work schedule

Jobs are exact `{id,depends,duration}` records, duration Nat[tick], with a separate Nat[tick] deadline. Schedule computes parallel earliest starts in deterministic ready order. Jobs a(duration3), b(after a,duration2), c(independent,duration4) give starts0/3/0, ends3/5/4, order a/b/c and makespan5. Deadline5 accepts inclusively; deadline4 gives false. Empty jobs at deadline0 give an empty schedule/makespan0/true. A supplied dependency cycle fails evaluation.

`withinDeadline` describes the predicted schedule, not that any work occurred. Shared workstations need explicit serial dependencies; no implicit resource contention or reservation is modeled.

## Extending a recipe

Start from `get(id)` and author a new intent. Changing constants/policy, task or declaration intentionally changes source identity; changing only invocation data does not. Add exact input schemas, meaningful guards, full declaration references and independent fixtures before calling the result useful. Inferred shapes do not automatically preserve integer, enum or minimum refinements; declare those computed obligations where needed.

A new operation requires a closed signature, units, deterministic tie/empty/error policies, bounds and implementation tests, followed by a new reviewed registry pin. Do not hide unsupported capability in a label such as gather/craft/send. These ten recipes compose visible finite primitives and retain their local-simulation scope. The compatibility contract and completed release gates are in [QDL-V1](QDL-V1.md). Ranch composition and collaboration policies remain experimental even when a resulting task independently passes QDL 1 admission.

## Try the recipes

The [task examples](../laboratory.html#lab) let you edit inputs, compare results and inspect each operation. Try closing an unused road or adding unused inventory: the inputs change, but the answer may stay the same.

The [source editor examples](../laboratory.html#source-experiment) add a five-liter limit, set a retry cap and require food to restore a positive amount. Each rule creates a new source. The [child example](../laboratory.html#offspring-experiment) keeps the water calculation while inheriting a different body through `V1Ranch.preview` and `admit`.
