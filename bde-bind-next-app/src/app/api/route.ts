import { NextResponse } from "next/server";

// 配置設定
const DNS_BASE_URL = "https://api.dnsdumpster.com/domain";
const DNS_API_KEY =
  "6f399a3c03f89b79a948ffe6cb49058876f81c2d0beb25a9d4699baa3afe6399";
const IP_API_KEY = "ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH";
const IP_BASE_URL =
  "https://api.iplookupapi.com/v1/info?apikey=ipl_live_PXUl1VZE3GQ3QgG9QjvMlsfyDzLmrUPxKuBXnEDH";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json({ error: "IP is required" }, { status: 400 });
  }

  try {
    // 進行 IP 查詢
    const ipResponse = await fetch(
      `${IP_BASE_URL}?ip=${ip}&apikey=${IP_API_KEY}`,
      {
        headers: {
          apikey: IP_API_KEY, // 也可以通過 header 傳送 API key
        },
      }
    );

    if (!ipResponse.ok) {
      const errorText = await ipResponse.text();
      throw new Error(`IP lookup failed: ${errorText}`);
    }

    const ipData = await ipResponse.json();

    // 進行 DNS 查詢（如果有 DNS API key）
    let dnsData = null;
    if (DNS_API_KEY) {
      const dnsResponse = await fetch(`${DNS_BASE_URL}/${ip}`, {
        headers: {
          "X-API-Key": DNS_API_KEY,
        },
      });

      if (dnsResponse.ok) {
        dnsData = await dnsResponse.json();
      }
    }

    // 合併結果
    return NextResponse.json({
      ip: ipData,
      dns: dnsData,
    });
  } catch (error) {
    console.error("API lookup error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lookup failed",
      },
      { status: 500 }
    );
  }
}
