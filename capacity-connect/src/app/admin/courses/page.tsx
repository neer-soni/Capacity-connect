"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  const pending = courses.filter((c) => c.status === "pending_review");
  const published = courses.filter((c) => c.status === "published");

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: 60, color: "hsl(215 16% 57%)" }}>Loading courses data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Course Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review and approve trainer-submitted courses before they go live</p>

      {/* Pending */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
        <Clock size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} />
        Pending Review ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center", marginBottom: 28, color: "hsl(215 16% 57%)" }}>
          ✓ No courses pending review
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {pending.map((c) => (
            <div key={c.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: "2rem", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 20% 96%)", borderRadius: 10 }}>{c.thumbnail}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Pending</span>
                  <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>{c.level}</span>
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4 }}>{c.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>By {c.trainer} · {c.department} · {c.totalLessons} lessons · {c.duration}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-ghost"><Eye size={14} /> Preview</button>
                <button className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white" }}><CheckCircle size={14} /> Approve</button>
                <button className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white" }}><XCircle size={14} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Published */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
        <CheckCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6, color: "hsl(145 63% 40%)" }} />
        Published ({published.length})
      </h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead><tr><th>Course</th><th>Trainer</th><th>Department</th><th>Enrolled</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {published.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.thumbnail} {c.title}</td>
                  <td>{c.trainer}</td>
                  <td>{c.department}</td>
                  <td>{c.enrolledCount}</td>
                  <td style={{ fontWeight: 600, color: "hsl(38 80% 35%)" }}>⭐ {c.rating}</td>
                  <td><button className="btn btn-ghost btn-sm"><Eye size={13} /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
