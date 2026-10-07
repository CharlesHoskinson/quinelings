// Scenario tests for spec/v1-bake.qnt. Run: quint test spec/v1-bake_test.qnt --main=v1BakeTest
module v1BakeTest {
  import v1Bake(MIN_BUDGET = 8, FRAME_BUDGET = 16, MAX_BUDGET = 20, MAX_FRAMES = 3,
    MAX_NODES = 3, MAX_PARTS = 2, MAX_REGIONS_PER_PART = 2).* from "./v1-bake"

  // Real anatomy.js domain: <= 16 components, <= 128 owner regions, 2 cap charts per
  // component (spine root/tip, chamber north/south). The SDK floor is 512; frame() is 4000.
  pure val REAL_MAX_COMPONENTS = 16
  pure val REAL_MAX_OWNERS = 128
  pure val REAL_FLOOR = 512
  pure val REAL_FRAME_FLOOR = 4000
  run realFloorCoversWorstReserveTest = all {
    assert(REAL_MAX_OWNERS + 2 * REAL_MAX_COMPONENTS == 160),
    assert(REAL_MAX_OWNERS + 2 * REAL_MAX_COMPONENTS <= REAL_FLOOR),
    assert(REAL_FLOOR < REAL_FRAME_FLOOR),
  }

  pure val worst: Body = { nodeIds: List(100, 107, 114), parts: List(List(0, 1), List(2, 0)) }
  run worstReserveIsTightTest = all {
    assert(validBody(worst)),
    assert(reservedCount(worst) == 8),
    assert(bakeOwners(worst, 8) == reservedOwners(worst)),
    assert(selection(worst, 8) == range(0, 8)),
  }
  run subsampleKeepsSharedSamplesTest = {
    val source = plan(worst, FRAME_BUDGET)
    val sel = selection(worst, 11)
    all {
      assert(sel == List(0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 13)),
      assert(bakeOwners(worst, 11) == sel.foldl(List(), (acc, i) => acc.append(source[i]))),
      assert(strictlyIncreasing(sel)),
    }
  }
  run directBudgetIsTheSamplerTest = assert(bakeOwners(worst, 18) == plan(worst, 18))
  run uncoveredNodeIsInvalidTest = assert(not(validBody({ nodeIds: List(100, 107, 114), parts: List(List(0, 1)) })))

  run bakeIsPassiveScenarioTest =
    init
      .then(compile(1, worst))
      .then(execute(1, 1, List(2, 1)))
      .then(all { bake(1, 8, 2), assert(store.evaluations == 1) })
      .then(all { assert(safety), assert(out.ok), assert(store == prev), traceOwners(1) })
      .then(all { assert(safety), assert(traced.owners == List(2, 1)), assert(store.evaluations == 1),
                  refuseBake(1, 7, 2) })
      .expect(safety and not(out.ok) and store == prev and last == "refuse")
}
