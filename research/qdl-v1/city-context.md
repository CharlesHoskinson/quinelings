# Public Midnight City context for QDL v1

Retrieved 2026-10-04 at approximately 12:55 UTC using Scrapling Fetcher 0.4.15. The reproducible capture is `city-evidence.json`: per-resource URL, timestamp, HTTP status, response byte count, SHA-256 of the received body, bounded text excerpts and discovered links. Run `/tmp/midnight-scrapling-env/bin/python scripts/scrape-midnight-context.py` from the repository. Dependencies use the existing `scripts/requirements-scraping.txt` pin.

## What was observed

- The [public homepage](https://midnight.city/) is a JavaScript shell whose extracted text is only the City title. It does not directly expose an agent conversation or current thought stream.
- The homepage-discovered [main JavaScript asset](https://midnight.city/assets/index-JDqEnY20.js) contains user-interface copy for goal/checkpoint tracking, confirmed results, inventory, recipes, workstations and missing agent explanations. This is evidence of published UI/code vocabulary, not evidence that a particular agent executed a task. The bundle expressly separates agent-reported progress from world confirmation and warns that saved plans do not establish the current action's reason.
- The discovered [ActivityPage static asset](https://midnight.city/assets/ActivityPage-C3-F43Ao.js) is a Discord activity placeholder describing SDK wiring. Its name does not identify a public agent activity feed.
- The [official documentation index](https://midnight.city/docs/) links public gameplay and onboarding guides. The scraper followed only selected document links from that index.
- The [First Night onboarding guide](https://midnight.city/docs/connect-to-midnight-city/first-night/) describes short missions with observable finish conditions, grounded in current identity/location/needs/inventory/progress. It distinguishes observed state, testimony from other agents, suspicion and unresolved questions. Its illustrative ore-and-sale story is documentation guidance, not a captured live agent event.
- The [gathering guide](https://midnight.city/docs/gameplay/gathering-and-resources/) distinguishes source definitions from placed resource nodes; nodes have reservations, uses and availability. It describes travel, local assignment, reservation, timed work, atomic inventory application, release and depletion/regeneration. Inventory and progression should be read again after a confirmed cycle.
- The [crafting guide](https://midnight.city/docs/gameplay/crafting-and-workstations/) describes recipe inputs/outputs, skill requirements, valid workstation type/family, reachable workstations and inventory limits. Each batch commits separately; requested totals must not be reported as completed until the outcome establishes completion. A pending result requires further observation.
- The [economy and needs guide](https://midnight.city/docs/gameplay/economy-and-needs/) treats merchant offers as current data and distinguishes inventory crystal from wallet settlement. Crystal transfers require guards including owner allowance and recipient availability, and update both inventories together. Hunger comes from observed needs; food selection uses restoration value and a stable item-ID tie-break.

## Example agent-task requirements — inference, local simulations only

The following are engineering inferences from those public documents. They are examples for synthetic QDL fixtures, not extracted live thoughts, connected agent commands, or claims of City API compatibility.

| Task class | Bounded requirement | Useful fixture edge case |
| --- | --- | --- |
| Gather readiness | Select a source/node using supplied eligibility, reservation, availability and reachability observations; retain the observation version and reason for skipping. | A reserved/depleted node must yield no simulated gather receipt. |
| Craft readiness | Check supplied materials, level, workstation type/family and batch/output capacity; report feasible batches separately from requested and confirmed batches. | Three confirmed batches and a failed fourth must retain three committed results. |
| Mission checkpoints | Represent an explicit finish condition and confirm it with output evidence; explain unmet prerequisites without inventing lore. | A stored plan plus no result remains incomplete. |
| Testimony/evidence ledger | Preserve source and claim; distinguish observation, testimony, inference and unknown; avoid duplicate-source inflation. | Repeated testimony from one source does not become independent corroboration. |
| Route/resource selection | Find a reachable candidate and account for blocked paths and travel before assignment. | No reachable candidate must return a finite failure result. |
| Trade/budget preview | Use supplied current offers and inventory; separate predicted proceeds from confirmed settlement and check owner-defined limits. | An expired/absent offer or insufficient allowance skips the simulated effect. |
| Needs triage | Use supplied hunger/awake state and edible inventory; deterministic selection and a guarded local action. | Hunger zero or no food skips eating. |
| Outcome reconciliation | Handle completed, failed, pending and unknown distinctly; a bounded retry must stop on unknown rather than duplicate an action. | A pending/unknown settlement must not be resubmitted or called complete. |

These requirements fit finite observation records, deterministic guards, provenance labels, bounded loops and local simulated receipts. A closed executable program should carry its algorithm and explicit policy; observed world snapshots should be external inputs with provenance and freshness metadata. A reproduction cycle is not permission to make a new world action.

## Evidence boundaries and gaps

No user-visible live agent activity instance, identity, real task result, agent-authored public thought or private reasoning was collected. Static code and official guidance support domain requirements; they cannot establish current live world state. No login, token, session, private endpoint, world API, control-mode change, live mutation or external messaging was used. No JavaScript was executed. Selected public documentation can change, so examples should remain fixtures and avoid hardcoding current City prices, recipes or limits as language semantics.

The scraper caps requests at nine, per-request timeout at 12 seconds, the overall run at 120 seconds, accepted response bodies at 2 MB each / 5 MB total, and stored extracted text at 14,000 characters per document. It sends bounded HTTP Range requests and follows no redirects. **Transport limitation:** Scrapling buffers responses; a server can ignore Range before the script rejects an oversized body. These are accepted-body limits, not a guaranteed wire-byte cap. The observed run remained below all limits (eight requests, 1,917,579 bytes, no truncated document text). Hashes cover received payloads, including HTTP 206 bodies; they are capture fingerprints, not publisher signatures. Whole JavaScript bundles are not persisted; only short domain excerpts and discovery metadata are saved to avoid retaining unrelated configuration.

Publication note: the captured documentation text was reduced to 25-word excerpts for the committed evidence ledger. Original response hashes, sizes, retrieval times and links remain. Analysis above used the fetched documents; the ledger does not republish their full text. The scraper now applies the same stored-excerpt bound.
