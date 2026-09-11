import { prisma } from "@/lib/prisma";
import { issueCertificateIfEligible } from "@/lib/services/certificate.service";
import { notifyUser } from "@/lib/services/notification.service";

const VIDEO_COMPLETE_THRESHOLD = 0.9;
const MIN_WATCHED_SECONDS = 8;

export async function upsertLessonProgress(input: {
  userId: string;
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  duration?: number;
  markComplete?: boolean;
}) {
  const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId } });
  if (!lesson || lesson.courseId !== input.courseId) {
    throw new Error("Lesson not found");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
  });
  if (!enrollment) {
    throw new Error("Not enrolled");
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: input.userId, lessonId: input.lessonId } },
  });

  const duration = Math.max(
    input.duration || 0,
    existing?.duration || 0,
    lesson.videoDurationSeconds || 0
  );
  const watchedSeconds = Math.max(input.watchedSeconds, existing?.watchedSeconds || 0);
  const percentage = duration > 0 ? Math.min(100, (watchedSeconds / duration) * 100) : existing?.percentage || 0;

  let completed = existing?.completed || false;
  if (lesson.type === "video") {
    if (duration > 0 && watchedSeconds >= MIN_WATCHED_SECONDS && watchedSeconds / duration >= VIDEO_COMPLETE_THRESHOLD) {
      completed = true;
    }
  } else if (input.markComplete) {
    completed = true;
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: input.userId, lessonId: input.lessonId } },
    create: {
      userId: input.userId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      watchedSeconds,
      duration,
      percentage,
      completed,
      lastWatchedAt: new Date(),
    },
    update: {
      watchedSeconds,
      duration,
      percentage: Math.max(percentage, existing?.percentage || 0),
      completed,
      lastWatchedAt: new Date(),
    },
  });

  const courseProgress = await syncEnrollmentProgress(input.userId, input.courseId);
  return { progress, courseProgress };
}

export async function calculateCourseProgress(userId: string, courseId: string) {
  const [lessons, assessment, progressRows, attempts] = await Promise.all([
    prisma.lesson.findMany({ where: { courseId }, orderBy: { order: "asc" } }),
    prisma.assessment.findFirst({ where: { courseId, published: true } }),
    prisma.lessonProgress.findMany({ where: { userId, courseId } }),
    prisma.assessment.findFirst({
      where: { courseId },
      include: {
        attempts: {
          where: { userId },
          orderBy: { submittedAt: "desc" },
        },
      },
    }),
  ]);

  const requiredLessons = lessons.filter((l) => l.isRequired);
  const requiredIds = new Set(requiredLessons.map((l) => l.id));
  const completedRequired = progressRows.filter((p) => p.completed && requiredIds.has(p.lessonId)).length;
  const lessonTotal = requiredLessons.length || lessons.length || 0;
  const lessonCompleted = requiredLessons.length
    ? completedRequired
    : progressRows.filter((p) => p.completed).length;
  const lessonPercent = lessonTotal === 0 ? 100 : Math.round((lessonCompleted / lessonTotal) * 100);

  const bestAttempt = (attempts?.attempts || []).reduce(
    (best, a) => (a.percentage > (best?.percentage || 0) ? a : best),
    attempts?.attempts?.[0]
  );
  const quizPassed = assessment ? Boolean(bestAttempt?.passed) : true;
  const quizPercent = assessment ? bestAttempt?.percentage ?? 0 : 100;

  const lessonsDone = lessonTotal === 0 || lessonCompleted >= lessonTotal;
  const completed = lessonsDone && quizPassed;

  let percent = lessonPercent;
  if (assessment) {
    percent = Math.round(lessonPercent * 0.7 + quizPercent * 0.3);
    if (lessonsDone && !quizPassed) percent = Math.min(percent, 90);
    if (completed) percent = 100;
  }

  return {
    percent: Math.max(0, Math.min(100, percent)),
    completed,
    lessonPercent,
    lessonCompleted,
    lessonTotal,
    quizPassed,
    quizPercent,
    hasQuiz: Boolean(assessment),
    bestAttempt: bestAttempt
      ? { score: bestAttempt.score, total: bestAttempt.total, percentage: bestAttempt.percentage, passed: bestAttempt.passed }
      : null,
  };
}

export async function isCourseCompleted(userId: string, courseId: string) {
  const result = await calculateCourseProgress(userId, courseId);
  return result.completed;
}

export async function syncEnrollmentProgress(userId: string, courseId: string) {
  const result = await calculateCourseProgress(userId, courseId);
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return result;

  const wasCompleted = enrollment.status === "completed";
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress: result.percent,
      status: result.completed ? "completed" : "in_progress",
      completedAt: result.completed ? enrollment.completedAt || new Date() : null,
    },
  });

  if (result.completed && !wasCompleted) {
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
    await notifyUser({
      userId,
      type: "announcement",
      message: `You successfully completed "${course?.title || "a course"}".`,
      link: `/trainee/courses/${courseId}/learn`,
    });
    await issueCertificateIfEligible(userId, courseId);
  }

  return result;
}

export async function getLessonProgressMap(userId: string, courseId: string) {
  const rows = await prisma.lessonProgress.findMany({ where: { userId, courseId } });
  return Object.fromEntries(rows.map((row) => [row.lessonId, row]));
}
