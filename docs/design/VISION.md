# MultiMagicDungeonWeb — Vision

## Core Loop

The game follows a three-phase loop:

1. **Overworld Roam** — Players explore a shared overworld and discover dungeon entrances built by other players. Each entrance is a portal into someone else's crafted dungeon.
2. **Dungeon Raid** — Inside a dungeon, the raider uses composable spell primitives to fight through traps, constructs, and potentially other players defending their dungeon. Success yields loot and reputation.
3. **Return** — After raiding (or being defeated), the player returns to the overworld, optionally upgrading their own dungeon with new traps or layouts before the next raid.

## Magic System

Spells are composable primitives — simple, predictable building blocks players combine into strategies:

- **Fireball** — Fast projectile, moderate damage, explodes on contact. Left click.
- **Frostbolt** — Slower projectile, slows targets on hit, lingers as an AoE patch. Right click.
- **Telekinesis** — Raycast grab: pulls physics objects (and eventually players) toward the caster. Press E.

Future primitives will include: Shield, Blink, Chain Lightning, Gravity Well.

The spell interface is intentionally minimal so new primitives can be added without refactoring existing ones:
```js
{ cast(player, scene), update(dt), onHit(target) }
```

## Player Count & World Model

- **Phase 0**: Single-player dungeon with portal system for the Vibe Jam webring.
- **Phase 1**: 2–8 players per dungeon session via WebSocket.
- **Phase 2**: Persistent open world — dungeons are always "live" and can be raided by any player at any time.

## Dungeon Ownership

Each player owns one dungeon. They build and modify it using a tile-based editor. The dungeon is saved as JSON and can be shared via permalink. When another player raids your dungeon, you see a replay afterward.

## Why Web

- **Zero install** — click a link, play immediately. Critical for Vibe Jam and casual player acquisition.
- **Instant sharing** — dungeon permalinks, portal webring, invite links all work as plain URLs.
- **Vibe Jam 2026 participation** — the portal system requires a browser-native game.

## Tech Decisions

- **Three.js r128** — lightweight, well-documented, no build step required when loaded from CDN. Hackable at the level of individual geometries and materials.
- **No framework** — vanilla JS keeps the bundle size at zero and makes it easy for any contributor to read the code without framework knowledge.
- **Vite dev server** — `npx vite` with no config file gives HMR and ES module support during development without committing any build tooling.
- **Single `index.html` for Phase 0** — minimizes deployment complexity for Vibe Jam. The game must work as a raw file opened in a browser.

## Multiplayer Plan

Phase 2 introduces a Node.js WebSocket server with the same dungeon-session model as the UE5 version:

- Players connect to a session keyed by dungeon ID.
- Server is authoritative for spell hit detection and player health.
- Client does local prediction for movement (no input lag), reconciles on server tick (20hz).
- Dungeon state (trap positions, room layout) is server-owned and streamed to clients on join.

This mirrors the UE5 architecture while being entirely portable to any Node.js host.

## Quality Bar

- **Task-driven development** — every change traces to a task file in `docs/tasks/`.
- **Single-responsibility code** — each class does one thing. No god objects.
- **Review gates** — the `/review` command in CLAUDE.md runs before every commit.
- **No regressions** — `index.html` must open without console errors before any PR is merged.
