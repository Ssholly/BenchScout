# Isolated recovery rehearsal — 27 October 2026

## Result

**Passed the bounded testing scenario:** one isolated database copy, three restored synthetic private documents and real HTTP access decisions through the same local restored application. This closes the previously missing integrated testing recovery evidence. Production was not targeted. It is not a full Production disaster-recovery certification.

Evidence: [structured results](qa/2026-10-27-recovery-drill.json). Operator helper: `scripts/recovery-drill.cjs`. The helper executed actual reviewed application source **4eb3e2c8486cb8532aa400106d1bc306c9c8cb5a**, without test database/mail mocks.

## Database and credentials

The owner-created `qa-full-recovery-20261027` branch in BenchScout Testing was independently verified as `br-round-mountain-b7uzwvyd`. Provider creation: **27 October 08:24:05 Lagos**; automatic expiry: **28 October 08:24:04 Lagos**. The branch copied current testing data/schema; it was not a historical point-in-time recovery. The misleading parent name `production` belongs to the Testing project, not the live BenchScout database.

Expired copied sessions, confirmation links and password-reset links only in this recovery branch. SQL and subsequent Prisma readback found zero active copied credentials. All nine migration checksums matched; expected QA records, closed vacancy, suspended employer and application relationships remained intact. Existing testing source records and Production were not mutated.

Private operator entry succeeded after origin-header and field-error corrections. The helper checked the exact new database hostname/database and the distinct testing source/backup store identities before any provider operation. It used an owner-only temporary credential file, and never printed its values. That file and the ephemeral TLS private key were removed after execution; the private entry server, local application, HTTPS proxy and local SMTP-denial listener were stopped. Generated test sessions were revoked/expired in the recovery copy.

## Synthetic document restoration

Decrypted the existing encrypted testing archives using the saved testing key and the production backup implementation. No current source document was read as a recovery shortcut, deleted or replaced.

| File kind | Recovered bytes | Integrity evidence |
| --- | ---: | --- |
| CV | 680 | Authenticated envelope, prior recorded fixture SHA-256, private readback and application HTTP bytes matched |
| Degree | 659 | Authenticated envelope, prior recorded fixture SHA-256, private readback and application HTTP bytes matched |
| Additional certificate | 659 | Authenticated envelope, private readback and application HTTP bytes matched; no separate prior per-slot fixture hash was available |

Created exactly three new private PDFs in the existing testing documents store under a unique `qa-full-recovery/20261027/` child prefix. The private old/new URL manifest remains outside Git with restricted permissions; raw URLs and account identifiers are excluded from repository evidence. Unsigned direct object requests returned HTTP 403 for every restored object.

Updated only the synthetic candidate's three current file references inside the disposable recovery database. Existing application selections were compared by exact source identity; the replacement CV was not substituted into the old selection, optional documents were not newly shared, and effective sharing stayed empty. Original encrypted archives remain unchanged. Cleanup of the three newly restored QA files is pending scoped owner approval; no new archive was created for those disposable files.

## Restored application acceptance

Used the isolated optimized production-mode app, with no `.env` files and a minimal child environment containing only recovery/testing credentials. A loopback HTTPS proxy and certificate-pinned Node client exercised actual application routes; no browser security warning was bypassed. The proxy limited traffic to the required page, login/logout, session, document, pipeline and exact QA-vacancy roster reads. No email provider credentials, AI credentials, cron/admin secrets or scheduled trigger were supplied. A local mail-denial listener recorded **zero attempts**.

Verified candidate password login, secure HttpOnly session cookie, authenticated session, and exact owner-served bytes for all three documents. Anonymous session/document requests returned 401; requests for another existing account's documents returned 403. A newly seeded expired synthetic token returned 401. This expiry probe was not a replay of an actual copied plaintext cookie; copied credentials were separately expired and checked in SQL.

The suspended QA employer was tested using a short-lived server-seeded session, not a password login or restored company approval. Its document and applicant-roster requests returned 403. The candidate's closed-vacancy application remained in history; closure, employer suspension and revoked replacement-file sharing stayed intact. Logout succeeded and the old cookie was rejected. No new withdrawal/reapplication cycle was performed in this drill.

## Timing and limits

The automated combined restoration/HTTP run started **08:39:18.901 Lagos** and finished **08:39:59.739 Lagos**: **40.838 seconds**. It included archive validation, private writes/readback, recovery-copy remapping, local app startup, access checks and shutdown. Separate initial read-only database/archive validation had already passed at 08:36:54 Lagos.

Provider branch creation to combined-run completion was **15 minutes 54.739 seconds**, including private entry, operator waiting and helper preparation. No agent pre-create timer or individual operator-wait measurements were captured; do not present this as an independently measured full recovery SLA or a 41-second Production RTO. The earlier 24 October attempt remains incomplete historical evidence.

This exercise covers a current testing snapshot and three synthetic current file slots. It does not establish restoration of all real users/files, arbitrary historical versions, hosted Vercel failover, interactive/mobile recovery, a region/account/provider outage, or loss of the encryption key. Sources/backups share the same provider account. A Production rehearsal needs a separately reviewed scope and measured recovery objective.

## Remaining close-out

1. Obtain scoped authorization and remove only the three restored QA PDFs; retain source files and encrypted archives. Let the disposable database expire under its existing one-day setting.
2. Verify an actual automatic cleanup run with recorded evidence; this drill did not invoke or prove the hosted schedule.
3. Integrate reviewed source into main under deployment safeguards, then return to employer pilot materials and onboarding. No main merge or public release is part of this rehearsal.

## Approved cleanup completed — 27 October

Owner explicitly approved detaching and permanently deleting only the three restored QA PDFs. In the independently verified recovery branch, executed a transaction guarded by the testing database name, exact unique recovery prefix on all three fields and absence of application selections pointing to that prefix. Post-commit readback: one QA fixture with all three restored references detached; zero active recovery sessions; one retained application. No source testing or Production database was used.

In benchscout-testing-documents, filtered to the approved unique prefix and compared all three displayed object paths to the private restoration manifest before selection. The provider deletion dialog contained exactly the approved CV (680 bytes), degree (659 bytes) and certificate (659 bytes). Submitted only that deletion, then observed **There are no blobs that match your search** for the exact prefix. Original testing documents and encrypted archives were not deletion targets. The recovery branch retains its existing automatic expiry; it was not manually deleted. Temporary credentials are already removed, services stopped, and this rehearsal is closed with the scenario limitations above.
