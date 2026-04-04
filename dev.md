# Local Development

## Quick start

**Terminal 1 — WebSocket server:**
```bash
cd server && npm install && npm run dev
# Runs on ws://localhost:8080 with auto-restart on file changes
```

**Terminal 2 — Game client:**
```bash
# Option A: open directly (no install needed)
open index.html

# Option B: Vite dev server (HMR, recommended for active client dev)
npx vite
```

**Test multiplayer locally:** open two browser tabs to `index.html`. Both should connect to the local server and see each other in-world.

## WS_URL configuration

At the top of `index.html`, set:
```js
const WS_URL = 'ws://localhost:8080'; // local dev
// const WS_URL = 'wss://your-domain/ws'; // production
```

## Connecting to the server (protocol)

1. Client opens page → establishes WebSocket to WS_URL
2. Client sends: `{ type: "join", username: "Doug" }`
3. Server replies: `{ type: "welcome", playerId, sessionId, dungeonSeed, spawnPoint, players: [...] }`
4. Client builds dungeon from `dungeonSeed`, places camera at `spawnPoint`
5. Client sends `{ type: "move", x, y, z, yaw, pitch }` at 20hz
6. Client sends `{ type: "spell_cast", spellType, x, y, z, dirX, dirY, dirZ }` on cast

## Deployment (Hetzner)

```bash
# On the Hetzner box
git clone https://github.com/dschonholtz/MultiMagicDungeonWeb.git
cd MultiMagicDungeonWeb/server && npm install
pm2 start index.js --name mmd-server
pm2 save
```

Then configure nginx to proxy `wss://your-domain/ws` → `ws://localhost:8080`.
