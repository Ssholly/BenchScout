# Employer and vacancy safety — 16 October 2026

## Workflow

1. An employer confirms their email, signs in, and opens Company verification in the employer portal. Submission includes the legal name, CAC number (or establishing authority / official directory reference for a public institution), address, optional official website, recruiter name/role, work email, phone, recruitment-authority evidence, and applicable operating credentials. Public institutions have an alternative to a CAC number. These are self-reported details until reviewed. Do not request passwords, financial details or identity documents here.
2. An administrator opens `/admin/reviews`, enters the existing administrator secret, and loads the queue. Company approval requires separate written evidence for registration, recruiter authority, organisation presence, and operating credentials (including an explanation when not applicable). Check the official CAC public search at https://icrp.cac.gov.ng/public-search/; obtain contact details independently rather than trusting the applicant's phone or website alone. Record sources and dates, not simply “checked”. An existing business can be impersonated: contact its official switchboard to establish recruiter authority. No CAC or regulator API integration is claimed.
3. Approve, request changes/reject, or suspend the employer. The employer sees feedback. Every new decision appends the reviewer name, evidence, submission snapshot and time to the audit history. Revision checks reject stale approvals. Reviewer names are recorded under the existing shared administrator secret; they are not individually authenticated administrator identities.
4. Approved employers submit vacancies with a no-fees declaration. New vacancies and every edit remain `pending-review` until the administrator independently confirms recruitment authority, the specific opening and terms, and no fees / suspicious requests. The vacancy review records a snapshot of the reviewed content. Internship accreditation remains a separate official-source check.
5. Candidates can expand a listing's source/evidence section and use “Report suspicious job”. Reports cover fee requests, impersonation, fake vacancies and sensitive-data requests. Reports require a candidate session and do not disclose the reporter to employers. One report per candidate/vacancy prevents duplicate submissions from flooding the queue. Reporting does not automatically penalise an employer.
6. Administrators investigate open reports and either dismiss them with evidence or remove the vacancy. For broader abuse, use the report's employer email to find the company and save a suspension. Removed external listings stay removed when the scanner refreshes their contents. Previously submitted applications remain visible as history.

Company-detail changes reset company approval and pause active vacancies for renewed review. Suspension revokes publication, candidate-directory, applicant and private-document access on subsequent authenticated requests. A suspended employer cannot lift its suspension through resubmission. An administrator must record a rejection / request-changes decision to allow a fresh submission. Company reinstatement does not automatically publish paused vacancies.

## Rollout

- Apply `20261016000000_employer_safety` before deploying compatible code. Run `npx prisma migrate status`, reconcile existing manually applied schema upgrades as described in `docs/DEPLOYMENT.md`, then `npx prisma migrate deploy`. Never reset an existing database.
- This migration is additive: four employer fields, an append-only decision table, and a candidate-report table. It preserves existing company approvals as `legacy-approved`. Existing active vacancies also remain active. These historic decisions do not establish that the new checklist was completed: find existing employers by email, request updated submissions and re-review them. A forced retrospective suspension is deliberately not part of this migration.
- Existing employer email-confirmation rollout is preserved. Newly registered employers require confirmed email; legacy accounts retain their previous email policy. Independent recruiter-contact checks are still required for company approval.
- New models and normal employer queries require the migration. `scripts/check-database.cjs` checks the required columns without printing connection strings or user records.
- Deploy the application only after the database upgrade succeeds. Assign someone to monitor `/admin/reviews`: queued vacancies and reports do not send administrator notifications, and review is a manual operating responsibility.
- The queue displays up to 50 pending items in each category and the latest 25 audit events. Resolve pending items and reload to reveal later items. Any existing employer can also be found by email.
- Submission references are private text, not uploaded certificates. Reviewers obtain and verify supporting evidence independently. Approval is a recorded review, not a guarantee against fraud.

## Validation

Lint, TypeScript and the production build passed. Automated tests use isolated database/session mocks; they never approve real employers, contact organisations, create real accounts or send email. Coverage includes missing checks, stale company/vacancy decisions, approval audit rollback, suspension and resubmission guards, moderation on post/edit, discovery and application restrictions, candidate report deduplication/ownership, administrator authentication, and removal surviving source refresh.

The administrator form and conditional company evidence fields were inspected in the local connected browser. A populated employer submission, populated administrator queue, narrow-screen interactions and a complete real-database review/report cycle still require staging verification after migration. No production deployment has been performed for this change.

The configured database migration subsequently succeeded through Prisma migrate deploy, including recording the two previously manual additive upgrades. The post-migration compatibility check found no missing columns, and the authenticated local administrator queue returned HTTP 200 with company, vacancy, report and audit arrays. No real employer decision or report was created during verification. Final automated validation: lint, TypeScript and all 153 tests passed; the production build passed.

