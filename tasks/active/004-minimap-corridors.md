# Task 004: Minimap — Draw Corridors

**Status:** blocked — depends on Task 002 (dungeon doorways) first
**Created:** 2026-04-05

**Note from Opus diagnosis:** The minimap already draws BOTH rooms and corridors. The disconnected appearance is the same root cause as Task 002 — corridors don't reach room walls, so there are visible gaps between minimap rectangles. Fixing Task 002 (resizing corridor geometry) will likely fix the minimap appearance automatically.

This task may be a no-op once 002 is done. Verify after 002 is deployed before executing.

---

## Success Criteria

1. After Task 002 fix: minimap shows rooms and corridors as connected shapes
2. No isolated floating rectangles
3. All 28 Playwright tests pass

---

## Plan

1. After Task 002 is merged, screenshot the minimap
2. If corridors now connect rooms visually → close this task as resolved
3. If gaps remain → investigate minimap scaling and minimum draw width, enforce `Math.max(2, scaledWidth)`
4. Commit only if changes needed
