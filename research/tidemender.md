# Tidemender

Owns `programs/tidemender.json`; uses the shared constructor/runtime without adding host code. The `nautilus` family provides its bounded animation body. The graph performs useful dependency scheduling and reports the full parallel timeline, task count, and whether completion fits a 14-hour work window.

## Computation and independent fixture derivation

For every job, earliest start is the maximum finish time among its dependencies (zero for a root); finish is start plus duration. Makespan is the maximum finish, or zero for no work. Expected schedules were independently calculated by a recursive Python dependency evaluator, then ordered with stable first-ready selection in input order. JSON parsing and graph/fixture invariants were checked separately. Runtime integration and constructor-quine verification belong to the root agent.

- `branching-repair`: survey and intake run in parallel; frame and seals branch from survey; assemble joins frame, seals, and intake; inspect follows assemble. Finishes are 3, 2, 7, 5, 12, 13. Makespan 13, within window.
- `late-intake-misses-window`: intake takes 20 hours. Assemble waits until hour 20, finishes at 25, and inspection finishes at 26. The window check fails without dropping tasks.
- `empty-work-order`: empty order and timeline, zero tasks, makespan zero, within window. No synthetic job is created.
- `zero-duration-dependency-branches`: all tasks except two-hour assembly have zero duration. All dependencies still constrain the stable order; inspection starts and ends at hour 2. Makespan 2.

Default scheduling order is survey, intake, frame, seals, assemble, inspect. Starts are 0, 0, 3, 3, 7, 12. This demonstrates both a branching dependency graph and a join whose start must consider every incoming dependency.

## Limits

The schedule assumes unlimited parallel workers and no resource contention, travel, setup, or calendar restrictions. Durations use consistent abstract hours; there is no clock or external execution. The 14-hour comparison threshold is a canonical graph parameter. Cycles and dangling dependencies must be rejected by the shared kernel and are deliberately excluded from expected-success fixtures. No external sources, credentials, network operations, or live effects are needed.
