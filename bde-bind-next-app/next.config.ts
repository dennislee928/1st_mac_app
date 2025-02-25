// next.config.ts
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next", // 確保這裡的輸出目錄正確
  // 其他配置...
  async rewrites() {
    return [
      {
        source: "/api/get-ips-only",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/api/get-ips-only",
      },
      {
        source: "/api/fetch-logs",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/api/fetch-logs",
      },
      {
        source: "/api/update-waf",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/api/update-waf",
      },
      {
        source: "/api/fetch-ai-suggestions",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/api/fetch-ai-suggestions",
      },
      {
        source: "/api/update-waf-blocking",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/api/update-waf-blocking",
      },
    ];
  },
};

export default nextConfig; // 將 nextConfig 導出
