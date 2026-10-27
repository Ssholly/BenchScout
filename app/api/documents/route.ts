import { sharedDocumentKinds } from "@/lib/application-documents";
import { get } from "@vercel/blob";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/security";
import { documentFields, documentKind, isPrivateBlob, privateBlobToken } from "@/lib/documents";
export const GET = withApi("either", async (request, session) => {
  const query = new URL(request.url).searchParams;
  const userId = textField(query.get("userId"), "user ID");
  const kind = documentKind(query.get("kind"));
  if (session!.role === "candidate" && session!.id !== userId) throw new ApiError(403, "Document access denied.");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (session!.role === "employer") {
    if (!session!.verified) throw new ApiError(403, "Employer verification required.");
    const applicationId = query.get("applicationId");
    const applications = await prisma.application.findMany({ where: { userId, ...(applicationId ? { id: applicationId } : {}), job: { employerId: session!.id } }, select: { documentSelection: true } });
    if (!user || kind === "avatar" || !applications.some(application => sharedDocumentKinds(application.documentSelection, user).includes(kind))) throw new ApiError(403, "This document is not shared with your organisation for this application, or has been replaced or removed.");
  }
  const url = user?.[documentFields[kind]];
  if (!url) throw new ApiError(404, "Document not found.");
  // Legacy public files must be migrated before being served through this endpoint.
  if (!isPrivateBlob(url)) throw new ApiError(409, "This legacy document needs to be uploaded again to private storage.");
  const blob = await get(url, { access: "private", token: privateBlobToken(), useCache: false });
  if (!blob || blob.statusCode !== 200) throw new ApiError(404, "Document not found.");
  if (!["application/pdf", "image/png", "image/jpeg"].includes(blob.blob.contentType)) throw new ApiError(415, "Unsupported document type.");
  return new Response(blob.stream, { headers: {
    "Content-Type": blob.blob.contentType,
    "Content-Disposition": `${query.get("download") === "1" ? "attachment" : "inline"}; filename="${kind}.${blob.blob.contentType === "application/pdf" ? "pdf" : blob.blob.contentType === "image/png" ? "png" : "jpg"}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox; frame-ancestors 'self'",
    "X-Frame-Options": "SAMEORIGIN",
  } });
});
