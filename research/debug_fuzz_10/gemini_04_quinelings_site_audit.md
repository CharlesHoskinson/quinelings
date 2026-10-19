# Gemini Debugging & Fuzzing Agent 4: Quinelings Site HTML, `<canvas>` Renderer & Runtime Bundle Audit

**Target Repository**: `/home/charles/repos/quinelings`  
**Cross-Server Target**: `/home/charles/sherlock-bench/server.js`  
**Audit Date**: 2026-10-19

---

## 1. Executive Summary

1. **Stale Runtime Bundle (`assets/ranch/quinelings-runtime.js`)**:
   - `assets/ranch/quinelings-runtime.js` was built prior to the Quinelings 2.0 mathematical & laminar flow commits (`20407b5`, `b2624fc`).
   - Rebuilding via `npm run ranch:build` brings `index.html`, `laboratory.html`, `ranch.html`, `ranch-workshop.html`, and `v1.html` onto the latest Quinelings 2.0 mathematics and `Chroma.OPCODE_ACCENTS`.
2. **WebGL1 vs 16-Bin Calligraphic Canvas2D (`lifeform-renderer.js` & `lifeform-webgl.js`)**:
   - In `lifeform-renderer.js:17`, `const gpu = woven && opts.gpu === true && root.LifeformWebGL?.available();` ensures the 16-bin depth-sorted, calligraphic 3-pass Canvas2D renderer (`b2624fc`) is used by default across `index.html`, `nursery.html`, `create.html`, and `laboratory.html`, while `lifeform-webgl.js` also gets safe fallback on `inks[owner]`.
3. **Serving `/quinelings/*` from `/home/charles/sherlock-bench/server.js`**:
   - Adding `/quinelings/` static routing and `.mp3` / `.wav` / `.map` / `.ttf` / `.tgz` MIME types to `server.js` allows opening every Quinelings page directly on `http://localhost:4377/quinelings/` alongside `/motion.html`, `/slideshow.html`, and `/`.
