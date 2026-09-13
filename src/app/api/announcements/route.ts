import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
