# Next product improvements

The strongest initial outcome is a credible application reaching a real employer, with a candidate able to see what happens next.

- **Saved searches and source health:** show the last successful fetch per provider, failed-source warnings, and changes since the previous scan. Add fixture tests for every external adapter, application deadlines, and employer confirmation of whether a role is still open.
- **Candidate-controlled talent discovery:** offer an explicit opt-in to appear in employer searches, with separate consent for sharing contact details and documents. Until that exists, sourcing is limited to previous applicants to an employer.
- **Internship pathways:** distinguish approved training centers from employer declarations, preserve the evidence and expiry of center accreditation, and publish real intake deadlines.
- **Application follow-ups:** let candidates set reminders and track their own notes separately from statuses controlled by employers. Persist personal calendar events per account rather than browser-only storage.
- **Salary confidence:** display sample size, reporting period, and regional experience bands. Suppress overly narrow groups until enough contributions exist; avoid treating small samples as market rates.
- **Credential review operations:** add individual reviewer accounts, expiry-based review invalidation and a candidate-credential evidence queue/audit trail. Company, vacancy and report queues plus their append-only decision history are implemented; candidate-license and internship reviews still use their existing record fields. Keep AI extraction and independent verification visibly separate.
- **Reliable background work:** migrate scheduled scans and mail delivery to a durable queue with retry leases and provider status tracking as usage grows.

Engineering follow-up: continue splitting the remaining large employer, scheduler, and settings views into feature components; add staging browser tests; and measure source freshness, completed applications, and employer responses before expanding features.


## Implemented: employer and vacancy safety — 16 October 2026

[Company submissions and manual evidence checks](EMPLOYER-VERIFICATION.md) now cover registration, recruiter authority, organisation presence and applicable operating credentials. New/edited vacancies require independent review; candidates can report suspicious listings; administrators can remove listings or suspend employers with recorded evidence. Company changes pause approval and active vacancies. Existing company approvals are preserved as legacy approvals for deliberate re-review.

Database migration and local checks are complete; hosted deployment, populated staging scenarios and mobile verification are pending. Follow-up work includes reviewer accounts, scheduled company revalidation, administrator/report-resolution notifications, an appeal flow and cross-account takedowns for copies of the same external source URL. CAC/provider automation is not part of this implementation.
## 19 October 2026 — Launch audit priorities

The [launch audit](LAUNCH-AUDIT.md) supersedes any assumption that the pilot is ready. Confirmed application-flow defects were fixed locally with 165 passing tests and a successful build. Next: allowlisted employer professional summaries and candidate preview, selective document-sharing/retention design, candidate-review concurrency checks and full staging acceptance. Naming remains parallel work. No hosted release was performed for this audit pass.
