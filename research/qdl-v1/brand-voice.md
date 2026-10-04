# Editorial voice and claim review — Living Thoughts

Branding specialist 5 · 2026-10-04 · Scoped research and copy recommendations. The exact tagline is **Living Thoughts**. This report describes the experimental checkout and marks candidate promises separately. It changes no production files.

Reviewed `AGENTS.md`, `docs/PROGRAM-CONTRACT.md`, `README.md`, `docs/QDL-V1-WORKPLAN.md`, the four entry pages, relevant runtime strings and recovery functions, and `docs/SDK-RANCH-GUIDE.md`. Read all four peer brand reports: `brand-positioning.md`, `brand-website.md`, `brand-developers.md` and `brand-launch.md`. Repository paths below are the supporting evidence. No external research, credentials, world commands, deployment or runtime tests were needed for this editorial assignment.

## Voice

Quinelings should sound curious, clear and grounded in something the reader can try. Let the creatures supply the wonder. Explain the operation and its observable result in ordinary language. A body can shimmer, a resident can meet a neighbor, and a child can join a family. A result panel should say which task ran and what it returned.

Use **Quinelings** for the product, **Quineling** for one program, **Quinelings Ranch** on first mention, and **Quinelings Agent SDK** for developer introductions. Keep **Living Thoughts** exactly; never expand it to “Living AI Thoughts” or use it as a package or language name. Use the actual identifiers in code examples.

Recommended introductory copy:

> Quinelings
> Living Thoughts
>
> Give a declared task a mathematical body. Explore its program, run the task, and recover its complete executable source.

Place this definition nearby:

> A thought here is an explicit task recipe or typed plan supplied by a person or agent. Its operations shape an animated mathematical lifeform.

“Living” refers to animated form and the creative experience of reproduction and family. “Thought” refers to what was declared. Neither term establishes consciousness, biological life or access to an agent’s private reasoning. Explain this once near the introduction and in the relevant FAQ; keep ordinary task screens focused on their actual operations.

Prefer direct sentences over repeated three-part slogans. “Inspect the allocation operation to see how the budget is divided” is more useful than “Discover. Connect. Evolve.” Use one concrete example before discussing general possibilities. Avoid “revolutionary,” “seamless,” “intelligent life,” “unlock potential,” and guarantees of usefulness or correctness. Use “experimental” where readers choose Create, Ranch or SDK, and **QDL v1 candidate** for work whose release gates remain open.

## Ready-to-apply glossary

The middle column can be used as help text. The final column is the editorial boundary and evidence for reviewers.

