import { expect, test } from "@playwright/test";

import { provisionCompletedProfile } from "./helpers/auth";
import { captureFlowScreenshot } from "./helpers/screenshot";

test("completed user can sign in from auth page and land on home", async ({ page, request }) => {
  const profile = await provisionCompletedProfile(request, {
    nickname: "loginE2E",
  });

  await page.goto("/auth?lang=en");

  await page.getByPlaceholder("9123 4567").fill(profile.phone);
  await page.getByPlaceholder("Enter code").fill("999999");
  await page.locator("label").filter({ has: page.getByRole("checkbox") }).click({
    position: { x: 12, y: 12 },
  });
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeEnabled();
  await captureFlowScreenshot(page, "e2e-auth-filled.png");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: /賽事統計|Competition Stats/ })
  ).toBeVisible();
  await expect(
    page.locator('a[href="/profile"]').getByText("loginE2E")
  ).toBeVisible();
  await captureFlowScreenshot(page, "e2e-home-after-login.png");
});
