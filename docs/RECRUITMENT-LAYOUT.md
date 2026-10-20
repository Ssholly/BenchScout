# Recruitment layout

## 20 October 2026 — Compact employer workspace and job matches

The operator reported clipped applicant cards, compressed vacancy options and salary/skill overlap in candidate matches. The screenshots included long QA titles, email addresses and salary descriptions; these are retained as meaningful layout stress cases.

Implemented:

- Vacancy creation uses an adaptive field grid. Deadline, document requirements and vacancy type no longer compete in one flex row. Inputs stay within their field; the no-fee checkbox cannot shrink.
- The employer workspace uses one column until its own content area has at least 850px for a useful two-column layout. One compact Recruitment access card replaces duplicate monitor/debug-style cards, retaining approval, per-vacancy review, credential and document-sharing explanations and the published count.
- Applicant roster uses a fixed compact header and independently scrolling body. Header controls keep their width; the close control has an accessible name. Smaller card padding, a fixed-size avatar and wrapping identity text preserve full long names/emails. Summary, selected-document and decision controls remain visible. No permissions or selected-document behaviour changed.
- Matches switch to compact cards when the available table pane is 1050px or narrower. Wider tables wrap long salary descriptions instead of painting across skills; title badges and skill chips can wrap. No text is truncated or hidden to mask overflow.

No API contract, schema, migration, environment or email change. Existing review and private-document gates are retained.

Validation is tracked in [layout evidence](qa/2026-10-20-recruitment-layout.json). Local lint/TypeScript/tests/build, testing deployment and fresh desktop/320px/390px checks must be distinguished. No new tests mirror the CSS; live geometry and visual inspection cover this reversible presentation change.

The hosted synthetic withdrawal/reapplication journey is recorded separately in [Hosted acceptance](HOSTED-EMPLOYER-ACCEPTANCE.md). No real application or document is used.

Local validation passed: lint, TypeScript, all 220 tests, webpack production build and diff check. Deployment and hosted geometry/visual acceptance remain pending.
