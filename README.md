# Quinelings

**Living Thoughts**

[Open the live website](https://charleshoskinson.github.io/quinelings/).

Run `bash scripts/publish-pages.sh` to verify and publish the static application, program library, assets, and product documentation to `gh-pages`. GitHub Pages deploys that branch automatically. Publication first requires current private visual acceptance evidence; passing functional tests cannot supply it.

Quinelings are authored local programs with mathematical bodies. The homepage introduces agent tasks as mathematical creatures and demonstrates a route planner reacting to a bridge closure, reproducing its complete task/body source and running a fresh copy. An optional water lesson provides a smaller worked calculation. The [laboratory](laboratory.html) runs ten reusable QDL 1 recipes on supplied inputs; the [original gallery](gallery.html) preserves programs whose scenarios rewrite source. Both let you inspect a calculation and check exact source reproduction. Harmonic and RGB genomes preserve the complete source as recoverable data.

The body gives each program a visual index: select an operation to inspect its connections and the tissue it owns. On the homepage, a recorded run adds value labels to that anatomy. Gesture playback changes the pose without running the task. Different programs can look alike; exact identity comes from source bytes.


## Create new programs and connect agents

[Creation workspace](https://charleshoskinson.github.io/quinelings/create.html) · [TypeScript library and adapters](https://charleshoskinson.github.io/quinelings/sdk.html) · [Experimental ranch](ranch.html).

The experimental creation compiler accepts explicit bounded thought recipes or typed IntentIR and generates new graph-derived chamber/spine bodies with exact operation ownership. Build, inspection, animation and source recovery are passive; Run and verified-copy controls explicitly evaluate the source. A ProposalProvider interface lets an agent supply broader model-generated plans through the same compiler checks.

Agent SDK 1.0.0 at `packages/agent-sdk` exposes stable QDL 1 through `Session` from `@quinelings/agent-sdk/v1`, shared schemas, MCP and A2A. Download [the 1.0.0 package](assets/sdk/quinelings-agent-sdk-1.0.0.tgz). The original `Runtime` entry point remains legacy experimental. Install dependencies with `npm run sdk:install`, then `npm run sdk:check`. The published downloadable tarball works independently of this checkout. Start with the [QDL 1 SDK guide](docs/SDK-V1.md) and [language contract](docs/QDL-V1.md). Legacy experimental guides: [quickstart](docs/sdk-quickstart.md), [lifecycle](docs/sdk-lifecycle.md), [API reference](docs/sdk-api.md), [ranch](docs/SDK-RANCH-GUIDE.md), [MCP](docs/sdk-mcp-guide.md), [A2A](docs/sdk-a2a-guide.md).

The legacy experimental Runtime and adapters expose sixteen operations/tools. The ranch supports typed offspring previews, stateless body sampling, explicit keyed admission, session lineage and bounded reciprocal social commands. Admission and world ticks never run a task; Run remains explicit. Imported participation starts disabled. Source parent hashes are assertions, while session derivations retain the construction evidence. Original request keys and complete payloads resolve retained retries after transport loss.

Stable QDL 1 freezes the bounded declared-thought simulation profile and its reviewed registry pin. Legacy source profiles and ranch construction/social policies remain experimental. [Identity and upgrades](docs/QDL-V1-UPGRADES.md) explains matching interpreters, retained release artifacts and explicit authored upgrades. [Formal model obligations](docs/GENERATIVE-FORMAL-MODEL.md) distinguish Lean theorems, Quint exploration, implementation tests and work still to prove.

## Explore the lab and original gallery

No application dependencies or build step are required. From this repository:

```sh
python3 -m http.server 8048 --bind 127.0.0.1
```

Open http://127.0.0.1:8048 . Start with the homepage route example: find a route, close the bridge, inspect the changed route and reconstruct an independently runnable copy. The smaller water lesson is optional. The instructions and body stay the same. For input comparisons, source edits, retries, offspring and reconstruction, open the [laboratory](laboratory.html).

In the [original gallery](gallery.html), select a specimen and a task scenario, run its task, then reproduce a fresh generation. The scenario writes values into the program’s source. Changing task cycles also changes that source; walkthrough playback and trace replay do not execute it. Pause freezes both gallery viewers; Clear focus or Escape returns to the portrait. Recover the source from harmonic samples or exact RGB data, or download either genome.

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
| Pulsekeeper | Prepared outcome review with a fixed four-attempt cap | Torus |
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


The agent artwork was retrieved from public Midnight.city assets with Scrapling. `assets/midnight/provenance.json` records the original URLs, timestamps, and SHA-256 hashes. Reproduce the retrieval with a local environment using `scripts/requirements-scraping.txt` and `python scripts/scrape-midnight-agent.py`. The art represents an illustrative agent; the thought is the explicitly authored library task.

`python verify-translation.py` checks the bubble transition, linked source/organ/equation mapping, source-preserving view transitions, all ten programs, reduced motion, and mobile layout.

`node verify-morphology.cjs` checks all-family geometry, endpoint pinning, closed loops, pure source-preserving projection, and frame-rate independence. `python verify-motion.py` checks the shared browser clock, pause, dynamic reduced motion, organ selection, and recorded-trace identity. Set `QUINELINGS_URL` to the hosted `gallery.html` URL to check the archived gallery instead of its temporary local server.

`node verify-chroma.cjs` checks material ownership, quantitative scales, missing states, and pure color evaluation. `python verify-chromamapping.py` checks the colored collection, real recorded values, task-cycle selection, source invalidation, reproduction, and mobile layout.

## Stable QDL 1 · reusable Living Thoughts

The [QDL 1 workspace](https://charleshoskinson.github.io/quinelings/v1.html) opens the laboratory’s ten reusable recipes for declaration editing and named inputs. It links the public declaration, program nodes, source-owned body, run records and exact emitted constructor source. Runtime observations can change results without changing source or body.

The [stable QDL 1 contract](docs/QDL-V1.md), [standard library](docs/QDL-V1-LIBRARY.md), and [SDK 1.0.0 guide](docs/SDK-V1.md) document the stable local profile, typed inputs and supported boundaries. Legacy artifacts keep their identities and behavior; [explicit passive migration](qdl-v1-migrate.js) requires supplied declarations, types and chosen ports. Every effect remains a local simulation.

Stable QDL 1 uses explicit public declarations, not private model reasoning. Memory sessions and simulated receipts provide no durable hosting or live City authority. The release is identified as `qdl-v1.0.0`; npm publication is separate from the downloadable package.

The laboratory has its own checks: `npm run formal:website` explores source/input identity, atomic comparison retention and request counters; `npm run test:browser:website` checks actual outputs, trace changes, failed evaluations, passive recovery, replay, source edits and accessible mobile controls. Set `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if Playwright or an existing browser are installed outside normal Node resolution.

Generate five new task/body combinations with `node scripts/generate-quinelings.cjs`. Open `nursery.html` to view and run them, or open an individual artifact in the creation workspace. Use `--seed 2599264831` to reproduce the current batch; omitting the seed samples a new batch and replaces `programs/generated/`.


## Website

[Start here](https://charleshoskinson.github.io/quinelings/) introduces Quinelings through a water calculation. [Explore](https://charleshoskinson.github.io/quinelings/nursery.html) shows five mathematical constructions. The [field guide](https://charleshoskinson.github.io/quinelings/field-guide.html) explains controls, program-to-body mapping, units, mathematical parameters, and retained designs. Every example input has contextual help.

The website separates task execution from drawing: changing animation position, highlighting a step, or sampling geometry creates no task run. Input changes keep QDL 1 source intact; editing instructions or body design creates different source. Body colors identify operation roles or an explicitly selected recorded-value scale. Exact RGB genome data encodes the source separately.

Presentation follows [Impeccable](https://github.com/pbakaus/impeccable), with a shared layout and self-hosted, openly licensed typography. Renderer and sampler caches reuse geometric work without reducing source-owned sample counts or contour detail. The frozen language and SDK release remain unchanged.

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE).
