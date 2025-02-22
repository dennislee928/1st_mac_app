/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from "react";
import iplookupapi from "@everapi/iplookupapi-js";

const IP_LOOKUP_API_KEY =
  process.env.NEXT_PUBLIC_IP_LOOKUP_API_KEY ||
  "ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH";

export default function VerifyIPsPage() {
  const [ips, setIps] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [allRecognizedIps, setAllRecognizedIps] = useState<string[]>([]);
  const [verifiedAllIpsInfo, setVerifiedAllIpsInfo] = useState<any[]>([]);

  const ipApiRef = useRef<any>(null);

  useEffect(() => {
    const loadIpLookupApi = async () => {
      if (typeof window !== "undefined") {
        const { default: IpLookupApi } = await import(
          "@everapi/iplookupapi-js"
        );
        ipApiRef.current = new IpLookupApi(IP_LOOKUP_API_KEY);
        console.log("IP Lookup API Initialized");
      }
    };

    loadIpLookupApi();
  }, []);

  const isValidIp = (ip: string) => {
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,7})|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const fetchLogs = async () => {
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

          const allIpMatches = data.ips?.filter(isValidIp) || [];
          setAllRecognizedIps(allIpMatches);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const verifyAllIPs = async () => {
    if (allRecognizedIps.length === 0) {
      alert("No valid IPs available for verification.");
      return;
    }

    if (!ipApiRef.current) {
      console.error("IP Lookup API is not initialized.");
      return;
    }

    const verifiedIps: any[] = [];
    for (const ip of allRecognizedIps) {
      try {
        const result = await ipApiRef.current.lookup(ip);
        console.log("IP Verification Result:", result);
        verifiedIps.push(result);
      } catch (error) {
        console.error(`Error looking up IP ${ip}:`, error);
      }
    }
    setVerifiedAllIpsInfo(verifiedIps);
  };

  return (
    <div>
      <h1>Verify IPs on a Separate Page</h1>
      <button onClick={fetchLogs}>Fetch AI Suggestions</button>

      <button onClick={verifyAllIPs} disabled={!showAISuggestions}>
        Verify All Valid IPs
      </button>

      {verifiedAllIpsInfo.length > 0 && (
        <div>
          <h4>Verified IP Information:</h4>
          <ul>
            {verifiedAllIpsInfo.map((info, index) => (
              <li key={index}>
                {info.ip}: {info.city}, {info.region}, {info.country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
