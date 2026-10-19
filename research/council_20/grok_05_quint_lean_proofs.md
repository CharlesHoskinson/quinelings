# Woven-body formal report

Proposed module `spec/lean/QDL/WovenBody.lean` and proposed specification `spec/woven-combinations.qnt`. This report does not change the repository. The statements below are written so a Lean 4.34.1 / Mathlib kernel can discharge them with `linarith`, `nlinarith`, `omega`, `ring`, and `positivity`, using the same `norm_num`, `field_simp`, `simp`, `exact_mod_cast`, and structural induction already used by `QDL/Geometry.lean` and `QDL/Quine.lean`. They were not submitted to Lake in this turn.

`QDL/Geometry.lean` already proves organ-radius positivity, pinned filament endpoints, `clamp01`, and material-opacity bounds. `QDL/Quine.lean` already proves constructor emission, the repeat budget `n + 1 ≤ 8`, and payload injectivity. `spec/design.qnt` already proves, by finite exploration, source identity, energy conservation, and the separation of render from execution. The proposals extend those three results to woven territories, contractive charts, the Clifford box, a Hopf coordinate identity, chimeric opacity, and multi-mechanism execution.

## 1. Equations and domains

### 1.1 Territory partition

`WovenBody.author` assigns operation `i` of a component that owns `m ≥ 1` operations the material interval

\[
u_i=\left[\frac{i}{m},\frac{i+1}{m}\right],\qquad i\in\{0,\ldots,m-1\}.
\]

Width, abutment, and coverage:

\[
\frac{i+1}{m}-\frac{i}{m}=\frac{1}{m}>0,
\qquad
\frac{i+1}{m}=\text{start of strip }i+1,
\qquad
\sum_{i=0}^{m-1}\frac{1}{m}=1.
\]

The last endpoint is \(1\), and the first is \(0\). The interior sample used by `anchor` is the midpoint

\[
\frac{i}{m}<\frac{2i+1}{2m}<\frac{i+1}{m}.
\]

`ownerAt` uses the half-open convention on every strip except the last: \(i/m \le u < (i+1)/m\). The point \(u=1\) belongs to the strip whose upper endpoint is \(1\).

| Quantity | Authored domain | Validator domain |
| --- | --- | --- |
| Operations per graph | 1–64 | 1–64 |
| Strands | \(\max(8,\min(16,7+F+\lfloor C/2\rfloor+\delta))\) | 8–40 |
| Territories | one positive strip per assigned node | 1–128 |
| Patch coordinate | exact \(i/m\) | each end in \([0,1]\), \(u_0<u_1\), union \([0,1]\), adjacent ends equal |

\(F\) is fanout, \(C\) is convergence, and \(\delta=\min(3,\lfloor D/2\rfloor)\) only for `pleated-braid`.

### 1.2 Contractive recursive affine scale

Validator domain, matching `bounded(t.scale,.35,.67)` and `bounded(g.depth,2,6)`:

\[
s\in\left[\frac{35}{100},\frac{67}{100}\right],\qquad d\in\mathbb{N},\ 0\le d\le 6.
\]

The root chart is stored with scale \(1\). A child stores `parent.scale * rule.scale`. For every rule scale \(s\) and every positive depth \(d\),

\[
0<s^d\le\left(\frac{67}{100}\right)^d<1.
\]

Root length \(L\) satisfies \(L\in[3/10,8/10]\). The chart length at depth \(d\) is \(L_d=L\,s^d\). For \(d\ge 1\),

\[
0<L_d\le\frac{8}{10}\left(\frac{67}{100}\right)^d<\frac{8}{10}.
\]

Let \(r=67/100\). Then \(1-r=33/100\) and

\[
\sum_{k=0}^{n}s^k
\le\sum_{k=0}^{n}r^k
=\frac{1-r^{n+1}}{1-r}
<\frac{1}{1-r}
=\frac{100}{33}.
\]

The corresponding length sum along one address is

\[
\sum_{k=0}^{n}L\,s^k\le\frac{8}{10}\cdot\frac{100}{33}=\frac{80}{33}.
\]

Authored rules lie in a smaller interval: `scale = round4(0.47 + 0.13·U)` for \(U\in[0,1)\), hence in \([0.4700,0.6000]\) before the validator widens the admitted interval to \([0.35,0.67]\). Authored recursion depth is \(\min(5,\max(3,2+\min(3,D)))\), so it sits inside the validator interval \([2,6]\). There are 2 or 3 rules.

One address contracts. A full 3-ary tree does not, because

\[
3\cdot\frac{67}{100}=\frac{201}{100}>1.
\]

The geometric envelope bounds one lineage. It is not a bound on the sum of every branch scale.

### 1.3 Clifford step

`mapStep` is

\[
x'=\sin(ay)+c\cos(ax),\qquad y'=\sin(bx)+e\cos(by).
\]

For every real angle and coefficient,

\[
|\sin(ay)+c\cos(ax)|\le 1+|c|,
\qquad
|\sin(bx)+e\cos(by)|\le 1+|e|.
\]

The density window `bx = 1+|c|`, `by = 1+|e|` is this bound. Validator parameters lie in \([-5/2,5/2]\), so each image coordinate lies in \([-7/2,7/2]\). Initial coordinates lie in \([-3,3]\); one application of the map lands in the box from any real start. Burn, iterations, grid, and critical-image counts remain the integer budgets in `validate` (burn 32–4096, iterations 4096–131072, grid 64–256, critical images 1–16).

### 1.4 Hopf coordinate on \(S^3\)

\[
\begin{aligned}
x_1&=\cos a\cos t,\\
x_2&=\cos a\sin t,\\
x_3&=\sin a\cos p,\\
x_4&=\sin a\sin p.
\end{aligned}
\]

\[
x_1^2+x_2^2+x_3^2+x_4^2
=\cos^2 a\,(\cos^2 t+\sin^2 t)+\sin^2 a\,(\cos^2 p+\sin^2 p)
=\cos^2 a+\sin^2 a
=1.
\]

`toroidal-weave` currently samples the torus \(R=M+m\cos\phi\), \((R\cos\theta,\ R\sin\theta\cdot yScale,\ m\sin\phi)\). The identity above is the unit-norm chart proposed for a Hopf lift of those two angles. The finite Pythagorean witness used by Quint is \(N=25\), with legs drawn from pairs whose squares sum to 25, including \((3,4)\), \((5,0)\), and \((0,5)\).

### 1.5 Chimeric blend and execution opacity

\[
\operatorname{lerp}(a,b,t)=(1-t)a+tb.
\]

For \(a,b,t\in[0,1]\),

\[
0\le 1-t,\quad 0\le t,\quad (1-t)+t=1,\quad 0\le\operatorname{lerp}(a,b,t)\le 1.
\]

Endpoints: \(\operatorname{lerp}(a,b,0)=a\) and \(\operatorname{lerp}(a,b,1)=b\). If \(a\le b\), then \(a\le\operatorname{lerp}(a,b,t)\le b\).

The woven Canvas gate in `lifeform-renderer.js` is

