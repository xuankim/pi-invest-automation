import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const email = process.env.USER_EMAIL || 'xuan.test@pigroup.com.vn';
  const otp = process.env.OTP_CODE || '111111';

  await loginPage.login(email, otp);

  // Save session state so other tests can reuse it
  await page.context().storageState({ path: authFile });
  console.log(`✓ Logged in as ${email}, session saved.`);
});
