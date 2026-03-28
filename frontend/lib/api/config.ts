const DEFAULT_API_BASE_URL = "http://localhost:8080";

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

export function getDemoUserId() {
  return process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user-001";
}