\[
\beta(\alpha)=1-e^{-2\alpha},\qquad
E=\begin{cases}
13/10 & \text{selected and active},\\
1/5 & \text{selected and idle},\\
1 & \text{otherwise.}
\end{cases}
\]

For \(\alpha\ge 0\), \(0\le\beta(\alpha)\le 1\). Therefore

\[
0\le \beta(\operatorname{lerp}(a,b,t))\,E \le 13/10,
\]

and

\[
\operatorname{clamp}_{01}(x)=\max(0,\min(1,x))\in[0,1].
\]

The active gain \(13/10>1\), so the product can leave \([0,1]\) before the clamp. Idle selection uses gain \(1/5\), and an unselected sample uses gain \(1\); both products stay in \([0,1]\) before clamping.

Family point opacity, with \(u\in[0,1]\), \(v\in[-1,1]\), \(\mathrm{env}=\sin(\pi u)\in[0,1]\), and \(\mathrm{edge}=\max(0,\sin(\pi(v+1)/2))\in[0,1]\), is

\[
\alpha_{\mathrm{family}}=(0.012+0.075\,\mathrm{env})\,\mathrm{env}^{1/2}\,(0.3+0.7\,\mathrm{edge})\,(1-0.55|v|).
\]

Every factor is nonnegative and the product is at most \(0.087<1\).

Recursive chart opacity, with compression \(c\in[0,6]\) and envelope \(e\in[0,1]\), is

\[
\alpha_{\mathrm{rec}}
=\frac{(0.065+0.06c)\,e^{3/5}}{(1+0.06d)\,(1+0.4d)^2}.
\]

The denominator is at least 1. Replacing the fractional power by its unit upper bound gives the rational majorant

\[
\alpha_{\mathrm{rec}}\le 0.065+0.06\cdot 6=0.425<1.
\]

### 1.6 Mechanism choice and execution

`author` selects one primary mechanism, in this order:

| Condition | Code | Record name |
| --- | --- | --- |
| guards \(> 0\) | 1 | `clifford-flow` |
| effects \(= 0\), fanout \(\ge 2\), tree-branch opcode | 2 | `recursive-affine` |
| effects \(= 0\), coupled opcode | 3 | `lorenz-flow` |
| effects \(= 0\), fanout \(\le 1\), depth \(\ge 4\), pipeline opcode | 4 | `pleated-braid` |
| fanout \(\ge 2\) | 5 | `recursive-julia` |
| effects \(> 0\) | 6 | `toroidal-weave` |
| convergence \(\ge 2\) | 7 | `logarithmic-mantle` |
| otherwise | 8 | `phyllotaxis-fan` |

A chimera adds a secondary code in \(\{1,\ldots,8\}\setminus\{\mathrm{primary}\}\) and a blend \(t\in\{1,\ldots,1000\}\) milliscale. \(t=0\) means there is no secondary.

Execution follows `design.qnt`: repeats \(\in[1,8]\), executions \(\le\) repeats, effects \(\le\) executions, children \(\le 2\), energy \(\in[0,10]\), and

\[
\mathrm{energy}+\mathrm{executions}+\mathrm{children}=10.
\]

An effect receipt increases only on `execute` when both `guard` and `allowed` hold. A child increases only on `admit`. Render, replay, pause, blend, Hopf sampling, and a Clifford step preserve all three counters. That is the same separation `QDL/Quine.lean` records by giving quote, run, and constructor emission no task rule that returns the running source.

## 2. Drop-in JavaScript

These helpers are the exact arithmetic the theorems talk about. They are written to be pasted beside the existing checkers in `woven-body.js` and `lifeform-families.js`. They do not replace `frame`, `mapStep`, or `author`.

```javascript
'use strict';

const SCALE_MIN_MILLI = 350;
const SCALE_MAX_MILLI = 670;
const LENGTH_MIN_MILLI = 300;
const LENGTH_MAX_MILLI = 800;
const DEPTH_MAX = 6;
const HOPF_N = 25;

function check(ok, message) {
  if (!ok) throw Error('WovenBody: ' + message);
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

function emphasis(selected, active) {
  if (!selected) return 1;
  return active ? 1.3 : 0.2;
}

function beer(alpha) {
  return 1 - Math.exp(-2 * Math.max(0, alpha));
}

/** Chimeric presentation: blend two mechanism opacities, apply the woven gate, clamp. */
function chimericOpacity(alphaA, alphaB, t, selected, active) {
  check(alphaA >= 0 && alphaA <= 1 && alphaB >= 0 && alphaB <= 1, 'opacity domain');
  check(t >= 0 && t <= 1, 'blend domain');
  const blended = lerp(alphaA, alphaB, t);
  return clamp01(beer(blended) * emphasis(selected, active));
}

/** Integer image of one component partition. Widths sum to m; float ends are i/m. */
function territoryStrips(nodeIds, component) {
  const m = nodeIds.length;
  check(Number.isInteger(m) && m >= 1 && m <= 128, 'territory count');
  check(Number.isInteger(component) && component >= 0, 'component');
  let covered = 0;
  const strips = nodeIds.map((node, i) => {
    const lo = i;
    const hi = i + 1;
    check(lo < hi, 'positive width');
    if (i > 0) check(strips[i - 1].hi === lo, 'contiguous boundary');
    covered += hi - lo;
    return {node, component, lo, hi, den: m, u: [i / m, (i + 1) / m]};
  });
  check(covered === m && strips[0].u[0] === 0 && strips[m - 1].u[1] === 1, 'unit coverage');
  return strips;
}

function selectMechanism(topology, profile) {
  const t = topology;
  if (t.guards > 0) return 'clifford-flow';
  if (t.effects === 0 && t.fanout >= 2 && profile.hasTreeBranch) return 'recursive-affine';
  if (t.effects === 0 && profile.hasCoupled) return 'lorenz-flow';
  if (t.effects === 0 && t.fanout <= 1 && t.depth >= 4 && profile.hasPipelineFold) return 'pleated-braid';
  if (t.fanout >= 2) return 'recursive-julia';
  if (t.effects > 0) return 'toroidal-weave';
  if (t.convergence >= 2) return 'logarithmic-mantle';
  return 'phyllotaxis-fan';
}

function powBig(base, depth) {
  let value = 1n;
  const b = BigInt(base);
  for (let k = 0; k < depth; k++) value *= b;
  return value;
}

/** Exact milliscale form of 0 < s^d <= (67/100)^d < 1 for d >= 1, depth <= 6. */
function scaleDecayHolds(scaleMilli, depth) {
  check(Number.isInteger(scaleMilli) && Number.isInteger(depth), 'integer scale');
  check(scaleMilli >= SCALE_MIN_MILLI && scaleMilli <= SCALE_MAX_MILLI, 'scale interval');
  check(depth >= 0 && depth <= DEPTH_MAX, 'depth cap');
  const value = powBig(scaleMilli, depth);
  const cap = powBig(SCALE_MAX_MILLI, depth);
  const unit = powBig(1000, depth);
  check(value >= 1n && value <= cap, 'power envelope');
  if (depth >= 1) check(cap < unit, 'strict contraction');
  return true;
}

function lineageEnvelopeHolds(lengthMilli, scaleMilli, depth) {
  scaleDecayHolds(scaleMilli, depth);
  check(lengthMilli >= LENGTH_MIN_MILLI && lengthMilli <= LENGTH_MAX_MILLI, 'length interval');
  const scalePow = powBig(scaleMilli, depth);
  const capPow = powBig(SCALE_MAX_MILLI, depth);
  check(BigInt(lengthMilli) * scalePow <= BigInt(LENGTH_MAX_MILLI) * capPow, 'length envelope');
  if (depth >= 1) {
    check(BigInt(lengthMilli) * scalePow < BigInt(LENGTH_MAX_MILLI) * powBig(1000, depth), 'strict shortening');
  }
  return true;
}

function cliffordImage(a, b, c, e, x, y) {
  return [Math.sin(a * y) + c * Math.cos(a * x), Math.sin(b * x) + e * Math.cos(b * y)];
}

function cliffordInsideBox(c, e, x, y) {
  return Math.abs(x) <= 1 + Math.abs(c) && Math.abs(y) <= 1 + Math.abs(e);
}

function hopfCoordinates(a, t, p) {
  const ca = Math.cos(a), sa = Math.sin(a);
  return [ca * Math.cos(t), ca * Math.sin(t), sa * Math.cos(p), sa * Math.sin(p)];
}

function hopfNormSquared(q) {
  return q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3];
}

/** Integer Hopf witness: each leg pair lies on the circle of radius sqrt(N). */
function hopfIntegerNorm(ca, sa, ct, st, cp, sp, n = HOPF_N) {
  check(ca * ca + sa * sa === n && ct * ct + st * st === n && cp * cp + sp * sp === n, 'leg');
  const h1 = ca * ct, h2 = ca * st, h3 = sa * cp, h4 = sa * sp;
  check(h1 * h1 + h2 * h2 + h3 * h3 + h4 * h4 === n * n, 'unit witness');
  return n * n;
}

function familyOpacity(env, edge, v) {
  return (0.012 + 0.075 * env) * Math.sqrt(Math.max(0, env)) * (0.3 + 0.7 * edge) * (1 - 0.55 * Math.abs(v));
}

module.exports = {
  clamp01, lerp, emphasis, beer, chimericOpacity, territoryStrips, selectMechanism,
  scaleDecayHolds, lineageEnvelopeHolds, cliffordImage, cliffordInsideBox,
  hopfCoordinates, hopfNormSquared, hopfIntegerNorm, familyOpacity
};
```