## Screens and implementation map

| File / screen | Addition or changed behaviour |
| --- | --- |
| `components/EmployerVerification.tsx` in `/employer` | Loads private company submission/status, refreshes status, displays reviewer feedback, collects organisation details and declarations. Updating details warns that approval and active vacancies will pause. Suspended accounts see support guidance instead of a submission form. |
| `app/employer/page.tsx` | Integrates the verification card and approval-state callback. Vacancy creation includes a required recruitment-authority/no-fees declaration; success messages say submitted for review. Edits return vacancies to review. Vacancy rows label `pending-review` as Awaiting review. |
| `app/admin/reviews/page.tsx` | Loads pending company/vacancy/report queues; finds any employer by account email; displays submission and vacancy details; collects evidence, reviewer name, employer feedback and explicit decisions; exposes recent audit history. Candidate-license and internship-institution review options remain available. Administrator secrets remain in component memory and clear after a successful decision. |
| `components/JobReport.tsx` via `components/ListingEvidence.tsx` | Adds an expandable report control to the source/evidence section of Job Matches listings, with a reason, bounded explanation and success/error messages. No separate report inbox or email is sent to the employer. |
| `app/globals.css` | Shared verification, report and admin form styles, wrapping, disabled states, 16px form inputs, and narrow-screen spacing. Narrow-screen browser behaviour still needs verification. |
| `lib/employer-safety.ts` | Shared submission validation and required company/vacancy evidence checks. |
| `app/api/jobs/route.ts` | Candidate discovery excludes unpublished direct vacancies and unapproved employers. Existing applications remain visible as history. Employer-owned vacancy lists still include pending items for management. |
| `app/api/apply/route.ts` | Rechecks direct-vacancy active status and current employer approval before accepting an application. |
| `app/api/jobs/direct/route.ts` | New vacancies require `noFees: true`; creation and edits use `pending-review`. Client-supplied status cannot publish a vacancy. |
| `lib/job-scanner.ts` | Refreshes an existing externally sourced listing without restoring `active` when its status is `removed`. This applies to that saved listing, not every copy of the source URL across accounts. |
| `scripts/check-database.cjs` | Loads project environment configuration and checks the new fields/tables through read-only metadata queries. It does not print credentials or account records. |

## API contracts

All routes below use the existing `withApi` wrapper: session/role checks where applicable, same-origin mutation checks, private no-store responses and JSON response sanitisation. No new authentication provider, environment variable, paid service or background worker is introduced. Company and vacancy approval are separate from email confirmation.

| Method and route | Access | Contract / effect |
| --- | --- | --- |
| `GET /api/employer/verification` | Employer session | Returns only the signed-in employer's `companyName`, `isVerified`, `verificationStatus`, `verificationDetails`, `verificationFeedback` and `verificationRevision`. |
| `POST /api/employer/verification` | Employer session; 5 requests/minute | Validates the submission below. Transactionally stores details, increments revision, sets `pending`, clears feedback/current approval date, sets `isVerified=false` and moves active direct vacancies to `pending-review`. Suspended accounts receive 403. Success returns `success` and a submission message. |
| `GET /api/admin/reviews` | `Authorization: Bearer <ADMIN_SECRET>` | Returns `employers`, `vacancies`, `reports` and `history`. Optional `?account=<encoded-email>` replaces the pending-company filter with exact normalised email lookup; it does not filter the other queues. Pending queues return up to 50 oldest entries each; history returns the latest 25 decisions. Report results omit `reporterId` and include available vacancy/employer contact context. |
| `POST /api/admin/reviews` | Administrator secret; 20 requests/minute | Supports company, vacancy and report decisions described below, plus existing candidate-license and internship-institution decisions. Safety decisions and their audit records commit in the same transaction. Success returns `success: true`. |
| `POST /api/jobs/report` | Candidate session; 5 requests/minute | Accepts `jobId`, `reason`, `details`. Candidates can report a direct vacancy or an external listing belonging to their account. Missing/inaccessible listings return 404. The same candidate/vacancy pair is an idempotent no-op after its first report, including after resolution. |
| `POST /api/jobs/direct` | Reviewed employer session | Existing vacancy fields plus required boolean `noFees: true`. Stores `listingDetails.noFees=true` and `status=pending-review`. |
| `PATCH /api/jobs/direct` | Reviewed owning employer session | Existing edit contract; every successful edit sets `status=pending-review`. |
| `GET /api/jobs` | Candidate or employer session | Existing response shape, with the discovery exclusions and historical-application preservation above. |
| `POST /api/apply` | Candidate session and available-job access | Rejects a direct vacancy with 403 if it is not active or its employer is no longer approved. Existing professional-stage, deadline, CV and idempotency checks still apply. |

