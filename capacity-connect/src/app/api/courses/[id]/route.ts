import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/rbac";
import { parseJsonArray } from "@/lib/services/course.service";
import { resolveLessonVideo } from "@/lib/video/provider";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        trainer: { select: { id: true, name: true, avatar: true, department: true, verified: true } },
        resources: true,
        lessons: { orderBy: { order: "asc" } },
        competencies: { include: { competency: true } },
        _count: { select: { enrollments: true } },
        feedback: { select: { rating: true } },
        threads: {
          include: {
            author: { select: { name: true, avatar: true } },
            replies: { select: { id: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const canViewUnpublished =
      user && (user.role === "admin" || user.id === course.trainerId);
    if (course.status !== "published" && !canViewUnpublished) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      trainerId: course.trainerId,
      trainer: course.trainer.name,
      trainerAvatar: course.trainer.avatar,
      trainerDept: course.trainer.department,
      trainerVerified: course.trainer.verified,
      department: course.department,
      tags: parseJsonArray(course.tags),
      objectives: parseJsonArray(course.objectives),
      competencies: course.competencies.map((c) => c.competency.name),
      status: course.status,
      duration: course.duration,
      estimatedMinutes: course.estimatedMinutes,
      level: course.level,
      thumbnail: course.thumbnail,
      totalLessons: course.lessons.length || course.totalLessons,
      enrolledCount: course._count.enrollments,
      rating:
        course.feedback.length > 0
          ? +(course.feedback.reduce((sum, f) => sum + f.rating, 0) / course.feedback.length).toFixed(1)
          : 0,
      lessons: course.lessons.map((lesson) => {
        const video = resolveLessonVideo(lesson.videoUrl);
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          order: lesson.order,
          duration: lesson.videoDurationSeconds,
          size: lesson.size,
          resourceUrl: lesson.resourceUrl,
          videoUrl: video?.src || "",
          isRequired: lesson.isRequired,
        };
      }),
      resources: course.resources.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        size: r.size,
        duration: r.duration,
        url: r.url,
      })),
      threads: course.threads.map((t) => ({
        id: t.id,
        title: t.title,
        author: t.author.name,
        authorAvatar: t.author.avatar,
        isQuestion: t.isQuestion,
        upvotes: t.upvotes,
        replyCount: t.replies.length,
        acceptedReplyId: t.acceptedReplyId,
      })),
      createdAt: course.createdAt,
    });
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
