# Private document storage review — 9 October 2026

## Current status

The local environment now has BLOB_PRIVATE_READ_WRITE_TOKEN configured, and the development server was restarted. Newly uploaded CV and license files both returned 200 through their authenticated owner previews; signed-out requests returned 401 as expected. The user confirmed the CV PDF downloaded and opened successfully.

An earlier read-only migration preview found four public objects referenced by one candidate account, before these replacement uploads. That count is historical and must be checked again before migration. No migration apply operation was performed in this review. Existing public URLs can still serve files directly until the legacy objects are removed; refusing them in the app does not make those objects private.

The candidate explicitly authorized sharing the CV and license with Apex Diagnostic Hub for testing. The Senior Scientist application returned 200 and the application count increased. Initially, Apex's applicant endpoint returned 403 because it needed employer review; the roster was corrected to display that restriction instead of claiming there were no applications. On 11 October the administrator saved an approval through the review form. A fresh employer session request then loaded the applicant roster with 200. Opening the CV through its roster link returned 200 and rendered a three-page PDF. The license now has a protected View link; opening it returned 200 and rendered a complete 1166×1632 image. Lint and TypeScript checks passed for the link addition. Credential labels remained Not reviewed and degree Missing; no recruitment decision or candidate credential approval was made by the agent.

The vault now has an explicit attachment download link and a MIME-aware preview that scales images proportionally. The updated image loaded successfully in the connected browser. A requested mobile viewport override did not take effect in that session, so the latest preview still needs narrow-screen and physical iPhone verification. All 60 automated tests, lint, TypeScript checks, and the production build passed after these changes.

Implemented protections:

- Upload routes require a candidate session; supplied identity cannot replace session identity.
- Document kinds are enumerated; actual PDF/PNG/JPEG signatures and MIME types are checked. CVs require PDF; avatars require images.
- Uploads use randomized private object paths, with a 4 MiB file limit. Settings now uses the same limit. This leaves room for multipart metadata below Vercel's 4.5 MB server-request limit.
- Owners may read their documents. Employers must be independently reviewed and the candidate must have applied to a vacancy owned by that employer.
- Responses expose guarded app URLs, not Blob credentials or raw storage URLs. Private reads disable caching, use nosniff and sandbox headers, and permit same-origin previews. Legacy documents return 409 and are labelled for re-upload in the candidate vault.
- Replacing a license resets its review status. An uploaded degree or license is not automatically independently verified.

## Configure and verify

### Local review follow-up — 11 October 2026

The submitted admin review passed secret authentication but failed during the database-backed rate-limit check with Prisma P1001. Earlier logs also showed P2024 connection-pool timeouts. A subsequent read-only schema check succeeded, and a direct employer read found Apex unapproved with no saved review reference. This review request did not persist an approval.

Local DATABASE_URL now includes finite connect_timeout=30 and pool_timeout=20 parameters; the database target and credentials were preserved. The local server was restarted. Connection failures now return a safe 503 and Retry-After rather than a generic 500; the rate-limit failure still prevents the action from running. Review form checkbox/secret spacing was corrected. All 61 tests, lint, and TypeScript checks passed. A later administrator retry succeeded, followed by positive employer document access as recorded above. Physical iPhone and deployed storage access still need verification.

Timeout guidance: [Prisma ORM v6 with Neon](https://docs.prisma.io/docs/orm/v6/overview/databases/neon#resolving-connection-timeouts). Longer timeouts accommodate transient connection delays; they do not guarantee provider availability. A pooled runtime connection should be evaluated separately for deployment.

Candidate review follow-up: an initial read-only metadata check confirmed the license file exists but both registration number and expiry were absent. Upload storage and confirmed license details are separate; the AI extraction route returns suggestions, and the candidate confirmation action saves the fields. Settings now exposes Edit license details for an existing license, loads saved fields, and provides manual entry after an extraction failure. Its details dialog scrolls within the viewport. After the user returned to scientist Settings, a fresh read-only check confirmed the number and a future expiry are saved; the live details form reloaded both values. Lint and TypeScript passed for the change. Actual credential fields were not fabricated or filled by the agent, and no AI extraction or candidate approval was run by the agent during this check. Physical phone verification is still pending.

1. In the Vercel project, create a **separate Blob store with Private access**. Keep the existing public store for the migration period.
2. Add its read-write token as BLOB_PRIVATE_READ_WRITE_TOKEN in the relevant server environments and local .env. Do not replace BLOB_READ_WRITE_TOKEN with the private token: that variable currently identifies the old public store. Do not paste either token into chat or expose it using NEXT_PUBLIC variables.
3. Restart local development; redeploy when intentionally preparing staging/production. Confirm only token presence, never log the token.
4. Using disposable test data, upload a small synthetic PDF. Confirm its guarded preview/download works for its owner; a signed-out visitor and different candidate get denied. A reviewed employer with an application can read it; an unrelated or unreviewed employer cannot.
5. Check actual deployment preview/download headers and mobile Safari PDF handling. Mock tests cover the access and streaming contract but do not certify the real provider.

## Legacy migration

`npm run documents:migrate` is a read-only preview by default. Back up the database and legacy objects, pause document replacements during the move, and review the concrete migration before using --apply. The apply mode uploads a private copy, updates all database references in a transaction, then deletes the old public object. The deletion is permanent and requires explicit authorization; it was not performed in this review.

After migration, verify file bytes/metadata and owner/employer access. Confirm old public links no longer work, including any provider cache interval, and reconcile any reported public-cleanup failures. Re-run the preview to ensure no public references remain. A zero reference count alone does not prove the old objects were deleted.

Additional release work: monitor failed object cleanup, consider a scheduled orphan-object reconciliation, and add malware scanning if document handling expands beyond the current validated types. File signatures establish type, not the trustworthiness of content.

References: [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage), [server upload request limit](https://vercel.com/docs/vercel-blob/server-upload).
