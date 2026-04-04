# VISION.md — MultiMagicDungeon Web

## The Core Loop

The experience follows a single loop:

1. **Overworld roam** — Player spawns in a shared open world, exploring the landscape
2. **Find a dungeon** — Other players' custom-built dungeons appear as entrances in the overworld
3. **Raid** — Enter a dungeon, fight through traps and guardians, reach the treasure chamber
4. **Return** — Back to the overworld with loot and rank changes

Dungeons are built by players. A player's dungeon is their territory — they design it, set the traps, choose the layout. Others raid it.

## Why Web

The original [MultiMagicDungeon](https://github.com/dschonholtz/MultiMagicDungeon) is a Unreal Engine 5 project. The web version exists because:

- **Zero install** — Anyone can play instantly via a link. No 50GB download.
- **Viral potential** — Share a dungeon as a URL. Other players raid it from a browser tab.
- **Vibe Jam 2026** — The portal webring connects browser games. We participate, players discover us.
- **Open source** — MIT license. Fork it, mod it, host your own dungeon server.

## Magic System

Spells are **composable primitives**, not monolithic abilities. Each spell is:
- A self-contained class with `cast()`, `update()`, and `onHit()` methods
- Independently tunable (speed, damage, visual effect)
- Combinable in future phases (e.g., "ice fireball" = Fireball + Frostbolt modifier)

**Phase 0 primitives:**
- **Fireball** — Fast, direct damage, glowing orange sphere
- **Frostbolt** — Slower, applies slow effect on hit (placeholder in Phase 0)
- **Telekinesis** — Pull objects/enemies (placeholder in Phase 0)

## Tech Decisions

| Decision | Choice | Reason |
|---|---|---|
| Renderer | Three.js | Lightweight, hackable, no proprietary engine |
| Framework | None (vanilla JS) | Minimal dependencies, easy to fork |
| Dev server | Vite | Fast HMR, zero config for ES modules |
| Multiplayer | WebSocket + Node.js (Phase 1) | Simple, real-time, no lock-in |
| Persistence | Supabase (Phase 3) | Postgres + auth + realtime, no infra to manage |
| Deployment | GitHub Pages / Vercel | Static hosting, free tier |

## Player Count

- Phase 0: Single player (no server)
- Phase 1: 2–8 per dungeon session
- Phase 3: Persistent open world, no hard cap

## Quality Bar

Same as the UE5 project:
- Task-driven development — every feature is a TASK with acceptance criteria
- Review gates — /review checklist before merge
- Single-responsibility code — each class does one thing
- Docs updated with every commit