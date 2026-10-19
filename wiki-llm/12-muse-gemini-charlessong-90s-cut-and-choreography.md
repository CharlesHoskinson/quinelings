# 12 — `charlessong.mp3` 90.000-Second Master Cut & Visual Choreography

## Creative Director & Music Editor Specification for Gemini

**Role:** Creative Director & Music Editor, Muse Wonder 1.0
**Editor / collaborator:** Gemini (music edit, conform, and render support)
**Companions:** [08 — What Is Life? Brief](08-muse-creative-director-what-is-life-brief.md) · [11 — Round 2: Electronic Ocean](11-muse-round2-electronic-ocean-concept-art-and-elevenlabs-soundtrack.md) · [charlessong structure & candidates](../research/soundtrack_90s/charlessong_structure_and_candidates.md)
**Source soundtrack:** `C:\Users\charl\OneDrive\Desktop\charlessong.mp3` — local reference copy: [charlessong_original.mp3](audio/charlessong_original.mp3) (`/home/charles/sherlock-bench/assets/audio/charlessong_original.mp3`)
**Deliverable governed by this document:** one seamless master soundtrack of **exactly 90.000 s**, and the 90-second Quinelings animation locked to it at **60 fps / 5,400 frames**.

> **Thesis.** A dark cinematic synthwave reimagining of *Pure Imagination* is not an accompaniment to Quinelings 2.0. It is its libretto. The song already tells the film's story — invitation, creation, paradise, world-changing, freedom — in the same order the film tells it in images. Our job is not to illustrate the song, nor to decorate the film with it. It is to remove 28.747 s of *waiting* from the song so that its argument and the film's argument become one continuous, goosebump-inducing act of becoming: *question → code → matter → organism → encounter → ecosystem → meaning.*

---

## 0. Locked Invariants (read first — these do not negotiate)

| # | Invariant | Rule | Source |
|---|---|---|---|
| L1 | Exact duration | Master is **90.000 s = 3,969,000 samples @ 44.1 kHz = 5,400 frames @ 60.000 fps**. Not 89.9. Not 90.2. The final sample and the final frame land together. | This doc §2 |
| L2 | No lyric is lost | **Every sung phrase of the 118.747 s original survives in the 90 s master, in original order.** All 28.747 s removed come from instrumental repeats, ambient pauses, and reverb tail only (§2.2). | Research map Strategy A |
| L3 | Conservation of glyphs | Glyph `g_i` *is* particle `i` from terminal → droplet → tissue; nothing created or destroyed. | 08 §4.1 |
| L4 | Amber is earned | Amber `#FBBF24` appears only when code is executing — heartbeat, fork, phase-lock — never as decoration. | 08 §3.1, 11 §0 |
| L5 | Zero-shake camera | Locked `portraitFrame` bounds, `∂t(cx, cy, cz, span) ≡ 0`; never recompute bounds from moving vertices. All camera motion is one continuous spline. | 11 §0, 09 §1.1 |
| L6 | $C^2$ everywhere | Birth, morph, and merge use quintic Hermite blends; no kinks, no impacts, no collisions. | 08 §4.4 |
| L7 | Light comes from code | No external sun. Every photon is emitted by a glyph, a vent, a fiber, or a body. | 08 §3.2 |
| L8 | Silence is an instrument | The sonar dropout (original 21.85 s) and the two thesis silences are protected events. No edit may fill them. | 11 §3.1 |

**Tempo grid (from DSP map).** 124.52 BPM (half-time feel 62.26 BPM). 1 beat = 0.48185 s = 28.911 frames @ 60 fps. 1 bar (4 beats) = 1.92740 s. 2-bar phrase = 3.85480 s. 4-bar phrase = 7.70961 s. Every splice in §2 sits on this grid or on a documented similarity-locked loop point from the DSP self-similarity matrix.

**Frame convention used throughout.** Frame `f = round(t × 60)`, frames numbered `0 … 5399`, frame `f` covers master time `[f/60, (f+1)/60)`. A hit listed as `t = 63.190 s / f3791` means the event is perceived on frame 3791.

---

# Part 1 — Dramaturgical & Musical Analysis

## Why *this* song, for *this* film

### 1.1 The song is a creation myth that already knows it is one

*Pure Imagination* (Bricusse & Newley, 1971) is usually misremembered as a whimsical children's song. It is not. It is a manifesto sung by a maker standing inside his own creation, inviting a witness to enter it: *come with me, and you'll be in a world of pure imagination.* Its dramatic structure is radically unusual for a popular song — it does not confess, seduce, or mourn. It **recruits**. Verse by verse it escalates from invitation (*come with me*), to demonstration (*we'll begin, with a spin, traveling in the world of my creation*), to epistemology (*what we'll see will defy explanation*), to utopia (*if you want to view paradise, simply look around and view it*), to voluntarism (*want to change the world? there's nothing to it*), and finally to emancipation (*living there, you'll be free, if you truly wish to be*).

That is, beat for beat, the argument of Quinelings 2.0:

| Song's argument | Film's argument (08 §2) |
|---|---|
| Come with me — enter the world I made | *What is life?* — the question that opens the abyss |
| We'll begin, with a spin, traveling in the world of my creation | The Rankine Code Vortex — code literally spins into matter |
| What we'll see will defy explanation | The $C^2$ birth — mathematics the audience feels before it understands |
| If you want to view paradise, simply look around and view it | The Holomorphic Reef — paradise as a place you are already inside |
| Want to change the world, there's nothing to it | Symbiogenesis — two lineages choose to become one; the world changes by merging |
| There is no life I know to compare with pure imagination | The Pelagic Colony — dozens of living programs, beyond comparison |
| Living there, you'll be free, if you truly wish to be | *Life is what we make of it.* — freedom as the thesis, earned |

Schrödinger asked what life is. Von Neumann showed a description could build its builder. Hofstadter showed the closed loop becomes a self. This song adds the fourth voice the film needed: **the maker, singing from inside the made world, offering it to us.** Willy Wonka and a quine are the same figure — a closed system that produces wonders from a description of itself, and whose deepest desire is not to be admired but to be *entered*.

### 1.2 Why the *dark synthwave* reimagining — not the orchestral original — is the profound match

A faithful orchestral *Pure Imagination* would have been a nostalgic illustration. The `charlessong.mp3` arrangement — deep pulsing analog sub-bass, crystalline arpeggiated synths, submarine sonar chimes, ethereal female lead vocal, a massive synthwave drop, a weightless cosmic-oceanic resolution — makes five decisive dramaturgical upgrades:

1. **It submerges the song.** The sonar chimes at original 22–28 s, the sub-bass "heartbeat" clock of the intro, and the vast reverb of the outro place the music *underwater* before a single image appears. The Digital Electronic Ocean (11 §1) does not need to be sonically constructed; the arrangement already lives there. The audience's body knows it is submerged by 0:06 — so when the terminals appear *suspended like ice seen from below* (11 Plate 02), image and sound confirm each other.

2. **It digitises wonder.** Crystalline arpeggiated synths are, acoustically, what S-expression glyphs are visually: discrete luminous units in exact patterns, too fast to count, resolving into melody the way glyphs resolve into tissue. When those arpeggios interlock in 3-against-2 spirals (vortex) or linked-circle patterns (first swim), the ear is hearing combinators. The score's texture *is* the film's ontology.

3. **It gives the film a body clock.** The 124.52 BPM grid with a 62.26 BPM half-time feel is a breathing rate, not a dance tempo. The sub-bass (Sub-Bass 0.28–0.49 in the DSP map) is felt in the sternum. This lets the six hydrothermal CPU vent rings breathe *with* the track (§3.3) instead of being animated *to* it — the floor of the ocean and the floor of the mix are the same heartbeat.

4. **It earns its ecstasy.** The arrangement withholds full power for 75.6 s — verses at RMS ≈ 0.26, breakdowns collapsing to RMS 0.068 (sonar) and 0.118 (paradise) — then detonates into the drop at RMS 0.296, Sub-Bass 0.48. A 90-second film about dozens of creatures phase-locking needs exactly one moment of collective euphoria, and this arrangement provides exactly one, at exactly the right altitude of the arc (63.19 s in the master; §2.4).

5. **It resolves into freedom, not triumph.** After the drop, the arrangement does not reprise or cadence heroically. It *evaporates* into oceanic reverb and two quiet, exposed vocal phrases — *there is no life I know…* / *living there, you'll be free…*. That is the only honest register for the closing thesis. *Life is what we make of it* cannot be shouted over a climax; it must arrive the way this vocal arrives — as something realised in the quiet after collective ecstasy, one voice over a breathing colony.

