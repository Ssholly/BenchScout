# Real iPhone testing

The desktop viewport audit does not test Safari's keyboard, file picker, safe areas, or touch behavior. Use an actual iPhone for those checks.

## Local Wi-Fi setup

1. Connect the Mac and iPhone to the same trusted Wi-Fi. Disable cellular temporarily if Safari keeps using a different network.
2. Run the local test server from labpro-connect:

   ```sh
   DEV_ALLOWED_ORIGINS=192.168.0.134,127.0.0.1,localhost npm run dev -- --hostname 0.0.0.0 --port 3173
   ```

   192.168.0.134 is the Mac's Wi-Fi address checked on 12 October 2026 (previously 192.168.0.193). If the address changes, replace it in both this command and the URL below. Do not use wildcard allowed origins. This command makes the development server reachable on the local network; stop it after testing. Enable it only while both devices are on the same trusted Wi-Fi.
3. Open http://192.168.0.134:3173/home in iPhone Safari. Sign in on the phone; desktop cookies are not shared with it. A different IP is a different browser origin, so a new login and replacement of any old-IP home-screen shortcut may be needed. Use test accounts because local HTTP does not encrypt traffic. No public tunnel or router port forwarding is needed.
4. If it does not load, check macOS firewall access for Node and whether the router isolates Wi-Fi clients. Do not disable the firewall globally.

NEXT_PUBLIC_APP_URL remains the deployed canonical URL in production. The development CSRF check compares the request Origin with its Host; do not disable it to work around a rejected login. DEV_ALLOWED_ORIGINS only allows the listed development origins to reach Next's dev resources.

## Physical-device checklist

Record iPhone model, iOS version, text-size setting, orientation, page, and what failed.

- Candidate and employer login: keyboard opens without hiding submit controls; fields do not zoom; errors are readable. Reload retains the authenticated session.
- Every navigation link: menu opens/closes, scrolling remains possible, page returns to top, no horizontal page movement.
- Pipeline: filter stages and use the native stage picker with a disposable test application. Verify the saved stage after reload; no drag gesture is required.
- Employer: vacancies, previous applicants and sent invitations; edit and applicant dialogs; keyboard visibility and close controls. Use test vacancies/candidates for publishing, deletion or recruitment decisions.
- Portrait and landscape: rotate while a dialog is open, expand/collapse Safari's address bar, test the smallest supported phone and increased text size.
- Documents after private storage is configured: choose a synthetic PDF from Files and image from Photos; test preview, download, wrong type, oversized file and denied access from a different account.
- HTTPS staging: repeat login, private PDFs, network interruptions, and Add to Home Screen. Local HTTP testing does not certify secure production cookies, installability, service-worker/offline behavior or a complete PWA.

For Safari inspection, enable Web Inspector in the iPhone's Safari advanced settings, connect it to the Mac, and use Safari's Develop menu to inspect the phone page. Menu paths can vary with iOS/macOS version; this agent's connected Brave browser cannot directly inspect the physical iPhone.

## Guided first pass

Use Safari at default page zoom and record the iPhone model/iOS version first.
Complete one check at a time so a failure can be reproduced before moving on:

1. Open Home, sign in, dismiss the keyboard and reload. Confirm the session remains.
2. Open Job Matches through the menu. Check three cards, long titles and the
   Apply Now tap target; swipe sideways to check for page-wide overflow.
3. Open Apply Now without submitting an application. Scroll its description to
   the bottom, rotate the phone, then close it. The close control and next action
   must remain reachable. Do not generate an AI draft for layout testing.
4. Open Preview Email. Scroll to the last listing/footer and close it. Test one
   source link without applying or sending an email.
5. Open News. Confirm Live Feed stays intact, Read is aligned, and Market summary
   expands/collapses. Change category and check the sticky filters while scrolling.
6. Open Applied. Filter stages and open/close View posting. Use only a disposable
   application for stage changes; leave real recruitment decisions unchanged.
7. Check Scheduler and Settings with the keyboard open. Then repeat the employer
   pages with an employer test account and a synthetic PDF for document upload.

Repeat the visual checks in landscape, with a collapsed/expanded Safari toolbar
and larger system text. Capture failures with page URL, exact action, orientation
and whether the keyboard was open. A browser viewport pass does not count as a
physical-device pass.

After the session, stop the LAN dev server and restore the local-only command:

```sh
npm run dev -- --hostname 127.0.0.1 --port 3173
```

