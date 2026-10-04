# Quinelings — Living Thoughts

QDL 1 defines the stable, bounded declared-thought profile. SDK 1.0.0 exposes it through the explicit `@quinelings/agent-sdk/v1` entry point and its schema, MCP, A2A and migration adapters. The legacy/default SDK and ranch collaboration policies remain experimental.

Release `qdl-v1.0.0` retains a complete tracked source archive, matching SDK tarball, registry manifest and SHA-256 checksums in `qdl-v1.0.0/`. The source archive includes exact legacy/v1 source and genome goldens, migration fixtures, tests, normative docs and Lean/Quint models. Install the retained SDK tarball rather than assuming an npm publication exists.

Run `sha256sum -c SHA256SUMS` inside the release directory, then `node scripts/verify-v1-release.cjs` from the source checkout. The latter compares retained interpreter bytes with the frozen registry, confirms required fixtures and checks the website SDK archive matches. Content hashes detect changed bytes; they do not authenticate an author.

Tags and retained assets must never be moved or replaced. Corrections require a new release and an explicit compatibility decision. A future runtime must support and test the exact old pin or refuse it. [The upgrade policy](../docs/QDL-V1-UPGRADES.md) describes matching-runtime inspection and reviewed construction of a new artifact without rewriting historical source identity.

Supported acceptance environments: Node 22.23.3, Node 26.10.0 and Chromium 153.0.8010.12. Evaluation is deterministic local computation with simulation-only effects in a single-owner memory Session. Shared-host authentication, durable storage and live-world dispatch are integration responsibilities. Lean/Quint establish their documented model claims; finite conformance checks do not prove the entire JavaScript implementation.
