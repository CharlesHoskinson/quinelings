// Experimental visual capsule admission/identity model. Integer tokens abstract
// canonical sources; byte equality, JSON admission and codecs are checked in JS.
// This model makes no claim about mathematical beauty or numerical dynamics.
module visual_capsule {
  type State = {task: int, visual: int, priorTask: int, priorVisual: int,
    evaluations: int, priorEvaluations: int, recordTask: int, phase: int, last: str}
  var s: State
  pure val sources = Set(1,2,3)
  action init = s' = {task:1,visual:1,priorTask:1,priorVisual:1,
    evaluations:0,priorEvaluations:0,recordTask:0,phase:0,last:"init"}
  def prior(kind: str): State = s.with("priorTask",s.task)
    .with("priorVisual",s.visual).with("priorEvaluations",s.evaluations).with("last",kind)
  action author(body: int): bool = all {sources.contains(body),
    s' = prior("author").with("visual",body)}
  action view = s' = prior("view").with("phase",(s.phase+1)%16)
  action recover(task: int, body: int): bool = all {
    task == s.task, body == s.visual,
    s' = prior("recover")
  }
  action verify = s' = prior("verify")
  action execute = s' = prior("run").with("evaluations",s.evaluations+1).with("recordTask",s.task)
  action reject = s' = prior("reject")
  action edit(task: int, body: int): bool = all {sources.contains(task),sources.contains(body),
    s' = prior("edit").with("task",task).with("visual",body).with("recordTask",0)}
  action step = {nondet token=sources.oneOf()
    any {author(token),view,recover(s.task,s.visual),verify,execute,reject,edit(token,token)}}
  val passive = Set("author","view","recover","verify","reject").contains(s.last)
    implies s.evaluations == s.priorEvaluations
  val retainsTask = s.last == "author" implies s.task == s.priorTask
  val exactRecovery = Set("recover","verify").contains(s.last)
    implies s.task == s.priorTask and s.visual == s.priorVisual
  val currentRecord = s.recordTask == 0 or s.recordTask == s.task
  val safety = passive and retainsTask and exactRecovery and currentRecord
  run authoredViewIsPassiveTest = init.then(author(2)).then(view).then(verify).then(recover(1,2))
    .expect(s.evaluations == 0 and s.task == 1 and s.visual == 2)
  run editedTaskDiscardsRecordTest = init.then(execute).then(edit(2,3))
    .expect(s.recordTask == 0 and s.evaluations == 1)
}
