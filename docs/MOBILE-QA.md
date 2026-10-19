# Mobile audit — 9 October 2026

The local app was checked in Brave using the existing signed-in candidate session. These are browser viewport checks, not a guarantee for every device or an offline/installable PWA certification.

| Page | Widths checked (CSS pixels) | Page-wide horizontal overflow |
| --- | --- | --- |
| Home | 320, 390, 768, 820, 1024 | None |
| Dashboard | 320, 360, 390, 430, 768, 820, 1024 | None |
| Job matches | 320, 390, 768, 820, 1024 | None |
| Application pipeline | 320, 390, 768, 820, 1024 | None |
| Scheduler | 320, 360, 390, 430, 768, 820, 1024 | None |
| News & Insights | 320, 360, 390, 430, 768, 820, 1024 | None |
| Salary | 320, 390, 768, 820, 1024 | None |
| History | 320, 390, 768, 820, 1024 | None |
| Settings | 320, 390, 768, 820, 1024 | None |
| License tracking | 320, 390, 768, 820, 1024 | None |

Job tables become cards on phones. The desktop pipeline and wide tables retain deliberate scrolling inside their own containers. At 900px and below, the pipeline uses compact stacked groups and a native stage filter; empty groups are hidden when viewing all stages. Hidden table headings are positioned outside the screen intentionally and excluded from layout failures.

## Interaction checks

- Mobile menu opens, scrolls to additional links, and closes after navigation.
- Navigation returns the page scroll container to the top.
- Profile dialog, priority-alert dialog, agenda editor, Help, and Notifications fit 320 × 568. Profile content remains scrollable.
- Digest preview fits a 320px-wide screen and its long content scrolls.
- Invitation buttons stack and retain readable labels.
- External application cards expose a native stage selector for touch and keyboard input. No application statuses were changed during the audit.
- Login was confirmed by the user's successful sign-in. Signup and existing-password compatibility passed automated tests with mocked email/database writes.

## Fixes

Adaptive grids replaced fixed minimum widths; News and Scheduler overflow was corrected. Dialog heights use the dynamic viewport. Help and Notifications now remain within phone edges. Mobile form controls use a 16px font to avoid automatic input zoom on iOS. Reduced-motion preferences are respected. Unused integration fields, fabricated trend figures, and inaccurate credential labels were removed or corrected. Legacy avatars use initials until a private replacement is uploaded.

## Remaining validation and setup

- Private Blob storage is not configured. Older documents are retained and labelled for re-upload; their private previews are unavailable until storage is configured and files are migrated or re-uploaded.
- Verification/reset email delivery needs an end-to-end inbox check; the origin-selection logic and registration flow were tested without sending messages.
- A transient database connection failure occurred and subsequent reads recovered. Scheduler now reports unavailable interview updates rather than silently implying complete synchronization.
- The populated applicant and admin workflows still need appropriate test data/sessions. No real-device Safari, Android keyboard, touch gesture, or PWA/offline certification was performed.

Validation: lint, TypeScript, 60 automated tests, and production build passed. Screenshot artifacts are in /private/tmp/benchscout-mobile-matches-final.jpg and /private/tmp/benchscout-mobile-home-final.jpg.

## Mobile refinement follow-up

The redesigned pipeline was checked at widths 320, 390, 430, 768, 900, 901 and 1024: no page-wide horizontal overflow. One populated group appears on mobile, and all five columns return above 900px. The external Closed / Rejected stage is now preserved when loading saved applications. The stage filter was checked with an empty stage and restored to All; no actual application stage or data was changed. Posting and stage controls are separate.

Home branding/title/body text and salary metric sizes were reduced for phones. Salary summary cards use 20px padding and 12px spacing. The home brand remains on one line at 320px. Navigation through the mobile drawer returns content to the top and closes the drawer. Direct browser reloads can restore prior scroll position.

Salary was rechecked at widths 320, 390, 430, 768 and 1024 without page-wide horizontal overflow, with the existing one-report sample: count 1 and overall average —, with clear sample limitations. Screenshot: /private/tmp/benchscout-pipeline-mobile-v2.png. API adapter tests mock external calls; live extraction/model quality and real-device touch gestures remain unverified. See API-REVIEW.md for provider decisions and configuration gaps.