| Term | Reader-facing definition | Boundary and repository evidence |
| --- | --- | --- |
| Thought | An explicit task recipe or typed plan supplied by a person or agent. | Current Create handles supported bounded recipes and typed IntentIR; broader interpretation needs a configured proposer and compiler validation. Original wording can live in a companion artifact. Do not imply hidden reasoning extraction. `README.md`, `create.html`, `thought.js`. |
| Program | A bounded executable task, with operations and explicit connections between them. | Quinelings also carry the constructor and authored design. The task is a finite DAG; eager `choose` selects computed values and does not suppress branch execution. `docs/PROGRAM-CONTRACT.md`, `README.md`. |
| Lifeform | A mathematical body shaped by a program’s structure and authored design. | “Creature” and “lifeform” are creative descriptions. The visible silhouette is a projection; similar bodies can represent different source. `index.html` FAQ, `docs/PROGRAM-CONTRACT.md`. |
| Source | The complete canonical executable description of a Quineling, including its task and authored body design. | Distinguish executable source from original prose, companion interpretation, run records and Ranch history. “Complete” qualifies the executable source. `README.md`, `create.html` source section. |
| Genome | Encoded data from which the complete executable source can be recovered. | Specify harmonic samples or exact RGB records. Organ colors and screenshots are not the source genome. A genome does not automatically restore original wording, units in external companions, trusted ancestry or run history. `README.md`, `docs/SDK-RANCH-GUIDE.md`. |
| Meeting | A local Ranch interaction between participating residents. | Social commands and reciprocal proposals are separate from computation. Proximity or affinity does not establish typed compatibility, understanding or successful collaboration. `docs/SDK-RANCH-GUIDE.md`, `ranch.js`. |
| Mating | Constructing a proposed child by replacing a selected operation in one parent with a pure operation slice from another. | Keep `mate` as the API recipe; “Exchange operation slice” is clearer in a selector. Compiler checks protect actions and guards and require integration. This is construction, not sexual or biological reproduction and not proof of a better task. `offspring.js:assembleTask`, `docs/SDK-RANCH-GUIDE.md` four recipes. |
| Merging | Constructing a proposed child that retains both parents’ task graphs and reports their outputs together. | Keep `merge` as the API recipe; “Combine both tasks” is suitable UI copy. Outputs retain separate fields; units are not converted or averaged. Preview does not run either graph. `offspring.js:assembleTask`, `docs/SDK-RANCH-GUIDE.md` four recipes. |
| Offspring | A new program constructed from selected parent programs and a recipe. | A preview is a candidate; admission records the child. Library admission and Ranch nursery admission have different destinations. Children can vary only in body. Structural novelty does not establish changed results or task success. `offspring.js:build`, `docs/SDK-RANCH-GUIDE.md`. |
| Action | A guarded operation that currently produces a local simulated or skipped action record. | `params.allowed` and the Boolean guard determine simulation; neither grants authority over an external service. No live City action is established. `kernels.js` action case, `docs/PROGRAM-CONTRACT.md`. |
| Receipt | A record of a particular operation and its reported outcome. | Always name the kind: simulated action receipt, admission receipt or world-command receipt. A retained command acknowledgement does not prove external work. An action receipt does not prove a repair occurred. `kernels.js`, `README.md`, `docs/SDK-RANCH-GUIDE.md`. |

Useful supporting terms:

| Term | Reader-facing definition | Use rule |
| --- | --- | --- |
| Constructor quine | A program that constructs its own complete canonical source. | Source identity is the claim; memory continuity and autonomous replication are not implied. |
| Compose | Connect a compatible declared output from one parent to an input in another. | Current recipe replaces a recipient literal with the donor’s pure predecessor closure; no cached parent result supplies the value. |
| Body variation | Give a selected parent’s task a new mathematical body. | Retains the task and repeat count. Do not announce a new computation unless the classification says the task changed. |
| Reproduce | Run a fresh copy and verify its source against the parent record. | Current collection and SDK reproduction execute. Label controls accordingly; stronger result matching belongs to the checks that establish it. |
| Recover | Reconstruct and validate executable source from encoded data. | Recovery as a concept is passive, but the collection’s recovery controls also execute for verification. Disclose that extra behavior. |
| Lineage | Parent references and available records of a program’s construction. | Source parent hashes are ancestry assertions. Session derivations provide separate construction evidence; neither authenticates historical authorship or consent. |
| Nursery | The Ranch state for a newly admitted child before it becomes eligible for meetings. | Nursery time is social eligibility, not learning, execution or demonstrated usefulness. |

## Verbs, stages and outcomes

Use **declare** for a thought, **propose** for an interpretation, **validate** for compiler checks, **build** for a program, **inspect** for its structure, **run** for task execution, and **record** for the resulting evidence. Use **preview** before offspring admission, **save to library** for library admission and **welcome to nursery** for Ranch admission.

The Ranch narrative is invitation → meeting → proposal → preview → admission. Any child Run is a further explicit operation. Do not compress the sequence into “They met and created a useful child” when only a proposal exists. A meeting can be interesting without producing an offspring.

Maintain these distinctions in statuses:

