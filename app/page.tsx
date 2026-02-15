"use client";

import { useState } from "react";

// 定义严格的数据类型，对应后端的 JSON 结构
interface ResumeData {
  baseInfo: {
    name: string;
    jobTitle: string;
    summary: string;
  };
  skills: string[];
  workExperience: Array<{
    company: string;
    role: string;
    time: string;
    desc: string[];
  }>;
  projectExperience: Array<{
    name: string;
    role: string;
    desc: string[];
  }>;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePolish = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResume(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResume(data.result);
    } catch (err: any) {
      setErrorMsg(err.message || "润色失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-6 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-slate-900">
          Boss直聘风格 · 简历智能优化
        </h1>

        {/* 输入区 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-8">
          <textarea
            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-sm"
            placeholder="请直接粘贴您的原始简历，无论多乱，AI 都会帮您整理成专业卡片..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handlePolish}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-bold text-white shadow-md transition-all ${
                loading ? "bg-slate-400" : "bg-teal-500 hover:bg-teal-600"
              }`}
            >
              {loading ? "AI 正在重构..." : "生成专业简历卡片"}
            </button>
          </div>
        </div>

        {errorMsg && <div className="text-red-500 text-center mb-4">{errorMsg}</div>}

        {/* --- 简历展示区 --- */}
        {resume && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. 个人基本信息卡片 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-teal-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{resume.baseInfo.name}</h2>
                  <p className="text-teal-600 font-medium mt-1">{resume.baseInfo.jobTitle}</p >
                </div>
                {/* 模拟头像占位符 */}
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {resume.baseInfo.name[0]}
                </div>
              </div>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                “ {resume.baseInfo.summary} ”
              </p >
            </div>

            {/* 2. 核心竞争力/技能卡片 */}
            {resume.skills && resume.skills.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-teal-500 mr-3 rounded-full"></span>
                  专业技能
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-md text-sm font-medium border border-teal-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. 工作经历卡片 */}
            {resume.workExperience && resume.workExperience.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <span className="w-1 h-5 bg-teal-500 mr-3 rounded-full"></span>
                  工作经历
                </h3>
                <div className="space-y-8">
                  {resume.workExperience.map((job, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-slate-100 last:border-0">
                      {/* 时间轴小圆点 */}
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-teal-400 rounded-full"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-bold text-slate-800">{job.company}</h4>
                          <p className="text-sm text-slate-500 font-medium">{job.role}</p >
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{job.time}</span>
                      </div>
                      
                      {/* 经历描述列表 */}
                      <ul className="space-y-1.5 mt-3">
                        {job.desc.map((line, j) => (
                          <li key={j} className="text-sm text-slate-600 leading-relaxed flex items-start">
                            <span className="mr-2 text-teal-500 mt-[4px]">•</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 项目经历卡片 */}
            {resume.projectExperience && resume.projectExperience.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-teal-500 mr-3 rounded-full"></span>
                  项目经历
                </h3>
                <div className="grid gap-4">
                  {resume.projectExperience.map((project, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800">{project.name}</h4>
                        <span className="text-xs text-teal-600 border border-teal-200 px-2 py-0.5 rounded">{project.role}</span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                         {project.desc.map((line, j) => (
                            <p key={j}>{line}</p >
                         ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}