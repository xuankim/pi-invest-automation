import { test, expect } from '../fixtures';
import { CampaignPage } from '../pages/CampaignPage';
import { selectAllProductsAndAdd } from '../helpers/TableHelper';
import { TEST_DATA } from '../data/testData';

const PROJECT_NAME = TEST_DATA.projectName;

test.describe('Chiến dịch bán hàng', () => {
  /**
   * [Themmoi CDBH] Thêm sản phẩm vào chiến dịch bán hàng
   * Chạy riêng: npx playwright test --grep "Themmoi CDBH"
   */
  test('[Themmoi CDBH] Thêm sản phẩm vào chiến dịch bán hàng', async ({ page }) => {
    const campaignPage = new CampaignPage(page);

    // Tạo chiến dịch trước
    await campaignPage.navigateToList();
    await campaignPage.clickAddNew();
    await campaignPage.fillCreateForm(PROJECT_NAME);
    await campaignPage.save();

    // Verify chuyển sang màn hình Sản phẩm của chiến dịch vừa tạo
    await expect(page).toHaveURL(/tab=product/, { timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Thêm sản phẩm' })).toBeVisible();

    // Mở dialog Thêm sản phẩm
    await campaignPage.clickAddProduct();

    // Chọn tất cả và thêm
    const added = await selectAllProductsAndAdd(page);
    if (!added) {
      console.log('Không có sản phẩm');
      return;
    }

    await expect(page.locator('text=Thêm sản phẩm thành công')).toBeVisible({ timeout: 10000 });
  });
});
