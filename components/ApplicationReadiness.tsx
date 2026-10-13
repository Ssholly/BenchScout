"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { applicationReadiness } from "@/lib/readiness";
type Readiness = ReturnType<typeof applicationReadiness>;
export default function ApplicationReadiness() {
  const [data, setData] = useState<Readiness | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/readiness", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load readiness");
        const payload: Readiness = await response.json();
        setData(payload); setFailed(false);
      } catch { if (!controller.signal.aborted) setFailed(true); }
    }
    void load();
    window.addEventListener("userStateChanged", load);
    return () => { controller.abort(); window.removeEventListener("userStateChanged", load); };
  }, []);
  return <section className="application-readiness" aria-labelledby="readiness-title" style={{ background: "white", border: "1px solid #dbe7e3", borderRadius: 16, padding: "1.25rem", marginBottom: "1.5rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <h2 id="readiness-title" style={{ margin: 0, fontSize: 18, color: "#0B2444" }}>{data?.careerPhase === "internship" ? data.placementStage === "training" ? "Your training documents" : "Your placement readiness" : "Your application readiness"}</h2>
      {data && <span style={{ color: "#1A8C7A", fontWeight: 700 }}>{data.complete} of {data.total} complete</span>}
    </div>
    {!data && <p role="status">{failed ? "Readiness is temporarily unavailable." : "Checking your profile…"}</p>}
    {data && <>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px", padding: 0, listStyle: "none" }}>
        {data.checks.map(check => <li key={check.key}><Link href={check.href} style={{ color: check.done ? "#246451" : "#526174", textDecoration: "none", fontSize: 13 }}>{check.done ? "✓" : "○"} {check.label}</Link></li>)}
      </ul>
      <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 12 }}>Credentials: <strong>{data.credentialStatus}</strong>. {data.note}</p>
    </>}
  </section>;
}
