# Production runtime acceptance — 21 October 2026

Status: diagnostic implementation and staged-deployment preparation; **hosted Production execution has not passed yet**. Public GET checks returned HTTP 200 at the live homepage and HTTP 404 at `/api/admin/document-backups`. The live July release lacks the new backup endpoint. Saving configuration did not activate backup protection on that deployment.

Local validation passed: lint, TypeScript, all **239 tests** (19 backup-focused tests), webpack Production build and `git diff --check`. The built operator screen was inspected at 320px: document width 320px, visible action controls within x=31–289, with no horizontal overflow. No administrator key was entered or diagnostic action submitted during this layout check. These results validate implementation, not hosted Production services.

## Controlled staged build

Vercel supports a staged Production build using Production environment variables while withholding domain assignment: `vercel deploy --prod --skip-domain`. It is available on all plans. This is a real Production-connected runtime, not an isolated testing database. Source: [Vercel environments](https://vercel.com/docs/deployments/environments#verifying-a-production-build-before-promotion), [CLI deployment](https://vercel.com/docs/cli/deploying-from-cli).

Before deployment approval, record the exact tested commit, clean working tree, project/team, and confirm no automatic domain promotion. Use project **bench-scout**, team **sholly**. The Vercel CLI is not currently installed/authenticated in this workspace; authenticate through the official operator flow if needed, without exporting provider credentials. Link the existing project rather than creating another. Do not use an unqualified `--prod` deployment, merge main or promote a deployment during diagnostic acceptance.

The repository build command generates the Prisma client and builds Next.js; it does not apply database migrations. A staged deployment uses the new saved Production bindings. It leaves the current live domain on its existing deployment. Generated deployment URLs can still reach live services; use existing deployment protection and administrator authentication, and do not expose credentials or copy real files into QA fixtures.

## Diagnostic API and operator screen

All actions use `POST /api/admin/document-backups` with existing administrator authentication, same-origin enforcement, no-store responses and a limit of three requests per minute. The screen is `/admin/backups`; it clears the administrator key after each request. Normal API rate-limit bookkeeping may write operational rows; the diagnostics do not change candidate/employer/application records or sharing grants.

| Action | Scope and evidence |
| --- | --- |
| `runtime-readiness` | Queries `current_database()` on the running connection, compares the returned name to the configured URL database, and returns a SHA-256 fingerprint of normalized configured hostname/database plus build/environment and backup configuration booleans. No account records, raw hosts, URLs, passwords, tokens or document bytes are returned. Connectivity/name equality alone is not intended-target proof: compare the fingerprint privately against the expected live target and require the staged build identity. |
| `runtime-storage-check` | Requires `VERCEL_ENV=production`, synthetic test mode off, enabled/valid backups and exact confirmation `DELETE RUNTIME QA ONLY`. Creates a UUID-scoped new QA source, verifies its encrypted separate-store backup, deletes only that generated source, verifies absence, decrypts/restores into a new QA location, verifies exact bytes and submits deletion of that generated restored object/archive. Accepts no caller-provided source/account/path. Uses the same recovery probe as the testing drill. No pass after provider errors or content mismatch. |
| `runtime-alert` | Requires Production, synthetic test mode off and `SEND RUNTIME ALERT`. Sends one clearly labelled QA delivery test through the normal failure-alert mail path to the configured operator-approved Production recipient. Ignores caller recipients. Submission is not inbox receipt. |

Existing `synthetic-restore`, fixed-candidate backfill and testing-alert actions remain blocked in Production. The new Production maintenance actions are explicit administrator controls; they do not enable synthetic test mode or allow backfilling real accounts through the testing tool.

## Execution and pass criteria

1. Obtain explicit approval to deploy the tested source as staged Production, without moving the live domain or merging main. Record deployment ID/generated URL and expected source commit. Verify deployment protection through the provider UI before running diagnostics.
2. Run readiness with the existing Production administrator secret entered privately. Require environment Production, expected build identity, successful database connection/name comparison, expected target fingerprint, enabled/configured backups, approved-alert presence and test mode off. Compare the expected fingerprint using only a private local calculation of the intended live connection hostname/database, normalizing the Neon `-pooler` hostname suffix; never print the original URL.
3. With explicit QA-only write/deletion approval, run the storage check. Require source loss, exact decrypted bytes and restored private read-back flags. Independently inspect the source/archive stores for cleanup. `cleanupSubmitted` alone does not establish provider completion. A failed probe may leave only its generated QA objects; inspect before any scoped cleanup.
4. Run the approved alert test and obtain recipient-confirmed inbox receipt. Do not induce an actual backup failure or include document/account data. Observe the three-per-minute shared limit when repeating checks.
5. Record results and limitations before proceeding to the guarded older-file backfill plan. The canary does not protect existing candidate files, prove bulk restoration, verify recovery-key custody or provide independent provider disaster recovery.

Stop on target mismatch, wrong environment/build, storage/alert failure or missing cleanup. Keep the old live domain unchanged. No promotion or main release is authorised by diagnostics approval; promotion requires a separate final review of outstanding release gates. Removing an environment binding does not revoke credentials embedded in older deployments.