## Employer follow-up

Using the user-provided Apex Diagnostic Hub employer session, the vacancies and previous-applicant views were checked at widths 320, 390, 430, 768, 820 and 1024 with no page-wide horizontal overflow. Three existing vacancies are shown; only one currently has active status. The two older applied/interviewing values are displayed honestly and were not changed. Sent-invitation navigation was checked; no invitation was dispatched.

The vacancy edit dialog fits 320 × 568 and scrolls inside its bounds at 568 × 320 landscape. The applicant drawer fits 320 × 568. The existing vacancies have zero applicants, so populated roster cards, interview dialogs and recruitment decisions were not verified in the browser. No vacancies or applicant statuses were changed. Employer session restoration now uses the authenticated session endpoint.

Mobile vacancy rows become labelled cards; panel spacing, headings and tabs are compact. Uploaded credentials no longer imply independent review. CSV exports now escape quotes and neutralize spreadsheet formula prefixes. Document preview headers permit same-origin framing; a signed-out HTTP request was denied with 401. Storage access/streaming tests use mocked Blob calls.

See IPHONE-TESTING.md for a physical-device procedure and PRIVATE-DOCUMENT-STORAGE.md for configuration and the four-file legacy migration preview. The current server remains bound to localhost; it was not exposed to the LAN by this audit.

## Compact layout and delivery follow-up — 11 October 2026

The signed-in candidate pages were checked in Brave at 320 × 568, 390 × 844,
430 × 932 and desktop 1280 × 900. Matches and News had no page-wide horizontal
overflow. At 390px, the first three match cards measure approximately 207px high;
Apply Now is approximately 111px wide with a 44px tap area. At 320px the first
card is approximately 227px high. Location, salary and score headings stay intact
on desktop; mobile uses compact cards with a shared score/action row.

Mobile News cards use the full headline, category/date and source/Read row. The
repetitive excerpt is hidden on phones; desktop excerpts remain. The first cards
measure approximately 129–171px high depending on width/headline length. Read
stays on one line. Live Feed stays on one line and the heading can wrap its badge
below when necessary. Market charts sit behind a mobile-only Market summary
toggle, checked both expanded and collapsed; desktop charts remain visible.

The digest uses one email-safe HTML template and a plain-text alternative for
preview, manual delivery and automated delivery. Cards and buttons are compact;
unsafe/contact/mailbox URLs are excluded. At 320 × 568 the preview dialog is
304 × 552 with a 302 × 473 scrolling iframe. Scrolling to the last listing and
footer, and closing the preview, were checked. A preview link opened the actual
EHA Clinics Indeed vacancy. No email was sent during these checks: live inbox
rendering and delivery of this latest template remain to be checked.

The application toolkit stays within 320 × 568 with independently scrolling
content and accessible close/Escape controls. AI draft generation requires an
explicit Generate draft action. Pipeline View posting opens a bounded in-app
posting dialog; a separate source action appears only for a valid vacancy URL.
The tracked-job query no longer loads the complete matches/invitations feed.
Existing cards stay visible during refresh, with explicit errors/retry on failure.
A live request still took approximately seven seconds: database latency remains
an issue to measure separately rather than claiming instant loading.

Priority alert tier values now match the API, including migration of the old
All Roles value to All Tiers. The user confirmed "Priority alerts saved".
Validation: lint, TypeScript, 68 automated tests and production build passed.
These are browser viewport checks; physical iPhone Safari, virtual keyboard,
touch gestures and live delivered-email rendering remain outstanding. The dev
server stays bound to 127.0.0.1; no LAN exposure was enabled. Private document
storage was configured and live tested in the subsequent storage workflow; the
9 October configuration notes above describe that earlier audit only.

Proof screenshots: /private/tmp/benchscout-compact-matches-mobile.png,
/private/tmp/benchscout-news-compact-mobile.png and
/private/tmp/benchscout-digest-mobile-fixed.png.

### 11 October physical-device follow-up

