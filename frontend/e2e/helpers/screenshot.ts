import { mkdir } from "node:fs/promises";
import path from "node:path";

import type { Page } from "@playwright/test";

const E2E_SCREENSHOT_DIR =
  process.env.E2E_SCREENSHOT_DIR ??
  path.resolve(process.cwd(), "..", "output", "playwright", "e2e");

export async function captureFlowScreenshot(page: Page, filename: string) {
  await mkdir(E2E_SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(E2E_SCREENSHOT_DIR, filename),
    fullPage: true,
  });
}
