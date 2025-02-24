import type { NextApiRequest, NextApiResponse } from "next";

const BASE_URL = "https://api.dnsdumpster.com/domain";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const domain = req.query.domain as string;
  const apiKey = process.env.DNSDUMPSTER_API_KEY;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    const response = await fetch(`${BASE_URL}/${domain}`, {
      headers: {
        "X-API-Key": apiKey || "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch data: ${errorText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: unknown) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
