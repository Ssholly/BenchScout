"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import ProfileComplianceOverlay from "../components/ProfileComplianceOverlay";

export default function Sidebar() {
	const pathname = usePathname();

	const [user, setUser] = useState<{
		name: string;
		email: string;
		initials: string;
		formattedName: string;
	} | null>(null);
	const [jobCount, setJobCount] = useState(0);
	const [appliedCount, setAppliedCount] = useState(0);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [isSchedulerActive, setIsSchedulerActive] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	const [isScanning, setIsScanning] = useState(false);
	const [isComplianceOpen, setIsComplianceOpen] = useState(false);

	const fetchActiveUser = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (activeEmail) {
			try {
				const res = await fetch(`/api/user?email=${activeEmail}`);
				const data = await res.json();
				if (data.success && data.user) {
					const parts = data.user.name.trim().split(" ");
					const initials =
						parts.length > 1
							? parts[0].charAt(0) + parts[1].charAt(0)
							: parts[0].charAt(0);
					let formattedName = data.user.name;
					if (parts.length >= 3)
						formattedName = `${parts[0]} ${parts[1].charAt(0)}. ${parts[parts.length - 1]}`;
					else if (parts.length === 2)
						formattedName = `${parts[0]} ${parts[1]}`;
					setUser({
						name: data.user.name,
						email: data.user.email,
						initials: initials.toUpperCase(),
						formattedName,
					});

					setAvatar(
						data.user.avatarUrl ||
							localStorage.getItem(`labpro_avatar_${data.user.email}`),
					);
				}
			} catch (error) {}
		} else {
			setUser(null);
			setAvatar(null);
		}
	};

	const fetchDynamicStats = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		const schedActive =
			localStorage.getItem("labpro_scheduler_active") === "true";
		setIsSchedulerActive(!!activeEmail && schedActive);

		if (!activeEmail) {
			setJobCount(0);
			setAppliedCount(0);
			return;
		}

		try {
			const res = await fetch(`/api/jobs?email=${activeEmail}`);
			const data = await res.json();

			if (Array.isArray(data)) {
				const myJobs = data.filter(
					(j: any) =>
						j.targetEmail === activeEmail ||
						j.userEmail === activeEmail ||
						j.email === activeEmail ||
						(!j.targetEmail && !j.userEmail && !j.email),
				);

				const activeJobs = myJobs.filter((j: any) => j.status !== "cleared");

				setJobCount(activeJobs.filter((j: any) => j.applied !== true).length);
				setAppliedCount(myJobs.filter((j: any) => j.applied === true).length);
			} else {
				setJobCount(0);
				setAppliedCount(0);
			}
		} catch (e) {}
	};

	useEffect(() => {
		setMounted(true);
		fetchActiveUser();
		fetchDynamicStats();

		window.addEventListener("userStateChanged", () => {
			fetchActiveUser();
			fetchDynamicStats();
		});
		window.addEventListener("jobsUpdated", fetchDynamicStats);
		window.addEventListener("schedulerUpdated", fetchDynamicStats);

		const toggleMenu = () => setIsMobileOpen((prev) => !prev);
		window.addEventListener("toggleMobileMenu", toggleMenu);

		return () => {
			window.removeEventListener("userStateChanged", fetchActiveUser);
			window.removeEventListener("jobsUpdated", fetchDynamicStats);
			window.removeEventListener("schedulerUpdated", fetchDynamicStats);
			window.removeEventListener("toggleMobileMenu", toggleMenu);
		};
	}, []);

	useEffect(() => {
		setIsMobileOpen(false);
		const mainContentArea = document.querySelector("main");
		if (mainContentArea) {
			mainContentArea.scrollTop = 0;
		}
	}, [pathname]);

	const handleQuickScan = async () => {
		if (!user) {
			window.dispatchEvent(new Event("openProfileModal"));
			return;
		}

		setIsScanning(true);

		try {
			const targetLocation =
				localStorage.getItem("labpro_dashboard_temp_location") || "All Nigeria";
			const includeTier3 = localStorage.getItem("labpro_tier3") === "true";
			const autoSend = localStorage.getItem("labpro_auto") !== "false";

			const response = await fetch("/api/scrape", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					targetEmail: user.email,
					targetLocation: targetLocation,
					includeTier3,
					autoSend,
					strict_mls: true,
				}),
			});

			if (response.ok) {
				const timeNow = new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
				localStorage.setItem("labpro_last_run", timeNow);
				window.dispatchEvent(new Event("jobsUpdated"));
			}
		} catch (error) {
			console.error("Quick scan failed", error);
		} finally {
			setIsScanning(false);
		}
	};

	const menuItems = [
		{
			name: "Home",
			path: "/home",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
			),
		},
		{
			name: "Dashboard",
			path: "/",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="3" width="7" height="7"></rect>
					<rect x="14" y="3" width="7" height="7"></rect>
					<rect x="14" y="14" width="7" height="7"></rect>
					<rect x="3" y="14" width="7" height="7"></rect>
				</svg>
			),
		},
		{
			name: "Job Matches",
			path: "/matches",
			badge: jobCount > 0 ? jobCount.toString() : null,
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
					<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
				</svg>
			),
		},
		{
			name: "Applied",
			path: "/applied",
			badge: appliedCount > 0 ? appliedCount.toString() : null,
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="21 8 21 21 3 21 3 8"></polyline>
					<rect x="1" y="3" width="22" height="5"></rect>
					<line x1="10" y1="12" x2="14" y2="12"></line>
				</svg>
			),
		},
		{
			name: "News & Insights",
			path: "/news",
			badge: "NEW",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M19 21V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11l5 4Z"></path>
					<path d="M10 9h4"></path>
					<path d="M10 13h4"></path>
				</svg>
			),
		},
		{
			name: "Salary Intelligence",
			path: "/salary",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="12" y1="1" x2="12" y2="23"></line>
					<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
				</svg>
			),
		},
		{
			name: "Scheduler",
			path: "/scheduler",
			badge: isSchedulerActive ? "ON" : null,
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
				</svg>
			),
		},
		{
			name: "History",
			path: "/history",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
				</svg>
			),
		},
		{
			name: "Settings",
			path: "/settings",
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="3"></circle>
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
				</svg>
			),
		},
	];

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
          .sidebar-wrapper { width: 260px; height: 100vh; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 9999; position: relative; } 
          .mobile-close-btn { display: none !important; } 
          
          /* 🚀 REFINED DYNAMIC LOGO BRAND ANIMATIONS */
          @keyframes radarPulse { 
            0%, 100% { opacity: 1; transform: scale(1); } 
            50% { opacity: 0.5; transform: scale(1.45); } 
          } 
          @keyframes shinePulse { 
            0%, 100% { opacity: 0.3; transform: scale(0.8); } 
            50% { opacity: 1; transform: scale(1.2); } 
          } 
          @keyframes taglineRipple {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.8); opacity: 0; }
          }

          .animated-specimen { transform-origin: 26px 22px; animation: radarPulse 2s ease-in-out infinite; }
          .animated-lens-shine { transform-origin: 21.5px 17.5px; animation: shinePulse 2s ease-in-out infinite; }
          
          .tagline-status-dot { position: relative; width: 5px; height: 5px; border-radius: 50%; background: #22B89F; box-shadow: 0 0 6px #22B89F; display: block; flex-shrink: 0; }
          .tagline-status-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: transparent; border: 1.5px solid #22B89F; animation: taglineRipple 2s ease-out infinite; }

          @keyframes spin { 100% { transform: rotate(360deg); } } 
          @media (max-width: 768px) { .mobile-close-btn { display: flex !important; margin-left: auto; } .sidebar-wrapper { position: fixed; top: 0; left: 0; transform: translateX(-100%); background: rgba(255, 255, 255, 0.95) !important; boxShadow: 20px 0 50px rgba(0,0,0,0.1); } .sidebar-wrapper.mobile-open { transform: translateX(0); } }
          
          .premium-btn {
            position: relative;
            overflow: hidden;
            background: linear-gradient(270deg, #0B2444, #1A8C7A, #22B89F, #0B2444);
            background-size: 300% 300%;
            animation: gradientShift 6s ease infinite;
            border: none;
            color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(26, 140, 122, 0.3);
          }
          .premium-btn:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 8px 25px rgba(26, 140, 122, 0.5);
          }
          .premium-btn::after {
            content: "";
            position: absolute;
            top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-20deg);
            animation: premiumShine 3s infinite;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes premiumShine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
          }
          `,
				}}
			/>
			{mounted &&
				isMobileOpen &&
				createPortal(
					<div
						onClick={() => setIsMobileOpen(false)}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.5)",
							backdropFilter: "blur(4px)",
							zIndex: 9998,
						}}
					/>,
					document.body,
				)}
			<div
				className={`sidebar-wrapper ${isMobileOpen ? "mobile-open" : ""}`}
				style={{
					background: "transparent",
					borderRight: "none",
					display: "flex",
					flexDirection: "column",
					boxShadow: "none",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						height: "120px",
						background:
							"linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)",
						backdropFilter: "blur(24px)",
						WebkitBackdropFilter: "blur(24px)",
						maskImage:
							"linear-gradient(to bottom, black 55%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to bottom, black 55%, transparent 100%)",
						zIndex: -1,
						pointerEvents: "none",
					}}
				/>

				<div
					style={{
						height: "110px",
						padding: "0 1rem",
						display: "flex",
						alignItems: "flex-start",
						paddingTop: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "flex-start",
							gap: "6px",
							width: "100%",
						}}
					>
						{/* 🔬 UP-SCALED MICROSCOPE MARK */}
						<div
							style={{
								width: "48px",
								height: "48px",
								flexShrink: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginLeft: "-4px",
								marginTop: "2px",
							}}
						>
							<svg
								width="100%"
								height="100%"
								viewBox="0 0 56 56"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle
									cx="26"
									cy="22"
									r="13.5"
									stroke="#0B2444"
									strokeWidth="2.5"
								/>
								<path
									d="M34.5 13.5 A13.5 13.5 0 0 1 39 22"
									stroke="#1A8C7A"
									strokeWidth="2.5"
									strokeLinecap="round"
								/>
								<circle
									cx="26"
									cy="22"
									r="3.5"
									fill="#1A8C7A"
									className="animated-specimen"
								/>
								<circle
									cx="21.5"
									cy="17.5"
									r="1.5"
									fill="#22B89F"
									opacity="0.5"
									className="animated-lens-shine"
								/>
								<line
									x1="26"
									y1="35.5"
									x2="26"
									y2="43"
									stroke="#0B2444"
									strokeWidth="2.5"
									strokeLinecap="round"
								/>
								<line
									x1="17"
									y1="43"
									x2="35"
									y2="43"
									stroke="#0B2444"
									strokeWidth="2.5"
									strokeLinecap="round"
								/>
								<line
									x1="18.5"
									y1="43"
									x2="18.5"
									y2="47"
									stroke="#0B2444"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<line
									x1="33.5"
									y1="43"
									x2="33.5"
									y2="47"
									stroke="#0B2444"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</div>

						{/* 🏷️ MASTER BRAND TYPOGRAPHY BLOCK */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-start",
								lineHeight: 1,
							}}
						>
							<div
								style={{
									fontFamily: "'Fraunces', serif",
									fontSize: "32px",
									fontWeight: 600,
									letterSpacing: "-0.03em",
									color: "#0B2444",
									lineHeight: "1",
								}}
							>
								Bench<span style={{ color: "#1A8C7A" }}>Scout</span>
							</div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									marginTop: "6px",
									whiteSpace: "nowrap",
								}}
							>
								<span
									style={{
										fontFamily: "'DM Sans', sans-serif",
										fontSize: "9px",
										fontWeight: 600,
										letterSpacing: "0.22em",
										textTransform: "uppercase",
										color: "#4A6080",
										whiteSpace: "nowrap",
									}}
								>
									Your MLS Career Hub
								</span>
								<span className="tagline-status-dot"></span>
							</div>
						</div>

						<button
							onClick={() => setIsMobileOpen(false)}
							className="mobile-close-btn"
							style={{
								background: "transparent",
								border: "none",
								width: "32px",
								height: "32px",
								borderRadius: "50%",
								alignItems: "center",
								justifyContent: "center",
								color: "#64748b",
								padding: 0,
								marginTop: "4px",
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
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				</div>

				<nav style={{ flex: 1, padding: "0 1rem", overflowY: "auto" }}>
					{menuItems.map((item) => {
						const isActive = pathname === item.path;
						return (
							<Link
								key={item.name}
								href={item.path}
								style={{ textDecoration: "none" }}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										padding: "12px 16px",
										marginBottom: "8px",
										borderRadius: "12px",
										background: isActive
											? "rgba(255, 255, 255, 0.6)"
											: "transparent",
										border: isActive
											? "1px solid rgba(255,255,255,0.8)"
											: "1px solid transparent",
										boxShadow: isActive
											? "0 4px 12px rgba(0,0,0,0.03)"
											: "none",
										color: isActive ? "#0B2444" : "#4A6080",
										fontWeight: isActive ? 800 : 600,
										transition: "all 0.2s",
									}}
								>
									<span
										style={{
											marginRight: "12px",
											display: "flex",
											color: isActive ? "#1A8C7A" : "inherit",
										}}
									>
										{item.icon}
									</span>
									<span style={{ flex: 1 }}>{item.name}</span>
									{item.badge && (
										<span
											style={{
												background: isActive
													? "rgba(255,255,255,0.9)"
													: item.badge === "NEW"
														? "rgba(34, 184, 159, 0.15)"
														: "rgba(241, 245, 249, 0.8)",
												padding: "2px 8px",
												borderRadius: "12px",
												fontSize: "11px",
												fontWeight: 800,
												color: isActive
													? "#1A8C7A"
													: item.badge === "NEW"
														? "#1A8C7A"
														: "#94a3b8",
											}}
										>
											{item.badge}
										</span>
									)}
								</div>
							</Link>
						);
					})}
				</nav>

				<div
					style={{
						padding: "1.5rem",
						display: "flex",
						flexDirection: "column",
						gap: "0.75rem",
					}}
				>
					{/* 🚀 QUICK SCAN BUTTON: Slimmed width down to 80%, centered, and pushed upwards */}
					<button
						onClick={handleQuickScan}
						disabled={isScanning || !user}
						style={{
							width: "80%",
							alignSelf: "center",
							background: isScanning
								? "rgba(26, 140, 122, 0.1)"
								: "rgba(26, 140, 122, 0.05)",
							color: "#1A8C7A",
							border: "1px solid rgba(26, 140, 122, 0.15)",
							padding: "7px 10px",
							borderRadius: "8px",
							fontWeight: 700,
							fontSize: "12px",
							cursor: isScanning || !user ? "not-allowed" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "6px",
							transition: "all 0.2s",
							opacity: user ? 1 : 0.5,
							marginBottom:
								"16px" /* Increased padding shield to clear click triggers */,
						}}
					>
						{isScanning ? (
							<>
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									style={{ animation: "spin 1s linear infinite" }}
								>
									<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
								</svg>
								Scanning...
							</>
						) : (
							<>
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
								>
									<path d="M21 2v6h-6"></path>
									<path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
									<path d="M3 22v-6h6"></path>
									<path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
								</svg>
								Quick Scan
							</>
						)}
					</button>

					<div
						onClick={() => {
							if (user) {
								setIsComplianceOpen(true);
							} else {
								window.dispatchEvent(new Event("openProfileModal"));
							}
						}}
						style={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							transition: "transform 0.2s",
							marginTop: "4px",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform = "translateX(4px)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "translateX(0)")
						}
					>
						<div
							style={{
								width: "40px",
								height: "40px",
								borderRadius: "50%",
								background: "#0B2444",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: 800,
								fontSize: "14px",
								marginRight: "12px",
								overflow: "hidden",
								flexShrink: 0,
								boxShadow: "0 4px 10px rgba(11, 36, 68, 0.2)",
							}}
						>
							{avatar ? (
								<img
									src={avatar}
									alt="Profile"
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							) : user ? (
								user.initials
							) : (
								"?"
							)}
						</div>
						<div style={{ overflow: "hidden" }}>
							<h4
								style={{
									margin: 0,
									fontSize: "14px",
									color: "#0f172a",
									fontWeight: 800,
									whiteSpace: "nowrap",
									textOverflow: "ellipsis",
								}}
							>
								{user ? user.formattedName : "Guest User"}
							</h4>
							<p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
								{user ? "MLS • MLSCN Registered" : "Please log in"}
							</p>
						</div>
					</div>

					<button
						className="premium-btn"
						onClick={() => {
							window.dispatchEvent(new Event("openProfileModal"));
						}}
						style={{
							width: "100%",
							padding: "12px",
							borderRadius: "12px",
							fontWeight: 800,
							fontSize: "14px",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
						{user ? "View Profile" : "Login / Register"}
					</button>
				</div>
			</div>

			<ProfileComplianceOverlay
				isOpen={isComplianceOpen}
				onClose={() => setIsComplianceOpen(false)}
			/>
		</>
	);
}
