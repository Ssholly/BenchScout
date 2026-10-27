# BenchScout Business and Launch Proposal

Employer funded recruitment for Nigerian laboratory professionals

Prepared for prospective pilot employers and strategic partners

BenchScout  |  16 October 2026  |  Version 1.0

## The proposition

BenchScout is developing a specialist recruitment platform that helps Nigerian laboratory professionals find credible opportunities and helps legitimate employers manage hiring. We propose an employer-funded model in which candidates can discover opportunities and apply without recruitment fees, while employers pay for a defined recruitment campaign and useful hiring support.

The platform already contains employer and candidate accounts, direct vacancy management, applications, document access controls and interview workflows. The next stage is to complete launch validation, establish the business and its public identity, and run a controlled pilot that tests recruitment outcomes and willingness to pay.

## The proposed first step

- Complete a documented launch-readiness audit and resolve critical findings.
- Prepare the business, domain, privacy arrangements and recruitment operating procedures.
- Recruit five pilot employers with current vacancies and run one 30-day campaign for each.
- Use measured outcomes and paid commitments to determine pricing and the next investment decision.

This proposal seeks support for a staged pilot and its operating resources. It does not present an agreed investment amount, proven revenue forecast or completed employer partnerships. Commercial targets and timelines in this proposal are proposed planning assumptions.

# 1 Executive summary

Our objective is to make BenchScout a dependable route from a relevant laboratory vacancy to a credible application, an employer response and a recorded hiring outcome. The first commercial test is whether employers find this service valuable enough to purchase again.

## Why a specialist service

Laboratory recruitment requires distinctions that a general vacancy feed may not make clearly: internship versus licensed practice, relevant registration documents, role requirements, location and the difference between uploaded credentials and independently reviewed evidence. BenchScout can organise these details around an understandable application and hiring process. The pilot must test whether this focus improves relevance and saves employers time.

## How the business would earn revenue

We recommend a defined fee per recruitment campaign, combining reviewed vacancy publication, agreed candidate outreach, application management and human shortlist support where legally appropriate. Candidates retain free core access. Monthly subscriptions become a later option if employers demonstrate repeat hiring demand. Placement fees require stronger outcome tracking, commercial terms and confirmation of applicable recruitment requirements.

## What exists and what remains

The current implementation provides a useful product foundation. The latest employer-safety database migration has been applied, and local validation recorded 153 passing automated tests, successful lint and type checks, a production build and an authenticated review-queue read. The safety feature has not yet been deployed to the hosted application. Full populated employer and candidate journeys, mobile checks and operating procedures remain launch work. [7]

## The pilot decision

Approve a readiness phase followed by five controlled employer campaigns. Appoint an accountable product owner, technical owner and recruitment-operations owner; establish a spending ceiling before recruitment outreach. Start campaigns only after the release criteria are met. At completion, decide whether to continue the service, change its scope or pause expansion.

## How to read this proposal

Sections 2 to 7 cover the market, product, trust model, revenue and adoption. Sections 8 to 11 explain data operations, launch readiness, business setup and the pilot. Sections 12 to 14 cover measurement, resources, risks and the decision requested. Section 15 records sources and the evidence basis.

# 2 Market opportunity and positioning

The initial customer is a Nigerian laboratory, diagnostic centre, hospital laboratory or other legitimate organisation hiring laboratory professionals. Candidates include licensed medical laboratory scientists and interns seeking suitable placements. Employer size, recruitment frequency and geography should guide which segment we serve first.

## The problem to validate

Our working hypothesis is that employers lose time finding relevant applicants, confirming essential information and managing follow-up across disconnected channels. Candidates may struggle with unclear requirements, stale vacancies, limited feedback and questionable recruiters. These are hypotheses for structured interviews and pilot measurement; this proposal does not claim a quantified national market size or established customer demand.

| Audience | Proposed value | Evidence required |
| --- | --- | --- |
| Laboratory employers | Relevant applications and an organised hiring workflow | Useful shortlists, faster responses and paid repeat use |
| Scientists and interns | Appropriate vacancies and clear application updates | Completed applications, interviews and trusted handling of documents |
| Professional and training communities | A credible route to opportunities for members | Member engagement and documented employer outcomes |

## Competitive context

