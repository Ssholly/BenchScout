"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function HomePage() {
	const router = useRouter();
	const [tourStep, setTourStep] = useState(0);

	const tourContent = [
		{
			title: "Welcome to BenchScout",
			text: "You have arrived at the final version of our platform, a 100% autonomous career engine built exclusively for Medical Laboratory Scientists in Nigeria. This tour will explain how the entire ecosystem works to build your future.",
			icon: WelcomeIcon,
		},
		{
			title: "The Autonomous Engine",
			text: "Every morning at your set time, our engines wake up completely on their own. They don't need a human to click anything. They deploy background workers that securely fan out across major Nigerian job portals, hospital networks, and MLSCN announcements simultaneously.",
			icon: AutonomousIcon,
		},
		{
			title: "Resume Parsing & Scoring AI",
			text: "Our proprietary algorithm reads your uploaded resume. It extracts your complex clinical skills (e.g., hematology, microbiology, phlebotomy,...). When the engine finds a job, it analyzes that description against YOUR unique skills, calculating a precise Match Score out of 100%.",
			icon: ResumeMatchIcon,
		},
		{
			title: "Tiered Filtering",
			text: "Jobs aren't just listed; they are ranked. Scores above 90% are marked 'Tier 1' (Priority). 75-90% are 'Tier 2'. Anything below that or non-clinical is filtered out. Only high-quality, matched opportunities ever make it past this stage.",
			icon: TieredScoringIcon,
		},
		{
			title: "Daily Email Digest",
			text: "Immediately after filtering, the engine compiles a beautifully designed Daily Digest email containing only your new, high-scoring matches. This email is dispatched directly to your inbox before you've likely even woken up, giving you a massive head start.",
			icon: EmailIcon,
		},
		{
			title: "Dashboard",
			text: "The main platform view where you track everything. You see your total lifetime matches, count your active applications, and monitor the health of the daily scraper engine.",
			icon: DashboardIcon,
		},
		{
			title: "Job Matches",
			text: "The definitive list. Unlike the email summary, this page hosts every currently open job matched to you. You can review full descriptions, match scores, company data, and click 'Apply' to log the attempt.",
			icon: JobMatchesIcon,
		},
		{
			title: "Applied & Tracking",
			text: "Your career pipeline. Whenever you click 'Apply' on a match, it moves here. Stop using spreadsheets; BenchScout tracks the date and role, so you are always organized.",
			icon: AppliedIcon,
		},
		{
			title: "News & Insights",
			text: "We scan more than just jobs. This feed aggregates critical MLSCN updates, regulatory changes, laboratory training news, and career advice tailored specifically for Nigerian scientists.",
			icon: NewsIcon,
		},
		{
			title: "Salary Intelligence",
			text: "Anonymous, verified monthly salary data from peers and live job market analysis. View industry averages, monitor Tier 1 base salaries, and contribute securely to improve market transparency for all MLS professionals.",
			icon: SalaryIcon,
		},
		{
			title: "The Scheduler",
			text: "Your automation control center. Here you can set your timer and verify if your daily job-matching engine is active, pause it if you are taking a break, and review the exact background status of your autonomous web scrapers.",
			icon: SchedulerIcon,
		},
		{
			title: "Run History",
			text: "Transparency is key. Every time the autonomous engine runs or you trigger a Quick Scan, it logs the results here. Review past matches found, run durations, and performance metrics over time.",
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

	const glassBaseStyle = {
		background: "rgba(255, 255, 255, 0.5)",
		backdropFilter: "blur(20px)",
		WebkitBackdropFilter: "blur(20px)",
		border: "1px solid rgba(255, 255, 255, 0.2)",
		borderRadius: "24px",
		boxShadow: "0 8px 32px rgba(31, 38, 135, 0.07)",
	};

	const featureCardStyle = {
		position: "relative" as const,
		background: "transparent",
		padding: "1.5rem",
		borderRadius: "16px",
		transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
		cursor: "default",
		zIndex: 1,
	};

	return (
		<div
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
               transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s;
            }

            .premium-feature-card::before {
               content: "";
               position: absolute;
               inset: 0;
               border-radius: 16px;
               padding: 2px;
               background: linear-gradient(60deg, #0058bc, #0ea5e9, #bae6fd, #0ea5e9, #0058bc);
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
               box-shadow: 0 15px 45px rgba(0, 88, 188, 0.1);
            }
            .premium-feature-card:hover::before,
            .premium-feature-card:hover::after {
               opacity: 1;
            }

            .premium-feature-card:hover h3 {
               color: #0058bc !important;
            }
            .premium-feature-card:hover svg {
               transform: scale(1.1);
               color: #0058bc !important;
               transition: transform 0.4s ease, color 0.4s ease;
            }
            
            .explore-cta-button {
                transition: all 0.3s ease;
                background: #0058bc !important; 
                box-shadow: 0 10px 25px rgba(0, 88, 188, 0.3) !important; 
                font-weight: 900 !important;
            }
            .explore-cta-button:hover {
                transform: translateY(-3px) scale(1.02);
                background: #0ea5e9 !important; 
                box-shadow: 0 12px 30px rgba(14, 165, 233, 0.45) !important; 
            }
          `,
				}}
			/>

			<div
				style={{
					maxWidth: "1200px",
					margin: "0 auto",
					position: "relative",
					zIndex: 1,
				}}
			>
				<div
					style={{
						textAlign: "center",
						marginBottom: "5rem",
						marginTop: "3rem",
					}}
				>
					<h1
						style={{
							fontSize: "4rem",
							fontWeight: 900,
							color: "#0f172a",
							letterSpacing: "-1.5px",
							margin: "0 0 1rem 0",
							lineHeight: 1.05,
						}}
					>
						The Career Engine for
						<br />
						<span
							style={{
								background: "linear-gradient(90deg, #0058bc 0%, #0ea5e9 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							Medical Laboratory Scientists.
						</span>
					</h1>
					<p
						style={{
							fontSize: "1.2rem",
							color: "#64748b",
							maxWidth: "650px",
							margin: "0 auto 3rem auto",
							lineHeight: 1.6,
							fontWeight: 500,
						}}
					>
						BenchScout is the definitive MLS career ecosystem. Our engines
						autonomously scan, score, and filter premium laboratory roles from
						across Nigeria, delivering tailored opportunities directly to your
						inbox before dawn.
					</p>

					<button
						onClick={() => setTourStep(1)}
						className="explore-cta-button"
						style={{
							color: "white",
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
						Explore the Autonomous System
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

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
						gap: "1.5rem",
						paddingBottom: "4rem",
					}}
				>
					{[
						{
							title: "Autonomous Sourcing",
							desc: "No human input required. Daily, our engines scan Nigerian hospitals, job boards, and clinic portals automatically.",
							icon: AutonomousIcon,
						},
						{
							title: "Resume Match AI",
							desc: "Our proprietary scrapper maps your CV's clinical skills directly against job descriptions for precision matching.",
							icon: ResumeMatchIcon,
						},
						{
							title: "Hyper-Curated Matches",
							desc: "Stop wasting hours scrolling through generic boards. We cut through the noise, matching your specific MLSCN license and specialty directly to high-quality roles.",
							icon: FilterIcon,
						},
						{
							title: "Tiered Scoring",
							desc: "We automatically rank opportunities (Tier 1-3) so you instantly know what roles are worth your focus.",
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
					].map((feat, i) => {
						const Icon = feat.icon;
						return (
							<div
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
							</div>
						);
					})}
				</div>
			</div>

			{tourStep > 0 && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						background: "rgba(15,23,42,0.7)",
						backdropFilter: "blur(12px)",
						zIndex: 10000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "1.5rem",
					}}
				>
					<div
						style={{
							...glassBaseStyle,
							background: "rgba(255, 255, 255, 0.95)",
							width: "90vw",
							maxWidth: "900px",
							padding: "3rem",
							position: "relative",
							boxShadow: "0 30px 70px -15px rgba(0,0,0,0.3)",
						}}
					>
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								position: "absolute",
								top: "1rem",
								left: "2rem",
								background: "white",
								padding: "4px 10px",
								borderRadius: "12px",
								border: "1px solid #e2e8f0",
							}}
						>
							<span
								style={{ fontSize: "11px", fontWeight: 800, color: "#64748b" }}
							>
								PLATFORM WALKTHROUGH
							</span>
							<span
								style={{ fontSize: "13px", fontWeight: 900, color: "#0058bc" }}
							>
								Step {tourStep} of {tourContent.length}
							</span>
						</div>

						<button
							onClick={() => setTourStep(0)}
							style={{
								position: "absolute",
								top: "1.5rem",
								right: "1.5rem",
								background: "white",
								border: "1px solid #e2e8f0",
								width: "32px",
								height: "32px",
								borderRadius: "50%",
								cursor: "pointer",
								color: "#64748b",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								transition: "0.2s",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.borderColor = "#94a3b8")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.borderColor = "#e2e8f0")
							}
						>
							✕
						</button>

						<div
							style={{
								display: "flex",
								gap: "2.5rem",
								alignItems: "flex-start",
								marginTop: "1rem",
							}}
						>
							<div
								style={{
									color: "#0f172a",
									minWidth: "120px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									marginTop: "6px",
								}}
							>
								{(() => {
									const Icon = tourContent[tourStep - 1].icon;
									return <Icon size={90} stroke={1.5} />;
								})()}
							</div>

							<div style={{ flex: 1 }}>
								<h2
									style={{
										margin: "0 0 1.25rem 0",
										fontSize: "2rem",
										color: "#0f172a",
										fontWeight: 900,
										letterSpacing: "-1px",
										lineHeight: 1.1,
									}}
								>
									{tourContent[tourStep - 1].title}
								</h2>

								<p
									style={{
										color: "#475569",
										fontSize: "16px",
										lineHeight: 1.7,
										marginBottom: "2.5rem",
										minHeight: "100px",
									}}
								>
									{tourContent[tourStep - 1].text}
								</p>

								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div style={{ display: "flex", gap: "5px" }}>
										{tourContent.map((_, idx) => (
											<div
												key={idx}
												style={{
													width: tourStep === idx + 1 ? "16px" : "6px",
													height: "6px",
													borderRadius: "3px",
													background:
														tourStep === idx + 1 ? "#0058bc" : "#e2e8f0",
													transition:
														"0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
												}}
											/>
										))}
									</div>

									<div style={{ display: "flex", gap: "12px" }}>
										{tourStep > 1 && (
											<button
												onClick={handlePrev}
												style={{
													background: "#f1f5f9",
													color: "#64748b",
													border: "none",
													padding: "12px 24px",
													borderRadius: "12px",
													fontSize: "15px",
													fontWeight: 800,
													cursor: "pointer",
													transition: "all 0.2s",
												}}
												onMouseEnter={(e) =>
													(e.currentTarget.style.background = "#e2e8f0")
												}
												onMouseLeave={(e) =>
													(e.currentTarget.style.background = "#f1f5f9")
												}
											>
												Prev
											</button>
										)}

										<button
											onClick={handleNext}
											style={{
												background: "#0058bc",
												color: "white",
												border: "none",
												padding: "12px 24px",
												borderRadius: "12px",
												fontSize: "15px",
												fontWeight: 800,
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "8px",
												transition: "all 0.2s",
											}}
										>
											{tourStep === tourContent.length
												? "Secure Signup"
												: "Next"}
											{tourStep !== tourContent.length && (
												<svg
													width="18"
													height="18"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="3"
												>
													<path d="M5 12h14M12 5l7 7-7 7" />
												</svg>
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
