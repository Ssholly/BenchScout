import { NextResponse } from "next/server";
import { applicationOrigin } from "@/lib/security";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { scheduleDue } from "@/lib/job-matching";
import { runJobScan } from "@/lib/job-scanner";
export const maxDuration = 60;
const handler = withApi("cron", async request => {
  const now = new Date();
  await prisma.authSession.deleteMany({ where: { expiresAt: { lt: now } } });
  await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  const users = await prisma.user.findMany({ where: { alertsActive: true, isVerified: true }, orderBy: { lastScheduledAt: "asc" } });
  const due = users.filter(user => scheduleDue(user, now));
  const results = await Promise.allSettled(due.slice(0, 3).map(async user => {
    // Compare-and-set prevents overlapping cron requests from claiming the same daily run.
    const claimed = await prisma.user.updateMany({ where: { id: user.id, lastScheduledAt: user.lastScheduledAt }, data: { lastScheduledAt: now } });
    if (!claimed.count) return;
    try { await runJobScan(user.id, { autoSend: user.autoSendEmail }, "Automated", applicationOrigin(request)); }
    catch (error) { await prisma.user.updateMany({ where: { id: user.id, lastScheduledAt: now }, data: { lastScheduledAt: user.lastScheduledAt } }); throw error; }
  }));
  return NextResponse.json({ success: true, processed: results.filter(result => result.status === "fulfilled").length, failed: results.filter(result => result.status === "rejected").length, remaining: Math.max(0, due.length - 3) });
});
export const GET = handler;
export const POST = handler;
