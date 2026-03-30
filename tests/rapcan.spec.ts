import { test } from '../fixtures';
import { RapCanPage } from '../pages/RapCanPage';
import { getCampaignNameByProject, getBookingNameByCampaign, parseBookingDateTime } from '../helpers/CampaignHelper';
import { TEST_DATA } from '../data/testData';

const PROJECT_NAME = TEST_DATA.projectName;

test.describe('Ráp căn', () => {
  /**
   * [ThemMoi RC] Tạo mới đợt ráp căn
   * Yêu cầu: đã có booking hợp lệ thuộc projectName
   * Chạy riêng: npx playwright test --grep "ThemMoi RC"
   */
  test('[ThemMoi RC] Tạo mới đợt ráp căn', async ({ page }) => {
    const campaignName = await getCampaignNameByProject(page, PROJECT_NAME);
    if (!campaignName) {
      test.skip(true, `Chưa có chiến dịch hợp lệ thuộc dự án ${PROJECT_NAME}`);
    }

    const bookingInfo = await getBookingNameByCampaign(page, campaignName!);
    if (!bookingInfo) {
      test.skip(true, `Chưa có đợt booking nào cho dự án ${PROJECT_NAME}`);
    }

    const rapCanName = `Ráp căn ${new Date().toISOString().slice(0, 10)} ${Math.floor(Math.random() * 9000 + 1000)}`;
    // Thời gian bắt đầu ráp căn = thời gian kết thúc booking + 1 phút
    const startTime = new Date(parseBookingDateTime(bookingInfo.endTimeText).getTime() + 60 * 1000);

    const rapCanPage = new RapCanPage(page);
    await rapCanPage.navigateToList();
    await rapCanPage.clickAddNew();
    await rapCanPage.fillCreateForm({
      rapCanName,
      campaignName,
      startTime,
      memberTier: TEST_DATA.memberTier,
      memberDiscount: TEST_DATA.memberDiscount,
    });
    await rapCanPage.save();
    await rapCanPage.clickProductTab();
    const added = await rapCanPage.addProducts();
    if (!added) {
      test.skip(true, 'Không có sản phẩm nào để thêm vào ráp căn');
    }
    await rapCanPage.configureProductsAfterAdd(TEST_DATA.productDiscountPercent);
  });
});
