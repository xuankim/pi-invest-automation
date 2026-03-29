import { Page, expect } from '@playwright/test';
import { selectDateTime, selectEndOfDay } from '../helpers/DateTimePicker';
import { generateCampaignName } from '../helpers/CampaignHelper';

export class CampaignPage {
  constructor(readonly page: Page) {}

  /** Mở menu trái → Danh sách chiến dịch */
  async navigateToList() {
    await this.page.locator('text=Chiến dịch bán hàng').first().click();
    await this.page.locator('a[href="/campaign/sales"]').click();
    await expect(this.page).toHaveURL(/\/campaign\/sales/);
  }

  /** Click nút Thêm mới → vào trang tạo chiến dịch */
  async clickAddNew() {
    await this.page.locator('button, a').filter({ hasText: /Thêm mới/i }).first().click();
    await expect(this.page).toHaveURL(/\/campaign\/sales\/create/);
  }

  /**
   * Điền đầy đủ form tạo chiến dịch.
   * - Thời gian bắt đầu: hiện tại + 1 phút
   * - Thời gian kết thúc: cuối ngày hôm nay (23:59)
   * @returns tên chiến dịch đã nhập
   */
  async fillCreateForm(projectName: string): Promise<string> {
    // Chọn Dự án (Chủ đầu tư tự động được chọn)
    await this.page.locator('text=Chọn dự án').click();
    await this.page.getByRole('option', { name: projectName }).click();

    // Nhập tên chiến dịch
    const campaignName = generateCampaignName();
    await this.page.locator('input[placeholder*="Nhập tên chiến dịch"]').fill(campaignName);

    // Chọn khách hàng áp dụng
    await this.page.locator('text=Chọn khách hàng').click();
    await this.page.getByRole('option', { name: 'Tất cả' }).click();

    // Thời gian bắt đầu: +1 phút
    await this.page.getByRole('button', { name: 'Chọn thời gian bắt đầu' }).click();
    await selectDateTime(this.page, 1);

    // Thời gian kết thúc: cuối ngày (23:59)
    await this.page.getByRole('button', { name: 'Chọn thời gian kết thúc' }).click();
    await selectEndOfDay(this.page);

    // Mô tả
    await this.page.locator('textarea[placeholder*="Nhập mô tả"]').fill(`Đây là mô tả cho ${projectName}`);

    return campaignName;
  }

  /** Click nút Lưu */
  async save() {
    await this.page.locator('button').filter({ hasText: /^Lưu$/ }).click();
  }

  /** Click nút Thêm sản phẩm */
  async clickAddProduct() {
    await this.page.locator('button, a').filter({ hasText: /Thêm sản phẩm/i }).first().click();
  }
}
