// portal.spec.js — Portal proximity hint and travel trigger.
// The exit portal is at (-30, PLAYER_HEIGHT, 0).
// PORTAL_PRELOAD_DIST=50 → hint shows at <75 units (1.5x preload).
// PORTAL_ENTER_DIST=18  → travel fires when dist2D < 18.

import { test, expect } from '@playwright/test';
import { waitForGame, teleport } from './helpers.js';

// Distance from origin to exit portal center (-30, 0)
const PORTAL_X = -30;
const PORTAL_Z = 0;

test('portal hint is hidden when player is far away', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  // Default spawn is near (0,0) — ~30 units from portal, inside hint range.
  // Teleport somewhere far to confirm it hides.
  await teleport(page, 100, 0);
  await page.waitForTimeout(100);

  await expect(page.locator('#portal-hint')).toBeHidden();
});

test('portal hint appears when player is within ~75 units', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  // Teleport to 20 units away from the portal (well within hint range)
  await teleport(page, PORTAL_X + 20, PORTAL_Z);
  await page.waitForTimeout(150);   // one or two game loop ticks

  await expect(page.locator('#portal-hint')).toBeVisible();
});

test('portal hint text mentions VIBE JAM 2026', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  // Stay outside PORTAL_ENTER_DIST (18) but inside hint range
  await teleport(page, PORTAL_X + 25, PORTAL_Z);
  await page.waitForTimeout(150);

  await expect(page.locator('#portal-hint')).toContainText('VIBE JAM 2026');
});

test('entering portal triggers navigation away from localhost', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  // Start the navigation watch before teleporting so we don't miss it
  const navPromise = page.waitForURL(/jam\.pieter\.com/, { timeout: 8_000 });

  // Teleport directly onto the portal center (dist2D = 0, well within PORTAL_ENTER_DIST=18)
  await teleport(page, PORTAL_X, PORTAL_Z);

  await navPromise;
  expect(page.url()).toContain('jam.pieter.com');
});

test('arrived-from banner shown when portal=true param is present', async ({ page }) => {
  // Simulate arriving via portal from another game
  await page.goto('/?portal=true&ref=example.com&username=Merlin&color=blue&speed=14&hp=80');
  await waitForGame(page);

  const banner = page.locator('#arrived-from');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('example.com');
});

test('incoming portal URL params set username and HP correctly', async ({ page }) => {
  await page.goto('/?portal=true&ref=example.com&username=Gandalf&hp=60');
  await waitForGame(page);

  const state = await page.evaluate(() => window.__TEST__.state());
  // Username comes from incomingUser (URL param) when no portal dialog
  expect(state.localPlayer.username).toBe('Gandalf');
  expect(state.localPlayer.hp).toBe(60);
});
