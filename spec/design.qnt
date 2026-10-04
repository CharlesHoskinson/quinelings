// QDL safety abstraction. Codec equality here is an assumption, not a byte proof.
module design {
  // Integer milliscale samples of qdl.js numeric domains; model tags are fixed.
  type Profile = {
    family: int, a: int, b: int, baseRadius: int, degreeGain: int, literalGain: int,
    bend: int, frequencyGain: int, ripple: int, motionRate: int,
    rhythmMode: int, rhythmRate: int, breath: int, wave: int, waveNumber: int,
    lag: int, rhythmAsymmetry: int, overtone: int,
    chromaMode: int, chromaStrength: int, lensToken: int, lensLower: int, lensUpper: int,
    hasThreshold: bool, lensThreshold: int, bindingNode: int, bindingPath: int,
    ghost: int, secondary: int, ridge: int,
    ribbons: int, crests: int, spread: int, folds: int, taper: int, asymmetry: int,
    surfaceDepth: int, twist: int, phaseLag: int, samples: int,
    recess: int, crest: int, depthContrast: int,
    occupancy: int, lean: int, yaw: int, pitch: int, focus: int
  }
  type State = {
    source: int, origin: int, phase: int, paused: bool, repeats: int,
    executions: int, effects: int, emitted: int, children: int, energy: int,
    last: str, priorEffects: int, priorExecutions: int, priorChildren: int,
    childSource: int, guard: bool, allowed: bool,
    valueView: bool, scalarVisible: bool, traceSource: int, traceProfile: Profile,
    traceSuccess: bool, traceNumeric: bool,
    profile: Profile, originProfile: Profile, emittedProfile: Profile, childProfile: Profile
  }
  var s: State

  pure val sources = Set(1, 2, 3)
  pure val phases = Set(0, 1, 2, 3)
  pure val nodes = Set(0, 1, 2, 3)
  // Fixed acyclic producer graph: input -> transform -> guard -> action.
  pure val links = Set((0, 1), (1, 2), (2, 3))
  pure def opcode(id: int): int = id
  pure def role(op: int): str =
    if (op == 0) "input" else if (op == 1) "transform"
    else if (op == 2) "guard" else "action"
  pure def color(op: int): int = 100 + op
  pure def frequency(op: int): int = 1 + op
  pure def depth(id: int): int = id
  pure def fanout(id: int): int = links.filter(e => e._1 == id).size()
  // Abstract finite geometry, not sin/cos or a claim of renderer refinement.
  pure def anchor(id: int, phase: int): (int, int) = (id + phase, depth(id))
  pure def filament(edge: (int, int), u: int, phase: int): (int, int) =
    if (u == 0) anchor(edge._1, phase)
    else if (u == 2) anchor(edge._2, phase)
    else (edge._1 + phase, depth(edge._1) + 1)
  // Tagged identity token substitutes for numeric serialization, abstractly.
  pure def encodeToken(source: int, profile: Profile): { token: int, design: Profile } =
    { token: source, design: profile }
  pure def decodeToken(encoded: { token: int, design: Profile }): int = encoded.token
  pure def validProfile(p: Profile): bool =
    p.family >= 0 and p.family <= 9 and p.a >= 0 and p.a <= 450
    and p.b >= 0 and p.b <= 450 and p.a + p.b < 1000
    and p.baseRadius >= 10 and p.baseRadius <= 80
    and p.degreeGain >= 0 and p.degreeGain <= 6 and p.literalGain >= 0 and p.literalGain <= 3
    and p.bend >= 0 and p.bend <= 80 and p.frequencyGain >= 0 and p.frequencyGain <= 200
    and p.ripple >= 0 and p.ripple <= 300 and p.motionRate >= 0 and p.motionRate <= 50
    // mode 0 represents absent legacy rhythm; other fields are dormant bounded placeholders.
    and p.rhythmMode >= 0 and p.rhythmMode <= 2
    and p.rhythmRate >= 250 and p.rhythmRate <= 2000
    and p.breath >= 0 and p.breath <= 180 and p.wave >= 0 and p.wave <= 180
    and p.waveNumber >= 0 and p.waveNumber <= 4000 and p.lag >= 0 and p.lag <= 2000
    and p.rhythmAsymmetry >= 0 and p.rhythmAsymmetry <= 800
    and p.overtone >= 0 and p.overtone <= 350
    // Chroma mode 0 is omission, 1 role territories, 2 a scalar lens.
    // Lens strings/binding paths are identity tokens; numeric domains use finite samples.
    and p.chromaMode >= 0 and p.chromaMode <= 2
    and p.chromaStrength >= 0 and p.chromaStrength <= 1000
    and p.lensToken >= 0 and p.lensToken <= 3
    and p.lensLower < p.lensUpper
    and (not(p.hasThreshold) or (p.lensLower <= p.lensThreshold and p.lensThreshold <= p.lensUpper))
    and nodes.contains(p.bindingNode) and p.bindingPath >= 0 and p.bindingPath <= 3
    and p.ghost >= 0 and p.ghost < p.secondary and p.secondary < p.ridge and p.ridge <= 1000
    and p.ribbons >= 8 and p.ribbons <= 36 and p.crests >= 3 and p.crests <= 6
    and p.spread >= 20 and p.spread <= 240 and p.folds >= 2 and p.folds <= 9
    and p.taper >= 400 and p.taper <= 2500 and p.asymmetry >= 0 and p.asymmetry <= 350
    and p.surfaceDepth >= 0 and p.surfaceDepth <= 350 and p.twist >= 0 and p.twist <= 3000
    and p.phaseLag >= 0 and p.phaseLag <= 2000 and p.samples >= 4000 and p.samples <= 24000
    and p.recess >= 15 and p.recess <= 120 and p.crest >= 160 and p.crest <= 650
    and p.recess < p.crest and p.depthContrast >= 0 and p.depthContrast <= 800
    and p.occupancy >= 600 and p.occupancy <= 840 and p.focus >= 150 and p.focus <= 800
    and p.lean >= -500 and p.lean <= 500 and p.yaw >= -500 and p.yaw <= 500
    and p.pitch >= -500 and p.pitch <= 500

