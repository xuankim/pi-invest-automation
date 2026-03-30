# /review-test

Review Playwright test files for stability and best practices.

## Review Checklist

1. **POM compliance** — selectors must NOT be in test files, must be in `pages/` classes
2. **Locator priority** — prefer `getByRole` > `getByTestId` > `getByText` > `locator(href)` > `locator(input)`
3. **No hard waits** — no `waitForTimeout` unless justified
4. **Test independence** — each test must be self-contained, no cross-test dependencies
5. **No silent skips** — use `test.skip()` instead of `return` when skipping conditionally
6. **Async/await consistency** — no missing awaits
7. **Meaningful test names** — names must describe behavior clearly
8. **Assertions** — use `expect` from Playwright, assertions must be clear and meaningful (avoid `/.+/` or trivially-true assertions)
9. **No console.log** in tests — use Playwright trace/report instead

## Output Format

For each issue found:
1. **Severity** — Critical / Warning / Info
2. **Location** — file + line
3. **Problem** — what is wrong
4. **Fix** — corrected code snippet

## Arguments

$ARGUMENTS
