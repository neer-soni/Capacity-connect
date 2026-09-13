import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { lessonSchema } from "@/lib/validation";
import { syncLessonCount } from "@/lib/services/course.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id, lessonId } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.trainerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = lessonSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid lesson" }, { status: 400 });
  }
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  });
  return NextResponse.json(lesson);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id, lessonId } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course || course.trainerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!["draft", "rejected"].includes(course.status)) {
    return NextResponse.json({ error: "Cannot delete lessons after submission" }, { status: 400 });
  }
  await prisma.lesson.delete({ where: { id: lessonId } });
  await syncLessonCount(id);
  return NextResponse.json({ success: true });
}
