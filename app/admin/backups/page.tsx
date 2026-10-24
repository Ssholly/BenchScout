"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function BackupOperations() {
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [targetFingerprint, setTargetFingerprint] = useState("");
  const [backfillPlan, setBackfillPlan] = useState<{ token: string; files: number } | null>(null);
  const [copyApproved, setCopyApproved] = useState(false);
  const [cleanupApproved, setCleanupApproved] = useState(false);
  async function run(action: string) {
    setBusy(true); setResult("");
    if (action !== "production-backfill-apply") setBackfillPlan(null);
    try {
      const confirmations: Record<string, string> = { "synthetic-restore": "DELETE QA ONLY", "runtime-storage-check": "DELETE RUNTIME QA ONLY", "runtime-alert": "SEND RUNTIME ALERT", "production-backfill-apply": "COPY CURRENT PRIVATE FILES" };
      if (action === "production-backfill-apply" && (!backfillPlan || !copyApproved)) throw new Error("Review the preview first");
      if (action === "cleanup-process" && !cleanupApproved) throw new Error("Confirm pending file deletion first");
      const response = await fetch(action.startsWith("cleanup-") ? "/api/admin/document-cleanup" : "/api/admin/document-backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminSecret: secret, action: action.startsWith("cleanup-") ? action.slice(8) : action, ...(action === "cleanup-process" ? { confirm: "PROCESS PENDING DELETIONS" } : {}), ...(confirmations[action] ? { confirm: confirmations[action] } : {}), ...(action.startsWith("production-backfill-") ? { expectedTargetFingerprint: targetFingerprint, ...(action === "production-backfill-apply" ? { planToken: backfillPlan?.token } : {}) } : {}) }) });
      const data = await response.json();
      if (action === "production-backfill-preview" && response.ok && data.canApply && typeof data.planToken === "string") setBackfillPlan({ token: data.planToken, files: data.uniqueFiles });
      // Keep the signed approval plan in memory; do not display it in copied results.
      const display = { ...data };
      delete display.planToken;
      setResult(JSON.stringify(display, null, 2));
    } catch { setResult("Request could not complete. No recovery result is established."); }
    finally { setSecret(""); setBusy(false); setCopyApproved(false); setCleanupApproved(false); if (action === "production-backfill-apply") setBackfillPlan(null); }
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
    <details>
    <summary>Production older-file backfill</summary>
    <p>First preview the current vault inventory without reading file contents or copying files. Compare it with the independently verified Production database. Plans expire after 15 minutes and are rejected if the target, backup configuration or current file references change. This pilot tool is limited to 100 accounts and 10 distinct files per reviewed plan. Applying stays disabled until the operator enables it after reviewing live backup hooks or an approved write pause.</p>
    <label htmlFor="backfill-target">Verified Production database fingerprint</label>
    <input id="backfill-target" type="text" autoComplete="off" maxLength={64} spellCheck={false} value={targetFingerprint} onChange={event => { setTargetFingerprint(event.target.value.trim()); setBackfillPlan(null); setCopyApproved(false); }} />
    <button disabled={busy || !secret || !/^[a-f0-9]{64}$/.test(targetFingerprint)} onClick={() => run("production-backfill-preview")}>Preview current Production files</button>
    {backfillPlan && <>
      <p>Prepared inventory: {backfillPlan.files} distinct current files. Applying creates encrypted, decrypt-verified copies in the configured private Production backup store. Existing source files, candidate records and application permissions stay unchanged. A copy whose source is no longer current is removed from backup storage.</p>
      <label className={styles.approval}><input type="checkbox" checked={copyApproved} onChange={event => setCopyApproved(event.target.checked)} />I approve this reviewed current-file copy and cleanup of archive copies whose source is no longer current.</label>
      <button disabled={busy || !secret || !copyApproved} onClick={() => run("production-backfill-apply")}>Back up reviewed Production files</button>
    </>}
    </details>
    <details>
    <summary>Pending document deletion</summary>
    <p>Check durable cleanup counts without reading files. Processing retries up to five server-recorded deletion requests. It permanently removes detached files and their encrypted copies after checking that no current vault still references them. Existing active documents and sharing choices are not changed.</p>
    <button disabled={busy || !secret} onClick={() => run("cleanup-status")}>Check pending deletion counts</button>
    <p>Recent runs show authenticated endpoint execution, timestamps and counts. The cron agent hint alone does not prove an automatic scheduled invocation. An unfinished run has an unknown outcome.</p>
    <button disabled={busy || !secret} onClick={() => run("cleanup-runs")}>Check recent cleanup runs</button>
    <label className={styles.approval}><input type="checkbox" checked={cleanupApproved} onChange={event => setCleanupApproved(event.target.checked)} />I approve retrying permanent deletion of the queued, detached files.</label>
    <button disabled={busy || !secret || !cleanupApproved} onClick={() => run("cleanup-process")}>Retry pending file deletion</button>
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
