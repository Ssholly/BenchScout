import type { ProfessionalSummary as Summary } from "@/lib/professional-summary";
import ProfessionalSummary from "@/components/ProfessionalSummary";

export default function ApplicationSharingNotice({ company, summary }: { company: string; summary?: Summary | null }) {
  return <section aria-label="What this employer can see" style={{ padding: "16px 24px", fontSize: 13, lineHeight: 1.6, overflowWrap: "anywhere" }}>
    <h3 style={{ fontSize: 15, margin: "0 0 6px" }}>What you share with {company}</h3>
    <p style={{ margin: "0 0 6px" }}>Submitting shares your name, email, professional stage and credential-review status. Only the documents selected below are shared for this application. Your CV is required; other documents are optional. Personal reminders are private.</p>
    <p style={{ margin: 0 }}>Replacing or deleting a selected document ends access to that version; its replacement is not automatically shared. Withdrawing this application ends its document access. Documents selected for another application to this employer remain accessible through that application. Copies already downloaded cannot be recalled. Review your documents in <a href="/settings">Profile &amp; documents</a> before submitting.</p>
    <div style={{ marginTop: 12 }}>
      {summary === undefined ? <p role="status">Your professional summary preview has not loaded yet.</p> : summary ? <ProfessionalSummary preview summary={summary} /> : <p>Your optional professional summary is not shared. You can preview it and turn sharing on in <a href="/settings#career-profile">Career profile</a>.</p>}
      {summary && <p style={{ marginBottom: 0 }}>This is your current shared summary. Saved changes update what existing applicant employers can see. Manage sharing in <a href="/settings#career-profile">Career profile</a>.</p>}
    </div>
  </section>;
}
