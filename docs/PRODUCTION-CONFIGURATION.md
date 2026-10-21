# Production configuration — 21 October 2026

Status: approved production backup store created and eight Production-only Secret bindings saved by the operator, then verified through Vercel metadata. The operator also re-entered the live Neon database connection privately and saved `DATABASE_URL` as Production-only; the testing override remains. Activation and effective runtime connection/backup acceptance remain pending. No release deployed, migrations applied or live documents copied in this checkpoint.

## Provider identities verified in the consoles

- Neon project **BenchScout**, default branch **production**, database **neondb**; AWS US East 1, PostgreSQL 17, Free plan, six-hour history retention. This is distinct from **BenchScout Testing**. The effective Vercel Production connection has not yet been matched to this identity.
- Existing Vercel **benchscout-private-documents**: Private, IAD1, created 9 October, approximately 392 kB at inspection. Its Production token binding and current database references still need verification.
- With explicit action-time approval, created **benchscout-production-backups**, Private, Washington D.C. (IAD1), in the existing SHOLLY Hobby account. The console confirmed creation, Private/IAD1 and 0 B. It remains disconnected from automatic project injection and contains no copied documents. This destination is separate from testing and the source store. A store in the same account/region is not independent provider or regional disaster recovery.
- Operator approved a different Production alert inbox and saved the configuration privately. Testing retains its existing recipient. No Production alert has been sent in this checkpoint.
- Vercel metadata confirms eight new Secret entries scoped to **Production only**: private source token, administrator secret, salary-owner secret, backup token, encryption key, enabled, test-mode and alert inbox. The operator confirmed private entry/save; Vercel showed save success and that a new deployment is required. Prepared non-sensitive values were enabled=true and test-mode=false; saved secret values, key strength, token-store matching and recovery custody were not inspected. Existing database/cron/provider/canonical URL bindings remain untouched. Do not infer runtime acceptance from binding presence.

## Read-only normal database checkpoint after settings save

The normal local configuration connected to **neondb**. All seven repository migrations have completed history entries with exact SHA-256 checksums; no unexpected migration names were found. Aggregate inventory: two user records, one CV reference, one license reference and one avatar reference; all three use private Blob URLs, with zero public or other references. No file contents or individual records were printed and no records/files were changed. This does not establish the effective Vercel Production database identity or prove any archive has been written for these files. A matching database name alone is insufficient.

## Production-only configuration checklist

The [staged runtime acceptance plan](PRODUCTION-RUNTIME-ACCEPTANCE.md) now provides explicit Production diagnostics without enabling the testing backfill tool. The current live endpoint returned 404, so configuration presence must not be reported as runtime success. Staged deployment and QA-only operations await approval after validation.

Subsequent approved staging is now complete: corrected deployment `5xj9zsypDUgenQQ2kLA1pgkErTqB` is Ready/Staged with only a deployment-specific canonical staging URL override. The saved project/live URL and live-domain release are unchanged. Wrong-key authentication denial passed through the correct origin; valid-key connection and storage/alert checks are pending. This diagnostic build cannot be promoted with its staging URL configuration. See [current runtime checkpoint](PRODUCTION-RUNTIME-ACCEPTANCE.md).

### Follow-up verification and database handoff

The original `DATABASE_URL` was write-only and scoped to Production plus broad Preview, so metadata could not establish its destination. The operator completed the prepared private re-entry from Neon **BenchScout → production → neondb** and confirmed saving. Fresh Vercel metadata shows one Secret/Production binding updated just now and the separate Secret/Preview/testing override, with no broad Preview database default. Vercel explicitly confirmed update success and that a new deployment is required. The destination is operator-confirmed, not independently read from the saved secret or exercised by the current deployed app. No password reset, database mutation or deployment occurred. Previously deployed credentials are not revoked by this edit.

