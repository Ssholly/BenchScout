# Legacy public-app containment — 21 October 2026

## 22 October 2026 — Approved July deployment retirement completed

After separate explicit operator approval, `bench-scout-git-main-sholly.vercel.app` was assigned to the existing approved maintenance deployment `dpl_3JSXjPv2JjgTBNE3gwXVSiqJFTaV`. The maintenance page was observed in the browser. Fresh provider lookup verified the old July deployment had no aliases and all other mappings were unchanged. Vercel `remove --safe` then removed only `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ`. Its immutable homepage now returns **404 / DEPLOYMENT_NOT_FOUND**. Complete post-removal inventory (74 entries, null next cursor) excludes that ID and retains every currently aliased deployment. Only the approved git-main mapping changed.

The two approved retirement operations have removed **31 deployments** in total. Database records, stored files, credentials and Git source remain intact; public service remains on maintenance. This does not certify all remaining historical writers or future old-main builds. Final release controls must prevent redeploying unsafe source, and other remaining deployed revisions still require review before claiming a global write pause. The earlier prepared/preserved entries below are dated history superseded for this ID. [Execution evidence](qa/2026-10-22-old-main-retirement.json).

## 21 October 2026 — Approved public containment activated

The owner explicitly approved the temporary public-app pause. Reviewed containment `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f` is Ready as [Production deployment 3JSXjPv2JjgTBNE3gwXVSiqJFTaV](https://vercel.com/sholly/bench-scout/3JSXjPv2JjgTBNE3gwXVSiqJFTaV); provider audit/Git metadata both match. Only the public `bench-scout.vercel.app` domain was intentionally assigned to containment. Vercel temporarily auto-assigned the generated team alias during skip-domain staging; it was restored to the existing protected diagnostic deployment before public activation. Fresh alias lookup confirms diagnostics remains `dpl_12r5Zwn4tyffsUTnH3YF9tMrNqXh`; testing retains its independently updating testing alias. The protected git-main alias still targets July source, so this is **not** global write revocation.

Public browser review displays the branded update notice. Ten safe hosted method/path checks passed terminal 503, no-store, Retry-After and expected notice/JSON. These include upload GET/POST/DELETE, reset POST, setup POST, cron OPTIONS and debug-email POST. Dangerous legacy setup/debug GETs were not invoked. No database/storage mutation, migration, real-file copy/deletion, session/credential change, main merge or old-deployment deletion occurred. Sign-in, applications, uploads and public-domain dispatch are paused until the compatible hardened release; no reopening time is certified. Historical callers on other protected URLs are outside this pause. [Exact scope and next deletion-reconciliation gate](LEGACY-CONTAINMENT.md); [evidence](qa/2026-10-21-legacy-containment.json).


Prepared as `336c6edf06f8e8a3f0a3fafb43f81feac9c1546f` on isolated `hotfix/legacy-containment`, based on the public July source `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`. This is a temporary service pause, not the full hardened application release. No live deployment, main merge, provider change, migration, document copy/deletion or credential change has been performed.

## Behavior

All old app pages and API route files are removed from this isolated deployment source. A single optional catch-all route returns terminal HTTP 503 for GET, HEAD, POST, PUT, PATCH, DELETE and OPTIONS. `/api` requests receive a stable generic JSON error; other paths receive a responsive branded update notice explicitly explaining that sign-in, applications and uploads are paused. There are no database/storage/mail calls, environment reads, handler fall-through, credentials, forms or scripts in this route. No per-user request value is echoed. Headers set no-store, Retry-After 300 seconds, nosniff, frame denial, no-referrer, noindex and a restrictive CSP.

The build uses Next.js 16.2.6 from the existing lockfile and compiles only the containment route/helper. The old ignoreBuildErrors setting is removed; strict TypeScript checks cover this purpose-built surface. Build no longer invokes Prisma generation. Existing unreferenced repository files/dependencies are historical source, not activated backend handlers. Build output has the catch-all function and framework not-found only.

## Availability impact and limits

Deploying this build on the public domain temporarily stops **all app/API activity**, including sign-in, password/confirmation links, uploads, recruitment actions, scans and cron dispatch. It performs no data migration or purge. It does not revoke existing sessions/credentials or stop older immutable deployments accessed by authorised users. Existing Standard Protection must remain enabled; older-deployment retirement/write isolation remains a separate gate. Do not use public-domain containment as proof of a global enforced write pause for backfill.

## Verification

Twelve focused tests pass, including seven supported methods on eleven page/API paths and proof that only the terminal catch-all remains in `app`. Scoped lint, strict TypeScript and production webpack build pass. Built-server HTTP checks pass for 70 method/path cases, including seven expected trailing-slash 308 normalisations ending in 503; no real database/storage/mail was used. Visual review and geometry checks at 320/390px show no horizontal overflow. Unsupported HTTP methods may be rejected by the framework rather than this route; no legacy route exists to handle them.

## Activation and rollback

Obtain explicit owner approval for the public service pause after reviewing the exact commit and screenshot. Link the existing Vercel project and create a protected reviewed deployment without reassigning the public domain first. CLI-generated team aliases can change even with skip-domain; preserve the current diagnostics alias mapping deliberately before executing any staging command. Do not silently replace the active diagnostic URL. Avoid automatic main merge/promotion. Refresh current alias identities before assigning only the intended public domain to the approved containment deployment. Verify the provider source identity and terminal 503 on public homepage/API paths before calling the legacy surface contained.

If activated, keep the notice until the compatible hardened release passes its remaining gates. Do not roll back to unsafe July handlers for availability alone. A corrected containment build is the safe response to notice/build defects. No promise of a reopening time or independent disaster recovery is made.

The containment branch is pushed for review: [exact source](https://github.com/Ssholly/BenchScout/tree/336c6edf06f8e8a3f0a3fafb43f81feac9c1546f). No merge/promotion is implied by that push. Local preview: `http://127.0.0.1:3184`. Public service-pause approval is pending; do not report the live legacy code fixed before verified activation.

## Hardened-release failure checks in parallel

Six new isolated fault-injection tests in `tests/upload-failure-boundaries.test.cjs` cover anonymous/other-account requests, failed storage, failed metadata commit, uncommitted cleanup failure and physical-removal failure. All 257 application tests pass. These mocks do not establish provider interruption behavior or solve source/archive/database atomicity. Delete still crosses physical removal and metadata update; a durable cleanup/reconciliation design remains the next implementation gate. No real document was uploaded/deleted by this pass.
