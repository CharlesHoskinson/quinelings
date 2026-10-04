# Beauty council: reference versus Quinelings

The council judges the original artwork, current homepage and archived gallery separately. Functional correctness is not evidence of comparable beauty.

## Evidence

- [Reference and ten homepage bodies](comparison.jpg).
- [Original and homepage phase filmstrips](motion-comparison.jpg).
- [Ten archived gallery families](gallery-comparison.jpg).
- [Capture settings](capture.json), full-size original stills and program phase frames in this directory.
- Original artwork: [@yuruyurau’s post](https://x.com/yuruyurau/status/2106393812830708078). The local reconstruction and original video were supplied by the existing research lab at `http://127.0.0.1:8047/tweet-reference/`.

Grades are subjective reviewer judgments. The original is one artwork; a library-variety score is not directly comparable. Sampled stills establish pose differences, not smooth playback or measured frame rates. Several Opus reviewers did not locate archive phase frames; their archive-motion scores are explicitly omitted or provisional, although the frames exist in this directory.

## Reviewers

Three GPT reviewers, three Gemini 3.1 Pro High through the authenticated AGY client, three Grok 4.7 at xhigh through native Grok, and three Claude Opus 5.5 High through native Claude. Two GPT reviewers were explicitly launched as Sol 6.1; the third reused an inherited Codex GPT agent whose exact backend was not exposed. That provenance is stated rather than asserting an independently confirmed model identity.

Reports are `sol-1.md` through `sol-3.md`, `gemini-1.md` through `gemini-3.md`, `grok-1.md` through `grok-3.md`, and `opus-1.md` through `opus-3.md`. Native status files record completion; raw CLI transcripts and private reasoning are not published.

## Integration constraints

Several proposals require correction before implementation. Changing `anatomy.js` deformation for already admitted sources would change the retained visual interpretation; it does not preserve the frozen behavior merely because the AST remains unchanged. Different geometry and gestures should be separately authored designs with new source identity, or use an explicitly introduced visual profile. A display-only brightness, projection or sampling improvement must remain labeled a view change. Light blended to white is not the exact opcode palette or the independent RGB byte genome.

The reference sampler produces two-dimensional coordinates; perceived depth does not establish a three-dimensional physical field. Higher particle counts alone cannot repair an undistinguished silhouette or small deformation range. Preserve the executable thought-to-operation-to-owned-tissue translation rather than substituting an unrelated animation for a successful task.

## Reproduce the capture set

Run the website and the existing local reference lab. `node scripts/capture-beauty-council.cjs` captures fixed phases with reduced motion and extracts the four original MP4 samples with ffmpeg. Set `QUINELING_SITE`, `QUINELING_REFERENCE` and `QUINELING_REFERENCE_VIDEO` for other locations. Standard Playwright module/browser environment overrides apply. Then `uv run --with pillow python scripts/beauty-contact-sheets.py` builds the comparison sheets from the retained full-size PNGs. The compiler and task evaluator are not used for homepage phase capture; the archived gallery compiles its baseline source during selection.
