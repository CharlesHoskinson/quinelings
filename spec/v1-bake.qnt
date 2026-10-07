// Passive embedding bake for third-party renderers (Session.bake / traceOwners).
// Abstraction: a body is its owner-region layout (per component, the node index
// owning each u-region in order). anatomy.plan() reserves, per component, one
// sample per region and one per cap chart (2 per component), then distributes
// the remaining budget by area. Distributed owners are abstracted to a fixed
// deterministic rule; geometry, chroma and normalization are out of scope.
// Low budgets (< FRAME_BUDGET) are a strided subsample of the shared sampler
// at FRAME_BUDGET that keeps the whole reserved prefix. Quint tokens: node ids
// are ints >= 100; owner indices are positions in the task node list.
// Source correspondence: packages/agent-sdk/src/v1-bake.ts, anatomy.js plan().
module v1Bake {
  const MIN_BUDGET: int          // smallest accepted bake budget
  const FRAME_BUDGET: int        // smallest budget the shared sampler accepts
  const MAX_BUDGET: int
  const MAX_FRAMES: int
  const MAX_NODES: int
  const MAX_PARTS: int
  const MAX_REGIONS_PER_PART: int

  type Body = { nodeIds: List[int], parts: List[List[int]] }
  type Record = { artifact: int, trace: List[int] }
  type Store = { artifacts: int -> Body, records: int -> Record, evaluations: int }
  type Bake = { ok: bool, artifact: int, budget: int, frames: int, owners: List[int], indices: List[int] }
  type Traced = { ok: bool, record: int, owners: List[int] }

  var store: Store
  var prev: Store
  var last: str
  var out: Bake
  var traced: Traced

  pure val artifactIds = Set(1, 2)
  pure val recordIds = Set(1, 2)
  pure val emptyStore: Store = { artifacts: Map(), records: Map(), evaluations: 0 }
  pure val noBake: Bake = { ok: false, artifact: 0, budget: 0, frames: 0, owners: List(), indices: List() }
  pure val noTrace: Traced = { ok: false, record: 0, owners: List() }

  // ---- functional layer (mirrors anatomy.plan + v1-bake.ts selection) ----
  pure def nodeCount(b: Body): int = b.nodeIds.length()
  pure def regions(b: Body): List[int] = b.parts.foldl(List(), (acc, r) => acc.concat(r))
  // Per component: its regions, then its two cap charts (owners of u=0 and u=1).
  pure def reservedOwners(b: Body): List[int] =
    b.parts.foldl(List(), (acc, r) => acc.concat(r).concat(List(r[0], r[r.length() - 1])))
  pure def reservedCount(b: Body): int = reservedOwners(b).length()
  pure def plan(b: Body, budget: int): List[int] = {
    val rs = regions(b)
    reservedOwners(b).concat(range(0, budget - reservedCount(b)).foldl(List(), (acc, j) => acc.append(rs[j % rs.length()])))
  }
  pure def sourceBudget(budget: int): int = if (budget >= FRAME_BUDGET) budget else FRAME_BUDGET
  // Keep the reserved prefix, then K = budget - R strided picks from the D = S - R tail.
  pure def selection(b: Body, budget: int): List[int] = {
    val r = reservedCount(b)
    if (budget >= FRAME_BUDGET) range(0, budget)
    else {
      val k = if (budget > r) budget - r else 0
      range(0, if (budget < r) budget else r)
        .concat(range(0, k).foldl(List(), (acc, j) => acc.append(r + (j * (FRAME_BUDGET - r)) / k)))
    }
  }
  pure def bakeOwners(b: Body, budget: int): List[int] = {
    val source = plan(b, sourceBudget(budget))
    selection(b, budget).foldl(List(), (acc, i) => acc.append(source[i]))
  }
  pure def indexOf(l: List[int], x: int): int =
    range(0, l.length()).foldl(-1, (found, i) => if (found < 0 and l[i] == x) i else found)
  pure def validBody(b: Body): bool = and {
    b.nodeIds.length() >= 1, b.nodeIds.length() <= MAX_NODES,
    b.parts.length() >= 1, b.parts.length() <= MAX_PARTS,
    b.parts.foldl(true, (ok, r) => ok and r.length() >= 1 and r.length() <= MAX_REGIONS_PER_PART),
    regions(b).foldl(true, (ok, o) => ok and o >= 0 and o < nodeCount(b)),
    // validateOwners: every task node owns positive territory.
    range(0, nodeCount(b)).foldl(true, (ok, n) => ok and indexOf(regions(b), n) >= 0),
  }
  pure def canBake(s: Store, id: int, budget: int, frames: int): bool = and {
    s.artifacts.keys().contains(id),
    budget >= MIN_BUDGET, budget <= MAX_BUDGET, frames >= 1, frames <= MAX_FRAMES,
  }
  pure def strictlyIncreasing(l: List[int]): bool =
    range(1, l.length()).foldl(true, (ok, i) => ok and l[i - 1] < l[i])

