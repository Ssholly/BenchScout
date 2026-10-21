# Hosted environment and recovery readiness

## 21 October 2026 — Document recovery gap and destination preparation

Source/configuration review found no document-backup integration. The private testing store is available, but no independent copy/restore has been verified. Vercel documents no native Blob backup system. The operator asked to create a destination; prepared a separate private testing backup store in the existing account, with Create awaiting action-time approval. See [Private document recovery](DOCUMENT-RECOVERY.md) for exact settings, same-provider limits and the synthetic acceptance plan. No new store, file copy, deletion, credential reveal, paid upgrade or production change has occurred. Pilot remains HOLD.


## 20 October 2026 — Recovery drill prepared, not executed

Fresh Neon console inspection of **BenchScout Testing** showed PostgreSQL 17, Free plan, one branch named `production`, and six-hour history retention. This is the dedicated testing project's default branch, separate from the normal BenchScout project. Backup & Restore showed no snapshots or schedule. These settings do not establish a completed restore or independent document backup.

Prepared, but did not submit, a child-branch form: `qa-recovery-20261020`, parent `production` within BenchScout Testing, data and schema from **20 October 2026, 21:00 Africa/Lagos (20:00 UTC)**, automatic deletion after one day. This target follows the hosted synthetic closure/suspension checks. Creation requires action-time confirmation because it creates another accessible database copy, including stored sessions and private file references. No new branch, credential, restore/reset, billing upgrade, Vercel binding or production change has occurred. If approval arrives after the target leaves retained history, prepare a new in-window target and record it before submission.

After approval, measure creation/recovery duration and inspect only scrubbed fixture results: suspended synthetic employer, closed QA vacancy, one retained application, CV revision/selection mismatch, review revision/audit and migration history. A branch-created banner alone is insufficient. Do not connect this copy to Vercel, email or cron; do not reuse restored sessions. Verify session invalidation and later revocations before any future cutover. Document recovery remains a separate gate: no protected backup of deleted Blob contents has been verified. Automatic branch expiry is a planned lifecycle setting, not evidence of completed cleanup.


## Recipient reset receipt and shared email design — 20 October 2026

The approved recipient confirmed reset-link receipt for the existing replacement account, closing the receipt check for that request. It does not certify confirmation/interview delivery, link completion, SPF/DKIM or the rendering of the subsequently changed template. Shared account-email branding now covers confirmations and recovery; 203 tests/build and synthetic 320/390px previews passed. See [Account emails](ACCOUNT-EMAILS.md). Deployment and new-template inbox evidence are tracked separately; other operational gates stay open.

## Administrator authentication and recovery diagnosis — 20 October 2026

The correct testing administrator key successfully loaded the three hosted review queues (all zero); the prior incorrect-key test was rejected. No review decision changed. A read-only testing-database check found no candidate/employer or candidate reset token for the exact approved mail recipient. Password recovery intentionally does not send for a missing account, so provider/inbox delivery remains untested. Prepared an unsubmitted test signup with its password left for operator entry. See [Testing credentials](TESTING-CREDENTIALS.md) and [scrubbed diagnostic evidence](qa/2026-10-20-admin-and-email-diagnosis.json). Other credentials/operational gates stay open; pilot remains HOLD.

## Testing credential deployment and email request — 19 October 2026

Vercel deployment c050bc5 after the operator save succeeded. Wrong-key administrator access was rejected in the hosted review UI; successful operator queue loading remains pending. One approved recovery-email request was submitted without changing any password. Generic UI acknowledgement is not delivery evidence; recipient confirmation is pending. [Testing credentials evidence](qa/2026-10-19-testing-credentials.json) records the boundaries. Cron/salary checks, confirmation/interview inbox delivery, other-preview isolation and recovery remain open; pilot stays HOLD.

## Testing credential save confirmed — 19 October 2026

The operator completed entry/Save. Fresh Vercel metadata confirms all three Secret overrides (ADMIN_SECRET, CRON_SECRET, SALARY_OWNER_SECRET) on Preview/testing only. No value was read back. This supersedes the prepared/unsaved state below; credential strength and successful authentication are not inferred from metadata. Redeployment is being triggered from the documentation checkpoint. Email recipient approval is recorded, but no live message/receipt is claimed yet.

## Testing credential and email preparation — 19 October 2026

Three Secret rows (ADMIN_SECRET, CRON_SECRET, SALARY_OWNER_SECRET) are prepared but unsaved for Preview/testing only. New authentication credential entry/Save is a required user handoff under the browser tool rules. See [Testing credentials and email acceptance](TESTING-CREDENTIALS.md) for purposes, random generation, secure retention, deployment and read-only validation steps. No credential activation is claimed before the operator saves and the new runtime is checked.

