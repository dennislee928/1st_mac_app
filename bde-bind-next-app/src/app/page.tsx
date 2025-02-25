/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  const [verifiedIpInfo, setVerifiedIpInfo] = useState<any[]>([]);
  const [verifiedAllIpsInfo, setVerifiedAllIpsInfo] = useState<any[]>([]);

  // 添加一個 state 來存儲動態導入的 iplookupapi
  const [ipApi, setIpApi] = useState<any>(null);

  // 添加 intervalRef
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/fetch-logs");
        const data: { aiSuggestions?: string } = await response.json(); // Explicit typing
        if (response.ok) {
          setAiSuggestions([data.aiSuggestions || ""]);
        } else {
          console.error("Failed to fetch logs:", response.status);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

  // 添加一個新的 useEffect 來獲取 IPs
  useEffect(() => {
    const fetchIPsFromWorker = async () => {
      try {
        const response = await fetch("/api/get-ips-only");
        if (response.ok) {
          const ips = (await response.json()) as string[];
          setIps(ips);
          console.log("Fetched IPs from worker:", ips);
        } else {
          console.error("Failed to fetch IPs:", response.status);
        }
      } catch (error) {
        console.error("Error fetching IPs:", error);
      }
    };

    fetchIPsFromWorker();
  }, []); // 只在組件加載時執行一次

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

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
        IP 資訊 - 過去一小時自動化程式可能性高之ip address
      </h3>

      {/* 顯示從 Worker 獲取的 IPs */}
      {ips.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-md shadow">
          <h4 className="text-xl font-semibold mb-2">有疑慮之 IPs:</h4>
          <ul className="space-y-1">
            {ips.map((ip, index) => (
              <li key={index} className="text-sm text-gray-700">
                {ip}
              </li>
            ))}
          </ul>
          <button
            onClick={() => verifyIPs(ips)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verify All IPs
          </button>
        </div>
      )}

      {/* 顯示驗證結果 */}
      {verifiedIpInfo.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-md shadow">
          <h4 className="text-xl font-semibold mb-2">Verification Results:</h4>
          <ul className="space-y-2">
            {verifiedIpInfo.map((info, index) => (
              <li key={index} className="text-sm">
                <div className="font-medium">{info.ip}</div>
                <div className="ml-4 text-gray-600">
                  Location: {info.city}, {info.region}, {info.country}
                </div>
                {info.dns && (
                  <div className="ml-4 text-gray-500 text-xs">
                    DNS Info: {JSON.stringify(info.dns, null, 2)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAISuggestions && (
        <div className="mt-4 p-4 bg-white border-2 border-indigo-500 rounded-md shadow">
          <h4 className="text-2xl font-semibold mb-2">AI Suggestions:</h4>
          <div className="text-lg text-gray-800">
            {aiSuggestions.length > 0 ? (
              <p>{aiSuggestions[0]}</p>
            ) : (
              <p>No AI suggestions available.</p>
            )}
          </div>
          <br />
          <button
            onClick={() => verifyIPs(allRecognizedIps)}
            className="mt-4 ml-4 px-5 py-2 bg-green-500 text-white font-bold rounded-lg"
          >
            Verify Selected IPs
          </button>

          <button
            onClick={verifyAllIPs}
            className="mt-4 ml-4 px-5 py-2 bg-blue-500 text-white font-bold rounded-lg"
          >
            Verify All IPs
          </button>

          {verifiedIpInfo.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xl font-semibold">
                Verified Selected IP Information:
              </h4>
              <ul>
                {verifiedIpInfo.map((info, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <div>
                      {info.ip}: {info.city}, {info.region}, {info.country}
                    </div>
                    {info.dns && (
                      <div className="ml-4 text-xs text-gray-600">
                        DNS: {JSON.stringify(info.dns)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {verifiedAllIpsInfo.length > 0 && (
            <>
              <div className="mt-4">
                <h4 className="text-xl font-semibold">
                  Verified All IPs Information:
                </h4>
                <ul>
                  {verifiedAllIpsInfo.map((info, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {info.ip}: {info.city}, {info.region}, {info.country}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="cf-turnstile"
                data-sitekey="0x4AAAAAAA-YCu2j8t6ctWIF"
                data-callback="javascriptCallback"
              ></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
