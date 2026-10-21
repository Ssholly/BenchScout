# Private document recovery

## 21 October 2026 — Approved public containment activated

The owner explicitly approved the temporary public-app pause. Reviewed containment `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f` is Ready as [Production deployment 3JSXjPv2JjgTBNE3gwXVSiqJFTaV](https://vercel.com/sholly/bench-scout/3JSXjPv2JjgTBNE3gwXVSiqJFTaV); provider audit/Git metadata both match. Only the public `bench-scout.vercel.app` domain was intentionally assigned to containment. Vercel temporarily auto-assigned the generated team alias during skip-domain staging; it was restored to the existing protected diagnostic deployment before public activation. Fresh alias lookup confirms diagnostics remains `dpl_12r5Zwn4tyffsUTnH3YF9tMrNqXh`; testing retains its independently updating testing alias. The protected git-main alias still targets July source, so this is **not** global write revocation.

Public browser review displays the branded update notice. Ten safe hosted method/path checks passed terminal 503, no-store, Retry-After and expected notice/JSON. These include upload GET/POST/DELETE, reset POST, setup POST, cron OPTIONS and debug-email POST. Dangerous legacy setup/debug GETs were not invoked. No database/storage mutation, migration, real-file copy/deletion, session/credential change, main merge or old-deployment deletion occurred. Sign-in, applications, uploads and public-domain dispatch are paused until the compatible hardened release; no reopening time is certified. Historical callers on other protected URLs are outside this pause. [Exact scope and next deletion-reconciliation gate](LEGACY-CONTAINMENT.md); [evidence](qa/2026-10-21-legacy-containment.json).


## 21 October 2026 — Legacy containment prepared; failure checks advanced

A separate reviewed containment branch `hotfix/legacy-containment`, commit `336c6ed`, removes every legacy app/API route and returns terminal HTTP 503 with a branded update notice. Twelve focused tests, strict scoped TypeScript/lint, webpack build, 70 built HTTP method/path cases and 320/390px layout checks pass. The branch is pushed, but public activation is pending explicit approval because it temporarily pauses all public workflows. No main merge, public alias change, database/storage mutation or old-deployment deletion has occurred. Containment does not block authorised access to historical immutable deployments or establish a global write pause.

In parallel, six meaningful upload/delete fault-boundary tests pass; the full hardened application suite is now 257 passing tests. Physical-delete/metadata atomicity and durable reconciliation remain open, not certified by mocks. [Containment contract and impact](LEGACY-CONTAINMENT.md); [structured evidence](qa/2026-10-21-legacy-containment.json).


## 21 October 2026 — Hosted Production metadata preview passed

The operator supplied the exact successful response from the protected `64e2f83` stage: dryRun=true, eligibleReferences=3, uniqueFiles=3, blockedReferences=0 and inventoryReady=true. The current inventory is one CV, one practising licence and one profile image; every other supported kind is zero. This agrees with the independently queried aggregate inventory. applyEnabled=false and canApply=false confirm the disabled copy gate. The response reports fileContentsRead=false, businessRecordsChanged=false and applicationGrantsChanged=false. Evidence is the operator-reported response, not an independently captured result screen. Operational rate-limit bookkeeping is outside the business-record claim.

No real files have been copied or decrypt-verified by this backfill. The returned preview expiry is `2026-10-21T15:24:35.699Z`; it is not a reusable copy approval or enabled plan. Next: prepare/review the live release and rollback plan, verify current backup lifecycle hooks on the public app (or an explicitly approved enforced write pause), then obtain fresh inventory and explicit real-file copy approval. Keep apply disabled until that prerequisite is resolved. Do not directly promote the diagnostic build with its staging canonical URL. [Workflow](PRODUCTION-DOCUMENT-BACKFILL.md) and [structured evidence](qa/2026-10-21-production-backfill.json).


## 21 October 2026 — Guarded Production file preview staged

After explicit operator approval, source `64e2f83c62d7c81b3905cdc075793255b8e7d186` was deployed from its clean detached checkout using `--prod --skip-domain`. [Deployment 12r5Zwn4tyffsUTnH3YF9tMrNqXh](https://vercel.com/sholly/bench-scout/12r5Zwn4tyffsUTnH3YF9tMrNqXh) is Ready, protected by Vercel authentication. Provider audit/Git metadata both match the reviewed commit. Build/runtime overrides retain `NEXT_PUBLIC_APP_URL=https://bench-scout-sholly.vercel.app` and explicitly set `DOCUMENT_BACKUP_BACKFILL_APPLY_ENABLED=false`.

The hosted older-file section and verified fingerprint field were inspected and prepared at the protected staging alias. At that preparation checkpoint the metadata preview had not yet been submitted; the newer acceptance above records its result. No file bytes were read or copied, and no business records or sharing grants were changed. A fresh provider alias lookup confirms `bench-scout.vercel.app` still points to `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ` (`bench-scout-jedrpyruu-sholly.vercel.app`). No main merge or public promotion occurred. Live-hook/write-pause dependency remains required before any real-file copy; do not promote this staging-canonical build. See [backfill workflow](PRODUCTION-DOCUMENT-BACKFILL.md).


## 21 October 2026 — Older-file copy prepared with live-write gate

Fresh metadata-only inventory covers all eight supported kinds and still finds three distinct current private files (CV, licence, avatar). Added the [Production backfill workflow](PRODUCTION-DOCUMENT-BACKFILL.md): signed, expiring previews bound to the verified target/configuration/current references, explicit copy consent, private decrypt verification and concurrent replacement checks. The independent apply flag defaults off: old public upload/deletion code must be replaced with the new backup hooks or subject to a reviewed enforced write pause before real copying. No real file bytes were read or copied and no new staged revision has been deployed at this preparation checkpoint.

## 21 October 2026 — Staged Production runtime acceptance complete

Using the approved staged source and saved Production services, correct-key readiness matched the intended database fingerprint. The operator-reported 85-byte QA canary passed encrypted backup, verified source loss, exact decrypted bytes and restored private read-back. Fresh provider listings independently showed the archive store empty and no `qa-recovery/` source objects. The labelled Production alert was submitted and the approved recipient confirmed receipt. No older real files were copied; the public live release remains unchanged. [Runtime acceptance](PRODUCTION-RUNTIME-ACCEPTANCE.md) distinguishes reported storage output, observed cleanup and actual inbox confirmation. Guarded real-file backfill and live release remain separate.

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


## 21 October 2026 — Testing redeployment succeeded; operator check prepared

Credential-save checkpoint `b7370c7` reached the testing alias through successful Vercel deployment `EQQwtr3UW2XhdEVBk9z2cSLKY1Ne`. The hosted `/admin/backups` screen loaded, and a deliberately invalid administrator key returned Unauthorized without storage work; the key field cleared. Reloaded the fresh deployment and handed the clean form to the operator for correct-key configuration and QA-only loss/restore execution. Configuration booleans, backup-provider token/key correctness and recovery results are not yet claimed. No real file or database row was changed in this checkpoint.


## 21 October 2026 — Hosted synthetic loss-and-restore passed

The operator completed the correct-key configuration/restore actions and reported success. Independently observed the full successful JSON result in the authenticated hosted operator screen: `passed`, `sourceLossVerified`, `decryptedBytesMatch` and `restoredPrivateReadMatches` were all true. The generated QA-only file was **85 bytes**, with SHA-256 `feee65cee1c34e5726406574fd5bb6feacc6eca1ec005bc64410b27dd7e232e2`. `databaseChanged` and `applicationGrantsChanged` were false. The administrator secret had cleared. This is real provider-backed source deletion, archive decryption, isolated restoration and private read-back, not the earlier preview-text-only check or a mocked test.

The pass demonstrates the enabled upload-backup primitive can write/read a distinct private archive with the configured encryption key and test-mode flag. Continuous backup is enabled for **new testing uploads** through the previously tested `storeDocument` hook. A normal hosted candidate upload through that hook has not yet been independently exercised since activation. Existing documents uploaded before activation still need an approved backfill; no real files were copied during the probe.

`cleanupSubmitted: true` records accepted deletion calls for the generated restored object/archive; independent provider inventory checks are recorded separately below if completed. The earlier 231-byte manual preview fixture is unrelated and remains retained. End-to-end failure-alert inbox delivery, anonymous backup-object denial, old-file backfill, key-custody recovery, production enablement and independent-provider disaster recovery remain open. No full service cutover, restored database grant or production recovery guarantee follows from this single synthetic case.


Cleanup follow-up: fresh authenticated Vercel prefix searches showed **no matching objects** under `qa-recovery/` in the testing document store and `document-backups/v1/` in the intended backup store. These observations support completion of this probe's source/restoration/archive cleanup in the inspected stores. The unrelated 231-byte manual fixture remains; no active candidate vault file was deleted. The empty archive prefix also reinforces that earlier candidate files have not been backfilled.


## 21 October 2026 — Hosted backfill and alert-test controls implemented

Added two administrator actions to the existing screen/API so the acceptance checks can use saved server credentials without revealing them to an operator shell or chat. Both require the existing administrator authentication, test-mode flag and non-Production environment. No new environment variable, schema/migration or credential was added.

- `action: synthetic-backfill` / **Backfill older QA files** is fixed to the existing synthetic acceptance candidate's ID and expected QA-only name. Caller-supplied account IDs, URLs and destination fields are ignored. Only that fixture's current private vault references are considered; missing fields and earlier replaced/deleted references are not traversed. Each eligible file is read privately, encrypted/backed up, decrypted and compared, then rechecked against the current vault reference. If changed during the run, its stale archive is purged and is not counted as protected. Results contain aggregate counts, not file URLs or contents. A missing/ambiguous fixture returns 409 before copying. No user/application record or sharing selection is rewritten. This is **synthetic testing acceptance only**, not a backfill of every testing/production account.
- `action: test-alert` / **Send test backup alert** sends a clearly labelled QA-only test to the existing configured approved inbox. It uses the same `sendBackupAlert` helper and mailer transport as genuine backup failures, without inducing a failure or including document/account data. The request cannot supply another recipient. The response reports provider submission only; inbox receipt still requires recipient confirmation. Missing recipient or failed transport returns 503 without a delivery claim.

The operator screen now separates these two checks from the repeatable destructive canary drill, which is collapsed by default, and uses compact responsive cards/controls. The shared secret still clears after every action. Lint, TypeScript, all **235 tests** and webpack production build passed. Five additional cases cover fixed-account backfill, real byte comparison, concurrent replacement cleanup, disabled/Production guards, configured-recipient mail submission and delivery-error handling. Deployment and hosted results follow separately. No existing file has yet been backfilled or test alert submitted by these newly implemented actions.


Deployment follow-up: `13310fc40d34c269a333d088cb3af2df537af56f` reached the testing alias through successful Vercel deployment `GLtdVkt4f7q6b4ctzrijZiyAVoAw`. Hosted screen exposed the two labelled controls; at 320px the document width was 320px and each measured control ended at x=289, inside the viewport. Viewport reset. Prepared private administrator entry for backfill and the single approved test-alert submission. No backfill count or inbox receipt is yet claimed.


## 21 October 2026 — Backup alert inbox delivery passed

The operator ran Send test backup alert. Independently observed the hosted response `alertSubmitted: true`, `documentDataIncluded: false`, with receipt explicitly awaiting recipient confirmation. The operator then confirmed the labelled message arrived in the approved inbox. This closes the actual inbox-delivery acceptance for the shared backup-alert mail path; it is not inferred from submission alone. No failure was induced or file/account content sent. The secret field cleared. No alert resend is required.

The same response replaced any earlier backfill output. Eligible/verified/failed counts have not yet been captured or independently observed, so older-file backfill remains unverified. Prepared an idempotent backfill rerun, without another email, for the operator to capture its result. No new product code, schema, environment or production change.


Backfill retry checkpoint, 21 October 2026: the operator's next attempt returned Unauthorized, independently observed on the hosted screen. Source inspection confirms the administrator-secret check runs before the handler/storage operation, so this rejected request copied no files and provides no backfill count. The key field had cleared by design. Prepared private re-entry of the existing testing administrator key, leaving submission to the agent after the operator reports ready. No key was inspected, retrieved or rotated; no safeguard or product code changed. The already confirmed alert delivery remains passed.


## 21 October 2026 — Older synthetic-file backfill passed; both checks complete

After the operator privately re-entered the existing testing administrator key, submitted only **Backfill older QA files**. Independently observed the hosted result: **eligible 2, verified 2, stalePurged 0, failed 0, skipped 0, passed true**. The two current private synthetic vault files were read, encrypted into the backup store, decrypted/compared and checked against current references. The administrator input cleared after completion. `databaseChanged` and `applicationGrantsChanged` were false. No file replacement/deletion, new account, application update or extra alert was requested in this successful rerun.

Together with the already recipient-confirmed labelled alert, this completes both requested checks **for the fixed synthetic candidate in testing**. The encrypted archives are intentionally retained to protect those current files. Replaced/deleted references were outside the backfill query; no real testing account or production account was copied. This does not establish a backfill of every older file in either environment, nor Production activation. Normal hosted upload acceptance, anonymous backup-object denial, independent key custody/provider recovery and broader promotion gates remain separate work. The earlier rejected request and pending checkpoints above are preserved as dated history.


## 21 October 2026 — Normal hosted upload and anonymous backup denial passed

Confirmed the synthetic candidate identity and an empty degree-document slot in the hosted vault. Uploaded a reused synthetic-only PDF under the explicit QA filename `QA-ONLY-automatic-backup-upload.pdf` (659 bytes, SHA-256 `1bd201f4d02fbd95819e5adc23d6ae956bb2b26dda419070168cfae7dcc25c5f`). No existing file was replaced or deleted, no real degree/qualification claimed, no independent review submitted and no AI request made. The normal candidate upload finished successfully, persisted through a full reload and rendered the known synthetic PDF through the guarded owner preview. With the previously verified enabled setting, this path calls the compulsory archive/write/read-back verification before committing new vault metadata.

The intended backup store's `document-backups/v1/` directory showed three encrypted objects; the newly modified object was 723 bytes, matching the new 659-byte PDF plus the 64-byte authenticated envelope. Performed one direct unsigned HTTP GET to that observed encrypted object's address using curl with its default configuration disabled and no credentials/cookies: **HTTP 403**, 10-byte error response. No backup plaintext or ciphertext was obtained. The private address and object identifier are omitted from repository evidence. This is an observed raw Blob HTTP denial, separate from the earlier browser-blocked application-document checks; no browser warning/block was bypassed.

Applied still showed the existing single pending application and CV-only selection; the new degree slot did not change its sharing record. The synthetic candidate now has three current QA vault files and corresponding retained archives. The earlier two-file backfill result remains correct for its earlier checkpoint. No cleanup deletion was performed. This closes normal hosted upload and anonymous backup denial in the recorded synthetic scope. Production bindings/backfill and wider main-release gates remain separate; see [current release readiness](MAIN-RELEASE-READINESS.md).
