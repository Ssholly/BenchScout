# Light and dark appearance

Current release status: **live on Production, 3 November 2026**. [Exact artifact, checks and rollback](APPEARANCE-PUBLIC-2026-11-03.md). Dated testing-only notes below remain historical.

2 November 2026. Implemented and validated locally. No testing or Production deployment, account mutation, new provider or migration performed in this task. Existing brand remains the working app identity pending the separate naming decision.

## User experience

- A moon/sun button sits in the shared header alongside Notifications and Help, for candidate, employer and guest screens. The icon describes the opposite appearance available on activation. Its stable accessible name is Dark mode, with `aria-pressed` reflecting the current state, a descriptive tooltip, keyboard support and a 44px touch target.
- The first visit follows the device's light/dark preference. Once switched, the explicit choice wins until local browser storage is cleared. Choice is per browser/origin, shared across accounts in that browser, rather than a server profile field or cross-device preference. Testing and Production origins therefore have separate preferences.
- `benchscout_appearance` stores only `light` or `dark`. Storage failures preserve switching in the current page session. Other open tabs synchronize through the storage event. Device preference changes apply only while the choice is not explicit.
- Fixed first-party bootstrap code in the root document head sets the root theme before content paints. Root-only hydration-warning suppression covers these expected attributes. `useSyncExternalStore` keeps the client toggle hydrated without reading browser APIs during server rendering. The theme also updates the browser theme-colour meta tag and native form `color-scheme`.

## Styling and scope

`app/appearance-palette.css` preserves the existing light colour literals and supplies dark alternatives grouped by foreground, surface and border use. Existing inline and stylesheet colours in the frontend now reference this shared palette, including the account/profile dialogs, candidate career forms, sharing preview, employer workspace, matches, salary, history, news, compliance and administrator screens. Button/accent backgrounds retain contrast with white labels. Teal accents and the hero gradient remain legible in dark mode.

`app/appearance.css` defines the core dark tokens, dimmed decorative background, input placeholders, focus treatment and header layout. The mobile header reserves room for all three controls at 320px and 390px, keeping search and menu accessible. Owner-requested 90% initial page scale and manual pinch zoom are retained. The original laboratory mark is reproduced as an inline `BrandMark` for header/reset-screen contrast. Existing document images and PDFs, email templates, backend storage and credential status are not inverted or changed by the theme.

No added dependency, server API, database field, cookie, credential or permission. The static manifest's launch/splash colours remain light; in-page appearance follows the selected mode. Native installed-app splash/status-bar behaviour still needs a physical-device check. A future visual component should use the shared tokens instead of adding fixed light-only surfaces.

## Validation

- Lint and TypeScript passed. All **305 tests** passed, including four new behavioural tests for device/saved preference precedence, persisted switching/browser meta colour, blocked storage, cross-tab updates and listener cleanup.
- Optimized webpack Production build passed with database/document/AI services disabled. No build-time live data acceptance claim.
- Local Brave desktop and 320px/390px checks covered Home, menu, login, and actual career-profile/professional-summary components plus an employer-form fixture containing synthetic data only. The temporary development preview route was removed before the final build. No real account sign-in, profile save, email, file upload or employer decision occurred.
- At 320px the document/pane widths were 320px and all three header action targets were 44px wide within the viewport. At 390px the theme control measured 44 by 44px. Both appearances, reload persistence and live cross-tab synchronization were observed. System-change and storage-blocking cases also have isolated behavioural tests.
- Visual review corrected a low-contrast hero gradient and restored teal emphasis. Profile form text/background colours were read back as `rgb(232,239,249)` on `rgb(17,29,46)` in dark mode. Light-mode forms retained their original colours. These observations are not an exhaustive contrast certification.
- Native iPhone/Android installed-app checks and full authenticated hosted-screen acceptance remain for the testing preview before a public release. A successful local build does not establish a deployment.

Private check logs: `/private/tmp/benchscout-appearance-check.log` and `/private/tmp/benchscout-appearance-build.log`. No sensitive account values are stored in this document.

## 2 November 2026 — Hosted appearance testing

