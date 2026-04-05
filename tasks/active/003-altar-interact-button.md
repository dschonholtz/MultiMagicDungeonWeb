# Task 003: Altar Interact Button (Mobile + Desktop)

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — revised to include desktop affordance and URL-injected position for testing

The "[F] Examine Altar" prompt appears on screen but can't be tapped on mobile. This task adds a reliable, testable interact button for both platforms and a `?pos=` URL param for Playwright-based proximity UI testing.

---

## Options Considered

### Option A — Debug the existing touchstart binding on #interact-hint
Verify: element exists, event bound after DOM ready, no `pointer-events: none` in CSS.
**Pros:** Minimal change.
**Cons:** Previous attempt failed — something non-obvious is wrong.

### Option B — Add a dedicated #interact-btn (both platforms)
A separate button element styled like the spell buttons (mbtn), positioned above them, calls `doInteract()` on click/touchstart. Shows when `#interact-hint` is visible. Label adapts by platform:
- **Desktop:** "Examine [F]" (or whatever the current key is)
- **Mobile:** "Examine" (no key label — touch users don't have keyboards)
**Pros:** Reliable — completely independent of hint element CSS. Consistent with other mobile controls. Gives desktop users a visible affordance too.
**Cons:** One more button on the HUD (but intentional).

### Option C — Convert #interact-hint from div to button
Native `<button>` elements handle touch natively.
**Pros:** Clean semantics.
**Cons:** Breaks existing tests that query by element type; needs style reset.

**Chosen: Option B** — dedicated button, same pattern as spell buttons. Label varies by platform.

---

## Success Criteria

1. Near the altar on **mobile**: tappable "Examine" button appears (no key label)
2. Near the altar on **desktop**: "Examine [F]" button appears (key hint included)
3. Tapping/clicking the button triggers `doInteract()` — altar examine text appears
4. Button disappears when moving away from the altar
5. `?pos=x,z` URL param teleports the player on load (for test positioning)
6. Playwright test: load `/?pos=<altar_x>,<altar_z>`, assert button visible, click it, assert examine fires
7. All existing 28 Playwright tests still pass

---

## URL Position Injection

Add to page init (runs before first frame):
```js
const params = new URLSearchParams(location.search);
const posParam = params.get('pos');
if (posParam) {
  const [px, pz] = posParam.split(',').map(Number);
  player.position.set(px, 0, pz);
}
```

Expose on `window.__TEST__`:
```js
window.__TEST__.teleportTo = (x, z) => { player.position.set(x, 0, z); };
```

This enables both URL-based positioning (Playwright `page.goto`) and runtime teleport for interactive testing.

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1 | Playwright: load `/?pos=<altar_x>,<altar_z>&mobile=1`, assert `#interact-btn` visible, label = "Examine" |
| 2 | Playwright: load `/?pos=<altar_x>,<altar_z>`, assert `#interact-btn` visible, label contains "[F]" |
| 3 | Playwright: click `#interact-btn`, assert examine dialog DOM appears |
| 4 | Playwright: teleport away via `__TEST__.teleportTo`, assert `#interact-btn` hidden |
| 5 | Playwright: `?pos=0,0` → assert `player.position` is (0,0) at frame 1 |
| 6-7 | `npm test` — all pass |

Note: mobile simulation via `?mobile=1` param OR Playwright `page.setViewportSize` + `isMobile: true` in context.

---

## Plan

1. Find altar position in `DEFAULT_DUNGEON` / scene setup — record its x,z coords
2. Find where `#interact-hint` visibility is toggled (proximity loop)
3. Add `<button id="interact-btn" class="mbtn"></button>` near spell buttons in HTML
4. In JS: detect platform on load (`'ontouchstart' in window || matchMedia('(hover:none)').matches`)
5. Set button label: mobile → `"Examine"`, desktop → `"Examine [F]"` (read actual key from constants)
6. Mirror `#interact-hint` show/hide to `#interact-btn`
7. Bind `click` + `touchstart` on `#interact-btn` → `doInteract()`
8. Add `?pos=x,z` init block; expose `window.__TEST__.teleportTo`
9. Write Playwright tests in `tests/interact.spec.js` covering criteria 1–5
10. `node --check` + `grep conflict` + `npm test`
11. Commit (no deploy — awaits Step 3 sign-off)

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

---

## Deploy & Screenshots

*(empty — not yet started)*
