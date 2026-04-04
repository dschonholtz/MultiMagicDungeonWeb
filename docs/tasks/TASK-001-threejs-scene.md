# TASK-001 — Three.js Scene Setup + Player Movement

**Status:** DONE
**Phase:** 0 — Vibe Jam Skeleton
**Owner:** (unassigned)

## Goal

Establish a working Three.js scene with first-person player movement. This is the foundation all other systems build on.

## Acceptance Criteria

- [x] Three.js scene renders in browser with no console errors
- [x] Player can move with WASD (or arrow keys)
- [x] Mouse look works (pointer lock, pitch/yaw clamped)
- [x] Camera stays at player eye height (y = 1.7)
- [x] FPS is stable at 60+ on a modern laptop
- [x] Scene has ambient + directional lighting
- [x] Fog renders correctly (depth cue for dungeon atmosphere)
- [x] Window resize handled (camera aspect + renderer size update)

## Implementation Notes

- Camera: `THREE.PerspectiveCamera`, FOV 75, near 0.1, far 500
- Movement: accumulate direction from key state each frame, normalize, multiply by speed * dt
- Mouse look: `pointerlockchange` + `mousemove` events, rotation order `YXZ`
- Pitch clamped to ±(π/2 - small margin) to prevent gimbal flip

## Test Plan

1. Open `index.html` in Chrome
2. Click canvas to lock pointer
3. Hold W — verify forward movement
4. Hold S — verify backward movement
5. Hold A/D — verify strafing
6. Move mouse — verify smooth look, no flip at poles
7. Open devtools — verify zero console errors
8. Resize window — verify canvas fills viewport

## Related

- Feeds into: TASK-004 (dungeon geometry needs floor to walk on)
- Feeds into: TASK-003 (spells fired from camera direction)