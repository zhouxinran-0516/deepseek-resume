import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. 读取 Vercel 环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务器端未配置 API Key (DEEPSEEK_API_KEY)" }, 
        { status: 500 }
      );
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "请输入简历内容" }, { status: 400 });
    }

    // 2. 发送请求给 DeepSeek 官方 API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // ⚠️ 关键点：DeepSeek 官方 V3 模型的名字叫 "deepseek-chat"
        model: "deepseek-chat", 
        messages: [
          {
            role: "system",
            content: "你是一个拥有10年经验的资深HR和简历优化专家。请把用户的简历润色得更专业、更有竞争力。使用通过、量化的语言，优化措辞。请直接输出润色后的Markdown内容，不要包含'好的'、'如下'等废话。"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7, // 0.7 适合创意润色，1.3 适合写代码
        stream: false
      }),
    });

    const data = await response.json();

    // 3. 错误处理：如果 DeepSeek 官方返回错误（比如 401 Key 无效，402 没余额）
    if (!response.ok) {
      console.error("DeepSeek API Error:", data);
      const errorMsg = data.error?.message || "API 调用失败";
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    // 4. 返回结果
    const resultText = data.choices?.[0]?.message?.content;
    return NextResponse.json({ result: resultText });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请检查 Vercel 后台日志" }, 
      { status: 500 }
    );
  }
}