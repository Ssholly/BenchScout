"use client";
import Link from "next/link";
import ApplicationReadiness from "@/components/ApplicationReadiness";
import { candidateProfile, opportunityForPhase, listingDetails, internshipApproval } from "@/lib/candidate-profile";
import type { ClientJob } from "@/lib/types";
import styles from "./CandidateCareer.module.css";
import ScanSummary from "./ScanSummary";

const dateLabel = (value: string) => value ? new Date(`${value.slice(0,10)}T12:00:00`).toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric" }) : "Not recorded";
export default function InternDashboard({ initial, jobs, onScan, scanning, unavailable, location, locations, onLocationChange, minScore, autoSend, onAutoSendChange }: { initial: unknown; jobs: ClientJob[]; onScan: () => void; scanning: boolean; unavailable: boolean; location:string; locations:string[]; onLocationChange:(value:string)=>void; minScore:number; autoSend:boolean; onAutoSendChange:()=>void }) {
  const profile = candidateProfile(initial);
  const training = profile.placementStage === "training";
  const pipeline = jobs.filter(job => job.applied);
  const failed = unavailable;
  const placements = jobs.filter(job => opportunityForPhase(job,"internship") && job.status === "active" && !job.applied);
  const status = (job: ClientJob) => job.applications?.[0]?.status || job.status;
  const interviews = pipeline.filter(job => ["shortlisted","interviewing","interview"].includes(status(job) || ""));
  const offers = pipeline.filter(job => ["hired","offer","offered","accepted"].includes(status(job) || ""));
  const invites = jobs.filter(job => job.isScoutedInvite && !job.applied);
  const future = new Date().toISOString().slice(0,10);
  const deadlines = placements.filter(job => { const deadline=listingDetails(job.listingDetails).deadline; return deadline && deadline >= future; }).sort((a,b)=>listingDetails(a.listingDetails).deadline.localeCompare(listingDetails(b.listingDetails).deadline)).slice(0,3);
  return <div className={styles.internHub}>
    <header className={styles.heading}><div><span className={styles.kicker}>YOUR INTERNSHIP JOURNEY</span><h1>{training ? "Your training hub" : "Your placement hub"}</h1><p>{training ? "Keep your placement details, documents and next steps together." : "Find placements and follow your applications in one place."}</p></div><Link className={styles.primary} href={training ? "/settings#career-profile" : "/matches"}>{training ? "View my placement" : "Find placements"} →</Link></header>
    <span className={styles.badge} style={{marginBottom:16}}>{training ? "In training · self-reported" : "Seeking placement"}</span>
    <ApplicationReadiness />
    <div className={styles.metrics}>
      {(training ? [
        ["Placement",profile.placementInstitution || "Not recorded","Institution recorded by you"],
        ["Started",dateLabel(profile.placementStart),"Recorded start date"],
        ["Expected completion",dateLabel(profile.placementEnd),"Does not confirm completion"],
        ["Next action",profile.nextAction || "Add a reminder",profile.nextActionDate ? dateLabel(profile.nextActionDate) : "Manage in your profile"],
      ] : [
        ["Available placements",String(placements.length),"Saved listings matching your stage"],
        ["Applications",failed ? "—" : String(pipeline.length),"Platform and tracked external applications"],
        ["Interviews",failed ? "—" : String(interviews.length),"Recorded interview stages"],
        ["Offers / invitations",failed ? "—" : String(offers.length+invites.length),"Recorded offers and recruitment invitations"],
      ]).map(([label,value,note])=><div key={label} className={styles.metric}><small>{label}</small><strong style={{fontSize:training ? 16 : undefined}}>{value}</strong><p>{note}</p></div>)}
    </div>
    <div className={styles.columns}>
      <section className={styles.panel}>
        <div className={styles.heading}><div><h2>{training ? "Your current placement" : "Placement opportunities"}</h2><p>{training ? "Keep this record up to date as your training progresses." : "Check institution requirements and source details before applying."}</p></div></div>
        {training ? <><div className={styles.listing}><h3>{profile.placementInstitution || "Add your placement institution"}</h3><p>Start: {dateLabel(profile.placementStart)}</p><p>Expected completion: {dateLabel(profile.placementEnd)}</p><p>Training details are self-reported. Completing these dates does not change your professional stage.</p></div><Link className={styles.link} href="/settings#career-profile">Update placement details →</Link><br/><Link className={styles.link} href="/applied">View previous applications →</Link></> : <>
          {placements.slice(0,4).map(job => { const details=listingDetails(job.listingDetails); return <article className={styles.listing} key={job.id}><h3>{job.role}</h3><p>{job.company} · {job.loc}</p><p>Allowance: {job.salary || "Not disclosed"}</p><p>{details.deadline ? `Deadline: ${dateLabel(details.deadline)}` : "Deadline not disclosed"}</p>{details.requiredDocuments && <p>Documents: {details.requiredDocuments}</p>}<p>{internshipApproval(job) ? "Internship approval evidence reviewed" : "Internship-site approval unconfirmed"} · {job.listingSource || job.source || "Source not recorded"}</p>{internshipApproval(job) && <a className={styles.link} href={details.approvalSource} target="_blank" rel="noopener noreferrer">Approval source ↗</a>}<br/><Link className={styles.link} href={`/matches?search=${encodeURIComponent(job.role)}`}>Review placement →</Link></article>; })}
          {!placements.length && <p className={styles.notice}>No saved placements yet. Review your location preferences and run a placement scan.</p>}
          <label className={styles.field}>Scan location<select value={location} disabled={scanning} onChange={event=>onLocationChange(event.target.value)}>{!locations.includes(location) && <option value={location}>{location}</option>}{locations.map(value=><option key={value} value={value}>{value}</option>)}</select><small>Used for your next scan. Minimum score: {minScore}%. Change your score in Settings.</small></label>
          <label className={styles.check}><input type="checkbox" checked={autoSend} disabled={scanning} onChange={onAutoSendChange}/>Email new placement matches</label>
          <div className={styles.footer}><Link className={styles.link} href="/matches">All placement matches →</Link><button className={styles.primary} disabled={scanning} onClick={onScan}>{scanning ? "Scanning…" : "Scan placements"}</button></div>
          <ScanSummary profile={initial}/>
        </>}
      </section>
      <div>
        <section className={styles.panel}><div className={styles.heading}><h2>Next actions</h2></div>
          {profile.nextAction && <div className={styles.listing}><h3>{profile.nextAction}</h3><p>{profile.nextActionDate ? dateLabel(profile.nextActionDate) : "Date not set"} · Your reminder</p></div>}
          {interviews.filter(job => job.applications?.[0]?.interviewDate).slice(0,3).map(job => <div className={styles.listing} key={job.id}><h3>Interview · {job.company}</h3><p>{dateLabel(job.applications![0].interviewDate!)} · {job.applications![0].interviewTime} WAT</p><p>{job.applications![0].interviewLoc}</p></div>)}
          {!training && deadlines.map(job=><div className={styles.listing} key={job.id}><h3>{job.company}</h3><p>Application deadline: {dateLabel(listingDetails(job.listingDetails).deadline)}</p></div>)}
          {!profile.nextAction && !interviews.length && !deadlines.length && <p className={styles.notice}>No upcoming actions recorded. Add a reminder or complete your placement profile.</p>}
          <Link className={styles.link} href="/settings#career-profile">Manage reminders and profile →</Link>
        </section>
        <section className={styles.panel}><div className={styles.heading}><h2>Placement pipeline</h2></div><div className={styles.pipeline}><span>Saved {placements.length}</span><span>Applied {failed ? "—" : pipeline.length}</span><span>Interview {failed ? "—" : interviews.length}</span><span>Offer {failed ? "—" : offers.length}</span><span>In training {training ? 1 : 0}</span></div>{failed && <p role="status" className={styles.notice}>Applications are temporarily unavailable. Your history is preserved.</p>}<Link className={styles.link} href="/applied">Manage applications →</Link><p className={styles.notice}>External application stages are tracked by you. Starting training is recorded separately in your profile.</p></section>
      </div>
    </div>
  </div>;
}