| Observed state | Ready text | Editorial requirement |
| --- | --- | --- |
| Built, unrun | Ready to run. No task result recorded. | Animation and inspection cannot earn “completed.” |
| Preview ready | Offspring preview ready. Task not run. | A candidate is not an admitted resident. |
| Library admission acknowledged | Offspring saved to the library. | Do not announce nursery membership. |
| Ranch admission acknowledged | Offspring welcomed to the nursery. Task not run. | Birth means admission here. |
| Actual successful local Run | Task completed locally. Result recorded. | Keep domain output visible; completion alone does not mean a goal was met. |
| Action status `simulated` | Simulated action recorded: {action}. | No completed external action claim. |
| Action status `skipped` | Action simulation skipped: {action}. | Add a reason only when actually available; the receipt alone does not distinguish a false guard from disallowed simulation. |
| Missing result | No recorded result available. | Missing is not zero, false, failed or evidence unknown. |
| Evaluated evidence `unknown` | Evidence is unresolved for {claim}. | Use only for an actual evidence result, with supplied provenance. |
| Retry result `uncertain` | Outcome unknown. This retry sequence stopped. | The kernel evaluates supplied outcomes; it is not live network retry or reconciliation. |
| Actual task failure | Task failed: {diagnostic}. | Preserve the field/node detail that helps correction. |
| Source edited | Program changed. Run again to record a result for this source. | Previous results cannot be presented as current. |

## Concrete copy corrections

These recommendations refine the existing website report and current copy. Keep existing IDs, recipe enums, diagnostics and behavior when applying them. Dynamic JavaScript strings must receive the same correction as initial HTML.

| Location and current wording | Recommended replacement | Why |
| --- | --- | --- |
| `index.html` translation eyebrow: “FROM MIDNIGHT.CITY TO A MATHEMATICAL BODY” | DECLARED TASK → PROGRAM → BODY | The public artwork illustrates an authored local task; the prototype does not capture a live City agent’s thought. |
| `index.html` agent scene / provenance | Character art from Midnight.city. Task authored for this local simulation. | Retain actual asset provenance links. Attribution and capability are different claims. |
| `index.html #birth`: “Reproduce” | Reproduce + run | `gallery.js:reproduce` executes the fresh instance. Adjacent prose should state the source/result checks. |
| `index.html #recover`: “Recover from wave samples”; `#recover-color`: “Recover from RGB records” | Recover + verify wave source; Recover + verify RGB source | Add help: “These collection checks also run the recovered program.” `gallery.js:recover` calls `Q.execute`. |
| `create.html #copy`: “Create verified copy” | Create verified copy + run | Current copy creation executes a fresh instance. |
| `create.html` passive recovery controls | Recover and check wave source; Recover and check RGB source | Add help: “Recovery checks source identity without running the task.” `creation.js:recover` validates identity and the program without task evaluation. |
| `index.html` FAQ: “Are they alive or thinking?” | What does Living Thoughts mean? | Answer: “Living Thoughts describes explicit tasks taking animated mathematical form. A Quineling’s program can construct its complete source again. The thought shown here is declared by an author or agent; it does not expose private reasoning.” |
| `ranch.js:familyDemo`: “through the real world protocol” | Inviting Reservoir and Waterkeeper to meet in this local Ranch… | “Real world” is readily read as external activity. Local world commands do not establish that. |
| `ranch.js:familyDemo`: “actual courtship” or “useful family” framing | Meeting in progress… / Offspring admitted. Run its task to inspect the result. | Use at the appropriate event. Construction and sociability do not demonstrate utility. |
| Ranch recipe selector: “Mate” / “Merge” | Exchange operation slice / Combine both tasks | Keep `mate` and `merge` in the underlying values and developer reference. |
| `sdk.html`: “Every Run produces a source-bound record.” | A successful Run records its result against this source. | Avoid suggesting failed calls always produce a successful retained record. |
| `sdk.html`: “recovered source alone does not restore thought” | Recovered source alone does not restore original wording, companion interpretation or recorded history. | The recovered program still represents the declared executable task. Name the missing artifacts instead of implying that all task meaning was lost. |
| Any hero or README introduction: unrestricted “Turn thoughts into programs” | Turn explicit task recipes or typed plans into programs with mathematical bodies. | Define the supported declaration boundary before offering broader interpretation. |
| Any action message: “Lamp repaired” / “Funds sent” | Simulated repair action recorded / Simulated transfer action recorded | Use the actual action name and output; current receipts are local simulations. |

