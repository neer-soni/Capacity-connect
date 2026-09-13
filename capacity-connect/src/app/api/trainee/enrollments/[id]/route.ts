import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncEnrollmentProgress } from "@/lib/services/progress.service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment || enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const courseProgress = await syncEnrollmentProgress(enrollment.userId, enrollment.courseId);
    const updated = await prisma.enrollment.findUnique({ where: { id } });
    return NextResponse.json({ ...updated, courseProgress });
  } catch (error) {
    console.error("PATCH enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
