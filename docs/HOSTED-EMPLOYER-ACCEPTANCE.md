# Hosted employer recruitment acceptance

## 20 October 2026 — In progress

Target: the existing `testing` branch alias, https://bench-scout-git-testing-sholly.vercel.app/. Dedicated testing database and private store were established in the earlier cutover; this run must not use local `.env` as a shortcut to the original database. Previous isolated acceptance is separate evidence, not a hosted journey pass.

The operator authorised a synthetic employer/candidate recruitment journey and approved two role-specific aliases of an inbox they control for account confirmation and interview messages. Addresses, passwords, administrator key, confirmation tokens, private URLs and message bodies are omitted from repository evidence.

### Fixture boundaries

- Company: `QA ONLY - BenchScout Pilot Laboratory 20261020`; recruiter: `Synthetic QA Recruiter`.
- Candidate: `QA ONLY - Synthetic Candidate 20261020`, licensed career phase, synthetic PDF documents only.
- Company registration/authority/operating details and reviews must explicitly say synthetic testing evidence. Do not pretend a fictitious company has real CAC registration or professional accreditation.
- Any eventual vacancy must begin `QA ONLY` and state that it is not a genuine opening. Use the protected testing deployment only. No real recruitment selection or real company/credential approval.
- No real candidate profile/CV is used. Switching roles signs out the existing testing candidate session; the account and documents remain intact.
- Scope cleanup to recorded fixture IDs and synthetic document prefixes. Preserve review evidence and use closure/suspension for normal workflow checks; do not broadly delete testing data or reset the database.

### Current evidence and checkpoints

| Check | Status / evidence |
| --- | --- |
| Candidate session cannot enter employer portal | Passed: visiting `/employer` while signed in as candidate redirected to `/home`. |
| Signed-out employer signup | Passed entry point: employer portal displayed login and Create employer account; synthetic company/contact/approved alias prepared. No password entered by agent or signup submitted. |
| Separate synthetic candidate signup | Operator reported creation. Fresh hosted profile showed the exact synthetic candidate name/approved alias in an authenticated session; no agent password entry. This does not independently verify inbox appearance. |
| Administrator authentication | Passed: operator loaded the queue; one authorised synthetic company approval saved. Key cleared after successful save by existing UI design; next queue load needs operator entry. |
| Account creation / unconfirmed login denial | Synthetic candidate authenticated session observed. Operator completed employer creation; hosted employer login displayed the specific confirm-email rejection. The employer unconfirmed-account gate passed; candidate negative check was not performed. |
| Employer and candidate confirmation emails | Original employer button reported missing; fallback deployed and one resend completed. Operator confirmed successful email confirmation and normal employer login succeeded. Fresh branding and candidate inbox appearance remain unverified. |
| Confirmed employer still needs company review | Passed before approval: confirmed employer was denied posting and directory access; Retry preserved denial. |
| Company submission/review and evidence persistence | Passed: synthetic submission, authorised approval, feedback/status refresh and full employer reload persisted Company reviewed. |
| Vacancy pending moderation then discovery | Passed pending-to-active moderation transition: one pending vacancy with zero published; separate current-revision QA-only review saved, then full reload showed Active and one published. Candidate discovery passed; the approved synthetic role appeared in Job Matches. |
| Candidate private upload, selected application and duplicate handling | Synthetic PDF CV uploaded through the hosted profile file chooser; successful response displayed the fixture filename. CV-only application and full reload passed; Applied shows one Application Sent card. Later synthetic optional upload persisted without changing the displayed submission selection. Employer roster/download/denial checks remain pending. |
| Document permissions and employer scope | Pending selection-only access, unrelated-role/ID denial, replacement and withdrawal checks on hosted deployment. |
| Employer shortlist/interview and candidate notification | Passed positive hosted path: future-time validation deployed, employer/candidate interview state persisted, matching in-app notification/calendar and approved inbox receipt confirmed. Fresh mobile form checks remain open. |
| Closure, suspension and cleanup | Pending. Record exact surviving fixtures and cleanup outcome; do not imply cleanup before verifying it. |

### Operator credential handoff

