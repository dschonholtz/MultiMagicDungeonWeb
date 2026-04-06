// smoke.spec.js — Fastest sanity check: page loads, canvas renders, no errors.
// Run this after every edit to index.html before anything else.
//   npm run test:smoke

import { test, expect } from '@playwright/test';
import { waitForGame, gameState, assertNoConsoleErrors } from './helpers.js';

test('page loads without console errors', async ({ page }) => {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m); });

  await page.goto('/');
  await waitForGame(page);

  // Filter out expected non-game errors:
  // - WebSocket failures (game server offline in test env, Vite HMR)
  // - Resource 404s (favicon.ico)
  const meaningful = errors.filter(e => {
    const t = e.text();
    if (/WebSocket connection.*failed/i.test(t)) return false;
    if (/Failed to load resource.*404/i.test(t)) return false;
    return true;
  });
  assertNoConsoleErrors(meaningful);
});

test('canvas is visible and fills the viewport', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  const canvas = page.locator('#game-canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(100);
});

test('HUD elements are present', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  await expect(page.locator('#health-bar')).toBeVisible();
  await expect(page.locator('#player-count')).toBeVisible();
  await expect(page.locator('#spell-0')).toBeVisible();   // Fireball slot
  await expect(page.locator('#spell-1')).toBeVisible();   // Frostbolt slot
  await expect(page.locator('#spell-2')).toBeVisible();   // Telekinesis slot
  await expect(page.locator('#settings-gear')).toBeVisible();
});

test('localPlayer spawns with full HP and a Guest name', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  const state = await gameState(page);
  expect(state.localPlayer).not.toBeNull();
  expect(state.localPlayer.hp).toBe(100);
  expect(state.localPlayer.username).toMatch(/^Guest\d{4}$/);
});

test('game state is accessible via window.__TEST__', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  const state = await gameState(page);
  // localPlayer fields present
  expect(typeof state.localPlayer.x).toBe('number');
  expect(typeof state.localPlayer.z).toBe('number');
  // Cooldowns object exists with all three spell keys
  expect(state.localPlayer.cooldowns).toHaveProperty('fireball');
  expect(state.localPlayer.cooldowns).toHaveProperty('frostbolt');
  expect(state.localPlayer.cooldowns).toHaveProperty('telekinesis');
});

test('doorway framing produces wall segments at every connection', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  const wallMeshCount = await page.evaluate(() => window.__TEST__.state().wallMeshCount);
  // Without framing: shared faces produce 0 wall planes (bare opening).
  // With framing: each shared face produces up to 3 segments (left jamb, right jamb, lintel).
  // The DEFAULT_DUNGEON has 5 rooms + 6 corridors with multiple shared faces, so framing
  // should result in significantly more wall meshes than the unframed minimum.
  // Minimum unframed wall count = sum of un-shared faces only. With framing the count rises
  // because each previously-skipped face now contributes 2-3 segments instead of 0.
  // A safe lower bound: >60 wall meshes in the full dungeon with framing enabled.
  expect(wallMeshCount).toBeGreaterThan(60);
});
