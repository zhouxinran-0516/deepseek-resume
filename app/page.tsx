"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePolish = async () => {
    if (!input.trim()) return;

    setLoading(true);

    const res = await fetch("/api/polish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setOutput(data.result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">
        DeepSeek AI 简历润色
      </h1>

      <textarea
        className="w-full h-48 p-4 border rounded mb-4"
        placeholder="请输入你的简历..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handlePolish}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {loading ? "润色中..." : "开始润色"}
      </button>

      {output && (
        <div className="mt-6 p-6 bg-white border rounded prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {output}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
