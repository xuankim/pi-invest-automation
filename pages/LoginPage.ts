import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly otpInput: Locator;
  readonly loginButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input#email, input[name="email"]').first();
    this.otpInput = page.locator('input[name="otp"]').first();
    this.loginButton = page.locator('button[type="submit"]:has-text("Đăng nhập")');
    this.continueButton = page.locator('button[type="submit"]:has-text("Tiếp tục")');
  }

  async goto() {
    await this.page.goto('/');
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async login(email: string, otp: string) {
    await this.goto();

    // Step 1: Enter email and click login
    await this.emailInput.waitFor({ state: 'visible' });
    await this.emailInput.fill(email);
    await this.loginButton.click();

    // Step 2: Wait for OTP page and enter OTP
    await this.otpInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.otpInput.fill(otp);

    // OTP auto-submits when all digits filled; fallback to clicking Tiếp tục
    await Promise.race([
      this.page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 10000 }),
      this.continueButton.waitFor({ state: 'enabled', timeout: 5000 })
        .then(() => this.continueButton.click())
        .catch(() => {}),
    ]);

    await this.page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 15000 });
  }
}
