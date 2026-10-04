// Bounded abstract simulation-only session. Tokens stand for already admitted
// complete requests, sources and responses; preflight booleans stand for schema,
// serialization and byte-budget checks. No JS/codec/durable-driver refinement.
module v1Session {
  type Receipt = {request: int, response: int, revision: int}
  type Observation = {sequence: int, status: str, units: int}
  type State = {world: int, revision: int, commits: int,
    receipts: int -> Receipt, observations: int -> Observation, submissions: int}
  type Draft = {key: int, request: int, expected: int, world: int,
    response: int, valid: bool, checked: bool}
  var s: State
  var before: State
  var pending: Draft
  var priorPending: Draft
  var last: str
  var returned: int
  pure val requestKeys = Set(1,2,3)
  pure val requests = Set(1,2)
  pure val attempts = Set(1,2)
  pure val statuses = Set("pending","unknown","confirmed","failed")
  pure val empty: State = {world:0,revision:0,commits:0,receipts:Map(),observations:Map(),submissions:0}
  pure val noDraft: Draft = {key:0,request:0,expected:0,world:0,response:0,valid:false,checked:false}
  action init = all {s'=empty,before'=empty,pending'=noDraft,priorPending'=noDraft,last'="init",returned'=0}

  // Each operation snapshots the authoritative state and the staging context.
  action move(candidate: State,draft: Draft,label: str,response: int): bool = all {
    s'=candidate,before'=s,pending'=draft,priorPending'=pending,last'=label,returned'=response
  }
  action refuse = move(s,noDraft,"refuse",0)
  action view = move(s,pending,"view",0)
  action cancel = move(s,noDraft,"cancel",0)

  action stage(key: int,request: int,expected: int,world: int,response: int,valid: bool): bool =
    if(not(requestKeys.contains(key)) or not(requests.contains(request))) refuse
    else if(s.receipts.keys().contains(key)) {
      val r=s.receipts.get(key)
      if(r.request==request) move(s,noDraft,"replay",r.response)
      else move(s,noDraft,"conflict",0)
    } else if(s.receipts.keys().size()>=2) move(s,noDraft,"full",0)
    else move(s,{key:key,request:request,expected:expected,world:world,response:response,
      valid:valid,checked:false},"stage",0)

  action preflight(schemaAndSizeOK: bool): bool =
    if(pending.key!=0 and pending.valid and schemaAndSizeOK and
      pending.world>=0 and pending.world<=8 and pending.response>=0 and pending.response<=8)
      move(s,pending.with("checked",true),"preflight",0)
    else refuse

  action commit = if(pending.key==0) refuse
    else if(s.receipts.keys().contains(pending.key)) {
      val r=s.receipts.get(pending.key)
      if(r.request==pending.request) move(s,noDraft,"replay",r.response)
      else move(s,noDraft,"conflict",0)
    } else if(s.receipts.keys().size()>=2) move(s,noDraft,"full",0)
    else if(not(pending.checked) or pending.expected!=s.revision) refuse
    else {
      val receipt={request:pending.request,response:pending.response,revision:s.revision+1}
      move(s.with("world",pending.world).with("revision",s.revision+1)
        .with("commits",s.commits+1).with("receipts",s.receipts.put(pending.key,receipt)),noDraft,"commit",receipt.response)
    }

  pure def terminal(o: Observation): bool = Set("confirmed","failed").contains(o.status)
  pure def wellFormed(o: Observation): bool = o.sequence>=0 and o.sequence<=4 and
    statuses.contains(o.status) and (if(o.status=="confirmed") o.units>0 and o.units<=2 else o.units==0)
  pure def canObserve(old: Observation,candidate: Observation): bool = candidate.sequence>=old.sequence and
    (candidate.sequence!=old.sequence or candidate==old) and
    (not(terminal(old)) or (candidate.status==old.status and candidate.units==old.units))
  action observe(attempt: int,sequence: int,status: str,units: int): bool = {
    val o={sequence:sequence,status:status,units:units}
    if(not(attempts.contains(attempt)) or not(wellFormed(o))) refuse
    else if(s.observations.keys().contains(attempt) and not(canObserve(s.observations.get(attempt),o))) refuse
    else move(s.with("observations",s.observations.put(attempt,o)),pending,"observe",0)
  }
  // Sum by attempt identity; equal unit values from distinct attempts count separately.
  pure def confirmedUnits(x: State): int = attempts.fold(0,(sum,a)=>sum+
    (if(x.observations.keys().contains(a) and x.observations.get(a).status=="confirmed")x.observations.get(a).units else 0))
  pure def mayRetry(x: State): bool = not(x.observations.keys().exists(a=>Set("pending","unknown").contains(x.observations.get(a).status)))

