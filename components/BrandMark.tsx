// The existing laboratory mark, inline so its navy structure can follow appearance.
export default function BrandMark({ width = 30, height = 40 }: { width?: number; height?: number }) {
  return <svg width={width} height={height} viewBox="10 5 34 47" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <g stroke="var(--on-bg)" strokeWidth="4.5" strokeLinecap="round">
      <circle cx="26" cy="22" r="12" />
      <path d="M26 34v9M16 43h20" />
      <path d="M18.5 43v4m15-4v4" strokeWidth="3.5" />
    </g>
    <path d="M34.5 13.5A12 12 0 0 1 38 22" stroke="var(--appearance-ink-1a8c7a)" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="26" cy="22" r="4.5" fill="#22b89f" />
    <circle cx="21.5" cy="17.5" r="1.5" fill="#1a8c7a" opacity=".5" />
  </svg>;
}
