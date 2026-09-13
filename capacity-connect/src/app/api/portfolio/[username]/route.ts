import { NextResponse } from "next/server";
import { getPortfolioByUsername } from "@/lib/services/portfolio.service";

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const portfolio = await getPortfolioByUsername(username);
  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found or private" }, { status: 404 });
  }
  return NextResponse.json(portfolio);
}
