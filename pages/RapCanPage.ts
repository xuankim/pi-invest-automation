import { Page, expect } from '@playwright/test';
import { selectDateTimeAbsolute } from '../helpers/DateTimePicker';
import { TEST_DATA } from '../data/testData';

export interface RapCanFormData {
  rapCanName: string;
  campaignName: string;
  startTime: Date;
  memberTier: string;
  memberDiscount: string;
}

export class RapCanPage {
  constructor(readonly page: Page) {}

  async navigateToList() {
    await this.page.locator('a[href="/campaign/booking-assemble"]').click();
    await expect(this.page).toHaveURL(/\/campaign\/booking-assemble/);
  }

  async clickAddNew() {
    await this.page.locator('button, a').filter({ hasText: /Thêm mới/i }).first().click();
  }

  async fillCreateForm(data: RapCanFormData) {
    // Spinbuttons không có aria-label → dùng nth theo thứ tự DOM:
    // nth(0) = Countdown trước khi bắt đầu
    // nth(1) = Số lượng sản phẩm để dừng vòng lặp (Vòng chọn căn)
    // nth(2) = Thời lượng mỗi vòng - Vòng chọn căn
    // nth(3) = Thời lượng nghỉ để qua vòng đấu giá
    // nth(4) = Thời lượng mỗi vòng lặp - Vòng đấu giá
    // nth(5) = Thời lượng nghỉ để qua vòng tiếp theo
    // nth(6) = Giá trị chiết khấu hạng thành viên
    const spinbuttons = this.page.getByRole('spinbutton');

    // Tên đợt ráp căn (placeholder thực tế là "Nhập cấu hình")
    await this.page.getByRole('textbox', { name: 'Nhập cấu hình' }).fill(data.rapCanName);

    // Chiến dịch bán hàng
    await this.page.locator('text=Chọn chiến dịch bán hàng').click();
    await this.page.getByRole('option', { name: data.campaignName, exact: true }).click();

    // Thời gian bắt đầu = booking end + 1 phút
    await this.page.getByRole('button', { name: 'Nhập thời gian bắt đầu' }).click();
    await selectDateTimeAbsolute(this.page, data.startTime);

    // Countdown trước khi bắt đầu (phút) — nth(0)
    await spinbuttons.nth(0).fill(TEST_DATA.rapCanCountdown);

    // Radio "Tự động lập vòng" đã checked mặc định → không cần click

    // === Vòng chọn căn ===
    await spinbuttons.nth(1).fill('2');  // Số lượng sản phẩm để dừng vòng lặp
    await spinbuttons.nth(2).fill('1');  // Thời lượng mỗi vòng (phút)
    await spinbuttons.nth(3).fill('1');  // Thời lượng nghỉ để qua vòng đấu giá (phút)

    // === Vòng đấu giá ===
    await spinbuttons.nth(4).fill('1');  // Thời lượng mỗi vòng lặp (phút)
    await spinbuttons.nth(5).fill('1');  // Thời lượng nghỉ để qua vòng tiếp theo (phút)

    // === Chiết khấu booking group ===
    await this.page.locator('text=Chọn công thức áp dụng vòng 1').click();
    await this.page.getByRole('option').first().click();

    await this.page.locator('text=Chọn giá trị áp dụng vòng n').click();
    await this.page.getByRole('option').first().click();

    await this.page.locator('text=Chọn bước chiết khấu').click();
    await this.page.getByRole('option', { name: '1.0' }).click();

    // === Chiết khấu theo hạng thành viên ===
    await this.page.locator('text=Chọn nhóm khách hàng').click();
    await this.page.getByRole('option', { name: data.memberTier }).click();

    await spinbuttons.nth(6).fill(data.memberDiscount);  // Giá trị chiết khấu

    await this.page.locator('text=Chọn đơn vị chiết khấu').click();
    await this.page.getByRole('option', { name: '%' }).click();
  }

