# BenchScout public release decision packet — current review 23 October 2026

**Current status: controlled pilot reopened with explicit owner approval.** Public `bench-scout.vercel.app` serves reviewed deployment `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` / source `082c225`. All thirteen public GET checks passed, cleanup cron registration now matches this artifact, and git-main is restored to provider-protected maintenance. Testing/diagnostics are preserved and bypass count is zero. Actual scheduled execution and private public-origin sign-in acceptance remain pending. Main merge and real-file backfill remain unapproved. [Executed cutover and remaining work](CONTROLLED-PILOT-2026-10-23.md).

## 23 October pre-cutover refresh — historical review

The [current controlled-reopening decision](CUTOVER-DECISION-2026-10-23.md) verifies Ready candidate/rollback identities, maintained public aliases (root 503), zero bypasses, eight live migration checksums, queue 0/0/0 and the expected Private/Available source/archive stores. Neon currently shows six-hour history with no snapshots/schedule. Fresh metadata still finds three files; this does not authorise copying or establish backup completion. The decision records exact promotion/rollback scope, public-origin/scheduler follow-up, main auto-deploy handling and required acknowledgement of recovery limits. Public remains held pending explicit approval. [Current evidence](qa/2026-10-23-cutover-review.json).

## Exact identities

| Item | Verified identity |
| --- | --- |
| Candidate source | `082c225a86a1ec582ceb2e27faf276f82b8a7994` |
| Application changes since candidate validation | None through checkpoint `70df89e`; application/config paths compared again; subsequent additions are tests and documentation only |
| Refreshed remote main | `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`; do not redeploy this unsafe source |
| Vercel project | `sholly/bench-scout`, `prj_MNrDsjvBMVCY5mmPjD3tSyw7OIBs` |
| Current public / git-main | Public: reviewed `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`; git-main: maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV` |
| Accepted protected diagnostics | `dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg` at `bench-scout-sholly.vercel.app` |
| New public-origin artifact | Ready `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`, `bench-scout-r2ldibwnk-sholly.vercel.app`; corrected Production-only key; promoted to current public pilot |
| Production schema | Eight migrations, checksums matched, no unfinished migration; cleanup queue empty |

## Evidence accepted

- Lint, strict TypeScript, **276 tests** and webpack Production build passed for the frozen candidate. [Validation](qa/2026-10-22-final-release-validation.json).
- Approved additive cleanup migration applied to the verified live target, independently checked: nine columns, three indexes including primary, matching history checksum, zero tasks. No additional migration is planned. [Migration execution](qa/2026-10-22-production-cleanup-migration.json).
- Current stage operator results: intended Production database fingerprint matched; backups enabled/configured, alerts configured, test mode off; pending/failed/due **0/0/0**. Runtime buildCommit is null; source identity is independently established by provider metadata. These are read-only checks. [Runtime acceptance](qa/2026-10-22-protected-stage.json).
- Synthetic hosted ordinary upload/delete passed; deterministic replacement storage/worker interruption and retry tests preserve the replacement. A hosted injected provider outage is not claimed. [Hosted evidence](qa/2026-10-21-document-cleanup.json), [failure tests](qa/2026-10-22-cleanup-replacement-retry.json).
- Thirty-one explicitly approved obsolete deployments are retired and their URLs verified unavailable. Public and git-main are contained. Other retained deployments are not covered by a claim of global write isolation. [Isolation record](DEPLOYMENT-ISOLATION.md).
- Earlier scoped Production QA encrypted source-loss/restore and approved inbox delivery were accepted; they are not relabelled as a new storage test on this build. Existing older real files remain unbackfilled.

## Hosted access acceptance — 22 October

All twelve approved fixed GET checks passed on current candidate `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`: root/employer HTML 200; disabled setup/test-email JSON 410; protected APIs and forged-session JSON 401. The application denials were reached through the approved temporary bypass; they are not provider protection redirects. Access was revoked and independently checked: project bypass count zero, revoked-token HEAD 302. No application records/files, valid sessions or public aliases changed. [Hosted check results](qa/2026-10-22-protected-access-smoke.json).

## Authenticated integration acceptance — 22 October

The separately approved temporary-schema run passed all **eight** actual HTTP/PostgreSQL checks, including session persistence/expiry/re-login/logout, cross-account profile denial, salary owner changes, duplicate preservation, cross-owner and ownerless legacy denial. Confirmation emails were locally captured; private storage was disabled. Cleanup is independently verified: schema absent, no fixture accounts in normal schema, local server closed. This closes the real-database integration gap; it does not claim authenticated hosted Vercel or public-origin browser/link acceptance. [Results](qa/2026-10-22-authenticated-subset-accepted.json).

## Remaining acceptance, classified — 22 October

The salary route regression suite now exercises actual route/auth handlers with an in-memory persistence adapter: anonymous and employer write denial; repeat owner submission without duplicate creation or caller-selected ownership; cross-owner and ownerless legacy edit/delete denial; successful own edit/delete; and missing ownership configuration failing closed. **All 281 repository tests pass**, including these five additions; focused ESLint and diff whitespace checks pass. No application/configuration change or replacement build is needed. This proves deterministic route behaviour, **not a hosted Production salary mutation**. [Evidence](qa/2026-10-22-salary-ownership-acceptance.json).

| Remaining item | What is already supported | Required next evidence or decision |
| --- | --- | --- |
| Access, duplicate submission and session revocation | Earlier isolated real HTTP/database/private-storage acceptance and dated hosted synthetic recruitment checks; current deterministic route tests | Current protected candidate now passes the twelve GET checks, including application-level anonymous and forged-session denial. Authenticated duplicate/cross-owner operations retain earlier dated scope; no current Production mutation is claimed. |
| Salary ownership | New route regressions pass; live legacy ownerless row was previously identified and remains preserved | Actual authenticated HTTP/PostgreSQL owner/cross-owner and legacy checks now pass in an isolated schema. This is not a hosted Vercel mutation; any final public-host check remains separately scoped. |
| Canonical origin and links | Current build/runtime public origin matches the intended hostname; generated-host mutation rejection is intentional | Validate public-origin sign-in/session and link behaviour during a separately approved cutover smoke. Never relax origin rules to test a generated hostname. |
| Scheduler | Schedule submitted; exact candidate wrong/correct key dry-run accepted | Verify effective definitions after promotion and observe a real invocation. Empty pre-promotion definitions are an open operational check, not proof of failure or success. |
| Recovery | Synthetic encrypted loss/restore and alert delivery previously accepted; user reported saving credentials after instructions to keep protected encryption-key recovery copy | Confirm accountable operator and recovery expectations before launch. Full dataset restoration duration remains unmeasured. |
| Older objects | Fresh copy is disabled; historical three-object metadata preview expired | Separate fresh preview/copy approval remains required. Do not describe older objects as already backed up. |

Public promotion and main merge remain unapproved. This review narrows the evidence gaps; it does not silently waive them or start another deployment.

## Approved build scope — executed 22 October

Prepare a clean archive of exact candidate `082c225`, assert original project/team mapping, and deploy with `--project bench-scout --scope sholly --prod --skip-domain`. Use the validated webpack build command and **both build/runtime canonical URL `https://bench-scout.vercel.app`**. Keep backups enabled, test mode off and real-file backfill apply false. Preserve existing stable Production database, source/archive, encryption and ownership secrets; never copy testing credentials or records.

