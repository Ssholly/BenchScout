# Account email branding

## 20 October 2026 — Shared confirmation and recovery design

The user confirmed receipt of the existing-account reset link and requested consistent branding between account confirmation and password-reset email. A supplied confirmation screenshot labelled Oct 19 shows the older blue B treatment; it is historical evidence, not a rendering of the newly shared layout. Receipt is recipient-confirmed, not read from the unrelated connected Gmail mailbox. Inbox/Spam placement, mail authentication headers, link opening and completed password reset were not verified. No password change was performed.

Both message families now use `lib/account-email-layout.ts`:

- The existing laboratory logo from public/icons/benchscout-192.png, embedded as an inline attachment with content ID benchscout-logo and descriptive alt text.
- BenchScout wordmark in navy/teal, a pale background, a white rounded card, an action label, navy button, expiry note and separated footer.
- Presentation tables and inline styles, explicit UTF-8/language/viewport metadata, escaped text and action-link attributes, and a plain-text alternative containing the full action link.

| Message | Subject | Link and expiry | Distinct instructions |
| --- | --- | --- | --- |
| Candidate confirmation | Confirm your BenchScout account | /verify with role=candidate; 24 hours; used once | Confirm email before sign-in. |
| Employer confirmation | Confirm your BenchScout account | /verify with role=employer; 24 hours; used once | Company review remains separate from email confirmation and applicant access. |
| Password reset | Reset your BenchScout password | /reset-password with selected role; one hour; used once | Password remains unchanged unless the recipient completes the reset. |

Initial candidate signup, employer signup and resends call the confirmation helper. Password recovery calls the reset helper. The shared layout removes duplicate brand markup while preserving their separate subjects, token URLs, account-role scopes, expiry and security copy. It adds no schema migration, environment variable, API endpoint or provider. The mailer already supports the inline image for Resend and SMTP; provider selection/fallback and the configured sender remain unchanged.

Sender display name and mailbox avatar are controlled separately through EMAIL_FROM/provider/account settings. Body branding does not update a sender's personal account photograph or establish domain authentication. No email-account profile, DNS record or sender credential was changed. Previously received emails retain their original content.

## Validation and limits

Tests compare the actual logo bytes, CID, common header/button layout, complete role-scoped URLs, text alternatives and distinct instructions for candidate/employer confirmation and reset. They also verify text/link-attribute escaping; existing registration tests preserve hashed token storage, unconfirmed state and retry warnings. Lint, TypeScript, all 203 tests, production build and diff checks passed after the final metadata change.

Browser previews were generated from the real helpers using synthetic example.invalid links. Only the preview replaces CID with an embedded data URL so the browser can display the same PNG; actual email transport keeps its inline attachment. Confirmation and reset were checked at 320px and 390px. Document widths matched the viewports, logos rendered, and buttons remained within bounds (right edge 275px at width 320, 345px at width 390). Temporary viewport overrides were reset and the local preview server stopped. Side-by-side proof: /private/tmp/benchscout-consistent-account-emails.jpg.

This establishes shared layout and browser geometry, not universal email-client/dark-mode rendering. The user's received reset link predates this branding change. A fresh Gmail/iPhone check of the deployed design remains distinct from these previews; successful deployment alone is not inbox evidence. Record any later live test separately without recipient addresses, credentials or tokens. Exact testing commit and Vercel status are recorded in Deployment.


## Testing release and live review checkpoint

Vercel deployment for 0653bcb succeeded; exact release is in Deployment. After release, one approved candidate reset request was submitted through the hosted UI for a visual review of the newest design. UI returned to login. Recipient confirmation of that new message's delivery/appearance is pending; no new confirmation message or password change was performed. Use the newest reset link if completing recovery, because each candidate request replaces its preceding reset token.


## Recipient clarification and signup-path verification — 20 October 2026

The recipient confirmed that the latest reset email's branding looks right and clarified that the original concern was the account-creation confirmation. Source verification traced the real signup UI to /api/auth/register, which calls sendVerificationEmail and the shared branded layout, including its PNG attachment. Employer signup and resend confirmation use that same helper. The fix therefore covers initial confirmation as well as reset. This is deployed-source/automated evidence; a fresh account-creation confirmation inbox render is still pending. No additional account/message/password action or code/provider change was made for this clarification.
