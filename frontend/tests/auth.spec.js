import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flow', () => {
  const uniqueEmail = `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
  const userPassword = 'password123';
  const userName = 'Playwright Test User';

  test('Complete Auth Flow: Register, Duplicate handling, Login, Persistence, and Protected Route enforcement', async ({ page, browser }) => {
    // 1. Navigate to /register, fill form, submit and assert POST /api/auth/register returns 201
    await page.goto('/register');
    await page.fill('#name', userName);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', userPassword);

    const registerPromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/register') && response.request().method() === 'POST'
    );
    await page.click('button[type="submit"]');

    const registerResponse = await registerPromise;
    expect(registerResponse.status()).toBe(201);

    // 2. Submit the exact same registration again and assert UI shows a visible error message
    await page.goto('/register');
    await page.fill('#name', userName);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', userPassword);
    await page.click('button[type="submit"]');

    // Assert visible error message appears in the UI
    const errorAlert = page.locator('text=Email already registered');
    await expect(errorAlert).toBeVisible();

    // 3. Navigate to /login, log in with created user, assert redirect to /dashboard
    await page.goto('/login');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', userPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');

    // 4. Reload page while on /dashboard and assert still authenticated
    await page.reload();
    expect(page.url()).toContain('/dashboard');

    // 5. Assert JWT token is present in localStorage after login
    const token = await page.evaluate(
      () => localStorage.getItem('token') || localStorage.getItem('access_token')
    );
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    // 6. Open fresh incognito context (no localStorage), navigate to /dashboard, assert redirect to /login
    const incognitoContext = await browser.newContext();
    const incognitoPage = await incognitoContext.newPage();
    await incognitoPage.goto('/dashboard');
    await incognitoPage.waitForURL('**/login');
    expect(incognitoPage.url()).toContain('/login');
    await incognitoContext.close();
  });
});
