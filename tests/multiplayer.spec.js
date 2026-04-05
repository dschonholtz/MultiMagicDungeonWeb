// multiplayer.spec.js — Two browser contexts, one server.
// Each newContext() creates an independent WebSocket connection,
// simulating two real players without needing a second machine.
//
// IMPORTANT: These tests hit the live WebSocket server (ws://5.161.208.234:8080).
// If the server is unreachable the game falls back to offline mode (id starts with "offline-").
// Tests check for this and skip gracefully rather than failing CI.

import { test, expect } from '@playwright/test';
import { waitForGame, gameState, isOnline } from './helpers.js';

// Helper: open a fresh page in a new isolated context and wait for game ready
async function openPlayer(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000');
  await waitForGame(page);
  return { page, ctx };
}

test('second tab increases player count in HUD', async ({ browser }) => {
  const p1 = await openPlayer(browser);

  if (!await isOnline(p1.page)) {
    test.skip(true, 'WebSocket server unreachable — skipping multiplayer test');
    await p1.ctx.close();
    return;
  }

  // Give P1 a moment to register on the server before P2 connects
  await p1.page.waitForTimeout(500);
  const p2 = await openPlayer(browser);

  try {
    // P1 waits to see at least one remote player
    await p1.page.waitForFunction(
      () => window.__TEST__.state().remotePlayerCount >= 1,
      { timeout: 10_000 }
    );

    const state = await gameState(p1.page);
    expect(state.remotePlayerCount).toBeGreaterThanOrEqual(1);

    // HUD should now read "2 players in dungeon" (or more if server has real players)
    await expect(p1.page.locator('#player-count')).toContainText('player');
    const countText = await p1.page.locator('#player-count').textContent();
    const n = parseInt(countText);
    expect(n).toBeGreaterThanOrEqual(2);

  } finally {
    await p1.ctx.close();
    await p2.ctx.close();
  }
});

test('P1 can see P2 in remotePlayers map', async ({ browser }) => {
  const p1 = await openPlayer(browser);

  if (!await isOnline(p1.page)) {
    test.skip(true, 'WebSocket server unreachable — skipping multiplayer test');
    await p1.ctx.close();
    return;
  }

  await p1.page.waitForTimeout(500);
  const p2 = await openPlayer(browser);

  try {
    // Wait for P1 to receive P2's join event
    await p1.page.waitForFunction(
      () => window.__TEST__.state().remotePlayerCount >= 1,
      { timeout: 10_000 }
    );

    const p2State = await gameState(p2.page);
    const p2Id = p2State.localPlayer.id;

    const p1State = await gameState(p1.page);
    expect(p1State.remotePlayers).toContain(p2Id);

    // Verify a Three.js mesh was created for P2
    const hasMesh = await p1.page.evaluate(
      (id) => window.game.remotePlayers.get(id)?.mesh != null,
      p2Id
    );
    expect(hasMesh).toBe(true);

  } finally {
    await p1.ctx.close();
    await p2.ctx.close();
  }
});

test('P2 movement is received by P1 (targetPos updates)', async ({ browser }) => {
  const p1 = await openPlayer(browser);

  if (!await isOnline(p1.page)) {
    test.skip(true, 'WebSocket server unreachable — skipping multiplayer test');
    await p1.ctx.close();
    return;
  }

  await p1.page.waitForTimeout(500);
  const p2 = await openPlayer(browser);

  try {
    await p1.page.waitForFunction(
      () => window.__TEST__.state().remotePlayerCount >= 1,
      { timeout: 10_000 }
    );

    const p2State = await gameState(p2.page);
    const p2Id = p2State.localPlayer.id;

    // Move P2 using real key input
    await p2.page.locator('#game-canvas').focus();
    await p2.page.keyboard.down('KeyD');
    await p2.page.waitForTimeout(500);
    await p2.page.keyboard.up('KeyD');

    const p2After = await gameState(p2.page);
    const expectedX = p2After.localPlayer.x;

    // Server sends moves at 20hz; wait for P1 to receive the update
    await p1.page.waitForFunction(
      ([id, ex]) => {
        const rp = window.game.remotePlayers.get(id);
        return rp && Math.abs(rp.targetPos.x - ex) < 5.0;
      },
      [p2Id, expectedX],
      { timeout: 5_000 }
    );

  } finally {
    await p1.ctx.close();
    await p2.ctx.close();
  }
});

test('P2 disconnecting reduces player count on P1', async ({ browser }) => {
  const p1 = await openPlayer(browser);

  if (!await isOnline(p1.page)) {
    test.skip(true, 'WebSocket server unreachable — skipping multiplayer test');
    await p1.ctx.close();
    return;
  }

  await p1.page.waitForTimeout(500);
  const p2 = await openPlayer(browser);

  try {
    // Wait for both players to be connected
    await p1.page.waitForFunction(
      () => window.__TEST__.state().remotePlayerCount >= 1,
      { timeout: 10_000 }
    );

    const countBefore = (await gameState(p1.page)).remotePlayerCount;

    // Close P2's context — WebSocket closes, server sends player_leave
    await p2.ctx.close();

    // P1 should see the count drop
    await p1.page.waitForFunction(
      (expected) => window.__TEST__.state().remotePlayerCount < expected,
      countBefore,
      { timeout: 8_000 }
    );

    const countAfter = (await gameState(p1.page)).remotePlayerCount;
    expect(countAfter).toBeLessThan(countBefore);

  } finally {
    await p1.ctx.close();
    // p2 already closed above
  }
});
