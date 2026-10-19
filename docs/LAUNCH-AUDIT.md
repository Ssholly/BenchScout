# Launch audit — 19 October 2026

## Follow-up: professional summary priority

LA-09 is implemented locally through explicit, default-off candidate consent, an allowlisted live professional summary, Settings draft preview, saved direct-application preview and employer applicant/previous-applicant views. Seven new tests cover data minimization, consent and access checks. See [Professional summaries](PROFESSIONAL-SUMMARIES.md) for all contracts and limitations. LA-10 remains open: this does not implement selected-document sharing or submission snapshots. The original first-pass findings below remain dated evidence; release status is recorded in Deployment.

## Decision and scope

**Pilot readiness: HOLD.** First source/test audit pass completed for candidate identity, career profiles, direct applications, employer applicant access, document sharing, interview feedback, withdrawal and vacancy closure. Confirmed defects below were fixed locally. This is not a production security certification or a completed signed-in acceptance test.

Audit began with 153 passing automated tests and the existing employer-safety/profile work already in the checkout. Existing uncommitted changes were preserved. The app name remains a working name and does not block engineering work.

Severity: P1 must be resolved/verified before pilot use of the affected flow; P2 is a reliability or usability issue with a practical workaround. “Fixed locally” requires hosted staging acceptance before it counts as released.

## Findings addressed locally

| ID | Priority | Trigger and previous result | Local correction | Evidence |
| --- | --- | --- | --- | --- |
| LA-01 | P1 | A candidate with a legacy public CV URL could submit a direct application, but the employer document endpoint would refuse that file. | Direct applications require a private-store CV. Matches distinguishes private uploads from files needing re-upload. Optional profile fields are not made universal application blockers. | Application journey tests reject absent, public and malformed CV URLs; duplicate submissions preserve the existing application stage. |
| LA-02 | P1 | Candidate withdrawal reused the active-discovery guard, rejecting a closed/paused direct vacancy even when the candidate had applied. | Withdrawal uses candidate-owned application deletion for direct jobs regardless of publication status; external jobs still require ownership. No other applicant or vacancy status is changed. | Tests cover active/closed/pending-review/cleared, other candidate records, malformed IDs and document denial after final withdrawal. |
| LA-03 | P1 | Employer rejection changed the UI before confirmation and reported success on HTTP errors; interviews also updated optimistically. | Shared client request validation; visible stages change only after confirmed server results. Pending decisions are guarded; results are ignored if client identity changes. | Applicant update tests reject 403/503, unsuccessful and malformed results. Server tests reject cross-employer/invalid interview writes. |
| LA-04 | P2 | Interview success copy claimed email dispatch even when the server returned emailDelivered=false. | Distinguish saved interview/in-app notification from email delivery; warn the employer to contact the candidate when email fails. | Simulated email failure preserves the interview and in-app notification and returns false delivery status. |
| LA-05 | P1 | A reviewed flag plus review date could continue displaying a reviewed badge after credential expiry. | Central currentCredentialReview helper checks review date and applicable expiry; used by JSON sanitization, readiness, applicant/talent responses and compliance. Practicing licenses require expiry; provisional expiry remains optional, but when provided must be future. Database historical review records are retained. | Tests cover expired/missing/invalid practicing expiry, invalid review date, and intern provisional expiry independently of a past practicing-license expiry. |
| LA-06 | P1 | Employer vacancy deletion cascaded to Application records, removing candidate history. | Existing DELETE /api/jobs/direct now closes the vacancy (status=closed) using employer-scoped updateMany. Existing applications/reports remain. Employer labels describe closure, and new applications are blocked by the existing active-status gate. | Test fails if physical job deletion is attempted and checks preserved applications. |
| LA-07 | P1 | DELETE /api/jobs/applicants could erase all application records for a vacancy. | Keep authenticated ownership checks, then return HTTP 409 with guidance to close the vacancy/update individual statuses. | Test confirms the owning employer cannot bulk-delete application history. |
| LA-08 | P1 | Sharing information was brief and in a footer hidden on narrow screens; live document replacement/access rules were not explained. | Add ApplicationSharingNotice to the scrollable direct-application dialog body. Explain identity/stage/status sharing, current vault access, replacements, final withdrawal and limits on recalling downloaded copies. | Actual component rendered with application CSS in an isolated synthetic fixture at 320/390/800px. No horizontal overflow; submit control remains within fixture viewport. This is not a full application-dialog/browser acceptance pass. |

The candidate application submit button also shows a pending state; success/failure results from an obsolete client identity are ignored. The pipeline labels removal of a direct application as “Withdraw application”, rather than promising a closed vacancy will return to Matches.

## Confirmed foundations

- Candidate User and Employer records use distinct roles. Authentication middleware restores server-owned identity, rejects role mismatches and gates employer applicant access on current company approval.
- Career stages and intern placement stages are saved server-side. The existing tests exercise validation, explicit stage-change confirmation, credential-review reset and preservation of account documents/history.
- Employer applicant/talent queries are scoped to the employer's jobs/previous applicants. Full candidateProfile JSON is stripped from these responses; private reminders are not shared.
- Private document reads require candidate ownership or a currently verified employer/application relationship. After the final application relationship is removed, further employer downloads are denied. Another remaining application to the same employer continues to authorise access.
- Direct submission checks career stage, recorded deadline, active vacancy and company approval. The unique candidate/job application key makes sequential duplicate submission idempotent. These checks do not independently certify professional eligibility or establish race-free behaviour under all concurrent operations.
- Company review, per-vacancy review, reporting and suspension have existing automated coverage; no actual company approval/report/suspension was created during this audit.

