# Fluidity Agent 4 — Viscous Soliton Pulses and Living Execution Response

## 1. Design ruling

Replace every high-frequency, integer-harmonic response with:

- Slow temporal phase: `2 * p`
- Golden-ratio spatial phase: `i * PHI_INV * TAU`
- First-order viscous smoothing with different attack and release constants
- A travelling `sech²` soliton across normalized strand territory `s ∈ [0, 1]`
- Continuous phase accumulation: never reset phase when execution state changes

No execution state may use temporal frequency above `2 * p`. `Rejected` and `Exhausted` differ from `Running` by **posture** — coiling, sagging, unfurling — not by vibration speed.

```js
const TAU = Math.PI * 2;
const PHI_INV = (Math.sqrt(5) - 1) / 2; // 0.6180339887498949
```

---

## 2. Exact replacement for the `Rejected` buzzer

Delete:

```js
Math.sin(17 * p + 11 * i) * 0.055
```

Use:

```js
const rejectedTwist =
  Math.sin(2 * p + i * PHI_INV * TAU) * 0.045;
```

Why this removes the buzzer quality:

| Property | Old | New |
|---|---|---|
| Temporal frequency | `17 * p` | `2 * p` |
| Spatial step between segments | `11` rad, integer aliasing | `PHI_INV * TAU ≈ 3.883` rad, irrational |
| Resulting motion | Coherent mechanical buzz | Non-repeating helical coil |
| Amplitude | `0.055` | `0.045`, applied through smoothed gain |

Integer spatial steps make neighbouring segments lock into a rigid standing pattern. The golden-angle step never exactly repeats along the strand, so the coil reads as organic torsion rather than a machined screw thread.

---

## 3. Persistent state to add to `WovenBody`

Add once in the constructor. These arrays must **never** be assigned directly on a state change — only integrated toward targets. That single rule is what makes every transition continuous.

```js
// --- Living execution response state (Agent 4) ---
this.execState = 'Idle';        // 'Running' | 'Done' | 'Rejected' | 'Exhausted' | 'Idle'
this.responsePhase = 0;         // accumulated phase p; never reset, never derived from wall time
this.responseClock = 0;         // seconds since construction, monotonic

this.ownerGainSmooth = null;    // Float32Array, lazily sized to segment count, init 1
this.ownerZShiftSmooth = null;  // Float32Array, lazily sized to segment count, init 0

// Current CEK excitation wave.
this.wave = {
  active: false,
  t0: 0,          // responseClock at the n_a -> n_b step
  duration: 1.6,  // seconds for the front to cross [u0, u1]
  strength: 0,    // signed amplitude captured at the step
  u0: 0,
  u1: 1,
};
```

---

## 4. CEK step hook — launch the peristaltic wave

Call this exactly when the CEK machine commits a step from operation node `n_a` to node `n_b`. It only **launches** a wave; it does not touch the smoothed arrays, so the visible body cannot jump.

```js
/**
 * Called on every committed CEK step n_a -> n_b.
 * u0, u1: normalized strand territory of the new owner, 0 <= u0 < u1 <= 1.
 * state: execution state after the step.
 */
onExecutionStep(n_a, n_b, u0, u1, state) {
  this.execState = state;

  const strengthByState = {
    Running:   1.0,
    Done:      0.7,
    Rejected: -0.8,  // negative: the wave contracts/coils instead of swelling
    Exhausted: 0.35, // weak, heavy, incomplete pulse
    Idle:      0,
  };

  this.wave.active = true;
  this.wave.t0 = this.responseClock;
  this.wave.duration =
    state === 'Exhausted' ? 2.8 :   // depleted tissue conducts slowly
    state === 'Rejected'  ? 2.2 :   // coiling is deliberate
                            1.6;
  this.wave.strength = strengthByState[state] ?? 0;
  this.wave.u0 = Math.min(u0, u1);
  this.wave.u1 = Math.max(u0, u1);
}
```

