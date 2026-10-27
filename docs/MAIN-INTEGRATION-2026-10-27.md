# Main integration — 27 October 2026

## Prepared scope

Replace the old July source on main with the validated testing history, keeping the currently served Production artifact unchanged. Current remote main is a56fba3641004184e8bd5ddee87a51eb6b5a4fec; its merge base with testing is itself, so the integration has no source conflicts. Starting testing head: b7d852f. Runtime source and migrations match the currently deployed reviewed application source 4eb3e2c8486cb8532aa400106d1bc306c9c8cb5a; later changes are operational helpers, their tests and documentation. No new runtime schema migration is introduced by this integration.

Vercel still tracks main as its Production branch with automatic custom-domain assignment enabled. A normal unguarded main merge could silently rebuild and replace the reviewed live deployment. Added `git.deploymentEnabled` entries in vercel.json disabling automatic Git deployments for main and this integration branch only. Other branches retain Vercel's default deployment behaviour. The existing daily cleanup definition remains exactly 17 2 * * *; the currently active public artifact and its schedule are not changed by this source-only integration.

Official reference: [Vercel Git configuration](https://vercel.com/docs/project-configuration/git-configuration). File-level Git deployment controls do not prohibit an authorised manual CLI deployment or future removal of this setting. Future releases still require an exact staged build, reviewed environment/schema, explicit promotion and post-promotion alias/schedule verification. This is not a replacement for GitHub branch protection; main is currently unprotected and this task does not change repository permissions.

## Integration and rollback boundaries

Prepare release/main-integration-20261027 from the current testing head, run the complete source checks/build in an isolated checkout without local .env files and with a blocked database, then push only that branch and open a draft PR against main. Keep main unchanged until the exact resulting head and deployment-suppression evidence are reviewed and the owner approves merging. Do not enable PR auto-merge or request a new Production build as part of source preparation.

Before any approved merge, recheck the remote main/head refs, PR mergeability and deployment controls. After merging, verify the exact main result, absence of a new Production deployment, public/testing/diagnostic/maintenance alias mappings and unchanged cleanup registration. Do not roll Git history backward or redeploy July source. If the Git integration unexpectedly creates a build, stop before promotion and inspect provider state; do not treat a local timeout as cancellation.

The intended merge preserves full history, including completed recovery and scheduled-run evidence. Existing Production secrets, databases, files, test accounts, domain/provider choices and billing remain unchanged. The public deployment remains dpl_9CMj8YniwM7cWcNm8WfEzmpGowsf unless separately approved. No new mail is part of this work.

## Validation status

Fresh validation passed: full lint, TypeScript and **301 tests**, optimized webpack production build, and diff whitespace checks. The isolated checkout has no local environment files; DATABASE_URL was blocked and document backup disabled for validation. Application/runtime/migration paths have zero diff from live source 4eb3e2c. Official Git/cron schema sections validate the new configuration; schedule preservation and both exact disabled branches were asserted. The full upstream schema advertises draft-04 but contains incompatible newer keywords in unrelated experimental-trigger definitions; relevant Git/cron sections were therefore validated separately without claiming a successful whole-schema validation. Earlier runtime acceptance, bounded restoration and scheduled cleanup evidence remain separate. Remote suppression evidence and exact main merge remain pending; no main merge or public promotion has occurred.

## Publication checkpoint

Validated source/guard commit: 175375779299c536af5e89a9e30c173c159410b9. Git merge-tree produced exactly the candidate tree with no conflicts. Remote main remains a56fba3; remote testing remains b7d852f. Vercel project root is the repository root, Production branch main, automatic domain assignment enabled, current cleanup deployment 9CM, and bypass count zero. These read-only observations confirm the root guard applies to the intended project and that the live schedule was not changed.

Automatic approval review rejected pushing the new branch because publishing the new branch/operational documentation to a public repository requires explicit owner approval. No branch was published and no PR was created; remote ref readback confirmed absence of the integration branch. A prepared [PR description](MAIN-INTEGRATION-PR-2026-10-27.md) is available for review. Request only publication of this candidate and creation of a draft PR first, then verify provider suppression before any separate main-merge approval. The worktree and local commits remain available; do not bypass the publication rejection through a different tool.

## Approved publication and draft PR completed

Owner explicitly approved publication of exact head **b5939ebadcb8376453bae2f3df75c281f1e71860** and draft PR creation in the public Ssholly/BenchScout repository. Published only release/main-integration-20261027. [Draft PR #1](https://github.com/Ssholly/BenchScout/pull/1) is open against unchanged main a56fba3, contains 151 commits/348 changed files, has no merge conflicts and remains **draft, not merged**. The connector's PR-write permission returned 403; the already-authorised action completed through the signed-in owner browser. No account/integration permission was expanded.

Provider exact-commit filtering shows **No deployments match the current filters** for the approved head; a bounded recent-20 inventory also contains no candidate/ref match. GitHub reports zero commit statuses/check runs for the suppressed head; hosted CI is not claimed. Local 301-test/lint/type/build checks are the validation evidence. Suppression behaviour is observed for this integration branch; the eventual main merge needs separate verification.

All five aliases remain unchanged: public 9CM, testing D6, diagnostics F5, git-main maintenance 3JS and retained hotfix EcY. Active cron remains 9CM with 17 2 * * *, Production branch main, bypass count zero. A concurrent read-only provider query stalled; bounded follow-up reads/dashboard completed successfully. No deployment, promotion, main merge, database/file operation, credential change or mail occurred.

Automatic approval review separately rejected publication of this new outcome-documentation commit to testing because the owner's approval named only b5939eb and draft creation. The new outcome is recorded locally and remains unpublished until explicit approval. The approved PR head is unchanged. The next approval can bundle marking PR #1 ready/merging the exact head into main with publication of this documentation-only record to testing; do not include a public rebuild/promotion or data/credential changes. Abort on head/base drift and verify aliases/schedule after merging.
