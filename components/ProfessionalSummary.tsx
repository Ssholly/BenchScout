import type { ProfessionalSummary as Summary } from "@/lib/professional-summary";
import styles from "./ProfessionalSummary.module.css";

export default function ProfessionalSummary({ summary, preview = false }: { summary: Summary | null; preview?: boolean }) {
  const content = !summary ? <p>The candidate has not shared a professional summary. Use the provided application and CV.</p> : <>
    <p>{summary.stage} · Self-reported profile</p>
    <dl>{summary.fields.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl>
    <small>These details do not establish independently verified qualifications.</small>
  </>;
  return <section className={styles.summary} aria-label={preview ? "Professional summary preview" : "Shared professional summary"}>
    {preview ? <details>
      <summary className={styles.previewToggle}>Employer preview</summary>
      <div className={styles.previewContent}>{content}
        <p>Only the details shown above are included in this optional summary. Registration numbers, salary preferences, current training details and personal reminders stay out of it. Document sharing follows the separate application rules.</p>
      </div>
    </details> : <><h3>Professional summary</h3>{content}</>}
  </section>;
}
