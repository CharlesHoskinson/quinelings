# Launch narrative — Living Thoughts

Status: launch copy for the current experimental Quinelings implementation, with a separate QDL v1 candidate announcement. Reviewed on 2026-10-04. This report does not declare a stable release or change production files.

## Launch story

Quinelings begin with a declared task: find a route, divide a resource pool, or decide whether supplied evidence supports a repair. That task becomes an executable program. Its operations and connections shape a luminous mathematical body you can inspect. Run the task deliberately, examine the recorded result, and reproduce the complete canonical source.

**Quinelings**  
**Living Thoughts**

“Thoughts” means explicit authored declarations supplied to the compiler. “Living” describes their animated mathematical form. The launch should let readers discover that relationship through a working task, its body, and its source.

The strongest first demonstration is Lanternkeeper. Show its supplied fault signals and inspection evidence, select the operations that determine whether repair is permitted, then run the local simulation. Its default fixture reports a fault score of 0.875, two supporting sources, and a simulated repair receipt. The interesting result is the connection between the decision, the visible program structure, and the source that constructs itself again. No lamp in the world has been repaired.

Follow with Wayfinder or Swarmwarden to show that this is a collection of useful computations with distinct bodies. End with source reproduction and genome recovery. Introduce the experimental Ranch after the reader understands a single program: it adds meetings, construction proposals, admitted offspring, and session lineage, with explicit task runs kept separate.

## Short announcement — ready for the experimental product

> Quinelings — Living Thoughts
>
> Give a declared task a mathematical body. Quinelings are small executable programs you can inspect, run deliberately, and reproduce from their complete canonical source. Explore ten local task examples, create bounded recipes, and preview program offspring in the experimental Ranch. Actions produce local simulated receipts.
>
> Start with the collection: inspect a task, follow its operations into the body, and run it to see the result.

Primary destination: [Collection](../../index.html). Secondary destinations: [Create](../../create.html), [Quinelings Ranch](../../ranch.html), and [Agent SDK](../../sdk.html). These are existing entry points; this assignment did not check hosted availability or publish changes.

## Longer overview — ready for the experimental product

> Quinelings — Living Thoughts
>
> A declared task can take a form you can explore. Quinelings turn explicit bounded recipes into executable programs with animated mathematical bodies. Their anatomy reflects program structure: select an operation to inspect its role and connections, then run the task deliberately and examine its recorded output.
>
> The collection includes ten programs for tasks such as finding routes around blocked streets, allocating limited resources, scheduling dependent jobs, and assessing evidence. Lanternkeeper combines supplied fault signals, supplied inspection reports with distinct source identifiers, and an explicit guard to decide whether to issue a simulated repair receipt. Memorybloom distinguishes supporting evidence, refutation, conflict, and missing evidence while avoiding duplicate-source inflation.
>
> Every Quineling constructs its complete canonical source through a constructor quine. Harmonic samples and exact RGB records provide two recoverable encodings of that source. The visible body shows structure; source recovery uses the underlying numerical or RGB data. Companion interpretations and session history have their own records and do not automatically return with source recovery.
>
> Create a supported recipe in the workspace, or use the Quinelings Agent SDK and its MCP and A2A adapters. A model can propose a plan through the supplied provider interface; the compiler checks that proposal before creating a program. The experimental Ranch lets you explore bounded social interactions, preview offspring, and admit a new program. Admission creates no task execution record. Run remains explicit.
>
> Quinelings and QDL are experimental. Current action receipts are local simulations. Living Thoughts names the relationship between declared intent, executable computation, and animated form.

## Concrete agent-task examples

The quoted tasks below are authored demonstration prompts, not statements collected from live agents. Library results come from checked-in fixtures and existing specialist verification reports; this copy assignment did not rerun the runtime suites.

| Demonstration prompt | Current implementation and visible result | Audience benefit |
| --- | --- | --- |
| “Find a route to the clinic around the blocked bridge.” | Wayfinder's default fixture returns `depot → arcade → library → square → clinic`, distance 4. It uses deterministic unweighted search over the supplied street graph. | Agent builders can inspect the routing computation and its finite result. The path does not establish current real-world access or travel time. |
| “Allocate these ten units in request order.” | Swarmwarden grants scouts 3, nursery 4, archive 2, leaving 1. Scarcity fixtures expose partial grants. | Teams can examine allocation order and resource conservation before considering any external integration. |
| “Do these reports support the cistern safety claim?” | Memorybloom's default fixture reports conflict: one supporting and one refuting source, with duplicate testimony counted once. | Researchers and agent builders can inspect provenance-aware aggregation. Evidence classification does not establish that the underlying reports are true. |
| “Prioritize the ready jobs and remove duplicate IDs.” | Threadsorter returns patch, review, and notes, ordered by descending priority with stable ties. | Developers get a small inspectable queue transformation to build, run, and reproduce. |
| “Assess this delivery retry log without exceeding its budget.” | Pulsekeeper consumes a finite supplied outcome log. An `unknown` entry stops processing with an uncertain outcome; the program sends no delivery. | Agent builders can explore uncertainty handling without treating missing confirmation as permission to repeat an action. |

