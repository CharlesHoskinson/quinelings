// Formal verification of the browser animation pipeline for slideshow.html,
// motion.html, and lifeform-renderer.js:
//   Init -> CompileBodies -> BuildChromaPalettes -> ResizeCanvas
//        -> WarmPhaseRing -> RenderFrame(scene, phase, execution)
//
// Captures the `window` opcode mismatch between `GRAPHS.tideglass` (WovenGraphOps)
// and `Chroma.ROLE_MAP` (ChromaRoleMap) that aborts ES module evaluation before
// `resizeCanvas()` and `requestAnimationFrame()`, leaving the canvas stuck at
// its HTML default 300x150 with 0 visible pixels.
module animation_pipeline {
  type PipelineState = {
    pipelineState: str,
    appMode: str,
    wovenGraphOps: Set[str],
    chromaRoleMap: Set[str],
    missingOpcodes: Set[str],
    bodiesCompiled: int,
    palettesBuilt: int,
    canvasResized: bool,
    canvasWidth: int,
    canvasHeight: int,
    phaseRingWarmed: bool,
    ringBuckets: int,
    lockedBoundsSpanMilli: int,
    cameraShakeMilli: int,
    activeScene: int,
    activePhase: int,
    activeExecution: str,
    visiblePixels: int,
    frameRateLocked: bool,
    frameTimeMicros: int,
    framesRendered: int,
    crashed: bool
  }

  var s: PipelineState

  // =========================================================================
  // 1. TASK GRAPH OPCODES (WovenGraphOps) vs. CHROMA ROLE_MAP (ChromaRoleMap)
  // =========================================================================

  pure val WovenGraphOps: Set[str] = Set(
    "literal", "sum", "map", "window", "reconcile", "report",
    "filter", "consensus", "action", "sort", "dedupe", "select"
  )

  pure val UnpatchedChromaRoleMap: Set[str] = Set(
    "Observe", "Box", "Permit", "Apply", "Score", "Authorize", "Execute",
    "Quote", "Decode", "Report",
    "literal", "sum", "mean", "min", "max", "weightedMean", "length", "map",
    "sort", "dedupe", "filter", "compare", "choose", "get", "clamp", "budget",
    "action", "report", "bfs", "allocate", "schedule", "consensus", "retry",
    "evidence", "input", "arithmetic", "compareValues", "all", "select",
    "evidenceFresh", "reconcile"
  )

  // Verified ChromaRoleMap / canonicalized graph ops satisfying WovenGraphOps.subseteq(ChromaRoleMap)
  pure val ChromaRoleMap: Set[str] = UnpatchedChromaRoleMap.union(Set("window"))

  pure val CanonicalSpecimens: Set[str] = Set(
    "toroidal", "lorenz", "clifford", "julia",
    "affine", "mantle", "braid", "phyllotaxis"
  )

  pure val SlideshowScenes: Set[int] = 1.to(12)
  pure val MotionScenes: Set[int] = 1.to(12)
  pure val PhaseBuckets: Set[int] = 0.to(35)
  pure val ExecOutcomes: Set[str] = Set("Running", "Done", "Rejected", "Exhausted")
  pure val AppModes: Set[str] = Set("slideshow", "motion", "lifeform-renderer")

  pure val PipelineStates: Set[str] = Set(
    "Init",
    "BodiesCompiled",
    "PalettesBuilt",
    "CrashedBeforeResize",
    "CanvasResized",
    "PhaseRingWarmed",
    "Rendering"
  )

  pure def slideshowVisiblePixels(slide: int, execution: str): int =
    val baseParticles =
      if (slide == 12) 18432
      else if (slide >= 9 and slide <= 11) 7200
      else 6480
    val execGain =
      if (execution == "Done") 420
      else if (execution == "Rejected") 180
      else if (execution == "Exhausted") -120
      else 260
    baseParticles + execGain

  pure def motionVisiblePixels(scene: int, phase: int): int =
    if (scene == 1) 1960 + phase * 12
    else if (scene == 2) 4200 + phase * 18
    else if (scene == 3) 5600 + phase * 20
    else if (scene >= 4 and scene <= 9) 6100 + scene * 140 + phase * 12
    else if (scene == 10) 8400 + phase * 15
    else if (scene == 11) 42000 + phase * 40
    else 44500 + phase * 30

  pure def frameTimeFor(mode: str, scene: int): int =
    if (mode == "slideshow")
      if (scene == 12) 8900 else 4200
    else if (mode == "motion")
      if (scene >= 11) 11400 else 5100
    else 4800

  // =========================================================================
  // 2. PIPELINE STATE MACHINE ACTIONS
  // =========================================================================

