import type { ScanReport } from "@/lib/candidate-profile";
export type ScanOptions = { targetLocation: string; includeTier3: boolean; autoSend: boolean; minScore?: number; keywords?: string; strict_mls?: boolean };
type Log = { time: string; level: string; msg: string };
type ScanResult = { success: true; message: string; report?: ScanReport };
export type ScanState = { running: boolean; progress: number; logs: Log[]; result: ScanResult | null; error: string | null; notice: string | null };
export const idleScan: ScanState = { running: false, progress: 0, logs: [{ time: "--:--:--", level: "IDLE", msg: "Ready for your next scan." }], result: null, error: null, notice: null };
let state = idleScan;
let owner = "";
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();
const identity = () => typeof window === "undefined" ? "" : `${localStorage.getItem("benchscout_identity") || ""}:${localStorage.getItem("labpro_active_user") || ""}`;
export const getScanSnapshot = () => owner === identity() ? state : idleScan;
export const subscribeScan = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
function update(next: Partial<ScanState>) { state = { ...state, ...next }; listeners.forEach(listener => listener()); }
export function syncScanIdentity() { if (owner !== identity()) { owner = identity(); pending = null; state = idleScan; listeners.forEach(listener => listener()); } }
export function dismissScanNotice() { update({ notice: null }); }
const log = (level: string, msg: string): Log => ({ time: new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos" }), level, msg });
// The request and progress live outside page components, so route changes cannot discard them.
export function startJobScan(options: ScanOptions): Promise<void> {
  syncScanIdentity();
  if (pending) return pending;
  if (!localStorage.getItem("labpro_active_user")) return Promise.reject(new Error("Please sign in to scan."));
  const scanOwner = owner;
  update({ running: true, progress: 15, logs: [log("INIT", `Searching ${options.targetLocation}. You can continue browsing while the scan runs.`)], result: null, error: null, notice: null });
  const current = () => owner === scanOwner && identity() === scanOwner && pending === operation;
  const interval = setInterval(() => { if (current()) update({ progress: Math.min(90, state.progress + 5) }); }, 1000);
  const operation = Promise.resolve().then(async () => {
    try {
      const response = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(options) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Scan failed. Please retry.");
      if (!current()) return;
      update({ progress: 100, result, notice: result.message, logs: [...state.logs, log("DONE", result.message)] });
      localStorage.setItem("labpro_last_run", new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" }));
      window.dispatchEvent(new Event("jobsUpdated"));
      window.dispatchEvent(new Event("userStateChanged"));
    } catch (error) {
      if (!current()) return;
      const message = error instanceof Error ? error.message : "Scan failed. Please retry.";
      update({ progress: 0, error: message, notice: message, logs: [...state.logs, log("ERROR", message)] });
    } finally {
      clearInterval(interval);
      if (current()) { pending = null; update({ running: false }); }
    }
  });
  pending = operation;
  return operation;
}