The browser tool requires the operator to enter new account passwords and submit the creation forms. The prepared employer and candidate forms have blank password fields. The administrator's existing key is retained only by the operator and must be entered privately in the prepared review console. The agent does not retrieve it from provider settings or publish it.

Prepared request: create both accounts with separate passwords of at least 12 characters; re-enter the employer password in its returned login form without submitting; load the admin queues with the existing key without saving any decision; leave confirmation links unopened until the unconfirmed login check. No completed signup/email receipt/review is claimed merely from preparation.


### 20 October 2026 — Candidate created; sequential role handoff

The operator reported creating the candidate and seeing every prepared tab return to the candidate/home view. Browser inspection confirmed the named synthetic candidate was authenticated. Source inspection of `components/SessionGate.tsx` confirms that a `benchscout_identity` storage change sends other tabs to `/home`; focus restoration also redirects stale identities. The same browser profile shares the session cookie and account cache. Separate tabs therefore do not isolate candidate/employer sessions. This safeguard was retained, not bypassed or disabled.

While that synthetic candidate was signed in, the agent uploaded the generated `benchscout-synthetic-skills.pdf` through the profile modal. The upload completed and the displayed filename changed only on success. No real CV was used and no AI request was made. The synthetic candidate was then signed out so the employer form could be restored. The new candidate account and CV are intentionally retained for the remaining application journey; cleanup is not complete.

Restored `/employer` in signup mode with the same synthetic company/contact and approved employer alias, password blank. Reopened `/admin/reviews`, restored the fixture lookup and left the key blank. Revised the handoff to **employer signup only**, with account roles tested sequentially; the administrator credential will be entered after the employer login so another identity change does not discard the prepared secret. No additional account, review decision or email was submitted by the agent.

### Findings to verify during the journey

- Employer registration currently says “Already verified node?” and its company/contact inputs have no accessible names in the browser tree. Password-length guidance is absent on this employer page although the server requires at least 12 characters. These are identified UI issues, not yet repaired.
- Interview API validates calendar date and HH:MM shape, but source currently contains no future-time check. Confirm the intended scheduling constraint and test an elapsed Africa/Lagos date/time before claiming LA-16 complete. No past interview has been submitted on hosting in this pass.

### Release and limits

No product code, schema, provider setting or hosted review changed during preparation. Full hosted acceptance and pilot readiness remain pending. Confirmation links and new credential entry are operator steps; a successful isolated runner or build does not close these gates.


### 20 October 2026 — Employer created; confirmation action reported missing

Operator completed the employer credential step. The prepared login displayed the server's specific unconfirmed-email rejection; no credential value was read or changed. Employer account confirmation receipt is operator-confirmed, but the user reported no visible action button. No company approval or verified login is claimed.

The shared email helper already included the expected button. Added a second visible, underlined full action URL to confirmation/reset layouts and verified identical URLs and offline SMTP MIME preservation. This improves action-link resilience while leaving the unobserved inbox rendering cause unresolved. [Account emails](ACCOUNT-EMAILS.md) and [scrubbed action-link evidence](qa/2026-10-20-account-email-action-links.json) record the checks. Publishing the patch and requesting one fresh confirmation to the already-approved employer alias precede further company-review testing. The login tab is retained without refreshing so the operator-entered credential stays private and available for the normal login action after confirmation.


### 20 October 2026 — Confirmed employer and directory error repair

The email fallback release `88dd81f` deployed successfully to testing. After one approved resend, the operator reported successful confirmation; the prepared normal employer login succeeded. The synthetic company submission persisted as Awaiting review, and the operator unlocked the administrator queue, which displayed exactly that pending company and no vacancies. No company decision has yet been saved.

While still unapproved, the employer attempted posting and received “Your employer account needs review before publishing jobs or accessing candidates.” No vacancy was created. Previous applicants incorrectly displayed an empty-directory message after a failed request. Repaired the client to preserve API denials, distinguish network/malformed-response failures, clear previous results on refresh, and show a persistent alert with Retry. Request sequencing and identity checks prevent abandoned responses repopulating the directory. The existing API, review requirements, scope and permissions are unchanged.

