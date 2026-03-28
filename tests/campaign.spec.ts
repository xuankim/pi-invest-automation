import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Chiến dịch bán hàng', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const email = process.env.USER_EMAIL || 'xuan.test@pigroup.com.vn';
    const otp = process.env.OTP_CODE || '111111';
    await loginPage.login(email, otp);
  });

  test('Danh sách chiến dịch - navigate và verify nút Thêm mới', async ({ page }) => {
    // Mở rộng menu "Chiến dịch bán hàng" nếu chưa mở
    const menuParent = page.getByRole('link', { name: /Chiến dịch bán hàng/i }).or(
      page.locator('text=Chiến dịch bán hàng').first()
    );
    await menuParent.click();

    // Click "Danh sách chiến dịch" (dùng href để tránh trùng selector)
    const menuItem = page.locator('a[href="/campaign/sales"]');
    await menuItem.click();

    // Verify URL
    await expect(page).toHaveURL(/\/campaign\/sales/);

    // Verify nút "Thêm mới" hiển thị và có thể click
    const themMoiBtn = page.locator('button, a').filter({ hasText: /Thêm mới/i }).first();
    await expect(themMoiBtn).toBeVisible();
    await expect(themMoiBtn).toBeEnabled();
  });
});
