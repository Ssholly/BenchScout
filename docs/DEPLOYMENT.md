# Deploying the security upgrade

## 23 October 2026 — Mobile layout accepted on testing

Exact mobile source c06a420 built Ready as `dpl_EFnMuTL4xVfs5Q23YpZsKx7tXD5h` and was assigned to the established testing alias. Existing synthetic session, native viewport, 280px drawer and wider profile geometry passed. Public still serves the separately approved Settings source 3ecf303; the mobile revision's public build/promotion scope is prepared for separate approval. [Scope, geometry and limitations](MOBILE-SCALE-2026-10-23.md).

## 23 October 2026 — Approved Settings hotfix released

Public `bench-scout.vercel.app` now serves exact approved source **3ecf303** / **dpl_3mF9yJiLtE45yXzXyMoshdiHUbCx**. All thirteen public GET access checks passed; the existing signed-in owner session survived refresh and Settings loaded. A single navigation observation was 893 ms, with automation overhead; this is not a latency guarantee. Cleanup registration matches the new artifact at 03:17 Lagos, with actual scheduled invocation still pending. Testing/diagnostics are preserved, git-main remains maintenance, bypass count is zero and the previous safe pilot Cfj remains rollback. No data/schema/file mutation, key change, main merge or new email occurred. Mobile sizing edits are not included. [Execution and evidence](SETTINGS-PERFORMANCE.md#approved-public-execution--23-october-2026).


## 23 October 2026 — Public browser session persistence accepted

After the owner's private Production sign-in, authenticated Applied and Profile & documents pages survived full refreshes and navigation without another login prompt. Profile preferences finished loading; no save, manual document action, logout or new email request was made. Password/cookie values and account identity are excluded from committed evidence. This accepts public browser session persistence/read-only profile access; new email-link delivery, actual scheduled invocation, older-file backup copying and main integration retain separate scope. [Acceptance](qa/2026-10-23-public-session-accepted.json).

## 23 October 2026 — Controlled public pilot reopened

Owner-approved exact Production artifact `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` / source `082c225` is current on `bench-scout.vercel.app`, without rebuild or main merge. Thirteen public GET checks passed, browser home rendered, and cleanup cron definitions now register this candidate at `17 2 * * *`. Actual scheduled invocation and private public-origin login remain pending. Git-main was restored to maintenance after promotion moved it; testing/diagnostics are preserved, bypass count zero. Six-hour database history and three unbackfilled older files remain the accepted pilot limits. [Execution and remaining work](CONTROLLED-PILOT-2026-10-23.md).

## 22 October 2026 — Production-only cron correction accepted

Operator save and metadata establish a new Production-only Secret CRON_SECRET (`4sCKxYxYsfrOf5up`), with the existing Preview-only value and testing override metadata unchanged. The already-approved replacement build of exact validated source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is **Ready** as `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`, immutable `bench-scout-r2ldibwnk-sholly.vercel.app`. Original project and both source metadata fields match. It uses the public canonical URL, normal submitted cleanup schedule, backups enabled, test mode off and backfill apply false.

The explicit temporary-access probe now passes on that exact candidate: **wrong key 401; privately supplied new Production key 200; dryRun true; pending/failed/due 0/0/0**. No normal cleanup or email was invoked. Temporary bypass was revoked, revoked-token access returned 302, and independent project metadata shows **zero bypasses**. The local key file/directory were removed, entry server stopped and port closure verified. The tool did not inspect or print key values.

All five existing alias mappings are verified preserved; public/git-main remain on maintenance and diagnostics remain on the prior protected stage. Active project cron definitions are still empty, so actual scheduler activation/invocation is **not yet certified**. The older public-origin candidate is superseded, not silently deleted. No public promotion, main merge or older real-file copy occurred. This closes the correct-key cron authentication blocker; other packet gates remain separate. [Accepted correction evidence](qa/2026-10-22-production-cron-correction-accepted.json).

## 22 October 2026 — Approved public-origin candidate Ready; public remains paused

Validated source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is Ready as protected Production candidate `dpl_CSoxtMv87Zm4xVw2brybZxZV3onF`, immutable `bench-scout-926z7vaov-sholly.vercel.app`. Exact source/provider project identity match. Deployment uses the public canonical origin at build/runtime, validated webpack build, enabled backups, test mode off and backfill apply false. CLI reports Vercel authentication; independent anonymous HEAD returned 302 to Vercel sign-in.

The approved normal cleanup schedule was submitted (`17 2 * * *`). Fresh active project cron definitions remain empty and point to historical cron metadata, so no active scheduler registration or invocation is claimed. All five current alias mappings are unchanged, including both maintenance domains and protected diagnostics. No public promotion, main merge, real-file operation or new deletion intent occurred. [Build evidence](qa/2026-10-22-public-origin-build.json); [current decision packet](PUBLIC-RELEASE-PACKET.md).

## 22 October 2026 — Approved current diagnostic build Ready

Approved exact source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is Ready as Production diagnostic deployment `dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg`, immutable `bench-scout-8vrlhm9fq-sholly.vercel.app`, in the verified original project. Source/audit metadata match. CLI reports Vercel authentication; project Standard Protection remains all_except_custom_domains. The explicit no-cron local configuration was used; project cron metadata has empty definitions (its historical deploymentId is retained, not relabelled as a current scheduler pass).

Only `bench-scout-sholly.vercel.app` moved to the new build after Ready; public and git-main remain on approved maintenance. Hosted current admin controls are present and a deliberately invalid key returns Unauthorized through the correct staging origin. Correct-key deployed database/configuration and queue status are prepared, not yet accepted. No real-file backfill, document mutation, main merge or public reopening occurred. This diagnostic canonical/config build must not be directly promoted publicly. [Deployment evidence](qa/2026-10-22-protected-stage.json).

## 22 October 2026 — Approved Production cleanup migration applied

The operator explicitly approved `20261021000000_document_cleanup` on BenchScout Production. The authenticated Neon console verified **BenchScout / production / br-cold-hall-apf2uz7z / neondb**. One transaction checked the database identity, seven matching prior checksums, no unfinished migrations and absence of the new table, then ran the exact repository DDL and recorded its SHA-256 in Prisma history. COMMIT completed.

A separate read-only query confirmed **eight completed migrations, zero unfinished, nine cleanup columns, three indexes including the primary key, matching checksum and zero queued rows**. The existing one anonymous salary report remains unchanged. No existing business row or stored file was modified, no testing data imported and no application deployed or reopened. This closes the additive schema prerequisite; deployed current cleanup runtime, scheduler, canonical release and other remaining acceptance gates are separate. Do not drop the queue during rollback. Earlier testing-only/pending-migration entries below are dated history superseded by this execution. [Execution evidence](qa/2026-10-22-production-cleanup-migration.json).

## 22 October 2026 — Approved July deployment retirement completed

After separate explicit operator approval, `bench-scout-git-main-sholly.vercel.app` was assigned to the existing approved maintenance deployment `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`. The maintenance page was observed in the browser. Fresh provider lookup verified the old July deployment had no aliases and all other mappings were unchanged. Vercel `remove --safe` then removed only `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ`. Its immutable homepage now returns **404 / DEPLOYMENT_NOT_FOUND**. Complete post-removal inventory (74 entries, null next cursor) excludes that ID and retains every currently aliased deployment. Only the approved git-main mapping changed.

The two approved retirement operations have removed **31 deployments** in total. Database records, stored files, credentials and Git source remain intact; public service remains on maintenance. This does not certify all remaining historical writers or future old-main builds. Final release controls must prevent redeploying unsafe source, and other remaining deployed revisions still require review before claiming a global write pause. The earlier prepared/preserved entries below are dated history superseded for this ID. [Execution evidence](qa/2026-10-22-old-main-retirement.json).

## 22 October 2026 — Approved 30-deployment retirement completed

The operator explicitly approved removal of the exact 30 IDs in the first retirement set. Fresh alias checks excluded all targets; each target’s provider metadata matched the original BenchScout project. Vercel CLI 65.0.0 `remove` ran with `--safe --yes --scope sholly` and reported **30 removed**. An independent HEAD request to every removed immutable homepage returned **404 / DEPLOYMENT_NOT_FOUND**. A complete post-removal project inventory (73 entries, null next cursor) contains none of those IDs and retains all five keep-listed deployments. All five alias mappings are unchanged, including testing, public maintenance, diagnostics and old git-main.

No database records, stored documents, credentials or Git source were deleted or changed. No main merge or hardened public promotion occurred. The old git-main deployment was deliberately outside this approval and remains a separate historical writer gate; this batch alone does not establish a global write pause or approve real-file backfill. [Execution evidence and per-URL results](qa/2026-10-22-deployment-retirement.json). The earlier proposed/not-executed entries below are dated history, superseded for these exact 30 IDs by this execution record.

## 22 October 2026 — Hosted synthetic deletion passed

After explicit action-time approval, only the newly generated QA-only licence image was deleted through the testing candidate UI. The app reported “Document removed and stored files deleted.” After reload, that slot remained Missing. An independent read-only query in `benchscout_testing` returned pending/failed/due **0/0/0** and confirmed the synthetic account still has its CV, degree and certificate references with a null licence reference. This accepts ordinary hosted upload/delete and queue completion. Physical storage absence was not independently read; replacement, injected provider interruption/retry and actual scheduled invocation are not certified by this check. No real candidate document, application, Production migration or public release was changed. [Evidence](qa/2026-10-21-document-cleanup.json).

## 22 October 2026 — Hosted cleanup counts confirmed

The operator reports the testing counts-only request returned `pending: 0`, `failed: 0`, `due: 0`. This confirms the valid-key hosted status path reached the queue successfully; no deletion worker or storage mutation was requested. Evidence is operator-reported, not an independently observed worker run. Hosted synthetic deletion/replacement through the new worker remains the next acceptance check; Production migration, historical writer retirement and the hardened public cutover remain separate gates. [Cleanup evidence](qa/2026-10-21-document-cleanup.json).

## 21 October 2026 — Cleanup fix served by testing

Application commit `a3b3cf7f7ecb6f847d24324d07221d7387982ffb` is Ready in the existing sholly/bench-scout project as Preview deployment [D2mYf5k3qc892X4TVoRZ3jnoWWjD](https://vercel.com/sholly/bench-scout/D2mYf5k3qc892X4TVoRZ3jnoWWjD). Provider audit/Git metadata both match; branch is testing and expected testing binding names are present without values being inspected. The existing testing alias is assigned to this build with the exact testing canonical URL. The hosted Pending document deletion controls were observed, and a deliberately invalid key returned Unauthorized through the deployed endpoint. A private valid-key **counts-only** operator request is prepared; its result is not yet claimed. No worker processing, real-file deletion or new alert was triggered. The public maintenance and protected Production diagnostic releases are outside this Preview update. [Implementation and testing migration](DOCUMENT-CLEANUP.md); [QA](qa/2026-10-21-document-cleanup.json).


## 21 October 2026 — Durable cleanup implemented; testing migration applied

[Durable document cleanup](DOCUMENT-CLEANUP.md) now atomically records vault removal/replacement and retry intent, guards stale writes, rechecks current references, and retries detached source/archive deletion with leases/backoff. The UI waits for server acknowledgement and distinguishes queued cleanup from completed deletion. Operator counts/explicit retry and a separately authenticated daily cleanup cron are implemented. Lint, TypeScript, 274 tests, build and 320/390px controls pass. A guarded exact-checksum migration plus real SQL rollback/lease checks passed in BenchScout Testing only (eight migrations, nine new-table columns, three indexes, zero queued rows). Production still requires the one additive migration and approved hardened cutover; public maintenance is unchanged. Actual hosted worker deletion/provider interruption and scheduled invocation remain separately tracked. [Evidence](qa/2026-10-21-document-cleanup.json).


## 21 October 2026 — Approved public containment activated

The owner explicitly approved the temporary public-app pause. Reviewed containment `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f` is Ready as [Production deployment 3JSXjPv2JjgTBNE3gwXVSiqJFTaV](https://vercel.com/sholly/bench-scout/3JSXjPv2JjgTBNE3gwXVSiqJFTaV); provider audit/Git metadata both match. Only the public `bench-scout.vercel.app` domain was intentionally assigned to containment. Vercel temporarily auto-assigned the generated team alias during skip-domain staging; it was restored to the existing protected diagnostic deployment before public activation. Fresh alias lookup confirms diagnostics remains `dpl_12r5Zwn4tyffsUTnH3YF9tMrNqXh`; testing retains its independently updating testing alias. The protected git-main alias still targets July source, so this is **not** global write revocation.

Public browser review displays the branded update notice. Ten safe hosted method/path checks passed terminal 503, no-store, Retry-After and expected notice/JSON. These include upload GET/POST/DELETE, reset POST, setup POST, cron OPTIONS and debug-email POST. Dangerous legacy setup/debug GETs were not invoked. No database/storage mutation, migration, real-file copy/deletion, session/credential change, main merge or old-deployment deletion occurred. Sign-in, applications, uploads and public-domain dispatch are paused until the compatible hardened release; no reopening time is certified. Historical callers on other protected URLs are outside this pause. [Exact scope and next deletion-reconciliation gate](LEGACY-CONTAINMENT.md); [evidence](qa/2026-10-21-legacy-containment.json).


## 21 October 2026 — Legacy containment prepared; failure checks advanced

A separate reviewed containment branch `hotfix/legacy-containment`, commit `336c6ed`, removes every legacy app/API route and returns terminal HTTP 503 with a branded update notice. Twelve focused tests, strict scoped TypeScript/lint, webpack build, 70 built HTTP method/path cases and 320/390px layout checks pass. The branch is pushed, but public activation is pending explicit approval because it temporarily pauses all public workflows. No main merge, public alias change, database/storage mutation or old-deployment deletion has occurred. Containment does not block authorised access to historical immutable deployments or establish a global write pause.

In parallel, six meaningful upload/delete fault-boundary tests pass; the full hardened application suite is now 257 passing tests. Physical-delete/metadata atomicity and durable reconciliation remain open, not certified by mocks. [Containment contract and impact](LEGACY-CONTAINMENT.md); [structured evidence](qa/2026-10-21-legacy-containment.json).


## 21 October 2026 — Historical deployment isolation audited

[The read-only isolation audit](DEPLOYMENT-ISOLATION.md) enumerated all 92 Ready builds and four current aliases. Anonymous homepage requests on every immutable URL and upload-route GETs on all immutable/non-public aliases redirected to Vercel sign-in. Only the public alias reached the upload handler (GET 405). Protection is enabled; this does not revoke old credentials or prevent authorised writes. Thirty obsolete builds are a concrete first retirement proposal, not approved deletions. Source review reconfirmed unsafe setup/document behavior in the public July SHA; public legacy containment/replacement remains a release blocker. No dangerous GET, mutation, deletion, credential or provider change occurred. Current testing alias still mapped `2103726` at this checkpoint, so later documentation pushes are not claimed as hosted releases. [Evidence](qa/2026-10-21-deployment-isolation.json).


## 21 October 2026 — Public release and rollback plan prepared

[The release runbook](PRODUCTION-RELEASE-PLAN.md) now specifies exact source/configuration boundaries, live-canonical build and approval packet, no-op-if-current migration handling, public upload/denial smoke checks, separate older-file copying, and recovery decisions. Source inspection confirms uploads back up before metadata, replacement cleanup is best-effort, and deletion crosses storage/metadata without a transaction. Old immutable writers, interrupted operations, direct hosted denials, salary ownership, scheduler acceptance and recovery ownership remain gates. July main is not an automatic rollback target; a compatible fallback or verified enforced write-stop is required. Daily-digest dry-run differs from compliance reminders, which can send mail.

This checkpoint is documentation/source review only: no live deployment/promotion, main merge, new test run, migration, email, real-file copy, credential or provider change. Latest application validation remains 251 tests/build at `64e2f83`; it is not relabelled as new acceptance. Next technical priority is read-only old-deployment isolation and write-entry inventory. [Structured evidence](qa/2026-10-21-production-release-plan.json).


## 21 October 2026 — Hosted Production metadata preview passed

The operator supplied the exact successful response from the protected `64e2f83` stage: dryRun=true, eligibleReferences=3, uniqueFiles=3, blockedReferences=0 and inventoryReady=true. The current inventory is one CV, one practising licence and one profile image; every other supported kind is zero. This agrees with the independently queried aggregate inventory. applyEnabled=false and canApply=false confirm the disabled copy gate. The response reports fileContentsRead=false, businessRecordsChanged=false and applicationGrantsChanged=false. Evidence is the operator-reported response, not an independently captured result screen. Operational rate-limit bookkeeping is outside the business-record claim.

No real files have been copied or decrypt-verified by this backfill. The returned preview expiry is `2026-10-21T15:24:35.699Z`; it is not a reusable copy approval or enabled plan. Next: prepare/review the live release and rollback plan, verify current backup lifecycle hooks on the public app (or an explicitly approved enforced write pause), then obtain fresh inventory and explicit real-file copy approval. Keep apply disabled until that prerequisite is resolved. Do not directly promote the diagnostic build with its staging canonical URL. [Workflow](PRODUCTION-DOCUMENT-BACKFILL.md) and [structured evidence](qa/2026-10-21-production-backfill.json).


## 21 October 2026 — Guarded Production file preview staged

After explicit operator approval, source `64e2f83c62d7c81b3905cdc075793255b8e7d186` was deployed from its clean detached checkout using `--prod --skip-domain`. [Deployment 12r5Zwn4tyffsUTnH3YF9tMrNqXh](https://vercel.com/sholly/bench-scout/12r5Zwn4tyffsUTnH3YF9tMrNqXh) is Ready, protected by Vercel authentication. Provider audit/Git metadata both match the reviewed commit. Build/runtime overrides retain `NEXT_PUBLIC_APP_URL=https://bench-scout-sholly.vercel.app` and explicitly set `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED=false`.

The hosted older-file section and verified fingerprint field were inspected and prepared at the protected staging alias. At that preparation checkpoint the metadata preview had not yet been submitted; the newer acceptance above records its result. No file bytes were read or copied, and no business records or sharing grants were changed. A fresh provider alias lookup confirms `bench-scout.vercel.app` still points to `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ` (`bench-scout-jedrpyruu-sholly.vercel.app`). No main merge or public promotion occurred. Live-hook/write-pause dependency remains required before any real-file copy; do not promote this staging-canonical build. See [backfill workflow](PRODUCTION-DOCUMENT-BACKFILL.md).


## 21 October 2026 — Approved staged Production diagnostics

The operator explicitly approved staging source `b399b13c47041653fb6649bcc6abb06bef377a09`, without main merge, live-domain promotion, bulk backfill or changes to real documents. After official CLI authorisation, a clean detached checkout was linked to the existing sholly/bench-scout project. `vercel deploy --prod --skip-domain` created Ready/Staged deployment `8DwvVxyGiP1eZScMQKgHFWms833h`; first operator readiness submission was rejected by the configured canonical-origin guard before administrator/database access.

The same source was rebuilt as Ready/Staged [5xj9zsypDUgenQQ2kLA1pgkErTqB](https://vercel.com/sholly/bench-scout/5xj9zsypDUgenQQ2kLA1pgkErTqB), with build/runtime `NEXT_PUBLIC_APP_URL=https://bench-scout-sholly.vercel.app` overrides only for that deployment. Use that protected alias for diagnostics. The project’s saved live URL and origin-security rules were not changed. Vercel shows custom-domain assignment Skipped; a fresh overview still shows `bench-scout.vercel.app` on the July main deployment `4bTpas5uPn1jRpwGeu4eUJvX7nhZ`. Vercel authentication remains enabled; an anonymous initial staged request redirected to Vercel SSO.

A deliberately wrong-key request through the corrected staging origin returned Unauthorized, as expected. Valid-key connection, QA storage recovery and alert receipt are pending. No database migration, real-document backfill, QA storage check or Production alert occurred. **Do not promote this diagnostics build with its staging canonical URL**. [Runtime acceptance](PRODUCTION-RUNTIME-ACCEPTANCE.md) records precise limits and the operator handoff.

## 19 October 2026 — Testing release preparation

User requested publishing the next audit priority to the existing Vercel test link. Target branch: `testing`; repository: `Ssholly/BenchScout`; existing Vercel project: `sholly/bench-scout`. This release includes the pending employer/company/vacancy safety controls, first application-journey audit fixes, and opt-in professional summaries/preview. No production branch update is requested.

Validation: lint, TypeScript, 172 tests and production build passed. The configured database reports all five migrations up to date and no missing compatibility columns. No database migration was applied during this release preparation. Browser Settings preview was inspected at 390px/320px; keyboard draft consent changes were reverted without saving. Full synthetic employer/candidate staging acceptance, finer document scope and candidate-review concurrency work remain open; pilot readiness remains HOLD.

Release confirmed: commit `f0d1a67fdf746e6f8893080f5e7d04c5f151aefc` was pushed to `origin/testing`. Vercel deployment `G8vefGUn9bNV5Sad6Ey8ENUNciiK` reports **Ready**, environment **Preview**, source branch **testing**, and that exact commit. Details: https://vercel.com/sholly/bench-scout/G8vefGUn9bNV5Sad6Ey8ENUNciiK. The existing alias https://bench-scout-git-testing-sholly.vercel.app/ points to this release (immutable deployment: https://bench-scout-33gskhgwr-sholly.vercel.app/).

Hosted read-only check: opened the existing test alias at `/settings#career-profile` with the existing signed-in session and confirmed Professional summary sharing, the unchecked default-off checkbox, Employer preview and Save career profile controls. No consent change was saved and no application/decision was submitted. This confirms the feature is served by testing, not a full synthetic employer/candidate acceptance run. Documentation-only follow-up commits may update the alias while retaining this application code.

Earlier no-deployment statements below describe their respective historical audit passes. No production branch was pushed.

19 October 2026: [Launch audit](LAUNCH-AUDIT.md) records additional application, withdrawal, credential-badge, employer-feedback and vacancy-closure changes. No new schema/migration or environment variable is required by that pass. They passed local checks/build but have not been pushed or deployed. Before release, validate complete candidate/employer journeys with synthetic staging accounts and private files; the audit remains HOLD pending the listed gates. Schema compatibility checks do not prove hosted code is current.

The code changes do not apply themselves to the live database or migrate already public files.

1. Back up PostgreSQL and the old blob store. Put the existing deployment into maintenance mode while upgrading so old endpoints cannot continue writing public documents or accepting unauthenticated changes.
2. Compare the existing database with the original schema represented by `prisma/migrations/20260527000000_baseline/migration.sql`. If it matches and no Prisma migration history exists, mark that baseline as already applied:

   ```sh
   npx prisma migrate resolve --applied 20260527000000_baseline
   npx prisma migrate deploy
   ```

   For a new empty database, run only `npx prisma migrate deploy`. If the existing database differs, reconcile the schema in staging first. Never run `migrate reset` against production. The security migration is additive; it does not delete user data.

3. Configure a separate private Blob store, `BLOB_PRIVATE_READ_WRITE_TOKEN`, the legacy `BLOB_READ_WRITE_TOKEN`, independent admin/cron/salary secrets, the canonical application URL, and a verified email sender.
4. Run `npm run documents:migrate` to inspect counts, then `npm run documents:migrate -- --apply` to copy objects privately and remove their public originals. If old-object deletion fails, manually remove the reported pathname from the legacy store. The script does not claim to revoke copies already downloaded by third parties.
5. Deploy the new application and configure authenticated server schedules as described in README. Existing browser-local login hints are intentionally invalid until the user signs in again.
6. In staging, verify candidate registration and confirmation mail; login and logout; private CV/license upload/download/delete; cross-account denials; employer review, posting, application, shortlisting and email delivery; password reset revocation; salary editing; and a scheduled scan with fresh and repeated source fixtures. Check desktop and mobile screens with both account roles.
7. Review existing employer approvals and independently review licenses before using the new review label. Existing salary reports have no owner key and cannot safely be claimed using a public report ID; contributors can submit a new report, while an administrator handles legacy corrections offline.
8. Reopen access after checking database backups, migration results, and private storage behavior. Retain migration logs without tokens or document contents.

Rollback requires restoring the prior database/storage backup and compatible application together. Do not redeploy the prior insecure API against user data as a routine rollback strategy.


## Employer safety release — 16 October 2026

Read [the full feature and API reference](EMPLOYER-VERIFICATION.md) before rolling out this release. It adds private employer submissions, required company evidence checks, moderation of new/edited vacancies, candidate reports and suspension/audit operations.

1. Apply migrations before running the compatible application. `20261016000000_employer_safety` adds four `Employer` fields plus `SafetyReview` and `JobReport`; it does not delete records. Existing approvals become `legacy-approved`, and existing active vacancies remain active until deliberately re-reviewed.
2. Run `node scripts/check-database.cjs` and require `compatible: true`. This checks metadata only. No new environment variable or third-party provider is needed; retain the existing strong `ADMIN_SECRET` and session configuration.
3. Deploy compatible code. Check `/employer` company submission/status/feedback and `/admin/reviews` using the correct account roles. Confirm a new or edited vacancy stays out of discovery until company and vacancy approval; check that a revoked employer cannot accept applications or access candidate documents.
4. In staging, verify all evidence fields, stale-decision conflicts, no-fees declarations, report ownership/deduplication, removal, suspension and reinstatement. Confirm company approval does not automatically publish paused vacancies. Check mobile forms and a full populated database workflow. Use designated test data and do not grant real employer approval as a test shortcut.
5. Assign a reviewer to monitor pending queues and candidate reports. This release sends no moderation notifications. Find legacy employers by email and request updated submissions; the migration does not automatically suspend them. Preserve review evidence under the existing private administration controls.

Recorded state: `prisma migrate deploy` successfully applied/recorded the email-confirmation, candidate-profile and employer-safety migrations in the configured database. The post-migration check reported no missing columns, and the authenticated local admin queue returned 200. Lint, TypeScript, 153 tests and the production build passed. The hosted application has not been deployed for this feature. Treat database application and hosted-code deployment as separate release steps.

Rollback should keep the additive tables/columns and audit/report records. Returning to older application code would also remove its new moderation/reporting protections, even though the schema remains compatible; review access and publication behaviour before any rollback. Do not drop safety records to roll back the UI.


## 19 October 2026 — Toolkit mobile refinement

Targets the existing `testing` Vercel alias. This CSS/copy/accessibility refinement requires no migration or environment change. Lint, TypeScript and 172 tests passed; browser checks at 320 × 568 and 390 × 844 confirmed 16px modal clearance, scrolling content, visible footer and the expandable drafting disclosure. No real CV was sent for drafting and no application was submitted. Production build and diff checks passed. Code commit `40c8795186283cfb07de2ecf5a0fc3b207304888` was pushed to `origin/testing`; the Vercel commit status is success for deployment [5YxYAp6djKWTcjNxDpUAmueCLV48](https://vercel.com/sholly/bench-scout/5YxYAp6djKWTcjNxDpUAmueCLV48). Test alias: https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed.

Hosted read-only verification opened the toolkit on the test alias at 390 × 844: dialog bounds x=16..374, y=16..828, with the footer inside those bounds and the new Cover letter / How drafting works copy served. No draft generation or final application action was triggered. A documentation-only follow-up records this evidence.


## 19 October 2026 — Application document selection

Additive migration `20261019000000_application_document_selection` was applied successfully to the configured database using Prisma migrate deploy. It adds Application.documentSelection and backfills only current private CV references for existing applications. Post-migration read-only compatibility returned missing=[] and compatible=true. This does not prove every hosted environment uses that database; verify the column in any separate deployment database before release. No new provider/environment variable or file copies. Never deploy older broad-access code as a privacy rollback without reviewing employer access.

The candidate selector, per-application file reference checks, employer link filtering and selected-kind history are implemented. See [Application document sharing](APPLICATION-DOCUMENT-SHARING.md) for contracts and retention limits. Lint, TypeScript, all 177 tests, production build and diff checks passed. Synthetic component mobile checks passed at 320/390px. Code commit `b02fdaf02a3cd4fcff7a4e8c2bb2551d53643750` was pushed to `origin/testing`. Vercel reports success for [deployment 9aV31E6hw5tPRySWfqSi4JCcVKxt](https://vercel.com/sholly/bench-scout/9aV31E6hw5tPRySWfqSi4JCcVKxt), serving the existing alias https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed. No real application or employer decision was submitted.

Hosted read-only check after deployment: the signed-in candidate matches feed loaded five Apply Now controls with no visible alert, exercising the updated application-selection query against the hosted database. No direct synthetic vacancy was created and no real application was submitted. The hosted selector-to-employer acceptance journey remains open; the interactive selector itself was checked in the removed local synthetic preview. Documentation-only follow-up records these results.


## 19 October 2026 — Candidate credential-review safeguards

Migration `20261019010000_candidate_review_revision` applied successfully to the configured database. Post-migration compatibility returned missing=[] and compatible=true. The two new User fields preserve historical flags; current badges require a matching approved revision, so legacy approvals require independent re-review. No candidate was approved as a migration/test shortcut. Coordinate all profile/credential writers or isolate databases from older application versions; an older deployment is not a safe review-protection rollback.

Implemented current-candidate lookup/private evidence download, revision/identity-checked atomic decision plus SafetyReview, mutation invalidation and stale profile/scan-write guards. No new provider or environment variable. Local mobile form checked at 320/390px without entering administrator credentials or submitting a decision. Lint, TypeScript, 192 tests and diff checks passed. Production build passed. Code commit `e91a6b3cbda03402a1486ea0e14991525b187eff` was pushed to `origin/testing`. Vercel reports success for [deployment 2mu4waWBuCyUtpV2xwjBR3phenAv](https://vercel.com/sholly/bench-scout/2mu4waWBuCyUtpV2xwjBR3phenAv), on the existing alias https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed. See [Candidate credential review](CANDIDATE-CREDENTIAL-REVIEW.md) for contracts, audit privacy and remaining operational limits.

Hosted read-only verification opened /admin/reviews on the test alias, confirmed Trust and credential reviews and selected Candidate license. Candidate email, Load current candidate evidence and Reviewer name appeared; loading/saving remained disabled without an administrator secret and loaded candidate. No secret was entered, candidate looked up, private evidence downloaded or review decision submitted. This verifies served controls and compatible signed-in shell queries, not a live concurrent approval/storage acceptance run. Documentation-only follow-up records the evidence.


## 19 October 2026 — Isolated acceptance and match-summary correction

No new migration. All seven repository migrations were exercised on a fresh temporary QA schema, which was then removed. This does not change or certify a separate hosted Preview database. Custom SMTP settings are optional; existing provider configuration is preserved when SMTP_HOST is absent. Loopback capture settings were used only by the isolated child server and must not be added to Vercel.

Lint, TypeScript, 199 tests, production build and diff checks passed. Eighteen scripted real HTTP/PostgreSQL/private-Blob steps passed, plus a direct anonymous Blob request denied with 403. Six messages were captured during the scripted phase. Browser checks covered candidate submission/selected files, employer guarded PDF access, interview/notification, withdrawal and optional certificate upload via file chooser. Follow-up HTTP verified withdrawn employer access 403 and owner access 200. Match averages now exclude unscored employer posts; an employer-only feed shows an unavailable average and factual explanation.

Cleanup used exact-scope operator recovery because the original non-interactive runner had closed stdin: seven remaining synthetic private objects removed, all three synthetic user prefixes verified empty, temporary schema removed and its absence checked. The runner now requires a TTY for --keep before resources are created. No normal account/file was removed. Read-only legacy inventory found zero referenced public objects across two document-bearing accounts. Anonymous testing API request redirects to Vercel SSO. Hosted database separation, external inbox delivery and backup/restore remain launch gates; pilot stays HOLD. See [scrubbed evidence](qa/2026-10-19-isolated-acceptance.json).

Code commit `689476b31f968eb7de4a9c5c33d11103499b7c6b` was pushed to `origin/testing`. Vercel reports success for [deployment HFoyTia8xkmBafWn9GobsLxkddny](https://vercel.com/sholly/bench-scout/HFoyTia8xkmBafWn9GobsLxkddny), serving https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed. This hosted release check establishes deployment status; the complete synthetic journey above ran on the isolated local server with real services. A documentation-only follow-up records this result.


## 19 October 2026 — Hosted environment metadata refresh

Read-only authenticated dashboard audit found DATABASE_URL scoped to Production and Preview with no testing override or linked Shared variables. Neon shows a single production branch and six-hour history retention. Private Blob token is Preview-only; administrator/salary secrets are absent from the visible configuration. See [Hosted operations readiness](OPERATIONS-READINESS.md) for evidence limits and the prepared empty BenchScout Testing project proposal. No provider value was revealed or configuration saved. No new database, credential, migration, email or recovery action occurred. Documentation-only update; actual environment separation and recovery acceptance remain open.


## 19 October 2026 — Dedicated testing database/store cutover

User created the prepared BenchScout Testing project. Verified distinct database endpoint/owner and zero initial public tables. Applied all seven migrations and independently matched their completed history/checksums. Initial candidate/employer/job/application/session counts were zero. Dedicated private benchscout-testing-documents store passed synthetic write/read, anonymous 403 and cleanup to empty. Secret DATABASE_URL and BLOB_PRIVATE_READ_WRITE_TOKEN overrides saved for Preview/testing only; Production bindings and normal local .env unchanged. No new application migration/code. See Operations readiness for retained shared defaults, independent-secret and recovery limitations.

New testing deployment is being published. A disposable fixture (no real data, no mail) is reserved for a hosted login/upload smoke check; exact deployment and cleanup results follow after verification.


### Testing cutover completion evidence

Commit `699b2562228773ab1030dfc4e80eafdd02ca961e` was pushed to origin/testing. Vercel reports success for [deployment ADL5XfXxtqHwnMkEXQnGvd8eGQk3](https://vercel.com/sholly/bench-scout/ADL5XfXxtqHwnMkEXQnGvd8eGQk3), serving the existing testing alias. The current hosted app accepted a disposable fixture login; a real browser file chooser uploaded a synthetic optional certificate and its guarded Cloud Vault Preview opened. Direct database verification confirmed the session and file reference were saved in the new testing database, the object belonged to the new private testing store, and the fixture email was absent from the normal database.

Scoped cleanup removed the one synthetic private object, verified it no longer readable, removed the fixture session/account and confirmed zero remaining candidates, employers, jobs or applications. Browser logout completed afterwards. No real user/file was copied, no email sent, and no Production binding changed. Existing testing logins no longer apply to the fresh database; new test registrations are required. [Scrubbed hosted evidence](qa/2026-10-19-hosted-isolation.json). Screenshots are private temporary proof files, not repository assets.

This verifies the current testing deployment's database/store boundary through actual writes. It does not certify other preview branches, historical deployments, independent admin/cron/salary secrets, inbox delivery or backup/file restore. No product code changed; documentation diff/JSON validation passed. The deployed build succeeded on Vercel; the earlier 199-test local run was not repeated for configuration/documentation-only changes.


## 19 October 2026 — Candidate confirmation template and credential handoff

Candidate registration uses the shared sendVerificationEmail helper, including role=candidate, expiry wording and a text alternative. No new API endpoint, migration or environment variable. Lint, TypeScript, all 201 tests, production build and diff checks passed. Existing auth-flow tests and two new registration-route tests passed; no outbound provider call occurs in these tests. Code release to testing is being published; exact Vercel evidence follows after success.

The three testing Secret rows were prepared without values for operator entry/Save. Credential presence after saving and runtime authentication still require verification/redeployment; no new secret is claimed active. Approved test recipient is recorded privately in the conversation; connected Gmail differs, so receipt is not inferred from that connector. No external test mail sent. See Testing credentials for the operator handoff and remaining checks.


### Confirmation-email release result

Commit `da068bec511229a21dbcd05af006bb934118d9f6` was pushed to origin/testing. Vercel reports success for [deployment 7FLcKgxaV8tWxZUbocxubPyM96Sb](https://vercel.com/sholly/bench-scout/7FLcKgxaV8tWxZUbocxubPyM96Sb), serving the existing testing alias. No production branch was pushed. This verifies deployment of the shared candidate template; no live signup/email or inbox-rendering claim follows. The credential-entry handoff remained pending at this checkpoint; if values are saved later, redeploy again and verify scoped presence/authentication. Documentation-only follow-up records this result.


### Testing credentials saved by operator

Operator confirmed Save after entering all three new credentials. Fresh Vercel metadata shows Secret ADMIN_SECRET, CRON_SECRET and SALARY_OWNER_SECRET scoped to Preview/testing, retaining the original shared defaults. Values were not read back; presence/scope does not prove strength, independence or successful auth. This documentation checkpoint triggers a new testing deployment after the save; exact deployment status follows. No Production binding changed.


### Testing credential redeployment result and acceptance boundary

Commit `c050bc5eaae78e3d6f582d0da2dbdd97ecf79917` was pushed after the operator's credential save. Vercel reports success for [deployment Bs3Z9gmrvbe4S3imQEz6vYe78Gsg](https://vercel.com/sholly/bench-scout/Bs3Z9gmrvbe4S3imQEz6vYe78Gsg), serving the existing testing alias. The hosted review form rejected a deliberately wrong key with Unauthorized.; no review decision submitted. Correct-key read-only queue check is handed to the operator, and cron/salary acceptance remains separate. Presence/scoping is verified; secret values/strength/independence are not read back.

One approved candidate recovery-email request was submitted through the hosted UI, which returned to login. Generic recovery behaviour does not prove account existence or provider/inbox delivery. Recipient Inbox/Spam confirmation is pending, and no password was changed. The unrelated connected Gmail mailbox was not searched. No confirmation/interview message sent in this phase. See [scrubbed evidence](qa/2026-10-19-testing-credentials.json). Documentation-only follow-up records this checkpoint; production unchanged.


## 20 October 2026 — Administrator queue acceptance and recovery diagnosis

The operator's correct testing key loaded all three hosted review queues (company/vacancy/report counts zero). Prior deliberately incorrect key was denied; no review decision submitted. A read-only query on the dedicated testing database found no candidate/employer or candidate reset token for the approved exact recipient. Thus recovery's intentional absent-account/no-send path applies; no provider delivery result is inferred. Prepared an unsubmitted signup with password left to the user.

No application/provider/schema/migration or production change in this pass. Documentation diff/JSON validation passed; prior 201-test/build results remain prior evidence. [Scrubbed diagnostic record](qa/2026-10-20-admin-and-email-diagnosis.json). No recipient address, credential or token value is included. Documentation-only update to testing; no new functional deployment claim is required.


## 20 October 2026 — Shared account-email branding

The recipient confirmed the prior reset link arrived; no password changed. New shared body layout now unifies initial/resend candidate and employer confirmation with password reset using the existing embedded laboratory PNG, BenchScout wordmark, navy/teal card/button/footer, escaping, UTF-8 metadata and text alternative. Distinct token roles, expiry and company-review notice remain. No migration, environment/provider or sender-profile change. Lint, TypeScript, 203 tests, production build and diff checks passed; synthetic browser previews passed 320/390px. See Account emails and its scrubbed evidence. Testing release is being published; exact commit/Vercel status follows. New-design live inbox rendering is not established by the earlier receipt.


### Shared account-email release and new-design review request

Commit `0653bcb74d06e8a03bb09b699bedbf14c4ecf6c6` was pushed to origin/testing. Vercel reports success for [deployment 4xsY5fvTDEDgZyJdWNY3rpWFQesh](https://vercel.com/sholly/bench-scout/4xsY5fvTDEDgZyJdWNY3rpWFQesh), serving the existing testing alias. No production branch or provider configuration changed. Local lint/typecheck/203 tests/build and synthetic mobile previews passed before release.

After deployment, requested one additional candidate reset email at the approved replacement inbox for visual review. The actual hosted UI returned to login. Generic acknowledgement is not receipt/rendering proof; recipient confirmation of this newest design is pending. The prior reset receipt is already confirmed and is recorded separately. No confirmation email was sent and no password changed by the agent. A subsequent reset request replaces the previous candidate reset token; the newest link is the relevant one. Documentation-only follow-up records the release/request without addresses or token values.


## 20 October 2026 — CV skills and role keyword repair

Released core commit `70faf55` and final application commit `e17170d` to `origin/testing`. Vercel Preview deployment [CD1zsnx7QrajbGB5shy1s3sXCwdB](https://vercel.com/sholly/bench-scout/CD1zsnx7QrajbGB5shy1s3sXCwdB) reports success. The existing testing alias serves the consent-based extraction controls, normalized removable chips and corrected profile label/shortcut. Hosted read-only/UI navigation verified the new controls and saved chips; no real preferences or CV-to-AI request was submitted. Documentation-only follow-ups may advance the branch without changing application code.

Lint, TypeScript, 211 tests, production build, 18 isolated live acceptance checks, targeted browser persistence/mobile checks and a synthetic live Gemini request passed. The isolated schema and five remaining synthetic private files were removed. No new migration/configuration and no production branch update. Full details, API contracts, evidence and operator extraction steps: [CV skills and role keywords](RESUME-KEYWORDS.md).


### 20 October 2026 — Employer directory denial visibility

Commit `4857fb1` reached the protected testing alias through successful Vercel deployment `5yC26qaDDXZo2LYgAbw6U2PgaQUY`. Hosted pending-employer denial and Retry passed. No migration, environment or permission change. The follow-up stable cleanup callback passed lint without warnings, TypeScript, all 216 tests and webpack build; commit `5320bda` deployed successfully as Vercel `82nRy8RF1e6dR9hxb69zHFyaR649`. Synthetic company approval persisted, and one synthetic vacancy remains pending review with zero published. The remaining hosted hiring journey is incomplete.


### 20 October 2026 — Future interview validation and adaptive date/time row

`49e5108` deployed successfully as Vercel `6ThBhP6CvRi9H6qkbpLzckENZqoC`. Hosted past-time form rejection passed; a valid synthetic future interview persisted after full reload, and the approved recipient confirmed correct inbox details. Shared client/API validation uses Africa/Lagos.

Adaptive-grid follow-up `87bebfd` deployed successfully as Vercel `HpTxd6mR2biKSpbs5UGhBn6838Ak`. Lint, TypeScript, 220 tests and build passed. The original 320px overflow is recorded; fresh 320/390px scheduling-form verification remains pending because the scheduled fixture no longer offers the form. No schema/migration/configuration change or production branch update. Candidate in-app/scheduler and remaining hosted gates are still open.


### 20 October 2026 — Compact recruitment workspace

Application `7aaabef` reached the testing alias through successful Vercel deployment `HMr8UtkBPqP2cdAVKZoVtmurbhiC`, following `e0d9e35` and `5e96bbb`. Compact posting, drawer and match layouts were verified with long synthetic content on phone/desktop widths; final posting/control bounds passed 320/390/1200/1440px. The pending-applicant interview form passed 320/390px without a new save/email. Lint, TypeScript, 220 tests and production builds passed. No API/schema/configuration/permission change or production branch release. [Layout evidence](RECRUITMENT-LAYOUT.md) and [hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md) distinguish completed UI checks from the browser-blocked direct-denial check.


### 21 October 2026 — Encrypted document backup tooling and testing configuration

Implementation `2bbb903` passed lint, TypeScript, 230 tests and a webpack production build. After the operator privately saved five testing-only Secret variables, checkpoint `b7370c74cd7d871613f830468048a060c54ab1df` deployed successfully as [EQQwtr3UW2XhdEVBk9z2cSLKY1Ne](https://vercel.com/sholly/bench-scout/EQQwtr3UW2XhdEVBk9z2cSLKY1Ne), serving the existing testing alias. Secret values were not read back. Hosted operator screen and invalid-key rejection passed; correct-key configuration/provider restoration are awaiting operator execution. No production push, schema/migration, actual existing-file backfill or real-document restore. See [document recovery](DOCUMENT-RECOVERY.md).


### 21 October 2026 — Scoped older-file backfill and alert test

`13310fc40d34c269a333d088cb3af2df537af56f` deployed successfully to testing as [GLtdVkt4f7q6b4ctzrijZiyAVoAw](https://vercel.com/sholly/bench-scout/GLtdVkt4f7q6b4ctzrijZiyAVoAw). Lint, TypeScript, all 235 tests and production build passed. Hosted operator controls fit the 320px viewport without measured overflow. Fixed-synthetic-account backfill and approved-inbox test submission await private operator authentication; provider backfill/inbox results remain pending. No environment/schema/migration or production update. See [document recovery](DOCUMENT-RECOVERY.md).

Deployment correction during this checkpoint: the first CLI Preview attempt omitted an explicit project and found an unlinked checkout, creating a duplicate `sholly/labpro-connect` project (its first build became that new project’s Production build). This was an operational mistake, not a BenchScout rollout. The duplicate project was deleted; a separate request to its generated public alias returned HTTP 404 / DEPLOYMENT_NOT_FOUND. No original BenchScout alias or database configuration was changed by that attempt. The checkout was then explicitly linked and its expected project/team IDs asserted before retrying with `--project bench-scout --scope sholly --environment preview`. Future manual deployment commands must specify the project/scope and verify their local ID mapping; branch name or directory name alone is insufficient. No main merge or hardened Production promotion was performed.
