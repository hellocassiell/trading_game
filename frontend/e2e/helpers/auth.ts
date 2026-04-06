import type { APIRequestContext, APIResponse, BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const API_BASE_URL =
  process.env.PLAYWRIGHT_API_BASE_URL ?? `http://127.0.0.1:${process.env.PLAYWRIGHT_BACKEND_PORT ?? "8080"}`;

type AuthSessionSeed = {
  userId: string;
  token: string;
  phone: string;
  nickname: string;
  avatarId: string;
};

type VerifyCodePayload = {
  userId: string;
  phone: string;
  token: string;
  profileCompleted: boolean;
};

function uniquePhone() {
  const suffix = String(Date.now()).slice(-7);
  return `9${suffix}`;
}

async function expectOk(response: APIResponse) {
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.code).toBe(200);
  return payload.data;
}

export async function provisionCompletedProfile(
  request: APIRequestContext,
  overrides?: Partial<Pick<AuthSessionSeed, "phone" | "nickname" | "avatarId">>
): Promise<AuthSessionSeed> {
  const phone = overrides?.phone ?? uniquePhone();
  const nickname = overrides?.nickname ?? `e2e${phone.slice(-4)}`;
  const avatarId = overrides?.avatarId ?? "a1";

  const verifyResponse = await request.post(`${API_BASE_URL}/api/v1/auth/verify-code?lang=en`, {
    headers: {
      "Content-Type": "application/json",
      "X-Lang": "en",
      "Accept-Language": "en",
    },
    data: {
      phone,
      code: "999999",
    },
  });
  const verified = (await expectOk(verifyResponse)) as VerifyCodePayload;

  const profileResponse = await request.post(`${API_BASE_URL}/api/v1/auth/profile?lang=en`, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": verified.userId,
      "X-Lang": "en",
      "Accept-Language": "en",
    },
    data: {
      nickname,
      avatarId,
    },
  });
  await expectOk(profileResponse);

  return {
    userId: verified.userId,
    token: verified.token,
    phone,
    nickname,
    avatarId,
  };
}

export async function seedBrowserSession(
  page: Page,
  context: BrowserContext,
  session: AuthSessionSeed
) {
  await context.addCookies([
    {
      name: "trading-game.auth-present",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "trading-game.lang",
      value: "en",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.addInitScript((payload) => {
    window.localStorage.setItem(
      "trading-game.auth-session",
      JSON.stringify({
        userId: payload.userId,
        phone: payload.phone,
        nickname: payload.nickname,
        avatarId: payload.avatarId,
        loggedInAt: new Date().toISOString(),
        token: payload.token,
      })
    );
    document.cookie = "trading-game.auth-present=1; path=/; samesite=lax";
    document.cookie = "trading-game.lang=en; path=/; samesite=lax";
  }, session);
}