  val bounded = s.world>=0 and s.world<=8 and s.receipts.keys().subseteq(requestKeys) and
    s.receipts.keys().size()<=2 and s.observations.keys().subseteq(attempts) and
    s.observations.keys().forall(a=>wellFormed(s.observations.get(a)))
  val ledgerMonotone = before.receipts.keys().subseteq(s.receipts.keys()) and
    before.receipts.keys().forall(k=>s.receipts.get(k)==before.receipts.get(k))
  val countOnce = s.commits==s.receipts.keys().size() and s.revision==s.commits
  val receiptShape = s.receipts.keys().forall(k=>requests.contains(s.receipts.get(k).request) and
    s.receipts.get(k).revision>0 and s.receipts.get(k).revision<=s.revision and
    s.receipts.get(k).response>=0 and s.receipts.get(k).response<=8)
  val atomic = last!="commit" or (s.world==priorPending.world and s.revision==before.revision+1 and
    s.commits==before.commits+1 and s.receipts.keys()==before.receipts.keys().union(Set(priorPending.key)) and
    s.receipts.get(priorPending.key)=={request:priorPending.request,response:priorPending.response,revision:s.revision} and
    returned==priorPending.response and priorPending.checked and priorPending.expected==before.revision)
  val passive = last=="commit" or (s.world==before.world and s.revision==before.revision and
    s.commits==before.commits and s.receipts==before.receipts)
  val refusalUnchanged = not(Set("refuse","conflict","full","replay","view","cancel","stage","preflight").contains(last)) or s==before
  val terminalMonotone = before.observations.keys().subseteq(s.observations.keys()) and
    before.observations.keys().forall(a=>not(terminal(before.observations.get(a))) or
      (s.observations.get(a).status==before.observations.get(a).status and s.observations.get(a).units==before.observations.get(a).units))
  val quantityMonotone = confirmedUnits(s)>=confirmedUnits(before)
  val noSubmission = s.submissions==0
  val safety = bounded and ledgerMonotone and countOnce and receiptShape and atomic and passive and
    refusalUnchanged and terminalMonotone and quantityMonotone and noSubmission

  action step = {
    nondet key=requestKeys.oneOf()
    nondet request=requests.oneOf()
    nondet expected=Set(s.revision,s.revision+1).oneOf()
    nondet world=Set(0,1,8,9).oneOf()
    nondet response=Set(0,2,8,9).oneOf()
    nondet ok=Set(false,true).oneOf()
    nondet attempt=attempts.oneOf()
    nondet sequence=0.to(4).oneOf()
    nondet status=statuses.oneOf()
    nondet units=Set(0,1,2).oneOf()
    any {stage(key,request,expected,world,response,ok),preflight(ok),commit,view,cancel,
      observe(attempt,sequence,status,units)}
  }

