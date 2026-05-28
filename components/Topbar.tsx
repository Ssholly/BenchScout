"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function Topbar() {
	const router = useRouter();
	const notifRef = useRef<HTMLDivElement>(null);

	const [mounted, setMounted] = useState(false);
	const [isOnline, setIsOnline] = useState(true);
	const [hasNotifications, setHasNotifications] = useState(false);
	const [showNotifs, setShowNotifs] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchActive, setIsSearchActive] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [helpView, setHelpView] = useState<"menu" | "docs" | "api">("menu");

	const [allJobs, setAllJobs] = useState<any[]>([]);
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [notifications, setNotifications] = useState<any[]>([]);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

	const fetchSearchData = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setIsUserLoggedIn(false);
			setAllJobs([]);
			setNotifications([]);
			setHasNotifications(false);
			return;
		}

		setIsUserLoggedIn(true);
		try {
			const res = await fetch("/api/jobs");
			const data = await res.json();
			if (Array.isArray(data)) {
				const unappliedJobs = data.filter((j: any) => j.applied !== true);
				setAllJobs(unappliedJobs);

				const tier1Jobs = unappliedJobs.filter((j: any) => j.tier === 1);
				if (tier1Jobs.length > 0) {
					const newNotifs = tier1Jobs.slice(0, 3).map((job) => ({
						id: job.id,
						title: "High-Priority Match",
						body: `A new Tier 1 position for ${job.role} at ${job.company} (${job.loc}) was just found.`,
						time: "Recently added",
					}));
					setNotifications(newNotifs);
					setHasNotifications(true);
				} else {
					setNotifications([]);
					setHasNotifications(false);
				}
			}
		} catch (e) {
			console.error("Failed to fetch jobs for search bar");
		}
	};

	useEffect(() => {
		setMounted(true);
		fetchSearchData();

		window.addEventListener("userStateChanged", fetchSearchData);
		window.addEventListener("jobsUpdated", fetchSearchData);

		setIsOnline(navigator.onLine);
		const handleStatus = () => setIsOnline(navigator.onLine);
		window.addEventListener("online", handleStatus);
		window.addEventListener("offline", handleStatus);

		const handleClickOutside = (event: MouseEvent) => {
			if (
				notifRef.current &&
				!notifRef.current.contains(event.target as Node)
			) {
				setShowNotifs(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			window.removeEventListener("userStateChanged", fetchSearchData);
			window.removeEventListener("jobsUpdated", fetchSearchData);
			window.removeEventListener("online", handleStatus);
			window.removeEventListener("offline", handleStatus);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleNotificationClick = () => setShowNotifs(!showNotifs);
	const handleMarkAsRead = (e: React.MouseEvent) => {
		e.stopPropagation();
		setHasNotifications(false);
		setNotifications([]);
	};
	const handleHelpClick = () => {
		setHelpView("menu");
		setShowHelp(true);
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setSearchQuery(val);

		if (val.trim().length > 0) {
			setIsSearchActive(true);

			if (isUserLoggedIn) {
				const lowerVal = val.toLowerCase();
				const filtered = allJobs
					.filter(
						(j) =>
							j.role.toLowerCase().includes(lowerVal) ||
							j.company.toLowerCase().includes(lowerVal),
					)
					.slice(0, 4);
				setSearchResults(filtered);
			}
		} else {
			setIsSearchActive(false);
			setSearchResults([]);
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
		setIsSearchActive(false);
		setSearchResults([]);
	};
	const handleViewAll = () => {
		clearSearch();
		router.push("/matches");
	};
	const handleResultClick = () => {
		clearSearch();
		router.push("/matches");
	};
	return (
		<header
			className="global-topbar"
			style={{
				width: "100%",
				position: "sticky",
				top: 0,
				zIndex: 40,
			}}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        .hamburger-btn { display: none; }
        .hide-desktop { display: none; }
        
        @media (max-width: 768px) {
          .hamburger-btn { display: flex !important; margin-right: 12px; }
          .hide-desktop { display: flex !important; }
          .hide-mobile { display: none !important; }
          
          .topbar-content { padding: 0 1rem !important; height: 70px !important; }
          .search-wrapper { max-width: 180px !important; }
          .pane { padding: 1.25rem !important; }
          .page-title { font-size: 24px !important; }
          
          .mobile-stack { flex-direction: column !important; gap: 1.5rem !important; }
          .mobile-stack > div { width: 100% !important; min-width: 100% !important; max-width: 100% !important; flex: none !important; }
          .mobile-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
      `,
				}}
			/>

			{/* 🚀 THE MAGIC SEAMLESS GLASS FADE 🚀 */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height:
						"120px" /* Drops lower than the 80px nav to create a smooth fade zone */,
					background:
						"linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)",
					backdropFilter: "blur(24px)",
					WebkitBackdropFilter: "blur(24px)",
					maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, black 55%, transparent 100%)",
					zIndex: -1,
					pointerEvents: "none",
				}}
			/>

			{/* 🚀 CONTENT WRAPPER 🚀 */}
			<div
				className="topbar-content"
				style={{
					height: "80px",
					padding: "0 2.5rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						width: "100%",
						maxWidth: "420px",
					}}
				>
					<button
						className="hamburger-btn"
						onClick={() => window.dispatchEvent(new Event("toggleMobileMenu"))}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#0f172a",
							padding: "0",
						}}
					>
						<svg
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
						>
							<line x1="3" y1="12" x2="21" y2="12" />
							<line x1="3" y1="6" x2="21" y2="6" />
							<line x1="3" y1="18" x2="21" y2="18" />
						</svg>
					</button>

					<div
						className="search-wrapper"
						style={{ position: "relative", width: "100%" }}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#64748b"
							strokeWidth="2"
							style={{
								position: "absolute",
								left: "16px",
								top: "50%",
								transform: "translateY(-50%)",
								zIndex: 2,
							}}
						>
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
						<input
							type="text"
							placeholder="Search matches or logs..."
							value={searchQuery}
							onChange={handleSearchChange}
							style={{
								width: "100%",
								background: "rgba(255,255,255,0.6)",
								border: "1px solid rgba(255,255,255,0.8)",
								borderRadius: "30px",
								padding: "10px 40px 10px 44px",
								fontSize: "14px",
								color: "#0f172a",
								outline: "none",
								transition: "all 0.2s",
								position: "relative",
								zIndex: 1,
								boxShadow: "0 8px 20px rgba(0,0,0,0.03)",
							}}
							onFocus={(e) => {
								e.target.style.background = "rgba(255,255,255,0.9)";
								e.target.style.borderColor = "rgba(255,255,255,1)";
								if (searchQuery.trim().length > 0) setIsSearchActive(true);
							}}
							onBlur={(e) => {
								e.target.style.background = "rgba(255,255,255,0.6)";
								e.target.style.borderColor = "rgba(255,255,255,0.8)";
								setTimeout(() => setIsSearchActive(false), 200);
							}}
						/>
						{searchQuery && (
							<button
								onClick={clearSearch}
								style={{
									position: "absolute",
									right: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									background: "none",
									border: "none",
									color: "#94a3b8",
									cursor: "pointer",
									zIndex: 2,
									padding: "4px",
								}}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						)}

						{isSearchActive && (
							<div
								style={{
									position: "absolute",
									top: "50px",
									left: 0,
									width: "100%",
									background: "white",
									borderRadius: "12px",
									border: "1px solid #e2e8f0",
									overflow: "hidden",
									boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
									zIndex: 50,
								}}
							>
								<div
									style={{
										padding: "8px 16px",
										background: "#f8fafc",
										fontSize: "11px",
										fontWeight: 800,
										color: "#94a3b8",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									Quick Results for "{searchQuery}"
								</div>

								{!isUserLoggedIn ? (
									<div
										style={{
											padding: "24px 16px",
											textAlign: "center",
											color: "#64748b",
											fontSize: "13px",
										}}
									>
										<div style={{ marginBottom: "8px" }}>
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												style={{ margin: "0 auto", opacity: 0.5 }}
											>
												<rect
													x="3"
													y="11"
													width="18"
													height="11"
													rx="2"
													ry="2"
												></rect>
												<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
											</svg>
										</div>
										Please log in to search your matches.
									</div>
								) : searchResults.length > 0 ? (
									searchResults.map((job) => (
										<div
											key={job.id}
											onClick={handleResultClick}
											onMouseEnter={(e) =>
												(e.currentTarget.style.background = "#f8fafc")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.background = "white")
											}
											style={{
												padding: "12px 16px",
												borderBottom: "1px solid #f1f5f9",
												cursor: "pointer",
												transition: "background 0.2s",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "flex-start",
													gap: "12px",
												}}
											>
												<span
													style={{
														background:
															job.tier === 1
																? "#dcfce7"
																: job.tier === 2
																	? "#e0f2fe"
																	: "#f1f5f9",
														color:
															job.tier === 1
																? "#15803d"
																: job.tier === 2
																	? "#0369a1"
																	: "#64748b",
														fontSize: "9px",
														padding: "3px 6px",
														borderRadius: "4px",
														fontWeight: 800,
														marginTop: "2px",
														flexShrink: 0,
													}}
												>
													TIER {job.tier}
												</span>
												<div>
													<div
														style={{
															fontSize: "13px",
															fontWeight: 800,
															color: "#0f172a",
															marginBottom: "2px",
														}}
													>
														{job.role}
													</div>
													<div style={{ fontSize: "11px", color: "#64748b" }}>
														{job.company} • {job.loc}
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<div
										style={{
											padding: "24px 16px",
											textAlign: "center",
											color: "#64748b",
											fontSize: "13px",
										}}
									>
										No jobs found matching "{searchQuery}"
									</div>
								)}

								{isUserLoggedIn && (
									<div
										style={{
											padding: "8px",
											background: "#f8fafc",
											textAlign: "center",
											borderTop: "1px solid #e2e8f0",
										}}
									>
										<button
											onClick={handleViewAll}
											style={{
												background: "none",
												border: "none",
												color: "#0058bc",
												fontSize: "12px",
												fontWeight: 700,
												cursor: "pointer",
											}}
										>
											View all results →
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
					<div
						className="hide-mobile"
						style={{
							background: isOnline
								? "rgba(236, 253, 245, 0.8)"
								: "rgba(254, 242, 242, 0.8)",
							color: isOnline ? "#15803d" : "#991b1b",
							padding: "8px 16px",
							borderRadius: "30px",
							fontSize: "12px",
							fontWeight: 800,
							display: "flex",
							alignItems: "center",
							gap: "8px",
							border: `1px solid ${isOnline ? "#a7f3d0" : "#fca5a5"}`,
						}}
					>
						<span
							style={{
								width: "8px",
								height: "8px",
								borderRadius: "50%",
								background: isOnline ? "#22c55e" : "#ef4444",
							}}
						></span>
						{isOnline ? "SYSTEM READY" : "OFFLINE"}
					</div>

					<div style={{ position: "relative" }} ref={notifRef}>
						<button
							onClick={handleNotificationClick}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								padding: "4px",
							}}
						>
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#475569"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
								<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
							</svg>
							{hasNotifications && (
								<span
									style={{
										position: "absolute",
										top: "2px",
										right: "4px",
										width: "10px",
										height: "10px",
										background: "#ef4444",
										borderRadius: "50%",
										border: "2px solid white",
									}}
								></span>
							)}
						</button>

						{showNotifs && (
							<div
								style={{
									position: "absolute",
									top: "45px",
									right: "-10px",
									width: "340px",
									maxWidth: "85vw",
									background: "white",
									borderRadius: "12px",
									border: "1px solid #e2e8f0",
									boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
									zIndex: 100,
									overflow: "hidden",
									maxHeight: "400px",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<div
									style={{
										padding: "12px 16px",
										background: "#f8fafc",
										borderBottom: "1px solid #e2e8f0",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<span
										style={{
											fontSize: "13px",
											fontWeight: 800,
											color: "#0f172a",
										}}
									>
										Notifications
									</span>
									{hasNotifications && (
										<button
											onClick={handleMarkAsRead}
											style={{
												background: "none",
												border: "none",
												color: "#0058bc",
												fontSize: "11px",
												fontWeight: 700,
												cursor: "pointer",
											}}
										>
											Mark as read
										</button>
									)}
								</div>
								<div style={{ overflowY: "auto" }}>
									{hasNotifications && notifications.length > 0 ? (
										notifications.map((notif) => (
											<div
												key={notif.id}
												onClick={handleResultClick}
												style={{
													padding: "16px",
													display: "flex",
													gap: "12px",
													background: "#eff6ff",
													borderLeft: "4px solid #0058bc",
													borderBottom: "1px solid #e2e8f0",
													cursor: "pointer",
												}}
											>
												<div
													style={{
														width: "8px",
														height: "8px",
														borderRadius: "50%",
														background: "#0058bc",
														marginTop: "6px",
														flexShrink: 0,
													}}
												></div>
												<div>
													<p
														style={{
															margin: 0,
															fontSize: "13px",
															fontWeight: 800,
															color: "#0f172a",
														}}
													>
														{notif.title}
													</p>
													<p
														style={{
															margin: "4px 0 0 0",
															fontSize: "13px",
															color: "#475569",
															lineHeight: "1.4",
														}}
													>
														{notif.body}
													</p>
													<p
														style={{
															margin: "8px 0 0 0",
															fontSize: "11px",
															color: "#94a3b8",
															fontWeight: 600,
														}}
													>
														{notif.time}
													</p>
												</div>
											</div>
										))
									) : (
										<div style={{ padding: "32px 16px", textAlign: "center" }}>
											<p
												style={{
													margin: 0,
													fontSize: "13px",
													color: "#64748b",
													fontWeight: 600,
												}}
											>
												You're all caught up!
											</p>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<button
						onClick={handleHelpClick}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							padding: "4px",
						}}
					>
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#475569"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
							<line x1="12" y1="17" x2="12.01" y2="17"></line>
						</svg>
					</button>
				</div>
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes fadeInOverlay { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      `,
				}}
			/>

			{mounted &&
				showHelp &&
				createPortal(
					<div
						onClick={() => setShowHelp(false)}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.2)",
							backdropFilter: "blur(32px)",
							WebkitBackdropFilter: "blur(32px)",
							zIndex: 99999,
							animation: "fadeInOverlay 0.2s ease-out forwards",
						}}
					>
						<div
							onClick={(e) => e.stopPropagation()}
							style={{
								position: "absolute",
								top: "85px",
								right: "2.5rem",
								background: "rgba(255, 255, 255, 0.98)",
								width: "400px",
								maxWidth: "90vw",
								borderRadius: "20px",
								overflow: "hidden",
								boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)",
								border: "1px solid rgba(255,255,255,0.8)",
								display: "flex",
								flexDirection: "column",
								animation: "popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
								transformOrigin: "top right",
							}}
						>
							<div
								style={{
									padding: "1.5rem 2rem",
									borderBottom: "1px solid #f1f5f9",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "12px" }}
								>
									{helpView !== "menu" && (
										<button
											onClick={() => setHelpView("menu")}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												padding: 0,
												color: "#64748b",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
											>
												<polyline points="15 18 9 12 15 6" />
											</svg>
										</button>
									)}
									<div>
										<h3
											style={{
												margin: 0,
												fontSize: "18px",
												fontWeight: 800,
												color: "#0f172a",
												letterSpacing: "-0.5px",
											}}
										>
											{helpView === "menu"
												? "Help & Support"
												: helpView === "docs"
													? "Documentation"
													: "API Setup"}
										</h3>
										{helpView === "menu" && (
											<p
												style={{
													margin: "2px 0 0 0",
													fontSize: "13px",
													color: "#64748b",
													fontWeight: 500,
												}}
											>
												System resources and guides.
											</p>
										)}
									</div>
								</div>
								<button
									onClick={() => setShowHelp(false)}
									style={{
										background: "#f1f5f9",
										border: "none",
										width: "32px",
										height: "32px",
										borderRadius: "50%",
										cursor: "pointer",
										color: "#64748b",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										transition: "background 0.2s",
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = "#e2e8f0")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = "#f1f5f9")
									}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>

							<div
								style={{
									padding: "2rem",
									overflowY: "auto",
									maxHeight: "60vh",
								}}
							>
								{helpView === "menu" && (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "12px",
										}}
									>
										<button
											onClick={() => setHelpView("docs")}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												width: "100%",
												background: "white",
												border: "1px solid #e2e8f0",
												padding: "16px",
												borderRadius: "16px",
												cursor: "pointer",
												transition: "all 0.2s",
												boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.borderColor = "#bae6fd";
												e.currentTarget.style.boxShadow =
													"0 4px 12px rgba(0,0,0,0.05)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.borderColor = "#e2e8f0";
												e.currentTarget.style.boxShadow =
													"0 2px 4px rgba(0,0,0,0.02)";
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "16px",
												}}
											>
												<div
													style={{
														background: "#f0f9ff",
														width: "40px",
														height: "40px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "#0ea5e9",
													}}
												>
													<svg
														width="20"
														height="20"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
													>
														<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
													</svg>
												</div>
												<div style={{ textAlign: "left" }}>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 800,
															color: "#0f172a",
														}}
													>
														Documentation
													</div>
													<div
														style={{
															fontSize: "12px",
															color: "#64748b",
															marginTop: "2px",
														}}
													>
														Matching algorithms & tiers.
													</div>
												</div>
											</div>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#cbd5e1"
												strokeWidth="2"
											>
												<polyline points="9 18 15 12 9 6" />
											</svg>
										</button>

										<button
											onClick={() => setHelpView("api")}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												width: "100%",
												background: "white",
												border: "1px solid #e2e8f0",
												padding: "16px",
												borderRadius: "16px",
												cursor: "pointer",
												transition: "all 0.2s",
												boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.borderColor = "#bae6fd";
												e.currentTarget.style.boxShadow =
													"0 4px 12px rgba(0,0,0,0.05)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.borderColor = "#e2e8f0";
												e.currentTarget.style.boxShadow =
													"0 2px 4px rgba(0,0,0,0.02)";
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "16px",
												}}
											>
												<div
													style={{
														background: "#f0fdf4",
														width: "40px",
														height: "40px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "#22c55e",
													}}
												>
													<svg
														width="20"
														height="20"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
													>
														<polyline points="16 18 22 12 16 6" />
														<polyline points="8 6 2 12 8 18" />
													</svg>
												</div>
												<div style={{ textAlign: "left" }}>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 800,
															color: "#0f172a",
														}}
													>
														API Integrations
													</div>
													<div
														style={{
															fontSize: "12px",
															color: "#64748b",
															marginTop: "2px",
														}}
													>
														Connect your external keys.
													</div>
												</div>
											</div>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#cbd5e1"
												strokeWidth="2"
											>
												<polyline points="9 18 15 12 9 6" />
											</svg>
										</button>
									</div>
								)}
								{helpView === "docs" && (
									<div
										style={{
											fontSize: "14px",
											color: "#475569",
											lineHeight: "1.6",
										}}
									>
										<p style={{ marginTop: 0 }}>
											The BenchScout algorithm ranks job postings dynamically
											based on your configured keywords, location proximity, and
											minimum score threshold.
										</p>
										<div
											style={{
												marginTop: "1.5rem",
												background: "#f8fafc",
												padding: "16px",
												borderRadius: "12px",
												borderLeft: "4px solid #15803d",
											}}
										>
											<div
												style={{
													fontWeight: 800,
													color: "#15803d",
													marginBottom: "4px",
												}}
											>
												Tier 1 (88-100%)
											</div>
											High priority matches. These jobs contain nearly all your
											desired keywords and are within your primary location hub.
										</div>
										<div
											style={{
												marginTop: "1rem",
												background: "#f8fafc",
												padding: "16px",
												borderRadius: "12px",
												borderLeft: "4px solid #0284c7",
											}}
										>
											<div
												style={{
													fontWeight: 800,
													color: "#0284c7",
													marginBottom: "4px",
												}}
											>
												Tier 2 (70-87%)
											</div>
											Strong fits. These positions match the core criteria but
											may be in adjacent locations or missing secondary
											keywords.
										</div>
										<div
											style={{
												marginTop: "1rem",
												background: "#f8fafc",
												padding: "16px",
												borderRadius: "12px",
												borderLeft: "4px solid #94a3b8",
											}}
										>
											<div
												style={{
													fontWeight: 800,
													color: "#64748b",
													marginBottom: "4px",
												}}
											>
												Tier 3 (&lt;70%)
											</div>
											Potential opportunities. These fall below your standard
											threshold but are preserved in the system for manual
											review.
										</div>
									</div>
								)}
								{helpView === "api" && (
									<div
										style={{
											fontSize: "14px",
											color: "#475569",
											lineHeight: "1.6",
										}}
									>
										<p style={{ marginTop: 0 }}>
											To enable automated background scraping and email
											delivery, you must configure your keys in the System
											Settings page.
										</p>
										<h4
											style={{
												color: "#0f172a",
												fontSize: "15px",
												fontWeight: 800,
												marginTop: "1.5rem",
												marginBottom: "8px",
											}}
										>
											1. Anthropic API Key
										</h4>
										<p style={{ margin: 0 }}>
											Required for the AI to parse unstructured job descriptions
											into structured data. Generate this key from your{" "}
											<a
												href="https://console.anthropic.com/"
												target="_blank"
												rel="noopener noreferrer"
												style={{
													color: "#0058bc",
													textDecoration: "none",
													fontWeight: 600,
												}}
											>
												Anthropic Developer Console
											</a>
											.
										</p>
										<h4
											style={{
												color: "#0f172a",
												fontSize: "15px",
												fontWeight: 800,
												marginTop: "1.5rem",
												marginBottom: "8px",
											}}
										>
											2. Gmail App Password
										</h4>
										<p style={{ margin: 0 }}>
											Required for the system to dispatch the Automated Job
											Digest to your inbox. Regular passwords will not work.
										</p>
										<ol
											style={{
												paddingLeft: "1.25rem",
												marginTop: "8px",
												marginBottom: 0,
											}}
										>
											<li>Go to your Google Account Settings.</li>
											<li>Navigate to Security &gt; 2-Step Verification.</li>
											<li>Scroll down to "App Passwords".</li>
											<li>
												Generate a new 16-digit code and paste it into the
												Settings page.
											</li>
										</ol>
									</div>
								)}
							</div>

							{helpView === "menu" && (
								<div
									style={{
										padding: "1.5rem 2rem",
										background: "#f8fafc",
										borderTop: "1px solid #f1f5f9",
										textAlign: "center",
									}}
								>
									<a
										href="mailto:support@benchscout.com?subject=BenchScout%20Support%20Request"
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "8px",
											width: "100%",
											background: "#0058bc",
											color: "white",
											padding: "14px",
											borderRadius: "12px",
											fontSize: "14px",
											fontWeight: 800,
											textDecoration: "none",
											transition: "background 0.2s",
											boxShadow: "0 4px 14px 0 rgba(0, 88, 188, 0.39)",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "#004a9f")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "#0058bc")
										}
									>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
										>
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
											<polyline points="22,6 12,13 2,6"></polyline>
										</svg>
										Contact Technical Support
									</a>
								</div>
							)}
						</div>
					</div>,
					document.body,
				)}
		</header>
	);
}