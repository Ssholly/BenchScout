# Location and placement scan correction — 13 October 2026

## Confirmed defects

- A manual All Nigeria scan used the requested location, but `/api/jobs` filtered the resulting feed through saved Abuja preferences afterward.
- MyJobMag uses `q`; the previous `job_q` query was ignored and returned unrelated recent jobs. Its result cards did not provide the location field the old parser expected.
- HotNigerianJobs now exposes postings through `.jobheader`, not `.job-item` / `.job-desc`.
- Internship classification missed plural `Interns` titles.
- Provider item limits used outdated keys: Indeed now uses `maxItemsPerSearch`; the configured LinkedIn actor uses `limitPerSource`.
- Scan completion text incorrectly called matched listings “listings checked,” obscuring empty source results versus filters.

## Changes

Persist a server-owned `lastScan` summary in the candidate profile JSON after a successful scan. The feed uses this actual scope while retaining historic applications. Profile edits preserve the summary unless the professional stage or location preferences change. Clients cannot replace the summary through profile editing. Scheduled scans still use saved preferences.

Parse the current public-board markup, retrieve two bounded search/category pages, and enrich up to 18 relevant postings per source in batches of six. Extract published locations and explicit calendar deadlines; known expired postings are rejected. Intern titles may be singular, plural or explicitly labelled internship. Ordinary scientist jobs are not converted to placements. Approval remains unconfirmed without separately reviewed evidence.

Interns can choose a scan location and disable email delivery directly from their dashboard. A persistent summary records retrieved, matched and new counts plus source warnings. Selecting a location affects the next scan; it does not itself run a scan.

## Validation

Lint, type checks and 111 tests passed. Tests cover nationwide feed scope, profile metadata ownership, plural intern roles, ordinary-job rejection, current source markup, detail locations/deadlines and correct provider request limits.

A read-only public-board check, with paid providers disabled and no database writes/emails, retrieved six matching internship listings across Ebonyi, Imo, Anambra and Abuja. A licensed check matched 34 listings across multiple Nigerian states at a minimum score of 70. Listings from different boards can describe the same vacancy; these are source-listing counts, not a promise of six distinct placements. Results and deadlines can change. This does not certify institution approval or confirm application submission.

The fixed `testing` branch deployment is the release target. Production remains a separate release decision.
