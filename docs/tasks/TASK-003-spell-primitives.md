# TASK-003 — Spell Primitives (Single Player)

**Status:** DONE
**Phase:** 0 — Vibe Jam Skeleton
**Owner:** (unassigned)

## Goal

Implement three castable spell primitives as self-contained classes. Phase 0 is single-player only — no hit detection against other players.

## Spells

### Fireball (Left Click)
- Cooldown: 800ms
- Visual: glowing orange sphere
- Motion: travels forward at 25 units/s
- Lifetime: 3.0 seconds

### Frostbolt (Right Click)
- Cooldown: 1200ms
- Visual: blue-white sphere
- Motion: travels forward at 14 units/s
- Lifetime: 4.0 seconds

### Telekinesis (E key)
- Cooldown: 2000ms
- Visual: brief torus pulse
- Lifetime: 0.4 seconds

## Acceptance Criteria

- [x] MmdSpell base class has: `isReady`, `cooldownFraction`, `cast()`, `update()`, `projectiles[]`
- [x] Each spell is a separate class extending MmdSpell
- [x] Left click casts Fireball
- [x] Right click casts Frostbolt
- [x] E key casts Telekinesis
- [x] Cooldown overlays animate correctly
- [x] Projectiles despawn after their lifetime
- [x] Multiple projectiles can be in flight simultaneously
- [x] No memory leaks

## Related

- Depends on: TASK-001 (needs camera direction + scene)
- Phase 2 expansion: add onHit() collision detection