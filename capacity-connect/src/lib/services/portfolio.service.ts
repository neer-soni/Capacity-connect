import { prisma } from "@/lib/prisma";
import { calculateSkillGap } from "@/lib/services/competency.service";

export async function getPortfolioByUserId(userId: string, opts?: { publicOnly?: boolean }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      department: true,
      designation: true,
      skills: true,
      bio: true,
      avatar: true,
      publicPortfolio: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  if (opts?.publicOnly && !user.publicPortfolio) return null;

  const [enrollments, certificates, competencies] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId, status: "completed" },
      include: { course: { select: { id: true, title: true, thumbnail: true, department: true, level: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, department: true } } },
      orderBy: { issuedAt: "desc" },
    }),
    calculateSkillGap(userId),
  ]);

  let skills: string[] = [];
  try {
    skills = JSON.parse(user.skills || "[]");
  } catch {
    skills = [];
  }

  return {
    profile: {
      name: user.name,
      username: user.username,
      department: user.department,
      designation: user.designation,
      bio: user.bio,
      avatar: user.avatar,
      skills,
      memberSince: user.createdAt,
      email: opts?.publicOnly ? undefined : user.email,
    },
    completedCourses: enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      thumbnail: e.course.thumbnail,
      department: e.course.department,
      level: e.course.level,
      completedAt: e.completedAt,
    })),
    certificates: certificates.map((c) => ({
      id: c.id,
      hash: c.hash,
      course: c.course.title,
      department: c.course.department,
      issuedAt: c.issuedAt,
      validated: c.validatedByAdmin,
    })),
    competencies,
    achievements: [
      ...certificates.map((c) => ({
        type: "certificate" as const,
        title: `Certified: ${c.course.title}`,
        date: c.issuedAt,
      })),
      ...enrollments.slice(0, 5).map((e) => ({
        type: "course" as const,
        title: `Completed ${e.course.title}`,
        date: e.completedAt,
      })),
    ],
  };
}

export async function getPortfolioByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  return getPortfolioByUserId(user.id, { publicOnly: true });
}
