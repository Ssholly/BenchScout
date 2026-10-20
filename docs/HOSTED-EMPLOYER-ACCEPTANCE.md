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
| Administrator authentication | Form prepared, fixture employer lookup populated, key blank. Earlier successful queue check remains historical evidence; this run has not loaded it yet. |
| Account creation / unconfirmed login denial | Synthetic candidate authenticated session observed. Operator completed employer creation; hosted employer login displayed the specific confirm-email rejection. The employer unconfirmed-account gate passed; candidate negative check was not performed. |
| Employer and candidate confirmation emails | Employer receipt operator-confirmed, but its confirmation button was reported missing. Shared-template backup action URL added; deployment/resend and fresh inbox review pending. Candidate inbox appearance remains unverified. |
| Confirmed employer still needs company review | Pending confirmed login and blocked publication/applicant access checks. |
| Company submission/review and evidence persistence | Pending synthetic submission, review through current revision and feedback/status refresh. |
| Vacancy pending moderation then discovery | Pending synthetic posting, independent vacancy review and candidate feed check. |
| Candidate private upload, selected application and duplicate handling | Synthetic PDF CV uploaded through the hosted profile file chooser; successful response displayed the fixture filename. Application/selection, reload, employer roster and document download/denial checks remain pending. |
| Document permissions and employer scope | Pending selection-only access, unrelated-role/ID denial, replacement and withdrawal checks on hosted deployment. |
| Employer shortlist/interview and candidate notification | Pending date/time validation, persisted status, in-app notification and approved inbox receipt. |
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
