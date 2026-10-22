# Durable document cleanup — 21 October 2026

## 22 October 2026 — Replacement interruption regression coverage

Added two failure-boundary tests for replacement: a storage deletion failure and an unavailable worker after metadata commit. Both verify that the new current source survives and only the old source is removed by a later retry. All **24 focused tests pass**. These use mocked storage/database boundaries; no hosted provider outage was induced, no new hosted replacement is claimed, and application source/Production are unchanged. [Evidence](qa/2026-10-22-cleanup-replacement-retry.json).

## 22 October 2026 — Hosted synthetic deletion passed

After explicit action-time approval, only the newly generated QA-only licence image was deleted through the testing candidate UI. The app reported “Document removed and stored files deleted.” After reload, that slot remained Missing. An independent read-only query in `benchscout_testing` returned pending/failed/due **0/0/0** and confirmed the synthetic account still has its CV, degree and certificate references with a null licence reference. This accepts ordinary hosted upload/delete and queue completion. Physical storage absence was not independently read; replacement, injected provider interruption/retry and actual scheduled invocation are not certified by this check. No real candidate document, application, Production migration or public release was changed. [Evidence](qa/2026-10-21-document-cleanup.json).

## 22 October 2026 — Hosted disposable upload persisted

A newly generated QA-only PNG was uploaded through the testing candidate UI into the previously empty licence slot of the synthetic account. The Uploaded state persisted after reload. No registration details, independent approval, application sharing or other vault files were changed. Permanent deletion of this newly created fixture is prepared, not executed; worker completion remains unverified. [QA record](qa/2026-10-21-document-cleanup.json).

## 22 October 2026 — Hosted cleanup counts confirmed

The operator reports the testing counts-only request returned `pending: 0`, `failed: 0`, `due: 0`. This confirms the valid-key hosted status path reached the queue successfully; no deletion worker or storage mutation was requested. Evidence is operator-reported, not an independently observed worker run. Hosted synthetic deletion/replacement through the new worker remains the next acceptance check; Production migration, historical writer retirement and the hardened public cutover remain separate gates. [Cleanup evidence](qa/2026-10-21-document-cleanup.json).

## 21 October 2026 — Cleanup fix served by testing

