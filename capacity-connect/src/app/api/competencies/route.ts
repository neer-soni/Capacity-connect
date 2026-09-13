import { NextResponse } from "next/server";
import { requireUser } from "@/lib/rbac";
import { listCompetencies } from "@/lib/services/competency.service";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;
  const competencies = await listCompetencies();
  return NextResponse.json(competencies);
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional(),
  category: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const { user, error } = await requireRole(["admin"]);
  if (error || !user) return error!;
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const competency = await prisma.competency.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || "",
      category: parsed.data.category || "",
    },
  });
  return NextResponse.json(competency, { status: 201 });
}
