# 90% scale, wider profile and centered compliance — testing preview

Subsequently approved and [released to Production](MOBILE-90-PUBLIC-2026-10-24.md). The testing-only restrictions/results below are retained as the pre-approval checkpoint.

Date: 24 October 2026. Status: **implemented, lint/TypeScript/build passed and hosted testing geometry accepted.** Native iPhone review pending. **Testing only. Production remains on e62934b until a separate review/release instruction.**

The owner found 87% too small, the profile too narrow and the Compliance Hub shifted right on the iPhone. This preview changes initial scale to 0.90, preserving device width, safe-area cover and manual pinch zoom. Existing 19px account-entry controls remain (approximately 17.1 effective px at initial scale); no maximum-scale/user-scalable restriction is added.

## Layout changes

- Phone profile width cap increases from 380 to 480 CSS px, filling the available dialog width on phones while keeping the existing 80dvh height limit and internal scrolling. Body padding is 14px, title 20px, name 17px and email/keywords/buttons 14px. This gives long names and keyword labels more width and avoids returning to a full-height panel.
- The compliance overlay previously used a desktop right-aligned flex layout with a growing dismissal spacer even on phones. It now has named backdrop/dismissal classes. Up to 900px the backdrop centers the panel horizontally and vertically with safe-area padding; the dismissal layer covers the background instead of taking up flex space. The panel sits above it with a bounded height and internal scrolling. Desktop right-aligned behavior remains.
- The compliance Close control is at least 44px on mobile. Outside-click dismissal is preserved. No credential interpretation, expiry calculation, registration status, upload behavior, API, database or permission changes.
- The previous side-by-side Home actions and collapsed employer preview remain.

## Validation and release boundaries

Check 320/393/430px phones and short-height screens, with a 14-keyword profile and configured/unconfigured synthetic compliance data; verify centered geometry, reachable controls, no horizontal overflow and dismissal. Use only local read-only API fixtures or the existing synthetic testing session; do not save a profile, submit credentials/documents or send email. Record desktop geometry separately from physical iPhone rendering. The owner must review the actual home-screen app on testing before a Production change; native iPhone focus/keyboard acceptance is not claimed by Chromium geometry.

## Executed checks and hosted preview

Source **e3bded29940f77fb77d525cd497b08fb90075bdf** passed lint, strict TypeScript and an isolated optimized webpack build. No new automated tests were added for this reversible CSS/viewport change. Local read-only fixtures supplied a synthetic 14-keyword candidate and configured/unconfigured compliance data; database access was blocked and no real credentials were used. All fixture API mutations were denied.

The long profile and configured hub were measured at 320×740, 393×852, 430×932, 437×947 and 393×480. No horizontal overflow occurred; profile/body and short-height hub scrolling remain available. The configured hub's horizontal center error was zero in all cases; vertical error was below 0.01px. The unconfigured hub also centered without overflow at 320/393px and short height. Close and outside-click dismissal passed. At desktop width the 420px side panel remained right aligned. A closed drawer had to be reopened before the second compliance check; the selector miss was resolved by reading the current navigation state, not by changing any data.

The 437×947 layout case approximates the CSS space of a 393×852 screen divided by 0.90; it is not native Safari zoom verification. There the profile uses 413px instead of the former 380px cap, centered with 17px name and 14px keywords. The 80dvh limit still contains longer content, keeping surrounding page space visible.

The Git build is Ready as Preview **dpl_Hod97ZJwduMjNLF9emNvvshMgmW9** (`bench-scout-p1lhkdfs5-sholly.vercel.app`). Its original project, exact source, testing branch, Preview target and Ready state were checked before explicitly assigning the established testing alias. The existing synthetic session restored after refresh. Hosted metadata reads **initial-scale=0.9**; profile at 437×947 measures 413×573px with max-width 480px, name 17px and zero center error/overflow. The hosted unconfigured hub at 393×852 measures 361×220px at x=16/y=316, with zero horizontal/vertical center error. The configured case is covered by local fixtures, without relabelling the hosted unconfigured account as a configured credential test.

Final alias readback confirms public remains **dpl_2tcm2t75xXCL3Hcg5udHCRq7Lrco / e62934b** (87% release); diagnostics F5, hotfix EcY and maintenance 3JS are unchanged. No Production build/promotion, account/profile save, credential operation, upload, new email, migration or main merge occurred. Browser viewport overrides were reset and fixture servers stopped. [Scrubbed geometry and hosted evidence](qa/2026-10-24-mobile-90-testing.json).

Review [testing](https://bench-scout-git-testing-sholly.vercel.app/home) on the physical iPhone after fully closing/reopening the installed testing app. Compare the profile width/readability and Compliance Hub centering. Production release remains outside this preview until owner review.
