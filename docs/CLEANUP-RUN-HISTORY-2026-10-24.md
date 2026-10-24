# Cleanup run history — 24 October 2026

Status: implemented and locally validated; additive migration applied to **BenchScout Testing only**. Hosted testing deployment/UI, invalid-key denial and valid-key history read passed. Production is unchanged. The earlier three-file backup is accepted separately.

## Why execution remains unverified

Provider log requests could not reach the overnight run: Hobby runtime retention is one hour and older request history requires a paid entitlement. The current endpoint returned counts without storing evidence. A configured schedule and a successful manual dry run do not establish automatic execution. Vercel Hobby schedules have hourly precision, so the configured `17 2 * * *` is a daily 02:00–02:59 UTC / 03:00–03:59 Africa/Lagos window, not a guaranteed 03:17 execution.

Official references reviewed 24 October: [runtime retention](https://vercel.com/docs/logs/runtime), [cron execution and timing](https://vercel.com/docs/cron-jobs/manage-cron-jobs). No plan upgrade was purchased.

## Implemented behavior

Authenticated cron-endpoint and explicitly confirmed administrator cleanup calls create a RUNNING operational record before processing. If the initial record cannot be stored, those entry points do not start deletion. The existing immediate post-upload cleanup path, five-item worker bounds, reference checks, leases, retry/alert rules and physical-deletion authorization are unchanged. Successful completion stores timestamps and counts. Failures persist only a generic error code; incomplete persistence/function termination can leave RUNNING and must be treated as unknown, not success. A completion-record failure can occur after cleanup; do not infer that files were retained merely from an HTTP failure or zero/default counts.

Terminal status is SUCCEEDED for a complete clean result, ATTENTION for failed/referenced/leased items, or FAILED for execution/recording failure. These describe this invocation; they do not certify that the whole queue is empty. No automatic retry, new alert, watchdog or missed-run detector is added. Operator review remains required. Dry-run/status/history actions do not process files or create run records.

`DocumentCleanupRun` stores a UUID, entry point, optional deployment ID, request-agent boolean hint, start/finish times, status/error code and aggregate counts. No account IDs, document URLs, keys or raw errors are stored. Rows are retained until a separately reviewed retention policy is implemented; the pilot creates about one scheduled row daily plus confirmed administrator runs. `POST /api/admin/document-cleanup` adds `action: runs`, returning only the newest 20 records under the existing administrator key, same-origin check and three-per-minute limit. Existing `status` response remains unchanged; processing responses additionally return runId. The backup-operations page adds **Check recent cleanup runs** in Pending document deletion.

A `vercel-cron/1.0` agent is recorded only as a hint. A holder of the cron key can make a manual request with that header; neither the header nor this table independently proves scheduler provenance. Correlate a new cron-endpoint row, its deployment/time window and provider invocation metadata to accept actual automatic execution. Do not fabricate past runs or label a manual execution scheduled. HTTP auth/cross-origin failures occur before recording; missing rows can therefore indicate authentication failure as well as missing invocation.

## Validation and applied migration

Lint, strict TypeScript, all **296 tests** (nine new run-history tests) and an optimized webpack build passed. The isolated build used a blocked database destination. Tests cover wrong/missing auth, read-only no-write actions, initial-audit failure preventing work, counts/status and partial results, generic error privacy, interrupted recording, explicit admin confirmation and manual-vs-cron entry points. No real files were deleted or emails sent by tests.

On Neon **BenchScout Testing**, database `benchscout_testing`, the exact SQL and a synthetic default/update case first passed within an explicitly rolled-back transaction. Readback confirmed no table remained. The additive migration then committed the empty table/index and its Prisma checksum; post-commit readback reports audit_rows=0 and checksum_matches=true. Candidate/employer/application rows and files were not part of either transaction. This SQL check does not establish hosted Prisma/HTTP execution.

## Production review and rollout

Production requires separate approval for the empty operational table and release. Exact migration: `20261024000000_document_cleanup_runs`; checksum recorded in [QA evidence](qa/2026-10-24-cleanup-run-history.json). Prepared guarded SQL checks `current_database() = neondb`, refuses an existing migration record, creates one table/index and records the exact checksum atomically. No existing business table is altered. Do not deploy new processing code against Production before this migration: initial audit persistence deliberately fails closed if the table is absent.

After approval: verify project/branch/database mapping and apply only this migration; confirm an empty table and matching checksum. Build the exact tested revision with existing Production keys, public origin, backfill gate off and normal cleanup schedule, preserving the current public artifact for rollback and diagnostics/testing/maintenance aliases. Do not trigger processing merely to manufacture scheduled evidence. Read-only operator history should initially be empty. Observe the next daily scheduling window and inspect within provider retention for corroboration; an unfinished/failed/missing run is not accepted. Rollback can restore the prior application artifact while retaining the audit table/rows; verify the active cron registration explicitly because provider instant rollback does not itself update cron definitions. No main merge, backfill, paid upgrade or new test email is included.

## Hosted testing checkpoint

Exact source **4eb3e2c8486cb8532aa400106d1bc306c9c8cb5a** is Ready as **dpl_D6i3a87oxQ3R8Gfu98tPqCpcB2Na** (`bench-scout-ktqointc5-sholly.vercel.app`); original project, Preview target and exact source were verified before assigning the established testing alias. The existing synthetic session restored. The new history control was observed; a deliberately invalid administrator value returned Unauthorized and cleared the input. At 320px the new button spans x=31 to289 with 44px minimum height. Viewport override was reset. A valid-key read-only `runs` request is handed to the operator; no deletion, new run or Production migration is claimed by this checkpoint.

Prisma's generated before/after schema delta exactly matches the reviewed migration. The guarded Production execution script is available for review at [SQL plan](sql/2026-10-24-production-cleanup-runs.sql); it is not applied. Production remains **dpl_EA6N74nt32g56QbkiJQWZPwMvrAt** until the additive migration and tested release are separately approved. Previous artifact EA6 is the proposed rollback; diagnostic F5 and git-main maintenance 3JS must be preserved.

## Hosted valid-key acceptance

The operator entered the existing testing administrator key and requested only **Check recent cleanup runs**. Independently observed the same reported success response: `runs: []` with the provenance/unfinished-outcome notice. The empty list is expected because no processing invocation was made after migration. This accepts the deployed administrator route, Prisma table read and result display; it does not establish scheduled or manual cleanup execution. The key field cleared and the deletion confirmation remained unchecked. Production migration/release remain pending approval.

The proposed Production action is exactly the reviewed additive migration plus release of application source **4eb3e2c8486cb8532aa400106d1bc306c9c8cb5a**, retaining EA6 for rollback. It does not authorize a manual deletion run to manufacture scheduler evidence. Existing daily cleanup permission/schedule is unchanged; only its future run records are added. After rollout, accept actual scheduling only after correlating the next overnight invocation with provider evidence. Main merge, paid upgrades and the full-restoration drill remain separate.
