"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

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
  }, []);

  console.log("AI Suggestions Array:", aiSuggestions);

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <h3 className="text-2xl font-extrabold mb-6 text-indigo-700">
        AI instructions
      </h3>
      <ul className="space-y-2 mb-8">
        {aiSuggestions && aiSuggestions.length > 0 ? (
          aiSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-3 bg-white rounded-md shadow-sm hover:bg-indigo-50"
            >
              {suggestion}
            </li>
          ))
        ) : (
          <li className="text-gray-500">
            No AI suggestions available, now please wait for a moment.
          </li>
        )}
      </ul>
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