## Remaining work before pilot acceptance

| ID | Priority | Work and acceptance evidence | Responsible function |
| --- | --- | --- | --- |
| LA-09 | P1 | Define an explicit shared professional summary (education, relevant experience/specialties, availability, preferences) and candidate preview. Add allowlisted API fields and employer UI without exposing reminders or internal scan metadata. A CV can cover detailed employment history initially. | Product + engineering |
| LA-10 | P1 | Resolve document scope: current access is to the supported current vault documents, not selected files or an immutable submission. The notice now describes this, but selective per-application sharing, retention/deletion policy and a submission record still need design and implementation before offering that stronger promise. | Product + privacy + engineering |
| LA-11 | P1 | Candidate credential review needs a concurrency/evidence audit. The existing admin candidate branch reads current details then updates a review flag without the revision checks/audit transaction used for employer/vacancy decisions. Require current private evidence and prove that document/profile replacement cannot inherit a stale approval. This branch was identified, not changed, in this pass. | Review operations + engineering |
| LA-12 | P1 | Use isolated staging candidates (intern seeking/in-training/licensed), employers (pending/approved/suspended) and reviewed vacancies. Complete signup/confirmation, profile/upload, review/post, apply, employer assessment/interview, candidate notification, closure and withdrawal. Repeat with another account's IDs, rejected requests and interrupted requests. | QA + engineering |
| LA-13 | P1 | Verify private-store configuration, current legacy-document inventory and cleanup outcomes in the target deployment. Complete actual private upload/read/delete and replacement checks with synthetic files; verify deployment protection and storage permissions. | Engineering + operations |
| LA-14 | P1 | Verify hosted release, monitoring, rollback and a backup/restore exercise. Check application/review races and database transaction failure handling with a real staging database. No disaster-recovery or load claim follows from mocked tests. | Engineering + operations |
| LA-15 | P2 / P1 if promised | Revalidate unattended scans and email delivery/retry operations. docs/SCHEDULER-AUDIT.md records a 14 October trigger/protection limitation and absent email retries; hosting was not refreshed in this pass. Do not advertise unsupported scheduled guarantees. | Operations |
| LA-16 | P2 | Audit interview timezone/date constraints, stale employer drawer reads, repeated requests and client identity changes across all remaining mutation flows. Confirm consistent labels and accessible errors on real devices, keyboard and short landscape screens. | QA + engineering |

Business registration, final name/domain, applicable recruitment/privacy arrangements and employer service terms remain parallel launch work described in the proposal. This audit made no registration or legal-clearance determination.

## API, data and release record

- POST /api/apply: a direct application with no privately stored CV returns HTTP 400. Existing career-stage/publication/company checks remain.
- DELETE /api/apply: validates jobId; own direct application can be withdrawn from an inactive vacancy; no matching own application returns 404. Other candidates' external jobs return 403. Response remains {success:true} on successful withdrawal.
- DELETE /api/jobs/direct: closes an owned vacancy rather than deleting it. Existing application/document access remains until withdrawal or employer restriction; closure itself does not revoke that relationship.
- DELETE /api/jobs/applicants: returns 409 for an authorised owning employer; anonymous/wrong-role/ownership denials still run first.
- Applicant/talent queries select licenseExpiry; current reviewed booleans are recalculated using the applicable credential. Personal candidateProfile content remains excluded. No new professional-summary API fields are exposed yet.
- New helpers: lib/credential-review.ts and lib/applicant-update.ts. New component: components/ApplicationSharingNotice.tsx. New regression suites: tests/application-journey.test.cjs and tests/applicant-update.test.cjs. The existing duplicate-application fixture now uses a valid private-store URL.
- No schema change, new migration, credentials, provider integration or dependency was introduced. No hosted deployment, Git push or real candidate/employer decision was performed.
- Read-only node scripts/check-database.cjs returned missing=[], migrationHistoryPresent=true, compatible=true on 19 October. This is schema compatibility evidence only, not a migration-provenance or hosted-code check.

## Verification

Baseline: 153/153 tests passed before this audit's edits. Final validation after component extraction/copy refinements: `npm run check` passed lint, TypeScript and 165/165 automated tests; `npm run build` passed. `git diff --check` passed after documentation formatting cleanup. Tests use mocked database/provider dependencies; they are not evidence of real-database transaction isolation or provider delivery.

Browser: /matches loaded locally; guest state provided no signed-in test identity. No application, rejection, hire, credential approval or interview was submitted against real records. An isolated fixture rendered the actual ApplicationSharingNotice and app CSS with synthetic text. Width/scrollWidth pairs were 320/320, 390/390 and 800/800, and fixture submit controls remained inside the 720px viewport. This establishes notice layout only; full authenticated dialog interactions remain LA-12/LA-16.

Next implementation milestone: LA-09 and LA-10, followed by the LA-11 credential-review race check and the complete staging acceptance journey. The pitch deck and pilot pack must use confirmed behaviour and must not describe these open capabilities as shipped.
