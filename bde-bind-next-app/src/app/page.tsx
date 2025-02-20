"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ips, setIps] = useState<string[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  return (
    <div>
      <h2>安全日誌</h2>
      {needsUpdate && (
        <div>
          <p>有新的 IP 地址需要更新 WAF 規則。</p>
          <button onClick={updateWAF} disabled={updating}>
            {updating ? "更新中..." : "更新 WAF"}
          </button>
        </div>
      )}
      <ul>
        {ips.map((ip, index) => (
          <li key={index}>{ip}</li>
        ))}
      </ul>
    </div>
  );
}
