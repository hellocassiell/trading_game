const DEFAULT_API_BASE_URL = "http://localhost:8080";
const AUTH_SESSION_KEY = "trading-game.auth-session";

type StoredAuthSession = {
  userId?: string;
  token?: string;
};

export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "");

  if (configuredBaseUrl && /^https?:\/\//.test(configuredBaseUrl)) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  return DEFAULT_API_BASE_URL;
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

export function getStoredUserId() {
  const session = readStoredAuthSession();
  return session?.userId;
}

export function getAuthToken() {
  const session = readStoredAuthSession();
  return session?.token ?? "";
}
