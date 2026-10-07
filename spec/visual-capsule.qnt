// Experimental visual capsule admission/identity model. Integer tokens abstract
// canonical sources; byte equality, JSON admission and codecs are checked in JS.
// This model makes no claim about mathematical beauty or numerical dynamics.
//
// Correspondence (visual-capsule.js, packages/agent-sdk/src/experimental.ts and
// experimental-adapters.ts):
//   author        VisualCapsule.author / visualAuthor (new design, same task source)
//   view          frame/anchor/bounds (passive sampling)
//   recover       VisualCapsule.recover: decoded genome equals the capsule
//   rejectRecovery  recover throws 'Visual genome differs'
//   verify        VisualCapsule.verify (constructor re-emits exact source)
//   construct     execute(program,{constructionOnly:true}) (emits, no task run)
//   execute       execute(program[,{bindings}]) (evaluates the retained task)
//   rejectProgram admission refusal of a capsule-shaped program (TAMPERED)
//   edit          author/build against another task source
module visual_capsule {
  type State = {task: int, visual: int, priorTask: int, priorVisual: int,
    evaluations: int, priorEvaluations: int, recordTask: int, phase: int, last: str,
    subject: int, returnedTask: int, returnedVisual: int}
  var s: State
  pure val sources = Set(1,2,3)
  // A capsule-shaped program that fails admission (edited territory or seed,
  // trailing expression, constructor/source mismatch).
  pure val TAMPERED = 9
  pure val NONE = 0
  pure def admissible(program: int): bool = sources.contains(program)
  action init = s' = {task:1,visual:1,priorTask:1,priorVisual:1,
    evaluations:0,priorEvaluations:0,recordTask:0,phase:0,last:"init",
    subject:NONE,returnedTask:NONE,returnedVisual:NONE}
  def prior(kind: str, subject: int): State = s.with("priorTask",s.task)
    .with("priorVisual",s.visual).with("priorEvaluations",s.evaluations).with("last",kind)
    .with("subject",subject).with("returnedTask",NONE).with("returnedVisual",NONE)

  action author(body: int): bool = all {sources.contains(body),
    s' = prior("author",NONE).with("visual",body)}
  action view = s' = prior("view",NONE).with("phase",(s.phase+1)%16)
  // task/body are the identity decoded from the capsule's own genome.
  action recover(task: int, body: int): bool = all {
    task == s.task, body == s.visual,
    s' = prior("recover",s.visual).with("returnedTask",task).with("returnedVisual",body)
  }
  action rejectRecovery(task: int, body: int): bool = all {
    task != s.task or body != s.visual,
    s' = prior("reject",s.visual)
  }
  action verify(program: int): bool = all {admissible(program), s' = prior("verify",program)}
  action construct(program: int): bool = all {admissible(program), s' = prior("construct",program)}
  action execute(program: int): bool = all {admissible(program),
    s' = prior("run",program).with("evaluations",s.evaluations+1).with("recordTask",s.task)}
  action rejectProgram(program: int): bool = all {not(admissible(program)), s' = prior("reject",program)}
  action edit(task: int, body: int): bool = all {sources.contains(task),sources.contains(body),
    s' = prior("edit",NONE).with("task",task).with("visual",body).with("recordTask",0)}

  action step = {
    nondet token=sources.oneOf()
    nondet program=Set(s.visual,TAMPERED).oneOf()
    nondet decodedTask=sources.oneOf()
    nondet decodedBody=sources.oneOf()
    any {author(token),view,recover(decodedTask,decodedBody),rejectRecovery(decodedTask,decodedBody),
      verify(program),construct(program),execute(program),rejectProgram(program),edit(token,token)}
  }

  val passive = Set("author","view","recover","verify","construct","reject").contains(s.last)
    implies s.evaluations == s.priorEvaluations
  val retainsTask = s.last == "author" implies s.task == s.priorTask
  val exactRecovery = s.last == "recover" implies (s.task == s.priorTask and s.visual == s.priorVisual and
    s.returnedTask == s.task and s.returnedVisual == s.visual)
  val identityPreserved = Set("view","recover","verify","construct","run","reject").contains(s.last)
    implies (s.task == s.priorTask and s.visual == s.priorVisual)
  // Every successful source-bound operation acted on an admitted capsule.
  val admittedOnly = Set("recover","verify","construct","run").contains(s.last)
    implies admissible(s.subject)
  val currentRecord = s.recordTask == 0 or s.recordTask == s.task
  val safety = passive and retainsTask and exactRecovery and identityPreserved and admittedOnly and currentRecord

  // Witnesses (quint run --witnesses): each names an outcome that must be reachable.
  val authoredWitness = s.last == "author" and s.visual != s.priorVisual
  val viewWitness = s.last == "view"
  val recoverWitness = s.last == "recover"
  val recoveryRejectedWitness = s.last == "reject" and admissible(s.subject)
  val verifyWitness = s.last == "verify"
  val constructWitness = s.last == "construct"
  val runWitness = s.last == "run"
  val tamperedRejectedWitness = s.last == "reject" and s.subject == TAMPERED
  val editDiscardsRecordWitness = s.last == "edit" and s.priorEvaluations > 0
  val recordAfterAuthorWitness = s.last == "author" and s.recordTask != 0

  run authoredViewIsPassiveTest = init.then(author(2)).then(view).then(verify(2)).then(recover(1,2))
    .expect(safety and s.evaluations == 0 and s.task == 1 and s.visual == 2)
  run editedTaskDiscardsRecordTest = init.then(execute(1)).then(edit(2,3))
    .expect(safety and s.recordTask == 0 and s.evaluations == 1)
  run constructionIsPassiveTest = init.then(construct(1))
    .expect(safety and s.evaluations == 0 and s.recordTask == 0)
  run tamperedProgramRefusedTest = init.then(rejectProgram(TAMPERED))
    .expect(safety and s.last == "reject" and s.evaluations == 0)
  run tamperedConstructionDisabledTest = init.then(construct(TAMPERED)).fail()
  run tamperedExecutionDisabledTest = init.then(execute(TAMPERED)).fail()
  run mismatchedGenomeRefusedTest = init.then(author(2)).then(rejectRecovery(1,3))
    .expect(safety and s.last == "reject" and s.visual == 2)

  // Negative controls excluded from step. Each shows a property can fail.
  // unsafeLegacyConstruct is the behaviour VisualCapsule.execute had before the
  // SDK fix: a capsule-shaped program that fails admission fell back to the
  // legacy interpreter and constructionOnly returned a successful record.
  action unsafeLegacyConstruct = s' = prior("construct",TAMPERED)
  action unsafeRecover(task: int, body: int): bool =
    s' = prior("recover",s.visual).with("task",task).with("visual",body).with("returnedTask",task).with("returnedVisual",body)
  action unsafeEvaluatingView = s' = prior("view",NONE).with("evaluations",s.evaluations+1)
  action unsafeEditKeepsRecord = s' = prior("edit",NONE).with("task",2).with("visual",2)
  run detectsLegacyConstructionTest = init.then(unsafeLegacyConstruct).expect(not(admittedOnly))
  run detectsWrongRecoveryTest = init.then(unsafeRecover(2,3)).expect(not(exactRecovery) and not(identityPreserved))
  run detectsEvaluatingViewTest = init.then(unsafeEvaluatingView).expect(not(passive))
  run detectsStaleRecordTest = init.then(execute(1)).then(unsafeEditKeepsRecord).expect(not(currentRecord))
}
