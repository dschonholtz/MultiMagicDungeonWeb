# MultiMagicDungeonWeb — Agent Onboarding

## What this project is

A browser-based multiplayer magic dungeon game built in vanilla Three.js. Players build dungeons, raid each other's dungeons, and duel with composable spell primitives. Part of Vibe Jam 2026.

Sister project: [MultiMagicDungeon (UE5)](https://github.com/dschonholtz/MultiMagicDungeon)

## How to pick up current work

1. Check `tasks/active/` — the current in-flight task file has the full context
2. Read `docs/PROGRESS.md` for overall state
3. Open `index.html` in browser — verify portal system works before touching code

## Repo structure

```
index.html              # Entire game (single file for Vibe Jam simplicity)
CLAUDE.md               # This file
README.md
LICENSE
tasks/
  active/               # In-flight task files (NNN-short-title.md)
  done/                 # Completed tasks, archived
  TEMPLATE.md           # Copy this to start a new task
docs/
  PROGRESS.md           # Current active tasks + state
  design/
    VISION.md           # Core vision and design pillars
    ROADMAP.md          # Phased task list (TASK-001+)
    ARCHITECTURE.md     # System design and file structure plan
```

## Tech stack

- **Runtime**: Vanilla JS ES modules, Three.js r128 (CDN)
- **Dev server**: `npx vite` (no install needed)
- **Deploy**: Hetzner VPS at `5.161.208.234`, pm2 manages http-server (port 3000) + ws-server (port 8080)
- **SSH key**: `~/.ssh/mmd_deploy`

## Code conventions

- No frameworks. Vanilla JS only.
- All game classes prefixed with `Mmd`: `MmdPlayer`, `MmdSpell`, `MmdDungeon`, `MmdPortal`
- Each game system is a self-contained class
- Spells follow the primitive interface: `{ cast(player, scene), update(dt), onHit(target) }`
- No global state except `game` object on window (for debugging only)
- Comments explain WHY, not WHAT

## Task Workflow

All non-trivial work follows a strict 4-step process. **Never skip steps or run them out of order.** See `.claude/skills/task-workflow/SKILL.md` for the full agent checklist and `tasks/TEMPLATE.md` for the task file structure.

### Step 1 — Plan _(STOP after this step — wait for user approval)_
1. Create `tasks/active/NNN-short-title.md` from `tasks/TEMPLATE.md`
2. Document 2–3 options with pros/cons
3. Pick the best option with clear reasoning
4. Write numbered, **measurable** success criteria — specific and testable (not "looks better")
5. Write a testing strategy: map each criterion to a verification method
6. Write a step-by-step implementation plan
7. **Message the user:** _"Plan ready for [task name] — please review `tasks/active/NNN.md` and reply 'approved' to proceed."_
8. **STOP. Do not write any implementation code until the user explicitly approves.**

### Step 2 — Execute _(only after user approves Step 1)_
1. Update task status to `executing`
2. Implement the chosen approach
3. Log significant decisions and plan deviations in the **Execution Log** section of the task file
4. **Message the user:** _"Execution complete — moving to Step 3 (code review + testing)."_

### Step 3 — Review & Test _(complete before any deploy)_
1. Update task status to `reviewing`
2. Run the full pre-commit checklist (see below)
3. Run `npm test` — **ALL Playwright tests must pass**
4. Take a screenshot of the running game
5. For every success criterion in the task file, mark it **✅ PASS** or **❌ FAIL**
6. Fix any failures, re-test, repeat until all criteria are ✅
7. **Message the user:** _"Step 3 complete — all [N] criteria pass. [Brief summary of notable findings.]"_

### Step 4 — Deploy _(only after user sees the Step 3 summary)_
1. Update task status to `deployed`
2. Deploy: `ssh -i ~/.ssh/mmd_deploy root@5.161.208.234 "cd /root/MultiMagicDungeonWeb && git pull origin main && pm2 restart all"`
3. Confirm 200: `curl -s -o /dev/null -w "%{http_code}" http://5.161.208.234:3000/`
4. Take screenshots of the live deploy
5. Fill in the Step 4 section of the task file; move it from `tasks/active/` to `tasks/done/`
6. **Message the user** with screenshots, any issues encountered, and the live link

---

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
