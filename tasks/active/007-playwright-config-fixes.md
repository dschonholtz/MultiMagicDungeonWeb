# Task 007: Playwright Config Fixes

**Status:** planning
**Created:** 2026-04-05

Two recurring problems with the test setup that create friction on every test run:
1. **Port 3000 conflicts** — worktree sessions fight over port 3000; `reuseExistingServer: true` causes tests to run against the wrong server
2. **macOS folder access dialogs** — Playwright's Chromium triggers system permission prompts, requiring manual clicks to proceed

---

## Options Considered

### Option A — Add `--no-sandbox` + `userDataDir` to Playwright launch options
Prevent Chromium from touching the real user profile (which triggers macOS permission dialogs).
```js
use: {
  launchOptions: {
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'],
  },
}
```
Also set `userDataDir` to a temp path inside the repo so Chromium is fully isolated.

### Option B — Use a unique port per test run (env var)
Add `PORT` env var support to the vite server + playwright config:
```js
webServer: {
  command: `npx vite --port ${process.env.PORT || 3000}`,
  port: parseInt(process.env.PORT || '3000'),
  reuseExistingServer: false,  // never reuse — always start fresh
}
```
Worktrees can set `PORT=3001`, `PORT=3002` etc. in a `.env.test` file.

### Option C — Kill-port script in `package.json`
Add a `pretest` npm script that kills whatever is on the test port before running:
```json
"pretest": "lsof -ti:3000 | xargs kill -9 2>/dev/null; true"
```
Simple, zero-config fix for the port conflict.

**Chosen: All three** — they're complementary and each solves a different failure mode.

---

## Success Criteria

1. `npm test` passes 28/28 with no manual clicks required (no macOS permission dialogs)
2. Running `npm test` in two worktrees simultaneously does not cause port conflicts
3. `reuseExistingServer` set to `false` OR pretest kill ensures a clean server each run
4. No Chromium process reads from `~/Library/Application Support/Google/Chrome`
5. All 28 tests still pass

---

## Testing Strategy

| Criterion | How to verify |
|-----------|---------------|
| 1 | Run `npm test` from a fresh terminal, observe no permission dialogs |
| 2 | Run `npm test` in two terminals simultaneously, both pass |
| 3 | `lsof -i:3000` shows new process each run |
| 4 | `userDataDir` in playwright config points inside repo |
| 5 | 28/28 pass |

---

## Plan

1. Update `playwright.config.js`:
   - Add `launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-extensions'] }`
   - Add `userDataDir: '/tmp/pw-profile-mmd'` (isolated Chromium profile)
   - Set `reuseExistingServer: false`
2. Add `"pretest": "lsof -ti:3000 | xargs kill -9 2>/dev/null; true"` to `package.json`
3. `node --check` (config file syntax), then `npm test`
4. Verify 28/28 pass, no dialogs
5. Commit

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

---

## Deploy & Screenshots

*(No deploy needed — config-only change)*
