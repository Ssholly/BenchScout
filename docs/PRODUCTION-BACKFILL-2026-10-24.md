# Production older-file backup window — 24 October 2026

Status: **completed**. All three current private files were copied into the encrypted Production archive and decrypt-verified. The temporary copy-enabled deployment is retired.

The owner instructed proceeding with the three-file backup priority. Unlike the 21 October checkpoint, the public pilot now serves hardened upload/cleanup code. Live source 6bd5721 calls mandatory encrypted backup/read-back before committing uploads when backup is enabled; replacement/deletion records detached-source cleanup and removes associated archives through the durable queue. Prior runtime checks and hosted synthetic lifecycle checks are recorded separately; code inspection is not a new real-file upload test.

A fresh operator-run preview against the independently accepted Production fingerprint reports exactly three current private files (CV, practising licence, profile image), zero blocked references, unchanged business records/grants and no file bytes read. The public copy gate remains disabled. [Structured evidence](qa/2026-10-24-production-backfill-window.json).

## Operational plan

Use the exact tested live source in the original Vercel project. Prepare a protected diagnostic deployment with its diagnostic canonical origin, no cron definitions, backup enabled, test mode off and backfill apply enabled only in this temporary deployment. Do not promote it to the public domain or change persistent project environment values. Verify readiness, protection and unchanged public alias before assigning the established diagnostic alias.

Privately entered Production ADMIN_SECRET is required for a new 15-minute signed preview. Require the same three-file inventory, no blocked references and canApply=true. Re-preview if counts/configuration/manifest change. The operator confirms the reviewed current-file copy and removal of a newly stale archive if concurrent vault changes detach its source. Source files are not deleted. Copy into the existing separate private Production archive using AES-256-GCM, read back, decrypt and compare bytes; require verified=3, failed/stalePurged/skippedChanged=0, inventoryChanged=false and passed=true.

After acceptance (or a failed attempt), restore the previous gate-disabled protected diagnostic alias and retire the temporary enabled deployment so its immutable URL cannot retain the copy capability. Preserve public/testing/maintenance aliases and inspect cron registration because staged builds must not displace the public schedule. Record actual results separately. This operation does not constitute a full database/application restoration drill, independent-provider protection or a new recovery-time guarantee.

## Prepared protected copy window

Temporary deployment **dpl_H7oT6LPw6ndc2DhESJJU78ZTAB6v**, immutable host `bench-scout-91t2937c3-sholly.vercel.app`, is Ready with exact live source metadata and was unmapped before assigning only `bench-scout-sholly.vercel.app`. Vercel reports authentication protection. All non-diagnostic aliases match the prior map. Public cron registration remains attached to EA6 at `17 2 * * *`; protection is `all_except_custom_domains` with zero bypasses. No project-level environment value was changed. The existing Production key must be entered privately by the operator to generate the fresh enabled-gate plan and perform the copy.

A read-only request-log query for the cleanup path over the previous 24 hours was rejected by Vercel: request history older than 12 hours requires an additional paid entitlement. No upgrade was performed, and no scheduled-execution pass is inferred from the configured schedule. The alternative 24-hour runtime-log lookup was also rejected because the requested range is outside Hobby retention. Actual scheduled execution remains unverified; no worker was invoked and no paid entitlement was purchased.

## Completed copy and closed window

The operator submitted the reviewed copy and supplied its exact successful response. Independently observed the same result in the protected browser status: **verified=3, failed=0, stalePurged=0, skippedChanged=0, inventoryChanged=false, passed=true**. The inventory remained one CV, one practising licence and one profile image. `businessRecordsChanged=false` and `applicationGrantsChanged=false`. This verifies read-back/decryption comparison for these three current files; it is not merely a count of uploaded archive objects. Source files were retained and no stale archive purge occurred.

Restored the previous gate-disabled diagnostic **dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg** to the diagnostic alias, verified the temporary deployment had no aliases, and removed only **dpl_H7oT6LPw6ndc2DhESJJU78ZTAB6v** using safe deployment removal. Subsequent provider lookup returned **404 Deployment not found**, closing that immutable URL's enabled copy capability. All five aliases match the pre-window mapping; public remains EA6, testing remains 4qrt, git-main remains 3JS maintenance, and retained hotfix remains EcY. Public cleanup registration remains EA6 at `17 2 * * *`; protection remains unchanged and bypass count is zero. Encrypted archives are intentionally retained; no persistent project environment value was changed.

The earlier three-file backfill gap is closed for this accepted inventory. Automatic upload backups protect subsequent uploads through the live hooks. Actual scheduled cleanup execution remains unverified due provider log-retention limits; a full database/application/document restoration drill and measured recovery time remain separate. No main merge, schema migration, new account, document sharing change, new test email or paid upgrade occurred.
