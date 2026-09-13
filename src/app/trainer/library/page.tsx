"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Upload, FileText, Video, Image, Trash2, Download, Eye } from "lucide-react";

const mockLibrary = [
  { id: "l1", name: "Ocean Layers & Zones.mp4", type: "video", size: "245 MB", uploadedAt: "2024-08-12", downloads: 142 },
  { id: "l2", name: "Thermohaline Circulation.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2024-08-15", downloads: 89 },
  { id: "l3", name: "Marine Ecosystems Lecture.mp4", type: "video", size: "310 MB", uploadedAt: "2024-08-20", downloads: 67 },
  { id: "l4", name: "Atmospheric Layers Slides.pptx", type: "slide", size: "5.1 MB", uploadedAt: "2024-09-01", downloads: 215 },
  { id: "l5", name: "Monsoon Study Guide.pdf", type: "pdf", size: "8.7 MB", uploadedAt: "2024-09-05", downloads: 34 },
];

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video size={18} style={{ color: "hsl(215 84% 30%)" }} />,
  pdf: <FileText size={18} style={{ color: "hsl(0 72% 51%)" }} />,
  slide: <Image size={18} style={{ color: "hsl(38 80% 40%)" }} />,
};

export default function TrainerLibraryPage() {
  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Trainer Library</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Upload and manage your lectures, presentations and study materials</p>
        </div>
        <button className="btn btn-primary"><Upload size={16} /> Upload File</button>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ padding: "32px", marginBottom: 24, textAlign: "center", border: "2px dashed hsl(214 20% 85%)", background: "hsl(210 20% 99%)" }}>
        <Upload size={36} style={{ color: "hsl(215 16% 65%)", marginBottom: 12 }} />
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Drag and drop files to upload</h3>
        <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)", marginBottom: 14 }}>
          Supports MP4, PDF, PPTX, DOCX — Max 500 MB per file
        </p>
        <button className="btn btn-outline">Browse Files</button>
        <p style={{ fontSize: "0.75rem", color: "hsl(215 16% 65%)", marginTop: 10 }}>
          🎬 Videos auto-transcode for adaptive bitrate via Cloudinary · 📄 Documents served via UploadThing CDN
        </p>
      </div>

      {/* File list */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockLibrary.map((file, i) => (
                <tr key={file.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                      {typeIcons[file.type]}
                      {file.name}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${file.type === "video" ? "badge-primary" : file.type === "pdf" ? "badge-error" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                      {file.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: "hsl(215 16% 57%)" }}>{file.size}</td>
                  <td style={{ color: "hsl(215 16% 57%)" }}>
                    {new Date(file.uploadedAt).toLocaleDateString("en-IN")}
                  </td>
                  <td><span style={{ fontWeight: 600 }}>{file.downloads}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm"><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm"><Download size={14} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "hsl(0 72% 51%)" }}><Trash2 size={14} /></button>
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
