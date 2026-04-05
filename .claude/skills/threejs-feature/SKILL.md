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
- **Memory leaks**: dispose geometry and material when removing meshes (shared geo/mat in caches must NOT be disposed per-instance)
- **Script type**: `<script type="module">` — top-level `await` is fine
- **No build step**: CDN imports only (Three.js r128 via importmap at top of script)
- **`keys` Set**: holds `e.code` values (e.g., `'KeyW'`, `'Space'`, `'Digit1'`), not `e.key`
- **toon gradientMap**: must set both `minFilter` AND `magFilter` to `THREE.NearestFilter` or bands blur into smooth gradient
- **WASD focus steal**: any `<input>` that accepts keydown must call `e.stopPropagation()` to block movement keys from firing while typing
- **Portal scale**: dungeon units are large (PLAYER_HEIGHT=5); a TorusGeometry radius of 2 is invisible at gameplay distance — use ≥4
- **Portal orientation**: `rotation.x` on the group tilts the whole portal; set `rotation.y = Math.PI/2` separately to face it along an axis
- **WebSocket idle drops**: proxies kill silent connections after ~60s; send a `{type:'ping'}` every 30s to keep the socket alive
- **Lerp clamp**: interpolation alpha must be `Math.min(dt * speed, 1.0)` — unclamped values >1 overshoot and oscillate
- **Lighting ratio**: ambient > 0.5 flattens toon shading bands; keep ambient ≤ 0.4 and boost directional to ≥ 0.6 for visible cel steps
- **3-light rig**: fill light position `(0, -10, 0)` (below scene) gives cool under-fill; rim at `(0, 20, -40)` separates players from background
