import { test, expect } from '@playwright/test';

test('navbar compacts and stays accessible in both scroll directions', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('.header-shell');
  const fullHeight = (await header.boundingBox()).height;
  for (const top of [600, 1800, 1775]) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    await expect(header).toHaveClass(/compact/);
    await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
    await expect(page.locator('.demo-button')).toBeInViewport();
    await expect.poll(async () => (await header.boundingBox()).height).toBeLessThan(fullHeight);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(header).not.toHaveClass(/compact/);
});

test('mobile menu supports Escape, outside click and section navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeHidden();
  await expect(page.locator('.demo-button')).toHaveAccessibleName('Demo Talebi');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('link', { name: 'Özellikler' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('heading', { level: 1 }).click({ position: { x: 10, y: 160 } });
  await expect(menu).toBeHidden();
  await toggle.click();
  await menu.getByRole('link', { name: 'Sık sorulanlar' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#faq$/);
  await expect(page.locator('#faq')).toBeFocused();
  await expect.poll(async () => {
    const box = await page.locator('#faq').boundingBox();
    return box.y >= 70 && box.y < 140;
  }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion disables navbar and button transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.header-shell')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.demo-button')).toHaveCSS('transition-duration', '0s');
});
