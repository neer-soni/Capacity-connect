"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockQuiz, mockCourses } from "@/lib/mock-data";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => setCourse(data))
      .catch(() => {});
  }, [id]);

  const quiz = mockQuiz;
  const totalQ = quiz.questions.length;

  const score = submitted
    ? quiz.questions.filter((q) => answers[q.id] === q.correctOption).length
    : 0;
  const percentage = submitted ? Math.round((score / totalQ) * 100) : 0;

  const handleSelect = (questionId: string, optionId: string) => {
    if (!submitted) setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div
            className="card animate-fade-in"
            style={{ padding: "48px 40px" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>
              {percentage >= 60 ? "🎉" : "📚"}
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>
              Quiz Completed!
            </h1>
            <p style={{ color: "hsl(215 18% 38%)", marginBottom: 28 }}>{quiz.title}</p>

            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                margin: "0 auto 28px",
                background: percentage >= 60 ? "hsl(145 63% 92%)" : "hsl(0 72% 94%)",
                border: `4px solid ${percentage >= 60 ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 900, color: percentage >= 60 ? "hsl(145 63% 30%)" : "hsl(0 72% 40%)" }}>
                {percentage}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{score}/{totalQ} correct</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Score", value: `${score}/${totalQ}`, color: "hsl(215 84% 30%)" },
                { label: "Percentage", value: `${percentage}%`, color: percentage >= 60 ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
                { label: "Status", value: percentage >= 60 ? "Passed ✓" : "Failed ✗", color: percentage >= 60 ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
              ].map((s) => (
                <div key={s.label} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: "14px" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Review answers */}
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 14 }}>Answer Review</h3>
              {quiz.questions.map((q, i) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOption;
                return (
                  <div key={q.id} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${isCorrect ? "hsl(145 63% 85%)" : "hsl(0 72% 88%)"}`, background: isCorrect ? "hsl(145 63% 97%)" : "hsl(0 72% 97%)", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {isCorrect ? <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)", flexShrink: 0, marginTop: 2 }} /> : <XCircle size={16} style={{ color: "hsl(0 72% 51%)", flexShrink: 0, marginTop: 2 }} />}
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>Q{i + 1}: {q.text.slice(0, 50)}...</div>
                      {!isCorrect && (
                        <div style={{ fontSize: "0.75rem", color: "hsl(145 63% 35%)", marginTop: 2 }}>
                          ✓ Correct: {q.options.find((o) => o.id === q.correctOption)?.text.slice(0, 50)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline" style={{ flex: 1 }}>
                Back to Course
              </Link>
              {percentage >= 60 && (
                <Link href="/trainee/certificates" className="btn btn-primary" style={{ flex: 1 }}>
                  View Certificate 🏆
                </Link>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const q = quiz.questions[currentQ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainee/courses/${id}/learn`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{quiz.title}</h1>
          <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>{course?.title}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "hsl(0 72% 51%)", fontSize: "0.85rem", fontWeight: 600 }}>
          <Clock size={15} />
          Deadline: Oct 1, 2024
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: `2px solid ${i === currentQ ? "hsl(215 84% 30%)" : answers[quiz.questions[i].id] ? "hsl(145 63% 40%)" : "hsl(214 20% 88%)"}`,
              background: i === currentQ ? "hsl(215 84% 30%)" : answers[quiz.questions[i].id] ? "hsl(145 63% 40%)" : "transparent",
              color: i === currentQ || answers[quiz.questions[i].id] ? "white" : "hsl(215 18% 38%)",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {i + 1}
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: "0.82rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>
          {Object.keys(answers).length}/{totalQ} answered
        </span>
      </div>

      {/* Question card */}
      <div className="card animate-fade-in" style={{ padding: "32px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="badge badge-primary">Question {currentQ + 1} of {totalQ}</span>
          <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>30 min time limit</span>
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>
          {q.text}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(q.id, opt.id)}
              className={`quiz-option ${answers[q.id] === opt.id ? "selected" : ""}`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn btn-outline"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="btn btn-primary"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="btn btn-primary"
              style={{ background: "hsl(145 63% 40%)" }}
            >
              <CheckCircle size={16} /> Submit Quiz
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
