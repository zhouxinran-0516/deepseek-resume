"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // AI面试官相关状态
  const [jobPosition, setJobPosition] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(-1);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState("");
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // 清洗 markdown
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

      const content = typeof data.result === 'string' 
        ? data.result 
        : JSON.stringify(data.result, null, 2); 

      const cleaned = cleanText(content);
      const split = cleaned.split("\n\n");
      setSections(split);

    } catch (error) {
      console.error(error);
      setSections(["请求失败，请检查网络或日志"]);
    }

    setLoading(false);
  };

  // 开始面试 - 生成面试问题
  const startInterview = async () => {
    if (!jobPosition.trim()) {
      alert("请输入目标岗位！");
      return;
    }
    
    setIsInterviewLoading(true);
    setInterviewQuestions([]);
    setInterviewFeedback("");
    setUserAnswer("");
    setSelectedQuestionIndex(-1);

    try {
      const response = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          jobPosition,
          resumeText: input
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("生成问题失败: " + (data.error || "请稍后重试"));
        return;
      }

      if (data.questions && Array.isArray(data.questions)) {
        setInterviewQuestions(data.questions);
        setInterviewStarted(true);
        if (data.questions.length > 0) {
          setSelectedQuestionIndex(0);
        }
      } else {
        alert("问题格式错误，请重试");
      }
    } catch (error) {
      console.error("生成面试问题失败:", error);
      alert("网络错误，请检查连接");
    } finally {
      setIsInterviewLoading(false);
    }
  };

  // 提交回答 - 获取AI反馈
  const submitAnswer = async () => {
    if (selectedQuestionIndex === -1) {
      alert("请先选择一个要回答的问题");
      return;
    }
    
    if (!userAnswer.trim()) {
      alert("请输入您的回答");
      return;
    }

    setIsFeedbackLoading(true);
    
    try {
      const response = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          jobPosition,
          question: interviewQuestions[selectedQuestionIndex],
          answer: userAnswer,
          resumeText: input
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("获取反馈失败: " + (data.error || "请稍后重试"));
        return;
      }

      setInterviewFeedback(data.feedback || "AI正在分析您的回答...");
    } catch (error) {
      console.error("获取反馈失败:", error);
      alert("网络错误，请检查连接");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // 选择下一个问题
  const nextQuestion = () => {
    if (interviewQuestions.length === 0) return;
    
    const nextIndex = (selectedQuestionIndex + 1) % interviewQuestions.length;
    setSelectedQuestionIndex(nextIndex);
    setUserAnswer("");
    setInterviewFeedback("");
  };

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
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

      <div style={{ 
        marginTop: 60, 
        padding: 30, 
        backgroundColor: "#f8fafc", 
        borderRadius: 20, 
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)" 
      }}>
        <h2 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#1e293b" }}>
          🤖 AI面试官
        </h2>
        <p style={{ color: "#64748b", marginBottom: 30, fontSize: 16 }}>
          根据目标岗位生成针对性面试问题，并提供回答反馈
        </p>

        <div style={{ 
          backgroundColor: "white", 
          padding: 20, 
          borderRadius: 12, 
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
        }}>
          <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="请输入目标岗位，如：C语言开发工程师、Java后端开发..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.3s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <button
              onClick={startInterview}
              disabled={isInterviewLoading}
              style={{
                padding: "12px 28px",
                backgroundColor: isInterviewLoading ? "#94a3b8" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "600",
                cursor: isInterviewLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {isInterviewLoading ? "生成中..." : "开始面试"}
              {!isInterviewLoading && "→"}
            </button>
          </div>
        </div>

        {isInterviewLoading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{
              width: 40,
              height: 40,
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}></div>
            <p style={{ color: "#64748b" }}>AI面试官正在生成面试问题...</p>
          </div>
        )}

        {interviewStarted && interviewQuestions.length > 0 && (
          <>
            <div style={{ 
              backgroundColor: "white", 
              padding: 25, 
              borderRadius: 12, 
              marginBottom: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid #f1f5f9" }}>
                <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#1e293b" }}>🎯 面试问题</h3>
                <span style={{ 
                  backgroundColor: "#e0f2fe", 
                  color: "#0369a1", 
                  padding: "6px 12px", 
                  borderRadius: 20, 
                  fontSize: 14, 
                  fontWeight: "600" 
                }}>
                  共 {interviewQuestions.length} 个问题
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                {interviewQuestions.map((question, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedQuestionIndex(index);
                      setUserAnswer("");
                      setInterviewFeedback("");
                    }}
                    style={{
                      padding: 15,
                      backgroundColor: selectedQuestionIndex === index ? "#dbeafe" : "#f8fafc",
                      borderLeft: "4px solid",
                      borderLeftColor: selectedQuestionIndex === index ? "#1d4ed8" : "#3b82f6",
                      borderRadius: "0 8px 8px 0",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        backgroundColor: selectedQuestionIndex === index ? "#1d4ed8" : "#3b82f6",
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: "bold"
                      }}>
                        {index + 1}
                      </div>
                      <p style={{ margin: 0, flex: 1, color: "#334155", lineHeight: 1.6 }}>
                        {question}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedQuestionIndex !== -1 && (
              <div style={{ 
                backgroundColor: "white", 
                padding: 25, 
                borderRadius: 12, 
                marginBottom: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)" 
              }}>
                <p style={{ fontWeight: "600", color: "#475569", marginBottom: 15 }}>
                  请回答第 {selectedQuestionIndex + 1} 个问题：
                </p>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="请在此输入您的回答...（建议包括具体案例、技术细节、解决方案等）"
                  style={{
                    width: "100%",
                    padding: 15,
                    border: "2px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 16,
                    fontFamily: "inherit",
                    marginBottom: 20,
                    resize: "vertical",
                    minHeight: 120,
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                
                <div style={{ display: "flex", gap: 15, justifyContent: "flex-end" }}>
                  <button
                    onClick={nextQuestion}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "white",
                      color: "#475569",
                      border: "2px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                  >
                    下一个问题 →
                  </button>
                  <button
                    onClick={submitAnswer}
                    disabled={isFeedbackLoading}
                    style={{
                      padding: "10px 24px",
                      backgroundColor: isFeedbackLoading ? "#94a3b8" : "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: "600",
                      cursor: isFeedbackLoading ? "not-allowed" : "pointer",
                      transition: "background-color 0.3s"
                    }}
                  >
                    {isFeedbackLoading ? "分析中..." : "提交回答"}
                  </button>
                </div>
              </div>
            )}

            {interviewFeedback && (
              <div style={{ 
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                padding: 25, 
                borderRadius: 12, 
                border: "1px solid #bae6fd"
              }}>
                <h4 style={{ color: "#0369a1", marginBottom: 15, fontSize: 18, fontWeight: "bold" }}>
                  💡 AI反馈与建议
                </h4>
                <div style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 8,
                  lineHeight: 1.6,
                  color: "#334155",
                  marginBottom: 20,
                  border: "1px solid #e2e8f0"
                }}>
                  {interviewFeedback}
                </div>
                <div style={{ display: "flex", gap: 15, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(interviewFeedback)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "white",
                      color: "#3b82f6",
                      border: "2px solid #3b82f6",
                      borderRadius: 6,
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    复制反馈
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}