# Candidate professional summaries — 19 October 2026

## Behaviour

Candidates can preview a professional summary in Settings → Career profile and choose “Share my professional summary with verified employers I apply to”. Sharing is **off by default**, including existing profiles. Saving the career profile persists the choice. It applies to existing and future application relationships; turning it off removes the summary from subsequent employer API responses. Copies already downloaded/exported cannot be recalled.

This summary is a live view of saved information, not an immutable application snapshot. Profile edits update it. The candidate sees the saved shared summary in the direct-application dialog before submitting; a failed profile-preview read offers Retry and disables direct submission until the profile read succeeds. A successful opted-out read allows submission without the optional summary. External job-board links retain their existing flow.

The employer applicant drawer and Previous applicants cards show the summary when shared. When off, the employer sees a clear not-shared message and can use the existing application/CV. Company approval, vacancy ownership and previous-application scope remain required; this does not create a public candidate directory.

## Explicit data allowlist

- Professional stage and intern placement-stage label; identified as self-reported.
- B.MLS institution and graduation year, when provided.
- Licensed scientists: years of experience, specialties and preferred employment types, when provided.
- Preferred placement/work locations (falling back to the saved primary location), availability date and relocation preference.

Excluded: registration numbers, credential identifiers/review references, salary preference, current training institution/dates, private reminders, internal scan metadata and arbitrary JSON properties. The builder never spreads raw candidateProfile JSON. Summary details do not grant credential verification. Credential review and documents retain their separate controls.

Free-text fields are displayed as ordinary React text, with length limits; no HTML is rendered from candidate text. Candidates should review their own text before sharing it. Opting out of the summary does not revoke identity, professional-stage labels or document access already authorised by an application; those rules are explained separately in the application notice and [private-document record](PRIVATE-DOCUMENT-STORAGE.md).

## Implementation and contracts

- `candidateProfile.shareProfessionalSummary`: boolean stored in the existing User.candidateProfile JSON; normalization defaults strictly to false unless the value is boolean true. No new column or migration.
- POST `/api/user/career`: validates the optional flag is boolean and saves it with the profile on the authenticated candidate. Older clients omitting the flag preserve the current saved choice; invalid values return 400. Employers cannot change candidate consent.
- GET `/api/user`: includes top-level `professionalSummary` (object or null) for the authenticated candidate's saved sharing state.
- GET `/api/jobs/applicants?jobId=...`: includes `application.user.professionalSummary` (object or null) only after existing company and vacancy-ownership checks. The newly selected primary location is used for the summary fallback, not exposed as a new unconditional top-level applicant field.
- GET `/api/employer/talent`: includes `users[].professionalSummary` (object or null) for candidates who have applied to that employer. Existing location/contact fields remain as before.
- Summary shape: `{stage: string, fields: [{label: string, value: string}]}`. Raw candidateProfile remains absent from employer responses.
- Shared implementation: `lib/professional-summary.ts`, `components/ProfessionalSummary.tsx` and its CSS module. Settings uses the builder for the editable draft preview; own-profile and employer responses use the same builder behind saved consent. `ApplicationSharingNotice` displays the saved response in Matches.
- Dates in the summary use the supplied ISO calendar-date text. Fields are self-reported, not automatically authenticated.

## Tests and release

`tests/professional-summary.test.cjs` covers explicit field filtering, default opt-out, non-boolean rejection, intern field selection, matching owner/employer responses, consent enable/revoke/preservation, unchanged basic access and employer authorization denials. These are mocked integration/unit tests; populated hosted staging remains separate acceptance work.

No dependency, secret, provider integration or database migration was added for this feature. Release target is the existing `testing` branch and Vercel preview, together with the pending employer-safety and first launch-audit fixes. Actual validation/deployment evidence is recorded in [Deployment](DEPLOYMENT.md) and [Launch audit](LAUNCH-AUDIT.md). Production pilot readiness remains HOLD for document scope, credential-review races and complete staging acceptance.

19 October validation: `npm run check` passed lint, TypeScript and 172/172 tests; `npm run build` passed. Prisma migration status reports five migrations and an up-to-date configured database, and the read-only compatibility checker reports no missing columns. These checks do not establish that every hosting environment uses that same database.

Browser validation used the signed-in local Settings page: inspected the draft preview at 390px and 320px, keyboard-toggled sharing on/off without saving, and confirmed default-off was restored. At 320px the summary was within x=23–297 and document scrollWidth equalled the 320px viewport. The temporary viewport override was reset. No applicant decision, employer approval, application submission or saved sharing change was performed against real records. Full employer/staging acceptance is still outstanding.
