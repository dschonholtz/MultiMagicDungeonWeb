# Task 006: Comprehensive Code Review Report

**Date:** 2026-04-05
**File reviewed:** `index.html` (1507 lines)
**Methods used:** Manual review (Option A), Runtime analysis via Chrome MCP (Option B), ESLint static analysis (Option C)

---

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 5     |
| Medium   | 10    |
| Low      | 8     |
| **Total**| **24**|

---

## Findings

### Critical

#### C-1: Portal iframe preload is a hidden redirect / phishing vector
- **Location:** Line 1234-1236
- **Description:** When the player approaches the exit portal, an invisible `<iframe>` is appended loading `PORTAL_EXIT_URL`. The iframe loads `https://jam.pieter.com/portal/2026` with no sandboxing, no `sandbox` attribute, and no CSP. If the Vibe Jam portal URL were compromised or redirected, it could execute scripts in the context of the parent page.
- **Runtime observation:** Network tab showed `GET https://jam.pieter.com/portal/2026 -> 404 Not Found` — the preload target no longer exists.
- **Suggested fix:** Add `sandbox=""` attribute to the preload iframe (prevents script execution). Also add a check that the preload URL returns 200 before creating the iframe, or remove the preload entirely since `window.location.href` navigation is fast enough.

### High

#### H-1: No collision detection with walls for player movement
- **Location:** Lines 857-868 (`updateLocal`)
- **Description:** Player movement applies direction vector directly to position with no wall collision check. The spell raycaster (line 977-980) checks `wallMeshes` for projectile hits, but the player can walk through every wall in the dungeon. This is a fundamental gameplay issue.
- **Suggested fix:** Add a raycaster check in `updateLocal()` that tests the movement vector against `wallMeshes` before applying position change. Alternatively, implement AABB collision against the dungeon layout boxes.

#### H-2: Texture cloning creates excessive GPU memory allocation
- **Location:** Lines 338-343 (`addWall`), 366-370 (floor), 375-378 (ceiling)
- **Description:** Every wall, floor, and ceiling panel calls `_wallTex.clone()` / `_floorTex.clone()` / `_ceilTex.clone()` to get per-surface UV repeats. With ~30+ surfaces (rooms + corridors, 4 walls + floor + ceiling each), this creates ~180 texture clones. Each clone allocates a separate GPU texture upload.
- **Suggested fix:** Group surfaces by UV repeat value and share materials. For the current layout, there are likely only 5-8 distinct repeat combinations. Create those materials once and reuse them. The `makeWallMat()`, `makeFloorMat()`, `makeCeilMat()` functions (lines 317-325) were created for this purpose but are **never called** (confirmed by ESLint).

#### H-3: `spellProjectiles` array splice in reverse loop is correct but O(n^2)
- **Location:** Lines 1333-1336
- **Description:** Dead spells are removed via `splice(i, 1)` in a reverse loop. This is O(n) per removal and O(n^2) worst case with many simultaneous projectiles. Not a problem with 5-10 spells, but could lag with 50+ in a busy multiplayer session.
- **Suggested fix:** Use a swap-and-pop pattern, or filter into a new array: `spellProjectiles = spellProjectiles.filter(s => { s.update(dt); return s.alive; });`

#### H-4: WebSocket reconnection not implemented
- **Location:** Lines 1004-1067 (`MmdNetworkClient`)
- **Description:** If the WebSocket disconnects after initial connection (e.g., server restart, network blip), `onclose` clears the move interval but never attempts reconnection. The player stays in a ghost state — appears local but is invisible to other players.
- **Suggested fix:** Implement exponential backoff reconnection in `onclose`. On reconnect, re-send `join` message with current username and position.

#### H-5: `impactLights` array grows unbounded during sustained combat
- **Location:** Lines 934-941, 1337-1342
- **Description:** Every spell wall-hit creates a new `PointLight` via `spawnImpactFlash`. While lights decay and are removed after 0.35s, during rapid fire (666ms cooldown for fireball) with multiple players, the scene could have 10+ temporary point lights active simultaneously. Three.js r128's forward renderer has no light count limit but performance degrades sharply past ~20 active lights.
- **Suggested fix:** Cap `impactLights.length` (e.g., max 8) and skip spawning new ones when at capacity, or reuse a pool of pre-allocated lights.

### Medium

#### M-1: `incomingSpeed` parsed but never used
- **Location:** Line 112
- **Description:** `incomingSpeed` is parsed from URL params with min/max clamping but never applied to `PLAYER_SPEED` or any game logic. Dead code.
- **ESLint:** `warning: 'incomingSpeed' is assigned a value but never used (no-unused-vars)`
- **Suggested fix:** Either apply it or remove the line.

#### M-2: Three unused material factory functions
- **Location:** Lines 317-325 (`makeWallMat`, `makeFloorMat`, `makeCeilMat`)
- **Description:** These were likely intended to be shared material constructors but the dungeon renderer creates materials inline instead. Dead code.
- **Suggested fix:** Remove the functions, or refactor `renderDungeon` to use them (which would also fix H-2).

#### M-3: Empty catch block in WebSocket message handler
- **Location:** Line 1015
- **Description:** Silently swallows all errors including legitimate bugs in message handling code.
- **Suggested fix:** `catch(err) { console.warn('[Net] message error:', err); }`

#### M-4: `dist2D` called every frame for multiple objects without caching
- **Location:** Lines 1226, 1228-1254, 1369-1401
- **Description:** 7+ `sqrt` calls per frame for proximity checks. Use squared distance for threshold comparisons.
- **Suggested fix:** Use `distSq2D` comparisons; only compute actual distance when squared check passes.