Rate limits above use the existing PostgreSQL-backed per-route/per-identity minute buckets. General wrapper responses include 401 for missing/invalid authentication, 403 for forbidden role/identity or cross-site mutation, 400 for invalid inputs and 429 for exceeded limits. Safety reviews return 409 when a company revision or vacancy timestamp changed, or a report was already resolved. Reload current data before retrying a review; do not blindly resubmit a stale approval.

### Company submission fields

| Field | Validation |
| --- | --- |
| `organisationType` | `registered-business` or `public-institution`. |
| `legalName` | Required, up to 250 characters. This is review evidence; submission does not rename the account's existing `companyName`. |
| `registrationNumber` | Required, up to 250 characters. For a public institution, provide the establishing authority or official directory reference instead of a CAC number. |
| `address` | Required physical address, up to 600 characters. |
| `website` | Optional HTTP/HTTPS URL, up to 2,048 characters; embedded URL credentials are rejected. The server stores it as text and does not fetch it. |
| `recruiterName`, `recruiterRole` | Required, up to 250 characters each. |
| `workEmail` | Required valid email, normalised to lowercase. This field is independently reviewed; no extra confirmation email is sent to it. |
| `phone` | Required, up to 40 characters; not an automated phone/OTP verification. |
| `authorityEvidence`, `operatingCredentials` | Required explanations/references, up to 1,500 characters each. |
| `noFees`, `authorised` | Both must be boolean `true`. These are declarations, not independent proof. |
| `submittedAt` | Generated by the server; client input is not accepted as the submission time. |

### Administrator decision fields

Every decision requires `kind`, boolean `approved`, and `reference` (10–2,000 trimmed characters). The safety UI submits these common fields even for report resolutions, where `approved` has no approval effect.

| `kind` | Additional fields and constraints |
| --- | --- |
| `employer` | `email`, `decision` (`approved`, `rejected`, `suspended`), `reviewer` (required, max 250), `feedback` (required, max 1,000; visible to employer), integer `revision` from the current company record. `approved` must match whether `decision` is `approved`. Approval requires status `pending` and confirmation when the account's existing email policy requires it. |
| `employer`, when approving | `checks.registration`, `checks.recruiter`, `checks.presence`, `checks.operatingCredentials`: each required independent evidence, 10–1,500 trimmed characters. Rejection/suspension still require the common reason, reviewer and feedback, but do not require approval evidence fields. |
| `vacancy` | `jobId`, valid `jobUpdatedAt` timestamp from the loaded vacancy, `reviewer`. Approval requires a direct vacancy belonging to a currently approved employer; decision sets `active` or `rejected`. The conditional update rejects an intervening vacancy edit. |
| `vacancy`, when approving | `checks.authority`, `checks.vacancy`, `checks.noFees`: each required independent evidence, 10–1,500 trimmed characters. |
| `report` | `reportId`, `decision` (`dismissed` or `removed`), `reviewer`. Resolution updates only an open report; `removed` also sets the reported saved vacancy to `removed`. It does not itself suspend the company. |
| `candidate` / `internship` | Existing credential review contracts are retained. These branches do not write the new `SafetyReview` table; the new audit history covers company, vacancy and report decisions. |

Report reasons are `payment`, `impersonation`, `fake-vacancy`, `sensitive-data`, or `other`; `details` must contain 10–2,000 trimmed characters. Do not include private documents or sensitive financial information in report text.

## Data model and state transitions

Migration: `prisma/migrations/20261016000000_employer_safety/migration.sql`.

| Model | New fields / constraints |
| --- | --- |
| `Employer` | `verificationStatus` (string, default `unsubmitted`), `verificationDetails` (JSON, default `{}`), `verificationRevision` (integer, default 0), `verificationFeedback` (nullable string). Existing `isVerified`, `verifiedAt`, `verificationReference` and email-policy fields remain in use. |
| `SafetyReview` | CUID `id`, `kind`, `subjectId`, `decision`, `reviewer`, JSON `evidence`, `createdAt`; index on `(kind, subjectId, createdAt)`. Company evidence includes the submission snapshot, checks, feedback, reference and reviewed revision; vacancy evidence includes the reviewed content; report evidence includes the reason/reference and saved vacancy ID. No public write/update/delete audit route exists. |
| `JobReport` | CUID `id`, `jobId`, private `reporterId`, `reason`, `details`, `status` (default `open`), nullable `resolution`/`resolvedAt`, `createdAt`; unique `(jobId, reporterId)` and index `(status, createdAt)`. IDs are stored as text without foreign-key relations so reports/history can survive record deletion. |
| `Job` | No new column. Existing `status` carries moderation states, and `listingDetails` stores the initial no-fees declaration. |

