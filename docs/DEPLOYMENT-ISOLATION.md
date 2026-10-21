# Historical deployment isolation audit — 21 October 2026

Status: **anonymous access perimeter passed for the observed URLs; release remains HOLD for legacy public code and credential/write retirement**. This pass was read-only. No deployment was deleted, credential rotated, sharing/access setting changed, file uploaded or destructive route invoked. Full scrubbed IDs/status results are in [audit evidence](qa/2026-10-21-deployment-isolation.json).

## Observed provider and HTTP results

The project deployment-list endpoint returned **92 Ready deployments**, pagination exhausted: 86 testing builds and six Production-target builds. Project protection reports `all_except_custom_domains` (Standard Protection), no project bypass entries, no password protection and no trusted-IP configuration. The four currently mapped aliases have zero bypass entries. Six representative deployment details also report zero bypass entries; this is not an exhaustive per-deployment bypass audit.

Anonymous GET requests used no cookie, credential or bypass and did not follow redirects or read response bodies. All **92 immutable deployment homepages** returned HTTP 302 to Vercel `/sso-api`. Separate GET requests to `/api/upload` returned that same gate on all 92 immutable hosts and three non-public aliases: **95 gated requests out of 96**. Only `bench-scout.vercel.app/api/upload` reached the app, returning **405** for GET. No upload was submitted. These checks establish the observed unauthenticated edge perimeter for these two paths; they do not prove every method/path is safe, old credentials revoked, or authorised team access unable to write.

| Current alias (authoritative alias-list response) | Deployment | Treatment |
| --- | --- | --- |
| `bench-scout.vercel.app` | `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ` | Public July app; preserve until approved replacement/containment. |
| `bench-scout-git-main-sholly.vercel.app` | `dpl_4bTpas5uPn1jRpwGeu4eUJvX7nhZ` | Anonymous sign-in gate observed on upload GET. |
| `bench-scout-sholly.vercel.app` | `dpl_12r5Zwn4tyffsUTnH3YF9tMrNqXh` | Protected current Production diagnostics, apply disabled. |
| `bench-scout-git-testing-sholly.vercel.app` | `dpl_5YkC8Pq99osYxMdLVMNXPdoQmiQp` | Current provider testing mapping at audit time; refresh before any retirement. |

The current testing mapping was source `2103726`, despite later documentation pushes. Those pushes succeeded, but this audit does not claim Vercel had deployed them. Older deployment-detail `alias` arrays still name formerly assigned domains; they are historical and conflict with current alias-list mappings. Use current alias lookup before actions.

## Credential and write-capability assessment

Six representative deployment responses were reduced to names/booleans; no environment values were revealed, compared, decrypted or retained. The public July build and an older June build include `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` and `CRON_SECRET`. Early and first-isolated testing builds include database/private storage keys; the current and initial Production diagnostic builds include database, private source, archive and administrator bindings. Key presence alone cannot establish target or validity. Earlier accepted runtime evidence proves the current stage reaches the intended live target; do not label all historical previews confirmed live-connected from names alone.

There are **26 Preview builds predating the verified testing-isolation cutover** (`699b256`), two superseded June Production builds and two superseded Production diagnostic stages. Treat these **30 builds** as the first bounded retirement review set. The current live app is intentionally excluded until its approved replacement; the current testing and Production diagnostic stages are preserved. Later isolated testing builds are outside this first set, not certified free of every shared provider credential.

SSO protection restricts anonymous access but is not credential revocation or a write lock for team members, existing authorised sessions, bypass access or trusted automation. No authenticated mutation was performed to demonstrate a write; no historical compromise is claimed. Do not disable protection or create bypass links to test the old builds.

## Public legacy code is the immediate containment dependency

Read-only Git inspection at the currently mapped July SHA reconfirmed a development setup GET handler containing destructive database writes and document handlers accepting caller email without the new session/ownership wrapper. Uploads use public Blob access and do not call the new backup lifecycle. The old history reset similarly trusts caller identity. These are source-confirmed defects in the mapped release, not newly executed exploit tests. Do not visit the development setup or debug-email routes as a read-only probe; their GET handlers have side effects.

The tested current source removes setup behavior and uses protected private-document upload/backup hooks. Deleting obsolete previews does not repair the public July alias. Prioritise a reviewed containment or compatible replacement of that public code, with the owner informed of its impact. A blanket maintenance page without enforcement on API paths/old URLs is insufficient. No global enforced write pause has been verified.

## Concrete next actions and approval boundaries

1. Preserve this inventory, repeat current alias lookup and confirm no keep-listed deployment enters the proposed retirement set. Record source SHAs for a reviewed compatible fallback; July code is unsuitable as an automatic rollback.
2. Prepare the smallest supported containment/release change for the public legacy routes, together with the exact affected user workflows and rollback. Keep the new backup and ownership safeguards. Any provider firewall/restriction configuration must be checked against actual available controls before presenting a concrete change; none was configured here. A full main release still requires the open gates in [the release plan](PRODUCTION-RELEASE-PLAN.md).
3. Review the 30 IDs below with the operator and obtain explicit approval before permanent removal. Recheck current aliases and active deployment identity immediately before deletion; stop if mappings changed. Preserve source history/evidence and an approved fallback. Do not delete the currently serving app merely because it predates isolation.
4. After approved retirement, require provider deletion state and a non-serving response for each removed immutable URL; verify the kept public/testing/diagnostic aliases still map correctly. Removing a deployment does not prove a leaked/shared credential is invalid, erase source history or revoke credentials elsewhere.
5. Inventory current consumers before any separate rotation of shared database/storage/mail/cron credentials. Prepare replacement bindings and the recovery/rollback path first. Encryption and salary ownership keys require a dedicated continuity plan. Do not rotate everything as an unreviewed cleanup step.
6. Record remaining authorised write paths and any exception/bypass configuration. Only then close the retirement/write-handling gate. Maintain Standard Protection and keep bulk-copy apply disabled throughout.

