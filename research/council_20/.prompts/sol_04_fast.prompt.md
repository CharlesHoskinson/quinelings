You are SOL Quineling Council Specialist #4: Live Program Execution Coupling & CEK / Task Trace Response.

### Reference Codebase (`woven-body.js`, `lifeform-families.js`, `qdl-v1-offspring.js`, `spec/lean/QDL/Geometry.lean`):
- `woven-body.js`:
  - `MECHANISMS = ['pleated-braid', 'lorenz-flow', 'clifford-flow', 'recursive-affine', 'recursive-julia', 'logarithmic-mantle', 'toroidal-weave', 'phyllotaxis-fan']`
  - `WovenBody.author(graph, seed)` -> `{ model: 'woven-field-experimental', mechanism, seed, topology: {depth, fanout, convergence, guards, effects}, strands, folds, turns, territories: [{node, component, u: [u0, u1]}], dynamics?, geometry?, embedding? }`
  - `WovenBody.compile(record, graph)` -> precomputes Lorenz RK4 trajectory (`orbit`), Clifford attractor (`cloud`, `grid`, `critical`), contractive IFS branches (`branches`), Julia escape grid & marching-squares contours (`julia`), or `LifeformFamilies.compile`.
  - `WovenBody.frame(body, phase, {budget, crests, reuse})` -> `{ points: Float32Array(budget*4), owners: Uint16Array(budget), ridges }`.
- `lifeform-families.js`:
  - `LIMITS = { growth:[.12,.35], spread:[.5,1.2], curl:[.4,1.6], asymmetry:[0,.4], offset:[0,TAU], frequency:[2,8], lobes:[3,9], twist:[1,3], whorls:[2,4] }`
  - `computeBasis(body, k, u, phase)` & `point(body, k, u, v, phase)` for `logarithmic-mantle`, `toroidal-weave`, and `phyllotaxis-fan`.
- `qdl-v1-offspring.js`:
  - Combines two parents `[parent0, parent1]` via `compose` (replaces recipient runtime input with donor output cone; emits `seam = {donorNode, recipientNode, type, integrationNode}`), `mate` (replaces recipient literal with donor cone), `merge` (parallel `report` node `'joined'`), or `body` (trait re-seed).


### Assignment:
Design how Quinelings dynamically respond to programs executing step-by-step:
1. Define the `execution` state contract (`activeOwner`, `nodeWeights`/`nodeEnergies`, `stackRatio`, `fuelRatio`, `stepImpulse`, `outcome`, `seamPulse`) and `WovenBody.stepResponse(body, phase, execution)`.
2. Specify how all 8 mechanisms respond to active operation firing (Gaussian soliton wave + normal elevation on `[u0, u1]`), recursion stack depth (`stackRatio` unfurling branches, whorls, and knots), and terminal outcomes (`Done` harmonic phase-locking vs `Rejected`/`Exhausted` Lyapunov shear).
Include exact mathematical equations and drop-in JS code.

CRITICAL: You are running in an empty directory with NO files and NO tools. Do NOT call any tools or shell commands. Write your complete Markdown engineering report directly in this response.