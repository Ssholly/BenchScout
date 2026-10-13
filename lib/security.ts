import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function secretMatches(value: unknown, secret: string | undefined): boolean {
  if (!secret || secret.length < 32 || typeof value !== "string") return false;
  return timingSafeEqual(Buffer.from(hashToken(value)), Buffer.from(hashToken(secret)));
}
export function salaryOwnerKey(subjectId: string): string {
  const secret = process.env.SALARY_OWNER_SECRET;
  if (!secret || secret.length < 32) throw new ApiError(503, "Salary contributions are not configured yet.");
  return createHmac("sha256", secret).update(subjectId).digest("hex");
}
export function textField(value: unknown, name: string, max = 250): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new ApiError(400, `Invalid ${name}.`);
  return value.trim();
}
export function emailField(value: unknown): string {
  const email = textField(value, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Invalid email.");
  return email;
}
export function passwordField(value: unknown): string {
  if (typeof value !== "string" || value.length < 12 || Buffer.byteLength(value) > 72) throw new ApiError(400, "Use a password of at least 12 characters and at most 72 bytes.");
  return value;
}
export function applicationOrigin(request: Request) {
  const url = new URL(request.url);
  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXT_PUBLIC_APP_URL) throw new ApiError(503, "Application URL is not configured.");
    try {
      const configured = new URL(process.env.NEXT_PUBLIC_APP_URL);
      if (configured.protocol !== "https:" || configured.username || configured.password) throw new Error("Invalid application URL");
      return configured.origin;
    } catch { throw new ApiError(503, "Configure a valid HTTPS application URL."); }
  }
  const host = request.headers.get("host");
  return host ? new URL(`${url.protocol}//${host}`).origin : url.origin;
}
export function assertSameOrigin(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== applicationOrigin(request))) throw new ApiError(403, "Cross-site request rejected.");
}
export function documentUrl(userId: string, kind: string) {
  return `/api/documents?userId=${encodeURIComponent(userId)}&kind=${encodeURIComponent(kind)}`;
}
const documentFields: Record<string, string> = { resumeUrl: "resume", licenseUrl: "license", provisionalUrl: "provisional", degreeUrl: "degree", statementOfResultUrl: "result", placementLetterUrl: "placement", certificateUrl: "certificate", avatarUrl: "avatar" };
// Defense in depth: credentials and storage locations never leave a JSON API response.
export function sanitizeResponse(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeResponse);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (["password", "passwordHash", "tokenHash", "ownerKey", "cvParsedText"].includes(key)) continue;
    if (key in documentFields && entry) {
      clean[key] = typeof record.id === "string" ? documentUrl(record.id, documentFields[key]) : null;
    } else if (key === "isLicenseVerified") {
      clean[key] = entry === true && Boolean(record.licenseReviewedAt);
    } else clean[key] = sanitizeResponse(entry);
  }
  if (typeof record.id === "string" && Object.keys(documentFields).some(field => field in record)) {
    clean.documentStatus = Object.fromEntries(Object.entries(documentFields).map(([field, kind]) => {
      let status = "missing";
      if (typeof record[field] === "string" && record[field]) {
        try { status = new URL(record[field] as string).hostname.endsWith(".private.blob.vercel-storage.com") ? "private" : "legacy"; } catch { status = "legacy"; }
      }
      return [kind, status];
    }));
  }
  return clean;
}
export function assertJobAccess(job: { userId: string | null; employerId: string | null; isDirectPost: boolean; status?: string | null } | null, subjectId: string, scope: "candidate" | "available" | "employer") {
  if (!job) throw new ApiError(404, "Job not found.");
  const allowed = scope === "employer" ? job.employerId === subjectId : job.userId === subjectId || (scope === "available" && job.isDirectPost && job.status === "active");
  if (!allowed) throw new ApiError(403, "You do not have access to this job.");
}
export function safeExternalUrl(value: unknown): string {
  const raw = textField(value, "URL", 2048);
  let url: URL;
  try { url = new URL(raw); } catch { throw new ApiError(400, "Invalid URL."); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new ApiError(400, "Use an HTTP or HTTPS URL.");
  return url.toString();
}
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
