# Mobile login, profile and navigation scale — 23 October 2026

Status: implemented and locally validated; hosted deployment recorded below when accepted. The approved Settings hotfix is a separate exact-source release, already public as `3ecf303`.

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
