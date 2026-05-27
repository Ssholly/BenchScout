"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ProfileComplianceOverlay({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const email = localStorage.getItem("labpro_active_user");
		if (!email) return;

		setLoading(true);
		fetch(`/api/user/compliance?email=${email}`)
			.then((res) => res.json())
			.then((resData) => {
				if (resData.success) setData(resData);
				setLoading(false);
			});
	}, [isOpen]);

	if (!mounted || !isOpen) return null;

	const getUrgencyTheme = (days: number) => {
		if (days <= 30) {
			return {
				text: "#dc2626",
				bg: "rgba(220, 38, 38, 0.05)",
				border: "rgba(220, 38, 38, 0.15)",
				progressBg: "linear-gradient(90deg, #ef4444, #dc2626)",
				badge: "CRITICAL",
				message: "Action required: License renewal timeline is critically low.",
			};
		}
		if (days <= 60) {
			return {
				text: "#d97706",
				bg: "rgba(217, 119, 6, 0.05)",
				border: "rgba(217, 119, 6, 0.15)",
				progressBg: "linear-gradient(90deg, #f59e0b, #d97706)",
				badge: "AMBER ALERT",
				message: "Approaching renewal deadline. Verify CPD progress.",
			};
		}
		return {
			text: "#16a34a",
			bg: "rgba(22, 163, 74, 0.04)",
			border: "rgba(22, 163, 74, 0.1)",
			progressBg: "linear-gradient(90deg, #4ade80, #16a34a)",
			badge: "SECURE",
			message:
				"Your practicing credentials are up to date and fully compliant.",
		};
	};

	const theme = data ? getUrgencyTheme(data.daysLeft) : null;
	const totalYearDays = 365;
	const standardPercentage = data
		? Math.min(Math.max((data.daysLeft / totalYearDays) * 100, 0), 100)
		: 100;

	return createPortal(
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(15, 23, 42, 0.15)",
				backdropFilter: "blur(6px)",
				WebkitBackdropFilter: "blur(6px)",
				zIndex: 99999,
				display: "flex",
				justifyContent: "flex-end",
				padding: "1rem",
			}}
		>
			<div style={{ flex: 1 }} onClick={onClose} />

			<div
				style={{
					width: "100%",
					maxWidth: "420px",
					height: "100%",
					background: "rgba(255, 255, 255, 0.85)",
					backdropFilter: "blur(40px)",
					WebkitBackdropFilter: "blur(40px)",
					boxShadow:
						"-10px 10px 40px rgba(0,0,0,0.06), inset 1px 1px 0 rgba(255,255,255,0.8)",
					borderRadius: "28px",
					border: "1px solid rgba(255,255,255,0.5)",
					padding: "2rem",
					display: "flex",
					flexDirection: "column",
					animation:
						"slideInFloating 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
					boxSizing: "border-box",
				}}
			>
				<style>{`
          @keyframes slideInFloating {
            from { transform: translateX(120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "1.5rem",
					}}
				>
					<div>
						<h3
							style={{
								margin: 0,
								fontSize: "20px",
								fontWeight: 900,
								color: "#0f172a",
							}}
						>
							Compliance Hub
						</h3>
						<p
							style={{
								margin: "2px 0 0 0",
								fontSize: "12px",
								color: "#64748b",
							}}
						>
							Live MLSCN certification profile.
						</p>
					</div>
					<button
						onClick={onClose}
						style={{
							border: "none",
							background: "rgba(255,255,255,0.6)",
							boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
							width: "36px",
							height: "36px",
							borderRadius: "50%",
							cursor: "pointer",
							color: "#64748b",
							fontWeight: "bold",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.6)")
						}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				{loading ? (
					<div
						style={{
							color: "#64748b",
							fontSize: "13px",
							textAlign: "center",
							marginTop: "2rem",
						}}
					>
						Loading credentials...
					</div>
				) : !data || data.status === "UNCONFIGURED" ? (
					<div
						style={{
							textAlign: "center",
							padding: "3rem 0",
							background: "rgba(255,255,255,0.5)",
							borderRadius: "20px",
							border: "1px dashed #cbd5e1",
						}}
					>
						<p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
							No verified license found.
						</p>
						<p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
							Upload your license in Settings to activate tracking.
						</p>
					</div>
				) : (
					theme && (
						<div
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								gap: "1.25rem",
							}}
						>
							{/* Integrated Compliance Card Container */}
							<div
								style={{
									background: theme.bg,
									border: `1px solid ${theme.border}`,
									borderRadius: "20px",
									padding: "1.25rem",
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<span
										style={{
											fontSize: "10px",
											fontWeight: 900,
											color: theme.text,
											letterSpacing: "0.5px",
										}}
									>
										SYSTEM AUDIT: {theme.badge}
									</span>
									<span
										style={{
											fontSize: "14px",
											fontWeight: 900,
											color: theme.text,
										}}
									>
										{data.daysLeft <= 0 ? "0" : data.daysLeft} Days Left
									</span>
								</div>
								<p
									style={{
										margin: 0,
										fontSize: "11px",
										color: "#475569",
										lineHeight: "1.4",
									}}
								>
									{theme.message}
								</p>

								{/* 🚀 EXTRACTED ROUTING LINK VIA OFFICIAL GATWAY PROFILE */}
								<a
									href="https://portal.mlscn.gov.ng"
									target="_blank"
									rel="noopener noreferrer"
									style={{
										marginTop: "4px",
										background: data.daysLeft <= 60 ? theme.text : "#0f172a",
										color: "white",
										textDecoration: "none",
										textAlign: "center",
										padding: "8px 12px",
										borderRadius: "10px",
										fontSize: "12px",
										fontWeight: 800,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "6px",
										boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
										transition: "all 0.2s",
									}}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
										<polyline points="15 3 21 3 21 9"></polyline>
										<line x1="10" y1="14" x2="21" y2="3"></line>
									</svg>
									Launch MLSCN Renewal Portal
								</a>
							</div>

							{/* Scientist Verification Card */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "12px",
									padding: "1rem 1.25rem",
									background: "rgba(255,255,255,0.6)",
									borderRadius: "20px",
									border: "1px solid rgba(255,255,255,0.8)",
									boxShadow: "0 8px 20px rgba(0,0,0,0.01)",
								}}
							>
								<div
									style={{
										width: "44px",
										height: "44px",
										borderRadius: "50%",
										background:
											"linear-gradient(135deg, #0058bc 0%, #0ea5e9 100%)",
										color: "white",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: 800,
										fontSize: "16px",
										boxShadow: "0 4px 12px rgba(0,88,188,0.2)",
									}}
								>
									{data.name?.charAt(0)}
								</div>
								<div>
									<h4
										style={{
											margin: 0,
											fontSize: "14px",
											fontWeight: 800,
											color: "#0f172a",
										}}
									>
										{data.name}
									</h4>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "4px",
											marginTop: "2px",
										}}
									>
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#16a34a"
											strokeWidth="3"
										>
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
										<p
											style={{
												margin: 0,
												fontSize: "10px",
												color: "#16a34a",
												fontWeight: 800,
												letterSpacing: "0.5px",
											}}
										>
											MLSCN REGISTERED SCIENTIST
										</p>
									</div>
								</div>
							</div>

							{/* Linear Timeline Meter Panel */}
							<div
								style={{
									padding: "1.25rem",
									borderRadius: "20px",
									background: "rgba(255,255,255,0.6)",
									border: "1px solid rgba(255,255,255,0.8)",
									boxShadow: "0 8px 20px rgba(0,0,0,0.01)",
								}}
							>
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
									<span style={{ color: "#0f172a", fontWeight: 800 }}>
										Reg: {data.licenseNumber}
									</span>
								</div>
								<div
									style={{
										width: "100%",
										height: "8px",
										background: "rgba(0,0,0,0.05)",
										borderRadius: "4px",
										overflow: "hidden",
										marginBottom: "6px",
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
								<span
									style={{
										fontSize: "10px",
										color: "#94a3b8",
										fontWeight: 600,
									}}
								>
									Official Registry Expiration Date: {data.expiryFormatted}
								</span>
							</div>

							{/* CPD Credits Progress Meter Panel */}
							<div
								style={{
									padding: "1.25rem",
									borderRadius: "20px",
									background: "rgba(255,255,255,0.6)",
									border: "1px solid rgba(255,255,255,0.8)",
									boxShadow: "0 8px 20px rgba(0,0,0,0.01)",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										fontSize: "11px",
										fontWeight: 700,
										color: "#64748b",
										marginBottom: "8px",
									}}
								>
									<span>ANNUAL CPD TARGET</span>
									<span style={{ color: "#0058bc", fontWeight: 800 }}>
										{data.cpdPoints} / 30 Credits Earned
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

							{/* Action Controller Tray at Bottom */}
							<button
								onClick={() => (window.location.href = "/settings")}
								style={{
									marginTop: "auto",
									background: "white",
									border: "1px solid #e2e8f0",
									padding: "14px",
									borderRadius: "14px",
									fontWeight: 800,
									color: "#0f172a",
									cursor: "pointer",
									transition: "0.2s",
									boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.boxShadow =
										"0 4px 15px rgba(0,0,0,0.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.boxShadow =
										"0 2px 10px rgba(0,0,0,0.02)")
								}
							>
								Upload Renewed Certificate
							</button>
						</div>
					)
				)}
			</div>
		</div>,
		document.body,
	);
}
