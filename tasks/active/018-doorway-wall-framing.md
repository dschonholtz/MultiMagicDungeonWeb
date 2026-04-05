# Task 018: Fix doorway wall framing geometry

**Status:** planning
**Created:** 2026-04-05
**Issue ID:** GAME-004
**Severity:** High

---

## Problem Statement

In the 3D dungeon viewport, doorway openings between rooms and corridors are missing the surrounding wall geometry that should frame them. The opening itself exists (the wall is correctly cut), but the wall segments to the left, right, and above the opening are absent or clipped — making it appear as though the wall simply vanishes at the connection point rather than presenting a proper framed archway.

Visible at http://5.161.208.234:3000: a doorway opening shows abrupt, unframed wall edges with no geometry on the sides or top of the opening.

---

## Scope

- Address only **GAME-004** (doorway wall framing) in this task.
- The primary file to change is `assets/index.html` — specifically the dungeon geometry generation code that produces wall meshes around openings.
- Keep changes minimal and targeted; do not refactor unrelated dungeon generation logic.
- Update or add Playwright tests to cover the doorway rendering behaviour.

---

## Root Cause Investigation

### Where to look in `assets/index.html`

1. Find the function(s) responsible for generating wall geometry when two rooms/corridors are adjacent (search for adjacency checks, wall-removal logic, and `BoxGeometry`/`PlaneGeometry` construction near doorway handling).
2. Identify the code path that punches an opening in a wall face — this is where the surrounding framing segments (left jamb, right jamb, lintel) should also be emitted but are likely missing or have incorrect dimensions/offsets.
3. Check whether the opening size is subtracted from the full-wall quad in one operation (replacing the whole wall face) or via four separate quads (top, bottom, left, right). The bug is likely that only one quad is replaced with nothing, rather than being replaced with four framing quads.

---

## Success Criteria

1. Every doorway opening in the dungeon is surrounded by visible wall geometry on the left side, right side, and above the opening (three framing segments).
2. The fix applies to all connection types: room-to-corridor, room-to-room, and corridor-to-corridor adjacencies.
3. The framing geometry is flush with the adjacent wall faces — no z-fighting, gaps, or overlaps.
4. A Playwright test asserts that doorway framing geometry is present (geometry count check, DOM canvas snapshot, or Three.js scene object count).
5. All 28 Playwright tests pass before merge — no regressions.

---

## Testing Strategy

| Criterion | How to verify |
|---|---|
| 1 | Navigate to each doorway in the live preview; visually confirm left/right/top framing is visible |
| 2 | Teleport into each connection type and inspect from both sides |
| 3 | Use browser devtools or a test hook to compare mesh vertex counts before and after the fix |
| 4 | Run the new/updated Playwright test in isolation and confirm it passes |
| 5 | Run `npx playwright test` and confirm 28/28 pass |

---

## Initial Plan

1. **Locate geometry code** — search `assets/index.html` for the wall-face generation loop and the adjacency/opening logic. Identify exactly which branch handles the case where a wall face has an opening cut into it.
2. **Reproduce the bug** — add a temporary `console.log` to confirm the framing quads are either never created or are created with zero-area dimensions.
3. **Implement the fix** — replace the single full-face removal with four framing quads (left jamb, right jamb, lintel, optional threshold) sized to `wallHeight - doorHeight` (top) and `wallWidth/2 - doorWidth/2` (sides). Use the same material as the surrounding wall.
4. **Validate all connection types** — confirm the fix path is reached for room-to-corridor, room-to-room, and corridor-to-corridor pairings by checking each in the browser.
5. **Add Playwright test** — in the relevant test file, add a test that loads the dungeon, moves the camera to face a doorway, and asserts either (a) a Three.js geometry/mesh count above a known threshold or (b) a visual snapshot shows non-uniform wall pixels around the opening.
6. **Run full test suite** — execute `npx playwright test` and confirm 28/28 pass before marking the task `done`.

---

## Priority Recommendation

- **Tier:** P1 (High — fix before next release)
- **Why now:** The missing framing geometry is immediately visible to all players and breaks the visual coherence of the dungeon. It also partially overlaps with prior corridor-alignment work (task 002), so fixing it now prevents compounding visual debt.