### 1.3 The five goosebump locks (lyric ↔ image synchronisations the cut exists to protect)

These five locks are the reason Strategy A (§2) was chosen over any structural edit. If any one of them slips by more than ±3 frames, the film is merely *set to music*. Locked, it is *sung by the images*.

**Lock 1 — “Come with me… in a world of pure imagination” over the submerged terminals (master 6.25–21.85 s).**
The invitation is issued not over the question card, but over the *terminals themselves* — because the terminals are the world being offered. As the vocal sings *take a look, and you'll see, into your imagination*, glyphs ignite pane by pane and the first amber execution pulses run inside the text (08 Shot 2). Dramaturgically this reframes the entire film: the audience is not watching a documentary about life. They have accepted an invitation into a made world, and everything after is the consequence of saying yes. The ethereal female vocal — disembodied, reverberant, slightly distant — is the voice of the world itself, not of any character. No Quineling ever sings. The ocean sings.

**Lock 2 — “We'll begin, with a spin, traveling in the world of my creation / What we'll see, will defy, explanation” over the Rankine Code Vortex & Birth (master 23.55–39.10 s).**
This is the single most literal lyric-to-image lock available in popular music. *We'll begin, with a spin* — and the code begins, with a spin: glyph-roe detach, are caught in the logarithmic Rankine funnel, angular velocity rising as $\dot\theta \propto 1/r$, Hopf-braided, and condensed through the $C^2$ quintic transition into the first Quineling (08 §§4.2–4.4). *Traveling in the world of my creation* plays over a world visibly being created from its own description. And *what we'll see will defy explanation* lands precisely as the droplet-stream becomes skin with no visible seam — the moment the audience feels the mathematics instead of following it. The line is not a caption for the vortex. The vortex is the line, performed.

**Lock 3 — “If you want to view paradise… Want to change the world, there's nothing to it” over the Holomorphic Reef & Symbiogenesis (master 42.09–62.09 s).**
The arrangement's great gift here is *weightlessness*: at original 53.60 s every drum vanishes (Sub-Bass 0.02, RMS 0.118) and the vocal floats over ambient pads. The film answers with its two most tender events. *If you want to view paradise, simply look around and view it* plays over the macro reef — quaternion Julia medusa, recursive-affine sea-fern, caustic interference where fold meets fold (11 Plate 04) — paradise defined, exactly as the lyric defines it, not as a destination but as an act of attention. Then *anything you want to, do it / want to change the world, there's nothing to it* plays over symbiogenesis: two Quinelings circle, exchange glyph-streams, and fuse across a $C^2$ geodesic bridge (11 Plate 05). The world is changed not by force but by *merging* — *there's nothing to it* becomes the most radical line in the film: transformation as tenderness. The massive sub-drop riser at original 74.5 s (master 62.09–63.19 s) is the held breath before release.

**Lock 4 — The Massive Synthwave Drop over the Pelagic Colony Pullback (master 63.19–70.78 s).**
When the drop detonates, the camera is already retreating exponentially — `2 → 6 → 20 → dozens` (08 Shot 10) — so the musical explosion and the population explosion are the same event in two senses. Every Quineling family (Hopf weave, Lorenz–Bishop, Clifford veil, Julia medusa, affine fern, logarithmic mantle, Ouroboros braid, phyllotaxis fan — plus chimeras, 11 Plate 06) enters on the drop's energy, and the colony's Kuramoto coupling `K` crosses criticality on the downbeat: dozens of independent breathing phases snap into one travelling breath-wave (§3.3.4). This is the film's only `mf` ceiling and the track's only full-power passage, and they must be the same 7.59 seconds. Cut the drop short and the colony feels populated; keep it whole and the colony feels *inevitable*.

**Lock 5 — “There is no life I know… Living there, you'll be free, if you truly wish to be” over “Life is what we make of it.” (master 71.78–88.98 s).**
After the drop, drums fall away into vast reverb. One voice, exposed: *there is no life I know to compare with pure imagination* — sung over a colony now drifting in shared phase, dozens of lives that literally have no comparison because each is a unique execution of living code. Then, after a suspension, the final offer: *living there, you'll be free, if you truly wish to be.* On the colony's shared exhale, and only then, the closing line appears in the same serif, same framing as the opening question (08 Shots 1 ↔ 11 bookend): **Life is what we make of it.** The song's last word on freedom and the film's last word on life are the same sentence in two languages. The 600 ms of near-silence before the thesis card (Invariant L8) is where the audience hears themselves understand it.

### 1.4 What must never happen

- **Never** place *Come with me* over the black question card. The question is asked in silence and sub-bass alone (master 0.00–6.25 s). The invitation must be *answered by the terminals appearing*, not sung over emptiness.
- **Never** let the drop begin before the exponential pullback has started. The pullback leads by ~1.1 s (camera begins retreating on the riser, master 62.09 s); the drop confirms a revelation already in motion.
- **Never** cut inside a lyric phrase to save time. All savings come from §2.2's instrumental/ambient regions. A single clipped syllable destroys Lock integrity for the whole film.
- **Never** raise the outro to climax level. The thesis is `pp`. If the colony exhale is mixed or lit louder than the drop, the film ends by shouting its quietest idea.

---

# Part 2 — The Exact 90.000-Second Master Cut Specification

## 2.1 Source audit (verified)

| Property | Value |
|---|---|
| Source duration | 118.746848 s = 5,236,736 samples @ 44,100 Hz, stereo, 192 kbps |
| Target duration | **90.000000 s = 3,969,000 samples @ 44,100 Hz = 5,400 frames @ 60 fps** |
| Total to remove | **28.746848 s = 1,267,736 samples** |
| Tempo grid | 124.52 BPM; beat 0.48185 s; bar 1.92740 s; 4-bar phrase 7.70961 s |
| Strategy | **Strategy A — multi-point surgical tightening.** Four splice regions + tail trim. Preserves 100% of Verses 1 & 2, vocalise bridge (head+tail), paradise breakdown, drop (head+resolution), and both outro phrases. Strategy B (two-cut structural edit) is **rejected**: every variant of it loses either *Want to change the world* or *There is no life I know*, breaking Lock 3 or Lock 5. |

Section map of the original (research map §2, confirmed against DSP/vocal timelines): I Intro 0.00–6.25 · II Verse 1 6.25–21.85 · III Sonar breakdown 21.85–28.25 · IV Verse 2 28.25–43.80 · V Vocalise bridge 43.80–53.60 · VI Paradise breakdown 53.60–75.60 · VII Climax drop 75.60–90.90 · VIII Outro 90.90–118.75.

## 2.2 The edit decision list (EDL) — the whole cut, on one table

Six kept segments. Five splices. One tail trim. Nothing else is touched. **No time-stretching, no pitch-shifting, no re-ordering, no fades inside kept segments** (except the protected final tail fade, §2.5).

| Seg | Source in → out (s) | Source samples (in → out) | Dur (s) | Samples | Master in → out (s) | Master frames | Content kept |
|---|---|---|---|---|---|---|---|
| S1 | 0.000 → 22.100 | 0 → 974,610 | 22.100 | 974,610 | 0.000 → 22.100 | f0–f1325 | Intro + Verse 1 complete + sonar head (drop into silence) |
| S2 | 26.800 → 44.660 | 1,181,880 → 1,969,506 | 17.860 | 787,626 | 22.100 → 39.960 | f1326–f2397 | Sonar tail + snare pickup + Verse 2 complete + bridge head (0.86 s) |
| S3 | 52.370 → 79.800 | 2,309,517 → 3,519,180 | 27.430 | 1,209,663 | 39.960 → 67.390 | f2398–f4043 | Bridge tail (1.23 s) + Paradise breakdown complete + drop head (4.20 s) |
| S4 | 87.510 → 91.800 | 3,859,191 → 4,048,380 | 4.290 | 189,189 | 67.390 → 71.680 | f4044–f4300 | Drop resolution (3.39 s) + outro shimmer head (0.90 s) |
| S5 | 96.500 → 107.350 | 4,255,650 → 4,734,135 | 10.850 | 478,485 | 71.680 → 82.530 | f4301–f4951 | Breath (0.10 s) + *There is no life I know…* complete |
| S6 | 110.050 → 117.520 | 4,853,205 → 5,182,632 | 7.470 | 329,427 | 82.530 → 90.000 | f4952–f5399 | Breath (0.15 s) + *Living there, you'll be free…* complete + tail fade |
| **Total** | | | **90.000** | **3,969,000** | **0.000 → 90.000** | **f0–f5399** | **Every lyric phrase intact** |

