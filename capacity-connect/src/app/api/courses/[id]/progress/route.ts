import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { progressSchema } from "@/lib/validation";
import {
  calculateCourseProgress,
  getLessonProgressMap,
  upsertLessonProgress,
} from "@/lib/services/progress.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainee", "admin"]);
  if (error || !user) return error!;
  const { id } = await params;
  const [map, courseProgress] = await Promise.all([
    getLessonProgressMap(user.id, id),
    calculateCourseProgress(user.id, id),
  ]);
  return NextResponse.json({ lessons: map, course: courseProgress });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainee"]);
  if (error || !user) return error!;
  const { id } = await params;
  const parsed = progressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid progress" }, { status: 400 });
  }
  try {
    const result = await upsertLessonProgress({
      userId: user.id,
      courseId: id,
      lessonId: parsed.data.lessonId,
      watchedSeconds: parsed.data.watchedSeconds,
      duration: parsed.data.duration,
      markComplete: parsed.data.markComplete,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Progress update failed" }, { status: 400 });
  }
}
