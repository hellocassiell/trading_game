import { expect, test } from "@playwright/test";

import { provisionCompletedProfile, seedBrowserSession } from "./helpers/auth";
import { captureFlowScreenshot } from "./helpers/screenshot";

test("authenticated user can submit from trade page and see the order in records", async ({
  page,
  context,
  request,
}) => {
  const session = await provisionCompletedProfile(request, {
    nickname: "tradeE2E",
  });

  await seedBrowserSession(page, context, session);

  await page.goto("/trade/00700?lang=en");

  await expect(page.getByText("Tradable stock")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit", exact: true })).toBeEnabled({
    timeout: 20_000,
  });
  await captureFlowScreenshot(page, "e2e-trade-ready.png");
  await page.getByRole("button", { name: "Submit", exact: true }).click();

  await expect(page.getByText("Confirm instruction")).toBeVisible();
  await captureFlowScreenshot(page, "e2e-trade-confirm.png");
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText("Submitted")).toBeVisible();
  await captureFlowScreenshot(page, "e2e-trade-success.png");
  await page.getByRole("button", { name: "View trade status" }).click();

  await expect(page).toHaveURL(/\/records\?tab=status/);
  await expect(
    page.getByRole("button", { name: /00700/ }).first()
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /交易狀況|Trading Status/ })
  ).toBeVisible();
  await captureFlowScreenshot(page, "e2e-records-status.png");
});
