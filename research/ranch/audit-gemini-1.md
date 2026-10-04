# Quineling Ranch Design Audit 1/3: Typed Program Composition & Offspring

**Focus:** Typed program composition, donor slices, effects/guards, useful offspring, source identity and honest recoverability.
**Status:** Substantive review of the 2026-10-04 experimental candidate.

Overall, the candidate architecture is exceptionally rigorous. The separation of world simulation state from task execution ("World simulation never calls the task interpreter") elegantly sidesteps the catastrophic simulation failures that usually plague unsupervised code merging (e.g., conflicting actions from merged parents). The ledger's idempotency and atomic transaction requirements provide a highly robust foundation for honest recoverability.

However, there is a critical type-theoretic defect in how donor slices are imported, alongside a few significant utility constraints regarding guards and merged outputs.

---

## 1. Concrete Defect: Failure of Namespace Injectivity in Donor Slices

**Severity:** High (Breaks valid program compositions and violates structural typing)
**Candidate Section:** 2. Four closed offspring recipes (`compose` and `mate`)

**Analysis:**
The recipes for `compose` and `mate` specify importing "the donor's entire pure predecessor closure" into the recipient's graph. While the `merge` recipe explicitly retains "both complete parent DAGs in separate namespaces", `compose` and `mate` lack explicit namespace isolation for the donor's imported literal inputs. If the donor slice and the recipient graph both demand literal inputs with the exact same name (e.g., `target` or `time`), the lack of a namespace boundary causes these inputs to silently alias and collide in the child graph.

**Counterexample:**
1. **Parent 1 (Recipient)** has a literal input `x` of type `Color`, used to set a pigment payload.
2. **Parent 0 (Donor)** has a literal input `x` of type `Length`, used in a pure math closure to compute a threshold.
3. A user applies the `mate` recipe, explicitly substituting an internal math node in Parent 1 with the pure distance computation node from Parent 0.
4. The donor's pure closure is imported. The child graph now contains demands for both `x` (Color) and `x` (Length).
5. Because they share the identical string identifier and are not placed in disjoint namespaces, the compiler either generates invalid duplicate declarations or incorrectly aliases them into a single port `x`. This unified port fails structural type checking (cannot unify `Color` and `Length`), spuriously rejecting a mathematically sound and pure composition.

**Exact Correction (Required):**
In the definitions of `compose` and `mate`, explicitly mandate that the imported donor closure is injected under a disjoint namespace map (e.g., prefixing donor literal inputs to `donor_x`, or `p0_x`), preserving strict namespace injectivity. Only the explicitly targeted structural boundary (the matched port in `compose` or the replaced node in `mate`) may cross this namespace isolation.

**Test/Model Obligation:**
- **Model:** Formalize namespace injectivity in the Lean specification: prove that for any disjoint parent graphs $G_0$ and $G_1$, the `mate` and `compose` operations yield a structurally valid graph $G_{child}$ without un-targeted name collisions or unintended literal input aliasing.
- **Test:** Add a runtime negative control test that successfully composes/mates two parents with identically named but differently typed literal inputs, verifying they remain distinct, isolated ports in the emitted child source.

---

## 2. Aesthetic & Utility Concerns (Optional Enhancements)

While not fatal to the engine's safety, the following issues severely restrict the creation of "useful offspring" and degrade semantic utility for agents.

### A. Overly Strict Guard Protection in `mate`
The `mate` recipe dictates that "every ancestor of each direct Boolean guard are protected from replacement." While this enforces safety by freezing the original guard logic, it severely limits surgical evolution.
* **The Problem:** In most tasks, payloads and guards share common ancestors (e.g., a `sensor()` node feeds both a `moveTo` payload and an `isValid` guard). Because the sensor is an ancestor of the guard, it becomes completely locked. A user cannot use `mate` to surgically upgrade a shared noisy sensor with a filtered donor sensor, rendering `mate` useless for highly coupled graphs.
* **Enhancement:** Clarify whether the *structural topology* of the guard cone is protected, or the *values* it consumes. Permitting the substitution of nodes that feed a guard—provided the donor's exact type fits the replaced node—would drastically improve the utility of `mate` while still guaranteeing the recipient's Boolean logic receives the correct types.

### B. Semantic Loss in `merge` Outputs
The `merge` recipe adds one report "with ordered labels a0..aN then b0..bN for every declared output."
* **The Problem:** By forcing opaque, mechanically indexed labels, the resulting child destroys the semantic meaning (e.g., `distance`, `color`) of the parents' original output ports. Autonomous agents inspecting the child's report will receive a dictionary of opaque keys (`{a0: 5.0}` instead of `{distance: 5.0}`), severely breaking downstream A2A usability and interpretability.
* **Enhancement:** Concatenate the original output labels with a namespace prefix (e.g., `p0_distance`, `p1_color`) rather than discarding the author's intent for opaque indices.

### C. Source-Only Verification of Lineage
The specification notes that "Seed digest is SHA256 of... complete recipe/style/nonce", but the required `design.heredity` block in the child's source file omits the `recipe` and `style` objects.
* **The Problem:** Because the recipe and style are not embedded in the source, a third-party agent downloading the source file cannot independently hash the pre-image to verify the `seedDigest`. The digest becomes an opaque assertion rather than a cryptographically verifiable proof of honest derivation.
* **Enhancement:** Include the minimal `recipe` and `style` structs directly inside the `design.heredity` JSON block so that offline, source-only recovery can mathematically prove the exact lineage derivation without requiring access to the centralized world ledger.

---

## 3. Candidate Recommendation

The design's approach to bounded evidence, trait saturation, and deterministic state progression is excellent. The explicit constraint that "different hashes alone do not establish novelty" provides a strong defense against combinatorial spam.

**Recommendation:** Proceed to implementation **conditioned** on correcting the namespace injectivity defect for literal inputs in `compose` and `mate`. The utility enhancements regarding guard strictness, merge labels, and offline cryptographic verification should be reviewed by the product team to maximize the usefulness of the offspring to agents, but they are not blockers for a safe, physically sound initial implementation.
