import { prisma } from "@/lib/prisma";
import { notifyUser, notifyAdmins } from "@/lib/services/notification.service";
import { getRecommendedCourses } from "@/lib/services/recommendation.service";
import { syncEnrollmentProgress } from "@/lib/services/progress.service";
import { applyQuizCompetencyUpdate } from "@/lib/services/competency.service";

export async function getQuizForTrainee(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) {
    throw new Error("You must be enrolled to take this quiz");
  }

  const assessment = await prisma.assessment.findFirst({
    where: { courseId, published: true },
    include: {
      questions: { include: { options: true }, orderBy: { order: "asc" } },
    },
  });
  if (!assessment) return null;

  const attempts = await prisma.attempt.findMany({
    where: { assessmentId: assessment.id, userId },
    orderBy: { submittedAt: "desc" },
  });

  return {
    id: assessment.id,
    title: assessment.title,
    deadline: assessment.deadline,
    timeLimit: assessment.timeLimit,
    passingScore: assessment.passingScore,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      marks: q.marks,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
    attempts: attempts.map((a) => ({
      id: a.id,
      score: a.score,
      total: a.total,
      percentage: a.percentage,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
  };
}

export async function gradeQuizSubmission(input: {
  courseId: string;
  userId: string;
  answers: Record<string, string>;
}) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
  });
  if (!enrollment) {
    throw new Error("You must be enrolled to submit this quiz");
  }

  const assessment = await prisma.assessment.findFirst({
    where: { courseId: input.courseId, published: true },
    include: {
      questions: { include: { options: true }, orderBy: { order: "asc" } },
      course: { select: { title: true } },
    },
  });
  if (!assessment) {
    throw new Error("Quiz not found");
  }

  let score = 0;
  let total = 0;
  const review = assessment.questions.map((question) => {
    const marks = question.marks || 1;
    total += marks;
    const userAnswer = input.answers[question.id] || null;
    const isCorrect = userAnswer === question.correctOptionId;
    if (isCorrect) score += marks;
    return {
      id: question.id,
      text: question.text,
      marks,
      correctOptionId: question.correctOptionId,
      userAnswer,
      isCorrect,
      options: question.options.map((o) => ({ id: o.id, text: o.text })),
    };
  });

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= assessment.passingScore;

  const attempt = await prisma.attempt.create({
    data: {
      assessmentId: assessment.id,
      userId: input.userId,
      score,
      total,
      percentage,
      passed,
      answers: JSON.stringify(input.answers),
    },
  });

  if (passed) {
    await applyQuizCompetencyUpdate(input.userId, input.courseId, percentage);
    const recs = await getRecommendedCourses(input.userId);
    if (recs[0]) {
      await notifyUser({
        userId: input.userId,
        type: "announcement",
        message: `New course recommended for your skill gap: ${recs[0].course.title}.`,
        link: `/courses/${recs[0].course.id}`,
      });
    }
  }

  const courseProgress = await syncEnrollmentProgress(input.userId, input.courseId);

  return {
    attemptId: attempt.id,
    score,
    total,
    percentage,
    passed,
    passingScore: assessment.passingScore,
    submittedAt: attempt.submittedAt,
    questions: review,
    courseProgress,
  };
}

export async function saveTrainerQuiz(input: {
  courseId: string;
  trainerId: string;
  title: string;
  timeLimit?: number;
  passingScore?: number;
  deadline?: string | null;
  published?: boolean;
  questions: {
    text: string;
    marks?: number;
    options: string[];
    correctIndex: number;
  }[];
}) {
  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course || course.trainerId !== input.trainerId) {
    throw new Error("Course not found");
  }

  const existing = await prisma.assessment.findFirst({ where: { courseId: input.courseId } });
  if (existing) {
    await prisma.question.deleteMany({ where: { assessmentId: existing.id } });
    await prisma.assessment.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        timeLimit: input.timeLimit ?? existing.timeLimit,
        passingScore: input.passingScore ?? existing.passingScore,
        deadline: input.deadline ? new Date(input.deadline) : null,
        published: input.published ?? true,
      },
    });
  }

  const assessment =
    existing ||
    (await prisma.assessment.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        timeLimit: input.timeLimit ?? 30,
        passingScore: input.passingScore ?? 60,
        deadline: input.deadline ? new Date(input.deadline) : null,
        published: input.published ?? true,
      },
    }));

  for (let i = 0; i < input.questions.length; i++) {
    const q = input.questions[i];
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      throw new Error(`Question ${i + 1} is missing a valid correct answer`);
    }
    const question = await prisma.question.create({
      data: {
        assessmentId: assessment.id,
        text: q.text,
        marks: q.marks ?? 1,
        order: i,
      },
    });
    const options = await Promise.all(
      q.options.map((text) => prisma.option.create({ data: { questionId: question.id, text } }))
    );
    await prisma.question.update({
      where: { id: question.id },
      data: { correctOptionId: options[q.correctIndex].id },
    });
  }

  return prisma.assessment.findUnique({
    where: { id: assessment.id },
    include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
  });
}

export async function getTrainerQuiz(courseId: string) {
  return prisma.assessment.findFirst({
    where: { courseId },
    include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
  });
}

export { notifyAdmins };
