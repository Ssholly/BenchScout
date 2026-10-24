# 90% mobile release — 24 October 2026

Status: **live on Production after explicit owner approval**. This promotes the exact [validated testing preview](MOBILE-90-PREVIEW-2026-10-24.md), without a main merge or additional application changes.

## Released source and behavior

Source **e3bded29940f77fb77d525cd497b08fb90075bdf** was built from a clean Git archive in the original `sholly/bench-scout` project. Production build **dpl_8242kxsYFxz6qtrHFtsxNwqiA4oC** / `bench-scout-544x5qbrj-sholly.vercel.app` was Ready with exact matching source metadata and no aliases before promotion. Public `bench-scout.vercel.app` now serves this artifact. Previous public **dpl_2tcm2t75xXCL3Hcg5udHCRq7Lrco / e62934b** remains retained as rollback.

The release uses **initial scale 0.90**, a wider phone profile with a 480px CSS width cap, 17px name and 14px email/keywords/buttons, while retaining the 80dvh height limit. Compliance is centered on mobile with safe-area padding, bounded scrolling and outside-click/Close dismissal; desktop remains a side panel. Existing 19px account-entry text, side-by-side Home actions and collapsed employer preview are preserved. Pinch zoom remains available.

## Acceptance

The source's lint, strict TypeScript, optimized build and local/hosted testing geometry passed in the preview record. No new automated tests were needed for this CSS/layout-only revision. Fresh provider readback established the current public rollback and kept aliases before promotion. One read-only alias lookup's automatic permission review timed out; its one permitted retry succeeded. No new access token or protection bypass was created.

After promotion, all **13 GET-only public access checks passed**, including anonymous/forged-session denial and retired setup/test-email endpoints. The existing Production session survived refresh and Settings loaded. At the 437×947 CSS layout case, the real existing 14-keyword profile measures **413×735px**, with name 17px, keywords 14px, zero horizontal center error and no horizontal overflow. The layout case approximates the available CSS space at 90% on a 393px phone; it does not constitute physical iPhone rendering verification.

The configured public Compliance Hub at 393×852 measures **361×466px** at x=16, with zero horizontal center error and less than 0.01px vertical error. Recorded credential contents were not changed. Close dismissal passed; browser viewport overrides were reset. A first selector attempt followed a closed mobile drawer and was resolved by reopening the visible menu before opening the hub. No upload or credential action was submitted. Committed evidence contains only geometry/counts, not profile identity, registration numbers or field values.

## Preserved configuration and scope

Provider readback confirms current Production/cleanup registration identify the new artifact. The daily cleanup definition remains `17 2 * * *` (**03:17 Lagos**); actual scheduled invocation was not inspected. Testing remains **Hod**, diagnostics **F5**, retained hotfix **EcY**, and git-main was restored to maintenance **3JS** after promotion. Every non-public alias matches the pre-promotion map. Protection remains `all_except_custom_domains`, bypass count zero.

The public canonical URL and existing backup flags remain explicit (enabled, test mode off, real-file backfill apply false); existing keys/schema are preserved. No main merge, migration, account/profile/document mutation or new email occurred. Earlier pilot recovery/backfill limits are unchanged; this release does not establish a new recovery or scheduled-worker test.

[Scrubbed execution evidence](qa/2026-10-24-mobile-90-public.json). Physical iPhone keyboard/focus behavior and native safe-area rendering remain distinct from Chromium geometry. Fully close/reopen the installed public app to load the new viewport before checking the released layout.
