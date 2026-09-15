import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json(announcements);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const title = String(body.title || "").trim();
    const content = String(body.body || "").trim();
    if (!title || !content) return NextResponse.json({ error: "Title and body are required" }, { status: 400 });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: content,
        type: ["announcement", "achievement", "notification", "new_content"].includes(body.type) ? body.type : "announcement",
        icon: String(body.icon || "📢"),
        publishedBy: session.user.id,
      },
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
