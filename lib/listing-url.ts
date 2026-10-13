// Shared by the browser and email renderer. A contact destination is not a job posting.
export function listingUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    const mailHosts = ['mail.google.com', 'gmail.com', 'outlook.live.com', 'outlook.office.com', 'outlook.office365.com', 'mail.yahoo.com'];
    if (mailHosts.some(mailHost => host === mailHost || host.endsWith(`.${mailHost}`))) return null;
    return url.href;
  } catch { return null; }
}
