# Main release readiness — 21 October 2026

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

1. Review the missing Production bindings and effective database/store identities with the operator; prepare concrete, separately scoped configuration forms before requesting any new access/credential approval.
2. Resolve the remaining hosted identity/recovery, cross-account denial/idempotency, interrupted-request and scheduler operations cases against the dated audit checklist. Keep provider-blocked results separate from observed HTTP denials. Refresh the legacy live-file inventory and migration-history evidence read-only.
3. Prepare the live backup/migration/backfill and rollback plans with counts, ownership and explicit approval boundaries. Registration/name/domain/service arrangements remain parallel business work from the proposal; their current completion was not verified in this technical pass.
4. Present the exact release commit, migration/configuration steps, smoke checks and remaining risks for final main/Production approval. A testing success alone does not authorise that cutover.

Evidence: [document recovery](DOCUMENT-RECOVERY.md), [hosted recruitment](HOSTED-EMPLOYER-ACCEPTANCE.md), [operations readiness](OPERATIONS-READINESS.md), [launch audit](LAUNCH-AUDIT.md), [deployment history](DEPLOYMENT.md).
