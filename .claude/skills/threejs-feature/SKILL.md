# Skill: Add a Three.js Feature to MultiMagicDungeonWeb

This game is a **single monolithic `index.html`** — no build step, no bundler. Everything lives in one file.

## File structure inside index.html

```
<html>
  <head> ... styles ... </head>
  <body>
    <!-- HUD overlay divs: #hud, #rename-panel, etc. -->
    <canvas id="c"></canvas>
    <script type="module">
      // === CONSTANTS (WS_URL, PLAYER_SPEED, HP_MAX, etc.) ===
      // === GLOBALS (scene, camera, renderer, clock) ===
      // === SPELL_DEFS registry ===
      // === DungeonLayout + renderDungeon() ===
      // === MmdPlayer class ===
      // === MmdSpell class ===
      // === MmdNetworkClient class ===
      // === PORTAL setup ===
      // === INPUT handlers (keydown, mousemove, pointerlock) ===
      // === animate() loop ===
      // === INIT (scene, lighting, dungeon, net.connect) ===
    </script>
  </body>
</html>
```

## Key globals

```javascript
const scene         // THREE.Scene
const camera        // THREE.PerspectiveCamera
const renderer      // THREE.WebGLRenderer
const clock         // THREE.Clock — use clock.getDelta() for dt each frame
const keys          // Set<string> of currently pressed keys
let   localPlayer   // MmdPlayer (local)
const remotePlayers // Map<playerId, MmdPlayer>
const spells        // Array<MmdSpell>
const net           // MmdNetworkClient
```

## Adding a new visual element

1. Create geometry + material + mesh
2. `scene.add(mesh)`
3. If animated: add to `animate()` loop
4. On removal: `scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose()`

## The animate() loop — where to add per-frame logic

```javascript
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1); // capped — prevents spiral of death

  if (localPlayer) localPlayer.updateLocal(dt, keys, yaw, pitch);
  remotePlayers.forEach(p => p.interpolate(dt));

  for (let i = spells.length - 1; i >= 0; i--) {
    if (spells[i].update(dt)) spells.splice(i, 1);
  }

  // Portal animations live here — ADD NEW PER-FRAME WORK HERE
  // ...

  renderer.render(scene, camera);
}
```

## Adding a new spell type

Add one entry to `SPELL_DEFS` (see `spell-template/SKILL.md`).

## Adding a new HUD element

1. Add HTML inside `<body>` (not inside canvas)
2. CSS: `position: fixed`, high `z-index`, `pointer-events: none` unless clickable
3. Update from JS: `document.getElementById('my-el').textContent = ...`

## Lighting setup (don't change without good reason)

```javascript
new THREE.AmbientLight(0xffffff, 0.4)        // soft fill
new THREE.DirectionalLight(0xffffff, 0.8)    // main light from above
```

`MeshToonMaterial` requires at least one `DirectionalLight` to show cel-shading bands.

## Remote player materials

Remote players use `MeshToonMaterial` with a shared gradient map:

```javascript
// Shared across all remote player instances (defined once at top of script)
const gradientData = new Uint8Array([90, 160, 255]);
const gradientMap = new THREE.DataTexture(gradientData, 3, 1, THREE.LuminanceFormat);
gradientMap.needsUpdate = true;

// Per-player usage in MmdPlayer constructor:
new THREE.MeshToonMaterial({ color, gradientMap, flatShading: true })
```

Outlines use BackSide clones scaled 1.05x with `MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })`.

## Per-player color from ID hash

```javascript
function hashColor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const hue = (h % 360) / 360;
  return {
    body: new THREE.Color().setHSL(hue, 0.7, 0.5),
    head: new THREE.Color().setHSL(hue, 0.6, 0.65),
    legs: new THREE.Color().setHSL(hue, 0.7, 0.35),
  };
}
```

## Coordinate system
- Y is up; dungeon floor at Y=0
- Local player eye height: `PLAYER_HEIGHT` (~5 units)
- Portal trigger uses `dist2D(a, b)` — XZ plane only, not 3D distance

## Common gotchas
- **Delta time**: always use `dt` from `clock.getDelta()`, never frame counts
- **Memory leaks**: dispose geometry and material when removing meshes
- **Script type**: `<script type="module">` — top-level `await` is fine
- **No build step**: CDN imports only (Three.js r128 via importmap at top of script)
- **`keys` Set**: holds `e.code` values (e.g., `'KeyW'`, `'Space'`, `'Digit1'`), not `e.key`

## Portal gotchas

### TorusGeometry orientation
`TorusGeometry` faces the **Z axis** by default — the hole of the ring is aligned with Z. If the portal is placed on the west wall (player approaches from the east walking west along the X axis), the player will see the torus edge-on (a thin line) instead of the ring face. Fix:
```javascript
portalGroup.rotation.y = Math.PI / 2; // rotate so ring faces along X axis
```
Always check which axis the player approaches from and rotate accordingly.

### Portal placement inside dungeon walls
The dungeon main room spans roughly x=[-40, 40]. Placing a portal at x=-55 puts it outside the west wall — unreachable. Keep portals at least 10 units inside the nearest wall (e.g., x=-30 for a west-wall portal in this dungeon).

### Gradient map filter requirement
The toon shading `DataTexture` used as `gradientMap` **must** have `NearestFilter` on both min and mag filters, or Three.js will blur the step edges and the cel-shading bands look washed out:
```javascript
tex.minFilter = THREE.NearestFilter;
tex.magFilter = THREE.NearestFilter;
tex.needsUpdate = true;
```
Without this, `MeshToonMaterial` silently degrades to smooth shading.

### 3-light rig for readable characters
A single directional key light leaves remote players flat. Add:
```javascript
// Fill: cool blue from opposite direction
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
// Rim: warm orange from behind to separate players from background
const rimLight = new THREE.DirectionalLight(0xff8844, 0.6);
rimLight.position.set(0, 20, -40);
```
This creates visible depth separation without post-processing.