See IPHONE-TESTING.md for the guided iPhone 14 Pro Safari results reported by
the user. Candidate navigation, matches/dialog rotation, digest preview, News,
pipeline, Scheduler, Settings keyboard and private PDF preview/download passed.
History density was corrected and passed the user's phone retest. Employer forms
and applicant document previews passed; compact vacancy density awaits retest.

Employer vacancy cards were reduced from 331px to 163px at 390px. Populated
320/393/430px layouts have no horizontal or cell overflow and all actions retain
44px tap height; 852px landscape and 1280px desktop tables also fit. Edit opens
and closes without saving. Lint and TypeScript passed. LAN exposure is temporarily
enabled with the user's consent for this phone session; restore localhost when
testing is complete. Latest delivered-email rendering remains untested.


### 11 October: Home, Safari viewport and walkthrough

Mobile shell now uses document scrolling below 900px, with fixed decorative
backgrounds and a dynamic-height menu with safe-area padding. Desktop retains
its pane scrolling. Home feature cards use two compact columns below 600px;
brand, hero and action spacing is tighter.

The overflowing Home tour was replaced by a portal dialog with width/height
bounds, wrapping text, scrollable body and reachable header/footer. All 14
steps passed the 393px horizontal-overflow check. Additional 320px narrow and
short, 852px landscape and 1280px desktop checks passed. Previous/close/Escape
and focus restoration passed. Lint and TypeScript passed.

Safari's native Page Zoom remains user-controlled. Physical iPhone retest for
the revised Home, tour and toolbar/menu behavior is pending.


### 11 October: 85% viewport and final profile/settings follow-up

Initial scale is now .85, with pinch zoom retained and viewport-fit=cover.
Profile/Settings keyword lists align in columns; very narrow Settings uses one
column. Vault actions align beside details. Percent readout no longer splits.
Mobile editable fields use 20px text. Dashboard metrics use two compact columns.
Seven views share the Toast component with white surface, brand accents, wrapped
text and status/alert semantics. Session checking remains; initial loading uses
a branded state, and Settings refreshes without hiding the loaded form.

Populated Settings passed 320/393/430/852/1280 overflow checks. Dashboard
metrics at 393px are approximately 68–72px tall. User confirmed on iPhone that
85% fits, focus keeps the zoom, bottom edge blends, and chips/dashboard fit.
Lint/TypeScript and all 68 tests passed.
# Home branding and overlapping reads — 11 October 2026

- Search placeholder shortened to “Search”; Home uses “Career Hub” and session loading says “Loading your career hub…”.
- Cropped the Home SVG's empty viewBox space, reduced brand-to-heading spacing, and aligned feature content at the top of each card.
- Feature descriptions remain in the two-column mobile grid; each card is now a keyboard-accessible button opening its relevant walkthrough section. Confirmed Skills-based matching opens step 3 and closes correctly.
- Browser checks: Home has no document overflow at 320, 463, or 1280 CSS px; mobile card icon offsets both 13 px. Settings still loads populated profile and vault after sharing overlapping requests. Matches finishes loading populated invitations and job cards; no application or invitation actions were taken.
- Sidebar, Settings and Matches share only concurrent identical user/jobs GET requests, scoped by current identity. No completed-response cache; failures clear the pending request and later reads retry. Tests cover independent body readers, fresh reads, identity changes, and retry.
- Read-only database probe: four SELECT 1 requests took 5001, 1305, 2242 and 4253 ms (first includes connecting). This demonstrates database/network latency but does not isolate a provider issue or measure complete page-load improvement.
- Validation: lint, typecheck and all 69 tests passed. Home proof: /private/tmp/benchscout-home-hub-polish.png. Physical iPhone retest of these latest Home changes remains pending.

# Mobile quick search — 11 October 2026

- Search results use the available viewport width with safe-area margins on mobile, rather than inheriting the 180px input width. Desktop retains its input-aligned panel.
- Compact result titles use the main column; tier badges stay on the right without wrapping. Panel height is bounded and scrollable for shorter screens.
- Populated EHA search checked at 320, 393, 852 landscape and 1280 CSS px. No document or result-column horizontal overflow; all three results and the footer fit in the 393px viewport.
- Lint and TypeScript passed. Proof: /private/tmp/benchscout-mobile-search-results.png. Physical iPhone confirmation is pending.

