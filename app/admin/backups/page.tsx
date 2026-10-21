"use client";

import { useState } from "react";
import styles from "./page.module.css";

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
  return <main className={styles.page}>
    <h1>Document backup operations</h1>
    <p>Restricted operator tool. Status checks do not read document contents.</p>
    <label htmlFor="backup-admin">Administrator secret</label>
    <input id="backup-admin" type="password" autoComplete="off" value={secret} onChange={event => setSecret(event.target.value)} />
    <button disabled={busy || !secret} onClick={() => run("status")}>Check backup configuration</button>
    <h2>Older synthetic files</h2>
    <p>Back up and decrypt-verify the current private vault files belonging only to QA ONLY - Synthetic Candidate 20261020. Replaced or deleted references are excluded. Files, database records and application consent stay unchanged. Real accounts are outside this check.</p>
    <button disabled={busy || !secret} onClick={() => run("synthetic-backfill")}>Backfill older QA files</button>
    <h2>Alert delivery</h2>
    <p>Send one clearly labelled QA-only delivery test to the configured operator inbox using the same mail path as backup-failure alerts. No failure is induced and no document data is included. Inbox receipt must be confirmed separately.</p>
    <button disabled={busy || !secret} onClick={() => run("test-alert")}>Send test backup alert</button>
    <details>
    <summary>Repeat the synthetic loss-and-restore check</summary>
    <p>This creates a new QA-only private file, encrypts and verifies its backup, permanently deletes that QA source, restores it to an isolated location and checks its exact bytes. It then deletes only the newly generated QA recovery objects. Candidate files, database records, application permissions and sessions are untouched. Available only when the test-mode flag is enabled outside Production.</p>
    <p>Clicking the button confirms these permanent deletions of newly generated synthetic files.</p>
    <button disabled={busy || !secret} onClick={() => run("synthetic-restore")}>Run synthetic loss-and-restore check</button>
    </details>
    {busy && <p role="status">Checking private storage…</p>}
    {result && <pre role="status">{result}</pre>}
  </main>;
}
