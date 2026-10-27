# Production older-file backfill — 21 October 2026

Newer operational checkpoint: [24 October protected backup window](PRODUCTION-BACKFILL-2026-10-24.md). The July-live dependency described below is historical; current execution status is in the newer record.

Status: guarded preview/apply implementation validated and deployed to the protected Production diagnostic stage; **hosted metadata preview passed; no real files copied**. The existing public app remains on July main. Earlier accepted runtime checks establish the connection and QA storage path, not protection of older files.

Validation passed: lint, TypeScript, **251 tests** (12 focused Production-backfill tests), webpack Production build and diff checks. Built preview controls fit 320px and 390px viewports without horizontal overflow; the long fingerprint field was checked at 390px. No administrator credential or operator request was submitted during local layout verification. Apply controls require a valid enabled-gate plan and were not exercised against real storage. Hosted protected preview has now passed with the exact operator-reported result recorded below.

Reviewed deployment candidate: `64e2f83c62d7c81b3905cdc075793255b8e7d186`, pushed to testing. A clean isolated checkout is linked to the existing sholly/bench-scout project using the already authorised official CLI; its local generated environment file is ignored. The operator approved staging this revision; deployment is Ready with `--prod --skip-domain`, the established protected staging canonical URL at build/runtime, and explicit `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED=false`. This checkpoint authorises neither a real file copy nor a live-domain promotion.

## 21 October 2026 — Hosted Production metadata preview passed

The operator supplied the exact successful response from the protected `64e2f83` stage: dryRun=true, eligibleReferences=3, uniqueFiles=3, blockedReferences=0 and inventoryReady=true. The current inventory is one CV, one practising licence and one profile image; every other supported kind is zero. This agrees with the independently queried aggregate inventory. applyEnabled=false and canApply=false confirm the disabled copy gate. The response reports fileContentsRead=false, businessRecordsChanged=false and applicationGrantsChanged=false. Evidence is the operator-reported response, not an independently captured result screen. Operational rate-limit bookkeeping is outside the business-record claim.

No real files have been copied or decrypt-verified by this backfill. The returned preview expiry is `2026-10-21T15:24:35.699Z`; it is not a reusable copy approval or enabled plan. Next: prepare/review the live release and rollback plan, verify current backup lifecycle hooks on the public app (or an explicitly approved enforced write pause), then obtain fresh inventory and explicit real-file copy approval. Keep apply disabled until that prerequisite is resolved. Do not directly promote the diagnostic build with its staging canonical URL. [Workflow](PRODUCTION-DOCUMENT-BACKFILL.md) and [structured evidence](qa/2026-10-21-production-backfill.json).


## Refreshed read-only inventory

The normal database target fingerprint matches the previously accepted staged Production fingerprint. A fresh query covering all eight supported vault fields found two user records and **three distinct current private files**: one CV, one practising licence and one profile image. Provisional licence, degree, statement of result, placement letter and additional certificate references were zero. No public/legacy/other references were found. No file bytes, user names, raw storage URLs or credentials were printed; records were unchanged. Refresh through the deployed preview before final approval, because this inventory can change.

Source: the configured **benchscout-private-documents** Private store. Intended destination: the separately configured **benchscout-production-backups** Private store. The accepted Production canary and cleanup checks used those configured services. The planned operation creates encrypted copies; it does not relocate/delete source files or grant employers new document access.

## Live-write dependency and separate apply gate

The public live app still uses older upload/deletion code. Backfilling while that code accepts writes could leave later replacements unprotected or retain archives after deletion. Therefore `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED` is **false by default**. Initial staged backfill deployment must explicitly keep it false. Read-only preview remains available, but no usable apply plan is issued and the server rejects apply before file access.

Only enable apply after the operator has verified the new live upload/deletion backup hooks are active, or approved and enforced a controlled write pause covering the old live app. The flag does not itself pause writes or automatically attest the live version. Changing it requires a new deployment, and invalidates prior plans. Do not enable it merely because staged QA tests passed. This dependency must be resolved in the live release/write-handling plan before copying the real inventory.

## Operator workflow and API contract

The existing `/admin/backups` screen has a collapsed **Production older-file backfill** section. Administrator keys clear after every action. Signed plan tokens stay only in page memory, are omitted from displayed/copied result JSON, and are cleared after an apply attempt or a new action/target change. The operator enters the independently verified Production target fingerprint; do not substitute whichever fingerprint an unverified deployment returns.

