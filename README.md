# BenchScout

A career workspace for Nigerian medical laboratory scientists and employers: sourced job matching, applications, private credential storage, renewal tracking, employer interviews, and salary contributions.

## Current pilot

The owner-approved controlled pilot is live at [bench-scout.vercel.app](https://bench-scout.vercel.app). [23 October cutover record and remaining checks](docs/CONTROLLED-PILOT-2026-10-23.md): public access checks passed and cleanup schedule registered; public browser sign-in persistence passed; actual scheduled execution remains pending. Main merge and older-file backup copying are separate.

[87% mobile polish](docs/MOBILE-POLISH-2026-10-24.md): released publicly with corrected account input sizing, side-by-side Home actions and collapsible employer preview; native iPhone focus confirmation remains.

## Local setup

Requires Node 22+, npm, and PostgreSQL. Copy `.env.example` to `.env` and configure a development database. Never use a production database for local tests.

```sh
npm ci
npx prisma migrate deploy
npm run dev
```

Generate independent `ADMIN_SECRET`, `CRON_SECRET`, and `SALARY_OWNER_SECRET` values with `openssl rand -hex 32`. A private Vercel Blob store is required for document uploads. Accounts can be created before adding a CV. Use its token as `BLOB_PRIVATE_READ_WRITE_TOKEN`; a public store token cannot substitute for it. Configure `EMAIL_FROM` with a verified sender and either Resend or Gmail SMTP. Set `NEXT_PUBLIC_APP_URL` to the actual app origin.

External listings work through source adapters in `lib/job-sources.ts`. Apify and Gemini are optional; without Gemini, AI skills suggestions, license extraction and letter generation are unavailable. CV skill suggestions require explicit consent and review before saving; see [CV skills and role keywords](docs/RESUME-KEYWORDS.md). AI-extracted license details are self-reported until independently reviewed. Job source layouts and third-party APIs require ongoing monitoring; a successful build does not validate live feeds.

[Settings loading correction](docs/SETTINGS-PERFORMANCE.md): released publicly with reduced account reads and bounded retry; measured limits recorded.

[Mobile scale correction](docs/MOBILE-SCALE-2026-10-23.md): released publicly with native page scale, readable profile and consistent phone navigation; physical iPhone verification remains.

[87% mobile testing preview](docs/MOBILE-87-PREVIEW-2026-10-24.md): smaller starting scale and a compact profile; testing only pending iPhone review.

## Checks

```sh
npm run check
npm run build -- --webpack
```

Tests run against isolated mocks and never connect to `.env`'s database. They cover session expiry/revocation, cross-account access, applicant ownership, private documents, destructive endpoint removal, rate limits, password rules, salary ownership, application idempotency, matching, scheduling, profile readiness, employer evidence/revision checks, vacancy moderation, suspension, scam reporting and removed-listing refreshes. A staging database and configured services are still required for full end-to-end delivery testing.

## Accounts and documents

Login creates a seven-day HttpOnly cookie containing an opaque random token. Only its hash is stored in PostgreSQL. Every protected API checks the session and resource ownership. Logout revokes the session; password reset revokes all candidate sessions. Browser storage is a UI cache only. API responses strip password hashes and internal storage locations.

Files are private. `/api/documents` checks ownership on every download. Verified employers may access only still-current documents selected for an application to their organisation. Applicant links are scoped to that application; replacing a file does not automatically share its replacement. See [Application document sharing](docs/APPLICATION-DOCUMENT-SHARING.md). Salary contributions use a keyed pseudonymous owner identifier so contributors can edit their own entry; these identifiers are never returned publicly. Keep `SALARY_OWNER_SECRET` stable or existing contributions will need a migration to remain editable.

Employer publication and applicant access require review. Company submissions, CAC/contact evidence checks, per-vacancy moderation, candidate scam reports and suspension decisions are described in [the employer verification workflow](docs/EMPLOYER-VERIFICATION.md). `/admin/reviews` records approval/revocation and evidence references using `ADMIN_SECRET`. License review requires a document, registration number, and future expiry. This records a human review; it is not an integration with the regulator's registry.

## Existing deployment upgrade

Read [the deployment checklist](docs/DEPLOYMENT.md) before applying changes to an existing database. This repository includes a baseline for the pre-existing schema and a separate security migration. Do not run the baseline creation SQL against an already populated database.

Legacy public files remain public until migrated and deleted from the old store. The app refuses to serve those legacy URLs as private documents. Preview migration counts with:

```sh
npm run documents:migrate
```

After backing up the database and configuring both blob tokens, explicitly apply:

```sh
npm run documents:migrate -- --apply
```

The script copies each object privately, updates all references transactionally, then deletes the original public object. Address any cleanup failures before reopening the app. Existing self-declared verification flags do not count as reviewed without `licenseReviewedAt`.

## Server schedules

Configure your scheduler to call `GET /api/cron/daily-digest` every minute with `Authorization: Bearer <CRON_SECRET>`. The route respects each user's saved days, time, and timezone, claims at most three due accounts per tick, and prevents duplicate daily runs. It processes additional accounts on subsequent ticks. A scan lease expires after two minutes if a worker is interrupted. Large deployments should move scans to a durable job queue.

Call `GET /api/cron/daily-digest/compliance-check` once daily with the same header for expiry reminders. Query-string secrets are not supported. Admin and cron secrets are separate and have no defaults. `/api/setup` and `/api/test-email` are permanently disabled.

Rate limits are stored in PostgreSQL. On Vercel the app uses the platform-controlled forwarding header; other hosts use one shared anonymous bucket until configured with a trusted proxy identity. Expired sessions and rate-limit rows are cleaned by the digest scheduler.

## Product direction

Implemented improvements include an application-readiness checklist, source and relevance explanations, independent review status, honest empty states, idempotent applications, and month-aware interview dates. See [the product roadmap](docs/ROADMAP.md) for the next focused improvements.


## Documentation and release records

- [Professional summaries](docs/PROFESSIONAL-SUMMARIES.md): candidate consent, preview, allowlisted fields, employer access, API contracts and limitations.

- [Launch audit](docs/LAUNCH-AUDIT.md): dated findings, local fixes, regression evidence, remaining pilot blockers and release status.
- [Durable document cleanup](docs/DOCUMENT-CLEANUP.md): transactional deletion intents, retries, stale-write protection, operator/cron access, migration evidence and limitations.
- [Legacy containment](docs/LEGACY-CONTAINMENT.md): isolated temporary pause build, exact source, availability impact, validation and activation boundary.
- [Historical deployment isolation](docs/DEPLOYMENT-ISOLATION.md): anonymous access evidence, credential limits, public legacy containment and exact proposed retirement IDs.
- [Protected cron authentication check](docs/CRON-AUTHENTICATION-CHECK.md): plan-only default, explicitly approved temporary access, read-only dry-run and token revocation/recovery.
- [Current public release decision packet](docs/PUBLIC-RELEASE-PACKET.md): exact candidate, accepted evidence, build/promotion separation, scheduler, smoke, rollback and main-merge boundaries.
- [23 October controlled reopening decision](docs/CUTOVER-DECISION-2026-10-23.md)
- [Public-app release and rollback plan](docs/PRODUCTION-RELEASE-PLAN.md): cutover gates, live-canonical build, smoke checks, safe fallback and separate real-file copy approval.
- [Main release readiness](docs/MAIN-RELEASE-READINESS.md): current configuration, staged runtime evidence and ordered backfill/cutover gates.
- [Production runtime acceptance](docs/PRODUCTION-RUNTIME-ACCEPTANCE.md): staged Production deployment, protected database/storage/alert diagnostics and promotion boundaries.
- [Production older-file backfill](docs/PRODUCTION-DOCUMENT-BACKFILL.md): metadata preview, signed current-file plans and the default-off copy gate tied to live backup hooks or a controlled write pause.

- [Candidate readiness and brand review](docs/CANDIDATE-AND-BRAND-REVIEW.md): profile separation, pilot gaps, focused tests and preliminary CAC/domain checks.

- [Employer and vacancy verification](docs/EMPLOYER-VERIFICATION.md): workflows, every affected screen/component, API payloads, data models, states, access controls, integrations, migration results, tests and remaining checks.
- [Deployment](docs/DEPLOYMENT.md): database/code rollout sequence and operational checks.
- [API review](docs/API-REVIEW.md): provider decisions and dated integration updates.
- [Change log](docs/CHANGELOG.md): additions, changes and deployment status by release.

Update the relevant docs whenever adding or changing features, integrations, API contracts, schema, permissions, configuration or operational behaviour. Record what was actually verified and distinguish local code, applied database changes and hosted deployment status. Do not copy credentials, private submissions or real candidate/report data into documentation.

The [BenchScout business and launch proposal](docs/proposals/BenchScout_Business_and_Launch_Proposal.docx) presents the employer-funded recruitment strategy, controlled pilot and phased launch roadmap. Its [editable text source](docs/proposals/BenchScout_Business_and_Launch_Proposal.md) is retained for future updates. Targets and commercial terms in the proposal are planning assumptions, not reported traction or approved commitments.

- [Application document sharing](docs/APPLICATION-DOCUMENT-SHARING.md): per-application selection, file-version access, migration and retention boundaries.

- [Candidate credential review](docs/CANDIDATE-CREDENTIAL-REVIEW.md): version-bound approval, private evidence access, audit records and stale-write protection.

- [Isolated staging acceptance](docs/STAGING-ACCEPTANCE.md): real HTTP/database/private-file journey, captured mail, browser fixtures and scoped cleanup. Run `npm run acceptance` for preflight.

- [Hosted operations readiness](docs/OPERATIONS-READINESS.md): verified environment scopes, dedicated testing setup, inbox acceptance and backup/restore gates.
- [Private document recovery](docs/DOCUMENT-RECOVERY.md): continuous encrypted backup and isolated restoration tooling, testing setup, evidence and remaining hosted checks.

- [Testing credentials and email acceptance](docs/TESTING-CREDENTIALS.md): secure operator setup, branch scope, deployment checks and controlled inbox tests.

- [Account email branding](docs/ACCOUNT-EMAILS.md): shared confirmation/reset design, embedded logo, role-specific links, validation and inbox-rendering limits.

- [Hosted employer acceptance](docs/HOSTED-EMPLOYER-ACCEPTANCE.md): synthetic testing-site recruitment journey, operator handoffs, evidence and remaining gates.

Recruitment screens and responsive layout: [compact employer workspace and matches](docs/RECRUITMENT-LAYOUT.md).
