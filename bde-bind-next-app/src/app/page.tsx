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
        安全日誌
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
            有新的 IP 地址需要更新 WAF 規則。
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
    </div>
  );
}
