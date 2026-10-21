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
      const confirmations: Record<string, string> = { "synthetic-restore": "DELETE QA ONLY", "runtime-storage-check": "DELETE RUNTIME QA ONLY", "runtime-alert": "SEND RUNTIME ALERT" };
      const response = await fetch("/api/admin/document-backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminSecret: secret, action, ...(confirmations[action] ? { confirm: confirmations[action] } : {}) }) });
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
    <h2>Deployment runtime checks</h2>
    <p>Check the running deployment’s database connection and backup configuration without reading candidate records or document contents. The target fingerprint can be compared privately with the intended database. A successful connection alone does not prove it is the intended database.</p>
    <button disabled={busy || !secret} onClick={() => run("runtime-readiness")}>Check deployed database connection</button>
    <details>
    <summary>Production storage and alert checks</summary>
    <p>Available on Production deployments, including a staged deployment, with synthetic test mode off. The storage check creates new QA-only files, verifies encrypted backup and exact restoration after source loss, then permanently deletes only its generated source, restored file and archive. Existing candidate files, business records and application permissions are untouched. Clicking the storage button confirms those QA-only deletions.</p>
    <button disabled={busy || !secret} onClick={() => run("runtime-storage-check")}>Run Production QA storage check</button>
    <p>The alert button sends one clearly labelled QA-only message to the configured, approved Production alert inbox. Confirm actual inbox receipt separately.</p>
    <button disabled={busy || !secret} onClick={() => run("runtime-alert")}>Send Production test alert</button>
    </details>
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
