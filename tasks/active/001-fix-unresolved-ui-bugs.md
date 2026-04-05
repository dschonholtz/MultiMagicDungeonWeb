# Task 001: Fix Unresolved UI Bugs

**Status:** planning
**Created:** 2026-04-05

Three previously-attempted fixes that are still broken: rename UI cluttering the HUD, minimap showing disconnected room rectangles with no corridors/openings, and the Examine Altar button not tappable on mobile.

---

## Issue 1: Rename UI

### Options Considered

#### Option A — Remove rename entirely
Rename field goes away. Players are always Guest#### until we add a proper settings flow.
**Pros:** Clean, zero clutter, zero bugs.
**Cons:** Can't personalize name in-game at all.

#### Option B — Move rename behind a ⚙️ settings icon (top-right corner)
Small gear icon opens a modal/inline panel with the name field. Dismiss closes it.
**Pros:** Feature stays, doesn't clutter HUD, works on mobile.
**Cons:** Slightly more code.

#### Option C — Keep rename visible but collapse to small text link
"Edit name" as a tiny tappable label under the player-count HUD.
**Pros:** Discoverable, minimal code change.
**Cons:** Still somewhat cluttered on mobile.

**Chosen: Option B** — keeps the feature, cleans up the HUD, works well on mobile. Gear icon in top-right, tap opens a small panel with the name input + confirm button.

---

## Issue 2: Minimap — Disconnected Rectangles

The minimap draws every room and corridor as a filled rectangle. Even though doorways exist in 3D (walls are skipped during `renderDungeon()`), the minimap has no concept of openings — it just fills each AABB rectangle solidly. Result: the user sees a grid of isolated boxes with no visible connections.

### Options Considered

#### Option A — Draw corridor AABBs as connecting fills on the minimap
The minimap already has the full `DUNGEON_SEGMENTS` list. Corridors are their own segments with their own AABBs. If we draw them too (not just rooms), corridors fill the gaps between rooms and the map looks connected.
**Pros:** Simple — one or two lines of change in the minimap draw loop. No new data structures.
**Cons:** Corridors are narrow (8–12 wide vs rooms 40–80 wide); at minimap scale they may be 1–2px — need to ensure they're visible.

#### Option B — Draw openings in room walls on minimap
Track which walls were skipped (the adjacency check), and when drawing the room rectangle outline, leave gaps at those wall positions.
**Pros:** Most accurate representation.
**Cons:** Significantly more complex — minimap currently draws filled rects, not outlines. Would need to refactor to draw 4 sides individually with gap logic.

#### Option C — Draw lines between room centers where a corridor connects them
For each corridor, draw a line from its center toward the two adjacent rooms on the minimap.
**Pros:** Communicates connectivity clearly.
**Cons:** Less accurate spatial representation.

**Chosen: Option A** — draw ALL segments (rooms + corridors) as filled rects on the minimap, not just rooms. This is a 1-2 line fix. At minimap scale corridors are narrow but visible; we'll ensure a minimum draw width of 2px. The result will look like connected dungeon shapes rather than isolated boxes.

---

## Issue 3: Examine Altar — Not Tappable on Mobile

The `#interact-hint` div shows the "[F] Examine Altar" prompt. A `touchstart` handler calling `doInteract()` was supposedly added. Either it was added incorrectly, there's a z-index issue, or `pointer-events: none` is blocking it.

### Options Considered

#### Option A — Debug and fix the existing touchstart binding
Read the current code carefully. Verify: element exists, event bound after DOM ready, no CSS `pointer-events: none`, adequate z-index, element is actually visible/interactive.
**Pros:** Minimal change if it's a one-liner fix.
**Cons:** The previous attempt failed, so something non-obvious is wrong.

#### Option B — Replace with a dedicated mobile "Interact" button
Add a separate `#mobile-interact-btn` that's always visible on mobile (absolute position, bottom-right, styled like the spell buttons), calls `doInteract()` on touchstart.
**Pros:** Reliable, consistent with other mobile touch buttons, can't be blocked by CSS on another element.
**Cons:** One more button on the HUD.

#### Option C — Make the interact hint a real button element
Change `#interact-hint` from a `<div>` to a `<button>`, which browsers treat as a native interactive element. Add `onclick="doInteract()"`.
**Pros:** Native browser interactivity, no event-binding bugs.
**Cons:** Need to strip default button styles.

**Chosen: Option B** — add a dedicated `#mobile-interact-btn`. The hint element has probably always had `pointer-events: none` (common for HUD overlays). A dedicated button is also more discoverable. It appears only when `#interact-hint` is visible (same condition), positioned above the spell buttons.

---

## Success Criteria

1. In-game HUD has no visible rename input field by default — only accessible via ⚙️ gear icon
2. Minimap shows rooms and corridors as connected shapes — no isolated floating rectangles
3. Tapping the mobile interact button calls `doInteract()` and works on the altar
4. All 28 Playwright tests still pass
5. No console errors on load

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1. Rename behind gear | Visual screenshot — no text input visible in base HUD; gear icon present |
| 2. Minimap connected | Visual screenshot — can trace a path from spawn to boss room through minimap |
| 3. Altar button works | Manual: walk to altar on mobile, tap button, verify altar examine fires |
| 4. Playwright suite | `npm test` — all 28 pass |
| 5. No console errors | Chrome DevTools console on load |

---

## Plan

1. Read current `index.html` — find the rename input, `#interact-hint`, and the minimap draw loop
2. **Rename**: Wrap the existing `<input id="rename-input">` and its label in a `#settings-panel` div (hidden by default). Add a `⚙️` button that toggles `#settings-panel` visibility. Update CSS.
3. **Minimap**: Find the minimap draw loop. Currently it iterates rooms only; change to iterate ALL `DUNGEON_SEGMENTS` (rooms + corridors). Ensure minimum corridor draw size of 2px.
4. **Altar button**: Add `<button id="mobile-interact-btn">` near the spell buttons in the mobile controls section. Style it to match spell buttons. In JS: show/hide it whenever `#interact-hint` visibility changes. Bind `touchstart` → `doInteract()`.
5. Run `node --check index.html` + `grep -c "<<<<<<" index.html` + `npm test`
6. Screenshot minimap and full HUD
7. Commit (no deploy until Step 3 review)
