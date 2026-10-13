# BenchScout

A career workspace for Nigerian medical laboratory scientists and employers: sourced job matching, applications, private credential storage, renewal tracking, employer interviews, and salary contributions.

## Local setup

Requires Node 22+, npm, and PostgreSQL. Copy `.env.example` to `.env` and configure a development database. Never use a production database for local tests.

```sh
npm ci
npx prisma migrate deploy
npm run dev
```

Generate independent `ADMIN_SECRET`, `CRON_SECRET`, and `SALARY_OWNER_SECRET` values with `openssl rand -hex 32`. A private Vercel Blob store is required for document uploads. Accounts can be created before adding a CV. Use its token as `BLOB_PRIVATE_READ_WRITE_TOKEN`; a public store token cannot substitute for it. Configure `EMAIL_FROM` with a verified sender and either Resend or Gmail SMTP. Set `NEXT_PUBLIC_APP_URL` to the actual app origin.

External listings work through source adapters in `lib/job-sources.ts`. Apify and Gemini are optional; without Gemini, automatic extraction and letter generation are unavailable. AI-extracted license details are self-reported until independently reviewed. Job source layouts and third-party APIs require ongoing monitoring; a successful build does not validate live feeds.

## Checks

```sh
npm run check
npm run build -- --webpack
```

Tests run against isolated mocks and never connect to `.env`'s database. They cover session expiry/revocation, cross-account access, applicant ownership, private documents, destructive endpoint removal, rate limits, password rules, salary ownership, application idempotency, matching, scheduling, and profile readiness. A staging database and configured services are still required for full end-to-end delivery testing.

## Accounts and documents

Login creates a seven-day HttpOnly cookie containing an opaque random token. Only its hash is stored in PostgreSQL. Every protected API checks the session and resource ownership. Logout revokes the session; password reset revokes all candidate sessions. Browser storage is a UI cache only. API responses strip password hashes and internal storage locations.

Files are private. `/api/documents` checks ownership on every download. Verified employers may access documents only from candidates who applied to their jobs. Salary contributions use a keyed pseudonymous owner identifier so contributors can edit their own entry; these identifiers are never returned publicly. Keep `SALARY_OWNER_SECRET` stable or existing contributions will need a migration to remain editable.

Employer publication and applicant access require review. `/admin/reviews` records approval/revocation and evidence references using `ADMIN_SECRET`. License review requires a document, registration number, and future expiry. This records a human review; it is not an integration with the regulator's registry.

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
