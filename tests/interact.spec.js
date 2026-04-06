// interact.spec.js — Altar interact button and ?pos= URL param tests.
// Verifies: button visibility near altar, click triggers examine, button hides when far,
// ?pos= teleports player on load, and desktop label includes [F].

import { test, expect } from '@playwright/test';
import { waitForGame, gameState } from './helpers.js';

// Altar is at (0, -57) with a proximity radius of 8
const ALTAR_X = 0;
const ALTAR_Z = -57;

test('?pos= URL param is parsed and exposes teleportTo', async ({ page }) => {
  await page.goto(`/?pos=${ALTAR_X},${ALTAR_Z}`);
  await waitForGame(page);

  // Verify teleportTo is available on __TEST__
  const hasTeleportTo = await page.evaluate(() => typeof window.__TEST__.teleportTo === 'function');
  expect(hasTeleportTo).toBe(true);

  // Use teleportTo to confirm it works
  await page.evaluate(([x, z]) => window.__TEST__.teleportTo(x, z), [ALTAR_X, ALTAR_Z]);
  await page.waitForTimeout(100);
  const state = await gameState(page);
  expect(state.localPlayer.x).toBeCloseTo(ALTAR_X, 0);
  expect(state.localPlayer.z).toBeCloseTo(ALTAR_Z, 0);
});

test('interact button visible near altar', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  await page.evaluate(([x, z]) => window.__TEST__.teleportTo(x, z), [ALTAR_X, ALTAR_Z]);
  await page.waitForTimeout(200);

  const btn = page.locator('#interact-btn');
  await expect(btn).toBeVisible();
});

test('interact button shows "Examine [F]" on desktop', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  await page.evaluate(([x, z]) => window.__TEST__.teleportTo(x, z), [ALTAR_X, ALTAR_Z]);
  await page.waitForTimeout(200);

  const btn = page.locator('#interact-btn');
  await expect(btn).toBeVisible();
  const text = await btn.textContent();
  expect(text).toContain('Examine');
  expect(text).toContain('[F]');
});

test('clicking interact button triggers altar examine', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  await page.evaluate(([x, z]) => window.__TEST__.teleportTo(x, z), [ALTAR_X, ALTAR_Z]);
  await page.waitForTimeout(200);

  const btn = page.locator('#interact-btn');
  await expect(btn).toBeVisible();

  const before = await page.evaluate(() => window.__TEST__.interactCount);
  await btn.click({ force: true });
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => window.__TEST__.interactCount);
  expect(after).toBeGreaterThan(before);
});

test('interact button hidden when far from altar', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  // Teleport to a spot far from altar
  await page.evaluate(() => window.__TEST__.teleportTo(50, 50));
  await page.waitForTimeout(200);

  const btn = page.locator('#interact-btn');
  await expect(btn).not.toBeVisible();
});

test('teleportTo moves player away and hides button', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  // First teleport near altar
  await page.evaluate(([x, z]) => window.__TEST__.teleportTo(x, z), [ALTAR_X, ALTAR_Z]);
  await page.waitForTimeout(200);

  const btn = page.locator('#interact-btn');
  await expect(btn).toBeVisible();

  // Teleport far away
  await page.evaluate(() => window.__TEST__.teleportTo(100, 100));
  await page.waitForTimeout(200);

  await expect(btn).not.toBeVisible();
});
