import { test, expect } from '@playwright/test';
async function preferences(page) {
  if (await page.locator('.menu-toggle').isVisible()) {
    if (await page.locator('#mobile-menu').isHidden()) await page.locator('.menu-toggle').click();
    return page.locator('#mobile-menu');
  }
  return page.locator('.desktop-preferences');
}
async function closeMenu(page) {
  if (await page.locator('#mobile-menu').isVisible()) await page.locator('.menu-toggle').click();
}
test('language and theme controls translate content and preserve preferences and form values', async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.locator('#name').fill('Fictional Deniz');
  await page.locator('.submit-button').click();
  await (await preferences(page)).locator('.language-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('h1')).toContainText('Manage your appointments.');
  await expect(page.locator('#surname-error')).toContainText('Last name');
  await expect(page.locator('#name')).toHaveValue('Fictional Deniz');
  await (await preferences(page)).locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await closeMenu(page);
  await expect(page.locator('.slide-arrows button').first()).toHaveCSS('background-color','rgb(35, 58, 86)');
  await expect(page.locator('.card-tab button').first()).toHaveCSS('color','rgb(194, 212, 236)');
  await page.locator('#faq-search-input').fill('cancellation');
  await expect(page.locator('#faq summary').first()).toBeVisible();
  await expect(page.locator('#faq details[open]')).toHaveCount(0);
  await page.locator('#faq summary').first().click();
  await expect(page.locator('#faq details[open]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('English request validates and saves with unchanged service identifiers', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('randevu.language','en'));
  await page.goto('/');
  await page.locator('.submit-button').click();
  await expect(page.locator('#name-error')).toContainText('First name');
  await page.getByLabel('First name',{exact:true}).fill('Fictional Deniz');
  await page.getByLabel('Last name',{exact:true}).fill('Example');
  await page.getByLabel('Email',{exact:true}).fill('fictional@example.com');
  await page.getByLabel('Service',{exact:true}).selectOption('branches');
  await page.getByLabel('Description',{exact:true}).fill('Fictional business requesting appointment scheduling.');
  const response=page.waitForResponse(r=>r.url().endsWith('/api/requests')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Send my request'}).click();
  const saved=await response;expect(saved.status()).toBe(201);expect(saved.request().postDataJSON().service).toBe('branches');
  await expect(page.getByRole('status')).toContainText('Your request has been saved.');
});
test('light is the default even with dark OS; controls work without storage', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'});
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await (await preferences(page)).locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await (await preferences(page)).locator('.language-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
});
test('failed language download retains current language and can be retried', async ({page}) => {
  await page.goto('/');
  await page.route('**/i18n/en.json',route=>route.fulfill({status:503,body:'unavailable'}));
  await (await preferences(page)).locator('.language-toggle').click();
  await expect((await preferences(page)).locator('.preference-error')).toBeVisible({timeout:15000});
  await expect(page.locator('html')).toHaveAttribute('lang','tr');
  await page.unroute('**/i18n/en.json');
  await (await preferences(page)).locator('.language-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
});

test('dark CTA stays opaque when the watch emerges', async ({page}) => {
  await page.addInitScript(()=>localStorage.setItem('randevu.theme','dark'));
  await page.goto('/');
  const button=page.locator('.demo-button');
  await button.hover();
  await expect(button).toHaveCSS('background-color','rgb(66, 108, 164)');
  await button.focus();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('language fades and theme transitions respect reduced motion', async ({page}) => {
  await page.addInitScript(()=>{
    window.rootFades=0;
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(...args){if(this.tagName==='APP-ROOT')window.rootFades++;return animate.apply(this,args);};
  });
  await page.goto('/');
  await (await preferences(page)).locator('.language-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect((await preferences(page)).locator('.language-toggle')).toBeEnabled();
  expect(await page.evaluate(()=>window.rootFades)).toBe(2);
  await expect(page.locator('app-root')).toHaveCSS('opacity','1');
  await (await preferences(page)).locator('.theme-toggle').evaluate(button=>button.click());
  await expect(page.locator('html')).toHaveClass(/theme-transition/);
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  await page.emulateMedia({reducedMotion:'reduce'});
  await (await preferences(page)).locator('.language-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang','tr');
  await (await preferences(page)).locator('.theme-toggle').click();
  await expect(page.locator('html')).not.toHaveClass(/theme-transition/);
  expect(await page.evaluate(()=>window.rootFades)).toBe(2);
});
