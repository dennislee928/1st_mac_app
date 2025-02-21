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
    <div className="p-4 font-sans bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">AI 建議</h3>
      <ul>
        {aiSuggestions && aiSuggestions.length > 0 ? (
          aiSuggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))
        ) : (
          <li>No AI suggestions available, now please wait for a moment.</li>
        )}
      </ul>
      <h2 className="text-xl font-bold border-b pb-2 mb-4">
        過去30分鐘的 Cloudflare 安全日誌
      </h2>
      {needsUpdate && (
        <div className="mb-4 p-4 border rounded bg-white shadow">
          <p className="text-red-600 font-semibold">
            有新的 IP 地址需要加入到 WAF 挑戰 規則 名單。
          </p>
          <button
            onClick={updateWAF}
            disabled={updating}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            {updating ? "更新中..." : "更新 WAF"}
          </button>
        </div>
      )}
      <ul className="list-none p-0">
        {ips.map((ip, index) => (
          <li key={index} className="py-2 border-b text-gray-600">
            {ip}
          </li>
        ))}
      </ul>
    </div>
  );
}
