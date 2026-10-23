## 23 October 2026 — Approved controlled public pilot reopened

Promoted exact tested Production artifact `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` / source `082c225` without rebuild. All thirteen public GET checks passed; browser home rendered. Promotion moved git-main, which was restored to maintenance under the approved scope; testing/diagnostics remained intact. Final metadata confirms this artifact is current, zero bypasses, and cleanup schedule registered (`17 2 * * *`). Git-main's anonymous 302 was verified as Vercel authentication in front of the exact maintenance target, rather than falsely treated as an application response. Actual scheduled invocation and private public-origin sign-in remain pending. No main merge, real-file operation, valid-credential test or new test email ran. Recovery limits were explicitly accepted for this pilot. [Execution](CONTROLLED-PILOT-2026-10-23.md); [scrubbed evidence](qa/2026-10-23-controlled-pilot-reopened.json).

## 23 October 2026 — Final cutover review refreshed; controlled reopening awaits decision

Verified current candidate/rollback Ready identities and unchanged maintenance/testing/diagnostic aliases, public root 503, zero bypasses, eight Production migration checksums and cleanup 0/0/0. Source/archive stores remain Private/Available. Neon shows six-hour history and no snapshots/schedule; metadata still contains three current private files awaiting the separately approved backfill. No file contents, secrets, records or configuration changed. Prepared exact controlled promotion, fallback, smoke, scheduler/public-origin follow-up, recovery acknowledgement and separate main integration scope. [Decision](CUTOVER-DECISION-2026-10-23.md); [scrubbed evidence](qa/2026-10-23-cutover-review.json).

## 22 October 2026 — Approved authenticated integration subset passed and cleaned up

All eight real HTTP/PostgreSQL subset checks passed, including expiry/re-login/logout, cross-account identity, salary owner/cross-owner/legacy preservation and duplicate submission. The user explicitly approved the temporary QA schema operation after automatic review blocked the initial attempt. Five messages were captured locally; no external email or private-file operation occurred. Schema removal was independently verified, fixture accounts are absent from the normal schema and local HTTP port is closed. Existing records/files and public aliases remain unchanged. [Full scrubbed evidence](qa/2026-10-22-authenticated-subset-accepted.json). No hosted Vercel authenticated login, public-origin links or scheduler invocation is claimed.

## 22 October 2026 — Authenticated HTTP/database subset prepared; execution held

