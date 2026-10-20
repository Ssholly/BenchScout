# Testing credentials and email acceptance

## 20 October 2026 — Reset appearance accepted; confirmation remains the target

Recipient confirmed the latest reset email branding is correct and clarified that account-creation confirmation was the original concern. Verified the actual signup UI endpoint /api/auth/register calls the shared confirmation helper/layout with the inline logo; employer signup and resend do too. The confirmation fix is included in the deployed code. Fresh confirmation inbox appearance is not yet verified; no further account or message was created/sent during this clarification. See Account emails and the updated scrubbed branding record.

## 20 October 2026 — Shared design deployed and new review request submitted

Vercel deployment 0653bcb succeeded after 203 tests/build and mobile previews. Requested one additional reset email at the approved existing-account inbox to review the deployed design; hosted UI returned to login. New-message receipt/appearance is awaiting recipient confirmation, distinct from the earlier confirmed receipt. No password changed and no further confirmation message sent. Exact release and request boundaries are in Deployment and Account emails.

## 20 October 2026 — Reset receipt confirmed; account email design unified

The recipient confirmed receipt of the reset link for the existing replacement account. No password was changed and link/reset completion remains untested. The provided confirmation screenshot labelled Oct 19 shows the historical blue B design. On request, both confirmation and recovery now use the same laboratory logo, BenchScout wordmark, navy/teal layout and inline image; their instructions/expiry remain distinct. Lint/typecheck/203 tests/build and synthetic 320/390px browser previews passed. This receipt predates the new shared design; fresh inbox rendering of that design remains separate evidence. See [Account emails](ACCOUNT-EMAILS.md) and [scrubbed evidence](qa/2026-10-20-account-email-branding.json).

## 20 October 2026 — Existing-account reset test resumed

The operator clarified that the replacement approved address already has an account and requested password-reset testing, not signup. The earlier signup preparation was not submitted. Switched the same hosted dialog back to candidate recovery, entered the newly approved address and submitted exactly one Send Reset Link request. The UI progressed through Sending and returned to Welcome Back, the generic success path. No new account was created and no password was entered or changed. Provider acceptance/inbox receipt remain unverified until the recipient confirms. Do not infer account existence or successful delivery solely from this generic response, and do not ask the operator to create another account for this request.

The prior missing-account SQL result applies only to the first recipient, not the replacement. Recipient addresses/tokens are omitted from public documentation. No code/configuration/schema or production change; documentation diff validation passed.

## 20 October 2026 — Approved recipient replaced

The operator supplied a different controlled inbox for testing. Updated only the email field in the prepared candidate signup; the address is omitted from repository documentation. Password entry and submission remain with the operator. No account was created or test message sent by this change. The earlier absent-account SQL result applies to the previous exact address only and must not be reused as evidence about the replacement inbox. Test confirmation/recovery/interview messages should use the newly approved recipient going forward.

## 20 October 2026 — Administrator accepted; recovery no-send diagnosed

The operator's saved administrator key loaded the actual hosted review queues successfully: zero companies, zero vacancies awaiting review and zero open candidate reports. A deliberately wrong key had already been rejected. No approval/rejection decision was submitted; the secret field was cleared without reading back the key. This closes the administrator queue authentication check for the current testing deployment. Cron caller/scheduler and salary ownership checks remain separate.

The approved recipient reported no recovery email. A targeted read-only SQL check on benchscout_testing returned false for candidate existence, employer existence and candidate reset-token existence for the exact approved address. No account rows, token values or credentials were retrieved. The source route returns its generic acknowledgement before creating a token or sending mail when the selected account is absent. The missing-account condition explains the observed no-email result; it is not evidence that a delivery provider rejected a message. Preserve this account-enumeration protection.

Prepared a BenchScout Email QA candidate signup for the approved exact address, leaving the password blank and not submitting. The user must choose/enter the new password (at least 12 characters) and click Create Account. This is required browser credential handoff. Submission will exercise the actual confirmation-delivery path; do not claim delivery before sender/inbox/link checks. The already signed-in account was not modified, logged out or deleted. Keep recipient/account identifiers and confirmation tokens out of published evidence. The connected Gmail account still differs from the approved inbox; receipt requires the recipient's confirmation.

See [scrubbed evidence](qa/2026-10-20-admin-and-email-diagnosis.json). No new application code, schema/migration, provider setting or outbound email was changed/sent during this diagnosis. Documentation diff/JSON checks are sufficient for this pass; prior 201-test/build evidence is unchanged. Earlier records below are dated history.

## 19 October 2026 — Redeployment and live checks

Deployment of commit c050bc5 after the operator's save succeeded on Vercel. The hosted review form rejected a deliberately invalid key with **Unauthorized.**; the field was cleared. A successful queue read with the operator's saved key remains pending. No review/approval decision was submitted, and no key value was read back. Cron authentication/scheduling and salary ownership acceptance remain separate checks.