  action init = {
    nondet source = sources.oneOf()
    nondet repeats = 1.to(8).oneOf()
    nondet family = 0.to(9).oneOf()
    nondet a = 0.to(450).oneOf()
    nondet b = 0.to(450).oneOf()
    nondet baseRadius = 10.to(80).oneOf()
    nondet degreeGain = 0.to(6).oneOf()
    nondet literalGain = 0.to(3).oneOf()
    nondet bend = 0.to(80).oneOf()
    nondet frequencyGain = 0.to(200).oneOf()
    nondet ripple = 0.to(300).oneOf()
    nondet motionRate = 0.to(50).oneOf()
    nondet rhythmMode = 0.to(2).oneOf()
    nondet rhythmRate = 250.to(2000).oneOf()
    nondet breath = 0.to(180).oneOf()
    nondet wave = 0.to(180).oneOf()
    nondet waveNumber = 0.to(4000).oneOf()
    nondet lag = 0.to(2000).oneOf()
    nondet rhythmAsymmetry = 0.to(800).oneOf()
    nondet overtone = 0.to(350).oneOf()
    nondet chromaMode = 0.to(2).oneOf()
    nondet chromaStrength = 0.to(1000).oneOf()
    nondet lensToken = 0.to(3).oneOf()
    nondet lensLower = (-2).to(1).oneOf()
    nondet lensUpper = (lensLower + 1).to(3).oneOf()
    nondet hasThreshold = Set(false, true).oneOf()
    nondet lensThreshold = lensLower.to(lensUpper).oneOf()
    nondet bindingNode = nodes.oneOf()
    nondet bindingPath = 0.to(3).oneOf()
    nondet ghost = 0.to(998).oneOf()
    nondet secondary = (ghost + 1).to(999).oneOf()
    nondet ridge = (secondary + 1).to(1000).oneOf()
    nondet ribbons = (8).to(36).oneOf()
    nondet crests = (3).to(6).oneOf()
    nondet spread = (20).to(240).oneOf()
    nondet folds = (2).to(9).oneOf()
    nondet taper = (400).to(2500).oneOf()
    nondet asymmetry = (0).to(350).oneOf()
    nondet surfaceDepth = (0).to(350).oneOf()
    nondet twist = (0).to(3000).oneOf()
    nondet phaseLag = (0).to(2000).oneOf()
    nondet samples = (4000).to(24000).oneOf()
    nondet recess = (15).to(120).oneOf()
    nondet crest = (160).to(650).oneOf()
    nondet depthContrast = (0).to(800).oneOf()
    nondet occupancy = (600).to(840).oneOf()
    nondet lean = (-500).to(500).oneOf()
    nondet yaw = (-500).to(500).oneOf()
    nondet pitch = (-500).to(500).oneOf()
    nondet focus = (150).to(800).oneOf()
    val profile = {family: family, a: a, b: b, baseRadius: baseRadius,
      degreeGain: degreeGain, literalGain: literalGain, bend: bend,
      frequencyGain: frequencyGain, ripple: ripple, motionRate: motionRate,
      rhythmMode: rhythmMode, rhythmRate: rhythmRate, breath: breath, wave: wave,
      waveNumber: waveNumber, lag: lag, rhythmAsymmetry: rhythmAsymmetry, overtone: overtone,
      chromaMode: chromaMode, chromaStrength: chromaStrength, lensToken: lensToken,
      lensLower: lensLower, lensUpper: lensUpper, hasThreshold: hasThreshold,
      lensThreshold: lensThreshold, bindingNode: bindingNode, bindingPath: bindingPath,
      ghost: ghost, secondary: secondary, ridge: ridge,
      ribbons: ribbons, crests: crests, spread: spread, folds: folds, taper: taper, asymmetry: asymmetry, surfaceDepth: surfaceDepth, twist: twist, phaseLag: phaseLag, samples: samples, recess: recess, crest: crest, depthContrast: depthContrast, occupancy: occupancy, lean: lean, yaw: yaw, pitch: pitch, focus: focus}
    s' = {source: source, origin: source, phase: 0, paused: false, repeats: repeats,
      executions: 0, effects: 0, emitted: 0, children: 0, energy: 10,
      last: "init", priorEffects: 0, priorExecutions: 0, priorChildren: 0,
      childSource: 0, guard: false, allowed: false,
      valueView: false, scalarVisible: false, traceSource: 0, traceProfile: profile,
      traceSuccess: false, traceNumeric: false,
      profile: profile, originProfile: profile, emittedProfile: profile, childProfile: profile}
  }
  def snapshot(kind: str): State = s
    .with("last", kind)
    .with("priorEffects", s.effects)
    .with("priorExecutions", s.executions)
    .with("priorChildren", s.children)

  action render = s' = snapshot("render")
    .with("phase", if (s.paused or s.profile.motionRate == 0) s.phase else (s.phase + 1) % 4)
  action replay = s' = snapshot("replay")
  action togglePause = s' = snapshot("pause").with("paused", not(s.paused))
  // Abstract cache input: identity and success/numeric provenance are supplied as data.
  // This does not prove JavaScript trace authenticity or output-path evaluation.
  pure def freshScalar(source: int, profile: Profile, traceSource: int, traceProfile: Profile,
      success: bool, numeric: bool, valueView: bool): bool =
    valueView and profile.chromaMode == 2 and source == traceSource and profile == traceProfile
      and success and numeric
  action selectValueView(showValue: bool): bool = s' = snapshot("lens")
    .with("valueView", showValue)
    .with("scalarVisible", freshScalar(s.source, s.profile, s.traceSource, s.traceProfile,
      s.traceSuccess, s.traceNumeric, showValue))
  action cacheTrace(source: int, profile: Profile, success: bool, numeric: bool): bool =
    s' = snapshot("trace")
      .with("traceSource", source).with("traceProfile", profile)
      .with("traceSuccess", success).with("traceNumeric", numeric)
      .with("scalarVisible", freshScalar(s.source, s.profile, source, profile,
        success, numeric, s.valueView))
  action execute(guard: bool, allowed: bool): bool = all {
    s.executions < s.repeats,
    s.energy > 0,
    s' = snapshot("execute")
      .with("executions", s.executions + 1)
      .with("effects", s.effects + (if (guard and allowed) 1 else 0))
      .with("guard", guard).with("allowed", allowed)
      .with("emitted", decodeToken(encodeToken(s.source, s.profile)))
      .with("emittedProfile", encodeToken(s.source, s.profile).design)
      .with("energy", s.energy - 1)
      .with("traceSource", s.source).with("traceProfile", s.profile)
      .with("traceSuccess", true).with("traceNumeric", true)
      .with("scalarVisible", freshScalar(s.source, s.profile, s.source, s.profile,
        true, true, s.valueView))
  }
  def canAdmit(candidate: int, profile: Profile): bool =
    s.emitted == s.source and s.emittedProfile == s.profile
    and candidate == s.source and profile == s.profile and s.children < 2 and s.energy > 0
  action admit(candidate: int, profile: Profile): bool = all {
    canAdmit(candidate, profile),
    s' = snapshot("admit").with("children", s.children + 1).with("energy", s.energy - 1)
      .with("childSource", candidate)
      .with("childProfile", profile)
  }
  action rejectChild(candidate: int, profile: Profile): bool = all {
    not(canAdmit(candidate, profile)),
    s' = snapshot("reject")
  }
  action step = {
    nondet guard = Set(false, true).oneOf()
    nondet allowed = Set(false, true).oneOf()
    nondet candidate = sources.oneOf()
    nondet mutation = Set(0, 1, 2, 3, 4, 5, 6).oneOf()
    val profile = if (mutation == 0) s.profile
      else if (mutation == 1) s.profile.with("family", (s.profile.family + 1) % 10)
      else if (mutation == 2) s.profile.with("crest", if (s.profile.crest == 650) 649 else s.profile.crest + 1)
      else if (mutation == 3) s.profile.with("spread", if (s.profile.spread == 240) 239 else s.profile.spread + 1)
      else if (mutation == 4) s.profile.with("breath", if (s.profile.breath == 180) 179 else s.profile.breath + 1)
      else if (mutation == 5) s.profile.with("chromaStrength", if (s.profile.chromaStrength == 1000) 999 else s.profile.chromaStrength + 1)
      else s.profile.with("lensToken", (s.profile.lensToken + 1) % 4)
    any {render, replay, togglePause, execute(guard, allowed), admit(candidate, profile),
      rejectChild(candidate, profile), selectValueView(allowed), cacheTrace(candidate, profile, guard, allowed)}
  }

  val bounded = sources.contains(s.source) and phases.contains(s.phase)
    and s.repeats >= 1 and s.repeats <= 8
    and s.executions >= 0 and s.executions <= s.repeats
    and s.effects >= 0 and s.effects <= s.executions
    and s.children >= 0 and s.children <= 2
    and s.energy >= 0 and s.energy <= 10
  val conserved = s.energy + s.executions + s.children == 10
  val sourceIdentity = s.source == s.origin and s.profile == s.originProfile
    and (s.emitted == 0 or (s.emitted == s.source and s.emittedProfile == s.profile))
  val admissionIdentity = s.children == 0 or (s.emitted == s.source and s.childSource == s.source
    and s.childProfile == s.profile and s.emittedProfile == s.profile)
  val profileBounds = validProfile(s.profile)
  // Positive integer lower-bound numerator, assuming each cosine is in [-1,1].
  val radialLowerBound = s.profile.baseRadius * (1000 - s.profile.a - s.profile.b) > 0
  // Analytic lower-bound numerators, assuming trigonometric values lie in [-1,1].
  // These do not model floating-point waves or prove renderer refinement.
  val rhythmLowerBounds = 1000 - s.profile.breath >= 820
    and 1000 - s.profile.rhythmAsymmetry >= 200
    and 1000 + s.profile.overtone >= 1000
  val guardedEffects = if (s.last == "execute")
    s.effects == s.priorEffects + (if (s.guard and s.allowed) 1 else 0) else true
  val viewSeparation = if (Set("render", "replay", "pause", "reject", "lens", "trace").contains(s.last))
    s.effects == s.priorEffects and s.executions == s.priorExecutions and s.children == s.priorChildren
    else true
  val onlyExecutionEffects = if (s.last != "execute") s.effects == s.priorEffects else true
  val onlyAdmissionChildren = if (s.last != "admit") s.children == s.priorChildren else true
  val paletteIdentity = nodes.forall(a => nodes.forall(b =>
    (color(opcode(a)) == color(opcode(b))) == (opcode(a) == opcode(b))))
  val metadataStable = nodes.forall(id => frequency(opcode(id)) >= 1
    and frequency(opcode(id)) <= 4 and depth(id) == id and fanout(id) <= 1)
  val programBound = nodes.size() > 0 and nodes.size() <= 64
  val roleDictionary = role(0) == "input" and role(1) == "transform"
    and role(2) == "guard" and role(3) == "action"
  val geometryBound = nodes.forall(id => phases.forall(p =>
    anchor(id, p)._1 >= 0 and anchor(id, p)._1 <= 6
    and anchor(id, p)._2 >= 0 and anchor(id, p)._2 <= 3))
  val endpointsPinned = links.forall(e => phases.forall(p =>
    filament(e, 0, p) == anchor(e._1, p) and filament(e, 2, p) == anchor(e._2, p)))
  val acyclic = links.forall(e => depth(e._1) < depth(e._2))
  val codecAssumption = sources.forall(source => decodeToken(encodeToken(source, s.profile)) == source
    and encodeToken(source, s.profile).design == s.profile)
  val traceFreshness = s.scalarVisible == freshScalar(s.source, s.profile,
    s.traceSource, s.traceProfile, s.traceSuccess, s.traceNumeric, s.valueView)
  val safety = bounded and conserved and sourceIdentity and admissionIdentity
    and viewSeparation and onlyExecutionEffects and onlyAdmissionChildren and guardedEffects
    and paletteIdentity and metadataStable and programBound and roleDictionary
    and geometryBound and endpointsPinned and acyclic and codecAssumption
    and profileBounds and radialLowerBound and rhythmLowerBounds and traceFreshness

  val hasEffect = s.effects > 0
  val hasChild = s.children > 0
  val exhaustedRepeats = s.executions == s.repeats
  val rejectedCandidate = s.last == "reject"

  run renderReplayTest = init.then(render).then(replay).then(togglePause).then(render)
    .expect(safety and s.executions == 0 and s.effects == 0 and s.children == 0
      and s.phase == (if (s.profile.motionRate == 0) 0 else 1))
  run guardedExecutionTest = init.then(execute(false, true))
    .expect(safety and s.executions == 1 and s.effects == 0 and s.emitted == s.source)
  run admissionTest = init.then(execute(true, true)).then(admit(s.source, s.profile))
    .expect(safety and s.effects == 1 and s.children == 1 and s.energy == 8)
  run rejectBeforeEmissionTest = init.then(rejectChild(s.source, s.profile))
    .expect(safety and s.children == 0 and s.energy == 10)
  run rejectMismatchTest = init.then(execute(true, true))
    .then(rejectChild(if (s.source == 1) 2 else 1, s.profile))
    .expect(safety and s.children == 0 and s.effects == 1)
  run childBudgetTest = init.then(execute(false, false)).then(admit(s.source, s.profile))
    .then(admit(s.source, s.profile)).then(rejectChild(s.source, s.profile))
    .expect(safety and s.children == 2 and s.energy == 7)
  run rejectChangedProfileTest = init.then(execute(true, true))
    .then(rejectChild(s.source, s.profile.with("family", (s.profile.family + 1) % 10)))
    .expect(safety and s.children == 0)

  run rejectChangedMaterialTest = init.then(execute(true, true))
    .then(rejectChild(s.source, s.profile.with("crest", if (s.profile.crest == 650) 649 else s.profile.crest + 1)))
    .expect(safety and s.children == 0 and s.effects == 1)
  run rejectChangedMembraneTest = init.then(execute(false, false))
    .then(rejectChild(s.source, s.profile.with("spread", if (s.profile.spread == 240) 239 else s.profile.spread + 1)))
    .expect(safety and s.children == 0)

  run rejectChangedRhythmTest = init.then(execute(false, false))
    .then(rejectChild(s.source, s.profile.with("breath", if (s.profile.breath == 180) 179 else s.profile.breath + 1)))
    .expect(safety and s.children == 0)
  action unsafeRhythmRender = s' = snapshot("render")
    .with("profile", s.profile.with("rhythmAsymmetry", if (s.profile.rhythmAsymmetry == 800) 799 else s.profile.rhythmAsymmetry + 1))
  run detectsUnsafeRhythmRenderTest = init.then(unsafeRhythmRender)
    .expect(not(safety) and not(sourceIdentity) and viewSeparation)

  run rejectChangedChromaTest = init.then(execute(false, false))
    .then(rejectChild(s.source, s.profile.with("chromaStrength", if (s.profile.chromaStrength == 1000) 999 else s.profile.chromaStrength + 1)))
    .expect(safety and s.children == 0)
  run rejectChangedLensTest = init.then(execute(false, false))
    .then(rejectChild(s.source, s.profile.with("lensToken", (s.profile.lensToken + 1) % 4)))
    .expect(safety and s.children == 0)
  run staleSourceTraceHiddenTest = init.then(selectValueView(true))
    .then(cacheTrace(if (s.source == 1) 2 else 1, s.profile, true, true))
    .expect(safety and not(s.scalarVisible) and s.executions == 0)
  run changedDesignTraceHiddenTest = init.then(selectValueView(true))
    .then(cacheTrace(s.source, s.profile.with("lensToken", (s.profile.lensToken + 1) % 4), true, true))
    .expect(safety and not(s.scalarVisible))
  run nonnumericTraceHiddenTest = init.then(selectValueView(true))
    .then(cacheTrace(s.source, s.profile, true, false))
    .expect(safety and not(s.scalarVisible))
  run failedTraceHiddenTest = init.then(selectValueView(true))
    .then(cacheTrace(s.source, s.profile, false, true))
    .expect(safety and not(s.scalarVisible))
  run freshTraceViewTest = init.then(selectValueView(true))
    .then(cacheTrace(s.source, s.profile, true, true)).then(render).then(replay)
    .expect(safety and s.scalarVisible == (s.profile.chromaMode == 2) and s.executions == 0)
  action unsafeStaleDisplay = s' = snapshot("render")
    .with("traceSource", 0).with("scalarVisible", true)
  run detectsUnsafeStaleDisplayTest = init.then(unsafeStaleDisplay)
    .expect(not(safety) and not(traceFreshness) and viewSeparation and sourceIdentity)
  action unsafeChromaRender = s' = snapshot("render")
    .with("profile", s.profile.with("lensToken", (s.profile.lensToken + 1) % 4))
  run detectsUnsafeChromaRenderTest = init.then(unsafeChromaRender)
    .expect(not(safety) and not(sourceIdentity) and viewSeparation)

  // Deliberate mutation, excluded from normal step. Its test must detect failure.
  action unsafeReplay = s' = snapshot("replay").with("effects", s.effects + 1)
  action unsafeStep = any {step, unsafeReplay}
  run detectsUnsafeReplayTest = init.then(unsafeReplay)
    .expect(not(safety) and not(onlyExecutionEffects) and not(viewSeparation))
  action unsafeProfileRender = s' = snapshot("render")
    .with("profile", s.profile.with("family", (s.profile.family + 1) % 10))
  run detectsUnsafeProfileRenderTest = init.then(unsafeProfileRender)
    .expect(not(safety) and not(sourceIdentity))
  action unsafeMaterialRender = s' = snapshot("render")
    .with("profile", s.profile.with("crest", if (s.profile.crest == 650) 649 else s.profile.crest + 1))
  run detectsUnsafeMaterialRenderTest = init.then(unsafeMaterialRender)
    .expect(not(safety) and not(sourceIdentity) and viewSeparation)
  action unsafeCompositionRender = s' = snapshot("render")
    .with("profile", s.profile.with("occupancy", if (s.profile.occupancy == 840) 839 else s.profile.occupancy + 1))
  run detectsUnsafeCompositionRenderTest = init.then(unsafeCompositionRender)
    .expect(not(safety) and not(sourceIdentity) and viewSeparation)
}
