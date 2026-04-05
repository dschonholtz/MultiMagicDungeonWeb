// MessageHandler — routes incoming WebSocket messages to the right handler
// All messages are JSON: { type: string, ...payload }

import { randomUUID } from 'crypto';
import { PlayerState } from './PlayerState.js';

export class MessageHandler {
  constructor(sessionManager, players) {
    this.sessionManager = sessionManager;
    // Map<playerId, PlayerState> — shared with index.js
    this.players = players;
  }

  handle(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.warn('[MSG] Bad JSON from client');
      return;
    }

    switch (msg.type) {
      case 'join':       return this._onJoin(ws, msg);
      case 'move':       return this._onMove(ws, msg);
      case 'spell_cast': return this._onSpellCast(ws, msg);
      case 'rename':     return this._onRename(ws, msg);
      default:
        console.warn(`[MSG] Unknown type: ${msg.type}`);
    }
  }

  _onJoin(ws, msg) {
    const playerId = randomUUID();
    const username = String(msg.username || 'Wizard').slice(0, 24);

    const session = this.sessionManager.getOrCreateSession();
    const spawnPoint = this.sessionManager.assignSpawn(session);

    const player = new PlayerState({ id: playerId, username, sessionId: session.id, spawnPoint, ws });
    this.sessionManager.addPlayer(session, player);
    this.players.set(playerId, player);
    ws._mmdPlayerId = playerId; // O(1) lookup in _playerForWs

    // Send welcome to the joining player
    this._send(ws, {
      type: 'welcome',
      playerId,
      sessionId: session.id,
      dungeonSeed: session.seed,
      spawnPoint,
      players: [...session.players.values()]
        .filter(p => p.id !== playerId)
        .map(p => p.toPublic()),
    });

    // Notify others in session
    this._broadcast(session, playerId, {
      type: 'player_join',
      player: player.toPublic(),
    });

    console.log(`[Join] ${username} (${playerId.slice(0, 8)}) → session ${session.id.slice(0, 8)} (${session.players.size} players)`);
  }

  _onMove(ws, msg) {
    const player = this._playerForWs(ws);
    if (!player) return;

    player.applyMove(msg);

    const session = this.sessionManager.getSessionForPlayer(player.id);
    if (!session) return;

    this._broadcast(session, player.id, {
      type: 'player_move',
      playerId: player.id,
      x: player.x, y: player.y, z: player.z,
      yaw: player.yaw, pitch: player.pitch,
    });
  }

  _onSpellCast(ws, msg) {
    const player = this._playerForWs(ws);
    if (!player) return;

    const session = this.sessionManager.getSessionForPlayer(player.id);
    if (!session) return;

    // Validate spell type
    const VALID_SPELLS = ['fireball', 'frostbolt', 'telekinesis'];
    if (!VALID_SPELLS.includes(msg.spellType)) return;

    this._broadcast(session, player.id, {
      type: 'spell_cast',
      playerId: player.id,
      spellType: msg.spellType,
      x: Number(msg.x) || 0,
      y: Number(msg.y) || 0,
      z: Number(msg.z) || 0,
      dirX: Number(msg.dirX) || 0,
      dirY: Number(msg.dirY) || 0,
      dirZ: Number(msg.dirZ) || 0,
    });
  }

  _onRename(ws, msg) {
    const player = this._playerForWs(ws);
    if (!player) return;

    const username = String(msg.username || '').trim().slice(0, 24);
    if (!username) return;

    player.username = username;

    const session = this.sessionManager.getSessionForPlayer(player.id);
    if (!session) return;

    const out = JSON.stringify({ type: 'player_rename', playerId: player.id, username });
    for (const p of session.players.values()) {
      if (p.ws.readyState === 1) p.ws.send(out);
    }

    console.log(`[Rename] ${player.id.slice(0, 8)} → ${username}`);
  }

  onDisconnect(ws) {
    const player = this._playerForWs(ws);
    if (!player) return;

    const session = this.sessionManager.removePlayer(player.id);
    this.players.delete(player.id);

    if (session) {
      this._broadcast(session, player.id, {
        type: 'player_leave',
        playerId: player.id,
      });
    }

    console.log(`[Leave] ${player.username} (${player.id.slice(0, 8)})`);
  }

  // ---- helpers ----

  _playerForWs(ws) {
    return ws._mmdPlayerId ? (this.players.get(ws._mmdPlayerId) ?? null) : null;
  }

  _send(ws, obj) {
    if (ws.readyState === 1 /* OPEN */) {
      ws.send(JSON.stringify(obj));
    }
  }

  _broadcast(session, excludePlayerId, obj) {
    const msg = JSON.stringify(obj);
    for (const player of session.players.values()) {
      if (player.id !== excludePlayerId && player.ws.readyState === 1) {
        player.ws.send(msg);
      }
    }
  }
}
