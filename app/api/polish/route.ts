import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `
你是一名专业HR，请优化用户简历。

要求：
- 使用Markdown格式输出
- 标题使用二级标题（##）
- 项目使用项目符号列表
- 突出成果与量化指标
- 表达专业简洁
`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      result: data.choices?.[0]?.message?.content || "生成失败",
    });
  } catch (error) {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