Validation: `npm run check` passed lint, TypeScript and all 216 tests; webpack production build passed. Four new client tests cover review denial, server/invalid responses, real empty versus populated success, location encoding and network failure. No migration or configuration change. This directory repair is locally validated; deployment and hosted denial/retry verification remain pending. Application, review approval, interview, document-scope and cleanup acceptance remain incomplete.

Hosted follow-up: `4857fb1` deployed successfully as Vercel `5yC26qaDDXZo2LYgAbw6U2PgaQUY`. Reloading only the employer portal preserved the unlocked admin draft. Previous applicants showed the exact review-required denial; Retry returned to the same denial without showing an empty list or candidates. The company remains pending. A synthetic-only approval draft is prepared; saving would grant recruitment/applicant access and therefore requires action-time browser confirmation. No decision has been saved. A stable invalidation callback also removes the effect-cleanup lint warning; lint, TypeScript, 216 tests and build passed again.


### 20 October 2026 — Synthetic company approved; vacancy still moderated

After explicit action-time operator approval, saved the prepared company decision. The console returned “Decision saved. Reload the queue before the next review.” Refresh status showed Company reviewed and the exact synthetic-only reviewer feedback. A full employer-page reload preserved that state. This simulates the software approval path only; no real CAC, recruiter or regulator validation is asserted.

Submitted one clearly labelled QA-only licensed-scientist vacancy with CV required and the no-fee declaration. It persisted after reload as Awaiting review: one vacancy, zero published, zero applicants. Company approval therefore did not automatically publish this vacancy. Candidate-feed exclusion has not yet been checked independently.

The existing admin client intentionally clears its secret and loaded queue after each successful review (`app/admin/reviews/page.tsx`). Retained this behaviour. The next vacancy review is prepared with Review type Vacancy; the operator must privately re-enter the existing key and load the queue. No vacancy decision, application, interview or cleanup has yet occurred. No product code/schema/configuration changed during these checks.


### 20 October 2026 — Separate vacancy approval persisted

The operator privately loaded the next queue, which showed zero pending companies and exactly one pending synthetic vacancy. Selected that current vacancy revision and inspected the role, location, terms, required CV and no-fee declaration. Saved a separate QA-only approval with explicit synthetic authority/authenticity/no-fee evidence; no real hiring opening or professional accreditation was claimed. The console confirmed Decision saved and cleared the key/queue again.

After a full employer reload, the same fixture showed Active and the monitor showed one published vacancy, zero applicants. This establishes the pending-to-active transition through independent vacancy review. Candidate discovery, application/document scope and notifications remain pending. The next step switches sequentially to the operator-created synthetic candidate account; existing credentials stay private.

Additional UI finding: at the observed desktop portal width, the posting form's flex options row compressed deadline/required-document labels into narrow columns. Repair and responsive validation remain pending; this does not close the UI audit.


### 20 October 2026 — Candidate discovery and CV-only application persisted

Observed the exact synthetic candidate profile after the operator's private sign-in, including the retained CV and licensed phase. Job Matches displayed the active QA-only employer vacancy with Employer reviewed provenance and no personalised score. Opened the Application Toolkit: required CV was selected, missing optional documents disabled, professional-summary sharing off, and the employer/document-access disclosure visible. Submitted only that synthetic CV.

After full reload, Job Matches excluded the submitted role and Applied showed exactly one Application Sent card for that role. The card explicitly listed CV as the document selected at submission. The posting viewer offered Back to pipeline without another Apply action. This verifies normal UI repeat prevention and one persisted record; a second hosted POST/idempotency assertion was not performed.

Uploaded the same explicitly synthetic PDF into the optional certificate vault slot after applying, without any AI request or claim of real certification. It persisted after a settings reload. Returning to Applied still showed only CV selected. Employer-side denial of the later-uploaded optional file, selected CV download, roster count and status/interview remain pending. No real profile/document, schema, configuration or product code changed. Synthetic application and both private fixture documents remain for continuation.


### 20 October 2026 — Employer roster and selected CV; future-time repair

