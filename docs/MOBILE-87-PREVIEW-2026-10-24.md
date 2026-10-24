# 87% mobile scale and smaller profile — testing preview, 24 October 2026

Status: implemented; lint and strict TypeScript passed. Optimized build, geometry and hosted acceptance are recorded below after completion. **Testing only: do not build, promote or change Production for this request.** The current public mobile revision remains c06a420.

The owner found the native-scale release too large on the physical iPhone and asked for an 87% starting scale and a smaller profile panel, reviewed on the established testing URL before any public release. This supersedes the previous native-scale preference for the testing preview, without approving a Production change.

## Changes

- Root viewport now uses `initialScale: 0.87`, device width and viewport-fit cover. Pinch zoom remains available; no maximum-scale/user-scalable restriction is added.
- Phone profile width cap is 380 CSS px, reduced from 440. Its height is limited to 80dvh with safe-area-aware outer bounds. A more specific profile rule keeps this cap from being overwritten by the generic account-dialog rule.
- Profile header/body padding is reduced from 16 to 12 CSS px, card padding/margins from 12 to 10, keyword gaps from 6 to 4 and keyword padding from 6×8 to 4×6. Profile title is 18 instead of 20. Name/email/keyword text remains 16/13/13 CSS px; reducing overall scale already makes it visually smaller.
- Long profiles scroll inside the body rather than extending the panel to almost full height. The header/Close control remains visible. Existing 16px account inputs, action touch-target rules and role/account behavior remain.
- No API, authentication, storage, database, provider, environment variable or scheduler change.

## Review and limits

Use [the established testing site](https://bench-scout-git-testing-sholly.vercel.app/home), fully closing/reopening its installed window to load the new viewport. Review Home, navigation, profile and login focus on the actual iPhone. Desktop Chromium can verify the viewport metadata and CSS geometry; it does not reproduce Safari installed-window scaling, keyboard focus zoom or native safe-area values. No physical iPhone acceptance is claimed. Public promotion remains outside this task.
