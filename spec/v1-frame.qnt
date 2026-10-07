// Stable /v1 frame surface, extracted from packages/agent-sdk/src/v1.ts
// (Session.frame/#bodies), v1-schema.ts (Frame*Schema), and anatomy.js (frame).
// One synchronous Session/caller; calls are atomic, with no network or tasks.
// Sources are pre-admitted: 1..33 have assembly anatomy/gesture, 34 does not.
// IDs and geometry are symbolic; integer phases sample the real finite interval.
// Shape flags represent JSON/schema failures not expressible as Quint integers.
// The observer's originals/copies are NOT an implementation frame cache.
// Covers FIFO body retention, successful-insertion ordering, deterministic
// frame keys/dimensions, caller detachment, refusal and store passivity.
// Does not prove geometry/codec correctness, hostile proxies, byte limits,
// all floating-point phases, or universal implementation refinement.
// Update/re-run this model before changing the corresponding frame surface.
module v1Frame {
  type Shape = Normal | Defaults | FractionalBudget | FractionalCrests | NonfinitePhase | ExtraOption
  type Outcome = Initial | Rendered | InvalidInput | UnknownArtifact | UnsupportedFrame | SampleFailed | Mutated
  type Request = {artifact: int, phase: int, budget: int, crests: int, shape: Shape}
  type Key = {artifact: int, phase: int, budget: int, crests: int}
  type Frame = {key: Key, points: int, normals: int, owners: int, ridges: int, mutation: int}
  type Command = Start | Render(Request) | FailSample(Request) | Mutate(int)
  type State = {cache: List[int], compilations: int, evaluations: int, records: int, receipts: int}
  type Observer = {before: State, beforeOriginals: List[Frame], beforeCopies: List[Frame],
    originals: List[Frame], copies: List[Frame], command: Command, outcome: Outcome}
  var s: State
  var audit: Observer
  pure val assemblies = 1.to(33)
  pure val admitted = 1.to(34)
  pure val empty: State = {cache: List(), compilations: 0, evaluations: 0, records: 1, receipts: 1}
  // Reachable after 32 successful calls and discarding their returned frames.
  // fifoEvictionTest/failedFullSampleTest replay that prefix from the cold init.
  pure val warm: State = {...empty, cache: range(1,33), compilations: 32}
  pure def initialObserver(x: State): Observer = {before:x, beforeOriginals:List(), beforeCopies:List(),
    originals:List(), copies:List(), command:Start, outcome:Initial}
  pure def request(id: int, phase: int, budget: int, crests: int): Request =
    {artifact: id, phase: phase, budget: budget, crests: crests, shape: Normal}
  pure def key(r: Request): Key = {artifact: r.artifact, phase: r.phase,
    budget: if (r.shape == Defaults) 12000 else r.budget,
    crests: if (r.shape == Defaults) 3 else r.crests}
  pure def valid(r: Request): bool = {
    val k = key(r)
    (r.shape == Normal or r.shape == Defaults) and r.phase >= -1000000000 and
      r.phase <= 1000000000 and k.budget >= 4000 and k.budget <= 24000 and
      k.crests >= 2 and k.crests <= 4
  }
  pure def supported(r: Request): bool = valid(r) and assemblies.contains(r.artifact)
  pure def frameValue(r: Request): Frame = {
    val k = key(r)
    {key: k, points: 4*k.budget, normals: 3*k.budget, owners: k.budget, ridges: k.crests, mutation: 0}
  }
  // Map insertion order is observable through compile counts after eviction.
  // Hits do not promote; phase/budget/crests never enter the body-cache key.
  pure def containsBody(x: State, id: int): bool = x.cache.indices().exists(i => x.cache.nth(i) == id)
  pure def retained(x: State, id: int): List[int] =
    if (containsBody(x,id)) x.cache
    else (if (x.cache.length() >= 32) x.cache.tail() else x.cache).append(id)
  pure def sampled(x: State, r: Request): State = {...x,
    cache: retained(x,r.artifact), compilations: x.compilations + (if (containsBody(x,r.artifact)) 0 else 1)}
  pure def failedSample(x: State, r: Request): State = {...x,
    compilations: x.compilations + (if (containsBody(x,r.artifact)) 0 else 1)}
  pure def observed(o: Observer, x: State, c: Command, result: Outcome): Observer = {...o,
    before: x, beforeOriginals: o.originals, beforeCopies: o.copies, command: c, outcome: result}
  pure def rendered(o: Observer, x: State, r: Request): Observer = {
    val observation = observed(o,x,Render(r),Rendered)
    val f = frameValue(r)
    {...observation, originals: o.originals.append(f), copies: o.copies.append(f)}
  }
  pure def mutated(o: Observer, x: State, index: int): Observer = {
    val observation = observed(o,x,Mutate(index),Mutated)
    {...observation, copies: o.copies.replaceAt(index, {...o.copies.nth(index), mutation: o.copies.nth(index).mutation + 1})}
  }
  action init = all {
    s' = empty,
    audit' = initialObserver(empty),
  }
  action warmCacheInit = all {s' = warm, audit' = initialObserver(warm)}
  action render(r: Request): bool = all {supported(r), s' = sampled(s,r), audit' = rendered(audit,s,r)}
  action invalid(r: Request): bool = all {
    not(valid(r)), s' = s, audit' = observed(audit,s,Render(r),InvalidInput),
  }
  action unknown(r: Request): bool = all {
    valid(r), not(admitted.contains(r.artifact)), s' = s, audit' = observed(audit,s,Render(r),UnknownArtifact),
  }
  action unsupported(r: Request): bool = all {
    valid(r), admitted.contains(r.artifact), not(assemblies.contains(r.artifact)),
    s' = s, audit' = observed(audit,s,Render(r),UnsupportedFrame),
  }
  // A sampling failure happens AFTER compilation but BEFORE cache insertion.
  action failSample(r: Request): bool = all {
    supported(r), s' = failedSample(s,r), audit' = observed(audit,s,FailSample(r),SampleFailed),
  }
  action mutate(index: int): bool = all {
    index >= 0, index < audit.copies.length(), s' = s, audit' = mutated(audit,s,index),
  }