Application commit `a3b3cf7f7ecb6f847d24324d07221d7387982ffb` is Ready in the existing sholly/bench-scout project as Preview deployment [D2mYf5k3qc892X4TVoRZ3jnoWWjD](https://vercel.com/sholly/bench-scout/D2mYf5k3qc892X4TVoRZ3jnoWWjD). Provider audit/Git metadata both match; branch is testing and expected testing binding names are present without values being inspected. The existing testing alias is assigned to this build with the exact testing canonical URL. The hosted Pending document deletion controls were observed, and a deliberately invalid key returned Unauthorized through the deployed endpoint. A private valid-key **counts-only** operator request is prepared; its result is not yet claimed. No worker processing, real-file deletion or new alert was triggered. The public maintenance and protected Production diagnostic releases are outside this Preview update. [Implementation and testing migration](DOCUMENT-CLEANUP.md); [QA](qa/2026-10-21-document-cleanup.json).


Status: implemented and locally validated; the additive migration is applied **only to BenchScout Testing**. Production remains on the approved terminal maintenance build. Hosted code deployment/acceptance is recorded separately below; source validation is not Production activation.

## Problem and resulting behavior

Deletion previously removed the archive/source before clearing the vault field. A database failure could leave the profile pointing to missing bytes. Replacements committed a new reference before best-effort old cleanup, but an interrupted process had no durable retry record. Settings hid a document before the server acknowledged removal and did not surface rejected requests.

The upload/delete route now transactionally updates the vault field and records the old source in `DocumentCleanup`. A compare-and-set checks the previous field value and credential revision so a stale operation cannot clear/replace a newer document. No physical removal runs inside that transaction. On a successful commit, an immediate worker attempt normally completes cleanup; if storage, acknowledgement or worker execution fails, the durable task remains for retry. Revoked current references and version-bound application grants stay revoked while cleanup waits.

Settings waits for a successful server response before removing the card or changing its cache. Errors leave the existing display in place and tell the user to refresh if the outcome is uncertain. A queued result says “Document removed from your vault. Secure file cleanup is queued for retry.” It does not claim that bytes are already deleted. Upload/delete controls prevent overlapping local actions; server compare-and-set still protects other tabs/requests. No caller-supplied source URL is used.

## Source and transaction contract

- `POST /api/upload` still verifies the candidate/session and file, creates a random private source and verifies its encrypted backup before metadata commit. The transaction conditionally updates the relevant field/review markers and upserts the previous source’s cleanup intent. A stale snapshot returns 409 and asks for refresh.
- `DELETE /api/upload` conditionally clears only the authenticated candidate’s selected current vault field/review markers and creates its deletion intent in the **same** transaction. Failed queue insertion or failed transaction commit rolls back unlinking before any physical deletion. Repeated deletion of an empty field reports whether that owner/kind still has pending cleanup.
- Successful responses include `cleanupPending: boolean`. It means physical work is still queued, not that application sharing remains enabled. JSON continues to use guarded document URLs and sanitized user responses.
- A transaction network error can have an ambiguous commit outcome. New-upload cleanup therefore also enters the queue and rechecks current references; it never blindly deletes a source which may have become the committed replacement. The original request error is preserved; the client must refresh after uncertain results.
- A failure while discarding an unbacked/uncommitted upload also attempts durable enqueue. If the database is unavailable too, it emits a generic operator-reconciliation warning. A crash between Blob creation and recording any intent can still leave an orphan. This design does **not** claim a distributed Blob/PostgreSQL transaction or complete orphan sweeping.

## Schema and migration

Migration `20261021000000_document_cleanup` adds `DocumentCleanup` with nine fields: deterministic `id`, `userId`, `kind`, private `sourceUrl`, `attempts`, `nextAttemptAt`, `leaseUntil`, `lastErrorCode` and `createdAt`. The ID hashes owner/kind/source; repeated enqueue does not reset a pending lease or retry history. Indexes cover due/lease scanning and owner/kind status. There is deliberately no account foreign key: later account removal must not erase a pending cleanup request.

Private source references remain server-side and are never included in operator/candidate queue responses. The table contains operational deletion intents, not document contents. Do not export it to client analytics or publicly expose its URLs.

Applied through the authenticated Neon SQL editor only after verifying **BenchScout Testing / br-old-block-b7djhdd0 / benchscout_testing**. The SQL was guarded by `current_database()`, ran the exact repository migration and inserted its matching Prisma history row in one transaction. Independently queried nine columns, three indexes including the primary key, zero queued rows and eight completed migrations. SHA-256: `3d5a68fb3ea8ed37d75b3379297221c7ecc6e9fcf01d982e0aa688a1cf7fc194`. No existing candidate/application/document rows were modified. Production still needs this one reviewed additive migration before deploying code that expects the new model; do not run a reset or drop the queue to roll back code.

## Worker, retry and retention rules

`lib/document-cleanup.ts` selects at most **five due tasks**, claims each with an atomic due-time/lease predicate and a **five-minute lease**, then checks all eight current vault fields across accounts. A source still referenced by any current vault is retained and deferred for one hour. Normal app uploads use new random URLs; manual restoration/reattachment must coordinate with pending cleanup, rather than reintroducing a source during a worker operation.

Detached sources are deleted through the existing source/archive cleanup primitive. A job is removed only after storage calls succeed and its lease-bound database acknowledgement succeeds. If the function stops after physical deletion, the task survives and retries idempotently after lease expiry. Lost acknowledgement ownership is not counted as completion. Backoff begins at one minute and doubles to a 24-hour cap. A stale worker snapshot cannot bypass a newer retry deadline. The third failed claim attempts a sanitized alert through the existing approved backup-alert path; provider purge failures retain their existing alerts. No file contents/URLs are included in alert text or result counts.

Pending/referenced tasks have no automatic discard deadline or maximum-attempt deletion. Monitor them; invalid configuration and permanently unavailable storage require operator attention. No exact deletion-completion time is promised. A worker blocked by a current reference must not purge that source merely to make the queue empty.

## Operator and cron integration

The existing `/admin/backups` screen has a collapsed **Pending document deletion** section:

| Request | Contract |
| --- | --- |
| `POST /api/admin/document-cleanup`, `action: status` | Existing administrator secret, same-origin/no-store wrapper, three requests/minute. Returns `pending`, `failed` (includes blocked/referenced task errors) and `due` counts only; no file contents, identities or URLs. |
| Same endpoint, `action: process`, `confirm: PROCESS PENDING DELETIONS` | The UI requires an explicit permanent-deletion checkbox. Processes only due server-recorded intents, at most five. Caller IDs/URLs/destinations are ignored. Returns `attempted`, `completed`, `failed`, `referenced`, `skippedLeased`. It does not force tasks past backoff or return blanket success for partial work. |
| `GET /api/cron/document-cleanup?dryRun=1` | Existing independent `CRON_SECRET` authentication; returns counts without deleting. |
| `GET /api/cron/document-cleanup` | Same cron authentication; processes the bounded due batch. Does not run job discovery, recruitment or reminder mail. |

`vercel.json` configures a daily cleanup cron at **02:17 UTC / 03:17 Africa/Lagos** for the future Production release. This is not an exact-minute or completion guarantee. Immediate request-time attempts and manual operator retries remain available. Vercel documents daily-only/imprecise timing on Hobby, and scheduled authenticated GET requests to the Production deployment. Preview source deployment does not establish a running Production schedule. No paid upgrade, new credential or existing digest/reminder schedule change was made. Before release, verify the effective Production cron secret and actual scheduler registration; current containment has no cleanup worker. Keep the pause until the approved hardened cutover.

Sources: [Vercel cron usage](https://vercel.com/docs/cron-jobs/usage-and-pricing), [cron authentication and management](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [cron behavior](https://vercel.com/docs/cron-jobs).

## Verification and remaining acceptance

- Lint, strict TypeScript, **274 tests**, webpack Production build and diff checks pass. Twenty-two upload/queue boundary tests plus the backup primitive failure test cover transaction rollback, queue failure, storage interruption, request-worker interruption, failed acknowledgement, ambiguous commit, active-reference retention, stale deletion/replacement, lease expiry/overlap/loss, backoff races, batch limits and administrator/cron denial/dry-run.
- Real PostgreSQL testing-only SQL verified rollback of an injected intent and exclusive lease claim (first update one row, second zero). All SQL fixtures were rolled back; a separate SELECT confirmed no retained QA rows and zero pending deletions. This is a real SQL invariant check, not an end-to-end Prisma/provider interruption drill.
- Built operator controls fit 320/390px without horizontal overflow; retry stays disabled without both a secret and explicit checkbox. No private key was entered and no real file deletion was triggered in layout verification.
- Hosted synthetic deletion/replacement through the new worker, actual automatic daily invocation and third-failure alert receipt remain distinct runtime acceptance checks. Mocked failure coverage and schema success do not certify full disaster recovery. Older protected writers still require isolation/retirement; do not claim a global write pause or enable real-file backfill solely from public maintenance.

Evidence: [cleanup QA](qa/2026-10-21-document-cleanup.json), [current release readiness](MAIN-RELEASE-READINESS.md), [public containment](LEGACY-CONTAINMENT.md), [release plan](PRODUCTION-RELEASE-PLAN.md).

Deployment correction during this checkpoint: the first CLI Preview attempt omitted an explicit project and found an unlinked checkout, creating a duplicate `sholly/labpro-connect` project (its first build became that new project’s Production build). This was an operational mistake, not a BenchScout rollout. The duplicate project was deleted; a separate request to its generated public alias returned HTTP 404 / DEPLOYMENT_NOT_FOUND. No original BenchScout alias or database configuration was changed by that attempt. The checkout was then explicitly linked and its expected project/team IDs asserted before retrying with `--project bench-scout --scope sholly --environment preview`. Future manual deployment commands must specify the project/scope and verify their local ID mapping; branch name or directory name alone is insufficient. No main merge or hardened Production promotion was performed.
