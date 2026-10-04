# Independent language and recovery audit

Scope: `core.js`, `orbit.js`, the published task contract, and `audit.cjs`. This
agent owns only this report and the audit script. The script uses public APIs;
its expected task outputs are hand specified rather than copied from kernels.
Run `node audit.cjs` from the project directory. Missing task APIs are failures,
including in negative tests; an absent function must not masquerade as validation.

## Constructor identity and source oracle

The legacy constructor has the form `apply(run(quote(D)), quote(D))`. Its binder
receives its own constructor body as data. The body explicitly builds `apply`,
`run`, and `quote` nodes and emits the canonical resulting AST. This supports
an exact self-reproduction claim for this expression language, not reproduction
of the JavaScript host file, an arbitrary textual spelling, or biological life.
Quoted data is available to the program; reading its original host source is not
required. Racket's [quote reference](https://docs.racket-lang.org/reference/quote.html)
is a useful primary language reference for the code/data distinction; this runtime
defines its own staging rules and should not claim Racket compatibility.

The audit checks four fresh parse/execute generations, one emission per execution,
three task runs for repeat=3, and immunity to output-object mutation. A second
check bootstraps interpreter files into a browser-style VM with dynamic code
generation disabled, then executes an AST with no `require`, `process`, filesystem,
network, DOM, or original-source argument. Bootstrap loads `orbit.js`, `kernels.js`,
`qdl.js`, and `core.js` in dependency order. QDL validation runs under the same
sandbox restrictions; no filesystem or source oracle was added. Host bootstrap necessarily reads the
interpreter; those reads are outside expression execution. This is stronger
evidence than simply comparing a stored source string to itself, but not a proof
that arbitrary future host changes cannot introduce an oracle. It checks the
shared public constructor, not all possible ASTs.

## Harmonics and exact RGB recovery

