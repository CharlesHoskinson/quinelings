// Formal verification of WovenBody mechanisms, chimeric combinations
// (compose, mate, merge, symbiote), and live program execution transitions
// (PushFrame, PopFrame, EvalOp, Done, Fault).
module woven_combinations {
  type Parent = {
    source: int,
    mechanism: int,
    strands: int,
    folds: int,
    nodes: int,
    outputs: int,
    enclosureMilli: int,
    donorPure: bool,
    guardProtected: bool,
    seamTypeMatch: bool,
    downstreamFeedsOutput: bool
  }

  type State = {
    parentA: Parent,
    parentB: Parent,
    recipe: str,
    childSource: int,
    primaryMech: int,
    secondaryMech: int,
    strands: int,
    folds: int,
    assignedPerStrand: int,
    patchWidthSumMilli: int,
    childNodes: int,
    hasSeam: bool,
    blendMilli: int,
    childEnclosureMilli: int,
    guardProtected: bool,
    donorPure: bool,
    seamTypeMatch: bool,
    downstreamFeedsOutput: bool,
    execStatus: str,
    stackDepth: int,
    maxStack: int,
    fuel: int,
    maxFuel: int,
    stepsEvaluated: int,
    stackOps: int,
    activeOwner: int,
    seamPulseMilli: int,
    opacityMilli: int,
    executions: int,
    effects: int,
    emitted: int,
    phase: int,
    last: str,
    priorExecutions: int,
    priorEffects: int,
    lastGuard: bool,
    lastAllowed: bool
  }

  var s: State

  pure val mechanisms = 0.to(7)
  pure val sources = Set(1, 2, 3, 4)
  pure val recipes = Set("none", "compose", "mate", "merge", "symbiote")
  pure val execStatuses = Set("Idle", "Running", "Done", "Fault")

  pure def mechanismName(m: int): str =
    if (m == 0) "logarithmic-mantle"
    else if (m == 1) "pleated-braid"
    else if (m == 2) "recursive-affine"
    else if (m == 3) "lorenz-flow"
    else if (m == 4) "phyllotaxis-fan"
    else if (m == 5) "clifford-flow"
    else if (m == 6) "recursive-julia"
    else "toroidal-weave"

  pure def minInt(a: int, b: int): int = if (a <= b) a else b
  pure def maxInt(a: int, b: int): int = if (a >= b) a else b
  pure def clampMilli(x: int): int = if (x < 0) 0 else if (x > 1000) 1000 else x

  pure def chimericLerpMilli(a: int, b: int, lam: int): int =
    ((1000 - lam) * a + lam * b) / 1000

  pure def modulateOpacityMilli(baseMilli: int, pulseMilli: int, stackDepth: int): int =
    clampMilli(baseMilli + (pulseMilli * 250) / 1000 + stackDepth * 30)

  pure def validParent(p: Parent): bool =
    sources.contains(p.source)
    and mechanisms.contains(p.mechanism)
    and p.strands >= 8 and p.strands <= 40
    and p.folds >= 2 and p.folds <= 9
    and p.nodes >= 2 and p.nodes <= 32
    and p.outputs >= 1 and p.outputs <= 8
    and p.enclosureMilli >= 1000 and p.enclosureMilli <= 3500

  pure val defaultParentA: Parent = {
    source: 1, mechanism: 3, strands: 10, folds: 5, nodes: 6, outputs: 2,
    enclosureMilli: 1800, donorPure: true, guardProtected: true,
    seamTypeMatch: true, downstreamFeedsOutput: true
  }

  pure val defaultParentB: Parent = {
    source: 2, mechanism: 6, strands: 12, folds: 6, nodes: 8, outputs: 2,
    enclosureMilli: 2400, donorPure: true, guardProtected: true,
    seamTypeMatch: true, downstreamFeedsOutput: true
  }

