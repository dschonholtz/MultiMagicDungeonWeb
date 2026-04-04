# TASK-004 — Dungeon Room Geometry

**Status:** DONE
**Phase:** 0 — Vibe Jam Skeleton
**Owner:** (unassigned)

## Goal

Build a dungeon environment with entry chamber, corridor, and treasure chamber. Atmosphere via procedural textures and flickering torch lights.

## Acceptance Criteria

- [x] Entry chamber: 20×50 units with stone floor + walls + ceiling
- [x] Corridor connecting chamber to treasure room
- [x] Treasure chamber: 24×24 units with 4 pillars
- [x] Stone floor texture: procedural canvas
- [x] Stone wall texture: procedural canvas
- [x] Ceiling: dark flat color
- [x] Torch lights: orange PointLight on side walls, flickering
- [x] Fog: THREE.Fog(0x0a0005, 20, 80)
- [x] Scene background: 0x0a0005
- [x] Ambient + directional light set for dungeon feel

## Implementation Notes

- Procedural textures via HTMLCanvasElement + THREE.CanvasTexture
- Torches flicker via random intensity each frame
- Wall/floor geometry: BoxGeometry boxes
- MmdDungeon class stores all lights

## Related

- Depends on: TASK-001 (needs scene object)
- Supports: TASK-002 (portal placed in dungeon geometry)
- Phase 2: replace BoxGeometry with tile-based dungeon builder