Each byte is stored as an integer coefficient in 1..256; zero is padding. Every
band contains 32 cosine frequencies 1..32. The 65 equally spaced samples obey
discrete orthogonality: summing each sampled waveform against frequency k and
multiplying by 2/65 recovers its coefficient. Since k+l <=64, no nonzero sum or
difference frequency aliases to a multiple of 65. See the university-authored
[DFT orthogonality lecture notes](https://na.uni-tuebingen.de/ex/num2_ss25/lecture%20notes%20english/chaps-I-V.pdf).
This is a finite numerical serialization channel, not inference from an organic
outline or screenshot. `fromSamples` allows coefficient residuals up to 1e-6 and
wave reconstruction residuals up to 1e-5; that tolerance permits floating point
round-trip error and does not guarantee noisy measurements can be decoded.

The independent RGB strand encodes b as `[b,255-b,(73*b+19)%256]`; the first
component alone makes the mapping injective, and the other two detect palette
drift. Null is padding, distinct from byte zero. The strand must preserve exact
triplets, order, band boundaries, and nulls. Rescaling, antialiasing, color-space
conversion, compression, occlusion, or extracting decorative body colors can
destroy that channel. Opcode colors describe instruction identity only; accent
colors are decorative and do not encode a full program.

The envelope has magic bytes, byte length, 32-bit FNV-1a checksum, UTF-8 decoding,
and canonical reserialization checks. The checksum catches tested accidental
corruption; it is not authentication, collision resistance, or error correction.
Maximum source payload is 65,536 UTF-8 bytes, with a 12-byte envelope and at most
2,049 bands. Recovery returns JSON AST data; it does not make unknown data safe
to execute. The audit checks Unicode/NUL round-trip, generation through sampled
harmonics, exact RGB round-trip, byte corruption, padding corruption, unsupported
DC/sample changes, drift rejection, and opcode palette injectivity.

## DAG typing, budgets, and failures

The task contract defines runtime value constraints rather than explicit static
wire types. Validation must reject duplicate IDs, missing producers/outputs,
cycles, unknown operations, bad arities/parameters, nonfinite JSON numbers and
oversized arrays before successful execution. Producer order in the input file
must not alter semantics; dependency input order and output order must be
preserved. A valid disconnected node still executes once, including a simulated
action node. Outputs and stored constructor data must not expose mutable aliases.
The contract bounds task nodes to 64, arrays to 512, and repeat/retry to 1..8.
Arithmetic overflow must fail rather than silently serialize Infinity as null.

`action` is a local receipt generator, not authorization to operate a City API.
Both guard and allowed flag must be booleans; simulation happens only when both
are true. No budget is inherently consumed by an action: a graph must wire its
budget decision into its action guard/payload. `budget` and `allocate` ensure
nonnegative conservation locally; they do not account for outside resources.
Repeated constructor execution repeats its simulated task effects. There is no
durable exactly-once guarantee across generations or runtime restarts.

`retry` must stop on unknown to avoid automatic resubmission after an ambiguous
outcome. `consensus` and `evidence` deduplicate declared source identifiers; these
are provenance strings, not authenticated identities or independence proofs.
`schedule` denotes parallel earliest starts, not actual wall-clock job execution.
Own-property access must reject prototype paths. The audit covers these controls
with independent adversarial cases, ordered BFS ties, schedule cycles and dangling
dependencies, zero/negative weighted means, and duplicate provenance.

## Status and integration findings

At the first inspection, the on-disk `core.js` exposes the legacy plan APIs only:
`makeTaskProgram` and `runTask` are absent. Harmonic/RGB checks pass on that runtime.
The task portion of `audit.cjs` therefore intentionally fails until integration
lands. Final counts must be taken from a fresh run; initial absence is not an
implementation defect in a file the root is actively replacing. This report will
record concrete remaining failures after those APIs become available.

Final independent run after root's kernel fixes and source-bound QDL integration:
**46 checks pass, 0 fail**
(`node audit.cjs`, exit 0). The five previous adversarial checks now pass:

- `sort` accepts `descending:'false'` as truthy instead of enforcing Boolean.
- `map` with unknown kind and `filter` with unknown operator accept an empty
  input because parameter validation runs only inside per-element callbacks.
- `get` accepts an array for its record input; BFS accepts nonstring blocked IDs.

Root fixed these type/parameter validation gaps. The cases remain in the script
as regression checks; no kernel or shared runtime files were edited by this agent.

## Design language review

`docs/DESIGN-LANGUAGE.md` correctly separates numerical source recovery from
silhouette/screenshot recovery, distinguishes the opcode palette from the exact
RGB strand, identifies local action receipts as simulation, and labels family
anatomy as targets requiring visual verification. Its checksum wording makes no
cryptographic authenticity claim. No codec or biological-life overclaim was found.

One control distinction should stay explicit in product inspection and prose:
`choose` selects an already-computed JSON result. It does **not** conditionally
skip the unselected producer or suppress its action. All finite DAG nodes run,
including disconnected nodes; both action nodes can simulate before `choose`
selects one receipt. Every intended conditional action needs its own Boolean
guard. The audit now verifies that behavior with two independently guarded
actions feeding a choose. The anatomy table's “selected outlet” is a data-selection
highlight, not evidence of lazy branch execution. Root was notified of this
practical distinction; the design document remains outside this agent's ownership.

Current kernels additionally bound JSON nesting to 24, strings to 16,384 UTF-16
code units, record keys to 512, graph/value canonical UTF-8 to 64 KiB, input/output
ports to 16, and BFS discovered IDs to 512. The 64 KiB graph limit is distinct
from the full constructor AST limit: duplicated quotation can make its encoding
larger. Runtime task trace size can exceed one value's 64 KiB limit because it
records every input/output of every node and every repeated generation.
Interpreter fuel alone does not prevent JavaScript stack overflow before a deeply
recursive evaluator reaches its fuel ceiling; task JSON bounds help constructed
task inputs but arbitrary term trees need their own explicit nesting limit.
Decoder integrity checks do not substitute for AST/graph validation. No biological
life, hidden LLM thought, external-world actions, or screenshot reconstruction is
established by these tests.
