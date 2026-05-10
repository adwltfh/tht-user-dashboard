import { test, expect } from "@playwright/test";

test.describe("Users happy path", () => {
  test("list → detail → back to list", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

    await expect(page.getByText("Leanne Graham").first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("searchbox", { name: /search/i }).fill("Leanne");
    await expect(page.getByText("Leanne Graham").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Ervin Howell").first()).not.toBeVisible();

    await page.getByRole("searchbox", { name: /search/i }).clear();
    await expect(page.getByText("Ervin Howell").first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByText("Leanne Graham").first().click();
    await expect(page).toHaveURL("/users/1");

    await expect(page.getByText("Leanne Graham").first()).toBeVisible();
    await expect(page.getByText("@Bret").first()).toBeVisible();
    await expect(page.getByText("Romaguera-Crona").first()).toBeVisible();

    await expect(page.getByText(/posts/i).first()).toBeVisible();
    await expect(page.getByText(/todos/i).first()).toBeVisible();

    await page.getByRole("link", { name: /back to list/i }).click();
    await expect(page).toHaveURL("/users");
    await expect(page.getByText("Leanne Graham").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("invalid user id shows not found", async ({ page }) => {
    await page.goto("/users/999");
    await expect(page.getByText(/user not found/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("filter by pending todos works", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText("Leanne Graham").first()).toBeVisible({
      timeout: 10000,
    });

    await page.selectOption(
      'select[aria-label="Filter by activity"]',
      "has-pending",
    );
    await expect(page).toHaveURL(/filter=has-pending/);
  });
});
