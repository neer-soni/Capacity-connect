import { prisma } from "@/lib/prisma";

export type SkillGapItem = {
  competencyId: string;
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: "high" | "medium" | "low" | "none";
  lastAssessedAt: Date | null;
  evidence: string;
};

function priorityFromGap(gap: number): SkillGapItem["priority"] {
  if (gap >= 3) return "high";
  if (gap === 2) return "medium";
  if (gap === 1) return "low";
  return "none";
}

export async function calculateSkillGap(userId: string): Promise<SkillGapItem[]> {
  const rows = await prisma.userCompetency.findMany({
    where: { userId },
    include: { competency: true },
  });

  return rows
    .map((row) => {
      const gap = Math.max(0, row.targetLevel - row.currentLevel);
      return {
        competencyId: row.competencyId,
        skill: row.competency.name,
        currentLevel: row.currentLevel,
        targetLevel: row.targetLevel,
        gap,
        priority: priorityFromGap(gap),
        lastAssessedAt: row.lastAssessedAt,
        evidence: row.evidence,
      };
    })
    .sort((a, b) => b.gap - a.gap || a.skill.localeCompare(b.skill));
}

export async function applyQuizCompetencyUpdate(userId: string, courseId: string, percentage: number) {
  const links = await prisma.courseCompetency.findMany({
    where: { courseId },
    include: { competency: true },
  });
  if (links.length === 0) return;

  const assessedLevel = Math.max(1, Math.min(5, Math.round(percentage / 20)));

  for (const link of links) {
    const existing = await prisma.userCompetency.findUnique({
      where: { userId_competencyId: { userId, competencyId: link.competencyId } },
    });
    const nextLevel = Math.max(existing?.currentLevel || 0, Math.min(link.targetLevel, assessedLevel));
    await prisma.userCompetency.upsert({
      where: { userId_competencyId: { userId, competencyId: link.competencyId } },
      create: {
        userId,
        competencyId: link.competencyId,
        currentLevel: nextLevel,
        targetLevel: Math.max(link.targetLevel, 3),
        evidence: `Quiz score ${percentage}% in linked course`,
        lastAssessedAt: new Date(),
      },
      update: {
        currentLevel: nextLevel,
        evidence: `Quiz score ${percentage}% in linked course`,
        lastAssessedAt: new Date(),
      },
    });
  }
}

export async function upsertUserTargets(
  userId: string,
  targets: { competencyId: string; targetLevel: number }[]
) {
  for (const target of targets) {
    await prisma.userCompetency.upsert({
      where: { userId_competencyId: { userId, competencyId: target.competencyId } },
      create: {
        userId,
        competencyId: target.competencyId,
        targetLevel: target.targetLevel,
        currentLevel: 0,
      },
      update: { targetLevel: target.targetLevel },
    });
  }
}

export async function listCompetencies() {
  return prisma.competency.findMany({ orderBy: { name: "asc" } });
}
