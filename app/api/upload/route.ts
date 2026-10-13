import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api";
import { ApiError, documentUrl } from "@/lib/security";
import { documentFields, documentKind, removeDocument, resumeText, storeDocument } from "@/lib/documents";

export const POST = withApi("candidate", async (request, session) => {
  const form = await request.formData();
  if (form.get("email") && form.get("email") !== session!.email) throw new ApiError(403, "Account identity does not match your session.");
  const kind = documentKind(form.get("documentType"));
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  const blob = await storeDocument(form.get("file"), kind, user.id);
  let updated;
  try {
    updated = await prisma.user.update({ where: { id: user.id }, data: {
      [documentFields[kind]]: blob.url,
      ...(kind === "license" ? { licenseNumber: null, licenseExpiry: null } : {}),
      ...((kind === "license" && user.careerPhase !== "internship") || (kind === "provisional" && user.careerPhase === "internship") ? { isLicenseVerified: false, licenseReviewedAt: null, licenseReviewReference: null } : {}),
      ...(kind === "resume" ? { cvParsedText: await resumeText(blob.buffer) } : {}),
    } });
  } catch (error) { await removeDocument(blob.url); throw error; }
  // Replacements are committed before removing the old object.
  await removeDocument(user[documentFields[kind]]).catch(error => console.error("Old document cleanup failed", error));
  return NextResponse.json({ success: true, url: documentUrl(user.id, kind), user: updated });
}, { limit: 10 });

export const DELETE = withApi("candidate", async (request, session) => {
  const body = await request.json();
  const kind = documentKind(body.documentType);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  // Never delete a URL supplied by the client.
  await removeDocument(user[documentFields[kind]]);
  await prisma.user.update({ where: { id: user.id }, data: {
    [documentFields[kind]]: null,
    ...(kind === "license" ? { licenseNumber: null, licenseExpiry: null } : {}),
    ...((kind === "license" && user.careerPhase !== "internship") || (kind === "provisional" && user.careerPhase === "internship") ? { isLicenseVerified: false, licenseReviewedAt: null, licenseReviewReference: null } : {}),
    ...(kind === "resume" ? { cvParsedText: null } : {}),
  } });
  return NextResponse.json({ success: true });
});
