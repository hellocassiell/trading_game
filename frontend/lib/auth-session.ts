export const AUTH_SESSION_COOKIE_KEY = "trading-game.auth-present";

export function hasAuthSessionCookie(value: string | undefined): boolean {
  return value === "1";
}

export function writeAuthSessionCookie(present: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = present
    ? `${AUTH_SESSION_COOKIE_KEY}=1; path=/; max-age=31536000; samesite=lax`
    : `${AUTH_SESSION_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
