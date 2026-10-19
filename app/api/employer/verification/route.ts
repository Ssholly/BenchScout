import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { verificationSubmission } from "@/lib/employer-safety";

const fields = { companyName: true, isVerified: true, verificationStatus: true, verificationDetails: true, verificationFeedback: true, verificationRevision: true } as const;
export const GET = withApi("employer", async (_request, session) => {
  const employer = await prisma.employer.findUniqueOrThrow({ where: { id: session!.id }, select: fields });
  return NextResponse.json(employer);
});
export const POST = withApi("employer", async (request, session) => {
  const details = verificationSubmission(await request.json());
  await prisma.$transaction(async tx => {
    // updateMany locks this employer row; a suspended employer cannot self-reactivate.
    const updated = await tx.employer.updateMany({ where: { id: session!.id, verificationStatus: { not: "suspended" } }, data: {
      verificationDetails: details, verificationStatus: "pending", verificationRevision: { increment: 1 },
      verificationFeedback: null, isVerified: false, verifiedAt: null,
    } });
    if (!updated.count) throw new ApiError(403, "This account is suspended. Contact support for a review.");
    // All existing vacancies must be checked again after company details change.
    await tx.job.updateMany({ where: { employerId: session!.id, isDirectPost: true, status: "active" }, data: { status: "pending-review" } });
  });
  return NextResponse.json({ success: true, message: "Submitted for independent review. Posting and candidate access are paused until approval." });
}, { limit: 5 });
