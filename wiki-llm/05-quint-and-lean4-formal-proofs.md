# Track 5: Formal Verification in Quint & Mathematical Theorem Proving in Lean 4

**Council Reports Synthesized:**  
- [`gemini_05_quint_lean_proofs.md`](../research/council_20/gemini_05_quint_lean_proofs.md) (`35.7 KB`)  
- [`grok_05_quint_lean_proofs.md`](../research/council_20/grok_05_quint_lean_proofs.md) (`43.6 KB`)  
- [`muse_05_quint_lean_proofs.md`](../research/council_20/muse_05_quint_lean_proofs.md) (`32.4 KB`)  
- [`sol_05_quint_lean_proofs.md`](../research/council_20/sol_05_quint_lean_proofs.md) (`15.3 KB`)  
**Formal Artifacts:** [`spec/lean/QDL/WovenBody.lean`](../spec/lean/QDL/WovenBody.lean), [`spec/woven-combinations.qnt`](../spec/woven-combinations.qnt)

---

## 1. Machine-Checked Lean 4 Theorems (`spec/lean/QDL/WovenBody.lean`)

The module [`spec/lean/QDL/WovenBody.lean`](../spec/lean/QDL/WovenBody.lean) is imported by [`spec/lean/QDL.lean`](../spec/lean/QDL.lean) and audited by [`scripts/check-lean.sh`](../scripts/check-lean.sh) (`scripts/audit-lean.cjs`). It proves **24 theorems** with **zero `sorry`** and **zero project axioms**, raising the repository's machine-checked theorem count from `83` to **`107` exported QDL theorems**.

### 1.1 Theorem Ledger (`QDL.WovenBody`)

| # | Theorem Name | Mathematical Statement Proved |
| :--- | :--- | :--- |
| 1 | `authoredStrands_bounds` | $8 \le \text{authoredStrands}(F, C, E) \le 16$ |
| 2 | `authoredStrands_admissible` | $8 \le \text{authoredStrands}(F, C, E) \le 40$ |
| 3 | `patch_width_eq` | $\text{patchHi}(m, i) - \text{patchLo}(m, i) = \frac{1}{m}$ |
| 4 | `patch_positive_width` | $1 \le m \implies \text{patchLo}(m, i) < \text{patchHi}(m, i)$ |
| 5 | `patch_contiguous_boundary` | $\text{patchHi}(m, i) = \text{patchLo}(m, i + 1)$ |
| 6 | `patch_start_zero` | $\text{patchLo}(m, 0) = 0$ |
| 7 | `patch_end_one` | $1 \le m \implies \text{patchLo}(m, m) = 1$ |
| 8 | `totalPatchWidth_eq_patchLo` | $\sum_{j=0}^{k-1} (\text{patchHi}(m, j) - \text{patchLo}(m, j)) = \text{patchLo}(m, k)$ |
| 9 | `totalPatchWidth_unit` | $1 \le m \implies \text{totalPatchWidth}(m, m) = 1$ |
| 10 | `strand_territory_coverage` | Combined positive width, boundary contiguity, and exact unit sum on $[0, 1]$ |
| 11 | `patch_in_unit_interval` | $1 \le m \land i < m \implies 0 \le \text{patchLo}(m, i) \land \text{patchHi}(m, i) \le 1$ |
| 12 | `patch_adjacent_disjoint` | Half-open ownership $\text{Owns}(\text{patchLo}_i, \text{patchHi}_i, u) \implies \neg\text{Owns}(\text{patchLo}_{i+1}, \text{patchHi}_{i+1}, u)$ |
| 13 | `affine_scale_pow_bounds` | $s \in [\frac{35}{100}, \frac{67}{100}] \implies (\frac{35}{100})^d \le s^d \le (\frac{67}{100})^d$ |
| 14 | `affine_scale_contractive` | $s \in [\frac{35}{100}, \frac{67}{100}] \land d \ge 1 \implies 0 < s^d \le (\frac{67}{100})^d < 1$ |
| 15 | `geomSeries_identity` | $(1 - s)\sum_{k=0}^d s^k = 1 - s^{d+1}$ |
| 16 | `geomSeries_nonneg` | $0 \le s \implies 0 \le \sum_{k=0}^d s^k$ |
| 17 | `geomSeries_upper_bound` | $s \in [\frac{35}{100}, \frac{67}{100}] \implies \sum_{k=0}^d s^k \le \frac{100}{33}$ |
| 18 | `branchReach_envelope_bound` | $0 \le L \land s \in [\frac{35}{100}, \frac{67}{100}] \implies L\sum_{k=0}^d s^k \le \frac{100}{33}L$ |
| 19 | `hopf_s3_unit_norm` | $(\cos\alpha\cos\theta)^2 + (\cos\alpha\sin\theta)^2 + (\sin\alpha\cos\phi)^2 + (\sin\alpha\sin\phi)^2 = 1$ |
| 20 | `hopf_fourth_coord_abs_le_one` | $|\sin\alpha\sin\phi| \le 1$ |
| 21 | `hopf_stereographic_denom_positive` | $\frac{1}{5} \le \frac{6}{5} - \sin\alpha\sin\phi$ (pole-free stereographic denominator) |
| 22 | `clifford_step_abs_bound` | $|\sin(ay) + c\cos(ax)| \le 1 + |c|$ |
| 23 | `clifford_step_interval_bounds` | $-(1 + |c|) \le \sin(ay) + c\cos(ax) \le 1 + |c|$ |
| 24 | `clifford_authored_enclosure` | $c \in [-\frac{5}{2}, \frac{5}{2}] \implies |\sin(ay) + c\cos(ax)| \le \frac{7}{2}$ |
| 25 | `chimericLerp_interval_bounds` | $p_A, p_B \in [\text{lo}, \text{hi}] \land \lambda \in [0, 1] \implies (1-\lambda)p_A + \lambda p_B \in [\text{lo}, \text{hi}]$ |
| 26 | `chimericLerp_enclosure_bounds` | $p_A, p_B \in [-R, R] \land \lambda \in [0, 1] \implies (1-\lambda)p_A + \lambda p_B \in [-R, R]$ |
| 27 | `chimericLerp_abs_bound` | $|p_A| \le R \land |p_B| \le R \land \lambda \in [0, 1] \implies |(1-\lambda)p_A + \lambda p_B| \le R$ |
| 28 | `chimericSeam_quintic_enclosure` | Quintic $C^2$ seam blend $(1 - H(z))p_A + H(z)p_B \in [-R, R]$ for $z \in [0, 1]$ |
| 29 | `executionOpacity_bounds` | $\alpha, p \in [0, 1] \land g \ge 0 \implies \frac{\alpha + g p}{1 + g} \in [0, 1]$ |
| 30 | `clampedExecutionOpacity_bounds` | $\operatorname{clamp01}(\alpha(1 + g p)) \in [0, 1]$ |

