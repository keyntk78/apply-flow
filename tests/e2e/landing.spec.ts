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
  // US-001 ships the shell only; Clerk owns credentials (decision 0008).
  for (const path of ["/sign-in", "/sign-up"]) {
    test(`asks for no credentials on ${path}`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator("input")).toHaveCount(0);
      await expect(page.locator("form")).toHaveCount(0);
    });
  }
});
