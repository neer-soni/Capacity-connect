import { prisma } from "@/lib/prisma";
import { calculateSkillGap } from "@/lib/services/competency.service";

export type RecommendedCourse = {
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    thumbnail: string;
    department: string;
    duration: string;
  };
  matchingSkills: string[];
  reason: string;
  priority: number;
};

export async function getRecommendedCourses(userId: string): Promise<RecommendedCourse[]> {
  const gaps = await calculateSkillGap(userId);
  const openGaps = gaps.filter((g) => g.gap > 0);
  if (openGaps.length === 0) return [];

  const completed = await prisma.enrollment.findMany({
    where: { userId, status: "completed" },
    select: { courseId: true },
  });
  const completedIds = new Set(completed.map((e) => e.courseId));
  const enrolled = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const enrolledIds = new Set(enrolled.map((e) => e.courseId));

  const gapIds = new Set(openGaps.map((g) => g.competencyId));
  const gapById = Object.fromEntries(openGaps.map((g) => [g.competencyId, g]));

  const courses = await prisma.course.findMany({
    where: { status: "published" },
    include: {
      competencies: { include: { competency: true } },
    },
  });

  const scored = courses
    .filter((course) => !completedIds.has(course.id))
    .map((course) => {
      const matching = course.competencies.filter((c) => gapIds.has(c.competencyId));
      const matchingSkills = matching.map((m) => m.competency.name);
      const gapScore = matching.reduce((sum, m) => sum + (gapById[m.competencyId]?.gap || 0), 0);
      const alreadyEnrolled = enrolledIds.has(course.id) ? 0.5 : 1;
      const highestGap = matching.reduce((max, m) => Math.max(max, gapById[m.competencyId]?.currentLevel ?? 0), 0);
      let difficultyFit = 1;
      if (course.level === "Beginner" && highestGap <= 1) difficultyFit = 1.2;
      if (course.level === "Intermediate" && highestGap >= 1 && highestGap <= 3) difficultyFit = 1.2;
      if (course.level === "Advanced" && highestGap >= 3) difficultyFit = 1.2;
      const priority = gapScore * difficultyFit * alreadyEnrolled;
      const topSkill = matchingSkills[0];
      return {
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          thumbnail: course.thumbnail,
          department: course.department,
          duration: course.duration,
        },
        matchingSkills,
        reason: topSkill
          ? `Recommended because this course improves your ${topSkill} competency.`
          : "Recommended based on your remaining skill gaps.",
        priority,
      };
    })
    .filter((item) => item.matchingSkills.length > 0 && item.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8);

  return scored;
}
