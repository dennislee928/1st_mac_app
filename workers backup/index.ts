var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });

// src/index.js
var CF_AUTH_MAIL = "cloudflare.admin@twister5.com.tw";
var CF_AUTH_KEY = "daf08ebac1a4805ecb820fa699ca0d8b0b9e2";
var ZONE_ID = "15e2496da3b1ecfdb51f3ff011634cb2";
var RULESET_ID = "92c8e0851be6450c9b09dbdcbbefd38e";
var RULE_ID = "ee5369e5c6a248b7b755e75c31c7ef60";
var Block_RULE_ID = "f778bd84056045d2a867acfbe1231766";
//

// Function to fetch IPs only
async function fetchIPsonly() {
  const endTime = new Date();
  const startTime = new Date(endTime - 30 * 60 * 1000); // 改為最近30分鐘

  const graphqlQuery = {
    operationName: "GetSecuritySampledLogs",
    variables: {
      zoneTag: ZONE_ID,
      accountTag: "e1ab85903e4701fa311b5270c16665f6",
      filter: {
        AND: [
          {
            datetime_geq: startTime.toISOString(),
            datetime_leq: endTime.toISOString(),
            requestSource: "eyeball",
          },
          {
            botScore_leq: 60,
          },
        ],
      },
    },
    query: `query GetSecuritySampledLogs($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveFilter_InputObject) {
      viewer {
        scope: zones(filter: {zoneTag: $zoneTag}) {
          httpRequestsAdaptive(
            filter: $filter,
            limit: 1000,
            orderBy: ["datetime_DESC"]
          ) {
            clientIP
            botScore
            __typename
          }
          __typename
        }
        __typename
      }
    }`,
  };

  try {
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: {
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      }
    );

    const data = await response.json();
    const ips = new Set();

    if (data?.data?.viewer?.scope?.[0]?.httpRequestsAdaptive) {
      data.data.viewer.scope[0].httpRequestsAdaptive.forEach((request) => {
        if (request.clientIP && request.botScore <= 60) {
          ips.add(request.clientIP);
        }
      });
    }

    return Array.from(ips);
  } catch (error) {
    console.error("Error fetching IPs:", error);
    return [];
  }
}

__name(fetchIPsonly, "fetchIPsonly");

async function fetchAISuggestions(ipArray) {
  try {
    console.log("Starting AI suggestions request for IPs:", ipArray);

    const prompt = `你是一位經驗豐富的 Cloudflare 安全顧問。這些是過去30分鐘內 BotScore 低於 60 的 IP: ${ipArray}。請分析這些 IP 並提供專業的安全建議。`;

    // 設置 15 秒超時
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    console.log("Sending request to Cloudflare AI...");
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/e1ab85903e4701fa311b5270c16665f6/ai/run/@cf/meta/llama-3-8b-instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY,
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: 1024, // 減少 token 數量
          temperature: 0.7,
          text: JSON.stringify({
            detected_bot_ips: ipArray,
            timeframe: "last 30 minutes",
            log_format: "structured JSON",
          }),
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("AI API responded with status:", response.status);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received, length:", data.result?.response?.length);

    return data.result?.response || "無法獲取 AI 建議";
  } catch (error) {
    console.error("Error in fetchAISuggestions:", error);
    if (error.name === "AbortError") {
      return "AI 回應超時，請稍後再試";
    }
    return "無法獲取 AI 建議：" + error.message;
  }
}

__name(fetchAISuggestions, "fetchAISuggestions");

async function fetchSecurityLogs() {
  const endTime = /* @__PURE__ */ new Date();
  const startTime = new Date(endTime - 1 * 60 * 1e3);
  const graphqlQuery = {
    operationName: "GetSecuritySampledLogs",
    variables: {
      zoneTag: "15e2496da3b1ecfdb51f3ff011634cb2",
      accountTag: "e1ab85903e4701fa311b5270c16665f6",
      filter: {
        AND: [
          {
            datetime_geq: startTime.toISOString(),
            datetime_leq: endTime.toISOString(),
            requestSource: "eyeball",
          },
          {
            botScore_leq: 60,
          },
        ],
      },
    },
    query: `query GetSecuritySampledLogs($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveFilter_InputObject) {
				viewer {
					scope: zones(filter: {zoneTag: $zoneTag}) {
						httpRequestsAdaptive(
							filter: $filter,
							limit: 1000,
							orderBy: ["datetime_DESC"]
						) {
							clientIP
							clientCountryName
							clientRequestHTTPMethodName
							clientRequestPath
							datetime
							userAgent
							botScore
							__typename
						}
						__typename
					}
					__typename
				}
			}`,
  };
  try {
    const response = await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: {
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphqlQuery),
      }
    );
    const data = await response.json();
    const ips = /* @__PURE__ */ new Set();
    if (data?.data?.viewer?.scope?.[0]?.httpRequestsAdaptive) {
      data.data.viewer.scope[0].httpRequestsAdaptive.forEach((request) => {
        if (request.clientIP && request.botScore <= 60) {
          ips.add(request.clientIP);
        }
      });
    }
    const ipArray = Array.from(ips);
    console.log("Extracted IPs:", ipArray);

    const aiSuggestions = await fetchAISuggestions(ipArray);

    return { ips: ipArray, needsUpdate: ipArray.length > 0, aiSuggestions };
  } catch (error) {
    console.error("Error fetching security logs:", error);
    return { ips: [], needsUpdate: false, aiSuggestions: "" };
  }
}
__name(fetchSecurityLogs, "fetchSecurityLogs");

