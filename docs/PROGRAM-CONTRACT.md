# Program authors' contract

Programs use the finite kernels below. Each operation declares its inputs and outputs.

File envelope:

```json
{"id":"lanternkeeper","name":"Lanternkeeper","description":"...","graph":{"version":1,"name":"...","nodes":[{"id":"input","op":"literal","inputs":[],"params":{"value":[1,2,3]}},{"id":"total","op":"sum","inputs":["input"],"params":{}}],"outputs":["total"]},"skin":{"family":"filament","accent":"#aaddcc"},"fixtures":[{"name":"default","overrides":{},"expected":[6]},{"name":"alternate","overrides":{"input":[2,4]},"expected":[6]}]}
```

Nodes form a finite DAG, IDs unique, inputs refer to producer node IDs, input order significant. Outputs ordered. Every literal value is part of canonical source. Overrides may replace literal-node values ONLY. An effect is always a local simulation; source parameters never grant real-world authority. The runtime wraps the graph in a quotation/constructor quine, executes its task, emits its exact canonical source, and verifies fresh generations. Every fixture must have exact JSON expected ordered outputs. Write at least 3 meaningful fixtures, including a failure/edge case. Finite JSON values only; up to 64 nodes, arrays up to 512 entries, bounded repeat 1–8.

## Kernel operations

All params below are objects. Numerical operations reject nonfinite numbers.

- literal []: params.value (JSON).
- sum/mean/min/max [numericArray]: sum empty = 0; mean/min/max require nonempty.
- weightedMean [numericValues,numericWeights]: equal nonempty lengths, weights nonnegative, positive total.
- length [arrayOrString]: integer length.
- map [numericArray]: params.kind square or multiply; multiply uses params.factor.
- sort [array]: params.key optional record key, params.descending optional bool; stable ascending otherwise.
- dedupe [array]: params.key optional; keep first distinct canonical value/key.
- filter [array]: params.key optional, params.operator one of eq,ne,gt,gte,lt,lte; params.value.
- compare [value]: same operator/value as filter, returns boolean.
- choose [boolean,ifTrue,ifFalse]: returns selected JSON value.
- get [record]: params.path dotted own-property path; never inherited or prototype keys.
- clamp [number]: params.min, params.max.
- budget [availableNumber,desiredNumber]: nonnegative; returns {allocated:min(available,desired),remaining:available-allocated}.
- action [booleanGuard,payload]: params.allowed bool, params.action string. Returns {status:'simulated'|'skipped',action:params.action,payload}. simulated iff guard AND allowed; false otherwise. Exactly one simulated receipt per node; no network.
- report [values...]: params.labels array equal input length with unique names; returns named object.
- bfs [adjacencyRecord,blockedNodeIds]: params.start,params.goal strings. Neighbors ordered arrays of strings. Returns {found:boolean,path:[ids],distance:edgeCount or null}; deterministic BFS, block start/goal means not found.
- allocate [integerAvailable,requests]: requests [{id:string,amount:nonnegativeInteger}]. In request order allocate up to remaining. Returns {grants:[{id,requested,granted}],remaining}. No overcommit.
- schedule [jobs]: jobs [{id:string,depends:[ids],duration:nonnegativeNumber}]. Stable ready-order scheduling, parallel earliest starts. Returns {order:[ids],jobs:[{id,start,end}],makespan}. Cycle/dangling dependency is rejected: do not use as an expected-success fixture.
- consensus [votes]: votes [{source:string,choice:string}]. First vote per source counts; ties choose earliest first-seen choice. params.required positive integer minimum support. Returns {choice:string or null,support:number,accepted:boolean,uniqueSources:number}. Empty => null,0,false,0.
- retry [outcomes]: strings 'retry','ok','unknown'; params.maxAttempts 1–8. Consume until ok, unknown, or budget. Unknown stops rather than resubmitting. Returns {status:'completed'|'uncertain'|'exhausted',attempts:number,history:[consumed]}. Empty => exhausted,0,[]; max consumed <= maxAttempts.
- evidence [records]: records [{source:string,claim:string,value:boolean}]. First source+claim report counts; optional params.claim selects one claim, otherwise all. Returns {state:'unknown'|'supported'|'refuted'|'conflict',support:number,refute:number,sources:number}. Repeated provenance does not inflate counts.

## Animation and color

skin.family one of filament, jelly, moth, coral, ribbon, nautilus, seed, torus, comet, bloom. This selects a bounded body formula; graph degree, depth, ports, opcode and constants still drive organs/filaments. One family per assigned program. Colors have a shared semantic dictionary; accent changes decorative halo only. Exact source survives harmonic bands and a separately decodable RGB byte strand. Do not claim screenshot recovery, biological life, hidden LLM cognition, or live City integration.

## Website API (root integrating)

Global Quinelings loaded after orbit.js, kernels.js, core.js.
- Q.makeTaskProgram(graph,repeats=1) -> closed constructor quine AST.
- Q.execute(ast) -> {emitted:[canonicalSource],tasks:[{graph,output:[JSON],trace:[{edge,rule,...}],effects:[receipts]}],trace,steps}. Legacy plans retained.
- Q.runTask(graph,overrides={}) -> {output:[JSON],trace,effects,graph}. Overrides literals only.
- Q.describe(ast) -> {graph,nodes,links,repeats,quoteDepth,branches,maxDepth}; each node {id,op,parent,inputs,outputs,params,frequency,level,u,side,indegree,outdegree}; link {from,to,port,type}.
- Q.nodePosition(node,phase,shape),Q.edgePoint(link,u,phase,shape) -> {x,y} normalized.
- Q.instructionColor(op),Q.instructionFromColor(hex): shared exact opcode palette.
- Q.canon, Q.encode,Q.decode, Q.samples,Q.fromSamples,Q.encodeColors,Q.decodeColors as current core.js.

`programs/manifest.json` lists the ten gallery program IDs.

## Chromamapping profiles

`skin.chroma` may contain a complete validated QDL chroma record. `QDL.forProgram(item)` builds the family design and copies this override before compilation. `Q.makeTaskProgram` validates every scalar binding against graph node IDs; execution revalidates embedded designs before running tasks. The library's Lanternkeeper profile binds `faultScore` to the fixed domain `[0,1]` and reference threshold `0.625`. Pigment and lens configuration live in source; recorded task-cycle values and view selection do not. See [QDL](QDL.md) for the closed syntax and state semantics.
