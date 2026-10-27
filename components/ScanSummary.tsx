import { lastScan } from "@/lib/candidate-profile";
import styles from "./CandidateCareer.module.css";
export default function ScanSummary({profile}:{profile:unknown}) {
  const scan=lastScan(profile);
  if (!scan) return null;
  return <section className={styles.notice} aria-label="Last scan result" role="status">
    <strong>Last scan · {scan.location}</strong>
    <p>{scan.retrieved} listings reviewed · {scan.matched} matched · {scan.added} new</p>
    <p>Matches meet your stage, location and score preferences. New listings exclude those already saved.</p>
    {!scan.matched && <p>No listings met your stage, location and minimum score. Review your preferences and the source notices below.</p>}

  </section>;
}
