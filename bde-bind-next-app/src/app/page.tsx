"use client";

import { useEffect, useState } from "react";
import Footer from "../components/footer";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(25);

  // 呼叫後端 API 取得安全日誌和 AI 建議
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // 將 AI 建議依行拆分
        const suggestions = data.aiSuggestions.trim().split(/\n+/);
        // 將每一行建議翻譯成繁體中文
        const translated = await Promise.all(
          suggestions.map(async (line) => {
            return await translateText(line);
          })
        );
        setAiSuggestions(translated);
      } else {
        console.error("No valid AI suggestions found in the response");
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  // 更新 WAF 規則的函式（不變）
  const updateWAF = async () => {
    setUpdating(true);
    try {
      const response = await fetch("/api/update-waf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips }),
      });
      if (response.ok) {
        alert("WAF 規則更新成功。");
        setNeedsUpdate(false);
      } else {
        alert("更新 WAF 規則失敗。");
      }
    } catch (error) {
      console.error("Error updating WAF:", error);
    } finally {
      setUpdating(false);
    }
  };

  // 翻譯函式，呼叫 /api/translate
  async function translateText(text: string): Promise<string> {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: "zh-TW" }),
      });
      const data = (await response.json()) as { translatedText: string };
      return data.translatedText;
    } catch (error) {
      console.error("翻譯錯誤:", error);
      return text; // 若翻譯失敗則回傳原文
    }
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  console.log("AI Suggestions Array:", aiSuggestions);

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <div className="p-8 bg-white border-4 border-indigo-500 rounded-xl shadow-lg mb-8">
        <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
          AI 建議 (AI Suggestions) ，請查看下方ollama
          ai的資安規則調整建議，一鍵更新請按下 &quot;更新 WAF&quot;
          按鈕部署規則， 若無建議，則區間內無相關攻擊事件，請稍後再查看。
        </h3>
        <ul className="space-y-4">
          {aiSuggestions && aiSuggestions.length > 0 ? (
            aiSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-md shadow-sm"
              >
                {suggestion}
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-xl">
              因直接對LLM做分析請求，耗時較長，，請等待 {countdown}{" "}
              秒，獲取生成式資安建議 ..
            </li>
          )}
        </ul>
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
      <Footer />
    </div>
  );
}
