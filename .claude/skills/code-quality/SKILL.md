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

## Merge Safety (learned the hard way)

### Conflict marker detection
Always run `grep -c "<<<<<<" index.html` before committing. A session once committed `<<<<<<` merge markers to main — the game broke for every user with a SyntaxError. The session said "merge complete" without checking the actual file content.

### JS syntax validation
Always run `node --check index.html` before committing. This catches SyntaxError before the browser does.

### No concurrent edits to the same file
Never allow two sessions to edit `index.html` simultaneously. This is the single-file monolith — parallel sessions WILL produce merge conflicts. Coordinate work so only one session touches index.html at a time. If a concurrent edit already happened, resolve conflicts and run the full pre-commit checklist before pushing.

### The worktree trap
When Claude Code runs in a git worktree, `node --check` and `grep` operate on the **worktree copy** of index.html, not the file the HTTP server is serving (which is from the main repo). A clean worktree does NOT mean a clean main. After merging a worktree branch, always verify the served file:
```bash
grep -c "<<<<<<" /path/to/main/repo/index.html
node --check /path/to/main/repo/index.html
```

### Never claim success without browser verification
"Pushed and working" requires: loading the page in a browser AND reading the console AND confirming no exceptions. Checking git status or the worktree file is not sufficient. Multiple sessions have shipped broken code by skipping this step.

## Future (ES module phase)
See threejs-feature/SKILL.md → Target Module Architecture
