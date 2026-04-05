# Task 016: Worktree node_modules Fix

**Status:** planning
**Created:** 2026-04-05

Every new git worktree is created without `node_modules`, causing agent sessions to spend 50-150 turns fighting missing-module errors before they can run tests or preview servers. The npm download cache (`~/.npm`) exists but doesn't help — each worktree still needs an install.

This task makes `node_modules` available in every worktree automatically.

---

## Root Cause

`git worktree add` creates a new directory with its own working tree but does NOT copy or link `node_modules`. npm install is required. Without it:
- `vite` / dev servers fail immediately
- `playwright` can't find the test runner
- `node --check` still works (built-in) but nothing else does

---

## Options Considered

### Option A — git post-checkout hook → symlink node_modules
Add `.git/hooks/post-checkout` that, when a new worktree is created, symlinks `../../node_modules` (relative path from worktree to main repo) into the worktree directory.

```bash
#!/bin/bash
# .git/hooks/post-checkout
WORKTREE_DIR=$(pwd)
MAIN_NODE_MODULES="$(git rev-parse --git-common-dir)/../node_modules"
if [ ! -d "$WORKTREE_DIR/node_modules" ]; then
  ln -sf "$MAIN_NODE_MODULES" "$WORKTREE_DIR/node_modules"
fi
```

**Pros:** Automatic on every new worktree, zero agent effort.
**Cons:** Hook lives in `.git/` which isn't committed — needs manual setup or an install script.

### Option B — Committed setup script
Add `scripts/setup-worktrees.sh` that finds all existing worktrees and symlinks node_modules into each one. Run manually or as npm script.

```bash
#!/bin/bash
MAIN_NM="$(git rev-parse --show-toplevel)/node_modules"
git worktree list --porcelain | grep "^worktree" | awk '{print $2}' | while read wt; do
  if [ ! -d "$wt/node_modules" ]; then
    ln -sf "$MAIN_NM" "$wt/node_modules"
    echo "Linked node_modules in $wt"
  fi
done
```

Add to `package.json`: `"setup-worktrees": "bash scripts/setup-worktrees.sh"`

**Pros:** Committed, visible, can be run by agents.
**Cons:** Doesn't auto-run on new worktrees — must be called explicitly.

### Option C — Both A + B
Hook for future worktrees + script for existing ones. Script is committed so agents can call it; hook is installed by the script.

**Chosen: Option C** — belt and suspenders. Script installs the hook, fixes existing worktrees, and can be re-run safely.

---

## Success Criteria

1. `npm run setup-worktrees` runs without errors
2. All existing worktrees (`.claude/worktrees/*`) have `node_modules` symlinked
3. The post-checkout hook is installed in `.git/hooks/post-checkout` and executable
4. Creating a new worktree (`git worktree add /tmp/test-wt -b test-branch`) results in `node_modules` being available in it within seconds (no install needed)
5. All 28 Playwright tests still pass (run from main repo)

---

## Plan

1. Write `scripts/setup-worktrees.sh`:
   - Find main repo `node_modules` path via `git rev-parse --show-toplevel`
   - List all worktrees via `git worktree list --porcelain`
   - Symlink for any missing `node_modules`
   - Install `.git/hooks/post-checkout` hook (write + chmod +x)
2. Add `"setup-worktrees": "bash scripts/setup-worktrees.sh"` to `package.json`
3. Run the script — verify all current worktrees get the symlink
4. Update `CLAUDE.md` to note: "Run `npm run setup-worktrees` after pulling if worktrees are missing node_modules"
5. `npm test` — 28/28 (from main repo)
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