## Proposed first retirement set — not approved or executed

| Deployment ID | Immutable hostname | Reason |
| --- | --- | --- |
| `dpl_5xj9zsypDUgenQQ2kLA1pgkErTqB` | `bench-scout-fldfgwd3s-sholly.vercel.app` | superseded Production diagnostic stage |
| `dpl_8DwvVxyGiP1eZScMQKgHFWms833h` | `bench-scout-jhsmi2dsp-sholly.vercel.app` | superseded Production diagnostic stage |
| `dpl_BAk74C1bDcjt7DwpJty89iMWDEHb` | `bench-scout-m8940uj3v-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_dc6vBts5fveSJtvAE8koZYViH3wb` | `bench-scout-q134r3jo8-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_HFoyTia8xkmBafWn9GobsLxkddny` | `bench-scout-dwsddz8m3-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_7GSJcy8eZ6E7EZ6Mm9brpGnTgsdo` | `bench-scout-i6oszlnbl-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_2mu4waWBuCyUtpV2xwjBR3phenAv` | `bench-scout-nrbsie2q0-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_39CGUEKXBMYcuqRzayWPWA1o88jk` | `bench-scout-rkwvaxezq-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_9aV31E6hw5tPRySWfqSi4JCcVKxt` | `bench-scout-hjn9hejbp-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_6NmrRcQzbvLsHn5K5aWbGDFYQW5n` | `bench-scout-36qr9ertx-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_5YxYAp6djKWTcjNxDpUAmueCLV48` | `bench-scout-agoeojmqd-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_H6Dw9rT5eadNUrwnefu5ua5QMEKz` | `bench-scout-6uuwbf6fc-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_G8vefGUn9bNV5Sad6Ey8ENUNciiK` | `bench-scout-33gskhgwr-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_5bGZTwbQrSJwzcTGfJFtnkCUzcGq` | `bench-scout-62zs76l25-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_9QH3Pjw3eain9ppMoGyXUgZWBTDu` | `bench-scout-8pj3vd9me-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_8v4grq9bWZGBDE2WpBFJff6ohdZP` | `bench-scout-g9bn55vcg-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_2fLqixzZz5CFsPNdKf7Tp42HaRLZ` | `bench-scout-ldkm3bpxw-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_HGJeB2bwX6ScvCPVt5yW2krEakoY` | `bench-scout-7blo0lmnv-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_BmcBVNFErseRj4gfJSLK546YF8sc` | `bench-scout-56tn4uu97-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_3PeQoQeWGZQEnUTPy5kxjw2ioML7` | `bench-scout-2untt9m09-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_HixNVfrvP5HsAednc3RvJH7LdHgS` | `bench-scout-9nuhfd3g4-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_E5Ti5zu5U21GKjD7JdsRqMBNSmUj` | `bench-scout-lbxzi0i8m-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_4hDYmWhZFTnHN1A6dN4UpzCTpKpk` | `bench-scout-89twrb3et-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_5PHdYmVGJvF5FGFyPRX7QmWyAhS7` | `bench-scout-g49h7t86a-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_5PiRdAhbPD7bfpeWWhfPgavNoxTc` | `bench-scout-hcofuushw-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_JC4avhwBMd3hhKzM158tV9FmVCQV` | `bench-scout-3zya8cgko-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_GG3dTVe4kDiubUTBWVgrzt5YB7Ss` | `bench-scout-1ek4yntm9-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_4H8V8yehZv35vmpkLPvAJvP7aySZ` | `bench-scout-kxbwq6f0x-sholly.vercel.app` | pre-isolation Preview; treat as potentially live-connected |
| `dpl_BrodZCkAtc5wgoEAHXmiYaHfM9de` | `bench-scout-qaet5ryw2-sholly.vercel.app` | superseded historical Production |
| `dpl_2mLyGKZ8WWR12dGU3pHd79A8u8nA` | `bench-scout-mpstlqkqt-sholly.vercel.app` | superseded historical Production |

## Evidence and limits

Read-only provider GETs inspected project protection, current aliases, all deployment summaries and six representative details. Two anonymous path checks were made per immutable URL plus the four alias upload-route checks. Source review was local Git inspection. No application tests were rerun for this documentation-only audit. No sensitive document bodies, account records, secret values or bypass tokens were output.

Vercel documents that Standard Protection protects non-production URLs and past Production generated URLs; the observed HTTP redirects support that behavior here. See [Deployment Protection](https://vercel.com/docs/deployment-protection) and [past Production protection](https://vercel.com/changelog/protect-past-production-deployments-with-deployment-protection). The official [REST API](https://vercel.com/docs/rest-api) and [CLI list reference](https://vercel.com/docs/cli/list) describe metadata and pagination; completion here relies on the actual null pagination cursor, not a default first page.

Related: [release and rollback](PRODUCTION-RELEASE-PLAN.md), [current readiness](MAIN-RELEASE-READINESS.md), [operations history](OPERATIONS-READINESS.md).
