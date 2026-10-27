"use client";
import { useState } from "react";
export default function JobReport({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("payment");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/jobs/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, reason, details }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Report failed.");
      setMessage(data.message); setSent(true); setOpen(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Report failed."); } finally { setBusy(false); }
  }
  return <div className="safety-report">
    {!sent && <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Cancel report" : "Report suspicious job"}</button>}
    {open && <div className="safety-form"><label>Reason<select value={reason} onChange={event => setReason(event.target.value)}><option value="payment">Asked to pay money</option><option value="impersonation">Company impersonation</option><option value="fake-vacancy">Fake or misleading vacancy</option><option value="sensitive-data">Asked for sensitive financial information</option><option value="other">Other concern</option></select></label><label>What happened?<textarea minLength={10} maxLength={2000} value={details} onChange={event => setDetails(event.target.value)} placeholder="Describe the concern. Do not include passwords, bank details or private documents." /></label><button type="button" disabled={busy || details.trim().length < 10} onClick={submit}>{busy ? "Sending…" : "Send report"}</button></div>}
    <p role="status">{message}</p>
  </div>;
}
