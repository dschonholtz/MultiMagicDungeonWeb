# Skill: Test Multiplayer Locally

Use this skill any time you need to verify multiplayer behavior in MultiMagicDungeonWeb.

## Stack
- Game: `index.html` (open as `file://` — no HTTP server needed)
- WS server: `server/index.js` on port 8080
- Node binary: `~/.nvm/versions/node/v22.22.0/bin/node` (shell aliases don't apply in Bash tool)

## Step 1: Start the WS server

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
cd /Users/douglasschonholtz/repos/MultiMagicDungeonWeb/server
npm install --silent
pkill -f 'node.*index.js' 2>/dev/null; sleep 0.5
node --watch index.js &
WS_PID=$!
sleep 1 && lsof -i :8080 | grep LISTEN && echo "Server up at ws://localhost:8080"
```

## Step 2: Open two browser tabs

Tell the user to open in **two separate tabs**:
```
file:///Users/douglasschonholtz/repos/MultiMagicDungeonWeb/index.html
```

## Step 3: What to verify

### Join flow
- Both tabs auto-connect (no blocking modal)
- Each tab gets a unique `playerId`
- `welcome` message arrives with `spawnPoint`, `sessionId`, `dungeonSeed`
- The other tab shows a remote player

### Movement sync
- Move in Tab A → remote player in Tab B moves (slight lerp lag at 20hz)
- DevTools → Network → WS to watch `player_move` messages

### Spell cast
- Cast in Tab A → Tab B shows the projectile
- `spell_cast` message includes `type`, `position`, `direction`, `ownerId`

### Disconnect
- Close Tab A → Tab B's remote player disappears (`player_leave`)

## Step 3b: Screenshot verification (MANDATORY)

After verifying the above, take a screenshot of EACH tab and explicitly describe what you see:

**Tab A screenshot** — describe: Is the scene rendering? Is there a player visible? Any console errors?
**Tab B screenshot** — describe: Is the remote player model visible? Correct position/color? Any visual anomalies?

Do NOT report "multiplayer working" unless you have taken screenshots of both tabs and confirmed the remote player model is visible in each. Claiming success without visual confirmation is how bugs get shipped.

## Step 4: Stop server
```bash
kill $WS_PID 2>/dev/null || pkill -f 'node.*index.js'
```

## Common gotchas
- **Port 8080 in use**: `lsof -ti :8080 | xargs kill` before starting
- **`node` not found**: use the full nvm path above
- **Both tabs same session**: by design — SessionManager assigns up to 8 players per session
