# 87% mobile scale and smaller profile — testing preview, 24 October 2026

Superseded by the subsequent owner-authorised [87% mobile polish public release](MOBILE-POLISH-2026-10-24.md). The testing-only execution below is retained as history; its unchanged-Production statements refer to that earlier checkpoint.

Status: **implemented, lint/strict TypeScript/optimized build passed and hosted testing profile accepted.** Physical iPhone review remains pending. **Testing only: do not build, promote or change Production for this request.** The current public mobile revision remains c06a420.

The owner found the native-scale release too large on the physical iPhone and asked for an 87% starting scale and a smaller profile panel, reviewed on the established testing URL before any public release. This supersedes the previous native-scale preference for the testing preview, without approving a Production change.

## Changes

- Root viewport now uses `initialScale: 0.87`, device width and viewport-fit cover. Pinch zoom remains available; no maximum-scale/user-scalable restriction is added.
- Phone profile width cap is 380 CSS px, reduced from 440. Its height is limited to 80dvh with safe-area-aware outer bounds. A more specific profile rule keeps this cap from being overwritten by the generic account-dialog rule.
- Profile header/body padding is reduced from 16 to 12 CSS px, card padding/margins from 12 to 10, keyword gaps from 6 to 4 and keyword padding from 6×8 to 4×6. Profile title is 18 instead of 20. Name/email/keyword text remains 16/13/13 CSS px; reducing overall scale already makes it visually smaller.
- Long profiles scroll inside the body rather than extending the panel to almost full height. The header/Close control remains visible. Existing 16px account inputs, action touch-target rules and role/account behavior remain.
- No API, authentication, storage, database, provider, environment variable or scheduler change.

## Review and limits

Use [the established testing site](https://bench-scout-git-testing-sholly.vercel.app/home), fully closing/reopening its installed window to load the new viewport. Review Home, navigation, profile and login focus on the actual iPhone. Desktop Chromium can verify the viewport metadata and CSS geometry; it does not reproduce Safari installed-window scaling, keyboard focus zoom or native safe-area values. No physical iPhone acceptance is claimed. Public promotion remains outside this task.

## Completed checks and hosted testing — 24 October 2026

Exact code revision **6b32b1252ae5a3035d8988d74c4effdd45073403** built Ready as Preview **dpl_C9hTU2V7YTWCjXs75h4ffUCRvqXU** / `bench-scout-n65mgv8dc-sholly.vercel.app`. Its project, testing branch, source and Preview target were checked before assigning the established testing alias. No Production build or promotion was run.

Lint, strict TypeScript and optimized webpack build passed. No new automated tests were added for this CSS/viewport-only change. An isolated optimized local preview used the previous synthetic read-only API fixtures, blocked database destination, no live credentials and denied mutations. Its 14-keyword profile was checked at 320×740, 393×852, 430×932, 452×979 and 393×480. No horizontal overflow was present; height remained at or below 80dvh, and the footer was reachable through normal keyboard scrolling while Close stayed visible. The 452×979 case supplies extra CSS layout space comparable to a 393×852 screen divided by 0.87; it is not native Safari scaling verification.

The hosted testing candidate session restored after refresh and Settings loaded. At 393×852, viewport metadata explicitly contains **initial-scale=0.87**, profile width cap is **380px**, height cap **681.6px**, body padding **12px** and title **18px**. This synthetic account's shorter profile measured 369×559px with no horizontal overflow; the local fixture covers long keyword content. No profile save, extraction, upload, document action, logout or new email was submitted. Browser viewport overrides were reset; local fixture servers were stopped.

Final provider alias readback confirms testing C9, public **AtUL**, diagnostics F5, maintenance 3JS and retained hotfix EcY. **Production is unchanged**, retaining source c06a420 at native initial scale 1. Existing docs describing that earlier public release remain historical/current for Production, not evidence that this new 87% preview is public. Native iPhone installed-window, login focus and owner aesthetic review remain pending. [Scrubbed evidence](qa/2026-10-24-mobile-87-testing.json).
