# Task 013: Remote Player Voxel Wizard (Death Loop Fix + Wizard Look)

**Status:** planning
**Created:** 2026-04-05

Three related issues with remote player representations:
1. **Death loop animation** — remote players appear to cycle through a death animation repeatedly
2. **Visual style** — remote players don't look like wizards (currently GLTF generic humanoid)
3. **Asset page** — no remote player character entry in `/assets` viewer

---

## Diagnosis: Why the Death Loop Happens

Remote players are managed by `MmdPlayer` which wraps `GLTFLoader` + `AnimationMixer`. When another browser tab (also running the game) connects and then goes idle/background, the browser throttles it and the WebSocket drops. Without reconnection (Task 011, H-4 finding), the server sees the player leave.

The suspected flow:
1. Remote player joins → `MmdPlayer` spawned, idle animation plays
2. Player disconnects (tab backgrounded, closed, or network drop)
3. Server broadcasts `leave` message → client calls `player.destroy()` or similar
4. No reconnection on the remote side → player leaves and rejoins repeatedly if tab is alive but unstable
5. **Alternate theory**: `AnimationMixer` has a `death` clip in `Character_Male_1.gltf` that's being incorrectly triggered — every player might be running the wrong clip

### What to investigate
- Does `Character_Male_1.gltf` have a "death" clip? Which clip names are available?
- What animation name is passed to `AnimationMixer` for remote players?
- Is the death loop happening for ALL remote players, or only ones that recently connected/disconnected?
- Does the loop stop if you're the only player (no other tabs)?

---

## Options Considered

### Option A — Fix the animation clip selection
If the wrong clip is being played (e.g. death instead of idle/walk), find and fix the clip name string.
**Pros:** Minimal change. If this is the cause, one-line fix.
**Cons:** Doesn't address the look.

### Option B — Replace GLTF remote players with voxel wizard
Build a voxel wizard character (same construction as the dragon — `createVoxelAsset()` with `InstancedMesh` per color) and use it for remote players instead of the GLTF model. Animate with simple bob/walk math, no AnimationMixer.
**Pros:** Consistent visual style with the dragon. Removes GLTF animation clip issues entirely. Each player gets a distinct toon color (already hashed from their ID). No AnimationMixer dependency.
**Cons:** More work. Requires designing the wizard voxel shape.

### Option C — Keep GLTF but fix reconnect to stop the death loop
Implement Task 011 (WebSocket reconnection) so remote players don't repeatedly die/rejoin.
**Pros:** Keeps the existing model quality.
**Cons:** Doesn't make them look like wizards. Reconnect alone may not fix the animation bug.

**Chosen: Option B** — replace GLTF remote players with a voxel wizard character. This fixes the animation issue by removing AnimationMixer entirely, makes visuals consistent with the dragon, and gives each player a colored wizard that matches the game's aesthetic.

---

## Voxel Wizard Design

Reuse `createVoxelAsset()` from the dragon PR. Design a wizard character ~80 cubes:

```
Hat:      tall pointed cone shape — 4 stacked layers decreasing x,z
Head:     3×3×2 block with dot eyes
Robe:     3×5×2 torso, slightly flared at bottom
Arms:     4 cubes each, angled down
Staff:    6 cube vertical line extending from one hand
Feet:     flat 2×1 pads
```

Colors: use existing `hashColor(playerId)` for the robe hue. Hat = darker shade of same. Eyes = black. Staff = brown.

Animation: bob up/down + gentle y-rotation (no AnimationMixer needed).

---

## Asset Page Entry

Add `'voxel-wizard'` entry to `assetDefs` in `assets/index.html` alongside the dragon. Show the default purple wizard.

---

## Success Criteria

1. Remote players show as voxel wizards, not GLTF humanoids
2. No death loop animation — remote players idle-bob smoothly
3. Each remote player has their hashed color applied to the robe
4. Voxel wizard entry appears in `/assets` viewer
5. All 28 Playwright tests pass

---

## Plan

1. Investigate `Character_Male_1.gltf` — list animation clip names, find what's being played for remote players
2. If it's an animation clip bug, note it; then proceed with voxel replacement regardless
3. Design `WIZARD_VOXELS` array using `createVoxelAsset()` pattern
4. Write `createVoxelWizard(color)` → calls `createVoxelAsset` with wizard palette, robe tinted by `color`
5. Replace `new MmdPlayer(...)` calls with `createVoxelWizard(hashColor(id))`
6. Wire remote player update to bob/rotate the group each frame
7. Add `'voxel-wizard'` to `assets/index.html` asset list
8. `npm test` — 28/28 pass
9. Commit

---

## Execution Log

*(empty — not yet started)*
