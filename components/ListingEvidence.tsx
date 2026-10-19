import JobReport from "@/components/JobReport";
import type { ClientJob } from "@/lib/types";
import { internshipApproval, opportunityType, listingDetails } from "@/lib/candidate-profile";
export default function ListingEvidence({ job }: { job: ClientJob }) {
  let source = "External listing";
  try { if (!job.isDirectPost) source = new URL(job.url).hostname.replace(/^www\./, ""); } catch { /* Unknown source is displayed explicitly. */ }
  const seen = job.lastSeenAt ? new Date(job.lastSeenAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
  const details = listingDetails(job.listingDetails);
  return <details style={{ marginTop: 8, color: "#64748b", fontSize: 11, fontWeight: 400 }}>
    <summary style={{ cursor: "pointer" }}>{job.isDirectPost ? "Employer posted" : source}{job.employerVerified ? " · Employer reviewed" : ""}</summary>
    <p style={{ maxWidth: 320, lineHeight: 1.5 }}>{job.matchExplanation || "Check the vacancy requirements before applying."}{seen ? ` Last recorded ${seen}.` : ""} Confirm availability with the employer. Never pay to apply.</p>
    {opportunityType(job) === "internship" && <p style={{lineHeight:1.6}}>{internshipApproval(job) ? <>Internship approval evidence reviewed. <a href={details.approvalSource} target="_blank" rel="noopener noreferrer">MLSCN source ↗</a> · Reviewed {new Date(details.approvalReviewedAt).toLocaleDateString("en-GB")}</> : "Internship-site approval unconfirmed. Company review is a separate check."}</p>}
    {details.deadline && <p>Deadline: {details.deadline}</p>}{details.requiredDocuments && <p>Required documents: {details.requiredDocuments}</p>}
    <JobReport jobId={job.id} />
  </details>;
}
