import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, hashToken } from "@/lib/security";
export const SESSION_COOKIE = "benchscout_session";
export type Session = { id: string; email: string; role: "candidate" | "employer"; name: string; verified: boolean; careerPhase?: string; candidateProfile?: unknown; location?: string };
export function requestToken(request: Request): string | null {
  const token = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export async function getSession(request: Request): Promise<Session> {
  const token = requestToken(request);
  if (!token) throw new ApiError(401, "Please sign in to continue.");
  const session = await prisma.authSession.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!session || session.expiresAt <= new Date()) throw new ApiError(401, "Your session has expired. Please sign in again.");
  if (session.role === "candidate") {
    const user = await prisma.user.findUnique({ where: { id: session.subjectId }, select: { id: true, email: true, name: true, isVerified: true, careerPhase: true, candidateProfile: true, location: true } });
    if (!user?.isVerified) throw new ApiError(401, "Please sign in with a verified account.");
    return { id: user.id, email: user.email, name: user.name, role: "candidate", verified: true, careerPhase: user.careerPhase, candidateProfile: user.candidateProfile, location: user.location };
  }
  if (session.role !== "employer") throw new ApiError(401, "Invalid session.");
  const employer = await prisma.employer.findUnique({ where: { id: session.subjectId }, select: { id: true, email: true, companyName: true, isVerified: true, emailVerificationRequired: true, emailVerifiedAt: true } });
  if (!employer) throw new ApiError(401, "Please sign in again.");
  if (employer.emailVerificationRequired && !employer.emailVerifiedAt) throw new ApiError(401, "Confirm your employer email before signing in.");
  return { id: employer.id, email: employer.email, name: employer.companyName, role: "employer", verified: employer.isVerified };
}
export async function startSession(response: NextResponse, request: Request, id: string, role: Session["role"]) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await prisma.authSession.create({ data: { tokenHash: hashToken(token), subjectId: id, role, expiresAt } });
  const previous = requestToken(request);
  if (previous) await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(previous) } });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
  return response;
}
