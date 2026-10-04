(function(root){
'use strict';
const manifest={
  "id": "qdl-kernels-1",
  "language": "qdl-program",
  "version": 1,
  "canonical": "qdl-json-1",
  "bounds": {
    "sourceBytes": 65536,
    "valueBytes": 65536,
    "valueDepth": 24,
    "collectionEntries": 512,
    "stringCodeUnits": 16384,
    "nodes": 64,
    "nodePorts": 16,
    "outputs": 16,
    "repeats": 8,
    "runBytes": 2097152,
    "diagnosticReserveBytes": 8192
  },
  "semantics": {
    "numeric": "finite IEEE754 binary64; left-to-right checked reductions; safe integer refinement",
    "units": "normalized symbolic products; no implicit conversion",
    "order": "first ready in authored node order",
    "effects": "local simulation; occurrence-atomic publication; stop after first failed occurrence",
    "input": "exact named typed snapshot; explicit null; immutable source",
    "thought": "public authored declarations; checked references; no factual certification",
    "source": "ordinary quoted constructor AST; source-only verification does not run tasks",
    "unicode": "UTF16 key order and lengths; reject lone surrogates; no normalization",
    "legacy": "separate experimental source profile; no implicit migration"
  },
  "operations": {
    "literal": {
      "arity": 0
    },
    "sum": {
      "arity": 1
    },
    "mean": {
      "arity": 1
    },
    "min": {
      "arity": 1
    },
    "max": {
      "arity": 1
    },
    "weightedMean": {
      "arity": 2
    },
    "length": {
      "arity": 1
    },
    "map": {
      "arity": 1
    },
    "sort": {
      "arity": 1
    },
    "dedupe": {
      "arity": 1
    },
    "filter": {
      "arity": 1
    },
    "compare": {
      "arity": 1
    },
    "choose": {
      "arity": 3
    },
    "get": {
      "arity": 1
    },
    "clamp": {
      "arity": 1
    },
    "budget": {
      "arity": 2
    },
    "action": {
      "arity": 2
    },
    "report": {
      "arity": -1
    },
    "bfs": {
      "arity": 2
    },
    "allocate": {
      "arity": 2
    },
    "schedule": {
      "arity": 1
    },
    "consensus": {
      "arity": 1
    },
    "retry": {
      "arity": 1
    },
    "evidence": {
      "arity": 1
    },
    "input": {
      "arity": 0,
      "params": [
        "name"
      ],
      "output": "T",
      "context": "bindings own-name lookup; graph validates T"
    },
    "arithmetic": {
      "arity": 2,
      "params": [
        "kind"
      ],
      "kinds": [
        "add",
        "sub",
        "mul",
        "div",
        "floorDiv",
        "min",
        "max"
      ],
      "output": "N[u] or Nat[u]; graph computes units",
      "context": "arithmeticRefinement: N (default) or Nat; floorDiv always Nat"
    },
    "compareValues": {
      "arity": 2,
      "params": [
        "operator"
      ],
      "output": "boolean"
    },
    "all": {
      "arity": 1,
      "params": [],
      "inputs": "Array<boolean>",
      "output": "boolean; empty true"
    },
    "select": {
      "arity": 2,
      "params": [
        "keys",
        "order",
        "default"
      ],
      "inputs": "Array<Record<T>>, query Record<Q>",
      "output": "{found:boolean,value:T,index:optional Nat[count]}"
    },
    "evidenceFresh": {
      "arity": 3,
      "params": [
        "allowedKinds"
      ],
      "inputs": "Array<E>, claim:string, {now:Nat[tick],maxAge:Nat[tick],minRevision:Nat[revision]}",
      "output": "{state:string,support:Nat[count],refute:Nat[count],sources:Nat[count],sourceConflicts:Array<string>,used:Array<E>,skipped:Array<{record:E,reason:string}>}"
    },
    "reconcile": {
      "arity": 2,
      "params": [],
      "inputs": "Array<R>, {operation:string,requested:Nat[item],maxAttempts:Nat[count] 1..8}",
      "output": "{state:string,confirmedUnits:Nat[item],confirmedAttempts:Nat[count],failedAttempts:Nat[count],pendingAttempts:Nat[count],unknownAttempts:Nat[count],attempts:Nat[count],mayRetry:boolean}"
    }
  },
  "implementationHashes": {
    "qdl-v1.js": "8dca8132a86802187413e1cc1e076d02922e60574aff794fc34c22ad4b505b97",
    "qdl-v1-types.js": "7a69e9a038d6124dade34e7425bdc8392fd25ac46c8b60149d2e4ee28c146c6d",
    "qdl-v1-contract.js": "8a66b962af23c469e5adfba9743de32155d36ee85965aa7a94104140cca51c9f",
    "qdl-v1-kernels.js": "b43b3a793c6395702c687f0632b4ceb85eabdfb5c6f9253c6b36fc7cebcfe4f1",
    "kernels.js": "e9ca88a7260c3fd97a963952424e7f383a5e7aeea672c8f64283bedcc6cde351",
    "core.js": "21ecf6bad1566e5af023e0bd788fb9bfd33fcf4ab93471f953280688a7d8bb1f",
    "orbit.js": "74b0118ddae0cd0668d46de18ed64a593293873e9df3285dca3dcdc827eb7063",
    "qdl.js": "08317452d2c49f833669f5448fa8ec2f085f51d40ab6f02bb1bfbba4a80fa465",
    "anatomy.js": "5e993f7e40ca92eeb43fb929abe9ca3fbec1fdb4bee62c4bda610486693a93d1",
    "chroma.js": "50ffdc73eaf2077af6d6f2a6fd3c68e75b991594a00726d29c2f1ad3b9d5050f",
    "morphology.js": "25995d09cb10127c66d2a933d2a12e00b70d4af175b14f8bda8a78e426339111",
    "ranch-crypto.js": "7f0476d07df8354441782289eef8a803d4e8b4bfb23fcda6aa3350bc81fe2b6c"
  }
};
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const api=Object.freeze({manifest:freeze(manifest),digest:"43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3"});
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.QDLV1Registry=api;
})(typeof globalThis!=='undefined'?globalThis:this);
