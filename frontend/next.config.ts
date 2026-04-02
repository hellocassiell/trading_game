import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境 API 地址，通过环境变量配置
  // 本地开发时使用 rewrites 代理，生产环境直接请求后端
  async rewrites() {
    // 仅开发环境使用 rewrites 代理
    if (process.env.NODE_ENV === "development") {
      const backendProxyTarget =
        process.env.BACKEND_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:8080";
      return [
        {
          source: "/api/:path*",
          destination: `${backendProxyTarget}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
