# Mobile login, profile and navigation scale — 23 October 2026

Status: **released publicly after separate exact-source owner approval; public access checks and existing-session mobile geometry passed.** Native iPhone home-screen/focus acceptance remains pending. The approved Settings hotfix is a separate exact-source release, already public as `3ecf303`.

## Findings

The compared testing source `3ecf303` and original public source `082c225` have identical layout, Sidebar, ProfileModal and manifest code. Both used `initialScale: 0.85`; this shrinks rendered controls and text. The screenshots compare a guest on Home with a signed-in user on another page: both drawers occupy similar widths, but Home includes a Close button and guests have an additional employer link. There was no environment-specific aspect-ratio setting in those sources. iOS installed-window behavior cannot be inferred from desktop screenshots alone.

## Change

- Use device width and initial scale 1, retaining viewport-fit cover and manual pinch zoom. No maximum-scale or user-scalable restriction is introduced.
- Account text inputs explicitly use 16px, and Settings controls now use 16px at native scale instead of the previous 19px compensation. This addresses a common iOS input-focus zoom trigger; real-device verification remains required.
- The phone profile uses the available width minus 12px margins, larger padding/avatar, 16px name, 13px email/keywords/buttons and 14px edit link. Its body scrolls inside a safe-area-aware viewport limit; long keywords wrap.
- Mobile drawers share `min(280px, 100vw - 40px)` width, 16px navigation text, 90px brand area and an explicit Close button on Home and other pages. Choosing a navigation link closes the drawer. Existing desktop layout and role-specific navigation remain.
- Close and profile action controls have minimum 44px touch targets. No API, permission, schema, provider, document operation or authentication contract changes.

## Validation

Lint, strict TypeScript, all 287 tests and webpack build passed. An optimized local build was rendered with read-only synthetic guest/candidate API fixtures: no real services or credentials, database pointed at a blocked loopback port, all fixture mutations denied. Login and 14-keyword profile measured at 320×740, 393×852, 430×932 and 393×480. Dialogs stayed inside viewport bounds without horizontal overflow. Login fields measured 16px; profile name 16px, email/keywords 13px; short-height and narrow profile bodies scroll. The 393px Home and Applied drawers measured 280px with 16px navigation text; Close and link-close actions worked. The fixture does not establish authenticated API or application pipeline acceptance.

[Scrubbed geometry](qa/2026-10-23-mobile-scale.json). Chromium viewport testing does not reproduce Safari keyboard focus, installed-mode safe-area values or iOS auto-zoom. After hosted release, check those on the actual iPhone, reopening the home-screen app to load the new document. Existing installations may retain an open document; a fresh launch is needed to evaluate the current viewport. No service worker is registered by this app.

Technical context: [Apple viewport guidance](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html), [Apple responsive-design testing limits](https://developer.apple.com/documentation/safari-developer-tools/responsive-design-mode).

## Hosted testing acceptance and public release scope

Source **c06a420a20d379a01e67b2d9ccb5e2311ea81963** is Ready as Preview **dpl_EFnMuTL4xVfs5Q23YpZsKx7tXD5h**, immutable `bench-scout-pt6gq1303-sholly.vercel.app`. The established testing alias was explicitly assigned to it after the Git build was Ready. The existing synthetic session restored and Settings loaded. At 393×852 the hosted drawer measured 280px with 16px navigation text and viewport initial-scale 1; the hosted profile measured 369px wide, 619px high, with 16px name and no horizontal overflow. No settings save, upload, document access or account mutation occurred. Local fixtures additionally cover the longer 14-keyword profile; the hosted synthetic profile has no keywords, so it is not evidence for hosted keyword extraction/persistence. Browser viewport overrides were reset and isolated local preview processes stopped.

The user's public approval named the separate Settings revision **3ecf303**, which has already shipped. The mobile revision **c06a420** is kept out of that approval/artifact. Concrete proposed next step: build this exact validated mobile source as staged Production with public canonical origin, backups enabled, test mode off, backfill apply false and the unchanged 03:17 Lagos cleanup schedule. Verify exact source/project/Ready state before promotion, retain current Settings deployment **dpl_3mF9yJiLtE45yXzXyMoshdiHUbCx** as rollback, preserve testing/diagnostics, and restore git-main to maintenance after provider promotion. Run public GET access checks and existing-session read-only profile/settings checks; restore rollback if critical checks fail. No main merge, data migration, credential change, account creation, document operation or new email is included. Actual native iPhone focus/installed-window verification remains an operator acceptance step after release.

## Approved public execution — 23 October 2026

The owner separately approved the mobile release. A clean archive of exact **c06a420a20d379a01e67b2d9ccb5e2311ea81963** built Ready as Production **dpl_AtULjDHZtBiAVqNE46cZ7LKDS4tE** (`bench-scout-3ly1wj71c-sholly.vercel.app`), using the planned canonical origin and backup flags. Exact source/project/Ready state and the current rollback/alias map were verified before promotion. Public now serves this artifact. Settings hotfix **dpl_3mF9yJiLtE45yXzXyMoshdiHUbCx** remains retained as rollback; no rebuild or promotion of main occurred.

All **13 public GET access checks passed**, including anonymous/forged-session denials and the retired setup/test-email endpoints. The existing Production session restored after full refresh and Settings loaded. At 393×852, the public drawer measured **280px / 16px navigation**, matching testing. The real existing 14-keyword profile measured **369px × 796px**, with 16px name, 13px email/keywords and no horizontal overflow. No save, upload, manual document operation, logout, new account or email was performed. The screenshot is retained locally only; committed evidence contains geometry, without profile identity or field values.

Provider readback confirms this artifact is the current Production target and cleanup registration points to it at `17 2 * * *` (**03:17 Lagos**). Actual scheduled execution is still unobserved. Testing remains EFn, diagnostics F5, hotfix EcY, and git-main was restored to maintenance 3JS; every non-public alias matches its pre-cutover mapping. Deployment protection remains `all_except_custom_domains`, bypass count zero. Browser viewport overrides were reset after inspection.

[Public execution evidence](qa/2026-10-23-mobile-public-release.json). Earlier proposed/pending paragraphs above describe the pre-approval checkpoints. iPhone standalone keyboard/focus zoom and native safe-area rendering still require the owner to fully close/reopen the home-screen app and check on the physical device; Chromium geometry does not certify those platform behaviors.