  action InitWithRoleMap(roleMap: Set[str], mode: str): bool = all {
    AppModes.contains(mode),
    s' = {
      pipelineState: "Init",
      appMode: mode,
      wovenGraphOps: WovenGraphOps,
      chromaRoleMap: roleMap,
      missingOpcodes: Set(),
      bodiesCompiled: 0,
      palettesBuilt: 0,
      canvasResized: false,
      canvasWidth: 300,
      canvasHeight: 150,
      phaseRingWarmed: false,
      ringBuckets: 0,
      lockedBoundsSpanMilli: 0,
      cameraShakeMilli: 0,
      activeScene: 1,
      activePhase: 0,
      activeExecution: "Running",
      visiblePixels: 0,
      frameRateLocked: false,
      frameTimeMicros: 0,
      framesRendered: 0,
      crashed: false
    }
  }

  action init = InitWithRoleMap(ChromaRoleMap, "slideshow")

  action CompileBodies = all {
    s.pipelineState == "Init",
    s' = s.with("pipelineState", "BodiesCompiled")
          .with("bodiesCompiled", 8)
  }

  action BuildChromaPalettes = all {
    s.pipelineState == "BodiesCompiled",
    val missing = s.wovenGraphOps.exclude(s.chromaRoleMap)
    if (missing == Set()) {
      s' = s.with("pipelineState", "PalettesBuilt")
            .with("palettesBuilt", 8)
            .with("missingOpcodes", Set())
            .with("crashed", false)
    } else {
      s' = s.with("pipelineState", "CrashedBeforeResize")
            .with("palettesBuilt", 5)
            .with("missingOpcodes", missing)
            .with("canvasResized", false)
            .with("canvasWidth", 300)
            .with("canvasHeight", 150)
            .with("visiblePixels", 0)
            .with("frameRateLocked", false)
            .with("crashed", true)
    }
  }

  action ResizeCanvas = all {
    s.pipelineState == "PalettesBuilt",
    not(s.crashed),
    s' = s.with("pipelineState", "CanvasResized")
          .with("canvasResized", true)
          .with("canvasWidth", 1920)
          .with("canvasHeight", 1080)
  }

  action WarmPhaseRing = all {
    s.pipelineState == "CanvasResized",
    s.canvasResized,
    val buckets = if (s.appMode == "motion") 24 else 36
    s' = s.with("pipelineState", "PhaseRingWarmed")
          .with("phaseRingWarmed", true)
          .with("ringBuckets", buckets)
          .with("lockedBoundsSpanMilli", 580)
          .with("cameraShakeMilli", 0)
          .with("frameRateLocked", true)
  }

  action RenderFrame(scene: int, phase: int, execution: str): bool = all {
    Set("PhaseRingWarmed", "Rendering").contains(s.pipelineState),
    s.canvasResized,
    s.phaseRingWarmed,
    PhaseBuckets.contains(phase),
    ExecOutcomes.contains(execution),
    if (s.appMode == "slideshow") SlideshowScenes.contains(scene)
    else MotionScenes.contains(scene),
    val pixels =
      if (s.appMode == "slideshow") slideshowVisiblePixels(scene, execution)
      else motionVisiblePixels(scene, phase)
    val renderMicros = frameTimeFor(s.appMode, scene)
    s' = s.with("pipelineState", "Rendering")
          .with("activeScene", scene)
          .with("activePhase", phase)
          .with("activeExecution", execution)
          .with("visiblePixels", pixels)
          .with("frameTimeMicros", renderMicros)
          .with("frameRateLocked", renderMicros <= 16667)
          .with("cameraShakeMilli", 0)
          .with("framesRendered", s.framesRendered + 1)
  }

  action SwitchAppMode(nextMode: str): bool = all {
    Set("PhaseRingWarmed", "Rendering").contains(s.pipelineState),
    AppModes.contains(nextMode),
    val buckets = if (nextMode == "motion") 24 else 36
    s' = s.with("appMode", nextMode)
          .with("ringBuckets", buckets)
          .with("activeScene", 1)
  }

  action step = {
    nondet slideScene = SlideshowScenes.oneOf()
    nondet motionScene = MotionScenes.oneOf()
    nondet phase = PhaseBuckets.oneOf()
    nondet execution = ExecOutcomes.oneOf()
    nondet nextMode = Set("slideshow", "motion").oneOf()
    any {
      CompileBodies,
      BuildChromaPalettes,
      ResizeCanvas,
      WarmPhaseRing,
      if (s.appMode == "slideshow")
        RenderFrame(slideScene, phase, execution)
      else
        RenderFrame(motionScene, phase, execution),
      SwitchAppMode(nextMode)
    }
  }

  // =========================================================================
  // 3. SAFETY INVARIANTS
  // =========================================================================

  val opcodeSubsetInvariant =
    s.wovenGraphOps.subseteq(s.chromaRoleMap) and s.missingOpcodes == Set()

  val notCrashedInvariant =
    s.pipelineState != "CrashedBeforeResize"
    and s.pipelineState != "Crashed"
    and not(s.crashed)

  val canvasResizeInvariant =
    if (Set("CanvasResized", "PhaseRingWarmed", "Rendering").contains(s.pipelineState))
      s.canvasResized and s.canvasWidth == 1920 and s.canvasHeight == 1080
    else
      not(s.canvasResized) and s.canvasWidth == 300 and s.canvasHeight == 150

  val frameRenderSafety =
    s.pipelineState != "CrashedBeforeResize"
    and s.pipelineState != "Crashed"
    and s.visiblePixels > 0
    and s.frameRateLocked

  val animationSafety =
    PipelineStates.contains(s.pipelineState)
    and opcodeSubsetInvariant
    and notCrashedInvariant
    and canvasResizeInvariant
    and (
      (s.pipelineState == "Rendering") implies (
        frameRenderSafety
        and s.canvasResized
        and s.phaseRingWarmed
        and s.cameraShakeMilli == 0
        and s.frameTimeMicros <= 16667
        and (
          (s.appMode == "slideshow" and SlideshowScenes.contains(s.activeScene))
          or (s.appMode != "slideshow" and MotionScenes.contains(s.activeScene))
        )
      )
    )

  // =========================================================================
  // 4. FORMAL VERIFICATION & BUG REPRODUCTION TESTS (`quint test`)
  // =========================================================================

  run detects_window_opcode_crashTest =
    InitWithRoleMap(UnpatchedChromaRoleMap, "slideshow")
      .then(CompileBodies)
      .then(BuildChromaPalettes)
      .expect(
        s.pipelineState == "CrashedBeforeResize"
        and s.crashed
        and s.missingOpcodes == Set("window")
        and not(s.canvasResized)
        and s.canvasWidth == 300
        and s.canvasHeight == 150
        and s.visiblePixels == 0
        and not(s.frameRateLocked)
        and not(animationSafety)
        and not(frameRenderSafety)
      )

  run all_12_slideshow_plates_verifiedTest =
    InitWithRoleMap(ChromaRoleMap, "slideshow")
      .then(CompileBodies)
      .then(BuildChromaPalettes)
      .then(ResizeCanvas)
      .then(WarmPhaseRing)
      .then(RenderFrame(1, 0, "Running"))
      .then(RenderFrame(2, 3, "Running"))
      .then(RenderFrame(3, 6, "Running"))
      .then(RenderFrame(4, 9, "Running"))
      .then(RenderFrame(5, 12, "Running"))
      .then(RenderFrame(6, 15, "Running"))
      .then(RenderFrame(7, 18, "Running"))
      .then(RenderFrame(8, 21, "Running"))
      .then(RenderFrame(9, 24, "Done"))
      .then(RenderFrame(10, 27, "Done"))
      .then(RenderFrame(11, 30, "Done"))
      .then(RenderFrame(12, 33, "Rejected"))
      .expect(
        animationSafety
        and frameRenderSafety
        and s.wovenGraphOps.subseteq(s.chromaRoleMap)
        and s.canvasResized
        and s.canvasWidth == 1920
        and s.visiblePixels > 0
        and s.frameRateLocked
        and s.framesRendered == 12
      )

  run all_12_motion_scenes_verifiedTest =
    InitWithRoleMap(ChromaRoleMap, "motion")
      .then(CompileBodies)
      .then(BuildChromaPalettes)
      .then(ResizeCanvas)
      .then(WarmPhaseRing)
      .then(RenderFrame(1, 0, "Running"))
      .then(RenderFrame(2, 3, "Running"))
      .then(RenderFrame(3, 6, "Running"))
      .then(RenderFrame(4, 9, "Running"))
      .then(RenderFrame(5, 12, "Running"))
      .then(RenderFrame(6, 15, "Running"))
      .then(RenderFrame(7, 18, "Running"))
      .then(RenderFrame(8, 21, "Running"))
      .then(RenderFrame(9, 24, "Done"))
      .then(RenderFrame(10, 27, "Done"))
      .then(RenderFrame(11, 30, "Done"))
      .then(RenderFrame(12, 33, "Done"))
      .expect(
        animationSafety
        and frameRenderSafety
        and s.wovenGraphOps.subseteq(s.chromaRoleMap)
        and s.canvasResized
        and s.canvasWidth == 1920
        and s.visiblePixels > 0
        and s.frameRateLocked
        and s.framesRendered == 12
      )
}
