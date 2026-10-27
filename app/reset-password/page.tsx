"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "../verify/verification.module.css";

function ResetPasswordContent() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const token = params.get("token") || "";
  const role = params.get("role") || "candidate";
  const valid = !!email && /^[a-f0-9]{64}$/.test(token) && ["candidate", "employer"].includes(role);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    if (password !== confirmation) { setStatus("error"); setMessage("Passwords do not match."); return; }
    if (password.length < 12) { setStatus("error"); setMessage("Use at least 12 characters for your password."); return; }
    setStatus("loading"); setMessage("");
    try {
      const response = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, token, role, newPassword: password }) });
      const data = await response.json();
      setStatus(response.ok ? "success" : "error");
      setMessage(response.ok ? "Your password is updated. Sign in again with your new password." : data.error || "We couldn’t reset your password. Please try again.");
      if (response.ok) { setPassword(""); setConfirmation(""); }
    } catch { setStatus("error"); setMessage("We couldn’t connect. Check your connection and try again."); }
  }
  function openAccount(mode: "login" | "forgot") {
    window.dispatchEvent(new CustomEvent("openProfileModal", { detail: { mode, role, email } }));
  }

  return <section className={styles.card} aria-labelledby="reset-heading">
    <div className={styles.brand}><Image className={styles.logo} src="/icon.svg" width={30} height={40} unoptimized alt="" /><span>Bench<span>Scout</span></span></div>
    <span className={styles.eyebrow}>PASSWORD RESET</span>
    <h1 id="reset-heading">{status === "success" ? "Password updated" : valid ? "Choose a new password" : "Let’s get you a new link"}</h1>
    <p className={styles.message}>{status === "success" ? message : valid ? "A fresh password for your BenchScout account." : "This reset link is incomplete. Request a new email to continue."}</p>
    {valid && status !== "success" && <form className={styles.form} onSubmit={submit}>
      <label htmlFor="new-password">New password</label>
      <div className={styles.passwordField}>
        <input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required disabled={status === "loading"} minLength={12} aria-describedby="password-hint" />
        <button type="button" onClick={() => setShow(value => !value)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
      </div>
      <p id="password-hint" className={styles.hint}>At least 12 characters. A longer phrase works well.</p>
      <label htmlFor="confirm-password">Confirm password</label>
      <input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required disabled={status === "loading"} minLength={12} />
      {status === "error" && <p className={styles.error} role="alert">{message}</p>}
      <button className={styles.primary} type="submit" disabled={status === "loading" || !password || !confirmation}>{status === "loading" ? "Updating your password…" : "Reset password"}<span aria-hidden="true">→</span></button>
    </form>}
    <div className={styles.actions}>
      {status === "success" && <button className={styles.primary} onClick={() => openAccount("login")}>Sign in to BenchScout <span aria-hidden="true">→</span></button>}
      {!valid && <button className={styles.primary} onClick={() => openAccount("forgot")}>Request a new link <span aria-hidden="true">→</span></button>}
      <Link className={styles.home} href="/home">Return to Home</Link>
    </div>
  </section>;
}

export default function ResetPasswordPage() {
  return <div className={styles.page}><Suspense fallback={<section className={styles.card}><p className={styles.message}>Preparing your password reset…</p></section>}><ResetPasswordContent /></Suspense></div>;
}
