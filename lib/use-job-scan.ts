"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getScanSnapshot, idleScan, subscribeScan, syncScanIdentity } from "@/lib/client-job-scan";
export function useJobScan() {
  const scan = useSyncExternalStore(subscribeScan, getScanSnapshot, () => idleScan);
  useEffect(() => {
    syncScanIdentity();
    window.addEventListener("userStateChanged", syncScanIdentity);
    return () => window.removeEventListener("userStateChanged", syncScanIdentity);
  }, []);
  return scan;
}
