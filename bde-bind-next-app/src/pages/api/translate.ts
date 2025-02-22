// pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { translate } from "@vitalets/google-translate-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { text, targetLang } = req.body;
  try {
    const result = await translate(text, { to: targetLang });
    res.status(200).json({ translatedText: result.text });
  } catch (error) {
    console.error("翻譯錯誤:", error);
    res.status(500).json({ error: "Translation failed" });
  }
}
