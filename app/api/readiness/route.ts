import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { applicationReadiness } from "@/lib/readiness";
export const GET = withApi("candidate", async (_request, session) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  return NextResponse.json(applicationReadiness(user));
});
