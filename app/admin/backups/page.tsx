"use client";

import { useState } from "react";

export default function BackupOperations() {
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  async function run(action: string) {
    setBusy(true); setResult("");
    try {
      const response = await fetch("/api/admin/document-backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminSecret: secret, action, ...(action === "synthetic-restore" ? { confirm: "DELETE QA ONLY" } : {}) }) });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch { setResult("Request could not complete. No recovery result is established."); }
    finally { setSecret(""); setBusy(false); }
  }
  return <main style={{ maxWidth: 760, margin: "40px auto", padding: 24 }}>
    <h1>Document backup operations</h1>
    <p>Restricted operator tool. Status checks do not read document contents.</p>
    <label htmlFor="backup-admin">Administrator secret</label>
    <input id="backup-admin" type="password" autoComplete="off" value={secret} onChange={event => setSecret(event.target.value)} style={{ display: "block", width: "100%", padding: 12, margin: "8px 0 16px" }} />
    <button disabled={busy || !secret} onClick={() => run("status")}>Check backup configuration</button>
    <h2>Synthetic loss and restoration</h2>
    <p>This creates a new QA-only private file, encrypts and verifies its backup, permanently deletes that QA source, restores it to an isolated location and checks its exact bytes. It then deletes only the newly generated QA recovery objects. Candidate files, database records, application permissions and sessions are untouched. Available only when the test-mode flag is enabled outside Production.</p>
    <p>Clicking the button confirms these permanent deletions of newly generated synthetic files.</p>
    <button disabled={busy || !secret} onClick={() => run("synthetic-restore")}>Run synthetic loss-and-restore check</button>
    {busy && <p role="status">Checking private storage…</p>}
    {result && <pre role="status" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: 24 }}>{result}</pre>}
  </main>;
}