Jobberman offers free listings alongside paid recruitment products and recruiter-assisted services. MyJobMag also offers free and paid postings, subscription options and recruitment support. These examples establish that employer-funded recruitment is an existing service category in Nigeria; they do not establish that employers will pay BenchScout. [1][2]

Because free posting is available elsewhere, our commercial case must extend beyond access to a vacancy form. We propose to compete on laboratory-specific relevance, transparent review status, responsive support and measurable hiring progress. We should avoid claims that BenchScout is already faster, safer or more effective than competitors until comparative evidence exists.

## Initial scope

Select a limited set of roles and locations where the team can reach both employers and candidates. Interview prospective employers about their most recent hiring experience, required qualifications, applicant volume, selection delays, decision authority and budget. Use those conversations to choose the first cohort rather than assuming every laboratory has the same recruitment needs.

# 3 Product foundation and current readiness

BenchScout combines opportunity discovery with candidate and employer workspaces. Its current implementation is suitable as a foundation for a supported pilot, subject to deployment and complete journey testing. Feature presence should be distinguished from validated commercial performance.

| Capability | Current position as of 16 October 2026 |
| --- | --- |
| Accounts and email confirmation | Implemented for candidate and employer journeys; complete production-role testing remains part of release validation. |
| Company and vacancy review | Company submissions, evidence checks, moderation, reporting and suspension implemented locally. Database migration applied; hosted feature deployment pending. |
| Hiring workflow | Vacancies, applicant roster, controlled document access, shortlisting, interview scheduling, notifications and CSV export implemented. |
| Candidate discovery by employers | Limited to previous applicants to that organisation. A wider opt-in talent directory is not implemented. |
| Payments and employer teams | Billing, invoices, paid-package enforcement and organisation team permissions are not implemented. |
| Hiring measurement | Application states exist; a reliable end-to-end campaign and hiring-outcome measurement system remains to be completed. |

## Priorities before monetisation

The immediate work is to make the existing service dependable. Complete the real employer and candidate journeys, provide clear failure messages and accurate status changes, confirm notifications, and record outcomes consistently. A public shareable vacancy page is proposed so an interested candidate can understand an opportunity before creating an account to apply.

Automated billing is not a prerequisite for learning from a small pilot. Once the business and service arrangements are ready, an approved manual quotation and invoicing process can support early campaigns. Payment automation should follow a clear package definition and real demand.

## What validation proves

The recorded tests cover important access, moderation and reporting behaviours using isolated mocks. The successful local queue read confirms database compatibility for that endpoint. Neither result proves full production reliability, a successful hiring campaign or willingness to pay. Populated staging tests and real pilot outcomes are the next evidence required. [7]

# 4 Employer and candidate journeys

Employers and candidates join independently. An employer does not need a pre-existing candidate population to submit a vacancy. Commercially, however, BenchScout needs an effective way to reach suitable candidates before promising recruitment value.

| Stage | Employer journey | Candidate journey |
| --- | --- | --- |
| Account | Register and confirm the account email | Register and confirm the account email |
| Preparation | Submit organisation and recruiter details for independent review | Complete career stage, relevant profile and application documents |
| Opportunity | After company approval, submit the vacancy for review | Discover opportunities appropriate to stage and preferences |
| Application | Receive applications after vacancy publication | Apply to the approved direct vacancy through an account |
| Selection | Review applicants, communicate decisions and schedule interviews | Receive updates and attend agreed interviews |
| Outcome | Record whether the role was filled, closed or remains open | Confirm application progress and provide experience feedback |

## Recruit around real demand

Start with employers who have an actual vacancy, a named decision-maker and a realistic timetable. Publish the approved opening, then bring relevant candidates to that opportunity through professional communities, training contacts, referrals and agreed outreach. Candidates can therefore join after seeing a role; we do not need to collect a large pool of inactive accounts first.

## Protect access and choice

The current employer directory covers people who previously applied to that organisation. Employers do not automatically receive access to every registered candidate or their documents. A wider talent-search service would need a separate opt-in design, clear visibility controls and an explanation of what information an employer can see.

## Proposed public discovery improvement

Create a public vacancy page with the role, employer display name, location, employment type, requirements, closing date, application steps and precise review labels. Keep candidate information private. Let visitors read the opportunity, then sign in or create an account to apply. Build and test this flow before using vacancy links as the main acquisition channel.

