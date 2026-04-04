# ARCHITECTURE.md — MultiMagicDungeonWeb

## File Structure (Phase 1 target)

Phase 0 puts everything in `index.html`. Phase 1 splits it into ES modules:

```
MultiMagicDungeonWeb/
├── index.html              # Entry point — imports main.js, renders canvas + HUD
├── src/
│   ├── main.js             # MmdGame bootstrap, game loop
│   ├── systems/
│   │   ├── MmdGame.js      # Scene, renderer, clock, top-level update loop
│   │   ├── MmdPlayer.js    # Camera, movement, input, HP, spell dispatch
│   │   └── MmdDungeon.js   # Room geometry, torch lights, collision meshes
│   ├── spells/
│   │   ├── MmdSpell.js     # Base class: cast(), update(), onHit()
│   │   ├── MmdFireball.js  # Orange sphere, fast, direct damage
│   │   ├── MmdFrostbolt.js # Blue sphere, slow effect on hit
│   │   └── MmdTelekinesis.js # Raycast pull (Phase 2)
│   ├── portals/
│   │   └── MmdPortal.js    # Vibe Jam portal system (read/write URL params)
│   ├── ui/
│   │   ├── MmdHUD.js       # Health bar, spell cooldowns, portal indicator
│   │   └── MmdStartScreen.js # Name entry, start button
│   └── network/            # Phase 1
│       ├── MmdSocket.js    # WebSocket client wrapper
│       └── MmdNetPlayer.js # Remote player representation
└── server/                 # Phase 1
    └── index.js            # Node.js WebSocket server
```

## Spell Primitive Model

Every spell implements this interface:

```js
class MmdSpell {
  constructor(name, cooldownMs) { ... }

  // Attempt to cast. Returns false if on cooldown.
  cast(camera, scene) { ... }

  // Called every frame. Moves projectiles, checks lifetime.
  update(dt, scene) { ... }

  // Called when a projectile hits a target (Phase 2).
  // target: { hp, position, applyDebuff }
  onHit(target) { ... }
}
```

Spells are designed to be **composable**: a modifier system (Phase 4) can wrap a spell and change its behavior without modifying the original class.

## Portal Data Flow

### Incoming (player arrives via portal)
```
URL: ?portal=true&ref=othergame.com&username=alice&color=white&speed=5.2&hp=80&rotation_y=1.57

→ MmdPortal reads params on construction
→ Skips start screen (portal=true)
→ Applies username, hp to MmdPlayer
→ Spawns RED start portal at spawn point (ref present)
→ 5-second delay on start portal collision
→ Shows "Arrived from: othergame.com" in HUD
```

### Outgoing (player walks into exit portal)
```
MmdPortal._exitToJam(playerState) called when distance < 2 units

→ Builds params: portal=true, ref=window.location.hostname,
                 username, color=white, speed, hp
→ window.location.href = https://jam.pieter.com/portal/2026?{params}
```

### Start portal return
```
Player walks into red portal (after 5s delay)

→ MmdPortal._returnToRef(playerState) called
→ Builds params: portal=true, username, color, speed, hp
  (note: ref is NOT forwarded — prevents loops)
→ window.location.href = {refUrl}?{params}
```

## Multiplayer Model (Phase 1)

Architecture: **Authoritative server, client-side prediction**

```
Client                          Server
──────                          ──────
Input (WASD, mouse)
  → predict local position
  → send InputMessage { seq, keys, yaw, dt }
                                receive InputMessage
                                simulate authoritative position
                                → send StateMessage { seq, positions[] }
  receive StateMessage
  → reconcile local position (if diff > threshold)
  → interpolate remote players
```

**Session model:**
- Server maintains one Room per dungeon session (max 8 players)
- Players join a room by dungeon ID (Phase 2) or open lobby (Phase 1)
- Server sends full state at 20 Hz, clients render at display FPS with interpolation

**Spell sync:**
- Client sends SpellCastMessage { spellType, origin, direction }
- Server validates cooldown + spawns authoritative projectile
- Server broadcasts ProjectileUpdateMessage to all clients in room
- Projectile hit detection is server-side (Phase 2)

## State Machine (Player)

```
IDLE → MOVING (WASD input)
     → CASTING (spell key)
     → DEAD (HP ≤ 0)
     → IN_PORTAL (distance to portal < 2)

DEAD → IDLE (respawn after 5s)
IN_PORTAL → (redirected, state machine exits)
```