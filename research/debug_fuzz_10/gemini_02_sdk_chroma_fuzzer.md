# Gemini Debugging & Fuzzing Agent 2: `chroma.js`, `woven-body.js` & `quinelingsSdk.js` Property-Based Fuzzer

## 1. Executive Summary

1. **Why `window` Opcode Crashed `Chroma.colorFor` (`chroma.js:23`, `quinelingsSdk.js:474`)**:
   - `WovenBody.author(task)` and `LifeformFamilies` do not validate `node.op` against `Q.OPS` or `Chroma.ROLE_MAP`, whereas `Chroma.role(op)` throws `Error('Unknown chroma operation ' + op)` if `!Object.hasOwn(ROLE_MAP, op)`.
   - Adding `window: 'process'` to `ROLE_MAP` and `window: '#38bdf8'` to `OPCODE_ACCENTS` in `chroma.js` and `quinelingsSdk.js` (plus using canonical `Q.OPS` in `GRAPHS.tideglass`) passes all 17 core test suites (`npm test`) and all 9 V1 test suites (`npm run test:v1`).

2. **Discovery of Edge-Case `ownerMarks` Bug in `compileJulia` (`woven-body.js:45`)**:
   - Our 10,000-iteration property-based fuzzer discovered that when a `recursive-julia` DAG has `>= 19` nodes (e.g., `nCount = 19, seed = 5` or `nCount = 32..64`), corner territory patches in the 2D Julia grid can escape quickly (`q.value <= 2.5`), leaving `ownerMarks[i]` `undefined` for corner nodes and causing `juliaFrame` (`woven-body.js:61`) to throw `Error: WovenBody: Julia ownership patch misses finite field`.
   - Synthesizing a deterministic fallback `ownerMarks[i]` at each missing owner's territory midpoint `(p.u[0] + p.u[1]) / 2` (matching `compileClifford`'s `ownerPatchMarks` pattern) fixes `recursive-julia` across all `1..64` node counts with 100% pass rate across 10,000 fuzzed iterations.
