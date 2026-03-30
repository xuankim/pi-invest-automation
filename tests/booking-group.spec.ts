import { test } from '../fixtures';
import { BookingGroupPage } from '../pages/BookingGroupPage';
import { getCampaignNameByProject } from '../helpers/CampaignHelper';
import { TEST_DATA } from '../data/testData';

const PROJECT_NAME = TEST_DATA.projectName;

test.describe('Booking group', () => {
  /**
   * [ThemMoi BG] Tạo mới đợt booking
   * Chạy riêng: npx playwright test --grep "ThemMoi BG"
   */
  test('[ThemMoi BG] Tạo mới đợt booking', async ({ page }) => {
    const campaignName = await getCampaignNameByProject(page, PROJECT_NAME);
    if (!campaignName) {
      test.skip(true, `Chưa tồn tại chiến dịch thuộc ${PROJECT_NAME} với trạng thái Sắp/Đang diễn ra`);
    }

    const bookingCode = Array.from({ length: 3 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const dateStr = new Date().toISOString().slice(0, 10);
    const bookingName = `Booking ${dateStr} ${Math.floor(Math.random() * 9000 + 1000)}`;

    const bookingPage = new BookingGroupPage(page);
    await bookingPage.navigateToList();
    await bookingPage.clickAddNew();
    await bookingPage.fillCreateForm({
      campaignName,
      bookingName,
      bookingCode,
      memberTier: TEST_DATA.memberTier,
      memberDiscount: TEST_DATA.memberDiscount,
      projectName: PROJECT_NAME,
    });
    await bookingPage.save();
    await bookingPage.verifyCreated(bookingName);
  });
});
