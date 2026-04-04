# MultiMagicDungeonWeb — Roadmap

## Phase 0 — Vibe Jam Skeleton (current)

Goal: a playable single-player demo with the full portal system, basic dungeon geometry, and spell stubs. Deployable as a static `index.html` with no build step.

- **TASK-001**: Three.js scene setup + FPS player movement ✅ IN PROGRESS
- **TASK-002**: Vibe Jam portal system (start + exit portals) ✅ IN PROGRESS
- **TASK-003**: Spell primitives (Fireball, Frostbolt, Telekinesis — single player) PLANNED
- **TASK-004**: Dungeon room geometry (corridors + chambers) PLANNED

Milestone: submit to Vibe Jam 2026 with working portal and at least one castable spell.

---

## Phase 1 — Multiplayer Foundation

Goal: 2–4 players can join the same dungeon session and see each other move. Spells are synced.

- **TASK-005**: WebSocket server (Node.js, hosted on Railway or Fly.io)
- **TASK-006**: Player position/rotation sync (20hz broadcast)
- **TASK-007**: Spell projectile spawn events (server-authoritative hit detection)
- **TASK-008**: Session join/leave (lobby + in-dungeon roster)

Milestone: two browser tabs can duel in the same dungeon.

---

## Phase 2 — Dungeon Builder

Goal: players can design and save their own dungeon, share it via permalink.

- **TASK-009**: Tile-based dungeon editor (click to place/remove room tiles)
- **TASK-010**: Dungeon save/load (JSON serialisation + localStorage)
- **TASK-011**: Dungeon sharing (permalink → server stores dungeon JSON, returns ID)

Milestone: a player can build a dungeon and share the URL with a friend to raid it.

---

## Phase 3 — Persistence & Meta

Goal: persistent accounts, dungeon discovery, leaderboards.

- **TASK-012**: Supabase backend (auth + dungeon storage + raid history)
- **TASK-013**: Dungeon discovery overworld (browse and raid other players' dungeons)
- **TASK-014**: Leaderboards (raids completed, dungeons defended, spells cast)

Milestone: the game is a living world where dungeons persist and evolve.
