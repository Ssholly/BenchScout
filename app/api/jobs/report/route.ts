import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/security";

export const POST = withApi("candidate", async (request, session) => {
  const body = await request.json();
  const jobId = textField(body.jobId, "vacancy ID");
  const reason = textField(body.reason, "report reason");
  if (!["payment", "impersonation", "fake-vacancy", "sensitive-data", "other"].includes(reason)) throw new ApiError(400, "Choose a report reason.");
  const details = textField(body.details, "report details", 2000);
  if (details.length < 10) throw new ApiError(400, "Describe what happened in at least 10 characters.");
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || (!job.isDirectPost && job.userId !== session!.id)) throw new ApiError(404, "Vacancy not found.");
  // Duplicate submissions retain the original report and cannot reopen a resolved one.
  await prisma.jobReport.upsert({ where: { jobId_reporterId: { jobId, reporterId: session!.id } }, create: { jobId, reporterId: session!.id, reason, details }, update: {} });
  return NextResponse.json({ success: true, message: "Report received for administrator review. Do not send money or sensitive financial information." });
}, { limit: 5 });
