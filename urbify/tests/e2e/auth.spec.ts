import { expect, test } from "@playwright/test";

test("login route renders the Urbify auth screen", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Sign in", { exact: false }).first()).toBeVisible();
});
