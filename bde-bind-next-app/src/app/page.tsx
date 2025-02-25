/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatorGeneralProvider } from "@arwes/animation";
//import { Arwes, StylesBaseline } from "@arwes/core";
//
import { Animator } from "@arwes/react-animator";
import { Animated } from "@arwes/react-animated";
import { Text } from "@arwes/react";
//
// import dnslookup from "./pages/api/dnslookup";
//

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
  dns: any;
}

interface WorkerResponse {
  ips: string[];
  aiSuggestions?: string;
}

interface IpsResponse {
  ips: string[];
}

interface LogsResponse {
  ips: string[];
  aiSuggestions: string;
  showAISuggestions: boolean;
}

const ANIMATOR_GENERAL = {
  duration: { enter: 200, exit: 200 },
};

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  const [verifiedIpInfo, setVerifiedIpInfo] = useState<any[]>([]);
  const [verifiedAllIpsInfo, setVerifiedAllIpsInfo] = useState<any[]>([]);
  const [isLoadingIPs, setIsLoadingIPs] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // 添加一個 state 來存儲動態導入的 iplookupapi
  const [ipApi, setIpApi] = useState<any>(null);

  // 添加 intervalRef
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const verifyIPs = async (validIps: string[]) => {
    const verifiedIps: any[] = [];
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
          dns: result.dns,
        });
      } catch (error) {
        console.error(`Error verifying IP ${ip}:`, error);
      }
    }
    setVerifiedIpInfo(verifiedIps);
  };

  // Function to verify all IPs from the `ips` attribute using iplookupapi
  const verifyAllIPs = async () => {
    if (ips.length === 0) {
      alert("No IPs available for verification.");
      return;
    }

    const verifiedIps: any[] = [];
    for (const ip of ips) {
      try {
        const result = await ipApi.lookup(ip);
        console.log("All IPs Verification:", result);
        verifiedIps.push(result);
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
  const LoadingSpinner = () => {
    return (
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2" />
    );
  };

  return (
    <Animator active={true}>
      <AnimatorGeneralProvider animator={ANIMATOR_GENERAL}>
        <div className="min-h-screen bg-[#001010] text-cyan-500 p-8">
          <main>
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-extrabold mb-6">
                IP 資訊 - 過去30分鐘自動化程式可能性高之ip address
              </h1>

              {/* 載入指示器 */}
              {(isLoadingIPs || isLoadingLogs) && (
                <div className="flex items-center justify-center p-4 text-cyan-400">
                  {isLoadingIPs && (
                    <div className="flex items-center mr-4">
                      <LoadingSpinner />
                      <span>IPs 載入中</span>
                      <LoadingDots />
                    </div>
                  )}
                  {isLoadingLogs && (
                    <div className="flex items-center">
                      <LoadingSpinner />
                      <span>AI Response 載入中</span>
                      <LoadingDots />
                    </div>
                  )}
                </div>
              )}

              {/* 顯示 IPs */}
              {!isLoadingIPs && ips.length > 0 && (
                <Text as="h1" className="text-2xl font-bold mb-6">
                  <h2 className="text-xl font-semibold mb-4">有疑慮之 IPs:</h2>
                  <div className="max-h-60 overflow-y-auto">
                    <ul className="space-y-1 text-cyan-300">
                      {ips.map((ip, index) => (
                        <li key={index} className="font-mono">
                          {ip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Text>
              )}

              {/* 顯示 AI 建議 */}
              {!isLoadingLogs && aiSuggestions.length > 0 && (
                <Text as="h1" className="text-2xl font-bold mb-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    Ollama AI 建議:
                  </h2>
                  <div className="prose prose-lg max-w-none text-cyan-300">
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="markdown-content"
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: "1.8",
                          fontSize: "1.1rem",
                        }}
                      >
                        {suggestion.split("**").map((part, i) => {
                          if (i % 2 === 1) {
                            return (
                              <Text
                                as="strong"
                                key={i}
                                className="text-cyan-400 text-xl block my-3"
                              >
                                {part}
                              </Text>
                            );
                          }
                          return (
                            <div key={i} className="ml-4 mb-2">
                              {part.split("*").map((bullet, j) => {
                                if (j % 2 === 1) {
                                  return (
                                    <li
                                      key={j}
                                      className="list-disc ml-6 my-2 text-cyan-300"
                                    >
                                      {bullet}
                                    </li>
                                  );
                                }
                                return bullet;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </Text>
              )}

              {/* 操作按鈕 */}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => handleUpdateWAF(ips)}
                  disabled={updating || ips.length === 0}
                  className={`px-5 py-2 ${
                    updating || ips.length === 0
                      ? "bg-gray-600"
                      : "bg-cyan-900 hover:bg-cyan-800"
                  } text-cyan-100 font-bold rounded-lg transition-colors`}
                >
                  {updating ? "更新中..." : "新增此些ip至 cloudflare waf 規則"}
                </button>
                <button
                  onClick={() =>
                    (window.location.href = "https://www.twister5.com.tw/")
                  }
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-cyan-100 font-bold rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </main>
        </div>
      </AnimatorGeneralProvider>

      <style jsx>{`
        .loading-dots {
          display: inline-block;
        }

        .dot {
          animation: dotBounce 1.4s infinite;
          display: inline-block;
          margin: 0 2px;
          color: #0ff;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </Animator>
  );
}
