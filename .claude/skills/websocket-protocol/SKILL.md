# Skill: Extend the WebSocket Protocol

Use this when adding a new message type. Both client and server must be updated together.

## Message flow

```
Client → Server:  join, move, spell_cast, rename, [new type]
Server → Client:  welcome, player_join, player_leave, player_move,
                  spell_cast, player_rename, [new type]
```

## Step 1: Define the message before coding

Document these before touching any file:
- **Name**: snake_case
- **Direction**: client→server, server→client, or both
- **Payload fields**
- **Trigger**: when is it sent?
- **Response**: what does the receiver do?

## Step 2: Server — add handler in MessageHandler.js

```javascript
handle(ws, raw) {
  const msg = JSON.parse(raw);
  switch (msg.type) {
    case 'join':         return this._onJoin(ws, msg);
    case 'move':         return this._onMove(ws, msg);
    case 'spell_cast':   return this._onSpellCast(ws, msg);
    case 'rename':       return this._onRename(ws, msg);
    case 'player_emote': return this._onEmote(ws, msg); // NEW
    default: console.warn(`[MSG] Unknown: ${msg.type}`);
  }
}

_onEmote(ws, msg) {
  const player = this._playerForWs(ws);
  if (!player) return;

  const VALID = ['wave', 'cheer', 'taunt'];
  const emote = VALID.includes(msg.emote) ? msg.emote : 'wave';

  const session = this.sessionManager.getSessionForPlayer(player.id);
  if (!session) return;

  this._broadcastToSession(session, {
    type: 'player_emote',
    playerId: player.id,
    emote,
  });
}
```

## Step 3: Client — send

```javascript
// In MmdNetworkClient:
sendEmote(emote) { this.send({ type: 'player_emote', emote }); }

// In keydown handler:
if (e.code === 'KeyE') net.sendEmote('wave');
```

## Step 4: Client — receive

```javascript
// In MmdNetworkClient._handle(msg):
case 'player_emote': return this._onPlayerEmote(msg);

_onPlayerEmote(msg) {
  const player = remotePlayers.get(msg.playerId) ?? localPlayer;
  if (player?.id === msg.playerId) player.playEmote?.(msg.emote);
}
```

## Pre-push checklist

- [ ] Server validates + sanitizes all incoming fields
- [ ] Unknown/invalid values have safe fallbacks (don't crash)
- [ ] Reaches the right audience (session-only? all? sender only?)
- [ ] Client handles missing/malformed messages gracefully
- [ ] Old clients without the handler don't break (falls to `default: warn`)
- [ ] Both files committed together — mismatched versions cause silent failures

## Broadcast helper pattern

```javascript
_broadcastToSession(session, data, excludeWs = null) {
  const json = JSON.stringify(data);
  for (const player of session.players.values()) {
    if (player.ws !== excludeWs && player.ws.readyState === 1) {
      player.ws.send(json);
    }
  }
}
```

## Gotchas
- **Ordering**: WS is ordered per-connection, not across connections
- **Rate limiting**: high-frequency user-triggered messages should be debounced server-side
- **Reconnect**: re-send necessary state in `welcome` message so reconnecting clients recover
- **Large payloads**: send IDs not full objects; keep messages small
