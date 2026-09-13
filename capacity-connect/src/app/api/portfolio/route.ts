import { NextResponse } from "next/server";
import { requireUser } from "@/lib/rbac";
import { getPortfolioByUserId } from "@/lib/services/portfolio.service";

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return error!;
  const portfolio = await getPortfolioByUserId(user.id);
  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(portfolio);
}
