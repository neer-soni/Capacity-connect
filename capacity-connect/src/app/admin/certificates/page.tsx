"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Award, CheckCircle, XCircle, Eye, Download, QrCode } from "lucide-react";

const pendingCerts = [
  { id: "pc1", user: "Amit Verma", course: "Introduction to Oceanography", score: "82%", issuedAt: "2024-09-10", hash: "CC2024-B4E1-9C3D" },
  { id: "pc2", user: "Sneha Patel", course: "Atmospheric Sciences Fundamentals", score: "91%", issuedAt: "2024-09-10", hash: "CC2024-F7A3-2D8B" },
  { id: "pc3", user: "Rahul Desai", course: "Climate Change & Earth Systems", score: "76%", issuedAt: "2024-09-11", hash: "CC2024-D2C5-1A7E" },
];

const validatedCerts = [
  { id: "vc1", user: "Priya Sharma", course: "Climate Change & Earth Systems", score: "88%", issuedAt: "2024-08-15", hash: "CC2024-A7F2-3B9E", validatedAt: "2024-08-16" },
];

export default function AdminCertificatesPage() {
  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Certificate Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review and validate issued certificates before they become official</p>

      {/* Pending */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>⏳ Pending Validation ({pendingCerts.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {pendingCerts.map((cert, i) => (
          <div key={cert.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "center", animationDelay: `${i * 0.05}s` }}>
            <div style={{ width: 50, height: 50, borderRadius: 10, background: "hsl(38 95% 94%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{cert.user}</div>
              <div style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                {cert.course} · Score: {cert.score} · Hash: <code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{cert.hash}</code>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" style={{ background: "hsl(145 63% 40%)", color: "white" }}><CheckCircle size={14} /> Validate</button>
              <button className="btn btn-sm" style={{ background: "hsl(0 72% 51%)", color: "white" }}><XCircle size={14} /> Reject</button>
            </div>
          </div>
        ))}
      </div>

      {/* Validated */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>✅ Validated Certificates ({validatedCerts.length})</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead><tr><th>User</th><th>Course</th><th>Score</th><th>Issued</th><th>Validated</th><th>Hash</th><th>Actions</th></tr></thead>
            <tbody>
              {validatedCerts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.user}</td>
                  <td>{c.course}</td>
                  <td style={{ fontWeight: 600, color: "hsl(145 63% 35%)" }}>{c.score}</td>
                  <td style={{ fontSize: "0.82rem" }}>{new Date(c.issuedAt).toLocaleDateString("en-IN")}</td>
                  <td style={{ fontSize: "0.82rem" }}>{new Date(c.validatedAt).toLocaleDateString("en-IN")}</td>
                  <td><code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{c.hash}</code></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm"><Eye size={13} /></button>
                      <button className="btn btn-ghost btn-sm"><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
