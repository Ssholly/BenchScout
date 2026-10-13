"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { HOME_MENU_ON_DEMAND } from "@/lib/home-navigation";

const AutonomousIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 2v4" />
		<path d="m16.2 4.6 2.8-2.8" />
		<path d="M22 12h-4" />
		<path d="m18.2 16.2 2.8 2.8" />
		<path d="M12 22v-4" />
		<path d="m7.8 19.4-2.8 2.8" />
		<path d="M2 12h4" />
		<path d="m5.8 7.8-2.8-2.8" />
	</svg>
);
const ResumeMatchIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
		<polyline points="14 2 14 8 20 8" />
		<circle cx="11" cy="14" r="3" />
		<line x1="13.5" y1="16.5" x2="16" y2="19" />
	</svg>
);
const TieredScoringIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="20" x2="18" y2="10" />
		<line x1="12" y1="20" x2="12" y2="4" />
		<line x1="6" y1="20" x2="6" y2="14" />
	</svg>
);
const DashboardIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="3" width="7" height="7" />
		<rect x="14" y="3" width="7" height="7" />
		<rect x="14" y="14" width="7" height="7" />
		<rect x="3" y="14" width="7" height="7" />
	</svg>
);
const JobMatchesIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
		<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
	</svg>
);
const AppliedIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="21 8 21 21 3 21 3 8" />
		<rect x="1" y="3" width="22" height="5" />
		<line x1="10" y1="12" x2="14" y2="12" />
	</svg>
);
const NewsIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M19 21V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11l5 4Z" />
		<path d="M10 9h4" />
		<path d="M10 13h4" />
	</svg>
);
const SalaryIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="12" y1="1" x2="12" y2="23" />
		<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
	</svg>
);
const SchedulerIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);
const HistoryIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
	</svg>
);
const SettingsIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
);
const PlatformUtilsIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 2v6h-6" />
		<path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
		<path d="M3 22v-6h6" />
		<path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
	</svg>
);

const FilterIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
	</svg>
);
const PipelineIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<path d="M8 7v7" />
		<path d="M12 7v4" />
		<path d="M16 7v9" />
	</svg>
);

const WelcomeIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
		<circle cx="12" cy="12" r="4" />
	</svg>
);
const EmailIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect width="20" height="16" x="2" y="4" rx="2" />
		<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
	</svg>
);

const ShieldComplianceIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
		<path d="m9 12 2 2 4-4" />
	</svg>
);

