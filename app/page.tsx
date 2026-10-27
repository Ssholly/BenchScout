"use client";
import { useJobScan } from "@/lib/use-job-scan";
import { startJobScan } from "@/lib/client-job-scan";
import Toast from "@/components/Toast";
import { startTransition } from "react";
import type { ClientJob } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import ApplicationReadiness from "@/components/ApplicationReadiness";
import LicensedCareerOverview from "@/components/LicensedCareerOverview";
import InternDashboard from "@/components/InternDashboard";
import { candidateProfile, lastScan } from "@/lib/candidate-profile";
import ScanSummary from "@/components/ScanSummary";
import HubLoading from "@/components/HubLoading";
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
 const profileSequence = useRef(0);
 const jobSequence = useRef(0);
 const profileIdentity = useRef<string | null>(null);
 const [jobsUnavailable, setJobsUnavailable] = useState(true);
 const [profileAsOf, setProfileAsOf] = useState<number | null>(null);
	const [profileError, setProfileError] = useState(false);
 const [careerPhase, setCareerPhase] = useState<string | null>(null);
 const [licenseExpiry, setLicenseExpiry] = useState<string | null>(null);
 const [careerProfile, setCareerProfile] = useState<unknown>({});
 const [careerJobs, setCareerJobs] = useState<ClientJob[]>([]);
	const scan = useJobScan();
 const isScraping = scan.running;
 const progress = scan.progress;
	const [email, setEmail] = useState("");
	const [location, setLocation] = useState("All Nigeria");
	const [dbMinScore, setDbMinScore] = useState(75);
	const [userKeywords, setUserKeywords] = useState("");
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

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
	const refreshJobStats = async () => {
		const sequence = ++jobSequence.current;
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setTotalJobs(0);
			setTier1Count(0);
			setTier2Count(0);
			return;
		}

		try {
			const res = await fetch(`/api/jobs?email=${encodeURIComponent(activeEmail)}`);
			const data = await res.json();
            if (sequence !== jobSequence.current || activeEmail !== localStorage.getItem("labpro_active_user")) return;
            if (!res.ok || !Array.isArray(data)) throw new Error("Matches unavailable");
			if (Array.isArray(data)) {
				const activeJobs = data;
                setCareerJobs(data);
                setJobsUnavailable(false);

				setTotalJobs(activeJobs.length);
				setTier1Count(activeJobs.filter((j: ClientJob) => j.tier === 1).length);
				setTier2Count(activeJobs.filter((j: ClientJob) => j.tier === 2).length);
			}
		} catch { setJobsUnavailable(true); }
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const sequence = ++profileSequence.current;
			const activeEmail = localStorage.getItem("labpro_active_user");
            if (profileIdentity.current !== activeEmail) { setCareerPhase(null); setCareerProfile({}); profileIdentity.current = activeEmail; }

			if (!activeEmail) {
				setIsUserLoggedIn(false);
				setEmail("");
				setTotalJobs(0);
				setTier1Count(0);
				setTier2Count(0);
				setLastRun("—");

				return;
			}

			setIsUserLoggedIn(true);

			try {
				const res = await fetch(`/api/user?email=${encodeURIComponent(activeEmail)}`);
				const data = await res.json();
                if (sequence !== profileSequence.current || activeEmail !== localStorage.getItem("labpro_active_user")) return;
                if (!res.ok || !data.success || !data.user) throw new Error("Profile unavailable");
                setProfileError(false);
				if (data.success && data.user) {
					setEmail(data.user.email);
                    setCareerPhase(data.user.careerPhase || "licensed");
                    setCareerProfile(data.user.candidateProfile || {});
                    setLicenseExpiry(data.user.licenseExpiry || null);
                    const savedRun = localStorage.getItem("labpro_last_run");
                    if (savedRun) setLastRun(savedRun);
                    setProfileAsOf(Date.now());
					setDbMinScore(data.user.minScore ?? 75);
					setUserKeywords(data.user.keywords || candidateProfile(data.user.candidateProfile).specialties || "Medical Laboratory Scientist");

					const dashboardFilter = localStorage.getItem(
						"labpro_dashboard_temp_location",
					);
					setLocation(dashboardFilter || lastScan(data.user.candidateProfile)?.location || candidateProfile(data.user.candidateProfile).preferredLocations || data.user.location || "All Nigeria");
				}
			} catch { setProfileError(true); }
		};

		startTransition(() => { refreshJobStats(); });
		fetchUserData();

		const savedLastRun = localStorage.getItem("labpro_last_run");
		const activeUser = localStorage.getItem("labpro_active_user");
		if (savedLastRun && activeUser) startTransition(() => { setLastRun(savedLastRun); });

		const savedT3 = localStorage.getItem("labpro_tier3");
		if (savedT3) startTransition(() => { setIncludeTier3(savedT3 === "true"); });

		const savedAuto = localStorage.getItem("labpro_auto");
		if (savedAuto) startTransition(() => { setAutoSend(savedAuto === "true"); });

		const refreshIdentity = () => {
			setIsUserLoggedIn(!!localStorage.getItem("labpro_active_user"));
			fetchUserData();
			refreshJobStats();
		};
        window.addEventListener("userStateChanged", refreshIdentity);
		window.addEventListener("jobsUpdated", refreshJobStats);

		return () => {
			window.removeEventListener("userStateChanged", refreshIdentity);
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

        await startJobScan({ targetLocation: location, includeTier3, autoSend, minScore: dbMinScore, keywords: userKeywords, strict_mls: true });
    };

	const getAiRecommendation = () => email
    ? `Your search covers ${location}. Keep your skills and minimum score up to date to improve relevance.`
    : "Sign in to set your search location and matching preferences.";

	const iosSwitchStyle = (active: boolean) => ({
		width: "32px",
		height: "18px",
		background: active ? "#1A8C7A" : "#cbd5e1", // 🚀 BRANDED TEAL TOGGLE
		borderRadius: "20px",
		position: "relative" as const,
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
		position: "absolute" as const,
		top: "2px",
		left: active ? "16px" : "2px",
		transition: "all 0.2s ease",
		boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
	});

 if (isUserLoggedIn && !careerPhase) return profileError ? <div role="alert"><p>Your profile is temporarily unavailable.</p><button onClick={()=>window.location.reload()}>Try again</button></div> : <HubLoading />;
 if (isUserLoggedIn && careerPhase === "internship") return <><InternDashboard initial={careerProfile} jobs={careerJobs} onScan={runScraper} scanning={isScraping} unavailable={jobsUnavailable} location={location} locations={NIGERIA_STATES} onLocationChange={value=>{setLocation(value);localStorage.setItem("labpro_dashboard_temp_location",value);}} minScore={dbMinScore} autoSend={autoSend} onAutoSendChange={toggleAutoSend} />{toast && <Toast message={toast.message} type={toast.type} />}</>;

	return (
		<div
			style={{
				position: "relative",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			{toast && <Toast message={toast.message} type={toast.type} />}

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
						marginTop: "2rem",
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
						Dashboard Locked
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
						Log in or create an account to view your analytics and run the
						scanner.
					</p>
					<button
						onClick={() => window.dispatchEvent(new Event("openProfileModal"))}
						style={{
							background: "#0B2444", // 🚀 BRANDED BUTTON
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
			) : (
				<>
					<ApplicationReadiness />
                    <LicensedCareerOverview initial={careerProfile} expiry={licenseExpiry} asOf={profileAsOf} />
                    <ScanSummary profile={careerProfile}/>
					<div
						className="dashboard-metrics"
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
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									style={{
										fontSize: "24px",
										fontWeight: 800,
										color: "#0f172a",
									}}
								>
									{totalJobs}
								</div>
								{totalJobs > 0 && (
									<span
										style={{
											fontSize: "11px",
											fontWeight: 700,
											color: "#1A8C7A", // 🚀 BRANDED UP-TICK
										}}
									>
										Saved matches
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
								Tier 1 (90+)
							</div>
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									style={{
										fontSize: "24px",
										fontWeight: 800,
										color: "#0f172a",
									}}
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
										background: "#e6fcf5", // 🚀 BRANDED TIER 1 PILL
										color: "#1A8C7A",
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
								Tier 2 (75-89)
							</div>
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									style={{
										fontSize: "24px",
										fontWeight: 800,
										color: "#0f172a",
									}}
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
										background: "rgba(11, 36, 68, 0.05)", // 🚀 BRANDED TIER 2 PILL
										color: "#0B2444",
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
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
								<div
									style={{
										fontSize: "24px",
										fontWeight: 800,
										color: isScraping
											? "#1A8C7A" // 🚀 BRANDED ACTIVE
											: email
												? "#0f172a"
												: "#94a3b8",
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
							<div
								style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
							>
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
						className="mobile-stack dashboard-scan-layout"
						style={{
							display: "flex",
							gap: "1.5rem",
							alignItems: "flex-start",
						}}
					>
						<div
							id="run-scan"
							className="digest-run-card"
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
								Scan supported sources for matching opportunities.
							</p>

							<div
								className="mobile-stack digest-fields"
								style={{
									display: "flex",
									gap: "1rem",
									marginBottom: "1.5rem",
								}}
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
										Scan location
									</label>
									<select
										value={location}
										onChange={handleLocationChange}
											disabled={!email || isScraping}
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
										{!NIGERIA_STATES.includes(location) && <option value={location}>{location}</option>}
{NIGERIA_STATES.map((state) => (
											<option key={state} value={state}>
												{state}
											</option>
										))}
									</select>
								</div>
							</div>

							<div
								className="digest-options"
								style={{
									display: "flex",
									gap: "1.5rem",
									marginBottom: "2rem",
								}}
							>
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
									<span style={{ color: progress > 0 ? "#1A8C7A" : "#94a3b8" }}>
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
											background: "#1A8C7A", // 🚀 BRANDED PROGRESS FILL
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
											: "#0B2444", // 🚀 BRANDED RUN BUTTON
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
									background: "rgba(26, 140, 122, 0.05)", // 🚀 BRANDED RECOMMENDATION BG
									border: "1px solid rgba(26, 140, 122, 0.2)",
									borderRadius: "16px",
									padding: "1.25rem",
									position: "relative",
								}}
							>
								<div
									style={{
										fontSize: "13px",
										fontWeight: 800,
										color: "#0f172a",
									}}
								>
									Search guidance
								</div>
								<div
									style={{
										fontSize: "12px",
										color: "#475569",
										marginTop: "4px",
									}}
								>
									{getAiRecommendation()}
								</div>
							</div>
						</div>
					</div>

					{email && <DashboardAnalytics />}
				</>
			)}
		</div>
	);
}
