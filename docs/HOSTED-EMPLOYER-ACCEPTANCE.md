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
| Separate synthetic candidate signup | Prepared in a separate tab with licensed stage/name/approved alias. No password entered by agent or signup submitted. |
| Administrator authentication | Form prepared, fixture employer lookup populated, key blank. Earlier successful queue check remains historical evidence; this run has not loaded it yet. |
| Account creation / unconfirmed login denial | Pending operator credential entry/submission and hosted result. |
| Employer and candidate confirmation emails | Pending send, receipt, branding/mobile display and role-correct testing link confirmation. Request success, provider acceptance and recipient receipt must be recorded separately. |
| Confirmed employer still needs company review | Pending confirmed login and blocked publication/applicant access checks. |
| Company submission/review and evidence persistence | Pending synthetic submission, review through current revision and feedback/status refresh. |
| Vacancy pending moderation then discovery | Pending synthetic posting, independent vacancy review and candidate feed check. |
| Candidate private upload, selected application and duplicate handling | Pending synthetic CV/attachment selection, save/reload and employer roster checks. |
| Document permissions and employer scope | Pending selection-only access, unrelated-role/ID denial, replacement and withdrawal checks on hosted deployment. |
| Employer shortlist/interview and candidate notification | Pending date/time validation, persisted status, in-app notification and approved inbox receipt. |
| Closure, suspension and cleanup | Pending. Record exact surviving fixtures and cleanup outcome; do not imply cleanup before verifying it. |

### Operator credential handoff

The browser tool requires the operator to enter new account passwords and submit the creation forms. The prepared employer and candidate forms have blank password fields. The administrator's existing key is retained only by the operator and must be entered privately in the prepared review console. The agent does not retrieve it from provider settings or publish it.

Prepared request: create both accounts with separate passwords of at least 12 characters; re-enter the employer password in its returned login form without submitting; load the admin queues with the existing key without saving any decision; leave confirmation links unopened until the unconfirmed login check. No completed signup/email receipt/review is claimed merely from preparation.

### Findings to verify during the journey

- Employer registration currently says “Already verified node?” and its company/contact inputs have no accessible names in the browser tree. Password-length guidance is absent on this employer page although the server requires at least 12 characters. These are identified UI issues, not yet repaired.
- Interview API validates calendar date and HH:MM shape, but source currently contains no future-time check. Confirm the intended scheduling constraint and test an elapsed Africa/Lagos date/time before claiming LA-16 complete. No past interview has been submitted on hosting in this pass.

### Release and limits

No product code, schema, provider setting or hosted review changed during preparation. Full hosted acceptance and pilot readiness remain pending. Confirmation links and new credential entry are operator steps; a successful isolated runner or build does not close these gates.
