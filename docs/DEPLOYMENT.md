# Deploying the security upgrade

## 19 October 2026 — Testing release preparation

User requested publishing the next audit priority to the existing Vercel test link. Target branch: `testing`; repository: `Ssholly/BenchScout`; existing Vercel project: `sholly/bench-scout`. This release includes the pending employer/company/vacancy safety controls, first application-journey audit fixes, and opt-in professional summaries/preview. No production branch update is requested.

Validation: lint, TypeScript, 172 tests and production build passed. The configured database reports all five migrations up to date and no missing compatibility columns. No database migration was applied during this release preparation. Browser Settings preview was inspected at 390px/320px; keyboard draft consent changes were reverted without saving. Full synthetic employer/candidate staging acceptance, finer document scope and candidate-review concurrency work remain open; pilot readiness remains HOLD.

Release confirmed: commit `f0d1a67fdf746e6f8893080f5e7d04c5f151aefc` was pushed to `origin/testing`. Vercel deployment `G8vefGUn9bNV5Sad6Ey8ENUNciiK` reports **Ready**, environment **Preview**, source branch **testing**, and that exact commit. Details: https://vercel.com/sholly/bench-scout/G8vefGUn9bNV5Sad6Ey8ENUNciiK. The existing alias https://bench-scout-git-testing-sholly.vercel.app/ points to this release (immutable deployment: https://bench-scout-33gskhgwr-sholly.vercel.app/).

Hosted read-only check: opened the existing test alias at `/settings#career-profile` with the existing signed-in session and confirmed Professional summary sharing, the unchecked default-off checkbox, Employer preview and Save career profile controls. No consent change was saved and no application/decision was submitted. This confirms the feature is served by testing, not a full synthetic employer/candidate acceptance run. Documentation-only follow-up commits may update the alias while retaining this application code.

Earlier no-deployment statements below describe their respective historical audit passes. No production branch was pushed.

19 October 2026: [Launch audit](LAUNCH-AUDIT.md) records additional application, withdrawal, credential-badge, employer-feedback and vacancy-closure changes. No new schema/migration or environment variable is required by that pass. They passed local checks/build but have not been pushed or deployed. Before release, validate complete candidate/employer journeys with synthetic staging accounts and private files; the audit remains HOLD pending the listed gates. Schema compatibility checks do not prove hosted code is current.

The code changes do not apply themselves to the live database or migrate already public files.

1. Back up PostgreSQL and the old blob store. Put the existing deployment into maintenance mode while upgrading so old endpoints cannot continue writing public documents or accepting unauthenticated changes.
2. Compare the existing database with the original schema represented by `prisma/migrations/20260527000000_baseline/migration.sql`. If it matches and no Prisma migration history exists, mark that baseline as already applied:

   ```sh
   npx prisma migrate resolve --applied 20260527000000_baseline
   npx prisma migrate deploy
   ```

   For a new empty database, run only `npx prisma migrate deploy`. If the existing database differs, reconcile the schema in staging first. Never run `migrate reset` against production. The security migration is additive; it does not delete user data.

3. Configure a separate private Blob store, `BLOB_PRIVATE_READ_WRITE_TOKEN`, the legacy `BLOB_READ_WRITE_TOKEN`, independent admin/cron/salary secrets, the canonical application URL, and a verified email sender.
4. Run `npm run documents:migrate` to inspect counts, then `npm run documents:migrate -- --apply` to copy objects privately and remove their public originals. If old-object deletion fails, manually remove the reported pathname from the legacy store. The script does not claim to revoke copies already downloaded by third parties.
5. Deploy the new application and configure authenticated server schedules as described in README. Existing browser-local login hints are intentionally invalid until the user signs in again.
6. In staging, verify candidate registration and confirmation mail; login and logout; private CV/license upload/download/delete; cross-account denials; employer review, posting, application, shortlisting and email delivery; password reset revocation; salary editing; and a scheduled scan with fresh and repeated source fixtures. Check desktop and mobile screens with both account roles.
7. Review existing employer approvals and independently review licenses before using the new review label. Existing salary reports have no owner key and cannot safely be claimed using a public report ID; contributors can submit a new report, while an administrator handles legacy corrections offline.
8. Reopen access after checking database backups, migration results, and private storage behavior. Retain migration logs without tokens or document contents.

Rollback requires restoring the prior database/storage backup and compatible application together. Do not redeploy the prior insecure API against user data as a routine rollback strategy.


## Employer safety release — 16 October 2026

Read [the full feature and API reference](EMPLOYER-VERIFICATION.md) before rolling out this release. It adds private employer submissions, required company evidence checks, moderation of new/edited vacancies, candidate reports and suspension/audit operations.

