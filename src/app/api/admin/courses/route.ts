import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const courses = await prisma.course.findMany({
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      lessons: { orderBy: { position: "asc" } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(courses);
}