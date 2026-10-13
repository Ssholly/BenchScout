# Intern and licensed scientist profiles — review proposal

Status: integrated locally, 12 October 2026. Both Seeking placement and In training stages are implemented. Licensed-scientist profile, vault, matches and dashboard were checked in the browser. Employer UI, physical-device and production release checks remain pending.

## Product direction

Keep one candidate account and one authentication system. Store career stage on the server and use it to select the correct profile, dashboard, document vault, opportunity feed, alerts and employer applicant view. Home remains the introduction for both profiles. Preserve the current navy/teal design, compact cards, mobile viewport settings and navigation behaviour.

Interns need a placement hub. Licensed scientists need a career dashboard. Career stage is self-reported until supporting credentials are independently reviewed; it must not act as proof of professional eligibility.

## Original implementation gaps addressed by this integration

- Signup persists `careerPhase`, and session restoration returns it.
- `components/ProfileModal.tsx` changes phase only in local storage. A subsequent server restoration can revert the displayed phase, while scans still use stored preferences.
- `app/page.tsx` presents the same dashboard metrics for both phases.
- `app/settings/page.tsx` defines practicing-license and degree documents without an intern-specific vault.
- Matches contains a provisional-license/result presentation, but `statementOfResultUrl` has no corresponding storage field. The supported upload kinds do not include statement of result.
- `lib/readiness.ts` switches the license document label but reuses the same registration/expiry fields and generic checklist.
- `lib/job-matching.ts` separates scraped roles through title keywords. `app/api/jobs/route.ts` returns employer direct posts without a career-stage filter. Classification needs to use explicit job type as well as reviewed source evidence.
- `Job.isMlscnApproved` is a boolean without the source, scope or review date needed for a reliable approval label.

## Shared profile

Name, email, photo, CV, location, matching skills, alert schedule, preferences and application history stay attached to the same candidate identity. Email confirmation, credential submission and independent credential review remain separate statuses. Documents remain private and are shared through the existing authorized application/document paths.

## Intern profile

Primary goal: find an appropriate supervised internship placement.

Suggested fields:

- B.MLS institution, graduation year and qualification evidence.
- Provisional registration number, document and validity details where applicable.
- Preferred states/hubs, relocation preference and availability date.
- Placement stage: Seeking placement or In training (confirmed scope). Offers remain application statuses. Completion pending full registration is a proposed later transition, not an automatic change to licensed scientist.
- Relevant practical skills and interests, without requiring years of post-qualification employment.
- In training: institution, recorded start/end dates and placement evidence. Records are self-reported until reviewed.

Vault: CV, provisional license, degree/statement of result and optional documents requested by a particular institution. Show uploaded/missing and submitted/reviewed accurately. Do not make every optional document a signup blocker.

Placement preferences belong in Settings. Professional stage changes belong in a deliberate profile transition, rather than a cosmetic toggle.

## Placement dashboard

1. Compact heading: “Your placement hub”, current placement stage, and a primary “Find placements” action.
2. Placement readiness checklist: confirmed email, CV, education evidence, provisional-registration details and preferences. Checklist completion describes completeness, not regulatory eligibility.
3. Four compact summary cards: Available placements; Applications; Interviews; Offers/invitations. Count actual stored data only. Distinguish tracked external applications from platform submissions.
4. Placement opportunities: institution, location, opening/deadline where known, allowance if disclosed, required documents, source and next action. Show source approval evidence only when verified; otherwise state that approval is unconfirmed.
5. Upcoming actions: interviews, recorded deadlines and missing profile details. Avoid invented dates or claims of submission.
6. Placement pipeline: Saved → Applied → Interview → Offer → Accepted. Accepted should mean the user has recorded acceptance, not that a click binds them to an offer.
7. In training: show the recorded institution, start and expected completion dates, document readiness and upcoming recorded actions. Replace placement-search summary cards with Placement status, Training dates, Document readiness and Next action. Use expected completion dates rather than claiming verified progress. Keep logbooks/rotations outside the initial scope unless separately requested.

## Confirmed intern stages

