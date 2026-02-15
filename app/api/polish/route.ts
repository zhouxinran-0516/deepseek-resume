import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v3",
        messages: [
          {
            role: "system",
            content: "你是一个专业HR，请把用户的简历润色得更专业、更简洁、更有竞争力"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    return NextResponse.json({
      result: data.choices?.[0]?.message?.content || "润色失败"
    });

  } catch (e) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
