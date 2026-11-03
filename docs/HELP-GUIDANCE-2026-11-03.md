# Inline mobile Help & guidance

Current release status: **live on Production, 3 November 2026**. [Exact artifact, checks and rollback](APPEARANCE-PUBLIC-2026-11-03.md). Dated testing-only notes below remain historical.

3 November 2026.

The owner accepted the blended mobile header, then asked whether the Help popup needed technical Documentation/Service availability sections and rejected its bottom-floating presentation. Replaced only the mobile footer entry with an inline **Help & guidance** disclosure. Three independently expandable answers explain matching, direct/external applications, and private document/optional summary sharing, with existing settings/history links. Native details/summary controls provide keyboard interaction without a portal, backdrop, animation, new state store or API.

The section remains in normal footer flow. It appears within Home's existing footer and the shared mobile footer on other routes; desktop footer guidance stays hidden and desktop header Help retains its existing presentation. Removed the footer-to-Topbar custom event/listener. The owner explicitly asked to leave the contact address out for now, so removed the unverified support@benchscout.com link from the desktop popup as well; no new recipient/channel or email send. Mobile guidance contains no developer/API labels or availability claims. A working support contact remains to be selected separately.

`components/FooterSupport.tsx` holds the content; mobile-only styles in `app/appearance.css` use the current theme tokens. No backend, auth, verification, manifest, solid status-area or lower-edge blend changes.

## Testing delivery and acceptance

Isolated source `0e75bbc` built as Ready Preview `dpl_A3DsrGzC4qY9v8FcHPrKhUR8Scra` (`bench-scout-dkbibq317-sholly.vercel.app`), assigned only to [testing](https://bench-scout-git-testing-sholly.vercel.app/home). Source hashes updated in the isolated deployment checkout; no GitHub push or Production promotion.

Lint, TypeScript, whitespace check and hosted build passed. Local and hosted checks covered opening/closing the outer disclosure with Enter, expanding answers, light/dark colours and 320px/390px widths. Hosted guidance position was static, no help backdrop existed, no mailto link remained and document width matched the viewport. Dark panel/text read `rgb(21,34,54)` / `rgb(184,201,221)`. Screenshot `/private/tmp/benchscout-inline-footer-help-20261103.jpg`. Temporary viewport reset. No duplicate implementation-only tests were added for native disclosure markup. Prior 306-test run remains evidence for the previous appearance revision, not a new test run here.

No account, file, database, external application, email or Production action occurred. Native iPhone review of this footer change remains with the owner.

## Footer order follow-up — prepared locally

Owner requested Help & guidance below the copyright line, without its surrounding button box, followed by a Contact support email action. Reordered both Home and shared mobile footers and made the disclosure summary transparent/borderless while retaining a 44px target. Local DOM/keyboard checks confirmed copyright immediately precedes the disclosure and border width is zero. Lint/TypeScript passed. No testing deployment yet for this follow-up. Contact support is pending the owner's chosen inbox; the previous instruction excluded support@benchscout.com, so that address has not been reinstated. The intended mailto action opens a composed email in the user's mail application, without sending automatically.

## Final footer order, contact address and compact spacing

Owner selected **success.sholly5@gmail.com** as the temporary support inbox. Contact support is now a mailto link with the subject BenchScout Support Request, directly below Help & guidance. Copyright precedes both. The disclosure summary is transparent and borderless, preserving its visible keyboard focus indicator. Same order applies to Home and the shared mobile footer; desktop remains unchanged. Mailto opens the user's configured email composer; it does not send automatically. The destination URL was inspected, without opening a mail client or sending a message.

Source `b651fe6` / Ready Preview `dpl_FhZZzMw6phEz3LejiJSugMhz4nbD` first delivered the order/address refinement after lint, TypeScript and build passed. Owner then requested tighter spacing. CSS-only source `e542f8c` / Ready Preview `dpl_E5Ew6YnUs81PBrhWR6r8bFvG74zF` (`bench-scout-407d9w6oz-sholly.vercel.app`) supersedes it on the testing alias. Removed extra margins/gap and reduced these secondary footer targets from 44px to 32px in response to that compactness request; focus styling remains.

Hosted final 390px check measured both rows at 32px with zero inter-row gap, correct approved mailto and document width 390px. The earlier order refinement also passed 320px bounds and keyboard expand/collapse. Final screenshot `/private/tmp/benchscout-compact-footer-20261103.jpg`; viewport override reset. Final CSS build/whitespace check passed; no redundant unit tests were added. No Production deployment, Git push, account/file/database change or email send. This section resolves the earlier pending-inbox/local-only note.

## Footer alignment refinement

Owner requested a cleaner alignment after reviewing the stacked footer actions. Replaced the two stacked controls with one centered mobile action row below copyright: Help & guidance, a subtle non-interactive vertical divider, then Contact support. Both controls share 13px/600 typography, 36px height, padding and colour. No persistent border/button box; keyboard focus indicator retained.

A button with React useState/useId now controls the full-width guidance block below this row through aria-expanded and aria-controls. Inner questions retain native disclosures. This keeps the contact link on the same baseline when guidance opens, preserves normal page flow, and retains the approved mailto destination without sending an email. Removed superseded stacked-control overrides. Local 320px/390px checks showed matching y coordinates and 36px heights, no overflow, correct controlled content and keyboard open/close. Lint/TypeScript/whitespace passed. Isolated source `fbe30bc` prepared for testing; hosted completion recorded below.

Hosted completion: Ready Preview `dpl_3L76ZvxNGskcmYMKNBj7DrygnadL` (`bench-scout-lmr99e5ll-sholly.vercel.app`) now serves the testing alias from isolated source `fbe30bc`. Initial alias assignment was not executed because automatic approval review hit a usage limit; after the owner said continue, the same reviewed command succeeded. No bypass was used.

Hosted 390px checks confirmed both actions have the same y coordinate and 36px height; keyboard expansion correctly links aria-controls to the content and guidance remains static/in-flow. At 320px both actions share a top coordinate, span x=20.97–299.02 within the viewport, and document width is 320px. The approved mailto destination is unchanged and no message was sent. Screenshot `/private/tmp/benchscout-aligned-footer-20261103.jpg`. Viewport override reset. Provider build passed. Production unchanged; no Git push, data or credential change.
