// next.config.ts
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next", // 確保這裡的輸出目錄正確
  // 其他配置...
};

export default nextConfig; // 將 nextConfig 導出

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/fetch-logs",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/fetch-logs",
      },
      {
        source: "/api/update-waf",
        destination:
          "https://botsrcautomation.twister5-partner-demo-account5604.workers.dev/update-waf",
      },
    ];
  },
};
