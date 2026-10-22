# Main release readiness — 21 October 2026

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


Status: **prepare Production configuration and resolve the remaining gates before approving a main release**. This is a current handover, not an authorisation to merge, deploy, provision credentials or move real files. Earlier dated audit entries remain historical evidence.

## Verified snapshot

| Area | Current evidence | Boundary |
| --- | --- | --- |
| Main branch | Live GitHub commit lookup returned `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`. | No main push or merge performed. |
| Testing scope | At `2d4a0b5`, the diff from main was 251 files, 13,753 insertions and 6,759 deletions, including documentation. | This is a substantial accumulated application release; counts exclude this new readiness document. |
| Local release validation | Latest source passed lint, TypeScript, 235 tests and webpack production build. | Later work in this checkpoint is hosted acceptance/documentation, not new application code. |
| Configured normal local database | Read-only `node scripts/check-database.cjs`: no missing required columns; migration-history table present; compatible true. | This does not prove the effective Vercel Production binding or complete migration checksum history. No migration was run. |
| Hosted recruitment | Synthetic signup/review/post/apply/interview/email/notification/calendar, withdrawal/reapplication, closure and live-session suspension checks have dated evidence. | Direct hosted denial/idempotency and interrupted-request cases retain their recorded limits. |
| Backups and recovery | Real synthetic source-loss/decryption/isolated-restoration pass; two older current QA files decrypt-verified; labelled alert received; normal new candidate upload persisted and created an encrypted archive; an unsigned archive GET returned HTTP 403. | Testing only. Independent provider/key recovery and real-account/Production backfill are separate. |

## Production configuration findings

Production preparation is now requested. The provider consoles confirmed the intended live Neon **BenchScout / production / neondb** identity (six-hour recovery history) and existing **benchscout-private-documents** Private/IAD1 store. The separately approved **benchscout-production-backups** Private/IAD1 store is created, empty and disconnected. The operator saved eight Production-only Secret bindings with a separately approved live alert recipient; Vercel metadata and save-success confirmation were observed without revealing values. A fresh read-only normal-database audit found all seven migrations applied with matching checksums, no unexpected migrations and three private current file references (zero public/other). Effective Production connection mapping and runtime activation remain pending. The [Production configuration checklist](PRODUCTION-CONFIGURATION.md) records the scope, evidence limits and next sequence.

Fresh read-only Vercel Project metadata showed `BLOB_PRIVATE_READ_WRITE_TOKEN`, `ADMIN_SECRET`, `SALARY_OWNER_SECRET` and the five new backup variables without a Production-scoped binding. The private-upload token has Preview/testing and a broader Preview binding; administrator/salary and backup variables are testing overrides. The Shared tab explicitly showed **No shared variables linked**. Values were not revealed or modified.

The visible Production-and-Preview bindings include the existing database, cron, canonical app URL, email and external-service variables. Their actual values/strength were not inspected. In particular, broad Preview database defaults and historical deployments still need the isolation/retirement review already recorded in operations readiness.

| Required before rollout | Concrete action | Acceptance |
| --- | --- | --- |
| Live private documents | Confirm the intended existing live store and configure its private token for Production through private operator entry. Keep the test store separate. | Effective Production upload/guarded read succeeds for a scoped synthetic smoke fixture; anonymous reads fail. |
| Administrator and salary ownership | Create/save distinct Production `ADMIN_SECRET` and stable `SALARY_OWNER_SECRET`; review cron secret scope separately. | Correct/wrong-key tests and relevant protected salary ownership checks pass without exposing values. |
| Production document backups | Provision/approve a separate private live backup destination, new encryption key with separate recovery custody, approved live alert recipient and `DOCUMENT_BACKUP_ENABLED` activation sequence. Keep test-mode off in Production. | Scope/presence, encrypted read-back, alert receipt, retention/deletion and protected restoration checks pass with scoped test data. |
| Database mapping and history | Privately establish which database the effective Production deployment uses; compare all seven repository migrations and checksums before applying only missing migrations. | Recorded history, schema compatibility and protected smoke checks; no reset or copied QA accounts. |
| Existing live files | Inventory current private/public references; prepare approved backup/mapping and legacy conversion if required. Extend/review the operator backfill target guard for Production before using it there. | Only current approved files copied and decrypt-verified; deletion/withdrawal rules preserved; no count-only success claim. |
| Preview isolation | Remove the possibility that other Preview branches/older deployments keep unintended live credentials through a reviewed change. | Effective deployment/connection identities and retired/restricted older deployments verified. |
| Release and recovery owner | Record release commit, deployment identity, recovery objectives, maintenance/write handling and rollback procedure. | Reviewer-approved cutover/smoke/rollback plan; code rollback alone is not a file/database restore. |