# 5 Trust and recruitment quality

Trust must be supported by evidence and operating discipline. Payment should never determine whether a company or vacancy is approved. Review labels should describe the check performed and should not imply that fraud is impossible or that a regulator has endorsed the platform.

## Company review

Collect the legal or official organisation name, CAC number or public-institution authority reference, physical address, recruiter identity and role, contact details, recruitment-authority evidence and applicable operating credentials. A reviewer checks registration and matches the organisation details. The official CAC public search is a human verification source in this workflow; no automated CAC integration is implemented. [3]

Registration alone does not prove that the person submitting a vacancy represents the organisation. Confirm authority through contact details obtained independently, such as an official switchboard or verified organisational channel. Record the evidence, source, date, reviewer and outcome. Where operating credentials are relevant, record their independent check or a clear applicability explanation.

## Vacancy review

Check that the specific opening is current, that the recruiter is authorised, and that its role, location, terms and application requirements are consistent. Require the no-fees declaration and investigate suspicious links or requests for sensitive financial information. New and edited direct vacancies remain unpublished until reviewed. Internship-site approval remains a separate evidence-based process.

## Reporting and response

Candidates can report payment demands, impersonation, fake vacancies or inappropriate requests. An authorised reviewer investigates and records a resolution. Available actions include dismissing an unsupported report, removing the saved vacancy or suspending the employer. A report does not automatically establish wrongdoing. The pilot needs an agreed triage schedule and an accountable reviewer because automated moderation notifications are not implemented.

## Continuing oversight

Changing company details resets company approval and pauses active vacancies for renewed review. Suspension blocks subsequent protected employer access, and company reinstatement does not automatically republish paused vacancies. Existing approvals are preserved as legacy approvals and need a deliberate re-review programme. Independent reviewer accounts, scheduled revalidation and a formal appeal workflow are proposed improvements. [7]

# 6 Revenue model and commercial offer

The preferred starting model is employer-funded recruitment campaigns. Candidates can search and apply for free. Employers pay for defined work that helps them reach suitable people and manage hiring, with verification remaining independent of commercial status.

| Revenue option | What the customer buys | Recommended timing |
| --- | --- | --- |
| Recruitment campaign | One role, an agreed publication period, targeted distribution, application management and defined support | Pilot offer and initial paid service |
| Hiring subscription | Recurring vacancy capacity, workflow tools and eventually team access | After evidence of repeat hiring frequency |
| Managed recruitment | Additional sourcing, screening and shortlist assistance under agreed criteria | After operational capacity and licensing applicability are confirmed |
| Successful placement | A fee tied to an agreed and documented hiring event | Later, with reliable attribution and appropriate terms |

## Define the campaign before setting a price

The proposed standard pilot campaign covers one agreed role for 30 days. It includes employer and vacancy onboarding, publication after approval, distribution through specified channels, application tracking, a weekly progress report and a close-out discussion. Any shortlist support must have an agreed scope, qualified human oversight and job-related criteria. The employer makes the hiring decision.

The offer should specify the campaign start event, deliverables, employer response expectations, included support, exclusions, extension rules, fees, payment timing and cancellation arrangements. Do not guarantee a hire, a fixed applicant count or a verified credential unless the service can support that promise and the evidence exists.

## Pricing discovery

Interview employers, assess the cost of delivering the service and present a clear quote. A limited complimentary or discounted first campaign can help establish outcomes, but its terms and intended future price should be disclosed before work begins. Record actual purchases and repeat commitments separately from positive feedback.

No final price or revenue forecast is adopted in this proposal. A standalone listing fee may be difficult to justify against free alternatives. The pilot should identify which combination of candidate relevance, time saved and support employers will fund. Sponsored visibility, if introduced later, must be clearly labelled and must not influence verification decisions.

# 7 Adoption and the initial market

The adoption strategy should build both sides of the marketplace around genuine openings. A small group completing the full recruitment journey is more useful at this stage than a large number of registrations with no suitable opportunities or employer responses.

## Employer acquisition

Recruit five pilot employers through direct professional introductions and relevant organisational contacts. Select organisations with a current laboratory vacancy, a named hiring contact, willingness to complete verification, agreed selection criteria and capacity to respond to applicants. Begin with a manageable subset of the cohort while the team confirms its review and support workload.

