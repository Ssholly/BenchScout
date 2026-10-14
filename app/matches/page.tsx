"use client";
import { sharedPageRequest } from "@/lib/shared-page-request";
import Toast from "@/components/Toast";
import { listingUrl } from "@/lib/listing-url";
import { buildJobDigest } from "@/lib/digest";
import { startTransition } from "react";
import { SkeletonRow, TableHeader } from "@/components/JobTableParts";
import { useMounted } from "@/lib/use-mounted";
import type { ClientJob } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import ListingEvidence from "@/components/ListingEvidence";
import { createPortal } from "react-dom";

const getAvatarStyle = (companyName: string) => {
	const char = companyName.charAt(0).toUpperCase();
	const colors: Record<string, { bg: string; text: string }> = {
		A: { bg: "#e6fcf5", text: "#1A8C7A" },
		E: { bg: "#f3e8ff", text: "#7e22ce" },
		H: { bg: "#dcfce7", text: "#15803d" },
		M: { bg: "#ffedd5", text: "#c2410c" },
		P: { bg: "#e0e7ff", text: "#4338ca" },
		S: { bg: "#fee2e2", text: "#b91c1c" },
	};
	return colors[char] || { bg: "#f1f5f9", text: "#4A6080" };
};

type VaultDoc = {
	id: string;
	name: string;
	type: string;
	size: string;
	uploadedAt: string | null;
	base64: string | null;
};

