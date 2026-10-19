# Testing credentials and email acceptance

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
