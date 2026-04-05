# Task 011: WebSocket Reconnection

**Status:** planning
**Created:** 2026-04-05

Code review finding H-4: WebSocket drops silently make the player a ghost. This task adds exponential backoff reconnection.

**Note:** May be deprioritized. Flag before executing.

---

## Fix

Exponential backoff in `onclose`:
```js
let _reconnectAttempt = 0;
ws.onclose = () => {
  clearInterval(this._moveInterval);
  const delay = Math.min(30000, 500 * Math.pow(2, _reconnectAttempt++));
  setTimeout(() => this._connect(), delay);
};
ws.onopen = () => { _reconnectAttempt = 0; this._sendJoin(); };
```

---

## Success Criteria

1. Reconnection attempted with backoff (500ms → 1s → 2s... cap 30s)
2. On reconnect, player re-joins with current username and position
3. All 28 Playwright tests pass

---

## Execution Log

*(empty — not yet started)*
