# CV skills and role keywords

## 20 October 2026 — Upload/extraction and keyword-save repair

The upload handler stored a private PDF and parsed text but did not run skills extraction. The profile modal nevertheless claimed that AI skills had been recalibrated. The role-keyword editor only committed text on Enter, so Update Profile omitted an unfinished input. The profile modal showed manually entered keywords as exclusively AI-extracted data.

### Candidate workflow

- Settings → Profile & Search Preferences retains compact, removable keyword chips. Enter, comma, semicolon or Add keyword commits a phrase; pasted lists split on commas, semicolons and line breaks. Update Profile includes any text still in the input. Spaces inside role names stay intact. Blank entries and case-insensitive duplicates are removed; first spelling/order is preserved.
- Update Profile persists the full keyword list to the existing `User.keywords` field. An empty list clears it. Save errors retain the draft and show the server's message. Refresh events preserve unsaved preferences; a save response cannot clear edits made after that save started. Cancel reloads saved preferences and discards pending suggestions/draft.
- Uploading/replacing a CV preserves saved keywords and returns whether PDF text was readable. It does not silently send the PDF to an AI provider. The upload message points to the separate extraction action rather than claiming extraction happened.
- To extract from an existing or newly uploaded CV, tick the Google AI notice and select **Extract skills from CV**. Suggestions merge into the current chips without replacing manual entries. Review/remove them and select **Update Profile**. The notice and button remain available for retry; extraction alone does not save anything.
- The profile modal now labels the combined field **Skills & role keywords**, refreshes its user data after successful CV replacement, changes the cached filename only after success and links to `/settings#role-keywords` for editing/extraction, closing the modal even when Settings is already open. A successful modal upload invalidates overlapping shared reads before notifying other screens. Empty keywords no longer imply the CV has no skills.

### API, privacy and configuration

`POST /api/extract-resume` accepts JSON `{ "consent": true }`. It requires a verified candidate session, same-origin request and a limit of five requests per candidate per minute. Client account hints cannot select another account. The server selects the current candidate's private CV and sends only the stored parsed text (up to 50,000 characters) to the existing Google Gemini integration. No client URL or arbitrary file-fetch destination is accepted. CV text and storage URLs are not returned.

The provider is asked for up to 30 supported skills/role phrases, with no contact information, invented experience or instructions from the document. The response is shape/length validated and normalized. A successful response is `{ success: true, keywords: string[] }`; suggestions are self-reported/unverified and require human review. Existing stored preferences are never changed by this endpoint. Replacing/deleting the CV during extraction rejects the stale result with 409. The client ignores extraction results after the component is replaced on upload, cancellation or identity change.

Missing consent returns 400; missing/legacy CV returns 409; unreadable PDF text returns 422; missing configuration, quota/network and malformed AI responses show retry/manual-entry errors. No readable text can occur with scanned/image-only PDFs. This change does not add OCR; upload a PDF with selectable text or enter keywords manually. Suggestions can be incorrect and are not credential verification.

`POST /api/user` continues accepting keywords as a string or string array, now normalizing the same delimiters/duplicates server-side. It permits up to 60 unique phrases, each at most 100 characters, and rejects larger lists without overwriting saved preferences. Omitted/null keywords preserve the existing list. The existing comma-separated storage and job-matching contract is unchanged. `/api/upload` adds `resumeTextReady: boolean` for resume uploads and retains its private storage/session/ownership limits.

Uses existing `GEMINI_API_KEY`, optional `GEMINI_MODEL` and private Blob configuration; no new environment variable, schema or migration. No automatic backfill, invented default skills or automatic AI consent. Candidates with an already-uploaded readable CV can recover suggestions without re-uploading. Lost unsaved words cannot be reconstructed from the screenshot.

### Validation and release status

- Eight regression tests cover normalized manual save/new read/clear, bounds, authentication/account mismatch/consent, private/readable CV requirements, suggestions without database writes, changed-CV rejection and AI error handling.
- Local lint, TypeScript and 211 tests passed. A generated synthetic text PDF parsed successfully through the actual `resumeText` helper.
- Production build passed. The live Google AI connection returned five supported phrases from a synthetic CV; no real candidate data was sent.
- Isolated PostgreSQL/private Blob/local SMTP acceptance passed all 18 existing journey checks. Browser checks additionally verified save without Enter → reload (three normalized chips), Add → save, Enter/removal → Cancel restoring saved chips, AI-unavailable feedback without losing manual edits and profile-modal CV replacement preserving four saved keywords and updating the filename only on success.
- Settings geometry at 390px: document width 390, editor x25–365 (340px). At 320px: document width 320, editor x25–295 (270px), one-column chips. Saved local screenshot evidence under `/private/tmp/benchscout-keywords-390.jpg` and `/private/tmp/benchscout-keywords-320.jpg`; viewport override reset.
- Automated tests use mocked AI; local browser tested the intentionally disabled-provider failure path. Live-provider success used a standalone synthetic generation request, not the hosted extraction route. Hosted extraction with a real candidate CV remains operator acceptance work.
- Released on `origin/testing`: core commit `70faf55`, final application commit `e17170d`. Vercel Preview reports success for deployment `CD1zsnx7QrajbGB5shy1s3sXCwdB`: https://vercel.com/sholly/bench-scout/CD1zsnx7QrajbGB5shy1s3sXCwdB. The existing testing alias serves the new controls and saved keyword chips. A fresh hosted modal → edit-keywords shortcut closed the modal correctly without changing account preferences or sending a CV to AI.
- Cleanup confirmed: all five remaining synthetic private files and the isolated schema were removed. No normal-schema synthetic accounts were created. Final lint, TypeScript, 211 tests, build and diff checks passed.
- No production release, schema change or real candidate CV transmission was performed for this repair. Documentation-only follow-ups may advance the testing branch without changing this application code.
