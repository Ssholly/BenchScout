import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, salaryOwnerKey, textField } from "@/lib/security";
function reportFields(body: Record<string, unknown>) {
  const salary = Number(body.salary);
  if (!Number.isSafeInteger(salary) || salary < 1000 || salary > 100000000) throw new ApiError(400, "Enter a valid monthly salary in naira.");
  return { role: textField(body.role, "role"), location: textField(body.location, "location"), experience: textField(body.experience, "experience"), salary };
}
export const POST = withApi("candidate", async (request, session) => {
  const fields = reportFields(await request.json());
  const ownerKey = salaryOwnerKey(session!.id);
  const report = await prisma.salaryReport.upsert({ where: { ownerKey }, create: { ...fields, ownerKey }, update: fields });
  return NextResponse.json({ success: true, id: report.id });
}, { limit: 5 });
export const PUT = withApi("candidate", async (request, session) => {
  const body = await request.json();
  const id = textField(body.id, "report ID");
  const updated = await prisma.salaryReport.updateMany({ where: { id, ownerKey: salaryOwnerKey(session!.id) }, data: reportFields(body) });
  if (!updated.count) throw new ApiError(404, "Your salary report was not found.");
  return NextResponse.json({ success: true });
}, { limit: 5 });
export const DELETE = withApi("candidate", async (request, session) => {
  const { id } = await request.json();
  const deleted = await prisma.salaryReport.deleteMany({ where: { id: textField(id, "report ID"), ownerKey: salaryOwnerKey(session!.id) } });
  if (!deleted.count) throw new ApiError(404, "Your salary report was not found.");
  return NextResponse.json({ success: true });
});
export const GET = withApi("public", async () => {
  const aggregate = await prisma.salaryReport.aggregate({ _avg: { salary: true }, _count: true });
  const recent = await prisma.salaryReport.findMany({ select: { id: true, role: true, location: true, salary: true, experience: true, submittedAt: true }, orderBy: { submittedAt: "desc" }, take: 10 });
  // Only explicit monthly contributions are used; scraped salary strings may be annual or duplicated.
  return NextResponse.json({ average: Math.round(aggregate._avg.salary || 0), count: aggregate._count, recent, source: "Self-reported monthly salaries (NGN)", minimumSample: 5 });
});
