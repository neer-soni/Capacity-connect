import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isOwnerOrAdmin } from "@/lib/rbac";
import { lessonSchema } from "@/lib/validation";
import { syncLessonCount } from "@/lib/services/course.service";

async function assertCourseAccess(courseId: string, userId: string, role: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { course: null, error: NextResponse.json({ error: "Course not found" }, { status: 404 }) };
  if (role !== "admin" && course.trainerId !== userId) {
    return { course: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { course, error: null };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer", "admin"]);
  if (error || !user) return error!;
  const { id } = await params;
  const access = await assertCourseAccess(id, user.id, user.role);
  if (access.error) return access.error;
  const lessons = await prisma.lesson.findMany({ where: { courseId: id }, orderBy: { order: "asc" } });
  return NextResponse.json(lessons);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id } = await params;
  const access = await assertCourseAccess(id, user.id, user.role);
  if (access.error || !access.course) return access.error!;
  if (!["draft", "rejected"].includes(access.course.status)) {
    return NextResponse.json({ error: "Cannot edit lessons after submission" }, { status: 400 });
  }

  const parsed = lessonSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid lesson" }, { status: 400 });
  }

  const count = await prisma.lesson.count({ where: { courseId: id } });
  const lesson = await prisma.lesson.create({
    data: {
      courseId: id,
      title: parsed.data.title,
      description: parsed.data.description || "",
      type: parsed.data.type,
      order: parsed.data.order ?? count,
      videoUrl: parsed.data.videoUrl || "",
      videoDurationSeconds: parsed.data.videoDurationSeconds || 0,
      resourceUrl: parsed.data.resourceUrl || "",
      size: parsed.data.size || "",
      isRequired: parsed.data.isRequired ?? true,
    },
  });
  await syncLessonCount(id);
  return NextResponse.json(lesson, { status: 201 });
}
