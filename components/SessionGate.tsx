"use client";
import { startTransition, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import HubLoading from "@/components/HubLoading";
import { needsHomeLanding } from "@/lib/home-landing";
export default function SessionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [landingChecked, setLandingChecked] = useState(false);
  const [role, setRole] = useState<"candidate" | "employer" | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    let restorationCompleted = false;
    let checkingSession = false;
    async function restore() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok && response.status !== 401) throw new Error("Session unavailable");
        const data = response.ok ? await response.json() : null;
        if (cancelled) return;
        const identity = data?.session ? `${data.session.role}:${data.session.id}` : "";
        if (localStorage.getItem("benchscout_identity") !== identity) {
          Object.keys(localStorage).filter(key => key.startsWith("labpro_") || key.startsWith("benchscout_invited_")).forEach(key => localStorage.removeItem(key));
        }
        localStorage.removeItem("labpro_active_user");
        localStorage.removeItem("benchscout_active_employer");
        localStorage.setItem("benchscout_identity", identity);
        if (data?.session?.role === "candidate") {
          localStorage.setItem("labpro_active_user", data.session.email);
          localStorage.setItem("labpro_career_phase", data.session.careerPhase === "internship" ? "internship" : "licensed");
        }
        if (data?.session?.role === "employer") localStorage.setItem("benchscout_active_employer", JSON.stringify({ ...data.session, companyName: data.session.name, isVerified: data.session.verified }));
        setRole(data?.session?.role || null);
        setState("ready");
        restorationCompleted = true;
      } catch { if (!cancelled) setState("error"); }
    }
    void restore();
    // Another tab's login/logout must discard this tab's previous account UI.
    const accountChanged = (event: StorageEvent) => {
      if (event.key === "benchscout_identity" && event.oldValue !== event.newValue) window.location.replace("/home");
    };
    window.addEventListener("storage", accountChanged);
    const checkOnFocus = async () => {
      if (!restorationCompleted || checkingSession) return;
      checkingSession = true;
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (cancelled) return;
        const previousIdentity = localStorage.getItem("benchscout_identity") || "";
        if (response.status === 401 && previousIdentity) {
          window.location.replace("/home"); return;
        }
        if (response.ok) {
          const data = await response.json();
          const currentIdentity = data.session ? `${data.session.role}:${data.session.id}` : "";
          if (!cancelled && currentIdentity !== previousIdentity) window.location.replace("/home");
        }
      } catch { /* A network outage must not be treated as a confirmed logout. */ }
      finally { checkingSession = false; }
    };
    window.addEventListener("focus", checkOnFocus);
    return () => { cancelled = true; window.removeEventListener("storage", accountChanged); window.removeEventListener("focus", checkOnFocus); };
  }, []);
  useEffect(() => {
    if (state !== "ready") return;
    if (role === "candidate" && (pathname === "/employer" || pathname.startsWith("/employer/"))) {
      router.replace("/home");
      return;
    }
    const key = `benchscout_home_seen:${localStorage.getItem("benchscout_identity") || "visitor"}`;
    if (pathname === "/home") localStorage.setItem(key, "true");
    if (landingChecked) return;
    if (needsHomeLanding(pathname, localStorage.getItem(key) === "true")) {
      router.replace("/home");
      return;
    }
    startTransition(() => setLandingChecked(true));
  }, [state, landingChecked, pathname, router, role]);
  if (state === "ready" && role === "candidate" && (pathname === "/employer" || pathname.startsWith("/employer/"))) return <HubLoading />;
  if (state === "loading" || (state === "ready" && !landingChecked)) return <HubLoading />;
  if (state === "error") return <div role="alert" style={{ padding: "2rem" }}><p>We could not restore your session.</p><button onClick={() => window.location.reload()}>Try again</button></div>;
  return children;
}
