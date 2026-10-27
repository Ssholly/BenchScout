# Account action status — 24 October 2026

The account dialog shared one loading boolean across login, registration, verification resend and password reset. During login this incorrectly labelled verification resend “Sending…”. It was a client status-label bug; that label did not establish that an email was sent.

The dialog now tracks the active action. Login shows “Signing in…”, registration “Creating account…”, verification resend “Sending…” and password reset “Sending reset link…”. Other submit controls remain disabled while the active request runs, and completion/error clears the active action. Request endpoints, authentication/session behavior, email delivery logic and the 90% mobile layout are unchanged.

## Validation and scope

Lint, strict TypeScript, all 287 existing tests and the optimized webpack build passed. A local production build with a blocked database destination was exercised through an isolated HTTP simulator: six-second synthetic failures confirmed candidate and employer login keep the resend label idle, resend keeps the login label idle, reset has its own label, and errors restore enabled controls. API mutations never reached real services; no accounts or emails were created. These checks establish UI state behavior, not hosted authentication or email delivery. See [scrubbed results](qa/2026-10-24-auth-action-status.json).

The execution below records verified deployment status. No database migration, document operation, secret change or main merge is required.

## Hosting recommendation

Keep Vercel for the existing Next.js application: its Next.js integration and preview deployment workflow fit the already validated setup. Cloudflare also hosts applications through Workers, but moving this app requires runtime, storage and scheduled-task compatibility validation. Cloudflare DNS can be used alongside Vercel hosting; Vercel documents DNS-only routing directly to its service. No migration or DNS configuration has been performed.

Official documentation reviewed 24 October 2026: [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [Cloudflare DNS with Vercel](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment). Commercial planning must account for [Vercel Hobby](https://vercel.com/docs/plans/hobby) being restricted to personal, non-commercial use; no upgrade or paid commitment was made.

## Released to testing and Production

Source **6bd57210c44f6d681020ef14f68281ea73b82a38** is public as **dpl_EA6N74nt32g56QbkiJQWZPwMvrAt** (`bench-scout-cb68w5hhi-sholly.vercel.app`). Testing is **dpl_4qrtMaabrvMSWoVSjPNHAdVsXKRB**, with the same source; its existing synthetic session survived refresh. The Production archive contained no local environment files. Original project, Ready state, source and unmapped staged status were checked before promotion. Previous public **dpl_8242kxsYFxz6qtrHFtsxNwqiA4oC** is retained for rollback.

All 13 GET-only public checks passed. The existing Production session survived refresh and Settings loaded with its profile controls. Provider readback confirms diagnostics and retained hotfix remain mapped, git-main remains maintenance, protection remains `all_except_custom_domains`, and bypass count is zero. Daily cleanup registration follows the new artifact at `17 2 * * *` (03:17 Lagos); actual scheduled invocation was not inspected. Backup flags remain enabled/test-mode-off/backfill-apply-off. No new live auth submission/email, account/file mutation, migration, key change or main merge occurred. Existing recovery/backfill limitations remain unchanged.
