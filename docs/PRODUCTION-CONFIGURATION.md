# Production configuration — 21 October 2026

Status: approved production backup store created; private operator credential entry/save pending. No Production environment settings were saved, release deployed, migrations applied or live documents copied in this checkpoint.

## Provider identities verified in the consoles

- Neon project **BenchScout**, default branch **production**, database **neondb**; AWS US East 1, PostgreSQL 17, Free plan, six-hour history retention. This is distinct from **BenchScout Testing**. The effective Vercel Production connection has not yet been matched to this identity.
- Existing Vercel **benchscout-private-documents**: Private, IAD1, created 9 October, approximately 392 kB at inspection. Its Production token binding and current database references still need verification.
- With explicit action-time approval, created **benchscout-production-backups**, Private, Washington D.C. (IAD1), in the existing SHOLLY Hobby account. The console confirmed creation, Private/IAD1 and 0 B. It remains disconnected from automatic project injection and contains no copied documents. This destination is separate from testing and the source store. A store in the same account/region is not independent provider or regional disaster recovery.
- Operator approved a different Production alert inbox; it is prepared privately in the form. Testing retains its existing recipient. No alert has been sent in this checkpoint.
- Prepared eight Secret entries scoped to **Production only**: private source token, administrator secret, salary-owner secret, backup token, encryption key, enabled=true, test-mode=false and the approved alert inbox. Five sensitive values remain blank for private operator entry. The form has not been saved. Existing database/cron/provider/canonical URL bindings remain untouched.

## Production-only configuration checklist

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
