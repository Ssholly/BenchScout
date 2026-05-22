"use client";
import { useState, useEffect } from "react";
import LockedPane from "@/components/LockedPane";

// Defining the shape of our data
type Column = { id: string; title: string; color: string; bgColor: string };
type JobCard = {
	id: string;
	columnId: string;
	role: string;
	company: string;
	loc: string;
	date: string;
	salary: string;
	tier: number;
	url: string;
};

export default function AppliedPipeline() {
	const [cards, setCards] = useState<JobCard[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Our Kanban stages
	const columns: Column[] = [
		{
			id: "saved",
			title: "Saved / Shortlisted",
			color: "#64748b",
			bgColor: "rgba(241, 245, 249, 0.5)",
		},
		{
			id: "applied",
			title: "Application Sent",
			color: "#0ea5e9",
			bgColor: "rgba(224, 242, 254, 0.5)",
		},
		{
			id: "interviewing",
			title: "Interviewing",
			color: "#eab308",
			bgColor: "rgba(254, 249, 195, 0.5)",
		},
		{
			id: "offer",
			title: "Offer / Hired",
			color: "#22c55e",
			bgColor: "rgba(220, 252, 231, 0.5)",
		},
	];

	const loadPipeline = () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setCards([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch(`/api/jobs?email=${activeEmail}`)
			.then((res) => res.json())
			.then((data) => {
				let myJobs = data || [];
				if (Array.isArray(myJobs)) {
					myJobs = myJobs.filter(
						(j: any) =>
							j.targetEmail === activeEmail ||
							j.userEmail === activeEmail ||
							j.email === activeEmail ||
							(!j.targetEmail && !j.userEmail && !j.email),
					);
				}

				const onlyApplied = myJobs.filter((j: any) => j.applied === true);

				const formattedCards: JobCard[] = onlyApplied.map((j: any) => {
					let assignedColumn = "applied";
					if (j.stage) {
						assignedColumn = j.stage;
					} else if (
						j.status &&
						["saved", "applied", "interviewing", "offer"].includes(j.status)
					) {
						assignedColumn = j.status;
					}

					return {
						id: j.id,
						columnId: assignedColumn,
						role: j.role,
						company: j.company,
						loc: j.loc,
						date: "Recently",
						salary: j.salary || "Competitive",
						tier: j.tier || 2,
						url: j.url,
					};
				});

				setCards(formattedCards);
				setIsLoading(false);
			})
			.catch(() => setIsLoading(false));
	};

	useEffect(() => {
		setMounted(true);
		setIsLoggedIn(!!localStorage.getItem("labpro_active_user"));
		loadPipeline();
		window.addEventListener("userStateChanged", loadPipeline);
		window.addEventListener("jobsUpdated", loadPipeline);
		return () => {
			window.removeEventListener("userStateChanged", loadPipeline);
			window.removeEventListener("jobsUpdated", loadPipeline);
		};
	}, []);

	const handleCardClick = (url: string) => {
		if (!url || url === "#" || url.trim() === "") return;
		let finalUrl = url.trim();
		if (finalUrl.includes("myjobmag.comhttps://"))
			finalUrl = "https://" + finalUrl.split("https://")[1];
		if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://"))
			finalUrl = "https://" + finalUrl;
		try {
			window.open(finalUrl, "_blank", "noopener,noreferrer");
		} catch (error) {
			console.error("Invalid URL", error);
		}
	};

	const handleRemoveApplication = async (
		e: React.MouseEvent,
		jobId: string,
	) => {
		e.stopPropagation();
		setCards((prev) => prev.filter((card) => card.id !== jobId));
		try {
			await fetch("/api/apply", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ jobId, revert: true }),
			});
			window.dispatchEvent(new Event("jobsUpdated"));
		} catch (error) {
			console.error("Failed to remove application", error);
		}
	};

	const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent, id: string) => {
		setDraggedCardId(id);
		e.dataTransfer.effectAllowed = "move";
		setTimeout(() => {
			const el = document.getElementById(id);
			if (el) el.style.opacity = "0.4";
		}, 0);
	};
	const handleDragEnd = (e: React.DragEvent, id: string) => {
		setDraggedCardId(null);
		setDragOverColumn(null);
		const el = document.getElementById(id);
		if (el) el.style.opacity = "1";
	};
	const handleDragOver = (e: React.DragEvent, columnId: string) => {
		e.preventDefault();
		if (dragOverColumn !== columnId) setDragOverColumn(columnId);
	};
	const handleDrop = async (e: React.DragEvent, columnId: string) => {
		e.preventDefault();
		setDragOverColumn(null);
		if (!draggedCardId) return;
		setCards((prev) =>
			prev.map((card) =>
				card.id === draggedCardId ? { ...card, columnId } : card,
			),
		);
		try {
			await fetch("/api/jobs/status", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jobId: draggedCardId,
					status: columnId,
					stage: columnId,
				}),
			});
		} catch (error) {
			console.error("Database sync failed", error);
		}
	};

	if (mounted && !isLoggedIn) {
		return (
			<LockedPane
				title="Application Pipeline"
				sub="Log in to manage your active applications and track your hiring progress."
			/>
		);
	}

	if (isLoading) {
		return (
			<div
				style={{
					padding: "4rem",
					textAlign: "center",
					fontFamily: "monospace",
					color: "#94a3b8",
				}}
			>
				[SYSTEM] Loading application pipeline...
			</div>
		);
	}

	return (
		<section
			className="pane active"
			style={{ height: "100%", display: "flex", flexDirection: "column" }}
		>
			<div style={{ marginBottom: "2rem" }}>
				<h1
					className="page-title"
					style={{
						margin: 0,
						fontSize: "28px",
						fontWeight: 900,
						color: "#0f172a",
						letterSpacing: "-0.5px",
					}}
				>
					Application Pipeline
				</h1>
				<p
					className="page-sub"
					style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}
				>
					Drag and drop active roles to track your hiring progress. Click a card
					to revisit the posting.
				</p>
			</div>
			<div
				className="mobile-stack"
				style={{
					display: "flex",
					gap: "1.5rem",
					flex: 1,
					overflowX: "auto",
					paddingBottom: "1rem",
					alignItems: "flex-start",
				}}
			>
				{columns.map((col) => {
					const columnCards = cards.filter((c) => c.columnId === col.id);
					const isOver = dragOverColumn === col.id;
					return (
						<div
							key={col.id}
							onDragOver={(e) => handleDragOver(e, col.id)}
							onDrop={(e) => handleDrop(e, col.id)}
							style={{
								flex: 1,
								minWidth: "280px",
								height: "100%",
								minHeight: "500px",
								background: isOver
									? "rgba(255, 255, 255, 0.6)"
									: "rgba(255, 255, 255, 0.3)",
								backdropFilter: "blur(24px)",
								borderRadius: "20px",
								border: isOver
									? `2px dashed ${col.color}`
									: "1px solid rgba(255, 255, 255, 0.4)",
								padding: "1.25rem",
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								transition: "all 0.2s ease",
								boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "0.5rem",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "8px" }}
								>
									<div
										style={{
											width: "10px",
											height: "10px",
											borderRadius: "50%",
											background: col.color,
										}}
									></div>
									<h3
										style={{
											margin: 0,
											fontSize: "14px",
											fontWeight: 800,
											color: "#0f172a",
										}}
									>
										{col.title}
									</h3>
								</div>
								<span
									style={{
										fontSize: "12px",
										fontWeight: 800,
										color: "#64748b",
										background: "white",
										padding: "2px 8px",
										borderRadius: "12px",
										boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
									}}
								>
									{columnCards.length}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "12px",
									flex: 1,
								}}
							>
								{columnCards.map((card) => (
									<div
										key={card.id}
										id={card.id}
										draggable
										onDragStart={(e) => handleDragStart(e, card.id)}
										onDragEnd={(e) => handleDragEnd(e, card.id)}
										onClick={() => handleCardClick(card.url)}
										style={{
											background: "rgba(255, 255, 255, 0.95)",
											borderRadius: "16px",
											padding: "1rem",
											cursor: "pointer",
											border: "1px solid rgba(255,255,255,0.8)",
											boxShadow: "0 4px 12px -2px rgba(0,0,0,0.05)",
											transition: "box-shadow 0.2s ease, transform 0.2s ease",
											position: "relative",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-2px)";
											e.currentTarget.style.boxShadow =
												"0 8px 20px -4px rgba(0,0,0,0.1)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow =
												"0 4px 12px -2px rgba(0,0,0,0.05)";
										}}
									>
										<button
											onClick={(e) => handleRemoveApplication(e, card.id)}
											title="Remove from pipeline"
											style={{
												position: "absolute",
												top: "12px",
												right: "12px",
												background: "rgba(241, 245, 249, 0.8)",
												border: "none",
												width: "22px",
												height: "22px",
												borderRadius: "50%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
												color: "#94a3b8",
												transition: "all 0.2s ease",
												zIndex: 2,
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = "#fef2f2";
												e.currentTarget.style.color = "#ef4444";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background =
													"rgba(241, 245, 249, 0.8)";
												e.currentTarget.style.color = "#94a3b8";
											}}
										>
											<svg
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="3"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<line x1="18" y1="6" x2="6" y2="18"></line>
												<line x1="6" y1="6" x2="18" y2="18"></line>
											</svg>
										</button>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "flex-start",
												marginBottom: "8px",
											}}
										>
											<span
												style={{
													background:
														card.tier === 1
															? "#dcfce7"
															: card.tier === 2
																? "#e0f2fe"
																: "#f1f5f9",
													color:
														card.tier === 1
															? "#15803d"
															: card.tier === 2
																? "#0369a1"
																: "#64748b",
													fontSize: "9px",
													padding: "3px 6px",
													borderRadius: "4px",
													fontWeight: 800,
												}}
											>
												TIER {card.tier}
											</span>
										</div>
										<h4
											style={{
												margin: "0 0 4px 0",
												fontSize: "14px",
												fontWeight: 800,
												color: "#0f172a",
												lineHeight: "1.3",
												paddingRight: "20px",
											}}
										>
											{card.role}
										</h4>
										<p
											style={{
												margin: "0 0 12px 0",
												fontSize: "12px",
												color: "#64748b",
												fontWeight: 500,
											}}
										>
											{card.company}
										</p>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												borderTop: "1px solid #f1f5f9",
												paddingTop: "12px",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													color: "#64748b",
												}}
											>
												<svg
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
												>
													<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
													<circle cx="12" cy="10" r="3"></circle>
												</svg>
												<span
													style={{
														fontSize: "11px",
														fontWeight: 600,
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
														maxWidth: "120px",
													}}
												>
													{card.loc}
												</span>
											</div>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
												}}
											>
												<span
													style={{
														fontSize: "11px",
														fontWeight: 800,
														color: "#0f172a",
													}}
												>
													{card.salary}
												</span>
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="#0ea5e9"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
													<polyline points="15 3 21 3 21 9"></polyline>
													<line x1="10" y1="14" x2="21" y2="3"></line>
												</svg>
											</div>
										</div>
									</div>
								))}
								{columnCards.length === 0 && (
									<div
										style={{
											height: "100px",
											border: "2px dashed rgba(255,255,255,0.5)",
											borderRadius: "16px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "#94a3b8",
											fontSize: "12px",
											fontWeight: 600,
										}}
									>
										Drop jobs here
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
