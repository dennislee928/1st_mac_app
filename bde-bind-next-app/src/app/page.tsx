"use client";

import { useEffect, useState } from "react";

interface AIResponse {
  items: { score: number; label: string }[];
}

interface AIInput {
  messages: { role: string; content: string }[];
}

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/fetch-logs");
      const data: { ips?: string[]; needsUpdate?: boolean } =
        await response.json();
      setIps(data.ips || []);
      setNeedsUpdate(data.needsUpdate || false);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const runAIModel = async (
    model: string,
    input: AIInput
  ): Promise<AIResponse> => {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/e1ab85903e4701fa311b5270c16665f6/ai/run/${model}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Email": process.env.CLOUDFLARE_EMAIL || "",
          "X-Auth-API-Key": process.env.CLOUDFLARE_API_KEY || "",
        },
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    const result: AIResponse = await response.json();
    return result;
  };

  const fetchAISuggestions = async () => {
    try {
      const logResponse = await fetch("/api/fetch-logs");
      const logData = await logResponse.json();

      const input = {
        messages: [
          {
            role: "system",
            content: "You are a friendly assistant that helps write stories.",
          },
          {
            role: "user",
            content: `Based on the following logs, suggest improvements for WAF rules: ${JSON.stringify(
              logData
            )}`,
          },
        ],
      };

      const aiResponse = await runAIModel(
        "@cf/meta/llama-3-8b-instruct",
        input
      );
      setAiSuggestions(aiResponse.items.map((item) => item.label)); // 提取建議標籤
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
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
    fetchAISuggestions(); // 在這裡調用 AI 建議函數
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          color: "#000",
          fontWeight: "bold",
          borderBottom: "2px solid #e0e0e0",
          paddingBottom: "10px",
        }}
      >
        過去30分鐘的cloudflare安全日誌
      </h2>
      {needsUpdate && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#c0392b",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            有新的 IP 地址需要加入到 WAF 挑戰 規則 名單。
          </p>
          <button
            onClick={updateWAF}
            disabled={updating}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
          >
            {updating ? "更新中..." : "更新 WAF"}
          </button>
        </div>
      )}
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {ips.map((ip, index) => (
          <li
            key={index}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid #eee",
              color: "#555",
              fontSize: "14px",
            }}
          >
            {ip}
          </li>
        ))}
      </ul>
      <h3>AI 建議</h3>
      <ul>
        {aiSuggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
}
