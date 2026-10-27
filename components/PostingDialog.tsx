"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { listingUrl } from "@/lib/listing-url";

type Posting = { role: string; company: string; loc: string; salary: string; desc: string; url: string; isDirectPost: boolean };
export default function PostingDialog({ posting, onClose }: { posting: Posting; onClose: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const source = posting.isDirectPost ? null : listingUrl(posting.url);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') || []);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onClose]);
  return createPortal(<div className="posting-backdrop" onClick={onClose}>
    <div ref={dialog} className="application-dialog posting-dialog" role="dialog" aria-modal="true" aria-labelledby="posting-title" tabIndex={-1} onClick={event => event.stopPropagation()}>
      <header className="application-dialog-header">
        <div><p className="posting-eyebrow">{posting.isDirectPost ? "Employer posting" : "Saved listing"}</p><h2 id="posting-title">{posting.role}</h2><p>{posting.company}</p></div>
        <button aria-label="Close job posting" onClick={onClose}>×</button>
      </header>
      <div className="application-dialog-body" tabIndex={0} aria-label="Job posting details">
        <div className="posting-meta"><div><span>Location</span><p>{posting.loc || "Not specified"}</p></div><div><span>Salary</span><p>{posting.salary || "Not disclosed"}</p></div></div>
        <h3>Job description</h3><p className="posting-description">{posting.desc || "A description was not saved with this listing."}</p>
        {!posting.isDirectPost && !source && <p className="posting-note">No job-board link is available for this saved posting. Contact links cannot be used to view a vacancy.</p>}
      </div>
      <footer className="application-dialog-footer"><button onClick={onClose}>Back to pipeline</button>{source && <a href={source} target="_blank" rel="noopener noreferrer">Open source listing ↗</a>}</footer>
    </div>
  </div>, document.body);
}