Candidate signup's confirmation now uses the shared template with a role-scoped canonical URL, plain-text alternative and expiry statement; lint/typecheck/201 tests/build passed. The user approved a controlled email recipient, omitted from public docs. No live message sent; the connected Gmail account differs from the authorised recipient, so receipt needs recipient confirmation. Pilot remains HOLD for the earlier gates.

## Current testing cutover result — 19 October 2026

The dedicated testing database and private-store overrides are now active on successful Vercel deployment `699b256` (full release evidence in [Deployment](DEPLOYMENT.md)). An actual hosted synthetic login and certificate upload persisted to the new database/store; the guarded preview opened, and the fixture was absent from the normal database. Cleanup removed its account/session/file and returned testing account/job/application counts to zero. See [hosted evidence](qa/2026-10-19-hosted-isolation.json). Users of the testing alias must create fresh accounts; prior data stays in the original resources.

Only the current testing deployment is verified. Other preview defaults/old deployments, independent administration/cron/salary secrets, real inbox delivery and recovery drill remain open. No production binding changed and no external email was sent. Pilot remains HOLD. The earlier audit and prepared-form records below are dated history.

## 19 October 2026 — Dedicated testing database and storage setup

After the user created the prepared project, authenticated dashboard checks confirmed **BenchScout Testing**, database **benchscout_testing**, PostgreSQL 17, AWS US East 1 and the displayed Free plan. Its Neon project/endpoint and owner differ from the original project. The default branch is named production by Neon; this is inside the separate testing project and does not change the original production project.

The target initially had zero public tables. All seven repository migrations were applied only to this new database; each completed history entry and SQL checksum matched the repository. Candidate/employer/job/application/session counts were all zero afterwards. No existing account/session/document reference was copied and the normal local .env was unchanged. See [initialisation evidence](qa/2026-10-19-testing-initialization.json).

Created a dedicated **benchscout-testing-documents** Blob store in IAD1 with immutable Private access. A synthetic object write/authenticated byte read passed; anonymous URL access returned 403; deletion and empty-store verification passed. See [storage evidence](qa/2026-10-19-testing-storage.json). Existing stores and files were retained. The optional Blob firewall/project association has not been configured; private token enforcement was actually tested.

Added Secret overrides for DATABASE_URL and BLOB_PRIVATE_READ_WRITE_TOKEN targeting **Preview / testing branch only**. The original Production/Preview defaults and other provider settings were retained. These overrides apply to new testing deployments; other preview branches and older immutable deployments remain an open isolation task. Do not claim all Preview environments are isolated. The automatic project-store connection was not used because it includes Production by default; the dedicated token was bound manually. No production branch or environment binding was changed.

A disposable synthetic candidate is being used for a hosted login/upload smoke check after redeployment; it is explicitly fixture-confirmed, not an email-delivery acceptance result. Exact deployment, hosted evidence and cleanup are recorded in Deployment after completion. No external mail is authorised/sent in this step. Independent admin/cron/salary secrets, other-preview isolation, real inbox acceptance, older-deployment retirement and recovery drill remain open; pilot stays HOLD.

## 19 October 2026 — Read-only hosting audit

Status: **HOLD before employer pilot onboarding**. This refreshes the hosted configuration gates in LA-12 through LA-15; earlier local acceptance remains valid within its recorded scope. The observations below came from authenticated Vercel and Neon dashboards. No secret value was revealed, account record inspected, test email sent, database created/restored, or hosting setting saved during this audit.

| Area | Observed evidence | Implication |
| --- | --- | --- |
| Database separation | Vercel Project variables list contains one DATABASE_URL targeting Production and Preview, with no branch-specific database override. Shared tab reports no linked variables. Neon BenchScout contains one branch, production, marked Default. | Current project configuration does not isolate Preview from Production. A testing URL is not a database boundary. This is configuration evidence; effective settings of every historical immutable deployment were not inspected. |
| Document storage | BLOB_PRIVATE_READ_WRITE_TOKEN targets Preview only. BLOB_READ_WRITE_TOKEN targets Production and Preview. The Storage page lists private/public stores without establishing their token-to-environment isolation. | Production private uploads are not configured by the visible variables; separate token/store ownership still needs verification. Do not assume the existing private store contains synthetic files only. |
| Administration | Neither ADMIN_SECRET nor SALARY_OWNER_SECRET appears in Project variables; Shared has no linked variables. CRON_SECRET targets Production and Preview. | Source code requires separate secrets for administrator access and stable salary ownership. Missing values fail closed; they do not create open administrator access. Current hosted workflows need correctly scoped configuration before acceptance. Secret lengths/equality were not inspected. |
| Email | RESEND_API_KEY, EMAIL_USER and EMAIL_PASS target Production and Preview. EMAIL_FROM, custom SMTP settings and the newer GMAIL_* names are absent from the visible list. | Source supports EMAIL_USER/EMAIL_PASS aliases and derives a Gmail From address when both exist. Absence of EMAIL_FROM does not by itself prove email failure. Verified sender, primary/fallback behaviour and actual inbox delivery remain untested. |
| Recovery | Neon shows PostgreSQL 17, Free plan, and History retention of 6 hours for the only project/branch. | A short point-in-time recovery window is configured. This is not evidence of an independent backup, a completed restore, or private-file recovery. |
| Tooling | No vercel, psql or pg_dump executable found on the current shell PATH. | No logical export/restore was attempted. Console-based recovery or a separately prepared PostgreSQL 17 client environment is needed for the drill. |