Sample arithmetic check: 974,610 + 787,626 + 1,209,663 + 189,189 + 478,485 + 329,427 = **3,969,000** ✓. Duration check: 22.100 + 17.860 + 27.430 + 4.290 + 10.850 + 7.470 = **90.000 s** ✓.

### Removed regions (the only audio discarded)

| Cut | Removed source (s) | Dur (s) | What it is | Why it is safe to remove |
|---|---|---|---|---|
| C1 | 22.100 → 26.800 | 4.700 | Middle of the sonar breakdown: repeated submarine ping cycles, drums/sub absent (RMS 0.046→0.045, Sub 0.05→0.03) | Self-similarity score −0.00769 (near-perfect loop match). The *event* (collapse into silence) and the *exit* (ping + snare pickup into Verse 2) are both kept; only the waiting between them shortens. |
| C2 | 44.660 → 52.370 | 7.710 | Middle 4 bars of the wordless vocalise bridge (exact 4-bar phrase, 4 × 1.92740 s) | Score −0.0085. Wordless *ooh* progression repeats; head (transition out of *defy explanation*) and tail (drop-out into *view paradise*) kept. No lyric exists in this region. |
| C3 | 79.800 → 87.510 | 7.710 | Middle 4 bars of the climax drop (exact 4-bar phrase) | Score −0.00897 / −0.00850 (alternate point 81.60→89.31, §2.6). Keeps the detonation (75.60 s) and the triumphant resolution (87.51–90.90 s). The drop reads as an 8-bar event instead of 12-bar; energy is *concentrated*, not reduced. |
| C4a | 91.800 → 96.500 | 4.700 | Empty post-drop ambient pause before *There is no life I know* | Near-silent shimmer (RMS 0.067–0.089, Sub ≤ 0.03). Keeps 0.90 s of shimmer + 0.10 s breath so the vocal entrance still feels *arrived at*, not jumped to. |
| C4b | 107.350 → 110.050 | 2.700 | Ambient suspension between the two outro phrases | Keeps 0.05 s after phrase 1 and 0.15 s before phrase 2; the suspension's *function* (a held breath between realisation and offer) survives at reduced length. |
| C4c | 117.520 → 118.747 (tail trim) | 1.227 | Near-silent reverb tail after the final phrase (RMS ≤ 0.031 from 117.0 s) | Replaced by the composed 1.02 s equal-power tail fade inside S6 (§2.5). Nothing audible is lost. |
| **Total removed** | | **28.747** (28.746848 exact) | | 4.700 + 7.710 + 7.710 + 4.700 + 2.700 + 1.227 = 28.747 s (sample-exact: 1,267,736 samples) |

## 2.3 Splice specification (beat-locked, crossfaded, click-free)

Splice times below are **crossfade centres** on the master timeline. Source handles extend ±(fade/2) beyond the nominal segment edges in §2.2 into the removed regions (which contain ample similar material), so centre-to-centre distances — and therefore the 90.000 s total — are exact by construction. All crossfades are **equal-power** unless stated: for normalised fade position $u \in [0,1]$, $g_{out} = \cos(\tfrac{\pi}{2}u)$, $g_{in} = \sin(\tfrac{\pi}{2}u)$, $g_{out}^2 + g_{in}^2 = 1$. Render splices at sample accuracy in the DAW/ffmpeg `acrossfade` (curve `cbrt` or explicit equal-power), never as butt cuts, and verify each splice on headphones at high gain for clicks, phasiness, or ping-echo doubling.

| Splice | Master centre (s / frame) | Source join | Fade | Curve & rationale |
|---|---|---|---|---|
| X1 (C1) | 22.100 / f1326 | 22.100 → 26.800 | 240 ms (14–15 frames) | Equal-power, centred on a sonar-ping decay trough. Ambient-into-ambient: the long fade hides inside ping reverb. **Check:** exactly one ping rhythm must survive — if a doubled/echoed ping is heard, nudge centre ±20 ms into the trough and re-check. |
| X2 (C2) | 39.960 / f2398 (sample 1,762,236) | 44.660 → 52.370 | 180 ms (11 frames) | Equal-power, centred on a bar line (4-bar phrase boundary both sides). Vocalise-into-vocalise at matched harmony; fade is masked by the *ooh* pad. This splice is also a picture event: it is the Quineling's first breath (§3, Scene 5). |
| X3 (C3) | 67.390 / f4044 (sample 2,971,899) | 79.800 → 87.510 | 64 ms (4 frames) | Equal-power, **short**, centred exactly on a kick transient so the transient masks the join. Drop-into-drop at full energy (RMS ≈ 0.20 both sides, Sub 0.45→0.42): a long fade would flam the kick and halve the impact. **Check:** A/B against the uncut drop at matched loudness; the splice must be undetectable in a blind pass. |
| X4 (C4a) | 71.680 / f4301 (sample 3,161,088) | 91.800 → 96.500 | 400 ms (24 frames) | Equal-power, long. Shimmer-into-breath: both sides near-silent, so the fade *is* the transition from post-drop glow to vocal intimacy. No transient may be introduced here. |
| X5 (C4b) | 82.530 / f4952 (sample 3,639,573) | 107.350 → 110.050 | 500 ms (30 frames) | Equal-power, longest fade in the cut. Pad-suspension into pad-suspension under no vocal; half a second of crossfade makes the shortened suspension feel composed rather than edited. Ends 0.15 s before *Living there* — the vocal must enter dry against the faded pad, never under a fade tail. |

**Musical rationale, summarised for the edit bay.** C1 shortens *suspense*, C2 shortens *ascent*, C3 shortens *ecstasy*, C4 shortens *aftermath*. In every case the gesture (fall, rise, detonation, exhale) is preserved and only its repetition is thinned — which is why the 90 s master feels *more* inevitable than the original rather than abridged: each section now lasts exactly as long as its visual counterpart needs, and not one bar longer.

## 2.4 Master musical timeline (what the audience hears, 0–90 s)

| Master time (s) | Frames | Source time (s) | Music | Lock |
|---|---|---|---|---|
| 0.00–6.25 | f0–f374 | 0.00–6.25 | Pulsing electronic intro; sub-bass heartbeat, snare/clap clock (RMS 0.155, Sub 0.28) | Question card in silence-grade darkness |
| 6.25–21.85 | f375–f1310 | 6.25–21.85 | **Verse 1:** *Come with me… world of pure imagination / Take a look… into your imagination* (RMS 0.258, Sub 0.38) | **Lock 1** — Terminals |
| 21.85–23.55 | f1311–f1412 | 21.85–22.10 + 26.80–28.25 | Sonar breakdown (compressed): drums/sub vanish (RMS 0.068), one ping cycle, snare pickup | Detachment in weightless silence |
| 23.55–39.10 | f1413–f2345 | 28.25–43.80 | **Verse 2:** *We'll begin, with a spin… world of my creation / What we'll see, will defy, explanation* (RMS 0.268, Sub 0.41) | **Lock 2** — Vortex & Birth |
| 39.10–41.19 | f2346–f2470 | 43.80–44.66 + 52.37–53.60 | Vocalise bridge (head+tail): wordless *ooh*, arpeggios build then drop away | First breath → first swim |
| 41.19–63.19 | f2471–f3790 | 53.60–75.60 | **Paradise breakdown (complete):** *If you want to view paradise…* (42.09–52.39) · *Anything you want to… Want to change the world, there's nothing to it* (53.39–62.09) · sub-drop riser (62.09–63.19). Drums absent, Sub 0.02 | **Lock 3** — Reef & Symbiogenesis |
| 63.19–70.78 | f3791–f4246 | 75.60–79.80 + 87.51–90.90 | **The Drop (compressed):** detonation + resolution (RMS 0.296, Sub 0.48→0.46) | **Lock 4** — Colony pullback |
| 70.78–71.68 | f4247–f4300 | 90.90–91.80 | Post-drop shimmer & breath | Colony exhale begins |
| 71.78–82.48 | f4307–f4948 | 96.60–107.30 | **Outro phrase 1:** *There is no life I know, to compare with pure imagination* (RMS 0.125, Sub 0.02) | **Lock 5a** — Colony drift |
| 82.68–88.98 | f4961–f5338 | 110.20–116.50 | **Outro phrase 2:** *Living there, you'll be free, if you truly wish to be* | **Lock 5b** — Thesis card |
| 88.98–90.00 | f5339–f5399 | 116.50–117.52 (faded) | Composed tail fade to true silence | Fade to Shot-1 void colour |

