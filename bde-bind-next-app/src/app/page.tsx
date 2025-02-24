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

  // Initialize the IP lookup API with the provided key
  const ipApi = new iplookupapi(
    "ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH"
  );

  // Ref to hold interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    fetchLogs();
    fetchIPsonly();
  }, []);

  // Function to verify selected valid IPs using iplookupapi
  const verifyIPs = async (validIps: string[]) => {
    const verifiedIps: any[] = [];
    for (const ip of validIps) {
      try {
        const result = await ipApi.lookup(ip);
        console.log(result);
        verifiedIps.push(result);
      } catch (error) {
        console.error(`Error looking up IP ${ip}:`, error);
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
