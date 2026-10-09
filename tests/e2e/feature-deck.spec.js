import { test, expect } from '@playwright/test';

test('every stacked card remains reachable and opens its own details', async ({ page }, testInfo) => {
  await page.goto('/');
  const section = page.locator('#features');
  for (const name of ['Ekip takvimi', 'Otomatik hatırlatma', 'Esnek planlama', 'Online randevu']) {
    const button = section.getByRole('button', { name, exact: false });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(section.locator('.deck-detail:visible')).toHaveCount(1);
    await expect(section.locator('.deck-card.front')).toContainText(name);
  }
  const other = section.getByRole('button', { name: /Ekip takvimi/ });
  await other.focus();
  await page.keyboard.press('Enter');
  await expect(other).toHaveAttribute('aria-expanded', 'true');
  await expect(section.locator('.deck-hint')).toHaveClass(/interacted/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await section.locator('.feature-deck-area').screenshot({ path: `artifacts/deck-${testInfo.project.name}.png`, scale: 'css', style: 'app-header,.skip-link{visibility:hidden}' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('rapid card changes settle on the last choice and reduced motion stays static', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#features');
  await section.locator('.feature-deck').scrollIntoViewIfNeeded();
  await section.locator('#deck-tab-1').click();
  // Interrupt the ongoing lift with a second selection.
  await section.locator('#deck-tab-3').evaluate(button => button.click());
  await expect(section.locator('#deck-tab-3')).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => section.locator('.deck-card').evaluateAll(cards => cards.flatMap(card => card.getAnimations()).filter(a => a.playState === 'running').length)).toBe(0);
  await expect(section.locator('.front')).toHaveAttribute('data-card', '3');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await section.locator('#deck-tab-2').click();
  await expect(section.locator('#deck-tab-2')).toHaveAttribute('aria-expanded', 'true');
  expect(await section.locator('.deck-card').evaluateAll(cards => cards.flatMap(card => card.getAnimations()).length)).toBe(0);
});