Safari remote inspection setup: [WebKit Web Inspector documentation](https://webkit.org/web-inspector/enabling-web-inspector/).

References: [Next allowedDevOrigins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins), local Next CLI documentation in node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md.

## Physical-device session — 11 October 2026

- Device reported by user: iPhone 14 Pro, iOS 27.0.
- User confirmed both devices use the same trusted Wi-Fi and authorized temporary
  local-network access.
- Mac Wi-Fi address: 192.168.0.193. Dev server started on port 3173 with explicit
  allowed origins 192.168.0.193, 127.0.0.1 and localhost.
- The Mac confirmed the LAN Home URL returns HTTP 200. This is a reachability
  check from the Mac, not yet a physical iPhone pass.
- Phone Safari login, keyboard, layouts, gestures and rotation: awaiting first
  device result. No physical-device checks have been marked passed.
- Restore localhost-only binding when the user finishes this testing session.

### First device result

The user confirmed Safari sign-in succeeds and the account remains signed in after
reloading on the iPhone 14 Pro. Mark login/session persistence passed by user report.
Keyboard visibility, layout, rotation and document behavior are not implied by this
result and remain pending. Next check: Matches cards and the Apply preview dialog.

### Matches and Apply result

The user confirmed that the job cards fit on the physical iPhone and the Apply
preview scrolls, survives landscape/portrait rotation and closes correctly.
Mark those checks passed by user report. No application was submitted during the
guided check. Next check: digest preview/link and News layout/interactions.

### Digest and News result

The user confirmed that the digest and News both work and fit on the physical
phone after the guided check: digest footer scrolling, one source vacancy link,
return/close, Live Feed/Read alignment, category switching and Market summary
expansion/collapse. Mark these checks passed by user report. This preview check
does not establish how a newly delivered digest renders inside iPhone Mail/Gmail.
Next check: pipeline filtering/posting preview and Scheduler/Settings forms.

### Pipeline, Scheduler and Settings result

The user confirmed all three work on the physical iPhone: pipeline stage filtering
and in-app posting preview/close; Priority Alerts saved with existing options;
Settings license-details form with keyboard visible and close without saving.
No sideways overflow or unreachable controls were reported. Mark these checks
passed by user report; changes to application stages were not requested.
Next check: candidate private PDF preview/download and remaining candidate pages.

### Documents and remaining candidate pages

The user confirmed CV/license previews, PDF download/opening from Files, and
Home/Dashboard/Salary/History navigation work on the physical iPhone. History
cards were reported too large, so mobile density did not pass this check.

History now has a scoped three-row mobile layout: timestamp, matches/status,
and delivery detail. Existing populated rows measure 101px rather than 280px
at 390px in Brave. Widths 320, 390 and 430 have no horizontal or cell overflow;
desktop 1280 retains table rows/headings. No history was cleared. Lint and
TypeScript passed. Screenshot: /private/tmp/benchscout-history-compact-mobile.png.
Physical iPhone confirmation of the compact History change is pending; employer
pages still await the phone pass.

### History retest

After reloading Safari on the iPhone, the user confirmed the revised History
cards are compact and readable. Mark mobile History density passed by user
report. Next check: Apex employer login, vacancy forms and applicant documents.

### Employer workflow and vacancy density

The user reported employer login, vacancy form/keyboard/close and applicant
CV/license previews worked on the physical iPhone. Vacancy cards were too large,
so their mobile density did not pass.

The vacancy list now uses compact cards with the full role/skills, location and
salary, status, and an aligned action row. Redundant field-label rows are removed;
Edit, Terminate and applicant controls retain 44px tap height. Non-active statuses
use neutral styling, and applicant counts use correct spacing and singular/plural.
Populated Apex cards measure 163px instead of 331px at 390px. The final cards
also measure 163px at 320, 393 and 430px with no page/cell horizontal overflow.
Landscape 852px and desktop 1280px retain the table and showed no overflow.
Edit opened and closed without saving. Lint and TypeScript passed.
Screenshot: /private/tmp/benchscout-employer-vacancies-mobile.png.
Physical iPhone retest of these revised vacancy cards is pending.

### Vacancy retest and posting form follow-up

The user confirmed the compact vacancy cards worked on the physical iPhone.
They requested a smaller Post a laboratory role card and alignment of the count
badge beside Vacancies. The form now uses tighter mobile spacing, side-by-side
location/salary from 360px, 44px fields/buttons and 16px field text. Labels are
associated with their inputs. At 393px the default card measures 383px instead
of 537px. The count badge and heading have matching vertical centers.

Populated Brave layouts at 320, 430, 852 landscape and 1280 desktop showed no
page/card overflow with the conditional internship option expanded. This option
was restored unchecked; no vacancy was published. Lint and TypeScript passed.
Proof: /private/tmp/benchscout-employer-post-form-mobile.png and
/private/tmp/benchscout-vacancy-count-aligned.png. Physical iPhone retest of this
form and count alignment is pending.

### Posting form pass and talent pipeline follow-up

The user confirmed the compact posting form/count alignment looked good on the
physical iPhone. The Previous applicants screen then showed stretched initials,
a cramped name, split credentials text and an oversized location filter.

The talent layout now fixes avatar dimensions (36px square on phones), puts the
full name and Credentials submitted badge on separate rows, allows email to wrap
when needed, and aligns 44px actions below the identity. The 44px location selector
uses the full content width with a clear accessible label and All locations copy.
The populated card measures 144px at 393px. Brave checks at 320/430/852/1280 showed
no page or card-part overflow. Both actions are 44px high at 320px; avatars remain
square at all tested sizes. Filtering to Lagos displayed the empty state; All
locations was restored and the applicant returned. No invitation was sent.
Lint and TypeScript passed. Proof: /private/tmp/benchscout-employer-talent-mobile.png.
Physical iPhone retest of this revised talent layout is pending.

### Talent pipeline physical retest

The user confirmed everything fits and aligns in Previous applicants after
reloading on the iPhone: circular icon, full name, credentials badge, location
filter and actions. Mark the revised talent layout passed by user report.
Next guided check: Sent Invites layout and landscape navigation.

### Safari viewport, Home and walkthrough follow-up

Sent Invites has no existing cards in this account, so populated invitation
layout remains untested on the physical phone. The user identified their
preferred Safari Page Zoom as 85%. Browser zoom is not locked by the app;
the mobile design uses compact spacing and retains text resizing.

Screenshots showed Safari covering the menu footer and the Home walkthrough
overflowing horizontally. Mobile pages now scroll the document rather than a
fixed inner pane, while desktop keeps its existing scroll layout. The menu uses
dynamic viewport height and safe-area padding; its navigation can shrink and
scroll while the account footer stays reachable. Mobile Home now has tighter
brand/hero spacing and two columns of compact feature cards.

The walkthrough now renders above the app as a responsive dialog, with wrapped
copy, a scrollable body, fixed header/footer controls, 44px targets, Escape
closing, focus containment and focus restoration. All 14 steps at 393x700 showed
no horizontal overflow. Narrow 320x568, short 320x393, landscape 852x393 and
desktop 1280x800 checks kept the dialog and footer within the viewport.
Previous, close and Escape worked, and body scrolling unlocked after closing.
Lint, TypeScript and diff whitespace checks passed.

Proof: /private/tmp/benchscout-home-mobile-grid.png,
/private/tmp/benchscout-mobile-menu-safe-footer.png and
/private/tmp/benchscout-walkthrough-mobile.png. Physical Safari retest is pending
for these changes, including toolbar collapse during document scrolling.

### 85% scale, profile, vault and feedback

The user confirmed the walkthrough is fixed and the new initial viewport scale
of 0.85 looks right on the physical iPhone. Pinch zoom remains available.
Profile skills and Settings keywords now have aligned columns; small Settings
screens below 360px use one column to preserve whole words. Vault View/Delete
actions sit beside document details instead of below, and the percentage readout
stays on one line. Populated Settings at 320/393/430/852/1280 showed no page,
keyword or vault overflow. Profile chips at 393px also fit without overflow.

A follow-up screenshot showed keyboard focus increasing the scale, oversized
dashboard metrics and dark rounded confirmation messages. Mobile editable
fields now use 20px CSS text to stay readable at .85 scale. Dashboard metrics
use compact pairs; readiness is tighter. Settings keeps its loaded form visible
during refresh after save; its first-load placeholder is compact. The session
check remains in place, with a branded Loading your workspace state.

All seven toast-producing views now use the same portal component: white card,
brand colors, independently aligned icon/message and accessible status/alert.
A missing-registration-number validation test confirmed wrapped feedback with
no overflow; the dialog was cancelled and reloaded without saving changes.
Two profile saves kept the existing values unchanged during UI verification.
The timed success notification was not captured; validation feedback was.

The root canvas now extends through viewport-fit=cover with safe-area padding,
and the root background blends with the page. User report after reload: all fit,
keyboard keeps 85%, and bottom edge blends. Mark this physical retest passed.
The user also confirmed soft teal chips and compact dashboard cards fit.
Lint, TypeScript, whitespace checks and all 68 existing tests passed.
Proof: /private/tmp/benchscout-profile-keywords-aligned.png,
/private/tmp/benchscout-vault-actions-inline.png,
/private/tmp/benchscout-dashboard-compact.png and
/private/tmp/benchscout-branded-feedback.png.