---

## 2. Quint State-Machine Verification (`spec/woven-combinations.qnt`)

[`spec/woven-combinations.qnt`](../spec/woven-combinations.qnt) models:
- All 8 `WovenBody` mechanisms (`0..7`),
- All 4 chimeric combination actions (`combineCompose`, `combineMate`, `combineMerge`, `combineSymbiote`) plus `refuseCombine`,
- All 7 live execution & rendering transitions (`StartRun`, `PushFrame`, `PopFrame`, `EvalOp`, `Done`, `Fault`, `RenderView`).

### 2.1 Verified Safety Invariants (`val safety`)
1. `validMechanisms`: Parent and child mechanisms always stay in `0..7`.
2. `validTerritoryPartition`: $8 \le \text{strands} \le 40$, $2 \le \text{folds} \le 9$, $2 \le \text{childNodes} \le 64$, and normalized patch width sum equals $1000$ ($1.000$).
3. `chimericConvexityBound`: Child spatial enclosure is bounded between $\min(\text{enc}_A, \text{enc}_B)$ and $\max(\text{enc}_A, \text{enc}_B)$.
4. `guardConeProtection`: `compose`, `mate`, and `symbiote` only admit action-free donor cones (`donorPure`), protected recipient guard cones (`guardProtected`), and distinct parent sources.
5. `seamIntegrity`: `compose` and `mate` enforce `hasSeam`, `seamTypeMatch`, and `downstreamFeedsOutput`.
6. `combinationAndViewPassive`: Combination authoring and view rendering never increment `executions` or `effects`.
7. `executionStackAndFuelBounded`: $0 \le \text{stackDepth} \le \text{maxStack}$, $0 \le \text{fuel} \le \text{maxFuel}$, and $\text{fuel} + \text{stepsEvaluated} + \text{stackOps} = \text{maxFuel}$.
8. `activeOwnerBounded`: When `Running`, $-1 \le \text{activeOwner} < \text{childNodes}$; when idle or terminal, $\text{activeOwner} = -1$.
9. `opacityModulationBounded`: Opacity and seam pulse stay in $[0, 1000]$ ($[0, 1]$).
10. `terminalOutcomeSafety`: `Done` requires $\text{stackDepth} = 0$ and emits `childSource`; `Fault` emits `0`.
11. `guardedEffectsOnly`: Effects increment only on `EvalOp` when both `guardOk` and `allowed` hold.
