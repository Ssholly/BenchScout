# API review — 9 October 2026

This is a code and configuration review, not a penetration-test certification or a live provider benchmark. No private documents, email messages, or paid scans were submitted during this review.

| Service | Decision | Controls and remaining work |
| --- | --- | --- |
| App authentication and data APIs | Keep | Server sessions, role/ownership checks, CSRF checks and rate limits protect active routes. Production needs the canonical application origin configured. Test employer/admin flows with those roles before release. |
| Gemini document extraction and letters | Keep provider; replaced deprecated client | Shared server REST adapter now keeps keys in headers, sets a 30-second timeout, rejects blocked/truncated responses, and validates structured license data. Documents are untrusted input; extraction does not verify credentials. Set GEMINI_MODEL to an available model and compare quality/cost on representative consented samples before switching. |
| Apify job collection | Keep optional; change orchestration next | Keys remain server-side in Authorization headers; scans send job/location filters, not CVs. Short synchronous waits are fragile for long actors. Prefer a background run plus authenticated completion callback or polling, with deduplication and retry limits. Use scoped provider tokens. This architecture change has not been deployed. |
| MyJobMag / HotNigerianJobs HTML | Retain as secondary sources | Fixed source URLs and validated posting links reduce URL abuse, but HTML selectors can break. Add structured employer/ATS feeds where available, plus source health monitoring. Coverage must be measured; a replacement cannot promise more Nigerian MLS jobs without a trial. |
| Resend / SMTP | Keep Resend primary | Active routes use the shared awaited mailer and configured SMTP fallback. Verify the sending domain and check real inbox delivery. Unused legacy mail helpers should be retired before anyone reuses them. |
| Neon / Prisma | Keep | Shared database client and guarded queries already exist. A transient connection failure recovered in the browser audit. Check connection pooling, latency and redundant reads before considering a database replacement. |
| Private Blob documents | Keep, configure before document rollout | File type/size validation and guarded private access are implemented. Private storage is currently unconfigured. Legacy public objects are retained; they still require migration or re-upload and access cleanup. |
| Salary data | Keep first-party reports | Removed the fabricated fallback and unrelated scraped salary estimate. Labels now describe self-reported monthly figures, and the displayed overall average requires at least five reports. Five is a UI threshold, not statistical proof. Recent location figures are explicitly not market benchmarks. |

## Changes implemented

- Removed deprecated `@google/generative-ai`; use the documented Gemini REST API through `lib/gemini.ts`.
- Added structured extraction, strict field/date validation, bounded responses, timeouts, and friendly provider failures. Both active AI routes share the adapter.
- Added six mocked adapter tests; no provider keys or private content appear in test output.
- Corrected salary presentation to reflect actual report counts and sample limitations.

## Primary references

- [Google libraries and legacy SDK status](https://ai.google.dev/gemini-api/docs/libraries)
- [Gemini generateContent REST API](https://ai.google.dev/api/generate-content)
- [Structured output and validation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)
- [Model availability and deprecations](https://ai.google.dev/gemini-api/docs/deprecations)
- [Apify API authentication and integrations](https://docs.apify.com/integrations/api)
- [SmartRecruiters posting API](https://developers.smartrecruiters.com/docs/posting-api)
- [Resend sending-domain verification](https://resend.com/docs/dashboard/domains/introduction)


## Employer safety integration — 16 October 2026

Employer verification now includes private company submissions, independent evidence checks, per-vacancy moderation, candidate reports, suspension and an audit history. See [the employer verification reference](EMPLOYER-VERIFICATION.md#api-contracts) for all routes, payloads, limits, status transitions and privacy controls.

This extends the existing PostgreSQL/Prisma, server-session, administrator-secret and API-wrapper integrations. There is no new external provider, API key, environment variable, automated CAC lookup, regulator verification integration or moderation notification service. The official CAC public search is linked for human review; supplied company websites are stored as references and are not fetched by these routes.

The additive migration has been applied to the configured database, and an authenticated local queue read returned 200. Lint, TypeScript, all 153 tests and the production build passed. Hosted application deployment and complete populated staging flows remain outstanding. Earlier sections above record the 9 October review; their configuration observations are historical, not a replacement for this dated release record or the newer private-storage audit.


## 20 October 2026 — CV keyword extraction and normalized preferences

Added authenticated `POST /api/extract-resume` for explicit-consent, review-before-save CV suggestions using the existing Gemini integration. Added readable-text metadata to resume upload responses and normalized string/array keywords in `POST /api/user`. No new provider, key, migration or automatic consent. See [CV skills and role keywords](RESUME-KEYWORDS.md) for payloads, limits, privacy, races, tests and release boundaries.
