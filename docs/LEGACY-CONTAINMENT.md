# Legacy public-app containment — 21 October 2026

Prepared on isolated `hotfix/legacy-containment`, based on the public July source `a56fba3641004184e8bd5ddee87a51eb6b5a4fec`. This is a temporary service pause, not the full hardened application release. No live deployment, main merge, provider change, migration, document copy/deletion or credential change has been performed.

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
