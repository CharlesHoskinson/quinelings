# Workstream 8: the thought-to-lifeform website experience

## Product promise and main copy

Lead with the specimen, then make its meaning inspectable. The new experience should support new thoughts rather than make visitors infer that the ten curated examples are a universal English compiler.

Main title: **Give a thought a living form.**

Supporting copy: **Describe a task. See its interpretation, its program, and the creature that grows from it.**

Composer label: **What should this program do?**

Placeholder: **Exclude dormant rooftop planters, distribute 9 litres in request order, and report the grants and reserve.**

Primary action: **Shape this thought**

Persistent compact status after generation: **Ready to run · local task** or the applicable clarification/proposal state. Never say “Thinking…” merely because the portrait animates. Use “Interpreting your task…” only while an actual proposal request or parser operation is pending.

Three specimen modes: **Body**, **Program**, **Recorded result**. Body is the default and stays uncluttered. Program reveals owners/connections on selection; Recorded result selects an actual run and declared lens.

## Screen wireflow

```text
Thought composer + Midnight.city agent
              |
              v
Interpretation card ----------------> Needs one answer
  Goal / inputs / policy                    |
  Assumptions / missing capabilities <------+
              |
      explicit supported interpretation
              v
New specimen + short task summary
  Watch gesture        Run task
  Inspect translation  Choose body variant
              |
          actual recorded run
              v
Result panel + run identity + lens
  Replay recorded steps    Create verified copy
  Export / recover         Edit thought
```

Use one main specimen field beside a compact interpretation/result column on desktop. On mobile, show the specimen followed by the current card; advanced source, full trace and genome are collapsible below it. No graph labels across the resting portrait. Quiet outline highlights and a selected-owner callout are enough.

The interface has a visible state transition, not an execution disguised as an animated tour. The thought bubble can travel from the Midnight.city agent into an interpretation card and become a small program token; the token expands into anatomical material. This animation follows already validated translation data. It cannot invent a node mapping or continue to a ready state after failed compilation.

## Interpretation card

For the planter example:

**Your task**

Exclude dormant beds. Give active requests water in their existing order. Keep total grants within 9 L. Report grants and the remaining water.

**Policy** · Earlier requests receive water first; partial grants are allowed.

**Inputs** · 9 L available · 3 planter requests

**Execution** · Local calculation; no irrigation action.

Action: **Build this program**

Optional detail: **See the exact interpretation** exposes the typed intent and assumption provenance. Necessary semantic choices appear as short questions in this card. Do not require users to approve every field or decide aesthetic minutiae. If the thought already specifies the supported policy, build immediately and show the interpretation beside the result; do not add a redundant confirmation gate.

The existing `translation.js` has hard-coded descriptions for the ten authored examples and a four-stage explanatory animation. Retain that as an **Example walkthrough** and label it explicitly. Generated tasks need their own interpretation/source spans, graph IDs, anatomical owner mappings and provenance records. Do not substitute a matching example's prose for the user's actual intent.

## Transparent translation

The translation view contains three small connected cards:

- **Meaning:** the selected phrase or intent clause, its interpretation and any assumption.
- **Program:** the exact operation(s), ordered inputs and output from the compiled graph.
- **Body:** the operation-owned region and its declared anatomical rule.

Example selection:

**“Exclude dormant planters” → `filter(active = true)` → the eligibility-owned tissue.**

**“Never exceed 9 litres” → `allocate(water, eligible)` → allocation chamber.**

**“Report the reserve” → `get(remaining)` + `report` → reserve territory and named output.**

These are explicit mappings derived from the generated artifact, not inferred from proximity or visual crossings. If anatomy summarizes several nodes, list all owners and permit a precise graph view. A route input's street network and the task's operation DAG have distinct views; a routing organ is not a street intersection.

A short label should distinguish each mapping's provenance: **From your words**, **Your chosen policy**, or **Generated body rule**. Prefer plain text over badges everywhere. Mathematical equations appear only under “How this shape is drawn.”

## Four actions with distinct behavior

| Action | Meaning | What does not follow automatically |
| --- | --- | --- |
| **Build program** | Validates the supported interpretation and constructs source/anatomy | No task run, action receipt or child admission |
| **Watch gesture** | Starts/resumes the independent presentation clock | No interpretation, calculation or effects |
| **Run task** | Evaluates the bounded program and records result/trace/source emission | No ongoing execution because the creature keeps moving |
| **Create verified copy** | Uses an emitted source to build and verify a fresh instance; records actual lineage after successful checks | No unbounded reproduction or invented age |

“Create verified copy” is disabled until verified emitted source exists. Explain its verification plainly: **Creates a fresh instance and checks its source and local task result.** If verification evaluates the task again, record that execution; do not describe it as a purely visual birth. Real-world effects remain outside this local capability. Reproduction failures show the failed identity/validation result without adding a child.

Trace action: **Replay recorded steps**. Avoid the bare label “Step” where it could imply advancing execution. Show run and cycle identity beside replay position.

## Three concrete journeys

### Supported planter thought

1. User enters the fully specified thought from workstream 1. The compiler uses a supported recipe and shows the exact inputs/policy. If actual requests were not provided, ask for them rather than inventing real observations; offered example requests are explicitly “Sample data.”
2. The program is built. A new anatomical expression produces a quiet still specimen, with **Ready to run · no result yet**. The automatic bubble-to-body transition is a view of the mapping only.
3. User chooses **Watch gesture**; no receipt changes. User chooses **Run task**; actual output gives fern 4 L, sage 5 L, moss excluded, reserve 0 L.
4. Recorded result mode exposes **Water reserve · L · domain 0–9**, original value 0 and valid status. Zero is visible and correctly distinguished from missing.
5. User selects the allocation chamber and sees the actual `allocate` node and its inputs. They export the artifact or create a verified copy.