  action init = {
    s' = {
      parentA: defaultParentA,
      parentB: defaultParentB,
      recipe: "none",
      childSource: 2,
      primaryMech: defaultParentB.mechanism,
      secondaryMech: defaultParentB.mechanism,
      strands: defaultParentB.strands,
      folds: defaultParentB.folds,
      assignedPerStrand: 1,
      patchWidthSumMilli: 1000,
      childNodes: defaultParentB.nodes,
      hasSeam: false,
      blendMilli: 0,
      childEnclosureMilli: defaultParentB.enclosureMilli,
      guardProtected: true,
      donorPure: true,
      seamTypeMatch: true,
      downstreamFeedsOutput: true,
      execStatus: "Idle",
      stackDepth: 0,
      maxStack: 6,
      fuel: 12,
      maxFuel: 12,
      stepsEvaluated: 0,
      stackOps: 0,
      activeOwner: -1,
      seamPulseMilli: 0,
      opacityMilli: 420,
      executions: 0,
      effects: 0,
      emitted: 0,
      phase: 0,
      last: "init",
      priorExecutions: 0,
      priorEffects: 0,
      lastGuard: false,
      lastAllowed: false
    }
  }

  def snapshot(kind: str): State =
    s.with("last", kind)
     .with("priorExecutions", s.executions)
     .with("priorEffects", s.effects)
     .with("lastGuard", false)
     .with("lastAllowed", false)

  pure def canComposeOrMate(a: Parent, b: Parent): bool =
    validParent(a) and validParent(b)
    and a.source != b.source
    and a.nodes + b.nodes - 1 <= 64
    and a.donorPure and b.guardProtected
    and a.seamTypeMatch and b.downstreamFeedsOutput

  pure def canMerge(a: Parent, b: Parent): bool =
    validParent(a) and validParent(b)
    and a.source != b.source
    and a.nodes + b.nodes + 1 <= 64
    and a.outputs + b.outputs <= 16

  pure def canSymbiote(a: Parent, b: Parent): bool =
    validParent(a) and validParent(b)
    and a.source != b.source
    and a.nodes + b.nodes <= 64
    and a.donorPure and b.guardProtected

  action combineCompose(a: Parent, b: Parent, lam: int): bool = all {
    canComposeOrMate(a, b),
    lam >= 100, lam <= 900,
    val enc = chimericLerpMilli(b.enclosureMilli, a.enclosureMilli, lam)
    val childN = a.nodes + b.nodes - 1
    s' = snapshot("compose")
      .with("parentA", a).with("parentB", b)
      .with("recipe", "compose")
      .with("childSource", 3)
      .with("primaryMech", b.mechanism)
      .with("secondaryMech", a.mechanism)
      .with("strands", maxInt(8, minInt(40, (a.strands + b.strands) / 2)))
      .with("folds", maxInt(2, minInt(9, (a.folds + b.folds) / 2)))
      .with("assignedPerStrand", 2)
      .with("patchWidthSumMilli", 1000)
      .with("childNodes", childN)
      .with("hasSeam", true)
      .with("blendMilli", lam)
      .with("childEnclosureMilli", enc)
      .with("guardProtected", b.guardProtected)
      .with("donorPure", a.donorPure)
      .with("seamTypeMatch", a.seamTypeMatch)
      .with("downstreamFeedsOutput", b.downstreamFeedsOutput)
      .with("execStatus", "Idle")
      .with("stackDepth", 0).with("fuel", s.maxFuel)
      .with("stepsEvaluated", 0).with("stackOps", 0)
      .with("activeOwner", -1).with("seamPulseMilli", 0)
      .with("opacityMilli", 450).with("emitted", 0)
  }

  action combineMate(a: Parent, b: Parent, lam: int): bool = all {
    canComposeOrMate(a, b),
    lam >= 100, lam <= 900,
    val enc = chimericLerpMilli(b.enclosureMilli, a.enclosureMilli, lam)
    val childN = a.nodes + b.nodes - 1
    s' = snapshot("mate")
      .with("parentA", a).with("parentB", b)
      .with("recipe", "mate")
      .with("childSource", 3)
      .with("primaryMech", b.mechanism)
      .with("secondaryMech", a.mechanism)
      .with("strands", maxInt(8, minInt(40, (a.strands + b.strands) / 2)))
      .with("folds", maxInt(2, minInt(9, (a.folds + b.folds) / 2)))
      .with("assignedPerStrand", 2)
      .with("patchWidthSumMilli", 1000)
      .with("childNodes", childN)
      .with("hasSeam", true)
      .with("blendMilli", lam)
      .with("childEnclosureMilli", enc)
      .with("guardProtected", b.guardProtected)
      .with("donorPure", a.donorPure)
      .with("seamTypeMatch", a.seamTypeMatch)
      .with("downstreamFeedsOutput", b.downstreamFeedsOutput)
      .with("execStatus", "Idle")
      .with("stackDepth", 0).with("fuel", s.maxFuel)
      .with("stepsEvaluated", 0).with("stackOps", 0)
      .with("activeOwner", -1).with("seamPulseMilli", 0)
      .with("opacityMilli", 450).with("emitted", 0)
  }

  action combineMerge(a: Parent, b: Parent): bool = all {
    canMerge(a, b),
    val enc = chimericLerpMilli(b.enclosureMilli, a.enclosureMilli, 500)
    val childN = a.nodes + b.nodes + 1
    s' = snapshot("merge")
      .with("parentA", a).with("parentB", b)
      .with("recipe", "merge")
      .with("childSource", 4)
      .with("primaryMech", b.mechanism)
      .with("secondaryMech", a.mechanism)
      .with("strands", maxInt(8, minInt(40, a.strands + 2)))
      .with("folds", b.folds)
      .with("assignedPerStrand", 2)
      .with("patchWidthSumMilli", 1000)
      .with("childNodes", childN)
      .with("hasSeam", false)
      .with("blendMilli", 500)
      .with("childEnclosureMilli", enc)
      .with("guardProtected", true)
      .with("donorPure", true)
      .with("seamTypeMatch", true)
      .with("downstreamFeedsOutput", true)
      .with("execStatus", "Idle")
      .with("stackDepth", 0).with("fuel", s.maxFuel)
      .with("stepsEvaluated", 0).with("stackOps", 0)
      .with("activeOwner", -1).with("seamPulseMilli", 0)
      .with("opacityMilli", 440).with("emitted", 0)
  }

  action combineSymbiote(a: Parent, b: Parent, lam: int): bool = all {
    canSymbiote(a, b),
    lam >= 150, lam <= 850,
    val enc = chimericLerpMilli(b.enclosureMilli, a.enclosureMilli, lam)
    val childN = a.nodes + b.nodes
    s' = snapshot("symbiote")
      .with("parentA", a).with("parentB", b)
      .with("recipe", "symbiote")
      .with("childSource", 4)
      .with("primaryMech", b.mechanism)
      .with("secondaryMech", a.mechanism)
      .with("strands", maxInt(8, minInt(40, (a.strands + b.strands) / 2)))
      .with("folds", maxInt(2, minInt(9, (a.folds + b.folds) / 2)))
      .with("assignedPerStrand", 2)
      .with("patchWidthSumMilli", 1000)
      .with("childNodes", childN)
      .with("hasSeam", true)
      .with("blendMilli", lam)
      .with("childEnclosureMilli", enc)
      .with("guardProtected", b.guardProtected)
      .with("donorPure", a.donorPure)
      .with("seamTypeMatch", true)
      .with("downstreamFeedsOutput", true)
      .with("execStatus", "Idle")
      .with("stackDepth", 0).with("fuel", s.maxFuel)
      .with("stepsEvaluated", 0).with("stackOps", 0)
      .with("activeOwner", -1).with("seamPulseMilli", 0)
      .with("opacityMilli", 460).with("emitted", 0)
  }

  action refuseCombine = {
    s' = snapshot("refuse")
  }

  action StartRun = all {
    s.execStatus != "Running",
    s.executions < 8,
    s' = snapshot("StartRun")
      .with("execStatus", "Running")
      .with("executions", s.executions + 1)
      .with("stackDepth", 0)
      .with("fuel", s.maxFuel)
      .with("stepsEvaluated", 0)
      .with("stackOps", 0)
      .with("activeOwner", 0)
      .with("seamPulseMilli", 0)
      .with("opacityMilli", 480)
      .with("emitted", 0)
  }

  action PushFrame = all {
    s.execStatus == "Running",
    s.fuel > 0,
    s.stackDepth < s.maxStack,
    val nextStack = s.stackDepth + 1
    s' = snapshot("PushFrame")
      .with("stackDepth", nextStack)
      .with("fuel", s.fuel - 1)
      .with("stackOps", s.stackOps + 1)
      .with("opacityMilli", modulateOpacityMilli(480, s.seamPulseMilli, nextStack))
  }

  action PopFrame = all {
    s.execStatus == "Running",
    s.fuel > 0,
    s.stackDepth > 0,
    val nextStack = s.stackDepth - 1
    s' = snapshot("PopFrame")
      .with("stackDepth", nextStack)
      .with("fuel", s.fuel - 1)
      .with("stackOps", s.stackOps + 1)
      .with("opacityMilli", modulateOpacityMilli(480, s.seamPulseMilli, nextStack))
  }

  action EvalOp(owner: int, crossesSeam: bool, guardOk: bool, allowed: bool): bool = all {
    s.execStatus == "Running",
    s.fuel > 0,
    owner >= 0,
    owner < s.childNodes,
    val pulse = if (crossesSeam and s.hasSeam) 850 else 300
    s' = snapshot("EvalOp")
      .with("activeOwner", owner)
      .with("fuel", s.fuel - 1)
      .with("stepsEvaluated", s.stepsEvaluated + 1)
      .with("seamPulseMilli", pulse)
      .with("opacityMilli", modulateOpacityMilli(480, pulse, s.stackDepth))
      .with("effects", s.effects + (if (guardOk and allowed) 1 else 0))
      .with("lastGuard", guardOk)
      .with("lastAllowed", allowed)
  }

  action Done = all {
    s.execStatus == "Running",
    s.stackDepth == 0,
    s.stepsEvaluated > 0,
    s' = snapshot("Done")
      .with("execStatus", "Done")
      .with("activeOwner", -1)
      .with("seamPulseMilli", 0)
      .with("opacityMilli", 500)
      .with("emitted", s.childSource)
  }

  action Fault = all {
    s.execStatus == "Running",
    s' = snapshot("Fault")
      .with("execStatus", "Fault")
      .with("activeOwner", -1)
      .with("seamPulseMilli", 0)
      .with("opacityMilli", 250)
      .with("emitted", 0)
  }

  action RenderView = {
    s' = snapshot("render")
      .with("phase", (s.phase + 1) % 16)
  }

  action step = {
    nondet mechA = Set(0, 2, 3, 5).oneOf()
    nondet mechB = Set(1, 4, 6, 7).oneOf()
    nondet lam = Set(200, 500, 750).oneOf()
    nondet owner = 0.to(5).oneOf()
    nondet crossesSeam = Set(false, true).oneOf()
    nondet guardOk = Set(false, true).oneOf()
    nondet allowed = Set(false, true).oneOf()
    val candA = defaultParentA.with("mechanism", mechA)
    val candB = defaultParentB.with("mechanism", mechB)
    any {
      combineCompose(candA, candB, lam),
      combineMate(candA, candB, lam),
      combineMerge(candA, candB),
      combineSymbiote(candA, candB, lam),
      refuseCombine,
      StartRun,
      PushFrame,
      PopFrame,
      EvalOp(owner, crossesSeam, guardOk, allowed),
      Done,
      Fault,
      RenderView
    }
  }

  val validMechanisms =
    mechanisms.contains(s.parentA.mechanism)
    and mechanisms.contains(s.parentB.mechanism)
    and mechanisms.contains(s.primaryMech)
    and mechanisms.contains(s.secondaryMech)

  val validTerritoryPartition =
    s.strands >= 8 and s.strands <= 40
    and s.folds >= 2 and s.folds <= 9
    and s.assignedPerStrand >= 1 and s.assignedPerStrand <= 8
    and s.patchWidthSumMilli == 1000
    and s.childNodes >= 2 and s.childNodes <= 64

  val chimericConvexityBound =
    s.blendMilli >= 0 and s.blendMilli <= 1000
    and s.childEnclosureMilli >= minInt(s.parentA.enclosureMilli, s.parentB.enclosureMilli)
    and s.childEnclosureMilli <= maxInt(s.parentA.enclosureMilli, s.parentB.enclosureMilli)

  val guardConeProtection =
    not(Set("compose", "mate", "symbiote").contains(s.recipe))
    or (s.guardProtected and s.donorPure and s.parentA.source != s.parentB.source)

  val seamIntegrity =
    not(Set("compose", "mate").contains(s.recipe))
    or (s.hasSeam and s.seamTypeMatch and s.downstreamFeedsOutput)

  val combinationAndViewPassive =
    if (Set("compose", "mate", "merge", "symbiote", "refuse", "render").contains(s.last))
      s.executions == s.priorExecutions and s.effects == s.priorEffects
    else true

  val executionStackAndFuelBounded =
    execStatuses.contains(s.execStatus)
    and s.stackDepth >= 0 and s.stackDepth <= s.maxStack
    and s.fuel >= 0 and s.fuel <= s.maxFuel
    and s.stepsEvaluated >= 0 and s.stepsEvaluated <= s.maxFuel
    and s.stackOps >= 0 and s.stackOps <= s.maxFuel
    and s.fuel + s.stepsEvaluated + s.stackOps == s.maxFuel

  val activeOwnerBounded =
    if (s.execStatus == "Running")
      s.activeOwner >= -1 and s.activeOwner < s.childNodes
    else
      s.activeOwner == -1

  val opacityModulationBounded =
    s.opacityMilli >= 0 and s.opacityMilli <= 1000
    and s.seamPulseMilli >= 0 and s.seamPulseMilli <= 1000

  val terminalOutcomeSafety =
    (s.execStatus == "Done" implies (s.stackDepth == 0 and s.emitted == s.childSource and s.stepsEvaluated > 0))
    and (s.execStatus == "Fault" implies s.emitted == 0)

  val guardedEffectsOnly =
    if (s.last == "EvalOp")
      s.effects == s.priorEffects + (if (s.lastGuard and s.lastAllowed) 1 else 0)
    else
      s.effects == s.priorEffects

  val safety =
    validMechanisms and validTerritoryPartition and chimericConvexityBound
    and guardConeProtection and seamIntegrity and combinationAndViewPassive
    and executionStackAndFuelBounded and activeOwnerBounded
    and opacityModulationBounded and terminalOutcomeSafety and guardedEffectsOnly

  run compose_lorenz_julia_traceTest =
    init.then(combineCompose(defaultParentA, defaultParentB, 350))
        .then(StartRun)
        .then(PushFrame)
        .then(EvalOp(2, true, true, true))
        .then(PopFrame)
        .then(Done)
        .expect(safety and s.recipe == "compose" and s.hasSeam and s.effects == 1
          and s.emitted == s.childSource and s.execStatus == "Done")

  run mate_clifford_toroidalTest =
    init.then(combineMate(defaultParentA.with("mechanism", 5), defaultParentB.with("mechanism", 7), 600))
        .then(StartRun)
        .then(EvalOp(1, true, false, true))
        .then(Done)
        .expect(safety and s.recipe == "mate" and s.effects == 0 and s.emitted == 3)

  run merge_parallel_reportTest =
    init.then(combineMerge(defaultParentA, defaultParentB))
        .then(RenderView)
        .expect(safety and s.recipe == "merge" and not(s.hasSeam) and s.executions == 0)

  run symbiote_cross_modulationTest =
    init.then(combineSymbiote(defaultParentA.with("mechanism", 2), defaultParentB.with("mechanism", 0), 400))
        .then(StartRun)
        .then(PushFrame)
        .then(PushFrame)
        .then(EvalOp(3, true, true, false))
        .then(PopFrame)
        .then(PopFrame)
        .then(Done)
        .expect(safety and s.recipe == "symbiote" and s.stackDepth == 0 and s.effects == 0)

  run fault_clears_emissionTest =
    init.then(combineCompose(defaultParentA, defaultParentB, 500))
        .then(StartRun)
        .then(PushFrame)
        .then(EvalOp(0, false, true, true))
        .then(Fault)
        .expect(safety and s.execStatus == "Fault" and s.emitted == 0 and s.activeOwner == -1)

  action unsafeImpureDonorCompose =
    s' = snapshot("compose").with("recipe", "compose").with("donorPure", false)

  action unsafeStackOverflow =
    s' = snapshot("PushFrame").with("stackDepth", s.maxStack + 1)

  action unsafeOpacityOverflow =
    s' = snapshot("EvalOp").with("opacityMilli", 1250)

  action unsafeFaultEmission =
    s' = snapshot("Fault").with("execStatus", "Fault").with("emitted", s.childSource).with("activeOwner", -1)

  run detects_impure_donorTest =
    init.then(unsafeImpureDonorCompose).expect(not(safety) and not(guardConeProtection))

  run detects_stack_overflowTest =
    init.then(unsafeStackOverflow).expect(not(safety) and not(executionStackAndFuelBounded))

  run detects_opacity_overflowTest =
    init.then(unsafeOpacityOverflow).expect(not(safety) and not(opacityModulationBounded))

  run detects_fault_emissionTest =
    init.then(unsafeFaultEmission).expect(not(safety) and not(terminalOutcomeSafety))
}