function MatchesPage() {
 const routeQuery = useSearchParams().toString();
	const mounted = useMounted();
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [profilePhase, setProfilePhase] = useState("licensed");
	const [jobs, setJobs] = useState<ClientJob[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const loadedEmail = useRef<string | null>(null);
	const loadSequence = useRef(0);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

	const [activeFilter, setActiveFilter] = useState<string | null>(null);
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [toolkitJob, setToolkitJob] = useState<ClientJob | null>(null);
	const applicationDialogRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!toolkitJob) return;
		const previousFocus = document.activeElement as HTMLElement | null;
		applicationDialogRef.current?.focus();
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setToolkitJob(null);
			if (event.key !== "Tab") return;
			const controls = Array.from(applicationDialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea, input, [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0);
			const first = controls[0], last = controls[controls.length - 1];
			if (event.shiftKey && (document.activeElement === first || document.activeElement === applicationDialogRef.current)) { event.preventDefault(); last?.focus(); }
			else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
		};
		document.addEventListener("keydown", handleKey);
		return () => { document.removeEventListener("keydown", handleKey); previousFocus?.focus(); };
	}, [toolkitJob]);
	const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([]);

	const [coverLetter, setCoverLetter] = useState("");
	const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	// TRACK DECLINED INVITATIONS TO DISMISS CARDS INSTANTLY
	const [declinedJobIds, setDeclinedJobIds] = useState<string[]>([]);

	const showToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const loadData = useCallback(() => {
		const sequence = ++loadSequence.current;
		const activeEmail = localStorage.getItem("labpro_active_user");
		const isCurrent = () => sequence === loadSequence.current && activeEmail === localStorage.getItem("labpro_active_user");
		setLoadError(null);
		const careerPhase =
			localStorage.getItem("labpro_career_phase") || "licensed";
        setProfilePhase(careerPhase);

		// 🚀 RESTORE DECLINED JOBS FROM STORAGE ON LOAD
		const savedDeclined = localStorage.getItem("labpro_declined_jobs");
		if (savedDeclined) {
			setDeclinedJobIds(JSON.parse(savedDeclined));
		}

		const initialDocs: VaultDoc[] =
			careerPhase === "internship"
				? [
						{
							id: "cv",
							name: "Master Curriculum Vitae",
							type: "PDF",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
						{
							id: "provisional",
							name: "MLSCN Provisional License",
							type: "PDF / Image",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
						{
							id: "result",
							name: "B.MLS Statement of Result",
							type: "PDF / Image",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
					]
				: [
						{
							id: "cv",
							name: "Master Curriculum Vitae",
							type: "PDF",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
						{
							id: "license",
							name: "MLSCN Practicing License",
							type: "PDF / Image",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
						{
							id: "degree",
							name: "B.MLS Degree Certificate",
							type: "PDF / Image",
							size: "-",
							uploadedAt: null,
							base64: null,
						},
					];

		if (!activeEmail) {
			loadedEmail.current = null;
			setIsRefreshing(false);
			setIsUserLoggedIn(false);
			setJobs([]);
			setAppliedJobs([]);
			setVaultDocs(initialDocs);
			setIsLoading(false);
			return;
		}

		setIsUserLoggedIn(true);
		const firstLoad = loadedEmail.current !== activeEmail;
		setIsLoading(firstLoad);
		setIsRefreshing(!firstLoad);
		if (firstLoad) { setJobs([]); setAppliedJobs([]); setVaultDocs(initialDocs); }

		const searchParams = new URLSearchParams(routeQuery);
		const employerParam = searchParams.get("employer");
        const selectedJob = searchParams.get("job");
        const search = searchParams.get("search");
		setActiveFilter(employerParam || search || (selectedJob ? "Selected vacancy" : null));

		sharedPageRequest(`/api/jobs?email=${encodeURIComponent(activeEmail)}`)
			.then(async (res) => { if (!res.ok) throw new Error("Matches unavailable"); return res.json(); })
			.then((data) => {
				if (!isCurrent()) return;
				if (!Array.isArray(data)) {
					throw new Error("Invalid matches response");
				}

				let myJobs = data;

				if (employerParam) {
					myJobs = myJobs.filter(
						(j: ClientJob) => j.company.trim() === employerParam,
					);
				}

                if (selectedJob) myJobs = myJobs.filter((job: ClientJob) => job.id === selectedJob);
                if (search) myJobs = myJobs.filter((job: ClientJob) => `${job.role} ${job.company}`.toLowerCase().includes(search.toLowerCase()));
				setJobs(myJobs);
				const alreadyApplied = myJobs
					.filter((j: ClientJob) => j.applied === true)
					.map((j: ClientJob) => j.id);
				setAppliedJobs(alreadyApplied);
				loadedEmail.current = activeEmail;
				setIsLoading(false);
				setIsRefreshing(false);
			})
			.catch(() => {
				if (!isCurrent()) return;
				setLoadError(loadedEmail.current === activeEmail ? "Couldn’t refresh matches. Your previous results are still shown." : "Couldn’t load your matches. Please try again.");
				setIsLoading(false);
				setIsRefreshing(false);
			});

		sharedPageRequest(`/api/user?email=${encodeURIComponent(activeEmail)}`)
			.then((res) => res.json())
			.then((data) => {
				if (!isCurrent()) return;
				if (data.success && data.user) {
					const updatedDocs = [...initialDocs];
					if (data.user.resumeUrl)
						updatedDocs[0] = {
							...updatedDocs[0],
							base64: data.user.resumeUrl,
							size: "Secure",
							uploadedAt: "Cloud",
						};

					if (careerPhase === "internship") {
						if (data.user.provisionalUrl)
							updatedDocs[1] = {
								...updatedDocs[1],
								base64: data.user.provisionalUrl,
								size: "Secure",
								uploadedAt: "Cloud",
							};
						if (data.user.statementOfResultUrl)
							updatedDocs[2] = {
								...updatedDocs[2],
								base64: data.user.statementOfResultUrl,
								size: "Secure",
								uploadedAt: "Cloud",
							};
					} else {
						if (data.user.licenseUrl)
							updatedDocs[1] = {
								...updatedDocs[1],
								base64: data.user.licenseUrl,
								size: "Secure",
								uploadedAt: "Cloud",
							};
						if (data.user.degreeUrl)
							updatedDocs[2] = {
								...updatedDocs[2],
								base64: data.user.degreeUrl,
								size: "Secure",
								uploadedAt: "Cloud",
							};
					}
					setVaultDocs(updatedDocs);
				}
			})
			.catch(() => console.error("Failed to load user vault URLs"));
	}, [routeQuery]);

	useEffect(() => {
		startTransition(() => { loadData(); });
		window.addEventListener("userStateChanged", loadData);
		window.addEventListener("jobsUpdated", loadData);
		window.addEventListener("refreshNotifications", loadData);

		return () => {
			window.removeEventListener("userStateChanged", loadData);
			window.removeEventListener("jobsUpdated", loadData);
			window.removeEventListener("refreshNotifications", loadData);
		};
	}, [loadData]);

	const clearFilter = () => { window.history.pushState({}, "", "/matches"); };

	// 🚀 HANDLER TO DECLINE AN INVITATION AND SAVE LOCALLY
	const handleDeclinePlacement = async (e: React.MouseEvent, job: ClientJob) => {
		e.stopPropagation();

		const updatedDeclines = [...declinedJobIds, job.id];
		setDeclinedJobIds(updatedDeclines);
		localStorage.setItem(
			"labpro_declined_jobs",
			JSON.stringify(updatedDeclines),
		);

		showToast("Recruitment invitation declined.", "error");

		try {
			const activeEmail = localStorage.getItem("labpro_active_user");
			await fetch("/api/notifications/decline", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: activeEmail,
					company: job.company,
					role: job.role,
					jobId: job.id,
				}),
			});
		} catch (err) {
			console.error("Failed to log decline operation:", err);
		}
	};

	// Filter out all applied AND declined items
	const unappliedJobs = jobs.filter(
		(j) => !appliedJobs.includes(j.id) && !declinedJobIds.includes(j.id),
	);

	// STRICT VIP FILTER: Only show jobs explicitly flagged by an active CRM Headhunting Invitation
	const scoutedJobs = unappliedJobs.filter((j) => j.isScoutedInvite);
	const regularJobs = unappliedJobs.filter(
		(j) => !scoutedJobs.some((sj) => sj.id === j.id),
	);

	const t1Jobs = regularJobs.filter((j) => j.tier === 1);
	const t2Jobs = regularJobs.filter((j) => j.tier === 2);
	const t3Jobs = regularJobs.filter((j) => j.tier === 3);

	const calculateDynamicStats = () => {
		const totalScore = unappliedJobs.reduce(
			(acc, j) => acc + (j.score || 0),
			0,
		);
		const avgScore =
			unappliedJobs.length > 0
				? Math.round(totalScore / unappliedJobs.length)
				: 0;
		let grade = "N/A";
		if (avgScore >= 85) grade = "A";
		else if (avgScore >= 75) grade = "A-";
		else if (avgScore >= 65) grade = "B+";
		else if (avgScore > 0) grade = "B";
		const todayStr = new Date().toDateString();
		const newToday = unappliedJobs.filter((j) => {
			const jobDate = j.createdAt
				? new Date(j.createdAt).toDateString()
				: todayStr;
			return jobDate === todayStr;
		}).length;
		const primaryLoc =
			unappliedJobs.length > 0
				? unappliedJobs[0].loc.split(",")[0].trim()
				: "your region";
		const rawSkill =
			unappliedJobs.length > 0 && unappliedJobs[0].skills
				? unappliedJobs[0].skills.split(",")[0].trim()
				: "Diagnostics";
		const primarySkill =
			rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1).toLowerCase();
		return { avgScore, grade, newToday, primaryLoc, primarySkill };
	};

	const dynamicStats = calculateDynamicStats();

	const handleInitiateApply = async (job: ClientJob) => {
		if (
			!job.isDirectPost &&
			(!job.url ||
				job.url === "#" ||
				job.url === "https://www.myjobmag.comundefined" ||
				job.url.trim() === "")
		) {
			setShowLinkModal(true);
			return;
		}
		setToolkitJob(job);
		setCoverLetter("");
		setIsGeneratingLetter(false);
	};

	const generateCoverLetter = async (job: ClientJob) => {
		setIsGeneratingLetter(true);

		try {
			const activeEmail = localStorage.getItem("labpro_active_user");
			const res = await fetch("/api/generate-letter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: activeEmail, jobId: job.id }),
			});
			const data = await res.json();
			if (data.success) {
				setCoverLetter(data.letter);
			} else {
				setCoverLetter(`Error generating letter: ${data.error}`);
				showToast("Gemini failed to generate draft.", "error");
			}
		} catch {
			setCoverLetter("Network error. Could not connect to AI Engine.");
			showToast("Network error.", "error");
		} finally {
			setIsGeneratingLetter(false);
		}
	};

	const executeFinalApply = async () => {
		if (!toolkitJob) return;

		const activeEmail = localStorage.getItem("labpro_active_user");

		if (!appliedJobs.includes(toolkitJob.id)) {
			try {
				const response = await fetch("/api/apply", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ jobId: toolkitJob.id, email: activeEmail }),
				});
                if (!response.ok) {
                    const failure = await response.json().catch(() => ({}));
                    showToast(failure.error || "Your application could not be submitted. Please try again.", "error");
                    return;
                }
                setAppliedJobs((prev) => [...prev, toolkitJob.id]);
				window.dispatchEvent(new Event("jobsUpdated"));
			} catch {
				showToast("Your application could not be submitted. Please try again.", "error");
                return;
			}
		}

		if (toolkitJob.isDirectPost) {
			showToast(
				"Application securely delivered to Employer's B2B Inbox!",
				"success",
			);
			setToolkitJob(null);
			return;
		}

		let finalUrl = toolkitJob.url?.trim() || "";

		// 🚀 NEW: Intercept email links and open mail app
		if (finalUrl.toLowerCase().startsWith("mailto:")) {
			window.location.href = finalUrl;
			setToolkitJob(null);
			return;
		}

		if (finalUrl.includes("myjobmag.comhttps://"))
			finalUrl = "https://" + finalUrl.split("https://")[1];
		if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://"))
			finalUrl = "https://" + finalUrl;

		try {
			new URL(finalUrl);
			window.open(finalUrl, "_blank", "noopener,noreferrer");
		} catch {
			setShowLinkModal(true);
		}
		setToolkitJob(null);
	};

	const copyCoverLetter = () => {
		navigator.clipboard.writeText(coverLetter);
		showToast("Cover Letter copied to clipboard!");
	};



	const renderJobRow = (j: ClientJob) => {
		const isApplied = appliedJobs.includes(j.id);
		const avatar = getAvatarStyle(j.company);

		return (
			<tr
				key={j.id}
				style={{
					borderBottom: "1px solid rgba(0,0,0,0.05)",
					opacity: isApplied ? 0.6 : 1,
					transition: "all 0.3s",
					backgroundColor: isApplied
						? "rgba(241, 245, 249, 0.4)"
						: "transparent",
				}}
			>
				<td data-label="Role & Company" style={{ padding: "1.25rem 1.5rem" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
						<div
							style={{
								width: "42px",
								height: "42px",
								borderRadius: "50%",
								background: avatar.bg,
								color: avatar.text,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: 800,
								fontSize: "18px",
								flexShrink: 0,
							}}
						>
							{j.company.charAt(0).toUpperCase()}
						</div>
						<div>
							<div
								style={{
									fontWeight: 800,
									color: "#0f172a",
									fontSize: "14.5px",
									marginBottom: "4px",
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}
							>
								{j.role}
								{j.isDirectPost && (
									<span
										style={{
											background: "#e6fcf5",
											color: "#1A8C7A",
											border: "1px solid rgba(26, 140, 122, 0.2)",
											fontSize: "9px",
											fontWeight: 800,
											padding: "2px 6px",
											borderRadius: "6px",
											textTransform: "uppercase",
											letterSpacing: "0.5px",
											display: "inline-flex",
											alignItems: "center",
											gap: "4px",
										}}
									>
										<svg
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="3"
										>
											<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
											<polyline points="22 4 12 14.01 9 11.01"></polyline>
										</svg>{" "}
										B2B Direct
									</span>
								)}
							</div>
							<div style={{ fontSize: "13px", color: "#64748b" }}>
								{j.company}
								<ListingEvidence job={j} />
							</div>
						</div>
					</div>
				</td>
				<td
					data-label="Location"
					style={{
						padding: "1.25rem 1rem",
						color: "#64748b",
						fontSize: "13px",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#94a3b8"
							strokeWidth="2"
						>
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
							<circle cx="12" cy="10" r="3" />
						</svg>{" "}
						{j.loc}
					</div>
				</td>
				<td data-label="Salary" style={{ padding: "1.25rem 1rem" }}>
					<div
						style={{ fontWeight: 800, color: "#0f172a", fontSize: "13.5px" }}
					>
						{j.salary === "Competitive" ? "Competitive" : j.salary}
					</div>
				</td>
				<td className="job-skills" data-label="Skills" style={{ padding: "1.25rem 1rem" }}>
					<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
						{j.skills
							.split(",")
							.slice(0, 3)
							.map((s: string, i: number) => (
								<span
									key={i}
									style={{
										background: "rgba(26, 140, 122, 0.1)",
										color: "#1A8C7A",
										padding: "4px 10px",
										borderRadius: "6px",
										fontSize: "10.5px",
										fontWeight: 800,
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									{s.trim()}
								</span>
							))}
					</div>
				</td>
				<td className="job-score-cell" data-label="Match Score" style={{ padding: "1.25rem 1rem" }}>
					<span className={`job-score${j.isDirectPost ? " job-score-direct" : ""}`} aria-label={j.isDirectPost ? "Employer posted" : `${j.score}% relevance`}
						style={{
							border: `2px solid ${j.tier === 1 ? "#1A8C7A" : j.tier === 2 ? "#0B2444" : "#94a3b8"}`,
							borderRadius: "50%",
							width: "40px",
							height: "40px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontWeight: 800,
							fontSize: "15px",
							color:
								j.tier === 1 ? "#1A8C7A" : j.tier === 2 ? "#0B2444" : "#94a3b8",
						}}
					>
						{j.isDirectPost ? "—" : j.score}
					</span>
				</td>
				<td
					data-label="Action"
					style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}
				>
					<button
						onClick={() => handleInitiateApply(j)}
						disabled={isApplied}
						style={{
							background: "transparent",
							color: isApplied ? "#94a3b8" : "#0B2444",
							border: "none",
							fontWeight: 800,
							fontSize: "14px",
							cursor: isApplied ? "default" : "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "flex-end",
							gap: "6px",
							marginLeft: "auto",
							padding: 0,
						}}
					>
						{isApplied ? (
							<>
								Applied{" "}
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</>
						) : (
							<>
								Apply Now{" "}
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
								>
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							</>
						)}
					</button>
				</td>
			</tr>
		);
	};



	return (
		<section className="pane active matches-page" style={{ paddingBottom: "2rem" }}>
			<style
				dangerouslySetInnerHTML={{
					__html: `@keyframes slideDownToast { 0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; } 100% { transform: translate(-50%, 0) scale(1); opacity: 1; } } @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } } .skeleton { background: rgba(255,255,255,0.4); background-image: linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0) 80px); background-size: 1000px 100%; animation: shimmer 2s infinite linear; } @media screen and (max-width: 768px) { .responsive-table table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr { display: block; } .responsive-table thead tr { position: absolute; top: -9999px; left: -9999px; } .responsive-table tr { margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.5) !important; border-radius: 16px; background: rgba(255,255,255,0.6) !important; backdrop-filter: blur(16px); box-shadow: 0 4px 16px -2px rgba(0,0,0,0.03); overflow: hidden; } .responsive-table td { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.03) !important; position: relative; padding: 1rem 1.25rem !important; display: flex; flex-direction: column; gap: 0.25rem; text-align: left !important; } .responsive-table td:last-child { border-bottom: 0 !important; } .responsive-table td::before { content: attr(data-label); font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px; } .hide-mobile { display: none !important; } .responsive-table td:last-child > button { width: 100%; justify-content: center !important; background: rgba(255,255,255,0.8) !important; padding: 12px !important; border-radius: 8px !important; margin-top: 8px; border: 1px solid rgba(0,0,0,0.05) !important; } .responsive-table td:last-child > button:disabled { background: transparent !important; border: none !important; } }`,
				}}
			/>

			{toast && <Toast message={toast.message} type={toast.type} />}

			{showLinkModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100dvh",
						background: "rgba(248, 250, 252, 0.7)",
						backdropFilter: "blur(8px)",
						zIndex: 9999,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "1rem",
					}}
				>
					<div
						style={{
							background: "white",
							width: "100%",
							maxWidth: "380px",
							borderRadius: "20px",
							padding: "2.5rem 2rem",
							textAlign: "center",
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
							border: "1px solid rgba(0,0,0,0.05)",
						}}
					>
						<div
							style={{
								background: "#fef3c7",
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 20px auto",
								color: "#d97706",
							}}
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
								<line x1="12" y1="9" x2="12" y2="13"></line>
								<line x1="12" y1="17" x2="12.01" y2="17"></line>
							</svg>
						</div>
						<h3
							style={{
								fontSize: "20px",
								fontWeight: 800,
								color: "#0f172a",
								margin: "0 0 12px 0",
							}}
						>
							Link Unavailable
						</h3>
						<p
							style={{
								fontSize: "15px",
								color: "#64748b",
								margin: "0 0 32px 0",
								lineHeight: "1.5",
							}}
						>
							An application link was not provided by the job board for this
							listing. Try searching the company directly.
						</p>
						<button
							onClick={() => setShowLinkModal(false)}
							style={{
								width: "100%",
								padding: "14px",
								borderRadius: "12px",
								border: "1px solid #e2e8f0",
								background: "#f8fafc",
								color: "#0f172a",
								fontWeight: 800,
								fontSize: "15px",
								cursor: "pointer",
								transition: "background 0.2s",
							}}
						>
							Okay, got it
						</button>
					</div>
				</div>
			)}

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: "2rem",
				}}
			>
				<div>
					<div
						className="page-title"
						style={{
							fontSize: "28px",
							display: "flex",
							alignItems: "center",
							gap: "12px",
						}}
					>
						{profilePhase === "internship" ? "Placement matches" : "Latest Job Matches"}
						{activeFilter && (
							<span
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									background: "#e6fcf5",
									color: "#1A8C7A",
									padding: "4px 10px",
									borderRadius: "20px",
									fontSize: "11px",
									fontWeight: 800,
									letterSpacing: "0.5px",
									cursor: "pointer",
									border: "1px solid #a7f3d0",
									transition: "0.2s",
								}}
								onClick={clearFilter}
								title="Clear Filter"
							>
								{activeFilter} ✕
							</span>
						)}
					</div>
					<div className="page-sub">
						Pending and completed applications for your review.
					</div>
				</div>
				<button
					aria-label="Preview Email"
					onClick={() => setIsPreviewOpen(true)}
					disabled={unappliedJobs.length === 0 || !isUserLoggedIn}
					style={{
						background: "rgba(255,255,255,0.7)",
						border: "1px solid rgba(255,255,255,0.5)",
						color: "#0B2444",
						padding: "10px 20px",
						borderRadius: "8px",
						fontSize: "14px",
						fontWeight: 700,
						cursor:
							unappliedJobs.length === 0 || !isUserLoggedIn
								? "not-allowed"
								: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						transition: "all 0.2s",
						boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
						opacity: unappliedJobs.length === 0 || !isUserLoggedIn ? 0.5 : 1,
					}}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					>
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
					<span className="hide-mobile">Preview Email</span>
				</button>
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
						Job Matches Locked
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
						Log in or create an account to view your personalized lab job
						matches and apply to roles.
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
			) : (
				<>
					{isRefreshing && <p role="status" style={{ color: "#4A6080", fontSize: 13 }}>Refreshing matches…</p>}
					{loadError && <div role="alert" className="page-load-error"><span>{loadError}</span><button onClick={loadData}>Retry</button></div>}
					{isLoading ? (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "2.5rem",
								minHeight: "50vh",
							}}
						>
							<div>
								<div
									className="skeleton"
									style={{
										width: "250px",
										height: "28px",
										borderRadius: "6px",
										marginBottom: "1.25rem",
									}}
								></div>
								<div
									className="responsive-table"
									style={{
										background: "rgba(255, 255, 255, 0.5)",
										backdropFilter: "blur(24px)",
										borderRadius: "16px",
										border: "1px solid rgba(255, 255, 255, 0.3)",
										overflow: "hidden",
										boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
									}}
								>
									<table style={{ width: "100%", borderCollapse: "collapse" }}>
										<TableHeader />
										<tbody>
											<SkeletonRow />
											<SkeletonRow />
											<SkeletonRow />
										</tbody>
									</table>
								</div>
							</div>
						</div>
					) : loadError && jobs.length === 0 ? null : unappliedJobs.length === 0 ? (
						<div
							style={{
								padding: "4rem",
								textAlign: "center",
								color: "#64748b",
								background: "rgba(255,255,255,0.5)",
								backdropFilter: "blur(16px)",
								borderRadius: "16px",
								minHeight: "40vh",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{activeFilter ? (
								<>
									<p>
										No active roles currently open for{" "}
										<strong>{activeFilter}</strong>.
									</p>
									<button
										onClick={clearFilter}
										style={{
											marginTop: "1rem",
											background: "#f1f5f9",
											border: "1px solid #e2e8f0",
											color: "#475569",
											padding: "8px 16px",
											borderRadius: "8px",
											fontSize: "13px",
											fontWeight: 700,
											cursor: "pointer",
										}}
									>
										View All Matches
									</button>
								</>
							) : (
								"No matches found yet. Run the scraper on the Dashboard!"
							)}
						</div>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "2.5rem",
							}}
						>
							{/* VIP SCOUTED INVITATION SECTION */}
							{scoutedJobs.length > 0 && (
								<div className="scouted-list" style={{ marginBottom: "1rem" }}>
									<h3
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
											fontSize: "20px",
											fontWeight: 800,
											marginBottom: "1.25rem",
											color: "#0f172a",
										}}
									>
										<span
											style={{ whiteSpace: "nowrap", flexShrink: 0,
												background: "#d97706",
												color: "white",
												padding: "4px 12px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 800,
												letterSpacing: "0.5px",
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<svg
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="3"
											>
												<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
											</svg>{" "}
											INVITED
										</span>
										Exclusive Scouted Invitations
									</h3>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr",
											gap: "1.5rem",
										}}
									>
										{scoutedJobs.map((j) => (
											<div
												key={j.id} className="invitation-card"
												style={{
													background:
														"linear-gradient(135deg, #0B2444 0%, #05162a 100%)",
													borderRadius: "20px",
													padding: "2rem",
													color: "white",
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													boxShadow: "0 20px 40px -10px rgba(11, 36, 68, 0.4)",
													border: "1px solid rgba(255,255,255,0.1)",
													position: "relative",
													overflow: "hidden",
													flexWrap: "wrap",
													gap: "1.5rem",
												}}
											>
												{/* Decorative background element */}
												<div
													style={{
														position: "absolute",
														right: "-5%",
														top: "-20%",
														width: "200px",
														height: "200px",
														background: "rgba(26, 140, 122, 0.2)",
														filter: "blur(40px)",
														borderRadius: "50%",
														pointerEvents: "none",
													}}
												></div>

												<div className="invitation-copy" style={{ position: "relative", zIndex: 1 }}>
													<div className="invitation-meta"
														style={{
															display: "flex",
															alignItems: "center",
															gap: "12px",
															marginBottom: "16px",
														}}
													>
														<div
															style={{
																background: "rgba(26, 140, 122, 0.2)",
																border: "1px solid rgba(26, 140, 122, 0.5)",
																color: "#2dd4bf",
																padding: "4px 10px",
																borderRadius: "8px",
																fontSize: "10px",
																fontWeight: 800,
																letterSpacing: "1px",
																textTransform: "uppercase",
															}}
														>
															Direct Invite
														</div>
														<span
															style={{
																color: "#94a3b8",
																fontSize: "13px",
																fontWeight: 600,
															}}
														>
															{j.loc}
														</span>
													</div>
													<h2
														style={{
															fontSize: "24px",
															fontWeight: 900,
															margin: "0 0 8px 0",
															color: "white",
														}}
													>
														{j.role}
													</h2>
													<p
														style={{
															fontSize: "16px",
															color: "#94a3b8",
															margin: 0,
															fontWeight: 500,
														}}
													>
														{j.company}
													</p>
												</div>

												<div className="invitation-footer"
													style={{
														position: "relative",
														zIndex: 1,
														display: "flex",
														flexDirection: "column",
														alignItems: "flex-end",
														gap: "1.25rem",
													}}
												>
													<div
														style={{
															fontSize: "20px",
															fontWeight: 800,
															color: "#2dd4bf",
														}}
													>
														{j.salary === "Competitive"
															? "Competitive"
															: j.salary}
													</div>
													<div className="invitation-actions"
														style={{
															display: "flex",
															gap: "12px",
															alignItems: "center",
														}}
													>
														<button
															onClick={(e) => handleDeclinePlacement(e, j)}
															style={{
																background: "rgba(255,255,255,0.08)",
																border: "1px solid rgba(255,255,255,0.15)",
																color: "#cbd5e1",
																padding: "12px 20px",
																borderRadius: "12px",
																fontSize: "13.5px",
																fontWeight: 700,
																cursor: "pointer",
																transition: "0.2s",
															}}
															onMouseEnter={(e) => {
																e.currentTarget.style.background =
																	"rgba(239, 68, 68, 0.15)";
																e.currentTarget.style.color = "#fca5a5";
																e.currentTarget.style.borderColor =
																	"rgba(239, 68, 68, 0.3)";
															}}
															onMouseLeave={(e) => {
																e.currentTarget.style.background =
																	"rgba(255,255,255,0.08)";
																e.currentTarget.style.color = "#cbd5e1";
																e.currentTarget.style.borderColor =
																	"rgba(255,255,255,0.15)";
															}}
														>
															Decline Invite
														</button>
														<button
															onClick={() => handleInitiateApply(j)}
															style={{
																background: "#1A8C7A",
																color: "white",
																border: "none",
																padding: "13px 26px",
																borderRadius: "12px",
																fontSize: "14px",
																fontWeight: 800,
																cursor: "pointer",
																display: "flex",
																alignItems: "center",
																gap: "8px",
																boxShadow: "0 8px 16px rgba(26, 140, 122, 0.3)",
																transition: "transform 0.2s",
															}}
															onMouseEnter={(e) =>
																(e.currentTarget.style.transform =
																	"scale(1.02)")
															}
															onMouseLeave={(e) =>
																(e.currentTarget.style.transform = "scale(1)")
															}
														>
															Accept invitation{" "}
															<svg
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="3"
															>
																<line x1="5" y1="12" x2="19" y2="12" />
																<polyline points="12 5 19 12 12 19" />
															</svg>
														</button>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{t1Jobs.length > 0 && (
								<div>
									<h3
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
											fontSize: "20px",
											fontWeight: 800,
											marginBottom: "1.25rem",
											color: "#0f172a",
										}}
									>
										<span
											style={{
												background: "#1A8C7A",
												color: "white",
												padding: "4px 12px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 800,
												letterSpacing: "0.5px",
											}}
										>
											TIER 1
										</span>{" "}
										High Priority Matches
									</h3>
									<div
										className="responsive-table"
										style={{
											background: "rgba(255, 255, 255, 0.5)",
											backdropFilter: "blur(24px)",
											borderRadius: "16px",
											border: "1px solid rgba(255, 255, 255, 0.3)",
											overflow: "hidden",
											boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
										}}
									>
										<table
											style={{ width: "100%", borderCollapse: "collapse" }}
										>
											<TableHeader />
											<tbody>{t1Jobs.map(renderJobRow)}</tbody>
										</table>
									</div>
								</div>
							)}
							{t2Jobs.length > 0 && (
								<div>
									<h3
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
											fontSize: "20px",
											fontWeight: 800,
											marginBottom: "1.25rem",
											color: "#0f172a",
										}}
									>
										<span
											style={{
												background: "#0B2444",
												color: "white",
												padding: "4px 12px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 800,
												letterSpacing: "0.5px",
											}}
										>
											TIER 2
										</span>{" "}
										Strong Fits
									</h3>
									<div
										className="responsive-table"
										style={{
											background: "rgba(255, 255, 255, 0.5)",
											backdropFilter: "blur(24px)",
											borderRadius: "16px",
											border: "1px solid rgba(255, 255, 255, 0.3)",
											overflow: "hidden",
											boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
										}}
									>
										<table
											style={{ width: "100%", borderCollapse: "collapse" }}
										>
											<TableHeader />
											<tbody>{t2Jobs.map(renderJobRow)}</tbody>
										</table>
									</div>
								</div>
							)}
							{t3Jobs.length > 0 && (
								<div>
									<h3
										style={{
											display: "flex",
											alignItems: "center",
											gap: "12px",
											fontSize: "20px",
											fontWeight: 800,
											marginBottom: "1.25rem",
											color: "#0f172a",
										}}
									>
										<span
											style={{
												background: "#94a3b8",
												color: "white",
												padding: "4px 12px",
												borderRadius: "20px",
												fontSize: "11px",
												fontWeight: 800,
												letterSpacing: "0.5px",
											}}
										>
											TIER 3
										</span>{" "}
										Potential Opportunities
									</h3>
									<div
										className="responsive-table"
										style={{
											background: "rgba(255, 255, 255, 0.5)",
											backdropFilter: "blur(24px)",
											borderRadius: "16px",
											border: "1px solid rgba(255, 255, 255, 0.3)",
											overflow: "hidden",
											opacity: 0.85,
										}}
									>
										<table
											style={{ width: "100%", borderCollapse: "collapse" }}
										>
											<TableHeader />
											<tbody>{t3Jobs.map(renderJobRow)}</tbody>
										</table>
									</div>
								</div>
							)}
						</div>
					)}

					{!isLoading && unappliedJobs.length > 0 && (
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
								gap: "0.75rem",
								marginTop: "1.25rem",
							}}
						>
							<div
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									padding: "1rem",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: 800,
										color: "#0B2444",
										margin: "0 0 8px 0",
									}}
								>
									Market Insights
								</h4>
								<p
									style={{
										fontSize: "13px",
										color: "#475569",
										lineHeight: "1.6",
										margin: "0 0 1rem 0",
										flex: 1,
									}}
								>
									Saved roles include <strong>{dynamicStats.primaryLoc}</strong>. Check each vacancy’s requirements before applying.
								</p>
								<a
									href="/news"
									style={{
										fontSize: "12px",
										fontWeight: 800,
										color: "#1A8C7A",
										textDecoration: "none",
										display: "flex",
										alignItems: "center",
										gap: "4px",
									}}
								>
									View Trends{" "}
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
									>
										<line x1="7" y1="17" x2="17" y2="7"></line>
										<polyline points="7 7 17 7 17 17"></polyline>
									</svg>
								</a>
							</div>

							<div
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									padding: "1rem",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: 800,
										color: "#1A8C7A",
										margin: "0 0 8px 0",
									}}
								>
									Quick Stats
								</h4>
								<div
									style={{ display: "flex", gap: "1rem", alignItems: "center" }}
								>
									<div style={{ flex: 1 }}>
										<div
											style={{
												fontSize: "26px",
												fontWeight: 900,
												color: "#1A8C7A",
												lineHeight: "1",
											}}
										>
											{dynamicStats.newToday}
										</div>
										<div
											style={{
												fontSize: "10px",
												fontWeight: 800,
												color: "#94a3b8",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
												marginTop: "4px",
											}}
										>
											NEW TODAY
										</div>
									</div>
									<div
										style={{
											height: "40px",
											width: "1px",
											background: "rgba(0,0,0,0.1)",
										}}
									></div>
									<div style={{ flex: 1 }}>
										<div
											style={{
												fontSize: "26px",
												fontWeight: 900,
												color: "#1A8C7A",
												lineHeight: "1",
											}}
										>
											{dynamicStats.avgScore}%
										</div>
										<div
											style={{
												fontSize: "10px",
												fontWeight: 800,
												color: "#94a3b8",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
												marginTop: "4px",
											}}
										>
											AVG MATCH
										</div>
									</div>
								</div>
							</div>

							<div
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									padding: "1rem",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<h4
									style={{
										fontSize: "14px",
										fontWeight: 800,
										color: "#0f172a",
										margin: "0 0 8px 0",
									}}
								>
									Match Summary
								</h4>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "16px",
										flex: 1,
										marginBottom: "1rem",
									}}
								>
									<div
										style={{
											whiteSpace: "nowrap",
											flexShrink: 0,
											fontSize: "28px",
											fontWeight: 900,
											color: "#1A8C7A",
											lineHeight: "1",
										}}
									>
										{dynamicStats.grade}
									</div>
									<div
										style={{
											fontSize: "13px",
											color: "#64748b",
											lineHeight: "1.4",
										}}
									>
										{dynamicStats.grade.includes("A")
											? "Your saved roles have a high average match score."
											: "Based on your saved match scores. Keep your skills up to date."}
									</div>
								</div>
								<button
									onClick={() =>
										window.dispatchEvent(new Event("openProfileModal"))
									}
									style={{
										background: "none",
										border: "none",
										padding: 0,
										fontSize: "12px",
										fontWeight: 800,
										color: "#0B2444",
										textDecoration: "none",
										display: "flex",
										alignItems: "center",
										gap: "4px",
										cursor: "pointer",
									}}
								>
									Optimize Profile &rarr;
								</button>
							</div>
						</div>
					)}

					{mounted &&
						toolkitJob &&
						createPortal(
							<div
								className="application-backdrop"
								style={{
									position: "fixed",
									top: 0,
									left: 0,
									width: "100vw",
									height: "100dvh",
									background: "rgba(248, 250, 252, 0.7)",
									backdropFilter: "blur(8px)",
									zIndex: 10000,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: "1rem",
								}}
							>
								<div
									className="application-dialog"
									ref={applicationDialogRef} tabIndex={-1}
									role="dialog" aria-modal="true" aria-labelledby="application-dialog-title"
									style={{
										background: "white",
										width: "100%",
										maxWidth: "700px",
										borderRadius: "24px",
										display: "flex",
										flexDirection: "column",
										boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
										border: "1px solid rgba(0,0,0,0.05)",
									}}
								>
									<div
										className="application-dialog-header"
										style={{
											padding: "1.5rem 2rem",
											borderBottom: "1px solid #f1f5f9",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<div>
											<h3
												id="application-dialog-title"
												style={{
													fontSize: "20px",
													fontWeight: 800,
													color: "#0f172a",
													margin: 0,
													display: "flex",
													alignItems: "center",
													gap: "8px",
												}}
											>
												<svg
													width="20"
													height="20"
													viewBox="0 0 24 24"
													fill="none"
													stroke="#1A8C7A"
													strokeWidth="2.5"
												>
													<path d="M22 2L11 13"></path>
													<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
												</svg>{" "}
												Application Toolkit
											</h3>
											<p
												style={{
													fontSize: "13px",
													color: "#64748b",
													margin: "4px 0 0 0",
												}}
											>
												{toolkitJob.role} at {toolkitJob.company}
											</p>
										</div>
										<button
											aria-label="Close application toolkit"
											onClick={() => setToolkitJob(null)}
											style={{
												background: "#f1f5f9",
												border: "none",
												width: "32px",
												height: "32px",
												borderRadius: "50%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
												color: "#64748b",
												transition: "0.2s",
											}}
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
											>
												<line x1="18" y1="6" x2="6" y2="18" />
												<line x1="6" y1="6" x2="18" y2="18" />
											</svg>
										</button>
									</div>

									<div className="application-dialog-body" tabIndex={0} aria-label="Application details">
									{/* 🚀 RESTORED: DISPLAY JOB INSTRUCTIONS IF THEY EXIST */}
									{toolkitJob.desc && (
										<div
											style={{
												padding: "1.5rem 2rem 0 2rem",
												background: "#f8fafc",
											}}
										>
											<div
												style={{
													background: "rgba(26, 140, 122, 0.05)",
													border: "1px solid rgba(26, 140, 122, 0.2)",
													borderRadius: "12px",
													padding: "1rem",
												}}
											>
												<h4
													style={{
														margin: "0 0 6px 0",
														fontSize: "11px",
														fontWeight: 800,
														color: "#1A8C7A",
														textTransform: "uppercase",
														letterSpacing: "0.5px",
													}}
												>
													Placement Instructions
												</h4>
												<p
													style={{
														margin: 0,
														fontSize: "13px",
														color: "#334155",
														lineHeight: "1.6",
														whiteSpace: "pre-wrap",
													}}
												>
													{toolkitJob.desc}
												</p>
											</div>
										</div>
									)}

									<div
										className="mobile-stack"
										style={{
											padding: "2rem",
											display: "flex",
											gap: "2rem",
											background: "#f8fafc",
										}}
									>
										<div
											style={{
												flex: 1,
												display: "flex",
												flexDirection: "column",
												gap: "1rem",
											}}
										>
											<h4
												style={{
													margin: 0,
													fontSize: "12px",
													fontWeight: 800,
													color: "#475569",
													letterSpacing: "0.5px",
												}}
											>
												YOUR VAULT DOCUMENTS
											</h4>
											{vaultDocs.map((doc) => (
												<div
													key={doc.id}
													style={{
														background: "white",
														padding: "1rem",
														borderRadius: "12px",
														border: "1px solid #e2e8f0",
														display: "flex",
														alignItems: "center",
														justifyContent: "space-between",
													}}
												>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: "12px",
														}}
													>
														<div
															style={{
																width: "32px",
																height: "32px",
																borderRadius: "8px",
																background: doc.base64 ? "#e6fcf5" : "#f1f5f9",
																color: doc.base64 ? "#1A8C7A" : "#94a3b8",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
															}}
														>
															<svg
																width="16"
																height="16"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2.5"
															>
																<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
																<polyline points="14 2 14 8 20 8"></polyline>
															</svg>
														</div>
														<div>
															<div
																style={{
																	fontSize: "13px",
																	fontWeight: 700,
																	color: "#0f172a",
																}}
															>
																{doc.name}
															</div>
															<div
																style={{
																	fontSize: "11px",
																	color: doc.base64 ? "#1A8C7A" : "#ef4444",
																	fontWeight: 600,
																}}
															>
																{doc.base64 ? "Ready" : "Missing in Vault"}
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
										<div
											style={{
												flex: 1.5,
												display: toolkitJob.isDirectPost ? "none" : "flex",
												flexDirection: "column",
												gap: "1rem",
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<h4
													style={{
														margin: 0,
														fontSize: "12px",
														fontWeight: 800,
														color: "#475569",
														letterSpacing: "0.5px",
													}}
												>
													AI COVER LETTER DRAFT
												</h4>
												<div
													style={{
														display: "flex",
														gap: "12px",
														alignItems: "center",
													}}
												>
													<button
														onClick={() => generateCoverLetter(toolkitJob)}
														disabled={isGeneratingLetter}
														style={{
															background: "none",
															border: "none",
															color: "#0B2444",
															fontSize: "12px",
															fontWeight: 700,
															cursor: isGeneratingLetter ? "wait" : "pointer",
															display: "flex",
															alignItems: "center",
															gap: "4px",
															opacity: isGeneratingLetter ? 0.5 : 1,
														}}
													>
														<svg
															width="12"
															height="12"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														>
															<polyline points="23 4 23 10 17 10"></polyline>
															<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
														</svg>{" "}
														{coverLetter ? "Regenerate" : "Generate draft"}
													</button>
													<button
														onClick={copyCoverLetter}
														style={{
															background: "none",
															border: "none",
															color: "#0B2444",
															fontSize: "12px",
															fontWeight: 700,
															cursor: "pointer",
															display: "flex",
															alignItems: "center",
															gap: "4px",
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
															<rect
																x="9"
																y="9"
																width="13"
																height="13"
																rx="2"
																ry="2"
															></rect>
															<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
														</svg>{" "}
														Copy Text
													</button>
												</div>
											</div>
											<p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>Generate draft sends your saved CV text and this listing to Google AI. You can also write your own letter below.</p>
                                            {isGeneratingLetter ? (
												<div
													style={{
														width: "100%",
														height: "100%",
														minHeight: "180px",
														borderRadius: "12px",
														border: "1px dashed #1A8C7A",
														background: "rgba(26, 140, 122, 0.05)",
														display: "flex",
														flexDirection: "column",
														alignItems: "center",
														justifyContent: "center",
														gap: "12px",
													}}
												>
													<style
														dangerouslySetInnerHTML={{
															__html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
														}}
													/>
													<div
														style={{
															animation: "spin 1s linear infinite",
															border: "3px solid #e2e8f0",
															borderTop: "3px solid #1A8C7A",
															borderRadius: "50%",
															width: "24px",
															height: "24px",
														}}
													></div>
													<span
														style={{
															fontSize: "13px",
															color: "#1A8C7A",
															fontWeight: 700,
														}}
													>
														Gemini is drafting your letter...
													</span>
												</div>
											) : (
												<textarea
															placeholder="Write your cover letter here, or generate a draft using Google AI."
													value={coverLetter}
													onChange={(e) => setCoverLetter(e.target.value)}
													style={{
														width: "100%",
														height: "100%",
														minHeight: "180px",
														padding: "1rem",
														borderRadius: "12px",
														border: "1px solid #cbd5e1",
														outline: "none",
														resize: "none",
														fontSize: "13px",
														color: "#334155",
														lineHeight: "1.5",
														fontFamily: "inherit",
													}}
												/>
											)}
										</div>
									</div>
									</div>
									<div
										className="application-dialog-footer"
										style={{
											padding: "1.5rem 2rem",
											background: "white",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderTop: "1px solid #f1f5f9",
											borderRadius: "0 0 24px 24px",
										}}
									>
										<span
											className="hide-mobile"
											style={{
												fontSize: "12px",
												color: "#64748b",
												fontWeight: 600,
											}}
										>
											{toolkitJob.isDirectPost ? "Submitting shares your vault documents with this employer." : "Downloads will save directly to your device."}
										</span>
										<button
											onClick={executeFinalApply}
											style={{
												background: "#0B2444",
												color: "white",
												border: "none",
												padding: "12px 24px",
												borderRadius: "10px",
												fontSize: "14px",
												fontWeight: 700,
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "8px",
												boxShadow: "0 4px 12px rgba(11, 36, 68, 0.2)",
											}}
										>
											{toolkitJob.isDirectPost
												? "Submit Application Now"
												: "Proceed to Job Board"}{" "}
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
											>
												<line x1="5" y1="12" x2="19" y2="12" />
												<polyline points="12 5 19 12 12 19" />
											</svg>
										</button>
									</div>
								</div>
							</div>,
							document.body,
						)}

					{mounted &&
						isPreviewOpen &&
						createPortal(
							<div className="digest-preview-backdrop"
								style={{
									position: "fixed",
									top: 0,
									left: 0,
									width: "100vw",
									height: "100dvh",
									background: "rgba(248, 250, 252, 0.7)",
									backdropFilter: "blur(8px)",
									zIndex: 10000,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: "1rem",
								}}
							>
								<div className="digest-preview-dialog" role="dialog" aria-modal="true" aria-label="Email digest preview"
									style={{
										background: "white",
										width: "100%",
										maxWidth: "650px",
										maxHeight: "calc(100dvh - 2rem)",
										borderRadius: "20px",
										overflow: "hidden",
										display: "flex",
										flexDirection: "column",
										boxShadow: "0 20px 40px -4px rgba(0, 0, 0, 0.1)",
										border: "1px solid rgba(0,0,0,0.05)",
									}}
								>
									<div className="digest-preview-header"
										style={{
											padding: "1.25rem 1.5rem",
											background: "white",
											borderBottom: "1px solid #e2e8f0",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<div>
											<h3
												style={{
													fontSize: "16px",
													fontWeight: 800,
													color: "#0f172a",
													margin: 0,
												}}
											>
												Automated Digest Preview
											</h3>
											<p
												style={{
													fontSize: "12px",
													color: "#64748b",
													margin: "2px 0 0 0",
												}}
											>
												Preview of saved matches. Delivered digests follow your alert preferences.
											</p>
										</div>
										<button
											aria-label="Close digest preview"
											onClick={() => setIsPreviewOpen(false)}
											style={{
												background: "#f1f5f9",
												border: "none",
												width: "32px",
												height: "32px",
												borderRadius: "50%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
												color: "#64748b",
												transition: "background 0.2s",
											}}
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
											>
												<line x1="18" y1="6" x2="6" y2="18" />
												<line x1="6" y1="6" x2="18" y2="18" />
											</svg>
										</button>
									</div>
                                    <iframe title="BenchScout email digest preview" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={buildJobDigest(unappliedJobs.filter(job => !job.isDirectPost && job.status === "active" && listingUrl(job.url)).slice(0, 15), { appUrl: window.location.origin }).html} style={{ border: 0, width: "100%", minHeight: 0, flex: 1, height: "100%", background: "#eef3f7" }} />
								</div>
							</div>,
							document.body,
						)}
				</>
			)}
		</section>
	);
}

export default function MatchesRoute() { return <Suspense fallback={<p>Loading matches…</p>}><MatchesPage /></Suspense>; }
