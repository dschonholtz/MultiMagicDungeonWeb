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
- **Suggested fix:** Either apply it (`const effectiveSpeed = incomingSpeed;` and use in `updateLocal`) or remove the line.

#### M-2: Three unused material factory functions
- **Location:** Lines 317-325 (`makeWallMat`, `makeFloorMat`, `makeCeilMat`)
- **Description:** These were likely intended to be shared material constructors but the dungeon renderer creates materials inline instead. Dead code.
- **ESLint:** `warning: 'makeWallMat'/'makeFloorMat'/'makeCeilMat' is defined but never used (no-unused-vars)`
- **Suggested fix:** Remove the functions, or refactor `renderDungeon` to use them (which would also fix H-2).

#### M-3: Empty catch block in WebSocket message handler
- **Location:** Line 1015
- **Description:** `this.ws.onmessage = (e) => { try { this._handle(JSON.parse(e.data)); } catch(err) {} }` — silently swallows all errors including legitimate bugs in message handling code. Makes debugging multiplayer issues extremely difficult.
- **ESLint:** `warning: Empty block statement (no-empty)`
- **Suggested fix:** At minimum log the error: `catch(err) { console.warn('[Net] message error:', err); }`

#### M-4: `dist2D` called every frame for multiple objects without caching
- **Location:** Lines 1226, 1228-1254, 1369-1401
- **Description:** `dist2D` is called for exit portal, start portal, each chest, each spike trap, and altar proximity — all every frame. Each call computes a square root. With 3 traps + 2 chests + portal + altar = 7 sqrt calls/frame.
- **Suggested fix:** Use `distSq2D` (squared distance) comparisons for the common case. Only compute actual distance when the squared check passes threshold.

#### M-5: Minimap redraws full canvas every 3rd frame unnecessarily
- **Location:** Lines 1409-1449
- **Description:** The minimap clears and redraws all rooms, corridors, portal, and player dots from scratch every 3 frames. The dungeon layout is static — only player positions change.
- **Suggested fix:** Render the static dungeon layout to an offscreen canvas once, then composite it with player dots each update. This would cut minimap draw calls by ~80%.

#### M-6: No `dispose()` for portal group textures on page unload
- **Location:** Lines 637-696 (`createPortal`)
- **Description:** Portal groups create canvas textures, particle geometries, and multiple materials. These are never disposed. While this doesn't matter for a single page session, if the game ever becomes an SPA component, this would be a memory leak.
- **Suggested fix:** Add a `destroyPortal(group)` function that traverses and disposes, similar to `MmdPlayer.destroy()`.

#### M-7: `_minimapFrame` integer overflow after extended play
- **Location:** Line 1214, 1410
- **Description:** `_minimapFrame` increments every frame with no reset. At 60fps, it overflows `Number.MAX_SAFE_INTEGER` after ~4.7 million years, so technically harmless — but the modulo check `% 3 === 0` would still work. This is a nitpick.
- **Suggested fix:** None needed, noted for completeness.

#### M-8: Spike trap damage applies based on proximity, not actual spike state
- **Location:** Lines 1387-1389
- **Description:** During the `hold` state, damage is applied if `d < 8`, but the player could have moved away between `rising` trigger (also `d < 8`) and the `hold` phase. The trap should re-check distance or track which player triggered it.
- **Suggested fix:** Re-check `d < 5` (tighter radius) during hold, or only damage if player is actually standing on the pressure plate area.

#### M-9: `hashColor` produces visually similar colors for similar IDs
- **Location:** Lines 719-728
- **Description:** The hash function `h = (h * 31 + charCode) | 0` with `% 360` can produce similar hues for IDs that differ by only one character (e.g., "player1" vs "player2"). With few players this is fine; with 10+ it could make players hard to distinguish.
- **Suggested fix:** Use a better hash distribution or golden-ratio hue spacing based on player join order.

#### M-10: `renderer.shadowMap.enabled = true` but no shadows are cast
- **Location:** Line 172
- **Description:** Shadow mapping is enabled on the renderer but no light has `castShadow = true` and no mesh has `receiveShadow = true`. This wastes GPU cycles on shadow map setup per frame.
- **Suggested fix:** Either remove `renderer.shadowMap.enabled = true` or implement actual shadow casting for torches/player.

