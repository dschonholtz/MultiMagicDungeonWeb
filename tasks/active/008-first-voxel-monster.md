# Task 008: First Voxel Monster

**Status:** planning
**Created:** 2026-04-05

Add the game's first enemy: a voxel-based monster built from Three.js `BoxGeometry` cubes, assembled into a Minecraft-style character. Roams the dungeon, reacts to the player's presence, and can be hit by spells.

---

## What "Voxel-Based" Means Here

Rather than smooth procedural geometry (spheres, cylinders), the monster is built entirely from rectangular `BoxGeometry` pieces — head, body, arms, legs — giving a blocky, retro look. Each body part is a separate `Mesh` parented to a group for animation (bob, walk cycle, head turn). This is the same approach as classic voxel games and is simple to implement in Three.js r128 without any external assets.

*Note: if you had a reference image in mind when you said "like this," share it and I'll match the style more precisely.*

---

## Options Considered

### Option A — Static voxel dummy (no AI)
A voxel monster mesh that stands in the dungeon. No movement, no behavior. Just proves the art style works.
**Pros:** Fast, easy to test visually.
**Cons:** Not a real monster — no gameplay.

### Option B — Patrol AI (wander + player detection)
Monster patrols between two waypoints. When the player enters a detection radius, it turns to face them. When the player leaves, it resumes patrolling.
**Pros:** Feels alive. Establishes the AI pattern for future enemies.
**Cons:** More code, requires collision/radius checks.

### Option C — Full hostile AI (patrol + chase + attack)
Monster patrols, detects player, chases, and deals damage on contact. Has health; destroyed by spells.
**Pros:** Complete gameplay loop.
**Cons:** Significant scope — health system, damage, death effects all need to be added.

**Chosen: Option B** — patrol + player detection. Enough to feel like a real monster without building the full combat system. Option C is the natural next task.

---

## Voxel Monster Design

```
Head:    BoxGeometry(2, 2, 2)        — centered at y=4
Body:    BoxGeometry(2, 3, 1)        — centered at y=1.5
L Arm:   BoxGeometry(0.8, 2.5, 0.8) — at x=-1.4, y=1.5
R Arm:   BoxGeometry(0.8, 2.5, 0.8) — at x=+1.4, y=1.5
L Leg:   BoxGeometry(0.9, 2.5, 0.9) — at x=-0.6, y=-1.25
R Leg:   BoxGeometry(0.9, 2.5, 0.9) — at x=+0.6, y=-1.25
```

Color: `MeshToonMaterial` in dark green (`0x2d6a2d`) with a slightly lighter face panel. Eyes: two small flat quads in white + black.

Animation:
- Idle: gentle y-axis bob (same as wizard)
- Walk: arms/legs swing opposite phase (left arm forward = right leg forward)

---

## Success Criteria

1. Voxel monster appears in the dungeon (at least one instance, hardcoded spawn point)
2. Monster patrols between two waypoints, walking animation plays
3. When player enters 12-unit detection radius, monster stops and faces player
4. Monster can be hit by fireball — visual response (flash red, then resume)
5. Monster has health (3 hits); on death, body parts scatter with physics then disappear
6. All 28 existing Playwright tests still pass (monster not tested in Playwright yet)

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1-3 | Manual: walk near monster, observe patrol → detection behavior |
| 4-5 | Manual: shoot fireball at monster 3× |
| 6 | `npm test` — 28/28 pass |

---

## Plan

1. Read current dungeon layout in `index.html` — find a good spawn point inside a room
2. Write `createVoxelMonster()` function returning a `THREE.Group` with all body parts
3. Write `VoxelMonster` class (or plain object) with:
   - `position`, `rotation`, `health = 3`
   - `waypoints: [Vec3, Vec3]` — patrol path
   - `state: 'patrol' | 'alert'`
   - `update(dt, playerPos)` — patrol or face-player logic
   - `takeDamage()` — flash red; decrement health; on 0, trigger scatter/death
4. Add monster to the scene in the dungeon init block
5. Call `monster.update(dt, player.position)` in the animation loop
6. Add spell hit detection: for each active spell, check distance to monster position; on hit call `monster.takeDamage()`
7. `node --check` + `grep conflict` + `npm test`
8. Commit (no deploy — awaits Step 3 sign-off)

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

---

## Deploy & Screenshots

*(empty — not yet started)*