Company states: `unsubmitted → pending → approved` or `rejected`; any administrator review can record `suspended`. Non-suspended resubmission moves back to `pending`. A suspension must first be lifted by an administrator request-changes/rejection decision before the employer can resubmit. Every submission and administrator company decision increments `verificationRevision`. Existing approved rows migrate to `legacy-approved` without claiming the new evidence checks were completed.

Vacancy states: new or edited direct vacancy → `pending-review`; administrator approval → `active`; rejection → `rejected`; substantiated report removal → `removed`. Company changes, rejection or suspension pause currently active direct vacancies as `pending-review`. An employer can edit a rejected/removed direct vacancy and send it through review again. Company approval alone does not publish a vacancy.

Report states: `open → dismissed` or `removed`. Resolution time and evidence are retained. Duplicate candidate submissions do not alter the original report or reopen it. This release does not provide a candidate report-history screen or notifications of resolution.

## Security and operational boundaries

- Current company approval is read from the database for authenticated employer requests; the browser cannot grant itself approval. Suspension affects subsequent requests, and cannot revoke documents already downloaded or a request already in flight.
- Submission data is available to its employer and authorised administrators. Candidate listing responses do not include company submissions, reviewer evidence or reporter identity. The administrator secret is never written into audit evidence.
- Company and vacancy review mutations use transactions and conditional revision/timestamp updates. Vacancy approval also locks/checks the current company approval so a concurrent company restriction cannot leave an approved vacancy discoverable under an unapproved company.
- Reports are reviewed manually. There is no automated fraud score, keyword-based rejection, paid company lookup, CAC scraping/API call, certificate upload, phone verification, background moderation queue or administrator notification integration.
- Registration and recruiter checks are human operating procedures. Account approval is not a regulator endorsement; internship approval still needs the existing separate official MLSCN evidence.
- Shared administrator-secret authentication remains the access mechanism. Individual reviewer accounts, role-scoped administration, expiry/revalidation schedules, broader source-URL takedowns and appeal/notification workflows remain follow-up work.

## Test and release record

| Evidence | Result / scope |
| --- | --- |
| `npm run check` | Lint, TypeScript and all 153 tests passed for this implementation. Documentation-only edits do not change that tested runtime. |
| `npm run build` | Production build passed. |
| `tests/employer-safety.test.cjs` | 13 focused tests for submissions, evidence requirements, stale approvals, audit rollback, suspensions, moderation, discovery/application denial, reporting/deduplication, report resolution and admin authentication. Uses isolated mocks. |
| `tests/endpoint-access.test.cjs` | Includes the two verification methods and candidate report method in anonymous/wrong-role denial coverage. |
| `tests/candidate-profiles.test.cjs` | Existing direct-vacancy fixtures explicitly include reviewed employer status; professional-stage discovery/history expectations remain covered. |
| `tests/scanner.test.cjs` | Regression test ensures a removed external listing is not reactivated by a later refresh. |
| `tests/register.cjs` | Adds mock tables for reviews and reports; automated tests still do not connect to the configured database. |
| `npx prisma migrate deploy` | Successfully applied/recorded `20261012000000_employer_email_confirmation`, `20261012010000_candidate_profiles`, and `20261016000000_employer_safety` in the configured database. The first two reconcile previously manual additive changes. |
| `node scripts/check-database.cjs` | Post-migration result: no missing required columns, migration history present, compatible. |
| Authenticated local `GET /api/admin/reviews` | HTTP 200; company, vacancy, report and history arrays present. No approval/report records created. |
| Local browser | Admin form and conditional company approval evidence fields inspected. Populated employer forms, mobile layouts and a complete real-database decision/report cycle remain staging checks. |
| Hosted deployment | Not performed for this feature as of 16 October 2026. Database readiness does not mean the hosted application is running the new code. |
## 19 October 2026 — Launch audit follow-up

See [Launch audit](LAUNCH-AUDIT.md). Closing a vacancy now preserves applications/reports and sets its status to closed rather than physically deleting it; the existing DELETE API path is retained for client compatibility. Bulk applicant deletion is disabled with HTTP 409. Applicant decisions wait for confirmed responses and interview copy reflects actual email delivery. Credential reviewed badges now account for applicable expiry. These are local changes; authenticated staging and hosted deployment remain pending.
19 October summary follow-up: applicant and Previous applicants views now support optional [professional summaries](PROFESSIONAL-SUMMARIES.md). Candidate consent defaults off. Existing employer approval, job ownership and application scope still control access; no public talent directory was added.