async function updateWAFRule(newIps) {
  try {
    const expression = `ip.src in {${newIps.join(
      " "
    )}} or not cf.edge.server_port in {80 443}`;
    const ruleData = {
      action: "managed_challenge",
      description: "automation of waf rules creating.",
      enabled: true,
      expression,
    };
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/${RULESET_ID}/rules/${RULE_ID}`,
      {
        method: "PATCH",
        headers: {
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ruleData),
      }
    );
    const data = await response.json();
    console.log("WAF rule updated successfully:", data);
  } catch (error) {
    console.error("Error updating WAF rule:", error);
  }
}
__name(updateWAFRule, "updateWAFRule");
//
async function updateWAFRule_blocking(newIps) {
  try {
    console.log("Preparing to update WAF rule with blocking action...");
    console.log("IPs to block:", newIps);

    const expression = `ip.src in {${newIps.join(
      " "
    )}} or not cf.edge.server_port in {80 443}`;
    const ruleData = {
      action: "block",
      description: "Automation of WAF rules creation (blocking).",
      enabled: true,
      expression,
    };

    console.log("Corrected API URL for blocking rule:", apiUrl);
    console.log("Rule data being sent:", ruleData);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets/${RULESET_ID}/rules/f778bd84056045d2a867acfbe1231766`,
      {
        method: "PATCH",
        headers: {
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ruleData),
      }
    );

    const data = await response.json();
    console.log("Response from Cloudflare WAF update (blocking):", data);

    if (!response.ok) {
      console.error("Failed to update WAF rule (blocking):", data);
      throw new Error(
        `Failed to update WAF rule (blocking): ${JSON.stringify(data)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Error updating WAF rule (blocking):", error);
    throw error;
  }
}

__name(updateWAFRule_blocking, "updateWAFRule_blocking");

//

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    console.log("Received request at:", url.pathname); // Log the path for all incoming requests
    //
    if (url.pathname === "/api/get-ips-only" && request.method === "GET") {
      console.log("Handling /get-ips-only");
      const ips = await fetchIPsonly();
      return new Response(JSON.stringify(ips), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle fetch logs request
    if (url.pathname === "/api/fetch-logs" && request.method === "GET") {
      console.log("Handling /fetch-logs");
      try {
        // 先獲取 IPs
        console.log("Fetching IPs...");
        const ips = await fetchIPsonly();
        console.log("IPs fetched:", ips);

        // 只有在有 IPs 時才請求 AI 建議
        let aiSuggestions = "";
        if (ips.length > 0) {
          console.log("Fetching AI suggestions...");
          aiSuggestions = await fetchAISuggestions(ips);
          console.log("AI suggestions fetched");
        } else {
          console.log("No IPs found, skipping AI suggestions");
          aiSuggestions = "目前沒有發現可疑的 IP";
        }

        // 返回結果
        return new Response(
          JSON.stringify({
            ips,
            aiSuggestions,
            showAISuggestions: true,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-cache",
            },
          }
        );
      } catch (error) {
        console.error("Error in fetch-logs:", error);

        // 返回更詳細的錯誤信息
        return new Response(
          JSON.stringify({
            error: "Request processing failed",
            details: error.message,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // Handle update WAF request
    if (url.pathname === "/api/update-waf" && request.method === "POST") {
      //
      console.log("Handling /update-waf");

      //
      try {
        const { ips } = await request.json();
        await updateWAFRule(ips);
        return new Response("WAF rules updated successfully", { status: 200 });
      } catch (error) {
        console.error("Invalid request payload:", error);
        return new Response("Invalid request payload", { status: 400 });
      }
    }

    // Handle fetch AI suggestions request
    if (
      url.pathname === "/api/fetch-ai-suggestions" &&
      request.method === "POST"
    ) {
      try {
        const { ips } = await request.json();
        const aiSuggestions = await fetchAISuggestions(ips);
        return new Response(JSON.stringify({ result: aiSuggestions }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error fetching AI suggestions:", error);
        return new Response("Error fetching AI suggestions", { status: 500 });
      }
    }

    //

    // Handle update WAF blocking request
    if (
      url.pathname === "/api/update-waf-blocking" &&
      request.method === "POST"
    ) {
      //
      console.log("Handling /update-Blocking-WAF");

      //
      try {
        console.log("Handling WAF blocking update...");
        const { ips } = await request.json();
        console.log("Received IPs for blocking:", ips);
        await updateWAFRule_blocking(ips);
        return new Response("WAF blocking rules updated successfully", {
          status: 200,
        });
      } catch (error) {
        console.error("Invalid request payload (blocking):", error);
        return new Response("Invalid request payload", { status: 400 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
//
