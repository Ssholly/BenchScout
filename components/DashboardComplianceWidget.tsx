"use client";
import { useEffect, useState } from "react";

export default function DashboardComplianceWidget() {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const email = localStorage.getItem("labpro_active_user");
		if (!email) {
			setLoading(false);
			return;
		}

		fetch(`/api/user/compliance?email=${email}`)
			.then((res) => res.json())
			.then((resData) => {
				if (resData.success) setData(resData);
				setLoading(false);
			})
			.catch((err) => console.error("Error loading widget statistics:", err));
	}, []);

	if (loading || !data || data.status === "UNCONFIGURED") return null;

	// 🚀 DYNAMIC URGENCY COLORS: Green (>60 days), Amber (<=60 days), Red (<=30 days)
	const getUrgencyTheme = (days: number) => {
		if (days <= 30) {
			return {
				text: "#dc2626",
				bg: "rgba(220, 38, 38, 0.05)",
				border: "rgba(220, 38, 38, 0.15)",
				progressBg: "linear-gradient(90deg, #ef4444, #dc2626)",
				message:
					"CRITICAL ACTION REQUIRED: License renewal timeline overdue or critically low.",
			};
		}
		if (days <= 60) {
			return {
				text: "#d97706",
				bg: "rgba(217, 119, 6, 0.05)",
				border: "rgba(217, 119, 6, 0.15)",
				progressBg: "linear-gradient(90deg, #f59e0b, #d97706)",
				message:
					"URGENT NOTICE: Approaching renewal deadline. Check CPD requirements.",
			};
		}
		return {
			text: "#16a34a",
			bg: "rgba(22, 163, 74, 0.03)",
			border: "rgba(22, 163, 74, 0.1)",
			progressBg: "linear-gradient(90deg, #4ade80, #16a34a)",
			message:
				"Your practicing credentials are secure and fully compliant with MLSCN regulations.",
		};
	};

	const theme = getUrgencyTheme(data.daysLeft);

	// Calculate relative percentage of the calendar year remaining (capped between 0% and 100%)
	const totalYearDays = 365;
	const standardPercentage = Math.min(
		Math.max((data.daysLeft / totalYearDays) * 100, 0),
		100,
	);

	return (
		<div
			style={{
				background: theme.bg,
				border: `1px solid ${theme.border}`,
				borderRadius: "24px",
				padding: "1.5rem",
				marginBottom: "2rem",
				display: "flex",
				flexDirection: "column",
				gap: "1.25rem",
				boxShadow: "0 10px 30px rgba(0,0,0,0.01)",
			}}
		>
			{/* Upper Tracker Panel */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					flexWrap: "wrap",
					gap: "1rem",
				}}
			>
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<h3
							style={{
								margin: 0,
								fontSize: "16px",
								fontWeight: 800,
								color: "#0f172a",
							}}
						>
							MLSCN License Status ({data.licenseNumber})
						</h3>
						<span
							style={{
								fontSize: "10px",
								fontWeight: 800,
								color: theme.text,
								background: theme.bg,
								padding: "2px 8px",
								borderRadius: "10px",
								border: `1px solid ${theme.border}`,
							}}
						>
							{data.daysLeft <= 0 ? "EXPIRED" : "VERIFIED"}
						</span>
					</div>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: "13px",
							color: "#64748b",
							lineHeight: "1.4",
						}}
					>
						{theme.message}
					</p>
				</div>

				{/* Days Left Countdown Display */}
				<div style={{ textAlign: "right" }}>
					<div
						style={{
							fontSize: "28px",
							fontWeight: 900,
							color: theme.text,
							lineHeight: "1",
						}}
					>
						{data.daysLeft <= 0 ? "0" : data.daysLeft}
					</div>
					<span
						style={{
							fontSize: "11px",
							fontWeight: 700,
							color: "#94a3b8",
							letterSpacing: "0.5px",
						}}
					>
						DAYS REMAINING
					</span>
				</div>
			</div>

			{/* Progress Bars Stack */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "1.5rem",
					alignItems: "center",
				}}
			>
				{/* Timeline Gauge */}
				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "11px",
							fontWeight: 700,
							color: "#64748b",
							marginBottom: "6px",
						}}
					>
						<span>RENEWAL TIMELINE</span>
						<span>Expires {data.expiryFormatted}</span>
					</div>
					<div
						style={{
							width: "100%",
							height: "8px",
							background: "rgba(0,0,0,0.05)",
							borderRadius: "4px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${standardPercentage}%`,
								height: "100%",
								background: theme.progressBg,
								borderRadius: "4px",
								transition: "width 0.5s ease",
							}}
						/>
					</div>
				</div>

				{/* CPD Units Tracking Matrix */}
				<div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							fontSize: "11px",
							fontWeight: 700,
							color: "#64748b",
							marginBottom: "6px",
						}}
					>
						<span>CPD ANNUAL LOG</span>
						<span style={{ color: "#0058bc" }}>
							{data.cpdPoints} / 30 Units Earned
						</span>
					</div>
					<div
						style={{
							width: "100%",
							height: "8px",
							background: "rgba(0,0,0,0.05)",
							borderRadius: "4px",
							overflow: "hidden",
						}}
					>
						<div
							style={{
								width: `${data.cpdPercent}%`,
								height: "100%",
								background: "linear-gradient(90deg, #0058bc, #0ea5e9)",
								borderRadius: "4px",
								transition: "width 0.5s ease",
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
