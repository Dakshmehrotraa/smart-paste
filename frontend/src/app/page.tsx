"use client";
import { useState } from "react";

const TRANSFORMS: Record<string, string[]> = {
  json: ["prettify", "minify", "json_to_csv", "explain"],
  csv: ["explain"],
  url: ["url_encode", "url_decode", "explain"],
  base64: ["base64_decode", "explain"],
  code: ["explain"],
  text: ["base64_encode", "url_encode", "explain"],
};

export default function Home() {
  const [input, setInput] = useState("");
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detect = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("http://127.0.0.1:8000/api/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });
    const data = await res.json();
    setDetectedType(data.type);
    setLoading(false);
  };

  const transform = async (t: string) => {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, transform: t }),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  const copy = () => result && navigator.clipboard.writeText(result);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">⚡ SmartPaste</h1>
          <p className="text-gray-400 mt-1">Paste anything. We'll figure it out.</p>
        </div>

        <textarea
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-xl p-4 font-mono text-sm text-white resize-none focus:outline-none focus:border-indigo-500"
          placeholder="Paste JSON, code, URLs, CSV, Base64..."
          value={input}
          onChange={(e) => { setInput(e.target.value); setDetectedType(null); setResult(null); }}
        />

        <button
          onClick={detect}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-6 py-2 rounded-lg font-semibold transition"
        >
          {loading ? "Detecting..." : "Detect & Analyze"}
        </button>

        {detectedType && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Detected:</span>
              <span className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm font-mono">
                {detectedType}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(TRANSFORMS[detectedType] || ["explain"]).map((t) => (
                <button
                  key={t}
                  onClick={() => transform(t)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-1.5 rounded-lg text-sm transition disabled:opacity-40"
                >
                  {t.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Result</span>
              <button onClick={copy} className="text-indigo-400 hover:text-indigo-300 text-sm">
                Copy
              </button>
            </div>
            <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm font-mono whitespace-pre-wrap break-words text-green-300">
              {result}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}