  // ---- state machine ----
  action move(nextStore: Store, label: str, o: Bake, t: Traced): bool = all {
    store' = nextStore, prev' = store, last' = label, out' = o, traced' = t,
  }
  action init = all { store' = emptyStore, prev' = emptyStore, last' = "init", out' = noBake, traced' = noTrace }

  action compile(id: int, b: Body): bool = all {
    validBody(b), not(store.artifacts.keys().contains(id)),
    move({ ...store, artifacts: store.artifacts.put(id, b) }, "compile", noBake, noTrace),
  }
  // The only evaluating operation: retains a trace of executed node ids.
  action execute(rec: int, id: int, picks: List[int]): bool = all {
    store.artifacts.keys().contains(id), not(store.records.keys().contains(rec)),
    {
      val b = store.artifacts.get(id)
      val trace = picks.foldl(List(), (acc, p) => acc.append(b.nodeIds[p % nodeCount(b)]))
      move({ ...store, records: store.records.put(rec, { artifact: id, trace: trace }),
             evaluations: store.evaluations + 1 }, "execute", noBake, noTrace)
    },
  }
  action bake(id: int, budget: int, frames: int): bool = all {
    canBake(store, id, budget, frames),
    {
      val b = store.artifacts.get(id)
      move(store, "bake", { ok: true, artifact: id, budget: budget, frames: frames,
        owners: bakeOwners(b, budget), indices: selection(b, budget) }, noTrace)
    },
  }
  action refuseBake(id: int, budget: int, frames: int): bool = all {
    not(canBake(store, id, budget, frames)),
    move(store, "refuse", noBake, noTrace),
  }
  action traceOwners(rec: int): bool = all {
    store.records.keys().contains(rec),
    {
      val r = store.records.get(rec)
      val b = store.artifacts.get(r.artifact)
      move(store, "traceOwners", noBake,
        { ok: true, record: rec, owners: r.trace.foldl(List(), (acc, n) => acc.append(indexOf(b.nodeIds, n))) })
    },
  }

  action step = {
    nondet id = artifactIds.oneOf()
    nondet rec = recordIds.oneOf()
    nondet nodes = 1.to(MAX_NODES).oneOf()
    nondet partCount = 1.to(MAX_PARTS).oneOf()
    nondet ra = 1.to(MAX_REGIONS_PER_PART).oneOf()
    nondet rb = 1.to(MAX_REGIONS_PER_PART).oneOf()
    nondet shift = 0.to(MAX_NODES).oneOf()
    nondet budget = 0.to(MAX_BUDGET + 1).oneOf()
    nondet frames = 0.to(MAX_FRAMES + 1).oneOf()
    nondet p0 = 0.to(MAX_NODES).oneOf()
    nondet p1 = 0.to(MAX_NODES).oneOf()
    val counts = range(0, partCount).foldl(List(), (acc, i) => acc.append(if (i % 2 == 0) ra else rb))
    val starts = range(0, partCount).foldl(List(0), (acc, i) => acc.append(acc[i] + counts[i]))
    val parts = range(0, partCount).foldl(List(), (acc, i) =>
      acc.append(range(starts[i], starts[i] + counts[i]).foldl(List(), (rs, k) => rs.append((k + shift) % nodes))))
    val ids = range(0, nodes).foldl(List(), (acc, i) => acc.append(100 + (i * 7 + shift) % 97))
    any {
      compile(id, { nodeIds: ids, parts: parts }),
      execute(rec, id, List(p0, p1)),
      bake(id, budget, frames),
      refuseBake(id, budget, frames),
      traceOwners(rec),
    }
  }

  // ---- properties ----
  // Bake, its refusal and trace mapping never evaluate and never mutate the session.
  val passive = Set("bake", "refuse", "traceOwners").contains(last) implies store == prev
  val onlyRunEvaluates = store.evaluations - prev.evaluations == (if (last == "execute") 1 else 0)
  val bakeSound = out.ok implies {
    val b = store.artifacts.get(out.artifact)
    and {
      out.budget >= MIN_BUDGET, out.budget <= MAX_BUDGET,
      reservedCount(b) <= out.budget,                       // the floor covers every reservation
      out.owners.length() == out.budget,
      out.indices.length() == out.budget,
      strictlyIncreasing(out.indices),
      out.indices.foldl(true, (ok, i) => ok and i >= 0 and i < sourceBudget(out.budget)),
      out.owners.foldl(true, (ok, o) => ok and o >= 0 and o < nodeCount(b)),
      range(0, nodeCount(b)).foldl(true, (ok, n) => ok and indexOf(out.owners, n) >= 0),  // every node is visible
      out.owners == bakeOwners(b, out.budget),               // deterministic in (body, budget)
    }
  }
  val traceSound = traced.ok implies {
    val r = store.records.get(traced.record)
    val b = store.artifacts.get(r.artifact)
    and {
      traced.owners.length() == r.trace.length(),
      range(0, r.trace.length()).foldl(true, (ok, i) => ok and traced.owners[i] >= 0
        and traced.owners[i] < nodeCount(b) and b.nodeIds[traced.owners[i]] == r.trace[i]),
    }
  }
  val safety = passive and onlyRunEvaluates and bakeSound and traceSound

  // Witnesses (reachability, use with --witnesses).
  val lowBudgetBake = out.ok and out.budget < FRAME_BUDGET
  val floorBake = out.ok and out.budget == MIN_BUDGET
  val tightFloorBake = out.ok and out.budget == MIN_BUDGET and reservedCount(store.artifacts.get(out.artifact)) == MIN_BUDGET
  val directBake = out.ok and out.budget >= FRAME_BUDGET
  val refusedBake = last == "refuse"
  val tracedRun = traced.ok and traced.owners.length() > 0
}

// Scaled instance: worst-case reserve is 2 parts * (2 regions + 2 caps) = 8 = MIN_BUDGET.
module v1BakeSmall {
  import v1Bake(MIN_BUDGET = 8, FRAME_BUDGET = 16, MAX_BUDGET = 20, MAX_FRAMES = 3,
    MAX_NODES = 3, MAX_PARTS = 2, MAX_REGIONS_PER_PART = 2).*
}

// Negative control: a floor below the worst-case reserve (8) must be caught.
module v1BakeUnsafeFloor {
  import v1Bake(MIN_BUDGET = 5, FRAME_BUDGET = 16, MAX_BUDGET = 20, MAX_FRAMES = 3,
    MAX_NODES = 3, MAX_PARTS = 2, MAX_REGIONS_PER_PART = 2).*
}
