"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockAnnouncements } from "@/lib/mock-data";
import { Plus, Edit, Trash2, Eye, Send, Save, Megaphone } from "lucide-react";

export default function AdminHomepagePage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Homepage Publisher</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Publish notifications, announcements, achievements and news to the public homepage</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ padding: "28px", marginBottom: 24 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}>
            <Megaphone size={18} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 8 }} />
            Create New Homepage Post
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Title *</label>
                <input className="input" placeholder="e.g. New Course: Deep Sea Exploration" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Type</label>
                <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="announcement">📢 Announcement</option>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="notification">🔧 Notification</option>
                  <option value="new_content">📚 New Content</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>Content *</label>
              <textarea className="input" rows={4} placeholder="Write your announcement here..." value={body} onChange={(e) => setBody(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-outline"><Save size={14} /> Save Draft</button>
              <button className="btn btn-primary"><Send size={14} /> Publish to Homepage</button>
            </div>
          </div>
        </div>
      )}

      {/* Existing posts */}
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Published Posts ({mockAnnouncements.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mockAnnouncements.map((a, i) => (
          <div key={a.id} className="card animate-fade-in" style={{ padding: "20px", display: "flex", gap: 16, alignItems: "flex-start", animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: "2rem", flexShrink: 0 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span className={`badge ${a.type === "achievement" ? "badge-warning" : a.type === "announcement" ? "badge-primary" : "badge-muted"}`} style={{ fontSize: "0.7rem" }}>
                  {a.type}
                </span>
                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Published</span>
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>{a.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)", lineHeight: 1.6 }}>{a.body}</p>
              <p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 8 }}>
                Published: {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm"><Edit size={13} /> Edit</button>
              <button className="btn btn-ghost btn-sm"><Eye size={13} /> Preview</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "hsl(0 72% 51%)" }}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
