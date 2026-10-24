# 87% account focus, Home actions and employer preview — 24 October 2026

Status: implemented; lint, strict TypeScript and 287 tests passed. Build/browser/hosted release results are recorded below when executed. The owner requested testing first, then Production release if checks pass. This includes the smaller 87% profile preview from 6b32b12; no main merge is included.

## Changes

- Keep the root viewport at initial scale **0.87**, device width and viewport-fit cover, preserving manual pinch zoom. Account-dialog entry inputs use **19 CSS px on mobile**, including login email/password and signup/forgot-password text inputs. At the requested scale this is approximately 16.53 effective pixels, instead of 13.92 from the previous 16px controls. No credential values, authentication requests or account behavior change.
- This targets WebKit's font-size-based focus zoom heuristic. [WebKit's original implementation/review](https://www2.webkit.org/show_bug.cgi?id=132879) computes focus scale from a standard text size and the control font size. This is the rationale for the change, not proof of a native device result. No maximum-scale/user-scalable restriction, focus-time viewport mutation or forced scroll reset is added.
- Home's dashboard and Explore actions use two equal columns on phones, with compact padding/arrows and wrapping labels. The existing dashboard destination and tour trigger remain.
- The Settings employer preview starts collapsed using a native details/summary control labelled **Employer preview**, matching the Optional reminder interaction. Expanding reveals the professional fields and explanatory disclosures. The sharing checkbox, draft consent explanation and Save action remain outside and visible. Only the preview becomes collapsible; the employer-facing shared summary stays expanded and its data whitelist is unchanged.

## Validation and deployment scope

Use read-only guest/candidate fixtures for narrow layout, focus geometry and keyboard toggle checks; test 320/393/430px plus short height. Do not submit account forms, career-profile saves, document operations or emails. Existing automated tests verify the underlying professional-summary data whitelist and sharing rules; this change does not alter those functions.

After testing acceptance, build a clean archive of the exact source as staged Production with the public canonical origin, backups on, test mode off and real-file backfill apply disabled. Preserve daily cleanup at 03:17 Lagos, testing/diagnostics and git-main maintenance. Retain current public AtUL/c06a420 as rollback. Verify Ready/source/project before promotion, then repeat GET-only access and existing-session browser checks. No secret change, schema migration, data/file mutation, new email or main merge is included.

Desktop Chromium can check computed input size, viewport metadata, bounds and toggles; it cannot certify physical iPhone keyboard/focus behavior or installed-window safe-area rendering. A native iPhone confirmation remains distinct from those checks. Do not claim the zoom issue was reproduced/fixed on a physical device without that evidence.
