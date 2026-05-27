"use client";
import { useEffect, useState } from "react";

export default function ComplianceHubPage() {
	const [metrics, setMetrics] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const email = localStorage.getItem("labpro_active_user");
		if (!email) return;
		fetch(`/api/user/compliance?email=${email}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.success) setMetrics(data);
				setLoading(false);
			});
	}, []);

	if (loading)
		return (
			<div style={{ padding: "2rem", color: "#64748b" }}>
				Querying compliance vectors...
			</div>
		);
	if (!metrics || metrics.status === "UNCONFIGURED") {
		return (
			<div style={{ padding: "3rem", textAlign: "center" }}>
				<h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
					No License Configured
				</h2>
				<p style={{ color: "#64748b", fontSize: "13px" }}>
					Please upload your practicing license in System Settings to trigger
					tracking.
				</p>
			</div>
		);
	}

	const alertColors = {
		VALID: {
			text: "#16a34a",
			bg: "rgba(22,163,74,0.05)",
			border: "rgba(22,163,74,0.1)",
		},
		WARNING: {
			text: "#ca8a04",
			bg: "rgba(202,138,4,0.05)",
			border: "rgba(202,138,4,0.1)",
		},
		EXPIRED: {
			text: "#dc2626",
			bg: "rgba(220,38,38,0.05)",
			border: "rgba(220,38,38,0.1)",
		},
	}[metrics.status as "VALID" | "WARNING" | "EXPIRED"];

	return (
		<div style={{ padding: "0 1.5rem", width: "100%" }}>
			<div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
				<h1
					style={{
						margin: 0,
						fontSize: "24px",
						fontWeight: 900,
						color: "#0f172a",
					}}
				>
					MLSCN Compliance Hub
				</h1>
				<p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
					Professional license, credential verification, and CPD progression
					tracking engine.
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "1.5rem",
					marginBottom: "2rem",
				}}
			>
				{/* Metric Card 1: Time Countdown */}
				<div
					style={{
						background: "white",
						padding: "1.5rem",
						borderRadius: "20px",
						border: "1px solid #e2e8f0",
						boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 800,
								color: "#64748b",
								letterSpacing: "0.5px",
							}}
						>
							REGISTRATION STATUS
						</span>
						<span
							style={{
								background: alertColors.bg,
								color: alertColors.text,
								border: `1px solid ${alertColors.border}`,
								fontSize: "10px",
								padding: "4px 8px",
								borderRadius: "20px",
								fontWeight: 700,
							}}
						>
							{metrics.status}
						</span>
					</div>
					<div
						style={{
							fontSize: "36px",
							fontWeight: 900,
							color: "#0f172a",
							marginBottom: "0.5rem",
						}}
					>
						{metrics.status === "EXPIRED" ? "0" : metrics.daysLeft}{" "}
						<span
							style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}
						>
							Days Remaining
						</span>
					</div>
					<p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
						License ID:{" "}
						<strong style={{ color: "#0f172a" }}>
							{metrics.licenseNumber}
						</strong>{" "}
						expires on {metrics.expiryFormatted}.
					</p>
				</div>

				{/* Metric Card 2: CPD Progress */}
				<div
					style={{
						background: "white",
						padding: "1.5rem",
						borderRadius: "20px",
						border: "1px solid #e2e8f0",
						boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01)",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 800,
								color: "#64748b",
								letterSpacing: "0.5px",
							}}
						>
							CPD ANNUAL LOG
						</span>
						<span
							style={{ color: "#0058bc", fontSize: "11px", fontWeight: 700 }}
						>
							{metrics.cpdPoints} / 30 Credits
						</span>
					</div>
					<div
						style={{
							width: "100%",
							height: "12px",
							background: "#f1f5f9",
							borderRadius: "6px",
							overflow: "hidden",
							marginBottom: "1rem",
						}}
					>
						<div
							style={{
								width: `${metrics.cpdPercent}%`,
								height: "100%",
								background: "#0058bc",
								borderRadius: "6px",
								transition: "0.4s ease",
							}}
						/>
					</div>
					<p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
						You have achieved{" "}
						<strong style={{ color: "#0f172a" }}>{metrics.cpdPercent}%</strong>{" "}
						of your required annual Continuous Professional Development points.
					</p>
				</div>
			</div>
		</div>
	);
}
