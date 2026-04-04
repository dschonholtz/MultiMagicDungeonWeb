# MultiMagicDungeonWeb — Architecture

## File Structure

### Phase 0 (current): monolith

All game code lives in `index.html` for Vibe Jam simplicity. No build step, no module bundler, no separate files. This is intentional — the game must be openable as a raw file.

```
index.html          # Three.js scene, player, portals, spells, HUD, all in one
```

### Phase 1: module split

When the WebSocket server is added, the client code will be split into ES modules and bundled with Vite:

```
src/
  systems/
    renderer.js       # Three.js setup, scene, lighting
    player.js         # MmdPlayer: movement, pointer lock, camera
    dungeon.js        # MmdDungeon: room geometry, corridors, collision
    network.js        # MmdNetwork: WebSocket client, send/recv
  spells/
    MmdSpell.js       # Base class + projectile physics
    Fireball.js
    Frostbolt.js
    Telekinesis.js
  portals/
    MmdPortal.js      # Portal geometry, glow, label
    portal-system.js  # URL param parsing, travel logic
  dungeon/
    MmdRoom.js        # Single room geometry
    MmdCorridor.js    # Connecting corridor
    MmdBuilder.js     # Dungeon builder editor (Phase 2)
  ui/
    hud.js            # Health bar, spell slots, cooldowns
    name-screen.js    # Entry name prompt
  main.js             # Game loop, ties systems together
index.html            # Shell: imports main.js, no inline JS
```

## Spell Primitive Interface

Every spell implements this interface:

```js
class MmdSpell {
  constructor(type, position, direction) { ... }
  update()  { ... }   // called every frame; move projectile, check lifetime
  onHit(target) { ... } // called when collision detected
  destroy() { ... }   // remove from scene, mark alive=false
}
```

The game loop only calls `update()` and checks `alive`. Everything else is internal to the spell.

## Portal Data Flow

### Incoming (arriving from another game)

URL params parsed on load:
```
?portal=true        → skip name screen, use username param
&ref=hostname       → origin game hostname (used for red "return" portal)
&username=Wizard    → player name
&color=white        → cosmetic (future: player model tint)
&speed=0.9          → movement speed modifier
&hp=80              → starting HP (carry-over from previous game)
```

These are applied to `MmdPlayer` state immediately. A red "return" portal spawns at the player's start position after a short delay (so they can't immediately teleport back).

### Outgoing (leaving to another game)

When the player enters the green exit portal, we build the outgoing URL:
```
https://jam.pieter.com/portal/2026
  ?portal=true
  &ref=<window.location.hostname>
  &username=<playerName>
  &color=white
  &speed=<currentSpeed>
  &hp=<currentHp>
```

`window.location.href` is set to this URL, triggering navigation.

## Multiplayer Model (Phase 1)

The server is authoritative for:
- Player health (spell hits are validated server-side)
- Dungeon state (room layout, trap positions)

The client is authoritative for:
- Local player movement (predicted, reconciled at 20hz)
- Visual effects (spell trails, portal glow — not synced)

### Message types

| Type | Direction | Payload |
|---|---|---|
| `join` | C→S | `{ dungeonId, username, hp }` |
| `state` | S→C | `{ players: [{id, pos, rot, hp}] }` |
| `move` | C→S | `{ pos, rot }` |
| `spell_cast` | C→S | `{ type, pos, dir }` |
| `spell_hit` | S→C | `{ spellId, targetId, damage }` |
| `leave` | C→S | `{}` |

## Three.js Scene Graph

```
Scene
├── AmbientLight
├── DirectionalLight
├── PointLight (torch 1 — warm orange, flickering)
├── PointLight (torch 2 — cool blue, flickering)
├── Dungeon group
│   ├── Room meshes (floors, ceilings, walls)
│   ├── Corridor meshes
│   └── Pillar meshes
├── Portal group (exit — green)
│   ├── TorusGeometry (ring)
│   ├── CircleGeometry (inner fill)
│   ├── Label sprite
│   └── PointLight (glow)
├── Portal group (start — red, conditional)
└── Spell projectiles (dynamic, added/removed each frame)
```

Camera is attached directly to the player position — not parented to any scene node — to keep the movement code simple in Phase 0.
