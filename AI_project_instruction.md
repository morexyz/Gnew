# Gnew Immersive Web Experience — AI Project Instructions

## Product and presentation boundaries
This is the **Gnew** public-facing concept experience, a self-contained HTML/CSS/JavaScript scrollytelling website. Gnew remains under development, and is separate from EchoDollar. Do not disclose proprietary trading algorithms, token/contract addresses, implementation mechanics, credentials, simulated profitability, or any unpublished financial strategy. Gnew makes no profit, yield, or loss-protection promises. Conceptual dashboard and graphic flows do not represent market data, transactions, wallet connectivity, or a released product.

## Architecture
- Native browser ES Modules with a static server, Vanilla JS, zero runtime dependencies and no build. Single HTML document contains all indexable/readable copy and supports progressive enhancement.
- Hash-anchor chapter navigation (e.g. `/#custody`). No slide router and no page-per-chapter presentation. Standalone `.html` pages may coexist outside the SPA; main website uses a single client-controlled scroll narrative.
- MVC feature separation for `src/features/journey` and `src/features/portfolio`: model (state/constants), view (DOM output), controller (events). Other small interactive features use their own controller and DOM views: automation, complexity, gold, custody, transparency, risks. Do not couple features directly; use the event bus.
- `src/app.js` bootstrap and feature activation. `src/config.js` capability flags and performance limits. `src/core/` router, event bus and capability detection.
- `src/animation/engine.js` common RAF scheduler and WAAPI animation/sequence APIs; `scroll.js` passive events, requestAnimationFrame-batched updates, IntersectionObserver entrance effects and native scroll timeline enhancement. Avoid permanent RAF for scrolling.
- `src/animation/svg.js` compatible-path morphing, stroke drawing, trusted masks. `src/animation/canvas.js` reusable high-DPI limited 2D surface.
- `src/visuals/experience-canvas.js` dynamically imported only when scenes enter view: hero gold particle field, interactive noise field, fluid-*inspired* incompressible particle advection illustration, blockchain trace ripples. Capped DPR/particle counts, paused when hidden or reduced motion. The fluid visual is *not* a physical Navier–Stokes simulation.
- `src/workers/field-worker.js` dynamically activated browser Worker for noise field calculations; main-thread fallback. `src/feedback/audio.js` WebAudio microtones after explicit user consent (toggle defaults off).
- Responsive assets: `assets/css/base.css`, `experience.css`, `motion.css`, `next.css`. Use CSS Grid/Flexbox, transform/opacity, semantic labels, proper contrast and reduced-motion support.

## Experience mapping
1. Hero: large type, metallic CSS orb, lazily mounted particle Canvas, scroll cue.
2. The shift: slider manipulates visual-only noise Canvas (worker-computed if available). No market implication.
3. Intelligence: high-level observe/rules/execute sequence, SVG stroke and WAAPI sequencer with replay. Do not reveal actual algorithm.
4. Digital gold: compatible SVG path morph (bar → token), SVG mask and animated highlights.
5. Self-custody: touch/pen/mouse Pointer Events incl. pressure, tilt and two-finger zoom, plus accessible click demo and range alternative, fluid-inspired flow Canvas. No live wallet connection.
6. Five-step journey: Model–View–Controller step selection and navigation.
7. Portfolio: accessible tab component and unmistakably illustrative demo dashboard; never use fabricated returns or real market data.
8. Transparency: interactive on-chain lifecycle explainer with trace Canvas.
9. Technology and benefits: semantic architecture *concept*, responsive layered art, focused user promises (not guarantees).
10. Vision and risk: scrolling kinetic type, risk accordions and plain-language disclaimers, accessible finale.

## Lifecycle and constraints
Features/capabilities are in `src/config.js` and `src/core/capabilities.js`. A capability must degrade gracefully if unavailable. Canvas scenes are created lazily, run only in/near viewport, pause on motion-off/hidden tab and stop when out of view. Maintain a single shared RAF scheduler for active scene drawing. Limit Canvas device pixel ratio and frame rate. Scroll state only schedules a frame if dirty. Users can disable motion. Audio is off until explicitly enabled. Never automatically request wallet permissions, connect to a wallet, run blockchain transactions or claim live data.

