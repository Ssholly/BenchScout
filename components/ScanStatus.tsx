"use client";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useJobScan } from "@/lib/use-job-scan";
import { dismissScanNotice } from "@/lib/client-job-scan";
import Toast from "@/components/Toast";
export default function ScanStatus() {
  const scan = useJobScan();
  const [runningNotice, setRunningNotice] = useState(false);
  useEffect(() => {
    startTransition(() => setRunningNotice(scan.running));
    if (!scan.running) return;
    const timer = setTimeout(() => setRunningNotice(false), 4500);
    return () => clearTimeout(timer);
  }, [scan.running]);
  useEffect(() => { if (!scan.notice) return; const timer = setTimeout(dismissScanNotice, 6000); return () => clearTimeout(timer); }, [scan.notice]);
  return <>
    {scan.running && runningNotice && <div className="scan-running-toast" role="status"><span>Scan running · Keep browsing.</span><Link href="/#run-scan">View progress →</Link><button aria-label="Dismiss scan notice" onClick={() => setRunningNotice(false)}>×</button></div>}
    {scan.notice && <Toast message={scan.notice} type={scan.error ? "error" : "success"}/>}
  </>;
}
