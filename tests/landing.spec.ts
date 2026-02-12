import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.reload();
    expect(errors).toEqual([]);
});

test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Architecture Diagrams');
});

test('renders collection header', async ({ page }) => {
    await expect(page.locator('.collection-title')).toHaveText(
        'Cloudflare Proxy & Dashboard/API Failure',
    );
});

test('renders problem and solution cards', async ({ page }) => {
    await expect(page.locator('.card')).toHaveCount(2);
});

test('problem card links to failure diagram', async ({ page }) => {
    await expect(page.locator('.card').first()).toHaveAttribute(
        'href',
        'cf-api-proxy-failure.html',
    );
});

test('solution card links to solution diagram', async ({ page }) => {
    await expect(page.locator('.card').last()).toHaveAttribute(
        'href',
        'cf-api-proxy-solution.html',
    );
});
