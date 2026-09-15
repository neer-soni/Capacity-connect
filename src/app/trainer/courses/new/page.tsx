"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";
import Link from "next/link";

type LessonDraft = {
  title: string;
  description: string;
  type: "video" | "pdf" | "text";
  url: string;
  duration: string;
};

const emptyLesson = (): LessonDraft => ({ title: "", description: "", type: "video", url: "", duration: "" });

export default function NewCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Oceanography");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const payload = {
    title,
    description,
    department,
    level,
    duration,
    tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    lessons: lessons.map((lesson) => ({ ...lesson, duration: Number(lesson.duration) || 0 })),
  };

  async function save(action: "save" | "submit") {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      let response: Response;
      if (courseId) {
        response = await fetch(`/api/trainer/courses/${courseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, action }) });
      } else {
        response = await fetch("/api/trainer/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const created = await response.json();
        if (!response.ok) throw new Error(created.error || "Could not create course");
        setCourseId(created.id);
        response = await fetch(`/api/trainer/courses/${created.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, action }) });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save course");
      setCourseId(result.id);
      setMessage(action === "submit" ? "Course submitted for admin review." : "Draft saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save course");
    } finally {
      setSaving(false);
    }
  }

  function updateLesson(index: number, field: keyof LessonDraft, value: string) {
    setLessons((current) => current.map((lesson, lessonIndex) => lessonIndex === index ? { ...lesson, [field]: value } : lesson));
  }

  return (
    <DashboardLayout>
      <Link href="/trainer/courses" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "hsl(215 16% 57%)", fontSize: "0.85rem", textDecoration: "none", marginBottom: 20 }}><ArrowLeft size={14} /> Back to My Courses</Link>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Create New Course</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Build the course content, save a draft, and submit it for review.</p>
      <div className="card" style={{ padding: 32, maxWidth: 820 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div><label htmlFor="course-title" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Course Title *</label><input id="course-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Introduction to Oceanography" /></div>
          <div><label htmlFor="course-description" style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Description *</label><textarea id="course-description" className="input" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe what this course covers..." style={{ resize: "vertical" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Department<select className="input" value={department} onChange={(event) => setDepartment(event.target.value)} style={{ marginTop: 6 }}><option>Oceanography</option><option>Climate Science</option><option>Atmospheric Sciences</option><option>Seismology</option><option>Deep Sea Research</option></select></label><label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Level<select className="input" value={level} onChange={(event) => setLevel(event.target.value)} style={{ marginTop: 6 }}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Estimated Duration<input className="input" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="e.g. 8 weeks" style={{ marginTop: 6 }} /></label><label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Skill Tags<input className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Python, Data Analysis" style={{ marginTop: 6 }} /></label></div>
          <div style={{ borderTop: "1px solid hsl(214 20% 92%)", paddingTop: 22 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div><h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Lessons</h2><p style={{ color: "hsl(215 16% 57%)", fontSize: "0.8rem" }}>Add at least one lesson before submitting.</p></div><button type="button" className="btn btn-outline btn-sm" onClick={() => setLessons((current) => [...current, emptyLesson()])}><Plus size={14} /> Add Lesson</button></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{lessons.map((lesson, index) => <div key={index} style={{ background: "hsl(210 20% 97%)", borderRadius: 10, padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><strong style={{ fontSize: "0.88rem" }}>Lesson {index + 1}</strong>{lessons.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLessons((current) => current.filter((_, lessonIndex) => lessonIndex !== index))} aria-label={`Remove lesson ${index + 1}`}><Trash2 size={14} /></button>}</div><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}><input className="input" value={lesson.title} onChange={(event) => updateLesson(index, "title", event.target.value)} placeholder="Lesson title" /><select className="input" value={lesson.type} onChange={(event) => updateLesson(index, "type", event.target.value as LessonDraft["type"])}><option value="video">Video</option><option value="pdf">PDF</option><option value="text">Text</option></select></div><textarea className="input" rows={2} value={lesson.description} onChange={(event) => updateLesson(index, "description", event.target.value)} placeholder="Lesson description" style={{ resize: "vertical", marginBottom: 10 }} /><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}><input className="input" value={lesson.url} onChange={(event) => updateLesson(index, "url", event.target.value)} placeholder="Video or resource URL" /><input className="input" type="number" min="0" value={lesson.duration} onChange={(event) => updateLesson(index, "duration", event.target.value)} placeholder="Duration (sec)" /></div></div>)}</div>
          </div>
        </div>
        {error && <p style={{ color: "hsl(0 72% 45%)", marginTop: 18, fontSize: "0.85rem" }}>{error}</p>}
        {message && <p style={{ color: "hsl(145 63% 35%)", marginTop: 18, fontSize: "0.85rem" }}>{message}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 18, borderTop: "1px solid hsl(214 20% 92%)" }}><button type="button" className="btn btn-ghost" disabled={saving} onClick={() => save("save")}><Save size={14} /> {saving ? "Saving..." : "Save Draft"}</button><button type="button" className="btn btn-primary" disabled={saving} onClick={() => save("submit")}><Send size={14} /> Submit for Review</button></div>
      </div>
    </DashboardLayout>
  );
}
