# Public-app release and rollback plan — 21 October 2026

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

Current update: [durable cleanup](DOCUMENT-CLEANUP.md) adds an eighth migration, applied only to testing. The earlier seven-migration/no-op expectation below is superseded for the new candidate: Production needs the reviewed additive cleanup table before that code is released. Physical storage cleanup is now durable/retriable after transactional reference removal, with external-provider/hosted acceptance limits recorded separately. Public containment remains active; this does not approve the hardened cutover.

Status: **prepared; HOLD for release**. This runbook does not authorise a main merge, live deployment, domain assignment, credential change, database restore or real-document copying. Engineering prepares and records evidence; the owner approves the exact cutover and recovery actions. No new service, paid plan, migration or scheduled backup is introduced by this document.

## Release identity and impact

Reviewed application source: `64e2f83c62d7c81b3905cdc075793255b8e7d186`. Subsequent commits through `eba00029547fdbd23348aad7ee9adf726934e569` are documentation checkpoints. Freeze the final release SHA after the remaining technical gates; compare its application diff with this reviewed source and rerun appropriate checks if code changes. Cached `origin/main...HEAD` currently spans 260 files, 14,711 insertions and 6,759 deletions including documentation: this is a substantial accumulated application release, not just a backup toggle. Refresh remote identity before final approval.

The protected Production-connected diagnostic deployment is `dpl_12r5Zwn4tyffsUTnH3YF9tMrNqXh`, source `64e2f83`, with a staging canonical URL and copying explicitly disabled. The most recent provider alias lookup recorded the public app on `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ`, July main `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`. These are evidence checkpoints, not a promise that provider state cannot change.

A public release changes sign-in/session behavior, protected documents, candidate profiles, employer review and recruitment workflows as well as backup handling. Existing live records remain in the live database; testing accounts, vacancies, files and sessions are not imported. Older unreviewed employer/credential states must not be silently approved. Legacy sessions may require fresh sign-in. Confirm these expectations in the cutover notice.

## Accepted evidence and its limits

- Local application validation at `64e2f83`: lint, TypeScript, 251 tests and webpack build passed. This planning pass changes documentation only; those checks were not rerun or relabelled as a new source validation.
- Staged Production database fingerprint matches the independently checked live database. Provider source metadata matches the approved stage. QA storage loss/decrypt/restore passed by operator report, cleanup was independently checked, and the approved recipient confirmed the alert.
- Hosted metadata preview returned three unique current private files: one CV, one practising licence and one profile image. Zero blocked; inventoryReady=true; applyEnabled=false; canApply=false. No file contents read or business/sharing records changed. It is an operator-reported response; older real files are still unbackfilled.
- The earlier read-only normal database audit found all seven repository migrations applied with matching checksums. Recheck history against the effective cutover target; do not infer migration deployment from schema compatibility alone.
- Testing contains extensive synthetic recruitment and upload evidence. Browser-blocked document requests do not prove a server HTTP denial. Historical recovery-copy results do not establish full service disaster recovery.

## Gates before an owner can approve public cutover

