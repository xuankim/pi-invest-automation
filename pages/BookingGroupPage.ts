import { Page, expect } from '@playwright/test';
import { selectDateTime } from '../helpers/DateTimePicker';

export interface BookingFormData {
  campaignName: string;
  bookingName: string;
  bookingCode: string;
  memberTier: string;
  memberDiscount: string;
  projectName: string;
}

export class BookingGroupPage {
  constructor(readonly page: Page) {}

  async navigateToList() {
    await this.page.locator('a[href="/campaign/booking-group"]').click();
    await expect(this.page).toHaveURL(/\/campaign\/booking-group/);
  }

  async clickAddNew() {
    await this.page.locator('button, a').filter({ hasText: /Thêm mới/i }).first().click();
  }

  async fillCreateForm(data: BookingFormData) {
    // Mã cấu hình (3 chữ in hoa)
    await this.page.getByRole('textbox', { name: 'Nhập mã cấu hình' }).fill(data.bookingCode);

    // Tên đợt booking
    await this.page.getByRole('textbox', { name: 'Nhập tên đợt booking' }).fill(data.bookingName);

    // Chiến dịch bán hàng
    await this.page.locator('text=Chọn chiến dịch bán hàng').click();
    await this.page.getByRole('option', { name: data.campaignName, exact: true }).click();

    // Thời gian bắt đầu: now + 1 phút
    await this.page.getByRole('button', { name: 'Nhập thời gian bắt đầu' }).click();
    await selectDateTime(this.page, 1);

    // Thời gian kết thúc: now + 6 phút
    await this.page.getByRole('button', { name: 'Nhập thời gian kết thúc' }).click();
    await selectDateTime(this.page, 6);

    // Mô tả
    await this.page.getByRole('textbox', { name: 'Nhập mô tả' }).fill(`Mô tả booking ${data.projectName}`);

    // Loại hình sản phẩm
    await this.page.getByRole('button', { name: 'Chọn loại hình sản phẩm' }).click();
    await this.page.getByRole('option', { name: 'Tất cả' }).click();

    // Phí booking
    await this.page.getByRole('textbox', { name: 'Nhập phí booking' }).fill('10000000');

    // Hạng thành viên
    await this.page.locator('text=Chọn hạng thành viên').click();
    await this.page.getByRole('option', { name: data.memberTier }).click();

    // Giá trị chiết khấu hạng thành viên — nth(0): spinbutton đầu tiên trong form
    await this.page.getByRole('spinbutton').nth(0).fill(data.memberDiscount);

    // Đơn vị chiết khấu
    await this.page.locator('text=Chọn đơn vị chiết khấu').click();
    await this.page.getByRole('option', { name: '%' }).click();

    // Chiết khấu % booking chung — nth(1): spinbutton thứ hai trong form
    await this.page.getByRole('spinbutton').nth(1).fill('10');
  }

  async save() {
    await this.page.locator('button').filter({ hasText: /^Lưu$/ }).click();
  }

  async verifyCreated(bookingName: string) {
    await expect(this.page).toHaveURL(/\/campaign\/booking-group$/, { timeout: 10000 });
    await expect(this.page.getByRole('table').getByRole('cell', { name: bookingName })).toBeVisible();
  }
}
