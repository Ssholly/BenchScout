import { lastScan } from "@/lib/candidate-profile";
import styles from "./CandidateCareer.module.css";
export default function ScanSummary({profile}:{profile:unknown}) {
  const scan=lastScan(profile);
  if (!scan) return null;
  return <section className={styles.notice} aria-label="Last scan result" role="status">
    <strong>Last scan · {scan.location}</strong>
    <p>{scan.retrieved} listings retrieved · {scan.matched} matched · {scan.added} new</p>
    {!scan.matched && <p>No listings met your stage, location and minimum score. Review your preferences and the source notices below.</p>}
    {scan.warnings.length>0 && <ul style={{margin:"6px 0 0",paddingLeft:18}}>{scan.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul>}
  </section>;
}
