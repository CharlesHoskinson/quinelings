# Candidate identity and future upgrades

Quinelings — Living Thoughts. The current profile remains a candidate. This policy defines how a stable profile would be kept useful without rewriting historical source identities.

A source pins `format`, `version`, `canonical`, `registry` and `registryDigest` inside both constructor quotations. Its artifact ID hashes the complete canonical source. The registry manifest binds the operation contract and implementation files. A changed implementation pin produces different compiled source, even if a particular task produces the same output.

During candidate development, a pin change requires explicit review, a recorded reason and reviewed new candidate fixtures. The twelve legacy golden examples are immutable and come from repository revision `10f3cfd3a1b69b40cb006abeaa4091861b8ba46e`; candidate pin changes must never rebaseline them. Normal checks run `build-v1-registry.cjs --check`, which checks both the executable registry and JSON sidecar. CI must not run a generator to make a failing pin check disappear.

A stable release must retain its interpreter tarball, manifest, golden sources and exact genomes under an immutable release/tag. Retain its source checkout as well. A newer interpreter must either advertise and test support for that exact historical pin or refuse it with `unsupported-registry`; recognizing a `version:1` marker alone grants no compatibility. The current interpreter supports only its exact current pin. No multi-registry loader is implemented.

Upgrade is an explicit construction of a new artifact:

1. Inspect the old source with its matching archived interpreter, verifying its canonical constructor and pins. Recover its complete authored declaration, normalized node types, task, design and repeat count. Source-only verification runs no task.
2. Review the target registry contract and diagnostics. Keep units symbolic; do not infer conversions, replace evidence policies or invent lost declarations. Retain constants unless a selected migration explicitly turns them into ports.
3. Under the target interpreter, construct with the reviewed `{name,thought,task,design,repeats}`. It supplies the target pin. If a signature, design model or effect rule has changed, author an explicit repair; unknown fields and unsupported operations refuse.
4. Review old/new complete source hashes and genomes, typed ports, declaration references, effects and body ownership. Compare independently authored input/output fixtures by explicit runs in separate sessions. Equality on those fixtures is finite evidence, not general program equivalence.
5. Explicitly admit the new source. Preserve the old artifact and record the old/target pins, transformation, expected semantic differences and fixture evidence separately. A conversion record does not establish historical authorship, social birth or outside-world work.

Do not transfer old request keys into a new source's execution ledger. The original key binds the original complete request and retained record. A new source uses a new explicit request key; imported historical records remain assertions. Do not restore an incompatible whole-session snapshot by silently substituting new source or registry pins.

The shipped `migrateLegacy` helper handles the experimental legacy task constructor → current candidate transition only. It requires explicit thought/type/port/evidence declarations and returns a passive preview. It is not a universal future-version translator. The matching-runtime inspection and reviewed `build` workflow above provides an upgrade path without promising an automatic migration engine.