Call sites, kept as formulas rather than edits:

- In `woven-body.js` `author`, the existing loop `u:[i/m,(i+1)/m]` is `territoryStrips(assigned.map(n => n.id), k)` with the `u` field retained and `lo/hi/den` discarded before the record is stored.
- In `validate` for `recursive-affine`, after `bounded(t.scale,.35,.67)`, call `scaleDecayHolds(Math.round(t.scale * 1000), g.depth)` only when `t.scale * 1000` is an integer milliscale value. Decimal scales that are not exact milliscale values stay under the existing `bounded` check; the BigInt check is the exact rational image.
- Around `mapStep`, `cliffordInsideBox(c, e, nx, ny)` is the box invariant for the returned point. The comparison is a real-arithmetic obligation; IEEE rounding can miss it by an ulp, which is why Lean states the inequality over \(\mathbb{R}\).
- In `lifeform-families.js` `point` and `frame`, `familyOpacity` is the current product. A secondary mechanism, when a combination record exists, replaces the stored alpha by `chimericOpacity(alphaPrimary, alphaSecondary, blend, selected, active)`.

## 3. Quint specification

Proposed file `spec/woven-combinations.qnt`. Integer milliscale stands in for the rational interval. Codes 1–8 are the mechanism table. `presented` is the integer skeleton of clamp(emphasis · lerp). The exponential beer gate is the Lean theorem; Quint has no exact real exponential. Geometric sums use the cleared-denominator form

\[
S(b,n)=\sum_{k=0}^{n} b^k\,1000^{n-k},\qquad (1000-b)\,S(b,n)=1000^{n+1}-b^{n+1}.
\]