Seeking placement is the default for a new intern profile. Entering In training is an explicit user action after recording a placement; accepting or recording an offer must not silently change professional stage. Ask for institution and start date, with expected end date and placement evidence as useful additional details. Clearly identify self-reported records.

The In training dashboard prioritizes current placement over job discovery. Placement matches and application history stay accessible through navigation, but scanning for another placement should not be the default primary action. Prefer “View my placement” or “Update placement details”. Users can correct their stage without deleting their history. Institution information and documents must remain private to the user and explicitly authorized employer/application access.

Completing the expected training period does not automatically make a user licensed. A future “Update professional stage” flow will preserve their account and require the relevant details; independent review remains separate.

Mobile: two summary cards per row, single-column opportunity cards, clear wrapping, reachable actions and no permanent banner consuming the screen. Empty states offer a useful next step.

Intern navigation labels: Placement dashboard, Placement matches, My applications, News & Insights, Scheduler, History and Profile & documents. Relevant stipend information may be shown; licensed salary comparisons should not imply an intern's expected pay.

## Licensed scientist profile and dashboard

Primary goal: find suitable employment and manage career applications.

Suggested fields: professional registration number; practicing-license document and validity; qualification; years of experience; specialties; preferred permanent/locum/contract roles; availability; location/relocation preferences; salary preference where useful.

Vault: CV, practicing license, qualification evidence and optional relevant certificates. Registration/expiry reminders use supplied metadata and do not imply Council approval.

Dashboard: relevant job matches, applications, interviews/offers, license reminders, recent opportunities and salary intelligence. Preserve the existing scanner, application pipeline and compact layout. Do not automatically show senior roles solely because a candidate selects the licensed profile.

## Matching and employer behaviour

