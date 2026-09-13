import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, isOwnerOrAdmin } from "@/lib/rbac";
import { courseSchema } from "@/lib/validation";
import { updateCourse, parseJsonArray } from "@/lib/services/course.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer", "admin"]);
  if (error || !user) return error!;
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: "asc" } },
      assessments: { include: { questions: { include: { options: true }, orderBy: { order: "asc" } } } },
      competencies: { include: { competency: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!isOwnerOrAdmin(user, course.trainerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ...course,
    tags: parseJsonArray(course.tags),
    objectives: parseJsonArray(course.objectives),
    competencyIds: course.competencies.map((c) => c.competencyId),
    competencies: course.competencies.map((c) => c.competency),
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;
  const { id } = await params;
  const parsed = courseSchema.partial().safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  try {
    const updated = await updateCourse(id, user.id, parsed.data);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed" }, { status: 400 });
  }
}
