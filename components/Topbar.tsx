"use client";
import { notificationTarget } from "@/lib/notification-target";
import { startTransition } from "react";
import { useMounted } from "@/lib/use-mounted";
import type { ClientJob, ClientNotification, NotificationView } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { HOME_MENU_ON_DEMAND } from "@/lib/home-navigation";
import { createPortal } from "react-dom";

export default function Topbar() {
	const router = useRouter();
	const pathname = usePathname();
	const isHomeNavigation = HOME_MENU_ON_DEMAND && pathname === "/home";
	const [menuOpen, setMenuOpen] = useState(false);
	useEffect(() => {
		const update = (event: Event) => setMenuOpen(Boolean((event as CustomEvent<boolean>).detail));
		window.addEventListener("navigationMenuChanged", update);
		return () => window.removeEventListener("navigationMenuChanged", update);
	}, []);
	const notifRef = useRef<HTMLDivElement>(null);

	const mounted = useMounted();
	const [isOnline, setIsOnline] = useState(true);
	const [hasNotifications, setHasNotifications] = useState(false);
	const [showNotifs, setShowNotifs] = useState(false);
 const [notificationError, setNotificationError] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchActive, setIsSearchActive] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [helpView, setHelpView] = useState<"menu" | "docs" | "api">("menu");

	const [allJobs, setAllJobs] = useState<ClientJob[]>([]);
	const [searchResults, setSearchResults] = useState<ClientJob[]>([]);
	const [notifications, setNotifications] = useState<NotificationView[]>([]);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

	// 🚀 Fetch real notifications from the database
	const fetchSearchAndNotifData = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setIsUserLoggedIn(false);
			setAllJobs([]);
			setNotifications([]);
			setHasNotifications(false);
			return;
		}

		setIsUserLoggedIn(true);

		// 1. Fetch Search Bar Jobs
		try {
			const res = await fetch("/api/jobs");
			const data = await res.json();
			if (Array.isArray(data)) {
				setAllJobs(data);
			}
		} catch {
			console.error("Failed to fetch jobs for search bar");
		}

		// 2. Fetch LIVE Employer Notifications
		try {
			const notifRes = await fetch(`/api/notifications?email=${encodeURIComponent(activeEmail)}`);
			if (notifRes.ok) {
				const notifData = await notifRes.json();
				if (notifData.success && notifData.notifications.length > 0) {
					// Map database notifications to UI format
					const mappedNotifs = notifData.notifications.map((n: ClientNotification) => {
						const dateObj = new Date(n.createdAt);
						const timeString = dateObj.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						});

						return {
							id: n.id,
							title: n.title,
							body: n.message,
							time: `${dateObj.toLocaleDateString()} @ ${timeString}`,
							isRead: n.isRead,
						};
					});

					setNotifications(mappedNotifs);

					// Check if any are unread to trigger the red badge
					const hasUnread = mappedNotifs.some((n: NotificationView) => !n.isRead);
					setHasNotifications(hasUnread);
				} else {
					setNotifications([]);
					setHasNotifications(false);
				}
			}
		} catch {
			console.error("Failed to fetch notifications");
		}
	};

	useEffect(() => {
		startTransition(() => { fetchSearchAndNotifData(); });

		window.addEventListener("userStateChanged", fetchSearchAndNotifData);
		window.addEventListener("jobsUpdated", fetchSearchAndNotifData);
		window.addEventListener("refreshNotifications", fetchSearchAndNotifData);

		startTransition(() => { setIsOnline(navigator.onLine); });
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
			window.removeEventListener("userStateChanged", fetchSearchAndNotifData);
			window.removeEventListener("jobsUpdated", fetchSearchAndNotifData);
			window.removeEventListener(
				"refreshNotifications",
				fetchSearchAndNotifData,
			);
			window.removeEventListener("online", handleStatus);
			window.removeEventListener("offline", handleStatus);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleNotificationClick = () => setShowNotifs(!showNotifs);

	const handleMarkAsRead = async (e: React.MouseEvent) => {
		e.stopPropagation();
        setNotificationError("");
        try {
            const response = await fetch("/api/notifications/mark-read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
            if (!response.ok) throw new Error();
            setHasNotifications(false);
            setNotifications(previous => previous.map(notification => ({ ...notification, isRead: true })));
        } catch { setNotificationError("Couldn’t mark notifications as read. Please retry."); }
    };

    const openNotification = (notification: NotificationView) => {
        clearSearch();
        setShowNotifs(false);
        router.push(notificationTarget(notification, allJobs));
        void fetch("/api/notifications/mark-read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: notification.id }) })
            .then(response => { if (response.ok) window.dispatchEvent(new Event("refreshNotifications")); })
            .catch(() => { setNotificationError("Couldn’t mark the notification as read. Please retry."); });
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
		setShowNotifs(false);
		router.push("/matches");
	};

	const handleResultClick = () => {
		clearSearch();
		setShowNotifs(false); // 🚀 Ensure dropdown closes when clicking a notification
		router.push("/matches");
	};

	return (
		<header
			className={`global-topbar ${isHomeNavigation ? "home-topbar" : ""}`}
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
        .home-topbar .hamburger-btn { display: flex !important; align-items: center; gap: 6px; min-height: 40px; padding: 6px 10px !important; margin-right: 14px; border: 1px solid #dce6ee !important; border-radius: 10px; background: rgba(255,255,255,.8) !important; font: inherit; font-size: 13px; font-weight: 600; flex-shrink: 0; }
        .home-topbar .hamburger-btn svg { width: 20px; height: 20px; }
        .home-topbar-brand { display: flex; align-items: center; gap: 8px; margin-right: clamp(32px, 5vw, 72px); color: #0B2444; font-family: 'Fraunces', serif; font-size: 28px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .home-topbar-brand span span { color: #1A8C7A; }
        .home-topbar .search-wrapper { flex: 1; min-width: 0; max-width: 420px; }
        .hide-desktop { display: none; }
        
        @media (max-width: 900px) {
          .home-topbar-brand { display: none; }
          .home-topbar .search-wrapper { max-width: 180px !important; }
          .hamburger-btn { display: flex !important; margin-right: 12px; }
          .hide-desktop { display: flex !important; }
          .hide-mobile { display: none !important; }
          
          .topbar-content { padding: 0 1rem !important; height: 70px !important; }
          .topbar-content { display: grid !important; grid-template-columns: 84px minmax(0, 1fr) 84px; align-items: center; }
          .topbar-left { display: contents !important; }
          .topbar-content .hamburger-btn { grid-column: 1; grid-row: 1; justify-self: start; margin-right: 0 !important; }
          .topbar-content .search-wrapper { grid-column: 2; grid-row: 1; justify-self: center; width: 100% !important; min-width: 0; }
          .topbar-actions { grid-column: 3; grid-row: 1; justify-self: end; }
          .search-wrapper input { padding-right: 12px !important; }
          .search-wrapper:has(button[aria-label="Clear search"]) input { padding-right: 36px !important; }
          .search-wrapper { max-width: 180px !important; }
          .pane { padding: 1.25rem !important; }
          .page-title { font-size: 24px !important; }
          
          .mobile-stack { flex-direction: column !important; gap: 1.5rem !important; }
          .mobile-stack > div { width: 100% !important; min-width: 100% !important; max-width: 100% !important; flex: none !important; }
          .mobile-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
        }
        @media (max-width: 600px) {
          .home-topbar .hamburger-btn { padding: 8px !important; gap: 6px; margin-right: 10px; min-height: 44px; }
          .home-topbar .hamburger-btn svg { width: 20px; height: 20px; }
          .home-topbar .search-wrapper input { padding-right: 12px !important; }
          .home-topbar .search-wrapper:has(button[aria-label="Clear search"]) input { padding-right: 36px !important; }
        }
        @media (max-width: 360px) {
          .global-topbar .search-wrapper > svg { left: 12px !important; }
          .global-topbar .search-wrapper input { padding-left: 38px !important; padding-right: 8px !important; }
          .global-topbar .search-wrapper:has(button[aria-label="Clear search"]) input { padding-right: 36px !important; }
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
				<div className="topbar-left"
					style={{
						display: "flex",
						alignItems: "center",
						width: "100%",
						maxWidth: isHomeNavigation ? "900px" : "420px",
						minWidth: 0,
					}}
				>
					<button
						className="hamburger-btn"
                        aria-label="Toggle navigation menu"
						aria-expanded={menuOpen}
						aria-controls="app-navigation"
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
						{isHomeNavigation && <span>Menu</span>}
					</button>
					{isHomeNavigation && <div className="home-topbar-brand"><Image src="/icon.svg" alt="" width={30} height={40} /><span>Bench<span>Scout</span></span></div>}

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
							placeholder="Search"
                            aria-label="Search your matches"
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
								aria-label="Clear search"
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
								className="search-results-panel"
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
									className="search-results-heading"
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
									Quick Results for &quot;{searchQuery}&quot;
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
											className="search-result"
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
												className="search-result-row"
												style={{
													display: "flex",
													alignItems: "flex-start",
													gap: "12px",
												}}
											>
												<span
													className="search-result-tier"
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
												<div className="search-result-details">
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
										No jobs found matching &quot;{searchQuery}&quot;
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
												color: "#1A8C7A", // 🚀 BRANDED LINK
												fontSize: "12px",
												fontWeight: 800,
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

				<div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
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
							aria-label="Notifications"
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
							<div className="notification-panel"
								style={{
									position: "absolute",
									top: "45px",
									right: "-10px",
									width: "340px",
									maxWidth: "85vw",
									background: "white",
									borderRadius: "16px",
									border: "1px solid rgba(0,0,0,0.1)",
									boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
									zIndex: 100,
									overflow: "hidden",
									maxHeight: "400px",
									display: "flex",
									flexDirection: "column",
									animation: "popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
								}}
							>
								<div
									style={{
										padding: "16px 20px",
										background: "#f8fafc",
										borderBottom: "1px solid #e2e8f0",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<span
										style={{
											fontSize: "14px",
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
												color: "#1A8C7A",
												fontSize: "11px",
												fontWeight: 800,
												cursor: "pointer",
												textDecoration: "underline",
											}}
										>
											Mark all as read
										</button>
									)}
								</div>
								<div style={{ overflowY: "auto" }}>
                                    {notificationError && <p role="alert" style={{padding:"8px 20px",fontSize:12,color:"#b91c1c"}}>{notificationError}</p>}
									{/* 🚀 FIXED: Only map out UNREAD notifications dynamically */}
									{notifications.filter((n) => !n.isRead).length > 0 ? (
										notifications
											.filter((n) => !n.isRead)
											.map((notif) => (
												<button
													key={notif.id}
													type="button"
                                                    onClick={() => openNotification(notif)}
													style={{
														padding: "16px 20px",
                                                    width: "100%", border: "none", textAlign: "left", font: "inherit",
														display: "flex",
														gap: "12px",
														background: "#f0fdf4",
														borderLeft: "4px solid #1A8C7A",
														borderBottom: "1px solid #e2e8f0",
														cursor: "pointer",
														transition: "background 0.2s",
													}}
												>
													<div
														style={{
															width: "8px",
															height: "8px",
															borderRadius: "50%",
															background: "#1A8C7A",
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
												</button>
											))
									) : (
										<div style={{ padding: "40px 20px", textAlign: "center" }}>
											<svg
												width="32"
												height="32"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#cbd5e1"
												strokeWidth="1.5"
												style={{ margin: "0 auto 12px auto" }}
											>
												<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
												<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
											</svg>
											<p
												style={{
													margin: 0,
													fontSize: "13px",
													color: "#64748b",
													fontWeight: 600,
												}}
											>
												You&apos;re all caught up!
											</p>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<button
						aria-label="Help"
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
							height: "100dvh",
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
								right: "1rem",
								background: "rgba(255, 255, 255, 0.98)",
								width: "400px",
								maxWidth: "calc(100vw - 2rem)",
                                maxHeight: "calc(100dvh - 100px)",
								borderRadius: "20px",
								overflowY: "auto",
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
									aria-label="Close help"
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
												e.currentTarget.style.borderColor = "#1A8C7A";
												e.currentTarget.style.boxShadow =
													"0 4px 12px rgba(26,140,122,0.05)";
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
														background: "#e6fcf5",
														width: "40px",
														height: "40px",
														borderRadius: "10px",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "#1A8C7A",
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
												e.currentTarget.style.borderColor = "#1A8C7A";
												e.currentTarget.style.boxShadow =
													"0 4px 12px rgba(26,140,122,0.05)";
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
														Service availability
													</div>
													<div
														style={{
															fontSize: "12px",
															color: "#64748b",
															marginTop: "2px",
														}}
													>
														Uploads, scanning, and email.
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
                                    <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                                      <p>Scanning, AI tools, private document uploads, and email delivery are managed by BenchScout. You do not need to enter your own API keys or email password.</p>
                                      <p>If a service is unavailable, the app shows an explanation. Your saved profile and applications remain available.</p>
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
											background: "#0B2444",
											color: "white",
											padding: "14px",
											borderRadius: "12px",
											fontSize: "14px",
											fontWeight: 800,
											textDecoration: "none",
											transition: "background 0.2s",
											boxShadow: "0 4px 14px 0 rgba(11, 36, 68, 0.3)",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "#05162a")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "#0B2444")
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
