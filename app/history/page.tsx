"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function HistoryPage() {
	const [mounted, setMounted] = useState(false);
	const [history, setHistory] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userEmail, setUserEmail] = useState("...");
	const [showClearModal, setShowClearModal] = useState(false);

	const loadHistory = () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setUserEmail("...");
			setHistory([]);
			setIsLoading(false);
			return;
		}

		setUserEmail(activeEmail);
		setIsLoading(true);

		// Fetch specifically for this user
		fetch(`/api/history?email=${activeEmail}`)
			.then((res) => res.json())
			.then((data) => {
				let myHistory = data || [];
				if (Array.isArray(myHistory)) {
					myHistory = myHistory.filter(
						(h: any) =>
							h.userEmail === activeEmail ||
							h.email === activeEmail ||
							(!h.userEmail && !h.email), // Fallback just in case
					);
				}
				setHistory(myHistory);
				setIsLoading(false);
			})
			.catch(() => setIsLoading(false));
	};

	useEffect(() => {
		setMounted(true);
		loadHistory();

		window.addEventListener("userStateChanged", loadHistory);
		return () => window.removeEventListener("userStateChanged", loadHistory);
	}, []);

	const handleClearHistory = async () => {
		setShowClearModal(false);

		try {
			await fetch("/api/reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: userEmail }),
			});
			setHistory([]);
			window.dispatchEvent(new Event("jobsUpdated")); // Update Matches Page Sidebar!
		} catch (e) {
			console.error("Failed to clear history", e);
		}
	};

	if (isLoading)
		return (
			<div style={{ padding: "4rem", textAlign: "center", color: "#94a3b8" }}>
				Loading...
			</div>
		);

	return (
		<section
			className="pane active"
			style={{
				width: "100%",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @media screen and (max-width: 768px) {
          .responsive-table table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr { display: block; }
          .responsive-table thead tr { position: absolute; top: -9999px; left: -9999px; }
          .responsive-table tr { margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.5) !important; border-radius: 16px; background: rgba(255,255,255,0.6) !important; backdrop-filter: blur(16px); box-shadow: 0 4px 16px -2px rgba(0,0,0,0.03); overflow: hidden; }
          .responsive-table td { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.03) !important; position: relative; padding: 1rem 1.25rem !important; display: flex; flex-direction: column; gap: 0.25rem; text-align: left !important; }
          .responsive-table td:last-child { border-bottom: 0 !important; }
          .responsive-table td::before { content: attr(data-label); font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px; }
        }
      `,
				}}
			/>

			{showClearModal &&
				mounted &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(248, 250, 252, 0.7)",
							backdropFilter: "blur(8px)",
							zIndex: 99999,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "1rem",
						}}
					>
						<div
							style={{
								background: "white",
								width: "100%",
								maxWidth: "400px",
								borderRadius: "20px",
								padding: "2rem",
								textAlign: "center",
								boxShadow: "0 20px 40px -4px rgba(0, 0, 0, 0.1)",
								border: "1px solid rgba(0,0,0,0.05)",
							}}
						>
							<div
								style={{
									background: "#fef2f2",
									width: "48px",
									height: "48px",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto 16px auto",
									color: "#ef4444",
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="3 6 5 6 21 6"></polyline>
									<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									<line x1="10" y1="11" x2="10" y2="17"></line>
									<line x1="14" y1="11" x2="14" y2="17"></line>
								</svg>
							</div>
							<h3
								style={{
									fontSize: "18px",
									fontWeight: 800,
									color: "#0f172a",
									margin: "0 0 8px 0",
								}}
							>
								Clear Run History?
							</h3>
							<p
								style={{
									fontSize: "14px",
									color: "#64748b",
									margin: "0 0 24px 0",
									lineHeight: "1.5",
								}}
							>
								This will permanently delete all records of past job scans. This
								action cannot be undone.
							</p>
							<div
								style={{
									display: "flex",
									gap: "12px",
									justifyContent: "center",
								}}
							>
								<button
									onClick={() => setShowClearModal(false)}
									style={{
										flex: 1,
										padding: "10px",
										borderRadius: "10px",
										border: "1px solid #e2e8f0",
										background: "white",
										color: "#475569",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									Cancel
								</button>
								<button
									onClick={handleClearHistory}
									style={{
										flex: 1,
										padding: "10px",
										borderRadius: "10px",
										border: "none",
										background: "#ef4444",
										color: "white",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									Yes, Clear All
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}

			{/* HEADER */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					marginBottom: "2.5rem",
				}}
			>
				<div>
					<h2
						className="page-title"
						style={{
							fontSize: "28px",
							fontWeight: 800,
							margin: 0,
							color: "#0f172a",
						}}
					>
						Run History
					</h2>
					<p
						className="page-sub"
						style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}
					>
						Log of all automated AI scraping events.
					</p>
				</div>
				<button
					onClick={() => setShowClearModal(true)}
					style={{
						background: "rgba(255, 255, 255, 0.6)",
						backdropFilter: "blur(12px)",
						color: "#ef4444",
						border: "1px solid rgba(254, 202, 202, 0.5)",
						padding: "8px 16px",
						borderRadius: "8px",
						fontWeight: 700,
						cursor: "pointer",
						fontSize: "14px",
						transition: "0.2s",
					}}
				>
					Clear All
				</button>
			</div>

			<div
				className="responsive-table"
				style={{
					background: "rgba(255, 255, 255, 0.5)",
					backdropFilter: "blur(24px)",
					WebkitBackdropFilter: "blur(24px)",
					borderRadius: "16px",
					border: "1px solid rgba(255, 255, 255, 0.3)",
					overflow: "hidden",
					boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
				}}
			>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						textAlign: "left",
					}}
				>
					<thead
						style={{
							background: "rgba(255, 255, 255, 0.4)",
							borderBottom: "1px solid rgba(0,0,0,0.05)",
						}}
					>
						<tr>
							<th
								style={{
									padding: "1rem 1.5rem",
									fontSize: "11px",
									color: "#94a3b8",
									textTransform: "uppercase",
									fontWeight: 800,
								}}
							>
								Date & Time
							</th>
							<th
								style={{
									padding: "1rem",
									fontSize: "11px",
									color: "#94a3b8",
									textTransform: "uppercase",
									fontWeight: 800,
								}}
							>
								Matches
							</th>
							<th
								style={{
									padding: "1rem",
									fontSize: "11px",
									color: "#94a3b8",
									textTransform: "uppercase",
									fontWeight: 800,
								}}
							>
								Sent To
							</th>
							<th
								style={{
									padding: "1rem 1.5rem",
									fontSize: "11px",
									color: "#94a3b8",
									textTransform: "uppercase",
									fontWeight: 800,
								}}
							>
								Status
							</th>
						</tr>
					</thead>
					<tbody>
						{history.map((run) => (
							<tr
								key={run.id}
								style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
							>
								<td
									data-label="Date & Time"
									style={{
										padding: "1.25rem 1.5rem",
										fontSize: "14px",
										color: "#0f172a",
										fontWeight: 600,
									}}
								>
									{new Date(run.createdAt).toLocaleString()}
								</td>
								<td
									data-label="Matches Found"
									style={{
										padding: "1.25rem 1rem",
										fontSize: "14px",
										fontWeight: 800,
										color: "#0f172a",
									}}
								>
									{run.matches}
								</td>
								<td
									data-label="Dispatch Email"
									style={{
										padding: "1.25rem 1rem",
										fontSize: "13px",
										color: "#64748b",
										fontWeight: 600,
									}}
								>
									{/* 🚀 THE FIX: Always show userEmail or explicitly say Auto-Send Disabled */}
									{run.status === "run only" ? "Auto-Send Disabled" : userEmail}
								</td>
								<td
									data-label="Task Status"
									style={{ padding: "1.25rem 1.5rem" }}
								>
									<span
										style={{
											background:
												run.status === "failed"
													? "rgba(254, 242, 242, 0.8)"
													: run.status === "run only"
														? "rgba(241, 245, 249, 0.8)"
														: "rgba(240, 249, 255, 0.8)",
											color:
												run.status === "failed"
													? "#ef4444"
													: run.status === "run only"
														? "#64748b"
														: "#0058bc",
											padding: "4px 8px",
											borderRadius: "6px",
											fontSize: "11px",
											fontWeight: 800,
											textTransform: "uppercase",
										}}
									>
										{run.status}
									</span>
								</td>
							</tr>
						))}
						{history.length === 0 && (
							<tr>
								<td
									colSpan={4}
									style={{
										padding: "3rem",
										textAlign: "center",
										color: "#94a3b8",
										fontSize: "14px",
									}}
								>
									No run history available.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
