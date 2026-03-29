import { Page } from '@playwright/test';

/**
 * Chọn tất cả sản phẩm trên trang hiện tại và trang tiếp theo (nếu có),
 * sau đó click nút "Thêm".
 * Trả về false nếu bảng không có sản phẩm nào.
 */
export async function selectAllProductsAndAdd(page: Page): Promise<boolean> {
  const dialog = page.getByRole('dialog', { name: /Thêm sản phẩm/ });
  const productTable = dialog.getByRole('table');
  await productTable.waitFor({ state: 'visible', timeout: 15000 });

  // Chờ loading row biến mất trước khi kiểm tra data
  await dialog.locator('text=Đang tải dữ liệu...').waitFor({ state: 'hidden', timeout: 15000 });

  // Kiểm tra có data thật không (không phải empty state hoặc "không có dữ liệu")
  const isEmpty = await dialog.locator('text=Không có dữ liệu').isVisible();
  if (isEmpty) {
    return false;
  }

  const headerCheckbox = productTable.getByRole('columnheader').first().getByRole('checkbox');

  async function selectAllOnCurrentPage() {
    // Chờ checkbox header enabled (data đã load xong)
    await headerCheckbox.waitFor({ state: 'visible' });
    await headerCheckbox.check();
  }

  // Chọn tất cả trang 1
  await selectAllOnCurrentPage();

  // Nếu có trang tiếp theo → chọn tất cả trang 2
  const nextBtn = dialog.getByRole('button', { name: 'Sau' });
  if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
    await nextBtn.click();
    await productTable.waitFor({ state: 'visible', timeout: 10000 });
    await selectAllOnCurrentPage();
  }

  // Click nút Thêm trong dialog
  await dialog.getByRole('button', { name: 'Thêm' }).click();
  return true;
}
