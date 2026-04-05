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

  assertNoConsoleErrors(errors);
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
