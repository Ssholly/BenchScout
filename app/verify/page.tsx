"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./verification.module.css";

type Result = { ok: boolean; status: number; data: { message?: string; error?: string } };

function VerificationLogo({ loading }: { loading: boolean }) {
  return <svg className={`${styles.logo} ${loading ? styles.loading : ""}`} viewBox="8 5 36 46" fill="none" aria-hidden="true">
    <circle cx="26" cy="22" r="13.5" stroke="#0B2444" strokeWidth="2.5" />
    <circle className={styles.sweep} cx="26" cy="22" r="13.5" stroke="#1A8C7A" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="23 62" />
    <circle cx="26" cy="22" r="3.5" fill="#1A8C7A" />
    <circle cx="21.5" cy="17.5" r="1.5" fill="#22B89F" />
    <path d="M26 35.5V43M17 43H35M18.5 43V47M33.5 43V47" stroke="#0B2444" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const role = params.get("role") || "candidate";
  const valid = !!token && !!email && ["candidate", "employer"].includes(role);
  const pending = useRef<{ key: string; request: Promise<Result> } | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(valid ? "loading" : "error");
  const [message, setMessage] = useState(valid ? "Confirming your email. This should only take a moment." : "This link is incomplete. Open the full link in your confirmation email, or request a new one.");
  const [retryable, setRetryable] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const key = `${role}:${email}:${token}:${attempt}`;
    if (pending.current?.key !== key) {
      pending.current = { key, request: fetch("/api/auth/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, token, role }),
      }).then(async response => ({ ok: response.ok, status: response.status, data: await response.json() })) };
    }
    void pending.current.request.then(result => {
      if (cancelled) return;
      setStatus(result.ok ? "success" : "error");
      setRetryable(result.status >= 500 || result.status === 429);
      setMessage(result.ok ? "Your email is confirmed. You can now sign in to BenchScout." : result.data.error || "We couldn’t confirm your email. Please try again.");
    }).catch(() => {
      if (cancelled) return;
      setStatus("error"); setRetryable(true);
      setMessage("We couldn’t connect. Check your connection and try again.");
    });
    return () => { cancelled = true; };
  }, [valid, token, email, role, attempt]);

  function signIn() {
    window.dispatchEvent(new CustomEvent("openProfileModal", { detail: { mode: "login", role, email: email || "" } }));
  }
  function resend() {
    window.dispatchEvent(new CustomEvent("openProfileModal", { detail: { mode: "verify-sent", role, email: email || "" } }));
  }

  return <section className={styles.card} aria-labelledby="verification-heading">
    <div className={styles.brand}><VerificationLogo loading={status === "loading"} /><span>Bench<span>Scout</span></span></div>
    <span className={styles.eyebrow}>EMAIL CONFIRMATION</span>
    <div role="status" aria-live="polite">
      <h1 id="verification-heading">{status === "loading" ? "Confirming your email" : status === "success" ? "Email confirmed" : "Let’s confirm your email"}</h1>
      <p className={styles.message}>{message}</p>
    </div>
    {status === "success" && role === "employer" && <p className={styles.note}>Company review is a separate step before publishing roles or viewing applicants.</p>}
    <div className={styles.actions}>
      {status === "success" && <button className={styles.primary} onClick={signIn}>Sign in to BenchScout <span aria-hidden="true">→</span></button>}
      {status === "error" && retryable && <button className={styles.primary} onClick={() => { setStatus("loading"); setMessage("Confirming your email. This should only take a moment."); setAttempt(value => value + 1); }}>Try again <span aria-hidden="true">→</span></button>}
      {status === "error" && !retryable && <button className={styles.primary} onClick={resend}>Request a new link <span aria-hidden="true">→</span></button>}
      {status !== "loading" && <Link className={styles.home} href="/home">Return to Home</Link>}
    </div>
  </section>;
}

export default function VerifyPage() {
  return <div className={styles.page}><Suspense fallback={<section className={styles.card}><VerificationLogo loading /><p className={styles.message}>Preparing your email confirmation…</p></section>}><VerifyContent /></Suspense></div>;
}
