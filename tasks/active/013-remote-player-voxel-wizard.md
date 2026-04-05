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

### Option A — Fix the animation clip selection only
If wrong clip name is used (death instead of idle), fix the string.
**Pros:** Minimal, preserves GLTF look. **Cons:** Doesn't add wizard style.

### Option B — Add voxel wizard alongside GLTF (CHOSEN)
Build `createVoxelWizard(color)` using `createVoxelAsset()`. Wire it up as the remote player
representation. **Keep the GLTF code intact** — don't delete `MmdPlayer` or the GLTF loader.
Comment it out / gate it with a `USE_VOXEL_PLAYERS` flag so it can be toggled back easily.
**Pros:** Wizard look, no AnimationMixer death loop, each player gets hashed color, GLTF preserved.
**Cons:** Two code paths to maintain (acceptable short-term).

### Option C — Keep GLTF, fix reconnect instead
**Cons:** Doesn't make them look like wizards. WS reconnect is Task 011.

---

## Important: Preserve the GLTF Player

**Do NOT delete `MmdPlayer` or the GLTF loading code.**
The GLTF humanoid may be useful again (e.g. for NPCs, cutscenes, or if voxel wizard is reverted).
Gate with a flag at the top of the remote-player section:

```js
const USE_VOXEL_PLAYERS = true; // set false to revert to GLTF MmdPlayer
```

When `USE_VOXEL_PLAYERS` is true, spawn `createVoxelWizard(hashColor(id))`.
When false, fall through to the existing `new MmdPlayer(...)` path.

---

## Voxel Wizard Design (~80 cubes)

- Hat: tall pointed shape, 4 stacked layers decreasing in size
- Head: 3×3×2 block with dot eyes
- Robe: 3×5×2 torso, slightly flared at bottom
- Arms: 4 cubes each
- Staff: 6 cube vertical line from one hand
- Colors: `hashColor(playerId)` for robe hue, darker shade for hat, black eyes

Animation: bob + gentle y-rotation using frame time math. No AnimationMixer.

---

## Success Criteria

1. Remote players show as voxel wizards when `USE_VOXEL_PLAYERS = true`
2. No death loop — remote players idle-bob smoothly
3. Each remote player has their hashed color on the robe
4. Voxel wizard entry in `/assets` viewer
5. GLTF `MmdPlayer` code preserved and reachable via flag
6. All 28 Playwright tests pass

---

## Plan

1. Investigate `Character_Male_1.gltf` animation clips — find root cause of death loop
2. Design `WIZARD_VOXELS` array (~80 cubes)
3. Write `createVoxelWizard(color)` using `createVoxelAsset()`
4. Add `USE_VOXEL_PLAYERS` flag; gate spawn logic
5. Preserve existing `MmdPlayer` path under the flag (comment, don't delete)
6. Wire remote player bob/rotate update each frame
7. Add `'voxel-wizard'` entry to `assets/index.html`
8. `npm test` — 28/28
9. Commit

---

## Execution Log

*(empty — not yet started)*
