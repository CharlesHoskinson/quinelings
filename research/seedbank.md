# Seedbank

Seedbank computes a nursery's pooled seed withdrawal. Each input array entry is a requested tray count for one nursery batch; multiplying by six produces per-batch seed demand. Summing the demands and applying `budget(stock, requested)` yields the permitted withdrawal and retained reserve. The output ledger keeps the original inputs beside every computed quantity for inspection.

The eight-node DAG uses only `literal`, `map`, `sum`, `budget`, `get`, and `report`. The shared constructor owns source emission and generation verification. The `seed` skin is declarative; graph topology and kernel execution supply the computational structure. There are no effect nodes or live actions.

## Fixtures and conservation

Four exact fixtures cover surplus (100 stock, 72 demand, 72 allocated, 28 reserve), shortage (35 stock, 72 demand, 35 allocated, zero reserve), an empty request (all 100 stock retained), and empty stock (24 demand, zero allocated). Every fixture satisfies `allocated + reserve = stock`, `0 <= allocated <= stock`, and `allocated <= requested`. Empty demand uses the contract's `sum([]) = 0` behavior.

Expected outputs were calculated independently with Python arithmetic rather than copied from a kernel execution. Validation checks JSON parsing, unique node IDs, producer ordering, literal-only overrides, full ordered expected output equality, and conservation for each fixture.

## Limits

This is an aggregate planning ledger: it does not decide which nursery batch receives seeds during shortage, and a withdrawal can leave a tray partially supplied. Six seeds per tray is an illustrative planning constant, not horticultural advice. Fixtures use nonnegative whole seed and tray counts. The numerical kernels do not enforce integer tray counts; callers must supply sensible counts. Negative or nonfinite inputs are outside the intended domain; budget rejects negative totals, and the runtime rejects nonfinite numeric operations. Array size and graph bounds come from the shared contract. No external research or credentials were required, and no animation runtime or quine implementation was duplicated here.