The authenticated synthetic employer showed one applicant. Its roster displayed the exact synthetic identity, professional summary unshared, and only the selected CV link. Opening that application-scoped link rendered the known one-page synthetic PDF successfully. No optional-file link was offered. A direct same-application request with the optional certificate kind was blocked by the browser client (`ERR_BLOCKED_BY_CLIENT`), so this is **not** counted as an API denial pass; no workaround around the browser block was attempted.

Before sending an interview, source inspection confirmed that the existing PATCH handler checked only date/time formats, permitting past schedules. Added shared calendar/time/future validation, used by both the employer form and PATCH before database, notification or email writes. Interview inputs are interpreted in Africa/Lagos (UTC+01:00), independent of browser/server timezone; the current or any earlier instant is rejected with HTTP 400 by the API. Existing stored schedules and non-interview status updates are unchanged. Form labels now explicitly name Africa/Lagos and are associated with their date/time inputs. No schema/configuration change.

New regression cases cover previous dates, elapsed/current minutes and exact-now boundary, future same-day dates, UTC/Lagos midnight crossover, invalid/non-string dates/times and leap days. Local checks, deployment and hosted past-rejection/future invitation acceptance are tracked below; no interview email has yet been sent in this hosted run.

Local validation: lint without warnings, TypeScript, all 220 tests, final-source webpack production build and diff check passed. Testing deployment and hosted schedule checks remain pending.


Hosted schedule follow-up: `49e5108` deployed successfully as Vercel `6ThBhP6CvRi9H6qkbpLzckENZqoC`. A populated past schedule displayed “Choose a future interview date and time (Africa/Lagos)” and remained unsaved. At 320px, responsive inspection found the time input ending at x=361.8, beyond the viewport. Replaced the inflexible date/time flex row with an adaptive grid and zero-minimum-width cells, stacking when two usable columns cannot fit. Local rechecks, deployment and 320/390px hosted verification of this layout follow-up are pending. No interview email has yet been sent.


Interview delivery follow-up: saved one valid future synthetic interview for 21 October 2026, 10:00 Africa/Lagos, with a QA-only location saying no real interview/attendance is required. The employer roster showed Interview Confirmed. The operator confirmed receiving the test email with correct details. This is recipient-confirmed delivery, not merely a server send result. Candidate in-app notification, scheduler and persisted status after role-switch remain pending.

The adaptive interview-grid follow-up passed lint, TypeScript, all 220 tests, production build and diff check. It adds no new API/schema/configuration or test email. Hosted 320/390px form verification remains open: the fixture has already been shortlisted, and the existing roster currently offers no reschedule control to reopen its form. Do not claim a post-fix hosted layout pass from the earlier failing measurement. Keep this checkpoint for a pending synthetic application later in the journey; no extra feature or fabricated test state was introduced solely to reopen the form.


Release/persistence: adaptive-grid commit `87bebfd` reached the testing alias through successful Vercel deployment `HpTxd6mR2biKSpbs5UGhBn6838Ak`. Before switching roles, a full employer reload and fresh roster fetch preserved Interview Confirmed, 21 October 2026 at 10:00. Signed the synthetic employer out and prepared Scientist login for the synthetic candidate. Operator entry of its existing private password is required for the next in-app/scheduler checks. Mobile form recheck, direct unselected-file server denial and remaining closure/withdrawal/suspension acceptance remain open.


### 20 October 2026 — Candidate interview, notification and calendar passed

Observed the authenticated synthetic candidate's one application in Interviewing, with only CV selected. Its in-app Interview scheduled notification matched the QA-only company/role, 21 October 2026, 10:00 Africa/Lagos and no-attendance test location. On Master Scheduler, October 21 showed exactly one Confirmed Interview event at 10:00 AM for the same role/company. Opened the event editor and selected Save without changing fields; the app rejected this with “Action events are managed by the employer.” No candidate override or manual event was saved.

Email receipt was already operator-confirmed in the prior step; the candidate UI observations now complete the positive hosted notification/calendar check. Source inspection shows withdrawal currently deletes the application row (including its stored interview fields) rather than a reversible withdrawn status. Prepared the exact synthetic application for action-time operator confirmation before that deletion. Planned next: withdraw this test application, verify its removal/calendar/grant revocation where observable, then submit a fresh CV-only application to the still-active QA vacancy so the pending-applicant interview form can receive fresh 320/390px checks. No withdrawal/reapplication has yet occurred, and no real data is involved. No product code/schema/configuration changed in this step.


