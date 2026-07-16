import { expect, test } from "@playwright/test";

test.describe("Landing", () => {
  test("greets a first-time visitor in Vietnamese", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(
      page.getByRole("heading", { name: "Mọi đơn ứng tuyển, trên một dòng chảy." }),
    ).toBeVisible();
  });

  test("switches to English and remembers it across a reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "EN" }).click();

    await expect(
      page.getByRole("heading", { name: "Every application, on one flow." }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Reload proves the cookie round-trips: the server, not the client, renders EN.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Every application, on one flow." }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("walks an application through the pipeline", async ({ page }) => {
    await page.goto("/");

    const status = page.getByRole("status");
    await expect(status).toHaveText(/Đã lưu/);
    await expect(status).toHaveText(/Đang chuẩn bị/, { timeout: 5000 });
    await expect(status).toHaveText(/Đã nộp/, { timeout: 5000 });
  });

  test("leads to sign-up and across to sign-in", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Bắt đầu miễn phí" }).click();
    await expect(page).toHaveURL("/sign-up");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Tạo tài khoản Apply Flow",
    );

    await page.getByRole("link", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Đăng nhập vào Apply Flow",
    );
  });
});

test.describe("Theme", () => {
  test("switches to dark and back to light", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");

    await page.getByRole("button", { name: "Giao diện" }).click();
    await page.getByRole("menuitem", { name: "Tối" }).click();
    await expect(html).toHaveClass(/dark/);

    await page.getByRole("button", { name: "Giao diện" }).click();
    await page.getByRole("menuitem", { name: "Sáng" }).click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("keeps the chosen theme after a reload", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Giao diện" }).click();
    await page.getByRole("menuitem", { name: "Tối" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("Auth screens", () => {
  // These asserted zero inputs while US-001 shipped the shell alone. US-000
  // mounted Clerk's form, so the pages now do render inputs — the assertion kept
  // passing only by racing Clerk's client-side render, which made it a false
  // green rather than proof.
  //
  // The rule it was reaching for — our own shell collects no credentials
  // (decision 0008) — is enforced where it can be enforced honestly:
  // tests/integration/auth-shell.test.tsx renders AuthShell in isolation. What
  // is left for e2e is that Clerk's form actually mounts.
  for (const [path, ownField] of [
    ["/sign-in", "identifier"],
    ["/sign-up", "emailAddress"],
  ]) {
    test(`mounts Clerk's form on ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator(`input[name="${ownField}"]`)).toBeVisible();
      // Every input on the page is Clerk's. Ours would have neither name.
      await expect(page.locator('input:not([name="identifier"]):not([name="emailAddress"]):not([name="password"])')).toHaveCount(0);
    });
  }
});
