# Swarmwarden

Swarmwarden is a local FIFO resource allocator with the coral animation family. Its nine-node graph consumes a nonnegative integer capacity and an ordered request list, allocates through the shared `allocate` kernel, and reports capacity, all grants, remaining resources, positive-demand requests receiving nothing, and whether capacity is depleted. Partial grants are visible in the allocation receipt. Zero-demand requests are excluded from the unstarted list.

Fairness means preserving the supplied queue order, including under scarcity. The caller must supply requests in arrival order. This is deliberately FIFO fairness, not equal-share or proportional fairness; later requests can remain unserved when earlier requests consume the pool. No persistent queue, replenishment, starvation prevention across runs, duplicate-ID normalization, or external resource mutation is claimed. All computation is finite and local. No kernel extensions are required.

## Validation

JSON parsing and graph checks passed: nine unique nodes, topologically ordered producer references, literal-only fixture overrides, and existing output IDs. Five exact expected fixtures cover sufficient resources, scarcity with a partial grant, zero resources, an empty queue, and zero-demand requests.

Expected grants were checked independently using prefix-demand arithmetic rather than the kernel's remaining-capacity loop:

`grant[i] = min(demand[i], max(0, capacity - sum(demand[0:i])))`.

For every fixture, independently reconstructed ordered output matched the stored expectation, each grant stayed within its demand, and total grants plus remaining capacity equaled initial capacity. Totals were respectively `(9,1)`, `(5,0)`, `(0,0)`, `(0,7)`, and `(0,0)` for `(granted,remaining)`.

The shared runtime is integrated by root; this independent check does not substitute for root's runtime/quine verification. No external research was needed: behavior derives from `docs/PROGRAM-CONTRACT.md` and basic bounded integer arithmetic. The family choice supplies animation morphology; allocation and report nodes supply the distinct useful computation.
