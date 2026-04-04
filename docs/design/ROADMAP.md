# ROADMAP.md — MultiMagicDungeonWeb

## Phase 0 — Vibe Jam Skeleton

Goal: Working browser game that can enter and exit the Vibe Jam 2026 portal webring. Single player only. No server required.

| Task | Title | Status |
|---|---|---|
| TASK-001 | Three.js scene setup + player movement (WASD + mouse look) | DONE |
| TASK-002 | Vibe Jam portal system (start + exit portals, URL params) | DONE |
| TASK-003 | Spell primitives — Fireball, Frostbolt, Telekinesis | DONE |
| TASK-004 | Dungeon room geometry (corridors + chambers + torches) | DONE |

---

## Phase 1 — Multiplayer Foundation

Goal: Real-time multiplayer. 2–8 players can be in the same dungeon session. Requires a WebSocket server.

| Task | Title | Status |
|---|---|---|
| TASK-005 | WebSocket server (Node.js, ws library) | PLANNED |
| TASK-006 | Player position + rotation sync | PLANNED |
| TASK-007 | Spell projectile sync (server-authoritative) | PLANNED |
| TASK-008 | Session join/leave + player roster UI | PLANNED |

**Multiplayer model:** Authoritative server, client-side prediction for local movement, server reconciliation. See `docs/design/ARCHITECTURE.md`.

---

## Phase 2 — Dungeon Builder

Goal: Players build their own dungeons using a tile-based editor. Dungeons are shareable via URL/export.

| Task | Title | Status |
|---|---|---|
| TASK-009 | Tile-based dungeon editor (place floor/wall/trap tiles) | PLANNED |
| TASK-010 | Dungeon save/load (JSON + localStorage) | PLANNED |
| TASK-011 | Dungeon sharing (permalink / JSON export) | PLANNED |
| TASK-012 | Dungeon traps (spike trap, pressure plate — simple triggers) | PLANNED |

---

## Phase 3 — Persistence & Discovery

Goal: Persistent player data, dungeon registry, and discovery. Players can browse and raid each other's dungeons.

| Task | Title | Status |
|---|---|---|
| TASK-013 | Supabase backend (player auth, dungeon table) | PLANNED |
| TASK-014 | Dungeon discovery (browse/raid other players' dungeons) | PLANNED |
| TASK-015 | Leaderboards (most raids, highest defense streak) | PLANNED |
| TASK-016 | Overworld map (dungeons appear as map markers) | PLANNED |

---

## Future Considerations

- Mobile touch controls
- Custom spell combinations (Phase 4)
- Dungeon guardian AI (enemies that defend the dungeon)
- Voice/text chat in dungeon sessions
- Seasonal events / limited-time dungeon themes