Evidence summary: [scrubbed audit record](qa/2026-10-19-hosted-operations.json). No connection strings, hostnames, passwords, private document URLs or account identifiers belong in published evidence.

## Prepared testing setup

The Neon create-project form is prepared but **not submitted**:

- Project: **BenchScout Testing**; database: **benchscout_testing**.
- PostgreSQL **17**, AWS **US East 1 (N. Virginia)**, matching the observed source database version/region.
- Postgres enabled; Neon Auth, object storage, functions, AI gateway and realtime disabled.
- Existing Free plan shown in the form; no upgrade or paid commitment approved.
- Start empty. Apply repository migrations to the new database and seed synthetic data only. No real candidate/company/session data or private-file references are copied.

Creation and binding credentials create persistent database access. They require explicit action-time confirmation under the browser tool's security-sensitive access policy. The prepared form is reviewable; no new credential or database has yet been created. After approval, proceed with the following sequence, stopping if a paid upgrade or unexpected permission is requested:

1. Create the prepared project and verify its distinct project/endpoint/database identity and empty account tables. Keep connection credentials out of chat, logs, screenshots and committed files.
2. Apply all repository migrations against the new empty database, then verify migration history separately from schema compatibility. Keep the normal local DATABASE_URL unchanged; use a private temporary context for migration execution. Never run reset on the existing database.
3. Add the new connection string to Vercel **Preview / testing branch only**. The testing override must win over the current shared DATABASE_URL. Split the broad Preview default as a follow-up so future preview branches cannot inherit the production database. Existing Production binding stays in place during this testing cutover.
4. Provision a dedicated private test Blob store and bind its token to testing only. Existing stores/files remain intact. Create distinct test administration/cron/salary secrets, and set the existing testing alias as its canonical app URL. Coordinate secret entry through an approved credential workflow; do not print generated credentials for review.
5. Redeploy testing from a recorded commit. Environment changes apply to new deployments; record deployment ID and effective target evidence. Existing test logins/data will not appear in the fresh testing database; create synthetic accounts rather than importing real users.
6. Verify candidate and employer signup/confirmation, private upload/selection/application/read/replacement/delete/withdrawal, moderation and role denials on the actual hosted deployment. Maintain Vercel deployment protection. Use synthetic files and an explicitly authorised test inbox; do not approve a real employer as a shortcut.
7. Inventory older preview deployments and their retained credentials. Restrict/retire those still able to reach shared data through an approved operational change. A new override does not remove credentials from old deployments. Do not rotate production credentials without coordinating current consumers.

Acceptance requires separate database and store identities, correctly scoped independent secrets, a current deployment using them, no copied real accounts, successful hosted journeys and documented cleanup. A marker variable or another schema under production-owner credentials is insufficient proof of this hosted boundary.

## Email delivery acceptance

Obtain explicit approval for the recipient inbox and synthetic test messages before sending. Do not reuse disabled /api/test-email, trigger a real user's password reset, or run a digest against real accounts as a delivery test.

In isolated hosted testing, configure a verified sender and record the active provider/fallback path. Exercise candidate confirmation, employer confirmation, a synthetic interview notification and a password-reset confirmation. Check the actual inbox (including spam), sender identity, text/HTML rendering, mobile action links and the testing origin. Do not publish tokens or full message bodies. Record request outcome, provider acceptance and inbox receipt as separate facts; provider acceptance alone is not inbox proof. Record delivery-failure behaviour and the currently absent automatic digest-email retry guarantee. Any provider/domain verification requiring DNS or new access is a separate concrete operator action.

## Backup and restore drill

The configured six-hour history is evidence of a recovery setting only. Establish business-approved recovery point/time objectives, retention and an operations owner before promising recovery guarantees. No paid retention upgrade has been authorised.

