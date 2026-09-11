import { prisma } from "@/lib/prisma";

export async function notifyUser(input: {
  userId: string;
  type: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      link: input.link || "",
    },
  });
}

export async function notifyAdmins(input: { type: string; message: string; link?: string }) {
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: input.type,
      message: input.message,
      link: input.link || "",
    })),
  });
}
