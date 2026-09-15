"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, Send, Megaphone } from "lucide-react";

type Announcement = { id: string; title: string; body: string; type: string; icon: string; createdAt: string };

export default function AdminHomepagePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/announcements")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!active) return;
        if (ok) setAnnouncements(Array.isArray(data) ? data : []);
        else setError(data.error || "Could not load announcements");
      })
      .catch(() => { if (active) setError("Could not load announcements"); });
    return () => { active = false; };
  }, []);

  async function publish() {
    const response = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, body, type }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Could not publish announcement"); return; }
    setAnnouncements((current) => [data, ...current]);
    setTitle(""); setBody(""); setShowForm(false); setError("");
  }

  async function remove(id: string) {
    const response = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
    else setError("Could not delete announcement");
  }

  return <DashboardLayout>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}><div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Homepage Publisher</h1><p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Publish announcements and updates to the public homepage.</p></div><button onClick={() => setShowForm((value) => !value)} className="btn btn-primary"><Plus size={16} /> New Post</button></div>
    {error && <div className="card" style={{ padding: 14, marginBottom: 18, color: "hsl(0 72% 45%)" }}>{error}</div>}
    {showForm && <div className="card" style={{ padding: 28, marginBottom: 24 }}><h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 18 }}><Megaphone size={18} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: 8 }} />Create New Homepage Post</h3><div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}><input className="input" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} /><select className="input" value={type} onChange={(event) => setType(event.target.value)}><option value="announcement">Announcement</option><option value="achievement">Achievement</option><option value="notification">Notification</option><option value="new_content">New Content</option></select></div><textarea className="input" rows={4} placeholder="Write your announcement here..." value={body} onChange={(event) => setBody(event.target.value)} style={{ resize: "vertical" }} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={publish}><Send size={14} /> Publish</button></div></div></div>}
    <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Published Posts ({announcements.length})</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{announcements.map((announcement) => <div key={announcement.id} className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}><div style={{ fontSize: "2rem" }}>{announcement.icon}</div><div style={{ flex: 1 }}><div style={{ display: "flex", gap: 8, marginBottom: 6 }}><span className="badge badge-primary">{announcement.type}</span><span className="badge badge-success">Published</span></div><h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 6 }}>{announcement.title}</h3><p style={{ fontSize: "0.85rem", color: "hsl(215 18% 38%)", lineHeight: 1.6 }}>{announcement.body}</p><p style={{ fontSize: "0.78rem", color: "hsl(215 16% 57%)", marginTop: 8 }}>Published: {new Date(announcement.createdAt).toLocaleDateString("en-IN")}</p></div><button className="btn btn-ghost btn-sm" style={{ color: "hsl(0 72% 51%)" }} onClick={() => remove(announcement.id)} aria-label={`Delete ${announcement.title}`}><Trash2 size={13} /></button></div>)}</div>
    {announcements.length === 0 && <div className="card" style={{ padding: 48, textAlign: "center", color: "hsl(215 16% 57%)" }}>No announcements published yet.</div>}
  </DashboardLayout>;
}
