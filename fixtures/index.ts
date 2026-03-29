import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Mở rộng fixture mặc định: page tự động login trước mỗi test.
 * Dùng trong spec files:
 *   import { test, expect } from '../fixtures';
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.USER_EMAIL || 'xuan.test@pigroup.com.vn',
      process.env.OTP_CODE || '111111'
    );
    await use(page);
  },
});

export { expect } from '@playwright/test';
