# TASK-001 — Three.js Scene + FPS Player Movement

**Status**: IN_PROGRESS  
**Phase**: 0 — Vibe Jam Skeleton

## Goal

A working Three.js FPS scene where the player can move freely through the dungeon with WASD and look around with the mouse.

## Acceptance Criteria

- [ ] Three.js scene renders without console errors
- [ ] Player can move with WASD / arrow keys
- [ ] Mouse look works via Pointer Lock API
- [ ] Player height is fixed (no gravity needed in Phase 0)
- [ ] Frame rate is acceptable (60fps on a mid-range laptop)
- [ ] Scene has basic dungeon atmosphere: dark, foggy, lit by point lights

## Implementation Notes

- Use `THREE.PerspectiveCamera` with FOV 75
- Apply yaw/pitch directly to `camera.rotation` using `YXZ` order (standard FPS)
- Pitch clamp: `-Math.PI/3` to `Math.PI/3` (prevents flipping)
- Movement direction is computed from yaw only (no pitch affecting movement)
- Player Y is fixed to `PLAYER_HEIGHT = 5` (units above floor)
- Fog: `THREE.Fog(0x0a0608, 30, 200)` — matches dungeon color

## Test Plan

1. Open `index.html` in browser
2. Enter a name and click "Enter Dungeon"
3. Click canvas to request pointer lock
4. Verify WASD moves the player (check position via `window.game.camera.position`)
5. Verify mouse rotates view smoothly
6. Open DevTools console — verify zero errors

## Dependencies

None — this is the base task.

## Blocked By

Nothing.
