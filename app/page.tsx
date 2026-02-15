"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePolish = async () => {
    // 如果输入为空，直接返回，不发送请求
    if (!input.trim()) return;

    setLoading(true);
    setOutput(""); // 清空上一次的结果，避免混淆

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      // 解析后端返回的数据
      const data = await res.json();

      // 检查 HTTP 状态码是否成功 (200-299)
      if (!res.ok) {
        throw new Error(data.error || "服务器返回错误，请检查 API Key");
      }

      // 如果成功，设置结果
      if (data.result) {
        setOutput(data.result);
      } else {
        setOutput("⚠️ 后端未返回有效内容，请检查日志");
      }

    } catch (error: any) {
      // 捕获所有错误（网络断开、JSON解析失败、后端报错等）
      console.error("润色出错:", error);
      setOutput(`❌ 润色失败: ${error.message}`);
    } finally {
      // 无论成功还是失败，最后都要把 loading 关掉
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">
        DeepSeek AI 简历润色
      </h1>

      <textarea
        className="w-full h-48 p-4 border rounded mb-4"
        placeholder="请输入你的简历内容（例如：我是小明，熟悉Python...）"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handlePolish}
        disabled={loading} // 加载时禁用按钮
        className={`bg-black text-white px-6 py-2 rounded transition-all ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
        }`}
      >
        {loading ? "AI 正在思考中..." : "开始润色"}
      </button>

      {/* 只有当 output 有内容时才显示结果框 */}
      {output && (
        <div className="mt-6 p-6 bg-white border rounded prose max-w-none shadow-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {output}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}