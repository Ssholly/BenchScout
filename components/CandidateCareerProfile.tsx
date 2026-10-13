"use client";
import { useState } from "react";
import { candidateProfile, type CandidateProfile } from "@/lib/candidate-profile";
import styles from "./CandidateCareer.module.css";
import { invalidateSharedPageRequests } from "@/lib/shared-page-request";

export default function CandidateCareerProfile({ phase, initial, onSaved }: { phase: string; initial: unknown; onSaved?: () => void }) {
  const [careerPhase, setPhase] = useState(phase);
  const [profile, setProfile] = useState(candidateProfile(initial));
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const intern = careerPhase === "internship";
  const changed = phase !== careerPhase;
  function field(key: keyof Omit<CandidateProfile, "placementStage" | "relocation">, label: string, type = "text", help?: string) {
    return <label className={styles.field} key={key}>{label}<input type={type} value={profile[key]} maxLength={500} disabled={busy} onChange={event => setProfile(value => ({ ...value, [key]: event.target.value }))} />{help && <small>{help}</small>}</label>;
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const identity = localStorage.getItem("benchscout_identity");
    try {
      const response = await fetch("/api/user/career", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ careerPhase, profile, confirmStageChange: confirmed }) });
      const data = await response.json();
      if (identity !== localStorage.getItem("benchscout_identity")) return;
      if (!response.ok) throw new Error(data.error || "Couldn’t save your career profile.");
      invalidateSharedPageRequests();
      localStorage.setItem("labpro_career_phase", careerPhase);
      if (profile.preferredLocations !== candidateProfile(initial).preferredLocations) localStorage.removeItem("labpro_dashboard_temp_location");
      if (changed) { window.location.replace("/settings#career-profile"); return; }
      setMessage("Career profile saved. Your documents and application history are preserved.");
      onSaved?.();
      window.dispatchEvent(new Event("userStateChanged"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t save. Please try again."); }
    finally { setBusy(false); }
  }
  return <section id="career-profile" className={styles.panel}>
    <header className={styles.heading}><div><span className={styles.kicker}>YOUR PROFESSIONAL JOURNEY</span><h2>Career profile</h2><p>Your stage shapes your dashboard and opportunities.</p></div><span className={styles.badge}>Self-reported</span></header>
    <form onSubmit={save}>
      <div className={styles.grid}>
        <label className={styles.field}>Professional stage<select disabled={busy} value={careerPhase} onChange={event => { setPhase(event.target.value); setConfirmed(false); }}><option value="internship">Intern</option><option value="licensed">Licensed scientist</option></select></label>
        {intern && <label className={styles.field}>Placement stage<select disabled={busy} value={profile.placementStage} onChange={event => setProfile(value => ({ ...value, placementStage: event.target.value as "seeking" | "training" }))}><option value="seeking">Seeking placement</option><option value="training">In training</option></select></label>}
        {field("institution", "B.MLS institution")}{field("graduationYear", "Graduation year", "text")}
        {intern ? <>{field("provisionalNumber", "Provisional registration number")}{field("provisionalExpiry", "Provisional validity date (if applicable)", "date")}</> : <>{field("experienceYears", "Years of experience", "number")}{field("specialties", "Specialties")}{field("rolePreferences", "Preferred roles", "text", "Permanent, locum, contract or part-time")}{field("salaryPreference", "Salary preference (optional)")}</>}
        {field("preferredLocations", intern ? "Preferred placement locations" : "Preferred work locations", "text", "Separate locations with commas. Leave blank to use your primary search location.")}
        {field("availabilityDate", "Available from", "date")}
      </div>
      <label className={styles.check}><input disabled={busy} type="checkbox" checked={profile.relocation} onChange={event => setProfile(value => ({ ...value, relocation: event.target.checked }))} />Open to relocation</label>
      {intern && profile.placementStage === "training" && <div className={styles.subsection}><h3>Current placement</h3><p>Record your institution and start date. Dates describe your own record, not verified completion.</p><div className={styles.grid}>{field("placementInstitution", "Placement institution")}{field("placementStart", "Start date", "date")}{field("placementEnd", "Expected completion date", "date")}</div></div>}
      <div className={styles.subsection}><h3>Your next action</h3><div className={styles.grid}>{field("nextAction", "Reminder (optional)", "text", "For example: prepare interview documents")}{field("nextActionDate", "Reminder date (optional)", "date")}</div></div>
      {changed && <div className={styles.notice}><p>{intern ? "Changing to Intern preserves your documents and past applications." : "Upload a practicing license and record its registration number and valid expiry in the vault before changing to Licensed scientist."} A stage change does not grant reviewed credentials.</p><label className={styles.check}><input disabled={busy} type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I confirm this professional-stage change.</label></div>}
      <div className={styles.footer}><p role="status">{message || "Uploads and profile completeness are separate from independent credential review."}</p><button disabled={busy || (changed && !confirmed)} className={styles.primary}>{busy ? "Saving…" : "Save career profile"}</button></div>
    </form>
  </section>;
}
