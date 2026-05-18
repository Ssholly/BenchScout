"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// We wrap the main content in a component so we can use useSearchParams safely inside Suspense
function VerifyContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("Verifying your secure token...");

	useEffect(() => {
		const token = searchParams.get("token");
		const email = searchParams.get("email");

		if (!token || !email) {
			setStatus("error");
			setMessage(
				"Invalid verification link. Missing token or email parameter.",
			);
			return;
		}

		const verifyEmail = async () => {
			try {
				const res = await fetch("/api/auth/verify", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, token }),
				});

				const data = await res.json();

				if (res.ok) {
					setStatus("success");
					setMessage(data.message || "Email verified successfully!");

					// Optional: Auto-redirect to dashboard/login after 3 seconds
					setTimeout(() => {
						router.push("/");
					}, 3500);
				} else {
					setStatus("error");
					setMessage(data.error || "Verification failed.");
				}
			} catch (err) {
				setStatus("error");
				setMessage("An unexpected network error occurred. Please try again.");
			}
		};

		verifyEmail();
	}, [searchParams, router]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
			}}
		>
			{/* Dynamic Icon based on status */}
			<div
				style={{
					width: "80px",
					height: "80px",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginBottom: "24px",
					background:
						status === "loading"
							? "#eff4ff"
							: status === "success"
								? "#dcfce7"
								: "#fef2f2",
					color:
						status === "loading"
							? "#0058bc"
							: status === "success"
								? "#15803d"
								: "#dc2626",
				}}
			>
				{status === "loading" && (
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ animation: "spin 1.5s linear infinite" }}
					>
						<line x1="12" y1="2" x2="12" y2="6"></line>
						<line x1="12" y1="18" x2="12" y2="22"></line>
						<line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
						<line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
						<line x1="2" y1="12" x2="6" y2="12"></line>
						<line x1="18" y1="12" x2="22" y2="12"></line>
						<line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
						<line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
					</svg>
				)}
				{status === "success" && (
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				)}
				{status === "error" && (
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="15" y1="9" x2="9" y2="15"></line>
						<line x1="9" y1="9" x2="15" y2="15"></line>
					</svg>
				)}
			</div>

			{/* Dynamic Text */}
			<h2
				style={{
					fontSize: "24px",
					fontWeight: 800,
					color: "#0b1c30",
					marginBottom: "12px",
					fontFamily: "'Manrope', sans-serif",
				}}
			>
				{status === "loading"
					? "Verifying Account..."
					: status === "success"
						? "Verification Complete!"
						: "Verification Failed"}
			</h2>
			<p
				style={{
					fontSize: "15px",
					color: "#414755",
					lineHeight: "1.6",
					marginBottom: "32px",
					maxWidth: "400px",
				}}
			>
				{message}
			</p>

			{/* Action Buttons */}
			{status === "success" && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						width: "100%",
						maxWidth: "300px",
					}}
				>
					<Link
						href="/"
						style={{
							background: "#0058bc",
							color: "white",
							padding: "14px",
							borderRadius: "12px",
							fontSize: "15px",
							fontWeight: 700,
							textDecoration: "none",
							boxShadow: "0 4px 14px rgba(0,88,188,0.2)",
							transition: "transform 0.15s",
						}}
					>
						Proceed to Dashboard
					</Link>
					<p style={{ fontSize: "12px", color: "#717786", marginTop: "8px" }}>
						Redirecting automatically...
					</p>
				</div>
			)}

			{status === "error" && (
				<Link
					href="/"
					style={{
						background: "#f8f9ff",
						color: "#0b1c30",
						border: "1px solid #e8ecf5",
						padding: "14px 24px",
						borderRadius: "12px",
						fontSize: "15px",
						fontWeight: 700,
						textDecoration: "none",
						transition: "background 0.2s",
					}}
				>
					Return Home
				</Link>
			)}
		</div>
	);
}

export default function VerifyPage() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#f8f9ff",
				padding: "2rem",
			}}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `,
				}}
			/>

			<div
				style={{
					background: "#ffffff",
					padding: "3rem 2.5rem",
					borderRadius: "24px",
					boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
					border: "1px solid #e8ecf5",
					width: "100%",
					maxWidth: "500px",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative Top Gradient */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: "6px",
						background: "linear-gradient(90deg, #0058bc, #0ea5e9)",
					}}
				></div>

				<Suspense
					fallback={
						<div style={{ textAlign: "center", color: "#717786" }}>
							Loading verification module...
						</div>
					}
				>
					<VerifyContent />
				</Suspense>
			</div>
		</div>
	);
}