### 20 October 2026 — Authorised withdrawal and fresh CV-only application

The operator subsequently authorised the previously declined withdrawal/reapplication check. Withdrew the exact synthetic Interviewing application through Applied. Applied became empty; the role returned to Matches. Opening October 21 in Master Scheduler showed zero events and no synced interview. These are observed successful UI outcomes; no real application/account/vault document was removed. The historical delivered test email is not recalled.

Opened a fresh toolkit for the same active synthetic vacancy. CV was selected; the synthetic optional certificate was now available but explicitly left unchecked. Submitted once. Applied showed exactly one Application Sent card, zero Interviewing, with CV as the sole selected document. Employer confirmation of the new application ID/count, old-grant revocation and fresh responsive interview-form checks remain pending.

Started the operator-requested compact layout repair across employer posting, applicant roster and candidate match cards. Details and local/deployment/visual status: [Recruitment layout](RECRUITMENT-LAYOUT.md). No further interview has been saved or email requested in this step.


### 20 October 2026 — Fresh employer roster and responsive forms verified

After the operator's private employer login, the vacancy still had exactly one applicant. The fresh roster was pending (Shortlist & Schedule available), showed only the selected CV, kept summary sharing off and did not offer the available but unselected certificate. Its application-specific CV link had a new application ID and rendered the known synthetic PDF. Requesting the withdrawn application's original CV URL was blocked by the browser client; no 403/HTTP status was exposed in the targeted browser log. Record old-grant rejection as unverified at API level, not a proven pass. No workaround was attempted.

Compact posting-form bounds passed at 320/390/1200/1440px; roster/card/control bounds passed at 320/390/1200px with no horizontal or content overflow. Visually reviewed the desktop posting options/roster and 320px roster. Opened the pending application's interview form without saving: date/time fields were each 254px wide at 320px and 324px at 390px, all within viewport. The 320px screenshot showed both fields and the submit control fitting. Closed both dialogs; no new interview/email was created. This closes the previously pending responsive interview-grid check. Final equal-width primary field columns and whole-label control styles are tracked in [layout evidence](RECRUITMENT-LAYOUT.md).

Current synthetic state: reviewed company, one active QA vacancy, one fresh pending CV-only application, two private synthetic documents. The earlier interviewed application is withdrawn; its synced calendar event cleared. No real candidate/employer data changed. Remaining broader audit cases (closure, suspension, replacement and direct denial/idempotency HTTP checks) remain open.


Final compact-layout release: `7aaabef` deployed successfully as Vercel `HMr8UtkBPqP2cdAVKZoVtmurbhiC`. Final 320/390/1200/1440px posting/control measurements found no overflow; location/salary columns are equal on desktop and stacked on mobile. Final desktop form and 320px options screenshots passed visual review. The testing employer page remains available for operator review, viewport reset, with one fresh pending application and no replacement interview. All code/layout/evidence updates were pushed to testing; no production release or migration occurred.


### 20 October 2026 — Closure/suspension/replacement phase prepared

The operator authorised continuation of remaining safety checks. Browser inspection found the synthetic candidate session active, so prepared its CV replacement first to avoid an unnecessary role switch. Confirmed the exact synthetic identity, one retained application and the existing private CV/optional certificate. Generated a distinct one-page PDF labelled QA ONLY - Replacement CV version 2, containing no real personal data; the replacement has not been uploaded.

Source inspection confirms upload replacement saves the new object/metadata before permanently removing the old stored object. Prepared the candidate profile Update control and requested action-time confirmation for this old-file removal, as required by the browser tool's permanent-deletion policy. The application and optional certificate are outside this replacement action. No file, vacancy or review changed yet.

Read-only preparation also confirmed vacancy closure updates status to closed without cascading application deletion, and employer authentication re-reads current database verification for existing sessions before verified-employer routes/document grants. These are source observations; fresh hosted closure/suspension/replacement outcomes remain pending. No product code/schema/configuration change.
