# Skill: Add a New Spell

The `SPELL_DEFS` registry in `index.html` is the single source of truth for all spells.

## Step 1: Add to SPELL_DEFS

```javascript
const SPELL_DEFS = {
  fireball:    { color: 0xff6600, size: 0.8, speed: 22,  maxLifeMs: 1333, cooldownMs:  666, icon: '🔥', label: 'Fireball',    key: '1' },
  frostbolt:   { color: 0x44aaff, size: 0.6, speed: 14,  maxLifeMs: 2000, cooldownMs: 1000, icon: '❄️',  label: 'Frostbolt',   key: '2' },
  telekinesis: { color: 0xaa44ff, size: 1.0, speed: 18,  maxLifeMs: 1667, cooldownMs: 1500, icon: '🔮', label: 'Telekinesis', key: '3' },

  // New spell:
  lightning:   { color: 0xffff44, size: 0.4, speed: 40,  maxLifeMs:  600, cooldownMs:  400, icon: '⚡', label: 'Lightning',   key: '4' },
};
```

### Field reference

| Field | Type | Description |
|---|---|---|
| color | hex int | Projectile color |
| size | float | Sphere radius |
| speed | float | Units/second |
| maxLifeMs | int | Ms before expiry |
| cooldownMs | int | Ms between casts |
| icon | string | Emoji for HUD |
| label | string | Display name |
| key | string | Keyboard key ('1'–'9') |

## Step 2: Add to server allowlist

In `server/lib/MessageHandler.js`:

```javascript
_onSpellCast(ws, msg) {
  const ALLOWED = ['fireball', 'frostbolt', 'telekinesis', 'lightning']; // add here
  if (!ALLOWED.includes(msg.type)) return;
  // ...
}
```

## Step 3: Test

1. Start server + open game (see `test-multiplayer/SKILL.md`)
2. Press the key from `SPELL_DEFS.key`
3. Verify: correct color, speed, cooldown, visible in second browser tab

## Advanced: custom behavior

Add a `behavior` field and handle it in `MmdSpell.update(dt)`:

```javascript
// SPELL_DEFS entry:
homing: { ..., behavior: 'homing' }

// MmdSpell.update(dt):
update(dt) {
  if (this.def.behavior === 'homing' && this.target) {
    const dir = this.target.position.clone().sub(this.mesh.position).normalize();
    this.direction.lerp(dir, dt * 3);
  }
  this.mesh.position.addScaledVector(this.direction, this.def.speed * dt);
  this.lifeMs += dt * 1000;
  return this.lifeMs > this.def.maxLifeMs;
}
```

## Particle effects (future pattern)

Attach sub-mesh to `this.mesh` in `MmdSpell` constructor, update in `update(dt)`, dispose via `scene.remove` + `.dispose()` on expiry. Keep effect geometry cheap — under 50 tris per spell in flight.
