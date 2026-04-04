// SessionManager — creates and manages dungeon sessions (rooms of up to 8 players)
// Each session has a unique ID, a dungeon seed, and a set of spawn points.

import { randomUUID } from 'crypto';

// 8 spawn points distributed across the dungeon rooms (matches client hardcoded layout)
const SPAWN_POINTS = [
  { x:  10, y: 5, z:  10 },
  { x: -10, y: 5, z:  10 },
  { x:  10, y: 5, z: -10 },
  { x: -10, y: 5, z: -10 },
  { x:  70, y: 5, z:   5 },
  { x: -70, y: 5, z:   5 },
  { x:   5, y: 5, z: -70 },
  { x:  -5, y: 5, z: -70 },
];

const MAX_PLAYERS_PER_SESSION = 8;

export class SessionManager {
  constructor() {
    // Map<sessionId, { id, seed, players: Map<playerId, PlayerState>, spawnIndex }>
    this.sessions = new Map();
  }

  // Find an open session or create a new one. Returns the session.
  getOrCreateSession() {
    for (const session of this.sessions.values()) {
      if (session.players.size < MAX_PLAYERS_PER_SESSION) return session;
    }
    return this._createSession();
  }

  _createSession() {
    const id = randomUUID();
    const seed = Math.floor(Math.random() * 1000000);
    const session = { id, seed, players: new Map(), spawnIndex: 0 };
    this.sessions.set(id, session);
    console.log(`[Session] Created ${id} (seed ${seed})`);
    return session;
  }

  // Assign a spawn point to a new player (round-robin)
  assignSpawn(session) {
    const point = SPAWN_POINTS[session.spawnIndex % SPAWN_POINTS.length];
    session.spawnIndex++;
    return point;
  }

  addPlayer(session, player) {
    session.players.set(player.id, player);
  }

  removePlayer(playerId) {
    for (const session of this.sessions.values()) {
      if (session.players.has(playerId)) {
        session.players.delete(playerId);
        console.log(`[Session] Player ${playerId} left session ${session.id} (${session.players.size} remaining)`);
        // Clean up empty sessions
        if (session.players.size === 0) {
          this.sessions.delete(session.id);
          console.log(`[Session] Destroyed empty session ${session.id}`);
        }
        return session;
      }
    }
    return null;
  }

  getSessionForPlayer(playerId) {
    for (const session of this.sessions.values()) {
      if (session.players.has(playerId)) return session;
    }
    return null;
  }

  getStats() {
    return {
      sessions: this.sessions.size,
      players: [...this.sessions.values()].reduce((n, s) => n + s.players.size, 0),
    };
  }
}
