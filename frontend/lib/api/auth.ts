import { getApiBaseUrl } from "./config";
import { byLanguage, getPreferredLanguage } from "../locale";

type BackendResult<T> = {
  code: number;
  msg: string;
  data: T;
};

export async function sendAuthCode(phone: string): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const language = getPreferredLanguage();
  const errorFallback = byLanguage(language, {
    "zh-Hant": "驗證碼發送失敗",
    "zh-Hans": "验证码发送失败",
    en: "Failed to send verification code",
  });
  const res = await fetch(`${baseUrl}/api/v1/auth/send-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Lang": language,
      "Accept-Language": language,
    },
    body: JSON.stringify({ phone }),
  });
  const payload = (await res.json()) as BackendResult<null>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || errorFallback);
  }
}

export interface VerifyAuthCodeResponse {
  userId: string;
  phone: string;
  token: string;
  profileCompleted: boolean;
}

export interface CompleteAuthProfileRequest {
  userId: string;
  nickname: string;
  avatarId: string;
}

export interface UploadAuthAvatarResponse {
  avatarId: string;
  avatarUrl: string;
  avatarVersion: number;
}

export async function verifyAuthCode(
  phone: string,
  code: string,
): Promise<VerifyAuthCodeResponse> {
  const baseUrl = getApiBaseUrl();
  const language = getPreferredLanguage();
  const errorFallback = byLanguage(language, {
    "zh-Hant": "驗證碼校驗失敗",
    "zh-Hans": "验证码校验失败",
    en: "Code verification failed",
  });
  const res = await fetch(`${baseUrl}/api/v1/auth/verify-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Lang": language,
      "Accept-Language": language,
    },
    body: JSON.stringify({ phone, code }),
  });
  const payload = (await res.json()) as BackendResult<VerifyAuthCodeResponse>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || errorFallback);
  }
  return payload.data as VerifyAuthCodeResponse;
}

export async function completeAuthProfile(
  input: CompleteAuthProfileRequest,
): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const language = getPreferredLanguage();
  const errorFallback = byLanguage(language, {
    "zh-Hant": "保存註冊資料失敗",
    "zh-Hans": "保存注册资料失败",
    en: "Failed to save profile",
  });
  const res = await fetch(`${baseUrl}/api/v1/auth/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": input.userId,
      "X-Lang": language,
      "Accept-Language": language,
    },
    body: JSON.stringify({
      nickname: input.nickname,
      avatarId: input.avatarId,
    }),
  });
  const payload = (await res.json()) as BackendResult<null>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || errorFallback);
  }
}

export async function uploadAuthAvatar(
  userId: string,
  file: File,
): Promise<UploadAuthAvatarResponse> {
  const baseUrl = getApiBaseUrl();
  const language = getPreferredLanguage();
  const errorFallback = byLanguage(language, {
    "zh-Hant": "頭像上傳失敗",
    "zh-Hans": "头像上传失败",
    en: "Failed to upload avatar",
  });
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${baseUrl}/api/v1/auth/avatar-upload`, {
    method: "POST",
    headers: {
      "X-User-Id": userId,
      "X-Lang": language,
      "Accept-Language": language,
    },
    body: formData,
  });

  const payload = (await res.json()) as BackendResult<UploadAuthAvatarResponse>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || errorFallback);
  }
  return payload.data;
}
