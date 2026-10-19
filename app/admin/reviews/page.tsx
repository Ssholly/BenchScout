"use client";
import { useState } from "react";
import Link from "next/link";

type Employer = { id: string; email: string; companyName: string; verificationStatus: string; verificationRevision: number; verificationDetails: Record<string, unknown>; verificationFeedback: string | null };
type Vacancy = { id: string; role: string; company: string; loc: string; skills: string; salary: string; updatedAt: string; employerId: string; listingDetails: Record<string, unknown> };
type Report = { id: string; jobId: string; reason: string; details: string; job: { role: string; company: string; employer: { email: string } | null } | null };
type Queue = { employers: Employer[]; vacancies: Vacancy[]; reports: Report[]; history: { id: string; kind: string; subjectId: string; decision: string; reviewer: string; createdAt: string; evidence: Record<string, unknown> }[] };
const companyLabels = { registration: "CAC record / public institution authority: matching name, number, source and date", recruiter: "Recruiter authority: confirmation through independently obtained company contact", presence: "Address, official contacts and organisation presence cross-checked", operatingCredentials: "Relevant operating / facility credentials checked, or why not applicable" };
const vacancyLabels = { authority: "Recruitment authorised by the organisation: independent contact and confirmation date", vacancy: "Role, location, terms and availability independently confirmed", noFees: "No application / interview / placement fees; suspicious links and data requests checked" };
export default function ReviewPage() {
  const [kind, setKind] = useState("employer");
  const [jobId, setJobId] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [reference, setReference] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("rejected");
  const [approved, setApproved] = useState(false);
  const [checks, setChecks] = useState<Record<string, string>>({});
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [reportId, setReportId] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const auth = { "Content-Type": "application/json", Authorization: `Bearer ${secret}` };
  function resetReview(nextKind: string) { setKind(nextKind); setChecks({}); setApproved(false); setDecision(nextKind === "report" ? "dismissed" : "rejected"); setReference(""); setFeedback(""); setSelectedEmployer(null); setSelectedVacancy(null); setReportId(""); }
  async function load(account?: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/reviews${account ? `?account=${encodeURIComponent(account.trim())}` : ""}`, { headers: auth });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load reviews.");
      setQueue(data);
      if (account) {
        resetReview("employer");
        const employer = data.employers[0];
        if (employer) { setSelectedEmployer(employer); setEmail(employer.email); } else setMessage("Employer not found.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed."); } finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/reviews", { method: "POST", headers: auth, body: JSON.stringify({ kind, email, jobId, reference, approved: kind === "employer" ? decision === "approved" : approved, decision, reviewer, feedback, checks, revision: selectedEmployer?.verificationRevision, jobUpdatedAt: selectedVacancy?.updatedAt, reportId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review could not be saved.");
      setMessage("Decision saved. Reload the queue before the next review."); setQueue(null); setSelectedEmployer(null); setSelectedVacancy(null); setReportId(""); setChecks({}); setSecret("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed."); } finally { setBusy(false); }
  }
  const isSafety = ["employer", "vacancy", "report"].includes(kind);
  const isApproval = kind === "employer" ? decision === "approved" : approved;
  const labels = kind === "employer" ? companyLabels : vacancyLabels;
  return <section className="safety-admin">
    <Link href="/admin">← Job administration</Link>
    <h1 style={{fontSize:24}}>Employer and vacancy reviews</h1>
    <p>Check evidence independently. CAC registration confirms a registered entity; recruiter authority and vacancy authenticity need separate checks. Company approval does not establish internship-site accreditation.</p>
    <p><a href="https://icrp.cac.gov.ng/public-search/" target="_blank" rel="noopener noreferrer">Open official CAC public search ↗</a></p>
    <div className="safety-card safety-form">
      <label>Administrator secret<input type="password" autoComplete="off" value={secret} onChange={event => setSecret(event.target.value)} /></label>
      <button disabled={busy || !secret} type="button" onClick={() => load()}>Load pending companies, vacancies and reports</button>
      <label>Find any employer by account email<input type="email" value={email} onChange={event => {setEmail(event.target.value); setSelectedEmployer(null);}} /></label>
      <button disabled={busy || !secret || !email} type="button" onClick={() => load(email)}>Find employer / review suspension</button>
    </div>
    {queue && <div className="safety-card">
      <h2>Company queue ({queue.employers.length}, up to 50)</h2>
      {queue.employers.map(employer => <div className="queue-item" key={employer.id}><strong>{employer.companyName}</strong><p>{employer.email} · {employer.verificationStatus}</p><button type="button" onClick={() => { resetReview("employer"); setSelectedEmployer(employer); setEmail(employer.email); }}>Review company</button></div>)}
      <h2>Vacancies awaiting review ({queue.vacancies.length}, up to 50)</h2>
      {queue.vacancies.map(job => <div className="queue-item" key={job.id}><strong>{job.role}</strong><p>{job.company} · {job.loc}</p><button type="button" onClick={() => {resetReview("vacancy"); setSelectedVacancy(job); setJobId(job.id);}}>Review vacancy</button></div>)}
      <h2>Open candidate reports ({queue.reports.length}, up to 50)</h2>
      {queue.reports.map(report => <div className="queue-item" key={report.id}><strong>{report.job?.role || "Deleted vacancy"} · {report.job?.company}</strong><p>{report.reason}: {report.details}</p><p>Vacancy ID: {report.jobId}</p>{report.job?.employer && <p>Employer account: {report.job.employer.email}</p>}<button type="button" onClick={() => {resetReview("report"); setReportId(report.id);}}>Resolve report</button></div>)}
      <details><summary>Recent decision history (up to 25)</summary>{queue.history.map(review => <details className="queue-item" key={review.id}><summary>{review.kind} · {review.decision} · {review.reviewer} · {new Date(review.createdAt).toLocaleString("en-GB")}</summary><p>{review.subjectId}</p><pre>{JSON.stringify(review.evidence, null, 2)}</pre></details>)}</details>
    </div>}
    <form className="safety-card safety-form" onSubmit={submit}>
      <label>Review type<select value={kind} onChange={event => resetReview(event.target.value)}><option value="employer">Employer company</option><option value="vacancy">Vacancy</option><option value="report">Candidate report</option><option value="internship">Internship institution approval</option><option value="candidate">Candidate license</option></select></label>
      {kind === "employer" && <>{selectedEmployer ? <><strong>{selectedEmployer.companyName} · {selectedEmployer.email} · {selectedEmployer.verificationStatus}</strong><pre>{JSON.stringify(selectedEmployer.verificationDetails, null, 2)}</pre></> : <p>Select a company from the queue or find it by email above. Existing approvals need a new company submission before receiving the updated approval.</p>}<label>Decision<select value={decision} onChange={event => setDecision(event.target.value)}><option value="rejected">Request changes / reject</option><option value="approved">Approve company</option><option value="suspended">Suspend employer</option></select></label><label>Feedback visible to employer<textarea required maxLength={1000} value={feedback} onChange={event => setFeedback(event.target.value)} /></label></>}
      {kind === "vacancy" && (selectedVacancy ? <pre>{JSON.stringify(selectedVacancy, null, 2)}</pre> : <p>Select a vacancy from the queue first.</p>)}
      {kind === "report" && <><p>{reportId ? `Selected report: ${reportId}` : "Select a candidate report first."}</p><label>Resolution<select value={decision} onChange={event => setDecision(event.target.value)}><option value="dismissed">Dismiss after investigation</option><option value="removed">Remove vacancy</option></select></label><p>For company impersonation or repeated abuse, also find the employer above and save a suspension decision.</p></>}
      {kind === "internship" && <label>Internship vacancy ID<input required value={jobId} onChange={event => setJobId(event.target.value)} /></label>}
      {kind === "candidate" && <label>Candidate email<input type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>}
      {!["employer", "report"].includes(kind) && <label className="safety-check"><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} />Approve after independent review (leave unchecked to reject / revoke)</label>}
      {["employer", "vacancy"].includes(kind) && isApproval && Object.entries(labels).map(([key, label]) => <label key={key}>{label}<textarea required minLength={10} maxLength={1500} value={checks[key] || ""} onChange={event => setChecks({ ...checks, [key]: event.target.value })} /></label>)}
      {isSafety && <label>Reviewer name<input required maxLength={250} value={reviewer} onChange={event => setReviewer(event.target.value)} /></label>}
      <label>Evidence references / decision reason<textarea required minLength={10} maxLength={2000} value={reference} onChange={event => setReference(event.target.value)} /></label>
      <button disabled={busy || !secret || (kind === "employer" && !selectedEmployer) || (kind === "vacancy" && !selectedVacancy) || (kind === "report" && !reportId)}>{busy ? "Saving…" : "Save review decision"}</button>
    </form>
    <p role="status">{message}</p>
  </section>;
}
