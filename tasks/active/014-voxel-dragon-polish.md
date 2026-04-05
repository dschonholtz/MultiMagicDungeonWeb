# Task 014: Voxel Dragon Polish

**Status:** planning
**Created:** 2026-04-05

The Codex-built Azure Horn Dragon is a good start but needs visual polish before it goes into the dungeon as an active enemy. Reference screenshot shared by user (see uploads).

---

## Current State (from asset viewer)

The dragon has:
- Dark navy body with cyan underbelly/belly strip
- Tan horns (large swept-back)
- Wing-like extensions on the sides
- Leg stumps with claws
- Tail extending behind
- Uses `MeshToonMaterial` **without** `gradientMap` — looks flat, not cel-shaded

Known gaps:
- No `gradientMap` → doesn't match wizard/dungeon toon aesthetic (all other materials use `_toonGrad`)
- Wing detail could be improved (currently just horn-colored sweeps)
- Eyes could be more prominent (currently 2 black cubes, hard to see)
- Belly cyan strip could be more defined
- No variation between body top (darker) and sides (lighter) — all one navy color

---

## Options Considered

### Option A — Add gradientMap + palette tweaks only
Add `gradientMap: _toonGrad` to all dragon materials. Adjust colors slightly for better contrast.
**Pros:** Minimal change, fast.
**Cons:** Doesn't fix structural issues with wings/eyes.

### Option B — Full polish pass
- Add gradientMap to all materials
- Refine wing shape (more distinct wingtip, membrane cubes)
- Make eyes more prominent (larger white sclera cubes + small black pupils)
- Add nostril cubes
- Add belly stripe with more coverage
- Differentiate dorsal (top) vs. ventral (bottom) colors
- Add spike row down the spine
**Pros:** Significantly better visual quality.
**Cons:** More work, but still just editing the voxel coordinate array.

### Option C — Full redesign based on user reference screenshot
Use the reference image as a precise guide to rebuild the dragon's proportions and color layout.
**Chosen** — reference screenshot drives the design. Polish pass adjusts what's there + adds gradientMap.

---

## Success Criteria

1. Dragon in asset viewer uses `gradientMap` matching the dungeon's toon style
2. Eyes are clearly visible and expressive
3. Wing shape is distinct and recognizable
4. Spine spikes added for menace
5. Belly/underside clearly lighter than dorsal surface
6. Dragon in `assets/` viewer shows the improved version
7. Dragon in main game (`index.html`) uses same updated voxels

---

## Plan

1. Read reference screenshot closely (will be added to this task when received)
2. Read current `buildVoxelDragonVoxels()` in `assets/index.html` and `index.html`
3. Add `gradientMap` to all `MeshToonMaterial` instances in `createVoxelAsset()`
4. Polish voxel positions based on reference:
   - Spine spikes
   - Eye prominence
   - Wing membrane cubes
   - Belly definition
5. Update both `assets/index.html` and `index.html` to use refined voxels
6. `npm test` — 28/28 pass
7. Commit

---

## Reference Image

*(Attach user-provided screenshot here when received)*

---

## Execution Log

*(empty — not yet started)*
