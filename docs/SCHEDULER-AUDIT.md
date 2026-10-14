# Scheduler checks — 14 October 2026

The schedule and priority preferences are stored on the candidate account. The browser countdown is a preview of the saved time, not a background execution service.

The server endpoint is `GET /api/cron/daily-digest`. Requests require `Authorization: Bearer <CRON_SECRET>`. A timer should invoke it every minute to service the selectable times. Do not place the secret in URLs, client code or Git.

The Vercel project `sholly/bench-scout` currently shows the Cron feature enabled but no configured cron jobs. Its plan is Hobby. The repository and its available history contain no `vercel.json` cron schedule or scheduled GitHub Actions workflow. A local CRON_SECRET is configured and meets the server's minimum length, and the Vercel settings show CRON_SECRET defined for Production and Preview; this is an authentication credential, not a recurring timer. No recurring trigger was added or existing hosting changed during this audit.

Vercel Cron runs against production deployments, not the testing preview alias. Hobby daily limits cannot deliver each user's arbitrary selected minute reliably. Recover the existing external timer, use an external authenticated recurring trigger, or use a suitable hosting plan before advertising automatic execution as active.

Validated behavior:

- An authenticated `?dryRun=1` request checks due account counts without running scans, sending messages, modifying claims, or cleaning records.
- Saved schedule location now overrides the separate career profile preference for scheduled scans.
- Day/time checks use the saved IANA timezone; daily claims prevent duplicate runs, and scan failures release claims for retry.
- Only newly discovered matches receive automatic email alerts. Saved priority tiers and comma-separated keywords both apply. No matching new jobs means no automatic email.
- Tier 1 means 90+; Tier 2 means 75–89. The dashboard labels now agree with the matching engine.
- Email delivery failure preserves matches and records `email failed` in Run History. It also appears in the scan completion message. Failed email deliveries are not automatically retried by the current implementation.
- `Test priority email` on Scheduler checks the saved priority filters using existing active matches and sends to the authenticated candidate's registered address. It does not scan or change the saved schedule.
- A delivery test was requested through the local app. The configured Resend key is restricted to sending, so provider delivery-status retrieval was unavailable. The recipient confirmed the test reached the registered inbox.

Official hosting references:

- https://vercel.com/docs/cron-jobs
- https://vercel.com/docs/cron-jobs/usage-and-pricing
