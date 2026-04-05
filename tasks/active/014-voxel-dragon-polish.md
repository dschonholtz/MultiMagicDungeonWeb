# Task 014: Voxel Dragon Polish

**Status:** planning
**Created:** 2026-04-05

Visual polish pass on the Azure Horn Dragon before it becomes an active dungeon enemy.

---

## Known Gaps

- No `gradientMap` → looks flat vs the cel-shaded toon aesthetic everywhere else
- Eyes hard to see (2 black cubes, needs sclera + pupils)
- Wings could be more distinct
- No spine spikes
- Body is all one navy tone (no dorsal/ventral contrast)

---

## Chosen Approach: Polish pass based on user reference screenshot

1. Add `gradientMap: _toonGrad` to all dragon materials
2. Spine spikes (decreasing-height row down back)
3. Eyes: white sclera cube behind black pupil cube
4. Wing membrane cubes (more coverage, distinct wing shape)
5. Belly lighter than dorsal surface
6. Update both `assets/index.html` and `index.html`

---

## Success Criteria

1. Dragon uses `gradientMap` — matches dungeon toon style
2. Eyes clearly visible
3. Spine spikes present
4. Belly/underside lighter than dorsal
5. Both asset viewer and main game use updated voxels
6. 28/28 tests pass

---

## Reference Image

*(User-provided screenshot — attach when received)*

---

## Execution Log

*(empty — not yet started)*
