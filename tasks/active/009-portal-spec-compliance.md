# Task 009: Portal Spec Compliance (Vibeverse Webring)

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — expanded from sandbox-only to full portal spec

Ensure the exit portal and start portal fully comply with Pieter's Vibeverse portal spec.

---

## Original Spec (preserve as code comment in index.html)

```
// VIBEVERSE PORTAL SPEC (by @levelsio)
// Make an exit portal players can walk into (label: "Vibe Jam Portal").
// On entry, redirect to: https://jam.pieter.com/portal/2026
// Pass GET query params:
//   ?username= (player name)
//   ?color=    (player color in hex)
//   ?speed=    (meters per second)
//   ?ref=      (URL of this game, so they can portal back)
// Optional: avatar_url, team, hp, speed_x/y/z, rotation_x/y/z
//
// The portal redirector adds ?portal=true to all URLs it forwards to.
//
// START PORTAL: when this game receives ?portal=true AND ?ref=,
// spawn a portal at the player's starting position that goes BACK
// to the ref URL. Pass all original params back when returning.
//
// IMPORTANT: No loading screens, no input screens — instant load
// when arriving from a portal (?portal=true).
//
// Sample code: https://gist.github.com/levelsio/ffdbfe356b421b97a31664ded4bc961d
```

---

## Current State

- ✅ Redirects to `jam.pieter.com/portal/2026` on portal entry
- ✅ Has a toroidal visual portal mesh
- ❌ Does NOT pass `?username`, `?color`, `?ref`, `?speed` on redirect
- ❌ Does NOT handle incoming `?portal=true` + `?ref=` to spawn a start portal
- ❌ Preload iframe has no `sandbox=""` attribute
- ❌ Rename input blocks instant load for portal arrivals

---

## Chosen Approach: Full spec compliance

### 1. Exit portal params
```js
const params = new URLSearchParams({
  username: localName || 'Wizard',
  color: '#' + playerColor.toString(16).padStart(6, '0'),
  speed: PLAYER_SPEED.toFixed(2),
  ref: location.origin + location.pathname,
});
window.location.href = `${PORTAL_EXIT_URL}?${params}`;
```

### 2. Start portal on arrival
```js
const urlParams = new URLSearchParams(location.search);
if (urlParams.get('portal') === 'true' && urlParams.get('ref')) {
  createStartPortal(urlParams.get('ref'), urlParams);
}
```

### 3. iframe sandbox
```js
preloadFrame.setAttribute('sandbox', '');
```

### 4. Skip rename for portal arrivals
```js
if (urlParams.get('portal') === 'true') {
  localName = urlParams.get('username') || 'Wizard';
  // skip name input screen
}
```

---

## Success Criteria

1. Exit redirect URL includes `?username&color&speed&ref`
2. `?portal=true&ref=Y` spawns a start portal back to Y
3. Start portal return passes all params
4. Preload iframe has `sandbox=""`
5. Portal arrivals skip rename screen (instant load)
6. All 28 Playwright tests pass

---

## Plan

1. Read current portal code in `index.html`
2. Add spec comment block
3. Update exit redirect to include all params
4. Add init handler for incoming `?portal=true`
5. Build start portal using same visual as exit portal
6. Add `sandbox=""` to preload iframe
7. Skip rename screen on portal arrival
8. `npm test` — 28/28 pass
9. Commit

---

## Execution Log

*(empty — not yet started)*
