import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { quizSubmitSchema } from "@/lib/validation";
import { getQuizForTrainee, gradeQuizSubmission } from "@/lib/services/quiz.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainee", "trainer", "admin"]);
  if (error || !user) return error!;
  const { id } = await params;
  try {
    if (user.role === "trainee") {
      const quiz = await getQuizForTrainee(id, user.id);
      if (!quiz) return NextResponse.json({ error: "No quiz found for this course" }, { status: 404 });
      return NextResponse.json(quiz);
    }
    const quiz = await getQuizForTrainee(id, user.id).catch(() => null);
    if (!quiz) return NextResponse.json({ error: "No quiz found for this course" }, { status: 404 });
    return NextResponse.json(quiz);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load quiz" }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainee"]);
  if (error || !user) return error!;
  const { id } = await params;
  const parsed = quizSubmitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Answers are required" }, { status: 400 });
  }
  try {
    const result = await gradeQuizSubmission({
      courseId: id,
      userId: user.id,
      answers: parsed.data.answers,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Submit failed" }, { status: 400 });
  }
}
