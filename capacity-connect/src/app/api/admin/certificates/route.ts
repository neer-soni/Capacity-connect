import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  const certificates = await prisma.certificate.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, department: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(
    certificates.map((c) => ({
      id: c.id,
      hash: c.hash,
      user: c.user.name,
      email: c.user.email,
      course: c.course.title,
      department: c.course.department,
      issuedAt: c.issuedAt,
      validatedByAdmin: c.validatedByAdmin,
    }))
  );
}
