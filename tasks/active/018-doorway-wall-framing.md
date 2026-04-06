# Task 018: Doorway Wall Framing

**Status:** reviewing
**Created:** 2026-04-05

---

## Options Considered

### Option A — Replace full-wall skip with framed opening
**Approach:** When a face is shared with an adjacent box, instead of skipping the wall entirely, compute the overlap span and draw: left jamb, right jamb, and lintel wall segments around the opening.
**Pros:** Architecturally correct; doorways look intentional; works for any box size ratio
**Cons:** Slightly more geometry per doorway (3 planes per opening instead of 0)

### Option B — Add separate doorway arch meshes
**Approach:** Create arch-shaped geometry (torus or custom) at each connection point.
**Pros:** More visually interesting
**Cons:** Complex geometry; harder to maintain; overkill for this sprint

### Option C — Partial wall with texture gap
**Approach:** Use a single wall plane with a UV-mapped hole texture.
**Pros:** Single mesh per face
**Cons:** Planes can't have holes natively in Three.js without alpha cutout texture; adds texture complexity

---

## Chosen Approach

**Choosing Option A** because it uses the same `addWall` helper already in use, produces correct geometry for any box/corridor size ratio, and integrates cleanly with the existing adjacency-detection logic.

---

## Success Criteria

1. Every shared face between a room and corridor (or corridor and corridor) shows left jamb, right jamb, and lintel wall segments instead of a bare opening
2. The doorway opening is exactly the intersection width/depth of the two boxes (no floating jambs, no gaps)
3. Lintel top is at wall height (WH=20), bottom is at DOOR_HEIGHT (configurable, ≥8 units)
4. All existing Playwright tests continue to pass (28/28)
5. New Playwright test verifies that `wallMeshes.length` increases when doorway framing is present (more wall planes than without framing)

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1. Framing on shared faces | Visual screenshot via Playwright; check wallMeshes count > bare minimum |
| 2. Opening matches intersection | Mathematical verification in code + visual |
| 3. Lintel height | Code review — DOOR_HEIGHT constant |
| 4. No regressions | npm test (28/28 pass) |
| 5. New test for wall geometry | Playwright test reads window.__TEST__.state().wallMeshCount |

---

## Plan

1. Add `DOOR_HEIGHT = 10` constant (2 units above player eye height ~5, leaving headroom)
2. Add `doorwayFraming(face, span0, span1, wallFn)` helper that computes the overlap and calls `wallFn` for left jamb, right jamb, and lintel
3. In `renderDungeon`, when a face IS shared (hasN/S/E/W returns true), call the framing helper instead of skipping
4. Expose `wallMeshes.length` in `window.__TEST__.state()` as `wallMeshCount`
5. Add a Playwright test in `tests/smoke.spec.js` that checks `wallMeshCount > 20` (framing adds many segments)
6. Run `npm test` — must pass 28/28

---

## Step 2: Execution Log

- 2026-04-05: Created task file, analyzed renderDungeon code structure
- 2026-04-05: Implementing doorway framing in renderDungeon
- 2026-04-05: Added DOOR_H=10 constant, overlapN/S/E/W helpers, frameNS/frameEW helpers
- 2026-04-05: Replaced bare doorway skips with framing calls in renderDungeon loop
- 2026-04-05: Exposed wallMeshCount in window.__TEST__.state()
- 2026-04-05: Added doorway framing test to tests/smoke.spec.js
- 2026-04-05: Fixed worktree port conflict — changed playwright config to port 3001 to avoid interference from ecstatic-edison worktree vite server

---

## Step 3: Code Review & Test Results

### Code Review Notes

- [x] No dead code or commented-out blocks
- [x] No console.log in production paths
- [x] No merge conflict markers (`grep -c "<<<<<<" index.html` returns 0)
- [x] Style consistent with surrounding code
- [x] Non-obvious logic has comments explaining WHY
- [x] No regressions introduced

### Playwright Results
```
Running 29 tests using 1 worker
29 passed (3.8m)
```

### Success Criteria Results

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Framing on all shared faces | ✅ PASS | frameNS/frameEW called for every shared face |
| 2 | Opening matches intersection | ✅ PASS | overlapN/S/E/W helpers compute exact intersection span |
| 3 | Lintel height correct | ✅ PASS | DOOR_H=10 constant; lintel spans DOOR_H to WH=20 |
| 4 | 29/29 tests pass | ✅ PASS | All 29 tests pass (task added 1 new test, total 29) |
| 5 | New wall geometry test | ✅ PASS | wallMeshCount exposed; test verifies >60 wall meshes |

**All criteria pass: ✅**
