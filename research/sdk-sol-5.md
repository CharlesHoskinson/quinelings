# Agent SDK onboarding review — Sol 5

Scope: onboarding and executable examples only. The SDK is experimental; these recommendations do not freeze QDL or a public API version. Implementation authority remains `packages/agent-sdk/src/index.ts` and the protocol adapters. No production files are owned by this workstream.

## Recommended first experience

Teach one complete lifecycle before presenting all operations: supply a bounded thought, inspect its explicit interpretation, build its authored body, execute it, verify emitted source, recover its encoded source, and execute a fresh generation. A useful initial task is `[2,3,4] | square | sum | report total`, with independently known output `[{"total":29}]`. This exercises composition rather than a predefined whole-task specimen.

Keep the first example local and credential free. Installation should use this checkout until a registry release actually exists. Show Node's supported version and ESM imports; avoid an unverified `npm install @quinelings/agent-sdk` registry claim. Package build and SDK checks belong in the onboarding path.

The second example should demonstrate the intended agent boundary: a model or human supplies typed IntentIR, and the compiler validates ordered ports, types, units, refinements, reachability, and resource bounds. English wording is provenance rather than evidence that a task matches arbitrary natural language. A three-node typed plan adding supplied water quantities in `L` makes this distinction inspectable.

## Essential distinctions

| Artifact or operation | What the reader should learn |
| --- | --- |
| Thought parsing | Bounded local syntax can succeed, require clarification, identify inconsistency, or report an unsupported capability. |
| Typed intent | Explicit inputs, ordered dependencies, outputs, and quantity units are validated before construction. |
| Constructed artifact | Task, anatomy, and authored gesture become canonical executable source; companion intent and provenance remain separate. |
| Run record | A result belongs to the exact admitted source that ran. Rendering or recovery is not evidence of execution. |
| Source verification | Exact emitted-source equality establishes reproduction for that run, not correctness against arbitrary English. |
| Codec recovery | Numerical harmonic data and exact RGB bytes recover source; screenshots are not the codec. |
| Fresh generation | Reparse recovered/emitted source, validate, and explicitly run it again. |
| Protocol adapter | MCP and A2A expose the same local contract; transport access does not create external action authority. |

## Failure and effect examples

Document diagnostic fields at the point where a caller must branch. Use `make my city happy` for clarification, `monitor continuously and send email` for unsupported execution, and `[] | mean` for inconsistency. Never silently replace these requests with a gallery program.

Use a route example to demonstrate guards: `route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B"] | simulate "walk-route"`. Independently expected receipt: `status="simulated"`, `action="walk-route"`, `payload=["A","C","D"]`. Blocking both `B` and `C` produces a skipped receipt. These are local simulations; an eager `choose` cannot guard an already evaluated effect.

Recommend source and artifact exports together when preserving original thought matters. Source recovery alone cannot reconstruct the original English, typed units, or assumptions if they are only in the companion contract. Alternative authored body candidates preserve graph semantics but change source identity, so old run records must not be presented as current results.

## Acceptance of examples

Before handoff, read the actual SDK exports, execute every SDK example against a built checkout, and typecheck the typed intent example. Expected values must be asserted independently of the implementation. Record exact checks and limitations below after implementation becomes available.

Local evidence: `thought.js`, `anatomy.js`, `core.js`, `verify-thought.cjs`, `design/intent.schema.json`, `packages/agent-sdk/package.json`, and [thought-to-lifeform design](../docs/THOUGHT-TO-LIFEFORM.md). No external API or SDK claims were used in this review.

## Implemented onboarding and verification

[SDK quickstart](../docs/sdk-quickstart.md) now uses the actual stateful `Runtime` exports: `create`, `compile`, `inspect`, `run`, `reproduce`, `parse`, `recover`, `frame`, and `dispatch`. It documents all eight MCP tools, the `{result}` structured-content envelope, A2A CLI/discovery paths, typed-plan errors, and bounded store defaults. Adapter startup details were checked against `src/mcp.ts`, `src/mcp-cli.ts`, `src/a2a.ts`, and `src/a2a-cli.ts`.

Verification on 2026-10-04: package `npm run build` succeeded, including declaration emission. After final API updates, extracted all eight JavaScript/TypeScript fenced examples from the quickstart and executed them against the rebuilt SDK: all passed. Independently typechecked all three TypeScript examples (typed intent, typed error handling, and proposal hook) using strict TypeScript, `noUncheckedIndexedAccess`, and NodeNext module resolution: all passed. The arithmetic, guarded-route outcomes, and failure statuses were also checked directly against the compiler/runtime before SDK integration.

Final onboarding additions explain operation-specific `IntentStep` parameters, status-discriminated parse/create results, stable error-code handling, `metadata-conflict`, preserved first source maps, complete-source `contract.sourceBytes`, formatted JSON source normalization, and loss of companion metadata in a fresh recovery runtime. The provider example uses an explicit local interpreted fixture; it makes no claim to perform natural-language synthesis. It passes cancellation signals to the hook and explicitly runs the accepted artifact afterward.

The frame example uses the actual anatomy limits (4,000–24,000 samples, 2–4 crests). Two declaration-build errors in evolving peer implementation were reported to root and fixed by the implementation owner; this workstream changed only the two assigned Markdown files. Protocol behavior testing and complete SDK acceptance remain the integration owner's responsibility; this review does not claim a live external agent or deployment test.
