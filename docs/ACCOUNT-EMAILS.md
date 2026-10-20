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


## 20 October 2026 — Employer action-link fallback

During hosted employer acceptance, the operator received the confirmation message but reported that no confirmation button was visible. The hosted login screen correctly rejected the unconfirmed employer with “Confirm your email before signing in.” Receipt is operator-confirmed; the actual received MIME/rendering was not inspected because the connected mailbox differs from the approved recipient. The template already contained the button, so the rendering cause is **not established**. Do not describe this as a proven provider stripping or Gmail-clipping defect.

The shared layout now includes a second, visibly underlined full action URL below the button, with “If the button is missing or does not work, open this link”. Long URLs use break-all/overflow wrapping. This applies to candidate confirmation, employer confirmation and password reset; their existing button, text alternative, role, expiry, tokens and branding remain unchanged. The fallback is the exact same escaped URL, not another token or service. Previously received messages are unchanged; a new confirmation resend is required to review it.

Validation: lint, TypeScript, 212 tests and production build passed. Regression assertions check that button and visible fallback share the complete role-specific URL for both confirmation roles and reset. An offline Nodemailer stream-transport test confirms multipart plain text/HTML, both employer HTML anchors and the inline logo CID survive MIME generation without sending any message. Local HTML-file browser preview was blocked by the browser URL policy; no alternate route around that block was attempted. No new browser/client-rendering pass is claimed. Recipient review of the fresh delivered email remains required.

No provider/configuration/schema/password change. Testing deployment and a single approved employer resend are pending. The original message's rendering cause and full hosted employer journey remain open.
