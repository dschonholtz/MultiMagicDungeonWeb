---
name: code-quality
description: Code quality standards and review checklist for MultiMagicDungeonWeb
---

# Code Quality Standards — MultiMagicDungeonWeb

## Naming
- Game classes: `MmdPascalCase` (MmdPlayer, MmdSpell, MmdPortal)
- Constants: `SCREAMING_SNAKE` in the `=== CONSTANTS ===` block at top of file
- Methods: `camelCase`
- No magic numbers anywhere except the constants block

## Structure (monolith phase)
- Section headers: `// === SECTION NAME ===` before every logical group
- Each class is self-contained; no class references another class's internals
- Global state only in `// === GAME STATE ===` section

## JavaScript
- Prefer `const` over `let`; never `var`
- No `console.log` in production paths (use `console.warn` for recoverable errors)
- `try/catch` on all JSON.parse calls
- Null-guard WebSocket sends: `ws?.readyState === WebSocket.OPEN`

## Three.js
- Shared geometry/material cache via `_geoCache` / `_matCache` (no per-instance GPU alloc for projectiles)
- Dispose textures on regeneration: `map.dispose()` before reassigning
- Delta-time everywhere: multiply velocities by `dt`, never use raw frame counts

## Git
- Commits: `<area>: <what changed>` (e.g. `player: fix lerp clamp overshoot`)
- No force-push to main
- Pre-commit: open index.html in browser, verify no console errors

## Future (ES module phase)
See threejs-feature/SKILL.md → Target Module Architecture
