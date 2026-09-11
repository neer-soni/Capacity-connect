"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <DashboardLayout>
      <Link href="/trainer/courses" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "hsl(215 16% 57%)", fontSize: "0.85rem", textDecoration: "none", marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to My Courses
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Create New Course</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Fill in the details below. You can save as draft and publish later.</p>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {["Course Info", "Resources", "Quizzes", "Review"].map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i + 1)}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 8,
              background: step === i + 1 ? "hsl(215 84% 30%)" : step > i + 1 ? "hsl(145 63% 92%)" : "hsl(210 20% 96%)",
              color: step === i + 1 ? "white" : step > i + 1 ? "hsl(145 63% 35%)" : "hsl(215 16% 57%)",
              fontWeight: 600, fontSize: "0.82rem", border: "none", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="card animate-fade-in" style={{ padding: "32px", maxWidth: 720 }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Course Title *</label>
              <input className="input" placeholder="e.g. Introduction to Oceanography" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Description *</label>
              <textarea className="input" rows={4} placeholder="Describe what this course covers..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Department</label>
                <select className="input">
                  <option>Oceanography</option>
                  <option>Climate Science</option>
                  <option>Atmospheric Sciences</option>
                  <option>Seismology</option>
                  <option>Deep Sea Research</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Level</label>
                <select className="input">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Duration</label>
              <input className="input" placeholder="e.g. 8 weeks" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Skill Tags</label>
              <input className="input" placeholder="Comma-separated: Python, Data Analysis, GIS" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>Upload Resources</h3>
            <div style={{ border: "2px dashed hsl(214 20% 85%)", borderRadius: 12, padding: "40px 24px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📁</div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Drag and drop files here</p>
              <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)", marginBottom: 12 }}>Supports: MP4, PDF, PPTX, DOCX (max 500 MB per file)</p>
              <button className="btn btn-outline">Browse Files</button>
            </div>
            <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>
              📹 Videos will auto-transcode via Cloudinary for adaptive bitrate streaming.
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>Create Quiz / Assessment</h3>
            <div style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: "20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Question 1</h4>
                <button className="btn btn-ghost btn-sm" style={{ color: "hsl(0 72% 51%)" }}><Trash2 size={14} /></button>
              </div>
              <input className="input" placeholder="Enter your question..." style={{ marginBottom: 10 }} />
              {["A", "B", "C", "D"].map((opt) => (
                <div key={opt} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input type="radio" name="correct" />
                  <input className="input" placeholder={`Option ${opt}`} />
                </div>
              ))}
            </div>
            <button className="btn btn-outline" style={{ width: "100%" }}>
              <Plus size={16} /> Add Another Question
            </button>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Deadline</label>
              <input type="datetime-local" className="input" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Review & Publish</h3>
            <p style={{ color: "hsl(215 18% 38%)", marginBottom: 24, lineHeight: 1.6 }}>
              Review all details before submitting. Courses go to admin for validation before being published.
            </p>
            <div style={{ background: "hsl(38 95% 96%)", border: "1px solid hsl(38 95% 85%)", borderRadius: 10, padding: "14px 18px", textAlign: "left", marginBottom: 20 }}>
              <p style={{ fontSize: "0.82rem", color: "hsl(38 80% 35%)" }}>
                ℹ️ After submission, an admin will review and approve your course. You'll be notified once it's published.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px solid hsl(214 20% 92%)" }}>
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost"><Save size={14} /> Save Draft</button>
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="btn btn-primary">
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ background: "hsl(145 63% 40%)" }}>
                <Send size={14} /> Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
