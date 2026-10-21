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