Lyric phrase windows within verses (e.g. the two lines of Verse 1 across 6.25–21.85 s) are to be confirmed by Gemini against the waveform/vocal timeline in the DAW and locked to the picture cues in Part 3 to ±3 frames before picture lock. The section boundaries above are sample-exact from the DSP map; sub-phrase onsets marked ≈ in Part 3 are editorial targets, not sample claims.

## 2.5 Head, tail, loudness & render rules

1. **Head:** first sample of master = first sample of source (no added leader, no fade-in). The intro pulse at 0.00 s is frame f0's downbeat; the question card's first glyph and the first sub-bass pulse are simultaneous.
2. **Tail:** S6 ends at source 117.520 s with a **1.02 s equal-power fade** (source 116.50–117.52 s, gain $\cos^2$ to zero) composed into the segment, so master 90.000 s is true silence at the final sample. Do not append digital black beyond sample 3,969,000; do not truncate before it.
3. **Levels:** this is a *conform of a finished mix*, not a remix. No EQ, compression, limiting, or loudness re-normalisation except a single final true-peak safety check (≤ −1 dBTP; if the source already complies, print at unity). Crossfade regions are the only samples whose values change besides the tail fade.
4. **Format:** deliver (a) WAV 44.1 kHz / 24-bit master `charlessong_90s_master.wav` (3,969,000 samples/channel), (b) MP3 192 kbps distribution copy trimmed/padded to the identical sample length, (c) this EDL (§2.2) as a machine-readable CSV/JSON sidecar for the animation conform. Film sound sync is referenced to the WAV, never to the MP3 (encoder delay).
5. **Verification (Gemini, before handoff):** (i) sample count = 3,969,000 exactly; (ii) lyric checklist — play the master against §2.4 and tick every phrase; (iii) blind splice pass — five splices inaudible at +6 dB headphone gain; (iv) null-check kept regions against the source (sample-identical outside fades); (v) spectrogram check that C1 retains exactly one sonar-ping rhythm and X3 retains a single, un-flammed kick.

## 2.6 Rejected alternatives & fallback

- **Alternate drop splice 81.60 → 89.31 s** (score −0.00850): keeps 6.0 s of drop head, 1.59 s of resolution. Use **only** if X3 (79.80 → 87.51) fails the blind pass. It lengthens the detonation plateau at the cost of the resolution — a worse trade for Lock 4, where the colony needs the *arrival* harmony under the phase-lock. If adopted, S3/S4 boundaries and all master times after 63.19 s shift; re-issue Part 3 timings before animating. Do not mix the two variants.
- **Strategy B (two-cut structural edit): rejected.** Loses a protected lyric under every variant (see §2.1).
- **Any time-stretch to “make it fit”: rejected absolutely.** Stretching detunes the vocal, smears the sonar pings, and breaks the 124.52 BPM grid the vent/Kuramoto choreography (Part 3) is phase-locked to.

---


# Part 3 — Second-by-Second & Frame-by-Frame 90 s Visual Choreography

## 3.1 The five acts / twelve scenes on the master timeline

The 2:10 flagship arc (08 §5) is compressed, not summarised: every shot survives, re-timed onto the song's phrases. Picture is cut to the **master** timeline below; source-audio times appear only in Part 2.

| Act | Master (s) | Frames | Scenes | Dramatic function |
|---|---|---|---|---|
| I — The Question & The Code | 0.00–21.85 | f0–f1310 | 1–2 | A question is asked; a world answers by writing itself |
| II — The Fall & The Birth | 21.85–41.19 | f1311–f2470 | 3–5 | Code becomes matter; matter becomes one living creature |
| III — Exploration in the Digital Electronic Ocean | 41.19–63.19 | f2471–f3790 | 6–8 | One life explores paradise, meets another, and changes the world by merging |
| IV — The Pelagic Colony | 63.19–71.68 | f3791–f4300 | 9–10 | Dozens of lives reveal themselves and breathe as one |
| V — The Thesis | 71.68–90.00 | f4301–f5399 | 11–12 | Freedom is named; the question is answered |

| Scene | Master (s) | Frames | Name | Lyric / musical cue | Core image |
|---|---|---|---|---|---|
| 1 | 0.00–6.25 | f0–f374 | *What is life?* | Intro pulse; no vocal | Question fades in glyph-by-glyph over the Dielectric Abyss; 6-ring vent floor dark, breathing at sub-bass rate |
| 2 | 6.25–21.85 | f375–f1310 | Submerged Terminals Writing Code | Verse 1: *Come with me…* | Obsidian panes ignite; S-expression glyphs type, then run (amber execution pulses) |
| 3 | 21.85–23.55 | f1311–f1412 | Detachment in Sonar Silence | Sonar dropout, one ping, snare pickup | In sudden silence, glyphs detach from glass like bioluminescent roe |
| 4 | 23.55–36.00 | f1413–f2159 | The Rankine Code Vortex | *We'll begin, with a spin…* | Log-spiral Hopf-braided funnel; droplets accelerate $\dot\theta \propto 1/r$, still readable at first |
| 5 | 36.00–41.19 | f2160–f2470 | Birth & First Breath | *…will defy, explanation* → vocalise | $C^2$ quintic condensation; Whitney ridges ignite; Ouroboros closes once; first breath at X2 (39.960 s) |
| 6 | 41.19–47.00 | f2471–f2819 | First Swim — Hopf & Lorenz Currents | *If you want to view paradise…* (onset ≈42.09) | Newborn threads Hopf rings, rides Lorenz–Bishop ribbons; kelp bow-wave |
| 7 | 47.00–52.39 | f2820–f3142 | The Holomorphic Reef | *…simply look around and view it* | Julia medusa + affine sea-fern macro; fold-meets-fold caustic interference |
| 8 | 52.39–63.19 | f3143–f3790 | Symbiogenesis — *Change the World* | *Anything you want to… there's nothing to it* (≈53.39–62.09); riser 62.09–63.19 | Second Quineling; circling, glyph exchange, $C^2$ geodesic bridge; hearts beat toward unison |
| 9 | 63.19–67.39 | f3791–f4043 | The Drop — Pelagic Pullback I | Drop detonation | Exponential pullback 2→6→20; all 8 families enter; Kuramoto coupling crosses critical |
| 10 | 67.39–71.68 | f4044–f4300 | Colony Phase-Lock | Drop resolution → shimmer | Dozens locked; travelling breath-wave; kelp entrainment; Snell window pulses once on the exhale |
| 11 | 71.68–82.53 | f4301–f4951 | *There Is No Life I Know* | Outro phrase 1 (≈71.78–82.48) | Slow drift through the locked colony; portraits of families & chimeras; no camera push |
| 12 | 82.53–90.00 | f4952–f5399 | *Life Is What We Make Of It* | Outro phrase 2 (≈82.68–88.98); tail fade | Colony exhales as one; thesis card on the silence after; fade to Shot-1 void |

## 3.2 Camera law (applies to every row of §3.5)

- **One continuous spline from Scene 4 to Scene 10** (08 §3.2): descending spiral (vortex) → orbit settling to portrait (birth) → banking follow (swim) → low reef glide → mutual orbit (symbiogenesis) → exponential retreat (pullback). No cut, no shake, no reframe inside the spline; scene boundaries are lighting/subject changes, not camera cuts.
- **Scenes 1–3:** locked off (Scene 1), slow dolly through the pane field (Scene 2), locked as gravity discovers the glass (Scene 3). Depth of field shallow in Scenes 1–5, deepening through Act III, infinite at the pullback.
- **Pullback law (Scenes 9–10):** distance $\propto e^{\lambda t}$, chosen so each population doubling (2→6→20→dozens) gets equal screen time. The retreat **begins on the riser at 62.09 s (f3725)**, 1.10 s before the drop, so the drop confirms a revelation already moving (Part 1 §1.4).
- **Scenes 11–12:** drift only — the camera stops *searching*; locked off for the thesis card, echoing Scene 1's framing and typeface exactly (bookend, 08 §5).
- Motion blur on droplet/plankton trails only; bodies stay crisp (08 §3.2).

## 3.3 Audio-reactive lighting system (the ocean listens)

All reactive cues derive from three band envelopes computed per frame from the master WAV (44.1 kHz → 60 fps analysis, hop 735 samples). Envelopes are **causal, smoothed, and clamped** so lighting never strobes: attack/release as specified, maximum slew below flicker fusion except for the single protected drop transient.

### 3.3.1 Sub-bass band (20–120 Hz) → the 6-ring hydrothermal CPU vents