## Running and testing
Run `python3 -m http.server 8000` from the folder and visit `http://localhost:8000/`. Native ES Modules require an HTTP static server. `node --test tests/*.test.mjs` runs unit tests. To verify syntax: `find src -name "*.js" -exec node --check {} \;`. No npm dependencies or bundler required for the modular source.

A self-contained `Gnew_Immersive_Standalone.html` export embeds the authored CSS and JS so it can be opened directly without server. The export is derived from source modules; do **not** hand-edit it independently. For the standalone export, the optional worker is created with a local Blob URL because module file paths are not available in that one-file version. The original source `index.html` continues to use real native ES Module imports.

## Decisions and warnings
- 2026-10-19: Replaced 15-slide deck with 14 connected narrative chapters in one scrollable webpage at user's request. Retained relevant engine, SVG, event bus, and MVC model code from previous version, but replaced slide-specific navigation and views. No external dependencies or backend.
- Automation sequence is conceptual. Never show token addresses, quote formulas, trade mechanics or secret strategy.
- Do not claim that "noncustodial" eliminates approval/smart-contract risk. Always retain the risk section and release-status banners.
- The worker noise field and fluid illustration are *visual metaphors*, not financial calculations or physically exact fluid solvers.
- Always re-run responsive and interactive browser smoke tests after changing layout/components.

## Next Experience milestone — 2026-10-19 (tested)
- Added complete EN / FA language switching with proper `dir="rtl"`, localized authored static copy, browser metadata, ARIA labels, and dynamic MVC feature states. Existing English HTML remains the no-JavaScript accessible fallback; Persian requires JavaScript. `?lang=fa` and `?lang=en` override stored language; selection persists with guarded `localStorage`. CSS uses system Arabic fallback fonts—no network font dependency. Do not replace authored English source copy without updating `src/i18n/fa.js`.
- Added `src/i18n/i18n.js` text-node and attribute translator; preserve original English text for round-trip toggling. Controllers changing text nodes must emit `copy:refresh` or `ui:select`, or call the localized view renderer. The language system does not rely on observers scanning every DOM mutation.
- New `#gold-lab` (after vision, before risks): true lazy-load `src/visuals/gold-reactor.js`, a native WebGL1 raymarching fragment shader with Canvas2D/CSS fallback. A conceptual visual metaphor only, NOT a true photorealistic simulation, CFD solver, market model or wallet visualization. Cap resolution to ~850k fragment pixels, cap drawing to ~25 fps, stop offscreen, on motion-off and hidden tabs. Modes: heritage/intelligence/freedom (`src/features/resonance` MVC), visual energy and pause. No external runtime libraries.
- Hero `src/features/hero/controller.js` adds input-driven optical depth without continuous RAF; movement respects reduced motion. `src/features/compass/controller.js` adds a semantic, locale-aware desktop chapter compass based on existing chapter-enter events. Mobile keeps original navigation.
- `src/config.js` has `goldReactor` feature flag. Disable to avoid loading GPU path; the content remains readable. `scripts/build-standalone.py` is an optional stdlib-only export pipeline, not required for normal HTTP-hosted ESM source. Regenerate standalone via `python3 scripts/build-standalone.py` and NEVER hand-edit the generated file.
- New tests in `tests/next.test.mjs` cover bilingual structure, model bounds, dictionary coverage of dynamic copy, and GPU graceful-fallback source. All nine Node tests passed. Standalone Chromium smoke testing via content injection covered 1440px and 390px widths, both language directions, Gold Lab mode/pause, MVC journey/dashboard and transaction trace; no page errors and no horizontal overflow. Localhost/file navigation is blocked in this execution environment. Software Chromium has no WebGL context, so the Canvas fallback is verified, not the WebGL shader's rendered appearance. Test on real WebGL-enabled desktop/mobile browsers before publication.
- Keep financial risk wording, non-custodial approval caveats, development status, and illustrative UI labels. No external calls, wallet connections, proprietary strategy exposure or yield claims were introduced.
