# Authentication checks — 12 October 2026

## Implemented

- New scientist/intern and employer accounts require email confirmation before login. Employer email confirmation and company review are separate: confirmation does not approve posting or applicant access.
- Existing employer accounts retain access through `emailVerificationRequired = false`; new registrations explicitly set it to true. Requiring confirmation for existing employers needs a separate rollout.
- Newly issued confirmation and recovery tokens are stored as SHA-256 digests. They expire, are consumed atomically, and cannot be reused. Resending rotates the link. Previously emailed candidate tokens remain accepted until their original expiry.
- Recovery explicitly selects candidate or employer accounts. Accounts sharing an email cannot reset or confirm each other's credentials.
- Password resets revoke sessions for the selected account role and require a fresh login. Passwords use bcrypt, with a minimum length and byte limit to avoid silent truncation.
- Session restoration includes internship phase. Account changes in another tab and expired sessions are checked on focus; logout returns to Home and clears local account state after successful server revocation.
- Protected APIs enforce session roles and resource ownership. Client email hints do not establish identity. Public authentication actions are rate limited, including multipart signup requests.
- Production email links require a configured canonical HTTPS origin; local development links follow the local browser origin.
- Clearing candidate scan history excludes direct employer vacancy records.

## Verification completed

`npm run check`: lint, TypeScript and 90 tests passed. `npm run build`: passed.

The first real employer test received its confirmation email and correctly remained blocked before confirmation, but the confirmation request failed because the development request wrapper shared a consumed body with its clone. Middleware now reads inspected JSON/multipart bodies once and reconstructs a fresh request for the handler. Regression tests cover both formats, and a real local malformed-token request now returns 400 rather than the body-read 500. The user subsequently confirmed that reopening the email link worked and supplied the successful confirmation screen. Login/reload/logout after confirmation remains to be reported.

The confirmation page now uses the app's transparent background, navy/teal styling and animated logo, with transient-error retry, new-link recovery and role-aware sign-in actions. Desktop/mobile previews were checked; missing-link recovery does not send mail until the user requests it from the dialog.

The card was subsequently reduced to a 420px maximum width, with lighter 21–24px headings, smaller branding, tighter spacing and no decorative footer. Browser previews at 393px and 320px fit without horizontal document overflow (320px document width at a 320px viewport).

The user confirmed employer login/reload/logout and the complete password-reset test: prior session revoked, old password rejected, new password accepted, and used-link reuse rejected. The reset page now shares the compact confirmation styles, includes accessible password labels and mobile input sizing, and offers role-aware sign-in after success. The reset email uses an embedded PNG BenchScout logo via CID for both Resend and SMTP, with a matching navy/teal layout and plain-text recovery URL. Its preview was checked without sending a new email. The email template regression test additionally verifies PNG content and complete escaped URL preservation.

The tests use isolated database and email mocks; they do not create real accounts, send email or change real passwords. Coverage includes 34 protected endpoint/method pairs, wrong-role denial, ownership checks, token replay/expiry, concurrent token replacement, same-email role separation, verification gates, session expiry/revocation, provider failures and rate limiting.

Browser checks confirmed the employer recovery controls, a fitting recovery dialog at 393 × 852, and a missing-token reset page that hides the password form and offers Home navigation.

## Deployment and remaining checks

The additive employer email-confirmation columns were applied to the configured database using `scripts/apply-employer-email-verification.cjs`, and Prisma Client was regenerated. This script does not record Prisma migration history; follow the existing baseline instructions in `DEPLOYMENT.md` before using migration deployment on an existing database. The corresponding SQL migration is idempotent.

No Vercel deployment was performed for this phase. Set `NEXT_PUBLIC_APP_URL=https://bench-scout.vercel.app` in the production environment, confirm the email sender/provider configuration, and deploy compatible code and database schema together.

User-controlled tests still need to verify real signup mail, employer and scientist/intern confirmation, resend delivery, login/reload/logout, and password reset. Enter new passwords manually. After a reset, check that the old session cannot access protected APIs and the old password no longer works. Repeat on production HTTPS to verify Secure cookie behavior.

Known limitation: recovery responses have identical status and text for known/unknown accounts, including provider failure, but email delivery currently occurs within the request and can create timing differences. A queued delivery workflow is a follow-up improvement; these tests do not claim timing-based enumeration is eliminated.

Token handling follows the [OWASP password recovery guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html); this audit is not a claim of complete security certification.
