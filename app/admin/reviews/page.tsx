"use client";
import { useState } from "react";
import Link from "next/link";
export default function ReviewPage() {
  const [kind, setKind] = useState("employer");
  const [jobId, setJobId] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [reference, setReference] = useState("");
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` }, body: JSON.stringify({ kind, email, jobId, reference, approved }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Review could not be saved");
      setMessage(`${kind === "employer" ? "Employer" : "Candidate license"} review saved for ${email.trim()}: ${approved ? "approved" : "not approved"}.`); setSecret("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed."); } finally { setBusy(false); }
  }
  const input = { display: "block", width: "100%", margin: "6px 0 18px", padding: 12, border: "1px solid #cbd5e1", borderRadius: 8 };
  return <section style={{ maxWidth: 620, margin: "0 auto", background: "white", padding: 28, borderRadius: 16 }}>
    <Link href="/admin">← Job administration</Link>
    <h1>Credential and employer reviews</h1>
    <p>Record a decision after checking the evidence independently. Reading a document with AI does not establish authenticity.</p>
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label>Account type<select style={input} value={kind} onChange={event => setKind(event.target.value)}><option value="employer">Employer</option><option value="internship">Internship institution approval</option><option value="candidate">Candidate license</option></select></label>
      {kind === "internship" ? <label>Internship vacancy ID<input style={input} required value={jobId} onChange={event => setJobId(event.target.value)} /></label> : <label>Account email<input style={input} type="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>}
      <label>Evidence checked / reference<textarea style={input} required minLength={10} maxLength={2000} value={reference} onChange={event => setReference(event.target.value)} /></label>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, lineHeight: 1.5, padding: "10px 0" }}><input style={{ flexShrink: 0, marginTop: 4 }} type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} /> <span>Approve after independent review (leave unchecked to revoke approval)</span></label>
      <label>Administrator secret<input style={input} type="password" autoComplete="off" required value={secret} onChange={event => setSecret(event.target.value)} /></label>
      <button disabled={busy} style={{ padding: "12px 20px", background: "#0B2444", color: "white", border: 0, borderRadius: 8 }}>{busy ? "Saving…" : approved ? "Save approval" : "Save as not approved"}</button>
      <p role="status">{message}</p>
    </form>
  </section>;
}
