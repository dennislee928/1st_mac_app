import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  // 假設這裡使用一個外部 API 來解析域名或 IP
  fetch(`https://some-external-api.com/lookup?query=${query}`)
    .then((response) => response.json())
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      console.error("查詢失敗:", error);
      res.status(500).json({ message: "查詢過程中發生錯誤" });
    });
}
