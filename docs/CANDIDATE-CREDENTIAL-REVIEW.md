# Candidate credential review

Implemented 19 October 2026 for LA-11. This replaces the historical read-then-update candidate review branch. [Deployment](DEPLOYMENT.md) separates schema application, local validation and hosted code status.

## Review workflow

In Trust and credential reviews (`/admin/reviews`), choose Candidate license, enter the account email and load the current candidate evidence. The administrator sees the name, professional stage, registration number, recorded expiry, private-file availability, current-review status and credential revision. Download private credential evidence through the authenticated control, inspect it, independently confirm the registration/validity, record both checks and identify the reviewer. Approval requires a current private credential and valid registration metadata; rejection/revocation requires a reason and loaded revision but can proceed when the document is missing.

Licensed candidates use practising-license evidence and a future recorded expiry. Interns use provisional-license evidence and provisional registration details; provisional expiry remains optional under the existing product policy, but any provided date must be valid and future. File upload, AI extraction, account email confirmation and professional-stage selection are not independent credential approval. There is no new MLSCN registry integration or automated authenticity guarantee.

## Concurrency and badge rules

`User.credentialRevision` advances atomically for credential file upload/deletion, practicing-registration saves, provisional number/expiry changes, professional-stage changes, identity/name changes, private migration of license evidence and every admin candidate decision. These changes clear the old review, except an approval writes `licenseReviewRevision` equal to its newly advanced revision. A current badge requires the true review flag, matching integer revisions, a valid historical review timestamp and the existing applicable expiry rules. Legacy flags without a revision binding no longer produce a current badge; operators must independently review them again.

Admin approval/revocation checks candidate ID, email and loaded revision, then conditionally updates the same revision and creates a SafetyReview in one transaction. A concurrent mutation or competing decision returns 409 without recording an approval. Audit persistence failure rolls the decision back. A decision consumes its revision, so the same loaded evidence cannot be used by a second reviewer without reloading.

Career-profile saves, general profile/location saves, preference saves and scan-report writes also guard the revision they read. This prevents a stale whole-profile JSON write from restoring provisional details after credential replacement/review. Non-credential preferences do not advance the revision or revoke a current review. A conflicting save returns a refresh/retry error; scan matches may already be saved before its final report detects a conflict. Existing scan lease handling remains intact.

A download checks the loaded revision before opening the current private file; it uses private storage, no cache, MIME validation, sandbox headers and attachment disposition. A request already authorised and in flight can complete while a replacement occurs; that old revision cannot subsequently be approved.

## API contract

- Administrator `GET /api/admin/reviews?candidate=<email>` returns a minimised `candidate` snapshot: identity, stage, revision, relevant credential kind, file-reference fingerprint, registration/expiry, private availability and current-review boolean. It excludes storage URLs, raw candidateProfile, reminders and document bytes.
- Add `document=1&revision=<loaded revision>` to download the applicable private evidence with the same admin bearer header. No secrets appear in URLs. Missing/public evidence fails closed and stale versions return 409. The UI creates a temporary local download URL and revokes it after 60 seconds.
- Candidate review POST requires `{kind:"candidate",email,candidateId,revision,approved,reviewer,reference,checks}`. Approval requires `checks.document` and `checks.registration` with independent notes of at least ten characters each, under the existing 1500-character limit. Both decisions require the existing reference/reason validation. Missing inputs return 400, missing candidate 404, stale/wrong identity or revision 409; admin authentication and rate limits remain enforced.
- SafetyReview records the candidate subject ID, decision, reviewer name, evidence notes, source/reference, minimised evidence snapshot/fingerprint, loaded revision and decided revision. It does not automatically copy credential file bytes or raw storage URLs into the audit. Do not paste sensitive storage URLs into free-text evidence notes. This administrative audit contains personal credential metadata and must remain admin-only.

## Migration and operations

`20261019010000_candidate_review_revision` adds `credentialRevision INTEGER NOT NULL DEFAULT 0` and nullable `licenseReviewRevision`. It preserves historical flags/review references, account data, documents, applications and review history. Do not backfill a matching approved revision from an old flag: that would claim evidence binding that was not recorded. `scripts/check-database.cjs` checks both columns.

Apply the migration before compatible code. All writers of credential/profile data must use the compatible version; isolate testing databases from older deployments or coordinate upgrades so an older whole-profile writer cannot bypass the revision protocol. An older application is not a safe privacy rollback. No new environment variable/provider; existing ADMIN_SECRET and private Blob credentials apply. The legacy-document migration script now invalidates credential reviews when moving license/provisional references, but was not run against real files during this milestone.

The administrator secret remains shared bearer authentication and the reviewer name is operator-entered, rather than a named-admin identity system. Operators must maintain access controls and evidence quality. Private metadata availability does not establish that a stored file is authentic or continuously reachable; full staging/private-store checks remain required. Account deletion does not automatically purge the append-only SafetyReview subject/evidence record; legal retention, backups and any necessary audit-data purge remain an operational policy task. Do not copy real review notes into public docs or logs.

## Validation boundaries

Automated tests simulate stale approval and career/profile/scan writes, competing reviews, failed audit rollback, required independent checks, legacy/public/expired evidence, revision-bound badges, identity mismatch, provisional rules, guarded private downloads and upload/deletion invalidation. Database/blob dependencies are mocked; these tests do not establish live database isolation, document authenticity or private-store delivery. Browser and release results are recorded separately in Mobile QA and Deployment. No real candidate approval or evidence download is used as a test shortcut.
