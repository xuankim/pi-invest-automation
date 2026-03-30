# /fix-test

Analyze a failing Playwright test, find the root cause, and fix it properly.

## Steps

1. **Read the error** — identify root cause from the error message. Do NOT blindly change selectors.
2. **Read the failing test file** and the related Page Object in `pages/`.
3. **Diagnose** — is it a selector issue, timing issue, logic issue, or environment issue?
4. **Fix** following project standards:
   - Selectors must live in `pages/` Page Object classes, not in test files
   - Locator priority: `getByRole` > `getByTestId` > `getByText` > `locator(href)` > `locator(input)`
   - No `waitForTimeout` (hard wait) unless justified
   - Do NOT change unrelated code
5. **Output format:**
   1. Short explanation of root cause
   2. Fixed code (Page Object and/or test file)
   3. Notes (edge cases or suggestions if any)

## Arguments

$ARGUMENTS
