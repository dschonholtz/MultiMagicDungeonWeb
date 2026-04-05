# Task 009: Portal iframe sandbox attribute

**Status:** planning
**Created:** 2026-04-05

Code review finding C-1: the exit portal's hidden `<iframe>` preload has no `sandbox` attribute. This task adds it and preserves the original code as a reference comment.

---

## Background / Original Intent

The portal preloads the jam site in a hidden iframe so navigation feels instant. The 404 on jam.pieter.com/portal/2026 is likely temporary while the jam site is under construction — no action needed there.

Original code preserved as reference:
```js
// ORIGINAL PORTAL PRELOAD (for fast navigation UX):
// const preloadFrame = document.createElement('iframe');
// preloadFrame.src = PORTAL_EXIT_URL;
// preloadFrame.style.display = 'none';
// document.body.appendChild(preloadFrame);
```

---

## Options Considered

### Option A — Add `sandbox=""` (maximum restriction)
Prevents all script execution from within the iframe. The page still loads HTML/CSS/assets for fast navigation.
**Chosen.** We navigate via `window.location.href` immediately anyway, so iframe JS init is not needed.

### Option B — `sandbox="allow-scripts allow-same-origin"`
Allows jam site JS to run. More permissive.
**Rejected** — unnecessary attack surface.

### Option C — Remove preload iframe entirely
`window.location.href` navigation is ~200ms anyway. Zero attack surface.
**Fallback** if Option A breaks the experience.

---

## Success Criteria

1. Preload iframe has `sandbox=""` attribute
2. Original code block preserved as reference comment above it
3. Portal navigation behavior unchanged
4. All 28 Playwright tests pass

---

## Plan

1. Find the iframe preload in `index.html`
2. Add `sandbox=""` and reference comment
3. `npm test` — 28/28 pass
4. Commit

---

## Execution Log

*(empty — not yet started)*
