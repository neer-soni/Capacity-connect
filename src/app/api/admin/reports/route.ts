import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;
  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(reports);
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;
  const body = await request.json();
  const reportId = String(body.reportId || "");
  const action = body.action === "remove" ? "remove" : "dismiss";
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  if (action === "remove") {
    if (report.contentType === "forum_thread") await prisma.forumThread.delete({ where: { id: report.contentId } });
    if (report.contentType === "forum_reply") await prisma.forumReply.update({ where: { id: report.contentId }, data: { isDeleted: true } });
  }
  const updated = await prisma.report.update({ where: { id: reportId }, data: { status: action === "remove" ? "resolved" : "dismissed", resolvedAction: action === "remove" ? "Content removed" : "Report dismissed" } });
  return NextResponse.json(updated);
}