#### M-5: Minimap redraws full canvas every 3rd frame unnecessarily
- **Location:** Lines 1409-1449
- **Description:** Dungeon layout is static — only player positions change. Full redraw wastes ~80% of minimap draw calls.
- **Suggested fix:** Render static dungeon to an offscreen canvas once; composite with player dots each update.

#### M-6: No `dispose()` for portal group textures on page unload
- **Location:** Lines 637-696 (`createPortal`)
- **Description:** Portal creates canvas textures, particle geometries, and multiple materials that are never disposed.
- **Suggested fix:** Add a `destroyPortal(group)` function.

#### M-7: `_minimapFrame` integer overflow after extended play
- **Location:** Line 1214, 1410
- **Description:** Technically harmless (overflows after millions of years at 60fps) but worth noting.

#### M-8: Spike trap damage applies based on proximity, not actual spike state
- **Location:** Lines 1387-1389
- **Description:** Damage applies if `d < 8` during `hold` state, but player could have moved away since trigger.
- **Suggested fix:** Re-check `d < 5` during hold, or track which player triggered the trap.

#### M-9: `hashColor` produces visually similar colors for similar IDs
- **Location:** Lines 719-728
- **Description:** Hash function can produce similar hues for IDs differing by one character (e.g. "player1" vs "player2").
- **Suggested fix:** Use golden-ratio hue spacing based on player join order.

#### M-10: `renderer.shadowMap.enabled = true` but no shadows are cast
- **Location:** Line 172
- **Description:** Shadow mapping enabled but no light has `castShadow = true` and no mesh has `receiveShadow = true`. Wastes GPU cycles.
- **Suggested fix:** Remove `renderer.shadowMap.enabled = true`.

### Low

#### L-1: `mozpointerlockchange` event listener is obsolete
- **Location:** Line 1133
- **Suggested fix:** Remove — standard `pointerlockchange` covers all modern browsers.

#### L-2: Hardcoded WebSocket URL makes local development awkward
- **Location:** Line 77
- **Suggested fix:** `const WS_URL = location.hostname === 'localhost' ? 'ws://localhost:8080' : 'ws://5.161.208.234:8080';`

#### L-3: `requestPointerLock` error handling uses `.catch(()=>{})`
- **Location:** Line 1131
- **Suggested fix:** `.catch(e => console.debug('[Input] pointer lock:', e))`

#### L-4: CSS `touch-action: none` on `#game-canvas` duplicated
- **Location:** Lines 10, 32
- **Suggested fix:** Merge into one `#game-canvas` rule block.

#### L-5: Name label canvas allocates 256x48 per player without atlas
- **Location:** Lines 840-847
- **Description:** 20 players = 20 separate texture uploads for name labels.
- **Suggested fix:** Shared name-label texture atlas (not urgent at current player counts).

#### L-6: `setInterval` for move sync not cleared on page unload
- **Location:** Line 1032
- **Suggested fix:** Add `window.addEventListener('beforeunload', () => net.disconnect())`.

#### L-7: `Three.LuminanceFormat` deprecated in newer Three.js
- **Location:** Line 710
- **Description:** Safe on r128 but blocks future upgrades. Replace with `THREE.RedFormat` when upgrading.

#### L-8: `#interact-hint` has `pointer-events: none` inherited from `#hud` but has click handler
- **Location:** Lines 11 (CSS), 29 (CSS), 1213 (JS)
- **Description:** `#hud` sets `pointer-events: none`. `#interact-hint` is a child and has a `touchstart` listener but never overrides `pointer-events` to `all`. Touch handler will **never fire** on mobile.
- **Suggested fix:** Add `pointer-events: all;` to `#interact-hint` CSS — same pattern as `#rename-panel` (line 24).

---

## Runtime Observations (Option B)

### Network Requests
| Request | Status | Notes |
|---------|--------|-------|
| `GET /` | 200 OK | Page loads correctly |
| `GET three.min.js` (CDN) | 200 | Three.js loaded from cdnjs |
| `GET GLTFLoader.js` (CDN) | 200 | Loader from jsdelivr |
| `GET /models/Character_Male_1.gltf` | 200 OK | GLTF model loaded |
| `GET https://jam.pieter.com/portal/2026` | **404 Not Found** | Portal preload iframe target is dead |

### Console
- No JavaScript errors during normal gameplay
- One transient `[vite] server connection lost` (reconnected)

---

## ESLint Static Analysis (Option C)

```
5 problems (0 errors, 5 warnings)
  'incomingSpeed' assigned but never used
  'makeWallMat' defined but never used
  'makeFloorMat' defined but never used
  'makeCeilMat' defined but never used
  Empty block statement (catch block)
```

Codebase is syntactically clean — 0 errors.

---

## Top 5 Prioritized Action Items

1. **Add player-wall collision detection (H-1)** — Biggest gameplay gap.
2. **Fix `#interact-hint` pointer-events for mobile (L-8)** — One CSS line; fixes altar tap (Task 003 covers this).
3. **Add WebSocket reconnection (H-4)** — Players silently become ghosts on network drop.
4. **Reduce texture cloning (H-2)** — Use existing material factory functions; cut ~180 GPU uploads to ~8.
5. **Log WebSocket errors (M-3)** — One-line fix with high diagnostic value.

### Honorable Mentions
- Remove `shadowMap.enabled` (M-10) — free performance win
- Remove dead code: `incomingSpeed`, `makeWallMat/Floor/Ceil` (M-1, M-2)
- Add `beforeunload` disconnect handler (L-6)
