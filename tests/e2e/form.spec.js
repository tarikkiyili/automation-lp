import { test, expect } from '@playwright/test';
async function fill(page) {
  await page.getByLabel('İsim', { exact: true }).fill('Demo Deniz');
  await page.getByLabel('Soyisim', { exact: true }).fill('Örnek');
  await page.getByLabel('E-posta', { exact: true }).fill('demo@example.com');
  await page.getByLabel('Hizmet seçimi').selectOption('appointments');
  await page.getByLabel('Açıklama', { exact: true }).fill('Kurgusal salon için takvim otomasyonu istiyoruz.');
}
test('form validates locally, records through real API, and survives page reload', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Catch a blocked CSS load (e.g. production critical CSS onload vs CSP).
  await expect(page.locator('.hero')).toHaveCSS('display', 'grid');
  await expect(page.locator('.submit-button')).toHaveCSS('background-color', 'rgb(54, 90, 140)');
  await page.getByRole('button', { name: 'Talebimi gönder' }).click();
  await expect(page.getByText('İsim en az 2 karakter olmalı.')).toBeVisible();
  await expect(page.getByLabel('İsim', { exact: true })).toBeFocused();
  await fill(page);
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/requests') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Talebimi gönder' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  expect((await response.json()).id).toBeTruthy();
  await expect(page.getByRole('status')).toContainText('Talebiniz kaydedildi.');
  await expect(page.getByLabel('İsim', { exact: true })).toHaveValue('');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('pending disables submission; server failure preserves values; retry works', async ({ page }) => {
  await page.goto('/');
  await fill(page);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/requests', async route => {
    await gate;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Test storage failure' }) });
  });
  await page.getByRole('button', { name: 'Talebimi gönder' }).click();
  await expect(page.getByRole('button', { name: 'Gönderiliyor…' })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('gönderiliyor');
  release();
  await expect(page.getByRole('status')).toContainText('Kayıt onayı alınamadı.');
  await expect(page.getByLabel('İsim', { exact: true })).toHaveValue('Demo Deniz');
  await expect(page.getByRole('status')).not.toContainText('kaydedildi');
  await page.unroute('**/api/requests');
  await page.getByRole('button', { name: 'Talebimi gönder' }).click();
  await expect(page.getByRole('status')).toContainText('Talebiniz kaydedildi.');
});
test('keyboard skip link and FAQ are usable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'İçeriğe geç' })).toBeFocused();
  const question = page.locator('#faq summary').filter({ hasText: 'Demo talebinden sonra ne olur?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Talebiniz kaydedilir/)).toBeVisible();
});

test('split names validate separately and extended service can be submitted', async ({ page }) => {
  await page.goto('/');
  await fill(page);
  await page.getByLabel('Soyisim', {exact: true}).fill(' ');
  await page.getByRole('button', {name: 'Talebimi gönder'}).click();
  await expect(page.getByText('Soyisim en az 2 karakter olmalı.')).toBeVisible();
  await expect(page.getByLabel('Soyisim', {exact: true})).toBeFocused();
  await page.getByLabel('Soyisim', {exact: true}).fill('Örnek');
  await page.getByLabel('Hizmet seçimi').selectOption('branches');
  await expect(page.getByLabel('Açıklama', {exact: true})).toHaveCSS('resize', 'none');
  const [first, last] = await page.evaluate(() => ['name', 'surname'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return {x: r.x, y: r.y}; }));
  expect(first.y).toBe(last.y);
  expect(last.x).toBeGreaterThan(first.x);
  await page.getByRole('button', {name: 'Talebimi gönder'}).click();
  await expect(page.getByRole('status')).toContainText('Talebiniz kaydedildi.');
});

test('lost response retries the committed request without creating another record', async ({page}) => {
  await page.goto('/');
  await fill(page);
  let savedId, firstKey;
  await page.route('**/api/requests', async route => {
    firstKey=route.request().headers()['idempotency-key'];
    const response=await route.fetch();
    expect(response.status()).toBe(201);
    savedId=(await response.json()).id;
    await route.abort('connectionreset');
  });
  await page.locator('.submit-button').click();
  await expect(page.locator('.form-status')).toHaveClass(/error/);
  await expect(page.locator('#name')).toHaveValue('Demo Deniz');
  await page.unroute('**/api/requests');
  const response=page.waitForResponse(r=>r.url().endsWith('/api/requests')&&r.request().method()==='POST');
  await page.locator('.submit-button').click();
  const retry=await response;
  expect(retry.status()).toBe(200);
  expect((await retry.json()).id).toBe(savedId);
  expect(retry.request().headers()['idempotency-key']).toBe(firstKey);
  await expect(page.locator('.form-status')).toHaveClass(/success/);
});

test('invalid success responses, rate limiting and server validation never show success', async ({page}) => {
  await page.goto('/');await fill(page);
  for (const [status, body] of [[200,{id:true}],[429,{message:'Limited'}],[422,{errors:{email:'Geçerli bir e-posta adresi girin.'}}]]) {
    await page.route('**/api/requests',route=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)}));
    await page.locator('.submit-button').click();
    await expect(page.locator('.form-status')).toHaveClass(/error/);
    await expect(page.locator('#name')).toHaveValue('Demo Deniz');
    if(status===422)await expect(page.locator('#email')).toBeFocused();
    await page.unroute('**/api/requests');
  }
});
