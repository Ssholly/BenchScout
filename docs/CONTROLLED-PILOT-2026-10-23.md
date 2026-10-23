# Controlled pilot reopened — 23 October 2026

## 23 October 2026 — Approved Settings hotfix released

Public `bench-scout.vercel.app` now serves exact approved source **3ecf303** / **dpl_3mF9yJiLtE45yXzXyMoshdiHUbCx**. All thirteen public GET access checks passed; the existing signed-in owner session survived refresh and Settings loaded. A single navigation observation was 893 ms, with automation overhead; this is not a latency guarantee. Cleanup registration matches the new artifact at 03:17 Lagos, with actual scheduled invocation still pending. Testing/diagnostics are preserved, git-main remains maintenance, bypass count is zero and the previous safe pilot Cfj remains rollback. No data/schema/file mutation, key change, main merge or new email occurred. Mobile sizing edits are not included. [Execution and evidence](SETTINGS-PERFORMANCE.md#approved-public-execution--23-october-2026).


**BenchScout is available at https://bench-scout.vercel.app.** The owner explicitly approved the controlled reopening and recorded recovery limits. Existing Production build `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`, source `082c225a86a1ec582ceb2e27faf276f82b8a7994`, was promoted without a rebuild. No main merge, testing-data import, real-file backfill or new test email was performed.

## Execution and acceptance

Fresh guards confirmed exact project/team, Ready source and rollback, previous aliases and zero bypass entries. Neon recovery was rechecked immediately before promotion: BenchScout / production, six-hour history, no snapshots/schedule; earliest displayed restore point was 23 October 09:38 Africa/Lagos. No restore or upgrade occurred.

Vercel promotion succeeded. It moved both public and git-main aliases; the separately approved restoration returned git-main to maintenance. Testing, protected diagnostics and hotfix mappings were preserved. Final provider metadata confirms the candidate is current Production and project bypass count remains zero.

| Domain | Final deployment |
| --- | --- |
| `bench-scout.vercel.app` | `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` — reopened pilot |
| `bench-scout-git-main-sholly.vercel.app` | `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV` — maintenance, provider-protected |
| `bench-scout-sholly.vercel.app` | `dpl_F5uCLS312DAkTGAGdUZbWqaUYYrg` — existing protected diagnostics |
| `bench-scout-git-testing-sholly.vercel.app` | `dpl_D2mYf5k3qc892X4TVoRZ3jnoWWjD` — preserved testing |
| `bench-scout-git-hotfix-legacy-containment-sholly.vercel.app` | `dpl_EcY1anTy6tVPnmAoagf5WCRk2Bed` — preserved containment |

All **13 public GET checks passed**: root/employer HTML 200, removed setup/test-email endpoints 410, and anonymous/forged-session protected API/cron dry-run JSON denial 401. Protected API denials carry no-store. No valid account credentials, real document identifier, normal worker call or email action was used. The real browser loaded the `/home` career hub in guest state and the Scientist login form is prepared for private owner sign-in.

The initial smoke wrapper required anonymous git-main 503 and marked its combined result false when it saw 302. Inspection established that 302 is specifically the Vercel `/sso-api` authentication gate after git-main became a noncurrent protected deployment. Exact alias mapping plus that provider gate is the accepted maintenance check; no application failure was hidden or private authenticated access claimed. Public checks themselves all passed on that first run. No rollback was required.

One immediate read-only metadata command was not started because automatic approval review timed out. The permitted single retry completed; this did not affect the already completed promotion or create another deployment.

## Scheduler registered; first execution not yet observed

Project metadata now registers `/api/cron/document-cleanup` on the promoted candidate with `17 2 * * *`: nominal **03:17 Africa/Lagos daily**, with Hobby timing limits. The host is the candidate's immutable deployment hostname. This closes the previously empty-definition registration gap. It does not prove a successful scheduled invocation. Observe the next scheduled run and record its provider/function result separately; do not dispatch the normal cleanup worker as a read-only check or invent a successful tick. The current job may process legitimate server-recorded deletion intents once due, as included in the owner's cutover approval.

The existing correct-key/wrong-key dry-run evidence belongs to this exact artifact before promotion. It was not repeated with a retained private key copy: that copy had already been removed. No new protection bypass or secret was created.

## Public browser session accepted — 23 October follow-up

The owner privately signed in through the prepared public Scientist form. The operator observed the signed-in application pipeline, refreshed it fully and confirmed the session persisted, navigated to Profile & documents and waited for the preferences form to finish loading, refreshed that page successfully, then returned to Applied without another login prompt. No profile/preferences were saved and no manual document operation, logout or new email request was performed. Password and cookie values were not read; account identity is excluded from the committed evidence. This closes the public browser persistence/read-only profile check, not new email-link delivery or cookie-attribute inspection. [Scrubbed acceptance](qa/2026-10-23-public-session-accepted.json).

## Remaining work

1. **Completed:** owner-initiated public sign-in and operator-verified session persistence/read-only profile navigation. New confirmation/reset-link delivery remains outside this check; request it separately if needed.
2. Observe the actual scheduled invocation. Registration is passed; invocation is pending.
3. Refresh the guarded older-file preview and obtain separate real-document copy/stale-archive cleanup approval after confirming the live hooks. Three older files remain unbackfilled. Keep the public apply gate disabled.
4. Prepare the main merge under an approved automatic-deployment/domain-assignment plan. July main is unchanged and must not be redeployed. No testing database transfer is required.

## Recovery and rollback

The owner accepted six-hour database history, an unmeasured full recovery duration and the unbackfilled three-file interval for this controlled pilot, and remains the initial recovery contact with the separately protected encryption-key copy. This is not a full-service restore certification. Returning public to maintenance `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV` remains the safe availability fallback; preserve all eight migrations, records and stable keys. Alias rollback does not reverse writes or disable every immutable deployment.

[Full scrubbed execution record](qa/2026-10-23-controlled-pilot-reopened.json); [approved decision scope](CUTOVER-DECISION-2026-10-23.md); [current release packet](PUBLIC-RELEASE-PACKET.md).