Appearance-only source checkpoint `5413f681f57f53f0e2736442b308f7de52c1f558` was committed in an isolated local deployment checkout and uploaded to the existing `sholly/bench-scout` project as Preview `dpl_Gd52ewgHggujZKGRPGRpmnan2MGS` (`bench-scout-jos9d02j5-sholly.vercel.app`). Provider state is Ready; deployment metadata records `gitCommitRef=testing` and `githubCommitRef=testing`. The existing Preview/testing variable names were checked without reading secret values. The source manifest is retained in `/private/tmp/benchscout-appearance-testing-20261102/appearance-source-manifest.json`. This checkpoint is local, not pushed to GitHub; unrelated unpublished business/naming artifacts were excluded.

The established [testing link](https://bench-scout-git-testing-sholly.vercel.app/home) now serves this build. Hosted Brave checks passed click and keyboard switching, light and dark reload persistence, new-tab saved preference and live cross-tab synchronization. At 390px the control measured 44×44px and document width was 390px; at 320px it measured 44×44px at x=176–220 and document width was 320px. Home, navigation and the light login dialog were reviewed; no login submission, account change, email or file operation was performed. Browser-console observations showed wallet-extension warnings/errors, with no app hydration error observed. Temporary viewport overrides were reset.

Final alias inventory preserved Production `bench-scout-4ixd5y3y3-sholly.vercel.app`, diagnostics `bench-scout-8vrlhm9fq-sholly.vercel.app`, git-main maintenance `bench-scout-4a95ak60v-sholly.vercel.app` and legacy maintenance `bench-scout-arjibrqgd-sholly.vercel.app`. No Production release, configuration change, migration or Git push accompanied the testing rollout. Physical iOS/Android home-screen review and full authenticated hosted-screen acceptance remain open before Production release.

Screenshot: `/private/tmp/benchscout-testing-dark-20261102.jpg`.

## 2 November 2026 — Mobile header spacing and search focus follow-up

Owner requested mobile-only separation between appearance, Notifications and Help, plus a fix for search focus zoom when the keyboard opens. Kept Help reachable in the header. Within the existing <=900px breakpoint, reserved 148px for three 44px controls with 8px gaps; search takes the remaining width. Search now has 19px text, matching the account-entry treatment at the existing 90% initial viewport scale. At <=360px the decorative search icon is hidden to preserve typing space. Manual pinch zoom remains available. No JavaScript viewport reset, zoom lock or keyboard interception was added.

First spacing-only Preview `dpl_Br6jU1RMnqJkiceYsz7LrYurYi9U` was built but never assigned the testing alias. Combined Preview `dpl_BNacHxkEvbb1yobEmXi7vRKgmyqD` exposed a more-specific general form rule keeping search at 16px. Corrected the selector and deployed final local checkpoint `a6ae90e1c2d257647a881e6e6717f24f8140186d` as Ready Preview `dpl_7CQyB39BAvQLHXnKYWhn9MAMSk5v`, now serving the established testing link. Source changes remain in the isolated local checkout and working workspace; no GitHub push or Production deployment.

Hosted checks: at 390px and 320px, computed search font is 19px, action gaps are 8px, each target is 44px, and document width matches viewport without horizontal overflow. Guest search focus, typing and clear passed. At 320px action bounds were 160–204, 212–256 and 264–308. Desktop 1200px retained its previous 14px search text and 16px gaps; viewport metadata still declares initial-scale=0.9. CSS diff/whitespace check passed and provider builds passed. These are desktop-browser responsive checks, not proof of iOS virtual-keyboard behaviour; physical iPhone home-screen focus/keyboard acceptance remains with the owner. Screenshot: `/private/tmp/benchscout-mobile-header-spacing-20261102.jpg`. Temporary viewport override reset. Production aliases were not changed.

## 2 November 2026 — Mobile Help moved to footer

Following owner feedback that the three-action mobile header was still crowded, mobile Help now lives beside the copyright in Home's footer and in a shared mobile footer on other app pages. `components/FooterSupport.tsx` dispatches a first-party event to open the existing Help dialog in Topbar; resources/contact content and desktop Help are unchanged. Mobile Help opens near the bottom of the visible viewport, without the obsolete top-header pointer. No email is sent by opening Help.

The mobile header now reserves 96px for the bell and appearance toggle, with appearance in the former rightmost Help position. Menu has an explicit bounded width (78px, or 44px at <=360px), and grid gaps are 8px. Search takes the remaining space, retaining 19px mobile entry text and the existing 90% initial viewport scale. Desktop retains its original three controls and 16px action gaps. The previous three-action mobile arrangement above is superseded.

Local isolated source `b40b4e8` deployed as Ready Preview `dpl_8fPJ9iBcgTHf6R9UMXCqMaWEpBic` (`bench-scout-1eodhsivi-sholly.vercel.app`), assigned only to [testing](https://bench-scout-git-testing-sholly.vercel.app/home). Lint, TypeScript and all 305 tests passed; hosted provider build and whitespace check passed. At hosted 390px, Menu ends at x=90 and search spans x=98–274, followed by bell at 282 and appearance at 334 (44px targets). At hosted 320px, Menu ends at 56 and search begins at 64, ending at 204; document width matches viewport at both sizes. Hosted footer Help opened and closed, with bounds x=78–378/y=559–828 inside a 390×844 viewport. The shared mobile footer was observed on the guest Salary page as well. No account, file or email operation occurred.

Desktop local observation retained header Help and hid footer Help. Physical iPhone virtual-keyboard acceptance remains pending; responsive desktop checks do not establish native keyboard behavior. Temporary viewport override reset. Production was not deployed or reassigned. No GitHub push. Updated deployment source hashes are retained in the isolated checkout's `appearance-source-manifest.json`.

Screenshots: `/private/tmp/benchscout-mobile-two-actions-20261102.jpg` and `/private/tmp/benchscout-footer-help-20261102.jpg`.

## 2 November 2026 — Light-mode status-bar canvas correction

Owner supplied iPhone home-screen screenshots showing a dark native status-bar strip after switching the page to light. This is a physical-device observation, distinct from our desktop responsive checks. The previous mobile CSS left body transparent and html with only a gradient; native browser chrome could sample an unsuitable canvas. Added opaque mobile html/body backgrounds driven by `--appearance-chrome` (`#edf5fd` light, `#0c1625` dark), with body isolation preserving the decorative layers. Existing safe-area inset layout, 90% scale, status-bar style `default`, manifest and desktop layout remain unchanged.

Moved the static theme-colour declaration out of Next viewport metadata into the root head before the bootstrap. A hosted intermediate check found React head insertion could add a second entry with the static light colour. Bootstrap and manual changes now synchronize all theme-colour entries, and the subscription reconciles them after hydration. Added a regression test for a hoisted stale entry and dark-to-light switching/reload. This is an app-side correction; actual iOS status-bar repaint remains pending physical-device verification. Do not call the native strip resolved from a desktop screenshot alone.

Intermediate Ready source `d3086a3` / Preview `dpl_8WmyjkdCQN2nNp2NGvEJWvPuEKvt` was superseded by final isolated source `abb06ca` / Ready Preview `dpl_5V1SJTkYJKdxYg54kPEpGvp5Dvgx` (`bench-scout-e7tcgvgca-sholly.vercel.app`), now assigned to the established testing alias. No Production deployment/alias change, Git push, migration, account, email or document action. Lint, TypeScript, all **306 tests** and the hosted build passed. Source manifest updated in the isolated deployment checkout.

Hosted 390px transition readings: dark html/body `rgb(12,22,37)` with theme-colour `#0c1625`; light html/body `rgb(237,245,253)` with `#edf5fd`, including light reload. Final observation had one theme-colour tag; synchronization handles additional entries if inserted. Width remained 390px without document overflow. Light screenshot `/private/tmp/benchscout-light-canvas-fix-20261102.jpg` shows webpage content only, not native iOS chrome. Temporary viewport override reset. Owner should close/reopen the installed testing app once to load the new document, then switch dark to light and check the time/battery area.

Reference context: [WebKit Safari theme-colour support](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/) and [WebKit status-bar repaint regression report](https://bugs.webkit.org/show_bug.cgi?id=305546). These describe platform behaviour; they do not prove this owner's exact iOS version or a successful device fix.

## 3 November 2026 — iOS 27 native strip remains open; automatic-style test revision

Owner confirmed the 2 November fix did not resolve the dark status strip, supplied another screenshot and identified iOS **27.0.1**, launched through the testing Home Screen icon. The native status-strip issue is therefore **not resolved** by the earlier canvas/meta checks. Do not describe those desktop observations as a successful native fix.

Prepared a distinct testing revision: mobile header is now opaque `--appearance-chrome`, and its decorative translucent/backdrop-filter fade is disabled on mobile only. Desktop retains its glass layer. Removed the explicit `apple-mobile-web-app-status-bar-style` tag so native style is automatic. Simply omitting `statusBarStyle` from Next's `appleWebApp` object would still generate `default` (verified in the installed Next resolver), so metadata now emits only `apple-mobile-web-app-capable=yes` and the existing title via `other`. Home Screen capability, manifest identity/icons, page scale, authentication and stored preferences are unchanged.

Reference: [WebKit engineer comment on automatic status-bar styling](https://bugs.webkit.org/show_bug.cgi?id=317153#c2). That comment addresses deprecated black-translucent mode; this app previously used explicit default. It supports trying automatic styling, but does not establish that removing default fixes this device. The same report includes installation-dependent chrome observations. A fresh testing icon can help distinguish retained launch metadata from current markup; no existing icon/data needs to be deleted for that comparison.

Isolated source `6c14e65d88499fbee412d706c9ec0adc2a348f25` built as Ready Preview `dpl_ACLg5RJQLEzZhCtfYBrzbrVUXJYn` (`bench-scout-4ssw165xz-sholly.vercel.app`) and was assigned only to the established testing alias. Lint, TypeScript, whitespace and hosted build passed. No new tests were added for this CSS/metadata-only revision; the prior 306-test result belongs to the preceding source. No Production deployment, public alias action, Git push, migration, email, account or file operation occurred.

Hosted 390px observations: status-style tag count 0, capability yes, mobile glass display none; light header and body both `rgb(237,245,253)`, dark header and body both `rgb(12,22,37)`. Document width matched 390px. At desktop width the glass remains visible and header transparent as before. Screenshot `/private/tmp/benchscout-ios27-light-header-20261103.jpg` depicts the webpage, not native iPhone chrome. Temporary viewport reset. Owner's fresh Home Screen/native check remains required before claiming resolution or promoting Production.

## 3 November 2026 — Confirmed status-bar fix; lower edge softened

Owner confirmed the preceding automatic-status/solid-header testing revision **works** on their iOS 27.0.1 Home Screen app. This updates the earlier unresolved native status: the solid-top revision has owner acceptance. They then requested blending the lower edge, leaving the working top intact.

Added only a 32px mobile `::after` fade positioned at `top:100%` below the header. It starts with the existing `--appearance-chrome` and fades to transparent, inherits light/dark selection, adds no layout height and uses `pointer-events:none`. The opaque header/status sampling area remains intact; mobile glass/backdrop remains disabled and no native status-bar-style tag was reintroduced. Desktop has no new pseudo-element. No provider, auth, metadata, manifest or storage changes.

CSS-only source `23d7e25` built successfully as Ready Preview `dpl_BcA8vh9LhRsh8hCYqcWhc7GVkYD8` (`bench-scout-20a7e1igh-sholly.vercel.app`), serving the established testing alias. Hosted 390px checks read a solid light header `rgb(237,245,253)` and dark header `rgb(12,22,37)`, with matching 32px gradients below the 70px mobile header. Pointer events none; document width 390px, no overflow. At desktop 1280px the pseudo-element content was none; native status-style tag count remained zero. Provider build and whitespace check passed. No redundant unit tests were added for this reversible CSS-only change. Native appearance of this cosmetic fade awaits owner review; their earlier status-bar success is not a fresh test of the fade.

Screenshot `/private/tmp/benchscout-mobile-header-blend-20261103.jpg`. Viewport override reset. Production unchanged; no Git push, migration, account/file operation or email. Source manifest updated in the isolated deployment checkout.
