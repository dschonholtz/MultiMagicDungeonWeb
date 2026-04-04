# TASK-004 — Dungeon Room Geometry

**Status**: PLANNED  
**Phase**: 0 — Vibe Jam Skeleton

## Goal

Procedural dungeon geometry with at least 3 connected rooms, navigable corridors, atmospheric lighting, and basic wall collision so the player cannot walk through walls.

## Acceptance Criteria

- [ ] At least 3 distinct rooms connected by corridors
- [ ] Each room has floor, ceiling, and 4 walls
- [ ] Corridors connect rooms and are also enclosed (floor + ceiling + side walls)
- [ ] Player cannot walk through walls (collision detection)
- [ ] Atmosphere feels dungeon-like: dark, foggy, warm torch points + cool magic points
- [ ] At least 4 decorative pillars in the main hall
- [ ] Performance: scene renders at 60fps with fog and lighting on a mid-range laptop

## Room Layout (Phase 0)

```
[West Wing] ←corridor← [Main Hall] →corridor→ [East Wing]
                             ↑
                          corridor
                             ↑
                      [North Chamber]
```

Coordinates (approximate):
- Main Hall: 80×60 units centered at (0, 0)
- East Wing: 50×40 at (80, 0)
- West Wing: 50×40 at (-80, 0)
- North Chamber: 60×50 at (0, -80)

## Collision Implementation

Phase 0 uses simple AABB collision: after moving, check if the player's XZ position is inside any valid room or corridor AABB. If not, revert the move.

In Phase 1 this will be replaced with Three.js raycasting against wall meshes.

## Atmosphere Notes

- Fog: `THREE.Fog(0x0a0608, 30, 200)` — dark reddish-black, starts at 30 units
- Main ambient: `0x221122` (dim purple-black)
- Torch 1: `0xff6600` orange, intensity 1.5, range 60 — flickers via sine
- Torch 2: `0x4444ff` blue, intensity 1.0, range 60 — flickers offset from torch 1
- Wall material: `0x4a4055` (muted purple-grey stone)
- Floor material: `0x2a2030` (darker stone)
- Ceiling material: `0x1a1020` (near-black)

## Test Plan

1. Open `index.html`, enter dungeon
2. Walk through all 4 rooms — verify connected and navigable
3. Walk directly into a wall — player should stop, not pass through
4. Walk into a corridor — verify ceiling and side walls are present
5. Check pillars are visible in main hall
6. Open DevTools Performance panel — verify 60fps

## Dependencies

- TASK-001 (player movement)

## Blocked By

Nothing — geometry can be built without spells or portals.
