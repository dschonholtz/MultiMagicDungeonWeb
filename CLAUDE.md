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

### Quick checks (run after EVERY edit)

1. Syntax check: `node --check index.html 2>&1` — must pass with no errors
2. Conflict check: `grep -c "<<<<<<" index.html` — must return 0
3. Server check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` — must return 200

### Playwright test suite (run after any meaningful change)

The repo ships with a full Playwright suite in `tests/`. Run it before committing:

```bash
# First-time setup (only needed once)
npm install
npx playwright install chromium

# Smoke tests only — fastest signal (~10s)
npm run test:smoke

# Full suite — all flows (~60s)
npm test

# Headed mode — watch the browser (useful when debugging a failing test)
npm run test:headed

# Interactive UI explorer
npm run test:ui

# Read the HTML report after a run
npm run test:report
```

`playwright.config.js` starts `npx vite` automatically on port 3000 before tests run and reuses an already-running server if present.

### What the tests cover

| File | What it checks |
|---|---|
| `tests/smoke.spec.js` | Page loads, canvas visible, HUD present, localPlayer spawns with full HP and a Guest name |
| `tests/movement.spec.js` | WASD keys move the player, camera tracks position, rename input blocks WASD |
| `tests/spells.spec.js` | Fireball/frostbolt/telekinesis projectiles appear, travel, expire, cooldowns apply to HUD |
| `tests/portal.spec.js` | Hint shows near portal, portal navigation fires, incoming URL params set username/HP |
| `tests/multiplayer.spec.js` | Two browser contexts see each other, player count updates, disconnect reduces count |

### How tests access game state

`index.html` exposes `window.__TEST__` at the bottom of its script block:

```js
// Read any game state (JSON-safe, no live Three.js objects)
const state = window.__TEST__.state();
// state.localPlayer.{id, username, x, y, z, hp, cooldowns}
// state.remotePlayers       — array of remote player IDs
// state.remotePlayerCount   — number of remote players
// state.spells              — array of live projectiles
// state.playerCountText     — text content of #player-count HUD element

// Commands for driving the game from tests
window.__TEST__.commands.enableSpells();      // bypass pointer-lock gate
window.__TEST__.commands.castSpell('fireball');
window.__TEST__.commands.teleport(-30, 0);   // move player instantly
window.__TEST__.commands.setUsername('Bob');
```

If you add new game state or commands that tests should cover, extend `window.__TEST__` in the same block at the bottom of `index.html`.

### Multiplayer test notes

- Tests hit the live server at `ws://5.161.208.234:8080`. If it's unreachable the game falls back to offline mode and multiplayer tests auto-skip (they check `localPlayer.id` for the `"offline-"` prefix).
- For local multiplayer testing, switch `WS_URL` in `index.html` to `ws://localhost:8080` and run `cd server && npm run dev` first.

### After multiplayer changes

In addition to `npm test`, manually verify:
- Open two tabs to `http://localhost:3000` (or `npm run test:headed` on `multiplayer.spec.js`)
- Both tabs show the other player's model
- Screenshot both tabs and confirm a remote wizard is visible

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
