# 90% scale, wider profile and centered compliance — testing preview

Date: 24 October 2026. Status: implemented; validation and hosted results recorded below after execution. **Testing only. Production remains on e62934b until a separate review/release instruction.**

The owner found 87% too small, the profile too narrow and the Compliance Hub shifted right on the iPhone. This preview changes initial scale to 0.90, preserving device width, safe-area cover and manual pinch zoom. Existing 19px account-entry controls remain (approximately 17.1 effective px at initial scale); no maximum-scale/user-scalable restriction is added.

## Layout changes

- Phone profile width cap increases from 380 to 480 CSS px, filling the available dialog width on phones while keeping the existing 80dvh height limit and internal scrolling. Body padding is 14px, title 20px, name 17px and email/keywords/buttons 14px. This gives long names and keyword labels more width and avoids returning to a full-height panel.
- The compliance overlay previously used a desktop right-aligned flex layout with a growing dismissal spacer even on phones. It now has named backdrop/dismissal classes. Up to 900px the backdrop centers the panel horizontally and vertically with safe-area padding; the dismissal layer covers the background instead of taking up flex space. The panel sits above it with a bounded height and internal scrolling. Desktop right-aligned behavior remains.
- The compliance Close control is at least 44px on mobile. Outside-click dismissal is preserved. No credential interpretation, expiry calculation, registration status, upload behavior, API, database or permission changes.
- The previous side-by-side Home actions and collapsed employer preview remain.

## Validation and release boundaries

Check 320/393/430px phones and short-height screens, with a 14-keyword profile and configured/unconfigured synthetic compliance data; verify centered geometry, reachable controls, no horizontal overflow and dismissal. Use only local read-only API fixtures or the existing synthetic testing session; do not save a profile, submit credentials/documents or send email. Record desktop geometry separately from physical iPhone rendering. The owner must review the actual home-screen app on testing before a Production change; native iPhone focus/keyboard acceptance is not claimed by Chromium geometry.
