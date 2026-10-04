# Pulsekeeper

Pulsekeeper computes a bounded delivery decision from a simulated outcome log. Its torus skin is selected through the shared renderer; the useful computation lives in the graph, independently of animation.

The `retry` kernel consumes at most four observations. `ok` completes the task; `unknown` stops consumption immediately and routes to receipt reconciliation. Four `retry` observations exhaust the budget even if a later observation says `ok`. A completed result alone permits a local simulated `record-confirmed-delivery` receipt. The report exposes consumed history, attempts, remaining budget, next step, and that receipt.

Five exact fixtures cover transient failure recovery, uncertainty with an unread later success, exhaustion with an unread fifth-attempt success, an empty log, and success exactly at the four-attempt boundary. Expected results were independently calculated with an offline reference loop and compared structurally against every expected output. The empty-log case follows the contract's `exhausted` result while retaining all four unused attempt slots; exhausted therefore means the kernel could not complete, not necessarily that all slots were spent.

The source of semantics is the local `docs/PROGRAM-CONTRACT.md`; no external research or live action was needed. This is a deterministic policy simulator: it does not perform network delivery, measure backoff time, resolve unknown outcomes, ensure remote idempotency, or infer missing observations. The default four-attempt limit is duplicated in the retry parameter and the budget literal because the shared retry kernel takes a static parameter. Fixtures override only `outcomes`; changing the retry policy requires updating both limit locations together.

Root integration still must validate shared-kernel execution, quine generations, and rendered animation. No runtime or gallery files were changed by this author.