The current CLI backfill explicitly accepts only a testing target assertion. Do not point it at Production while falsely labelling the target testing. The public-to-private migration script also uses direct Blob writes rather than the upload hook; approved migrated current files need explicit backup verification. No real-file migration/backfill has been authorised or performed here.

Follow-up console verification confirmed the old Ready Production deployment is still the 2 July main release and the backup store has no automatic project connections. The operator then confirmed private database re-entry from the intended live Neon branch. Vercel shows update success, a Secret/Production-only database binding and the retained separate testing override; the broad Preview database default is removed for future builds. Saved credential contents were not inspected and the effective deployed connection remains for runtime acceptance. Existing deployments still require separate retirement/restriction review. See [configuration handoff](PRODUCTION-CONFIGURATION.md).

## Migration and behaviour review

There are seven repository migration directories, including the baseline, security/session foundation, employer email confirmation, candidate profiles, employer safety, selected application documents and candidate-review revisions. The selection migration backfills only a previously authorised current **private CV**, not all optional documents. Historical credential flags do not by themselves establish a current version-bound independent review. Account/session and salary ownership behaviour changes need targeted release smoke tests.

A private-file conversion or database migration is not undone by reverting application code. Review rollback compatibility before release; do not restore old public sharing or revoked sessions/approvals as a shortcut. Existing Production records stay in place; testing accounts, vacancies and files are not copied into the live environment.

## Ordered next steps

The [older-file workflow](PRODUCTION-DOCUMENT-BACKFILL.md) is now implemented for review. Refreshed aggregate inventory remains three private current files across all eight kinds. It introduces a separate default-off apply gate because the old live app lacks current backup lifecycle hooks; copying awaits verified live hooks or an enforced approved write pause. Initial staged preview must keep apply disabled. No older real files are protected yet by this workflow. The newer checkpoint above records the protected stage and successful disabled-gate preview.

Latest accepted result: scoped staged Production database, QA encrypted backup/source-loss restoration, independently checked cleanup and recipient-confirmed alert delivery now pass. Existing real-file backfill is not performed, and the public live domain is unchanged. Proceed to the guarded older-file plan; do not treat this diagnostic build, with its staging canonical override, as ready for direct live promotion. [Acceptance details](PRODUCTION-RUNTIME-ACCEPTANCE.md).

Current staged runtime acceptance: correct-key readiness now passes, including the expected target fingerprint and backup configuration/test-mode flags. Provider deployment metadata confirms approved `b399b13`, despite a null runtime Git SHA field. The next operator check is QA-only source loss/encrypted restoration/cleanup, followed by approved-inbox alert receipt. These are not yet passed; live-domain release and guarded older-file backfill stay separate. [Runtime acceptance](PRODUCTION-RUNTIME-ACCEPTANCE.md).

Latest execution: the approved `b399b13` source has a Ready/Staged Production diagnostic deployment, `5xj9zsypDUgenQQ2kLA1pgkErTqB`. Its exact staging-alias canonical URL is overridden only for that deployment after an initial origin rejection; security rules are unchanged. Wrong-key denial now passes the origin gate. Correct-key runtime connection, QA storage recovery and alert receipt remain pending. The live domain still serves July main. Do not promote this diagnostic build with its staging canonical configuration; see [runtime checkpoint](PRODUCTION-RUNTIME-ACCEPTANCE.md).

Runtime acceptance preparation is available in [Production runtime acceptance](PRODUCTION-RUNTIME-ACCEPTANCE.md): protected connection fingerprint, explicitly confirmed QA storage restoration and configured-recipient alert checks. The updated implementation passed lint/typecheck/239 tests/build and narrow-screen inspection. The existing live homepage returned 200 and backup endpoint 404. Approval of a **staged Production deployment without domain assignment** is the next execution boundary; it does not authorise main merge, promotion, bulk backfill or transfer of existing files.

1. Review the missing Production bindings and effective database/store identities with the operator; prepare concrete, separately scoped configuration forms before requesting any new access/credential approval.
2. Resolve the remaining hosted identity/recovery, cross-account denial/idempotency, interrupted-request and scheduler operations cases against the dated audit checklist. Keep provider-blocked results separate from observed HTTP denials. Refresh the legacy live-file inventory and migration-history evidence read-only.
3. Prepare the live backup/migration/backfill and rollback plans with counts, ownership and explicit approval boundaries. Registration/name/domain/service arrangements remain parallel business work from the proposal; their current completion was not verified in this technical pass.
4. Present the exact release commit, migration/configuration steps, smoke checks and remaining risks for final main/Production approval. A testing success alone does not authorise that cutover.

Evidence: [document recovery](DOCUMENT-RECOVERY.md), [hosted recruitment](HOSTED-EMPLOYER-ACCEPTANCE.md), [operations readiness](OPERATIONS-READINESS.md), [launch audit](LAUNCH-AUDIT.md), [deployment history](DEPLOYMENT.md).