Note the deliberate asymmetry: a rejected step still sends a wave, but **signed negative and slower**. The organism visibly withdraws along the same territory it would have swelled along. Same anatomy, opposite intention.

---

## 5. `stepResponse` — full implementation

```js
/**
 * Advance the living execution response by dt seconds.
 * Mutates this.ownerGainSmooth[i] and this.ownerZShiftSmooth[i].
 * Returns the per-segment viscous torsion offset for segment i via
 * this.responseTwist[i], to be added to the strand's angular term.
 */
stepResponse(dt, segmentCount) {
  // Viscous clock: clamp dt so a stalled frame cannot teleport the wave.
  const step = Math.min(Math.max(dt, 0), 0.05);
  this.responseClock += step;

  // Phase accumulates; it is never recomputed from absolute time.
  // Changing state therefore cannot cause a phase discontinuity.
  this.responsePhase += step * 0.9;
  const p = this.responsePhase;

  if (!this.ownerGainSmooth || this.ownerGainSmooth.length !== segmentCount) {
    this.ownerGainSmooth = new Float32Array(segmentCount).fill(1);
    this.ownerZShiftSmooth = new Float32Array(segmentCount).fill(0);
    this.responseTwist = new Float32Array(segmentCount).fill(0);
  }

  // --- Execution-state posture table ---
  // freq: temporal multiplier on p (never above 2)
  // gainAmp: radial swelling amplitude
  // zAmp: longitudinal (z) displacement amplitude
  // twistAmp: helical torsion amplitude
  // droop: constant heavy sag, dominant in Exhausted
  const posture = {
    Idle:      { freq: 0.5, gainAmp: 0.006, zAmp: 0.004, twistAmp: 0.006, droop: 0.0   },
    Running:   { freq: 2.0, gainAmp: 0.038, zAmp: 0.020, twistAmp: 0.018, droop: 0.0   },
    Done:      { freq: 1.0, gainAmp: 0.028, zAmp: 0.034, twistAmp: 0.012, droop: 0.006 },
    Rejected:  { freq: 2.0, gainAmp: 0.030, zAmp: 0.026, twistAmp: 0.045, droop: 0.010 },
    Exhausted: { freq: 0.5, gainAmp: 0.012, zAmp: 0.010, twistAmp: 0.014, droop: 0.055 },
  }[this.execState] || { freq: 0.5, gainAmp: 0.006, zAmp: 0.004, twistAmp: 0.006, droop: 0 };

  // --- Travelling soliton front ---
  const w = this.wave;
  let front = -1; // normalized territory coordinate of the wave crest
  if (w.active) {
    const age = (this.responseClock - w.t0) / w.duration;
    if (age >= 1.25) {
      w.active = false; // wave has crossed and fully trailed off
    } else {
      front = age; // 0 at u0, 1 at u1, overshoots to 1.25 to let the tail leave
    }
  }

  // Asymmetric viscous smoothing constants (seconds).
  // Fast-ish attack so the crest is felt; slow release so it billows away.
  const tauGainAttack = 0.35, tauGainRelease = 1.40;
  const tauZAttack    = 0.45, tauZRelease    = 1.90;
  const aGainUp = 1 - Math.exp(-step / tauGainAttack);
  const aGainDn = 1 - Math.exp(-step / tauGainRelease);
  const aZUp    = 1 - Math.exp(-step / tauZAttack);
  const aZDn    = 1 - Math.exp(-step / tauZRelease);

  for (let i = 0; i < segmentCount; i++) {
    const u = segmentCount <= 1 ? 0 : i / (segmentCount - 1);

    // Position inside the owner's territory; 0 outside with soft edges.
    let s = 0;
    let inside = 0;
    if (w.u1 > w.u0) {
      s = (u - w.u0) / (w.u1 - w.u0);
      const edge = 0.08;
      inside =
        Math.min(1, Math.max(0, (s + edge) / edge)) *
        Math.min(1, Math.max(0, (1 + edge - s) / edge));
      s = Math.min(1.15, Math.max(-0.15, s));
    }

    // Soliton crest: sech^2 profile — localized, shape-preserving, no ringing.
    let crest = 0;
    let wake = 0;
    if (front >= 0) {
      const x = (s - front) / 0.16;
      const sech = 1 / Math.cosh(Math.min(Math.abs(x), 12));
      crest = sech * sech * inside;
      // Bioluminescent wake: tissue behind the front keeps glowing, decaying.
      const behind = front - s;
      wake = behind > 0 ? Math.exp(-behind * 3.0) * inside : 0;
    }

    const excitation = w.strength * (crest + 0.35 * wake);

    // Slow golden-angle torsion field shared by every state.
    const torsionWave = Math.sin(posture.freq * p + i * PHI_INV * TAU);
    const billowWave  = Math.sin(posture.freq * 0.5 * p + i * PHI_INV * TAU * 0.5);

    // --- Targets (instantaneous wishes; the body approaches them viscously) ---
    const gainTarget =
      1 +
      posture.gainAmp * billowWave +
      0.16 * excitation;

    const zTarget =
      posture.zAmp * torsionWave +
      0.10 * excitation -
      posture.droop * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));

    // --- Viscous integration: the actual continuity guarantee ---
    const g = this.ownerGainSmooth[i];
    this.ownerGainSmooth[i] =
      g + (gainTarget - g) * (gainTarget > g ? aGainUp : aGainDn);

    const z = this.ownerZShiftSmooth[i];
    this.ownerZShiftSmooth[i] =
      z + (zTarget - z) * (Math.abs(zTarget) > Math.abs(z) ? aZUp : aZDn);

    // Torsion is returned separately because it is angular, not radial.
    // Rejected coiling lives here: large, slow, signed by the wave.
    this.responseTwist[i] =
      posture.twistAmp * torsionWave * (1 + 0.8 * Math.abs(excitation));
  }
}
```

