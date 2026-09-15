"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

type AdminCourse = {
  id: string;
  title: string;
  thumbnail: string;
  level: string;
  department: string;
  status: string;
  lessons: { id: string }[];
  trainer: { name: string };
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    setLoading(true);
    const response = await fetch("/api/admin/courses");
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not load courses");
    else setCourses(data);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/courses")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!active) return;
        if (!ok) setError(data.error || "Could not load courses");
        else setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("Could not load courses");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    const rejectionReason = action === "reject" ? window.prompt("Reason for rejection:") || "Needs revision" : "";
    const response = await fetch(`/api/admin/courses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, rejectionReason }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not update course");
    else await loadCourses();
  }

  const pending = courses.filter((course) => course.status === "pending_review");
  const published = courses.filter((course) => course.status === "published");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Course Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review and approve trainer-submitted courses before they go live.</p>
      {error && <div className="card" style={{ padding: 14, color: "hsl(0 72% 45%)", marginBottom: 18 }}>{error}</div>}
      {loading ? <div className="card" style={{ padding: 48, textAlign: "center" }}>Loading courses...</div> : <>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}><Clock size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} /> Pending Review ({pending.length})</h2>
        {pending.length === 0 ? <div className="card" style={{ padding: 24, textAlign: "center", marginBottom: 28, color: "hsl(215 16% 57%)" }}>No courses pending review.</div> : <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>{pending.map((course) => <div key={course.id} className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "center" }}><div style={{ fontSize: "2rem", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 20% 96%)", borderRadius: 10 }}>{course.thumbnail}</div><div style={{ flex: 1 }}><div style={{ display: "flex", gap: 6, marginBottom: 4 }}><span className="badge badge-warning">Pending review</span><span className="badge badge-muted">{course.level}</span></div><h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>{course.title}</h3><p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>By {course.trainer.name} · {course.department} · {course.lessons.length} lessons</p></div><div style={{ display: "flex", gap: 8 }}><button className="btn btn-sm btn-ghost" onClick={() => window.open(`/courses/${course.id}`, "_blank")}><Eye size={14} /> Preview</button><button className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white" }} onClick={() => review(course.id, "approve")}><CheckCircle size={14} /> Approve</button><button className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white" }} onClick={() => review(course.id, "reject")}><XCircle size={14} /> Reject</button></div></div>)}</div>}
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}><CheckCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6, color: "hsl(145 63% 40%)" }} /> Published ({published.length})</h2>
        <div className="card" style={{ overflow: "hidden" }}><div className="table-container"><table><thead><tr><th>Course</th><th>Trainer</th><th>Department</th><th>Lessons</th><th>Status</th><th>Actions</th></tr></thead><tbody>{published.map((course) => <tr key={course.id}><td style={{ fontWeight: 600 }}>{course.thumbnail} {course.title}</td><td>{course.trainer.name}</td><td>{course.department}</td><td>{course.lessons.length}</td><td><span className="badge badge-success">Published</span></td><td><button className="btn btn-ghost btn-sm" onClick={() => window.open(`/courses/${course.id}`, "_blank")}><Eye size={13} /> View</button></td></tr>)}</tbody></table></div></div>
      </>}
    </DashboardLayout>
  );
}
