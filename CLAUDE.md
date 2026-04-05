# MultiMagicDungeonWeb — Agent Onboarding

## What this project is

A browser-based multiplayer magic dungeon game built in vanilla Three.js. Players build dungeons, raid each other's dungeons, and duel with composable spell primitives. Part of Vibe Jam 2026.

Sister project: [MultiMagicDungeon (UE5)](https://github.com/dschonholtz/MultiMagicDungeon)

## How to pick up current work

1. Read `docs/PROGRESS.md` — shows active task and current state
2. Open the active task file in `docs/tasks/`
3. Read `docs/design/ROADMAP.md` for phase context
4. Open `index.html` in browser — verify portal system works before touching code

## Repo structure

```
index.html              # Entire game (single file for Vibe Jam simplicity)
CLAUDE.md               # This file
README.md
LICENSE
docs/
  PROGRESS.md           # Current active tasks + state
  design/
    VISION.md           # Core vision and design pillars
    ROADMAP.md          # Phased task list (TASK-001+)
    ARCHITECTURE.md     # System design and file structure plan
  tasks/
    TASK-001-*.md       # Individual task specs
    TASK-002-*.md
    ...
```

## Tech stack

- **Runtime**: Vanilla JS ES modules, Three.js r128 (CDN)
- **Dev server**: `npx vite` (no install needed)
- **Deploy**: GitHub Pages or Vercel (static, no server needed for Phase 0)
- **Phase 2**: Node.js WebSocket server for multiplayer

## Code conventions

- No frameworks. Vanilla JS only.
- All game classes prefixed with `Mmd`: `MmdPlayer`, `MmdSpell`, `MmdDungeon`, `MmdPortal`
- Each game system is a self-contained class
- Spells follow the primitive interface: `{ cast(player, scene), update(dt), onHit(target) }`
- No global state except `game` object on window (for debugging only)
- Comments explain WHY, not WHAT

## Testing Requirements (MANDATORY — not optional)

After EVERY edit to index.html:
1. Syntax check: `node --check index.html 2>&1` — must pass with no errors
2. Conflict check: `grep -c "<<<<<<" index.html` — must return 0
3. Server check: confirm port 3000 is responding: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` — must return 200
4. Browser check: navigate to http://localhost:3000/ and read_console_messages — must have NO exceptions
5. Visual check: take a screenshot — game must be rendering (not black screen)

After multiplayer changes:
6. Two-tab test: open two tabs to localhost:3000, verify both show other players
7. Screenshot both tabs and confirm remote player model is visible

**NEVER commit or push until ALL checks pass.**

### The worktree trap
When running in a git worktree, `node --check index.html` and `grep` check the worktree file. But the HTTP server at port 3000 serves the **main repo** file, not the worktree. Always verify the served file separately — checking your own worktree does NOT confirm what the browser is loading.

## Custom commands

### /review
Before any commit: read the diff, check for single-responsibility violations, unclear variable names, missing comments on non-obvious logic.

### /simplify
After /review: identify anything that can be deleted or collapsed without losing behavior. Prefer fewer lines.

### /pre-commit checklist
- [ ] `node --check index.html` passes (no syntax errors)
- [ ] `grep -c "<<<<<<" index.html` returns 0 (no merge conflict markers)
- [ ] `index.html` opens in browser with no console errors
- [ ] Portal system works: `?portal=true` skips name screen
- [ ] Exit portal redirects correctly to `https://jam.pieter.com/portal/2026`
- [ ] Docs updated if behavior changed
- [ ] No `console.log` left in production paths

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Game classes | MmdPascalCase | MmdPlayer, MmdSpell |
| Files (future) | kebab-case | mmd-player.js |
| Constants | SCREAMING_SNAKE | PORTAL_RADIUS |
| Methods | camelCase | castFireball() |

## Multiplayer plan (Phase 2)

WebSocket server (Node.js) will handle:
- Player position/rotation sync (20hz)
- Spell projectile spawn events
- Dungeon session join/leave

Client does local prediction for movement, reconciles on server update.
