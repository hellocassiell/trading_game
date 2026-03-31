import { getApiBaseUrl } from "./api/config";

const LOCAL_AVATAR_IDS = new Set(["a1", "a2", "a3", "a4", "a5", "a6"]);

export function resolveAvatarSrc(value?: string | null): string | null {
  const raw = (value ?? "").trim();
  if (!raw) {
    return null;
  }
  if (LOCAL_AVATAR_IDS.has(raw)) {
    return `/avatars/${raw}.svg`;
  }
  if (raw === "upload") {
    return "/avatars/default.svg";
  }
  if (raw.startsWith("/api/")) {
    return `${getApiBaseUrl()}${raw}`;
  }
  if (raw.startsWith("/")) {
    return raw;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return "/avatars/default.svg";
}

export function isLocalAvatarId(value?: string | null): boolean {
  return LOCAL_AVATAR_IDS.has((value ?? "").trim());
}
