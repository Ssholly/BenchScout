# Next product improvements

The strongest initial outcome is a credible application reaching a real employer, with a candidate able to see what happens next.

- **Saved searches and source health:** show the last successful fetch per provider, failed-source warnings, and changes since the previous scan. Add fixture tests for every external adapter, application deadlines, and employer confirmation of whether a role is still open.
- **Candidate-controlled talent discovery:** offer an explicit opt-in to appear in employer searches, with separate consent for sharing contact details and documents. Until that exists, sourcing is limited to previous applicants to an employer.
- **Internship pathways:** distinguish approved training centers from employer declarations, preserve the evidence and expiry of center accreditation, and publish real intake deadlines.
- **Application follow-ups:** let candidates set reminders and track their own notes separately from statuses controlled by employers. Persist personal calendar events per account rather than browser-only storage.
- **Salary confidence:** display sample size, reporting period, and regional experience bands. Suppress overly narrow groups until enough contributions exist; avoid treating small samples as market rates.
- **Credential review operations:** add reviewer accounts, an append-only audit trail, expiry-based review invalidation, and an evidence queue. Keep AI extraction and independent verification visibly separate.
- **Reliable background work:** migrate scheduled scans and mail delivery to a durable queue with retry leases and provider status tracking as usage grows.

Engineering follow-up: continue splitting the remaining large employer, scheduler, and settings views into feature components; add staging browser tests; and measure source freshness, completed applications, and employer responses before expanding features.
