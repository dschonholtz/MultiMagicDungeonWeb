// spells.spec.js — Spell casting: projectile appears, travels, expires.
// Spell casting requires isLocked=true (pointer lock gate).
// Tests bypass this via window.__TEST__.commands.enableSpells() and .castSpell().

import { test, expect } from '@playwright/test';
import { waitForGame, gameState, enableSpells, castSpell } from './helpers.js';

// SPELL_DEFS from the game (duplicated here for assertion constants)
const SPELL = {
  fireball:    { maxLifeMs: 1333, cooldownMs:  666 },
  frostbolt:   { maxLifeMs: 2000, cooldownMs: 1000 },
  telekinesis: { maxLifeMs: 1667, cooldownMs: 1500 },
};

test('fireball projectile is created on cast', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);

  const before = await gameState(page);
  expect(before.spells.length).toBe(0);

  await castSpell(page, 'fireball');

  await page.waitForFunction(
    () => window.__TEST__.state().spells.length > 0,
    { timeout: 2_000 }
  );

  const after = await gameState(page);
  expect(after.spells.length).toBeGreaterThan(0);
  expect(after.spells[0].type).toBe('fireball');
  expect(after.spells[0].alive).toBe(true);
});

test('fireball disappears within its maxLifeMs', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'fireball');

  // Wait slightly past maxLifeMs (1333ms) for the game loop to clean it up
  await page.waitForTimeout(SPELL.fireball.maxLifeMs + 200);

  const state = await gameState(page);
  const live = state.spells.filter(s => s.type === 'fireball' && s.alive);
  expect(live.length).toBe(0);
});

test('frostbolt projectile is created on cast', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'frostbolt');

  await page.waitForFunction(
    () => window.__TEST__.state().spells.some(s => s.type === 'frostbolt'),
    { timeout: 2_000 }
  );

  const state = await gameState(page);
  expect(state.spells.some(s => s.type === 'frostbolt' && s.alive)).toBe(true);
});

test('telekinesis projectile is created via E-key command', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'telekinesis');

  await page.waitForFunction(
    () => window.__TEST__.state().spells.some(s => s.type === 'telekinesis'),
    { timeout: 2_000 }
  );

  const state = await gameState(page);
  expect(state.spells.some(s => s.type === 'telekinesis')).toBe(true);
});

test('fireball cooldown is applied after cast', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'fireball');

  // Cooldown should be set immediately on the localPlayer
  await page.waitForFunction(
    () => (window.__TEST__.state().localPlayer?.cooldowns?.fireball ?? 0) > 0,
    { timeout: 2_000 }
  );

  const state = await gameState(page);
  expect(state.localPlayer.cooldowns.fireball).toBeGreaterThan(0);
});

test('spell slot DOM shows cooling class during cooldown', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'fireball');

  await page.waitForFunction(
    () => (window.__TEST__.state().localPlayer?.cooldowns?.fireball ?? 0) > 0
  );

  // HUD should reflect the cooldown state via CSS class
  await expect(page.locator('#spell-0')).toHaveClass(/cooling/);
});

test('fireball cooldown clears after cooldownMs elapses', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await enableSpells(page);
  await castSpell(page, 'fireball');

  // Wait past cooldownMs (666ms) + a buffer
  await page.waitForTimeout(SPELL.fireball.cooldownMs + 300);

  const state = await gameState(page);
  expect(state.localPlayer.cooldowns.fireball).toBe(0);
  await expect(page.locator('#spell-0')).toHaveClass(/ready/);
});
