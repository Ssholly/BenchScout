"use client";
import { useEffect, useRef, useState } from "react";

export default function ResumeKeywordExtraction({ disabled, onSuggestions }: {
  disabled: boolean; onSuggestions: (keywords: string[]) => void;
}) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const extract = async () => {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/extract-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consent }) });
      const data = await response.json();
      if (!alive.current) return;
      if (!response.ok || !data.success) throw new Error(data.error || "Skills extraction failed. Please try again.");
      onSuggestions(data.keywords);
      setMessage(data.keywords.length ? "Suggestions added below. Review them, then select Update Profile to save." : "No skills or roles were identified. You can add keywords manually.");
    } catch (error) {
      if (alive.current) setMessage(error instanceof Error ? error.message : "Skills extraction failed. Please try again.");
    } finally { if (alive.current) setBusy(false); }
  };
  return <div className="resume-keyword-extraction">
    <label><input type="checkbox" checked={consent} disabled={disabled || busy} onChange={event => setConsent(event.target.checked)} />
      <span>Use my saved CV text with Google AI to suggest skills and roles.</span></label>
    <button type="button" disabled={disabled || busy || !consent} onClick={extract}>{busy ? "Extracting skills…" : "Extract skills from CV"}</button>
    <p>{disabled ? "Upload a CV to enable extraction." : "Your existing keywords stay in place. Review AI suggestions before saving."}</p>
    {message && <p role="status">{message}</p>}
  </div>;
}
