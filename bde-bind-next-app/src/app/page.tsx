"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "./pages/components/ui/card";
import { CardContent } from "./pages/components/ui/card";
import { Button } from "./pages/components/ui/buttons";
import Footer from "./pages/components/ui/footer";
import CollapsibleMenu from "./pages/components/ui/menuBar";
//stable version v1
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronRight,
  Activity,
} from "lucide-react";
//
// import dnslookup from "./pages/api/dnslookup";
//

// 定義更具體的類型來替代 any
interface IpLookupResult {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  security?: {
    is_vpn: boolean | null;
    is_proxy: boolean | null;
    threat_score: number | null;
  };
}

interface IpLookupResponse {
  data: {
    ip: string;
    location: {
      city: {
        name: string;
      };
      region: {
        name: string;
      };
      country: {
        name: string;
      };
    };
    security: {
      is_vpn: boolean | null;
      is_proxy: boolean | null;
      threat_score: number | null;
    };
  };
}

interface ApiResponse {
  ip: IpLookupResponse;
  dns: Record<string, unknown>;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WorkerResponse {
  ips: string[];
  aiSuggestions?: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IpsResponse {
  ips: string[];
}

interface LogsResponse {
  ips: string[];
  aiSuggestions: string;
  showAISuggestions: boolean;
}

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [countdown, setCountdown] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [verifiedIpInfo, setVerifiedIpInfo] = useState<IpLookupResult[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [verifiedAllIpsInfo, setVerifiedAllIpsInfo] = useState<
    IpLookupResult[]
  >([]);
  const [isLoadingIPs, setIsLoadingIPs] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // 添加一個 state 來存儲動態導入的 iplookupapi
  const [ipApi, setIpApi] = useState<{
    lookup: (ip: string) => Promise<IpLookupResult>;
  } | null>(null);

  // 添加 intervalRef
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  useEffect(() => {
    // 動態導入並初始化 iplookupapi
    const initializeIpApi = async () => {
      try {
        const { default: iplookupapi } = await import(
          "@everapi/iplookupapi-js"
        );
        const api = new iplookupapi(
          "ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH"
        );
        setIpApi(api);
      } catch (error) {
        console.error("Failed to initialize IP API:", error);
      }
    };

    initializeIpApi();
  }, []);

  // 分開獲取 IPs 和 AI 建議
  useEffect(() => {
    const fetchIPsAndLogs = async () => {
      // 獲取 IPs
      try {
        setIsLoadingIPs(true);
        const ipsResponse = await fetch("/api/get-ips-only");
        if (ipsResponse.ok) {
          const ipsData = (await ipsResponse.json()) as string[];
          setIps(ipsData);
          console.log("IPs fetched:", ipsData);
        }
      } catch (error) {
        console.error("Error fetching IPs:", error);
      } finally {
        setIsLoadingIPs(false);
      }

      // 獨立獲取 AI 建議
      try {
        setIsLoadingLogs(true);
        const logsResponse = await fetch("/api/fetch-logs");
        if (logsResponse.ok) {
          const data = (await logsResponse.json()) as LogsResponse;
          if (data.aiSuggestions) {
            setAiSuggestions([data.aiSuggestions]);
            setShowAISuggestions(true);
          }
        }
      } catch (error) {
        console.error("Error fetching AI suggestions:", error);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchIPsAndLogs();
  }, []);

  // 修改 verifyIPs 函數來使用 route.ts 的 IP lookup endpoint
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const verifyIPs = async (validIps: string[]) => {
    const verifiedIps: IpLookupResult[] = [];
    for (const ip of validIps) {
      try {
        // 使用我們的 API route 進行查詢
        const response = await fetch(`/api/route?ip=${ip}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const result = (await response.json()) as ApiResponse;
        verifiedIps.push({
          ip: ip,
          city: result.ip.data.location.city.name,
          region: result.ip.data.location.region.name,
          country: result.ip.data.location.country.name,
          security: result.ip.data.security,
        });
      } catch (error) {
        console.error(`Error verifying IP ${ip}:`, error);
      }
    }
    setVerifiedIpInfo(verifiedIps);
  };

  // Function to verify all IPs from the `ips` attribute using iplookupapi
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const verifyAllIPs = async () => {
    if (ips.length === 0) {
      alert("No IPs available for verification.");
      return;
    }

    const verifiedIps: IpLookupResult[] = [];
    for (const ip of ips) {
      try {
        if (ipApi) {
          const result = await ipApi.lookup(ip);
          console.log("All IPs Verification:", result);
          verifiedIps.push(result);
        }
      } catch (error) {
        console.error(`Error looking up IP ${ip}:`, error);
      }
    }
    setVerifiedAllIpsInfo(verifiedIps);
  };

  const startCountdown = () => {
    setCountdown(30);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
      });
    }, 1000);
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchLogs = async () => {
    setShowAISuggestions(false);
    startCountdown();

    try {
      const response = await fetch("/api/fetch-logs");
      if (response.ok) {
        const data: {
          ips?: string[];
          aiSuggestions?: string;
        } = await response.json();

        setIps(data.ips || []);
        setShowAISuggestions(true);

        if (data.aiSuggestions) {
          const suggestions = data.aiSuggestions.trim().split(/\n+/);
          setAiSuggestions(suggestions);

          console.log("AI Suggestions Received:", suggestions);

          const allIpMatches = data.aiSuggestions.match(/[\w:.]+/g) || [];
          setAllRecognizedIps(allIpMatches);
          console.log("Valid Recognized IPs:", allIpMatches);
        } else {
          console.error("No valid AI suggestions found in the response");
        }
      } else {
        console.error("Failed to fetch logs with status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCountdown(null);
    }
  };

  // 修改處理 WAF 更新的函數
  const handleUpdateWAF = async (ips: string[]) => {
    try {
      setUpdating(true); // 添加載入狀態
      console.log("Sending IPs to WAF update:", ips);

      const response = await fetch("/api/update-waf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ips }), // 確保與 updateWAFRule 的參數格式一致
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`WAF update failed: ${response.status} - ${errorData}`);
      }

      console.log("WAF rules updated successfully");
      alert("已成功更新 WAF 規則，這些 IP 將被 控管");
    } catch (error) {
      console.error("Error updating WAF:", error);
      alert(
        `更新 WAF 規則失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    } finally {
      setUpdating(false);
    }
  };

  // 在 return 之前添加 LoadingDots 組件
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const LoadingDots = () => {
    return (
      <span className="loading-dots">
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </span>
    );
  };

  // 在 return 之前添加 LoadingSpinner 組件
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const LoadingSpinner = () => {
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2" />
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1119] text-white relative">
      {/* 將 CollapsibleMenu 固定在螢幕左上角 */}
      <div className="fixed top-4 left-4 z-50">
        <CollapsibleMenu />
      </div>

      {/* 主要內容區域，添加足夠的左側邊距以避免與 CollapsibleMenu 重疊 */}
      <div className="container mx-auto py-12 px-4 pb-24 ml-16 sm:ml-20">
        {/* Header */}
        <div className="border-b border-[#1E2D3D] bg-[#0A1119]/50 backdrop-blur supports-[backdrop-filter]:bg-[#0A1119]/50">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-2xl font-bold">Security Performance Center</h1>
          </div>
        </div>

        {/* Main Stats Card */}
        <Card className="mb-8 bg-[#141D2B] border-[#1E2D3D]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  <span className="text-[#9FEF00]">{ips.length}</span>
                </h2>
                <p className="text-gray-400 max-w-md">
                  在過去的30分鐘內，對您的網域請求資源的IP地址中，被判定為具自動化攻擊風險的數量。
                </p>
              </div>
              <Activity className="text-[#9FEF00] w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions Section */}
        {!isLoadingLogs && aiSuggestions.length > 0 && (
          <Card className="mb-8 bg-[#141D2B] border-[#1E2D3D]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-[#9FEF00] w-5 h-5" />
                <h3 className="text-xl font-semibold">Ollama AI 安全分析</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="space-y-4"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {suggestion.split("**").map((part, i) => (
                      <div
                        key={i}
                        className={
                          i % 2 === 1
                            ? "text-[#9FEF00] font-bold my-3"
                            : "text-gray-300"
                        }
                      >
                        {part}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading States */}
        {(isLoadingIPs || isLoadingLogs) && (
          <Card className="mb-8 bg-[#141D2B] border-[#1E2D3D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                {isLoadingIPs && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#9FEF00]" />
                    <span>獲取可疑IP中...</span>
                  </div>
                )}
                {isLoadingLogs && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#9FEF00]" />
                    <span>進行 AI 分析中...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!isLoadingLogs && aiSuggestions.length > 0 && (
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => handleUpdateWAF(ips)}
              disabled={updating || ips.length === 0}
              className={`gap-2 ${
                updating || ips.length === 0
                  ? "bg-gray-600 cursor-not-allowed opacity-70"
                  : "bg-primary hover:bg-primary-hover text-black"
              }`}
            >
              <Shield className="w-4 h-4" />
              {updating ? "更新 WAF 規則中..." : "將 IP 添加到 WAF 規則"}
            </Button>
            <Button
              onClick={() =>
                (window.location.href = "https://www.twister5.com.tw/")
              }
              variant="outline"
              className="border-[#1E2D3D] hover:bg-[#1E2D3D]"
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        )}

        {/* IP List */}
        {!isLoadingIPs && ips.length > 0 && (
          <>
            <Card className="bg-[#141D2B] border-[#1E2D3D]">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-[#9FEF00] w-5 h-5" />
                  <h3 className="text-xl font-semibold">可疑 IPs</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  <div className="grid gap-2">
                    {ips.map((ip, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#1E2D3D] hover:bg-[#2A3B4D] transition-colors"
                      >
                        <span className="font-mono text-gray-300">{ip}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Footer 保持 sticky 定位 */}
      <div className="sticky bottom-0 left-0 right-0 z-40">
        <Footer />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e2d3d;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a3b4d;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374b61;
        }
      `}</style>
    </div>
  );
}