| Gate | Required evidence / next action | Current disposition |
| --- | --- | --- |
| Final source and validation | Freeze exact SHA; check clean checkout, source diff and required checks. | Application `64e2f83` validated; final release identity pending remaining gates. |
| Deployment isolation | Inventory old Preview/Production URLs retaining live credentials; identify those allowing writes, and prepare their supported restriction/retirement. Verify enforcement rather than relying on removing future Preview env defaults. Preserve evidence and obtain approval for consequential removal/access changes. | Read-only perimeter audit passed; 30-build retirement proposal and public legacy containment remain open. See [isolation audit](DEPLOYMENT-ISOLATION.md). |
| Direct access and retries | Complete hosted synthetic HTTP checks for another candidate/employer ID, unselected files, withdrawn grants, suspended employer and repeated application; capture actual status and retained record count. Use approved testing fixtures, never real identities. | Some UI/isolated-schema evidence accepted; missing direct hosted evidence remains open. |
| Interrupted document lifecycle | Exercise source/archive/metadata failure ordering in isolated testing. Verify no false success and an actionable reconciliation path. Upload commits metadata before best-effort old cleanup; delete removes archive/source before metadata update. Those operations are not atomic. | Open for full interrupted-request acceptance; cleanup logs alone are not reconciliation. |
| Account and salary ownership | Check fresh/expired sessions and confirmation/reset links with intended canonical origin. Compare historical salary ownership without revealing identifiers; new stable HMAC secret cannot automatically recover null/old ownership. Verify synthetic owner update/delete and cross-owner denial. Do not assign anonymous historical rows to people by guess. | Source reviewed; remaining hosted/live compatibility evidence open. |
| Cron and external delivery | Verify Production secret scope and actual scheduler configuration. Daily-digest `?dryRun=1` is available with cron authentication; normal digest can scan/send, and compliance-check has no dry-run and can email real users. Keep real dispatch outside unapproved checks. | Scheduler/cron-secret acceptance open. No root `vercel.json` in current source; this does not prove an external scheduler is absent. |
| Recovery and owner | Privately confirm encryption key recovery custody, acceptable data loss/recovery time, and who executes restore/reconciliation. Verify the live database recovery window immediately before cutover. Choose a recovery-safe rollback build or enforced write-stop mechanism. | Independent key/provider recovery and full service restore remain unverified. No numeric recovery promise accepted. |
| Production canonical config | New live-canonical build must use `NEXT_PUBLIC_APP_URL=https://bench-scout.vercel.app` at build and runtime, effective live resource bindings, backups enabled, test mode off and backfill apply false. | Diagnostic staging override is unsuitable for direct promotion. |

Prepare a reviewed fallback before cutover. The application has no verified global maintenance/write-stop switch: a maintenance page alone cannot stop API calls or old immutable URLs. If a pause is chosen, enforce it at all write-capable entry points and verify it, with explicit scope/approval. Do not invent an environment flag and assume old deployments honour it.

## Ordered cutover, after gates close and exact approval

1. Record final SHA, current public deployment/aliases, effective configuration fingerprints/booleans, migration history, source/archive identities and a timestamp within the verified database recovery window. Do not publish credentials, raw document URLs, session tokens or candidate records. Record the owner, planned start/end and stop criteria.
2. Review a release build with the **live canonical origin**, not the diagnostic staging origin. Use the approved exact source and explicit `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED=false`, `DOCUMENT_BACKUP_ENABLED=true`, `DOCUMENT_BACKUP_TEST_MODE=false`. A protected unaliased build can be inspected first. Same-origin mutations from its generated hostname will reject when its canonical origin is the public app: that is expected. Do not weaken origin checks to test it.
3. Recheck migration checksums on the independently verified live target. Expected path is **no migration** if all seven still match. Any missing, unexpected, failed or changed migration stops the sequence for a separately reviewed migration/recovery plan. Never use reset, db push, or copy the testing database.
4. Apply the previously reviewed old-deployment isolation/write-handling plan and verify enforcement. Promote only the approved live-canonical build to the intended public domain using the supported provider workflow. A main merge and provider promotion are distinct actions; avoid creating an accidental second deployment from main while promoting another build. Record the chosen release mechanism before approval.
5. Perform the bounded public-origin smoke checks below immediately. Keep bulk backfill disabled. Check authenticated requests from the intended public origin as well as anonymous denial; a homepage 200 is insufficient. Stop on any unexpected target, access failure, missing archive, backup write/read-back failure, wrong email origin or evidence of old writers.
6. After live hooks and denial checks pass, request a new metadata preview. Review the exact current inventory and approve real copying to the private Production archive separately. The previous preview expiry is not reusable permission. Enable apply only for the approved operational window, generate a fresh bound plan and run the reviewed copy. Require decrypt verification, zero failures/skips/stale purges and unchanged inventory. Disable apply in subsequent deployments and restrict/retire any deployment that retains apply=true.
7. Observe and record immediate smoke results and the next approved operational/scheduler cycle. Reconcile errors before declaring complete. No automatic cleanup of real files, approvals, accounts or archives is included.

## Bounded public-origin smoke checks

Prepare and approve a clearly labelled synthetic Production account/recipient and disposable document before using them; existing test-alias permission was for testing and does not create a live account automatically. User enters passwords privately. No real qualification or reviewed company is simulated as a genuine approval.