Use a concise introduction, a demonstration of the employer workflow and a written campaign scope. Ask about the employer’s previous hiring process and its main delays. Explain exactly what BenchScout will do, how candidate information is handled, what cooperation is required and how the campaign will be evaluated. No partnership should be described as secured until the organisation agrees.

## Candidate acquisition

Invite relevant scientists and interns through professional networks, alumni and training communities, referrals and employer-approved vacancy sharing. Obtain group administrators’ permission for outreach where required and avoid mass unsolicited messaging. Link outreach to a real, reviewed opportunity with clear eligibility information and a simple application route.

Use existing externally sourced opportunities to support useful discovery, with clear attribution and current availability checks. An aggregated listing does not establish a partnership with that employer. Track direct employer campaigns separately from external opportunities so commercial outcomes remain attributable.

## Activation and retention

- Employer activation means a reviewed company has a reviewed vacancy available for applications.
- Candidate activation means a person completes the necessary profile and submits a relevant application, rather than merely opening an account.
- Retain employers through useful applicants, timely updates and recorded outcomes; retain candidates through relevant opportunities and clear responses.

## Outreach measurement

Record the source of each employer lead and candidate application, the cost and staff time for that channel, and its conversion to useful outcomes. Expand channels that produce appropriate applications and responsive employers. Do not buy scale before the application and review process works reliably.

# 8 Data pipeline and information governance

BenchScout has two principal opportunity streams: externally sourced listings and direct employer vacancies. The operating design should preserve their different provenance while making both understandable to candidates.

| Pipeline stage | Required handling |
| --- | --- |
| Collect | Receive authorised direct vacancies or retrieve external listings through supported sources; retain origin and retrieval time. |
| Normalise | Structure role, organisation, location, career stage, employment type, requirements and deadline consistently. |
| Deduplicate | Identify repeated source records and track refreshes. Broader cross-source identity resolution remains an improvement to validate. |
| Check | Assess relevance, availability and expiry. Apply company and vacancy review to direct postings; distinguish external-source status. |
| Publish | Expose appropriate opportunities with source attribution and accurate review labels; exclude unavailable or restricted direct jobs. |
| Measure and maintain | Record application and hiring events, source failures, stale listings and reports; refresh or retire listings with traceable decisions. |

## Keep personal documents in a separate controlled flow

CVs and credentials are personal records rather than public listing content. Store them privately, authenticate access and enforce the existing applicant/ownership rules. Explain when information becomes available to an employer. Define retention periods, deletion requests, incident response, backups and access logging as operating responsibilities. Do not treat selling candidate records as a revenue stream.

## Automation and quality

AI-assisted extraction can help structure supplied information, but it does not authenticate a certificate, licence or employer. Relevance scoring should describe matching signals and allow human assessment against the role. Keep review evidence and hiring decisions traceable, and avoid an automated rejection process based solely on an opaque score.

Some collection and scheduling components exist, but reliable scheduled operation still needs deployment verification. The scheduler audit records that the unattended trigger was not confirmed operational and failed emails are not automatically retried. Source-health monitoring, durable background processing and broader duplicate control are proposed investments, not current service guarantees. [8]

# 9 Launch readiness and release standards

The launch target is a dependable, supportable service with explicit acceptance criteria. We should complete a documented audit and close release-blocking findings before exposing pilot employers and candidates to the production workflow.

| Area | Required evidence before pilot opening |
| --- | --- |
| Security and access | Role and ownership checks, session handling, upload/document access, secret management and cross-account denials validated. |
| Complete journeys | Representative employer and candidate accounts complete registration, review, posting, application, interview and outcome steps. |
| Failure handling | Interrupted submissions, duplicate actions, rejected requests, email failures and unavailable services produce accurate recoverable states. |
| Operational recovery | Working backups and a documented restore exercise; monitoring, support ownership and incident escalation established. |
| Mobile and accessibility | Core forms and dashboards tested on narrow screens and actual devices; labels, keyboard use and readable errors checked. |
| Release and communications | Compatible database/code deployment, domain and email configuration, policy publication and review-queue ownership confirmed. |

## Prioritise findings by impact

