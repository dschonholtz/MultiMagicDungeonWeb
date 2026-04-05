# Task 002: Open Dungeon Doorways

**Status:** planning
**Created:** 2026-04-05

Players cannot navigate the dungeon — rooms are sealed boxes and you have to clip through walls to move. A previous fix attempt added adjacency-based wall skipping, but the root cause was misidentified.

---

## Root Cause (diagnosed by Opus reading the actual code)

The adjacency logic in `renderDungeon()` is **correct**. It checks for boxes whose faces are within `EPS = 0.5` units. The bug is in the **data**: corridors in `DEFAULT_DUNGEON` are positioned at midpoints between rooms but are too short to actually reach the room walls. There are gaps of 5–10 units between corridor endpoints and room faces.

**Concrete example:**
- Room 0 east face: `x = 40`
- Corridor 0 west face: `x = 30`
- Gap: **10 units** → adjacency check never fires → full wall placed on both sides → sealed

Only 1 of ~10 connections (Room 0 south ↔ Corridor 2 north) actually has touching faces, so only that one doorway opens.

**Minimap note:** The minimap already draws BOTH rooms and corridors. The disconnected appearance is the same root cause — the gap rectangles aren’t drawn, so rooms and corridors appear to float separately.

---

## Options Considered

### Option A — Fix the corridor geometry in DEFAULT_DUNGEON
Reposition and resize each corridor so its endpoints exactly coincide with the room walls it connects.
**Pros:** Correct geometry. Adjacency check works as designed. Minimap also becomes correct automatically.
**Cons:** Requires careful recalculation of all corridor entries.

### Option B — Increase EPS in the adjacency check
Change `EPS = 0.5` to ~12.
**Pros:** One-line change.
**Cons:** Semantically wrong — creates phantom doorways, leaves floating half-walls. Hacky.

### Option C — Explicit doorway cuts
Add a `doors` array per room specifying direction + width; cut those openings explicitly.
**Pros:** Most designer-friendly, explicit.
**Cons:** Largest code change.

**Chosen: Option A** — fix the data. The code is correct, the geometry is wrong.

---

## Success Criteria

1. Player can walk from spawn room through at least 3 connected rooms without clipping
2. Every corridor-room connection has a visible opening (no wall blocking the path)
3. Minimap shows rooms and corridors as connected shapes
4. All 28 Playwright tests pass
5. No console errors on load

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1-2 | Walk the dungeon: spawn → corridor → room → corridor → room |
| 3 | Screenshot minimap — trace a visible path from spawn to boss room |
| 4 | `npm test` — 28/28 pass |
| 5 | Console check |

---

## Plan

1. Read `DEFAULT_DUNGEON` in full — extract every room's AABB
2. For each corridor, compute which room faces it should connect
3. Resize each corridor so `minX/maxX` or `minZ/maxZ` exactly equals the adjacent room wall
4. Verify all connections: gap = 0 for every room-corridor pair
5. `node --check` + `grep conflict` + `npm test`
6. Screenshot dungeon navigation + minimap
7. Commit (no deploy)

---

## Known gaps to fix (from Opus diagnosis)

| Pair | Gap |
|------|-----|
| Room 0 east (x=40) ↔ Corr 0 west | 10 units |
| Corr 0 east ↔ Room 1 west (x=55) | 5 units |
| Room 0 west (x=-40) ↔ Corr 1 east | 10 units |
| Corr 1 west ↔ Room 2 east (x=-55) | 5 units |
| Room 0 south (z=-30) ↔ Corr 2 north (z=-30) | **0** ✔ |
| Corr 2 south ↔ Room 3 north | 5 units |
| Room 1 south ↔ Corr 3 north | 10 units |
| Boss approach corridors | TBD |