- Envelope: $E_{sub}[f]$, RMS in band, attack 5 ms, release 180 ms, normalised so the drop plateau (Sub 0.48) ≈ 0.9.
- Ring intensity: $I_k = I_{k,0}\,\big(1 + \alpha_k\, E_{sub}\big)$, $\alpha$ decreasing outward (R1 core 1.4 → R6 rim 0.15). Rings do not flash together: a phase lag of ~40 ms per ring outward makes each bass pulse read as a pressure wave travelling across the die.
- Plume coupling: genome-plankton rise speed $w_0 \to w_0\,(1 + 0.6\,E_{sub})$ and plume cone width $+15\%$ at envelope peaks (11 §1.3.2 law, gain-modulated). At the sonar dropout (Scene 3) $E_{sub}\to 0$: plumes stall, rings fall to ember — the floor *holds its breath* with the track.
- Intro/heartbeat use: in Scene 1 the same envelope (Sub 0.28) drives a barely-visible R1/R2 breathing so the question card appears to be *thought* by the sleeping floor.

### 3.3.2 Vocal mid band (300 Hz–3.4 kHz, formant-weighted) → the Ouroboros nerve glow

- Envelope: $E_{voc}[f]$, attack 10 ms, release 120 ms. This band carries the ethereal lead vocal and almost nothing else in the breakdowns, so it is a clean *presence-of-voice* signal.
- Nerve law: Ouroboros filament brightness and soliton speed scale with $E_{voc}$: $v_{sol} = v_0\,(1 + 1.2\,E_{voc})$, glow $G = G_0\,(0.35 + 0.65\,E_{voc})$. When the voice sings, the strange loop *brightens and quickens* — the creature's nervous system is visibly listening to the world's voice. In instrumental passages the nerve falls to its 0.35 floor (present, never off: the loop is alive even in silence).
- Stage-tint rule preserved (11 §1.3.2): solitons keep their `quote` ice-aqua → `run` champagne → `apply` orchid cycle; $E_{voc}$ modulates *intensity/speed only*, never hue. Amber remains governed solely by execution events (Invariant L4) and may coincide with vocal peaks — the coincidence is sacred, not cued.

### 3.3.3 High band (6–12 kHz) → kelp telemetry & plankton shimmer

- Envelope $E_{hi}[f]$ (arpeggios, glass ticks, caustic shimmer), attack 3 ms, release 90 ms, heavily clamped (max +18% over base).
- Drives: kelp soliton brightness (11 §1.2.2, ≤18% rule), plankton halo twinkle, reef caustic tick accents in Scene 7. This is the *weather* layer: constant fine motion, never narratively load-bearing, first layer frozen in reduced-motion mode.

### 3.3.4 The Drop → colony-wide Kuramoto phase-locking (Scene 9–10, protected event)

Each Quineling $j$ carries a breathing phase $\theta_j$ (08 §4.5) obeying $\dot\theta_j = \omega_j + \tfrac{K(t)}{N}\sum_k \sin(\theta_k - \theta_j)$, with order parameter $r(t) = \big|\tfrac{1}{N}\sum_j e^{i\theta_j}\big|$ rendered — never faked — as breath synchrony.

| Phase | Master (s) | $K(t)$ | $r(t)$ (target) | Visible tell (in escalation order, 11 §1.4.4) |
|---|---|---|---|---|
| Pre-drop (Scenes 6–8) | 41.19–62.09 | $K < K_c$ | 0.25–0.45 | Individuals only; symbiogenesis pair locally locks ($r_{pair}\to 0.9$) as a *preview* |
| Riser | 62.09–63.19 | Ramps toward $K_c$ | 0.45 → 0.60 | (1) Kelp between neighbours begins entraining to the emerging common frequency |
| **Detonation** | **63.19 (f3791)** | **Crosses $K_c$ on the downbeat** | **0.60 → 0.85 within 2 bars** | (2) Dormant plankton between bodies re-ignites its stage halo in shared phase |
| Plateau (post-X3) | 67.39–70.78 | $K \approx 1.8\,K_c$ | 0.95–0.98 | Colony breath-wave travels frame-left → depth-back; vent rings R2–R5 breathe at colony frequency |
| Exhale | 70.78–71.68 | Holds | 0.98, phase frozen on exhale | (3) Snell window pulses **once**, very faintly; only then may Scene 11 begin |

Failure mode to avoid: do not ease $r$ linearly across the whole pullback. Phase-locking is a *threshold* phenomenon — the colony must look unsynchronised, then *snap*. If $r$ rises smoothly from 41 s, the drop has nothing to ignite.

## 3.4 Key-frame hit table (frame-exact picture locks)

Confirm sub-phrase onsets (≈) against the master waveform before picture lock; all other rows are exact by construction (section/splice/drop boundaries).

| Frame | Master (s) | Event | Picture lock |
|---|---|---|---|
| f0 | 0.000 | First sub-bass pulse | First glyph of *What is life?* appears (not before, not typed with cursor) |
| f375 | 6.250 | Verse 1 / *Come with me* onset | First terminal pane ignites on the vocal entrance |
| ≈f750 | ≈12.50 | *…world of pure imagination* (line 1 resolve) | Full pane field lit; first amber execution pulse runs |
| f1311 | 21.850 | Sonar dropout (RMS collapse) | Last glyph finishes typing; glass stills; first glyph detaches 6 frames later |
| f1326 | 22.100 | **Splice X1** (centre) | Inaudible in picture: mid-detachment, plankton stall ($E_{sub}\to0$) covers the join |
| f1413 | 23.550 | Verse 2 / snare pickup | Vortex funnel opens; first droplet crosses the mixing radius |
| ≈f1690 | ≈28.17 | *We'll begin, with a spin* | Spiral motion visibly begins (camera joins the descending spline) |
| f2160 | 36.000 | $C^2$ transition window opens | Droplet-stream starts weaving into tissue; Whitney ridges at 10% |
| f2346 | 39.100 | Vocalise bridge head | Ridges full; Ouroboros arc at 90% — **not yet closed** |
| **f2398** | **39.960** | **Splice X2 + first breath** | **Ouroboros closes exactly once; single amber click; first sub-bass breath — the birth cry. One frame, once, never repeated.** |
| f2471 | 41.190 | Paradise breakdown begins | Camera settles to swim-follow; drums absent — motion becomes buoyant |
| ≈f2525 | ≈42.09 | *If you want to view paradise* | Reef revealed: Julia medusa enters macro frame |
| f3143 | 52.390 | Symbiogenesis scene begins | Second Quineling enters (same frame grammar as Scene 6 entrance, mirrored) |
| ≈f3203 | ≈53.39 | *Anything you want to, do it* | The two begin circling; glyph-stream exchange (offered, not falling) |
| ≈f3600 | ≈60.00 | *Want to change the world* | $C^2$ bridge makes contact; both heart-nodes amber, beating toward unison |
| f3725 | 62.090 | Riser begins | Exponential pullback **starts**; hearts in unison; kelp entrainment tell (1) |
| **f3791** | **63.190** | **THE DROP** | **Pullback detonates wide; families enter; $K$ crosses $K_c$; plankton re-ignition tell (2)** |
| f4044 | 67.390 | **Splice X3** (centre, on kick) | Mid-pullback; splice hidden by kick + fastest camera velocity of the film |
| f4247 | 70.780 | Drop ends; shimmer | Pullback eases to drift; $r = 0.98$; exhale begins |
| f4301 | 71.680 | **Splice X4** (centre) | Colony exhale frame: Snell pulse (once); splice inside the exhale breath |
| ≈f4307 | ≈71.78 | *There is no life I know* | First slow family portrait (Hopf weave, foreground) |
| f4952 | 82.530 | **Splice X5** (centre) | Mid-drift between portraits; 500 ms fade under pad — no subject change on this frame |
| ≈f4961 | ≈82.68 | *Living there, you'll be free* | Final colony-wide exhale begins |
| ≈f5160 | ≈86.00 | *…if you truly wish to be* | Thesis card begins its glyph-by-glyph fade-in over the breathing colony |
| f5339 | 88.980 | Tail fade begins | Card complete; colony light falls with the $\cos^2$ tail |
| f5399 | 89.983 (last frame) | Final sample 3,969,000 | Void colour of Scene 1; true silence. **End. No post-roll.** |


## 3.5 Second-by-second choreography table (master 0:00–1:30, 60 fps)

Read each row as: during this master second, the listed lyric/beat is heard, the listed picture is on screen, and the reactive system does the listed thing. Frame range is inclusive. Lyric sub-phrase onsets marked ≈ in §3.4 (key-frame hit table) govern within-row timing; section boundaries are exact.