### Low

#### L-1: `mozpointerlockchange` event listener is obsolete
- **Location:** Line 1133
- **Description:** The `moz` prefix for pointer lock was removed from Firefox years ago. The standard `pointerlockchange` event (line 1132) covers all modern browsers.
- **Suggested fix:** Remove the `mozpointerlockchange` listener.

#### L-2: Hardcoded WebSocket URL makes local development awkward
- **Location:** Line 77
- **Description:** `WS_URL` is hardcoded to `ws://5.161.208.234:8080`. Developers must manually edit this for local testing.
- **Suggested fix:** Auto-detect: `const WS_URL = location.hostname === 'localhost' ? 'ws://localhost:8080' : 'ws://5.161.208.234:8080';`

#### L-3: `requestPointerLock` error handling uses `.catch(()=>{})`
- **Location:** Line 1131
- **Description:** `const p = canvas.requestPointerLock(); if(p && p.catch) p.catch(()=>{});` — silently swallows pointer lock errors. Some browsers throw on repeated rapid-fire lock requests.
- **Suggested fix:** Log the error for debugging: `.catch(e => console.debug('[Input] pointer lock:', e))`

#### L-4: CSS `touch-action: none` on `#game-canvas` duplicated
- **Location:** Lines 10, 32
- **Description:** `#game-canvas` gets `display: block` from line 10 and `touch-action: none` from line 32 as a separate rule. Minor duplication.
- **Suggested fix:** Merge into one `#game-canvas` rule block.

#### L-5: Name label canvas allocates 256x48 per player without atlas
- **Location:** Lines 840-847
- **Description:** Each remote player gets a dedicated 256x48 canvas texture for their name label. With 20 players, that's 20 separate texture uploads.
- **Suggested fix:** For scale, consider a shared name-label texture atlas. Not urgent at current player counts.

#### L-6: `setInterval` for move sync not cleared on page unload
- **Location:** Line 1032
- **Description:** The 20Hz move interval (`this._moveInterval`) is only cleared on `ws.onclose` or `disconnect()`. If the page is closed without clean disconnection, the interval runs until GC.
- **Suggested fix:** Add `window.addEventListener('beforeunload', () => net.disconnect())`.

#### L-7: `Three.LuminanceFormat` deprecated in newer Three.js
- **Location:** Line 710
- **Description:** `THREE.LuminanceFormat` is used for the toon gradient map. This format was deprecated in Three.js r132 and removed in later versions. Currently safe on r128 but blocks upgrades.
- **Suggested fix:** When upgrading Three.js, replace with `THREE.RedFormat` and adjust shader accordingly.

#### L-8: `#interact-hint` has `pointer-events: none` inherited from `#hud` but has click handler
- **Location:** Lines 11 (CSS), 29 (CSS), 1213 (JS)
- **Description:** `#hud` sets `pointer-events: none` (line 11). `#interact-hint` is a child of `#hud` and has a `touchstart` event listener (line 1213) but never overrides `pointer-events` to `all`. The touch handler will never fire on mobile.
- **Suggested fix:** Add `pointer-events: all;` to `#interact-hint` CSS, similar to how `#rename-panel` (line 24) does it.

---

## Runtime Observations (Option B)

### Console Logs
- No JavaScript errors or warnings in console during normal gameplay
- Vite HMR connection established successfully
- One `[vite] server connection lost` message observed (transient, reconnected)

### Network Requests
| Request | Status | Notes |
|---------|--------|-------|
| `GET /` | 200 OK | Page loads correctly |
| `GET three.min.js` (CDN) | 200 | Three.js loaded from cdnjs |
| `GET GLTFLoader.js` (CDN) | 200 | Loader from jsdelivr |
| `GET SkeletonUtils.js` (CDN) | 200 | Utils from jsdelivr |
| `GET /models/Character_Male_1.gltf` | 200 OK | GLTF model loaded |
| `GET https://jam.pieter.com/portal/2026` | **404 Not Found** | Portal preload iframe target is dead |
| `GET http://localhost:3000/` (second) | **ERR_CONNECTION_REFUSED** | Likely stale HMR reconnect attempt |

