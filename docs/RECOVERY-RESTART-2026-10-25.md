# Recovery drill restart — 25 October 2026

The 24 October attempt did not complete: database copy and copied-credential invalidation passed, but private credential entry did not finish, no files were restored and no integrated restored-app acceptance ran. Its elapsed period must remain recorded as an incomplete attempt, not a recovery time result.

The operator requested a restart after a generic validation rejection. The currently open Neon connection tab was for the source testing branch; this is a likely explanation, not confirmation of the submitted value, which was not inspected. The original recovery branch expires at 19:02 Lagos on 25 October. Its local entry server has been stopped to avoid collecting a connection that will soon expire.

Prepared but not created: qa-full-recovery-20261025 in BenchScout Testing, copying current data/schema from its source branch named production, with one-day automatic expiry. This is the testing project, not BenchScout Production. Creation requires action-time browser confirmation because it duplicates private database/authentication records. Before any app connection, invalidate copied sessions, confirmation links and reset links only inside the new copy, repeat migration/relationship checks, and bind the private entry allowlist to its newly verified endpoint.

Updated the private entry guards to report fixed field-specific corrections without interpolating credentials or raw provider errors. Invalid database, source token, backup token, encryption key and password formats now have separate labels. Five focused tests and syntax check passed; no actual credential acceptance, archive decrypt, file restoration, new database creation or Production action is claimed. Keep the existing testing encryption key and store tokens; no rotation is part of this restart. The full acceptance criteria remain those in TIMED-RECOVERY-DRILL-2026-10-24.md.

## 27 October restart preparation

Owner asked to revisit the recovery drill. Live Neon branch inventory now shows only the source branch in BenchScout Testing; the previous one-day recovery copy is absent. Renamed the still-unsubmitted create form to qa-full-recovery-20261027, with current data/schema and one-day expiry, and requested action-time approval for creation and copied-credential invalidation. No new branch has yet been created. The previous endpoint allowlist must not be reused. Following creation, verify the new branch identity and sanitize copied credentials before preparing its private entry form. Credential values must remain private; fixed field-specific validation is prepared locally, with no hosted release.

## 27 October recovery copy verified

On resuming after owner confirmed possession of the existing testing key, the browser already showed successful creation of qa-full-recovery-20261027 (br-round-mountain-b7uzwvyd) in BenchScout Testing. Creation was performed outside this agent turn; provider UI reports created 27 October 08:24:05 Lagos and expires 28 October 08:24:04 Lagos. No agent-side pre-create timer was captured, so no precisely measured end-to-end restoration time can be claimed for this attempt.

Verified the selected recovery branch and its endpoint before executing the copied-credential expiry transaction. The transaction committed: three session rows and one reset-token row updated. Readback: zero active copied sessions/confirmation/reset links; nine matching/completed migrations and zero unfinished; zero orphan applications; one QA candidate with current CV/degree/certificate references; one closed QA vacancy; one suspended/unverified QA employer; zero cleanup run rows. Source testing and Production were not targeted.

Updated the private form endpoint allowlist to this new recovery endpoint and restarted it on loopback. A credential-free browser POST passed the local origin/CSRF check. The five-field form awaits private operator entry; no stored secret values were read, no archive was decrypted and no file or application restoration has yet passed. The previous rejection now has fixed field-specific explanations.
