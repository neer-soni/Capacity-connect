import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type AppRole = "trainee" | "trainer" | "admin";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: AppRole;
  status: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: (session.user.role as AppRole) || "trainee",
    status: session.user.status,
  };
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return { user: null as SessionUser | null, error: unauthorized() };
  return { user, error: null };
}

export async function requireRole(roles: AppRole[]) {
  const { user, error } = await requireUser();
  if (error || !user) return { user: null as SessionUser | null, error: error ?? unauthorized() };
  if (!roles.includes(user.role)) {
    return { user: null as SessionUser | null, error: forbidden("Insufficient permissions") };
  }
  return { user, error: null };
}

export function isOwnerOrAdmin(user: SessionUser, ownerId: string) {
  return user.role === "admin" || user.id === ownerId;
}