```quint
// Finite combination and execution model for an experimental woven body.
// Milliscale integers stand for exact rationals. Sine, cosine, and exp stay in Lean.
module woven_combinations {
  type State = {
    guards: int, effects: int, fanout: int, depth: int, convergence: int,
    tree: bool, coupled: bool, pipeline: bool,
    primary: int, secondary: int, blend: int, patches: int,
    source: int, repeats: int, executions: int, effectsRun: int, children: int, energy: int,
    paused: bool, phase: int, last: str,
    priorEffects: int, priorExecutions: int, priorChildren: int,
    guard: bool, allowed: bool, emitted: int,
    selected: bool, activeNode: bool, alphaA: int, alphaB: int, shown: int,
    scale: int, recurDepth: int, length: int,
    c: int, e: int, x: int, y: int,
    ca: int, sa: int, ct: int, st: int, cp: int, sp: int
  }
  var s: State
  pure val mechanisms = Set(1, 2, 3, 4, 5, 6, 7, 8)
  pure val hopfN = 25

  pure def selectMechanism(guards: int, effects: int, fanout: int, depth: int, convergence: int,
      tree: bool, coupled: bool, pipeline: bool): int =
    if (guards > 0) 1
    else if (effects == 0 and fanout >= 2 and tree) 2
    else if (effects == 0 and coupled) 3
    else if (effects == 0 and fanout <= 1 and depth >= 4 and pipeline) 4
    else if (fanout >= 2) 5
    else if (effects > 0) 6
    else if (convergence >= 2) 7
    else 8

  pure def lerpMilli(a: int, b: int, t: int): int = ((1000 - t) * a + t * b) / 1000
  pure def emphasisMilli(selected: bool, active: bool): int =
    if (selected) (if (active) 1300 else 200) else 1000
  pure def clampMilli(x: int): int = if (x < 0) 0 else if (x > 1000) 1000 else x
  pure def presented(a: int, b: int, t: int, selected: bool, active: bool): int =
    clampMilli(lerpMilli(a, b, t) * emphasisMilli(selected, active) / 1000)

  pure def p0(b: int): int = 1
  pure def p1(b: int): int = b
  pure def p2(b: int): int = b * b
  pure def p3(b: int): int = p2(b) * b
  pure def p4(b: int): int = p3(b) * b
  pure def p5(b: int): int = p4(b) * b
  pure def p6(b: int): int = p5(b) * b
  pure def p7(b: int): int = p6(b) * b
  pure def powMilli(b: int, d: int): int =
    if (d <= 0) p0(b) else if (d == 1) p1(b) else if (d == 2) p2(b)
    else if (d == 3) p3(b) else if (d == 4) p4(b) else if (d == 5) p5(b)
    else if (d == 6) p6(b) else if (d == 7) p7(b) else 0
  pure def g0(b: int): int = 1
  pure def g1(b: int): int = 1000 * g0(b) + p1(b)
  pure def g2(b: int): int = 1000 * g1(b) + p2(b)
  pure def g3(b: int): int = 1000 * g2(b) + p3(b)
  pure def g4(b: int): int = 1000 * g3(b) + p4(b)
  pure def g5(b: int): int = 1000 * g4(b) + p5(b)
  pure def g6(b: int): int = 1000 * g5(b) + p6(b)
  pure def geoSum(b: int, n: int): int =
    if (n <= 0) g0(b) else if (n == 1) g1(b) else if (n == 2) g2(b)
    else if (n == 3) g3(b) else if (n == 4) g4(b) else if (n == 5) g5(b)
    else if (n == 6) g6(b) else 0

  pure def boxOf(coeff: int): int = 1000 + (if (coeff < 0) -coeff else coeff)
  pure def pythag(u: int, v: int): bool = u * u + v * v == hopfN
  pure def hopfSum(ca: int, sa: int, ct: int, st: int, cp: int, sp: int): int = {
    val h1 = ca * ct
    val h2 = ca * st
    val h3 = sa * cp
    val h4 = sa * sp
    h1 * h1 + h2 * h2 + h3 * h3 + h4 * h4
  }
  pure def widthSum(m: int): int =
    if (m <= 0) 0 else 0.to(m - 1).fold(0, (acc, i) => acc + ((i + 1) - i))

  pure def base(guards: int, effects: int, fanout: int, depth: int, convergence: int,
      tree: bool, coupled: bool, pipeline: bool, scale: int, recurDepth: int,
      length: int, patches: int, secondary: int, blend: int): State = {
    val primary = selectMechanism(guards, effects, fanout, depth, convergence, tree, coupled, pipeline)
    val shown = presented(400, 700, blend, false, false)
    {guards: guards, effects: effects, fanout: fanout, depth: depth, convergence: convergence,
      tree: tree, coupled: coupled, pipeline: pipeline,
      primary: primary, secondary: secondary, blend: blend, patches: patches,
      source: 1, repeats: 4, executions: 0, effectsRun: 0, children: 0, energy: 10,
      paused: false, phase: 0, last: "init",
      priorEffects: 0, priorExecutions: 0, priorChildren: 0,
      guard: false, allowed: false, emitted: 0,
      selected: false, activeNode: false, alphaA: 400, alphaB: 700, shown: shown,
      scale: scale, recurDepth: recurDepth, length: length,
      c: 1000, e: 700, x: 0, y: 0,
      ca: 3, sa: 4, ct: 5, st: 0, cp: 0, sp: 5}
  }

  action init = s' = base(0, 0, 1, 1, 0, false, false, false, 470, 0, 640, 4, 0, 0)
  def snapshot(kind: str): State = s.with("last", kind)
    .with("priorEffects", s.effectsRun)
    .with("priorExecutions", s.executions)
    .with("priorChildren", s.children)

  action render = s' = snapshot("render")
    .with("phase", if (s.paused) s.phase else (s.phase + 1) % 4)
  action replay = s' = snapshot("replay")
  action togglePause = s' = snapshot("pause").with("paused", not(s.paused))
  action selectNode(on: bool): bool = s' = snapshot("select").with("selected", on)
    .with("shown", presented(s.alphaA, s.alphaB, s.blend, on, s.activeNode))

  action blend(sec: int, t: int): bool = all {
    (sec == 0 and t == 0) or
      (mechanisms.contains(sec) and sec != s.primary and t >= 1 and t <= 1000),
    s' = snapshot("blend").with("secondary", sec).with("blend", t)
      .with("shown", presented(s.alphaA, s.alphaB, t, s.selected, s.activeNode))
  }

  action execute(guard: bool, allowed: bool): bool = all {
    s.executions < s.repeats,
    s.energy > 0,
    s' = snapshot("execute")
      .with("executions", s.executions + 1)
      .with("effectsRun", s.effectsRun + (if (guard and allowed) 1 else 0))
      .with("guard", guard).with("allowed", allowed)
      .with("emitted", s.source)
      .with("energy", s.energy - 1)
      .with("activeNode", true)
      .with("shown", presented(s.alphaA, s.alphaB, s.blend, s.selected, true))
  }
  pure def canAdmit(candidate: int): bool =
    s.emitted == s.source and candidate == s.source and s.children < 2 and s.energy > 0
  action admit(candidate: int): bool = all {
    canAdmit(candidate),
    s' = snapshot("admit").with("children", s.children + 1).with("energy", s.energy - 1)
  }
  action reject(candidate: int): bool = all {
    not(canAdmit(candidate)),
    s' = snapshot("reject")
  }
  action cliffordStep(nx: int, ny: int): bool = all {
    nx >= -boxOf(s.c) and nx <= boxOf(s.c) and ny >= -boxOf(s.e) and ny <= boxOf(s.e),
    s' = snapshot("clifford").with("x", nx).with("y", ny)
  }
  action hopfPick(ca: int, sa: int, ct: int, st: int, cp: int, sp: int): bool = all {
    pythag(ca, sa), pythag(ct, st), pythag(cp, sp),
    s' = snapshot("hopf").with("ca", ca).with("sa", sa).with("ct", ct).with("st", st)
      .with("cp", cp).with("sp", sp)
  }
  action reauthor(guards: int, effects: int, fanout: int, depth: int, convergence: int,
      tree: bool, coupled: bool, pipeline: bool): bool = all {
    guards >= 0 and guards <= 8 and effects >= 0 and effects <= 8 and
      fanout >= 0 and fanout <= 8 and depth >= 0 and depth <= 8 and
      convergence >= 0 and convergence <= 8,
    s' = base(guards, effects, fanout, depth, convergence, tree, coupled, pipeline,
      s.scale, s.recurDepth, s.length, s.patches, 0, 0).with("last", "reauthor")
  }

  action step = {
    nondet bit = Set(false, true).oneOf()
    nondet token = Set(1, 2, 8).oneOf()
    nondet blendT = Set(0, 500, 1000).oneOf()
    nondet feature = Set(0, 1, 2, 4).oneOf()
    nondet coord = Set(-1700, 0, 1700).oneOf()
    any {
      render, replay, togglePause, selectNode(bit),
      blend(if (bit) 0 else token, if (bit) 0 else blendT),
      execute(bit, not(bit)), admit(s.source), reject(s.source),
      cliffordStep(coord, coord),
      hopfPick(3, 4, 5, 0, 0, 5), hopfPick(5, 0, 0, 5, 4, 3),
      reauthor(feature, feature, feature, feature, feature, bit, bit, bit)
    }
  }

  val precedence = s.primary == selectMechanism(s.guards, s.effects, s.fanout, s.depth,
    s.convergence, s.tree, s.coupled, s.pipeline) and mechanisms.contains(s.primary)
  val chimera = (s.secondary == 0 and s.blend == 0) or
    (mechanisms.contains(s.secondary) and s.secondary != s.primary and s.blend >= 1 and s.blend <= 1000)
  val partition = s.patches >= 1 and s.patches <= 8 and widthSum(s.patches) == s.patches and
    0.to(s.patches - 1).forall(i => i >= 0 and i < s.patches and (i + 1) - i == 1) and
    (s.patches - 1) + 1 == s.patches
  val convex = s.alphaA >= 0 and s.alphaA <= 1000 and s.alphaB >= 0 and s.alphaB <= 1000 and
    s.blend >= 0 and s.blend <= 1000 and
    lerpMilli(s.alphaA, s.alphaB, s.blend) >= 0 and
    lerpMilli(s.alphaA, s.alphaB, s.blend) <= 1000 and
    Set(200, 1000, 1300).contains(emphasisMilli(s.selected, s.activeNode)) and
    s.shown == presented(s.alphaA, s.alphaB, s.blend, s.selected, s.activeNode) and
    s.shown >= 0 and s.shown <= 1000
  val contractive = s.scale >= 350 and s.scale <= 670 and s.recurDepth >= 0 and s.recurDepth <= 6 and
    s.length >= 300 and s.length <= 800 and
    powMilli(s.scale, s.recurDepth) >= 1 and
    powMilli(s.scale, s.recurDepth) <= powMilli(670, s.recurDepth) and
    (s.recurDepth == 0 or powMilli(670, s.recurDepth) < powMilli(1000, s.recurDepth)) and
    330 * geoSum(670, s.recurDepth) == powMilli(1000, s.recurDepth + 1) - powMilli(670, s.recurDepth + 1) and
    geoSum(s.scale, s.recurDepth) <= geoSum(670, s.recurDepth) and
    330 * geoSum(s.scale, s.recurDepth) < powMilli(1000, s.recurDepth + 1) and
    s.length * powMilli(s.scale, s.recurDepth) <= 800 * powMilli(670, s.recurDepth) and
    (s.recurDepth == 0 or s.length * powMilli(s.scale, s.recurDepth) < 800 * powMilli(1000, s.recurDepth))
  val cliffordBox = s.c >= -2500 and s.c <= 2500 and s.e >= -2500 and s.e <= 2500 and
    s.x >= -boxOf(s.c) and s.x <= boxOf(s.c) and s.y >= -boxOf(s.e) and s.y <= boxOf(s.e)
  val hopf = pythag(s.ca, s.sa) and pythag(s.ct, s.st) and pythag(s.cp, s.sp) and
    hopfSum(s.ca, s.sa, s.ct, s.st, s.cp, s.sp) == hopfN * hopfN
  val bounded = s.repeats >= 1 and s.repeats <= 8 and s.executions >= 0 and s.executions <= s.repeats and
    s.effectsRun >= 0 and s.effectsRun <= s.executions and s.children >= 0 and s.children <= 2 and
    s.energy >= 0 and s.energy <= 10 and s.phase >= 0 and s.phase <= 3
  val conserved = s.energy + s.executions + s.children == 10
  val passiveViews = Set("init", "render", "replay", "pause", "select", "blend", "reject",
      "clifford", "hopf", "reauthor").contains(s.last) implies
    s.effectsRun == s.priorEffects and s.executions == s.priorExecutions and s.children == s.priorChildren
  val onlyExecutionEffects = s.last != "execute" implies s.effectsRun == s.priorEffects
  val onlyAdmissionChildren = s.last != "admit" implies s.children == s.priorChildren
  val guardedEffects = s.last != "execute" or
    (s.executions == s.priorExecutions + 1 and
      s.effectsRun == s.priorEffects + (if (s.guard and s.allowed) 1 else 0) and
      s.emitted == s.source)
  val safety = precedence and chimera and partition and convex and contractive and cliffordBox and
    hopf and bounded and conserved and passiveViews and onlyExecutionEffects and
    onlyAdmissionChildren and guardedEffects

  action unsafeOpacity = s' = snapshot("render").with("shown", 1001)
  action unsafePrimary = s' = snapshot("render").with("primary", 0)
  action unsafeGap = s' = snapshot("render").with("patches", 0)
  action unsafeScale = s' = snapshot("render").with("scale", 671)
  action unsafeClifford = s' = snapshot("clifford").with("x", boxOf(s.c) + 1)
  action unsafeHopf = s' = snapshot("hopf").with("ca", 1).with("sa", 1)
  action unsafeReplay = s' = snapshot("render").with("effectsRun", s.effectsRun + 1)

  run passiveBlendTest = init.then(blend(2, 500)).then(render).then(replay).then(togglePause)
    .expect(safety and s.executions == 0 and s.effectsRun == 0 and s.primary == 8 and s.secondary == 2)
  run precedenceCliffordTest = init.then(reauthor(1, 0, 4, 5, 3, true, true, true))
    .expect(safety and s.primary == 1 and s.secondary == 0 and s.executions == 0)
  run guardedExecutionTest = init.then(execute(false, true))
    .expect(safety and s.executions == 1 and s.effectsRun == 0 and s.emitted == s.source and s.energy == 9)
  run admissionTest = init.then(execute(true, true)).then(admit(s.source))
    .expect(safety and s.effectsRun == 1 and s.children == 1 and s.energy == 8)
  run rejectBeforeEmissionTest = init.then(reject(s.source))
    .expect(safety and s.children == 0 and s.energy == 10)
  run hopfWitnessTest = init.then(hopfPick(5, 0, 0, 5, 3, 4))
    .expect(safety and hopfSum(s.ca, s.sa, s.ct, s.st, s.cp, s.sp) == 625)
  run cliffordBoxTest = init.then(cliffordStep(1700, -1700))
    .expect(safety and s.x == 1700 and s.executions == 0)
  run contractiveDepthTest = init.then(4).then(4)  // placeholder replaced below
  run detectsUnsafeOpacityTest = init.then(unsafeOpacity).expect(not(convex) and passiveViews)
  run detectsUnsafePrimaryTest = init.then(unsafePrimary).expect(not(precedence))
  run detectsUnsafeGapTest = init.then(unsafeGap).expect(not(partition))
  run detectsUnsafeScaleTest = init.then(unsafeScale).expect(not(contractive))
  run detectsUnsafeCliffordTest = init.then(unsafeClifford).expect(not(cliffordBox))
  run detectsUnsafeHopfTest = init.then(unsafeHopf).expect(not(hopf))
  run detectsUnsafeReplayTest = init.then(unsafeReplay).expect(not(onlyExecutionEffects) and not(passiveViews))
}
```

