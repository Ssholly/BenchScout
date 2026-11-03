# Appearance and footer Production release — 3 November 2026

Status: **live**, following the owner's explicit instruction to push the accepted testing revision to Production.

## Exact artifact and scope

Approved source `fbe30bca81c4dde82db4de0399fd11108ef0f22c` was built as Production `dpl_9Lz7xwRxeX37mGxwAQdVMiCaoiF7` (`bench-scout-oyj211jpb-sholly.vercel.app`). The build was Ready, in the expected project `prj_MNrDsjvBMVCY5mmPjD3tSyw7OIBs`, with matching source metadata, no aliases and the existing cron definition before promotion. It now serves https://bench-scout.vercel.app.

Includes saved light/dark appearance and shared palette, mobile search sizing/spacing, automatic iOS status styling with an opaque top and 32px lower-edge blend, footer guidance beneath copyright, and an aligned Help & guidance / Contact support row. Guidance opens in-flow; the approved temporary support link opens an email draft to success.sholly5@gmail.com without sending automatically. Desktop header Help remains available, with the old unverified support address removed.

The owner confirmed the testing status-bar fix on iOS 27.0.1, accepted the lower-edge blend and latest aligned footer, then requested this release. That testing acceptance is distinct from a new physical-device Production check.

## Build and release validation

- Compared 231 app/component/library/schema/test/script/config files: no differences between the validated working source and isolated release checkout. The checkout was clean and contained only the committed `.env.example`, with no local credential files or unrelated unpublished business packs.
- Fresh `npm run check` passed lint, strict TypeScript and all **306 tests**. Check log: `/private/tmp/benchscout-production-appearance-check-20261103.log`.
- Provider Production build passed. Built with explicit public canonical URL `https://bench-scout.vercel.app`, backup enabled, test mode off and backfill apply off. Existing Production database/store/key configuration was reused; no credential value was displayed or changed.
- After promotion, all **13 GET-only public checks passed**: page loading, retired setup/test-email endpoints, anonymous/forged-session denial and unauthorised cleanup denial. No authorised cleanup worker, email or document action was invoked. [Scrubbed results](qa/2026-11-03-appearance-public-access.json).
- Public Brave checks verified the released toggle, light preference after reload, theme-colour `#edf5fd`, light mobile header `rgb(237,245,253)`, 90% viewport metadata, absent pinned native status-style tag, 32px header fade, in-flow Help open/close with keyboard and correct mailto.
- At 320px, document width was 320px and both footer controls shared the same top coordinate and 36px height. 390px also had no horizontal overflow. Screenshot `/private/tmp/benchscout-production-appearance-20261103.jpg`. Viewport override reset; public tab retained for review.

These checks do not establish a new authenticated hiring journey, email receipt, backup restoration drill, native Production screenshot or actual cron invocation. Existing recovery limits and pilot acceptance records remain separate.

## Preserved mappings, schedule and rollback

Previous live `dpl_9CMj8YniwM7cWcNm8WfEzmpGowsf` / `bench-scout-4ixd5y3y3-sholly.vercel.app` is retained as rollback. No old deployment was deleted. If critical release checks fail, promote that retained Production artifact and recheck the mappings/schedule; no failure requiring rollback occurred in this release.

Fresh post-promotion provider readback preserved all non-public mappings:

| Alias | Deployment URL retained |
| --- | --- |
| Testing | bench-scout-lmr99e5ll-sholly.vercel.app |
| Protected diagnostics | bench-scout-8vrlhm9fq-sholly.vercel.app |
| Git-main maintenance | bench-scout-4a95ak60v-sholly.vercel.app |
| Legacy containment maintenance | bench-scout-arjibrqgd-sholly.vercel.app |

Production target and cron registration both identify the new artifact. Daily `/api/cron/document-cleanup` stays `17 2 * * *` (03:17 Africa/Lagos). Registration was verified; no scheduled invocation was manually triggered or independently verified here. Deployment protection remains `all_except_custom_domains` with zero bypass tokens. No protection bypass was created.

No GitHub push/main merge, database migration, account/profile/file mutation, new test email, token rotation, provider account or paid upgrade accompanied the release. Source remains in the working workspace and the isolated local release history at `/private/tmp/benchscout-appearance-testing-20261102`; source publication is separate from this approved hosting release.
