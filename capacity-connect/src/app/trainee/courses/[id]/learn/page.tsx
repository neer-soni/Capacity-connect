"use client";
import { use, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  FileText,
  Video,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Download,
  ArrowLeft,
  Award,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeResource, setActiveResource] = useState(0);
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Course not found");
        return r.json();
      })
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading course:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>⏳</div>
          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.95rem" }}>
            Loading course classroom & materials...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>
            Course Not Found
          </h2>
          <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.9rem", marginBottom: 24 }}>
            The requested course could not be loaded from the MoES database.
          </p>
          <Link href="/trainee/courses" className="btn btn-primary">
            Back to My Courses
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const defaultResources = [
    { id: "res-1", type: "video", title: "Module 1: Scientific Foundations & MoES Mission", duration: "18 min" },
    { id: "res-2", type: "pdf", title: "Course Handbook & Standard Operating Procedures", size: "2.4 MB" },
    { id: "res-3", type: "video", title: "Module 2: Observational Methodologies & Field Sensors", duration: "32 min" },
    { id: "res-4", type: "slide", title: "Lecture Presentation Slides (PDF)", size: "4.2 MB" },
    { id: "res-5", type: "video", title: "Module 3: Numerical Modeling & Data Assimilation", duration: "27 min" },
  ];

  const resources =
    course.resources && course.resources.length > 0
      ? course.resources
      : defaultResources;

  const current = resources[activeResource] || resources[0];

  const toggleComplete = (resId: string) => {
    setCompletedIds((prev) => ({
      ...prev,
      [resId]: !prev[resId],
    }));
  };

  const completedCount = Object.values(completedIds).filter(Boolean).length;
  const progressPercent = Math.min(
    100,
    Math.max(15, Math.round((completedCount / resources.length) * 100))
  );

  return (
    <DashboardLayout>
      {/* Back button */}
      <Link
        href="/trainee/courses"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "hsl(215 16% 57%)",
          fontSize: "0.85rem",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        <ArrowLeft size={14} /> Back to My Courses
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="badge badge-primary" style={{ fontSize: "0.72rem" }}>
            {course.department || "MoES"}
          </span>
          <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
            {course.level || "Intermediate"}
          </span>
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>
          {course.title}
        </h1>
        <p style={{ color: "hsl(215 16% 57%)", fontSize: "0.85rem" }}>
          Taught by {course.trainer || "MoES Faculty"} · {course.duration || "Self-paced"}
        </p>
      </div>

      {/* Classroom layout */}
      <div className="grid-2fr-1fr">
        {/* Main lesson content */}
        <div>
          {current.type === "video" ? (
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "hsl(215 30% 12%)",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                marginBottom: 16,
                padding: "24px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {isPlaying ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎥</div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>
                    Now Playing: {current.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "hsl(178 68% 45%)", marginBottom: 16 }}>
                    High-Definition Video Stream · Active
                  </div>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      toggleComplete(current.id);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Check size={14} /> Mark Lesson as Completed
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>🎬</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 6 }}>
                    {current.title}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.75, marginBottom: 20 }}>
                    Duration: {current.duration || "20 min"}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                      onClick={() => {
                        setIsPlaying(true);
                        toggleComplete(current.id);
                      }}
                      className="btn btn-primary"
                    >
                      <PlayCircle size={18} /> Play Video Lesson
                    </button>
                    <button
                      onClick={() => toggleComplete(current.id)}
                      className="btn btn-ghost"
                      style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
                    >
                      {completedIds[current.id] ? "Completed ✓" : "Mark Complete"}
                    </button>
                  </div>
                </>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  fontSize: "0.72rem",
                  opacity: 0.5,
                }}
              >
                MoES E-Learning Classroom · Adaptive Bitrate Streaming
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 12,
                background: "white",
                border: "1px solid hsl(214 20% 88%)",
                aspectRatio: "16/9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>
                {current.type === "pdf" ? "📄" : "📊"}
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 6 }}>
                {current.title}
              </div>
              <div style={{ fontSize: "0.85rem", color: "hsl(215 16% 57%)", marginBottom: 20 }}>
                Document File · {current.size || "3.2 MB"}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleComplete(current.id);
                    alert("Downloaded official course resource: " + current.title);
                  }}
                  className="btn btn-primary"
                >
                  <Download size={16} /> Download Document
                </a>
                <button
                  onClick={() => toggleComplete(current.id)}
                  className="btn btn-outline"
                >
                  {completedIds[current.id] ? "Completed ✓" : "Mark as Read"}
                </button>
              </div>
            </div>
          )}

          {/* Course Progress Tracking */}
          <div className="card" style={{ padding: "18px 20px", marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} style={{ color: "hsl(38 95% 55%)" }} />
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>Course Progress</span>
              </div>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "hsl(215 84% 30%)",
                  fontWeight: 800,
                }}
              >
                {progressPercent}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "hsl(215 16% 57%)",
                marginTop: 8,
              }}
            >
              {completedCount} of {resources.length} lessons completed
            </div>
          </div>

          {/* Quick Actions (Quiz & Forum) */}
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              href={`/trainee/courses/${id}/quiz`}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: "center", gap: 8 }}
            >
              <Award size={16} /> Take Certification Quiz
            </Link>
            <Link
              href={`/trainee/courses/${id}/forum`}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: "center", gap: 8 }}
            >
              <MessageSquare size={16} /> Course Discussion Forum
            </Link>
          </div>
        </div>

        {/* Resource List / Syllabus Sidebar */}
        <div className="card" style={{ padding: "18px", height: "fit-content" }}>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: 14 }}>
            Course Curriculum & Materials
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {resources.map((r: any, i: number) => {
              const isSelected = i === activeResource;
              const isDone = completedIds[r.id] || i === 0;

              return (
                <button
                  key={r.id || i}
                  onClick={() => {
                    setActiveResource(i);
                    setIsPlaying(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: isSelected ? "hsl(215 84% 96%)" : "transparent",
                    border: isSelected
                      ? "1px solid hsl(215 84% 85%)"
                      : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      color:
                        r.type === "video"
                          ? "hsl(215 84% 30%)"
                          : r.type === "pdf"
                          ? "hsl(0 72% 51%)"
                          : "hsl(38 80% 40%)",
                      flexShrink: 0,
                    }}
                  >
                    {r.type === "video" ? (
                      <PlayCircle size={18} />
                    ) : r.type === "pdf" ? (
                      <FileText size={18} />
                    ) : (
                      <BookOpen size={18} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: isSelected ? 700 : 500,
                        color: "hsl(215 30% 12%)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "hsl(215 16% 57%)" }}>
                      {r.duration || r.size || "Resource"}
                    </div>
                  </div>
                  {isDone && (
                    <CheckCircle
                      size={15}
                      style={{ color: "hsl(145 63% 40%)", flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
