"use client";
import { useState, useEffect } from "react";

export default function NewsInsightsPage() {
	const [filter, setFilter] = useState("All");
	const [newsData, setNewsData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

	const [stats, setStats] = useState({
		avgSalary: "₦350k",
		topLocations: [
			{ name: "FCT - Abuja", count: 42, color: "#0058bc" },
			{ name: "Lagos State", count: 35, color: "#0ea5e9" },
			{ name: "Port Harcourt", count: 18, color: "#8b5cf6" },
			{ name: "Kano", count: 12, color: "#14b8a6" },
		],
		topSkills: [
			{ name: "Hematology", percent: 85, color: "#15803d" },
			{ name: "Microbiology", percent: 72, color: "#0284c7" },
			{ name: "Phlebotomy", percent: 64, color: "#8b5cf6" },
			{ name: "Quality Assurance", percent: 45, color: "#f59e0b" },
		],
		maxLocCount: 42,
	});

	const categories = [
		"All",
		"Regulation",
		"Public Health",
		"Industry Expansion",
		"Clinical Research",
	];

	// Utility to convert string dates to timestamps for sorting
	const parseDate = (dateStr: string) => {
		const parsed = new Date(dateStr);
		return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
	};

	useEffect(() => {
		const fetchLiveNews = async (showLoadingAnimation = true) => {
			if (showLoadingAnimation) setIsLoading(true);
			try {
				const res = await fetch("/api/news");
				const data = await res.json();
				if (Array.isArray(data)) {
					// SORT BY RECENCY: Newest first
					const sortedNews = data.sort(
						(a, b) => parseDate(b.date) - parseDate(a.date),
					);
					setNewsData(sortedNews);
				}
			} catch (error) {
			} finally {
				if (showLoadingAnimation) setIsLoading(false);
			}
		};

		const fetchLiveAnalytics = async () => {
			try {
				const res = await fetch("/api/jobs");
				const jobs = await res.json();

				if (Array.isArray(jobs) && jobs.length > 0) {
					const totalJobs = jobs.length;
					const t1Jobs = jobs.filter(
						(j) =>
							j.tier === 1 &&
							j.salary &&
							j.salary.toLowerCase() !== "competitive",
					);
					let totalSal = 0,
						salCount = 0;

					t1Jobs.forEach((j) => {
						const nums = j.salary.match(/\d+/g);
						if (nums && nums.length > 0) {
							const avg =
								nums.reduce((a: number, b: string) => a + parseInt(b), 0) /
								nums.length;
							const val = avg < 1000 ? avg * 1000 : avg;
							totalSal += val;
							salCount++;
						}
					});
					const avgSalary =
						salCount > 0
							? `₦${Math.round(totalSal / salCount / 1000)}k`
							: stats.avgSalary;

					const locCounts: Record<string, number> = {};
					jobs.forEach((j) => {
						if (j.loc) {
							let loc = j.loc.split(",")[0].trim();
							if (loc.toLowerCase().includes("abuja")) {
								loc = "FCT - Abuja";
							}
							locCounts[loc] = (locCounts[loc] || 0) + 1;
						}
					});
					const sortedLocs = Object.entries(locCounts)
						.sort((a, b) => b[1] - a[1])
						.slice(0, 4);
					const locColors = ["#0058bc", "#0ea5e9", "#8b5cf6", "#14b8a6"];
					const liveLocations = sortedLocs.map((loc, i) => ({
						name: loc[0],
						count: loc[1],
						color: locColors[i] || "#94a3b8",
					}));

					const skillCounts: Record<string, number> = {};
					jobs.forEach((j) => {
						if (j.skills) {
							j.skills.split(",").forEach((s: string) => {
								const sk = s.trim();
								if (sk) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
							});
						}
					});
					const sortedSkills = Object.entries(skillCounts)
						.sort((a, b) => b[1] - a[1])
						.slice(0, 4);
					const skillColors = ["#15803d", "#0284c7", "#8b5cf6", "#f59e0b"];
					const liveSkills = sortedSkills.map((sk, i) => ({
						name: sk[0],
						percent: Math.round((sk[1] / totalJobs) * 100),
						color: skillColors[i] || "#64748b",
					}));

					setStats((prev) => ({
						avgSalary: avgSalary,
						topLocations:
							liveLocations.length > 0 ? liveLocations : prev.topLocations,
						topSkills: liveSkills.length > 0 ? liveSkills : prev.topSkills,
						maxLocCount:
							liveLocations.length > 0
								? Math.max(...liveLocations.map((l) => l.count))
								: prev.maxLocCount,
					}));
				}
			} catch (e) {}
		};

		const loadPage = () => {
			const activeEmail = localStorage.getItem("labpro_active_user");
			if (!activeEmail) {
				setIsUserLoggedIn(false);
				setIsLoading(false);
				return;
			}
			setIsUserLoggedIn(true);
			fetchLiveNews(true);
			fetchLiveAnalytics();
		};

		loadPage();
		window.addEventListener("userStateChanged", loadPage);

		// AUTO REFRESH LOOP: Updates every 1 minute (60000ms) silently
		const intervalId = setInterval(() => {
			if (localStorage.getItem("labpro_active_user")) {
				fetchLiveNews(false);
				fetchLiveAnalytics();
			}
		}, 60000);

		return () => {
			clearInterval(intervalId);
			window.removeEventListener("userStateChanged", loadPage);
		};
	}, []);

	// LIMIT TO 24 ARTICLES MAX
	const filteredNews =
		filter === "All"
			? newsData.slice(0, 24)
			: newsData.filter((news) => news.category === filter).slice(0, 24);

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "Regulation":
				return { bg: "#fef3c7", text: "#d97706", solid: "#d97706" };
			case "Public Health":
				return { bg: "#e0e7ff", text: "#4f46e5", solid: "#4f46e5" };
			case "Industry Expansion":
				return { bg: "#dcfce7", text: "#15803d", solid: "#15803d" };
			case "Clinical Research":
				return { bg: "#f3e8ff", text: "#7e22ce", solid: "#7e22ce" };
			default:
				return { bg: "#0058bc", text: "#ffffff", solid: "#0058bc" };
		}
	};

	return (
		<section className="pane active" style={{ paddingBottom: "4rem" }}>
			<div
				style={{
					marginBottom: "2.5rem",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
				}}
			>
				<div>
					<div
						className="page-title"
						style={{
							fontSize: "28px",
							fontWeight: 900,
							color: "#0f172a",
							display: "flex",
							alignItems: "center",
							gap: "12px",
						}}
					>
						Market Intelligence & News
						{!isLoading && isUserLoggedIn && (
							<span
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									background: "#fef2f2",
									color: "#ef4444",
									padding: "4px 10px",
									borderRadius: "20px",
									fontSize: "11px",
									fontWeight: 800,
									textTransform: "uppercase",
									letterSpacing: "1px",
									boxShadow: "0 2px 8px rgba(239, 68, 68, 0.15)",
								}}
							>
								<span
									style={{
										width: "6px",
										height: "6px",
										borderRadius: "50%",
										background: "#ef4444",
										display: "inline-block",
										animation: "pulse 1.5s infinite ease-in-out",
									}}
								></span>{" "}
								Live Feed
							</span>
						)}
					</div>
					<div
						className="page-sub"
						style={{ color: "#64748b", marginTop: "4px" }}
					>
						Real-time analytics and updates from the Nigerian Medical Laboratory
						sector.
					</div>
				</div>
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
						Intelligence Locked
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
						Log in or create an account to unlock real-time salary benchmarks,
						hiring volume telemetry, and industry news.
					</p>
					<button
						onClick={() => window.dispatchEvent(new Event("openProfileModal"))}
						style={{
							background: "#0058bc",
							color: "white",
							border: "none",
							padding: "12px 24px",
							borderRadius: "8px",
							fontWeight: 700,
							cursor: "pointer",
							boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
						}}
					>
						Log In to Access
					</button>
				</div>
			) : (
				<>
					<div
						className="mobile-stack"
						style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}
					>
						<div
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(16px)",
								borderRadius: "20px",
								border: "1px solid rgba(255,255,255,0.9)",
								padding: "1.75rem",
								boxShadow: "0 10px 30px -10px rgba(0,88,188,0.1)",
								transition: "transform 0.3s ease",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "translateY(-4px)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "translateY(0)")
							}
						>
							<h3
								style={{
									fontSize: "12px",
									fontWeight: 800,
									color: "#94a3b8",
									textTransform: "uppercase",
									letterSpacing: "1px",
									margin: "0 0 16px 0",
								}}
							>
								Avg. Tier 1 Base Salary
							</h3>
							<div
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: "12px",
									marginBottom: "16px",
								}}
							>
								<span
									style={{
										fontSize: "32px",
										fontWeight: 900,
										color: "#0f172a",
										letterSpacing: "-1px",
									}}
								>
									{stats.avgSalary}
								</span>
								<span
									style={{
										fontSize: "13px",
										fontWeight: 800,
										color: "#15803d",
										display: "flex",
										alignItems: "center",
										gap: "4px",
										background: "#dcfce7",
										padding: "4px 10px",
										borderRadius: "20px",
									}}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
									>
										<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
										<polyline points="17 6 23 6 23 12"></polyline>
									</svg>
									Live
								</span>
							</div>
							<p
								style={{
									fontSize: "12px",
									color: "#64748b",
									margin: 0,
									lineHeight: "1.5",
									fontWeight: 500,
								}}
							>
								Calculated dynamically from successfully parsed Tier 1 match
								compensations.
							</p>
						</div>

						<div
							style={{
								flex: 1.5,
								background: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(16px)",
								borderRadius: "20px",
								border: "1px solid rgba(255,255,255,0.9)",
								padding: "1.75rem",
								boxShadow: "0 10px 30px -10px rgba(14,165,233,0.1)",
								transition: "transform 0.3s ease",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "translateY(-4px)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "translateY(0)")
							}
						>
							<h3
								style={{
									fontSize: "12px",
									fontWeight: 800,
									color: "#94a3b8",
									textTransform: "uppercase",
									letterSpacing: "1px",
									margin: "0 0 16px 0",
								}}
							>
								Hiring Volume by Hub
							</h3>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}
							>
								{stats.topLocations.map((loc) => (
									<div
										key={loc.name}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
										}}
									>
										<div
											style={{
												width: "100px",
												fontSize: "12px",
												fontWeight: 700,
												color: "#334155",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{loc.name}
										</div>
										<div
											style={{
												flex: 1,
												background: "#f1f5f9",
												height: "8px",
												borderRadius: "4px",
												overflow: "hidden",
											}}
										>
											<div
												style={{
													height: "100%",
													width: `${(loc.count / stats.maxLocCount) * 100}%`,
													background: `linear-gradient(90deg, ${loc.color}aa 0%, ${loc.color} 100%)`,
													borderRadius: "4px",
													transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
													position: "relative",
												}}
											>
												<div
													style={{
														position: "absolute",
														right: 0,
														top: 0,
														bottom: 0,
														width: "10px",
														background: "rgba(255,255,255,0.3)",
														filter: "blur(2px)",
													}}
												></div>
											</div>
										</div>
										<div
											style={{
												width: "24px",
												textAlign: "right",
												fontSize: "12px",
												fontWeight: 900,
												color: "#0f172a",
											}}
										>
											{loc.count}
										</div>
									</div>
								))}
							</div>
						</div>

						<div
							style={{
								flex: 1.5,
								background: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(16px)",
								borderRadius: "20px",
								border: "1px solid rgba(255,255,255,0.9)",
								padding: "1.75rem",
								boxShadow: "0 10px 30px -10px rgba(139,92,246,0.1)",
								transition: "transform 0.3s ease",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "translateY(-4px)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "translateY(0)")
							}
						>
							<h3
								style={{
									fontSize: "12px",
									fontWeight: 800,
									color: "#94a3b8",
									textTransform: "uppercase",
									letterSpacing: "1px",
									margin: "0 0 16px 0",
								}}
							>
								In-Demand Keywords
							</h3>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}
							>
								{stats.topSkills.map((skill) => (
									<div
										key={skill.name}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
										}}
									>
										<div
											style={{
												width: "110px",
												fontSize: "12px",
												fontWeight: 700,
												color: "#334155",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{skill.name}
										</div>
										<div
											style={{
												flex: 1,
												background: "#f1f5f9",
												height: "8px",
												borderRadius: "4px",
												overflow: "hidden",
											}}
										>
											<div
												style={{
													height: "100%",
													width: `${skill.percent}%`,
													background: `linear-gradient(90deg, ${skill.color}aa 0%, ${skill.color} 100%)`,
													borderRadius: "4px",
													transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
													position: "relative",
												}}
											>
												<div
													style={{
														position: "absolute",
														right: 0,
														top: 0,
														bottom: 0,
														width: "10px",
														background: "rgba(255,255,255,0.3)",
														filter: "blur(2px)",
													}}
												></div>
											</div>
										</div>
										<div
											style={{
												width: "36px",
												textAlign: "right",
												fontSize: "12px",
												fontWeight: 900,
												color: "#0f172a",
											}}
										>
											{skill.percent}%
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* 🚀 THE FIX: Floating, sticky, centered navigation pill */}
					<div
						style={{
							position: "sticky",
							top: "16px",
							zIndex: 100,
							display: "flex",
							justifyContent: "center",
							marginBottom: "2rem",
							pointerEvents: "none",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: "12px",
								overflowX: "auto",
								padding: "10px 16px",
								msOverflowStyle: "none",
								scrollbarWidth: "none",
								background: "rgba(255, 255, 255, 0.8)",
								backdropFilter: "blur(20px)",
								WebkitBackdropFilter: "blur(20px)",
								borderRadius: "100px",
								boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08)",
								border: "1px solid rgba(255, 255, 255, 0.9)",
								pointerEvents: "auto",
								maxWidth: "100%",
							}}
						>
							{categories.map((cat) => {
								const isActive = filter === cat;
								const catColors = getCategoryColor(cat);
								return (
									<button
										key={cat}
										onClick={() => setFilter(cat)}
										disabled={isLoading}
										style={{
											background: isActive ? catColors.solid : "transparent",
											color: isActive ? "white" : "#475569",
											border: "none",
											padding: "8px 20px",
											borderRadius: "30px",
											fontSize: "13px",
											fontWeight: 700,
											cursor: isLoading ? "wait" : "pointer",
											transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
											whiteSpace: "nowrap",
											opacity: isLoading ? 0.5 : 1,
											boxShadow: isActive
												? `0 6px 20px ${catColors.solid}50`
												: "none",
										}}
										onMouseEnter={(e) => {
											if (!isActive && !isLoading) {
												e.currentTarget.style.color = catColors.solid;
												e.currentTarget.style.background = "rgba(0,0,0,0.03)";
											}
										}}
										onMouseLeave={(e) => {
											if (!isActive && !isLoading) {
												e.currentTarget.style.color = "#475569";
												e.currentTarget.style.background = "transparent";
											}
										}}
									>
										{cat}
									</button>
								);
							})}
						</div>
					</div>

					<style
						dangerouslySetInnerHTML={{
							__html: ` 
              @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } } 
              @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } } 
              .skeleton { background: #f1f5f9; background-image: linear-gradient(90deg, #f1f5f9 0px, #e2e8f0 40px, #f1f5f9 80px); background-size: 1000px 100%; animation: shimmer 2s infinite linear; border-radius: 6px; } 
              .article-card:hover .read-more { color: #0ea5e9 !important; padding-right: 4px; }
              /* Hide scrollbar for the floating nav pill */
              ::-webkit-scrollbar { display: none; }
              `,
						}}
					/>

					<div
						className="mobile-grid"
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
							gap: "1.5rem",
						}}
					>
						{isLoading ? (
							Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									style={{
										background: "rgba(255,255,255,0.7)",
										borderRadius: "20px",
										border: "1px solid rgba(255,255,255,0.4)",
										padding: "1.5rem",
										height: "240px",
										display: "flex",
										flexDirection: "column",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											marginBottom: "1.25rem",
										}}
									>
										<div
											className="skeleton"
											style={{
												width: "100px",
												height: "22px",
												borderRadius: "8px",
											}}
										></div>
										<div
											className="skeleton"
											style={{ width: "70px", height: "14px" }}
										></div>
									</div>
									<div
										className="skeleton"
										style={{
											width: "100%",
											height: "22px",
											marginBottom: "10px",
										}}
									></div>
									<div
										className="skeleton"
										style={{
											width: "80%",
											height: "22px",
											marginBottom: "1.5rem",
										}}
									></div>
									<div
										className="skeleton"
										style={{
											width: "100%",
											height: "14px",
											marginBottom: "8px",
										}}
									></div>
									<div
										className="skeleton"
										style={{ width: "90%", height: "14px" }}
									></div>
									<div
										style={{
											marginTop: "auto",
											paddingTop: "1.25rem",
											borderTop: "1px solid rgba(0,0,0,0.04)",
											display: "flex",
											justifyContent: "space-between",
										}}
									>
										<div
											className="skeleton"
											style={{ width: "120px", height: "14px" }}
										></div>
										<div
											className="skeleton"
											style={{ width: "60px", height: "14px" }}
										></div>
									</div>
								</div>
							))
						) : filteredNews.length === 0 ? (
							<div
								style={{
									gridColumn: "1 / -1",
									padding: "6rem",
									textAlign: "center",
									color: "#64748b",
									background: "rgba(255,255,255,0.5)",
									backdropFilter: "blur(16px)",
									borderRadius: "24px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
								}}
							>
								<div style={{ fontSize: "48px", marginBottom: "1rem" }}>📰</div>
								<h3
									style={{
										margin: "0 0 8px 0",
										color: "#0f172a",
										fontSize: "18px",
										fontWeight: 800,
									}}
								>
									No articles found
								</h3>
								<p style={{ margin: 0, fontSize: "14px" }}>
									We couldn't find any recent news in this category.
								</p>
							</div>
						) : (
							filteredNews.map((article: any) => {
								const catStyle = getCategoryColor(article.category);
								return (
									<div
										key={article.id}
										className="article-card"
										style={{
											background: "rgba(255,255,255,0.85)",
											backdropFilter: "blur(12px)",
											borderRadius: "20px",
											border: "1px solid rgba(255,255,255,0.9)",
											padding: "1.5rem",
											display: "flex",
											flexDirection: "column",
											boxShadow: "0 4px 15px -3px rgba(0, 0, 0, 0.04)",
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											cursor: "pointer",
											position: "relative",
											overflow: "hidden",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translateY(-6px)";
											e.currentTarget.style.boxShadow =
												"0 20px 40px -8px rgba(0, 88, 188, 0.12)";
											e.currentTarget.style.borderColor =
												"rgba(0, 88, 188, 0.1)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translateY(0)";
											e.currentTarget.style.boxShadow =
												"0 4px 15px -3px rgba(0, 0, 0, 0.04)";
											e.currentTarget.style.borderColor =
												"rgba(255,255,255,0.9)";
										}}
										onClick={() => window.open(article.url, "_blank")}
									>
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "4px",
												background: catStyle.solid,
												opacity: 0.8,
											}}
										/>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "1.25rem",
											}}
										>
											<span
												style={{
													background: catStyle.bg,
													color: catStyle.text,
													fontSize: "10px",
													fontWeight: 800,
													padding: "4px 10px",
													borderRadius: "8px",
													textTransform: "uppercase",
													letterSpacing: "0.5px",
												}}
											>
												{article.category}
											</span>
											<span
												style={{
													fontSize: "12px",
													color: "#94a3b8",
													fontWeight: 700,
												}}
											>
												{article.date}
											</span>
										</div>
										<h3
											style={{
												fontSize: "16px",
												fontWeight: 800,
												color: "#0f172a",
												margin: "0 0 10px 0",
												lineHeight: "1.4",
												letterSpacing: "-0.2px",
											}}
										>
											{article.title}
										</h3>
										<p
											style={{
												fontSize: "13px",
												color: "#475569",
												margin: "0 0 1.5rem 0",
												lineHeight: "1.6",
												flex: 1,
												overflow: "hidden",
												textOverflow: "ellipsis",
												display: "-webkit-box",
												WebkitLineClamp: "3",
												WebkitBoxOrient: "vertical",
											}}
										>
											{article.excerpt}
										</p>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginTop: "auto",
												paddingTop: "1.25rem",
												borderTop: "1px solid #f1f5f9",
											}}
										>
											<span
												style={{
													fontSize: "12px",
													fontWeight: 800,
													color: "#94a3b8",
												}}
											>
												Source:{" "}
												<span style={{ color: "#0f172a" }}>
													{article.source}
												</span>
											</span>
											<span
												className="read-more"
												style={{
													color: "#0058bc",
													fontSize: "13px",
													fontWeight: 800,
													display: "flex",
													alignItems: "center",
													gap: "4px",
													transition: "all 0.2s",
												}}
											>
												Read{" "}
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="3"
												>
													<line x1="5" y1="12" x2="19" y2="12"></line>
													<polyline points="12 5 19 12 12 19"></polyline>
												</svg>
											</span>
										</div>
									</div>
								);
							})
						)}
					</div>
				</>
			)}
		</section>
	);
}
