var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });

// src/index.js
var CF_AUTH_MAIL = "cloudflare.admin@twister5.com.tw";
var CF_AUTH_KEY = "daf08ebac1a4805ecb820fa699ca0d8b0b9e2";
var ZONE_ID = "15e2496da3b1ecfdb51f3ff011634cb2";
var RULESET_ID = "92c8e0851be6450c9b09dbdcbbefd38e";
var RULE_ID = "53f5ec24326648549d91674ce9b4b089";

async function fetchAISuggestions(ipArray) {
  try {
    // Limit the number of IPs to avoid exceeding token limits
    const MAX_IP_COUNT = 10; // Limit to the top 10 IPs, or adjust as needed
    const limitedIpArray = ipArray.slice(0, MAX_IP_COUNT);

    // Build the prompt string with a smaller number of IPs
    const prompt =
      "Analyze these security logs and provide professional security recommendations. They are: " +
      limitedIpArray +
      " in the last 30 minutes that are very possible automatic bots.";

    // Log the prompt
    console.log("Prompt being sent to Cloudflare AI:", prompt);

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/e1ab85903e4701fa311b5270c16665f6/ai/run/@cf/meta/llama-3-8b-instruct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Email": CF_AUTH_MAIL,
          "X-Auth-Key": CF_AUTH_KEY, // Or use Bearer token if required
        },
        body: JSON.stringify({
          prompt: prompt, // Use the built prompt here
          text: JSON.stringify({
            detected_bot_ips: limitedIpArray, // Only send the limited IPs
            timeframe: "last 30 minutes",
            log_format: "structured JSON",
          }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}. Response: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    return data.result?.response || "No suggestions available";
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return "Error retrieving suggestions";
  }
}

__name(fetchAISuggestions, "fetchAISuggestions");

async function fetchSecurityLogs() {
  const endTime = /* @__PURE__ */ new Date();
  const startTime = new Date(endTime - 30 * 60 * 1e3);
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle fetch logs request
    if (url.pathname === "/fetch-logs" && request.method === "GET") {
      const { ips, needsUpdate, aiSuggestions } = await fetchSecurityLogs();
      return new Response(JSON.stringify({ ips, needsUpdate, aiSuggestions }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle update WAF request
    if (url.pathname === "/update-waf" && request.method === "POST") {
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
    if (url.pathname === "/fetch-ai-suggestions" && request.method === "POST") {
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

    return new Response("Not Found", { status: 404 });
  },
};