Treat unauthorised data access, invalid approval bypasses, loss of applications, broken authentication and inability to report or respond to serious abuse as launch blockers. Resolve issues that prevent the main hiring journey before cosmetic refinements. Assign each finding an owner, severity, reproduction steps, fix and verification result.

## Current release evidence

The employer-safety implementation passed 153 automated tests, lint, type checks and a production build. Its migration succeeded in the configured database, and the authenticated local administration queue returned HTTP 200. These results provide a starting point for the audit; they do not establish that all loopholes are closed. Hosted deployment and populated end-to-end staging checks remain outstanding. [7]

## Controlled release

Use a designated staging environment and test data. Release to a limited cohort, monitor failures and support requests, and keep a documented rollback plan. Restrict a feature if its underlying service is not operating reliably. Schedule a review of the initial live journeys before expanding the number of employers.

# 10 Business identity domain and regulatory preparation

The platform needs a clear operating business, an identifiable public presence and appropriate arrangements for recruitment and personal information. These activities can progress alongside engineering, but their completion must be recorded before the corresponding service is offered.

## Business and recruitment scope

Determine the business ownership, decision authority and suitable legal structure, then complete the applicable CAC process. Business-name registration and company incorporation are distinct options. Brand availability, business registration, domain ownership and trademark protection are separate matters; obtaining one does not establish the others. [3]

Confirm the exact service description with a Nigerian legal or regulatory adviser before offering paid sourcing, shortlisting or placement. The Federal Ministry of Labour and Employment administers recruiter licensing for labour contractors and private employment agencies. Whether and how that framework applies to BenchScout depends on its actual activities; CAC registration alone should not be assumed sufficient. [4]

## Domain and business communications

Confirm the intended brand, check relevant name and domain availability and register the chosen domain under the business’s control. Configure the app, HTTPS and business email addresses for support and employer enquiries. Enable renewal reminders, protected recovery access and documented account ownership. Domain availability and acquisition costs have not been established in this proposal.

Align email sending authentication and application links with the chosen domain. Test confirmation, password recovery, interview messages and support replies. Publish clear contact information and explain the organisation operating BenchScout.

## Privacy and service arrangements

Map the personal information collected, purposes, lawful bases, service providers, access recipients, retention and deletion processes. Publish an understandable privacy notice and terms that match actual behaviour. Assess obligations under the Nigeria Data Protection Act and the NDPC guidance, including whether registration as a controller or processor of major importance applies. [5][6]

Prepare employer service terms, a campaign scope, candidate-facing information and complaint procedures. Have appropriate professional advice review the intended commercial model, privacy arrangements and any recruitment requirements. These are proposed launch tasks; no business registration, licence, domain purchase or legal approval is represented as completed.

# 11 Professional recruitment pilot

We propose five pilot employers, each with one genuine vacancy and a 30-day recruitment campaign. Campaign duration begins when the vacancy is approved and the agreed distribution is ready. Company verification and preparation occur before that date. These are planning parameters, not confirmed customer commitments.

| Stage | Work and evidence |
| --- | --- |
| Before launch | Verify the employer; complete the vacancy brief; agree job-related criteria, scope, contact, campaign dates and any fee. |
| Days 1 to 7 | Publish and distribute the approved vacancy; test the application path; provide onboarding assistance and the first progress report. |
| Days 8 to 21 | Review applications against agreed criteria; resolve missing information appropriately; support employer responses and interview scheduling. |
| Days 22 to 30 | Follow up on interviews and decisions; record outstanding actions; close or explicitly extend the campaign. |
| After close | Record hiring outcomes, candidate and employer feedback, delivery costs and willingness to purchase the next campaign. |

## The employer pilot pack

Prepare a one-page service overview, a vacancy intake form, a written campaign scope, a weekly report and an outcome tracker. The intake form should capture role responsibilities, essential and desirable criteria, location, salary range, employment type, working arrangements, deadline, selection process and the responsible contact. The pack is a deliverable to prepare before onboarding; it is not yet an executed client agreement.

## Working responsibilities

BenchScout handles the agreed publication, review, distribution, platform support and progress reporting. The employer supplies accurate vacancy information, confirms recruiter authority, reviews applications and makes hiring decisions. Agree a practical response expectation at onboarding and escalate unanswered applications through the named contact.

## Service boundaries

