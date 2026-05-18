"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [token, setToken] = useState("");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const urlToken = searchParams.get("token");
		const urlEmail = searchParams.get("email");

		if (urlToken && urlEmail) {
			setToken(urlToken);
			setEmail(urlEmail);
		} else {
			setStatus("error");
			setMessage("Invalid reset link. Missing security token or email.");
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setStatus("error");
			setMessage("Passwords do not match.");
			return;
		}

		if (password.length < 8) {
			setStatus("error");
			setMessage("Password must be at least 8 characters long.");
			return;
		}

		setStatus("loading");
		setMessage("Securing your new password...");

		try {
			const res = await fetch("/api/auth/reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, token, newPassword: password }),
			});

			const data = await res.json();

			if (res.ok) {
				setStatus("success");
				setMessage(data.message || "Password updated successfully!");

				// Auto-redirect to home so they can log in
				setTimeout(() => {
					window.location.href = "/";
				}, 3000);
			} else {
				setStatus("error");
				setMessage(data.error || "Reset failed.");
			}
		} catch (err) {
			setStatus("error");
			setMessage("An unexpected network error occurred. Please try again.");
		}
	};

	const inputStyle = {
		width: "100%",
		background: "#f8fafc",
		border: "1px solid #e2e8f0",
		borderRadius: "10px",
		padding: "14px",
		fontSize: "14px",
		outline: "none",
		color: "#0f172a",
		fontWeight: 600,
		marginBottom: "16px",
		transition: "0.2s",
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
			}}
		>
			{/* Icon Area */}
			<div
				style={{
					width: "64px",
					height: "64px",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginBottom: "24px",
					background:
						status === "success"
							? "#dcfce7"
							: status === "error"
								? "#fef2f2"
								: "#f0f9ff",
					color:
						status === "success"
							? "#15803d"
							: status === "error"
								? "#dc2626"
								: "#0058bc",
					boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
				}}
			>
				{status === "success" ? (
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				) : status === "error" && !token ? (
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="8" x2="12" y2="12"></line>
						<line x1="12" y1="16" x2="12.01" y2="16"></line>
					</svg>
				) : (
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					>
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
					</svg>
				)}
			</div>

			<h2
				style={{
					fontSize: "24px",
					fontWeight: 900,
					color: "#0f172a",
					marginBottom: "8px",
					letterSpacing: "-0.5px",
				}}
			>
				{status === "success"
					? "Password Secured!"
					: !token
						? "Invalid Link"
						: "Create New Password"}
			</h2>
			<p
				style={{
					fontSize: "14px",
					color: status === "error" ? "#dc2626" : "#64748b",
					lineHeight: "1.5",
					marginBottom: "32px",
					maxWidth: "340px",
					fontWeight: status === "error" ? 600 : 400,
				}}
			>
				{message ||
					`Please enter a new, strong password for your account associated with ${email || "your email"}.`}
			</p>

			{status === "success" ? (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						width: "100%",
						maxWidth: "300px",
					}}
				>
					<p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
						Redirecting to Login...
					</p>
				</div>
			) : !token ? (
				<Link
					href="/"
					style={{
						background: "#f8f9ff",
						color: "#0f172a",
						border: "1px solid #e8ecf5",
						padding: "14px 24px",
						borderRadius: "10px",
						fontSize: "14px",
						fontWeight: 700,
						textDecoration: "none",
						transition: "0.2s",
					}}
				>
					Return to Home
				</Link>
			) : (
				<form
					onSubmit={handleSubmit}
					style={{ width: "100%", maxWidth: "320px", textAlign: "left" }}
				>
					<div style={{ position: "relative" }}>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="New Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={status === "loading"}
							style={{ ...inputStyle, paddingRight: "50px" }}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							style={{
								position: "absolute",
								right: "14px",
								top: "24px",
								transform: "translateY(-50%)",
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "#94a3b8",
								fontSize: "12px",
								fontWeight: 700,
							}}
						>
							{showPassword ? "HIDE" : "SHOW"}
						</button>
					</div>

					<input
						type="password"
						placeholder="Confirm New Password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						disabled={status === "loading"}
						style={inputStyle}
					/>

					<button
						type="submit"
						disabled={status === "loading" || !password || !confirmPassword}
						style={{
							width: "100%",
							background: status === "loading" ? "#94a3b8" : "#0058bc",
							color: "white",
							border: "none",
							padding: "16px",
							borderRadius: "10px",
							fontSize: "15px",
							fontWeight: 800,
							cursor: status === "loading" ? "wait" : "pointer",
							marginTop: "8px",
							boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
							transition: "0.2s",
						}}
					>
						{status === "loading" ? "Securing..." : "Reset Password"}
					</button>
				</form>
			)}
		</div>
	);
}

export default function ResetPasswordPage() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
				padding: "2rem",
			}}
		>
			{/* Decorative Background Elements */}
			<div
				style={{
					position: "absolute",
					top: "10%",
					right: "15%",
					width: "400px",
					height: "400px",
					background: "rgba(0, 88, 188, 0.03)",
					borderRadius: "50%",
					filter: "blur(60px)",
					zIndex: 0,
				}}
			></div>
			<div
				style={{
					position: "absolute",
					bottom: "10%",
					left: "15%",
					width: "300px",
					height: "300px",
					background: "rgba(14, 165, 233, 0.03)",
					borderRadius: "50%",
					filter: "blur(60px)",
					zIndex: 0,
				}}
			></div>

			<div
				style={{
					background: "rgba(255, 255, 255, 0.95)",
					backdropFilter: "blur(20px)",
					padding: "3rem 2.5rem",
					borderRadius: "24px",
					boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
					border: "1px solid rgba(255, 255, 255, 0.8)",
					width: "100%",
					maxWidth: "460px",
					position: "relative",
					zIndex: 1,
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
							Loading security module...
						</div>
					}
				>
					<ResetPasswordContent />
				</Suspense>
			</div>
		</div>
	);
}