The README already explains simulation, hidden reasoning and screenshot limits accurately. Keep those specifics. Its opening can adopt the introductory copy above without replacing the technical account of constructor source and codecs. Do not relabel scenario edits as reusable run inputs: current collection scenarios change source-encoded literal values.

## Claim review and release gates

The four peer branding reports support the same boundaries. Accept their declared-task framing, mathematical lifeform metaphor, explicit execution, recoverable executable source and experimental Ranch/SDK positioning. The website report correctly distinguishes executable collection recovery from passive Create/SDK recovery; preserve this during integration. The developer report correctly keeps current source-authored inputs separate from proposed runtime bindings and identifies its focused local verification. The launch report correctly separates an experimental announcement from the candidate announcement and labels example prompts as authored demonstrations.

One launch correction: replace “independent inspection reports” in the longer overview with “supplied inspection reports with distinct source identifiers.” The reducer deduplicates declared source identifiers; it does not authenticate independent observers. Keep the developer report’s note that successful compiler validation establishes admissibility. For the positioning report’s “source can make itself again” line, retain the nearby constructor explanation and explicit Run disclosure. These edits preserve the metaphor while tying the claims to the observed mechanism.

Apply these qualifications to both reports and later launch/developer copy:

- “Useful programs” is supported by concrete library tasks and their fixtures. For arbitrary interpretations or offspring use “program,” then show the task and result. Validation checks admissibility, not success at every intended purpose.
- “Recover the complete source” is supported by the exact codecs and identity checks. “Recover the complete thought” requires specifying source-carried declarations versus external prose/companions; “restore the whole life” requires separate session restoration evidence.
- “Verified lineage” must identify what was verified. Source hashes alone are assertions. Replayed construction establishes construction correspondence, not historical consent or identity.
- “Provable,” “safe,” “correct” and “formally verified” require a named theorem/model/test and its scope. Lean lemmas, bounded Quint exploration and JavaScript/browser tests do not collectively prove arbitrary English meaning or every host action. Use `docs/GENERATIVE-FORMAL-MODEL.md` for the evidence boundary.
- “Autonomous evolution,” learning, emergent intelligence and improved offspring need independent evidence. Current novelty classification concerns task syntax or resolved body, not task quality. Nursery time does not train a task.
- “Connects to Midnight.city” needs an implemented, authorized host integration and independently scoped acknowledgements. Public context, artwork, adapters and simulated receipts do not supply it.
- Structured source-carried declarations, reusable runtime bindings, durable session restoration and stable QDL v1 belong to candidate language until implementation, compatibility and acceptance gates pass. `docs/QDL-V1-WORKPLAN.md` is an active work plan, not evidence of a release.

For each consequential sentence, the reviewer should be able to identify the object, event, evidence and scope: which program; which build, Run or admission; which source comparison, result or receipt; which local runtime, session or external host. If any is missing, narrow the sentence to the observed event. Keep hashes and low-level records in inspection details while the primary message names the outcome plainly.

## Integration acceptance

1. Keep the exact **Living Thoughts** lockup and define declared task near first use.
2. Check static text and dynamic statuses together across Collection, Create, Ranch, SDK and README.
3. Label every control that executes, including fresh-copy and collection recovery checks.
4. Separate source identity, task output, simulated action, construction evidence and social state.
5. Keep original wording/companion history and current run data outside source-recovery promises unless the actual source carries them.
6. Preserve actionable diagnostics and word labels alongside color/icon states.
7. Recheck candidate claims against root’s final implementation and release evidence before publication.

Validation for this report was repository inspection and cross-review of all four peer brand reports. No runtime behavior was changed or independently retested.
