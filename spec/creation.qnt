// Experimental creation lifecycle. Tokens abstract complete canonical source;
// they do not prove JSON parsing, English interpretation, or codec correctness.
module creation {
  type State = {
    revision: int, pendingRevision: int, responseApplied: bool,
    status: str, source: int, compiled: bool, bytes: int,
    record: int, emitted: int, executions: int, effects: int,
    children: int, energy: int, phase: int, lens: bool,
    authority: bool, childAuthority: bool,
    last: str, previousExecutions: int, previousEffects: int,
    previousChildren: int, guard: bool
  }
  var s: State
  pure val tokens = Set(1, 2, 3)
  action init = s' = {
    revision: 0, pendingRevision: -1, responseApplied: false,
    status: "empty", source: 0, compiled: false, bytes: 0,
    record: 0, emitted: 0, executions: 0, effects: 0,
    children: 0, energy: 8, phase: 0, lens: false,
    authority: false, childAuthority: false,
    last: "init", previousExecutions: 0, previousEffects: 0,
    previousChildren: 0, guard: false
  }
  def snapshot(kind: str): State = s.with("last", kind)
    .with("previousExecutions", s.executions)
    .with("previousEffects", s.effects)
    .with("previousChildren", s.children).with("responseApplied", false)
  action diagnose(status: str): bool = all {
    Set("clarify", "unsupported", "inconsistent").contains(status),
    s' = snapshot("diagnose").with("status", status)
      .with("compiled", false).with("record", 0).with("emitted", 0)
      .with("authority", false).with("lens", false)
  }
  // These booleans stand for the typed graph, ownership, gesture and source
  // admission checks. Their JavaScript correspondence needs separate tests.
  pure def canBuild(source: int, bytes: int, typed: bool, owners: bool): bool =
    tokens.contains(source) and bytes > 0 and bytes <= 65536 and typed and owners
  action build(source: int, bytes: int, typed: bool, owners: bool): bool = all {
    canBuild(source, bytes, typed, owners),
    s' = snapshot("build").with("revision", s.revision + 1).with("pendingRevision", -1).with("status", "ready")
      .with("source", source).with("bytes", bytes).with("compiled", true)
      .with("record", 0).with("emitted", 0).with("authority", false)
      .with("lens", false)
  }
  action requestProposal = s' = snapshot("request").with("pendingRevision", s.revision)
  action proposalResponse(revision: int, source: int): bool = all {
    tokens.contains(source),
    s' = if (revision == s.revision and s.pendingRevision == s.revision)
      snapshot("response").with("status", "ready").with("compiled", true)
        .with("source", source).with("bytes", 100).with("record", 0)
        .with("emitted", 0).with("lens", false).with("authority", false)
        .with("pendingRevision", -1).with("responseApplied", true)
      else snapshot("response")
  }
  action cancelProposal = s' = snapshot("cancel").with("pendingRevision", -1)
  action reject = s' = snapshot("reject")
  action edit = s' = snapshot("edit").with("revision", s.revision + 1).with("pendingRevision", -1).with("status", "draft")
    .with("compiled", false).with("record", 0).with("emitted", 0)
    .with("authority", false).with("lens", false)
  // Recovery/import validates a candidate and never executes it.
  action recover(source: int, bytes: int, valid: bool): bool = all {
    tokens.contains(source), bytes > 0, bytes <= 65536, valid,
    s' = snapshot("recover").with("revision", s.revision + 1).with("pendingRevision", -1).with("status", "ready").with("compiled", true)
      .with("source", source).with("bytes", bytes).with("record", 0)
      .with("emitted", 0).with("authority", false).with("lens", false)
  }
  action view = s' = snapshot("view").with("phase", (s.phase + 1) % 4)
  action lens(show: bool): bool = s' = snapshot("lens")
    .with("lens", show and s.compiled and s.record == s.source and s.record != 0)
  action authorize(allowed: bool): bool = all {
    s.compiled, s' = snapshot("authorize").with("authority", allowed)
  }
  action execute(guard: bool): bool = all {
    s.compiled, s.energy > 0,
    s' = snapshot("run").with("executions", s.executions + 1)
      .with("effects", s.effects + (if (guard and s.authority) 1 else 0))
      .with("record", s.source).with("emitted", s.source)
      .with("guard", guard).with("energy", s.energy - 1)
  }
  pure def canCopy(s: State, candidate: int): bool =
    s.compiled and s.record == s.source and s.emitted == s.source
      and candidate == s.source and s.energy > 0 and s.children < 3
  // The eight-energy/three-child limits bound this exploration; the UI has no
  // session lineage cap. Actual per-run bounds and SDK store limits are tested
  // separately. External authority is distinct from embedded simulation flags.
  // Copy admission is distinct from the child's explicit run. Authority is
  // runtime context, excluded from the copied program source.
  action copy(candidate: int): bool = all {
    canCopy(s, candidate),
    s' = snapshot("copy").with("children", s.children + 1)
      .with("childAuthority", false).with("energy", s.energy - 1)
  }
  // Negative controls stay outside the safe step relation.
  action unsafeView = s' = snapshot("view").with("executions", s.executions + 1)
  action unsafeEdit = s' = snapshot("edit").with("compiled", false)
  action step = {
    nondet token = tokens.oneOf()
    nondet bytes = Set(1, 65536, 65537).oneOf()
    nondet ok = Set(false, true).oneOf()
    nondet ownerOK = Set(false, true).oneOf()
    nondet diagnosis = Set("clarify", "unsupported", "inconsistent").oneOf()
    nondet responseRevision = Set(s.revision, s.revision - 1).oneOf()
    any { requestProposal, proposalResponse(responseRevision,token), cancelProposal, diagnose(diagnosis), build(token, bytes, ok, ownerOK),
      recover(token, bytes, ok), edit, view, lens(ok), authorize(ok),
      execute(ok), copy(token), reject }
  }
  val sourceAdmission = not(s.compiled) or
    (tokens.contains(s.source) and s.bytes > 0 and s.bytes <= 65536 and s.status == "ready")
  val freshRecord = s.record == 0 or (s.compiled and s.record == s.source)
  val freshEmission = s.emitted == 0 or (s.compiled and s.emitted == s.source)
  val freshLens = not(s.lens) or (s.compiled and s.record != 0 and s.record == s.source)
  val passive = if (not(Set("run", "copy").contains(s.last)))
    s.executions == s.previousExecutions and s.effects == s.previousEffects
      and s.children == s.previousChildren else true
  val onlyRunEffects = if (s.last != "run") s.effects == s.previousEffects else
    s.effects == s.previousEffects + (if (s.guard and s.authority) 1 else 0)
  val onlyCopyChildren = if (s.last != "copy") s.children == s.previousChildren else
    s.children == s.previousChildren + 1 and not(s.childAuthority)
  val budgets = s.energy >= 0 and s.children >= 0 and s.children <= 3
    and s.energy + s.executions + s.children == 8
    and s.effects >= 0 and s.effects <= s.executions
  val safety = sourceAdmission and freshRecord and freshEmission and freshLens
    and passive and onlyRunEffects and onlyCopyChildren and budgets

  run build_does_not_executeTest = init.then(build(1, 65536, true, true))
    .expect(safety and s.executions == 0 and s.record == 0)
  run clarify_blocks_executionTest = init.then(diagnose("clarify"))
    .expect(not(s.compiled) and s.executions == 0)
  run source_edit_invalidatesTest = init.then(build(1, 100, true, true)).then(execute(false))
    .then(edit).expect(s.record == 0 and s.emitted == 0 and not(s.compiled))
  run recovery_is_passiveTest = init.then(recover(2, 100, true))
    .expect(safety and s.executions == 0 and not(s.authority))
  run copied_authority_is_emptyTest = init.then(build(1, 100, true, true))
    .then(authorize(true)).then(execute(true)).then(copy(1))
    .expect(safety and s.effects == 1 and not(s.childAuthority))
  run wrong_source_is_not_copyableTest = init.then(build(1, 100, true, true)).then(execute(false))
    .expect(not(canCopy(s, 2)))
  run boundary_overflow_is_rejectedTest = init
    .expect(not(canBuild(1, 65537, true, true)))
  run invalid_owners_are_rejectedTest = init
    .expect(not(canBuild(1, 100, true, false)))
  run late_response_rejectedTest = init.then(requestProposal).then(edit)
    .then(proposalResponse(0,1)).expect(not(s.responseApplied) and not(s.compiled))
  run cancelled_response_rejectedTest = init.then(requestProposal).then(cancelProposal)
    .then(proposalResponse(0,1)).expect(not(s.responseApplied) and not(s.compiled))
  run matching_response_is_passiveTest = init.then(requestProposal)
    .then(proposalResponse(0,1)).expect(safety and s.responseApplied and s.executions == 0)
  run detects_implicit_executionTest = init.then(unsafeView).expect(not(passive))
  run detects_stale_recordTest = init.then(build(1, 100, true, true)).then(execute(false))
    .then(unsafeEdit).expect(not(freshRecord))
}
