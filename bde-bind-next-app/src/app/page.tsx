"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(10);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/fetch-logs");
      const data: {
        ips?: string[];
        needsUpdate?: boolean;
        aiSuggestions?: string;
      } = await response.json();
      setIps(data.ips || []);
      setNeedsUpdate(data.needsUpdate || false);
      if (data.aiSuggestions) {
        const suggestions = data.aiSuggestions.trim().split(/\n+/);
        setAiSuggestions(suggestions);
      } else {
        console.error("No valid AI suggestions found in the response");
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const updateWAF = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/update-waf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips }),
      });

      if (response.ok) {
        alert("WAF rules updated successfully.");
        setNeedsUpdate(false);
      } else {
        alert("Failed to update WAF rules.");
      }
    } catch (error) {
      console.error("Error updating WAF:", error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  console.log("AI Suggestions Array:", aiSuggestions);

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <div className="p-8 bg-white border-4 border-indigo-500 rounded-xl shadow-lg mb-8">
        <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
          AI 建議 (AI Suggestions)
        </h3>
        <div className="overflow-y-auto max-h-96 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-md shadow-inner">
          {aiSuggestions && aiSuggestions.length > 0 ? (
            aiSuggestions.map((suggestion, index) => (
              <p key={index} className="mb-2 text-gray-800">
                {suggestion}
              </p>
            ))
          ) : (
            <p className="text-gray-500 text-xl">
              No AI suggestions available, please wait for {countdown}{" "}
              seconds...
            </p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
        過去30分鐘的 Cloudflare 安全日誌
      </h2>
      {needsUpdate && (
        <div className="mb-6 p-5 border-2 border-red-200 rounded-lg bg-red-50 shadow-md">
          <p className="text-red-600 font-semibold mb-4">
            有新的 IP 地址需要加入到 WAF 挑戰 規則 名單。
          </p>
          <button
            onClick={updateWAF}
            disabled={updating}
            className="px-5 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
          >
            {updating ? "更新中..." : "更新 WAF"}
          </button>
        </div>
      )}
      <ul className="list-none space-y-2">
        {ips.map((ip, index) => (
          <li
            key={index}
            className="p-3 bg-white rounded-md shadow-sm text-gray-700"
          >
            {ip}
          </li>
        ))}
      </ul>
    </div>
  );
}