1. Perform the first drill in the empty dedicated testing project with synthetic accounts, an application/review audit and a synthetic private document. Record commit, migration state, start time, recovery target time and expected record/file checks. Do not restore/reset the production branch.
2. Use a separate disposable recovery branch/database to restore a known earlier test state within the configured recovery window. Measure actual recovery duration and verify the synthetic canary records, constraints, application attachment grant and review revision against expected results. A successful branch-create response alone does not pass the drill.
3. Verify object storage separately. A database restore restores file references, not deleted Vercel Blob contents. Test synthetic private object recovery from an explicitly configured protected backup, or document that deleted-object recovery is unavailable. Preserve candidate deletion/withdrawal restrictions; restored database rows must not silently regrant access that was later revoked.
4. Where independent logical backups are required, use a PostgreSQL client compatible with version 17, a dedicated least-privilege export identity and approved encrypted backup destination. Run pg_dump/pg_restore into a distinct empty recovery database. Never place a database dump in this repository or an unencrypted public store. Record checksums, retention and access controls without exporting real rows into evidence.
5. Validate protected app reads, private document checks and session revocation before any actual recovery cutover. A restored AuthSession table can resurrect previously revoked tokens; invalidate restored sessions as part of the approved recovery procedure. Email/cron must remain disabled during recovery validation to prevent duplicate messages/actions.
6. Remove only disposable synthetic recovery resources after explicit cleanup review, retain scrubbed results, and update this record with measured outcomes. No drill is currently claimed complete.

## Current release boundary

This pass changes documentation only. No application screen/API/schema, migration, external email or provider configuration changed. `git diff --check` is the relevant validation; product tests/build are not rerun for documentation alone. The prior code audit passed 199 tests and production build; that does not satisfy the new hosted-operation gates.

## Official references checked 19 October 2026

- [Vercel environment variables](https://vercel.com/docs/environment-variables): environment targets, branch-specific Preview overrides and new-deployment behaviour.
- [Vercel sensitive variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables): sensitive values cannot be read back.
- [Neon schema-only branches](https://neon.com/docs/guides/branching-schema-only): schema-only copying excludes rows; it does not constitute an independent backup.
- [Neon instant restore](https://neon.com/docs/postgres/backup-restore/branch-restore): recovery within retained history. The dashboard's actual six-hour setting above takes precedence over assumptions about plan defaults.


## 20 October 2026 — Approved historical copy and record verification completed

The operator explicitly approved creation. Neon created `qa-recovery-20261020` inside BenchScout Testing from the prepared **21:00 Africa/Lagos** historical target. Its overview showed creation at **21:03:05**, parent `production` in that testing project and expiry **21 October 2026, 21:03:05 Africa/Lagos**. Neon reported a **0.53-second fork**. Record validation finished by 21:04:22; this is not a measured service recovery time because no app cutover occurred. No connection password was revealed, production/source branch reset, billing upgrade or Vercel binding changed.

Ran a SELECT through Neon's SQL editor on the recovery branch, returning counts/booleans rather than credentials or document URLs. Observed one pending fixture application; closed vacancy; suspended, unverified employer; review revision 3; one suspension audit; seven completed migration rows. Both synthetic vault references remained present. The application's selected CV reference differed from the replacement vault CV, and its optional certificate remained unselected. This validates preserved record relationships and sharing metadata, not recovery of file contents or a full integrity/constraint audit.

The copy contained two AuthSession rows. Expired both **only in the recovery copy**, then independently queried zero active restored sessions and rechecked the fixture results. The application source rejects expired sessions before subject access. No browser cookie was reused against this copy; no live app, email or cron was connected. The source testing branch and its active candidate session were untouched.

**Outcome: historical database-copy record verification passed; full recovery acceptance remains incomplete.** File recovery, independent backups, restored-app HTTP acceptance, detailed integrity checks and end-to-end recovery objectives are still open. A post-target canary mutation was not introduced, so this does not independently prove exclusion of later writes. The one-day auto-delete is configured; actual expiry/cleanup has not yet been observed. Retain the copy until its approved expiry, rather than deleting it without action-time confirmation. [Scrubbed results](qa/2026-10-20-recovery-drill.json).


## 21 October 2026 — Private backup destination created

The operator approved creation of the separate private testing backup store. Synthetic upload and authenticated preview text integrity passed; no existing documents were copied and no backup worker/app binding was enabled. Downloaded-byte verification, anonymous denial and loss/restore acceptance remain open, with the browser download event timing out. See [document recovery](DOCUMENT-RECOVERY.md) and its JSON evidence. Same-provider/account limits still apply; pilot remains HOLD.


## 21 October 2026 — Backup integration implemented, activation pending

Opt-in upload-time encrypted backups, verified read-back, retries, deletion-aware purge, operational alerts and restricted synthetic/CLI restore tooling are implemented. Lint, TypeScript, 230 tests and production build passed; built operator screen fits 320px. The five testing-only Secret fields are prepared with token/key blank, not saved. No actual automatic hosted backup, current-file backfill or real-provider loss/restore pass is claimed yet. See [document recovery](DOCUMENT-RECOVERY.md) for contracts and retention/key limits. No production or schema/migration change; pilot remains HOLD.
