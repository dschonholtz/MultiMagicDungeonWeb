// movement.spec.js — WASD moves the player; camera follows.
// Movement does NOT require pointer lock — keys are registered on document,
// but the canvas must have focus so events aren't swallowed by the rename input.

import { test, expect } from '@playwright/test';
import { waitForGame, gameState } from './helpers.js';

// Focus canvas without triggering a spell cast (mousedown fires spells, click does not)
async function focusCanvas(page) {
  await page.locator('#game-canvas').focus();
}

test('W key moves player in the negative-Z direction', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await focusCanvas(page);

  const before = await gameState(page);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(400);   // 14 units/sec × 0.4s ≈ 5.6 units
  await page.keyboard.up('KeyW');

  const after = await gameState(page);
  // At default yaw=0 the camera faces -Z, so W moves Z in the negative direction
  expect(after.localPlayer.z).toBeLessThan(before.localPlayer.z - 1.0);
});

test('S key moves player in the positive-Z direction', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await focusCanvas(page);

  const before = await gameState(page);
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyS');

  const after = await gameState(page);
  expect(after.localPlayer.z).toBeGreaterThan(before.localPlayer.z + 1.0);
});

test('D key moves player in the positive-X direction', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await focusCanvas(page);

  const before = await gameState(page);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyD');

  const after = await gameState(page);
  expect(after.localPlayer.x).toBeGreaterThan(before.localPlayer.x + 1.0);
});

test('A key moves player in the negative-X direction', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await focusCanvas(page);

  const before = await gameState(page);
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(400);
  await page.keyboard.up('KeyA');

  const after = await gameState(page);
  expect(after.localPlayer.x).toBeLessThan(before.localPlayer.x - 1.0);
});

test('camera position tracks localPlayer position', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await focusCanvas(page);

  await page.keyboard.down('KeyW');
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyW');

  // Camera and player should be at the same XZ after movement
  const [camX, camZ, state] = await page.evaluate(() => [
    window.game.camera.position.x,
    window.game.camera.position.z,
    window.__TEST__.state(),
  ]);
  expect(camX).toBeCloseTo(state.localPlayer.x, 1);
  expect(camZ).toBeCloseTo(state.localPlayer.z, 1);
});

test('WASD keys do not move player when rename input is focused', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);

  await page.locator('#settings-gear').click();
  await page.locator('#rename-input').focus();
  const before = await gameState(page);

  await page.keyboard.press('KeyW');   // stopPropagation in the rename input handler blocks this
  await page.waitForTimeout(150);

  const after = await gameState(page);
  // Position must not have changed
  expect(Math.abs(after.localPlayer.z - before.localPlayer.z)).toBeLessThan(0.1);
  expect(Math.abs(after.localPlayer.x - before.localPlayer.x)).toBeLessThan(0.1);
});
