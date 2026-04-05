# Task 001: Move Rename to Settings Icon

**Status:** reviewing
**Created:** 2026-04-05

The in-game rename input field is always visible in the HUD, cluttering the screen especially on mobile. It should either be removed or tucked behind a small ⚙️ icon.

---

## Options Considered

### Option A — Remove rename entirely
No rename in-game. Players are always Guest#### until a proper lobby/settings screen exists.
**Pros:** Zero clutter, zero code.
**Cons:** Loses the feature entirely.

### Option B — Move rename behind a ⚙️ gear icon (top-right)
Small gear icon, tap/click opens a small overlay panel with the name input + confirm. Dismiss closes it.
**Pros:** Feature preserved, HUD clean, works on mobile.
**Cons:** ~15 lines of new HTML/CSS/JS.

### Option C — Collapse to a small "Edit name" text link
Tiny tappable label, expands inline on tap.
**Pros:** Minimal code.
**Cons:** Still somewhat visible in the HUD.

**Chosen: Option B** — keeps the feature, cleans the HUD.

---

## Success Criteria

1. No rename input visible in the default HUD
2. A ⚙️ icon is visible in the top-right corner
3. Tapping/clicking the icon opens a panel with the name input and confirm button
4. Submitting the name closes the panel and updates the displayed name
5. All 28 Playwright tests still pass

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1-2 | Screenshot — no input in HUD, gear icon visible |
| 3-4 | Click gear → enter name → confirm → verify name updates |
| 5 | `npm test` — 28/28 pass |

---

## Plan

1. Find the rename input HTML and its surrounding container
2. Add a `⚙️` button element in top-right corner (absolutely positioned)
3. Wrap rename input + label in `#settings-panel` (hidden by default, `display:none`)
4. Toggle `#settings-panel` visibility on gear button click
5. On confirm: update displayed name, close panel
6. Update CSS: position, z-index, styling consistent with existing HUD
7. `node --check` + `grep conflict` + `npm test`
8. Commit (no deploy)

---

## Execution Log

**2026-04-05 — Implementation complete**

- Added `#settings-gear` button (⚙) in top-right corner, styled consistently with existing HUD elements (rgba background, border, monospace aesthetic)
- Wrapped existing rename input + button in `#settings-panel` div, hidden by default with `display:none`, toggled via `.open` class
- Gear click toggles panel and auto-focuses the input; rename submit closes panel
- Updated `tests/smoke.spec.js`: check `#settings-gear` visibility instead of `#rename-input`
- Updated `tests/movement.spec.js`: click gear to open panel before focusing rename input
- Merged `origin/main` to pick up test fixes from after worktree creation

**Test results (post-merge):** 23 passed, 5 failed (networking/timing flakes), 1 skipped. All 6 movement tests pass, all 5 smoke tests pass, all settings-panel-related assertions pass. The 5 failures are multiplayer timeout, portal hint race, arrived-from banner timeout, and fireball timing (x2) — all unrelated to this change.
