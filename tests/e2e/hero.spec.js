import { test, expect } from '@playwright/test';

test('hero adds a simulated appointment without API requests and can pause', async ({ page }) => {
  await page.clock.install();
  let writes = 0;
  page.on('request', request => { if (request.method() === 'POST') writes++; });
  await page.goto('/');
  await page.locator('.calendar-scene').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(page.locator('.calendar-scene')).not.toHaveClass(/motion-paused/);
  const first = page.locator('.schedule-row').first();
  await expect(first).toContainText('Deniz');
  await page.clock.fastForward(900);
  await expect(first).toContainText('Selin');
  await page.clock.fastForward(3000);
  await expect(first).toContainText('Arda');
  await page.getByRole('button', { name: 'Takvim animasyonunu duraklat' }).click({ force: true });
  await page.clock.fastForward(18000);
  await expect(first).toContainText('Arda');
  await expect(page.locator('.schedule-row')).toHaveCount(3);
  expect(writes).toBe(0);
});

test('reduced motion leaves the hero calendar static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await page.locator('.calendar-scene').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.clock.fastForward(18000);
  await expect(page.locator('.schedule-row').first()).toContainText('Deniz');
  await expect(page.locator('.calendar')).toHaveCSS('animation-name', 'none');
});
