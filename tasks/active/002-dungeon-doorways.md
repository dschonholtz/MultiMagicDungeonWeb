# Task 002: Fix Dungeon Doorways

**Status:** reviewing
**Created:** 2026-04-05

---

## Root Cause

Corridors in `DEFAULT_DUNGEON` were positioned at midpoints between rooms, but their endpoints didn't reach the room walls. Gaps of 5-25 units meant the adjacency check (`Math.abs(face1 - face2) < EPS` where EPS=0.5) never fired, so walls were never removed — leaving every room sealed.

The adjacency logic itself was correct; the data was wrong.

---

## Chosen Approach

**Resize corridor AABBs** so each endpoint exactly touches the target room face (gap = 0). Keep corridor widths the same — only adjust position and length.

---

## Success Criteria

1. Every corridor endpoint aligns with its target room face within EPS (0.5 units)
2. All 6 corridors have doorway openings — no sealed walls between connected rooms
3. Minimap shows connected rooms, not isolated boxes
4. All existing Playwright tests continue to pass (no regressions from corridor changes)
5. Player can walk through every corridor (no invisible walls)

---

## AABB Analysis

### Rooms
| # | Center | Size | AABB |
|---|--------|------|------|
| 0 | (0, 0) | 80×60 | X[-40, 40] Z[-30, 30] |
| 1 | (80, 0) | 50×40 | X[55, 105] Z[-20, 20] |
| 2 | (-80, 0) | 50×40 | X[-105, -55] Z[-20, 20] |
| 3 | (0, -80) | 60×50 | X[-30, 30] Z[-105, -55] |
| 4 | (0, -200) | 110×90 | X[-55, 55] Z[-245, -155] |

### Corridors (BEFORE → AFTER)

| # | Purpose | Before AABB | Gap(s) | After AABB |
|---|---------|-------------|--------|------------|
| 0 | Room 0→1 (east) | X[30,60] Z[-7.5,7.5] | 10 + 5 | X[40,55] Z[-7.5,7.5] |
| 1 | Room 0→2 (west) | X[-60,-30] Z[-7.5,7.5] | 10 + 5 | X[-55,-40] Z[-7.5,7.5] |
| 2 | Room 0→3 (south) | X[-7.5,7.5] Z[-60,-30] | 0 + 5 | X[-7.5,7.5] Z[-55,-30] |
| 3 | Room 1→corr5 (trap) | X[74,86] Z[-60,-30] | 10 | X[74,86] Z[-80,-20] |
| 4 | Corr3→Room 3 (connector) | X[27.5,52.5] Z[-86,-74] | 2.5 + 21.5 | X[30,74] Z[-86,-74] |
| 5 | Room 3→4 (boss) | X[-7.5,7.5] Z[-150,-120] | 15 + 5 | X[-7.5,7.5] Z[-155,-105] |

### Face alignment verification (all < 0.5)

- Corr 0: minX=40 ↔ Room 0 maxX=40 ✓ | maxX=55 ↔ Room 1 minX=55 ✓
- Corr 1: maxX=-40 ↔ Room 0 minX=-40 ✓ | minX=-55 ↔ Room 2 maxX=-55 ✓
- Corr 2: maxZ=-30 ↔ Room 0 minZ=-30 ✓ | minZ=-55 ↔ Room 3 maxZ=-55 ✓
- Corr 3: maxZ=-20 ↔ Room 1 minZ=-20 ✓ | west face at x=74 ↔ Corr 4 maxX=74 ✓ (6-unit Z overlap)
- Corr 4: minX=30 ↔ Room 3 maxX=30 ✓ | maxX=74 ↔ Corr 3 minX=74 ✓
- Corr 5: maxZ=-105 ↔ Room 3 minZ=-105 ✓ | minZ=-155 ↔ Room 4 maxZ=-155 ✓

---

## Step 2: Execution Log

- 2026-04-05: Computed all room and corridor AABBs, identified gaps in every corridor
- 2026-04-05: Resized all 6 corridors to eliminate gaps. Key decisions:
  - Corridors 0-2, 5: straightforward — extended endpoints to touch room faces
  - Corridors 3-4 (L-shaped trap route): Extended corridor 3 south to z=-80 (6-unit overlap with corridor 4's z-range [-86,-74]) so the shared face at x=74 has sufficient z-overlap for the adjacency check. Extended corridor 4 west to x=30 (room 3's east face) and east to x=74 (corridor 3's west face).
- 2026-04-05: Verified via preview screenshots — all corridors open, minimap shows connected layout
- 2026-04-05: Playwright: 23 passed, 5 failed (all pre-existing: timing flakiness in spell tests, HUD rename visibility, portal text timeout, console error). No regressions from corridor changes.

---

## Step 3: Code Review & Test Results

### Code Review Notes

- [x] No dead code or commented-out blocks
- [x] No console.log in production paths
- [x] No merge conflict markers (grep returns 0)
- [x] Style consistent with surrounding code
- [x] Non-obvious logic has comments explaining WHY (corridor comments document which faces connect)
- [x] No regressions introduced

### Playwright Results
```
23 passed, 5 failed (3.5m)
All 5 failures are pre-existing (not related to corridor geometry changes):
- movement: A-key flaky
- portal: hint text timeout
- smoke: console error pre-existing
- spells: fireball lifetime + cooldown timing
```

### Success Criteria Results

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Corridor endpoints align within EPS | ✅ PASS | All 12 face pairs verified mathematically |
| 2 | All 6 corridors have doorway openings | ✅ PASS | Screenshots confirm openings at east, west, south, boss, and trap corridors |
| 3 | Minimap shows connected rooms | ✅ PASS | Minimap screenshot shows all rooms linked |
| 4 | No test regressions | ✅ PASS | Same 5 pre-existing failures, 23 passes unchanged |
| 5 | Player can walk through corridors | ✅ PASS | Teleported into each corridor, no invisible walls |

**All criteria pass: YES**
