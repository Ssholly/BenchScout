const message = "BenchScout is temporarily unavailable while we complete an update. Please try again later.";
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BenchScout — Update in progress</title><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:linear-gradient(140deg,#eef8f6,#f5f7fc);color:#112b48;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{width:100%;max-width:560px;padding:clamp(24px,6vw,48px);background:white;border:1px solid #dce7ec;border-radius:24px;box-shadow:0 16px 60px #102b4810}.brand{font-family:Georgia,serif;font-size:30px;font-weight:700;letter-spacing:-1px}.brand span{color:#168d80}.status{display:inline-block;margin:32px 0 12px;padding:6px 10px;background:#e9f7f3;border-radius:999px;font-size:12px;font-weight:700;color:#137468}h1{margin:0 0 16px;font-size:clamp(27px,6vw,36px);line-height:1.2;letter-spacing:-1px}p{font-size:16px;line-height:1.7;color:#526579;margin:0 0 14px}.note{margin:26px 0 0;padding-top:20px;border-top:1px solid #e7edef;font-size:14px}</style></head><body><main><div class="brand">Bench<span>Scout</span></div><div class="status">UPDATE IN PROGRESS</div><h1>We’ll be back shortly.</h1><p>We’re updating BenchScout to improve your experience.</p><p>Sign-in, applications and document uploads are temporarily paused. Please try again later.</p><p class="note">Thank you for your patience.</p></main></body></html>`;
/** Terminal response: no fall-through to legacy pages, handlers, storage or database. */
export function containmentResponse(request: Request): Response {
  const pathname = new URL(request.url).pathname;
  const api = pathname === "/api" || pathname.startsWith("/api/");
  const headers = {
    "Content-Type": api ? "application/json; charset=utf-8" : "text/html; charset=utf-8",
    "Cache-Control": "private, no-store, max-age=0",
    "Retry-After": "300",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    "X-Robots-Tag": "noindex, nofollow",
  };
  return new Response(request.method === "HEAD" ? null : api ? JSON.stringify({ error: message, code: "SERVICE_TEMPORARILY_UNAVAILABLE" }) : html, { status: 503, headers });
}
