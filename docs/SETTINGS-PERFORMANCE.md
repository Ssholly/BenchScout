# Settings loading investigation and correction — 23 October 2026

Status: **implemented, locally validated and authenticated testing screen passed; not released to Production.** The current public pilot remains the separately approved source `082c225` until a new exact revision is approved and promoted. No database migration, secret change or account/file mutation is needed for this fix.

## Observed issue and evidence limits

The owner reported the Profile & documents screen spending too long at “Loading your settings…”. A live browser navigation from Applied to the loaded preferences heading took **3,167 ms** in one automation observation. That wall-clock interval includes browser automation overhead; it is neither an isolated API duration nor a statistically meaningful cold/warm performance benchmark. The earlier public-session acceptance established eventual loading and session persistence, not acceptable speed.

Source tracing established an avoidable serial read: the protected profile GET first reads the session, then its verified candidate, then fetches the same candidate again by email. The unselected full-row query also retrieved password/CV-text columns before response sanitisation removed them. The settings form waits for this response. Sidebar and settings already share overlapping transport reads, but completed responses intentionally are not cached. Vercel request records were inspected using field-only projections; the available request fields did not establish duration. Infrastructure/database wake-up or network delay can contribute, but no specific cold-start cause is proven by this investigation.

## Implemented change

- The profile route opts into a request-local candidate account projection during the existing verified-session guard. It reuses that same owner snapshot, reducing a successful profile GET from **three to two database reads**. No cross-request authorization/account cache is added.
- The projection explicitly excludes password hashes and extracted CV text while retaining the existing profile response fields. Raw private file URLs still pass through the existing document-proxy sanitiser. The ordinary `/api/auth/session` route keeps its previous slim selection and does not return this optional internal account snapshot.
- Caller email must still match the verified session; missing, expired, employer and revoked/unverified sessions retain their denials. Each subsequent profile request rechecks current database state. Profile POST/write handling is unchanged.
- Shared page reads remain `no-store`, share only pending transport, and now have a **15-second abort deadline**. This covers the fetch/body consumption rather than waiting indefinitely. Timeout rejection removes the pending transport so a retry can make a new request. Settings presents a specific timeout/retry message; existing details stay visible if only a refresh fails.

There is no promise that every settings load will be instantaneous. Removing one SQL round trip is not a measured one-third reduction in total page latency. Before/after hosted authenticated timing must be recorded after deployment; keep any infrastructure contribution separate from the demonstrated redundant work.

## Validation and deployment

Five profile-read regressions cover query count/projection, proxy-only document metadata, caller identity denial, fresh verification/data checks, anonymous/expired/employer denial and the slim ordinary session response. An additional shared-request regression covers timeout fan-out and a fresh retry; existing tests continue to require no completed-response cache and isolation across identities/invalidation.

Lint, strict TypeScript and **287 tests** passed. The webpack Production build also passed. Testing-hosted acceptance is recorded separately when complete. No new Production build/promotion, database migration, real-data mutation or secret retrieval is authorised by these local checks. Preserve the existing public artifact, scheduler and rollback until the exact tested fix is approved for release.

## Testing acceptance and proposed public hotfix

Exact source `3ecf30313f2dbfb069040abc0961cdd9a5de7767` built successfully as Preview `dpl_7grwerRWY63CrUsVT5zAYUBa4nxx` / `bench-scout-l8xb1vd4q-sholly.vercel.app`. The established testing alias was still pinned to an older artifact, so it was explicitly assigned to this verified Ready testing-branch deployment. Final readback confirms public remains `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm`, git-main remains maintenance, and diagnostics/hotfix mappings are unchanged.

The existing synthetic candidate session restored. Preferences loaded, navigation from Applied to Settings took **1,076 ms**, and full refresh to the loaded form took **4,229 ms**. Each is a single automation observation including tool overhead. These are different accounts/environments from the 3,167 ms public observation, so no before/after speedup ratio or guaranteed cold-load time is claimed. No settings save, account creation, document operation, new email or database migration was performed. [Scrubbed results](qa/2026-10-23-settings-performance.json).

The public fix needs separate approval because the earlier pilot approval named exact artifact `dpl_CfjXtpKfxDeThKRc8FfrEXeCHssm` / source `082c225`. Proposed scope: build a clean archive of exact validated **3ecf303** as staged Production with `--prod --skip-domain`, explicit public canonical origin at build/runtime, backups enabled/test mode off/backfill apply false, and unchanged daily cleanup schedule. Verify Ready project/source and preserved aliases before promotion; then promote only that artifact and repeat anonymous/forged-session smoke plus private browser settings timing. Retain existing keys/schema/data, testing and diagnostics; keep git-main on maintenance after provider promotion if it moves. On critical failure restore the currently live known-good artifact **Cfj** (or maintenance for safety containment) under the same scoped fallback, preserving kept aliases.

No main merge, secret rotation, real-file backfill, new synthetic Production account or new test email is included. This is a new code revision; do not silently treat the earlier source-specific approval as approval to replace the public pilot. The existing six-hour database history, unbackfilled three-file interval and pending actual scheduled invocation remain separate operational limits.
