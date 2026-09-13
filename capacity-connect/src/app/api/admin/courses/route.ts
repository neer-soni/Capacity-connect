import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/rbac";
import { reviewCourse, parseJsonArray } from "@/lib/services/course.service";
import { adminCourseActionSchema } from "@/lib/validation";

export async function GET() {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const courses = await prisma.course.findMany({
    include: {
      trainer: { select: { id: true, name: true, avatar: true, department: true } },
      lessons: { orderBy: { order: "asc" } },
      assessments: { include: { questions: { include: { options: true } } } },
      competencies: { include: { competency: true } },
      feedback: { select: { rating: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      department: c.department,
      tags: parseJsonArray(c.tags),
      objectives: parseJsonArray(c.objectives),
      status: c.status,
      rejectionReason: c.rejectionReason,
      duration: c.duration,
      level: c.level,
      thumbnail: c.thumbnail,
      totalLessons: c.lessons.length,
      enrolledCount: c._count.enrollments,
      trainer: c.trainer.name,
      trainerId: c.trainerId,
      trainerDept: c.trainer.department,
      lessons: c.lessons,
      quiz: c.assessments[0]
        ? {
            title: c.assessments[0].title,
            passingScore: c.assessments[0].passingScore,
            questionCount: c.assessments[0].questions.length,
          }
        : null,
      competencies: c.competencies.map((x) => x.competency.name),
      createdAt: c.createdAt,
      rating: c.feedback.length > 0 ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1) : 0,
    }))
  );
}

export async function PATCH() {
  return NextResponse.json({ error: "Use /api/admin/courses/[id]" }, { status: 405 });
}
