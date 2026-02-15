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
            content: `你是一个资深猎头和简历优化专家。请将用户的简历内容进行深度的专业化润色，并按严格的 JSON 格式输出。

            【处理要求】
            1. **去 Markdown**：内容中绝对不要出现 **、##、- 等 Markdown 符号。
            2. **技能标签化**：将专业技能提取为短语标签（如 "Python", "React"）。
            3. **经历结构化**：工作经历和项目经历要拆分为公司/项目名、职位、时间和具体内容。
            4. **内容润色**：使用 STAR 法则（情境、任务、行动、结果）重写工作描述，使用量化数据。

            【必须返回的 JSON 结构】
            {
              "baseInfo": {
                "name": "用户姓名(如果没有则根据内容推断或填'求职者')",
                "jobTitle": "目标职位(如'高级前端工程师')",
                "summary": "一段简短有力的个人优势总结(50字以内)"
              },
              "skills": ["技能1", "技能2", "技能3", "技能4"],
              "workExperience": [
                {
                  "company": "公司名称",
                  "role": "职位名称",
                  "time": "时间段 (如 2021.01 - 至今)",
                  "desc": [
                    "优化后的工作内容第一点...",
                    "优化后的工作内容第二点..."
                  ]
                }
              ],
              "projectExperience": [
                 {
                  "name": "项目名称",
                  "role": "担任角色",
                  "desc": [
                    "项目描述及成果..."
                  ]
                }
              ]
            }
            `
          },
          { role: "user", content: text }
        ],
        response_format: { type: 'json_object' }, 
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "API调用失败" }, { status: 500 });

    const jsonString = data.choices?.[0]?.message?.content;
    const parsedData = JSON.parse(jsonString);
    return NextResponse.json({ result: parsedData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}