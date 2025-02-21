interface AIResponse {
  // 根據實際返回的數據結構定義屬性
  suggestions: string[];
}

const aiDemo = {
  async fetch(
    request: Request,
    env: { AI: { run: (model: string, prompt: string) => Promise<AIResponse> } }
  ) {
    const tasks = [];

    // 獲取日誌數據
    const logResponse = await fetch("/api/fetch-logs");
    const logData = await logResponse.json();

    // 使用日誌數據生成建議
    const suggestionPrompt = {
      prompt: `Based on the following logs, suggest improvements for WAF rules: ${JSON.stringify(
        logData
      )}`,
    };
    const response = await env.AI.run(
      "@cf/meta/llama-3-8b-instruct",
      suggestionPrompt.prompt
    );
    tasks.push({ inputs: suggestionPrompt, response });

    return Response.json(tasks);
  },
};

export default aiDemo;
