# Change log

## 19 October 2026 — Opt-in professional summaries and candidate preview

- Added saved default-off consent in existing candidateProfile JSON, strict API validation and compatibility for older profile clients.
- Added an explicit professional-summary allowlist, Settings draft preview, saved summary preview before direct applications, and shared summaries in employer applicant/previous-applicant views. Unshared summaries return null; private reminders, credential identifiers, salary preference and training notes remain excluded.
- Added profile-preview loading failure/retry handling and seven regression tests for sharing, revocation, consistency and employer authorization. No schema migration or new dependency.
- Preparing release to the existing testing branch with pending employer-safety and launch-audit fixes. Final validation and exact deployment state are recorded in Deployment; production pilot readiness remains HOLD.

## 19 October 2026 — Launch audit, first application-journey pass

- Added `docs/LAUNCH-AUDIT.md` with prioritised findings and explicit remaining pilot gates; pilot readiness remains HOLD.
- Direct applications require a private CV; withdrawals work for the candidate's inactive direct vacancies while preserving other candidates' records. Matches differentiates legacy documents from private uploads and explains current document sharing in the dialog body on mobile/desktop.
- Employer rejection/interview UI waits for server confirmation and reports interview email failures accurately. Added guarded client request helper and pending-state handling.
- Current credential-review responses now account for expiry and relevant intern/licensed credential dates without deleting historical review records.
- Vacancy closure preserves application history; bulk applicant deletion returns 409. Updated employer closure and candidate withdrawal wording.
- Added regression tests for these behaviours, ownership denial, final-withdrawal document denial and idempotent application submission. No schema/migration, provider change or hosted deployment in this pass. See audit verification record for current test/build results and browser limits.

## 17 October 2026 — BenchMan name screening

- Assessed corrected BenchMan spelling: registered .com, existing word/software uses and audience/positioning concerns. Documentation only; no naming decision, purchase or application change.

## 17 October 2026 — BenchMam name screening

- Recorded preliminary exact-spelling search, .com no-record result and clarity/spelling concerns. Documentation only; no name approval, purchase or application change.

## 17 October 2026 — TopBench and BenchCareer screening

- Recorded TopBench's existing software/research uses and registered .com, and BenchCareer's preliminary search and .com no-record result. Preferred BenchCareer for clearer career positioning; formal clearance remains pending. Documentation only; no purchase, adoption or application change.

## 17 October 2026 — Benchers and BenchLead screening

- Recorded registered .com domains, Benchers' legal/community associations and BenchLead's preliminary positioning assessment. No Nigerian name/domain or trademark clearance claimed; documentation only, no adoption or purchase.

## 16 October 2026 — BenchJob name screening

- Documented BenchJob's employment positioning, preliminary search findings and registered .com. Nigerian domains, CAC and trademark clearance remain pending. Documentation only; no purchase or application change.

## 16 October 2026 — MLSPro name screening

- Recorded MLSPro positioning, preliminary web results and registered .com; Nigerian domains, company-name and trademark checks remain pending. Documentation only; no purchase, adoption or application change.

## 16 October 2026 — MLSHub name screening

- Documented MLSHub's specialist-community fit, preliminary search findings and registered .com. Retained as a possible brand pending Nigerian domain/name and trademark checks. Documentation only; no purchase, adoption or application change.

## 16 October 2026 — ScoutHub name screening

- Recorded existing ScoutHub recruiting platform and registered .com. Recommended against this name because of direct recruitment-sector overlap. Documentation only; no purchase, rebrand or application change.

## 16 October 2026 — BenchHub name screening

- Documented existing BenchHub laboratory protocol app, other technology uses and registered .com. Documentation only; no naming decision, purchase or application change.

## 16 October 2026 — Further short-name shortlist

- Documented BenchLeap, BenchRole, LabRung and BenchFwd with preliminary web/.com registry screening, and recorded other registered .com options. No final availability, company approval or trademark clearance claimed; documentation only.

## 16 October 2026 — LabPro name screening

- Recorded registered .com and multiple existing laboratory supply/software brands using LabPro. Documentation only; no naming decision, application change or purchase.

## 16 October 2026 — BenchPro name screening

- Recorded registered .com and existing scientific talent-discovery and laboratory furniture uses. Recommended against BenchPro because of closely related brand overlap. Documentation only; no application changes or purchase.

## 16 October 2026 — LabScout name screening

- Recorded registered .com and existing biomedical opportunity/scientific talent services using LabScout. Recommended against this option on brand-distinction grounds; documentation only, no rebrand or purchase.

