import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/services/notification.service";

export async function issueCertificateIfEligible(userId: string, courseId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment || enrollment.status !== "completed") return null;

  const assessment = await prisma.assessment.findFirst({
    where: { courseId, published: true },
  });
  if (assessment) {
    const passed = await prisma.attempt.findFirst({
      where: { assessmentId: assessment.id, userId, passed: true },
    });
    if (!passed) return null;
  }

  const hash = `CC${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  const certificate = await prisma.certificate.create({
    data: { userId, courseId, hash, validatedByAdmin: true },
  });

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true } });
  await notifyUser({
    userId,
    type: "certificate",
    message: `Your certificate for "${course?.title || "the course"}" is ready.`,
    link: "/trainee/certificates",
  });

  return certificate;
}

export async function getCertificateByHash(hash: string) {
  return prisma.certificate.findUnique({
    where: { hash },
    include: {
      user: { select: { name: true, username: true } },
      course: {
        select: {
          title: true,
          department: true,
          competencies: { include: { competency: true } },
        },
      },
    },
  });
}
