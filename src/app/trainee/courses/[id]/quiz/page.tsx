"use client";

import { use, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";

type QuizQuestion = { id: string; text: string; options: { id: string; text: string }[] };
type Quiz = { id: string; title: string; deadline: string | null; timeLimit: number; questions: QuizQuestion[] };
type QuizResult = { score: number; total: number; percentage: number; passed: boolean; questions: (QuizQuestion & { correctOptionId: string; userAnswer: string | null; isCorrect: boolean })[] };

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<{ title: string } | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch(`/api/courses/${id}`).then((response) => response.json()), fetch(`/api/courses/${id}/quiz`).then((response) => response.json())])
      .then(([courseData, quizData]) => {
        if (courseData.error) throw new Error(courseData.error);
        if (quizData.error) throw new Error(quizData.error);
        setCourse(courseData);
        setQuiz(quizData);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load quiz"))
      .finally(() => setLoading(false));
  }, [id]);

  async function submitQuiz() {
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) {
      setError("Answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    const response = await fetch(`/api/courses/${id}/quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not submit quiz");
    else setResult(data);
    setSubmitting(false);
  }

  if (loading) return <DashboardLayout><div className="card" style={{ padding: 48, textAlign: "center" }}>Loading quiz...</div></DashboardLayout>;
  if (error || !quiz) return <DashboardLayout><div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(0 72% 45%)" }}>{error || "Quiz not found"}</div></DashboardLayout>;

  if (result) return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}><div className="card" style={{ padding: "48px 40px" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>{result.passed ? "🎉" : "📚"}</div><h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>Quiz Completed!</h1><p style={{ color: "hsl(215 18% 38%)", marginBottom: 28 }}>{quiz.title}</p>
        <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 28px", background: result.passed ? "hsl(145 63% 92%)" : "hsl(0 72% 94%)", border: `4px solid ${result.passed ? "hsl(145 63% 40%)" : "hsl(0 72% 51%)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><div style={{ fontSize: "2rem", fontWeight: 900 }}>{result.percentage}%</div><div style={{ fontSize: "0.75rem", color: "hsl(215 16% 57%)" }}>{result.score}/{result.total} correct</div></div>
        <div style={{ textAlign: "left", marginBottom: 24 }}><h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 14 }}>Answer Review</h3>{result.questions.map((question, index) => <div key={question.id} style={{ padding: "12px 14px", borderRadius: 8, border: `1px solid ${question.isCorrect ? "hsl(145 63% 85%)" : "hsl(0 72% 88%)"}`, background: question.isCorrect ? "hsl(145 63% 97%)" : "hsl(0 72% 97%)", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>{question.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}<div><div style={{ fontSize: "0.82rem", fontWeight: 600 }}>Q{index + 1}: {question.text}</div>{!question.isCorrect && <div style={{ fontSize: "0.75rem", color: "hsl(145 63% 35%)", marginTop: 2 }}>Correct: {question.options.find((option) => option.id === question.correctOptionId)?.text}</div>}</div></div>)}</div>
        <Link href={`/trainee/courses/${id}/learn`} className="btn btn-outline" style={{ width: "100%" }}>Back to Course</Link>
      </div></div>
    </DashboardLayout>
  );

  const question = quiz.questions[currentQ];
  return <DashboardLayout>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}><Link href={`/trainee/courses/${id}/learn`} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link><div style={{ flex: 1 }}><h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{quiz.title}</h1><p style={{ fontSize: "0.8rem", color: "hsl(215 16% 57%)" }}>{course?.title}</p></div><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}><Clock size={15} /> {quiz.timeLimit} min</div></div>
    <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>{quiz.questions.map((item, index) => <button key={item.id} onClick={() => setCurrentQ(index)} style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${index === currentQ ? "hsl(215 84% 30%)" : answers[item.id] ? "hsl(145 63% 40%)" : "hsl(214 20% 88%)"}`, background: index === currentQ ? "hsl(215 84% 30%)" : answers[item.id] ? "hsl(145 63% 40%)" : "transparent", color: index === currentQ || answers[item.id] ? "white" : "hsl(215 18% 38%)", fontSize: "0.75rem", fontWeight: 700 }}>{index + 1}</button>)}<span style={{ marginLeft: 8, fontSize: "0.82rem", color: "hsl(215 16% 57%)", alignSelf: "center" }}>{Object.keys(answers).length}/{quiz.questions.length} answered</span></div>
    <div className="card" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><span className="badge badge-primary">Question {currentQ + 1} of {quiz.questions.length}</span><span style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>Server graded</span></div><h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{question.text}</h2><div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>{question.options.map((option) => <button key={option.id} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))} className={`quiz-option ${answers[question.id] === option.id ? "selected" : ""}`}>{option.text}</button>)}</div>{error && <p style={{ color: "hsl(0 72% 45%)", marginBottom: 16 }}>{error}</p>}<div style={{ display: "flex", justifyContent: "space-between" }}><button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn btn-outline"><ArrowLeft size={16} /> Previous</button>{currentQ < quiz.questions.length - 1 ? <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary">Next <ArrowRight size={16} /></button> : <button onClick={submitQuiz} disabled={submitting} className="btn btn-primary" style={{ background: "hsl(145 63% 40%)" }}><CheckCircle size={16} /> {submitting ? "Submitting..." : "Submit Quiz"}</button>}</div></div>
  </DashboardLayout>;
}