  async save() {
    await this.page.locator('button').filter({ hasText: /^Lưu$/ }).click();
    // Chờ redirect sang detail page — loại trừ /create để tránh khớp nhầm
    await expect(this.page).toHaveURL(/\/campaign\/booking-assemble\/(?!create)[^/]+/, { timeout: 15000 });
  }

  /** Click tab Sản phẩm trên detail page */
  async clickProductTab() {
    await this.page.getByRole('tab', { name: 'Sản phẩm' }).click();
  }

  /**
   * Thêm sản phẩm từ panel slide-in.
   * - Click "Thêm SP" → chờ panel mở
   * - Chọn tất cả sản phẩm trang đầu (checkbox header "Mã SP")
   * - Click "Thêm"
   * @returns false nếu không có sản phẩm nào, true nếu thêm thành công
   */
  async addProducts(): Promise<boolean> {
    await this.page.locator('button, a').filter({ hasText: /Thêm SP/i }).first().click();

    // Chờ panel slide-in mở ra (có tiêu đề "Thêm sản phẩm vào chiến dịch bán hàng")
    const panel = this.page.locator('text=Thêm sản phẩm vào chiến dịch bán hàng').locator('../..');
    await panel.waitFor({ state: 'visible', timeout: 15000 });

    // Chờ dữ liệu load xong
    await this.page.locator('text=Đang tải dữ liệu...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    // Kiểm tra không có sản phẩm
    const isEmpty = await this.page.locator('text=Không có dữ liệu').isVisible();
    if (isEmpty) return false;

    // Click checkbox header (chọn tất cả trang đầu) — cột đầu tiên của header table
    const table = this.page.getByRole('table').last();
    const headerCheckbox = table.getByRole('columnheader').first().getByRole('checkbox');
    await headerCheckbox.waitFor({ state: 'visible' });
    await headerCheckbox.check();

    // Click "Thêm"
    await this.page.getByRole('button', { name: 'Thêm' }).last().click();
    return true;
  }

  /**
   * Sau khi thêm sản phẩm:
   * - Nếu có message "Còn x sản phẩm chưa nhập giá." → click pencil icon cột Giá từng row và nhập giá
   * - Nhập % chiết khấu được nhận
   * - Click Áp dụng
   */
  async configureProductsAfterAdd(discountPercent: string): Promise<void> {
    // Chờ panel đóng
    await this.page.locator('text=Thêm sản phẩm vào chiến dịch bán hàng')
      .waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // Kiểm tra message "Còn x sản phẩm chưa nhập giá."
    const unpricedMsg = this.page.locator('text=/Còn \\d+ sản phẩm chưa nhập giá/');
    const hasUnpriced = await unpricedMsg.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasUnpriced) {
      // Cột Giá = index 5 (ID=0, MaSP=1, LoaiHinh=2, Tang=3, ViTriCan=4, Gia=5)
      // Mỗi row chưa nhập giá có "-" + pencil button trong cell đó
      const table = this.page.getByRole('table');
      const dataRows = table.getByRole('row').filter({ hasText: 'Chờ chọn căn' });
      const rowCount = await dataRows.count();

      for (let i = 0; i < rowCount; i++) {
        const priceCell = dataRows.nth(i).getByRole('cell').nth(5);
        const editBtn = priceCell.locator('button');
        if (await editBtn.isVisible()) {
          await editBtn.click();
          // Input xuất hiện inline trong cell sau khi click
          const priceInput = priceCell.locator('input');
          await priceInput.waitFor({ state: 'visible' });
          await priceInput.fill(TEST_DATA.defaultProductPrice);
          await priceInput.press('Enter');
        }
      }
    }

    // Nhập % chiết khấu được nhận (input bên dưới message, label "% chiết khấu được nhận")
    await this.page.locator('text=% chiết khấu được nhận')
      .locator('..').locator('input').fill(discountPercent);

    // Click Áp dụng
    await this.page.getByRole('button', { name: 'Áp dụng' }).click();
  }
}
