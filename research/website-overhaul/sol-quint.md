# Website laboratory state model

`spec/website-lab.qnt` models source identity, input identity, retained execution records, display status, execution count, phase, view, emitted source and reconstructed genotype separately. Source and input identities are opaque tokens from `{0,1,2}`. Returning to a token means returning to exactly the same abstract identity; these are not monotonically increasing revisions. The output function is a deliberately simple deterministic stand-in. The model does not prove canonicalization, hashing, actual kernel outputs, parsing, executable JavaScript or full browser refinement.

An explicit run creates an executed record keyed by source plus inputs and increments execution count once. Replay preserves that record and executes nothing. Input editing or building a different program changes identity and marks the retained record stale. Refusal keeps the last valid record but removes any claim that it represents a current successful request. Animation and view changes do not mutate identity or execute tasks. Verify emits the source identity; genotype reconstruction reconstructs that identity; neither executes a task. Imported records are assertions, even when their keys happen to match local identity.

The initial randomized check found that a matching imported record could be replayed into a verified status. Requiring executed provenance for verified replay fixes that mistake. A UI may display or animate an imported record, but must preserve its asserted provenance.

## Executable checks

Run from the repository root:

```sh
npm exec quint -- typecheck spec/website-lab.qnt
npm exec quint -- test spec/website-lab.qnt --max-samples=100 --backend=typescript
npm exec quint -- run spec/website-lab.qnt --invariant=safety --max-samples=1000 --max-steps=50 --seed=20261004 --backend=typescript --verbosity=1
```

Validated after reviewing `living-thoughts.js`: typecheck passes; all fourteen tests pass; 1,000 traces of up to 50 steps find no violation (seed `0x135288c`). This is bounded randomized exploration, not exhaustive model checking. Six negative controls deliberately inject hidden execution, stale-current display, imported-as-verified display, loss of history after comparison refusal, a hidden interpreter request, and a mixed old-after/new-baseline comparison; their corresponding invariants reject those transitions.

## Actual homepage compound actions

The model distinguishes `executions` (completed graph evaluations) from `evaluatorRequests` (calls to `QDLV1.execute`, including typed-binding refusals). The latter projects the homepage's `metrics.evaluationRequests`, displayed as **Interpreter requests**. A graph evaluation returning a failed diagnostic counts as an evaluation; a refusal during typed input validation counts only as an interpreter request. A separate pre-interpreter refusal action models SDK rejection before that second interpreter entry. The primitive `runTask`, `build`, `reconstruct`, and `importRecord` describe API boundaries; not all are separate homepage controls.

| Actual control | Model projection | Interpreter requests / graph evaluations |
| --- | --- | --- |
| Compare with valid bindings | `compare`: baseline record, then edited-input record | 2 / 2 |
| Compare with typed refusal, e.g. water `[-1]` | `compareRefused`: baseline evaluated privately; previous complete pair retained | 2 / 1 |
| Compare with pre-interpreter SDK refusal | `comparePreRefused`: baseline evaluated privately; previous complete pair retained | 1 / 1 |
| Malformed JSON before comparison | No transition into evaluation | 0 / 0 |
| Exact request replay | `replay`: preserve record identity | 0 / 0 |
| Verify source | `verify`: constructor emits source | 0 / 0 |
| Three generations | `generations`: three fresh sessions recover chained source/harmonic/color artifacts, each runs task | 3 / 3 |
| Source variant | `sourceVariant`: two authored artifacts each run with same readings | 2 / 2 |
| Retry policy | Same count projection as `sourceVariant` | 2 / 2 |
| Pose, motion, selected organ, runtime overlay | `animate` / `selectView` | 0 / 0 |

The first comparison test includes compare → replay → verify → generations → source variant and expects seven interpreter requests and seven graph evaluations while preserving the primary after record's serial identity. Successful compare → edit → typed refusal expects four total interpreter requests but three completed graph evaluations, with the original baseline and after record retained. The pre-interpreter refusal scenario instead expects three requests and three evaluations. Bare genotype reconstruction is passive; the **generations button explicitly adds three task runs after recovery**, so it must not be described as passive reconstruction alone.

`select()` resets the homepage comparison records when changing library recipe; the primitive `build` instead abstracts identity change with retained historical provenance. It is not a claim that the homepage retains records across recipe selection. The live homepage has no import control; imported assertions model the session/API boundary. `isCurrent()` checks the artifact ID and canonical bindings, while the refusal handler clears the replay request and explicitly renders a refused diagnostic plus previous output.

The source-variant example adds a clamp, changing the task graph from four to five nodes and adding ownership. Its anatomical component tree remains the same, although dimensions and ownership bands change. Compare anchors for shared operation node IDs at phase zero. Indexed area-weighted sampled points are not corresponding tissue when authored geometry changes. These geometric observations are implementation checks, not properties proved by this state model. The retry comparison uses two separately authored caps; its historical library fixture's independent reported budget remains a documented limitation rather than evidence that editing a runtime budget changes authored retry policy.

## Suggested browser correspondence

Use a spy on the interpreter entry and compare observed browser state after each interaction. This observes requests, including typed refusals; completed graph evaluations require separate receipt/result observation. Rendering instrumentation should observe calls without introducing its own calls.

| Model trace | Browser assertions |
| --- | --- |
| Run → edit input → refuse | One task execution; old output and trace remain available with their original input identity; status communicates stale/refused; current input is never presented as the producer of the old output. |
| Run → exact replay → animation → change view | One execution total; record ID, source, inputs, output and trace unchanged; phase/view change independently. |
| Run → edit program/build → verify → reconstruct | Program source identity changes; previous record is stale; verify returns emitted source with no additional task; genotype decoding produces a source artifact without task execution. |
| Import matching record | Zero executions; output/trace labeled imported or asserted; matching source alone never turns provenance into local verification. |
| Import → replay display | Zero executions; imported/asserted label remains. A verified replay action must refuse imported provenance. |
| Run → edit input → restore exact input → replay | No additional execution; exact canonical source/input pair must match the record before replay may claim correspondence. |

Runtime-value annotations should consume the retained record and its key; the source-anatomy view should consume program source. A stale runtime annotation must carry the original source/input provenance and visible stale status. Moving an annotation or playing an animation does not generate a new runtime value.

This model deliberately has no transport, network, biological-life or screenshot-decoding claims. Imported record integrity requires concrete schema/identity validation in the browser; an imported assertion is never proof of prior execution. Fixture agreement, exact emitted source and task execution are separate evidence checks, even when a website combines their presentation.

### Integration correction
The homepage now commits a comparison pair atomically. A typed refusal still enters the interpreter twice and completes one baseline graph evaluation, but retains both records of the previous displayed comparison. `refusalPairRetained` models this display boundary. Malformed JSON is refused before either call. Passive harmonic and RGB decode controls now implement the model’s zero-request reconstruction action.
