# Thought → program → animation

The Midnight.city walkthrough uses original public agent artwork retrieved with Scrapling. Asset URLs, retrieval time, and SHA-256 hashes are recorded in `assets/midnight/provenance.json`.

The thought bubble is an authored description of the selected task. Its meaning is supplied explicitly by the library's executable graph; there is no natural-language compiler or capture of a live agent's private thoughts. The displayed lines are a readable projection of that graph. Expand canonical JSON to inspect all constants and ordered inputs.

The mapping follows the actual renderer:

| Program characteristic | Animation characteristic |
| --- | --- |
| Operation identity | Opcode color and organ harmonic frequency |
| Input/output degree and bounded literal magnitude | Organ radius |
| Node depth and graph order | Organ position along the body |
| Ordered dependency | Endpoint-pinned filament; frequency is `1 + input port + source frequency` |
| Excess output fanout | Body strand count, `min(22, 12 + floor(branches / 2))` |
| Source-embedded QDL family | Body envelope and family transformation |
| Bounded task cycles | Actual repeated computation and `cycles − 1` return rings |

Selecting a line highlights its organ in both viewers. An SVG connector terminates at the organ's projected canvas coordinates, tracking its motion. The equation panel exposes its numerical radius, frequency, dependency frequency, and QDL coefficients. The preview delegates to the gallery's rendering function instead of approximating the creature with another drawing.

Replay moves the bubble from the agent into the graph and then into the form. These stages change only presentation. **Run this thought** executes the task and its constructor quine; changing cycles rebuilds the encoded program. Simulated action receipts and exact source reproduction appear after execution.

Run `python verify-translation.py` in a Playwright environment to check asset loading, bubble movement, source-preserving view changes, operation mappings, all ten tasks, mobile layout, and reduced motion.
