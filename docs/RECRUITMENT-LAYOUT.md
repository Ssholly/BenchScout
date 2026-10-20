# Recruitment layout

## 20 October 2026 — Compact employer workspace and job matches

The operator reported clipped applicant cards, compressed vacancy options and salary/skill overlap in candidate matches. The screenshots included long QA titles, email addresses and salary descriptions; these are retained as meaningful layout stress cases.

Implemented:

- Vacancy creation uses an adaptive field grid. Deadline, document requirements and vacancy type no longer compete in one flex row. Inputs stay within their field; the no-fee checkbox cannot shrink.
- The employer workspace uses one column until its own content area has at least 850px for a useful two-column layout. One compact Recruitment access card replaces duplicate monitor/debug-style cards, retaining approval, per-vacancy review, credential and document-sharing explanations and the published count.
- Applicant roster uses a fixed compact header and independently scrolling body. Header controls keep their width; the close control has an accessible name. Smaller card padding, a fixed-size avatar and wrapping identity text preserve full long names/emails. Summary, selected-document and decision controls remain visible. No permissions or selected-document behaviour changed.
- Vacancy table cells use tighter padding and non-shrinking action buttons; controls wrap as whole buttons instead of breaking Edit/Close into letters.
- Matches switch to compact cards when the available table pane is 1050px or narrower. Wider tables wrap long salary descriptions instead of painting across skills; title badges and skill chips can wrap. No text is truncated or hidden to mask overflow.

No API contract, schema, migration, environment or email change. Existing review and private-document gates are retained.

Validation is tracked in [layout evidence](qa/2026-10-20-recruitment-layout.json). Local lint/TypeScript/tests/build, testing deployment and fresh desktop/320px/390px checks must be distinguished. No new tests mirror the CSS; live geometry and visual inspection cover this reversible presentation change.

The hosted synthetic withdrawal/reapplication journey is recorded separately in [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md). No real application or document is used.

Local validation passed: lint, TypeScript, all 220 tests, webpack production build and diff check. Deployment and hosted geometry/visual acceptance remain pending.

Hosted match follow-up: `e0d9e35` deployed successfully as Vercel `5zsmCk98kgzs9JUja3BLqTXdZWfn`. The notification-filtered synthetic listing correctly showed Applied after reapplication. At 320/390/1440px, cell and skill-chip bounds/scroll widths showed no overflow; 320/1200/1440 screenshots were visually reviewed. The wide table wrapped its salary, while narrower content used readable compact cards. A final CSS follow-up keeps the tier badge on one line and stops vacancy action labels shrinking into letters. Employer posting/roster and pending-applicant interview form checks await the operator's existing employer sign-in.

Employer follow-up: the authenticated fixture showed one fresh pending applicant. Posting bounds passed at 320/390/1200/1440px; roster/card/control bounds passed at 320/390/1200px, with zero measured overflow. Desktop posting/roster and mobile roster screenshots were inspected. The interview form passed its outstanding 320/390px check (254/324px date/time input widths), and was closed unsaved. Final primary location/salary columns are equal-width on desktop and stack on phones, avoiding unused desktop column slots. Final-source build passed; deployment/recheck of that last CSS refinement is pending. No new interview/email was created.
