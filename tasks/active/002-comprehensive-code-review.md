# Task 002: Comprehensive Code Review + Performance Audit

**Status:** planning
**Created:** 2026-04-05

A full review of `index.html` covering correctness, maintainability, and performance. The game is now ~30KB+ of single-file vanilla JS — this is the right time to find structural problems before the codebase grows further.

---

## Options Considered

### Option A — Manual review only
Read through `index.html` section by section, annotate issues.
**Pros:** Fast, zero tooling.
**Cons:** Easy to miss performance issues that only appear at runtime.

### Option B — Manual review + runtime profiling
Manual review + open game in Chrome DevTools, record a 30-second gameplay session, analyze flame graph for hot functions.
**Pros:** Catches actual runtime bottlenecks (e.g. per-frame allocations, expensive draw calls).
**Cons:** Requires Chrome DevTools access; some findings may need multiple iterations.

### Option C — Static analysis only (ESLint / code metrics)
Run automated linting tools, report issues.
**Pros:** Exhaustive on syntax/style issues.
**Cons:** Won't catch Three.js-specific perf issues like geometry reuse, draw call count, or per-frame object allocation.

**Chosen: Option B** — manual review (most important for Three.js correctness) plus a targeted runtime check using the Chrome MCP to pull console + network requests for obvious red flags. Full DevTools flame graph is a nice-to-have; the manual review is the core deliverable.

---

## Review Areas

### Correctness
- Memory leaks: are Three.js geometries/materials/textures disposed when players disconnect or spells expire?
- Event listeners: any listeners added without corresponding removeEventListener?
- WebSocket: does the reconnection logic handle edge cases (server restart mid-game)?
- Spell system: do all projectile types clean up their trail lines and impact lights?
- Portal: does the portal enter/exit logic handle the case where the jam site is unreachable?

### Performance (Three.js specific)
- **Draw calls**: every `new THREE.Mesh()` is a draw call. Are static dungeon meshes merged into a single BufferGeometry?
- **Per-frame allocations**: any `new THREE.Vector3()` or `new THREE.Quaternion()` inside `update()` or the animation loop? These should be module-level constants reused with `.copy()` / `.set()`.
- **Texture reuse**: are procedural canvas textures created once and cached, or recreated on each call?
- **PointLight count**: how many active PointLights at once? Each one has shadow calculation cost even without shadow maps.
- **Minimap redraws**: drawn every 3rd frame — is the canvas context `clearRect` properly scoped?
- **AnimationMixer updates**: is `mixer.update(dt)` called for every remote player every frame, even offscreen ones?

### Maintainability
- Functions longer than ~80 lines should be broken up
- Magic numbers should be named constants
- Any dead code paths (old commented logic, unused variables)?
- Naming: any misleading variable names or unclear abbreviations?

### Mobile / Touch
- Are touch event listeners passive where possible (scroll performance)?
- Any `preventDefault()` calls that might block browser gestures?

---

## Success Criteria

1. Written report listing every issue found, categorized by severity: Critical / High / Medium / Low
2. At least the Critical and High items have suggested fixes written out
3. A recommended prioritized action list (what to fix first)
4. No code changes made — this is review only

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1. Report completeness | Every major system in index.html has at least one review note |
| 2. Fixes are actionable | Each Critical/High item has a specific code location + suggested change |
| 3. Prioritized list | Items are ranked by impact vs. effort |
| 4. No code changes | `git diff` on index.html shows no changes |

---

## Plan

1. Read `index.html` in full — top to bottom, system by system
2. For each system, fill in the review areas checklist above
3. Open the game in Chrome MCP, check console for runtime warnings
4. Write the findings report as `tasks/done/002-code-review-report.md`
5. Highlight top 3 Critical/High items the user should prioritize
6. Commit the report (no code changes, no deploy)
