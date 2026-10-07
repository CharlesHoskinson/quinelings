// Browser surface of stable QDL 1 Session.
// One memory session. No transport, codec, byte budget, or geometry.
//
// Correspondence, not a refinement proof:
//   frame / describe / compile / inspect / verify / recover
//     ~ v1Session.view and visual_capsule.view (ledger and evaluations stay)
//     ~ agentSession complete(id, false) (executions stay)
//   run / reproduce
//     ~ visual_capsule.execute and agentSession complete(id, true)
//     ~ v1Session.commit, the only ledger step
// Source: packages/agent-sdk/src/v1.ts Session methods.
//         packages/agent-sdk/src/browser-v1.ts re-exports that Session.
// Update this file before changing those methods' evaluation behaviour.
// This file does not change spec/v1-session.qnt, spec/visual-capsule.qnt,
// or spec/agent-session.qnt.
module browser_frame {
  type State = {
    admitted: bool,
    evaluations: int,
    priorEvaluations: int,
    records: int,
    priorRecords: int,
    phase: int,
    last: str
  }
  var s: State
  pure val passiveLabels = Set("describe", "compile", "inspect", "verify", "recover", "frame")
  pure val evaluationLabels = Set("run", "reproduce")
  pure val empty: State = {
    admitted: false, evaluations: 0, priorEvaluations: 0,
    records: 0, priorRecords: 0, phase: 0, last: "init"
  }
  pure def stamp(state: State, label: str): State =
    state.with("priorEvaluations", state.evaluations)
      .with("priorRecords", state.records).with("last", label)
  action init = s' = empty
  action describe = s' = stamp(s, "describe")
  action compile = s' = stamp(s, "compile").with("admitted", true)
  action recover = s' = stamp(s, "recover").with("admitted", true)
  action frame = all {
    s.admitted,
    s' = stamp(s, "frame").with("phase", (s.phase + 1) % 16)
  }
  action inspect = all { s.admitted, s' = stamp(s, "inspect") }
  action verify = all { s.admitted, s' = stamp(s, "verify") }
  action evaluate(kind: str): bool = all {
    s.admitted,
    evaluationLabels.contains(kind),
    s.records < 2,
    s' = stamp(s, kind).with("evaluations", s.evaluations + 1).with("records", s.records + 1)
  }
  action step = {
    nondet kind = evaluationLabels.oneOf()
    any { describe, compile, recover, frame, inspect, verify, evaluate(kind) }
  }
  // A frame samples a phase and does not evaluate.
  val passiveFrame = s.last != "frame" or
    (s.evaluations == s.priorEvaluations and s.records == s.priorRecords)
  // describe, compile, inspect, verify, recover, and frame do not evaluate.
  val passiveOps = not(passiveLabels.contains(s.last)) or
    (s.evaluations == s.priorEvaluations and s.records == s.priorRecords)
  // The evaluation count moves only on run or reproduce.
  val noEvaluationWithoutRun = s.evaluations == s.priorEvaluations or
    evaluationLabels.contains(s.last)
  val evaluationMatchesRecords = s.evaluations == s.records
  val bounded = s.evaluations >= 0 and s.evaluations <= 2 and s.records <= 2 and
    s.phase >= 0 and s.phase <= 15
  val safety = passiveFrame and passiveOps and noEvaluationWithoutRun and
    evaluationMatchesRecords and bounded
  val admittedWithoutEvaluation = s.admitted and s.evaluations == 0 and s.last == "compile"
  val framedWithoutEvaluation = s.last == "frame" and s.evaluations == 0 and s.admitted
  val runEvaluates = s.last == "run" and s.evaluations == 1 and s.records == 1
  val reproduceEvaluates = s.last == "reproduce" and s.evaluations == 1 and s.records == 1

  run describe_is_passiveTest = init.then(describe)
    .expect(safety and s.evaluations == 0 and s.records == 0 and not(s.admitted))
  run compile_is_passiveTest = init.then(compile)
    .expect(safety and s.admitted and s.evaluations == 0 and s.records == 0 and s.last == "compile")
  run frame_is_passiveTest = init.then(compile).then(frame)
    .expect(safety and s.last == "frame" and s.phase == 1 and s.evaluations == 0 and s.records == 0)
  run repeated_frames_stay_passiveTest = init.then(compile).then(frame).then(frame).then(frame)
    .expect(safety and s.phase == 3 and s.evaluations == 0 and s.records == 0)
  run verify_inspect_recover_are_passiveTest = init.then(compile).then(verify).then(inspect).then(recover)
    .expect(safety and s.evaluations == 0 and s.records == 0 and s.last == "recover")
  run run_evaluates_onceTest = init.then(compile).then(frame).then(evaluate("run"))
    .expect(safety and s.evaluations == 1 and s.records == 1 and s.last == "run")
  run reproduce_evaluatesTest = init.then(recover).then(evaluate("reproduce"))
    .expect(safety and s.evaluations == 1 and s.records == 1 and s.last == "reproduce")
  run frame_after_run_does_not_evaluateTest = init.then(compile).then(evaluate("run")).then(frame)
    .expect(safety and s.evaluations == 1 and s.records == 1 and s.last == "frame" and s.phase == 1)
  // Negative control. Excluded from step.
  action unsafeFrame = all {
    s.admitted,
    s' = stamp(s, "frame").with("evaluations", s.evaluations + 1)
  }
  run detects_evaluating_frameTest = init.then(compile).then(unsafeFrame)
    .expect(not(noEvaluationWithoutRun) and not(passiveFrame) and not(passiveOps))
}

// Re-checks the existing specs that this browser contract restates.
module browser_frame_grounding {
  import v1Session as V1 from "./v1-session"
  import visual_capsule as Vis from "./visual-capsule"
  import agentSession as Agent from "./agent-session"
  run v1_view_is_passiveTest = V1::init.then(V1::view)
    .expect(V1::safety and V1::last == "view" and V1::s.world == 0 and V1::s.commits == 0 and V1::s.revision == 0)
  run visual_view_does_not_evaluateTest = Vis::init.then(Vis::view)
    .expect(Vis::safety and Vis::s.evaluations == 0 and Vis::s.last == "view")
  run visual_run_evaluatesTest = Vis::init.then(Vis::execute(1))
    .expect(Vis::safety and Vis::s.last == "run" and Vis::s.evaluations == 1)
  run visual_tampered_run_refusedTest = Vis::init.then(Vis::execute(Vis::TAMPERED)).fail()
  run agent_explicit_run_countsTest = Agent::init.then(Agent::begin(1)).then(Agent::complete(1, true))
    .expect(Agent::safety and Agent::executions == 1 and Agent::last == "run")
  run agent_complete_without_run_is_passiveTest = Agent::init.then(Agent::begin(1)).then(Agent::complete(1, false))
    .expect(Agent::safety and Agent::executions == 0 and Agent::last == "complete")
}
