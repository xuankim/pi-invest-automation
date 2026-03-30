# Pi Invest Automation — Project Context

## Tổng quan

Đây là project **Playwright E2E automation** cho hệ thống **Pi Invest Admin** (quản lý đầu tư bất động sản).

- **App URL (staging):** `https://pi-invest-admin--piinveststg.asia-east1.hosted.app`
- **Stack:** TypeScript + Playwright
- **Test account:** `xuan.test@pigroup.com.vn` / OTP: `111111`

---

## Cấu trúc project

```
pages/
  LoginPage.ts         # Page Object cho trang login
tests/
  login.spec.ts        # Test cases đăng nhập
  campaign.spec.ts     # Test cases Chiến dịch bán hàng
  auth.setup.ts        # Lưu session (global setup)
playwright.config.ts   # Playwright config
.env                   # Credentials (không commit)
```

---

## Cách authentication hoạt động

Login gồm **2 bước**:

1. **Nhập email** vào `input#email` → click button "Đăng nhập"
2. **Nhập OTP** vào `input[name="otp"]` → form **tự submit** khi đủ 6 ký tự (không cần click button)
3. Redirect về Dashboard (`/`) sau khi thành công

**Lưu ý quan trọng:**
- Button "Tiếp tục" trên trang OTP ban đầu bị `disabled`, sau khi OTP tự submit thì element bị detach khỏi DOM
- Dùng `Promise.race` giữa `waitForURL` và click button để handle cả 2 trường hợp
- Session được lưu tại `playwright/.auth/user.json` (không commit lên git)

---

## Pattern viết test mới

Mọi test đều dùng `LoginPage` để login trong `beforeEach`:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Tên nhóm feature', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(
      process.env.USER_EMAIL || 'xuan.test@pigroup.com.vn',
      process.env.OTP_CODE || '111111'
    );
  });

  test('Tên test case', async ({ page }) => {
    // 1. Navigate qua menu trái
    // 2. Verify URL
    // 3. Verify UI elements
  });
});
```

---

## Menu trái — URL mapping

| Menu cha | Menu con | URL |
|---|---|---|
| Chiến dịch bán hàng | Danh sách chiến dịch | `/campaign/sales` |
| Chiến dịch bán hàng | Đơn hàng | `/campaign/orders` |
| Chiến dịch bán hàng | Booking group | `/campaign/booking-group` |
| Chiến dịch bán hàng | Ráp căn | `/campaign/booking-assemble` |
| Dự án | *(sub items)* | `/project/...` |
| Khách hàng | *(sub items)* | `/customer/...` |
| Nhân viên | Phân quyền | `/staff/permissions` |
| Nhân viên | Danh sách nhân viên | `/staff/list` |

---

## Selector conventions

Ưu tiên theo thứ tự:
1. `getByRole` — semantic, gần với user nhất
2. `getByTestId` — khi có `data-testid`
3. `getByText` — cho text content
4. `page.locator('a[href="/path"]')` — menu item có href
5. `page.locator('input[name="..."]')` hoặc `input#id` — input fields

- Khi có nhiều element trùng selector → dùng `.first()` hoặc selector chính xác hơn
- **Tuyệt đối không** đặt selector trực tiếp trong file test — phải đưa vào Page Object class

---

## Chạy test

```bash
npm test                # headless
npm run test:headed     # có trình duyệt
npm run test:ui         # Playwright UI (debug)
npm run report          # xem HTML report
```

---

## Khi nhận yêu cầu viết test mới

Khi user nói: *"viết test cho màn hình X, click menu Y, verify Z"*, hãy:

1. **Tạo Page Object** trong `pages/<Feature>Page.ts` nếu chưa có
   - Không đặt selector trong file test
   - Đóng gói toàn bộ actions và locators trong class
2. Tạo file `tests/<feature>.spec.ts` (hoặc thêm vào file spec đã có nếu cùng feature)
3. Dùng `LoginPage` trong `beforeEach`
4. Navigate bằng `a[href="..."]` (xem bảng URL mapping ở trên)
5. Verify URL bằng `expect(page).toHaveURL(/pattern/)`
6. Verify element bằng `toBeVisible()` và `toBeEnabled()`
7. Chạy `npx playwright test tests/<file>.spec.ts --headed` để confirm pass

---

## Coding Standards

- Dùng **Page Object Model (POM)** — mọi selector và action nằm trong `pages/`
- **Không dùng** `waitForTimeout` (hard wait) trừ khi thực sự cần thiết
- Dùng `async/await` nhất quán
- Mỗi test phải **độc lập** — không phụ thuộc vào test khác
- Tên test phải **có nghĩa**, mô tả rõ hành vi đang test

## Output format khi viết/fix test

Luôn trả về theo thứ tự:
1. **Giải thích ngắn** — root cause hoặc mô tả logic
2. **Code** — Page Object (nếu mới) + test file
3. **Lưu ý** — nếu có edge case hoặc điều cần chú ý

## Khi fix bug

- Xác định **root cause** trước
- Không thay selector bừa bãi
- Đề xuất locator strategy tốt hơn nếu cần
- **Không** thay đổi code không liên quan
