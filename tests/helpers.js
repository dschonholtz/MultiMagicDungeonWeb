// Shared test utilities for MultiMagicDungeonWeb Playwright tests.
// All helpers are thin wrappers around window.__TEST__ — the seam added to index.html.

/**
 * Wait until the game has a localPlayer and is ready for input.
 * Uses the window.__TEST__.ready flag rather than a fixed sleep.
 * Timeout is generous (10s) to accommodate slow WebSocket handshakes.
 */
export async function waitForGame(page) {
  await page.waitForFunction(
    () => window.__TEST__?.ready === true,
    { timeout: 10_000 }
  );
}

/**
 * Return the full JSON-serializable game state snapshot.
 * Safe to call from any test — returns plain objects, no live Three.js refs.
 */
export async function gameState(page) {
  return page.evaluate(() => window.__TEST__.state());
}

/**
 * Verify the game is connected (not in offline fallback mode).
 * Offline player IDs start with "offline-"; skip multiplayer tests if true.
 */
export async function isOnline(page) {
  const state = await gameState(page);
  return state.localPlayer && !state.localPlayer.id.startsWith('offline-');
}

/**
 * Enable spell casting without requiring real pointer lock.
 * Playwright's Chromium does not grant pointer lock to test pages.
 */
export async function enableSpells(page) {
  await page.evaluate(() => window.__TEST__.commands.enableSpells());
}

/**
 * Cast a spell by type ('fireball', 'frostbolt', 'telekinesis') through the test seam.
 */
export async function castSpell(page, type) {
  await page.evaluate((t) => window.__TEST__.commands.castSpell(t), type);
}

/**
 * Teleport localPlayer to (x, z) instantly.
 * Useful for portal proximity tests without pressing keys for 20 seconds.
 */
export async function teleport(page, x, z) {
  await page.evaluate(([x, z]) => window.__TEST__.commands.teleport(x, z), [x, z]);
}

/**
 * Assert that no console errors occurred.
 * Pass the errors array collected via page.on('console', ...).
 */
export function assertNoConsoleErrors(errors) {
  const msgs = errors.map(e => e.text());
  if (msgs.length > 0) throw new Error(`Console errors:\n${msgs.join('\n')}`);
}
