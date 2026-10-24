# Timed isolated restoration drill — 24 October 2026

Status: **prepared, not executed**. No recovery branch has been created by this checkpoint. This is the next bounded launch-readiness exercise, not a new product feature or public cutover. [Overall launch position](LAUNCH-CHECKPOINT-2026-10-24.md).

## Prepared resource and authorization boundary

Neon **BenchScout Testing**, parent branch named `production` (this is the testing project, not the live BenchScout project). Prepared child **qa-full-recovery-20261024**, historical target **24 October 2026 18:50:36.235 Africa/Lagos** (17:50:36.235 UTC), auto-delete **after one day**. The console currently reports six-hour history and one branch. Refresh the target and approval if the history window expires; do not silently substitute another target.

Creating the branch copies testing records, including private document references, password hashes and sessions. It requires action-time approval before clicking Create because it creates another database access surface. No credentials were revealed or entered during form preparation. Do not bind this copy to public/testing Vercel aliases, email providers or cron. No Production records/files or public domain are to be changed. No paid plan/service is included.

## Drill and measurable finish point

1. Start the execution timer immediately before the approved Create attempt. Record the actual requested recovery target, resource identity, database-ready time, operator waits and any retries. Provider fork seconds alone are not end-to-end recovery time.
2. Verify copied database identity, migration checksums and expected relationships with aggregate/boolean queries. Expire copied sessions and reusable confirmation/reset credentials **only in the isolated copy**, before connecting an app. Preserve the source testing environment and Production.
3. Inventory the known QA candidate’s current file kinds in the restored copy. Use encrypted **testing** archives to reconstruct only synthetic QA files into an isolated private recovery prefix. No current source deletion is required. Treat the source bytes as unavailable for recovery; do not fetch the live source as a shortcut. Compare authenticated recovered bytes with recorded QA fixture integrity evidence and flag any unavailable archive/version. No real candidate document is included in the file-recovery exercise.
4. Reconcile source-to-restored URL mapping only in the recovery copy. Preserve the original document selection and revocation rules: remap an approved current version only when its exact old identity matches; never substitute a replacement CV for an older unshared selection. Keep a private mapping outside Git and do not publish raw URLs.
5. Run the approved application source on loopback against this isolated database and recovery files, with outbound mail locally captured/disabled and no scheduled trigger. Use separate recovery-only session/admin secrets as needed; require private operator entry for credentials when applicable. Verify restored QA login, authenticated file read, anonymous denial, cross-account denial, restored-session rejection and preserved withdrawal/closed-vacancy/suspended-employer restrictions. Do not grant real employer access or reopen any vacancy.
6. Stop the service-recovery timer only when the agreed database/file/access checks pass. Report total wall time including operator waits, separate active/blocked segments, final counts, failures and scenario limits. No numeric production RTO/SLA is promised before measurement and owner acceptance.
7. Stop the local restored app, retain the branch under its approved one-day expiry, and document the exact restored QA file/prefix cleanup scope. Do not delete source files or unrelated backups. Any irreversible cleanup beyond the approved auto-expiry needs scoped authorization.

## Pass/fail boundary

A pass needs all three components in the **same isolated restored application**: validated database state, recovered synthetic private bytes and expected HTTP access decisions. Database fork, decrypt-only canary and HTTP mocks remain separate evidence until integrated. Missing historical file versions or revocation evidence are failures/limits to report, not permissions to revive stale grants. Production’s current-file-only archives and finite database history do not guarantee that every historical database point has all corresponding file versions.

This first drill measures a testing scenario. It does not certify recovery after total provider/account compromise, independent key loss or a Production outage. No branch, file restoration, copied-session mutation or timing result is claimed yet. The planned expansion ends at these acceptance criteria; general queue, design and business features are outside it.
