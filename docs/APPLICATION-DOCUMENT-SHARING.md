# Application document sharing

Implemented 19 October 2026 for the testing release. This replaces the broad current-vault access described in the historical launch audit. Hosted release evidence is in [Deployment](DEPLOYMENT.md).

## Candidate and employer behaviour

Direct Application Toolkit includes a Documents for this application fieldset and a selected-document summary before Submit. The private CV is required and selected. Practising/provisional license, degree certificate, statement of result, placement letter and additional certificate are optional and unchecked. Missing/public legacy files cannot be selected. Profile & documents remains the upload screen. External job-board toolkits continue to prepare downloads locally; these choices apply to direct employer submissions.

The candidate's My applications card records document kinds selected at submission. Employer applicant views expose only selected files that remain current, with links scoped to that application. The previous-applicant talent view exposes the union of still-current documents granted through applications to that organisation. Neither API exposes storage references or selection JSON. Avatar access is never granted through an application.

A selected document is tied to its server-side private file reference, rather than the mutable vault field name. Replacing/deleting it stops future access to that version and does not share its replacement. Other selected files continue working. Withdrawing one application removes its grants and selection record; another application to the same employer can retain its own grants. Closed vacancies preserve existing grants; employer verification/suspension gates remain in force. Downloaded copies and requests already authorised in flight cannot be recalled.

## API and storage contract

- Candidate `GET /api/user` adds `applicationDocuments`: `{kind,name,available,revision}` entries for all seven supported kinds. Revision is a SHA-256 identifier of the current server reference, not an access credential. No raw reference is returned.
- Direct `POST /api/apply` requires `selectedDocuments: [{kind,revision}]`, including resume. Unknown, duplicate, missing/private-ineligible selections return 400; changed revisions return 409 before creating an application. The client can refresh the preview and review again. External submissions retain their existing contract.
- Server captures `Application.documentSelection` JSON mapping selected kinds to private references and uses existing `createdAt` for the submission time. The selection is immutable for that application: duplicate POST uses an empty upsert update and preserves its status and grants. Selection JSON is stripped from every JSON API response; safe kind names are returned separately.
- `GET /api/documents` requires the current candidate owner or a verified employer with a matching selection for the current file reference. Optional `applicationId` further restricts the lookup; it cannot borrow another application's grant. Generic employer links use any remaining grant to that organisation. Responses stay private/no-store with existing MIME and sandbox checks.
- `GET /api/jobs` exposes selected kinds to the owning candidate for application history. Applicant GET returns application-scoped guarded URLs and selected kinds; talent GET returns filtered guarded URLs. No new provider or environment variable.

## Migration, retention and limitations

`20261019000000_application_document_selection` adds one nullable JSONB column. Existing applications receive only their current private CV reference, if present, preserving that existing CV permission while removing implicit optional-document access. Records without a private CV remain fail-closed. This is a rollout-time record for historical applications, not proof of the exact file originally submitted. Apply before deploying compatible code. `scripts/check-database.cjs` checks the column.

This is a selection/reference record, not an immutable retained copy of file bytes or the professional profile. Upload replacement/deletion continues removing the old object under existing cleanup rules; failed storage cleanup does not restore access through the app. No extra blob copies are created. Reference metadata remains while its application exists, including after a file is replaced, and is removed by application withdrawal/account deletion cascades. Existing database backups and employer downloads follow their separate retention obligations. Review operations must manage backups and any legally required retention separately; this release does not invent a regulatory retention period.

There is no in-place attachment replacement for an already submitted application in this milestone. Candidates can withdraw/reapply while a vacancy remains eligible, which creates a new application and resets its recruitment stage; do not suggest this as a routine way to preserve an ongoing interview. An attachment-update workflow and physical-device/full staging acceptance remain separate work. Default-off professional-summary sharing retains its existing live consent model.

## Validation

Focused automated tests cover required CV, optional omission, unknown/duplicate kinds, stale revisions, idempotency, response minimisation, application-specific grants, withdrawal, replacement/missing selection denial and avatar denial. Tests mock database/blob operations and do not establish production concurrency or storage deletion outcomes. Final full checks, mobile evidence, migration application and deployment results are recorded in [Mobile QA](MOBILE-QA.md), [Changelog](CHANGELOG.md) and [Deployment](DEPLOYMENT.md).