For educators and artists, the same examples make dependency structure tangible: compare bodies, select operations, and examine how a task's structure affects anatomy. For language researchers, constructor reproduction and exact source encodings provide a concrete object to investigate. For collaboration explorers, the Ranch exposes program construction and session derivations; social affinity alone does not establish task compatibility or successful execution.

## QDL v1 candidate — separate announcement

Use this only as a research/candidate announcement while integration and acceptance gates remain open:

> Quinelings — Living Thoughts
>
> We are developing a QDL v1 candidate for bounded declared agent thoughts. The proposal brings structured observations, evidence, goals, decisions, plans, and tasks into the executable source, alongside typed supplied inputs and an explicit semantic profile. The existing experimental collection, creation workspace, Agent SDK, and Ranch remain the starting point. Stable release claims will follow implementation and acceptance evidence.

The announcement should not name proposed API methods, registry additions, input defaults, or reproduction policies as available features. The language, runtime, compatibility, and formal reports recommend different details in some of these areas; root must resolve them before final release copy.

## Launch claims and release gates

| Claim | Evidence available now | Requirement for stronger launch wording |
| --- | --- | --- |
| Ten useful local task examples | Ten program files, 53 fixtures in `library-verification.json`; the standard-library specialist reports rerunning all 53 successfully. | Keep synthetic inputs and simulated receipts explicit. No mission-success guarantee follows from fixture success. |
| Complete source reproduction and recovery | Existing constructor/codec behavior documented in README and the program contract; compatibility report records exact emission and both codec round trips. | Frozen legacy golden fixtures and stable-profile conformance before promising cross-version stable identity. Recoverable source excludes absent companion declarations and session history. |
| Typed SDK and adapters | Existing SDK and sixteen operations; runtime/API specialist reports 27 passing runtime/MCP/A2A tests. | Shared versioned request/result schemas, installed-package consumer checks, and resolved transport/authority boundaries before calling the proposed v1 API complete. |
| Structured source-carried thought and reusable runtime ports | Proposed by language, runtime, and compatibility reports. Existing probes show missing source-carried thought/units and unsupported SDK bindings. | Implement and freeze the source envelope, type/unit/input contract, registry identity, validator, and independent conformance fixtures. |
| More useful Ranch collaboration | Existing typed previews, keyed admission, reciprocal social commands, and session derivations. Ranch specialist records passing current baseline checks. | Revalidate declarations after construction and pass new UI/browser and lifecycle gates. Durable save/resume claims additionally require checkpoint and fault/replay evidence. |
| Formal evidence | Existing Lean/Quint work plus checked abstract ledger prototype and bounded exploration reported by the formal specialist. | Identify theorem/model scope and implementation correspondence explicitly. No evidence here supports “fully proved runtime,” “provably safe agent,” or guaranteed external action completion. |

A stable interpreter release can remain simulation-only. Persistence and live host adapters are separately scoped capabilities; neither is a prerequisite merely to freeze the interpreter, and neither may be implied by that freeze. If a host adapter is later added, its authority, acknowledgements, and retry behavior need their own evidence.

## Demo and distribution sequence

1. Lead the announcement with **Quinelings** and exact **Living Thoughts**, then the short explanation of declared tasks and mathematical bodies.
2. Link to one current library task. Show its supplied inputs, operation/body inspection, explicit Run, and local result.
3. Show complete source reproduction and recovery from exact genome data. Explain any demonstration control that executes a fresh copy: the collection's recovery controls verify by execution, while SDK recovery and Create recovery are passive.
4. Link to Create and the tested SDK quickstart for people who want to build. Keep experimental status visible at these entry points.
5. Present the Ranch as the next exploration: preview, admit, then explicitly run an offspring. An admission ceremony is evidence of local admission, not task success.
6. Publish candidate updates with a concrete gate status. Replace candidate language with stable release language only after the applicable acceptance evidence is recorded and reviewed.

This is a proposed communication sequence. No announcement was sent, deployment performed, credential accessed, or production file changed.

## Repository evidence

- [README](../../README.md), [program contract](../../docs/PROGRAM-CONTRACT.md), and [work plan](../../docs/QDL-V1-WORKPLAN.md): product boundaries and release obligations.
- [Collection](../../index.html), [Create](../../create.html), [Agent SDK](../../sdk.html), and [Ranch](../../ranch.html): present entry points and execution labels; [website copy review](brand-website.md) records differences among recovery controls.
- [Lanternkeeper](../../programs/lanternkeeper.json), [Wayfinder](../../programs/wayfinder.json), [Swarmwarden](../../programs/swarmwarden.json), [Memorybloom](../../programs/memorybloom.json), [Pulsekeeper](../../programs/pulsekeeper.json), [Threadsorter](../../programs/threadsorter.json), and [library verification](../../library-verification.json): demonstration results.
- [Positioning](brand-positioning.md), [language semantics](language-semantics.md), [runtime/API](runtime-api.md), [standard library](stdlib.md), [security](security.md), [compatibility](compatibility.md), [Ranch](ranch.md), and [formal acceptance](formal.md): present evidence and proposed gates.
- [City context](city-context.md) and [captured evidence](city-evidence.json): public domain requirements only. They establish no captured live agent thought, City integration, private reasoning access, or world authority. Launch copy makes no external factual claim requiring a new retrieval.
