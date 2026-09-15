"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertTriangle, CheckCircle, Trash2 } from "lucide-react";

type Report = {
  id: string;
  contentType: string;
  reason: string;
  status: string;
  reportedBy: string;
  courseContext: string;
  resolvedAction: string;
  createdAt: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/reports")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!active) return;
        if (ok) setReports(data);
        else setError(data.error || "Could not load reports");
      })
      .catch(() => { if (active) setError("Could not load reports"); });
    return () => { active = false; };
  }, []);

  async function resolve(reportId: string, action: "dismiss" | "remove") {
    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Could not resolve report");
    else setReports((current) => current.map((report) => report.id === reportId ? data : report));
  }

  const pending = reports.filter((report) => report.status === "pending");
  const resolved = reports.filter((report) => report.status !== "pending");

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Moderation Queue</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review flagged forum content from the database.</p>
      {error && <div className="card" style={{ padding: 14, color: "hsl(0 72% 45%)", marginBottom: 18 }}>{error}</div>}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}><AlertTriangle size={16} /> Pending Reports ({pending.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {pending.map((report) => (
          <div key={report.id} className="card" style={{ padding: 20, borderLeft: "3px solid hsl(38 95% 55%)" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <AlertTriangle size={22} style={{ color: "hsl(38 80% 40%)" }} />
              <div style={{ flex: 1 }}><div style={{ display: "flex", gap: 8, marginBottom: 6 }}><span className="badge badge-warning">Pending</span><span className="badge badge-muted">{report.contentType.replace("_", " ")}</span><span className="badge badge-error">{report.reason}</span></div><p style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)" }}>Reported by {report.reportedBy} · {report.courseContext || "Course discussion"}</p><p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>{new Date(report.createdAt).toLocaleDateString("en-IN")}</p></div>
              <div style={{ display: "flex", gap: 8 }}><button className="btn btn-sm btn-outline" onClick={() => resolve(report.id, "dismiss")}><CheckCircle size={13} /> Dismiss</button><button className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white" }} onClick={() => resolve(report.id, "remove")}><Trash2 size={13} /> Remove</button></div>
            </div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}><CheckCircle size={16} /> Resolved ({resolved.length})</h2>
      <div className="card" style={{ overflow: "hidden" }}><div className="table-container"><table><thead><tr><th>Type</th><th>Reason</th><th>Status</th><th>Action</th><th>Date</th></tr></thead><tbody>{resolved.map((report) => <tr key={report.id}><td>{report.contentType.replace("_", " ")}</td><td>{report.reason}</td><td><span className="badge badge-success">{report.status}</span></td><td>{report.resolvedAction}</td><td>{new Date(report.createdAt).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div></div>
    </DashboardLayout>
  );
}
