"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useJobScan } from "@/lib/use-job-scan";
import { dismissScanNotice } from "@/lib/client-job-scan";
import Toast from "@/components/Toast";
export default function ScanStatus() {
  const scan = useJobScan();
  useEffect(() => { if (!scan.notice) return; const timer = setTimeout(dismissScanNotice, 6000); return () => clearTimeout(timer); }, [scan.notice]);
  return <>
    {scan.running && <div role="status" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 80, maxWidth: "calc(100vw - 40px)", padding: "10px 16px", borderRadius: 12, background: "#0B2444", color: "white", boxShadow: "0 4px 16px #0b244430", fontSize: 13 }}>Scan running · You can keep browsing. <Link href="/" style={{ color: "#8ce0cf", marginLeft: 8 }}>View progress →</Link></div>}
    {scan.notice && <Toast message={scan.notice} type={scan.error ? "error" : "success"}/>}
  </>;
}
