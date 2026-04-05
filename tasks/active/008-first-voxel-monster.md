# Task 008: First Voxel Monster

**Status:** planning
**Created:** 2026-04-05

Add the game's first enemy: a voxel-based monster built to match the existing wizard's aesthetic — `BoxGeometry` blocks, `MeshToonMaterial` cel-shading, dot eyes, same scale. The wizard is the reference: the monster should feel like it belongs in the same world.

---

## Style Reference

The wizard (already in game) uses:
- Large boxy head with two small black dot eyes
- Rectangular body, separate arm/leg blocks
- `MeshToonMaterial` with a gradient map for cel-shading
- Clean, flat colors — teal/green tones on the wizard

The monster should follow the exact same construction pattern but with a distinct silhouette and color that reads as "enemy." Proposed: a **red/dark-red goblin** — same proportions as the wizard but slightly shorter, wider head, angry dot eyes (closer together, tilted inward).

---

## Options Considered

### Option A — Static voxel dummy (no AI)
Just a mesh, no behavior. Proves the art style works.
**Chosen for v1? No** — not meaningful gameplay.

### Option B — Patrol AI (wander + player detection)
Patrols between two waypoints. Stops and faces player when within detection radius.
**Chosen.** Feels alive. Establishes the AI pattern for all future enemies.

### Option C — Full hostile AI (patrol + chase + attack)
Full combat loop — chase, deal damage, take damage.
**Next task** after this one is solid.

---

## Monster Design (matching wizard aesthetic)

```
Head:    BoxGeometry(2.2, 2.2, 2.2)  — y=3.8, slightly wider than wizard
Body:    BoxGeometry(2.0, 2.5, 1.0)  — y=1.5
L Arm:   BoxGeometry(0.8, 2.0, 0.8)  — x=-1.4, y=1.5
R Arm:   BoxGeometry(0.8, 2.0, 0.8)  — x=+1.4, y=1.5
L Leg:   BoxGeometry(0.9, 2.0, 0.9)  — x=-0.5, y=-0.75
R Leg:   BoxGeometry(0.9, 2.0, 0.9)  — x=+0.5, y=-0.75
Eyes:    PlaneGeometry(0.3, 0.3) ×2  — black, slightly inward-tilted (angry look)
```

Colors (`MeshToonMaterial`, same gradientMap as wizard):
- Head + body: `0x8B0000` (dark red)
- Arms + legs: `0x6B0000` (slightly darker)
- Eyes: `0x111111`

Animation (same pattern as wizard):
- Idle: gentle y-bob at 0.8× wizard speed
- Walk: arm/leg swing opposite phase, ±15° rotation

---

## Success Criteria

1. Monster appears in the dungeon matching the wizard's voxel aesthetic (BoxGeometry + MeshToonMaterial)
2. Monster patrols between two waypoints with walk animation
3. When player enters 12-unit detection radius, monster stops and faces player
4. Monster flashes bright red when hit by a fireball
5. Monster has 3 health; on death, body parts explode outward then fade
6. All 28 existing Playwright tests still pass

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1 | Screenshot — monster visible, matching toon style |
| 2-3 | Manual: walk near monster, observe patrol → alert transition |
| 4-5 | Manual: shoot fireball 3× |
| 6 | `npm test` — 28/28 pass |

---

## Plan

1. Find wizard construction code in `index.html` — use as direct template for monster geometry
2. Write `createVoxelMonster(color)` mirroring `createWizard()` structure
3. Write `VoxelMonster` update object:
   - `state: 'patrol' | 'alert'`
   - `waypoints`: two points inside the same dungeon room
   - `update(dt, playerPos)`: move toward next waypoint OR rotate to face player
   - `takeDamage()`: flash + health decrement; `die()`: scatter + fade
4. In dungeon init: spawn one monster at a hardcoded room position
5. In animation loop: call `monster.update(dt, player.position)`
6. In spell update loop: check fireball distance to monster; call `takeDamage()` on hit
7. `node --check` + `grep conflict` + `npm test`
8. Commit (no deploy)

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

---

## Deploy & Screenshots

*(empty — not yet started)*
