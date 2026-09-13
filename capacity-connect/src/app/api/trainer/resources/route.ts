import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { getFileStorage } from "@/lib/storage/file-storage";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const allowedTypes = new Set([
  "video/mp4",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function resourceType(file: File) {
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "slide";
}

export async function GET() {
  const { user, error } = await requireRole(["trainer", "admin"]);
  if (error || !user) return error!;

  const resources = await prisma.resource.findMany({
    where: user.role === "admin" ? {} : { uploadedBy: user.id },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(resources);
}

export async function POST(request: Request) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;

  const formData = await request.formData();
  const file = formData.get("file");
  const courseId = formData.get("courseId");

  if (!(file instanceof File) || typeof courseId !== "string" || !courseId) {
    return NextResponse.json({ error: "A file and course are required." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Files must be between 1 byte and 500 MB." }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, trainerId: user.id } });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const stored = await getFileStorage().upload({
    filename: file.name,
    mimeType: file.type,
    buffer: Buffer.from(await file.arrayBuffer()),
  });

  const resource = await prisma.resource.create({
    data: {
      courseId,
      type: resourceType(file),
      title: file.name,
      url: stored.url,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: user.id,
    },
    include: { course: { select: { id: true, title: true } } },
  });

  return NextResponse.json(resource, { status: 201 });
}