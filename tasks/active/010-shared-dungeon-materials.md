# Task 010: Shared Dungeon Materials (GPU Texture Fix)

**Status:** planning
**Created:** 2026-04-05

Code review finding H-2: ~180 texture clones created at load time (one per dungeon surface). Three factory functions already exist (`makeWallMat`, `makeFloorMat`, `makeCeilMat`) but are never called. This task wires them up with caching.

---

## Root Cause

`addWall()`/`addFloor()`/`addCeil()` each call `_wallTex.clone()` to get per-surface UV repeats, creating one GPU texture upload per surface. With ~30 surfaces × 6 faces = ~180 clones.

---

## Fix

Refactor the factory functions to cache by UV repeat key:

```js
const _wallMatCache = new Map();
function makeWallMat(rx, rz) {
  const key = `${rx},${rz}`;
  if (_wallMatCache.has(key)) return _wallMatCache.get(key);
  const tex = _wallTex.clone();
  tex.repeat.set(rx, rz); tex.needsUpdate = true;
  const mat = new THREE.MeshToonMaterial({ map: tex, gradientMap: _toonGrad });
  _wallMatCache.set(key, mat);
  return mat;
}
```

Result: ~180 materials → ~8 (one per unique UV repeat combination).

---

## Success Criteria

1. `makeWallMat/Floor/Ceil` are the sole material creators for dungeon surfaces
2. Material count ≤ 10 (down from ~180)
3. Dungeon appearance unchanged
4. All 28 Playwright tests pass

---

## Plan

1. Read `renderDungeon`, `addWall`, `addFloor`, `addCeil`
2. Add cache maps to factory functions
3. Update surface creators to call factory functions
4. `npm test` — 28/28
5. Commit

---

## Execution Log

*(empty — not yet started)*