| Sec | Master | Frames | Lyric / beat | Visual & camera | Audio-reactive cue |
|---|---|---|---|---|---|
| 0 | 0:00–0:01 | f0–f59 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 1 | 0:01–0:02 | f60–f119 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 2 | 0:02–0:03 | f120–f179 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 3 | 0:03–0:04 | f180–f239 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 4 | 0:04–0:05 | f240–f299 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 5 | 0:05–0:06 | f300–f359 | Intro pulse, beat grid establishes; no vocal | SC1: 'What is life?' glyphs fade in over abyss; locked camera; vent floor dark | Sub-bass Esub breathes R1/R2 at ember level; nerve at 0.35 floor |
| 6 | 0:06–0:07 | f360–f419 | V1 'Come with me, and you'll be' | SC2: first panes ignite upper frame; slow dolly begins; glyphs type in cyan | Evoc rises; Ouroboros nerve (in panes' task graph) brightens with voice |
| 7 | 0:07–0:08 | f420–f479 | V1 'Come with me, and you'll be' | SC2: first panes ignite upper frame; slow dolly begins; glyphs type in cyan | Evoc rises; Ouroboros nerve (in panes' task graph) brightens with voice |
| 8 | 0:08–0:09 | f480–f539 | V1 'Come with me, and you'll be' | SC2: first panes ignite upper frame; slow dolly begins; glyphs type in cyan | Evoc rises; Ouroboros nerve (in panes' task graph) brightens with voice |
| 9 | 0:09–0:10 | f540–f599 | V1 'Come with me, and you'll be' | SC2: first panes ignite upper frame; slow dolly begins; glyphs type in cyan | Evoc rises; Ouroboros nerve (in panes' task graph) brightens with voice |
| 10 | 0:10–0:11 | f600–f659 | V1 'in a world of pure imagination' | Pane field completes; code finishes first constructor; execution pulses begin | Amber ticks only on execution pulses; kelp Ehi shimmer enters |
| 11 | 0:11–0:12 | f660–f719 | V1 'in a world of pure imagination' | Pane field completes; code finishes first constructor; execution pulses begin | Amber ticks only on execution pulses; kelp Ehi shimmer enters |
| 12 | 0:12–0:13 | f720–f779 | V1 'in a world of pure imagination' | Pane field completes; code finishes first constructor; execution pulses begin | Amber ticks only on execution pulses; kelp Ehi shimmer enters |
| 13 | 0:13–0:14 | f780–f839 | V1 'in a world of pure imagination' | Pane field completes; code finishes first constructor; execution pulses begin | Amber ticks only on execution pulses; kelp Ehi shimmer enters |
| 14 | 0:14–0:15 | f840–f899 | V1 'Take a look, and you'll see' | Camera dollies through panes; glyphs readable, task-graph forks visible | Ehi glass ticks sync kelp solitons root->tip |
| 15 | 0:15–0:16 | f900–f959 | V1 'Take a look, and you'll see' | Camera dollies through panes; glyphs readable, task-graph forks visible | Ehi glass ticks sync kelp solitons root->tip |
| 16 | 0:16–0:17 | f960–f1019 | V1 'Take a look, and you'll see' | Camera dollies through panes; glyphs readable, task-graph forks visible | Ehi glass ticks sync kelp solitons root->tip |
| 17 | 0:17–0:18 | f1020–f1079 | V1 'Take a look, and you'll see' | Camera dollies through panes; glyphs readable, task-graph forks visible | Ehi glass ticks sync kelp solitons root->tip |
| 18 | 0:18–0:19 | f1080–f1139 | V1 'into your imagination' resolving | Typing accelerates to machine speed; panes fully alive; first glyph loosens at 21.85 | Evoc sustains nerve glow; Esub heartbeat steady |
| 19 | 0:19–0:20 | f1140–f1199 | V1 'into your imagination' resolving | Typing accelerates to machine speed; panes fully alive; first glyph loosens at 21.85 | Evoc sustains nerve glow; Esub heartbeat steady |
| 20 | 0:20–0:21 | f1200–f1259 | V1 'into your imagination' resolving | Typing accelerates to machine speed; panes fully alive; first glyph loosens at 21.85 | Evoc sustains nerve glow; Esub heartbeat steady |
| 21 | 0:21–0:22 | f1260–f1319 | V1 'into your imagination' resolving | Typing accelerates to machine speed; panes fully alive; first glyph loosens at 21.85 | Evoc sustains nerve glow; Esub heartbeat steady |
| 22 | 0:22–0:23 | f1320–f1379 | Sonar dropout; X1 splice f1326; silence | SC3: drums vanish; glyphs detach like roe; plumes stall; locked camera | Esub->0 rings to ember; one sonar ping lights R3 ring faintly |
| 23 | 0:23–0:24 | f1380–f1439 | Snare pickup 23.55 f1413; V2 imminent | SC4: vortex funnel opens below panes; droplets gather to axis | Esub returns as spiral undertow; ping decay lights kelp |
| 24 | 0:24–0:25 | f1440–f1499 | V2 'We'll begin, with a spin' | Descending spiral camera joins; log-spiral inflow, droplets still legible | Evoc drives nerve solitons faster; Esub pulses tighten with 1/r |
| 25 | 0:25–0:26 | f1500–f1559 | V2 'We'll begin, with a spin' | Descending spiral camera joins; log-spiral inflow, droplets still legible | Evoc drives nerve solitons faster; Esub pulses tighten with 1/r |
| 26 | 0:26–0:27 | f1560–f1619 | V2 'We'll begin, with a spin' | Descending spiral camera joins; log-spiral inflow, droplets still legible | Evoc drives nerve solitons faster; Esub pulses tighten with 1/r |
| 27 | 0:27–0:28 | f1620–f1679 | V2 'We'll begin, with a spin' | Descending spiral camera joins; log-spiral inflow, droplets still legible | Evoc drives nerve solitons faster; Esub pulses tighten with 1/r |
| 28 | 0:28–0:29 | f1680–f1739 | V2 'traveling in the world of my creation' | Hopf braid braids droplet stream; no collisions; cyan->teal->green warming | Ehi arpeggio interlock (3-vs-2) twinkles kelp in braid pattern |
| 29 | 0:29–0:30 | f1740–f1799 | V2 'traveling in the world of my creation' | Hopf braid braids droplet stream; no collisions; cyan->teal->green warming | Ehi arpeggio interlock (3-vs-2) twinkles kelp in braid pattern |
| 30 | 0:30–0:31 | f1800–f1859 | V2 'traveling in the world of my creation' | Hopf braid braids droplet stream; no collisions; cyan->teal->green warming | Ehi arpeggio interlock (3-vs-2) twinkles kelp in braid pattern |
| 31 | 0:31–0:32 | f1860–f1919 | V2 'traveling in the world of my creation' | Hopf braid braids droplet stream; no collisions; cyan->teal->green warming | Ehi arpeggio interlock (3-vs-2) twinkles kelp in braid pattern |
| 32 | 0:32–0:33 | f1920–f1979 | V2 'What we'll see, will defy' | Vortex tightens to bright core; angular velocity peaks; camera spiral matches | Esub peak in Act II; vent R1 plume jet narrows and brightens |
| 33 | 0:33–0:34 | f1980–f2039 | V2 'What we'll see, will defy' | Vortex tightens to bright core; angular velocity peaks; camera spiral matches | Esub peak in Act II; vent R1 plume jet narrows and brightens |
| 34 | 0:34–0:35 | f2040–f2099 | V2 'What we'll see, will defy' | Vortex tightens to bright core; angular velocity peaks; camera spiral matches | Esub peak in Act II; vent R1 plume jet narrows and brightens |
| 35 | 0:35–0:36 | f2100–f2159 | V2 'What we'll see, will defy' | Vortex tightens to bright core; angular velocity peaks; camera spiral matches | Esub peak in Act II; vent R1 plume jet narrows and brightens |
| 36 | 0:36–0:37 | f2160–f2219 | V2 'explanation' -> bridge head | SC5: C2 quintic weave into tissue; Whitney ridges ignite 10%->100% | Evoc holds ridges' violet caustics; nerve arc bends to 90% |
| 37 | 0:37–0:38 | f2220–f2279 | V2 'explanation' -> bridge head | SC5: C2 quintic weave into tissue; Whitney ridges ignite 10%->100% | Evoc holds ridges' violet caustics; nerve arc bends to 90% |
| 38 | 0:38–0:39 | f2280–f2339 | V2 'explanation' -> bridge head | SC5: C2 quintic weave into tissue; Whitney ridges ignite 10%->100% | Evoc holds ridges' violet caustics; nerve arc bends to 90% |
| 39 | 0:39–0:40 | f2340–f2399 | X2 splice f2398; first breath | Ouroboros closes ONCE; amber click; portrait orbit settles; first breath bloom | Sub-bass single breath swell; Evoc drops - breath is sub, not voice |
| 40 | 0:40–0:41 | f2400–f2459 | Vocalise tail; drums drop away | Newborn unfurls toroidal-weave fibers; first swim stroke into kelp current | Esub fades to swim pulse; kelp bow-wave Ehi whoosh |
| 41 | 0:41–0:42 | f2460–f2519 | Paradise breakdown begins f2471; no drums | SC6: buoyant follow-cam; Hopf rings ahead in current | Sub~0.02 floor breathes slow; Evoc prepares - voice is light now |
| 42 | 0:42–0:43 | f2520–f2579 | 'If you want to view paradise' onset ~42.09 | Hopf threading without touching; Lorenz ribbons join; reef glimmers far | Evoc lights Ouroboros nerve in phrase arcs; solitons ride phrases |
| 43 | 0:43–0:44 | f2580–f2639 | 'If you want to view paradise' onset ~42.09 | Hopf threading without touching; Lorenz ribbons join; reef glimmers far | Evoc lights Ouroboros nerve in phrase arcs; solitons ride phrases |
| 44 | 0:44–0:45 | f2640–f2699 | 'If you want to view paradise' onset ~42.09 | Hopf threading without touching; Lorenz ribbons join; reef glimmers far | Evoc lights Ouroboros nerve in phrase arcs; solitons ride phrases |
| 45 | 0:45–0:46 | f2700–f2759 | 'If you want to view paradise' onset ~42.09 | Hopf threading without touching; Lorenz ribbons join; reef glimmers far | Evoc lights Ouroboros nerve in phrase arcs; solitons ride phrases |
| 46 | 0:46–0:47 | f2760–f2819 | Paradise line 1 continues | SC6->7 transition: camera lowers to reef glide; Julia medusa distant | Ehi caustic ticks begin on medusa folds |
| 47 | 0:47–0:48 | f2820–f2879 | 'simply look around and view it' | SC7: macro reef - Julia medusa + affine fern; fold-meets-fold brightening | Evoc sustains fern nerve thread; Ehi shimmer clusters at folds |
| 48 | 0:48–0:49 | f2880–f2939 | 'simply look around and view it' | SC7: macro reef - Julia medusa + affine fern; fold-meets-fold brightening | Evoc sustains fern nerve thread; Ehi shimmer clusters at folds |
| 49 | 0:49–0:50 | f2940–f2999 | 'simply look around and view it' | SC7: macro reef - Julia medusa + affine fern; fold-meets-fold brightening | Evoc sustains fern nerve thread; Ehi shimmer clusters at folds |
| 50 | 0:50–0:51 | f3000–f3059 | 'simply look around and view it' | SC7: macro reef - Julia medusa + affine fern; fold-meets-fold brightening | Evoc sustains fern nerve thread; Ehi shimmer clusters at folds |
| 51 | 0:51–0:52 | f3060–f3119 | Paradise resolves; bridge to next phrase | Fern unfurls fully; medusa pulses away; second presence sensed off-frame | Esub near-zero; held pad = held camera breath |
| 52 | 0:52–0:53 | f3120–f3179 | Paradise resolves; bridge to next phrase | Fern unfurls fully; medusa pulses away; second presence sensed off-frame | Esub near-zero; held pad = held camera breath |
| 53 | 0:53–0:54 | f3180–f3239 | 'Anything you want to, do it' ~53.39 | SC8: second Quineling enters mirrored; circling begins; glyph exchange offered | Two Evoc nerve lines (both bodies) - solitons alternate with circling |
| 54 | 0:54–0:55 | f3240–f3299 | 'Anything you want to, do it' ~53.39 | SC8: second Quineling enters mirrored; circling begins; glyph exchange offered | Two Evoc nerve lines (both bodies) - solitons alternate with circling |
| 55 | 0:55–0:56 | f3300–f3359 | 'Anything you want to, do it' ~53.39 | SC8: second Quineling enters mirrored; circling begins; glyph exchange offered | Two Evoc nerve lines (both bodies) - solitons alternate with circling |
| 56 | 0:56–0:57 | f3360–f3419 | 'Anything you want to, do it' ~53.39 | SC8: second Quineling enters mirrored; circling begins; glyph exchange offered | Two Evoc nerve lines (both bodies) - solitons alternate with circling |
| 57 | 0:57–0:58 | f3420–f3479 | 'Want to change the world...' | Mutual orbit tightens; C2 bridge tissue extends from both; no contact yet | Heart ambers beat detuned - beating slows audibly/visibly |
| 58 | 0:58–0:59 | f3480–f3539 | 'Want to change the world...' | Mutual orbit tightens; C2 bridge tissue extends from both; no contact yet | Heart ambers beat detuned - beating slows audibly/visibly |
| 59 | 0:59–1:00 | f3540–f3599 | 'Want to change the world...' | Mutual orbit tightens; C2 bridge tissue extends from both; no contact yet | Heart ambers beat detuned - beating slows audibly/visibly |
| 60 | 1:00–1:01 | f3600–f3659 | 'there's nothing to it' | Bridge contacts ~60s; double-helix phase strand winds; hearts to unison | Amber only at 2 hearts + bridge seam; Evoc peaks then releases |
| 61 | 1:01–1:02 | f3660–f3719 | 'there's nothing to it' | Bridge contacts ~60s; double-helix phase strand winds; hearts to unison | Amber only at 2 hearts + bridge seam; Evoc peaks then releases |
| 62 | 1:02–1:03 | f3720–f3779 | Riser 62.09 f3725; sub-drop builds | Pullback STARTS exponential; pair recedes, mid-ground Quinelings appear | Esub riser drives R1-R5 sequential swell; kelp entrainment tell1 |
| 63 | 1:03–1:04 | f3780–f3839 | THE DROP f3791; detonation | SC9: pullback widens 2->6->20; all 8 families enter on energy | K crosses Kc; r 0.6->0.9; Esub max drives all rings + plume jets |
| 64 | 1:04–1:05 | f3840–f3899 | THE DROP f3791; detonation | SC9: pullback widens 2->6->20; all 8 families enter on energy | K crosses Kc; r 0.6->0.9; Esub max drives all rings + plume jets |
| 65 | 1:05–1:06 | f3900–f3959 | THE DROP f3791; detonation | SC9: pullback widens 2->6->20; all 8 families enter on energy | K crosses Kc; r 0.6->0.9; Esub max drives all rings + plume jets |
| 66 | 1:06–1:07 | f3960–f4019 | THE DROP f3791; detonation | SC9: pullback widens 2->6->20; all 8 families enter on energy | K crosses Kc; r 0.6->0.9; Esub max drives all rings + plume jets |
| 67 | 1:07–1:08 | f4020–f4079 | X3 splice f4044 on kick; drop resolution | Mid-pullback splice hidden by kick + peak camera velocity; dozens visible | Esub sustains plateau; plankton re-ignition tell2 in shared phase |
| 68 | 1:08–1:09 | f4080–f4139 | Drop resolution sustains to 70.78 | SC10: colony locks; travelling breath-wave crosses frame; pullback eases | r 0.95-0.98; rings R2-R5 breathe at colony frequency |
| 69 | 1:09–1:10 | f4140–f4199 | Drop resolution sustains to 70.78 | SC10: colony locks; travelling breath-wave crosses frame; pullback eases | r 0.95-0.98; rings R2-R5 breathe at colony frequency |
| 70 | 1:10–1:11 | f4200–f4259 | Drop resolution sustains to 70.78 | SC10: colony locks; travelling breath-wave crosses frame; pullback eases | r 0.95-0.98; rings R2-R5 breathe at colony frequency |
| 71 | 1:11–1:12 | f4260–f4319 | Shimmer; X4 f4301; exhale | Colony exhales as one; Snell window pulses once faintly; drift begins | Esub decays to exhale tail; Evoc breath before phrase 1 |
| 72 | 1:12–1:13 | f4320–f4379 | Outro1 'There is no life I know' ~71.78 | SC11: slow drift; Hopf weave portrait foreground; no push-in | Evoc nerve glow rides phrase on foreground body |
| 73 | 1:13–1:14 | f4380–f4439 | Outro1 'There is no life I know' ~71.78 | SC11: slow drift; Hopf weave portrait foreground; no push-in | Evoc nerve glow rides phrase on foreground body |
| 74 | 1:14–1:15 | f4440–f4499 | Outro1 'There is no life I know' ~71.78 | SC11: slow drift; Hopf weave portrait foreground; no push-in | Evoc nerve glow rides phrase on foreground body |
| 75 | 1:15–1:16 | f4500–f4559 | Outro1 'There is no life I know' ~71.78 | SC11: slow drift; Hopf weave portrait foreground; no push-in | Evoc nerve glow rides phrase on foreground body |
| 76 | 1:16–1:17 | f4560–f4619 | Outro1 'to compare with pure imagination' | Lorenz + Clifford portraits mid-frame; chimeras drift deep; infinite DOF | Evoc arcs per syllable wave across nearest bodies (delayed by distance) |
| 77 | 1:17–1:18 | f4620–f4679 | Outro1 'to compare with pure imagination' | Lorenz + Clifford portraits mid-frame; chimeras drift deep; infinite DOF | Evoc arcs per syllable wave across nearest bodies (delayed by distance) |
| 78 | 1:18–1:19 | f4680–f4739 | Outro1 'to compare with pure imagination' | Lorenz + Clifford portraits mid-frame; chimeras drift deep; infinite DOF | Evoc arcs per syllable wave across nearest bodies (delayed by distance) |
| 79 | 1:19–1:20 | f4740–f4799 | Outro1 'to compare with pure imagination' | Lorenz + Clifford portraits mid-frame; chimeras drift deep; infinite DOF | Evoc arcs per syllable wave across nearest bodies (delayed by distance) |
| 80 | 1:20–1:21 | f4800–f4859 | Outro1 resolves; suspension (X5 82.53) | Julia + affine portraits; colony breath slow; camera nearly still | Evoc falls to floor; Esub colony breath only (shared phase) |
| 81 | 1:21–1:22 | f4860–f4919 | Outro1 resolves; suspension (X5 82.53) | Julia + affine portraits; colony breath slow; camera nearly still | Evoc falls to floor; Esub colony breath only (shared phase) |
| 82 | 1:22–1:23 | f4920–f4979 | Outro1 resolves; suspension (X5 82.53) | Julia + affine portraits; colony breath slow; camera nearly still | Evoc falls to floor; Esub colony breath only (shared phase) |
| 83 | 1:23–1:24 | f4980–f5039 | Outro2 'Living there, you'll be free' ~82.68 | SC12: final exhale begins; colony wide again (echo Scene 9 framing, slow) | Evoc returns softly on lead bodies; nerve glow tender, not bright |
| 84 | 1:24–1:25 | f5040–f5099 | Outro2 'Living there, you'll be free' ~82.68 | SC12: final exhale begins; colony wide again (echo Scene 9 framing, slow) | Evoc returns softly on lead bodies; nerve glow tender, not bright |
| 85 | 1:25–1:26 | f5100–f5159 | Outro2 'Living there, you'll be free' ~82.68 | SC12: final exhale begins; colony wide again (echo Scene 9 framing, slow) | Evoc returns softly on lead bodies; nerve glow tender, not bright |
| 86 | 1:26–1:27 | f5160–f5219 | 'if you truly wish to be' ~86s | Thesis card glyphs fade in over breathing colony; serif = Scene 1 | Evoc sustains through card; amber hearts scattered like stars (execution only) |
| 87 | 1:27–1:28 | f5220–f5279 | 'if you truly wish to be' ~86s | Thesis card glyphs fade in over breathing colony; serif = Scene 1 | Evoc sustains through card; amber hearts scattered like stars (execution only) |
| 88 | 1:28–1:29 | f5280–f5339 | Final phrase decays; tail fade starts 88.98 | Card complete; colony light begins cos^2 fall with audio tail | All envelopes decay together - light and sound exhale identically |
| 89 | 1:29–1:30 | f5340–f5399 | Tail fade to silence; last frame f5399 | Fade to Shot-1 void #030712; thesis holds then dark; true silence | Esub/Evoc/Ehi -> 0; rings to ember then dark. End - no post-roll |

