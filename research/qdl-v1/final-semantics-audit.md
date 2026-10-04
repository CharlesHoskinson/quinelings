# Final independent semantics audit — QDL v1 candidate

Audit date: 2026-10-04; independent test runtime: Node v26.10.0. Scope: the candidate interpreter, typed graph/type/value admission, content-addressed registry, passive legacy migration, SDK Session and shared schemas, MCP/A2A adapters, and frozen source/genome/semantic fixtures. This is implementation evidence for a bounded production candidate, not a declaration of a stable release or a proof of JavaScript. No production code or frozen fixture was edited by this audit.

## Findings and disposition

1. **Raw core execution originally read hostile source before admission. Fixed by root and independently verified.** An enumerable getter on the quoted payload's `format` ran once during profile selection before the strict value checker rejected it. A cyclic `['quote', self]` caused an unstructured `RangeError`. `core.execute` now checks inert own descriptors across both duplicated constructor copies, uses a bounded traversal, refuses unsafe options before reading bindings, and admits stable sources even in `constructionOnly` mode. Regression expectations are zero getter calls and structured `json`/path failures, including when only the second copy is malformed.
2. **Raw description had the same boundary gap. Fixed by root and independently verified.** Before the fix, `core.describe` invoked the payload getter and successfully returned a description; a cyclic quote overflowed the stack. It now performs inert validation and stable admission before cloning or traversing the graph. Both copies, cycle refusal, and zero getter calls are covered independently. The scanner permits ordinary cross-realm JSON for legacy constructor compatibility; stable admission still enforces native own-realm values. This is descriptor validation, not a sandbox against same-process hostile Proxy reflection traps. This matters to a uniform public API. Ordinary parsed JSON browser sources were not accessor objects.
3. **Migration accepted hidden top-level request properties. Fixed by root and independently verified.** Given an otherwise valid migration request, `Object.defineProperty(request,'unexpected',{value:1,enumerable:false})` was accepted; making the required `source` non-enumerable also succeeded. The descriptor check admitted own data properties without checking enumerability. Reconstructing `rest` erased that evidence, while `closed(input)` ignored hidden extras through `Object.keys`. The conversion was passive and did not execute getters or tasks, but this contradicted the candidate's exact closed inert-JSON request boundary. Original top-level descriptor admission now requires enumerability, including `source`; both hidden-property regressions pass.

All three issues were concrete stable admission blockers and now have passing independent regressions. A pin generated before these implementation fixes must not be presented as the final stable interpreter pin. Freeze/review the new manifest and conformance identities only after the fixes and acceptance runs, preserving the previous candidate fixture set as historical evidence.

## Independent acceptance probes

Run from `packages/agent-sdk`:

```sh
node_modules/.bin/tsx --test test/v1-audit.test.ts
```

The suite uses hand-derived expectations rather than candidate-generated output or revised goldens:

| Probe | Independent acceptance expectation |
| --- | --- |
| Raw source dispatch and description | Both constructor copies checked; accessors never invoked; cycles rejected with code/path; construction-only still requires exact admitted source. |
| Exact identity | Leading whitespace, duplicate textual JSON keys, one changed quoted copy, and a foreign registry digest refuse. No execution record created by refusal. |
| Keyed replay | Record field insertion order is irrelevant; changing any complete request field conflicts; replay returns the same retained record without another record. |
| Occurrence atomicity | An earlier simulated action followed by `mean([])` leaves a failed trace containing the staged proposal, but no published outputs/effects; later repeats stop. `[2,4]` produces mean `3` and one proposal in each of three successful occurrences. Constructor emission survives failure. |
| Evidence | Age 10 with maxAge 10 and revision equal to minRevision qualify. Repeated reports from one source count once; contradiction gives support 1/refute 1/sources 1. Unknown value takes precedence over future timestamp; claim mismatch takes precedence over time. Stale and low revision remain separately identified. |
| Receipt reconciliation | Reordering full history or delivering an identical acknowledgement twice does not alter confirmed units. Earlier pending followed by confirmed counts once. Unknown stops retry advice even with requested units already met, or requested=0. Input hashes still distinguish different invocation histories. |
| Receipt contradictions | Reused ID with changed units, unlike reports at equal sequence, and terminal regression all yield a retained `receipt-conflict` failure with no effects; exact retry replays it. |
| Boundary values | Exactly 65,536 UTF8 bytes passes; 65,537 refuses. 8,192 astral Unicode characters fit the 16,384 UTF16 limit; one more refuses. Array length 512 passes, 513 and sparse arrays refuse. MAX_SAFE_INTEGER passes integer=true; its successor refuses. |
| Run size | A 62-node authored graph repeatedly propagating a 16,384-character runtime string eventually produces a bounded `limit` diagnostic. The failed occurrence has no outputs/effects; the complete semantic run stays within 2 MiB. Fresh reproduction matches it exactly. Earlier successful occurrences remain. |
| Passive migration | Full declarations and every node type remain authored; conversion runs no task, changes identity explicitly, preserves old source/genome, and only a separately recovered + run artifact evaluates new inputs. Original hidden properties and getters must refuse. |
| Static/runtime distinction | A declared `[0,10]` result shape admits statically; 5+6 fails its runtime refinement and 5+5 passes. L+mL does not implicitly convert. `choose` cannot conceal an effect-bearing ancestor. |

