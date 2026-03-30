import { getApiBaseUrl } from "./config";

const baseUrl = getApiBaseUrl();

type BackendResult<T> = {
  code: number;
  msg: string;
  data: T;
};

export async function sendAuthCode(phone: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/v1/auth/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const payload = (await res.json()) as BackendResult<null>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || "验证码发送失败");
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

export async function verifyAuthCode(
  phone: string,
  code: string,
): Promise<VerifyAuthCodeResponse> {
  const res = await fetch(`${baseUrl}/api/v1/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  const payload = (await res.json()) as BackendResult<VerifyAuthCodeResponse>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || "验证码校验失败");
  }
  return payload.data as VerifyAuthCodeResponse;
}

export async function completeAuthProfile(
  input: CompleteAuthProfileRequest,
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/v1/auth/profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": input.userId,
    },
    body: JSON.stringify({
      nickname: input.nickname,
      avatarId: input.avatarId,
    }),
  });
  const payload = (await res.json()) as BackendResult<null>;
  if (!res.ok || payload.code !== 200) {
    throw new Error(payload.msg || "保存注册资料失败");
  }
}
