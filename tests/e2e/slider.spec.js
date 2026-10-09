import { test, expect } from '@playwright/test';

test('solution slider supports arrows, keyboard, dots and touch with one active card', async ({ page }) => {
  await page.goto('/');
  const slider = page.getByRole('region', { name: 'Randevu yönetimi çözümleri' });
  await slider.scrollIntoViewIfNeeded();
  await expect(slider.getByRole('heading')).toHaveText('Her yeni güne, düzenli bir başlangıç.');
  await expect(slider.locator('.turning-page')).toHaveCSS('opacity', '0', { timeout: 6000 });
  await expect(slider.locator('.next-page strong')).toHaveText('25');
  await slider.getByRole('button', { name: 'Sonraki slayt', exact: true }).click();
  await expect(slider.getByRole('heading')).toHaveText('Siz hatırlatmadan, onlar hatırlasın.');
  await page.keyboard.press('ArrowRight');
  await expect(slider.getByRole('heading')).toHaveText('Plan değişsin, düzeniniz değişmesin.');
  await slider.getByRole('button', { name: 'Her yeni güne, düzenli bir başlangıç. slaydını göster' }).click();
  await expect(slider.locator('.slide-dot').first()).toHaveAttribute('aria-current', 'true');
  await slider.evaluate(element => {
    for (const [type, x, y] of [['touchstart', 250, 200], ['touchend', 140, 205]]) {
      const touch = new Touch({ identifier: 1, target: element, clientX: x, clientY: y });
      element.dispatchEvent(new TouchEvent(type, { bubbles: true, changedTouches: [touch] }));
    }
  });
  await expect(slider.getByRole('heading')).toHaveText('Siz hatırlatmadan, onlar hatırlasın.');
  await expect(slider.locator('.solution-card')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('slider reduced-motion states remain legible and controls stay usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const slider = page.getByRole('region', { name: 'Randevu yönetimi çözümleri' });
  await slider.scrollIntoViewIfNeeded();
  const titles = ['Her yeni güne, düzenli bir başlangıç.', 'Siz hatırlatmadan, onlar hatırlasın.', 'Plan değişsin, düzeniniz değişmesin.'];
  for (let i = 0; i < 3; i++) {
    await expect(slider.getByRole('heading')).toHaveText(titles[i]);
    await expect(slider.locator('.solution-card')).toHaveCSS('animation-name', 'none');
    await slider.locator('.solution-card').screenshot({ path: `artifacts/slider-${testInfo.project.name}-${i}.png`, scale: 'css', style: 'app-header { visibility: hidden; }' });
    await slider.getByRole('button', { name: 'Sonraki slayt', exact: true }).click();
  }
  await expect(slider.locator('.turning-page')).toHaveCSS('opacity', '0');
});