Unlike diagnostics, retain the repository's normal cleanup cron: `/api/cron/document-cleanup`, `17 2 * * *` (02:17 UTC / 03:17 Africa/Lagos; Hobby timing is not exact). This build approval must explicitly cover submitting that schedule. Do not assume --skip-domain disables scheduling. Verify provider definitions and effective cron authentication; no digest/compliance email dispatch is included. A scheduler or wrong-target error is a stop condition, not a reason to weaken authentication. The current empty queue is not a permanent assurance that later tasks cannot exist.

Record Ready state, source metadata, protection, effective configuration evidence, cron definitions, immutable URL and final alias map. Preserve public/git-main maintenance and the existing diagnostic alias. If Vercel assigns any kept alias unexpectedly, restore its recorded mapping before further actions. Do not promote a staging-canonical build or create a protection bypass just to make tests pass.

The public-origin build's generated hostname intentionally fails same-origin mutations from that hostname. This is expected; do not broaden origin rules. Current protected diagnostics validate the same application code against live services. Any further authenticated diagnostic access must use an approved supported mechanism, not an invented bypass.

## Cron authentication checkpoint — accepted 22 October

The approved Production-only correction and replacement build passed **wrong-key 401 / new correct-key 200**, dryRun true, queue 0/0/0. Preview/testing bindings remain unchanged. Temporary project bypass is fully revoked (zero entries; revoked-token 302); private key copy removed and local server stopped. Active scheduler definitions remain empty while unpromoted; actual provider invocation remains separate. The earlier rejected-key records are dated history, superseded for the new candidate by [accepted correction evidence](qa/2026-10-22-production-cron-correction-accepted.json).

