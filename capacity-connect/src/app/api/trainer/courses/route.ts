import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { courseSchema } from "@/lib/validation";
import { createCourseDraft } from "@/lib/services/course.service";
import { parseJsonArray } from "@/lib/services/course.service";

export async function GET() {
  const { user, error } = await requireRole(["trainer", "admin"]);
  if (error || !user) return error!;

  const courses = await prisma.course.findMany({
    where: user.role === "admin" ? {} : { trainerId: user.id },
    include: {
      _count: { select: { enrollments: true, lessons: true, threads: true } },
      feedback: { select: { rating: true } },
      competencies: { include: { competency: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      department: c.department,
      tags: parseJsonArray(c.tags),
      status: c.status,
      rejectionReason: c.rejectionReason,
      duration: c.duration,
      level: c.level,
      thumbnail: c.thumbnail,
      totalLessons: c._count.lessons,
      enrolledCount: c._count.enrollments,
      threadCount: c._count.threads,
      competencies: c.competencies.map((x) => x.competency.name),
      rating:
        c.feedback.length > 0
          ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1)
          : 0,
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(request: Request) {
  const { user, error } = await requireRole(["trainer"]);
  if (error || !user) return error!;

  const parsed = courseSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const course = await createCourseDraft(user.id, parsed.data);
  return NextResponse.json(course, { status: 201 });
}
