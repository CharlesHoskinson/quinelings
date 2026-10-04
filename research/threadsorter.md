# Threadsorter

Threadsorter computes a usable ready-work queue from simulated job records. Its six-node DAG uses only the shared `literal`, `filter`, `sort`, `dedupe`, `length`, and `report` kernels. The result is one ordered output object containing the complete retained records and the queue count. The `moth` skin is a rendering family; computation comes from the graph.

Selection order is intentional: filter `status == "ready"`, stable sort by numeric priority descending, then deduplicate by `id`. Thus a blocked occurrence cannot suppress a ready occurrence, the highest-priority eligible duplicate wins, and equal-priority duplicates retain the earliest input record. Distinct jobs at equal priority retain their original arrival order. All original record fields survive.

Five exact-output fixtures cover mixed statuses and priorities, stable ties and duplicate retention, empty input, no eligible records, and filter-before-dedupe with priorities 10, 2, 0, and -2. Expected queues were written explicitly and checked independently using a selection loop that repeatedly extracts the first maximum-priority remaining record, then keeps the first occurrence of each ID. This does not rely on the shared runtime or its sort implementation.

Validation checks parse JSON, verify the bounded DAG and literal-only overrides, verify every expected output against the independent algorithm, and assert stable arrival order in the tie fixture. Root integrates execution through the shared runtime, constructor quine, gallery, and animation. No host code or shared files were changed.

Limitations: inputs are bounded simulated arrays of records with string `id` and `status` and finite numeric `priority`. This graph does not normalize or validate malformed records, age priorities, schedule dependencies, persist queues, dispatch jobs, or perform external actions. Deduplication chooses priority over recency. There are no effects or authority-bearing parameters. The contract supplies the algorithm semantics; no external research or copied program source was required.