Final independent run on the current working-tree candidate: **11 tests passed, zero failed**. The loaded registry during the run was `6e149032e388c757b263fb227682bf767080d3b91c96cfe2b8c4017d2d6984be`; root intentionally deferred pin regeneration until the boundary audit completed. This run does not certify that historical pin as a hash of the final fixed implementation. The hidden migration request regression initially failed and passed after the production boundary fix; no expectation was weakened. These counts refer to this independent suite, not the entire acceptance matrix.

## Interpreting what the candidate guarantees

A Living Thought carries public observations, evidence, goals, decisions, plans and tasks in its exact source. It does not recover or expose hidden model reasoning. Runtime ports supply a separately checked snapshot; they never rewrite authored literals or change source identity. Declaration coverage, exported Boolean completion and provenance labels are structural commitments. They do not authenticate a source string, establish facts about City, or prove that a goal succeeded outside the supplied snapshot.

The executable graph is a closed deterministic DAG of the pinned kernels, with strict symbolic units, finite JSON data, checked numeric results, bounded source/value/run sizes and explicit input refusal. Declared refinements are checked at evaluation; static inference proves structural compatibility rather than dynamic positivity, uniqueness or world truth. An occurrence publishes only simulated action receipts after its complete computation succeeds. Source-only construction/verification/recovery are passive; repeated runs and fresh reproduction are explicit events.

The Session stages schema, size, returned copy, record and request receipt before local commit. Its request-key ledger is complete-payload and non-evicting while that Session exists. A lost response may occur after local commit; retry the exact key and full payload to recover that result. The adapters do not supply durable global exactly-once execution, external world dispatch, credential authority, or authenticated multi-owner isolation. The A2A factory is explicitly single-owner and unauthenticated; its CLI loopback default is suitable for that local scope. Host authentication and separate owner Sessions are required before shared hosting. Cancellation wins before synchronous dispatch, not after it begins.

Imported snapshot history is **asserted**, not automatically recalculated retained evidence. Passive restoration may accept structurally well-formed claimed outputs; fresh reproduction detects disagreement. This distinction is intentional and documented, not a factual verification guarantee. SDK memory/session bounds and A2A task history bounds are separate; evicting transport history must never reopen a retained execution request key.

## Release disposition

For experimental local collaboration and UI, the passive constructor, typed recipes, inspected simulation results and bounded Session are useful within their documented scope. The source-only codec wrapper is the admitted stable-profile boundary; generic legacy `core.canon` and raw codecs remain JSON utilities and should not be advertised as full source admission APIs.

For a stable QDL 1 claim, freeze the final implementation registry and independently review updated identity fixtures. Run the complete frozen legacy/candidate/migration vectors without automatic rebaselining, SDK static negative types, real MCP/A2A transport checks, Node 22 plus the current supported Node, installed-package consumers and browser construction/run/recovery flows. The new audit suite is an additional gate. No further semantic blocker was found in the tested effect, evidence, receipt, refinement, identity or replay cases. No generic demand for a full JavaScript proof is imposed; the acceptance work is tied to explicit public behavior and supported deployment scope.

## Files inspected

`core.js`, `qdl-v1.js`, `qdl-v1-types.js`, `qdl-v1-contract.js`, `qdl-v1-kernels.js`, `qdl-v1-registry.js`, `qdl-v1-migrate.js`, `qdl-v1-library.js`, candidate/legacy/migration frozen manifests and fixtures, root verification scripts, SDK `src/v1*`, Session/schema/adapter/model tests, and candidate/SDK docs. This audit used repository implementation and local experiments; no external factual claims or live City interactions were needed.
