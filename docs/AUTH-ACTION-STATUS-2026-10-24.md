# Account action status — 24 October 2026

The account dialog shared one loading boolean across login, registration, verification resend and password reset. During login this incorrectly labelled verification resend “Sending…”. It was a client status-label bug; that label did not establish that an email was sent.

The dialog now tracks the active action. Login shows “Signing in…”, registration “Creating account…”, verification resend “Sending…” and password reset “Sending reset link…”. Other submit controls remain disabled while the active request runs, and completion/error clears the active action. Request endpoints, authentication/session behavior, email delivery logic and the 90% mobile layout are unchanged.

## Validation and scope

Lint, strict TypeScript, all 287 existing tests and the optimized webpack build passed. A local production build with a blocked database destination was exercised through an isolated HTTP simulator: six-second synthetic failures confirmed candidate and employer login keep the resend label idle, resend keeps the login label idle, reset has its own label, and errors restore enabled controls. API mutations never reached real services; no accounts or emails were created. These checks establish UI state behavior, not hosted authentication or email delivery. See [scrubbed results](qa/2026-10-24-auth-action-status.json).

Deployment status is recorded separately when verified. No database migration, document operation, secret change or main merge is required.

## Hosting recommendation

Keep Vercel for the existing Next.js application: its Next.js integration and preview deployment workflow fit the already validated setup. Cloudflare also hosts applications through Workers, but moving this app requires runtime, storage and scheduled-task compatibility validation. Cloudflare DNS can be used alongside Vercel hosting; Vercel documents DNS-only routing directly to its service. No migration or DNS configuration has been performed.

Official documentation reviewed 24 October 2026: [Vercel Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Cloudflare Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [Cloudflare DNS with Vercel](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment). Commercial planning must account for [Vercel Hobby](https://vercel.com/docs/plans/hobby) being restricted to personal, non-commercial use; no upgrade or paid commitment was made.
