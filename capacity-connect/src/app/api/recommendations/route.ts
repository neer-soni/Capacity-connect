import { NextResponse } from "next/server";
import { requireUser } from "@/lib/rbac";
import { getRecommendedCourses } from "@/lib/services/recommendation.service";
import { calculateSkillGap } from "@/lib/services/competency.service";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return error!;
  const [recommendations, skillGap] = await Promise.all([
    getRecommendedCourses(user.id),
    calculateSkillGap(user.id),
  ]);
  return NextResponse.json({ recommendations, skillGap });
}