1. Apply migrations before running the compatible application. `20261016000000_employer_safety` adds four `Employer` fields plus `SafetyReview` and `JobReport`; it does not delete records. Existing approvals become `legacy-approved`, and existing active vacancies remain active until deliberately re-reviewed.
2. Run `node scripts/check-database.cjs` and require `compatible: true`. This checks metadata only. No new environment variable or third-party provider is needed; retain the existing strong `ADMIN_SECRET` and session configuration.
3. Deploy compatible code. Check `/employer` company submission/status/feedback and `/admin/reviews` using the correct account roles. Confirm a new or edited vacancy stays out of discovery until company and vacancy approval; check that a revoked employer cannot accept applications or access candidate documents.
4. In staging, verify all evidence fields, stale-decision conflicts, no-fees declarations, report ownership/deduplication, removal, suspension and reinstatement. Confirm company approval does not automatically publish paused vacancies. Check mobile forms and a full populated database workflow. Use designated test data and do not grant real employer approval as a test shortcut.
5. Assign a reviewer to monitor pending queues and candidate reports. This release sends no moderation notifications. Find legacy employers by email and request updated submissions; the migration does not automatically suspend them. Preserve review evidence under the existing private administration controls.

Recorded state: `prisma migrate deploy` successfully applied/recorded the email-confirmation, candidate-profile and employer-safety migrations in the configured database. The post-migration check reported no missing columns, and the authenticated local admin queue returned 200. Lint, TypeScript, 153 tests and the production build passed. The hosted application has not been deployed for this feature. Treat database application and hosted-code deployment as separate release steps.

Rollback should keep the additive tables/columns and audit/report records. Returning to older application code would also remove its new moderation/reporting protections, even though the schema remains compatible; review access and publication behaviour before any rollback. Do not drop safety records to roll back the UI.


## 19 October 2026 — Toolkit mobile refinement

Targets the existing `testing` Vercel alias. This CSS/copy/accessibility refinement requires no migration or environment change. Lint, TypeScript and 172 tests passed; browser checks at 320 × 568 and 390 × 844 confirmed 16px modal clearance, scrolling content, visible footer and the expandable drafting disclosure. No real CV was sent for drafting and no application was submitted. Production build and diff checks passed. Code commit `40c8795186283cfb07de2ecf5a0fc3b207304888` was pushed to `origin/testing`; the Vercel commit status is success for deployment [5YxYAp6djKWTcjNxDpUAmueCLV48](https://vercel.com/sholly/bench-scout/5YxYAp6djKWTcjNxDpUAmueCLV48). Test alias: https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed.

Hosted read-only verification opened the toolkit on the test alias at 390 × 844: dialog bounds x=16..374, y=16..828, with the footer inside those bounds and the new Cover letter / How drafting works copy served. No draft generation or final application action was triggered. A documentation-only follow-up records this evidence.


## 19 October 2026 — Application document selection

Additive migration `20261019000000_application_document_selection` was applied successfully to the configured database using Prisma migrate deploy. It adds Application.documentSelection and backfills only current private CV references for existing applications. Post-migration read-only compatibility returned missing=[] and compatible=true. This does not prove every hosted environment uses that database; verify the column in any separate deployment database before release. No new provider/environment variable or file copies. Never deploy older broad-access code as a privacy rollback without reviewing employer access.

The candidate selector, per-application file reference checks, employer link filtering and selected-kind history are implemented. See [Application document sharing](APPLICATION-DOCUMENT-SHARING.md) for contracts and retention limits. Lint, TypeScript, all 177 tests, production build and diff checks passed. Synthetic component mobile checks passed at 320/390px. Code commit `b02fdaf02a3cd4fcff7a4e8c2bb2551d53643750` was pushed to `origin/testing`. Vercel reports success for [deployment 9aV31E6hw5tPRySWfqSi4JCcVKxt](https://vercel.com/sholly/bench-scout/9aV31E6hw5tPRySWfqSi4JCcVKxt), serving the existing alias https://bench-scout-git-testing-sholly.vercel.app/. No production branch was pushed. No real application or employer decision was submitted.

Hosted read-only check after deployment: the signed-in candidate matches feed loaded five Apply Now controls with no visible alert, exercising the updated application-selection query against the hosted database. No direct synthetic vacancy was created and no real application was submitted. The hosted selector-to-employer acceptance journey remains open; the interactive selector itself was checked in the removed local synthetic preview. Documentation-only follow-up records these results.


## 19 October 2026 — Candidate credential-review safeguards

Migration `20261019010000_candidate_review_revision` applied successfully to the configured database. Post-migration compatibility returned missing=[] and compatible=true. The two new User fields preserve historical flags; current badges require a matching approved revision, so legacy approvals require independent re-review. No candidate was approved as a migration/test shortcut. Coordinate all profile/credential writers or isolate databases from older application versions; an older deployment is not a safe review-protection rollback.

Implemented current-candidate lookup/private evidence download, revision/identity-checked atomic decision plus SafetyReview, mutation invalidation and stale profile/scan-write guards. No new provider or environment variable. Local mobile form checked at 320/390px without entering administrator credentials or submitting a decision. Lint, TypeScript, 192 tests and diff checks passed. Production build passed. Hosted release is pending the testing push. See [Candidate credential review](CANDIDATE-CREDENTIAL-REVIEW.md) for contracts, audit privacy and remaining operational limits.
