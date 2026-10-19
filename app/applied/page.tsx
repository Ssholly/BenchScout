"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, startTransition } from "react";
import type { ClientJob } from "@/lib/types";
import { useState, useEffect, useRef, useCallback } from "react";
import PostingDialog from "@/components/PostingDialog";

type Column = { id: string; title: string; color: string; bgColor: string };
type JobCard = {
	isDirectPost: boolean;
	id: string;
	columnId: string;
	role: string;
	company: string;
	loc: string;
	date: string;
	salary: string;
	tier: number;
	url: string;
	desc: string;
};

function AppliedPipeline() {
 const params = useSearchParams();
 const selectedJob = params.get("job");
 const search = params.get("search");
	const [cards, setCards] = useState<JobCard[]>([]);
	const [stageFilter, setStageFilter] = useState("all");
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [pipelineError, setPipelineError] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

	const [viewingPosting, setViewingPosting] = useState<JobCard | null>(null);
	const [loadError, setLoadError] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const pipelineRequest = useRef<AbortController | null>(null);
    const pipelineAccount = useRef<string | null>(null);
	const closePosting = useCallback(() => setViewingPosting(null), []);

	// 🚀 BRAND UPDATED COLUMNS
	const columns: Column[] = [
		{ id: "rejected", title: "Closed / Rejected", color: "#64748b", bgColor: "#f1f5f9" },
		{
			id: "saved",
			title: "Saved / Shortlisted",
			color: "#64748b",
			bgColor: "rgba(241, 245, 249, 0.5)",
		},
		{
			id: "applied",
			title: "Application Sent",
			color: "#0B2444",
			bgColor: "rgba(11, 36, 68, 0.05)",
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
			color: "#1A8C7A",
			bgColor: "rgba(26, 140, 122, 0.05)",
		},
	];

	const loadPipeline = async () => {
        pipelineRequest.current?.abort();
        const controller = new AbortController();
        pipelineRequest.current = controller;
        const activeEmail = localStorage.getItem("labpro_active_user");
        if (!activeEmail) {
            pipelineAccount.current = null; setIsUserLoggedIn(false); setCards([]); setIsLoading(false); setRefreshing(false); return;
        }
        if (pipelineAccount.current !== activeEmail) { setCards([]); setIsLoading(true); pipelineAccount.current = activeEmail; }
        setIsUserLoggedIn(true); setRefreshing(true); setLoadError("");
        try {
            const response = await fetch("/api/jobs?view=pipeline", { signal: controller.signal });
            const data = await response.json();
            if (!response.ok || !Array.isArray(data)) throw new Error(data.error || "Could not load your applications. Please retry.");
            setCards(data.filter((j: ClientJob) => j.applied).map((j: ClientJob) => ({
                id: j.id,
                columnId: j.isDirectPost ? ({ pending: "applied", shortlisted: "interviewing", hired: "offer", rejected: "rejected" }[j.applications?.[0]?.status || "pending"] || "applied") : (["saved", "applied", "interviewing", "offer", "rejected"].includes(j.status || "") ? j.status! : "applied"),
                isDirectPost: j.isDirectPost, role: j.role, company: j.company, loc: j.loc,
                date: "Recently", salary: j.salary || "Not disclosed", tier: j.tier || 2, url: j.url, desc: j.desc || "",
            })));
        } catch (error) {
            if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Could not load your applications. Please retry.");
        } finally {
            if (!controller.signal.aborted) { setIsLoading(false); setRefreshing(false); }
        }
    };

    useEffect(() => {
        const reload = () => { void loadPipeline(); };
        startTransition(reload);
        window.addEventListener("userStateChanged", reload);
        window.addEventListener("jobsUpdated", reload);
        return () => {
            pipelineRequest.current?.abort();
            window.removeEventListener("userStateChanged", reload);
            window.removeEventListener("jobsUpdated", reload);
        };
    }, []);

	const handleRemoveApplication = async (
		e: React.MouseEvent,
		jobId: string,
	) => {
		e.stopPropagation();

        if (updatingId) return;
        setUpdatingId(jobId);
        setPipelineError("");
        try {
            const response = await fetch("/api/apply", {
                method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not remove this application. Please retry.");
            setCards(previous => previous.filter(card => card.id !== jobId));
            window.dispatchEvent(new Event("jobsUpdated"));
        } catch (error) {
            setPipelineError(error instanceof Error ? error.message : "Could not remove this application. Please retry.");
        } finally { setUpdatingId(null); }

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

	const moveCard = async (jobId: string, columnId: string) => {
    if (cards.find(card => card.id === jobId)?.isDirectPost) return;
    setPipelineError("");
    setUpdatingId(jobId);
    setCards(prev => prev.map(card => card.id === jobId ? { ...card, columnId } : card));
    try {
      const response = await fetch("/api/jobs/status", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: columnId }),
      });
      if (!response.ok) throw new Error("Could not update application status");
      window.dispatchEvent(new Event("jobsUpdated"));
    } catch {
      setPipelineError("Your change could not be saved. The pipeline has been reloaded.");
      void loadPipeline();
    } finally { setUpdatingId(null); }
  };
  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault(); setDragOverColumn(null);
    if (draggedCardId) void moveCard(draggedCardId, columnId);
  };

 const visibleCards = cards.filter(card => (!selectedJob || card.id === selectedJob) && (!search || `${card.role} ${card.company}`.toLowerCase().includes(search.toLowerCase())));
	return (
		<section
			className="pane active"
			style={{ height: "100%", display: "flex", flexDirection: "column" }}
		>
            {(selectedJob || search) && <p role="status">Showing the application from your notification. <Link href="/applied">View all applications →</Link></p>}
            {!isLoading && (selectedJob || search) && !visibleCards.length && <p role="status">This application is no longer available in your pipeline.</p>}
            {pipelineError && <p role="alert">{pipelineError}</p>}
            {loadError && <div className="pipeline-load-error" role="alert"><p>{loadError}</p><button onClick={() => void loadPipeline()} disabled={refreshing}>Retry loading</button></div>}
            {refreshing && !isLoading && <p role="status">Updating applications…</p>}
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
					Keep each application up to date using its stage selector.
				</p>
			</div>

			{!isUserLoggedIn ? (
				<div
					style={{
						padding: "4rem",
						textAlign: "center",
						background: "rgba(255,255,255,0.5)",
						backdropFilter: "blur(16px)",
						borderRadius: "16px",
						border: "1px solid rgba(255, 255, 255, 0.3)",
						boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
					}}
				>
					<div
						style={{
							width: "64px",
							height: "64px",
							background: "rgba(241, 245, 249, 0.8)",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto 1rem auto",
							color: "#64748b",
						}}
					>
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
							<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
						</svg>
					</div>
					<h2
						style={{
							margin: "0 0 8px 0",
							fontSize: "18px",
							color: "#0f172a",
							fontWeight: 800,
						}}
					>
						Application Pipeline Locked
					</h2>
					<p
						style={{
							color: "#64748b",
							fontSize: "14px",
							maxWidth: "400px",
							margin: "0 auto 24px auto",
							lineHeight: "1.5",
						}}
					>
						Log in to manage your active applications and track your hiring
						progress.
					</p>
					<button
						onClick={() => window.dispatchEvent(new Event("openProfileModal"))}
						style={{
							background: "#0B2444",
							color: "white",
							border: "none",
							padding: "12px 24px",
							borderRadius: "8px",
							fontWeight: 700,
							cursor: "pointer",
							boxShadow: "0 4px 12px rgba(11, 36, 68, 0.2)",
						}}
					>
						Log In to Access
					</button>
				</div>
			) : isLoading ? (
				<div
					style={{
						padding: "4rem",
						textAlign: "center",
						fontFamily: "monospace",
						color: "#94a3b8",
					}}
				>
					Loading your applications…
				</div>
			) : (
                <>
                <div className="pipeline-mobile-controls">
                  <label htmlFor="pipeline-stage-filter">Show applications</label>
                  <select id="pipeline-stage-filter" value={stageFilter} onChange={event => setStageFilter(event.target.value)}>
                    <option value="all">All stages ({visibleCards.length})</option>
                    {columns.map(column => <option key={column.id} value={column.id}>{column.title} ({visibleCards.filter(card => card.columnId === column.id).length})</option>)}
                  </select>
                  <p>Filter by stage to focus on what’s next.</p>
                </div>
                {!loadError && cards.length === 0 && stageFilter === "all" && <p className="pipeline-mobile-empty" role="status">No applications yet. Find a role in Job Matches to start your pipeline.</p>}
				<div
					className="mobile-stack pipeline-board"
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
						const columnCards = visibleCards.filter((c) => c.columnId === col.id);
						const isOver = dragOverColumn === col.id;

						return (
							<div
								key={col.id}
                                className={`pipeline-column ${stageFilter === "all" ? (columnCards.length ? "mobile-visible" : "mobile-hidden") : (stageFilter === col.id ? "mobile-visible" : "mobile-hidden")}`}
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
									WebkitBackdropFilter: "blur(24px)",
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
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
										}}
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
                                        className="pipeline-card"
											draggable={!card.isDirectPost}
											onDragStart={(e) => handleDragStart(e, card.id)}
											onDragEnd={(e) => handleDragEnd(e, card.id)}

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
												title={card.isDirectPost ? "Withdraw application" : "Return job to Matches"} aria-label={card.isDirectPost ? "Withdraw application" : "Return job to Matches"} disabled={updatingId !== null}
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
												{/* 🚀 FIXED PIPELINE BRAND TAG COLORS */}
												<span
													style={{
														background:
															card.tier === 1
																? "#e6fcf5"
																: card.tier === 2
																	? "#e0e7ff"
																	: "#f1f5f9",
														color:
															card.tier === 1
																? "#1A8C7A"
																: card.tier === 2
																	? "#0B2444"
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
														stroke="#1A8C7A"
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
                                            <button className="pipeline-posting-button" onClick={() => setViewingPosting(card)}>View posting</button>
                                            {card.isDirectPost && <p style={{ fontSize: 12, color: "#64748b", margin: "12px 0 0" }}>Stage updated by the employer.</p>}
                                            {!card.isDirectPost && <label style={{ display: "block", marginTop: 12, fontSize: 12, color: "#64748b" }} onClick={event => event.stopPropagation()}>
                                              Application stage
                                              <select disabled={updatingId !== null} aria-label={`Application stage for ${card.role}`} value={card.columnId} onChange={event => void moveCard(card.id, event.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid #dbe2ea", background: "white", color: "#0B2444" }}>
                                                {columns.map(column => <option key={column.id} value={column.id}>{column.title}</option>)}
                                              </select>
                                            </label>}
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
											<span className="pipeline-desktop-empty">Drop jobs here</span><span className="pipeline-phone-empty">No applications in this stage.</span>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
                </>
			)}
            {viewingPosting && <PostingDialog posting={viewingPosting} onClose={closePosting} />}
		</section>
	);
}

export default function AppliedRoute() { return <Suspense fallback={<p>Loading applications…</p>}><AppliedPipeline /></Suspense>; }