| Check | Required outcome |
| --- | --- |
| Effective connection | Correct live fingerprint and database name; backups enabled/configured; test mode off; no candidate data in result. |
| Canonical links and authentication | Confirmation/reset links point to the public HTTPS origin; new login persists, logout/expiry rejects; appropriate reauthentication required for legacy sessions. Sending/resetting requires approved recipient and scope. |
| Normal upload lifecycle | Upload a new synthetic file through `/api/upload`, not just the QA canary. Persisted guarded owner preview matches the fixture; encrypted archive is read/decrypt-verified before metadata success. Never replace a real candidate file. |
| Access boundary | Anonymous source/archive reads fail; wrong account and employer without a current selected application grant fail at HTTP level; responses expose no raw storage URLs/secrets. |
| Replacement/deletion | On explicitly approved disposable fixtures, verify current-file retention and replacement remains unshared until selected. Permanent deletion/cleanup is separately confirmed; do not reuse approvals for real files. |
| Employer and application | Pending/suspended employer cannot post/access candidates. Run bounded approved synthetic flow only; real review decisions remain owner responsibilities. |
| Alert/cron | Existing staged alert receipt is accepted; any live repeat needs approved recipient/scope. Use daily-digest dry-run first; do not invoke compliance reminder as a harmless status check. |

## Stop and rollback decision table

| Failure | Immediate response | Recovery path |
| --- | --- | --- |
| Before public alias changes | Leave public deployment intact; keep apply off. | Fix/rebuild the protected candidate and revalidate affected checks. |
| Wrong target/configuration or access regression after cutover | Stop further operator actions and enforce the reviewed write restriction across public and old URLs. Preserve logs and deployment identities without secrets. | Prefer a corrected build preserving current access, schema, grants and backup hooks. An alternate build must use live canonical config and compatible stable secrets. |
| UI regression with intact data/security | Restrict affected workflow as reviewed; do not reverse business records. | Revert/fix the specific feature in a new compatible build, validate and obtain approval for its live release. |
| Missing archive / failed document write | Keep backfill off; stop affected writes, inspect current DB reference/source/archive metadata. | Reconcile in isolation; restored bytes must be authenticated/decrypt-verified. No deletion or reference repair without a scoped reviewed action. |
| Confirmed data loss/corruption | Enforce write stop and record incident time, later writes and affected scope. Do not blindly reset live DB. | Restore database to an isolated protected branch, disable restored sessions/outbound mail/cron, reconcile document references and later revocations, test integrity and access before separately approving cutover. File restore and DB restore are distinct. |

**Do not automatically roll back to July main.** It predates the new document backup lifecycle and access behavior. Repointing to it can resume writes without hooks and undo runtime access protections; it cannot restore deleted files or undo migrations. The current staging-canonical build also is not a ready public rollback target. A compatible fallback or enforced write-stop plan is a release blocker, not a post-release task.

Keep encryption and salary-ownership keys stable during code rollback. Rotating keys is a separate operational change with consequences for decryption/ownership. Never restore revoked grants or sessions merely to make a restored app appear functional. Same-account/provider encrypted archives protect scoped current files; they are not an independent provider disaster-recovery solution or immutable historical retention.

## Approval packet and completion record

Before seeking final cutover approval, fill in: exact release/fallback SHAs and deployment IDs; live canonical origin; source/archive target evidence; migration action (expected none); completed gate results; enforced old-deployment handling; approved smoke identities/recipients and deletion scope; private key custody confirmation; owner-approved recovery objectives and rollback/stop operator; expected account behavior; explicit excluded real-file copying. Never ask the owner to approve an unspecified build or unresolved rollout mechanism.

Record actual operator, timestamps, alias transition, smoke results, incidents and backfill outcome separately from this prepared plan. The current checkpoint executed **none** of these cutover, live-smoke, real-copy or rollback actions.

Related: [current readiness](MAIN-RELEASE-READINESS.md), [staged runtime](PRODUCTION-RUNTIME-ACCEPTANCE.md), [older-file contract](PRODUCTION-DOCUMENT-BACKFILL.md), [recovery](DOCUMENT-RECOVERY.md), [hosted journey](HOSTED-EMPLOYER-ACCEPTANCE.md), [planning evidence](qa/2026-10-21-production-release-plan.json).
