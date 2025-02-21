"use client";

import { useEffect, useState, useCallback } from "react";

interface ErrorDetail {
  message: string; // 錯誤信息
  code?: string; // 可選的錯誤代碼
}
const CF_AUTH_MAIL = process.env.CF_AUTH_MAIL || "";
const CF_AUTH_KEY = process.env.CF_AUTH_KEY || "";

interface AIResponse {
  result: {
    response: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    success: boolean;
    errors: ErrorDetail[]; // 使用具體的 ErrorDetail 類型
  };
}

interface AIInput {
  messages: { role: string; content: string }[];
  ips?: string[]; // 添加 ips 屬性
}

//interface LogData {
//ips?: string[];
//needsUpdate?: boolean;
//}

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions] = useState<string[]>([]);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/fetch-logs");
      const data: { ips?: string[]; needsUpdate?: boolean } =
        await response.json();
      setIps(data.ips || []);
      setNeedsUpdate(data.needsUpdate || false);
      return data; // 返回日誌數據
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const fetchAISuggestions = async (input: AIInput) => {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/e1ab85903e4701fa311b5270c16665f6/ai/run/@cf/meta/llama-3-8b-instruct`,
        {
          method: "POST",
          headers: {
            "X-Auth-Email": CF_AUTH_MAIL,
            "X-Auth-Key": CF_AUTH_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch AI suggestions:", errorData);
        throw new Error("Failed to fetch AI suggestions");
      }

      const responseData: AIResponse = await response.json(); // 使用 AIResponse
      return responseData;
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

  const handleFetchSuggestions = useCallback(async () => {
    const { ips = [], needsUpdate = false } = (await fetchLogs()) || {};
    if (needsUpdate) {
      await fetchAISuggestions({ messages: [], ips }); // 將日誌數據傳遞給安全建議函數
    }
  }, []);

  useEffect(() => {
    handleFetchSuggestions();
  }, [handleFetchSuggestions]);

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
