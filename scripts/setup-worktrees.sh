#!/bin/bash
set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_PATH="$(git rev-parse --git-common-dir)/hooks/post-checkout"

cat > "$HOOK_PATH" << 'HOOK'
#!/bin/bash
WORKTREE_DIR=$(pwd)
if [ ! -d "$WORKTREE_DIR/node_modules" ] && [ -f "$WORKTREE_DIR/package.json" ]; then
  echo "[post-checkout] Installing node_modules in $WORKTREE_DIR..."
  cd "$WORKTREE_DIR" && npm install --prefer-offline --silent
  echo "[post-checkout] Done."
fi
HOOK
chmod +x "$HOOK_PATH"
echo "Installed post-checkout hook at $HOOK_PATH"

git worktree list --porcelain | grep "^worktree" | awk '{print $2}' | while read wt; do
  if [ "$wt" = "$REPO_ROOT" ]; then continue; fi
  if [ ! -d "$wt/node_modules" ] && [ -f "$wt/package.json" ]; then
    echo "Installing node_modules in $wt..."
    (cd "$wt" && npm install --prefer-offline --silent)
    echo "Done: $wt"
  else
    echo "Already has node_modules: $wt"
  fi
done
echo "All worktrees ready."