Added `--auth-only` to the existing isolated acceptance runner for real session expiry/re-login/logout, cross-account profile rejection and salary owner/cross-owner/anonymous legacy checks. Synthetic accounts and salary rows would exist only in a temporary schema; mail is captured locally and source/archive tokens/backups are disabled. No private-file cleanup occurs in this mode. Syntax, focused ESLint and configuration preflight pass. Execution was rejected by automatic approval review because the configured database is Production and this new temporary-schema mutation needs explicit approval; no DB mutation or hosted authentication result is claimed. [Scope, cleanup and limits](STAGING-ACCEPTANCE.md#authenticated-access-subset--prepared-22-october).

## 22 October 2026 — Twelve protected hosted access checks passed

Executed the separately approved GET-only smoke on the exact corrected release candidate. Root/employer HTML loads passed; disabled setup/test-email endpoints returned 410; protected APIs and a forged session returned 401 JSON errors. Temporary project bypass revoked and protection restored (zero entries; revoked-token HEAD 302). No valid login, account/data/file change, email, worker processing, public promotion or main merge ran. Updated the release packet/readiness record while preserving the distinction from authenticated cross-owner and actual scheduler checks. [Scrubbed results](qa/2026-10-22-protected-access-smoke.json).

## 22 October 2026 — Final protected access smoke prepared

Extended the guarded operator helper with a plan-by-default `--access-smoke` mode: twelve fixed GET-only checks for root/employer HTML, disabled development endpoints, anonymous protected API denial and deliberately invalid session rejection. It requires no valid application secrets and does not load local environment files in this mode. Exact candidate/project/source guards and temporary-access revocation/recovery remain enforced. Syntax, focused ESLint and non-network plan mode pass; hosted checks have **not** run and require separate approval for the project-wide temporary bypass. No app source/build, public mapping or data changed. [Exact scope and limits](CRON-AUTHENTICATION-CHECK.md#fixed-get-only-access-smoke--prepared-22-october).

## 22 October 2026 — Salary ownership acceptance and remaining release checks

Added five route-level regression tests covering salary write role gates, repeat owner submission, ignored caller ownership, cross-owner/legacy edit and deletion denial, successful owner changes, and missing stable-secret fail-closed behaviour. All **281 tests** pass; focused ESLint and whitespace checks pass. Persistence is an in-memory adapter: no Production account, salary row, file or configuration changed. The deployed application source remains `082c225`; no replacement deployment is needed for test/documentation additions.

Updated the [current release packet](PUBLIC-RELEASE-PACKET.md) to link the corrected cron candidate and distinguish existing dated HTTP/hosted evidence, current regression coverage, separately scoped hosted salary work and checks possible only during/after approved cutover. Promotion, main merge and older-file copying remain held. [Evidence](qa/2026-10-22-salary-ownership-acceptance.json).

# Change log

## 22 October 2026 — Production-only cron correction accepted

Operator save and metadata establish a new Production-only Secret CRON_SECRET (`4sCKxYxYsfrOf5up`), with the existing Preview-only value and testing override metadata unchanged. The already-approved replacement build of exact validated source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is **Ready** as `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`, immutable `bench-scout-r2ldibwnk-sholly.vercel.app`. Original project and both source metadata fields match. It uses the public canonical URL, normal submitted cleanup schedule, backups enabled, test mode off and backfill apply false.

The explicit temporary-access probe now passes on that exact candidate: **wrong key 401; privately supplied new Production key 200; dryRun true; pending/failed/due 0/0/0**. No normal cleanup or email was invoked. Temporary bypass was revoked, revoked-token access returned 302, and independent project metadata shows **zero bypasses**. The local key file/directory were removed, entry server stopped and port closure verified. The tool did not inspect or print key values.

All five existing alias mappings are verified preserved; public/git-main remain on maintenance and diagnostics remain on the prior protected stage. Active project cron definitions are still empty, so actual scheduler activation/invocation is **not yet certified**. The older public-origin candidate is superseded, not silently deleted. No public promotion, main merge or older real-file copy occurred. This closes the correct-key cron authentication blocker; other packet gates remain separate. [Accepted correction evidence](qa/2026-10-22-production-cron-correction-accepted.json).

## 22 October 2026 — Approved cron scope split applied; new Production save pending

The operator approved the controlled Production-only correction and replacement protected build/dry-run. Fresh metadata matched the plan. A **target-only** PATCH moved `CRON_SECRET` binding `EHiEaCCl6rFtGjwz` from Production+Preview to Preview only, without sending or reading a secret value. Vercel rejects a Sensitive-variable PATCH containing even an unchanged key field; that rejected request was followed by the successful target-only edit. Independent metadata lookup verifies Preview-only scope and byte-for-byte unchanged testing-override metadata. No Production key binding existed at that verification checkpoint; **do not build Production until the operator saves the prepared new Production-only Secret**.

The Vercel form is prepared with CRON_SECRET, Secret type and Production only; the tool does not enter or submit the new key. A corrected local private-entry form is also prepared for a one-time test copy of that same new key. The operator must privately generate/save the new value and submit both forms; no key belongs in chat or Git. New build/dry-run approval is already included in the correction, but neither has executed. Existing immutable deployments keep their captured values; public/git-main stay on maintenance. [Scope execution evidence](qa/2026-10-22-production-cron-scope-split.json).

## 22 October 2026 — Saved Production cron key rejected; private artifacts removed

The operator-supplied saved key was tested only against the fixed public-origin candidate's cleanup dry-run: wrong-key **401**, supplied-key **401**. This does not establish which saved value is effective or whether the current Production value satisfies the application; authenticated cron acceptance remains open. Temporary bypass creation/revocation completed; project access absence and revoked-token HTTP **302** were verified. The private key file was removed and the loopback entry server stopped; port closure was checked. No normal cleanup, email, public promotion or key-value inspection occurred. [Actual result](qa/2026-10-22-saved-production-cron-attempt.json).

Metadata-only/provider UI inspection confirms testing has its separate Preview/testing Secret, while the current unscoped CRON_SECRET is shared by Production and Preview and was last updated 20 May. Prepared an unsaved Production-only Secret form. Proposed separately approved correction: preserve the old shared value on Preview only, let the operator privately save a new Production-only key, verify scopes and rebuild exact source 082c225 as a protected public-origin candidate before retrying dry-run. Existing immutable keys remain captured; neither public reopening nor main merge is included. [Concrete correction plan](qa/2026-10-22-production-cron-correction-plan.json). [Vercel documents that environment edits affect new deployments only](https://vercel.com/docs/environment-variables/managing-environment-variables).

## 22 October 2026 — Local private-entry Origin rejection fixed

The operator reported Request rejected. Inspection showed the local POST failed before key validation; the private key file did not exist. A non-sensitive browser form reproduced **Origin failed / encoding passed** with Referrer-Policy no-referrer. The helper now uses **Referrer-Policy same-origin**, retaining exact Host/Origin checks, CSRF on key submission, loopback binding and owner-only storage. A browser rerun returned **Origin passed / encoding passed** without requesting or saving any key. The corrected empty private-entry page is reopened for operator retry. Syntax and ESLint pass. No Production secret, deployment, bypass token or cron request was changed/created in this fix. [Browser evidence](qa/2026-10-22-private-entry-origin-fix.json). [MDN explains the form Origin/referrer-policy interaction](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin).

## 22 October 2026 — Private operator entry prepared for the saved Production key

The operator confirms the existing Production cron key is saved privately. Added `scripts/private-cron-entry.cjs`, a temporary operator-only page bound to **127.0.0.1:3195**. It uses a password field, strict Host/Origin and CSRF checks, no-store/CSP/frame-denial headers, no external assets or logging, and an owner-only temporary directory/file outside the repository. It never echoes the key or executes the cron probe automatically. The page explains that the subsequent approved test sends the key only to the fixed BenchScout cleanup dry-run endpoint and that its temporary file is removed afterward.

Syntax and ESLint pass; the local form is observed and prepared for user entry. No saved key, hosted request or new bypass is claimed at this handoff. After the operator submits the form, the reviewed probe can use its private file without reading a browser password field or putting a key in chat, arguments, logs or Git. Remove the temporary file and stop the local server after acceptance (or a terminal failure); preserve only scrubbed results. [Procedure](CRON-AUTHENTICATION-CHECK.md).

## 22 October 2026 — Cron denial passed; authenticated dry-run awaits correct Production key

The explicitly approved temporary-access probe reached the exact public-origin candidate: wrong cron key **401**, existing local cron key **401**. Therefore correct-key cron acceptance is **not passed**; a Production mismatch, missing/invalid effective configuration or incorrect saved local key still needs resolution. No normal cleanup, new deletion intent or email ran.

Temporary access was revoked and independently verified: project bypass count **zero**, revoked token HEAD **302** to the protection gate. Creation/revocation propagation caused earlier platform-gate/transient observations; an initial helper token-format error was rejected by Vercel before creating access. The helper now uses the required 32-character format, validates returned access metadata, allows bounded propagation, reports sanitized errors, and supports an explicitly supplied private cron-secret file. Syntax, ESLint and non-network plan mode pass. No current app source/configuration or deployment was changed by these operational-helper fixes. [Full sanitized attempts and final cleanup](qa/2026-10-22-cron-authentication-attempt.json).

## 22 October 2026 — Protected cron dry-run prepared; no bypass created

Added the plan-by-default operational helper `scripts/verify-protected-cron.cjs`, targeting only the exact Ready public-origin candidate and cleanup dry-run path. It prepares explicit temporary project-bypass creation, wrong-key/correct-key GET checks, finally-based own-token revocation, restored-protection verification and private interrupted-cleanup recovery. Existing local cron key presence/minimum are checked without disclosure; its Production match remains unverified. Syntax, ESLint and non-network plan mode pass. No access token, hosted request, worker processing or email was created/sent. [Procedure/access risk](CRON-AUTHENTICATION-CHECK.md); [preparation evidence](qa/2026-10-22-cron-probe-preparation.json).

## 22 October 2026 — Approved public-origin candidate Ready; public remains paused

Validated source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is Ready as protected Production candidate `dpl_CSoxtMv87Zm4xVw2brybZxZV3onF`, immutable `bench-scout-926z7vaov-sholly.vercel.app`. Exact source/provider project identity match. Deployment uses the public canonical origin at build/runtime, validated webpack build, enabled backups, test mode off and backfill apply false. CLI reports Vercel authentication; independent anonymous HEAD returned 302 to Vercel sign-in.

The approved normal cleanup schedule was submitted (`17 2 * * *`). Fresh active project cron definitions remain empty and point to historical cron metadata, so no active scheduler registration or invocation is claimed. All five current alias mappings are unchanged, including both maintenance domains and protected diagnostics. No public promotion, main merge, real-file operation or new deletion intent occurred. [Build evidence](qa/2026-10-22-public-origin-build.json); [current decision packet](PUBLIC-RELEASE-PACKET.md).

## 22 October 2026 — Consolidated public release and rollback packet prepared

[The current decision packet](PUBLIC-RELEASE-PACKET.md) freezes the tested candidate, refreshed main identity, accepted migration/runtime evidence and exact maintenance fallback. It separates public-canonical build approval (including the normal cleanup schedule) from promotion, main merge and older-file copying. It records open acceptance/recovery limits, safe smoke/rollback steps and the risk of automatic main deployments. No public-origin deployment exists yet; promotion remains HOLD. README links the consolidated packet rather than requiring readers to infer current status from historical entries. [Structured checkpoint](qa/2026-10-22-public-release-packet.json).

## 22 October 2026 — Current Production queue connection accepted

The operator reports the correct-key deployed cleanup status returned **pending 0, failed 0, due 0** on the current protected Production diagnostic stage. Combined with the matching live database fingerprint and backup configuration response, this accepts the new runtime's read-only database and queue paths. No deletion worker, file mutation, backfill, alert or scheduled invocation was requested. An empty queue does not itself prove physical cleanup/retry; testing's hosted ordinary deletion and deterministic failure tests remain separate evidence. Public maintenance is unchanged. [Runtime evidence](qa/2026-10-22-protected-stage.json).

## 22 October 2026 — Current stage live connection accepted

The operator reports the current protected stage returned databaseConnected/configuredDatabaseMatches true and the previously verified Production fingerprint `c64b6f363fb232aaaa9650261e30b563fc2f67af452df65caa89f00f40f458ab`. Production environment, backupEnabled/backupConfigured/alertConfigured and testModeOff are true; businessRecordsChanged is false. Runtime buildCommit is null, so source identity relies on the separately verified provider metadata, not an invented runtime SHA. Correct-key cleanup queue counts are still pending. This checks configuration/connection, not a fresh storage recovery or mail delivery test. [Evidence](qa/2026-10-22-protected-stage.json).

## 22 October 2026 — Approved current diagnostic build Ready

Approved exact source `082c225a86a1ec582ceb2e27faf276f82b8a7994` is Ready as Production diagnostic deployment `dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg`, immutable `bench-scout-8vrlhm9fq-sholly.vercel.app`, in the verified original project. Source/audit metadata match. CLI reports Vercel authentication; project Standard Protection remains all_except_custom_domains. The explicit no-cron local configuration was used; project cron metadata has empty definitions (its historical deploymentId is retained, not relabelled as a current scheduler pass).

Only `bench-scout-sholly.vercel.app` moved to the new build after Ready; public and git-main remain on approved maintenance. Hosted current admin controls are present and a deliberately invalid key returns Unauthorized through the correct staging origin. Correct-key deployed database/configuration and queue status are prepared, not yet accepted. No real-file backfill, document mutation, main merge or public reopening occurred. This diagnostic canonical/config build must not be directly promoted publicly. [Deployment evidence](qa/2026-10-22-protected-stage.json).

## 22 October 2026 — Final candidate validation and diagnostic staging prepared

Frozen candidate `082c225a86a1ec582ceb2e27faf276f82b8a7994` passes lint, strict TypeScript, **276 tests**, webpack Production build and diff checks. A clean Git archive is prepared without local environment files (only the tracked .env.example), explicitly mapped to the original BenchScout project/team. Production cleanup schema is already applied and independently verified.

Prepared diagnostic-only deployment: CLI `--project bench-scout --scope sholly --prod --skip-domain`, exact source metadata, existing protected staging canonical URL at build/runtime, backups enabled, test mode off and backfill apply false. A separate local configuration override supplies `crons: []` and the validated webpack command for this diagnostic build; the repository's future public cron definition is preserved. This avoids treating skip-domain as a scheduler-disable guarantee. It will update the protected diagnostic alias while public and git-main remain on maintenance. This diagnostic build must not be promoted directly; a later live-canonical build needs the reviewed normal cron configuration.

No new Production build, runtime action, public promotion or main merge has been performed at this checkpoint. Previous diagnostic approvals do not cover this frozen source/configuration. [Validation and exact scope](qa/2026-10-22-final-release-validation.json). Official references: [CLI staging](https://vercel.com/docs/cli/deploying-from-cli), [cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

## 22 October 2026 — Approved Production cleanup migration applied

The operator explicitly approved `20261021000000_document_cleanup` on BenchScout Production. The authenticated Neon console verified **BenchScout / production / br-cold-hall-apf2uz7z / neondb**. One transaction checked the database identity, seven matching prior checksums, no unfinished migrations and absence of the new table, then ran the exact repository DDL and recorded its SHA-256 in Prisma history. COMMIT completed.

A separate read-only query confirmed **eight completed migrations, zero unfinished, nine cleanup columns, three indexes including the primary key, matching checksum and zero queued rows**. The existing one anonymous salary report remains unchanged. No existing business row or stored file was modified, no testing data imported and no application deployed or reopened. This closes the additive schema prerequisite; deployed current cleanup runtime, scheduler, canonical release and other remaining acceptance gates are separate. Do not drop the queue during rollback. Earlier testing-only/pending-migration entries below are dated history superseded by this execution. [Execution evidence](qa/2026-10-22-production-cleanup-migration.json).

## 22 October 2026 — Current Production compatibility checkpoint

Read-only SQL in the verified BenchScout / production / neondb target confirms seven completed migrations, all matching repository SHA-256 checksums, zero unfinished migrations and no DocumentCleanup table. The exact additive migration `20261021000000_document_cleanup` is prepared with target/history/checksum guards and same-transaction Prisma history; **not applied**. It creates an empty queue, primary key and two indexes without changing existing business rows or files. Production deployment of the current candidate must wait for this migration.

Salary aggregates show one existing report with null ownerKey and no owned reports. Preserve that anonymous historical contribution; the new stable ownership key must not be used to guess or reassign it. Runtime salary owner/cross-owner acceptance remains separate.

Fresh inventory contains 76 deployments (75 Ready, one Building at lookup). All 73 testing builds descend from isolation source `699b256`. All 74 non-containment application builds have the authenticated candidate upload wrapper; only 36 have the backup helper and seven have the durable worker. These source markers/ancestry do not prove saved connection values or global write isolation. Two remaining Production-target builds are containment and the retained protected diagnostic stage. [Compatibility evidence](qa/2026-10-22-production-compatibility.json); [source classification](qa/2026-10-22-remaining-source-review.json).

Current runbook corrections: public and git-main now serve maintenance; 31 approved old deployments are retired. Cleanup commits metadata/reference removal and durable intent transactionally; historical pre-fix lifecycle descriptions below are superseded. `vercel.json` now configures daily cleanup at 02:17 UTC; actual Production scheduler/key acceptance remains open. The new release needs **one additive migration**, not the earlier seven-migration/no-op path. The current protected staging canonical build remains unsuitable for direct public promotion. No reopening, backfill, credential change or migration was performed in this checkpoint.

## 22 October 2026 — Approved July deployment retirement completed

After separate explicit operator approval, `bench-scout-git-main-sholly.vercel.app` was assigned to the existing approved maintenance deployment `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`. The maintenance page was observed in the browser. Fresh provider lookup verified the old July deployment had no aliases and all other mappings were unchanged. Vercel `remove --safe` then removed only `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ`. Its immutable homepage now returns **404 / DEPLOYMENT_NOT_FOUND**. Complete post-removal inventory (74 entries, null next cursor) excludes that ID and retains every currently aliased deployment. Only the approved git-main mapping changed.

The two approved retirement operations have removed **31 deployments** in total. Database records, stored files, credentials and Git source remain intact; public service remains on maintenance. This does not certify all remaining historical writers or future old-main builds. Final release controls must prevent redeploying unsafe source, and other remaining deployed revisions still require review before claiming a global write pause. The earlier prepared/preserved entries below are dated history superseded for this ID. [Execution evidence](qa/2026-10-22-old-main-retirement.json).

## 22 October 2026 — Remaining July git-main retirement prepared

Fresh provider metadata confirms the only current alias for July deployment `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ` is `bench-scout-git-main-sholly.vercel.app`. Its exact source remains `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`; Git inspection reconfirms destructive setup GET and caller-identified/public upload behavior, without executing those routes. The existing approved maintenance deployment is Ready in the same project at source `336c6ed`.

Prepared scope: move only git-main to that maintenance deployment, verify the alias/terminal response, remove only the now-unaliased July ID with `--safe`, and verify inventory absence/immutable URL shutdown plus kept mappings. This has **not** been executed and needs separate approval because the earlier batch explicitly preserved this build. Database records, stored documents, source history, testing and diagnostics remain outside the removal. Other historical writers still require review. [Exact plan](qa/2026-10-22-old-main-retirement-plan.json).

## 22 October 2026 — Approved 30-deployment retirement completed

The operator explicitly approved removal of the exact 30 IDs in the first retirement set. Fresh alias checks excluded all targets; each target’s provider metadata matched the original BenchScout project. Vercel CLI 65.0.0 `remove` ran with `--safe --yes --scope sholly` and reported **30 removed**. An independent HEAD request to every removed immutable homepage returned **404 / DEPLOYMENT_NOT_FOUND**. A complete post-removal project inventory (73 entries, null next cursor) contains none of those IDs and retains all five keep-listed deployments. All five alias mappings are unchanged, including testing, public maintenance, diagnostics and old git-main.

No database records, stored documents, credentials or Git source were deleted or changed. No main merge or hardened public promotion occurred. The old git-main deployment was deliberately outside this approval and remains a separate historical writer gate; this batch alone does not establish a global write pause or approve real-file backfill. [Execution evidence and per-URL results](qa/2026-10-22-deployment-retirement.json). The earlier proposed/not-executed entries below are dated history, superseded for these exact 30 IDs by this execution record.

## 22 October 2026 — Retirement alias preflight refreshed

A fresh read-only Vercel lookup found five aliases. None of the 30 previously proposed obsolete deployment IDs is currently assigned to an alias. The current testing, public maintenance, protected diagnostic, containment Preview and old git-main mappings are preserved. This prepares a bounded retirement request; it does not authorize deletion or close the historical writer gate. The mapped old git-main deployment remains outside this set and needs separate handling. No deployment was removed. [Preflight evidence](qa/2026-10-22-retirement-preflight.json).

## 22 October 2026 — Replacement interruption regression coverage

Added two failure-boundary tests for replacement: a storage deletion failure and an unavailable worker after metadata commit. Both verify that the new current source survives and only the old source is removed by a later retry. All **24 focused tests pass**. These use mocked storage/database boundaries; no hosted provider outage was induced, no new hosted replacement is claimed, and application source/Production are unchanged. [Evidence](qa/2026-10-22-cleanup-replacement-retry.json).

## 22 October 2026 — Hosted synthetic deletion passed

After explicit action-time approval, only the newly generated QA-only licence image was deleted through the testing candidate UI. The app reported “Document removed and stored files deleted.” After reload, that slot remained Missing. An independent read-only query in `benchscout_testing` returned pending/failed/due **0/0/0** and confirmed the synthetic account still has its CV, degree and certificate references with a null licence reference. This accepts ordinary hosted upload/delete and queue completion. Physical storage absence was not independently read; replacement, injected provider interruption/retry and actual scheduled invocation are not certified by this check. No real candidate document, application, Production migration or public release was changed. [Evidence](qa/2026-10-21-document-cleanup.json).

## 22 October 2026 — Hosted disposable upload persisted

A newly generated QA-only PNG was uploaded through the testing candidate UI into the previously empty licence slot of the synthetic account. The Uploaded state persisted after reload. No registration details, independent approval, application sharing or other vault files were changed. Permanent deletion of this newly created fixture is prepared, not executed; worker completion remains unverified. [QA record](qa/2026-10-21-document-cleanup.json).

## 22 October 2026 — Hosted cleanup counts confirmed

The operator reports the testing counts-only request returned `pending: 0`, `failed: 0`, `due: 0`. This confirms the valid-key hosted status path reached the queue successfully; no deletion worker or storage mutation was requested. Evidence is operator-reported, not an independently observed worker run. Hosted synthetic deletion/replacement through the new worker remains the next acceptance check; Production migration, historical writer retirement and the hardened public cutover remain separate gates. [Cleanup evidence](qa/2026-10-21-document-cleanup.json).

## 21 October 2026 — Cleanup fix deployed to testing

- Verified `a3b3cf7` Ready in the existing BenchScout Preview project and assigned the testing alias. Hosted controls and invalid-key rejection pass; valid-key queue counts remain pending. Public maintenance stays separate; no Production schema change or real-file deletion. [Evidence](qa/2026-10-21-document-cleanup.json).

## 21 October 2026 — Durable document cleanup and retry

- Fixed physical deletion before metadata commit using transactional deletion intents, stale-write checks, leased/backoff retries and active-reference guards. Settings now waits for confirmation; restricted operator controls and a daily cleanup cron are documented. Testing-only migration applied; 274 tests/lint/typecheck/build pass. No Production migration, reopening or real-file deletion. [Contract](DOCUMENT-CLEANUP.md).

## 21 October 2026 — Public legacy surface contained

- After explicit service-pause approval, activated reviewed `336c6ed` on the public domain. Verified matching source metadata, preserved diagnostic/testing aliases and ten safe hosted 503 checks plus the visible notice. Older protected deployments remain separate; no data/credential mutation or full hardened release. [Evidence](qa/2026-10-21-legacy-containment.json).

## 21 October 2026 — Legacy containment and upload failure boundaries

- Prepared and pushed a separate terminal containment build for unsafe July handlers; public service-pause approval is pending. Added six hardened upload/delete fault-injection checks; all 257 application tests pass. No live activation or real-file mutation; durable deletion reconciliation remains open. [Scope](LEGACY-CONTAINMENT.md).

## 21 October 2026 — Historical deployment isolation audit

- Enumerated 92 Ready deployments and four aliases; verified anonymous sign-in gates on immutable URLs and non-public alias upload GETs. Prepared a 30-build retirement set, retained current stages/live app, and documented source-confirmed public legacy risks. No deletion or provider/configuration change. [Audit](DEPLOYMENT-ISOLATION.md).

## 21 October 2026 — Public release and rollback runbook

- Prepared the live-canonical cutover sequence, gate matrix, bounded smoke checks, separate real-file copy approval and compatible rollback/recovery requirements. Source review records non-atomic document cleanup and cron side effects. No public release or operational change performed. [Plan](PRODUCTION-RELEASE-PLAN.md).

## 21 October 2026 — Production file metadata preview accepted

- Recorded the operator-reported dry run: three eligible unique current files, zero blocked, copying disabled, no file contents read or business/grant changes. Real-file backfill remains pending live hooks or an approved enforced write pause, fresh review and copy approval. [Evidence](qa/2026-10-21-production-backfill.json).

## 21 October 2026 — Protected Production preview deployed

- Staged reviewed `64e2f83` with copying explicitly disabled and Vercel authentication retained. Verified matching provider source metadata and unchanged public deployment. Hosted metadata preview awaits private administrator entry; no real files copied. [Evidence](qa/2026-10-21-production-backfill.json).

## 21 October 2026 — Guarded Production older-file workflow prepared

- Refreshed all eight vault-field counts read-only: three current distinct private files (CV, licence, avatar), no legacy/other references. No real file bytes read or copied.
- Added protected Production inventory previews and explicitly confirmed apply plans, with target/configuration/inventory binding, 15-minute expiry, pilot limits, deduplication, concurrent-reference checks and decrypt verification. Signed plans remain in page memory; counts exclude raw identities/URLs.
- Added `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED`, default off. Copying must wait for verified live backup hooks or an approved enforced write pause; the public app is still old. Existing testing-only backfill remains restricted. [Operational contract and boundaries](PRODUCTION-DOCUMENT-BACKFILL.md). No schema/migration/new Production deployment or real-file transfer.
- Lint, TypeScript, all 251 tests and webpack Production build passed. Built metadata-preview controls fit 320/390px with no overflow; local verification submitted no operator request. The updated staged preview is not deployed yet.

## 21 October 2026 — Staged Production storage recovery and alert accepted

- Operator reported the 85-byte QA storage canary passed source loss, authenticated decryption and exact restored private read-back. Independently refreshed provider listings confirmed archive cleanup and no remaining `qa-recovery/` source objects.
- Independently observed alert submission and received recipient confirmation of actual delivery. Scoped staged database/storage/alert checks now pass; older real files remain unbackfilled and the public live deployment stays unchanged. [Acceptance and evidence limits](PRODUCTION-RUNTIME-ACCEPTANCE.md).

## 21 October 2026 — Staged Production database runtime passed

- Independently observed correct-key deployed readiness: live-target fingerprint matches, database/name checks pass, backups enabled/configured, alert configured and test mode off. Business records unchanged.
- Runtime Git SHA was null; separately verified the Vercel deployment’s audit and Git SHA metadata both match approved `b399b13`. Production QA storage/cleanup and alert receipt are prepared but not yet passed. Live domain stays unchanged. [Evidence and limits](PRODUCTION-RUNTIME-ACCEPTANCE.md).

## 21 October 2026 — Corrected staged runtime build Ready

- Replacement staged deployment `5xj9zsypDUgenQQ2kLA1pgkErTqB` is Ready with a deployment-only canonical URL matching its protected team alias. The same approved `b399b13` source was used; saved project URL and security rules were not changed.
- An intentionally wrong-key request now passes origin validation and is correctly rejected as Unauthorized. Correct-key readiness remains pending private operator re-entry. The live domain remains on July main; no QA storage check, real-file copy or Production alert has run. [Runtime evidence](PRODUCTION-RUNTIME-ACCEPTANCE.md).

## 21 October 2026 — Staged build reached Ready; origin mismatch diagnosed

- Created approved-source Production deployment `8DwvVxyGiP1eZScMQKgHFWms833h` as Ready/Staged with custom-domain assignment skipped. Verified the user-facing live domain stays on the July main release; anonymous staged access redirects to Vercel authentication.
- First operator readiness submission stopped at the canonical-origin guard. Preparing the same source with an exact staging-alias canonical URL override for that deployment only; saved live settings and security rules stay unchanged. Runtime database/storage/alert acceptance is not established. [Checkpoint and promotion restriction](PRODUCTION-RUNTIME-ACCEPTANCE.md).

## 21 October 2026 — Approved staged deployment authentication prepared

- Operator approved staging `b399b13` without promotion. Prepared a clean detached checkout and official Vercel CLI 65.0.0. Account check reports Logged out; the official device-authorisation flow awaits operator action.
- Verified existing Standard Protection is enabled and the live domain still points to the July release. No deployment, diagnostic, live-file mutation, alert or bypass-credential creation occurred. [Execution checkpoint](PRODUCTION-RUNTIME-ACCEPTANCE.md).

## 21 October 2026 — Staged Production runtime diagnostics prepared

- Added protected deployed-database readiness, explicitly confirmed QA-only Production storage recovery and approved-recipient alert checks. Extracted the existing isolated recovery probe for shared use; testing-only recovery/backfill gates remain blocked in Production.
- Extended the operator screen and tests for environment/confirmation/authentication gates, target fingerprinting without credentials, ignored arbitrary file/account inputs and configured-only alert recipients. [Runtime acceptance plan](PRODUCTION-RUNTIME-ACCEPTANCE.md) records staged deployment and approval boundaries. Live public checks: homepage 200, backup endpoint 404. Hosted Production diagnostic execution remains pending; no Production deployment, candidate-file copy or alert occurred.
- Lint, TypeScript, all 239 tests and webpack Production build passed. Built operator controls fit a 320px viewport with no horizontal overflow. No local diagnostic action was submitted.

## 21 October 2026 — Production database scope saved

- Operator confirmed privately saving the live Neon connection into `DATABASE_URL`. Fresh Vercel metadata shows Production-only scope, the unchanged separate testing override and update success; future generic Preview builds no longer inherit the live database default.
- No credential value was read, deployment activated, database mutated or file copied. Runtime connection and backup acceptance remain pending. Updated [configuration](PRODUCTION-CONFIGURATION.md) and [QA evidence](qa/2026-10-21-production-configuration.json).

## 21 October 2026 — Production verification boundary and database handoff

- Confirmed the backup store has no automatic project connections and Production still serves the 2 July main deployment. New backup settings have not been activated.
- Confirmed the existing database Secret is write-only and currently scoped to Production/broad Preview. Prepared an unsaved Production-only editor for private entry from the known live Neon branch, preserving the testing override; operator save is pending. No database binding or release changed. [Verification limits and handoff](PRODUCTION-CONFIGURATION.md).

## 21 October 2026 — Production bindings saved and migration history checked

- Operator privately saved all eight Production-only Secret bindings; Vercel metadata and save-success notice were verified without reading values. Activation requires a new deployment and remains pending release approval.
- Read-only normal database audit found seven applied migrations with matching checksums and three private current file references, with zero public/other references. Effective Vercel database mapping remains unverified. No migration, file transfer or release performed. [Configuration evidence](PRODUCTION-CONFIGURATION.md).

## 21 October 2026 — Production backup store created

- Created the explicitly approved separate **benchscout-production-backups** Private/IAD1 store; verified empty and left disconnected. No live documents were transferred.
- Prepared eight Production-only Secret entries and the separately approved live alert recipient. Private operator credential entry/save remains pending; no release, migration, application-code or existing Production-binding change. Updated the [configuration handoff](PRODUCTION-CONFIGURATION.md).

## 21 October 2026 — Production configuration preparation

- Verified live provider project/database identity and existing private document-store metadata. Prepared a separate Private/IAD1 production-backup creation form without submitting it.
- Added the [Production configuration checklist](PRODUCTION-CONFIGURATION.md), covering separate secrets/key custody, Production-only scope, pending live alert approval, database mapping and guarded activation/backfill acceptance. No Production values, files, migrations or release changed.

## 21 October 2026 — Normal automatic upload and release readiness review

- A new 659-byte synthetic vault upload passed the enabled automatic-backup path, persisted and rendered privately; the backup directory showed its 723-byte encrypted object. Unsigned archive access returned HTTP 403. Existing CV/certificate and CV-only application sharing stayed unchanged.
- Added [current main-release readiness](MAIN-RELEASE-READINESS.md), linked from README, with fresh missing Production-binding evidence, local schema compatibility limits and ordered migration/backfill/cutover gates. Updated recovery/audit evidence. No application code, schema, secret or Production change.

## 21 October 2026 — Older QA-file backfill accepted

- Hosted backfill passed: 2 eligible, 2 verified, 0 stale purges, failures or skips. Current synthetic files received decrypt-verified encrypted backups; records and application permissions were unchanged.
- This closes both requested testing checks alongside recipient-confirmed alert delivery. Real-account/Production backfills and promotion remain separate. [Document recovery](DOCUMENT-RECOVERY.md), [QA evidence](qa/2026-10-21-document-recovery.json). Documentation only in this checkpoint.

## 21 October 2026 — Backup alert inbox receipt confirmed

- Hosted test-alert submission was observed and the approved recipient confirmed actual inbox receipt. The shared alert mail path now has recipient-confirmed delivery evidence; no failure or document-data disclosure was induced.
- Older QA-file backfill still needs its counts: the alert output replaced the previous result, so an idempotent rerun is prepared. [Document recovery](DOCUMENT-RECOVERY.md). Documentation only; no new code/schema/environment/production change.

## 21 October 2026 — Scoped QA backfill and alert delivery controls

- Added operator actions to backfill/decrypt-verify only the known synthetic candidate’s current vault files and send a labelled test through the shared backup-alert mail path. Arbitrary accounts/URLs/recipients are not accepted; database records and sharing grants stay unchanged.
- Improved the compact responsive operator screen and collapsed the repeat destructive drill. Lint, TypeScript, 235 tests and production build passed; hosted execution and inbox confirmation remain pending. [Document recovery](DOCUMENT-RECOVERY.md). No schema, environment or production change.

## 21 October 2026 — Hosted encrypted loss-and-restore passed

- Operator ran the provider-backed QA test; the hosted result independently confirmed source loss, decryption and exact restored private read-back (85 bytes). Database records and application grants were unchanged; cleanup calls were accepted.
- Automatic backups are enabled for new testing uploads. Pre-activation file backfill, normal hosted upload acceptance, alert inbox delivery and broader disaster-recovery gates remain open. [Document recovery](DOCUMENT-RECOVERY.md), [scrubbed evidence](qa/2026-10-21-document-recovery.json). No new code/schema/production change in this checkpoint.

## 21 October 2026 — Hosted backup deployment ready for acceptance

- Testing redeployment after the credential save succeeded. Hosted backup screen loaded and rejected a deliberately invalid administrator key.
- Prepared correct-key configuration and QA-only loss/restore execution for the operator. Successful backup activation/provider restoration are not yet claimed. [Deployment](DEPLOYMENT.md), [document recovery](DOCUMENT-RECOVERY.md).

## 21 October 2026 — Testing backup credentials saved

- Operator saved the private inputs. Vercel metadata confirms five Secret variables scoped to Preview/testing; values were not read. Correctness and hosted recovery remain unverified.
- Recorded this configuration checkpoint in [document recovery](DOCUMENT-RECOVERY.md); the testing push triggers a deployment with the new settings. Production and schema remain unchanged.

## 21 October 2026 — Continuous encrypted backups and isolated restore tooling

- Added opt-in encrypted private backup and verified read-back before new document metadata commits, with three attempts, scrubbed failure logs and an optional approved-inbox alert. Explicit removal/replacement also purges its backup; no indefinite deleted-file retention.
- Added restricted operator status/synthetic loss-and-restore screen/API and a private CLI for dry-run backfill and isolated restoration. No database rewrite, new employer grant, schema or migration. Production defaults remain off.
- Lint, TypeScript, 230 tests (10 new), production build, CLI syntax, diff check and 320px built-screen bounds passed. [Document recovery](DOCUMENT-RECOVERY.md) records contracts, configuration, retention/key custody and limits. Testing-only credential form prepared but unsaved; hosted activation, provider restoration and inbox evidence remain pending.

## 21 October 2026 — Private testing backup store created

- After explicit approval, created a distinct Private IAD1 backup store without linking projects, revealing tokens, upgrading or copying real documents. A new synthetic 231-byte file uploaded and its authenticated preview text hash matched the source.
- Downloaded-file verification and loss/restore remain open after the browser download event timed out. Automatic backups are not enabled; same-account/provider limits remain. Updated [document recovery](DOCUMENT-RECOVERY.md) and scrubbed QA evidence. No product code/schema/environment change.

## 21 October 2026 — Private document recovery audit

- Confirmed no backup integration in the upload/storage code or inspected configuration. Prepared an unsubmitted separate private testing backup store after the operator requested a new destination.
- Added [document recovery findings and acceptance plan](DOCUMENT-RECOVERY.md), linked from README and operations readiness, including access/consent, retention, integrity and same-provider boundaries. Creation awaits browser-required action-time approval. No code, schema, integration, file or provider configuration change yet.

## 20 October 2026 — Historical recovery copy verified

- Created the approved disposable testing copy from 21:00 Africa/Lagos. Restored application, closure, suspension, review revision/audit, document-sharing metadata and seven completed migration rows matched expected results.
- Expired both copied sessions only in the recovery branch; re-query confirmed zero active restored sessions. Source testing/production, app bindings and email/cron were untouched.
- Recorded measured provider fork duration, next-day expiry and limits in [operations readiness](OPERATIONS-READINESS.md) and [JSON evidence](qa/2026-10-20-recovery-drill.json). File recovery and complete service recovery remain open. No product code/schema change.

## 20 October 2026 — Recovery drill preparation

- Rechecked the separate testing project: PostgreSQL 17, Free plan, six-hour history and no snapshots/schedule displayed. Prepared an unsubmitted historical child copy with one-day expiry; action-time approval is required for the new database copy.
- Recorded target time, expected synthetic checks and session/document recovery limits in [operations readiness](OPERATIONS-READINESS.md). No branch, restore, credential, billing, app configuration or production change occurred.

## 20 October 2026 — Hosted replacement, closure and suspension checks

- Employer roster withheld the replacement CV. Closing the synthetic vacancy preserved its one application after reload and reduced published vacancies to zero.
- QA-only suspension revoked roster/directory access for the existing employer session, including directory Retry. Candidate application history persisted; the historical viewer offered no Apply action and Matches was empty. Combined-state discovery does not isolate each exclusion predicate.
- Updated [hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md) and its JSON evidence. Direct HTTP document/posting denials and physical old-object cleanup remain unverified. No product code, schema, configuration or production change.

## 20 October 2026 — Synthetic CV replacement and owner preview passed

- After explicit approval, replaced only the test candidate CV and verified the new QA-only version in the private owner preview. One existing application remains; no new document-sharing consent, AI request or email was submitted.
- Employer-side replacement withholding, vacancy closure/history and suspension checks await the private employer sign-in. Prior Blob deletion was not independently inventoried. No product code, schema or configuration change. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Remaining safety phase prepared

- Confirmed the active synthetic candidate and prepared a distinct QA-only CV replacement. Upload code removes the old stored file, so action-time confirmation is pending; no replacement has occurred.
- Inspected closure/history and current-session employer approval guards before hosted closure/suspension checks. No code, schema, configuration, vacancy or review change. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Employer responsive layout and fresh application verified

- Hosted posting, drawer and card bounds fit phone/desktop checks. The previously outstanding interview-grid check passed at 320/390px, with no second interview or email. Final equal-width primary posting columns deployed as `7aaabef`; reloaded 320/390/1200/1440px checks passed with no measured overflow. [Layout evidence](RECRUITMENT-LAYOUT.md).
- Employer roster confirmed one fresh pending CV-only application; its new document link opened. The old application URL was browser-blocked, so server-side revocation status remains unverified. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Hosted match wrapping verified

- `e0d9e35` deployed to testing. Long synthetic match content fit phone and desktop checks; 320/390/1440px cell/chip geometry found no overflow. Final control/badge CSS preserves whole button/label text.
- Compact employer posting/roster and pending-applicant interview checks await the private employer sign-in. [Layout evidence](RECRUITMENT-LAYOUT.md) records what passed and remains open.

## 20 October 2026 — Compact recruitment layouts and authorised reapplication

- Repaired competing posting fields, long salary overlap and applicant drawer wrapping/spacing. Consolidated duplicate employer information into a compact access card while preserving safety explanations. Lint, TypeScript, 220 tests and build passed; [Recruitment layout](RECRUITMENT-LAYOUT.md) tracks deployment and fresh visual checks. No API/schema/configuration or permission change.
- Completed the newly authorised synthetic withdrawal: Applied and the synced interview cleared. Submitted one fresh CV-only application with the available optional file unchecked; it appears once as Application Sent. Employer/grant and responsive checks remain pending. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Hosted candidate interview notification and calendar

- Verified the synthetic application in Interviewing, its matching in-app notification and a single October 21 calendar interview at 10:00 AM. Attempting to save the employer-managed event from the candidate editor was rejected. Correct inbox receipt was already confirmed.
- Prepared withdrawal/reapplication testing; the current API deletes the synthetic application row, so action-time confirmation is required before proceeding. No withdrawal, product code, schema or configuration change. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Narrow interview form layout

- Hosted future-time rejection passed after `49e5108` deployed. A 320px check found the time field outside the viewport; changed date/time to an adaptive grid that stacks on narrow screens. Lint, TypeScript, 220 tests and build passed. `87bebfd` deployed successfully to testing; fresh responsive form acceptance remains pending. The valid synthetic interview saved, and its approved recipient confirmed receipt with correct details; candidate in-app/calendar checks remain open. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Future interview schedules in Africa/Lagos

- Added shared client/API validation rejecting invalid or non-future interview times before saving or notifying. Date/time inputs explicitly name Africa/Lagos and have associated labels. Existing schedules and non-interview updates are unchanged; no schema/configuration change. Lint, TypeScript, all 220 tests, build and diff check passed, including new boundary/calendar tests; testing deployment and hosted scheduling checks pending.
- Hosted employer roster showed one synthetic applicant and opened its selected CV; professional summary remained unshared. The browser blocked the direct unselected-file request, so no server denial pass is claimed. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md), [launch audit](LAUNCH-AUDIT.md).

## 20 October 2026 — Hosted candidate discovery and CV-only application

- Confirmed the synthetic candidate discovered the approved QA vacancy and submitted only its synthetic CV, with professional-summary sharing off. Reload showed one Application Sent record; the role left matches and offered no repeat Apply action in its posting viewer. Repeated hosted POST remains untested.
- Added a synthetic optional file after submission; it persisted privately while the application still listed only CV. Employer download/denial and interview checks remain pending. No product code, schema or configuration change. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Hosted separate vacancy approval verified

- Reviewed the queued synthetic vacancy independently of company approval and saved explicit QA-only moderation evidence. A full employer reload showed Active, one published and zero applicants.
- Candidate discovery/application and notifications remain pending. Recorded a posting form layout issue for responsive repair. No product code, schema or configuration changed. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Hosted company approval and separate vacancy gate

- Saved the explicitly authorised synthetic company approval; Company reviewed and QA-only feedback persisted after a full reload. This is software acceptance evidence, not real CAC or facility clearance.
- Submitted one labelled synthetic vacancy; reload showed Awaiting review, one vacancy and zero published. Vacancy approval, discovery and the application/interview journey remain pending.
- Recorded the existing admin key/queue clearing after save and prepared the next private credential handoff. No product code, migration or configuration change. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md).

## 20 October 2026 — Previous-applicant errors and hosted employer gates

- Fixed failed previous-applicant requests appearing as an empty directory. The client now clears old results, preserves access-denial messages, rejects malformed responses, provides Retry and ignores abandoned/account-changed responses. Existing server permissions are unchanged.
- Lint, TypeScript, all 216 tests and production build passed; no migration/configuration change. `4857fb1` deployed successfully to testing; hosted denial and Retry passed. A stable cleanup callback passed the same checks without lint warnings.
- Confirmed the email fallback deployment, operator-confirmed employer email, normal login, pending synthetic company submission and pre-review posting denial. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md) records remaining review/application/interview checks.

## 20 October 2026 — Visible account-email action fallback

- Hosted employer login correctly rejected the newly created unconfirmed account. Recipient reported receiving its confirmation email without a visible button; actual received rendering/MIME and root cause remain unverified.
- Added a visible full backup URL beneath the existing action button in the shared candidate/employer confirmation and reset layout. Preserved role-scoped links, text alternatives, logo, expiry and token behaviour.
- Lint, TypeScript, 212 tests and build passed, including identical-button/fallback URL assertions and offline SMTP MIME coverage. Testing deployment, approved employer resend and fresh recipient acceptance are recorded in [Account emails](ACCOUNT-EMAILS.md). No schema/configuration/password change.

## 20 October 2026 — Hosted candidate fixture confirmed; employer pages restored

- Observed the operator-created synthetic candidate in an authenticated profile and completed its synthetic PDF CV upload. Signed that fixture out and restored employer signup and administrator lookup after the shared-session change redirected all tabs home. Candidate data is retained for the remaining journey.
- Confirmed the existing cross-tab identity safeguard in SessionGate and changed the test handoff to sequential roles. No protection was disabled, no real CV used, no agent email/review decision submitted and no new product code or migration. [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md) records the evidence and remaining gates.

## 20 October 2026 — Hosted employer journey started

- Started the operator-authorised synthetic employer/candidate journey on the existing protected testing alias. Candidate-to-employer route denial was observed; separate employer/candidate signups and the administrator form were prepared. Approved role-specific test inbox aliases are omitted from docs.
- New password entry/account submission and the existing administrator key are handed to the operator under the browser credential rule. No account creation, email delivery, company/vacancy approval or full hosted pass is claimed. Added [the hosted acceptance record](HOSTED-EMPLOYER-ACCEPTANCE.md), fixture boundaries and remaining checkpoints.

## 20 October 2026 — CV skills extraction and role keyword persistence

- Restored a consent-based CV skills suggestion action for current private CVs, with review before save, bounded AI responses, changed-CV protection and useful unreadable/configuration failure messages. Uploads preserve keywords and no longer falsely claim extraction.
- Fixed Update Profile dropping unfinished keyword input; normalized list delimiters/duplicates on client and server, retained removable chips, protected unsaved preferences from refresh/save races and wired Cancel. Corrected the profile modal label and successful-upload refresh/filename handling.
- Added eight regression tests; lint, TypeScript, all 211 tests, production build, 18 isolated acceptance checks, targeted browser persistence/mobile checks and a synthetic live-provider call passed. No schema/migration/new configuration. Final application commit `e17170d` is deployed to testing with Vercel success and hosted controls/shortcut verification. Detailed evidence is recorded in [CV skills and keywords](RESUME-KEYWORDS.md). No real CV was sent to AI during this repair.

## 20 October 2026 — Reset branding accepted; initial confirmation path verified

- Recipient confirmed the latest reset email looks right and clarified the original issue was account-creation confirmation.
- Traced actual signup UI to /api/auth/register and its shared branded confirmation helper; employer signup and resends use the same inline-logo layout. Recorded that this fix is deployed while fresh confirmation inbox rendering remains pending. No additional code/provider/account/email/password change.

## 20 October 2026 — Shared account email branding and confirmed reset receipt

- Recipient confirmed receipt of the existing-account reset link. Kept this separate from link/reset completion and new-design inbox rendering; no password changed.
- Added one shared email layout for candidate/employer confirmation and password reset: existing laboratory PNG logo/CID, navy/teal wordmark, matching card/button/footer, escaped content and plain text. Preserved role-specific instructions, expiry and company-review separation.
- Lint, TypeScript, 203 tests, production build and diff checks passed. Real-helper synthetic previews fit 320/390px with no horizontal clipping. No schema/API/provider/sender-profile change. See Account emails and Deployment for contracts, evidence and release status.

## 20 October 2026 — Existing-account recovery test resumed

- Corrected the signup assumption after the operator confirmed the replacement recipient already has an account. Prepared signup was not submitted.
- Submitted one hosted candidate password-reset request to the approved replacement recipient; Sending returned to the generic login view. No account created or password changed; provider acceptance/inbox receipt remains unverified. No code/configuration/schema/production change.

## 20 October 2026 — Test email recipient replaced

- Updated the prepared signup to the operator's replacement approved inbox, leaving password entry/submission to the operator. Address omitted from docs; no account/message created or sent. Prior absent-account results apply only to the earlier recipient. No product/provider/schema or production change.

## 20 October 2026 — Administrator check accepted and missing-email cause identified

- Verified correct-key loading of the hosted administrator company/vacancy/report queues (all empty), alongside the previous incorrect-key denial. Cleared the key field; no review decision submitted or key read back.
- Targeted read-only SQL found no candidate/employer/reset token for the exact approved recipient in testing. Recorded the intentional generic/no-send recovery behaviour rather than treating the missing message as proven provider failure.
- Prepared an unsubmitted test signup with a blank password for operator entry. Updated the runbooks and scrubbed evidence; no new code, migration, provider setting, external email or production change. Diff/JSON checks passed.

## 19 October 2026 — Testing credential redeployment and controlled email request

- Redeployed after operator save: c050bc5 Vercel status success. Hosted administrator UI rejected an invalid key; successful operator queue read remains pending. No approval decision submitted.
- Submitted one approved recovery-email request through hosted testing; UI returned to login. Inbox receipt/provider acceptance remains unverified; no password changed or unrelated mailbox searched. Added scrubbed evidence and exact release/check limits.

## 19 October 2026 — Testing credential save confirmed

- Operator completed secure credential entry/Save. Rechecked Secret ADMIN_SECRET, CRON_SECRET and SALARY_OWNER_SECRET metadata: all scoped to Preview/testing. No value read back and no Production binding changed.
- Documented presence/scope separately from strength/authentication proof. Triggering a fresh testing deployment after the save; live inbox and successful protected-route checks remain acceptance work.

## 19 October 2026 — Testing credential handoff and confirmation email consistency

- Rechecked missing ADMIN_SECRET/SALARY_OWNER_SECRET and shared cron default. Prepared three unsaved Secret rows scoped only to Preview/testing; new values and Save are handed to the operator under the browser credential-entry rule. No credential value was generated/entered by the agent.
- Candidate signup now uses the shared role-aware confirmation template with canonical app link, navy/teal branding, 24-hour expiry and plain-text alternative. Stored-token hashing, unconfirmed state and delivery-failure retry warning preserved. No schema/configuration contract added.
- Added registration-route tests for role/origin/token/plaintext/expiry and delivery failure. Lint, TypeScript, 201 tests, production build and diff checks passed.
- User approved a recipient for test confirmation/reset/interview messages; no message sent yet. Connected Gmail is a different account, so inbox receipt remains a recipient confirmation step. Added Testing credentials runbook; deployment evidence is recorded separately.

## 19 October 2026 — Hosted testing cutover verified

- Vercel deployment for 699b256 succeeded. Actual hosted fixture login/upload/guarded preview and direct persistence checks verified the dedicated testing database and store, with the fixture absent from the original database.
- Scoped cleanup removed one synthetic object, account and session; testing candidate/employer/job/application counts returned to zero. No email sent or Production binding changed. Existing testing accounts stay in the original resources; the fresh testing environment requires new registrations.
- Added scrubbed hosted evidence and exact deployment record. Remaining independent-secret, other-preview, old-deployment, inbox and recovery gates stay explicit. Documentation diff/JSON checks passed; no new product code/test claim.

## 19 October 2026 — Dedicated testing database and private store

- Verified the user-created BenchScout Testing PostgreSQL 17 project is separate and initially empty. Applied all seven migrations and checked completed history/checksums; account, vacancy, application and session counts were zero.
- Created benchscout-testing-documents as a private Blob store. Synthetic write/authenticated read, anonymous 403 and deletion/empty cleanup passed. Retained existing stores/files.
- Added Secret DATABASE_URL and BLOB_PRIVATE_READ_WRITE_TOKEN overrides for Preview/testing only. Production bindings and local .env unchanged. Other preview defaults, historical deployments, independent administrative secrets and recovery/inbox gates remain open.
- No application code/schema change or new migration. Deployment and disposable hosted smoke-check evidence are recorded separately in Deployment; no mail-delivery claim follows from fixture login.

## 19 October 2026 — Hosted environment and recovery audit

- Inspected authenticated Vercel/Neon metadata without revealing secrets or changing provider configuration. Confirmed shared Production/Preview database configuration, only one Neon production branch, six-hour recovery history, Preview-only private storage token and absent visible administrator/salary secrets.
- Added [Hosted operations readiness](OPERATIONS-READINESS.md), a scrubbed evidence record, a concrete dedicated empty testing-project proposal, branch-scoped cutover sequence, email acceptance steps and database/private-file recovery requirements.
- Prepared the Neon free-plan project form for review without submitting. No database, migration, secret, storage binding, outbound email or production change was made; pilot remains HOLD. Documentation-only validation uses diff/JSON checks. Prior 199-test/build results are retained as prior evidence.

## 19 October 2026 — Isolated live-service acceptance workflow

- Added a reusable runner with a separate temporary database schema, real HTTP/private Blob checks, local SMTP capture and scoped cleanup. It covers candidate/employer journeys, document grants, withdrawal, moderation and actual transaction race/rollback assertions.
- Added explicit custom SMTP configuration for capture and standard SMTP transport; no-provider-setting deployments preserve existing Resend/Gmail behaviour. Remote custom SMTP requires credentials/TLS; invalid ports fail before delivery.
- Fixed a discovered score-summary defect: employer posts no longer dilute personalised averages; N/A no longer triggers a high-score statement. Added mixed/empty/zero-score regression coverage and verified the corrected browser result.
- See [Staging acceptance](STAGING-ACCEPTANCE.md) for commands, configuration, safeguards and evidence limits. Lint, TypeScript, 199 tests and production build passed. Eighteen scripted live steps plus an anonymous private-Blob denial passed; actual mobile/browser file-picker checks passed. Seven remaining synthetic files and the temporary schema were removed. --keep now requires a TTY to preserve cleanup input. Exact scope and release evidence are recorded in Staging acceptance and Deployment.

## 19 October 2026 — Candidate credential review safeguards

- Added credential/review version fields and revision-checked, transactional admin decisions with mandatory approval evidence and SafetyReview auditing. Legacy review flags require a fresh version-bound review to show current.
- Added current-candidate lookup/private evidence download controls. Stale/wrong-candidate decisions fail closed; file/metadata/stage/name changes invalidate approval. Unrelated JSON profile writers now guard the revision to avoid restoring stale provisional details.
- Validation: lint, TypeScript and 192 tests passed; local mobile controls checked at 320/390px without a real decision. Migration applied and configured database compatibility passed. Build/hosted release evidence is tracked in Deployment.
- Updated credential badge consumers and the legacy private-migration script. See [Candidate credential review](CANDIDATE-CREDENTIAL-REVIEW.md) for contracts, migration, operator responsibilities and validation limits. No new provider/configuration or automatic registry verification.

## 19 October 2026 — Selected application documents

- Added CV-required, default-unchecked optional document selection and pre-submit summary for direct applications. Server validates current file revisions and records selected private references per application.
- Restricted employer file reads and applicant/talent links to still-current selected files; scoped applicant links cannot borrow grants from another application. Replacement/deletion never auto-shares a new file; withdrawal removes that application grant. Avatar grants are excluded.
- Added selected-kind history to My applications and sharing/access explanations. Added the additive documentSelection migration; legacy applications retain only a rollout-time current private CV grant. No new provider/configuration.
- Validation: lint, TypeScript, 177 tests, production build and diff checks passed; synthetic mobile selector checked at 320/390px. Migration applied; configured database compatibility passed. Hosted release evidence is tracked in Deployment.
- See [Application document sharing](APPLICATION-DOCUMENT-SHARING.md) for contracts, migration, retention limits and validation. This is a reference record, not retained immutable file copies.

## 19 October 2026 — Application Toolkit mobile refinement

- Increased modal clearance to 16px plus device safe-area insets; constrained height to the available backdrop space and unified bottom-corner clipping. Header/footer remain visible while details scroll.
- Replaced provider-led cover-letter wording with professional instructions, placeholder and loading/error copy. Added expandable How drafting works with the existing Google processing disclosure, an accessible textarea name and keyboard access to the disclosure.
- Browser checks passed at 320 × 568 and 390 × 844 with no horizontal overflow; disclosure, scroll-to-editor, Tab and Escape checked. Lint, TypeScript and all 172 tests passed. Production build/deployment evidence is recorded in Deployment. No API, schema, provider or configuration change.

## 19 October 2026 — Testing deployment confirmed

- Pushed `f0d1a67` to `origin/testing`. Vercel Preview deployment `G8vefGUn9bNV5Sad6Ey8ENUNciiK` is Ready and assigned to the existing testing alias.
- Confirmed the hosted Settings summary-sharing controls and employer preview render with sharing off. No real consent change or applicant decision was saved.
- Recorded exact deployment/source links in Deployment. Local validation passed lint, TypeScript, 172 tests, build and diff checks; configured migration status is up to date. Full staging acceptance and remaining audit priorities are still open; no production push.

## 19 October 2026 — Opt-in professional summaries and candidate preview

- Added saved default-off consent in existing candidateProfile JSON, strict API validation and compatibility for older profile clients.
- Added an explicit professional-summary allowlist, Settings draft preview, saved summary preview before direct applications, and shared summaries in employer applicant/previous-applicant views. Unshared summaries return null; private reminders, credential identifiers, salary preference and training notes remain excluded.
- Added profile-preview loading failure/retry handling and seven regression tests for sharing, revocation, consistency and employer authorization. No schema migration or new dependency.
- Preparing release to the existing testing branch with pending employer-safety and launch-audit fixes. Final validation and exact deployment state are recorded in Deployment; production pilot readiness remains HOLD.

## 19 October 2026 — Launch audit, first application-journey pass

- Added `docs/LAUNCH-AUDIT.md` with prioritised findings and explicit remaining pilot gates; pilot readiness remains HOLD.
- Direct applications require a private CV; withdrawals work for the candidate's inactive direct vacancies while preserving other candidates' records. Matches differentiates legacy documents from private uploads and explains current document sharing in the dialog body on mobile/desktop.
- Employer rejection/interview UI waits for server confirmation and reports interview email failures accurately. Added guarded client request helper and pending-state handling.
- Current credential-review responses now account for expiry and relevant intern/licensed credential dates without deleting historical review records.
- Vacancy closure preserves application history; bulk applicant deletion returns 409. Updated employer closure and candidate withdrawal wording.
- Added regression tests for these behaviours, ownership denial, final-withdrawal document denial and idempotent application submission. No schema/migration, provider change or hosted deployment in this pass. See audit verification record for current test/build results and browser limits.

## 17 October 2026 — BenchMan name screening

- Assessed corrected BenchMan spelling: registered .com, existing word/software uses and audience/positioning concerns. Documentation only; no naming decision, purchase or application change.

## 17 October 2026 — BenchMam name screening

- Recorded preliminary exact-spelling search, .com no-record result and clarity/spelling concerns. Documentation only; no name approval, purchase or application change.

## 17 October 2026 — TopBench and BenchCareer screening

- Recorded TopBench's existing software/research uses and registered .com, and BenchCareer's preliminary search and .com no-record result. Preferred BenchCareer for clearer career positioning; formal clearance remains pending. Documentation only; no purchase, adoption or application change.

## 17 October 2026 — Benchers and BenchLead screening

- Recorded registered .com domains, Benchers' legal/community associations and BenchLead's preliminary positioning assessment. No Nigerian name/domain or trademark clearance claimed; documentation only, no adoption or purchase.

## 16 October 2026 — BenchJob name screening

- Documented BenchJob's employment positioning, preliminary search findings and registered .com. Nigerian domains, CAC and trademark clearance remain pending. Documentation only; no purchase or application change.

## 16 October 2026 — MLSPro name screening

- Recorded MLSPro positioning, preliminary web results and registered .com; Nigerian domains, company-name and trademark checks remain pending. Documentation only; no purchase, adoption or application change.

## 16 October 2026 — MLSHub name screening

- Documented MLSHub's specialist-community fit, preliminary search findings and registered .com. Retained as a possible brand pending Nigerian domain/name and trademark checks. Documentation only; no purchase, adoption or application change.

## 16 October 2026 — ScoutHub name screening

- Recorded existing ScoutHub recruiting platform and registered .com. Recommended against this name because of direct recruitment-sector overlap. Documentation only; no purchase, rebrand or application change.

## 16 October 2026 — BenchHub name screening

- Documented existing BenchHub laboratory protocol app, other technology uses and registered .com. Documentation only; no naming decision, purchase or application change.

## 16 October 2026 — Further short-name shortlist

- Documented BenchLeap, BenchRole, LabRung and BenchFwd with preliminary web/.com registry screening, and recorded other registered .com options. No final availability, company approval or trademark clearance claimed; documentation only.

## 16 October 2026 — LabPro name screening

- Recorded registered .com and multiple existing laboratory supply/software brands using LabPro. Documentation only; no naming decision, application change or purchase.

## 16 October 2026 — BenchPro name screening

- Recorded registered .com and existing scientific talent-discovery and laboratory furniture uses. Recommended against BenchPro because of closely related brand overlap. Documentation only; no application changes or purchase.

## 16 October 2026 — LabScout name screening

- Recorded registered .com and existing biomedical opportunity/scientific talent services using LabScout. Recommended against this option on brand-distinction grounds; documentation only, no rebrand or purchase.

## 16 October 2026 — BenchAid and MLSBench screening

- Documented user-proposed names, preliminary .com registration results, MLS-Bench research-project overlap and positioning tradeoffs in the candidate/brand review. CAC/trademark clearance remains pending; no rebrand or purchase.

## 16 October 2026 — Short brand-name exploration

- Extended the candidate/brand review with Labvaro, Labzuri and Labvori, dated web and .com registry screening, rejected alternatives and pending CAC/trademark/registrar checks.
- Documentation only; no name adoption, purchase, application change or deployment. Naming does not block the launch audit.

## 16 October 2026 — Candidate readiness and preliminary naming review

- Added `docs/CANDIDATE-AND-BRAND-REVIEW.md`: current profile separation, employer access scope, pilot improvements and 12 passing candidate-profile tests.
- Recorded existing BenchScout brand/domain use, exact CAC public-search results, alternative .com RDAP results and unresolved .ng lookups. No name approval, reservation, purchase or trademark clearance is claimed.
- Documentation only; no application change, migration, deployment or rebrand.

Entries describe implemented changes and their verified release state. Earlier work remains recorded in the existing dated audit documents; this file does not reconstruct missing release history.

## 16 October 2026 — Employer and vacancy safety

### Added

- Employer portal company-verification form with status refresh, reviewer feedback, public-institution registration alternative, contact/authority/operating-credential evidence and no-fees declarations.
- Private employer verification GET/POST API; shared submission/evidence validation.
- Administrator company, vacancy and candidate-report queues, employer lookup by email, conditional evidence checklists and recent decision history.
- Candidate report control in listing evidence and a rate-limited, ownership-checked report endpoint.
- Four employer verification fields, `SafetyReview` audit records and `JobReport` records with duplicate-report protection and queue indexes.
- Full [feature/API/operations reference](EMPLOYER-VERIFICATION.md), deployment instructions, integration notes and documentation-maintenance instructions in `AGENTS.md`.

### Changed

- New and edited employer vacancies require moderation before publication; creation requires a no-fees declaration.
- Company-detail changes pause approval and active vacancies; suspension blocks subsequent protected employer access and cannot be lifted by self-submission.
- Discovery excludes unpublished direct vacancies and unapproved employers while retaining application history. Direct applications recheck vacancy/company approval.
- Company and vacancy reviews reject stale revisions/timestamps. Safety decisions and audit writes commit atomically.
- Administrators can dismiss reports or remove listings; removed external listings remain removed during refresh of the same saved listing.
- Employer copy/status labels reflect review rather than instant publication. Shared responsive safety-form styles added.
- Database compatibility checks include the new schema and load project environment configuration.
- Test mocks/role checks/fixtures expanded; 13 focused employer-safety tests and one scanner removal regression added.

### Integrations and boundaries

- Reuses existing Prisma/PostgreSQL, session authentication, API guards, rate limits and administrator-secret authentication.
- CAC checks and independent company/vacancy confirmation remain manual. No external verification API, new environment variable, provider credentials, document upload or notification worker added.
- Existing approvals are preserved as `legacy-approved`; existing active jobs are not retrospectively removed. Individual reviewer authentication, scheduled revalidation, report/queue notifications and broader source-URL takedowns remain follow-up work.

### Migration and validation

- Configured database: successfully applied/recorded `20261012000000_employer_email_confirmation`, `20261012010000_candidate_profiles`, and `20261016000000_employer_safety` through Prisma migration deployment.
- Post-migration compatibility: no missing columns. Authenticated local review queue returned HTTP 200 with all expected arrays; no real approval/report was created for testing.
- Lint, TypeScript and 153 automated tests passed; production build passed. Local administrator form/evidence fields inspected.
- Populated employer/admin workflows, mobile verification and a full real-database decision/report scenario remain staging checks.
- Hosted application deployment: not performed for this feature.

## 16 October 2026 — Business and launch proposal

- Created the editable Word proposal `docs/proposals/BenchScout_Business_and_Launch_Proposal.docx` and retained its Markdown content alongside it.
- Consolidates the proposed employer-funded model, market positioning, revenue options, adoption, onboarding, data pipeline, trust controls, launch audit, business/domain/regulatory preparation, five-employer pilot, campaign economics, measurement, 90-day roadmap, operating responsibilities, risks and partnership request.
- Separates implemented product capabilities and recorded validation from proposed work, planning assumptions and pending hosted deployment. Includes dated official/public sources and project evidence.
- This is a planning and pitch artifact. It does not register a business, purchase a domain, approve a budget, contact employers, change application behaviour or deploy code.