Commit to activities and communication standards the team can control. Do not guarantee a hire or applicant volume. If the role attracts few suitable applicants, investigate requirements, compensation, geography and channel reach with the employer; record an agreed change or extension. Any material edit to a direct vacancy returns it to review before publication. Candidate feedback and complaints remain part of campaign quality.

# 12 Measurement pricing and financial discipline

The pilot should establish whether the service delivers hiring value and whether the revenue can cover its operating cost. Define measurement rules before the first campaign so outcomes are comparable and unsuccessful cases are retained in the analysis.

| Measure | Definition and use |
| --- | --- |
| Suitable applicants | Applicants meeting the pre-agreed essential criteria, with human review and explicit credential status. |
| Time to useful shortlist | Elapsed time from campaign launch to the employer acknowledging a shortlist as relevant. |
| Progress and outcomes | Applications, responses, interviews, offers and confirmed hires; record withdrawn and unfilled roles separately. |
| Commercial conversion | Employers receiving a clear offer, accepting it and actually paying; distinguish first payment from repeat purchase. |
| Delivery economics | Staff hours, outreach cost, attributable services, support, payment costs and refunds for each campaign. |
| Trust and reliability | Review turnaround, unresolved reports, permission failures, email failures and material support incidents. |

## Price from service scope and cost

For each proposed package, estimate the work involved, record actual pilot delivery time and test an explicit quote with employers. Contribution per campaign equals the collected fee, less direct delivery costs and applicable variable charges. Break-even campaign volume equals monthly fixed operating cost divided by positive average contribution per campaign, rounded up. These calculations require real cost inputs before a price or financial forecast can be approved.

Prepare a budget covering business and professional services, domain/email, hosting/database/storage, product work, outreach, review/support time and contingency. Separate one-time launch costs from recurring operating costs. Establish a spending ceiling and an approval owner before commitments. This proposal does not assume a funded budget or a specific investment valuation.

## Decision after the pilot

Agree numeric success thresholds before recruitment begins. Review every campaign and continue only where there is evidence of useful employer outcomes, credible paid demand, acceptable service quality and a viable path to positive contribution. A complimentary campaign or a favourable interview does not establish willingness to pay. If results are weak, change the segment, scope or acquisition approach before adding subscriptions or expanding spend.

# 13 Phased roadmap and operating team

The following 90-day sequence is indicative and begins after scope, owners and a spending ceiling are agreed. Regulatory decisions, availability of pilot employers and release findings may change the schedule. Advance on evidence rather than the calendar alone.

| Period | Primary work | Completion decision |
| --- | --- | --- |
| Days 1 to 30 | Audit and fix launch blockers; settle business scope; prepare domain/email and policies; complete public vacancy flow and staging tests; recruit pilot prospects. | Open the pilot only when critical journeys, data protections and operating responsibilities are ready. |
| Days 31 to 60 | Run the first campaign cohort; onboard candidates around real vacancies; provide weekly support and reporting; measure costs and outcomes. | Confirm service quality and capacity before expanding the cohort. |
| Days 61 to 90 | Complete remaining pilots; present paid offers; analyse conversion and unit economics; prioritise improvements. | Decide whether to commercialise, revise the offer or extend controlled validation. |

## Accountability

Appoint a product and business owner to manage scope, pricing decisions and partner relationships; a technical owner to manage releases, security, observability and recovery; and a recruitment-operations owner to manage employer checks, campaigns, reports and support. One person may hold more than one role initially, provided responsibilities and available hours are explicit.

Engage appropriate Nigerian legal, registration and privacy expertise for the operating model. Reviewers must understand the evidence they are evaluating, and commercial pressure must not determine approval. Record conflicts of interest and have a second responsible person review disputed or serious decisions where practical.

## Product sequence after validation

Prioritise reliable outcome tracking, clear application updates and support tooling before expanding the feature set. Introduce billing and paid entitlements after package demand is established. Add employer team accounts, opt-in talent discovery, automated review notifications and scheduled revalidation as usage and operating needs justify them.

## Longer term direction

The proposed direction is a trusted recruitment service for Nigeria’s laboratory workforce. Expansion into additional locations, roles or services should follow repeat employer use, successful candidate outcomes and demonstrated operating capacity. Broad recruitment, credential-registry integration and other commercial services are options for later assessment, not current commitments.