### Visual Observations (Screenshot)
- Game renders correctly: dungeon walls, floor, ceiling visible
- HUD elements present: HP bar, player count ("4 players in dungeon"), minimap, spell bar
- Crosshair centered
- Spike traps visible in foreground
- No visual glitches or rendering artifacts

---

## ESLint Static Analysis (Option C)

### Configuration
```
eslint@8.57.1 --no-eslintrc --env browser,es2021
--parser-options=ecmaVersion:2021,sourceType:script
--global THREE,WebSocket
```

### Rules Applied
`no-unused-vars`, `no-undef`, `no-redeclare`, `eqeqeq`, `no-constant-condition`, `no-unreachable`, `no-empty`, `no-extra-semi`, `no-dupe-keys`, `no-duplicate-case`, `no-loss-of-precision`, `use-isnan`, `valid-typeof`, `no-self-assign`, `no-self-compare`

### Raw Output
```
/tmp/mmd_review.js
   42:7   warning  'incomingSpeed' is assigned a value but never used  no-unused-vars
  247:10  warning  'makeWallMat' is defined but never used             no-unused-vars
  250:10  warning  'makeFloorMat' is defined but never used            no-unused-vars
  253:10  warning  'makeCeilMat' is defined but never used             no-unused-vars
  945:78  warning  Empty block statement                               no-empty

5 problems (0 errors, 5 warnings)
```

### ESLint Analysis Summary
- **0 errors** — no syntax issues, no undefined variables, no redeclarations
- **5 warnings** — 4 dead code (unused vars/functions), 1 empty catch block
- The codebase is syntactically clean. The `--global THREE,WebSocket` flag correctly suppressed false positives for CDN-loaded globals.
- Note: Line numbers are offset by ~70 from index.html (stripped HTML/CSS header) — actual locations mapped in findings above.

---

## Top 5 Prioritized Action Items

1. **Add player-wall collision detection (H-1)** — This is the biggest gameplay gap. Players walking through walls breaks immersion and gameplay. Implement raycaster or AABB collision in `updateLocal()`.

2. **Fix `#interact-hint` pointer-events for mobile (L-8)** — The interact hint's touch handler is dead code on mobile because `pointer-events: none` is inherited from `#hud`. One CSS line fix.

3. **Add WebSocket reconnection (H-4)** — Players silently become ghosts after any network interruption. Exponential backoff reconnect with re-join would make multiplayer resilient.

4. **Reduce texture cloning in dungeon renderer (H-2)** — Use the existing (but unused) material factory functions or group by UV repeat to cut ~180 texture clones down to ~8. This is the lowest-effort performance win.

5. **Log WebSocket errors instead of swallowing them (M-3)** — The empty catch block at line 1015 makes multiplayer debugging nearly impossible. One-line fix with high diagnostic value.

### Honorable Mentions
- Remove `renderer.shadowMap.enabled = true` (M-10) — free performance win, one line
- Remove dead code: `incomingSpeed`, `makeWallMat`/`makeFloorMat`/`makeCeilMat` (M-1, M-2) — clean up ~15 lines
- Add `beforeunload` disconnect handler (L-6) — clean multiplayer exit

---

## Step 3: Verification

| # | Criterion | Result | Notes |
|---|-----------|--------|-------|
| 1 | Report contains findings from all 3 methods | ✅ PASS | Manual (24 findings), Runtime (network + console + screenshot), ESLint (5 warnings) |
| 2 | Every finding has severity level | ✅ PASS | All 24 findings tagged Critical/High/Medium/Low |
| 3 | Every finding has location + suggested fix | ✅ PASS | Line numbers and fix suggestions included |
| 4 | ESLint output appendix | ✅ PASS | Raw output + config + analysis in dedicated section |
| 5 | Runtime observations section | ✅ PASS | Console, network table, visual observations |
| 6 | Top 5 prioritized action items | ✅ PASS | Ranked by impact, with honorable mentions |
| 7 | `git diff index.html` is empty | ⏳ PENDING | To be verified |

**All content criteria pass: YES**
