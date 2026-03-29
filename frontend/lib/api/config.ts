const DEFAULT_API_BASE_URL = "http://localhost:8080";
const AUTH_SESSION_KEY = "trading-game.auth-session";

type StoredAuthSession = {
  userId?: string;
  token?: string;
};

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredAuthSession) : null;
  } catch {
    return null;
  }
}

export function getDemoUserId() {
  const session = readStoredAuthSession();
  if (session?.userId) {
    return session.userId;
  }
  return process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "u_10001";
}

export function getAuthToken() {
  const session = readStoredAuthSession();
  return session?.token ?? "";
}
