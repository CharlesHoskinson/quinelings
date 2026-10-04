// Abstract identity tokens, not a proof of JavaScript, hashing or JSON parsing.
module websiteLab {
  type Key = {source: int, input: int}
  type Record = {key: Key, output: int, origin: str, serial: int}
  type State = {key: Key, record: Record, baseline: Record, present: bool, status: str,
    executions: int, evaluatorRequests: int, phase: int, view: int, emitted: int, rebuilt: int}
  var s: State
  var before: State
  var event: str
  pure val empty = {key:{source:0,input:0},output:0,origin:"none",serial:0}
  pure val initial = {key:{source:0,input:0},record:empty,baseline:empty,present:false,status:"ready",
    executions:0,evaluatorRequests:0,phase:0,view:0,emitted:-1,rebuilt:-1}
  pure def output(k: Key): int = k.source*10+k.input
  action init = all {s'=initial,before'=initial,event'="init"}
  pure def requestDelta(kind: str): int =
    if(Set("run","comparePreRefused").contains(kind))1
    else if(Set("compare","compareRefused","variant").contains(kind))2
    else if(kind=="generations")3 else 0
  action commit(after: State, kind: str): bool = all {
    s'=after.with("evaluatorRequests",s.evaluatorRequests+requestDelta(kind)),before'=s,event'=kind}
  action editInput(token: int): bool = all {
    token!=s.key.input,
    commit(s.with("key",s.key.with("input",token)).with("status","stale"),"input")
  }
  action build(token: int): bool = all {
    token!=s.key.source,
    commit(s.with("key",s.key.with("source",token)).with("status","stale"),"build")
  }
  action runTask = commit(s.with("record",{key:s.key,output:output(s.key),origin:"executed",serial:s.executions+1})
    .with("present",true).with("status","current").with("executions",s.executions+1),"run")
  action replay = all {s.present,s.record.key==s.key,s.record.origin=="executed",
    commit(s.with("status","replay"),"replay")}
  action refuse = commit(s.with("status","refused"),"refuse")
  action animate = commit(s.with("phase",(s.phase+1)%4),"animate")
  action selectView = commit(s.with("view",(s.view+1)%3),"view")
  action verify = commit(s.with("emitted",s.key.source),"verify")
  action reconstruct = commit(s.with("rebuilt",s.key.source),"reconstruct")
  action importRecord = commit(s.with("record",{key:s.key,output:output(s.key),origin:"asserted",serial:0})
    .with("present",true).with("status","asserted"),"import")
  pure def baselineRecord(state: State): Record = {
    val key={source:state.key.source,input:0}
    {key:key,output:output(key),origin:"executed",serial:state.executions+1}
  }
  // executions counts completed graph evaluations; requests also counts typed refusal.
  action compare = commit(s.with("baseline",baselineRecord(s))
    .with("record",{key:s.key,output:output(s.key),origin:"executed",serial:s.executions+2})
    .with("present",true).with("status","current").with("executions",s.executions+2),"compare")
  // Typed refusal enters the interpreter but does not complete a graph evaluation.
  action compareRefused = commit(s.with("status","refused").with("executions",s.executions+1),"compareRefused")
  action comparePreRefused = commit(s.with("status","refused").with("executions",s.executions+1),"comparePreRefused")
  action generations = all {currentClaim,
    commit(s.with("executions",s.executions+3),"generations")}
  // Two separately authored artifacts execute without replacing the primary comparison.
  action sourceVariant = commit(s.with("executions",s.executions+2),"variant")
  action step = {
    nondet token=Set(0,1,2).oneOf()
    any {editInput(token),build(token),runTask,replay,refuse,animate,selectView,verify,reconstruct,importRecord,
      compare,compareRefused,comparePreRefused,generations,sourceVariant}
  }
  val currentClaim = Set("current","replay").contains(s.status)
  val currentIsExecuted = not(currentClaim) or
    (s.present and s.record.key==s.key and s.record.origin=="executed")
  val onlyRunExecutes = s.executions==before.executions+
    (if(Set("run","compareRefused","comparePreRefused").contains(event))1
     else if(Set("compare","variant").contains(event))2 else if(event=="generations")3 else 0)
  val retained = not(Set("refuse","input","build","animate","view","verify","reconstruct","replay",
    "compareRefused","comparePreRefused","generations","variant").contains(event)) or
    (s.record==before.record and s.present==before.present)
  val exactReplay = event!="replay" or (s.record==before.record and s.record.key==s.key)
  val refuseNeverCurrent = event!="refuse" or not(currentClaim)
  val editedIdentity = not(Set("input","build").contains(event)) or (s.key!=before.key and not(currentClaim))
  val importIsAsserted = event!="import" or (s.status=="asserted" and s.record.origin=="asserted")
  val sourceOnly = event!="verify" or (s.emitted==s.key.source and s.record==before.record)
  val genotypeOnly = event!="reconstruct" or (s.rebuilt==s.key.source and s.record==before.record)
  val comparisonBaseline = event!="compare" or
    (s.baseline==baselineRecord(before))
  val refusalPairRetained = not(Set("compareRefused","comparePreRefused","refuse").contains(event)) or
    (s.baseline==before.baseline and s.record==before.record)
  val measuredRequests = s.evaluatorRequests==before.evaluatorRequests+requestDelta(event)
  val evaluationsBoundedByRequests = s.executions<=s.evaluatorRequests
  val safety = currentIsExecuted and onlyRunExecutes and retained and exactReplay and refuseNeverCurrent
    and editedIdentity and importIsAsserted and sourceOnly and genotypeOnly and comparisonBaseline
    and measuredRequests and evaluationsBoundedByRequests and refusalPairRetained
  run stale_then_refusalTest = init.then(runTask).then(editInput(1)).then(refuse)
    .expect(safety and s.record.key.input==0 and s.executions==1 and s.status=="refused")
  run exact_replayTest = init.then(runTask).then(replay).then(animate).then(selectView)
    .expect(safety and s.executions==1 and s.record.serial==1)
  run build_verify_reconstructTest = init.then(runTask).then(build(1)).then(verify).then(reconstruct)
    .expect(safety and s.executions==1 and s.emitted==1 and s.rebuilt==1 and not(currentClaim))
  run imported_is_assertionTest = init.then(importRecord)
    .expect(safety and s.executions==0 and not(currentClaim))
  run homepage_compoundsTest = init.then(compare).then(replay).then(verify).then(generations).then(sourceVariant)
    .expect(safety and s.executions==7 and s.evaluatorRequests==7 and s.record.serial==2)
  run comparison_refusal_retains_afterTest = init.then(compare).then(editInput(1)).then(compareRefused)
    .expect(safety and s.executions==3 and s.evaluatorRequests==4 and s.record.key.input==0 and s.baseline.serial==1 and s.status=="refused")
  run malformed_json_preserves_pairTest = init.then(compare).then(editInput(1)).then(refuse)
    .expect(safety and s.executions==2 and s.evaluatorRequests==2 and s.baseline.serial==1 and s.record.serial==2)
  run pre_interpreter_refusalTest = init.then(compare).then(editInput(1)).then(comparePreRefused)
    .expect(safety and s.executions==3 and s.evaluatorRequests==3)
  // Deliberate broken transitions establish that the checks can reject bugs.
  action badAnimation = commit(s.with("executions",s.executions+1),"animate")
  action badFreshness = commit(s.with("key",{source:1,input:1}),"input")
  action badImport = commit(s.with("status","current"),"replay")
  action badRequestCounting = all {s'=s.with("evaluatorRequests",s.evaluatorRequests+1),before'=s,event'="animate"}
  action badComparisonRefusal = commit(s.with("baseline",baselineRecord(s)).with("record",empty)
    .with("executions",s.executions+1).with("status","refused"),"compareRefused")
  action badMixedPair = commit(s.with("baseline",baselineRecord(s)).with("executions",s.executions+1)
    .with("status","refused"),"compareRefused")
  run detects_mixed_comparison_pairTest = init.then(compare).then(editInput(1)).then(badMixedPair)
    .expect(retained and not(refusalPairRetained))
  run detects_hidden_executionTest = init.then(badAnimation).expect(not(onlyRunExecutes))
  run detects_stale_currentTest = init.then(runTask).then(badFreshness).expect(not(currentIsExecuted))
  run detects_import_as_verifiedTest = init.then(importRecord).then(badImport).expect(not(currentIsExecuted))
  run detects_refusal_losing_historyTest = init.then(compare).then(badComparisonRefusal).expect(not(retained))
  run detects_hidden_interpreter_requestTest = init.then(badRequestCounting).expect(not(measuredRequests))
}
