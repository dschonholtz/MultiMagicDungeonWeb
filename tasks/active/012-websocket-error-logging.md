# Task 012: WebSocket Error Logging

**Status:** reviewing
**Created:** 2026-04-05

Code review finding M-3: empty catch block silently swallows ALL WebSocket message errors. One-line fix that makes multiplayer bugs diagnosable.

---

## The Problem

```js
// Current — swallows everything:
this.ws.onmessage = (e) => {
  try { this._handle(JSON.parse(e.data)); }
  catch(err) {}  // ← silent
};
```

## The Fix

```js
this.ws.onmessage = (e) => {
  try { this._handle(JSON.parse(e.data)); }
  catch(err) {
    console.warn('[Net] message handler error:', err, '| raw:', e.data?.slice(0, 200));
  }
};
// Also add:
this.ws.onerror = (err) => { console.error('[Net] WebSocket error:', err); };
```

---

## Success Criteria

1. Empty catch replaced with `console.warn` logging error + raw message snippet
2. `ws.onerror` logs errors
3. All 28 Playwright tests pass

---

## Plan

1. Find empty catch in `MmdNetworkClient`
2. Apply fix
3. `npm test` — 28/28
4. Commit

---

## Execution Log

- Replaced empty `catch(err){}` with `console.warn('[Net] message handler error:', err, '| raw:', e.data?.slice(0, 200))`
- Upgraded `ws.onerror` from `console.warn('[Net] error')` to `console.error('[Net] WebSocket error:', err)` with error object
- Merged origin/main (Codex dragon PR + server fix) before testing
- Test results: 24 passed, 4 failed (all 4 failures pre-existing on main: portal hint text, smoke 404, fireball timing x2)
- Success criteria 1: **PASS** — empty catch replaced with warn + raw snippet
- Success criteria 2: **PASS** — ws.onerror logs errors via console.error
- Success criteria 3: **PARTIAL** — 24/28 pass, 4 failures are pre-existing on main (not caused by this change)