- Match on server-stored career stage, explicit job type, location, availability and appropriate skills. Treat unknown job type as unknown rather than silently classifying it.
- Intern discovery prioritizes internship placements; licensed discovery prioritizes suitable employment. Previously submitted applications stay visible during later stage transitions.
- Employer vacancy forms distinguish Internship placement from Licensed scientist vacancy and capture relevant requirements.
- Employer applicant/invitation cards show candidate stage and the applicable document type, plus separate credential-review status.
- Company review approval does not establish internship-site accreditation. Approval claims need independent institution evidence, source and a review date.
- Institution accreditation must use MLSCN evidence for the relevant internship programme, rather than generic laboratory registration. MLSCN publishes an [internship institutions list](https://old.mlscn.gov.ng/index.php/approved-institutions-for-mls-internship/); current institution status must be rechecked before displaying a verified badge.

## Transition to licensed scientist

Use “Update professional stage” with clear confirmation and supporting registration/license details. Preserve the same account, documents and application history; refresh discovery preferences and dashboard. Uploading a file or selecting a stage must not automatically grant a reviewed credential badge. Record the change server-side, and ensure all tabs/devices receive the same stage after reload.

## Proposed sequence after review

1. Agree on the profile fields, intern stages and dashboard layout.
2. Build an isolated preview with representative sample data for desktop and mobile, without changing current users' profiles.
3. Correct server-persisted career-stage behaviour and opportunity classification, with targeted regression tests.
4. Add the separate intern dashboard, profile/vault/readiness views and employer applicant labels.
5. Test new scientist and intern signup/confirmation, reload/session restoration, role-appropriate opportunities, document access and stage transitions.
6. Deploy only after both candidate journeys and employer permissions pass focused checks.

## Acceptance criteria

- An intern signs up, confirms email and lands on Home; opening the dashboard shows placement-focused content.
- A licensed scientist sees career content and practicing-license fields.
- Reload, another tab and another device preserve the server-stored profile stage.
- Intern discovery does not present ordinary licensed vacancies as placement matches; unknown classification is explicit.
- Historical applications and documents survive professional-stage transitions.
- Review/approval labels reflect evidence, never profile selection or uploads alone.
- Desktop and 320px/393px mobile layouts remain compact, with the established keyboard/viewport behaviour.
- All credential and document access remains enforced by session and ownership checks.

## Integration record

Implemented server-persisted career profiles through `/api/user/career`, with validated dates, explicit professional-stage confirmation and practicing-license details required for transition to licensed scientist. A transition or changed active registration details clears credential-review status; it never grants approval. Existing documents and applications are retained.

Intern dashboards now adapt to Seeking placement and In training. They use stored opportunities/applications, recorded placement dates and reminders; no training-progress percentage or completion is fabricated. Training readiness excludes placement-search preferences. Licensed scientists retain their dashboard and receive a career overview with experience/preferences and recorded license reminders.

Settings provides the role-appropriate private vault, including statement of result and placement letter; licensed profiles can upload an optional certificate. New document kinds retain the existing ownership and applicant-access guards. Employer applicant/pipeline views receive the candidate's professional/placement stage and applicable documents, while private reminders and training notes are omitted from those responses.

Discovery filters by server-owned career stage, saved locations and supported role preferences, retaining historic applications across transitions. Direct applications and invitations reject mismatched professional stages. Recorded expired application deadlines are rejected. Scans use server-owned career stage; email digests use the same discovery preferences. Vacancy posting/editing includes deadlines and document requirements. Internship approval labels require independently recorded official-source evidence and a review timestamp, separate from company review.

Additive migration `20261012010000_candidate_profiles` was applied to the configured database with `scripts/apply-candidate-profiles.cjs`. Prisma Client was regenerated. Existing rows were not reclassified or deleted. The script does not record migration history; use the baseline-aware deployment procedure before Prisma migration deployment.

Automated validation: lint, type checks and 104 tests passed; production build passed. Coverage includes persisted stages, incomplete/invalid training data, explicit professional transitions, role-specific discovery/application guards, historical applications, private document access, approval evidence and employer response privacy.

Browser validation: the user created and confirmed a dedicated Intern account. Seeking placement and In training dashboards rendered, saved dates/stage survived full navigation/reload, and incomplete training data was rejected. Mobile checks at 393px and 320px showed no horizontal document overflow; profile inputs measured 20px. The temporary TEST ONLY training record was cleared and the account restored to Seeking placement. No applications, invitations, approvals or files were created/deleted for this test.

Local database pool timeouts were observed during development. Redundant dashboard/profile reads were removed and stalled connections cleared; the subsequent populated checks completed. This is not a production latency benchmark.

Preview artifacts:
- `/private/tmp/benchscout-intern-dashboard-mobile.png`
- `/private/tmp/benchscout-intern-training-mobile.png`
- `/private/tmp/benchscout-intern-training-desktop.png`
- `/private/tmp/benchscout-intern-profile-mobile.png`

Next release check: complete the employer UI regression check, repeat on the iPhone, then deploy compatible code/schema and test production HTTPS authentication.

## Scope audit — 13 October 2026

The core separation is implemented; this proposal is not a claim that every suggested extension is complete.

| Area | Status |
| --- | --- |
| Shared account, persisted professional stage, both intern stages | Implemented |
| Education, registration, placement, preferences and reminder fields | Implemented |
| Separate Seeking placement and In training dashboards | Implemented |
| Role-specific private vaults and readiness | Implemented |
| Server-side role/location/preference filtering and application/invitation guards | Implemented |
| Preserved history and deliberate licensed transition | Implemented; covered by automated tests |
| Employer stage/document labels and posting requirements | Implemented; populated employer browser check pending |
| Approval-source/review metadata | Implemented; actual institution/programme evidence requires manual review |
| Availability-based matching | Partial: availability is stored; listings lack comparable start-date metadata |
| Licensed dashboard interviews/offers summary | Partial: existing metrics/scanner and new career/license overview retained; dedicated summary not added |
| Placement pipeline acceptance | Partial: offer/accepted records counted together; In training is explicitly recorded separately |
| Mobile compactness | Desktop viewport checks at 320px/393px; physical iPhone check pending |
| Production release | Not deployed to Vercel in this integration |

13 October compactness refinement reduces panel padding, heading scale, row gaps and notices; summary cards stay two per mobile row, with single-column opportunities/forms and readable 20px mobile inputs. No authentication, stage transitions or saved account data are changed by this styling pass.

The compact Seeking placement dashboard was rechecked with the populated dedicated Intern account at 393px and 320px: no horizontal document overflow. No saved profile fields were changed during the styling check.
