import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { quizSchema } from "@/lib/validation";
import { getTrainerQuiz, saveTrainerQuiz } from "@/lib/services/quiz.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer", "admin"]);
  if (error || !user) return error!;
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "admin" && course.trainerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const quiz = await getTrainerQuiz(id);
  return NextResponse.json(quiz);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id } = await params;
  const parsed = quizSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid quiz" }, { status: 400 });
  }
  try {
    const quiz = await saveTrainerQuiz({
      courseId: id,
      trainerId: user.id,
      ...parsed.data,
    });
    return NextResponse.json(quiz);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed" }, { status: 400 });
  }
}
