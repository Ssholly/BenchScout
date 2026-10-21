# Private document recovery

## 21 October 2026 — Findings and prepared destination

Status: **recovery gap confirmed; destination creation awaiting action-time approval**. This is not an implemented backup integration or a passed file-restore drill.

Read-only source review found that `lib/documents.ts` stores private objects, while `app/api/upload/route.ts` commits a replacement before deleting its old object. Neither path writes a backup. Repository scripts and configuration examples contain no separate document-backup destination or recovery worker. The visible Vercel inventory included the private testing documents store and three existing stores; it did not show a named backup store. This does not exclude backups managed outside the inspected app/account.

[Vercel's official backup guidance](https://vercel.com/docs/vercel-blob/examples#backups), reviewed 21 October 2026, says Blob has no native backup system and describes separate continuous or periodic copies. Database recovery preserves references, not deleted file contents.

The operator first selected an existing destination, then clarified none was available and asked to create one. Prepared **benchscout-testing-backups**, **Private**, **Washington, D.C. (iad1)** in the existing Vercel Hobby account. No Create action has yet been submitted. The separate store will initially stay disconnected from all projects and contain synthetic test material only. No paid upgrade or real-document transfer is authorised by this preparation. Creating persistent storage credentials requires action-time browser confirmation.

This same-provider destination is for the first synthetic recovery drill. It does not isolate backups from Vercel-account loss, provider-wide outage or an administrator with access to both stores. Independent-provider/account backup remains a later operational requirement to evaluate before making disaster-recovery guarantees. No automatic backup or file-retention guarantee follows from an empty store.

## Intended synthetic acceptance procedure

1. Confirm the new destination is private, empty and distinct from the active test document store. Do not expose its token in chat, screenshots, repository or logs.
2. Use a new clearly labelled QA-only file unrelated to the retained candidate application. Record its byte count and SHA-256. Copy it to the private backup destination and verify authenticated retrieval and checksum before considering a loss test.
3. Obtain action-time approval for any irreversible source deletion. Do not delete the retained candidate CV, certificate or application merely to exercise recovery. If deletion is not authorised, record copy/read verification separately from loss/restore acceptance.
4. Restore the exact backed-up bytes into a new isolated private recovery location and compare size/hash. Test anonymous denial and authenticated read, without publishing a public URL or granting an employer access.
5. Keep source-file identity, current vault revision, document-sharing consent and deletion/revocation records separate from restored bytes. Do not restore a stale application grant, independent credential approval or revoked session. No production database reference is rewritten as part of this synthetic drill.
6. Document destination/source identities privately, scrubbed results in the repository, cleanup scope, retention owner and actual outcome. No recovery claim until the read/hash/access checks pass. Additional application integration and monitoring require separate implementation and validation.

## Integration requirements before real-document protection

- Choose retention, recovery point/time objectives and an accountable operator. User deletion, replacement, withdrawal and legal retention requirements need an explicit policy; do not silently keep all deleted private files indefinitely.
- Separate backup permissions from live application credentials. Do not expose a backup read/delete credential to candidate or employer clients. Evaluate application-side encryption and separate key custody; provider-managed storage encryption alone does not establish independence from account compromise.
- Use immutable object identities and authenticated integrity metadata. Avoid logging document bytes, raw private URLs or account identifiers. Record backup success/failure and retry state; an unmonitored scheduled copy is insufficient.
- A periodic snapshot can miss a file uploaded and removed between runs. Continuous capture requires deliberate handling of backup failure and upload latency; do not weaken current upload/consent behaviour through an untested side effect.
- Test restoration into isolation, reconcile later deletions/revocations, invalidate restored sessions and keep email/cron disabled before any recovery cutover.

No new screen, API, schema, environment variable, worker or product behaviour has been implemented by this audit. [Operations readiness](OPERATIONS-READINESS.md) retains the separate database-copy evidence.


## 21 October 2026 — Approved store creation and synthetic preview passed

After explicit action-time approval, created **benchscout-testing-backups** as a distinct **Private** Blob store in **IAD1** in the existing Hobby account. The console reported success and initially showed an empty store. No project connection, environment binding, token reveal, paid upgrade or real-document copy was performed.

Created and uploaded a new QA-only text fixture, independent of the candidate vault/application. The authenticated store preview displayed its complete non-personal content and size **231 bytes**. The visible preview text, encoded as UTF-8, had SHA-256 `ebfbf38a0948cb701794a63d2304c1e5822bce209f5da923409d92bcfc97253a`, matching the local source. This establishes successful private-store upload and authenticated preview text integrity. It does not establish arbitrary binary/PDF recovery.

The Download action did not yield a downloadable file through the browser tool before its ten-second event timeout; an ephemeral blank tab disappeared. No raw downloaded-byte checksum, anonymous HTTP denial, source-loss simulation or restore upload is claimed. No browser restriction was bypassed. The fixture and store remain for continuation; no candidate document/application was removed or replaced. Actual loss testing still requires explicit action-time deletion approval.

**Current status:** a private testing backup destination exists and synthetic upload/preview succeeded. Automatic backups, independent application-side encryption/key custody, retention enforcement, backup failure monitoring, binary retrieval and full loss/restore acceptance remain unimplemented or unverified. Creating this store does not begin protecting existing uploads. [Scrubbed evidence](qa/2026-10-21-document-recovery.json).

## 21 October 2026 — Automatic backup and isolated restoration implemented

This supersedes the earlier unimplemented-code status. **Implemented and locally validated; hosted activation and real-service loss/restore acceptance pending.** No production setting or migration changed.

### Upload, encryption and deletion

`lib/document-backup.ts` encrypts document bytes with AES-256-GCM, a fresh random nonce, a source-identity binding and an encrypted SHA-256 checksum. A distinct private Blob store receives the ciphertext under a non-identifying hash-derived path. Each enabled upload reads the archive back, authenticates/decrypts it and compares exact bytes before `storeDocument` returns and before the user's vault metadata is committed. Failed backup operations retry three times with bounded delays, then fail closed with HTTP 503. The unsuccessful new live object and any uncommitted backup receive cleanup attempts. No new successful-upload claim follows from a failed backup.

Automatic means **continuous backup on new upload**, not a scheduled job. Existing files are not silently copied: the operator backfill tool below is required for previously uploaded current documents. No cron setting was added.

Retention is **current-file-only**: explicit document deletion and replacement cleanup purge the matching archive. Withdrawal removes an application grant, not the candidate's current vault file; its backup does not grant employer access. Backup purging still runs with configured backup credentials after new backup writes are disabled. Purge failure blocks the normal deletion path and raises an operational failure; old-file replacement cleanup remains best effort and can leave orphaned objects requiring private operator cleanup. There is no age-based retention sweep or guarantee that failed cleanup has completed. Do not disable/remove credentials to bypass a purge failure.

Failures log a structured `document_backup_failure` event with the operation only, omitting provider exception data/URLs/tokens. If `DOCUMENT_BACKUP_ALERT_EMAIL` is configured, the existing mailer sends an operational message containing no document data. Failed mail logs `document_backup_alert_failed`. Operator approval for the testing recipient is recorded privately in the conversation. Unit tests verify the send path; real inbox delivery has not yet been established. Alerts are per failed operation; distributed deduplication and independent out-of-band failure monitoring are not implemented.

### Configuration

All are server-only variables. In Vercel, scope these **only to Preview / testing branch**, then redeploy. Never overwrite the existing live `BLOB_PRIVATE_READ_WRITE_TOKEN` or generic `BLOB_READ_WRITE_TOKEN`.

| Variable | Meaning |
| --- | --- |
| `DOCUMENT_BACKUP_ENABLED` | `true` enables the upload protection hook; default/off when absent. |
| `BLOB_BACKUP_READ_WRITE_TOKEN` | Token for the distinct private backup store, entered privately by the operator. |
| `DOCUMENT_BACKUP_ENCRYPTION_KEY` | Exactly 64 hexadecimal characters, representing 32 random bytes; privately entered and saved separately in a password manager/recovery vault. |
| `DOCUMENT_BACKUP_ALERT_EMAIL` | Explicitly approved operator inbox; omitted means structured hosting logs only. |
| `DOCUMENT_BACKUP_TEST_MODE` | `true` enables the restricted synthetic tool outside Production. Disable after the acceptance window. |

The token must differ from the live-store token; archive writes also reject a returned hostname matching the source store. `access: private` is explicit on all reads/writes. These checks do not establish account/provider independence. Keep the encryption key outside the hosting account as well: losing it makes archives unrecoverable. No automatic key rotation/re-encryption exists; do not replace the key until retained archives have been safely re-encrypted and verified. No secret values or provider token were read/generated into chat or committed.

### Restricted operator screen and API

- `/admin/backups`: password-style administrator entry, configuration check and separately labelled synthetic loss/restore action. Secret clears after each request. No credential is stored in local storage.
- `POST /api/admin/document-backups`: existing administrator-secret, same-origin and rate-limit middleware. `action: status` reports booleans only, not secret values or file references.
- `action: synthetic-restore` additionally requires `confirm: DELETE QA ONLY`, enabled backup/test flags and a non-Production environment. It creates a new QA-only private source, backs it up, deletes that source, verifies its absence, decrypts the archive, writes a separate isolated private restoration, reads and compares the exact bytes, then submits deletion of just those generated recovery objects/archive. It never reads candidate files or changes database rows, application selection, credential approvals or sessions. Returned evidence includes checks, size/hash and `cleanupSubmitted`; provider deletion propagation is not independently confirmed by that field.
- Failure preserves enough private QA objects for investigation; no successful recovery result is returned. Inspect the `qa-recovery/` and corresponding archive paths privately before scoped cleanup. Operator action-time confirmation covers irreversible deletion of newly generated QA files, not real candidate objects.

### Operator backfill and real restoration tool

`npm run documents:backup -- backfill --confirm-target testing` is dry-run by default. Supply **dedicated testing** credentials through an operator-controlled private environment and set `DOCUMENT_BACKUP_OPERATOR_TARGET=testing`; the script deliberately does not load the normal local `.env`. Add `--apply` only after approving the current documents/destination. It selects current vault fields, backs up/verifies each private object and rechecks its current reference; if replaced/deleted during the run, it purges the stale backup. Output contains counts only. Do not run a backfill against a restored database before reconciling later deletion/withdrawal restrictions. Scope confirmation is an operator assertion, not automatic proof of the database's provider project identity.

`npm run documents:backup -- restore --source-file /protected/source-url.txt --output-dir /protected/recovery` decrypts the selected archive into `restored-document.bin` in a directory with mode 0700 outside the repository, using exclusive creation and mode 0600. The source-file contains the private original object reference and must be supplied privately. The tool authenticates integrity and reports size/hash without logging the URL or contents. It **does not rewrite any database reference** or regrant employer access. Real-document restoration, identity/retention reconciliation and any later cutover need a separate scoped operator procedure. Keep restored plaintext protected and remove it through the approved retention process.

The CLI uses the installed TypeScript compiler, so operator tooling requires the development dependencies; it is not a new public API or background service.

### Validation and remaining acceptance

Lint, TypeScript, all **230 tests** and the webpack production build passed. Ten new focused tests exercise randomized binary encryption, wrong key/source and tamper rejection, size/source validation, private read-back, transient/persistent failures, alerts, purge after disabling new backups, administrator/Production gates and the complete synthetic loss/restore path against an in-memory Blob adapter. This is real cryptography/control-flow validation, **not hosted provider acceptance**. Built `/admin/backups` rendered at 320px with document width 320px and all controls inside the viewport. CLI syntax and diff checks passed. No schema/migration added.

Prepared five Secret variables in the Vercel form with **testing only** selected; token and key remain blank for private operator entry. This form is not yet saved. Hosting activation, existing-file backfill, real-provider synthetic loss/restore, anonymous denial and recipient-confirmed alert delivery remain pending. Documentation must record those outcomes separately before declaring backups running or full restoration passed.


## 21 October 2026 — Operator saved testing credentials; redeployment pending

The operator reported Save after private entry. Fresh Vercel metadata showed all five new variables as **Secret**, scoped to **Preview / testing branch only**. Values were not revealed or read back; this does not establish key strength, equality, correct token/store ownership or successful backup. Vercel explicitly requires a new deployment to apply the saved variables. This documentation checkpoint triggers that testing deployment; hosted configuration/provider checks remain pending. No production binding or schema change.
