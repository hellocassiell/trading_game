import { defineConfig, devices } from "@playwright/test";

const FRONTEND_PORT = Number(process.env.PLAYWRIGHT_FRONTEND_PORT ?? 3000);
const BACKEND_PORT = Number(process.env.PLAYWRIGHT_BACKEND_PORT ?? 8080);
const FRONTEND_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${FRONTEND_PORT}`;
const BACKEND_BASE_URL =
  process.env.PLAYWRIGHT_API_BASE_URL ?? `http://127.0.0.1:${BACKEND_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html"], ["list"]] : "list",
  use: {
    baseURL: FRONTEND_BASE_URL,
    trace: "on-first-retry",
  },
  expect: {
    timeout: 10_000,
  },
  timeout: 60_000,
  projects: [
    {
      name: "chromium-mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        channel: "chrome",
      },
    },
  ],
  webServer: [
    {
      command: "./run-local.sh",
      cwd: "../backend",
      port: BACKEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: `BACKEND_PROXY_TARGET=${BACKEND_BASE_URL} NEXT_PUBLIC_API_BASE_URL=${BACKEND_BASE_URL} node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${FRONTEND_PORT}`,
      cwd: ".",
      port: FRONTEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
