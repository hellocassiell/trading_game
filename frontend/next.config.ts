import type { NextConfig } from "next";

const backendProxyTarget =
  process.env.BACKEND_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
