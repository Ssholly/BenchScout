# BenchScout controlled reopening decision — 23 October 2026

**Review complete; public reopening awaits explicit approval.** No main merge, public promotion, real-document copy, restore or secret change occurred in this review. Recommend a controlled pilot reopening with immediate smoke/rollback, rather than treating the release as a fully certified recovery service. The recovery limits below must be accepted or resolved before approving.

## Verified today

- Candidate `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` is Ready, Production, unaliased; both provider source fields are `082c225a86a1ec582ceb2e27faf276f82b8a7994`. Application/configuration paths still match that validated source through checkpoint `34d6e52`.
- Public `bench-scout.vercel.app` and git-main still point to maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`. Anonymous root returns 503. That rollback artifact is independently still Ready with containment source `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f`.
- Project protection remains `all_except_custom_domains`; zero bypass entries. Candidate origin/backup settings and cron authentication were accepted in the linked 22 October records, not falsely represented as a new authenticated configuration test today.
- Production database fingerprint matches the accepted target; eight migration checksums match, no unfinished migration; cleanup pending/failed/due is 0/0/0. The first read-only queue query used a nonexistent status field and failed; the corrected query used the actual count/error/lease fields and completed without mutation.
- Vercel storage inventory shows the expected source and backup stores Private and Available: `store_mZ20PbMIJpMM6tli` / `store_p6fHiIr0jFmd2w2c`. No file contents or tokens were read.
- Fresh metadata still shows three unique current private files: CV, practising licence, avatar; no blocked references. This is not a signed backfill plan or proof that they have been archived.
- Neon BenchScout / production shows a **six-hour history window**, no snapshots and no snapshot schedule. At observation it displayed earliest restore time 23 October 08:59 Africa/Lagos; the window moves and must be checked again at cutover. No restore, upgrade or snapshot creation was attempted.

[Scrubbed current review evidence](qa/2026-10-23-cutover-review.json). Prior accepted checks: [281 tests](qa/2026-10-22-salary-ownership-acceptance.json), [12 hosted anonymous/forged-session checks](qa/2026-10-22-protected-access-smoke.json), [8 authenticated HTTP/PostgreSQL integration checks with independent cleanup](qa/2026-10-22-authenticated-subset-accepted.json), [corrected cron auth](qa/2026-10-22-production-cron-correction-accepted.json).

## Proposed approval scope

Approve promoting **only** existing Production artifact `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` for `https://bench-scout.vercel.app`, making the hardened app available for normal user activity. No rebuild, main merge, testing-data import, real-file backfill, credential rotation or new test email is included. The normal cleanup schedule submitted with this build may become active and process legitimate server-recorded deletion requests; that can remove detached files and their archives. It must not create new deletion requests as a smoke test.

Use the official supported staged-Production promotion, not a Preview rebuild:

```sh
npx --yes vercel@65.0.0 promote dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm --scope sholly
```

Before execution verify original local project/team identity, exact Ready source, aliases, recovery availability and absence of unexpected bypasses again. Stop for drift. Provider promotion can affect project production aliases: immediately verify every kept mapping, restore diagnostic/testing/hotfix mappings if moved, and keep git-main on maintenance until the separately reviewed merge workflow. This scoped restoration of the recorded aliases is part of the proposed cutover, not permission to replace other deployments or settings.

The approved fallback would return public/git-main to Ready maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`, source `336c6ed`, preserving the database schema, all records, stable keys and diagnostic/testing mappings. Prefer supported rollback for production and recorded alias restoration where required. Do not revive July source. If a provider request times out, inspect actual promotion state before issuing another mutation: the CLI timeout does not cancel promotion.

## Smoke, stop conditions and follow-up

1. Verify public/diagnostic/testing/git-main/hotfix aliases and anonymous availability. Repeat only safe page GETs, removed endpoint checks, anonymous and forged-session denial; no destructive reset, upload, file deletion, account creation or mail dispatch.
2. Verify effective scheduler definitions against this candidate, then observe an actual scheduled invocation separately. Wrong configuration, missing expected registration or unexpected access is a stop condition. Previously accepted authenticated dry-run alone is not scheduled execution.
3. Arrange private browser sign-in/session verification with an existing authorised account on the public origin. Do not infer this passed from the isolated HTTP tests. Confirmation/reset-link delivery is separately scoped if new messages are needed.
4. On critical failure, restore maintenance under the approved rollback scope and record findings. Alias rollback stops that public entry point; it does not reverse writes or globally disable every immutable deployment.
5. After live backup hooks are confirmed active, perform the separate guarded older-file workflow: fresh preview, explicit real-document copy/stale-archive cleanup approval, bounded enabled diagnostic configuration, decrypt/read-back verification and gate closure. Keep the public candidate's apply gate off. Do not reuse the expired three-file preview.

## Recovery acknowledgement and limits

The owner must retain the separately protected encryption-key recovery copy and be the initial recovery contact (or name another operator). A six-hour rolling database history is the currently observed safety net, not an accepted maximum data-loss promise. No full-dataset recovery duration has been measured, and no paid snapshot schedule is configured. Earlier small synthetic restore and alert delivery are accepted evidence with their original scope. The older three files remain unbackfilled during the proposed first cutover; accepting that pilot exposure does not label them backed up.

If those limits are unacceptable, keep maintenance and prepare stronger recovery/backfill arrangements before reopening. No paid upgrade, new provider or document transfer is authorised by this review.

## Main integration is separate

Remote main is still `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`. Its merge base is itself, and the current testing comparison spans 304 files (22,611 insertions / 6,797 deletions), including dated documentation. Do not push or redeploy it. Before the eventual main merge, review the exact resulting source, control automatic Production domain assignment/deployment, and ensure a new artifact cannot silently replace the reviewed release. Moving the app live and merging source history are separate operations; no reset or testing database copy is needed.

Provider references: [staged deployment promotion](https://vercel.com/docs/cli/promote), [production state and no-rebuild staged promotion](https://vercel.com/docs/deployments/promoting-a-deployment), [preferred promotion/rollback commands](https://vercel.com/docs/cli/alias). CLI 65 promotion help was also checked read-only.
