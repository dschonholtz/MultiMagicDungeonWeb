# Task 008: First Voxel Monster (Detailed — 100+ Cubes)

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — revised to use dense voxel art (~100-200 cubes) not simple box geometry

The first dungeon enemy. NOT a handful of boxes — a detailed voxel creature built from 100-200 individual `BoxGeometry` unit cubes, laid out on a 3D grid to form a recognizable, impressive shape. The wizard will eventually be replaced with the same quality of asset.

Reference: voxel dragon image shared by user (reshare if needed for exact spec).

---

## Design Philosophy

Quality voxel art uses many small uniform cubes to build up detail:
- A leg is 5-8 cubes stacked with slight offsets for taper
- A wing is a flat 6×4 grid of cubes
- A tail is a tapering line of cubes with decreasing cross-section
- Color variation between body regions adds depth

Target: **~150 cubes** for the first monster. This is well within Three.js r128 performance limits (150 meshes at ~60fps is trivial; use `InstancedMesh` grouped by color for even better perf).

---

## Technical Approach

```js
// All voxels defined as [x, y, z, colorHex] in local space
// Unit cube size: 0.4 world units
const CREATURE_VOXELS = [ /* 100-200 entries */ ];

function createVoxelCreature(voxels, cubeSize = 0.4) {
  // Group by color for InstancedMesh batching
  const byColor = new Map();
  for (const [x, y, z, color] of voxels) {
    if (!byColor.has(color)) byColor.set(color, []);
    byColor.get(color).push([x, y, z]);
  }
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  for (const [color, positions] of byColor) {
    const mesh = new THREE.InstancedMesh(geo,
      new THREE.MeshToonMaterial({ color, gradientMap: _toonGrad }),
      positions.length);
    positions.forEach(([x, y, z], i) => {
      const m = new THREE.Matrix4().setPosition(x * cubeSize, y * cubeSize, z * cubeSize);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);
  }
  return group;
}
```

This renders 150 cubes in ~5 draw calls (one per color) instead of 150.

---

## Monster Shape

If the dragon reference image is reshared, match it exactly. Otherwise, build a detailed voxel goblin with:
- Head: 3×3×2 block with yellow eyes, white teeth
- Ears: angled spike cubes
- Body: 3×4×2 torso with darker side cubes
- Arms: 8 cubes each, tapering to claw points
- Legs: 10 cubes each, wider thigh to narrower foot
- Back spines: row of decreasing-height spike cubes
- ~120 cubes total, 5 colors

---

## Animation

- **Idle bob**: entire group ±0.1 at 1.2Hz
- **Alert**: group rotates to face player (lerp)
- **Walk**: arm/leg groups swing ±20° at walk speed, opposite phase

---

## Success Criteria

1. Visibly detailed voxel creature (~100+ cubes), clearly an enemy
2. Patrols between two waypoints with walk animation
3. Stops and faces player within 12-unit detection radius
4. Flashes on fireball hit; 3 health; cube-scatter death animation
5. All 28 Playwright tests still pass

---

## Plan

1. Read wizard code for `_toonGrad`, material setup, scene attachment
2. Define the full voxel array — spend time on shape quality
3. Write `createVoxelCreature()` using `InstancedMesh` per color
4. Write `VoxelMonster` (patrol/alert/takeDamage/die)
5. Spawn in dungeon, wire into animation loop + spell hit detection
6. `node --check` + `npm test` — 28/28
7. Commit

---

## Execution Log

*(empty — not yet started)*
