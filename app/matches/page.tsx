"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const getAvatarStyle = (companyName: string) => {
	const char = companyName.charAt(0).toUpperCase();
	const colors: Record<string, { bg: string; text: string }> = {
		A: { bg: "#e0f2fe", text: "#0284c7" },
		E: { bg: "#f3e8ff", text: "#7e22ce" },
		H: { bg: "#dcfce7", text: "#15803d" },
		M: { bg: "#ffedd5", text: "#c2410c" },
		P: { bg: "#e0e7ff", text: "#4338ca" },
		S: { bg: "#fee2e2", text: "#b91c1c" },
	};
	return colors[char] || { bg: "#f1f5f9", text: "#475569" };
};

type VaultDoc = {
	id: string;
	name: string;
	type: string;
	size: string;
	uploadedAt: string | null;
	base64: string | null;
};

const DEFAULT_DOCS: VaultDoc[] = [
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

export default function MatchesPage() {
	const [mounted, setMounted] = useState(false);
	const [jobs, setJobs] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

	const [showLinkModal, setShowLinkModal] = useState(false);

	const [toolkitJob, setToolkitJob] = useState<any | null>(null);
	const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>(DEFAULT_DOCS);

	// 🚀 AI ENGINE STATE
	const [coverLetter, setCoverLetter] = useState("");
	const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	const showToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3000);
	};

	const loadData = () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) {
			setJobs([]);
			setAppliedJobs([]);
			setVaultDocs(DEFAULT_DOCS);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		fetch(`/api/jobs?email=${activeEmail}`)
			.then((res) => res.json())
			.then((data) => {
				let myJobs = data || [];
				if (Array.isArray(myJobs)) {
					myJobs = myJobs.filter(
						(j: any) =>
							(j.targetEmail === activeEmail ||
								j.userEmail === activeEmail ||
								j.email === activeEmail ||
								(!j.targetEmail && !j.userEmail && !j.email)) &&
							j.status !== "cleared",
					);
				}

				setJobs(myJobs);
				const alreadyApplied = myJobs
					.filter((j: any) => j.applied === true)
					.map((j: any) => j.id);
				setAppliedJobs(alreadyApplied);
				setIsLoading(false);
			})
			.catch(() => setIsLoading(false));

		// Load actual vault docs (including live URLs)
		fetch(`/api/user?email=${activeEmail}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.success && data.user) {
					const updatedDocs = [...DEFAULT_DOCS];
					if (data.user.resumeUrl) {
						updatedDocs[0] = {
							...updatedDocs[0],
							base64: data.user.resumeUrl,
							size: "Secure",
							uploadedAt: "Cloud",
						};
					}
					if (data.user.licenseUrl) {
						updatedDocs[1] = {
							...updatedDocs[1],
							base64: data.user.licenseUrl,
							size: "Secure",
							uploadedAt: "Cloud",
						};
					}
					if (data.user.degreeUrl) {
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
	};

	useEffect(() => {
		setMounted(true);
		loadData();

		window.addEventListener("userStateChanged", loadData);
		window.addEventListener("jobsUpdated", loadData);

		return () => {
			window.removeEventListener("userStateChanged", loadData);
			window.removeEventListener("jobsUpdated", loadData);
		};
	}, []);

	const unappliedJobs = jobs.filter((j) => !appliedJobs.includes(j.id));
	const t1Jobs = unappliedJobs.filter((j) => j.tier === 1);
	const t2Jobs = unappliedJobs.filter((j) => j.tier === 2);
	const t3Jobs = unappliedJobs.filter((j) => j.tier === 3);

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

	// 🚀 REWIRED: Calls the Gemini API
	const handleInitiateApply = async (job: any) => {
		if (
			!job.url ||
			job.url === "#" ||
			job.url === "https://www.myjobmag.comundefined" ||
			job.url.trim() === ""
		) {
			setShowLinkModal(true);
			return;
		}

		setToolkitJob(job);
		setCoverLetter(""); // Clear old text
		setIsGeneratingLetter(true); // Start loading spinner

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
				showToast(data.error, "error");
			}
		} catch (error) {
			setCoverLetter("Network error. Could not connect to AI Engine.");
			showToast("Network error.", "error");
		} finally {
			setIsGeneratingLetter(false);
		}
	};

	const executeFinalApply = async () => {
		if (!toolkitJob) return;

		let finalUrl = toolkitJob.url.trim();
		if (finalUrl.includes("myjobmag.comhttps://"))
			finalUrl = "https://" + finalUrl.split("https://")[1];
		if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://"))
			finalUrl = "https://" + finalUrl;

		try {
			new URL(finalUrl);
			window.open(finalUrl, "_blank", "noopener,noreferrer");

			if (!appliedJobs.includes(toolkitJob.id)) {
				setAppliedJobs((prev) => [...prev, toolkitJob.id]);
				await fetch("/api/apply", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ jobId: toolkitJob.id }),
				});
				window.dispatchEvent(new Event("jobsUpdated"));
			}
			setToolkitJob(null);
		} catch (error) {
			setShowLinkModal(true);
			setToolkitJob(null);
		}
	};

	const copyCoverLetter = () => {
		navigator.clipboard.writeText(coverLetter);
		showToast("Cover Letter copied to clipboard!");
	};

	const SkeletonRow = () => (
		<tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
			<td style={{ padding: "1.25rem 1.5rem" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<div
						className="skeleton"
						style={{
							width: "42px",
							height: "42px",
							borderRadius: "50%",
							flexShrink: 0,
						}}
					></div>
					<div>
						<div
							className="skeleton"
							style={{
								width: "150px",
								height: "14px",
								marginBottom: "6px",
								borderRadius: "4px",
							}}
						></div>
						<div
							className="skeleton"
							style={{ width: "100px", height: "12px", borderRadius: "4px" }}
						></div>
					</div>
				</div>
			</td>
			<td className="hide-mobile" style={{ padding: "1.25rem 1rem" }}>
				<div
					className="skeleton"
					style={{ width: "80px", height: "14px", borderRadius: "4px" }}
				></div>
			</td>
			<td className="hide-mobile" style={{ padding: "1.25rem 1rem" }}>
				<div
					className="skeleton"
					style={{ width: "70px", height: "14px", borderRadius: "4px" }}
				></div>
			</td>
			<td className="hide-mobile" style={{ padding: "1.25rem 1rem" }}>
				<div style={{ display: "flex", gap: "6px" }}>
					<div
						className="skeleton"
						style={{ width: "50px", height: "20px", borderRadius: "6px" }}
					></div>
					<div
						className="skeleton"
						style={{ width: "60px", height: "20px", borderRadius: "6px" }}
					></div>
				</div>
			</td>
			<td className="hide-mobile" style={{ padding: "1.25rem 1rem" }}>
				<div
					className="skeleton"
					style={{ width: "40px", height: "40px", borderRadius: "50%" }}
				></div>
			</td>
			<td style={{ padding: "1.25rem 1.5rem" }}>
				<div
					className="skeleton"
					style={{
						width: "80px",
						height: "30px",
						borderRadius: "8px",
						marginLeft: "auto",
					}}
				></div>
			</td>
		</tr>
	);

	const renderJobRow = (j: any) => {
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
									marginBottom: "2px",
								}}
							>
								{j.role}
							</div>
							<div style={{ fontSize: "13px", color: "#64748b" }}>
								{j.company}
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
						</svg>
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
				<td data-label="Skills" style={{ padding: "1.25rem 1rem" }}>
					<div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
						{j.skills
							.split(",")
							.slice(0, 3)
							.map((s: string, i: number) => (
								<span
									key={i}
									style={{
										background: "rgba(240, 249, 255, 0.8)",
										color: "#0284c7",
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
				<td data-label="Match Score" style={{ padding: "1.25rem 1rem" }}>
					<span
						style={{
							border: `2px solid ${j.tier === 1 ? "#22c55e" : j.tier === 2 ? "#0284c7" : "#94a3b8"}`,
							borderRadius: "50%",
							width: "40px",
							height: "40px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontWeight: 800,
							fontSize: "15px",
							color:
								j.tier === 1 ? "#22c55e" : j.tier === 2 ? "#0284c7" : "#94a3b8",
						}}
					>
						{j.score}
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
							color: isApplied ? "#94a3b8" : "#0058bc",
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

	const TableHeader = () => (
		<thead
			style={{
				background: "rgba(255, 255, 255, 0.4)",
				borderBottom: "1px solid rgba(0,0,0,0.05)",
			}}
		>
			<tr>
				<th
					style={{
						padding: "1rem 1.5rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "left",
					}}
				>
					Role / Company
				</th>
				<th
					style={{
						padding: "1rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "left",
					}}
				>
					Location
				</th>
				<th
					style={{
						padding: "1rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "left",
					}}
				>
					Salary
				</th>
				<th
					style={{
						padding: "1rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "left",
					}}
				>
					Skills
				</th>
				<th
					style={{
						padding: "1rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "left",
					}}
				>
					Score
				</th>
				<th
					style={{
						padding: "1rem 1.5rem",
						fontSize: "11px",
						fontWeight: 800,
						color: "#94a3b8",
						textTransform: "uppercase",
						letterSpacing: "1px",
						textAlign: "right",
					}}
				>
					Action
				</th>
			</tr>
		</thead>
	);

	return (
		<section className="pane active" style={{ paddingBottom: "2rem" }}>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes slideDownToast { 0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; } 100% { transform: translate(-50%, 0) scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .skeleton { background: rgba(255,255,255,0.4); background-image: linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0) 80px); background-size: 1000px 100%; animation: shimmer 2s infinite linear; }
        
        @media screen and (max-width: 768px) {
          .responsive-table table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr { display: block; }
          .responsive-table thead tr { position: absolute; top: -9999px; left: -9999px; }
          .responsive-table tr { margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.5) !important; border-radius: 16px; background: rgba(255,255,255,0.6) !important; backdrop-filter: blur(16px); box-shadow: 0 4px 16px -2px rgba(0,0,0,0.03); overflow: hidden; }
          .responsive-table td { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.03) !important; position: relative; padding: 1rem 1.25rem !important; display: flex; flex-direction: column; gap: 0.25rem; text-align: left !important; }
          .responsive-table td:last-child { border-bottom: 0 !important; }
          .responsive-table td::before { content: attr(data-label); font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px; }
          .hide-mobile { display: none !important; } 
          .responsive-table td:last-child > button { width: 100%; justify-content: center !important; background: rgba(255,255,255,0.8) !important; padding: 12px !important; border-radius: 8px !important; margin-top: 8px; border: 1px solid rgba(0,0,0,0.05) !important; }
          .responsive-table td:last-child > button:disabled { background: transparent !important; border: none !important; }
        }
      `,
				}}
			/>

			{mounted &&
				toast &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: "24px",
							left: "50%",
							background:
								toast.type === "success"
									? "rgba(15, 23, 42, 0.9)"
									: "rgba(153, 27, 27, 0.9)",
							backdropFilter: "blur(12px)",
							color: "white",
							padding: "12px 24px",
							borderRadius: "30px",
							fontSize: "13px",
							fontWeight: 700,
							display: "flex",
							alignItems: "center",
							gap: "8px",
							boxShadow: "0 10px 40px -5px rgba(0,0,0,0.3)",
							zIndex: 99999,
							animation:
								"slideDownToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
							transform: "translateX(-50%)",
						}}
					>
						{toast.type === "success" ? "✓ " : "✕ "} {toast.message}
					</div>,
					document.body,
				)}

			{showLinkModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
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
					<div className="page-title" style={{ fontSize: "28px" }}>
						Latest Job Matches
					</div>
					<div className="page-sub">
						Pending and completed applications for your review.
					</div>
				</div>
				<button
					onClick={() => setIsPreviewOpen(true)}
					disabled={unappliedJobs.length === 0}
					style={{
						background: "rgba(255,255,255,0.7)",
						border: "1px solid rgba(255,255,255,0.5)",
						color: "#0369a1",
						padding: "10px 20px",
						borderRadius: "8px",
						fontSize: "14px",
						fontWeight: 700,
						cursor: unappliedJobs.length === 0 ? "not-allowed" : "pointer",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						transition: "all 0.2s",
						boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
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
								WebkitBackdropFilter: "blur(24px)",
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
			) : unappliedJobs.length === 0 ? (
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
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					No matches found yet. Run the scraper on the Dashboard!
				</div>
			) : (
				<div
					style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
				>
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
										background: "#15803d",
										color: "white",
										padding: "4px 12px",
										borderRadius: "20px",
										fontSize: "11px",
										fontWeight: 800,
										letterSpacing: "0.5px",
									}}
								>
									TIER 1
								</span>
								High Priority Matches
							</h3>
							<div
								className="responsive-table"
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									WebkitBackdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									overflow: "hidden",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
								}}
							>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
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
										background: "#0284c7",
										color: "white",
										padding: "4px 12px",
										borderRadius: "20px",
										fontSize: "11px",
										fontWeight: 800,
										letterSpacing: "0.5px",
									}}
								>
									TIER 2
								</span>
								Strong Fits
							</h3>
							<div
								className="responsive-table"
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									WebkitBackdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									overflow: "hidden",
									boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
								}}
							>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
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
								</span>
								Potential Opportunities
							</h3>
							<div
								className="responsive-table"
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									WebkitBackdropFilter: "blur(24px)",
									borderRadius: "16px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									overflow: "hidden",
									opacity: 0.85,
								}}
							>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<TableHeader />
									<tbody>{t3Jobs.map(renderJobRow)}</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}

			{/* 🚀 THE NEW DYNAMIC STATS SECTION FROM THE SCREENSHOT */}
			{!isLoading && unappliedJobs.length > 0 && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
						gap: "1.5rem",
						marginTop: "4rem",
					}}
				>
					{/* BOX 1 */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.5)",
							backdropFilter: "blur(24px)",
							WebkitBackdropFilter: "blur(24px)",
							borderRadius: "16px",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							padding: "1.75rem",
							boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<h4
							style={{
								fontSize: "14px",
								fontWeight: 800,
								color: "#0058bc",
								margin: "0 0 16px 0",
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
							MLS demand in <strong>{dynamicStats.primaryLoc}</strong> has
							increased by 14% in your region this quarter.{" "}
							<strong>{dynamicStats.primarySkill}</strong> roles remain the
							strongest fit for your profile.
						</p>
						<a
							href="/news"
							style={{
								fontSize: "12px",
								fontWeight: 800,
								color: "#0058bc",
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

					{/* BOX 2 */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.5)",
							backdropFilter: "blur(24px)",
							WebkitBackdropFilter: "blur(24px)",
							borderRadius: "16px",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							padding: "1.75rem",
							boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<h4
							style={{
								fontSize: "14px",
								fontWeight: 800,
								color: "#15803d",
								margin: "0 0 16px 0",
							}}
						>
							Quick Stats
						</h4>
						<div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
							<div style={{ flex: 1 }}>
								<div
									style={{
										fontSize: "32px",
										fontWeight: 900,
										color: "#15803d",
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
										fontSize: "32px",
										fontWeight: 900,
										color: "#15803d",
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

					{/* BOX 3 */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.5)",
							backdropFilter: "blur(24px)",
							WebkitBackdropFilter: "blur(24px)",
							borderRadius: "16px",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							padding: "1.75rem",
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
								margin: "0 0 16px 0",
							}}
						>
							Resume Score
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
									fontSize: "40px",
									fontWeight: 900,
									color: "#0058bc",
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
									? "High Visibility. Your profile matches deeply with top employers."
									: "Standard Visibility. Update your CV to unlock Tier 1 roles."}
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
								color: "#0058bc",
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

			{/* TOOLKITS AND MODALS */}
			{mounted &&
				toolkitJob &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(248, 250, 252, 0.7)",
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
							zIndex: 10000,
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
								maxWidth: "700px",
								borderRadius: "24px",
								display: "flex",
								flexDirection: "column",
								boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
								border: "1px solid rgba(0,0,0,0.05)",
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
								<div>
									<h3
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
											stroke="#0058bc"
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
														background: doc.base64 ? "#dcfce7" : "#f1f5f9",
														color: doc.base64 ? "#15803d" : "#94a3b8",
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
															color: doc.base64 ? "#15803d" : "#ef4444",
															fontWeight: 600,
														}}
													>
														{doc.base64 ? "Ready" : "Missing in Vault"}
													</div>
												</div>
											</div>
											{doc.base64 && (
												<a
													href={doc.base64}
													download={`${doc.id}_labpro.pdf`}
													title="Download to attach"
													style={{
														color: "#0058bc",
														padding: "6px",
														background: "#eff6ff",
														borderRadius: "8px",
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
														<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
														<polyline points="7 10 12 15 17 10"></polyline>
														<line x1="12" y1="15" x2="12" y2="3"></line>
													</svg>
												</a>
											)}
										</div>
									))}
								</div>
								<div
									style={{
										flex: 1.5,
										display: "flex",
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
										<button
											onClick={copyCoverLetter}
											style={{
												background: "none",
												border: "none",
												color: "#0058bc",
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
									{/* 🚀 THE NEW LOADING SPINNER FOR GEMINI */}
									{isGeneratingLetter ? (
										<div
											style={{
												width: "100%",
												height: "100%",
												minHeight: "180px",
												borderRadius: "12px",
												border: "1px dashed #0058bc",
												background: "rgba(0, 88, 188, 0.05)",
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
													borderTop: "3px solid #0058bc",
													borderRadius: "50%",
													width: "24px",
													height: "24px",
												}}
											></div>
											<span
												style={{
													fontSize: "13px",
													color: "#0058bc",
													fontWeight: 700,
												}}
											>
												Gemini is drafting your letter...
											</span>
										</div>
									) : (
										<textarea
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
							<div
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
									Downloads will save directly to your device.
								</span>
								<button
									onClick={executeFinalApply}
									style={{
										background: "#0058bc",
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
										boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
									}}
								>
									Proceed to Job Board{" "}
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
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(248, 250, 252, 0.7)",
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
							zIndex: 10000,
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
								maxWidth: "650px",
								maxHeight: "90vh",
								borderRadius: "20px",
								overflow: "hidden",
								display: "flex",
								flexDirection: "column",
								boxShadow: "0 20px 40px -4px rgba(0, 0, 0, 0.1)",
								border: "1px solid rgba(0,0,0,0.05)",
							}}
						>
							<div
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
										This is exactly how the email will look when sent.
									</p>
								</div>
								<button
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
									onMouseEnter={(e) =>
										(e.currentTarget.style.background = "#e2e8f0")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.background = "#f1f5f9")
									}
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
							<div
								style={{
									overflowY: "auto",
									padding: "1.5rem",
									background: "#f8fafc",
									flex: 1,
								}}
							>
								<div
									style={{
										background: "white",
										borderRadius: "12px",
										padding: "2.5rem",
										border: "1px solid #e2e8f0",
										boxShadow: "0 4px 10px -2px rgba(0, 0, 0, 0.02)",
									}}
								>
									<div
										style={{
											textAlign: "center",
											marginBottom: "2rem",
											borderBottom: "2px solid #f1f5f9",
											paddingBottom: "1.5rem",
										}}
									>
										<h1
											style={{
												margin: 0,
												fontSize: "24px",
												fontWeight: 900,
												letterSpacing: "-0.5px",
											}}
										>
											<span style={{ color: "#0f172a" }}>Bench</span>
											<span style={{ color: "#0058bc" }}>Scout</span>
										</h1>
										<p
											style={{
												margin: "4px 0 0 0",
												color: "#64748b",
												fontSize: "13px",
												textTransform: "uppercase",
												letterSpacing: "2px",
												fontWeight: 800,
											}}
										>
											Job Digest
										</p>
									</div>
									<p
										style={{
											color: "#475569",
											fontSize: "14px",
											lineHeight: "1.6",
											marginBottom: "2rem",
										}}
									>
										Hello,
										<br />
										<br />
										Here are the latest clinical opportunities matched to your
										specific laboratory parameters. The system identified{" "}
										<strong>{unappliedJobs.length}</strong> active positions.
									</p>

									{t1Jobs.length > 0 && (
										<div style={{ marginBottom: "2rem" }}>
											<div
												style={{
													background: "#15803d",
													color: "white",
													padding: "6px 12px",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 800,
													display: "inline-block",
													marginBottom: "1rem",
													letterSpacing: "0.5px",
												}}
											>
												TIER 1 MATCHES
											</div>
											{t1Jobs.map((j) => (
												<div
													key={j.id}
													style={{
														border: "1px solid #e2e8f0",
														borderRadius: "12px",
														padding: "1.25rem",
														marginBottom: "1rem",
														borderLeft: "4px solid #15803d",
													}}
												>
													<div
														style={{
															fontWeight: 800,
															color: "#0f172a",
															fontSize: "15px",
														}}
													>
														{j.role}
													</div>
													<div
														style={{
															color: "#0369a1",
															fontSize: "13px",
															fontWeight: 700,
															margin: "6px 0",
														}}
													>
														{j.company} • {j.loc}
													</div>
													<div
														style={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
															marginTop: "1rem",
														}}
													>
														<span
															style={{
																fontSize: "12px",
																color: "#64748b",
																fontWeight: 600,
															}}
														>
															Match Score:{" "}
															<strong
																style={{ color: "#15803d", fontSize: "14px" }}
															>
																{j.score}%
															</strong>
														</span>
														<span
															style={{
																color: "#0058bc",
																fontSize: "12px",
																fontWeight: 700,
															}}
														>
															Apply Online →
														</span>
													</div>
												</div>
											))}
										</div>
									)}
									{t2Jobs.length > 0 && (
										<div style={{ marginBottom: "2rem" }}>
											<div
												style={{
													background: "#0284c7",
													color: "white",
													padding: "6px 12px",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 800,
													display: "inline-block",
													marginBottom: "1rem",
													letterSpacing: "0.5px",
												}}
											>
												TIER 2 MATCHES
											</div>
											{t2Jobs.map((j) => (
												<div
													key={j.id}
													style={{
														border: "1px solid #e2e8f0",
														borderRadius: "12px",
														padding: "1.25rem",
														marginBottom: "1rem",
														borderLeft: "4px solid #0284c7",
													}}
												>
													<div
														style={{
															fontWeight: 800,
															color: "#0f172a",
															fontSize: "15px",
														}}
													>
														{j.role}
													</div>
													<div
														style={{
															color: "#0369a1",
															fontSize: "13px",
															fontWeight: 700,
															margin: "6px 0",
														}}
													>
														{j.company} • {j.loc}
													</div>
													<div
														style={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
															marginTop: "1rem",
														}}
													>
														<span
															style={{
																fontSize: "12px",
																color: "#64748b",
																fontWeight: 600,
															}}
														>
															Match Score:{" "}
															<strong
																style={{ color: "#0284c7", fontSize: "14px" }}
															>
																{j.score}%
															</strong>
														</span>
														<span
															style={{
																color: "#0058bc",
																fontSize: "12px",
																fontWeight: 700,
															}}
														>
															Apply Online →
														</span>
													</div>
												</div>
											))}
										</div>
									)}
									{t3Jobs.length > 0 && (
										<div>
											<div
												style={{
													background: "#94a3b8",
													color: "white",
													padding: "6px 12px",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 800,
													display: "inline-block",
													marginBottom: "1rem",
													letterSpacing: "0.5px",
												}}
											>
												TIER 3 MATCHES
											</div>
											{t3Jobs.map((j) => (
												<div
													key={j.id}
													style={{
														border: "1px solid #e2e8f0",
														borderRadius: "12px",
														padding: "1.25rem",
														marginBottom: "1rem",
														borderLeft: "4px solid #94a3b8",
													}}
												>
													<div
														style={{
															fontWeight: 800,
															color: "#0f172a",
															fontSize: "15px",
														}}
													>
														{j.role}
													</div>
													<div
														style={{
															color: "#0369a1",
															fontSize: "13px",
															fontWeight: 700,
															margin: "6px 0",
														}}
													>
														{j.company} • {j.loc}
													</div>
													<div
														style={{
															display: "flex",
															justifyContent: "space-between",
															alignItems: "center",
															marginTop: "1rem",
														}}
													>
														<span
															style={{
																fontSize: "12px",
																color: "#64748b",
																fontWeight: 600,
															}}
														>
															Match Score:{" "}
															<strong
																style={{ color: "#94a3b8", fontSize: "14px" }}
															>
																{j.score}%
															</strong>
														</span>
														<span
															style={{
																color: "#0058bc",
																fontSize: "12px",
																fontWeight: 700,
															}}
														>
															Apply Online →
														</span>
													</div>
												</div>
											))}
										</div>
									)}
									<div
										style={{
											marginTop: "3rem",
											paddingTop: "1.5rem",
											borderTop: "1px solid #e2e8f0",
											textAlign: "center",
											color: "#94a3b8",
											fontSize: "11px",
										}}
									>
										This digest was automatically generated by BenchScout.{" "}
										<br />
										You can update your email preferences in System Settings.
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</section>
	);
}
