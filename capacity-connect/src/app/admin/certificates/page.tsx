"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Award, CheckCircle, XCircle, Eye, Clock } from "lucide-react";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadCerts = async () => {
    const res = await fetch("/api/admin/certificates");
    const data = await res.json();
    setCerts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadCerts(); }, []);

  const handleAction = async (id: string, action: "validate" | "reject") => {
    setProcessingId(id);
    await fetch(`/api/admin/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setProcessingId(null);
    await loadCerts();
  };

  const pending = certs.filter((c) => !c.validatedByAdmin);
  const validated = certs.filter((c) => c.validatedByAdmin);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: 60, color: "hsl(215 16% 57%)" }}>Loading certificates data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6 }}>Certificate Validation</h1>
      <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem", marginBottom: 28 }}>Review and validate issued certificates before they become official</p>

      {/* Pending */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
        <Clock size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6 }} />
        Pending Validation ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: "24px", textAlign: "center", marginBottom: 28, color: "hsl(215 16% 57%)" }}>
          ✓ No certificates pending validation
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {pending.map((c) => (
            <div key={c.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: 10, background: "hsl(38 95% 94%)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(38 80% 35%)" }}><Award size={24} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{c.user}</div>
                <div style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)" }}>
                  {c.course} · {c.email} · {c.department} · Issued {new Date(c.issuedAt).toLocaleDateString("en-IN")}
                </div>
                <div style={{ marginTop: 4 }}>
                  Hash: <code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{c.hash}</code>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm" disabled={processingId === c.id} onClick={() => handleAction(c.id, "validate")} style={{ background: "hsl(145 63% 40%)", color: "white" }}><CheckCircle size={14} /> Validate</button>
                <button className="btn btn-sm" disabled={processingId === c.id} onClick={() => handleAction(c.id, "reject")} style={{ background: "hsl(0 72% 51%)", color: "white" }}><XCircle size={14} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validated */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>
        <CheckCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 6, color: "hsl(145 63% 40%)" }} />
        Validated Certificates ({validated.length})
      </h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead><tr><th>User</th><th>Course</th><th>Department</th><th>Issued</th><th>Hash</th><th>Actions</th></tr></thead>
            <tbody>
              {validated.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.user}<div style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)" }}>{c.email}</div></td>
                  <td>{c.course}</td>
                  <td>{c.department}</td>
                  <td style={{ fontSize: "0.82rem" }}>{new Date(c.issuedAt).toLocaleDateString("en-IN")}</td>
                  <td><code style={{ fontSize: "0.75rem", background: "hsl(215 84% 96%)", padding: "2px 6px", borderRadius: 3 }}>{c.hash}</code></td>
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