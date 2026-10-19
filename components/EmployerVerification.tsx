"use client";
import { useEffect, useState } from "react";

const initial = { organisationType: "registered-business", legalName: "", registrationNumber: "", address: "", website: "", recruiterName: "", recruiterRole: "", workEmail: "", phone: "", authorityEvidence: "", operatingCredentials: "", noFees: false, authorised: false };
const labels = {
  legalName: "Registered / official organisation name", registrationNumber: "CAC number (RC / BN / IT), or public institution authority reference",
  address: "Physical address", website: "Official website (optional)", recruiterName: "Your full name", recruiterRole: "Your role / job title", workEmail: "Work email", phone: "Contact phone",
  authorityEvidence: "How can we independently confirm your recruitment authority?", operatingCredentials: "Relevant facility registration / operating credentials, or explain why they do not apply",
};
export default function EmployerVerification({ onStatusChange }: { onStatusChange: (verified: boolean) => void }) {
  const [fields, setFields] = useState(initial);
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    fetch("/api/employer/verification").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load company verification.");
      if (active) { setFields({ ...initial, legalName: data.companyName, ...data.verificationDetails }); setStatus(data.verificationStatus); setFeedback(data.verificationFeedback || ""); onStatusChange(data.isVerified); }
    }).catch(error => { if (active) { setStatus("unavailable"); setMessage(error.message); } });
    return () => { active = false; };
  }, [refresh, onStatusChange]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/employer/verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed.");
      setStatus("pending"); setFeedback(""); setMessage(data.message); setOpen(false); onStatusChange(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed."); } finally { setBusy(false); }
  }
  const statusLabel: Record<string, string> = { loading: "Loading…", unsubmitted: "Details needed", pending: "Awaiting review", approved: "Company reviewed", "legacy-approved": "Existing approval · updated checks needed", rejected: "Changes requested", suspended: "Account suspended", unavailable: "Could not load status" };
  return <section className="safety-card" aria-label="Company verification">
    <div className="safety-heading"><div><h2>Company verification</h2><p>{statusLabel[status] || status}</p></div><button type="button" onClick={() => setRefresh(value => value + 1)} disabled={busy}>Refresh status</button></div>
    <p>We independently check registration, recruiter authority and operating credentials before approving recruitment access. Each new or edited vacancy also needs review.</p>
    {feedback && <p><strong>Reviewer feedback:</strong> {feedback}</p>}
    {status !== "suspended" && status !== "loading" && status !== "unavailable" && <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close details" : status === "unsubmitted" ? "Submit company details" : "View / update details"}</button>}
    {status === "suspended" && <p>Contact Help and Support to request a review. Resubmitting details cannot lift a suspension.</p>}
    {open && <form onSubmit={submit} className="safety-form">
      <p>Updating details pauses company approval and active vacancies until they are reviewed again. Provide reference numbers and official sources; do not include passwords, bank details or identity documents.</p>
      <label>Organisation type<select value={fields.organisationType} onChange={event => setFields({ ...fields, organisationType: event.target.value })}><option value="registered-business">Registered business / organisation</option><option value="public-institution">Public institution</option></select></label>
      {Object.entries(labels).map(([key, label]) => <label key={key}>{label}{["authorityEvidence", "operatingCredentials", "address"].includes(key) ? <textarea required maxLength={key === "address" ? 600 : 1500} value={fields[key as keyof typeof labels]} onChange={event => setFields({ ...fields, [key]: event.target.value })} /> : <input required={key !== "website"} type={key === "website" ? "url" : key === "workEmail" ? "email" : key === "phone" ? "tel" : "text"} maxLength={key === "website" ? 2048 : key === "phone" ? 40 : 250} value={fields[key as keyof typeof labels]} onChange={event => setFields({ ...fields, [key]: event.target.value })} />}</label>)}
      <label className="safety-check"><input type="checkbox" required checked={fields.authorised} onChange={event => setFields({ ...fields, authorised: event.target.checked })} />I am authorised to recruit for this organisation.</label>
      <label className="safety-check"><input type="checkbox" required checked={fields.noFees} onChange={event => setFields({ ...fields, noFees: event.target.checked })} />We will not charge applicants recruitment fees.</label>
      <button disabled={busy}>{busy ? "Submitting…" : "Submit for company review"}</button>
    </form>}
    <p role="status">{message}</p>
  </section>;
}
