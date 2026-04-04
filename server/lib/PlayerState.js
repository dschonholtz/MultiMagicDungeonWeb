// PlayerState — tracks everything the server knows about a connected player

export class PlayerState {
  constructor({ id, username, sessionId, spawnPoint, ws }) {
    this.id = id;
    this.username = username;
    this.sessionId = sessionId;
    this.ws = ws;          // WebSocket connection — never serialised to other clients
    this.hp = 100;
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.z = spawnPoint.z;
    this.yaw = 0;
    this.pitch = 0;
    this.joinedAt = Date.now();
  }

  // Safe public snapshot — no ws reference
  toPublic() {
    return {
      id: this.id,
      username: this.username,
      x: this.x, y: this.y, z: this.z,
      yaw: this.yaw, pitch: this.pitch,
      hp: this.hp,
    };
  }

  applyMove({ x, y, z, yaw, pitch }) {
    // Basic server-side sanity clamp (prevent teleportation)
    const MAX_DELTA = 20;
    if (Math.abs(x - this.x) < MAX_DELTA) this.x = x;
    if (Math.abs(z - this.z) < MAX_DELTA) this.z = z;
    this.y = y;
    this.yaw = yaw;
    this.pitch = pitch;
  }
}