The backup store Connections page explicitly reports **No connections yet**. The Vercel project overview still shows the Ready Production deployment created 2 July from main commit `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`; the new backup configuration is not active there. No backup-runtime success is claimed. Store token identity, encryption-key validity, actual alert receipt and current-file archive verification require controlled operator/runtime acceptance after the approved activation sequence.

Use Vercel project **bench-scout → Settings → Environment Variables**. Review scope before each save: **Production only**, excluding Development and Preview/testing. Do not reveal existing values or copy credentials into chat, repository files, screenshots or evidence JSON. Changes affect a subsequent deployment; do not redeploy old main to activate them prematurely.

| Variable | Required value or operator action |
| --- | --- |
| `DATABASE_URL` | Privately verify the existing Production connection targets the intended BenchScout/neondb production branch. Preserve live records; do not use the testing database. |
| `BLOB_PRIVATE_READ_WRITE_TOKEN` | Privately copy the existing token for **benchscout-private-documents** into a Production-only binding. Do not rotate the store credential or automatically connect a store and overwrite generic bindings. |
| `ADMIN_SECRET` | New independent Production secret, at least 32 random characters, saved by the operator in a password manager. |
| `SALARY_OWNER_SECRET` | New independent stable Production secret, at least 32 random characters. Review historical ownership behavior before release; later changes can invalidate ownership proofs. |
| `CRON_SECRET` | Review existing Production binding and scheduling dependencies before changing it; do not silently rotate the shared value. |
| `BLOB_BACKUP_READ_WRITE_TOKEN` | Token for the newly approved **benchscout-production-backups**, never the test archive or source store. |
| `DOCUMENT_BACKUP_ENCRYPTION_KEY` | New 64 hexadecimal characters from 32 random bytes, distinct from testing. Operator retains a separate protected recovery copy; losing it prevents decryption. |
| `DOCUMENT_BACKUP_ENABLED` | `true` for the reviewed release only after source/archive/key configuration is ready. Missing or broken enabled backups cause new document uploads to fail closed. |
| `DOCUMENT_BACKUP_TEST_MODE` | Explicit `false`. The testing-only destructive drill/backfill controls must stay disabled in Production. |
| `DOCUMENT_BACKUP_ALERT_EMAIL` | Production recipient explicitly approved and prefilled privately; distinct from the testing alert inbox. No address is published in this runbook. |
| `NEXT_PUBLIC_APP_URL` | Verify the intended live canonical HTTPS origin and confirmation/reset redirect behavior; do not use the testing URL. |
| Mail and external providers | Review existing Production-scoped mail, AI and job-provider configuration without exposing values. Verify actual delivery after a scoped approved smoke test. |

The operator must enter and submit new authentication credentials privately. Review metadata afterwards using variable names/scopes and configuration booleans, never values. Automatic project connection is not needed for manually named custom Blob tokens.

## Activation and acceptance sequence

1. Obtain action-time approval for the prepared private backup store, then verify its name/access/region and leave it disconnected from automatic project injection. Prepare the Production-only credential form and hand it to the operator for entry/save.
2. Verify configuration metadata and effective database identity. Compare all seven migration histories/checksums, record a recovery point and review the exact migration plan before any mutation.
3. Inventory current live document references read-only. Prepare an explicitly guarded Production backfill extension and reviewed live-file plan. The current operator CLI accepts testing only; never mislabel a Production connection as testing. Legacy public-to-private migration performs permanent deletion and needs separate scoped approval.
4. Present exact release commit, migration steps, backup/rollback plan and remaining risks for final main/Production cutover approval. No QA records are imported.
5. After the approved deployment, verify protected synthetic upload/read, encrypted read-back, anonymous denial, alert inbox receipt and test-mode denial. Validate current-file backfill by decryption and counts. Restore into an isolated protected destination before any approved database reference repair; code rollback alone cannot restore deleted files.

See [main release readiness](MAIN-RELEASE-READINESS.md) and [document recovery](DOCUMENT-RECOVERY.md) for current evidence and recovery limits.
