export default function HubLoading() {
  return <div className="session-loading" role="status" aria-live="polite">
    <svg className="hub-loading-logo" viewBox="8 5 36 46" fill="none" aria-hidden="true">
      <circle cx="26" cy="22" r="13.5" stroke="#0B2444" strokeWidth="2.5" />
      <circle className="hub-loading-sweep" cx="26" cy="22" r="13.5" stroke="#1A8C7A" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="23 62" />
      <circle className="hub-loading-dot" cx="26" cy="22" r="3.5" fill="#1A8C7A" />
      <circle cx="21.5" cy="17.5" r="1.5" fill="#22B89F" />
      <path d="M26 35.5V43M17 43H35M18.5 43V47M33.5 43V47" stroke="#0B2444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    <strong>Bench<span>Scout</span></strong>
    <p>Loading your career hub<span className="hub-loading-ellipsis" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
  </div>;
}
