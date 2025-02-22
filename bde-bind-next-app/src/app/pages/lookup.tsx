import { useState } from "react";

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Start of Selection
      // Start of Selection
      const response = await fetch(`/api/lookup?query=${query}`);
      const data = await response.json();
      setResult(data as never);
      // Start of Selection
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="輸入域名或 IP 地址"
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "查詢中..." : "查詢"}
      </button>
      <div>{result && <pre>{JSON.stringify(result, null, 2)}</pre>}</div>
    </div>
  );
}
