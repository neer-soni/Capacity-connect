"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  text: string;
  marks: number;
  options: { id: string; text: string }[];
}

interface QuizAttempt {
  id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

interface QuizData {
  id: string;
  title: string;
  deadline: string | null;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
}

interface ReviewQuestion {
  id: string;
  text: string;
  marks: number;
  correctOptionId: string | null;
  userAnswer: string | null;
  isCorrect: boolean;
  options: { id: string; text: string }[];
}

interface QuizResult {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  submittedAt: string;
  questions: ReviewQuestion[];
  courseProgress: number;
}

function formatDeadline(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${id}/quiz`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load quiz");
        return data as QuizData;
      })
      .then(setQuiz)
      .catch((e) => setError(e.message));
  }, [id]);

  const answered = Object.keys(answers).length;
  const total = quiz?.questions.length ?? 0;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/courses/${id}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setResult(data as QuizResult);
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
          <div className="card" style={{ padding: 40 }}>
            <p style={{ color: "hsl(0 72% 51%)", fontWeight: 600, marginBottom: 16 }}>{error}</p>
            <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Course
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            <p style={{ color: "hsl(215 16% 57%)" }}>Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (result) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div className="card animate-fade-in" style={{ padding: "48px 40px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>
              {result.passed ? "🎉" : "📚"}
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>Quiz Completed!</h1>
            <p style={{ color: "hsl(215 18% 38%)", marginBottom: 28 }}>{quiz.title}</p>

            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                margin: "0 auto 28px",
                background: result.passed ? "hsl(145 63% 92%)" : "hsl(0 72% 94%)",
                border: `4px solid ${result.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)"}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 900, color: result.passed ? "hsl(145 63% 30%)" : "hsl(0 72% 40%)" }}>
                {result.percentage}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{result.score}/{result.total}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Score", value: `${result.score}/${result.total}`, color: "hsl(215 84% 30%)" },
                { label: "Percentage", value: `${result.percentage}%`, color: result.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
                { label: "Status", value: result.passed ? "Passed" : "Failed", color: result.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
              ].map((s) => (
                <div key={s.label} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 14 }}>Answer Review</h3>
              {result.questions.map((q, i) => (
                <div
                  key={q.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: `1px solid ${q.isCorrect ? "hsl(145 63% 85%)" : "hsl(0 72% 88%)"}`,
                    background: q.isCorrect ? "hsl(145 63% 97%)" : "hsl(0 72% 97%)",
                    marginBottom: 8,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  {q.isCorrect ? (
                    <CheckCircle size={16} style={{ color: "hsl(145 63% 40%)", flexShrink: 0, marginTop: 2 }} />
                  ) : (
                    <XCircle size={16} style={{ color: "hsl(0 72% 51%)", flexShrink: 0, marginTop: 2 }} />
                  )}
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Q{i + 1}: {q.text.length > 60 ? q.text.slice(0, 60) + "..." : q.text}
                    </div>
                    {!q.isCorrect && (
                      <div style={{ fontSize: "0.75rem", color: "hsl(145 63% 35%)", marginTop: 2 }}>
                        Correct: {q.options.find((o) => o.id === q.correctOptionId)?.text ?? "N/A"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline" style={{ flex: 1 }}>
                Back to Course
              </Link>
              {result.passed && (
                <Link href="/trainee/certificates" className="btn btn-primary" style={{ flex: 1 }}>
                  View Certificate
                </Link>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const hasAttempts = quiz.attempts.length > 0;
  if (hasAttempts) {
    const latest = quiz.attempts[0];
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
          <div className="card animate-fade-in" style={{ padding: 40 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>{latest.passed ? "🎉" : "📚"}</div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>Previous Attempt</h1>
            <p style={{ color: "hsl(215 18% 38%)", marginBottom: 24 }}>{quiz.title}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Score", value: `${latest.score}/${latest.total}`, color: "hsl(215 84% 30%)" },
                { label: "Percentage", value: `${latest.percentage}%`, color: latest.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
                { label: "Status", value: latest.passed ? "Passed" : "Failed", color: latest.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)" },
              ].map((s) => (
                <div key={s.label} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)", marginBottom: 20 }}>
              You scored {latest.percentage}%. Pass mark is {quiz.passingScore}%.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline" style={{ flex: 1 }}>
                Back to Course
              </Link>
              <button onClick={() => {}} className="btn btn-primary" style={{ flex: 1 }}>
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const q = quiz.questions[currentQ];
  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href={`/trainee/courses/${id}/learn`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{quiz.title}</h1>
          {quiz.deadline && (
            <p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>
              Due: {formatDeadline(quiz.deadline)}
            </p>
          )}
        </div>
        {quiz.timeLimit > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "hsl(0 72% 51%)", fontSize: "0.85rem", fontWeight: 600 }}>
            <Clock size={15} />
            {quiz.timeLimit} min
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
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
            }}
          >
            {i + 1}
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: "0.82rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>
          {answered}/{total} answered
        </span>
      </div>

      <div className="card animate-fade-in" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span className="badge badge-primary">Question {currentQ + 1} of {total}</span>
          {q.marks > 0 && (
            <span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>{`${q.marks} ${q.marks === 1 ? "mark" : "marks"}`}</span>
          )}
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

        {submitError && (
          <p style={{ color: "hsl(0 72% 51%)", fontSize: "0.82rem", marginBottom: 16 }}>{submitError}</p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn btn-outline"
          >
            <ArrowLeft size={16} /> Previous
          </button>
          {currentQ < total - 1 ? (
            <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || answered < total}
              className="btn btn-primary"
              style={{ background: "hsl(145 63% 40%)" }}
            >
              <CheckCircle size={16} /> {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
