# CLAUDE.md — MultiMagicDungeonWeb Agent Onboarding

Welcome. This guide lets you cold-start the project without any other context. Read this first, then check the files listed below.

## What Is This Project?

**MultiMagicDungeon Web** is a browser-based multiplayer dungeon game built with Three.js. Players roam an overworld, find other players' dungeons, raid them, and duel with composable spell primitives. It is a web port of the [MultiMagicDungeon UE5 project](https://github.com/dschonholtz/MultiMagicDungeon), participating in **Vibe Jam 2026** via the portal webring system.

No install required — open `index.html` in a browser and play.

## How to Pick Up Current Work

1. Read `docs/PROGRESS.md` — find the active task
2. Open that task file in `docs/tasks/` — read Goal + Acceptance Criteria
3. Check `docs/design/ROADMAP.md` for upstream context
4. Write code, run locally (`npx vite` or just open `index.html`), verify acceptance criteria
5. Update `docs/PROGRESS.md` before opening a PR

## Repo Structure

```
MultiMagicDungeonWeb/
├── index.html              # Complete game (currently single-file, Phase 1 will split)
├── CLAUDE.md               # This file
├── README.md               # Project overview + play link
├── LICENSE                 # MIT
├── docs/
│   ├── PROGRESS.md         # Active work tracking
│   ├── design/
│   │   ├── VISION.md       # What we're building and why
│   │   ├── ROADMAP.md      # Phased task list
│   │   └── ARCHITECTURE.md # System design + file structure plan
│   └── tasks/
│       ├── TASK-001-threejs-scene.md
│       ├── TASK-002-portal-system.md
│       ├── TASK-003-spell-primitives.md
│       └── TASK-004-dungeon-geometry.md
└── src/                    # Phase 1: split index.html into modules
    ├── systems/            # MmdGame, MmdPlayer, MmdDungeon
    ├── spells/             # MmdFireball, MmdFrostbolt, MmdTelekinesis
    ├── portals/            # MmdPortal
    └── ui/                 # HUD, start screen
```

## Tech Stack

| Layer | Tech |
|---|---|
| Rendering | Three.js (CDN import, no bundler needed for Phase 0) |
| Dev server | `npx vite` (no config needed, just run in repo root) |
| Deployment | GitHub Pages or Vercel (static, no server needed for Phase 0) |
| Multiplayer (Phase 2) | Node.js WebSocket server |
| Persistence (Phase 3) | Supabase |

## Running Locally

```bash
# Option 1: No install
open index.html  # works in any modern browser

# Option 2: Vite dev server (recommended — enables ES module hot reload)
npx vite
# then open http://localhost:5173
```

## Custom Commands

### /review
Before merging, verify:
- No console errors in browser
- Portal system: `?portal=true` skips start screen; exit portal redirects correctly
- Spells fire and projectiles render
- Docs updated (PROGRESS.md reflects current state)
- Code follows naming conventions below

### /simplify
When a function exceeds ~50 lines or a class exceeds ~200 lines, break it into smaller single-responsibility units. Each spell must remain a self-contained class.

### /pre-commit
Checklist before every commit:
- [ ] No `console.error` or uncaught exceptions in browser devtools
- [ ] Portal works: `?portal=true&ref=example.com` creates red start portal
- [ ] Exit portal redirects to `jam.pieter.com/portal/2026` with correct params
- [ ] `docs/PROGRESS.md` updated
- [ ] New systems have a corresponding task file in `docs/tasks/`

## Code Conventions

### Naming
- All game classes use `Mmd` prefix: `MmdPlayer`, `MmdSpell`, `MmdDungeon`, `MmdPortal`
- Files match class names: `MmdPlayer.js`, `MmdFireball.js`
- Constants: `UPPER_SNAKE_CASE`
- Private methods/properties: `_leadingUnderscore`

### Module structure (Phase 1 target)
Each game system is a class in its own ES module file under `src/`. No frameworks. Vanilla JS only.

### Spell interface (must be followed by all spells)
```js
class MmdSpell {
  cast(camera, scene) { ... }   // return false if on cooldown
  update(dt, scene) { ... }     // move projectiles, check hits
  onHit(target) { ... }         // Phase 2: apply effect to target
}
```

### Portal params (must be preserved)
Incoming: `portal`, `ref`, `username`, `color`, `speed`, `hp`, `rotation_y`
Outgoing (exit portal): `portal=true`, `ref=<hostname>`, `username`, `color`, `speed`, `hp`

## Pre-commit Gate
A commit is ready when:
1. Lints clean (no syntax errors, `npx eslint src/` when src/ exists)
2. No console errors in Chrome devtools with game open
3. Portal works end-to-end
4. Docs updated