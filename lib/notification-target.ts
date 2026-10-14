type Notification = { title: string; body: string };
type Job = { id: string; role: string; company: string; applied?: boolean };
export function notificationTarget(notification: Notification, jobs: Job[]): string {
  const invitation = notification.title === "Exclusive Recruitment Invitation";
  const route = invitation ? "/matches" : "/applied";
  const role = invitation ? notification.body.match(/invited you to apply for (.+?)\. Review the vacancy/)?.[1] : undefined;
  const matches = jobs.filter(job => (role ? job.role === role : notification.body.includes(job.role)));
  const companyMatches = matches.filter(job => notification.body.includes(job.company));
  const job = companyMatches.length === 1 ? companyMatches[0] : matches.length === 1 ? matches[0] : undefined;
  if (job) return `${job.applied ? "/applied" : route}?job=${encodeURIComponent(job.id)}`;
  // Old or removed vacancies still open a meaningful filtered destination.
  return role ? `${route}?search=${encodeURIComponent(role)}` : route;
}