  val cacheBounded = s.cache.length() <= 32 and s.cache.foldl(Set(), (ids,id) => ids.union(Set(id))).size() == s.cache.length() and
    s.cache.foldl(Set(), (ids,id) => ids.union(Set(id))).subseteq(assemblies)
  val passive = s.evaluations == audit.before.evaluations and s.evaluations == 0 and
    s.records == audit.before.records and s.receipts == audit.before.receipts
  val refusalUnchanged = not(Set(InvalidInput,UnknownArtifact,UnsupportedFrame).contains(audit.outcome)) or
    (s == audit.before and audit.originals == audit.beforeOriginals and audit.copies == audit.beforeCopies)
  val cachePolicy = match audit.command {
    | Render(r) => if (audit.outcome == Rendered) s == sampled(audit.before,r) else s == audit.before
    | FailSample(r) => s == failedSample(audit.before,r) and s.cache == audit.before.cache
    | _ => s == audit.before
  }
  val dimensions = audit.originals.foldl(Set(), (frames,f) => frames.union(Set(f))).forall(f => f.owners == f.key.budget and
    f.points == 4*f.owners and f.normals == 3*f.owners and f.ridges == f.key.crests and
    f.owners >= 4000 and f.owners <= 24000 and f.ridges >= 2 and f.ridges <= 4 and
    f.key.phase >= -1000000000 and f.key.phase <= 1000000000)
  val deterministic = audit.outcome != Rendered or (match audit.command {
    | Render(r) => audit.beforeOriginals.indices().forall(i =>
      audit.beforeOriginals.nth(i).key != key(r) or audit.beforeOriginals.nth(i) == audit.originals.nth(audit.originals.length()-1))
    | _ => false
  })
  val detached = audit.originals.length() == audit.copies.length() and
    audit.originals.foldl(Set(), (frames,f) => frames.union(Set(f))).forall(f => f.mutation == 0) and (match audit.command {
      | Mutate(index) => audit.originals == audit.beforeOriginals and s == audit.before and
        audit.copies.indices().forall(i => if (i == index)
          audit.copies.nth(i) == {...audit.beforeCopies.nth(i), mutation: audit.beforeCopies.nth(i).mutation + 1}
          else audit.copies.nth(i) == audit.beforeCopies.nth(i))
      | _ => true
    })
  val successfulAppend = audit.outcome != Rendered or (match audit.command {
    | Render(r) => audit.originals == audit.beforeOriginals.append(frameValue(r)) and
      audit.copies == audit.beforeCopies.append(frameValue(r))
    | _ => false
  })
  val safety = cacheBounded and passive and refusalUnchanged and cachePolicy and dimensions and
    deterministic and detached and successfulAppend

  val renderedWitness = audit.outcome == Rendered
  val hitWitness = audit.outcome == Rendered and s.compilations == audit.before.compilations
  val invalidWitness = audit.outcome == InvalidInput
  val unknownWitness = audit.outcome == UnknownArtifact
  val unsupportedWitness = audit.outcome == UnsupportedFrame
  val failedWitness = audit.outcome == SampleFailed
  val mutatedWitness = audit.outcome == Mutated
  val evictionWitness = audit.outcome == Rendered and audit.before.cache.length() == 32 and
    s.cache != audit.before.cache

  action step = {
    nondet id = 1.to(35).oneOf()
    nondet phase = Set(-1000000001,-1000000000,0,1,1000000000,1000000001).oneOf()
    nondet budget = Set(3999,4000,12000,24000,24001).oneOf()
    nondet crests = Set(1,2,3,4,5).oneOf()
    nondet shape = Set(Normal,Defaults,FractionalBudget,FractionalCrests,NonfinitePhase,ExtraOption).oneOf()
    val r = {artifact:id, phase:phase, budget:budget, crests:crests, shape:shape}
    any {render(r), invalid(r), unknown(r), unsupported(r), failSample(r), mutate(0)}
  }
  // A valid-call workload gives the full-capacity witness practical coverage.
  action cacheStep = {
    nondet id = assemblies.oneOf()
    any {render(request(id,0,4000,2)), failSample(request(id,0,4000,2))}
  }
}