## Pre-promotion decision safeguards — fulfilled approval recorded above

Before requesting public reopening, present the exact new deployment ID, config/schedule findings, migration identity, remaining acceptance results and rollback ID. Resolve or explicitly record the remaining direct hosted access/idempotency, salary owner/cross-owner, session/canonical-link and cron acceptance limits from the release runbook. Do not change HOLD to release-ready based only on the empty queue.

Private encryption-key recovery custody, accountable recovery operator and realistic recovery objectives must be acknowledged; do not promise a full-service recovery time from the small synthetic restore. Existing one ownerless salary contribution stays anonymous, without inferred reassignment.

A promotion approval must identify the public hostname, exact Ready artifact and permitted smoke actions/recipients. Recheck current database recovery availability and retained source/archive identity immediately before cutover. Keep older-file apply disabled. Use the supported provider promotion flow and verify the resulting public/diagnostic/testing/git-main mappings.

## Smoke and rollback

| Check or trigger | Action |
| --- | --- |
| Safe initial public smoke | Root/sign-in pages, disabled setup/debug endpoints using safe methods, anonymous protected-resource denial, admin wrong-key denial, current schema/config and queue counts. No reset, compliance-mail or real upload/delete as a read-only probe. |
| Account/applicant smoke | Use separately scoped approved synthetic identities and data; no guessed production identity, automatic approval or real-document sharing. Record actual HTTP status and retained row counts. |
| Correct cron authentication | First use cleanup/digest dry-run; normal compliance/reminder routes can send mail. Observe actual scheduler invocation separately from configuration. |
| Wrong target, broken access/ownership, failed critical smoke | Stop; return public and git-main to verified maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV` under the cutover's approved rollback scope. Preserve diagnostics/evidence. |
| Suspected data loss | Contain writes across affected reachable deployments; escalate to isolated restore/reconciliation. Alias rollback does not undo writes or delete a new immutable writer. Do not restore the database or files blindly. |

Keep all eight migrations and stable encryption/ownership keys during a code rollback. Do not drop the cleanup queue, revive grants/sessions, restore July handlers or repoint public at the diagnostic canonical URL. Returning the public alias to maintenance does not establish a global write lock: the failed deployment/other writers need separately scoped restriction or retirement.

## Main and older files

Main merge is not part of build/promotion approval. Main still contains July source; merging can automatically create/promote a Production deployment. Prepare the exact merge diff and verify an approved auto-assignment/deployment plan first so a second artifact cannot replace the reviewed build unexpectedly. Never update main by resetting user history or importing the testing database.

Real-file backfill is a separate post-hook operation: fresh metadata preview, current signed plan, reviewed write handling and explicit real-file copy approval. Prior three-file inventory has expired and cannot authorize copying now. The public rollout does not itself back up older objects.

## Current status

The explicitly approved controlled promotion is complete, public smoke passed, git-main restoration is verified and scheduler registration is active. Private browser sign-in and actual scheduled invocation remain follow-ups; main merge and older-file copying remain separate. No rebuild, new test email, real-file operation or secret rotation occurred. Earlier HOLD/build-preparation records below their dates remain history; the linked controlled-pilot execution is current.
