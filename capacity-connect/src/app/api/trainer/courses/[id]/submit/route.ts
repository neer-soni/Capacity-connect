import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { submitCourseForReview } from "@/lib/services/course.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id } = await params;
  try {
    const course = await submitCourseForReview(id, user.id);
    return NextResponse.json(course);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Submit failed" }, { status: 400 });
  }
}
