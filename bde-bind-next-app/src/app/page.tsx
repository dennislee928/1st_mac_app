/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const [, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [blockIps, setBlockIps] = useState<string[]>([]);
  const [challengeIps, setChallengeIps] = useState<string[]>([]);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  // Ref to hold interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/fetch-logs");
        const data: { aiSuggestions?: string[] } = await response.json(); // Explicit typing
        if (response.ok) {
          setAiSuggestions(data.aiSuggestions || []);
        } else {
          console.error("Failed to fetch logs:", response.status);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    fetchLogs();
  }, []);

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

  const isValidIp = (ip: string) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
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
          const validIps = allIpMatches.filter(isValidIp);
          setAllRecognizedIps(validIps);
          console.log("Valid Recognized IPs:", validIps);
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

  const updateWAF = async (ips: string[]) => {
    if (ips.length === 0) {
      alert("No valid IP addresses for updating WAF rules.");
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch("/api/update-waf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ips }),
      });

      if (response.ok) {
        alert("WAF rules updated successfully.");
      } else {
        alert("Failed to update WAF rules.");
      }
    } catch (error) {
      console.error("Error updating WAF:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 font-sans bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg shadow-lg">
      <h3 className="text-3xl font-extrabold mb-4 text-indigo-700">
        AI Suggestions
      </h3>
      <button
        onClick={fetchLogs}
        className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg"
      >
        Start Countdown
      </button>

      {showAISuggestions && (
        <div className="mt-4 p-4 bg-white border-2 border-indigo-500 rounded-md shadow">
          <h4 className="text-2xl font-semibold mb-2">AI Suggestions:</h4>
          <div className="text-lg text-gray-800">
            {aiSuggestions ? (
              <p>{aiSuggestions}</p>
            ) : (
              <p>No AI suggestions available.</p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => updateWAF(allRecognizedIps)}
        disabled={updating || allRecognizedIps.length === 0}
        className={`mt-4 px-5 py-2 font-bold rounded-lg shadow-md transition-all duration-200 ${
          updating || allRecognizedIps.length === 0
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {updating ? "Updating WAF..." : "Update WAF with Valid IPs"}
      </button>
      {countdown !== null && (
        <div className="countdown mt-4 text-red-600 font-semibold">
          Countdown: {countdown} seconds
        </div>
      )}
    </div>
  );
}
