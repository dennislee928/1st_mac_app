"use client";

import { useEffect, useState } from "react";
import CollapsibleMenu from "@/components/menuBar";

export default function Home() {
  const [, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [blockIps, setBlockIps] = useState<string[]>([]);
  const [challengeIps, setChallengeIps] = useState<string[]>([]);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);

  useEffect(() => {
    console.log("Component mounted");

    return () => {
      console.log("Component will unmount");
    };
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(interval);
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
        setShowAISuggestions(true); // Only show suggestions if fetch is successful

        if (data.aiSuggestions) {
          const suggestions = data.aiSuggestions.trim().split(/\n+/);
          setAiSuggestions(suggestions);

          console.log("AI Suggestions Received:", suggestions);

          // Extract all IPs from the suggestions
          const allIpMatches = data.aiSuggestions.match(/[\w:.]+/g) || [];
          setAllRecognizedIps(allIpMatches);
          console.log("All Recognized IPs:", allIpMatches);

          // Parse block and challenge IPs
          const blockMatches = data.aiSuggestions.match(
            /I suggest to block the following IPs:[\s*]*([\w\.:, ]+)/i
          );

          const challengeMatches = data.aiSuggestions.match(
            /I suggest to challenge the following IPs:[\s*]*([\w\.:, ]+)/i
          );

          if (blockMatches && blockMatches[1]) {
            const parsedBlockIps = blockMatches[1]
              .split(/[\s,]+/)
              .map((ip) => ip.trim());
            console.log("Parsed Block IPs:", parsedBlockIps);
            setBlockIps(parsedBlockIps);
          } else {
            console.warn("No valid block IPs found in suggestions.");
          }

          if (challengeMatches && challengeMatches[1]) {
            const parsedChallengeIps = challengeMatches[1]
              .split(/[\s,]+/)
              .map((ip) => ip.trim());
            console.log("Parsed Challenge IPs:", parsedChallengeIps);
            setChallengeIps(parsedChallengeIps);
          } else {
            console.warn("No valid challenge IPs found in suggestions.");
          }
        } else {
          console.error("No valid AI suggestions found in the response");
        }
      } else {
        console.error("Failed to fetch logs with status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const isValidIp = (ip: string) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex =
      /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateWAF = async (ips: string[]) => {
    const validIps = ips.filter(isValidIp);
    if (validIps.length === 0) {
      alert("沒有有效的 IPv4 或 IPv6 地址可用於更新 WAF 規則。");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/update-waf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips: validIps }),
      });

      if (response.ok) {
        alert("WAF 規則成功更新。");
      } else {
        alert("更新 WAF 規則失敗。");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("更新 WAF 時出錯：", error);
        alert("更新 WAF 時出錯：" + error.message);
      } else {
        console.error("更新 WAF 時出錯：", error);
        alert("更新 WAF 時出錯：未知錯誤");
      }
    } finally {
      setUpdating(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateWAFBlocking = async () => {
      if (blockIps.length === 0) {
        alert("No IPs available for WAF blocking rules.");
        return;
      }
      setUpdating(true);
      try {
        const response = await fetch("/api/update-waf-blocking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ips: blockIps }),
        });

        if (response.ok) {
          alert("WAF blocking rules updated successfully.");
        } else {
          alert("Failed to update WAF blocking rules.");
        }
      } catch (error) {
        console.error("Error updating WAF blocking rules:", error);
      } finally {
        setUpdating(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateWAFChallenge = async () => {
      if (challengeIps.length === 0) {
        alert("No challenge IPs available for WAF rules.");
        return;
      }
      setUpdating(true);
      try {
        const response = await fetch("/api/update-waf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ips: challengeIps }),
        });

        if (response.ok) {
          alert("WAF challenge rules updated successfully.");
        } else {
          alert("Failed to update WAF challenge rules.");
        }
      } catch (error) {
        console.error("Error updating WAF challenge rules:", error);
      } finally {
        setUpdating(false);
      }
    };

    return (
      <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
        <div className="p-8 bg-white border-4 border-indigo-500 rounded-xl shadow-lg mb-8">
          <CollapsibleMenu />
          <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
            AI 建議 (AI Suggestions)
          </h3>
          <button
            onClick={fetchLogs}
            disabled={updating}
            className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200"
          >
            點選此鈕獲取最新的ollama回應
          </button>
          <br />
          <br />
          {showAISuggestions && (
            <div className="overflow-y-auto max-h-96 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-md shadow-inner">
              {aiSuggestions.length > 0 ? (
                aiSuggestions.map((suggestion, index) => (
                  <p key={index} className="mb-2 text-gray-800">
                    {suggestion}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-xl">
                  No AI suggestions available yet. Please wait for {countdown}{" "}
                  seconds...
                </p>
              )}
            </div>
          )}
        </div>

        {showAISuggestions && (
          <div className="mb-6 p-5 border-2 border-red-200 rounded-lg bg-red-50 shadow-md">
            <p className="text-red-600 font-semibold mb-4">
              有新的 IP 地址需要加入到 WAF 規則 名單。
            </p>
            <button
              onClick={() => updateWAF(allRecognizedIps)}
              disabled={updating || allRecognizedIps.length === 0}
              className={`px-5 py-2 font-bold rounded-lg shadow-md transition-all duration-200 mr-4 ${
                updating || allRecognizedIps.length === 0
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              title={
                updating || allRecognizedIps.length === 0
                  ? "Unclickable due to parsing issue"
                  : "Add All Recognized IPs to WAF"
              }
            >
              {updating ? "更新中..." : "接受所有 AI 建議"}
            </button>

            <br />
            <br />
            <br />
          </div>
        )}

        <div>
          <h3>All Recognized IPs:</h3>
          <ul>
            {allRecognizedIps.map((ip, index) => (
              <li key={index}>{ip}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
}
