# Wayfinder

Wayfinder computes an unweighted shortest route through simulated streets from
`depot` to `clinic`. Its five-node DAG uses only `literal`, `bfs`, and `report`.
The second BFS computes the useful boundary condition of staying at the origin:
an open origin has a one-node path and zero distance; a blocked origin fails.
The skin uses the assigned `comet` family. There are no action nodes or external
effects. The shared runtime supplies the constructor quine and animation.

## Fixtures and findings

- Bridge closed: depot → arcade → library → square → clinic, four edges.
- All streets open: depot → river → bridge → clinic, three edges.
- Bridge and square closed: the clinic is unreachable, with empty path and null
  distance; this differs from a successful zero-edge trip.
- An isolated, open depot: the same-start-goal query succeeds immediately even
  though no destination route exists.
- Two equal three-edge routes: `arcade` precedes `river` in the depot adjacency
  array, so the arcade/square route wins deterministically.
- Depot closed: both queries fail, including same-start-goal.

Expected outputs were calculated independently with an offline Python
`collections.deque` traversal and compared against every fixture. JSON parsing,
node references, topological input order, literal-only overrides, and opcode
allowlisting were checked locally. Runtime integration remains the root agent's
responsibility because the shared kernel was not present during authoring.

## Limits

Distances count edges, not travel time. Streets are adjacency lists; the supplied
maps are symmetric, but the kernel may also represent directed routes. Closures
block entire nodes, not individual roads. Start and goal are fixed kernel
parameters; literal overrides change the map and closures only. Map updates are
simulated fixture inputs and do not reflect live traffic or grant navigation
authority. No kernel extensions are needed. No external sources were consulted.
