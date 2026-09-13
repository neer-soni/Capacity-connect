"use client";
import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Upload, FileText, Video, Image, Download, Eye, Loader2 } from "lucide-react";

type Resource = {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
  course: { id: string; title: string };
  createdAt?: string;
};

type Course = { id: string; title: string; status: string };

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video size={18} style={{ color: "hsl(215 84% 30%)" }} />,
  pdf: <FileText size={18} style={{ color: "hsl(0 72% 51%)" }} />,
  slide: <Image size={18} style={{ color: "hsl(38 80% 40%)" }} />,
};

export default function TrainerLibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadLibrary = async () => {
    const [resourcesResponse, coursesResponse] = await Promise.all([
      fetch("/api/trainer/resources"),
      fetch("/api/trainer/courses"),
    ]);
    if (resourcesResponse.ok) setResources(await resourcesResponse.json());
    if (coursesResponse.ok) {
      const nextCourses = await coursesResponse.json();
      setCourses(nextCourses);
      setCourseId((current) => current || nextCourses[0]?.id || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const uploadFile = async (file?: File) => {
    if (!file || !courseId) {
      setMessage("Select a course before uploading a file.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("courseId", courseId);
    const response = await fetch("/api/trainer/resources", { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Upload failed.");
    } else {
      setMessage("File uploaded successfully.");
      await loadLibrary();
    }
    setUploading(false);
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Trainer Library</h1>
          <p style={{ color: "hsl(215 18% 38%)", fontSize: "0.9rem" }}>Upload and manage your lectures, presentations and study materials</p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />} Upload File
        </button>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ padding: "32px", marginBottom: 24, textAlign: "center", border: "2px dashed hsl(214 20% 85%)", background: "hsl(210 20% 99%)" }}>
        <Upload size={36} style={{ color: "hsl(215 16% 65%)", marginBottom: 12 }} />
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Drag and drop files to upload</h3>
        <p style={{ fontSize: "0.82rem", color: "hsl(215 16% 57%)", marginBottom: 14 }}>
          Supports MP4, PDF, PPTX, DOCX — Max 500 MB per file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="video/mp4,application/pdf,.ppt,.pptx,.docx"
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select className="input" value={courseId} onChange={(event) => setCourseId(event.target.value)} style={{ maxWidth: 280 }}>
            <option value="">Select a course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || !courseId}>
            Browse Files
          </button>
        </div>
        {message && <p style={{ fontSize: "0.8rem", color: message.includes("successfully") ? "hsl(150 60% 35%)" : "hsl(0 72% 45%)", marginBottom: 10 }}>{message}</p>}
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
              {loading ? <tr><td colSpan={6}>Loading library...</td></tr> : resources.length === 0 ? <tr><td colSpan={6}>No uploaded files yet.</td></tr> : resources.map((file, i) => (
                <tr key={file.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                      {typeIcons[file.type]}
                      {file.title}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${file.type === "video" ? "badge-primary" : file.type === "pdf" ? "badge-error" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                      {file.type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: "hsl(215 16% 57%)" }}>{file.size || "-"}</td>
                  <td style={{ color: "hsl(215 16% 57%)" }}>
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString("en-IN") : "-"}
                  </td>
                  <td><span style={{ fontWeight: 600 }}>{file.course.title}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <a className="btn btn-ghost btn-sm" href={file.url} target="_blank" rel="noreferrer"><Eye size={14} /></a>
                      <a className="btn btn-ghost btn-sm" href={file.url} download={file.title}><Download size={14} /></a>
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
