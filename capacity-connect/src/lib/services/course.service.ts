import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { notifyAdmins, notifyUser } from "@/lib/services/notification.service";

export async function createCourseDraft(trainerId: string, data: {
  title: string;
  description: string;
  department?: string;
  level?: string;
  duration?: string;
  estimatedMinutes?: number;
  tags?: string[];
  thumbnail?: string;
  objectives?: string[];
  competencyIds?: string[];
}) {
  const slug = uniqueSlug(data.title, Math.random().toString(36).slice(2, 6));
  const course = await prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      trainerId,
      department: data.department || "",
      level: data.level || "Beginner",
      duration: data.duration || "",
      estimatedMinutes: data.estimatedMinutes || 0,
      tags: JSON.stringify(data.tags || []),
      thumbnail: data.thumbnail || "📚",
      objectives: JSON.stringify(data.objectives || []),
      status: "draft",
    },
  });

  if (data.competencyIds?.length) {
    await prisma.courseCompetency.createMany({
      data: data.competencyIds.map((competencyId) => ({
        courseId: course.id,
        competencyId,
      })),
    });
  }

  return course;
}

export async function updateCourse(courseId: string, trainerId: string, data: Partial<{
  title: string;
  description: string;
  department: string;
  level: string;
  duration: string;
  estimatedMinutes: number;
  tags: string[];
  thumbnail: string;
  objectives: string[];
  competencyIds: string[];
}>) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.trainerId !== trainerId) {
    throw new Error("Course not found");
  }
  if (!["draft", "rejected"].includes(course.status)) {
    throw new Error("Only draft or rejected courses can be edited");
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(data.title ? { title: data.title, slug: uniqueSlug(data.title, course.id.slice(-4)) } : {}),
      ...(data.description ? { description: data.description } : {}),
      ...(data.department !== undefined ? { department: data.department } : {}),
      ...(data.level ? { level: data.level } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.estimatedMinutes !== undefined ? { estimatedMinutes: data.estimatedMinutes } : {}),
      ...(data.tags ? { tags: JSON.stringify(data.tags) } : {}),
      ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
      ...(data.objectives ? { objectives: JSON.stringify(data.objectives) } : {}),
      status: course.status === "rejected" ? "draft" : course.status,
      rejectionReason: course.status === "rejected" ? "" : course.rejectionReason,
    },
  });

  if (data.competencyIds) {
    await prisma.courseCompetency.deleteMany({ where: { courseId } });
    if (data.competencyIds.length) {
      await prisma.courseCompetency.createMany({
        data: data.competencyIds.map((competencyId) => ({ courseId, competencyId })),
      });
    }
  }

  return updated;
}

export async function submitCourseForReview(courseId: string, trainerId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: true, assessments: { include: { questions: true } } },
  });
  if (!course || course.trainerId !== trainerId) {
    throw new Error("Course not found");
  }
  if (!["draft", "rejected"].includes(course.status)) {
    throw new Error("Course is already submitted or published");
  }
  if (course.lessons.length === 0) {
    throw new Error("Add at least one lesson before submitting");
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: "pending_review",
      totalLessons: course.lessons.length,
      rejectionReason: "",
    },
  });

  await notifyAdmins({
    type: "announcement",
    message: `New course awaiting review: "${course.title}".`,
    link: `/admin/courses/${course.id}`,
  });

  return updated;
}

export async function reviewCourse(input: {
  courseId: string;
  adminId: string;
  action: "approve" | "reject";
  reason?: string;
}) {
  const course = await prisma.course.findUnique({
    where: { id: input.courseId },
    include: { trainer: true },
  });
  if (!course) throw new Error("Course not found");

  if (input.action === "reject") {
    const updated = await prisma.course.update({
      where: { id: input.courseId },
      data: { status: "rejected", rejectionReason: input.reason || "Needs revision" },
    });
    await notifyUser({
      userId: course.trainerId,
      type: "announcement",
      message: `Your course "${course.title}" has been rejected.${input.reason ? ` Reason: ${input.reason}` : ""}`,
      link: `/trainer/courses/${course.id}/edit`,
    });
    await prisma.auditLog.create({
      data: {
        userId: input.adminId,
        action: "reject_course",
        target: input.courseId,
        details: input.reason || "",
      },
    });
    return updated;
  }

  const updated = await prisma.course.update({
    where: { id: input.courseId },
    data: { status: "published", rejectionReason: "" },
  });
  await notifyUser({
    userId: course.trainerId,
    type: "announcement",
    message: `Your course "${course.title}" has been approved and published.`,
    link: `/courses/${course.id}`,
  });
  await prisma.auditLog.create({
    data: {
      userId: input.adminId,
      action: "approve_course",
      target: input.courseId,
      details: `Published ${course.title}`,
    },
  });
  return updated;
}

export async function syncLessonCount(courseId: string) {
  const count = await prisma.lesson.count({ where: { courseId } });
  await prisma.course.update({ where: { id: courseId }, data: { totalLessons: count } });
}

export function parseJsonArray(value: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
