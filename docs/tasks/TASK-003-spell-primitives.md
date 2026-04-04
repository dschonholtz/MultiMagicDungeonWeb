# TASK-003 — Spell Primitives

**Status**: PLANNED  
**Phase**: 0 — Vibe Jam Skeleton

## Goal

Three castable spell primitives with real projectile behavior and distinct visual identities. All spells are single-player in Phase 0 (no server-side hit detection yet).

## Spells

### Fireball (Left Click)
- Fast projectile (speed: 0.7 units/frame)
- Orange glowing sphere, radius 0.8
- Travels forward from camera direction
- Destroys after 80 frames or on wall contact
- On hit: brief flash effect at impact point

### Frostbolt (Right Click)
- Slower projectile (speed: 0.4 units/frame)
- Blue glowing sphere, radius 0.6
- Longer lifetime (120 frames)
- On hit: leave a small icy patch mesh at impact point (visual only in Phase 0)

### Telekinesis (E key)
- Raycast from camera, max range 30 units
- If a physics-tagged object is in range, pull it toward the player
- In Phase 0: pulls loose prop objects (future: pull other players)
- Visual: purple beam while held (key held = beam active)

## Acceptance Criteria

- [ ] Fireball fires on left click when pointer is locked, travels forward, disappears on timeout
- [ ] Frostbolt fires on right click, visually distinct from fireball (color + speed)
- [ ] Telekinesis fires on E key, shows raycast beam in scene
- [ ] Each spell has a cooldown (Fireball: 40f, Frostbolt: 60f, Telekinesis: 90f)
- [ ] Cooldown is reflected in the HUD spell slot (dimmed + opacity 0.5 while cooling)
- [ ] Spells are removed from the scene when their lifetime expires
- [ ] No memory leaks: spell meshes and lights are removed on destroy

## Implementation Notes

- Extend the `MmdSpell` base class already stubbed in `index.html`
- Each spell adds a `THREE.PointLight` as a child of its mesh for glow
- Collision detection in Phase 0: simple bounding box check against room extents
- Do NOT implement player-vs-player hit detection here — that's Phase 1

## Test Plan

1. Enter dungeon, click canvas to lock pointer
2. Left click — fireball fires forward, travels, disappears
3. Right click — frostbolt fires, visually slower and blue
4. Press E — telekinesis beam appears briefly
5. Fire rapidly — verify cooldown prevents spam (HUD dims)
6. Check DevTools memory: spell projectile count should not grow unboundedly

## Dependencies

- TASK-001 (pointer lock + camera direction)

## Blocked By

Nothing — can be developed in parallel with TASK-002.
