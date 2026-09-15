import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — Admin dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      pendingApprovals,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      completedEnrollments,
      totalCertificates,
      pendingCertValidation,
      enrollments,
      publishedCoursesWithEnrollments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "pending" } }),
      prisma.course.count({ where: { status: "published" } }),
      prisma.course.count({ where: { status: "draft" } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "completed" } }),
      prisma.certificate.count(),
      prisma.certificate.count({ where: { validatedByAdmin: false } }),
      prisma.enrollment.findMany({ select: { enrolledAt: true } }),
      prisma.course.findMany({ where: { status: "published" }, include: { enrollments: { select: { status: true } } } }),
    ]);

    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    // Top courses by enrollment
    const topCourses = await prisma.course.findMany({
      where: { status: "published" },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    });

    // Dept breakdown
    const deptStats = new Map<string, { total: number; completed: number }>();
    for (const course of publishedCoursesWithEnrollments) {
      const current = deptStats.get(course.department || "General") || { total: 0, completed: 0 };
      current.total += course.enrollments.length;
      current.completed += course.enrollments.filter((enrollment) => enrollment.status === "completed").length;
      deptStats.set(course.department || "General", current);
    }

    const monthlyCounts = new Map<string, number>();
    for (const enrollment of enrollments) {
      const month = enrollment.enrolledAt.toLocaleString("en-US", { month: "short" });
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
    }
    const monthOrder = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

    return NextResponse.json({
      totalUsers,
      pendingApprovals,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      completionRate,
      totalCertificates,
      pendingCertValidation,
      topCourses: topCourses.map((c) => ({
        title: c.title,
        enrollments: c._count.enrollments,
      })),
      courseCompletionByDept: Array.from(deptStats.entries()).map(([dept, values]) => ({
        dept,
        rate: values.total > 0 ? Math.round((values.completed / values.total) * 100) : 0,
      })),
      monthlyEnrollments: monthOrder.map((month) => ({ month, count: monthlyCounts.get(month) || 0 })),
    });
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
