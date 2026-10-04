# Thought compiler implementation contract

`thought.js` loads after Orbit, QuinelingKernels, QDL and Quinelings. CommonJS exports and browser `ThoughtCompiler` share the API:

- `parse(text)` returns `{status:'supported'|'clarify'|'unsupported'|'inconsistent', intent?, diagnostics, assumptions, sourceMap}`. Supported means the bounded local syntax yielded a checked formal interpretation. Other English requires clarification or a separately configured proposer.
- `compile(intent)` returns `{graph,contract,sourceMap,diagnostics}` or throws an Error with `code` and `path`. It never calls `Q.execute`, `K.run`, or `K.calculate('action')`. Pure kernels may be evaluated against authored fixed data to check refinements. Source capacity is checked using the shared constructor and default design; the artifact integration must check again after generated design is attached.
- `schema` is the JSON schema identifier; `inferType(value,unit='one')` assists structured proposal authors; `capabilities` exposes the closed kernel registry.

Intent format (see `design/intent.schema.json`):

```json
{"format":"quineling-intent","name":"Squared total","thought":"[2,3] | square | sum","inputs":[{"id":"input","value":[2,3],"type":{"kind":"array","element":{"kind":"number","unit":"one"}}}],"steps":[{"id":"step1","op":"map","inputs":["input"],"params":{"kind":"square"}},{"id":"step2","op":"sum","inputs":["step1"],"params":{}}],"outputs":["step2"]}
```

All fields are closed; `assumptions:[string]` is the only optional top-level field. Type tags: `number` with a symbolic unit, `boolean`, `string`, `null`, `array` with `element`, `record` with `fields`, and `optional` with `element`. Required primitive refinements are validated against every supplied value. Numbers use finite IEEE-754 values; allocation requires nonnegative safe integers. Dimension labels never imply automatic conversion. Record fields forbid dots and prototype-sensitive names.

The parser consumes complete pipelines. Basic examples: `[2,3] | square | sum`, `[8,2,8,4] | dedupe | sort desc | mean`, `[1,5,9] L | filter gt 3 | sum`, `4 L | clamp 0 3`. Unary stages: square, multiply NUMBER, sum, mean, min, max, length, clamp MIN MAX, filter [PATH] OP JSON, sort [PATH] [asc|desc], dedupe [PATH], get PATH. Inputs and operation sequence create a new graph; there is no whole-task gallery selection. Special bounded seeds cover weighted mean, FIFO allocation, routes, schedules, consensus, evidence and retry; exported examples document their exact syntax. `plan ` followed by a JSON IntentIR or a bare JSON IntentIR imports through identical validation.

Original text, typed contract, assumptions and source map are companion artifacts. The graph's literal data and operations reproduce through the constructor quine; companion units/provenance do not silently become reproduced source. Inferred output types preserve optional fields such as route distance. Unknown trailing text rejects rather than disappearing. Build validation values are not user RunRecords. Actions remain local simulation and require a direct Boolean guard; actions upstream of choose branches reject because the DAG is eager.

## Implemented coverage and measured verification

All 23 non-literal current kernels are available through typed IntentIR; lowering creates literal kernels for declared inputs. Port order follows the current kernel ABI. `report NAME` wraps the current pipeline value with one named output. Exported `examples` is the UI's executable syntax catalog. Special forms are:

```
weighted mean [24,36,60] weights [2,1,1] L
allocate 9 L to [{"id":"fern","amount":4},{"id":"sage","amount":7}]
route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B"] | simulate "walk-route"
schedule [{"id":"a","depends":[],"duration":2},{"id":"b","depends":["a"],"duration":3}] s
consensus [{"source":"a","choice":"yes"},{"source":"b","choice":"yes"}] required 2
evidence [{"source":"a","claim":"safe","value":true}] claim "safe"
retry ["retry","ok"] max 3
budget 4 for 7 L | get remaining
```

The compile result is exactly `{graph, contract, sourceMap, diagnostics}`. `contract` contains `format:'quineling-contract'`, registry identity, per-node inferred `types`, assumptions, `effectMode:'pure'|'simulation'`, default-design `sourceBytes`, and an explicit companion-provenance statement. Source-map entries are `{nodeId,clause}`. `parse` preserves the exact original seed/pipeline clause for every emitted node, including multiple nodes lowered from one simulation clause; `compile` and structured imports provide explicit formal operation/ordered-input summaries. They are explanations of the formal plan, not claims that arbitrary English clauses were verified. Diagnostics use `{code,path,message}`; thrown compilation errors have matching `code` and `path` properties. No user RunRecord is returned by compilation.

The numeric `one` unit is explicitly disclosed as an assumption when omitted in a local numeric input form. Structured imports must declare number units. Numeric thresholds/clamp bounds inherit the operand unit; multiply factors are dimensionless. Units canonicalize product powers; square doubles powers, and comparison branches/weighted weights/resource units must agree. The schema is deliberately an experimental tag without a language version freeze. Provider adapters should read the JSON Schema and return data through the same `compile` boundary.

`node verify-thought.cjs` passes 139 assertions: sixteen independently specified output fixtures, two new operation-order compositions without a whole-plan recipe, strict malicious/unknown-field and finite-JSON validation, guards on action compilation, wrong units/ports, allocation/schedule/weighted-overflow refinements, complete-source and node budgets, browser UMD loading, phase/source separation, and three generations plus direct/sampled harmonic and RGB recovery. These tests establish supported formal-plan behavior, not arbitrary-English understanding or generated-body beauty. The script does not change shared runtime files.

Known conservative limits: all nodes must contribute to outputs; disconnected work rejects. Empty arrays parsed locally default to numeric element type, while special typed seeds and imported declarations express empty record/string arrays. Property paths use safe dotted record fields. Action receipts remain symbolic throughout Build; pure structural extraction/reporting may use their types, but numerical operations with unknown action-derived values reject because their refinements are unproved. Actions upstream of either choose branch reject even if a sophisticated analysis could prove a safe case. Source-budget validation uses the existing default design; generated anatomy must receive a second exact budget check by the artifact integration.