# First Home landing and animated loader — 11 October 2026

Desktop reload follow-up: the body is a flex container, so the loader needed explicit full width and flex sizing. Added full-width sizing and centred text. Confirmed actual loader bounds 0–1280 at desktop and 0–393 on mobile, with wordmark centres at 640 and 196.5 respectively. Desktop proof: /private/tmp/benchscout-loading-desktop-centred.png.

- First app visits go through Home. The visit marker is stored per session identity in the browser; a new browser or cleared storage starts at Home again. Returning visitors keep their destination. This is an introduction route, not a forced completion of the 14-step walkthrough.
- Email verification success now continues to /home. Verification, password recovery and administrator links are exempt from first-visit redirects.
- Replaced the session spinner with the lab logo above BenchScout. Teal lens sweep, centre pulse and staggered dots animate while the actual session/landing check is pending; reduced-motion users receive the static equivalent. No artificial loading delay or fake progress percentage.
- Browser QA: fresh localhost guest visit to / reached /home; returning signed-in 127.0.0.1 visit retained Dashboard. Loader checked at 393px and its lens/pulse animation styles confirmed active.
- Lint/typecheck and all 71 tests passed, including first/deep-link destinations, returning visits and recovery exclusions. Proof: /private/tmp/benchscout-animated-hub-loading.png. Physical iPhone confirmation of this loader remains pending.

# Loading refreshes and account switches — 12 October 2026

Settings reports failed reads with Retry and avoids presenting an empty editable form after a failed initial load. Matches retains same-account results during refreshes and reports failed refreshes without clearing cards. Both ignore superseded responses and responses belonging to a previous candidate identity.

Candidate sign-in now replaces the full document with `/home`; employer sign-in replaces it with `/employer`. Account-specific browser hints and invitations are cleared when identity changes. SessionGate blocks candidate rendering of `/employer` and redirects to Home, including direct URL visits. Server-side endpoint authorization remains unchanged.

Live public Home at https://bench-scout.vercel.app/home returned HTTP 200 with approximately 0.93s to first byte in one probe; this does not measure authenticated Settings/Matches API latency or establish a performance improvement on Vercel. These changes have not been deployed by this task.

Validation: lint, TypeScript and all 72 tests pass, including a new identity-switch regression test. In the signed-in scientist browser, visiting `/employer` redirected to `/home` without rendering employer details. Populated Settings loaded successfully. Clearing an EHA company filter on Matches displayed “Refreshing matches…” while the existing three cards remained visible. Failure/retry and a fresh credential-submission flow still need manual browser checks. Proof: `/private/tmp/benchscout-candidate-home-guard.png` and `/private/tmp/benchscout-matches-refresh.png`.

# Placement invitation availability — 12 October 2026

Investigated Apex's invitation failure: Senior Scientist was active, while Garki and Wuse II direct vacancies had application-stage values `interviewing` and `applied`. The employer confirmed both vacancies should be active. Targeted script `scripts/repair-apex-vacancy-status.cjs --apply` restored exactly those two records; application rows and notifications were not changed.

The invitation picker now disables non-active vacancies, prevents repeated selection while sending, and stays open on failure. Errors display the API's reason rather than a generic sourcing error. Candidate stage updates use an `isDirectPost: false` conditional update so legacy direct vacancies cannot be overwritten. Regression tests cover active/non-active vacancy invitation checks, foreign-employer rejection and protection of legacy direct vacancy statuses. Lint, TypeScript and all 74 tests pass. No test invitation was sent by the agent.

# Employer sign-out destination — 12 October 2026

Both employer logout entry points now use `signOutToHome`: confirm server session revocation, clear account-specific browser state, then replace the full document with `/home`. They no longer leave the employer component mounted or route back to `/employer`. Failed logout shows an error and does not clear state or navigate.

Lint, TypeScript and all 75 tests pass. A regression test verifies success ordering, Home replacement, preservation of unrelated browser settings, and failure/network handling. The browser was already signed out; clean guest Home was verified, while fresh authenticated logout through both buttons remains a manual check. Screenshot: `/private/tmp/benchscout-guest-home.png`. Changes remain local.

# Home-only menu trial — 12 October 2026

