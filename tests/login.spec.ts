import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const email = process.env.USER_EMAIL || 'xuan.test@pigroup.com.vn';
    const otp = process.env.OTP_CODE || '111111';

    await loginPage.login(email, otp);

    // After login, URL should no longer be the login page
    await expect(page).not.toHaveURL(/login/);
    console.log('Current URL after login:', page.url());
  });

  test('should show the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });
  });
});