The `contractiveDepthTest` line above is a draft marker. The runnable run is:

```quint
  action setDeep = s' = snapshot("render").with("recurDepth", 6).with("scale", 670).with("length", 800)
  run contractiveDepthTest = init.then(setDeep)
    .expect(safety and s.recurDepth == 6 and powMilli(670, 6) < powMilli(1000, 6))
```

`setDeep` is a presentation step: it changes only scale parameters and keeps the execution counters equal to their priors. Add `setDeep` next to `replay`, and delete the placeholder run. With that substitution the module is closed.

Adoption check, matching the other formal scripts:

```sh
quint typecheck spec/woven-combinations.qnt
quint test spec/woven-combinations.qnt --max-samples=100 --backend=typescript
quint run spec/woven-combinations.qnt --invariant=safety --max-samples=1000 --max-steps=40 --seed=20261019 --backend=typescript
```

## 4. Lean 4 module

Proposed file `spec/lean/QDL/WovenBody.lean`. After adoption, `spec/lean/QDL.lean` gains `import QDL.WovenBody`. No `sorry`, no project axiom.

```lean
import Mathlib.Tactic
import Mathlib.Algebra.BigOperators.Group.Finset.Basic
import Mathlib.Algebra.BigOperators.Ring.Finset
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic
import Mathlib.Analysis.Complex.Exponential

/-! Exact rational and real obligations for woven territories, contractive
charts, the Clifford box, Hopf coordinates, and chimeric opacity.
These are not IEEE-754 theorems and not a refinement of `frame`. -/
namespace QDL.WovenBody

def stripLo (i m : ℕ) : ℚ := (i : ℚ) / m
def stripHi (i m : ℕ) : ℚ := ((i + 1 : ℕ) : ℚ) / m

theorem strip_width {i m : ℕ} (hm : 0 < m) :
    stripHi i m - stripLo i m = (1 : ℚ) / m := by
  unfold stripHi stripLo
  have hden : (m : ℚ) ≠ 0 := by exact_mod_cast (Nat.ne_of_gt hm)
  field_simp [hden]
  ring

theorem strip_positive_width {i m : ℕ} (hm : 0 < m) :
    0 < stripHi i m - stripLo i m := by
  rw [strip_width hm]
  have : (0 : ℚ) < (m : ℚ) := by exact_mod_cast hm
  positivity

theorem strip_contiguous (i m : ℕ) : stripHi i m = stripLo (i + 1) m := by
  unfold stripHi stripLo
  rfl

theorem strip_start (m : ℕ) : stripLo 0 m = 0 := by
  unfold stripLo
  simp

theorem strip_end {m : ℕ} (hm : 0 < m) : stripHi (m - 1) m = 1 := by
  unfold stripHi
  have hindex : (m - 1 + 1 : ℕ) = m := by omega
  rw [hindex]
  have hden : (m : ℚ) ≠ 0 := by exact_mod_cast (Nat.ne_of_gt hm)
  field_simp [hden]

theorem strip_span {m : ℕ} (hm : 0 < m) : stripHi (m - 1) m - stripLo 0 m = 1 := by
  rw [strip_end hm, strip_start]
  ring

theorem strip_widths_sum {m : ℕ} (hm : 0 < m) :
    ∑ i ∈ Finset.range m, (stripHi i m - stripLo i m) = 1 := by
  have hden : (m : ℚ) ≠ 0 := by exact_mod_cast (Nat.ne_of_gt hm)
  simp only [strip_width hm, Finset.sum_const, Finset.card_range]
  field_simp [hden]
  ring

theorem strip_midpoint_interior {i m : ℕ} (hm : 0 < m) :
    stripLo i m < (stripLo i m + stripHi i m) / 2 ∧
      (stripLo i m + stripHi i m) / 2 < stripHi i m := by
  have hwidth := strip_positive_width (i := i) hm
  constructor <;> linarith

def Owns (lo hi u : ℚ) : Prop := lo ≤ u ∧ u < hi

theorem boundary_goes_to_next {i m : ℕ} (hm : 0 < m) (hi : i + 1 < m) :
    ¬ Owns (stripLo i m) (stripHi i m) (stripHi i m) ∧
      Owns (stripLo (i + 1) m) (stripHi (i + 1) m) (stripHi i m) := by
  have hcur := strip_positive_width (i := i) hm
  have hnext := strip_positive_width (i := i + 1) hm
  constructor
  · intro owned
    rcases owned with ⟨_, upper⟩
    linarith
  · constructor
    · simpa [strip_contiguous] using (le_refl (stripHi i m))
    · have : stripLo (i + 1) m < stripHi (i + 1) m := by linarith
      simpa [strip_contiguous] using this

def scaleMin : ℚ := 35 / 100
def scaleMax : ℚ := 67 / 100

theorem scaleMin_pos : 0 < scaleMin := by unfold scaleMin; norm_num
theorem scaleMax_pos : 0 < scaleMax := by unfold scaleMax; norm_num
theorem scaleMax_lt_one : scaleMax < 1 := by unfold scaleMax; norm_num

theorem contractive_pow_pos {s : ℚ} {d : ℕ} (hs : 0 < s) : 0 < s ^ d := by
  positivity

theorem contractive_pow_le {s : ℚ} {d : ℕ} (hs0 : 0 ≤ s) (hs : s ≤ scaleMax) :
    s ^ d ≤ scaleMax ^ d := by
  induction d with
  | zero => simp
  | succ d ih =>
      have hmax0 : 0 ≤ scaleMax := le_of_lt scaleMax_pos
      have hsPow : 0 ≤ s ^ d := by positivity
      have hmaxPow : 0 ≤ scaleMax ^ d := by positivity
      have h1 : s * s ^ d ≤ scaleMax * s ^ d := by nlinarith
      have h2 : scaleMax * s ^ d ≤ scaleMax * scaleMax ^ d := by nlinarith [ih]
      calc
        s ^ (d + 1) = s * s ^ d := by ring
        _ ≤ scaleMax * s ^ d := h1
        _ ≤ scaleMax * scaleMax ^ d := h2
        _ = scaleMax ^ (d + 1) := by ring

theorem max_pow_le_max {d : ℕ} (hd : 1 ≤ d) : scaleMax ^ d ≤ scaleMax := by
  induction d with
  | zero => omega
  | succ d ih =>
      cases d with
      | zero => simp
      | succ d =>
          have ih' : scaleMax ^ (d + 1) ≤ scaleMax := ih (by omega)
          have hle : scaleMax ≤ 1 := le_of_lt scaleMax_lt_one
          have hpos : 0 ≤ scaleMax ^ (d + 1) := by positivity
          calc
            scaleMax ^ (d + 2) = scaleMax * scaleMax ^ (d + 1) := by ring
            _ ≤ 1 * scaleMax ^ (d + 1) := by nlinarith [hle, hpos]
            _ = scaleMax ^ (d + 1) := by ring
            _ ≤ scaleMax := ih'

theorem max_pow_lt_one {d : ℕ} (hd : 1 ≤ d) : scaleMax ^ d < 1 :=
  lt_of_le_of_lt (max_pow_le_max hd) scaleMax_lt_one

/-- The requested decay: `0 < s^d ≤ (67/100)^d < 1` for positive depth. -/
theorem contractive_decay {s : ℚ} {d : ℕ}
    (hlo : scaleMin ≤ s) (hhi : s ≤ scaleMax) (hd : 1 ≤ d) :
    0 < s ^ d ∧ s ^ d ≤ scaleMax ^ d ∧ scaleMax ^ d < 1 := by
  have hs : 0 < s := lt_of_lt_of_le scaleMin_pos hlo
  exact ⟨contractive_pow_pos hs, contractive_pow_le (le_of_lt hs) hhi, max_pow_lt_one hd⟩

theorem chart_length_lt_root_max {length scale : ℚ} {d : ℕ}
    (hl : 0 ≤ length ∧ length ≤ 8 / 10) (hs : 0 ≤ scale ∧ scale ≤ scaleMax) (hd : 1 ≤ d) :
    length * scale ^ d < 8 / 10 := by
  have hpow : scale ^ d ≤ scaleMax :=
    le_trans (contractive_pow_le hs.1 hs.2) (max_pow_le_max hd)
  have hlen : length * scale ^ d ≤ (8 / 10) * scaleMax := by nlinarith [hl.1, hl.2, hpow, scaleMax_pos]
  have hstrict : (8 / 10) * scaleMax < 8 / 10 := by unfold scaleMax; norm_num
  linarith

theorem branching_mass_expands : (3 : ℚ) * scaleMax > 1 := by
  unfold scaleMax
  norm_num

theorem geo_closed_form {r : ℚ} (hr : r ≠ 1) (n : ℕ) :
    ∑ k ∈ Finset.range (n + 1), r ^ k = (1 - r ^ (n + 1)) / (1 - r) := by
  have hden : (1 - r) ≠ 0 := by intro h; apply hr; linarith
  induction n with
  | zero =>
      simp [Finset.sum_range_one]
      field_simp [hden]
      ring
  | succ n ih =>
      rw [Finset.sum_range_succ, ih]
      field_simp [hden]
      ring

theorem geo_max_closed (n : ℕ) :
    ∑ k ∈ Finset.range (n + 1), scaleMax ^ k
      = (1 - scaleMax ^ (n + 1)) / (1 - scaleMax) := by
  have hr : scaleMax ≠ 1 := by intro h; have := scaleMax_lt_one; linarith
  exact geo_closed_form hr n

theorem geo_sum_le {s : ℚ} {n : ℕ} (hs0 : 0 ≤ s) (hs : s ≤ scaleMax) :
    ∑ k ∈ Finset.range (n + 1), s ^ k ≤ ∑ k ∈ Finset.range (n + 1), scaleMax ^ k := by
  refine Finset.sum_le_sum ?_
  intro k _
  exact contractive_pow_le hs0 hs

theorem geo_envelope {s : ℚ} {n : ℕ} (hs0 : 0 ≤ s) (hs : s ≤ scaleMax) :
    ∑ k ∈ Finset.range (n + 1), s ^ k
      ≤ (1 - scaleMax ^ (n + 1)) / (1 - scaleMax) := by
  have h := geo_sum_le (n := n) hs0 hs
  rwa [geo_max_closed n] at h

theorem envelope_constant : 1 / (1 - scaleMax) = 100 / 33 := by
  unfold scaleMax
  norm_num

theorem geo_closed_le_reciprocal (n : ℕ) :
    (1 - scaleMax ^ (n + 1)) / (1 - scaleMax) ≤ 1 / (1 - scaleMax) := by
  have hden : 0 < 1 - scaleMax := by linarith [scaleMax_lt_one]
  have hpow : scaleMax ^ (n + 1) ≤ 1 := le_of_lt (max_pow_lt_one (by omega))
  have hnum : 1 - scaleMax ^ (n + 1) ≤ 1 := by linarith
  exact div_le_div_of_nonneg_right hnum (le_of_lt hden)

theorem lineage_length_envelope {length scale : ℚ} {n : ℕ}
    (hl0 : 0 ≤ length) (hl : length ≤ 8 / 10) (hs0 : 0 ≤ scale) (hs : scale ≤ scaleMax) :
    ∑ k ∈ Finset.range (n + 1), length * scale ^ k ≤ (8 / 10) * (100 / 33) := by
  have hsum := geo_envelope (n := n) hs0 hs
  have hrec := geo_closed_le_reciprocal n
  have hden : 0 < 1 - scaleMax := by linarith [scaleMax_lt_one]
  have hpow : scaleMax ^ (n + 1) ≤ 1 := le_of_lt (max_pow_lt_one (by omega))
  have hclosed0 : 0 ≤ (1 - scaleMax ^ (n + 1)) / (1 - scaleMax) := by
    have hnum : 0 ≤ 1 - scaleMax ^ (n + 1) := by linarith
    exact div_nonneg hnum (le_of_lt hden)
  have hrecip0 : 0 ≤ 1 / (1 - scaleMax) := by positivity
  have hmul : length * ∑ k ∈ Finset.range (n + 1), scale ^ k
      ≤ (8 / 10) * (1 / (1 - scaleMax)) := by nlinarith [hsum, hrec, hl0, hl, hclosed0, hrecip0]
  rw [← Finset.mul_sum] at hmul
  have hconst : (8 / 10) * (1 / (1 - scaleMax)) = (8 / 10) * (100 / 33) := by
    rw [envelope_constant]
  linarith

theorem hopf_s3_unit_norm (a t p : ℝ) :
    (Real.cos a * Real.cos t) ^ 2 + (Real.cos a * Real.sin t) ^ 2
      + (Real.sin a * Real.cos p) ^ 2 + (Real.sin a * Real.sin p) ^ 2 = 1 := by
  have ht : Real.cos t ^ 2 + Real.sin t ^ 2 = 1 := Real.cos_sq_add_sin_sq t
  have hp : Real.cos p ^ 2 + Real.sin p ^ 2 = 1 := Real.cos_sq_add_sin_sq p
  have ha : Real.cos a ^ 2 + Real.sin a ^ 2 = 1 := Real.cos_sq_add_sin_sq a
  have split :
      (Real.cos a * Real.cos t) ^ 2 + (Real.cos a * Real.sin t) ^ 2
        + (Real.sin a * Real.cos p) ^ 2 + (Real.sin a * Real.sin p) ^ 2
      = Real.cos a ^ 2 * (Real.cos t ^ 2 + Real.sin t ^ 2)
        + Real.sin a ^ 2 * (Real.cos p ^ 2 + Real.sin p ^ 2) := by ring
  calc
    (Real.cos a * Real.cos t) ^ 2 + (Real.cos a * Real.sin t) ^ 2
        + (Real.sin a * Real.cos p) ^ 2 + (Real.sin a * Real.sin p) ^ 2
        = Real.cos a ^ 2 * (Real.cos t ^ 2 + Real.sin t ^ 2)
          + Real.sin a ^ 2 * (Real.cos p ^ 2 + Real.sin p ^ 2) := split
    _ = Real.cos a ^ 2 * 1 + Real.sin a ^ 2 * 1 := by rw [ht, hp]
    _ = Real.cos a ^ 2 + Real.sin a ^ 2 := by ring
    _ = 1 := ha

theorem clifford_step_bound (angle coeff phase : ℝ) :
    |Real.sin angle + coeff * Real.cos phase| ≤ 1 + |coeff| := by
  have hs : |Real.sin angle| ≤ 1 := Real.abs_sin_le_one angle
  have hc : |Real.cos phase| ≤ 1 := Real.abs_cos_le_one phase
  have hmul : |coeff * Real.cos phase| = |coeff| * |Real.cos phase| :=
    abs_mul coeff (Real.cos phase)
  have hprod : |coeff| * |Real.cos phase| ≤ |coeff| := by
    rw [← hmul]
    nlinarith [abs_nonneg coeff, hc, hmul]
  have hadd : |Real.sin angle + coeff * Real.cos phase|
      ≤ |Real.sin angle| + |coeff * Real.cos phase| := abs_add_le _ _
  linarith [hadd, hprod, hs]

theorem clifford_box (a b c e x y : ℝ) :
    |Real.sin (a * y) + c * Real.cos (a * x)| ≤ 1 + |c| ∧
      |Real.sin (b * x) + e * Real.cos (b * y)| ≤ 1 + |e| := by
  constructor
  · exact clifford_step_bound (a * y) c (a * x)
  · exact clifford_step_bound (b * x) e (b * y)

theorem clifford_parameter_box {c x : ℝ} (hc : |c| ≤ 5 / 2)
    (hx : |x| ≤ 1 + |c|) : |x| ≤ 7 / 2 := by
  linarith

def lerp (a b t : ℝ) : ℝ := (1 - t) * a + t * b

theorem lerp_weights {t : ℝ} (ht : 0 ≤ t ∧ t ≤ 1) :
    0 ≤ 1 - t ∧ 0 ≤ t ∧ (1 - t) + t = 1 := by
  constructor
  · linarith
  constructor
  · linarith
  · ring

theorem lerp_in_unit {a b t : ℝ}
    (ha : 0 ≤ a ∧ a ≤ 1) (hb : 0 ≤ b ∧ b ≤ 1) (ht : 0 ≤ t ∧ t ≤ 1) :
    0 ≤ lerp a b t ∧ lerp a b t ≤ 1 := by
  unfold lerp
  constructor <;> nlinarith

theorem lerp_endpoints (a b : ℝ) : lerp a b 0 = a ∧ lerp a b 1 = b := by
  unfold lerp
  constructor <;> ring

theorem lerp_between {a b t : ℝ} (ht : 0 ≤ t ∧ t ≤ 1) (hab : a ≤ b) :
    a ≤ lerp a b t ∧ lerp a b t ≤ b := by
  unfold lerp
  constructor <;> nlinarith

theorem lerp_affine (a b t : ℝ) : lerp a b t = a + t * (b - a) := by
  unfold lerp
  ring

noncomputable def clamp01 (x : ℝ) : ℝ := max 0 (min 1 x)

theorem clamp01_bounds (x : ℝ) : 0 ≤ clamp01 x ∧ clamp01 x ≤ 1 := by
  constructor
  · exact le_max_left _ _
  · exact max_le (by norm_num) (min_le_left _ _)

noncomputable def beer (alpha : ℝ) : ℝ := 1 - Real.exp (-(2 : ℝ) * alpha)

theorem beer_bounds {alpha : ℝ} (h : 0 ≤ alpha) : 0 ≤ beer alpha ∧ beer alpha ≤ 1 := by
  constructor
  · unfold beer
    have hexp : -(2 : ℝ) * alpha ≤ 0 := by linarith
    have hle : Real.exp (-(2 : ℝ) * alpha) ≤ 1 := Real.exp_le_one_iff.mpr hexp
    linarith
  · unfold beer
    have hpos : 0 < Real.exp (-(2 : ℝ) * alpha) := Real.exp_pos _
    linarith

def emphasis (selected active : Bool) : ℝ :=
  if selected then if active then 13 / 10 else 1 / 5 else 1

theorem emphasis_bounds (selected active : Bool) :
    1 / 5 ≤ emphasis selected active ∧ emphasis selected active ≤ 13 / 10 := by
  cases selected <;> cases active <;> simp [emphasis] <;> norm_num

theorem active_gain_exceeds_one : emphasis true true = 13 / 10 ∧ 1 < emphasis true true := by
  constructor
  · simp [emphasis]
  · simp [emphasis]; norm_num

theorem modulated_raw_bounds {alpha : ℝ} (h : 0 ≤ alpha) (selected active : Bool) :
    0 ≤ beer alpha * emphasis selected active ∧
      beer alpha * emphasis selected active ≤ 13 / 10 := by
  have hb := beer_bounds h
  have he := emphasis_bounds selected active
  constructor <;> nlinarith

noncomputable def chimericOpacity (a b t : ℝ) (selected active : Bool) : ℝ :=
  clamp01 (beer (lerp a b t) * emphasis selected active)

theorem chimeric_blend_in_unit {a b t : ℝ}
    (ha : 0 ≤ a ∧ a ≤ 1) (hb : 0 ≤ b ∧ b ≤ 1) (ht : 0 ≤ t ∧ t ≤ 1) :
    0 ≤ lerp a b t ∧ lerp a b t ≤ 1 :=
  lerp_in_unit ha hb ht

theorem beer_of_blend_bounds {a b t : ℝ}
    (ha : 0 ≤ a ∧ a ≤ 1) (hb : 0 ≤ b ∧ b ≤ 1) (ht : 0 ≤ t ∧ t ≤ 1) :
    0 ≤ beer (lerp a b t) ∧ beer (lerp a b t) ≤ 1 := by
  exact beer_bounds (lerp_in_unit ha hb ht).1

theorem chimeric_opacity_bounds {a b t : ℝ}
    (ha : 0 ≤ a ∧ a ≤ 1) (hb : 0 ≤ b ∧ b ≤ 1) (ht : 0 ≤ t ∧ t ≤ 1)
    (selected active : Bool) :
    0 ≤ chimericOpacity a b t selected active ∧
      chimericOpacity a b t selected active ≤ 1 := by
  unfold chimericOpacity
  exact clamp01_bounds _

theorem idle_modulation_in_unit {alpha : ℝ} (h : 0 ≤ alpha) :
    0 ≤ beer alpha * emphasis true false ∧ beer alpha * emphasis true false ≤ 1 := by
  have hb := beer_bounds h
  simp [emphasis]
  constructor <;> nlinarith

theorem family_opacity_bounds {env edge v : ℝ}
    (he : 0 ≤ env ∧ env ≤ 1) (hd : 0 ≤ edge ∧ edge ≤ 1) (hv : -1 ≤ v ∧ v ≤ 1)
    (hroot : 0 ≤ Real.sqrt env) :
    0 ≤ (12 / 1000 + 75 / 1000 * env) * Real.sqrt env * (3 / 10 + 7 / 10 * edge) *
          (1 - 55 / 100 * |v|) ∧
      (12 / 1000 + 75 / 1000 * env) * Real.sqrt env * (3 / 10 + 7 / 10 * edge) *
          (1 - 55 / 100 * |v|) ≤ 87 / 1000 := by
  have henv : 0 ≤ 12 / 1000 + 75 / 1000 * env := by linarith
  have hedge : 0 ≤ 3 / 10 + 7 / 10 * edge ∧ 3 / 10 + 7 / 10 * edge ≤ 1 := by
    constructor <;> linarith
  have habs : 0 ≤ |v| ∧ |v| ≤ 1 := by
    constructor
    · exact abs_nonneg v
    · rw [abs_le]; exact hv
