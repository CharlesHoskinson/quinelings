# Program → Quineling mapping

## Three representations

1. **Executable genotype:** canonical JSON expression with a finite task DAG quoted inside it.
2. **Recoverable mathematical/color genome:** finite cosine coefficient bands and independently decodable RGB byte records.
3. **Animated phenotype:** graph-derived organs, filaments, chambers, and a selected family envelope. This view is intentionally many-to-one.

Canonicalization sorts object keys and retains array order and stable identifiers. This is syntactic source identity, not graph-isomorphism or behavioral equivalence. Phase, selection, layout, and replay position are not source fields.

## Constructor quine

Let G be a quoted task graph. The emitted source is the entire expression P, including its task and source constructor:

```text
D = lambda x.
      sequence(repeat(n, task(quote(G))),
               emit(makeApply(makeRun(makeQuote(x)), makeQuote(x))))
P = apply(run(quote(D)), quote(D))
```

P applies the smaller quoted body D to itself. Its ordinary constructors rebuild P; `emit` serializes that constructed syntax. No file, DOM, ambient genome, or complete-current-source lookup is available to the interpreter. Task results are a separate output channel. The complete P is not a literal inside itself.

Reproduction parses the emitted canonical source, starts a fresh interpreter, and checks exact source and task-output equality. A local descendant gets fresh runtime state. The current source cannot grant live permissions or create a City identity.

## Harmonic source

Canonical UTF-8 source bytes are framed by QLNG magic, a big-endian byte length, and a 32-bit FNV-1a corruption check. Split the framed bytes into 32-coefficient bands. A byte b uses integer amplitude a=b+1; zero means padding. Band j is:

```text
F_j(theta) = sum(k=1..32) a[j,k] cos(k theta)
```

All bands form the mathematical source, with a fixed coordinate frame. Exact coefficient arrays recover bytes directly. At 65 equally spaced angles theta_m=2πm/65, discrete orthogonality gives:

```text
a[j,k] = (2/65) sum(m=0..64) F_j(theta_m) cos(k theta_m)
```

The numerical decoder checks proximity to integers, all reconstructed samples, byte framing, padding, checksum, UTF-8, and canonical source. This is tested numerical inversion under the chosen tolerances; it is not a proof for arbitrary noisy inputs or every floating-point implementation. The checksum detects common corruption, not malicious authenticity.

Distinct source vectors have distinct finite cosine polynomials by orthogonality. Different programs can still share the visible low-frequency silhouette. Cropping, unknown phase, projection, antialiasing, omitted bands, and pixel quantization prevent treating an arbitrary picture as the complete genome.

## Color source and color anatomy

The byte strand maps b to exact RGB:

```text
R=b; G=255-b; B=(73*b+19) mod 256
```

Null represents padding. R recovers the byte, while the other channels reject color drift before checking the source frame. This codec independently recovers the same source as the harmonic genome. Image compression or a display transform can destroy its exactness.

The exact operation palette is separate from both the byte strand and membrane role colors. Organ frequency and labels remain additional opcode cues. The source-authored `chroma` record selects the fixed `roles-1` dictionary and a bounded color strength: its six groups are input, process (arithmetic/transforms/planning), decision (judgment/evidence/consensus), quote (quotation/reconstruction), action, and report. A categorical material territory belongs to one node, ordered by dependency level and stable peer ID, and moves with the membrane. Colored crests with narrow pearl cores and compression/depth opacity preserve the folded material. Omitted `chroma` retains the neutral legacy material.

An optional scalar lens binds named node outputs or bounded own-property paths to one fixed numeric domain, label, and unit. It uses an actual recorded task occurrence and recolors the bound territories; unbound territories retain desaturated role hues. Zero remains a measured value; no execution, invalid data, stale source, and out-of-range data have explicit statuses. Different values across the same graph can change tissue colors without changing its geometry. The gallery identifies the recorded run/cycle and offers Program roles, the named scalar lens, and Pearl study. Missing or invalid measurements have interrupted hatching and text. Thresholds in the legend do not grant permissions or create guards. No averaging of adjacent scalar measurements or automatic domain rescaling invents values.

Chroma declarations are copied into the canonical quoted graph, so edits change source identity and survive both genome codecs and reproduction. Lens selection and recorded values remain outside source. Rendering and inspection only read a trace associated with the current source; source edits invalidate that association. See [QDL chromamapping](QDL.md#authored-chromamapping) for validation and binding bounds.

## Structural phenotype

Q.describe extracts the quoted task DAG with ordered input ports, computes dependency depth and fanout, and assigns stable organ anchors. An edge joins producer and consumer with a bounded sin(πu) displacement, so its endpoints remain fixed to the declared ports throughout motion. Node frequency identifies the operation. Degree affects organ lobes and filament branches. Selected literals affect bounded organ scale. Family formulas supply distinct body envelopes; program structure modulates them.

Fanout is shared data. `choose` evaluates no branch lazily; its producers already ran. Conditional effects therefore require per-action Boolean guards. Loops come from the explicit outer repeat bound. The kernel rejects arbitrary graph cycles. A rendered curve crossing does not create a connection.

See [Design language](DESIGN-LANGUAGE.md) for the reference breakdown and phenotype acceptance criteria.