Submitted one approved candidate recovery-email request through the hosted reset-link interface. It returned to the login view, as the successful generic acknowledgement path does. This does not establish account existence, provider acceptance or delivery: recovery intentionally does not disclose those facts. Inbox/Spam confirmation is pending. No reset link was opened or password changed. Initial confirmation and interview inbox delivery are not yet tested. The browser already had a signed-in user account, which was left intact; no account was created/deleted for this request.

See [scrubbed evidence](qa/2026-10-19-testing-credentials.json) and Deployment. The earlier prepared/unsaved records below are dated history.

## 19 October 2026 — Operator save confirmed

The operator reported completion. A fresh Vercel metadata check showed Secret ADMIN_SECRET, CRON_SECRET and SALARY_OWNER_SECRET rows scoped to Preview/testing, plus a success notice requiring redeployment. Original broad defaults remained. New values were entered/saved by the operator and were not read back by the agent. This proves presence/scope, not their length/randomness/independence or successful authentication. A fresh deployment and controlled read-only authentication checks remain separate evidence.

## 19 October 2026 — Prepared operator setup

Rechecked the Vercel Project variables: ADMIN_SECRET and SALARY_OWNER_SECRET were absent; CRON_SECRET existed as a shared Production/Preview default. The existing testing database/store overrides remain configured. Prepared an unsaved **Secret** form with the three rows below and **Preview / testing branch only** selected. Production is not selected. No new credential value was generated, entered or saved by the agent during this preparation.

| Key | Purpose | Operational rule |
| --- | --- | --- |
| ADMIN_SECRET | Authenticates protected administrator review routes. Company/credential approval still requires the separate evidence workflow. | Keep in the operator's password manager; never use it in a URL, client bundle, report or commit. |
| CRON_SECRET | Authenticates protected scheduled-job routes. | Use a distinct testing key and update any future test caller. Adding the key does not install a timer or bypass Vercel protection. |
| SALARY_OWNER_SECRET | Derives stable ownership identifiers for salary contributions. | Use a distinct testing key; retain it securely. Rotation changes derived identifiers and needs an ownership-migration plan. |

The application requires at least 32 characters for each value. Generate three independent random values (recommended: 64 hexadecimal characters each) in a password manager or by running `openssl rand -hex 32` separately for each value. The operator must enter the values and click Save. Store them securely before saving; Vercel Secret values cannot be revealed afterwards. Do not send them through chat.

The browser tool requires user handoff for new authentication-credential entry. This is a tool constraint, not an additional product approval screen. The agent prepared the keys, notes and exact scope; the operator completes credential entry and Save. Current setup is not claimed active until metadata and a new deployment are checked after the handoff.

## Verification after saving

1. Confirm all three Secret rows show Preview/testing, with Production unselected. Keep existing shared defaults unchanged during this testing-only setup.
2. Redeploy testing from a recorded commit. Existing immutable deployments retain their previous values. Never infer active runtime configuration from an unsaved form or a successful local test.
3. Use the administrator's existing credential through the protected review interface for a read-only queue check. A missing/wrong credential must be denied. Do not approve real employers/candidates as a credential test; fixtures need explicit synthetic evidence.
4. Verify salary contribution ownership with synthetic testing records before considering that flow accepted. Do not rotate SALARY_OWNER_SECRET to solve an unrelated authentication failure.
5. Verify scheduler authentication separately from actual scheduling. Do not trigger scans or external emails against real accounts merely to test the cron secret. Deployment protection and caller configuration remain separate gates.

No key values, hashes or equality comparisons are published. Presence/scope metadata alone cannot establish randomness, independence, successful authentication or stable historical ownership.

## Approved inbox and remaining email checks

The user approved a controlled inbox for confirmation, password-reset and synthetic interview test messages on 19 October 2026. The address is deliberately omitted from repository documentation. The connected Gmail account differs from that approved inbox; the agent did not search the unrelated mailbox or claim receipt. The recipient must confirm receipt, or provide access to the approved inbox through the normal connection workflow.

No external email has been sent in this preparation step. Do not send to another recipient without approval. Test with a fresh testing account or an explicitly identified synthetic fixture; do not reset a real production account. User-created account passwords and any actual password change require user entry. Separate request success, provider acceptance and inbox receipt in the evidence; record the testing host, sender, timestamp, spam placement and correct role without publishing tokens or message bodies. Company email confirmation must not grant company approval.

## Candidate signup email consistency

Candidate registration now calls the shared sendVerificationEmail helper used by resends and employer signup. The first candidate message includes the same navy/teal branding, an explicit role=candidate confirmation URL, a 24-hour expiry statement and a plain-text alternative. Token creation/digest storage, unconfirmed account state, registration response and delivery-failure retry warning remain unchanged. There is no new API, environment variable, migration or external provider.

Regression tests exercise registration through the route, confirm the canonical testing origin/role/email and digest match, verify the expiry/plain-text link, and prove delivery failure leaves the account unconfirmed with its retry warning. This is automated coverage, not evidence of external inbox delivery. Exact full-check/build/release results are recorded in Deployment.