Home now hides the sidebar behind a labelled Menu control on desktop as well as mobile. Open my dashboard navigates to the existing scientist dashboard (or employer portal for an employer identity). Explore BenchScout and the interactive feature walkthrough remain available. Other routes keep their existing navigation and layout. To revert this layout trial, set `HOME_MENU_ON_DEMAND` to false in `lib/home-navigation.ts`; no user settings or records are changed by the trial.

The Home drawer supports Close, overlay click, Escape, focus return and keyboard focus containment; closed Home navigation is inert. Route selection closes it, including selecting Home again. Verified Home-to-Dashboard navigation restores the ordinary desktop sidebar. Checked 320px and 393px phone widths for horizontal overflow and menu/footer fit, and the desktop layout. Both Home buttons share the same typography and hover motion; reduced-motion preferences suppress animation. Header Menu is compact, the full logo fits its viewBox, and desktop Search has additional space after the brand.

Lint, TypeScript and the existing 75 tests passed for the initial trial. Subsequent spacing/icon refinements were checked in-browser. Proof: `/private/tmp/benchscout-home-menu-refined.png` and `/private/tmp/benchscout-home-menu-mobile.png`. Physical iPhone confirmation is pending. Local Wi-Fi testing was restarted with the confirmed trusted network at http://192.168.0.134:3173/home; HTTP 200 was verified from the Mac. The previous IP was 192.168.0.193. Changes remain local, not deployed to Vercel.

# Centered mobile search — 12 October 2026

The mobile topbar now uses equal 84px side columns, with Search centered in the remaining space. Menu stays on the left and notification/help actions on the right. At 393px and 320px, measured Search centers exactly match screen centers (196.5px and 160px); no horizontal overflow. The Dashboard mobile header was also checked at 393px. Narrow input padding preserves the full Search placeholder and reserves space for Clear search when present. Desktop layout is unchanged. Lint and TypeScript pass. Proof: `/private/tmp/benchscout-mobile-search-centred.png`.



## 19 October 2026 — Toolkit corner clearance and cover-letter wording

Application Toolkit now uses 16px clearance plus each device safe-area inset. Its maximum height follows the padded backdrop; the outer dialog alone clips rounded corners, avoiding the previous mobile/footer radius mismatch. The content scrolls independently and the footer action remains visible. Cover-letter heading/actions wrap at narrow widths.

Browser verification at 390 × 844 measured dialog bounds x=16..374, y=16..828; at 320 × 568, x=16..304, y=16..552. Neither viewport had horizontal document overflow. Opened/collapsed How drafting works, reached the editor by keyboard, tabbed to the footer action and closed with Escape. Main copy is professional; Google processing details remain available in the disclosure before generation. No real draft was generated or application submitted. Physical iPhone safe-area rendering and software-keyboard behaviour still require device testing; desktop emulation does not establish those results.


## 19 October 2026 — Per-application document selection

Rendered the actual ApplicationDocumentSelection and ApplicationSharingNotice components in a temporary local synthetic preview using the application dialog CSS. At 320 × 568 the dialog measured x=16..304, y=16..552 with footer y=492..552; at 390 × 844 the dialog measured x=16..374, y=16..828. No horizontal document overflow. CV was checked/disabled, optional license and certificate initially unchecked, and an unavailable degree remained disabled. Selecting/unselecting the license updated the Selected summary correctly. The temporary QA route was removed before release. This checks the controlled component and mobile layout, not a complete account-to-employer submission or physical iPhone workflow. No real application, draft or file upload was made during browser checks.


## 19 October 2026 — Credential-review administrator controls

Checked the actual local /admin/reviews form at 320 × 568 and 390 × 844. Candidate license mode shows Candidate email and Load current candidate evidence. Selecting the approval checkbox reveals both mandatory independent-evidence note fields and reviewer identity/reason inputs. Save remains disabled without administrator authentication and a loaded candidate. Neither width had horizontal document overflow; the scrollable form keeps controls reachable. No secret was entered, no real candidate was loaded, no evidence file was downloaded and no approval/revocation was submitted in the browser. Populated evidence downloads and concurrent real database decisions remain staging acceptance work; API/blob behaviour is covered by isolated tests.
