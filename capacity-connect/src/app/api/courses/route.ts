import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/services/course.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const department = searchParams.get("department") || "";
    const competency = searchParams.get("competency") || "";
    const duration = searchParams.get("duration") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = { status: "published" };
    const and: Record<string, unknown>[] = [];

    if (search) {
      and.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
          { department: { contains: search } },
        ],
      });
    }
    if (level && level !== "All") and.push({ level });
    if (department && department !== "All") and.push({ department });
    if (duration && duration !== "All") and.push({ duration: { contains: duration } });
    if (competency && competency !== "All") {
      and.push({
        competencies: { some: { competency: { name: { contains: competency } } } },
      });
    }
    if (and.length) where.AND = and;

    const orderBy =
      sort === "title"
        ? { title: "asc" as const }
        : sort === "level"
          ? { level: "asc" as const }
          : { createdAt: "desc" as const };

    const courses = await prisma.course.findMany({
      where,
      include: {
        trainer: { select: { id: true, name: true, avatar: true } },
        _count: { select: { enrollments: true } },
        feedback: { select: { rating: true } },
        competencies: { include: { competency: true } },
      },
      orderBy,
    });

    return NextResponse.json(
      courses.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        trainerId: c.trainerId,
        trainer: c.trainer.name,
        trainerAvatar: c.trainer.avatar,
        department: c.department,
        tags: parseJsonArray(c.tags),
        competencies: c.competencies.map((x) => x.competency.name),
        status: c.status,
        duration: c.duration,
        estimatedMinutes: c.estimatedMinutes,
        level: c.level,
        thumbnail: c.thumbnail,
        totalLessons: c.totalLessons,
        enrolledCount: c._count.enrollments,
        rating:
          c.feedback.length > 0
            ? +(c.feedback.reduce((sum, f) => sum + f.rating, 0) / c.feedback.length).toFixed(1)
            : 0,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