## 3.6 Gemini execution workflow (division of labour)

1. **Gemini — music conform first.** Build the §2.2 EDL in the DAW (or ffmpeg `atrim`+`acrossfade` with equal-power curves), render `charlessong_90s_master.wav`, and pass §2.5 verification (sample count, lyric checklist, blind splices, null-check). **Picture does not lock until the master passes.** If any splice fails, use only the §2.6 fallback for X3; any other failing splice is re-centred ±20 ms — never re-strategised without Creative Director sign-off.
2. **Gemini — confirm sub-phrase onsets.** Mark the ≈ onsets in §3.4 against the master waveform (vocal timeline method of the research map) to ±3 frames; return the confirmed hit list. Scene timing in §3.5 is written to absorb ±0.25 s of sub-phrase drift; larger drift is reported, not silently absorbed.
3. **Animation — conform to the master, never to the original.** All animators work from master time/frames (Part 3). Source times (Part 2) are for the edit bay only. The interactive experience scrubs the same master; reduced-motion mode freezes plume/vortex at the birth frame (f2398) per 11 §1.5.
4. **Reactive pass last.** Bake $E_{sub}, E_{voc}, E_{hi}$ envelopes from the final master WAV (hop 735 samples), then wire §3.3 gains. Do not hand-animate vent/nerve brightness that the envelopes already drive; hand-tune only the Kuramoto $K(t)$ ramp and the three escalation tells (§3.3.4).