  action first = init.then(stage(1,1,0,3,5,true)).then(preflight(true)).then(commit)
  action full = first.then(stage(2,1,1,4,6,true)).then(preflight(true)).then(commit)
  run staged_is_passiveTest = init.then(stage(1,1,0,3,5,true)).expect(safety and s==empty)
  run preflight_failureTest = init.then(stage(1,1,0,3,5,true)).then(preflight(false)).expect(safety and last=="refuse" and s==empty)
  run oversized_responseTest = init.then(stage(1,1,0,3,9,true)).then(preflight(true)).expect(safety and s==empty and last=="refuse")
  run unvalidated_draftTest = init.then(stage(1,1,0,3,5,false)).then(preflight(true)).expect(safety and s==empty and last=="refuse")
  run unchecked_commitTest = init.then(stage(1,1,0,3,5,true)).then(commit).expect(safety and s==empty and last=="refuse")
  run stale_commitTest = init.then(stage(1,1,1,3,5,true)).then(preflight(true)).then(commit).expect(safety and s==empty and last=="refuse")
  run atomic_commitTest = first.expect(safety and s.world==3 and s.commits==1 and returned==5)
  run lost_response_replayTest = first.then(view).then(stage(1,1,0,8,8,false)).expect(safety and last=="replay" and returned==5 and s.commits==1)
  run changed_payload_conflictTest = first.then(stage(1,2,0,8,8,true)).expect(safety and last=="conflict" and s.world==3)
  run ledger_full_refusalTest = full.then(stage(3,1,2,8,8,true)).expect(safety and last=="full" and s.commits==2)
  run full_ledger_retains_replayTest = full.then(stage(1,1,0,8,8,false)).expect(safety and last=="replay" and returned==5)
  run cancelled_draftTest = init.then(stage(1,1,0,3,5,true)).then(preflight(true)).then(cancel).then(commit).expect(safety and s==empty)
  run pending_blocks_retryTest = init.then(observe(1,0,"pending",0)).expect(safety and not(mayRetry(s)))
  run unknown_blocks_retryTest = init.then(observe(1,0,"unknown",0)).then(view).expect(safety and not(mayRetry(s)) and s.submissions==0)
  run unknown_resolvesTest = init.then(observe(1,0,"unknown",0)).then(observe(1,1,"confirmed",2)).expect(safety and confirmedUnits(s)==2 and mayRetry(s))
  run terminal_reobservation_onceTest = init.then(observe(1,1,"confirmed",1)).then(observe(1,2,"confirmed",1)).expect(safety and confirmedUnits(s)==1)
  run separate_attempts_countTest = init.then(observe(1,1,"confirmed",1)).then(observe(2,1,"confirmed",1)).expect(safety and confirmedUnits(s)==2)
  run terminal_regression_refusesTest = init.then(observe(1,1,"confirmed",1)).then(observe(1,2,"pending",0)).expect(safety and last=="refuse" and confirmedUnits(s)==1)
  run changed_terminal_units_refusesTest = init.then(observe(1,1,"confirmed",1)).then(observe(1,2,"confirmed",2)).expect(safety and last=="refuse")
  run equal_sequence_conflictTest = init.then(observe(1,1,"pending",0)).then(observe(1,1,"unknown",0)).expect(safety and last=="refuse")
  run stale_observation_refusesTest = init.then(observe(1,2,"unknown",0)).then(observe(1,1,"pending",0)).expect(safety and last=="refuse")
  run partial_confirmed_unknownTest = init.then(observe(1,1,"confirmed",2)).then(observe(2,1,"unknown",0)).expect(safety and confirmedUnits(s)==2 and not(mayRetry(s)))

  // Negative controls excluded from step. Their failing invariants demonstrate
  // that the properties can catch the specific implementation mistakes.
  action unsafePartialCommit = move(s.with("world",pending.world),noDraft,"commit",pending.response)
  action unsafeEvict = move(s.with("receipts",Map()),noDraft,"view",0)
  action unsafeTerminalRegression = move(s.with("observations",s.observations.put(1,{sequence:2,status:"pending",units:0})),pending,"observe",0)
  action unsafeUnknownResubmit = move(s.with("submissions",s.submissions+1),pending,"observe",0)
  run detects_partial_commitTest = init.then(stage(1,1,0,3,5,true)).then(preflight(true)).then(unsafePartialCommit).expect(not(atomic) and s.world!=before.world and s.commits==before.commits)
  run detects_receipt_evictionTest = first.then(unsafeEvict).expect(not(ledgerMonotone) and not(countOnce))
  run detects_terminal_regressionTest = init.then(observe(1,1,"confirmed",1)).then(unsafeTerminalRegression).expect(not(terminalMonotone) and not(quantityMonotone))
  run detects_unknown_resubmissionTest = init.then(observe(1,1,"unknown",0)).then(unsafeUnknownResubmit).expect(not(noSubmission))
}
