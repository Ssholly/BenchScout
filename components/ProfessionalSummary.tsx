import type { ProfessionalSummary as Summary } from "@/lib/professional-summary";
import styles from "./ProfessionalSummary.module.css";

export default function ProfessionalSummary({ summary, preview = false }: { summary: Summary | null; preview?: boolean }) {
  return <section className={styles.summary} aria-label={preview ? "Professional summary preview" : "Shared professional summary"}>
    <h3>{preview ? "Employer preview" : "Professional summary"}</h3>
    {!summary ? <p>The candidate has not shared a professional summary. Use the provided application and CV.</p> : <>
      <p>{summary.stage} · Self-reported profile</p>
      <dl>{summary.fields.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
      <small>These details do not establish independently verified qualifications.</small>
    </>}
  </section>;
}