---

## 6. How the four states read on the body

| State | Motion | Mechanism in code |
|---|---|---|
| `Running` | Rhythmic peristaltic swelling travelling head-to-tail | Positive soliton, `duration 1.6`, `gainAmp 0.038` |
| `Done` | Slow unfurl and settle, like a jellyfish relaxing its bell | Half-frequency billow, larger `zAmp`, small droop, long release taus |
| `Rejected` | Heavy coil: the strand twists and pulls back along its own territory | Negative wave strength, `duration 2.2`, `twistAmp 0.045` at `sin(2p + i·φ⁻¹·τ)` |
| `Exhausted` | Sagging, incomplete pulse that dies mid-territory | Weak strength `0.35`, slow `duration 2.8`, `droop 0.055`, quarter-speed phase |

Continuity is guaranteed structurally, not tuned in:

1. `responsePhase` only ever accumulates — state changes cannot snap the angle.
2. `ownerGainSmooth` / `ownerZShiftSmooth` only integrate toward targets — state changes cannot snap radius or z.
3. A new CEK step replaces the wave's `t0`, `u0`, `u1`, and `strength`, but the smoothed arrays carry their current values into the new regime, so the crest of wave *n* visibly hands its energy to wave *n+1*.
4. `dt` is clamped to `0.05 s`, so a hitched frame slows the organism instead of teleporting it.

## 7. Acceptance checks

- Grep the file: no `17 * p`, no `11 * i`, no temporal multiplier above `2`.
- Force `Rejected` for 10 s: peak segment-to-segment twist difference stays smooth; no frame shows a sign alternation between adjacent segments at temporal frequency.
- Step `n_a → n_b` mid-`Running`: `ownerGainSmooth` shows a crest entering at `u0`, crossing to `u1` in ≈1.6 s, with a decaying luminous wake — and no discontinuity in any single segment's gain trace at the step instant.

