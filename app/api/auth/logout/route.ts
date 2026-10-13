import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requestToken, SESSION_COOKIE } from "@/lib/auth";
import { hashToken } from "@/lib/security";
export const POST = withApi("public", async request => {
  const token = requestToken(request);
  if (token) await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return response;
});