## 16 October 2026 — BenchAid and MLSBench screening

- Documented user-proposed names, preliminary .com registration results, MLS-Bench research-project overlap and positioning tradeoffs in the candidate/brand review. CAC/trademark clearance remains pending; no rebrand or purchase.

## 16 October 2026 — Short brand-name exploration

- Extended the candidate/brand review with Labvaro, Labzuri and Labvori, dated web and .com registry screening, rejected alternatives and pending CAC/trademark/registrar checks.
- Documentation only; no name adoption, purchase, application change or deployment. Naming does not block the launch audit.

## 16 October 2026 — Candidate readiness and preliminary naming review

- Added `docs/CANDIDATE-AND-BRAND-REVIEW.md`: current profile separation, employer access scope, pilot improvements and 12 passing candidate-profile tests.
- Recorded existing BenchScout brand/domain use, exact CAC public-search results, alternative .com RDAP results and unresolved .ng lookups. No name approval, reservation, purchase or trademark clearance is claimed.
- Documentation only; no application change, migration, deployment or rebrand.

Entries describe implemented changes and their verified release state. Earlier work remains recorded in the existing dated audit documents; this file does not reconstruct missing release history.

## 16 October 2026 — Employer and vacancy safety

### Added

- Employer portal company-verification form with status refresh, reviewer feedback, public-institution registration alternative, contact/authority/operating-credential evidence and no-fees declarations.
- Private employer verification GET/POST API; shared submission/evidence validation.
- Administrator company, vacancy and candidate-report queues, employer lookup by email, conditional evidence checklists and recent decision history.
- Candidate report control in listing evidence and a rate-limited, ownership-checked report endpoint.
- Four employer verification fields, `SafetyReview` audit records and `JobReport` records with duplicate-report protection and queue indexes.
- Full [feature/API/operations reference](EMPLOYER-VERIFICATION.md), deployment instructions, integration notes and documentation-maintenance instructions in `AGENTS.md`.

### Changed

- New and edited employer vacancies require moderation before publication; creation requires a no-fees declaration.
- Company-detail changes pause approval and active vacancies; suspension blocks subsequent protected employer access and cannot be lifted by self-submission.
- Discovery excludes unpublished direct vacancies and unapproved employers while retaining application history. Direct applications recheck vacancy/company approval.
- Company and vacancy reviews reject stale revisions/timestamps. Safety decisions and audit writes commit atomically.
- Administrators can dismiss reports or remove listings; removed external listings remain removed during refresh of the same saved listing.
- Employer copy/status labels reflect review rather than instant publication. Shared responsive safety-form styles added.
- Database compatibility checks include the new schema and load project environment configuration.
- Test mocks/role checks/fixtures expanded; 13 focused employer-safety tests and one scanner removal regression added.

### Integrations and boundaries

- Reuses existing Prisma/PostgreSQL, session authentication, API guards, rate limits and administrator-secret authentication.
- CAC checks and independent company/vacancy confirmation remain manual. No external verification API, new environment variable, provider credentials, document upload or notification worker added.
- Existing approvals are preserved as `legacy-approved`; existing active jobs are not retrospectively removed. Individual reviewer authentication, scheduled revalidation, report/queue notifications and broader source-URL takedowns remain follow-up work.

### Migration and validation

- Configured database: successfully applied/recorded `20261012000000_employer_email_confirmation`, `20261012010000_candidate_profiles`, and `20261016000000_employer_safety` through Prisma migration deployment.
- Post-migration compatibility: no missing columns. Authenticated local review queue returned HTTP 200 with all expected arrays; no real approval/report was created for testing.
- Lint, TypeScript and 153 automated tests passed; production build passed. Local administrator form/evidence fields inspected.
- Populated employer/admin workflows, mobile verification and a full real-database decision/report scenario remain staging checks.
- Hosted application deployment: not performed for this feature.

## 16 October 2026 — Business and launch proposal

- Created the editable Word proposal `docs/proposals/BenchScout_Business_and_Launch_Proposal.docx` and retained its Markdown content alongside it.
- Consolidates the proposed employer-funded model, market positioning, revenue options, adoption, onboarding, data pipeline, trust controls, launch audit, business/domain/regulatory preparation, five-employer pilot, campaign economics, measurement, 90-day roadmap, operating responsibilities, risks and partnership request.
- Separates implemented product capabilities and recorded validation from proposed work, planning assumptions and pending hosted deployment. Includes dated official/public sources and project evidence.
- This is a planning and pitch artifact. It does not register a business, purchase a domain, approve a budget, contact employers, change application behaviour or deploy code.
