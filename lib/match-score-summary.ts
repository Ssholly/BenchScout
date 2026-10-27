type ScoredListing = { score: number; isDirectPost?: boolean };
// Employer posts have no personalised score and must not dilute scored listings.
export function matchScoreSummary(jobs: ScoredListing[]) {
  const scored = jobs.filter(job => !job.isDirectPost && Number.isFinite(job.score) && job.score >= 0 && job.score <= 100);
  const average = scored.length ? Math.round(scored.reduce((sum, job) => sum + job.score, 0) / scored.length) : null;
  const grade = average === null ? "N/A" : average >= 85 ? "A" : average >= 75 ? "A-" : average >= 65 ? "B+" : "B";
  const explanation = scored.length
    ? `Average relevance across ${scored.length} scored ${scored.length === 1 ? "listing" : "listings"}. Check each vacancy’s requirements before applying.`
    : jobs.length ? "Employer posts do not have a personalised match score. Check each vacancy’s requirements before applying." : "Personalised scores appear when scored listings are available.";
  return { average, grade, explanation };
}
