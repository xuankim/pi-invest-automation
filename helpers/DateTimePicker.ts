import { Page } from '@playwright/test';

/**
 * Chọn ngày hôm nay + thời gian = hiện tại + offsetMinutes trong picker đang mở.
 * Gọi sau khi đã click button mở picker.
 */
export async function selectDateTime(page: Page, offsetMinutes: number): Promise<void> {
  const time = new Date(Date.now() + offsetMinutes * 60 * 1000);
  const hour = time.getHours().toString().padStart(2, '0');
  const minute = time.getMinutes().toString().padStart(2, '0');

  await page.getByRole('button', { name: /Today/ }).click();
  const dialog = page.getByRole('dialog');
  // Cột giờ (00-23) nằm trước cột phút (00-59) trong DOM
  await dialog.getByRole('button', { name: hour, exact: true }).first().click();
  await dialog.getByRole('button', { name: minute, exact: true }).last().click();
  await dialog.getByRole('button', { name: 'Ok' }).click();
}

/**
 * Chọn ngày hôm nay + thời gian cụ thể từ Date object trong picker đang mở.
 * Gọi sau khi đã click button mở picker.
 */
export async function selectDateTimeAbsolute(page: Page, date: Date): Promise<void> {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  await page.getByRole('button', { name: /Today/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: hour, exact: true }).first().click();
  await dialog.getByRole('button', { name: minute, exact: true }).last().click();
  await dialog.getByRole('button', { name: 'Ok' }).click();
}

/**
 * Chọn ngày hôm nay với thời gian cuối ngày (23:59) trong picker đang mở.
 * Gọi sau khi đã click button mở picker.
 */
export async function selectEndOfDay(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Today/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '23', exact: true }).first().click();
  await dialog.getByRole('button', { name: '59', exact: true }).last().click();
  await dialog.getByRole('button', { name: 'Ok' }).click();
}

