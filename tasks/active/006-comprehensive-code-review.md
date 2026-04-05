# Task 006: Comprehensive Code Review + Performance Audit

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — expanded to cover all three options (A+B+C)

A full review of `index.html` covering correctness, maintainability, and runtime performance. The game is now a ~30KB+ single-file vanilla JS app — the right time to find structural problems before the codebase grows further. This task produces a written report only; no code changes.

---

## Approach: All Three Options

### Option A — Manual code review (section by section)
Read `index.html` top to bottom. Annotate every system: spells, dungeon, wizard, minimap, portal, mobile HUD, WebSocket, Playwright seam. Flag issues by severity.

### Option B — Runtime profiling via Chrome MCP
Open the live game, check the browser console for runtime warnings/errors. Pull network requests to check for repeated texture fetches, uncached resources, or failing loads. Observe the animation loop for obvious frame-rate issues.

### Option C — Static analysis (ESLint / code metrics)
Run ESLint with recommended + Three.js-relevant rules. Report unused variables, implicit globals, missing semicolons, and any patterns ESLint flags as problematic.

**All three will run.** The manual review (A) is the core deliverable. Runtime checks (B) and static analysis (C) supplement it with things that can't be caught by reading alone.

---

## Review Areas

### Correctness
- Memory leaks: are Three.js geometries/materials/textures disposed when spells expire or players leave?
- Event listeners: any `addEventListener` without a matching `removeEventListener`?
- WebSocket: does reconnect logic handle server-restart mid-game?
- Spell system: do all projectile types clean up trail lines and impact lights on death?
- Portal: does enter/exit logic handle an unreachable jam site?

### Performance (Three.js specific)
- **Draw calls**: every `new THREE.Mesh()` is a draw call. Are static dungeon meshes merged into a BufferGeometry?
- **Per-frame allocations**: any `new THREE.Vector3()` / `new THREE.Quaternion()` inside the animation loop? Should be module-level, reused with `.copy()` / `.set()`
- **Texture reuse**: procedural canvas textures created once and cached, or recreated per call?
- **PointLight count**: how many active PointLights at once? Each has shadow calculation cost
- **Minimap redraws**: drawn every 3rd frame — is `clearRect` properly scoped?
- **AnimationMixer**: is `mixer.update(dt)` called for offscreen remote players every frame?

### Maintainability
- Functions longer than ~80 lines — should be broken up
- Magic numbers — should be named constants
- Dead code paths — old commented logic, unused vars
- Misleading names or unclear abbreviations

### Mobile / Touch
- Touch event listeners passive where possible?
- Any `preventDefault()` calls blocking native browser gestures?

---

## Success Criteria

1. Written report in `tasks/done/006-code-review-report.md` listing every issue by severity: Critical / High / Medium / Low
2. Critical and High items each have a specific code location + suggested fix
3. Static analysis (ESLint) output included — either as a summary or raw output appendix
4. Runtime console warnings/errors from Chrome MCP documented
5. Prioritized action list: what to fix first, ranked by impact vs. effort
6. No changes to `index.html` — `git diff index.html` shows nothing

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1. Report completeness | Every major system has at least one review note |
| 2. Fixes actionable | Each Critical/High has file location + suggested change |
| 3. ESLint output | `npx eslint index.html --ext .html` run and results included |
| 4. Runtime check | Chrome MCP screenshot of console with no hidden errors |
| 5. Prioritized list | Items ranked by impact × effort matrix |
| 6. No code changes | `git diff index.html` is empty |

---

## Plan

1. Read `index.html` in full — system by system (Option A)
2. For each system, annotate issues against the review areas above
3. Run `npx eslint index.html` (or install eslint-plugin-html if needed) — capture output (Option C)
4. Open the game via Chrome MCP, check console for errors/warnings, pull network requests (Option B)
5. Compile all findings into `tasks/done/006-code-review-report.md`:
   - Severity table (Critical / High / Medium / Low)
   - Per-issue: location, description, suggested fix
   - ESLint output appendix
   - Runtime observations
   - Top 5 prioritized action items
6. Commit the report only (no code changes, no deploy)

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(This task IS the review — output is the report file)*

---

## Deploy & Screenshots

*(No deploy — report commit only)*
