# BenchScout public release decision packet — 22 October 2026

**Decision now: public promotion remains HOLD; do not reopen or merge main yet.** The approved public-origin candidate is Ready as `dpl_CSoxtMv87Zm4xVw2brybZxZV3onF`. Its source matches the validated candidate and existing aliases remain unchanged. The cleanup schedule was submitted with the build, but active project cron definitions remain empty; actual registration/authentication/invocation acceptance is not claimed. [Build execution](qa/2026-10-22-public-origin-build.json).

## Exact identities

| Item | Verified identity |
| --- | --- |
| Candidate source | `082c225a86a1ec582ceb2e27faf276f82b8a7994` |
| Application changes since candidate validation | None through documentation checkpoint `9c83d45`; application/config paths were compared |
| Refreshed remote main | `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`; do not redeploy this unsafe source |
| Vercel project | `sholly/bench-scout`, `prj_MNrDsjvBMVCY5mmPjD3tSyw7OIBs` |
| Current public and git-main | Maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`, source `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f` |
| Accepted protected diagnostics | `dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg` at `bench-scout-sholly.vercel.app` |
| New public-origin artifact | Ready `dpl_CSoxtMv87Zm4xVw2brybZxZV3onF`, `bench-scout-926z7vaov-sholly.vercel.app`; protected and unpromoted |
| Production schema | Eight migrations, checksums matched, no unfinished migration; cleanup queue empty |

## Evidence accepted

- Lint, strict TypeScript, **276 tests** and webpack Production build passed for the frozen candidate. [Validation](qa/2026-10-22-final-release-validation.json).
- Approved additive cleanup migration applied to the verified live target, independently checked: nine columns, three indexes including primary, matching history checksum, zero tasks. No additional migration is planned. [Migration execution](qa/2026-10-22-production-cleanup-migration.json).
- Current stage operator results: intended Production database fingerprint matched; backups enabled/configured, alerts configured, test mode off; pending/failed/due **0/0/0**. Runtime buildCommit is null; source identity is independently established by provider metadata. These are read-only checks. [Runtime acceptance](qa/2026-10-22-protected-stage.json).
- Synthetic hosted ordinary upload/delete passed; deterministic replacement storage/worker interruption and retry tests preserve the replacement. A hosted injected provider outage is not claimed. [Hosted evidence](qa/2026-10-21-document-cleanup.json), [failure tests](qa/2026-10-22-cleanup-replacement-retry.json).
- Thirty-one explicitly approved obsolete deployments are retired and their URLs verified unavailable. Public and git-main are contained. Other retained deployments are not covered by a claim of global write isolation. [Isolation record](DEPLOYMENT-ISOLATION.md).
- Earlier scoped Production QA encrypted source-loss/restore and approved inbox delivery were accepted; they are not relabelled as a new storage test on this build. Existing older real files remain unbackfilled.

## Approved build scope — executed 22 October

Prepare a clean archive of exact candidate `082c225`, assert original project/team mapping, and deploy with `--project bench-scout --scope sholly --prod --skip-domain`. Use the validated webpack build command and **both build/runtime canonical URL `https://bench-scout.vercel.app`**. Keep backups enabled, test mode off and real-file backfill apply false. Preserve existing stable Production database, source/archive, encryption and ownership secrets; never copy testing credentials or records.

Unlike diagnostics, retain the repository's normal cleanup cron: `/api/cron/document-cleanup`, `17 2 * * *` (02:17 UTC / 03:17 Africa/Lagos; Hobby timing is not exact). This build approval must explicitly cover submitting that schedule. Do not assume --skip-domain disables scheduling. Verify provider definitions and effective cron authentication; no digest/compliance email dispatch is included. A scheduler or wrong-target error is a stop condition, not a reason to weaken authentication. The current empty queue is not a permanent assurance that later tasks cannot exist.

Record Ready state, source metadata, protection, effective configuration evidence, cron definitions, immutable URL and final alias map. Preserve public/git-main maintenance and the existing diagnostic alias. If Vercel assigns any kept alias unexpectedly, restore its recorded mapping before further actions. Do not promote a staging-canonical build or create a protection bypass just to make tests pass.

The public-origin build's generated hostname intentionally fails same-origin mutations from that hostname. This is expected; do not broaden origin rules. Current protected diagnostics validate the same application code against live services. Any further authenticated diagnostic access must use an approved supported mechanism, not an invented bypass.

## Cron authentication checkpoint — 22 October

The wrong-key check reached the exact candidate and returned 401, but the available local cron key was also rejected with 401. Correct-key acceptance remains open. Temporary project bypass access is fully removed (zero entries, revoked-token HTTP 302). Obtain the actual Production key privately or prepare a controlled configuration correction; do not infer that cron is ready from key presence. [Probe evidence](qa/2026-10-22-cron-authentication-attempt.json).

## Promotion remains a separate decision

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

The separately approved public-origin build and schedule submission are complete. No public promotion, main merge, secret rotation, real-file copy or new application mutation was executed. Actual scheduler activation/authentication and remaining release gates remain open. Earlier build-preparation records are retained as dated history; this packet and linked execution records provide the current consolidated decision.
