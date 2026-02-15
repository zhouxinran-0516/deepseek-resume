"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ⭐ 清洗 markdown (保留你的逻辑)
  const cleanText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/#+\s/g, "")
      .replace(/---/g, "")
      .replace(/`/g, "")
      .trim();
  };

  const optimizeResume = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSections([]);

    try {
      // ✅ 修正点1：必须用相对路径，不能用 127.0.0.1
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSections(["润色失败: " + (data.error || "未知错误")]);
        setLoading(false);
        return;
      }

      // ✅ 修正点2：确保 data.result 是字符串
      // 如果后端返回的是对象，这里强制转为字符串，防止页面崩溃
      const content = typeof data.result === 'string' 
        ? data.result 
        : JSON.stringify(data.result, null, 2); 

      const cleaned = cleanText(content);
      const split = cleaned.split("\n\n"); // 按空行分模块
      setSections(split);

    } catch (error) {
      console.error(error);
      setSections(["请求失败，请检查网络或日志"]);
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: "bold" }}>AI 简历润色助手</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="请输入你的简历内容..."
        style={{
          width: "100%",
          height: 200,
          marginTop: 20,
          padding: 15,
          borderRadius: 10,
          border: "2px solid black",
          fontSize: 16,
        }}
      />

      <button
        onClick={optimizeResume}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "12px 24px",
          backgroundColor: loading ? "#ccc" : "black",
          color: "white",
          borderRadius: 10,
          fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "正在润色..." : "润色简历"}
      </button>

      {/* ⭐ 模块化展示 */}
      <div style={{ marginTop: 40 }}>
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              padding: 20,
              marginBottom: 20,
              borderRadius: 16,
              border: "1px solid #ddd",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              backgroundColor: "white",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {section}
          </div>
        ))}
      </div>
    </main>
  );
}