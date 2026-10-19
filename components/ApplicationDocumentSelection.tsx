"use client";
export type ApplicationDocumentOption = { kind: string; name: string; available: boolean; revision: string | null };
export default function ApplicationDocumentSelection({ documents, selected, busy, onToggle, onRefresh }: {
  documents: ApplicationDocumentOption[]; selected: string[]; busy: boolean;
  onToggle: (kind: string, checked: boolean) => void; onRefresh: () => void;
}) {
  return <fieldset className="application-document-selection" style={{ margin: "0 24px 16px", padding: 16, border: "1px solid #cbd5e1", borderRadius: 12 }}>
    <legend style={{ fontWeight: 700, fontSize: 14, padding: "0 4px" }}>Documents for this application</legend>
    <p style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>Your CV is included. Choose any additional documents you want this employer to receive.</p>
    {documents.map(doc => <label key={doc.kind} style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44, fontSize: 13, cursor: doc.available && doc.kind !== "resume" ? "pointer" : "default" }}>
      <input type="checkbox" checked={selected.includes(doc.kind)} disabled={!doc.available || doc.kind === "resume" || busy} onChange={event => onToggle(doc.kind, event.target.checked)} />
      <span>{doc.name}{doc.kind === "resume" ? " (required)" : ""}{!doc.available ? " — upload privately to include" : ""}</span>
    </label>)}
    {!documents.some(doc => doc.kind === "resume" && doc.available) && <p role="alert" style={{ fontSize: 13, color: "#b45309", marginTop: 8 }}>Upload your CV privately in <a href="/settings">Profile &amp; documents</a> before submitting.</p>}
    <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Selected: {documents.filter(doc => selected.includes(doc.kind) && doc.available).map(doc => doc.name).join(", ") || "No available documents"}</p>
    <button type="button" onClick={onRefresh} disabled={busy} style={{ marginTop: 8, border: 0, background: "transparent", color: "#0b2444", textDecoration: "underline", cursor: "pointer" }}>Refresh document preview</button>
  </fieldset>;
}
