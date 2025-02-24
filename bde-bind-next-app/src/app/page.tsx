/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import iplookupapi from "@everapi/iplookupapi-js";
import { useRouter } from "next/navigation";
export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  const [verifiedIpInfo, setVerifiedIpInfo] = useState<any[]>([]);
  const [verifiedAllIpsInfo, setVerifiedAllIpsInfo] = useState<any[]>([]);

  // 添加一個 state 來存儲 API 實例
  const [ipApi, setIpApi] = useState<any>(null);

  // Ref to hold interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchIPLookupApi = async () => {
      try {
        const iplookupapi = (await import("@everapi/iplookupapi-js")).default;
        const apiInstance = new iplookupapi(
          "ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH"
        );
        setIpApi(apiInstance);
      } catch (error) {
        console.error("Error initializing IP lookup API:", error);
      }
    };
    const fetchIPsonly = async () => {
      try {
        const response = await fetch("/api/get-ips-only");
        if (response.ok) {
          const data: string[] = await response.json();
          setIps(data);
          console.log("Fetched IPs on load:", data);
        } else {
          console.error("Failed to fetch IPs:", response.status);
        }
      } catch (error) {
        console.error("Error fetching IPs:", error);
      }
    };

    fetchIPLookupApi();
    fetchLogs();
    fetchIPsonly();
  }, []);

  const fetchIPsOnly = async () => {
    try {
      const response = await fetch("/api/get-ips-only");
      if (response.ok) {
        const data: string[] = await response.json();
        setIps(data);
        console.log("Fetched IPs on load:", data);
      } else {
        console.error("Failed to fetch IPs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching IPs:", error);
    }
  };

  const fetchLogs = async () => {
    setShowAISuggestions(false);
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
    }
  };

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
        AI Suggestions
      </h3>
      <h2 className="text-3xl font-extrabold mb-4 text-indigo-700">
        Fetched IPs
      </h2>
      <ul>
        {ips.length > 0 ? (
          ips.map((ip, index) => (
            <li key={index} className="text-lg text-gray-800">
              {ip}
            </li>
          ))
        ) : (
          <p>No IPs available.</p>
        )}
      </ul>

      <button
        onClick={async () => {
          await fetchLogs();
        }}
        className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg mt-4"
      >
        Fetch AI Suggestions
      </button>

      <br />

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
        </div>
      )}
    </div>
  );
}
