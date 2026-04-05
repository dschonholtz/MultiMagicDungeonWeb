# Task 003: Altar Mobile Interact Button

**Status:** planning
**Created:** 2026-04-05

The "[F] Examine Altar" prompt appears on screen but can't be tapped on mobile. A touchstart handler was supposedly added previously but doesn't work — likely because `#interact-hint` has `pointer-events: none` or similar CSS blocking touch.

---

## Options Considered

### Option A — Debug the existing touchstart binding on #interact-hint
Verify: element exists, event bound after DOM ready, no `pointer-events: none` in CSS.
**Pros:** Minimal change.
**Cons:** Previous attempt failed — something non-obvious is wrong.

### Option B — Add a dedicated #mobile-interact-btn
A separate button styled like the spell buttons, positioned above them, calls `doInteract()` on touchstart. Shows only when `#interact-hint` is visible.
**Pros:** Reliable — independent of hint CSS. Consistent with other mobile controls.
**Cons:** One more button on HUD.

### Option C — Convert #interact-hint from div to button
`<button>` handles touch natively.
**Pros:** Clean semantics.
**Cons:** Breaks existing tests; needs style reset.

**Chosen: Option B** — dedicated button, same pattern as spell buttons.

---

## Success Criteria

1. On mobile, when near the altar, a tappable "Examine" button appears
2. Tapping it triggers `doInteract()` — altar examine text appears
3. Button disappears when moving away from the altar
4. On desktop, the extra button is not shown
5. All 28 Playwright tests pass

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1-3 | Manual: walk to altar on mobile, verify button appears, tap it |
| 4 | Screenshot on desktop — no extra button |
| 5 | `npm test` — 28/28 pass |

---

## Plan

1. Find where `#interact-hint` is shown/hidden in the proximity check
2. Add `<button id="mobile-interact-btn" class="mbtn">Examine</button>` near spell buttons
3. CSS: `display: none` by default; show on touch devices when hint is visible
4. In JS: mirror `#interact-hint` show/hide to `#mobile-interact-btn`
5. Bind `touchstart` → `doInteract()`
6. `node --check` + `grep conflict` + `npm test`
7. Commit (no deploy)
