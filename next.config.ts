import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS || "").split(",").map(host => host.trim()).filter(Boolean),
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ] }, { source: "/api/documents", headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] }];
  },
};
export default nextConfig;