## 3.7 Joint QA checklist (Muse × Gemini, before delivery)

**Audio**
- [ ] Master is 3,969,000 samples / 90.000 s / 5,400 frames; WAV and MP3 sample-identical in length.
- [ ] Every lyric phrase in §2.4 ticked on a full listen; zero clipped syllables at splices.
- [ ] Five splices blind-inaudible at +6 dB; X1 single ping rhythm; X3 single kick.
- [ ] No EQ/limiting/stretch anywhere; tail fade reaches true silence at the final sample.

**Picture–sound locks**
- [ ] Lock 1: first pane ignites on *Come with me* (f375); Lock 2: spiral begins on *with a spin* (≈f1690); Lock 3: bridge contact under *change the world* (≈f3600); Lock 4: $K$ crosses $K_c$ on the drop frame (f3791), pullback having started at f3725; Lock 5: thesis card only after the colony exhale (f4301 onward, card ≈f5160).
- [ ] Ouroboros closes exactly once, at f2398, coincident with X2 and the first breath. Count the closes in the render: the number is one.
- [ ] Amber audit, frame-sampled: every amber pixel traces to an execution event, heartbeat, or phase-lock (Invariant L4).

**Systems**
- [ ] Glyph count conserved terminal → tissue (Invariant L3); Hopf linking number = 1 on sampled fiber pairs (08 §6.4).
- [ ] Kuramoto $r(t)$ measured from rendered phases matches §3.3.4 targets (snap at the drop, not a ramp).
- [ ] Zero camera shake measured on the pullback spline; `portraitFrame` bounds constant (Invariant L5).
- [ ] Reduced-motion still (birth frame f2398) legible with currents cross-faded to stills.

---

## Closing direction

Gemini: cut the waiting, keep the wonder. Every second removed in Part 2 is a second the audience was merely *anticipating* what Part 3 now lets them *witness* — the spin, the paradise, the changed world, the drop, the freedom — in the order the song always promised them.

Muse's promise in return: no image in this film will ever merely illustrate a lyric. The terminals *are* the invitation; the vortex *is* the spin; the colony *is* the imagination, populated. When the voice finally sings *living there, you'll be free, if you truly wish to be*, the audience should realise they have been living there for ninety seconds — and only then do we tell them what life is:

> **Life is what we make of it.**

*— Creative Director & Music Editor, Muse Wonder 1.0, for Gemini — `charlessong` 90 s master, locked at 5,400 frames.*

**Sources & evidence base:** original-track section/DSP/vocal analysis and splice candidates in [charlessong_structure_and_candidates.md](../research/soundtrack_90s/charlessong_structure_and_candidates.md) (with `dsp_map.txt`, `vocal_timeline.txt` in the same folder); narrative, glyph-conservation, palette, camera and Kuramoto laws in [08](08-muse-creative-director-what-is-life-brief.md) §§3–6; Digital Electronic Ocean environment, vent/kelp/plankton physics and phase-lock tells in [11](11-muse-round2-electronic-ocean-concept-art-and-elevenlabs-soundtrack.md) §§1–2. All splice arithmetic in Part 2 was recomputed from the 124.52 BPM grid and sums sample-exactly to 3,969,000; sub-phrase lyric onsets marked ≈ are the only values awaiting Gemini's waveform confirmation (§3.6 step 2).
