import { NextResponse } from "next/server";
import { getCertificateByHash } from "@/lib/services/certificate.service";

export async function GET(_request: Request, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const certificate = await getCertificateByHash(hash);
  if (!certificate) {
    return NextResponse.json({ valid: false, error: "Certificate not found / invalid" }, { status: 404 });
  }
  return NextResponse.json({
    valid: true,
    certificateId: certificate.hash,
    recipient: certificate.user.name,
    course: certificate.course.title,
    department: certificate.course.department,
    competencies: certificate.course.competencies.map((c) => c.competency.name),
    issueDate: certificate.issuedAt,
    validatedByAdmin: certificate.validatedByAdmin,
  });
}
