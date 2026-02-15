import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });

    const { text } = await req.json();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个简历优化专家。请直接输出润色后的简历内容。请使用空行分隔不同的板块（如个人简介、工作经历等）。请不要使用JSON格式，直接输出文本。"
          },
          { role: "user", content: text }
        ],
        stream: false
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message }, { status: 500 });

    return NextResponse.json({ result: data.choices?.[0]?.message?.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}