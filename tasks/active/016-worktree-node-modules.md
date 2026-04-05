# Task 016: Worktree node_modules Fix

**Status:** planning
**Created:** 2026-04-05
**Updated:** 2026-04-05 — switched from symlink to `npm ci` after identifying symlink risk

Every new git worktree is created without `node_modules`, causing agent sessions to spend 50-150 turns fighting missing-module errors before they can run tests or preview servers.

---

## Root Cause

`git worktree add` creates a new directory with its own working tree but does NOT install `node_modules`. Without it:
- `vite` / dev servers fail immediately
- `playwright` can't find the test runner
- `node --check` still works (built-in) but nothing else does

---

## Why Not Symlink?

The obvious shortcut is to symlink the main repo's `node_modules` into each worktree. **This is unsafe:**

- If a worktree's `package.json` diverges (adds a dependency), the new package won't be in the symlinked `node_modules` — silent test failures
- If the agent then runs `npm install` to fix it, it **mutates the main repo's `node_modules`** and corrupts every other worktree
- Failure mode is confusing: tests fail for reasons unrelated to the task's changes

The npm download cache (`~/.npm`) already stores tarballs, so `npm ci` in a fresh worktree completes in ~10-15 seconds — fast enough that there's no reason to accept the symlink risk.

---

## Options Considered

### Option A — post-checkout hook → `npm ci`
Add `.git/hooks/post-checkout` that runs `npm ci` whenever a new worktree is checked out. Each worktree gets its own isolated `node_modules`.

```bash
#!/bin/bash
# .git/hooks/post-checkout
# Runs after: git checkout, git worktree add
WORKTREE_DIR=$(pwd)
if [ ! -d "$WORKTREE_DIR/node_modules" ] && [ -f "$WORKTREE_DIR/package.json" ]; then
  echo "[hook] Running npm ci in $WORKTREE_DIR..."
  npm ci --prefer-offline --silent
fi
```

**Pros:** Automatic, isolated, correct even if package.json diverges.
**Cons:** Hook lives in `.git/` — not committed. Needs install step.

### Option B — Committed setup script
`scripts/setup-worktrees.sh` finds all existing worktrees missing `node_modules` and runs `npm ci` in each. Also installs the hook for future worktrees.

**Pros:** Committed, agents can call it, fixes existing worktrees in one shot.
**Cons:** Doesn't auto-run for future worktrees unless hook is installed.

### Option C — Both (CHOSEN)
Script handles existing worktrees + installs the hook for future ones. Script is committed so agents can call `npm run setup-worktrees` at any time.

---

## Success Criteria

1. `npm run setup-worktrees` runs without errors and installs `node_modules` in all existing worktrees
2. The post-checkout hook is installed in `.git/hooks/post-checkout` and is executable
3. Creating a new worktree results in `node_modules` being installed automatically (~15s, no agent intervention)
4. If a worktree's `package.json` adds a package, `npm ci` in that worktree correctly installs it independently (no cross-contamination)
5. All 28 Playwright tests still pass (run from main repo)

---

## Plan

1. Write `scripts/setup-worktrees.sh`:
   ```bash
   #!/bin/bash
   # Install npm ci in all existing worktrees that are missing node_modules
   # Also installs .git/hooks/post-checkout for future worktrees
   
   HOOK_PATH="$(git rev-parse --git-common-dir)/hooks/post-checkout"
   
   # Write post-checkout hook
   cat > "$HOOK_PATH" << 'HOOK'
   #!/bin/bash
   if [ ! -d "$(pwd)/node_modules" ] && [ -f "$(pwd)/package.json" ]; then
     echo "[hook] npm ci in $(pwd)..."
     npm ci --prefer-offline --silent
   fi
   HOOK
   chmod +x "$HOOK_PATH"
   echo "Installed post-checkout hook"
   
   # Fix existing worktrees
   git worktree list --porcelain | grep "^worktree" | awk '{print $2}' | while read wt; do
     if [ ! -d "$wt/node_modules" ] && [ -f "$wt/package.json" ]; then
       echo "Installing node_modules in $wt..."
       (cd "$wt" && npm ci --prefer-offline --silent)
     fi
   done
   echo "Done."
   ```
2. Add to `package.json`: `"setup-worktrees": "bash scripts/setup-worktrees.sh"`
3. Run `npm run setup-worktrees` — verify all current worktrees get their own `node_modules`
4. Update `CLAUDE.md`: "Run `npm run setup-worktrees` once after cloning, then new worktrees will auto-install."
5. `npm test` — 28/28 from main repo
6. Commit

---

## Execution Log

*(empty — not yet started)*

---

## Code Review & Test Results

*(empty — not yet started)*

### Process Friction Notes

*(filled in after execution)*

---

## Deploy & Screenshots

*(empty — not yet started)*
