# Quinelings

[Open the live website](https://charleshoskinson.github.io/quinelings/).

Run `bash scripts/publish-pages.sh` to verify and publish the static application, program library, assets, and specifications to `gh-pages`. GitHub Pages deploys that branch automatically.

Quinelings are small executable programs with animated mathematical bodies. Their anatomy reflects program structure; finite harmonic bands and an exact RGB strand preserve the complete source. Each of the ten library programs runs a useful local task and constructs its own canonical source through quotation and ordinary constructors.

The creatures use continuous luminous curves, family-specific anatomy, and a shared elapsed-time motion clock. Pause freezes both viewers; Clear focus or Escape returns to the portrait. Recorded execution markers keep their identity when you inspect another operation. Twelve domain reviews informing this design are summarized in `research/aesthetics-review.json`.


## Create new programs and connect agents

[Creation workspace](https://charleshoskinson.github.io/quinelings/create.html) · [TypeScript library and adapters](https://charleshoskinson.github.io/quinelings/sdk.html) · [Experimental ranch](ranch.html).

The experimental creation compiler accepts explicit bounded thought recipes or typed IntentIR and generates new graph-derived chamber/spine bodies with exact operation ownership. Build, inspection, animation and source recovery are passive; Run and verified-copy controls explicitly evaluate the source. A ProposalProvider interface lets an agent supply broader model-generated plans through the same compiler checks.

The package at `packages/agent-sdk` exposes a typed Runtime, recursive intent schemas, an MCP stdio adapter and an A2A JSON-RPC/REST hookup. Install dependencies with `npm run sdk:install`, then `npm run sdk:check`. The published downloadable tarball works independently of this checkout. Guides: [quickstart](docs/sdk-quickstart.md), [lifecycle](docs/sdk-lifecycle.md), [API reference](docs/sdk-api.md), [experimental ranch](docs/SDK-RANCH-GUIDE.md), [MCP](docs/sdk-mcp-guide.md), [A2A](docs/sdk-a2a-guide.md).

The Runtime and adapters expose sixteen operations/tools. The ranch supports typed offspring previews, stateless body sampling, explicit keyed admission, session lineage and bounded reciprocal social commands. Admission and world ticks never run a task; Run remains explicit. Imported participation starts disabled. Source parent hashes are assertions, while session derivations retain the construction evidence. Original request keys and complete payloads resolve retained retries after transport loss.

QDL remains experimental; the compatibility marker and experimental package identifier do not freeze the language. [Formal model obligations](docs/GENERATIVE-FORMAL-MODEL.md) distinguish Lean theorems, Quint exploration, implementation tests and work still to prove.

## View the collection

No application dependencies or build step are required. From this repository:

```sh
python3 -m http.server 8048 --bind 127.0.0.1
```

Open http://127.0.0.1:8048 . The Midnight.city walkthrough moves an agent’s declared thought bubble into the executable graph, then shows the exact QDL equations and linked animation. Select a program line to highlight its organ. Changing thought cycles changes the actual program; translating or replaying alone does not execute it.

Select a specimen, choose a task fixture, run its task and quine, inspect the output, and reproduce a fresh generation. Recover the source from harmonic samples or exact RGB data, or download either genome.

Chromamapping gives each membrane stable color territories for six program roles. Under the selected portrait, choose **Program roles**, **Pearl study**, or an authored recorded-value lens. Lanternkeeper includes **Fault score**: select a scenario, run the task, and inspect its value on a fixed 0–1 scale with a 0.625 reference threshold. The task-cycle selector chooses an existing record; changing views never executes the program. Source edits clear previous values. Color recipes survive source reproduction and both genomes.


| Quineling | Computation | Family |
| --- | --- | --- |
| Lanternkeeper | Corroborated, guarded lamp repair decision | Filament |
| Wayfinder | Deterministic shortest route with blocked streets | Comet |
| Swarmwarden | Ordered allocation without overcommit | Coral |
| Echoweaver | Provenance-aware consensus and quorum | Jelly |
| Raincatcher | Weighted sensor fusion and bounded irrigation budget | Ribbon |
| Tidemender | Dependency-aware parallel scheduling | Nautilus |
| Memorybloom | Evidence support, refutation, and conflict | Bloom |
| Pulsekeeper | Bounded retries and uncertain outcomes | Torus |
| Threadsorter | Stable filtering, deduplication, and priority ordering | Moth |
| Seedbank | Six-seeds-per-tray demand and resource conservation | Seed |

## Design and language

[Formal QDL](docs/QDL.md) and its [Quint specification](spec/design.qnt) make the mapping rules machine-checkable. [Design language](docs/DESIGN-LANGUAGE.md) breaks down the visual reference and specifies anatomy, species, motion, density, and color. [Program contract](docs/PROGRAM-CONTRACT.md) defines task graphs and kernels. [Mapping](docs/MAPPING.md) defines source reproduction and the two reversible codecs. The visual inspiration is [@yuruyurau's mathematical sketch](https://x.com/yuruyurau/status/2106393812830708078); the library uses its own body formulas.

Tasks are finite dataflow graphs. Ports and input order are explicit; source parameters and literals affect execution. Every node fires once per cycle after its inputs are ready. `choose` selects already-computed values: every conditional action needs its own guard. The outer repeat operator has a finite 1–8 cycle budget. Rendering and trace replay do not execute tasks.

All action receipts are local simulations. This prototype does not connect to Midnight.city, reproduce a live City agent, or expose an LLM's hidden reasoning. The silhouette is a structural projection, not a source decoder. Recovery uses full numerical harmonic bands or exact RGB records, not screenshots or compressed video.

## Verify

With Node.js 22 or newer:

```sh
npm test
```

The suites check task fixtures, fresh constructor-quine generations, harmonic and RGB recovery, numerical sample inversion, invalid inputs, graph bounds, conservation, and failure controls. `library-verification.json` records all ten programs and their 53 fixtures. `research/language-audit.md` records the independent interpreter/codec review.

Formal model checks use Quint 0.33.0:

```sh
npm run formal
```

The model searches bounded transitions; it does not prove the JavaScript renderer or codec correct. Its abstraction and negative controls are documented in `research/formal-design.md`.

For optional browser checks, install Playwright in a local virtual environment and its Chromium browser, then run `python verify-browser.py`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` only when using an existing browser binary. The script creates and stops its own local server.

Twelve research agents contributed ten programs, the language audit, and the gallery. Their notes are in `research/`.

The agent artwork was retrieved from public Midnight.city assets with Scrapling. `assets/midnight/provenance.json` records the original URLs, timestamps, and SHA-256 hashes. Reproduce the retrieval with a local environment using `scripts/requirements-scraping.txt` and `python scripts/scrape-midnight-agent.py`. The art represents an illustrative agent; the thought is the explicitly authored library task.

`python verify-translation.py` checks the bubble transition, linked source/organ/equation mapping, source-preserving view transitions, all ten programs, reduced motion, and mobile layout.

`node verify-morphology.cjs` checks all-family geometry, endpoint pinning, closed loops, pure source-preserving projection, and frame-rate independence. `python verify-motion.py` checks the shared browser clock, pause, dynamic reduced motion, organ selection, and recorded-trace identity. Set `QUINELINGS_URL` to check a hosted website instead of its temporary local server.

`node verify-chroma.cjs` checks material ownership, quantitative scales, missing states, and pure color evaluation. `python verify-chromamapping.py` checks the colored collection, real recorded values, task-cycle selection, source invalidation, reproduction, and mobile layout.
