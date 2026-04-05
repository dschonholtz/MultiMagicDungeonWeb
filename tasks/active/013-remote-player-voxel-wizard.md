# Task 013: Remote Player Voxel Wizard (Death Loop Fix + Wizard Look)

**Status:** planning
**Created:** 2026-04-05

Three related issues with remote player representations:
1. **Death loop animation** — remote players appear to cycle through a death animation repeatedly
2. **Visual style** — remote players don't look like wizards (currently GLTF generic humanoid)
3. **Asset page** — no remote player character entry in `/assets` viewer

---

## Diagnosis: Why the Death Loop Happens

Remote players are managed by `MmdPlayer` which wraps `GLTFLoader` + `AnimationMixer`. When another browser tab (also running the game) connects and then goes idle/background, the browser throttles it and the WebSocket drops.

The suspected flow:
1. Remote player joins → `MmdPlayer` spawned, idle animation plays
2. Player disconnects (tab backgrounded, closed, or network drop)
3. Server broadcasts `leave` message → client calls `player.destroy()`
4. No reconnection (Task 011, H-4 finding) → player leaves and rejoins repeatedly
5. **Alternate theory**: AnimationMixer is playing a `death` clip incorrectly

### What to investigate
- Does `Character_Male_1.gltf` have a "death" clip? Which clips are available?
- What clip name is passed to AnimationMixer for remote players?
- Does the loop stop if you're the only player?

---

## Options Considered

### Option A — Fix the animation clip selection
If wrong clip name is used (death instead of idle), fix the string.
**Pros:** Minimal. **Cons:** Doesn't fix the look.

### Option B — Replace GLTF remote players with voxel wizard
Build a voxel wizard using `createVoxelAsset()`. Animate with simple math, no AnimationMixer.
**Pros:** Consistent with dragon. Removes AnimationMixer issues. Each player gets their hashed color.
**Chosen.**

### Option C — Keep GLTF but fix reconnect
**Cons:** Doesn't make them look like wizards.

---

## Voxel Wizard Design (~80 cubes)

- Hat: tall pointed shape, 4 stacked layers decreasing in size
- Head: 3×3×2 block with dot eyes  
- Robe: 3×5×2 torso, slightly flared at bottom
- Arms: 4 cubes each
- Staff: 6 cube vertical line from one hand
- Colors: `hashColor(playerId)` for robe hue, darker shade for hat, black eyes

Animation: bob + gentle y-rotation. No AnimationMixer.

---

## Success Criteria

1. Remote players show as voxel wizards, not GLTF humanoids
2. No death loop — remote players idle-bob smoothly
3. Each remote player has their hashed color on the robe
4. Voxel wizard entry in `/assets` viewer
5. All 28 Playwright tests pass

---

## Plan

1. Investigate `Character_Male_1.gltf` animation clips — find root cause of death loop
2. Design `WIZARD_VOXELS` array
3. Write `createVoxelWizard(color)` using `createVoxelAsset()`
4. Replace `new MmdPlayer(...)` with `createVoxelWizard(hashColor(id))`
5. Wire remote player bob/rotate update each frame
6. Add `'voxel-wizard'` to `assets/index.html`
7. `npm test` — 28/28
8. Commit

---

## Execution Log

*(empty — not yet started)*