Both actions are protected `POST /api/admin/document-backups` requests using the existing administrator key, strict same-origin check, no-store responses and shared three-per-minute limit. Rate-limit bookkeeping is operational metadata; candidate/employer/application records and sharing grants are not changed.

| Action | Request and result |
| --- | --- |
| `production-backfill-preview` | Requires `expectedTargetFingerprint`, Production environment, synthetic test mode off and valid enabled backup configuration. Queries the running database name and bounded current vault references. Returns per-kind counts, eligible references, unique files, blocked references, inventoryReady/applyEnabled/canApply, expiry and (only when apply is enabled and inventory is eligible) a signed plan token. Reads no file contents and performs no Blob writes. |
| `production-backfill-apply` | Requires the same fingerprint, a valid unexpired signed `planToken` and exact `confirm: COPY CURRENT PRIVATE FILES`. Also requires the separate apply gate. Revalidates the target, backup credentials/key binding and complete current-reference manifest before storage access. Returns verified/stalePurged/skippedChanged/failed counts, inventoryChanged and passed. No caller account, source URL, path or destination is accepted. |

Plans expire after **15 minutes**. HMAC binds the target fingerprint, a commitment to configured source/archive/encryption credentials, the current-reference manifest and expiry; credential values are never returned. Wrong signatures, changed target/configuration/inventory and expired plans require another preview. Any unsupported/public/malformed reference blocks apply. Pilot limits are **100 accounts and 10 distinct files**, not an unlimited bulk worker; larger inventories require a separately reviewed bounded batch implementation.

## Copy and retention safeguards

- Current references only, across all eight vault kinds. Shared references to the same URL are copied once. No historical/deleted/replaced URL inventory is supplied by the caller.
- Recheck approved references before reading and again before writing. Changed references are skipped. Read only with the private source token, limited to 4 MiB per file.
- Use the existing AES-256-GCM backup path, encrypted private write/read-back, then a separate restore/decrypt comparison against the source bytes. A count alone cannot establish protection.
- Recheck current references after verification. If no current reference remains, purge the archive copy and count it stale, without deleting the source. Do not purge a shared archive while another current reference remains.
- Recheck the final manifest and fail the overall acceptance if any inventory change occurred. Partial, skipped, unreadable or failed files never produce passed=true. Re-preview after partial/changed results.
- No source deletions, profile mutations, credential review changes, session revocations, application consent changes or employer grants are performed. Archive replacement/purge follows the existing current-file retention policy, not historical-version retention.

Database and Blob operations are not one transaction. Concurrent writes, network interruption or function termination can leave partial results or an archive awaiting inspection; the apply flag is not a lock. Keep automatic hooks active or maintain the approved write pause, inspect results, and reconcile before declaring completion. Repeating a fresh reviewed plan is intended to be idempotent for unchanged current bytes, although encrypted objects can be rewritten with fresh nonces. Key custody, independent-provider recovery and automatic orphan sweeping remain separate responsibilities.

## Deployment and approval sequence

1. Complete local validation and deploy only the reviewed commit to staged Production using the established protected staging canonical URL and explicit `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED=false`. Keep the public live domain unchanged. This is a new Production-connected source revision and needs approval before deployment.
2. Privately enter the Production administrator key and run **Preview current Production files** with the known target fingerprint. Require the expected inventory; initially applyEnabled/canApply must be false. No real file transfer is authorised by the preview.
3. Resolve and verify the live-hook/write-pause dependency. Then review the exact current file kinds/counts, private destination, encryption/recovery custody, cleanup behavior and partial-result handling. Obtain explicit approval for real-document copying and any stale-archive cleanup.
4. Enable the separate apply gate only for that reviewed operational window, deploy the intended configuration, and generate a new preview. Re-enter the key and explicitly confirm the reviewed copy before applying. Do not use an expired or previous disabled-gate plan.
5. Require all eligible unique files decrypt-verified, zero failures/skips/stale purges, no inventory change, and expected private archives. Preserve source files and grants. Record results and any limits, then disable the apply gate for subsequent deployments after acceptance and retire/restrict older deployments that still have it enabled. Configuration changes do not revoke capabilities embedded in existing deployments. Do not promote a diagnostic build that still has its staging canonical URL.

The legacy `scripts/document-backup.cjs` remains **testing-only** for backfill. Do not point it at Production while labelling it testing. Production backfill is the distinct guarded operator workflow described here.