This review's current runnable artifact is `research/final-qdl-generation-example.cjs`; it is manually elaborated and uses an existing family. The planned interface must not present that as an implemented automatic thought compiler or compositional new-body engine.

### Ambiguous “share the water fairly”

Show **Choose what “fairly” means.**

Question: **Which allocation rule do you want?**

Choices: **Request order** · **Equal shares** · **Weighted shares**

Clarify each in one short sentence and show capability availability honestly. Current `allocate` implements request-order partial grants. Equal or weighted multi-request allocation needs a defined supported recipe or new kernel; it cannot be quietly relabeled FIFO. If unavailable, the choice leads to **This policy needs an allocation capability we have not added yet**, with a supported alternative rather than a fake successful compile.

Preserve the thought and proposed intent while asking. Additional questions appear only for missing necessary quantities/data. A beautiful concept specimen can remain visible with **Proposal · not executable**; it is not exported as a runnable program.

### Unsupported “Run forever and make agents everywhere”

Show **This needs capabilities outside the current language.**

Copy: **QDL programs use bounded runs and verified copies. This request needs persistent execution and unrestricted reproduction, which are not available here.**

Offer **Make a bounded demonstration** only with its concrete proposed limits visible: a finite task cycle count, local computation and explicitly requested copies. Do not silently convert the original request. Keep the original thought as an intent document with unmet obligations. No Run or Create verified copy buttons until a supported task is actually built.

## A beautiful first view and restrained individuality

The initial specimen appears at a canonical composed pose with readable attachments, role hue and negative space. Respect reduced motion: the translation appears as direct card changes, the creature remains still, and inspection works fully. Keyboard selection follows intent → graph → body in the same order; status announcements occur on meaningful transitions, not animation frames.

Offer three deterministic candidates after valid anatomy generation, each preserving the same program semantics. The controls are names such as **Compact**, **Open**, and **Flowing**, with a short visual description. Avoid a wall of 30 sliders. One advanced panel can expose authored **Body**, **Material**, and **Cadence** presets. Cosmetic candidates cannot change allocation policy or input values.

Selecting a candidate changes authored body source. Copy: **New body selected. The task is unchanged; its source identity has changed.** Keep earlier results available as **Previous source** and mark their lens association stale. Changing only zoom, selection, active lens or watch/pause leaves source identity untouched. A presentation speed control, if offered, must be clearly distinct from an authored cadence edit; prefer one of these rather than two confusing speed sliders.

## Results, source age and provenance

A result panel identifies **Run 1 · cycle 1 · current source**. Recorded result views always show the original quantity/unit and fixed scale, plus not-evaluated/invalid/stale/underflow/overflow states. No legend value is inferred from animation amplitude, brightness or apparent emotion.

Use **Verified generation** only for actual lineage; **Created in this session** only for actual artifact creation. Avoid ornamental age counters suggesting growth or history. A source edit produces a new identity; it does not inherit verified parentage unless the defined lineage process records it. A visual bud does not announce successful reproduction before admission verification.

Export contains a validated artifact/source, anatomy, intent contract/provenance when implemented, and optional explicitly selected run records. Buttons: **Download program**, **Download wave genome**, **Download RGB genome**. Share a validated artifact link or downloadable file; a URL preview must not auto-run imported code. Recovery verifies framing/canonical source and then shows a ready still specimen. Copy: **Program recovered. Run it to create a new result.** Screenshot sharing is a portrait, not a lossless source recovery channel.

## Static Pages and proposal transport

The production deployment is currently static GitHub Pages. Offer one honest baseline:

- **Examples:** authored gallery specimens and transparent example walkthroughs.
- **Create from supported recipe:** a finite recipe input form that genuinely builds a new graph/anatomy when implemented; free text can be matched only within documented parser capabilities.
- **Import program:** validates an artifact and renders a new instance without auto-execution.

An optional backend proposal transport can later accept thought documents and return proposed typed intent plus obligations and provenance. Keep it provider-neutral: request/response contract, request identity, cancellation, errors and returned-data validation. The server proposes; the local validator/compiler builds. A delayed or failed proposal request never substitutes an unrelated example creature and labels it generated.

Exact fallback copy: **Free-text interpretation is unavailable in this deployment. You can create from a supported task recipe or import a program.** Show that only when relevant, not as a permanent warning over the portrait.

## Acceptance

- All four principal actions have separate observable execution/source/lineage effects; watch, inspection, replay and lens changes never run tasks.
- Supported thought produces a new artifact rather than switching to a gallery example; policy assumptions and input origins remain inspectable.
- Ambiguous/unsupported journeys preserve the user's text, produce explicit obligations and never emit false success or child receipts.
- Intent clause selection highlights actual graph owners and anatomical regions; all mapped IDs resolve to the generated source.
- Mobile and reduced-motion users see a beautiful still and can complete build/run/inspect/export without animated transitions.
- Source edits invalidate current-result association; view edits do not. Record zero, missing, invalid and stale distinctly.
- Genome/source imports recover identity and show ready state without auto-running; corrupt imports retain the prior working specimen and display a concise error.

The creature remains the focus. Translation is a reveal the user can follow, not a technical diagram permanently covering its body.
