// MultiMagicDungeonWeb — WebSocket multiplayer server
// Run: node --watch index.js (dev) or node index.js (prod)
// Env vars: PORT (default 8080)

import { WebSocketServer } from 'ws';
import { SessionManager } from './lib/SessionManager.js';
import { MessageHandler } from './lib/MessageHandler.js';

const PORT = parseInt(process.env.PORT || '8080', 10);

const sessionManager = new SessionManager();
const players = new Map(); // Map<playerId, PlayerState>
const handler = new MessageHandler(sessionManager, players);

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log(`[WS] Client connected (${wss.clients.size} total)`);

  ws.on('message', (data) => {
    handler.handle(ws, data.toString());
  });

  ws.on('close', () => {
    handler.onDisconnect(ws);
    console.log(`[WS] Client disconnected (${wss.clients.size} total)`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });
});

wss.on('listening', () => {
  console.log(`MMD server running on ws://localhost:${PORT}`);
  console.log('Waiting for players...');
});

// Log stats every 30 seconds
setInterval(() => {
  const stats = sessionManager.getStats();
  if (stats.players > 0) {
    console.log(`[Stats] ${stats.sessions} session(s), ${stats.players} player(s)`);
  }
}, 30_000);
