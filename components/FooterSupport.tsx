"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { usePathname } from "next/navigation";

export function FooterSupportButton() {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return <section className="footer-help">
    <div className="footer-actions">
    <button type="button" className="footer-support" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(value => !value)}>Help &amp; guidance <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>
    <span className="footer-action-divider" aria-hidden="true" />
    <a className="footer-contact" href="mailto:success.sholly5@gmail.com?subject=BenchScout%20Support%20Request">Contact support</a>
    </div>
    {open && <div className="footer-help-content" id={contentId}>
      <details><summary>How do job matches work?</summary><p>Your role keywords, location and career phase help identify relevant opportunities. Employer-posted roles may not have a personalised score. Always read the vacancy requirements before applying.</p><Link href="/settings">Review your search preferences</Link></details>
      <details><summary>How do I apply for a job?</summary><p>For a direct application, select the documents to share and submit through BenchScout. For an external listing, follow its original link and complete the employer’s application process. Marking a job as applied does not send an application to an external website.</p><Link href="/applied">View your application history</Link></details>
      <details><summary>Who can see my documents?</summary><p>Vault uploads are private. For a direct application, only the files you select are shared with that employer. Professional-summary sharing is a separate, optional setting. Uploading a credential does not establish independent verification.</p><Link href="/settings">Manage your profile and documents</Link></details>
    </div>}
  </section>;
}

export default function MobileSupportFooter() {
  const pathname = usePathname();
  if (pathname === "/home") return null;
  return <footer className="mobile-support-footer"><small>© {new Date().getFullYear()} BenchScout. All rights reserved.</small><FooterSupportButton /></footer>;
}
