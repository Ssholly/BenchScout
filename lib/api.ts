import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, type Session } from "@/lib/auth";
import { ApiError, assertJobAccess, assertSameOrigin, hashToken, sanitizeResponse, secretMatches, textField } from "@/lib/security";

type Access = "public" | "candidate" | "employer" | "either" | "admin" | "cron";
type Options = { job?: "candidate" | "available" | "employer"; application?: boolean; verifiedEmployer?: boolean; limit?: number };
type Handler = (request: Request, session: Session | null) => Promise<Response>;

async function rateLimit(key: string, limit: number, windowMs = 60000) {
  const bucket = Math.floor(Date.now() / windowMs);
  const row = await prisma.rateLimit.upsert({
    where: { key: hashToken(`${key}:${bucket}`) },
    create: { key: hashToken(`${key}:${bucket}`), expiresAt: new Date((bucket + 1) * windowMs) },
    update: { count: { increment: 1 } },
  });
  if (row.count > limit) throw new ApiError(429, "Too many requests. Please try again shortly.");
}

// Each route explicitly declares its role and resource ownership requirements.
export function withApi(access: Access, handler: Handler, options: Options = {}) {
  return async (request: Request): Promise<Response> => {
    try {
      assertSameOrigin(request);
      const url = new URL(request.url);
      const length = Number(request.headers.get("content-length") || 0);
      if (length > 6 * 1024 * 1024) throw new ApiError(413, "Request is too large.");
      const isJson = request.headers.get("content-type")?.includes("application/json");
      let body: Record<string, unknown> = {};
      if (!["GET", "HEAD"].includes(request.method) && isJson) {
        const parsed: unknown = await request.json();
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new ApiError(400, "Expected a JSON object.");
        body = parsed as Record<string, unknown>;
        // Next's development request wrapper can share a consumed body with its
        // clone. Give the handler a fresh body after middleware inspection.
        const headers = new Headers(request.headers);
        headers.delete("content-length");
        request = new Request(request.url, { method: request.method, headers, body: JSON.stringify(body) });
      }
      let session: Session | null = null;
      if (access === "admin" || access === "cron") {
        const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") || (access === "admin" ? body.passcode ?? body.adminSecret : undefined);
        if (!secretMatches(supplied, access === "admin" ? process.env.ADMIN_SECRET : process.env.CRON_SECRET)) throw new ApiError(401, "Unauthorized.");
      } else if (access !== "public") {
        session = await getSession(request);
        if (access !== "either" && session.role !== access) throw new ApiError(403, "This action is not available for your account.");
        if (options.verifiedEmployer && !session.verified) throw new ApiError(403, "Your employer account needs review before publishing jobs or accessing candidates.");
        for (const key of ["email", "targetEmail", "employerId"]) {
          const supplied = body[key] ?? url.searchParams.get(key);
          const expected = key === "employerId" ? session.id : session.email;
          if (supplied != null && supplied !== expected) throw new ApiError(403, "Account identity does not match your session.");
        }
        if (options.application) {
          const id = textField(body.applicationId, "application ID");
          const application = await prisma.application.findUnique({ where: { id }, include: { job: true } });
          assertJobAccess(application?.job ?? null, session.id, "employer");
        }
        if (options.job) {
          const id = textField(body.jobId ?? url.searchParams.get("jobId"), "job ID");
          const job = await prisma.job.findUnique({ where: { id } });
          assertJobAccess(job, session.id, options.job);
        }
        // Existing clients can keep sending identity hints, but only the server supplies identity.
        if (isJson) {
          if (session.role === "candidate") { body.email = session.email; body.targetEmail = session.email; }
          else { body.employerId = session.id; }
          request = new Request(request.url, { method: request.method, headers: request.headers, body: JSON.stringify(body) });
        } else if (request.method === "GET" && session.role === "candidate") {
          url.searchParams.set("email", session.email);
          request = new Request(url, request);
        }
      }
      if (options.limit || (!['GET', 'HEAD'].includes(request.method) && access === "public")) {
        if (access === "public" && request.headers.get("content-type")?.includes("multipart/form-data")) {
          const form = await request.formData();
          body.email = form.get("email");
          const headers = new Headers(request.headers);
          headers.delete("content-type");
          headers.delete("content-length");
          request = new Request(request.url, { method: request.method, headers, body: form });
        }
        // Hosting must overwrite this header; fall back to one shared bucket off Vercel.
        const client = process.env.VERCEL ? request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown" : "local";
        await rateLimit(`${url.pathname}:${session?.id || client}`, options.limit || 10);
        if (typeof body.email === "string" && access === "public") await rateLimit(`account:${url.pathname}:${body.email.trim().toLowerCase()}`, 10);
      }
      const response = await handler(request, session);
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("X-Content-Type-Options", "nosniff");
      if (response.headers.get("content-type")?.includes("application/json")) {
        const result: unknown = await response.json();
        return NextResponse.json(response.status >= 500 ? { error: "The request could not be completed. Please try again." } : sanitizeResponse(result), { status: response.status, headers: response.headers });
      }
      return response;
    } catch (error) {
      const connectionUnavailable = !(error instanceof ApiError) && !!error && typeof error === "object" && "code" in error && ["P1001", "P1002", "P1017", "P2024"].includes(String(error.code));
      const status = error instanceof ApiError ? error.status : error instanceof SyntaxError ? 400 : connectionUnavailable ? 503 : 500;
      if (status >= 500) console.error("API request failed:", error);
      return NextResponse.json({ success: false, error: error instanceof ApiError ? error.message : status === 400 ? "Invalid request body." : connectionUnavailable ? "The database connection is temporarily unavailable. Please retry shortly." : "The request could not be completed. Please try again." }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : status === 503 ? { "Retry-After": "5" } : {}) } });
    }
  };
}
