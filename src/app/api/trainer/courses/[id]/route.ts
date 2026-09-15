import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTrainerCourse(id: string, trainerId: string) {
  return prisma.course.findFirst({
    where: { id, trainerId },
    include: { lessons: { orderBy: { position: "asc" } } },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "trainer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const course = await getTrainerCourse(id, session.user.id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "trainer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const course = await getTrainerCourse(id, session.user.id);
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const body = await request.json();
    const action = body.action || "save";
    if (!["save", "submit"].includes(action)) {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }
    if (action === "submit" && course.lessons.length === 0) {
      return NextResponse.json({ error: "Add at least one lesson before submitting" }, { status: 400 });
    }

    const title = String(body.title ?? course.title).trim();
    const description = String(body.description ?? course.description).trim();
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const lessons = Array.isArray(body.lessons) ? body.lessons : null;
    const updated = await prisma.$transaction(async (tx) => {
      if (lessons) {
        await tx.lesson.deleteMany({ where: { courseId: id } });
        for (const [index, lesson] of lessons.entries()) {
          const lessonTitle = String(lesson.title || "").trim();
          if (!lessonTitle) throw new Error("Every lesson needs a title");
          await tx.lesson.create({
            data: {
              courseId: id,
              title: lessonTitle,
              description: String(lesson.description || ""),
              type: lesson.type === "pdf" || lesson.type === "text" ? lesson.type : "video",
              url: String(lesson.url || ""),
              duration: Math.max(0, Number(lesson.duration) || 0),
              position: index,
              required: lesson.required !== false,
            },
          });
        }
      }
      return tx.course.update({
        where: { id },
        data: {
          title,
          description,
          department: String(body.department ?? course.department),
          level: String(body.level ?? course.level),
          duration: String(body.duration ?? course.duration),
          tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : JSON.parse(course.tags)),
          thumbnail: String(body.thumbnail ?? course.thumbnail),
          totalLessons: lessons ? lessons.length : course.totalLessons,
          status: action === "submit" ? "pending_review" : course.status === "rejected" ? "draft" : course.status,
          rejectionReason: action === "save" ? course.rejectionReason : "",
        },
        include: { lessons: { orderBy: { position: "asc" } } },
      });
    });

    if (action === "submit") {
      const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "announcement",
          message: `Course "${updated.title}" is awaiting review.`,
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.startsWith("Every lesson")) return NextResponse.json({ error: message }, { status: 400 });
    console.error("PATCH trainer course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}