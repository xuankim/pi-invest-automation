import { Page } from '@playwright/test';
import { CampaignPage } from '../pages/CampaignPage';

/** Tạo tên chiến dịch unique: "Chiến dịch YYYY-MM-DD <4 số random>" */
export function generateCampaignName(): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `Chiến dịch ${dateStr} ${random}`;
}

/**
 * Lấy danh sách tên chiến dịch đã có ráp căn trạng thái "Chưa diễn ra" hoặc "Đang diễn ra".
 * Dùng để loại trừ khi tìm campaign cho test ráp căn mới.
 */
export async function getCampaignsWithActiveRapCan(page: Page): Promise<Set<string>> {
  const link = page.locator('a[href="/campaign/booking-assemble"]');
  if (!await link.isVisible()) {
    await page.getByText('Chiến dịch bán hàng', { exact: true }).first().click();
  }
  await link.click();
  await page.waitForURL(/\/campaign\/booking-assemble/);
  const table = page.getByRole('table');
  await table.waitFor({ state: 'visible', timeout: 15000 });

  const isEmpty = await page.locator('text=Không có dữ liệu').isVisible();
  if (isEmpty) return new Set();

  await table.getByRole('row').nth(1).waitFor({ state: 'visible', timeout: 15000 });

  // Lấy tất cả ráp căn active trên trang đầu (thường đủ để exclude)
  const activeRows = table.getByRole('row').filter({ hasText: /Chưa diễn ra|Đang diễn ra/ });
  const count = await activeRows.count();
  const result = new Set<string>();
  for (let i = 0; i < count; i++) {
    // col 3 = Chiến dịch bán hàng (ID=0, TenDot=1, TenDuAn=2, ChienDich=3)
    const name = (await activeRows.nth(i).getByRole('cell').nth(3).textContent())?.trim();
    if (name) result.add(name);
  }
  console.log(`[getCampaignsWithActiveRapCan] Campaigns đã có ráp căn active: ${[...result].join(', ') || '(none)'}`);
  return result;
}

/**
 * Tìm tên chiến dịch bán hàng thuộc projectName có trạng thái "Sắp diễn ra" hoặc "Đang diễn ra".
 * @param excludeCampaigns danh sách tên chiến dịch cần bỏ qua (đã có ráp căn active)
 * @returns tên chiến dịch nếu tìm thấy, null nếu không có
 */
export async function getCampaignNameByProject(
  page: Page,
  projectName: string,
  excludeCampaigns: Set<string> = new Set()
): Promise<string | null> {
  const campaignPage = new CampaignPage(page);
  await campaignPage.navigateToList();

  // Chờ table render xong
  const table = page.getByRole('table');
  await table.waitFor({ state: 'visible', timeout: 15000 });
  await table.getByRole('row').nth(1).waitFor({ state: 'visible', timeout: 15000 });

  const campaignRows = table.getByRole('row')
    .filter({ hasText: projectName })
    .filter({ hasText: /Sắp diễn ra|Đang diễn ra/ });

  const count = await campaignRows.count();
  console.log(`[getCampaignNameByProject] Tìm thấy ${count} chiến dịch thuộc "${projectName}" với trạng thái phù hợp`);

  if (count === 0) return null;

  // Lấy campaign đầu tiên không nằm trong danh sách exclude
  for (let i = 0; i < count; i++) {
    const name = (await campaignRows.nth(i).getByRole('cell').nth(1).textContent())?.trim() ?? '';
    if (!excludeCampaigns.has(name)) {
      console.log(`[getCampaignNameByProject] Chọn chiến dịch: "${name}"`);
      return name;
    }
    console.log(`[getCampaignNameByProject] Bỏ qua "${name}" (đã có ráp căn active)`);
  }

  return null;
}

/**
 * Kiểm tra có tồn tại chiến dịch thuộc projectName với trạng thái hợp lệ không.
 * @returns true nếu tồn tại, false nếu không
 */
export async function hasCampaignWithStatus(page: Page, projectName: string): Promise<boolean> {
  const name = await getCampaignNameByProject(page, projectName);
  return name !== null;
}

export interface BookingInfo {
  bookingName: string;
  /** Thời gian kết thúc dạng text "DD/MM/YYYY HH:mm" */
  endTimeText: string;
}

/**
 * Tìm booking đầu tiên trong danh sách Booking group theo tên chiến dịch.
 * Lọc theo trạng thái "Sắp diễn ra" hoặc "Đang diễn ra".
 * @param campaignName tên chiến dịch bán hàng (lấy từ getCampaignNameByProject)
 * @returns { bookingName, endTimeText } nếu tìm thấy, null nếu không có
 */
export async function getBookingNameByCampaign(page: Page, campaignName: string): Promise<BookingInfo | null> {
  await page.locator('a[href="/campaign/booking-group"]').click();
  await page.waitForURL(/\/campaign\/booking-group/);

  const table = page.getByRole('table');
  await table.waitFor({ state: 'visible', timeout: 15000 });

  const isEmpty = await page.locator('text=Không có dữ liệu').isVisible();
  if (isEmpty) {
    console.log(`[getBookingNameByCampaign] Danh sách booking rỗng`);
    return null;
  }

  await table.getByRole('row').nth(1).waitFor({ state: 'visible', timeout: 15000 });

  const bookingRow = table.getByRole('row')
    .filter({ hasText: campaignName })
    .filter({ hasText: /Chưa diễn ra|Đang diễn ra/ });
  const count = await bookingRow.count();
  console.log(`[getBookingNameByCampaign] Tìm thấy ${count} booking thuộc "${campaignName}" với trạng thái Chưa/Đang diễn ra`);

  if (count === 0) return null;

  const cells = bookingRow.first().getByRole('cell');
  // col 1 = Tên đợt booking, col 5 = Thời gian kết thúc
  const bookingName = (await cells.nth(1).textContent())?.trim() ?? '';
  const endTimeText = (await cells.nth(5).textContent())?.trim() ?? '';
  console.log(`[getBookingNameByCampaign] booking="${bookingName}", endTime="${endTimeText}"`);

  return { bookingName, endTimeText };
}

/**
 * Parse chuỗi thời gian "DD/MM/YYYY HH:mm" → Date object.
 */
export function parseBookingDateTime(text: string): Date {
  const [datePart, timePart] = text.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}