# 14 Risks and the partnership request

| Risk | Response and accountable function |
| --- | --- |
| Insufficient relevant applicants | Start with real vacancies in reachable segments; measure source conversion and revise criteria with employers. Business and operations owners. |
| Employers will not pay | Present explicit scoped offers and track actual purchases; avoid scaling on complimentary uptake alone. Business owner. |
| Impersonation or false vacancies | Independent company/recruiter checks, vacancy review, report handling and suspension. Review and operations owners. |
| Privacy or access failure | Private storage, permission testing, retention procedures and incident response. Technical and privacy owners. |
| Slow employer responses | Named contacts, agreed response expectations and weekly escalation. Campaign owner. |
| Operational cost exceeds fees | Track time and costs per campaign; narrow the service or change pricing before expansion. Business and operations owners. |
| Regulatory or delivery gaps | Resolve applicable requirements and release blockers before the affected activity starts. Business, advisers and technical owner. |

## Support requested

We seek a small group of pilot employers willing to provide a genuine vacancy, a responsible hiring contact, timely feedback and permission to measure agreed campaign outcomes. We also seek introductions to relevant professional communities and strategic support for launch readiness and recruitment operations.

Any funding discussion should follow a scoped work plan and costed budget. The immediate request is to support the readiness and pilot phases, rather than approve an untested national expansion. A funding amount, ownership terms and binding commercial commitments are outside this proposal and must be separately agreed.

## Decisions needed to begin

- Confirm the initial employer segment, locations and role types.
- Appoint accountable owners and agree the launch audit, spending ceiling and review schedule.
- Confirm business and recruitment scope with appropriate advisers and choose the brand/domain direction.
- Approve the pilot service definition, selection criteria, measurement rules and employer outreach materials.

The first commercial milestone is an employer completing a useful recruitment cycle and choosing to pay for the next one. That evidence would justify a defined paid package and the next stage of product investment.

# 15 Sources and evidence basis

External sources were consulted on 16 October 2026. They support the limited market and regulatory statements identified in the text. Published offerings and official guidance may change; confirm requirements and commercial terms at the point of action.

[[1] Jobberman employer services](https://www.jobberman.com/employer)  Evidence of free listings, paid products and recruiter-assisted services. These offerings are market context, not proof of demand for BenchScout.

[[2] MyJobMag employer services](https://www.myjobmag.com/employers/)  Evidence of free/paid postings, subscriptions and recruitment support. No competitor price has been adopted as a BenchScout price.

[[3] Corporate Affairs Commission portals](https://icrp.cac.gov.ng/)  Business registration portal. Company lookup is available at https://icrp.cac.gov.ng/public-search/. Registration, brand rights and recruitment authority require separate consideration.

[[4] Federal Ministry of Labour and Employment](https://labour.gov.ng/professional-operations-departments/employment-and-wages/)  Describes the Ministry’s recruiter-licensing function. Obtain advice on applicability to BenchScout’s final operating model.

[[5] Nigeria Data Protection Commission guidance](https://ndpc.gov.ng/wp-content/uploads/2025/03/Updated-Guidance-Notice-on-Registtration-2024.pdf)  Guidance on controllers/processors of major importance; use with current official requirements and a business-specific assessment.

[[6] Nigeria Data Protection Commission](https://ndpc.gov.ng/)  Official regulator and starting point for current guidance, resources and registration information.

## Project evidence

[7] BenchScout project records dated 16 October 2026: docs/EMPLOYER-VERIFICATION.md, docs/CHANGELOG.md, docs/DEPLOYMENT.md and the corresponding implementation/test results. These record local feature readiness, the applied database migration, 153 passing tests, a successful build and the pending hosted deployment.

[8] BenchScout docs/SCHEDULER-AUDIT.md dated 14 October 2026. Records scheduler configuration, deployment limitations and email-delivery behaviour. It supports the requirement to verify unattended operation before promising scheduled service.

## Planning basis

Five employers, one role per employer, 30-day campaigns and the 90-day roadmap are proposed planning assumptions. This proposal contains no verified market-size estimate, secured partnerships, proven revenue, final price or guaranteed recruitment outcome. Pilot results should replace assumptions in the next commercial version.
