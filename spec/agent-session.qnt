// Finite adapter-session abstraction: paused retention and explicit effects.
// No claim of protocol parsing or SDK transport refinement.
module agentSession {
  type Entry = {status: str, touched: int}
  var tasks: int -> Entry
  var clock: int
  var executions: int
  var last: str
  var priorExecutions: int
  var priorActive: Set[int]
  pure val ids = Set(1,2,3,4)
  pure val capacity = 3
  pure val ttl = 3
  pure def active(e: Entry): bool = Set("active","resuming").contains(e.status)
  pure def expired(e: Entry, now: int): bool = e.status == "paused" and now-e.touched >= ttl
  pure def purge(ts: int -> Entry, now: int): int -> Entry =
    ts.keys().filter(id => not(expired(ts.get(id),now))).mapBy(id => ts.get(id))
  pure def victim(ts: int -> Entry): Set[int] = {
    val eligible=ts.keys().filter(id => not(active(ts.get(id))))
    eligible.filter(id => eligible.forall(other => ts.get(id).touched <= ts.get(other).touched))
  }
  action init = all {tasks'=Map(),clock'=0,executions'=0,last'="init",priorExecutions'=0,priorActive'=Set()}
  action tick = all {
    clock'=clock+1,tasks'=purge(tasks,clock+1),executions'=executions,
    last'="tick",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
  }
  action begin(id: int): bool = {
    val clean=purge(tasks,clock)
    val remove=if(clean.keys().size() >= capacity and not(clean.keys().contains(id))) victim(clean) else Set()
    nondet drop=(if(remove.size()>0) remove else Set(0)).oneOf()
    val available=if(drop==0) clean else clean.keys().filter(k=>k!=drop).mapBy(k=>clean.get(k))
    all {
      ids.contains(id), not(available.keys().contains(id)), available.keys().size()<capacity,
      tasks'=available.put(id,{status:"active",touched:clock}),clock'=clock,
      executions'=executions,last'="begin",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
    }
  }
  action pause(id: int): bool = all {
    tasks.keys().contains(id),active(tasks.get(id)),
    tasks'=tasks.set(id,{status:"paused",touched:clock}),clock'=clock,
    executions'=executions,last'="pause",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
  }
  action resume(id: int): bool = all {
    tasks.keys().contains(id),tasks.get(id).status=="paused",not(expired(tasks.get(id),clock)),
    tasks'=tasks.set(id,{status:"resuming",touched:clock}),clock'=clock,
    executions'=executions,last'="resume",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
  }
  action complete(id: int, explicitRun: bool): bool = all {
    tasks.keys().contains(id),active(tasks.get(id)),
    tasks'=tasks.set(id,{status:"terminal",touched:clock}),clock'=clock,
    executions'=executions+(if(explicitRun)1 else 0),
    last'=if(explicitRun)"run" else "complete",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
  }
  action cancel(id: int): bool = all {
    tasks.keys().contains(id),tasks.get(id).status=="paused",
    tasks'=tasks.set(id,{status:"terminal",touched:clock}),clock'=clock,
    executions'=executions,last'="cancel",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))
  }
  action step = {
    nondet id=ids.oneOf()
    nondet executeFlag=Set(true,false).oneOf()
    any {tick,begin(id),pause(id),resume(id),complete(id,executeFlag),cancel(id)}
  }
  val bounded = tasks.keys().size()<=capacity and tasks.keys().subseteq(ids)
  val passive = last=="run" or executions==priorExecutions
  val current = tasks.keys().forall(id=>not(expired(tasks.get(id),clock)))
  val protected = priorActive.subseteq(tasks.keys())
  val safety = bounded and passive and current and protected
  run paused_backlog_does_not_blockTest = init.then(begin(1)).then(pause(1))
    .then(begin(2)).then(pause(2)).then(begin(3)).then(pause(3)).then(begin(4))
    .expect(safety and tasks.keys().contains(4) and executions==0)
  run expiry_is_passiveTest = init.then(begin(1)).then(pause(1)).then(tick).then(tick).then(tick)
    .expect(safety and not(tasks.keys().contains(1)) and executions==0)
  action unsafeDrop = all {tasks'=Map(),clock'=clock,executions'=executions,last'="drop",priorExecutions'=executions,priorActive'=tasks.keys().filter(id=>active(tasks.get(id)))}
  run detects_active_evictionTest = init.then(begin(1)).then(unsafeDrop).expect(not(protected))
  run retained_task_resumesTest = init.then(begin(1)).then(pause(1)).then(resume(1)).then(complete(1,true))
    .expect(safety and executions==1)
}