const DigestMailIcon = ({ size = 24, stroke = 2.5 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
);

export default function HomePage() {
	const router = useRouter();

	const [tourStep, setTourStep] = useState(0);
    const tourDialog = useRef<HTMLDivElement>(null);
    const tourOpen = tourStep > 0;
    useEffect(() => {
        if (!tourOpen) return;
        const previousFocus = document.activeElement;
        document.body.classList.add("walkthrough-open");
        tourDialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setTourStep(0);
            if (event.key !== "Tab") return;
            const buttons = Array.from(tourDialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.classList.remove("walkthrough-open");
            document.removeEventListener("keydown", onKeyDown);
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [tourOpen]);


	const tourContent = [
		{
			title: "Welcome to BenchScout",
			text: "Find laboratory roles across Nigeria, keep your application documents together, and track your next steps. This tour shows how to get started.",
			icon: WelcomeIcon,
		},
		{
			title: "Job scans and schedules",
			text: "Run a scan when you need fresh matches, or save a schedule with your preferred days, time, and timezone. Source availability can affect results; check Run History after a scheduled scan.",
			icon: AutonomousIcon,
		},
		{
			title: "Skills and match relevance",
			text: "Upload your CV and review your skill keywords in Settings. Matches use the vacancy title, location, career phase, and keywords. Scores indicate relevance; check the actual requirements before applying.",
			icon: ResumeMatchIcon,
		},
		{
			title: "Tiered Filtering",
			text: "Matches are grouped into three relevance tiers: Tier 1 at 90 or above, Tier 2 from 75 to 89, and Tier 3 below 75. Choose a minimum score and whether to include Tier 3.",
			icon: TieredScoringIcon,
		},
		{
			title: "Daily Email Digest",
			text: "Enable email alerts to receive newly discovered matches after a scan. Select the tiers and keywords you want to hear about. Saved matches remain available even if an email cannot be delivered.",
			icon: EmailIcon,
		},
		{
			title: "Dashboard",
			text: "The main platform view where you track everything. You see your total lifetime matches, count your active applications, and monitor the health of the daily scraper engine.",
			icon: DashboardIcon,
		},
		{
			title: "Job Matches",
			text: "Review saved matches, their source links, and the last time each listing was seen. Confirm that a vacancy is still open on its source website before applying.",
			icon: JobMatchesIcon,
		},
		{
			title: "Applied & Tracking",
			text: "Keep your applications in one place. For employer-posted roles, the employer updates the application status. For external listings, track your own progress after applying on the source website.",
			icon: AppliedIcon,
		},
		{
			title: "News & Insights",
			text: "We scan more than just jobs. This feed aggregates critical MLSCN updates, regulatory changes, laboratory training news, and career advice tailored specifically for Nigerian scientists.",
			icon: NewsIcon,
		},
		{
			title: "Salary Intelligence",
			text: "Explore monthly salary contributions from other users and add your own. Reports are self-reported, and small samples may not represent the wider market.",
			icon: SalaryIcon,
		},
		{
			title: "The Scheduler",
			text: "Save your scan days, time, and timezone, and choose whether to receive email alerts. Review Run History to confirm completed scans.",
			icon: SchedulerIcon,
		},
		{
			title: "Run History",
			text: "See when a scan ran, how many new matches it found, and whether email delivery succeeded. Source failures preserve your existing matches.",
			icon: HistoryIcon,
		},
		{
			title: "System Settings",
			text: "This page is critical. It controls how the daily engines score your jobs. Update your target city (e.g., Abuja, Lagos,..), modify your target keywords, and set your minimum Match Score threshold.",
			icon: SettingsIcon,
		},
		{
			title: "Platform Utilities",
			text: "Need matches NOW? The 'Quick Scan' button on the sidebar bypasses the scheduler and manually triggers the scraper for you. The Profile button allows you to update your active resume, manage your avatar, or securely log out.",
			icon: PlatformUtilsIcon,
		},
	];

	const handleNext = () => {
		if (tourStep < tourContent.length) {
			setTourStep(tourStep + 1);
		} else {
			setTourStep(0);
			window.dispatchEvent(new Event("openProfileModal"));
		}
	};

	const handlePrev = () => {
		if (tourStep > 1) {
			setTourStep(tourStep - 1);
		}
	};

	const featureCardStyle = {
		position: "relative" as const,
		background: "transparent",
		padding: "1.5rem",
		borderRadius: "16px",
		transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		cursor: "pointer",
		textAlign: "left" as const,
		fontFamily: "inherit",
		border: "1px solid transparent",
		zIndex: 1,
	};

	return (
		<div className="home-container"
			style={{
				minHeight: "100vh",
				background: "transparent",
				padding: "4rem 2rem",
				position: "relative",
				overflowX: "hidden",
			}}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
            @keyframes cycleGradient {
               0% { background-position: 0% 50%; }
               50% { background-position: 100% 50%; }
               100% { background-position: 0% 50%; }
            }

            .premium-feature-card {
               display: flex;
               flex-direction: column;
               align-items: stretch;
               justify-content: flex-start;
               transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
            }
            .premium-feature-card:focus-visible {
               outline: 2px solid #1A8C7A;
               outline-offset: 3px;
            }

            .premium-feature-card::before {
               content: "";
               position: absolute;
               inset: 0;
               border-radius: 16px;
               padding: 2px;
               background: linear-gradient(60deg, #0B2444, #1A8C7A, #22B89F, #1A8C7A, #0B2444);
               background-size: 300% 300%;
               -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
               -webkit-mask-composite: xor;
               mask-composite: exclude;
               opacity: 0;
               z-index: -1;
               transition: opacity 0.4s ease;
               animation: cycleGradient 3s linear infinite;
            }

            .premium-feature-card::after {
               content: "";
               position: absolute;
               inset: 0;
               border-radius: 16px;
               background: rgba(255, 255, 255, 0.15);
               backdrop-filter: blur(5px);
               opacity: 0;
               z-index: -2;
               transition: opacity 0.4s ease;
            }

            .premium-feature-card:hover {
               transform: translateY(-8px);
               box-shadow: 0 15px 45px rgba(11, 36, 68, 0.1);
            }
            .premium-feature-card:hover h3 {
               color: #1A8C7A !important;
            }
            .premium-feature-card:hover svg {
               transform: scale(1.1);
               color: #1A8C7A !important;
               transition: transform 0.4s ease, color 0.4s ease;
            }

            .explore-cta-button {
                transition: all 0.3s ease;
                background: #0B2444 !important;
                box-shadow: 0 10px 25px rgba(11, 36, 68, 0.3) !important;
                font-weight: 900 !important;
            }
            .explore-cta-button:hover {
                transform: translateY(-3px) scale(1.02);
                background: #1A8C7A !important;
                box-shadow: 0 12px 30px rgba(26, 140, 122, 0.45) !important;
            }
          `,
				}}
			/>

			<div className="home-page"
				style={{
					maxWidth: "1200px",
					margin: "0 auto",
					position: "relative",
					zIndex: 1,
				}}
			>
				<div className="home-hero"
					style={{
						textAlign: "center",
						marginBottom: "5rem",
						marginTop: "1rem",
					}}
				>
					{/* 🚀 RESTORED EXACT BRAND LOGO LOCKUP FOR HERO SECTION */}
					<div className="home-brand"
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "12px",
							marginBottom: "1.5rem",
						}}
					>
						<div className="home-brand-icon" style={{ width: "80px", height: "80px" }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="10 7 32 42"
								fill="none"
								width="100%"
								height="100%"
							>
								<defs>
									<style
										dangerouslySetInnerHTML={{
											__html: `
                    .lens-dot { animation: lensPulse 2s ease-in-out infinite; transform-origin: 26px 22px; }
                    .lens-shine { animation: shinePulse 2s ease-in-out infinite; }
                    @keyframes lensPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.45); } }
                    @keyframes shinePulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
                  `,
										}}
									/>
								</defs>
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
									className="lens-dot"
									cx="26"
									cy="22"
									r="3.5"
									fill="#1A8C7A"
								/>
								<circle
									className="lens-shine"
									cx="21.5"
									cy="17.5"
									r="1.5"
									fill="#22B89F"
									opacity="0.5"
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
						<div
							style={{
								fontFamily: "'Fraunces', serif",
								whiteSpace: "nowrap",
								fontSize: "clamp(1.75rem, 6vw, 4.75rem)",
								fontWeight: 600,
								letterSpacing: "-0.04em",
								color: "#0B2444",
								lineHeight: "1",
							}}
						>
							Bench<span style={{ color: "#1A8C7A" }}>Scout</span>
						</div>
					</div>

					<h1
						style={{
							fontSize: "clamp(1.5rem, 4.5vw, 3.5rem)",
							fontWeight: 900,
							color: "#0f172a",
							letterSpacing: "-1.5px",
							margin: "0 0 1rem 0",
							lineHeight: 1.05,
						}}
					>
						The Career Hub for
						<br />
						<span
							style={{
								background: "linear-gradient(90deg, #0B2444 0%, #1A8C7A 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Medical Laboratory Scientists.
						</span>
					</h1>
					<p
						className="home-intro"
						style={{
							fontSize: "1.2rem",
							color: "#64748b",
							maxWidth: "650px",
							margin: "0 auto 3rem auto",
							lineHeight: 1.6,
							fontWeight: 500,
						}}
					>
						Find laboratory roles across Nigeria, understand why they match,
                        and keep your applications and credentials in one place.
                        Scan when you need to or save a schedule that suits you.
					</p>

					<div className={HOME_MENU_ON_DEMAND ? "home-actions" : undefined}>
					{HOME_MENU_ON_DEMAND && <button className="explore-cta-button home-dashboard-button" onClick={() => router.push(localStorage.getItem("benchscout_active_employer") ? "/employer" : "/")}>
						Open my dashboard <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
					</button>}
					<button
						onClick={() => setTourStep(1)}
						className={HOME_MENU_ON_DEMAND ? "home-explore-secondary" : "explore-cta-button"}
						style={{
							color: HOME_MENU_ON_DEMAND ? "#0B2444" : "white",
							padding: "18px 36px",
							borderRadius: "14px",
							fontSize: "16px",
							border: "none",
							cursor: "pointer",
							display: "inline-flex",
							alignItems: "center",
							gap: "10px",
						}}
					>
						Explore BenchScout
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
						>
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</button>
					</div>
				</div>

				<div className="home-features"
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
						gap: "1.5rem",
						paddingBottom: "4rem",
					}}
				>
					{[
						{
							title: "Scheduled job scans",
							desc: "Find listings from supported job sources. Run a scan yourself or save your preferred schedule.",
							icon: AutonomousIcon,
						},
						{
							title: "Skills-based matching",
							desc: "Match listings using your career phase, location, and skill keywords. Review the requirements on the source website.",
							icon: ResumeMatchIcon,
						},
						{
							title: "Relevant opportunities",
							desc: "Focus on laboratory roles that fit your preferences, with source links and clear relevance scores.",
							icon: FilterIcon,
						},
						{
							title: "Tiered Scoring",
							desc: "Compare three relevance tiers and choose a minimum score to focus your search.",
							icon: TieredScoringIcon,
						},
						{
							title: "Centralized Pipeline",
							desc: "Never lose track of a submitted CV again. Manage your documents and monitor your active applications from one organized, visual Kanban dashboard.",
							icon: PipelineIcon,
						},
						{
							title: "News & Insights",
							desc: "A tailored feed aggregating MLSCN regulatory changes, career advice, and clinical practice insights.",
							icon: NewsIcon,
						},
						{
							title: "Licensure Compliance Tracker",
							desc: "Keep your license documents private, review extracted details, and track recorded expiry dates. Independent review is shown separately.",
							icon: ShieldComplianceIcon,
						},
						{
							title: "Automated Digest Engine",
							desc: "Receive newly discovered matches by email, filtered by your selected tiers and keywords.",
							icon: DigestMailIcon,
						},
					].map((feat, i) => {
						const Icon = feat.icon;
						return (
							<button
								type="button"
								onClick={() => setTourStep([2, 3, 7, 4, 8, 9, 13, 5][i])}
								aria-label={`Learn about ${feat.title}`}
								key={i}
								className="premium-feature-card"
								style={featureCardStyle}
							>
								<div style={{ color: "#0f172a", marginBottom: "1rem" }}>
									<Icon size={36} stroke={2} />
								</div>
								<h3
									style={{
										margin: "0 0 0.75rem 0",
										fontSize: "1.25rem",
										color: "#0f172a",
										fontWeight: 800,
										transition: "0.2s",
										letterSpacing: "-0.3px",
									}}
								>
									{feat.title}
								</h3>
								<p
									style={{
										margin: 0,
										color: "#64748b",
										lineHeight: 1.5,
										fontSize: "14px",
										fontWeight: 500,
									}}
								>
									{feat.desc}
								</p>
							</button>
						);
					})}
				</div>
			</div>

			{tourOpen && createPortal(
                <div className="walkthrough-backdrop">
                    <div className="walkthrough-dialog" ref={tourDialog} role="dialog" aria-modal="true" aria-labelledby="walkthrough-title" aria-describedby="walkthrough-description">
                        <header className="walkthrough-header">
                            <div><span>Platform walkthrough</span><strong>Step {tourStep} of {tourContent.length}</strong></div>
                            <button type="button" aria-label="Close walkthrough" onClick={() => setTourStep(0)}>×</button>
                        </header>
                        <div className="walkthrough-body" aria-live="polite">
                            <div className="walkthrough-icon" aria-hidden="true">{(() => { const Icon = tourContent[tourStep - 1].icon; return <Icon size={72} stroke={1.5} />; })()}</div>
                            <div className="walkthrough-copy">
                                <h2 id="walkthrough-title">{tourContent[tourStep - 1].title}</h2>
                                <p id="walkthrough-description">{tourContent[tourStep - 1].text}</p>
                            </div>
                        </div>
                        <footer className="walkthrough-footer">
                            <div className="walkthrough-progress" aria-hidden="true">{tourContent.map((_, idx) => <span key={idx} className={tourStep === idx + 1 ? "is-current" : ""} />)}</div>
                            <div className="walkthrough-actions">
                                {tourStep > 1 && <button type="button" onClick={handlePrev}>Previous</button>}
                                <button type="button" onClick={handleNext}>{tourStep === tourContent.length ? "Secure Signup" : "Next →"}</button>
                            </div>
                        </footer>
                    </div>
                </div>, document.body
            )}
		</div>
	);
}
