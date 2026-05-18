"use client";
import { useState, useEffect } from "react";
import DashboardAnalytics from "@/components/DashboardAnalytics";

const NIGERIA_STATES = [
	"All Nigeria",
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"FCT - Abuja",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
];

export default function Dashboard() {
	const [isScraping, setIsScraping] = useState(false);
	const [progress, setProgress] = useState(0);
	const [email, setEmail] = useState("");
	const [location, setLocation] = useState("All Nigeria");
	const [dbMinScore, setDbMinScore] = useState(75);
	const [userKeywords, setUserKeywords] = useState("");

	const [includeTier3, setIncludeTier3] = useState(true);
	const [autoSend, setAutoSend] = useState(true);

	const [totalJobs, setTotalJobs] = useState(0);
	const [tier1Count, setTier1Count] = useState(0);
	const [tier2Count, setTier2Count] = useState(0);

	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);
	const [lastRun, setLastRun] = useState("Never");
	const [logs, setLogs] = useState([
		{ time: "--:--:--", level: "IDLE", msg: "System awaiting next command..." },
	]);

	const addLog = (level: string, msg: string) => {
		setLogs((prev) => [
			...prev,
			{
				time: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
				level,
				msg,
			},
		]);
	};

	const refreshJobStats = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setTotalJobs(0);
			setTier1Count(0);
			setTier2Count(0);
			return;
		}

		try {
			const res = await fetch(`/api/jobs?email=${activeEmail}`);
			const data = await res.json();
			if (Array.isArray(data)) {
				// 🚀 THE FIX: We must explicitly ignore jobs that have been "cleared" by the user!
				const activeJobs = data.filter(
					(j: any) =>
						j.status !== "cleared" &&
						j.applied !== true &&
						(j.targetEmail === activeEmail ||
							j.userEmail === activeEmail ||
							j.email === activeEmail ||
							(!j.targetEmail && !j.userEmail && !j.email)),
				);

				setTotalJobs(activeJobs.length);
				setTier1Count(activeJobs.filter((j: any) => j.tier === 1).length);
				setTier2Count(activeJobs.filter((j: any) => j.tier === 2).length);
			}
		} catch (e) {}
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const activeEmail = localStorage.getItem("labpro_active_user");

			if (!activeEmail) {
				setEmail("");
				setTotalJobs(0);
				setTier1Count(0);
				setTier2Count(0);
				setLastRun("—");
				setLogs([
					{
						time: "--:--:--",
						level: "AUTH",
						msg: "Please log in to load dashboard metrics.",
					},
				]);
				return;
			}

			try {
				const res = await fetch(`/api/user?email=${activeEmail}`);
				const data = await res.json();
				if (data.success && data.user) {
					setEmail(data.user.email);
					setDbMinScore(data.user.minScore || 75);
					setUserKeywords(data.user.keywords || "Medical Laboratory Scientist");

					const dashboardFilter = localStorage.getItem(
						"labpro_dashboard_temp_location",
					);
					setLocation(dashboardFilter || data.user.location || "All Nigeria");
				}
			} catch (error) {}
		};

		refreshJobStats();
		fetchUserData();

		const savedLastRun = localStorage.getItem("labpro_last_run");
		const activeUser = localStorage.getItem("labpro_active_user");
		if (savedLastRun && activeUser) setLastRun(savedLastRun);

		const savedT3 = localStorage.getItem("labpro_tier3");
		if (savedT3) setIncludeTier3(savedT3 === "true");

		const savedAuto = localStorage.getItem("labpro_auto");
		if (savedAuto) setAutoSend(savedAuto === "true");

		window.addEventListener("userStateChanged", () => {
			fetchUserData();
			refreshJobStats();
		});
		window.addEventListener("jobsUpdated", refreshJobStats);

		return () => {
			window.removeEventListener("userStateChanged", fetchUserData);
			window.removeEventListener("jobsUpdated", refreshJobStats);
		};
	}, []);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
		setEmail(e.target.value);
	const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setLocation(e.target.value);
		localStorage.setItem("labpro_dashboard_temp_location", e.target.value);
	};

	const toggleTier3 = () => {
		const newVal = !includeTier3;
		setIncludeTier3(newVal);
		localStorage.setItem("labpro_tier3", newVal.toString());
	};
	const toggleAutoSend = () => {
		const newVal = !autoSend;
		setAutoSend(newVal);
		localStorage.setItem("labpro_auto", newVal.toString());
	};

	const showNotification = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	const runScraper = async () => {
		if (!email) {
			showNotification("Please log in to run the scanner.", "error");
			return;
		}

		setIsScraping(true);
		setProgress(15);
		setLogs([]);
		addLog("INIT", `Clearing previous matches...`);
		addLog(
			"INIT",
			`Aggressive scan for ${location} targeting: ${userKeywords}`,
		);

		let currentProgress = 15;
		const progressInterval = setInterval(() => {
			currentProgress += 5;
			if (currentProgress <= 90) setProgress(currentProgress);
			if (currentProgress === 30)
				addLog("INFO", "Authenticating job boards...");
			if (currentProgress === 50)
				addLog("INFO", "Parsing cross-platform data...");
			if (currentProgress === 75)
				addLog("INFO", `Filtering out matches below ${dbMinScore}%...`);
		}, 1000);

		try {
			const response = await fetch("/api/scrape", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					targetEmail: email,
					targetLocation: location,
					includeTier3,
					autoSend,
					minScore: dbMinScore,
					keywords: userKeywords,
					strict_mls: true,
				}),
			});
			const data = await response.json();
			if (data.success) {
				setProgress(100);
				addLog("DONE", data.message);
				showNotification(data.message);
				const timeNow = new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				});
				setLastRun(timeNow);
				localStorage.setItem("labpro_last_run", timeNow);

				await refreshJobStats();
				window.dispatchEvent(new Event("jobsUpdated"));
			} else {
				throw new Error(data.error);
			}
		} catch (error: any) {
			setProgress(0);
			addLog("ERROR", error.message || "Scan failed.");
			showNotification(error.message || "Scan failed.", "error");
		} finally {
			clearInterval(progressInterval);
			setTimeout(() => setIsScraping(false), 2000);
		}
	};

	const getAiRecommendation = () => {
		if (!email)
			return "Log in to unlock AI-driven market recommendations for your region.";
		if (location.includes("Abuja"))
			return 'Abuja matches are up 24%. Consider adding "Molecular Biology" to keywords.';
		if (location.includes("Lagos"))
			return "Lagos is seeing a 15% spike in rapid-response lab roles.";
		if (location === "All Nigeria")
			return "Nationwide scan active. Maximizing match volume across all hubs.";
		return `Opportunities in ${location} are stable. We recommend running a scan early Monday mornings.`;
	};

	const iosSwitchStyle = (active: boolean) => ({
		width: "32px",
		height: "18px",
		background: active ? "#0058bc" : "#cbd5e1",
		borderRadius: "20px",
		position: "relative" as "relative",
		cursor: "pointer",
		transition: "all 0.2s ease",
		display: "inline-block",
		verticalAlign: "middle",
	});
	const iosKnobStyle = (active: boolean) => ({
		width: "14px",
		height: "14px",
		background: "white",
		borderRadius: "50%",
		position: "absolute" as "absolute",
		top: "2px",
		left: active ? "16px" : "2px",
		transition: "all 0.2s ease",
		boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
	});

	return (
		<div
			style={{
				position: "relative",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			{toast && (
				<div
					style={{
						position: "fixed",
						top: "24px",
						left: "50%",
						transform: "translateX(-50%)",
						background:
							toast.type === "success"
								? "rgba(15, 23, 42, 0.85)"
								: "rgba(153, 27, 27, 0.85)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(255,255,255,0.1)",
						color: "white",
						padding: "12px 24px",
						borderRadius: "30px",
						fontSize: "13px",
						fontWeight: 700,
						display: "flex",
						alignItems: "center",
						gap: "8px",
						boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
						zIndex: 9999,
					}}
				>
					{toast.type === "success" ? "✓ " : "✕ "} {toast.message}
				</div>
			)}

			<div
				className="mobile-stack"
				style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
			>
				<div
					style={{
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "12px",
						padding: "1rem 1.25rem",
						flex: 1,
						position: "relative",
						boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
					}}
				>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 800,
							color: "#94a3b8",
							textTransform: "uppercase",
							marginBottom: "8px",
							letterSpacing: "0.5px",
						}}
					>
						Total Matches
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
						<div
							style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}
						>
							{totalJobs}
						</div>
						{totalJobs > 0 && (
							<span
								style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e" }}
							>
								+12% ↗
							</span>
						)}
					</div>
				</div>
				<div
					style={{
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "12px",
						padding: "1rem 1.25rem",
						flex: 1,
						position: "relative",
						boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
					}}
				>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 800,
							color: "#94a3b8",
							textTransform: "uppercase",
							marginBottom: "8px",
							letterSpacing: "0.5px",
						}}
					>
						Tier 1 (88+)
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
						<div
							style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}
						>
							{tier1Count}
						</div>
					</div>
					{tier1Count > 0 && (
						<span
							style={{
								position: "absolute",
								right: "1rem",
								bottom: "1rem",
								background: "#dcfce7",
								color: "#15803d",
								padding: "2px 8px",
								borderRadius: "4px",
								fontSize: "9px",
								fontWeight: 800,
								textTransform: "uppercase",
							}}
						>
							Priority
						</span>
					)}
				</div>
				<div
					style={{
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "12px",
						padding: "1rem 1.25rem",
						flex: 1,
						position: "relative",
						boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
					}}
				>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 800,
							color: "#94a3b8",
							textTransform: "uppercase",
							marginBottom: "8px",
							letterSpacing: "0.5px",
						}}
					>
						Tier 2 (70-87)
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
						<div
							style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}
						>
							{tier2Count}
						</div>
					</div>
					{tier2Count > 0 && (
						<span
							style={{
								position: "absolute",
								right: "1rem",
								bottom: "1rem",
								background: "#eff6ff",
								color: "#1d4ed8",
								padding: "2px 8px",
								borderRadius: "4px",
								fontSize: "9px",
								fontWeight: 800,
								textTransform: "uppercase",
							}}
						>
							Standard
						</span>
					)}
				</div>
				<div
					style={{
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "12px",
						padding: "1rem 1.25rem",
						flex: 1,
						position: "relative",
						boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
					}}
				>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 800,
							color: "#94a3b8",
							textTransform: "uppercase",
							marginBottom: "8px",
							letterSpacing: "0.5px",
						}}
					>
						System Status
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
						<div
							style={{
								fontSize: "24px",
								fontWeight: 800,
								color: isScraping ? "#0284c7" : email ? "#0f172a" : "#94a3b8",
							}}
						>
							{isScraping ? "Active" : email ? "Ready" : "Offline"}
						</div>
					</div>
				</div>
				<div
					style={{
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "12px",
						padding: "1rem 1.25rem",
						flex: 1,
						position: "relative",
						boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
					}}
				>
					<div
						style={{
							fontSize: "10px",
							fontWeight: 800,
							color: "#94a3b8",
							textTransform: "uppercase",
							marginBottom: "8px",
							letterSpacing: "0.5px",
						}}
					>
						Last Run
					</div>
					<div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
						<div
							style={{
								fontSize: "24px",
								fontWeight: 800,
								color: email ? "#0f172a" : "#94a3b8",
							}}
						>
							{lastRun}
						</div>
					</div>
				</div>
			</div>

			<div
				className="mobile-stack"
				style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}
			>
				<div
					style={{
						flex: 1.3,
						background: "white",
						border: "1px solid #f1f5f9",
						borderRadius: "16px",
						padding: "1.75rem",
						boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
					}}
				>
					<h2
						style={{
							fontSize: "18px",
							fontWeight: 800,
							color: "#0f172a",
							margin: "0 0 4px 0",
						}}
					>
						Run & Send Job Digest
					</h2>
					<p
						style={{
							fontSize: "13px",
							color: "#64748b",
							margin: "0 0 1.5rem 0",
						}}
					>
						Trigger the recruitment engine to scan nationwide postings.
					</p>

					<div
						className="mobile-stack"
						style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
					>
						<div style={{ flex: 1.5 }}>
							<label
								style={{
									display: "block",
									fontSize: "10px",
									fontWeight: 800,
									color: "#94a3b8",
									marginBottom: "6px",
									textTransform: "uppercase",
								}}
							>
								Email Recipient
							</label>
							<input
								type="email"
								value={email}
								onChange={handleEmailChange}
								placeholder="Log in to set email..."
								readOnly={!email}
								style={{
									width: "100%",
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
									padding: "10px 12px",
									fontSize: "13px",
									color: "#0f172a",
									outline: "none",
									cursor: email ? "text" : "not-allowed",
								}}
							/>
						</div>
						<div style={{ flex: 1 }}>
							<label
								style={{
									display: "block",
									fontSize: "10px",
									fontWeight: 800,
									color: "#94a3b8",
									marginBottom: "6px",
									textTransform: "uppercase",
								}}
							>
								Location Filter
							</label>
							<select
								value={location}
								onChange={handleLocationChange}
								disabled={!email}
								style={{
									width: "100%",
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
									padding: "10px 12px",
									fontSize: "13px",
									color: "#0f172a",
									outline: "none",
									appearance: "none",
									cursor: email ? "pointer" : "not-allowed",
								}}
							>
								{NIGERIA_STATES.map((state) => (
									<option key={state} value={state}>
										{state}
									</option>
								))}
							</select>
						</div>
					</div>

					<div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								cursor: email ? "pointer" : "not-allowed",
								opacity: email ? 1 : 0.5,
							}}
							onClick={() => email && toggleTier3()}
						>
							<div style={iosSwitchStyle(includeTier3)}>
								<div style={iosKnobStyle(includeTier3)}></div>
							</div>
							<span
								style={{
									fontSize: "13px",
									fontWeight: 600,
									color: "#475569",
									marginLeft: "8px",
								}}
							>
								Include Tier 3
							</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								cursor: email ? "pointer" : "not-allowed",
								opacity: email ? 1 : 0.5,
							}}
							onClick={() => email && toggleAutoSend()}
						>
							<div style={iosSwitchStyle(autoSend)}>
								<div style={iosKnobStyle(autoSend)}></div>
							</div>
							<span
								style={{
									fontSize: "13px",
									fontWeight: 600,
									color: "#475569",
									marginLeft: "8px",
								}}
							>
								Auto-send email
							</span>
						</div>
					</div>

					<div style={{ marginBottom: "1.5rem" }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "10px",
								fontWeight: 800,
								color: "#94a3b8",
								marginBottom: "6px",
							}}
						>
							<span>SCAN PROGRESS</span>
							<span style={{ color: progress > 0 ? "#0058bc" : "#94a3b8" }}>
								{progress}%
							</span>
						</div>
						<div
							style={{
								width: "100%",
								height: "6px",
								background: "#f1f5f9",
								borderRadius: "4px",
								overflow: "hidden",
							}}
						>
							<div
								style={{
									width: `${progress}%`,
									height: "100%",
									background: "#0058bc",
									transition: "width 0.3s ease",
								}}
							></div>
						</div>
					</div>
					<button
						onClick={runScraper}
						disabled={isScraping || !email}
						style={{
							width: "100%",
							background: isScraping
								? "#94a3b8"
								: !email
									? "#e2e8f0"
									: "#0058bc",
							color: !email ? "#94a3b8" : "white",
							border: "none",
							padding: "12px",
							borderRadius: "8px",
							fontSize: "14px",
							fontWeight: 700,
							cursor: isScraping || !email ? "not-allowed" : "pointer",
						}}
					>
						{isScraping ? "Scanning..." : "Run job search now"}
					</button>
				</div>

				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						gap: "1.25rem",
					}}
				>
					<div
						style={{
							background: "#0f172a",
							borderRadius: "16px",
							padding: "1.25rem",
							height: "240px",
							display: "flex",
							flexDirection: "column",
							border: "1px solid #1e293b",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "6px",
								overflowY: "auto",
								flex: 1,
								fontFamily: "monospace",
								fontSize: "12px",
							}}
						>
							{logs.map((l, i) => (
								<div key={i} style={{ display: "flex", gap: "10px" }}>
									<span style={{ color: "#475569" }}>{l.time}</span>
									<span
										style={{
											color:
												l.level === "ERROR"
													? "#ef4444"
													: l.level === "AUTH"
														? "#facc15"
														: "#22c55e",
											fontWeight: 700,
										}}
									>
										[{l.level}]
									</span>
									<span style={{ color: "#e2e8f0" }}>{l.msg}</span>
								</div>
							))}
						</div>
					</div>
					<div
						style={{
							background: "#f4f9ff",
							border: "1px solid #dbeafe",
							borderRadius: "16px",
							padding: "1.25rem",
							position: "relative",
						}}
					>
						<div
							style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}
						>
							AI Recommendation
						</div>
						<div
							style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}
						>
							{getAiRecommendation()}
						</div>
					</div>
				</div>
			</div>

			{email && <DashboardAnalytics />}
		</div>
	);
}
