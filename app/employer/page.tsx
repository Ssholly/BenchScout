"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function EmployerGateway() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [view, setView] = useState<"login" | "register" | "dashboard">("login");
	const [employer, setEmployer] = useState<any>(null);

	// 🚀 ACTIVE PANEL SUB-TAB STATE
	const [activeTab, setActiveTab] = useState<"broadcasts" | "crm">(
		"broadcasts",
	);

	const [companyName, setCompanyName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [contactName, setContactName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [role, setRole] = useState("");
	const [loc, setLoc] = useState("");
	const [salary, setSalary] = useState("");
	const [skills, setSkills] = useState("");
	const [jobType, setJobType] = useState("full-time");
	const [isMlscnApproved, setIsMlscnApproved] = useState(false);

	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "warning";
	} | null>(null);
	const [postedJobs, setPostedJobs] = useState<any[]>([]);
	const [loadingJobs, setLoadingJobs] = useState(false);

	// 🚀 TALENT SOURCING CRM DIRECTORY STATE
	const [talentPool, setTalentPool] = useState<any[]>([]);
	const [crmLoading, setCrmLoading] = useState(false);
	const [filterLocation, setFilterLocation] = useState("");
	const [invitingId, setInvitingId] = useState<string | null>(null);

	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		jobId: string | null;
	}>({ isOpen: false, jobId: null });

	const [editModal, setEditModal] = useState<{
		isOpen: boolean;
		jobId: string;
		role: string;
		loc: string;
		salary: string;
		skills: string;
	}>({ isOpen: false, jobId: "", role: "", loc: "", salary: "", skills: "" });

	const [drawer, setDrawer] = useState<{
		isOpen: boolean;
		jobTitle: string;
		applicants: any[];
		loading: boolean;
	}>({ isOpen: false, jobTitle: "", applicants: [], loading: false });

	const [interviewModal, setInterviewModal] = useState<{
		isOpen: boolean;
		applicationId: string;
		date: string;
		time: string;
		location: string;
		candidateName: string;
	}>({
		isOpen: false,
		applicationId: "",
		date: "",
		time: "",
		location: "",
		candidateName: "",
	});

	const showToast = (
		message: string,
		type: "success" | "error" | "warning" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	const fetchEmployerJobs = async (empId: string) => {
		setLoadingJobs(true);
		try {
			const res = await fetch(`/api/jobs?employerId=${empId}`);
			if (res.ok) {
				const data = await res.json();
				setPostedJobs(data);
			}
		} catch (error) {
			console.error("Failed to load employer jobs.");
		} finally {
			setLoadingJobs(false);
		}
	};

	// 🚀 FETCH TALENT FROM DIRECTORY REGISTRY
	const fetchTalentDirectory = async () => {
		setCrmLoading(true);
		try {
			const res = await fetch(
				`/api/employer/talent?location=${filterLocation}`,
			);
			const data = await res.json();
			if (data.success) {
				setTalentPool(data.users || []);
			}
		} catch (err) {
			console.error("CRM talent scan issue:", err);
		} finally {
			setCrmLoading(false);
		}
	};

	// 🚀 EXECUTE CRM SOURCING INVITATION EVENT
	const handleInviteTalent = async (user: any) => {
		if (postedJobs.length === 0) {
			return showToast(
				"Deploy at least one active broadcast role to dispatch an invite.",
				"warning",
			);
		}

		const targetRoleName =
			postedJobs[0]?.role || "Medical Laboratory Scientist";
		setInvitingId(user.id);

		try {
			const res = await fetch("/api/employer/talent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					candidateId: user.id,
					candidateEmail: user.email,
					candidateName: user.name,
					employerName: employer.companyName,
					jobRole: targetRoleName,
				}),
			});

			if (res.ok) {
				showToast(
					`Headhunting invite sent to ${user.name || "candidate"} successfully!`,
					"success",
				);
				window.dispatchEvent(new Event("refreshNotifications"));
			} else {
				showToast("Sourcing error during delivery.", "error");
			}
		} catch (e) {
			showToast("Network pipeline failure.", "error");
		} finally {
			setInvitingId(null);
		}
	};

	useEffect(() => {
		if (activeTab === "crm" && employer) {
			fetchTalentDirectory();
		}
	}, [activeTab, filterLocation]);

	const openApplicantDrawer = async (jobId: string, jobTitle: string) => {
		setDrawer({ isOpen: true, jobTitle, applicants: [], loading: true });
		try {
			const res = await fetch(`/api/jobs/applicants?jobId=${jobId}`);
			if (!res.ok) {
				setDrawer((prev) => ({ ...prev, loading: false }));
				return;
			}
			const data = await res.json();
			if (data.success) {
				setDrawer((prev) => ({
					...prev,
					applicants: data.applications || [],
					loading: false,
				}));
			} else {
				setDrawer((prev) => ({ ...prev, loading: false }));
			}
		} catch (e) {
			setDrawer((prev) => ({ ...prev, loading: false }));
		}
	};

	const handleRejectApplicant = async (applicationId: string) => {
		setDrawer((prev) => ({
			...prev,
			applicants: prev.applicants.map((app) =>
				app.id === applicationId ? { ...app, status: "rejected" } : app,
			),
		}));

		try {
			await fetch("/api/jobs/applicants", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ applicationId, status: "rejected" }),
			});
			showToast("Candidate rejected.", "warning");
		} catch (err) {
			showToast("Network error while updating status.", "error");
		}
	};

	const submitInterviewSchedule = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const updatedAppStatus = {
			status: "shortlisted",
			interviewDate: interviewModal.date,
			interviewTime: interviewModal.time,
			interviewLoc: interviewModal.location,
		};

		setDrawer((prev) => ({
			...prev,
			applicants: prev.applicants.map((app) =>
				app.id === interviewModal.applicationId
					? { ...app, ...updatedAppStatus }
					: app,
			),
		}));

		try {
			const res = await fetch("/api/jobs/applicants", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					applicationId: interviewModal.applicationId,
					...updatedAppStatus,
				}),
			});
			const data = await res.json();

			if (data.success) {
				showToast(
					"Interview Locked! Priority email and notification dispatched.",
					"success",
				);
				setInterviewModal({
					isOpen: false,
					applicationId: "",
					date: "",
					time: "",
					location: "",
					candidateName: "",
				});
			} else {
				showToast("Failed to schedule interview.", "error");
			}
		} catch (err) {
			showToast("Network error while scheduling.", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setMounted(true);
		const saved = localStorage.getItem("benchscout_active_employer");
		if (saved) {
			const parsed = JSON.parse(saved);
			setEmployer(parsed);
			setView("dashboard");
			fetchEmployerJobs(parsed.id);
		}
	}, []);

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/auth/employer", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: view,
					companyName,
					email,
					password,
					contactName,
				}),
			});
			const data = await res.json();

			if (data.success) {
				if (view === "login") {
					localStorage.setItem(
						"benchscout_active_employer",
						JSON.stringify(data.employer),
					);
					setEmployer(data.employer);
					setView("dashboard");
					fetchEmployerJobs(data.employer.id);
					window.dispatchEvent(new Event("employerStateChanged"));
				} else {
					setView("login");
					setCompanyName("");
					setPassword("");
					showToast(
						"Registration complete! Access your secure portal.",
						"success",
					);
				}
			} else {
				setError(data.error || "An authentication error occurred.");
			}
		} catch (err) {
			setError("Network timeout. Check server connection.");
		} finally {
			setLoading(false);
		}
	};

	const handlePostJob = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!role || !loc || !skills)
			return showToast("Fill out mandatory parameters.", "warning");
		setLoading(true);

		try {
			const res = await fetch("/api/jobs/direct", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					role,
					company: employer.companyName,
					loc,
					salary,
					skills,
					jobType,
					isMlscnApproved,
					employerId: employer.id,
				}),
			});
			const data = await res.json();

			if (data.success) {
				showToast(
					"Recruitment listing published directly to matches catalog!",
					"success",
				);
				setRole("");
				setLoc("");
				setSalary("");
				setSkills("");
				fetchEmployerJobs(employer.id);
			} else {
				showToast("Failed to sync listing to platform network.", "error");
			}
		} catch (err) {
			showToast("Network error processing request.", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateJob = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch("/api/jobs/direct", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jobId: editModal.jobId,
					role: editModal.role,
					loc: editModal.loc,
					salary: editModal.salary,
					skills: editModal.skills,
				}),
			});
			const data = await res.json();

			if (data.success) {
				showToast("Broadcast updated successfully!", "success");
				setEditModal((prev) => ({ ...prev, isOpen: false }));
				fetchEmployerJobs(employer.id);
			} else {
				showToast("Failed to update broadcast.", "error");
			}
		} catch (err) {
			showToast("Network error updating broadcast.", "error");
		} finally {
			setLoading(false);
		}
	};

	const executeDeleteJob = async () => {
		if (!deleteModal.jobId) return;
		try {
			const res = await fetch("/api/jobs/direct", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jobId: deleteModal.jobId,
					employerId: employer.id,
				}),
			});
			if (res.ok) {
				showToast("Broadcast terminated successfully.", "success");
				setDeleteModal({ isOpen: false, jobId: null });
				fetchEmployerJobs(employer.id);
			} else {
				showToast("Failed to terminate broadcast.", "error");
			}
		} catch (e) {
			showToast("Network error terminating broadcast.", "error");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("benchscout_active_employer");
		setEmployer(null);
		setView("login");
		window.dispatchEvent(new Event("employerStateChanged"));
	};

	const boxStyle = {
		background: "rgba(255, 255, 255, 0.6)",
		backdropFilter: "blur(20px)",
		borderRadius: "24px",
		border: "1px solid rgba(255, 255, 255, 0.4)",
		boxShadow: "0 10px 40px -10px rgba(11, 36, 68, 0.05)",
		padding: "2.5rem",
		width: "100%",
		maxWidth: "500px",
	};
	const inputStyle = {
		width: "100%",
		background: "white",
		border: "1px solid #e2e8f0",
		borderRadius: "10px",
		padding: "12px 14px",
		fontSize: "14px",
		outline: "none",
		color: "#0f172a",
		fontWeight: 600,
		marginTop: "6px",
		marginBottom: "16px",
	};

	if (!mounted) return null;

	return (
		<div style={{ width: "100%", minHeight: "100vh" }}>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes slideDownToast { 
          0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; } 
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; } 
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInDrawer {
          0% { transform: translateX(120%); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeOverlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `,
				}}
			/>

			{toast &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: "24px",
							left: "50%",
							background:
								toast.type === "success"
									? "rgba(15, 23, 42, 0.95)"
									: toast.type === "warning"
										? "rgba(217, 119, 6, 0.95)"
										: "rgba(153, 27, 27, 0.95)",
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
						{toast.type === "success"
							? "✓ "
							: toast.type === "warning"
								? "⚠️ "
								: "✕ "}{" "}
						{toast.message}
					</div>,
					document.body,
				)}

			{/* SCHEDULE INTERVIEW MODAL */}
			{interviewModal.isOpen &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.15)",
							backdropFilter: "blur(18px)",
							WebkitBackdropFilter: "blur(18px)",
							zIndex: 300001,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "1.5rem",
							fontFamily: "inherit",
						}}
					>
						<div
							style={{
								background: "rgba(255, 255, 255, 0.95)",
								border: "1px solid rgba(255, 255, 255, 0.5)",
								width: "100%",
								maxWidth: "450px",
								borderRadius: "24px",
								padding: "2rem",
								boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12)",
								animation:
									"modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									marginBottom: "1.5rem",
								}}
							>
								<div>
									<h3
										style={{
											fontSize: "19px",
											fontWeight: 850,
											color: "#0f172a",
											margin: "0 0 4px 0",
											letterSpacing: "-0.2px",
										}}
									>
										Schedule Interview
									</h3>
									<p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
										Locking in schedule for{" "}
										<strong style={{ color: "#0f172a" }}>
											{interviewModal.candidateName}
										</strong>
									</p>
								</div>
								<button
									onClick={() =>
										setInterviewModal({ ...interviewModal, isOpen: false })
									}
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

							<form onSubmit={submitInterviewSchedule}>
								<div style={{ display: "flex", gap: "12px" }}>
									<div style={{ flex: 1 }}>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Date
										</label>
										<input
											type="date"
											required
											value={interviewModal.date}
											onChange={(e) =>
												setInterviewModal({
													...interviewModal,
													date: e.target.value,
												})
											}
											style={inputStyle}
										/>
									</div>
									<div style={{ flex: 1 }}>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Time
										</label>
										<input
											type="time"
											required
											value={interviewModal.time}
											onChange={(e) =>
												setInterviewModal({
													...interviewModal,
													time: e.target.value,
												})
											}
											style={inputStyle}
										/>
									</div>
								</div>

								<label
									style={{
										fontSize: "11px",
										fontWeight: 800,
										color: "#64748b",
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									Location / Virtual Link
								</label>
								<input
									type="text"
									placeholder="e.g. Zoom Link or Office Address"
									required
									value={interviewModal.location}
									onChange={(e) =>
										setInterviewModal({
											...interviewModal,
											location: e.target.value,
										})
									}
									style={inputStyle}
								/>

								<div
									style={{
										background: "#e6fcf5",
										border: "1px solid #a7f3d0",
										padding: "12px",
										borderRadius: "8px",
										marginTop: "8px",
										marginBottom: "16px",
										display: "flex",
										gap: "10px",
										alignItems: "flex-start",
									}}
								>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#1A8C7A"
										strokeWidth="2"
										style={{ flexShrink: 0, marginTop: "2px" }}
									>
										<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
										<polyline points="22 4 12 14.01 9 11.01"></polyline>
									</svg>
									<p
										style={{
											margin: 0,
											fontSize: "12px",
											color: "#065f46",
											lineHeight: "1.5",
										}}
									>
										Saving will automatically sync this to the candidate's
										Master Scheduler and dispatch a priority email.
									</p>
								</div>

								<button
									type="submit"
									disabled={loading}
									style={{
										width: "100%",
										background: "#1A8C7A",
										color: "white",
										padding: "14px",
										border: "none",
										borderRadius: "10px",
										fontSize: "14px",
										fontWeight: 800,
										cursor: "pointer",
										boxShadow: "0 4px 12px rgba(26,140,122,0.2)",
										transition: "0.2s",
									}}
								>
									{loading ? "Syncing..." : "Confirm & Shortlist Candidate"}
								</button>
							</form>
						</div>
					</div>,
					document.body,
				)}

			{/* EDIT MODAL */}
			{editModal.isOpen &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.15)",
							backdropFilter: "blur(18px)",
							WebkitBackdropFilter: "blur(18px)",
							zIndex: 200000,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "1.5rem",
							fontFamily: "inherit",
						}}
					>
						<div
							style={{
								background: "rgba(255, 255, 255, 0.95)",
								border: "1px solid rgba(255, 255, 255, 0.5)",
								width: "100%",
								maxWidth: "450px",
								borderRadius: "24px",
								padding: "2rem",
								boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12)",
								animation:
									"modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "1.5rem",
								}}
							>
								<h3
									style={{
										fontSize: "19px",
										fontWeight: 850,
										color: "#0f172a",
										margin: 0,
										letterSpacing: "-0.2px",
									}}
								>
									Edit Broadcast Details
								</h3>
								<button
									onClick={() => setEditModal({ ...editModal, isOpen: false })}
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

							<form onSubmit={handleUpdateJob}>
								<label
									style={{
										fontSize: "11px",
										fontWeight: 800,
										color: "#64748b",
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									Target Assignment Role
								</label>
								<input
									type="text"
									value={editModal.role}
									onChange={(e) =>
										setEditModal({ ...editModal, role: e.target.value })
									}
									style={inputStyle}
									required
								/>

								<label
									style={{
										fontSize: "11px",
										fontWeight: 800,
										color: "#64748b",
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									Geographic Location Hub
								</label>
								<input
									type="text"
									value={editModal.loc}
									onChange={(e) =>
										setEditModal({ ...editModal, loc: e.target.value })
									}
									style={inputStyle}
									required
								/>

								<label
									style={{
										fontSize: "11px",
										fontWeight: 800,
										color: "#64748b",
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									Compensatory Parameter (Monthly)
								</label>
								<input
									type="text"
									value={editModal.salary}
									onChange={(e) =>
										setEditModal({ ...editModal, salary: e.target.value })
									}
									style={inputStyle}
								/>

								<label
									style={{
										fontSize: "11px",
										fontWeight: 800,
										color: "#64748b",
										letterSpacing: "0.5px",
										textTransform: "uppercase",
									}}
								>
									Core Skill Directives (Comma Separated)
								</label>
								<input
									type="text"
									value={editModal.skills}
									onChange={(e) =>
										setEditModal({ ...editModal, skills: e.target.value })
									}
									style={inputStyle}
									required
								/>

								<button
									type="submit"
									disabled={loading}
									style={{
										width: "100%",
										background: "#0B2444",
										color: "white",
										padding: "14px",
										border: "none",
										borderRadius: "10px",
										fontSize: "14px",
										fontWeight: 800,
										cursor: "pointer",
										boxShadow: "0 4px 12px rgba(11,36,68,0.2)",
										marginTop: "10px",
										transition: "0.2s",
									}}
								>
									{loading ? "Updating Node..." : "Save Broadcast Changes"}
								</button>
							</form>
						</div>
					</div>,
					document.body,
				)}

			{/* TERMINATE MODAL */}
			{deleteModal.isOpen &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.15)",
							backdropFilter: "blur(18px)",
							WebkitBackdropFilter: "blur(18px)",
							zIndex: 200000,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "1.5rem",
							fontFamily: "inherit",
						}}
					>
						<div
							style={{
								background: "rgba(255, 255, 255, 0.8)",
								border: "1px solid rgba(255, 255, 255, 0.5)",
								width: "100%",
								maxWidth: "380px",
								borderRadius: "24px",
								padding: "2rem",
								textAlign: "center",
								boxShadow: "0 30px 60px -15px rgba(0,0,0,0.12)",
								animation:
									"modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
							}}
						>
							<div
								style={{
									background: "rgba(239, 68, 68, 0.1)",
									width: "54px",
									height: "54px",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto 16px auto",
									color: "#ef4444",
								}}
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
								>
									<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
									<line x1="12" y1="9" x2="12" y2="13"></line>
									<line x1="12" y1="17" x2="12.01" y2="17"></line>
								</svg>
							</div>
							<h3
								style={{
									fontSize: "19px",
									fontWeight: 850,
									color: "#0f172a",
									margin: "0 0 8px 0",
									letterSpacing: "-0.2px",
								}}
							>
								Terminate Broadcast?
							</h3>
							<p
								style={{
									fontSize: "14px",
									color: "#475569",
									margin: "0 0 24px 0",
									lineHeight: "1.5",
									fontWeight: 550,
								}}
							>
								This action removes the job listing across the scientist
								matching network. This cannot be undone.
							</p>
							<div style={{ display: "flex", gap: "10px" }}>
								<button
									onClick={() => setDeleteModal({ isOpen: false, jobId: null })}
									style={{
										flex: 1,
										padding: "12px",
										borderRadius: "12px",
										border: "1px solid rgba(0,0,0,0.05)",
										background: "rgba(255,255,255,0.9)",
										color: "#334155",
										fontWeight: 700,
										fontSize: "14px",
										cursor: "pointer",
										transition: "0.2s",
									}}
								>
									Cancel
								</button>
								<button
									onClick={executeDeleteJob}
									style={{
										flex: 1,
										padding: "12px",
										borderRadius: "12px",
										border: "none",
										background: "#ef4444",
										color: "white",
										fontWeight: 700,
										fontSize: "14px",
										cursor: "pointer",
										boxShadow: "0 4px 12px rgba(239,68,68,0.2)",
										transition: "0.2s",
									}}
								>
									Terminate
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}

			{/* APPLICANT DRAWER - APPLE COMPLIANCE HUB DESIGN WITH HR EXPORT */}
			{drawer.isOpen &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							zIndex: 300000,
							display: "flex",
							justifyContent: "flex-end",
							fontFamily: "inherit",
						}}
					>
						<div
							onClick={() => setDrawer((prev) => ({ ...prev, isOpen: false }))}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								background: "rgba(15, 23, 42, 0.15)",
								backdropFilter: "blur(12px)",
								WebkitBackdropFilter: "blur(12px)",
								animation: "fadeOverlay 0.3s forwards",
							}}
						></div>

						<div
							style={{
								position: "relative",
								background: "rgba(248, 250, 252, 0.9)",
								backdropFilter: "blur(40px)",
								WebkitBackdropFilter: "blur(40px)",
								width: "100%",
								maxWidth: "460px",
								height: "100vh",
								borderLeft: "1px solid rgba(255, 255, 255, 0.7)",
								display: "flex",
								flexDirection: "column",
								boxShadow: "-20px 0 60px rgba(15, 23, 42, 0.08)",
								animation:
									"slideInDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
								overflow: "hidden",
							}}
						>
							{/* Header Matching Compliance Panel */}
							<div
								style={{
									padding: "2rem",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									background: "transparent",
								}}
							>
								<div>
									<h3
										style={{
											margin: 0,
											fontSize: "20px",
											fontWeight: 850,
											color: "#0f172a",
											letterSpacing: "-0.3px",
										}}
									>
										Applicant Roster
									</h3>
									<p
										style={{
											margin: "4px 0 0 0",
											fontSize: "13px",
											color: "#1A8C7A",
											fontWeight: 700,
										}}
									>
										{drawer.jobTitle}
									</p>
								</div>
								<div
									style={{ display: "flex", alignItems: "center", gap: "10px" }}
								>
									{/* 🚀 ONE-CLICK HR DATA EXTRACTION UTILITY */}
									{drawer.applicants.length > 0 && (
										<button
											onClick={() => {
												const headers = [
													"Applicant Name",
													"Email Address",
													"Pipeline Status",
													"Resume Link",
													"MLSCN License",
													"B.MLS Degree",
												];
												const rows = drawer.applicants.map((app) => [
													`"${app.user.name || "Verified Candidate"}"`,
													`"${app.user.email}"`,
													`"${app.status || "pending"}"`,
													`"${app.user.resumeUrl || "None"}"`,
													`"${app.user.licenseUrl ? "Verified" : "Missing"}"`,
													`"${app.user.degreeUrl ? "Verified" : "Missing"}"`,
												]);

												const csvContent =
													"data:text/csv;charset=utf-8," +
													[
														headers.join(","),
														...rows.map((e) => e.join(",")),
													].join("\n");

												const encodedUri = encodeURI(csvContent);
												const link = document.createElement("a");
												link.setAttribute("href", encodedUri);
												link.setAttribute(
													"download",
													`BenchScout_Roster_${drawer.jobTitle.replace(/\s+/g, "_")}.csv`,
												);
												document.body.appendChild(link);
												link.click();
												document.body.removeChild(link);
												showToast(
													"HR spreadsheet portfolio compiled and downloaded!",
													"success",
												);
											}}
											style={{
												background: "white",
												border: "1px solid #cbd5e1",
												borderRadius: "8px",
												padding: "6px 12px",
												fontSize: "12px",
												fontWeight: 800,
												color: "#334155",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "6px",
												boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
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
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3" />
											</svg>
											Export CSV
										</button>
									)}
									<button
										onClick={() =>
											setDrawer((prev) => ({ ...prev, isOpen: false }))
										}
										style={{
											background: "white",
											border: "1px solid #e2e8f0",
											width: "32px",
											height: "32px",
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											cursor: "pointer",
											color: "#64748b",
											boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
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
											<line x1="18" y1="6" x2="6" y2="18"></line>
											<line x1="6" y1="6" x2="18" y2="18"></line>
										</svg>
									</button>
								</div>
							</div>

							{/* Scrollable Container */}
							<div
								style={{
									padding: "0 2rem 2rem 2rem",
									flex: 1,
									overflowY: "auto",
									display: "flex",
									flexDirection: "column",
									gap: "1.5rem",
								}}
							>
								{drawer.loading ? (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											height: "50vh",
											color: "#64748b",
											fontSize: "13px",
											fontWeight: 700,
										}}
									>
										Extracting Candidate Profiles...
									</div>
								) : drawer.applicants.length === 0 ? (
									<div
										style={{
											textAlign: "center",
											padding: "3rem",
											background: "white",
											borderRadius: "16px",
											border: "1px solid #e2e8f0",
										}}
									>
										<p
											style={{
												color: "#64748b",
												fontSize: "13px",
												fontWeight: 600,
												margin: 0,
											}}
										>
											No applications logged for this broadcast yet.
										</p>
									</div>
								) : (
									drawer.applicants.map((app) => (
										<div
											key={app.id}
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "1.25rem",
											}}
										>
											{/* Premium User Card Badge */}
											<div
												style={{
													background: "white",
													border: "1px solid #e2e8f0",
													borderRadius: "16px",
													padding: "1.25rem",
													boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
													display: "flex",
													alignItems: "center",
													gap: "12px",
												}}
											>
												<div
													style={{
														width: "38px",
														height: "38px",
														borderRadius: "50%",
														background: "#e0f2fe",
														color: "#0369a1",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontWeight: 800,
														fontSize: "14px",
													}}
												>
													{app.user.name
														? app.user.name.charAt(0).toUpperCase()
														: "S"}
												</div>
												<div>
													<div
														style={{
															fontSize: "14px",
															fontWeight: 800,
															color: "#0f172a",
														}}
													>
														{app.user.name || "Verified Candidate"}
													</div>
													<div
														style={{
															fontSize: "11px",
															color: "#64748b",
															fontWeight: 600,
															marginTop: "1px",
														}}
													>
														{app.user.email}
													</div>
												</div>
											</div>

											{/* Documents Section styled like Compliance Blocks */}
											<div
												style={{
													background: "white",
													border: "1px solid #e2e8f0",
													borderRadius: "16px",
													padding: "1.25rem",
													boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
													display: "flex",
													flexDirection: "column",
													gap: "10px",
												}}
											>
												<h4
													style={{
														fontSize: "11px",
														fontWeight: 800,
														color: "#94a3b8",
														textTransform: "uppercase",
														letterSpacing: "0.5px",
														margin: "0 0 4px 0",
													}}
												>
													Vault Documents
												</h4>

												{app.user.resumeUrl && (
													<a
														href={app.user.resumeUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															background: "#f8fafc",
															padding: "10px 14px",
															borderRadius: "12px",
															textDecoration: "none",
															border: "1px solid #e2e8f0",
														}}
													>
														<span
															style={{
																fontSize: "13px",
																fontWeight: 700,
																color: "#334155",
																display: "flex",
																alignItems: "center",
																gap: "8px",
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
																<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
																<polyline points="14 2 14 8 20 8"></polyline>
															</svg>{" "}
															Resume / CV
														</span>
														<span
															style={{
																fontSize: "12px",
																color: "#0058bc",
																fontWeight: 800,
															}}
														>
															View
														</span>
													</a>
												)}

												{app.user.licenseUrl && (
													<div
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															background: "#e6fcf5",
															padding: "10px 14px",
															borderRadius: "12px",
															border: "1px solid #a7f3d0",
														}}
													>
														<span
															style={{
																fontSize: "13px",
																fontWeight: 800,
																color: "#1A8C7A",
																display: "flex",
																alignItems: "center",
																gap: "8px",
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
																<rect
																	x="3"
																	y="11"
																	width="18"
																	height="11"
																	rx="2"
																	ry="2"
																></rect>
																<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
															</svg>{" "}
															MLSCN License
														</span>
														<span
															style={{
																fontSize: "11px",
																color: "#1A8C7A",
																fontWeight: 800,
															}}
														>
															Verified ✓
														</span>
													</div>
												)}

												{app.user.degreeUrl ? (
													<div
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															background: "#f0fdf4",
															padding: "10px 14px",
															borderRadius: "12px",
															border: "1px solid #bbf7d0",
														}}
													>
														<span
															style={{
																fontSize: "13px",
																fontWeight: 800,
																color: "#166534",
																display: "flex",
																alignItems: "center",
																gap: "8px",
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
																<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
																<path d="M6 12v5c3 3 9 3 12 0v-5"></path>
															</svg>{" "}
															B.MLS Degree
														</span>
														<span
															style={{
																fontSize: "11px",
																color: "#166534",
																fontWeight: 800,
															}}
														>
															Verified ✓
														</span>
													</div>
												) : (
													<div
														style={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
															background: "rgba(248, 250, 252, 0.5)",
															padding: "10px 14px",
															borderRadius: "12px",
															border: "1px solid rgba(241, 245, 249, 0.5)",
														}}
													>
														<span
															style={{
																fontSize: "13px",
																fontWeight: 600,
																color: "#94a3b8",
																display: "flex",
																alignItems: "center",
																gap: "8px",
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
																<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
																<path d="M6 12v5c3 3 9 3 12 0v-5"></path>
															</svg>{" "}
															B.MLS Degree
														</span>
														<span
															style={{
																fontSize: "11px",
																color: "#94a3b8",
																fontWeight: 700,
															}}
														>
															Missing
														</span>
													</div>
												)}
											</div>

											{/* Sticky-Style Action Row Container */}
											<div
												style={{
													background: "white",
													border: "1px solid #e2e8f0",
													borderRadius: "16px",
													padding: "1rem",
													boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
												}}
											>
												{app.status === "pending" || !app.status ? (
													<div style={{ display: "flex", gap: "10px" }}>
														<button
															onClick={() => handleRejectApplicant(app.id)}
															style={{
																flex: 1,
																padding: "12px",
																borderRadius: "12px",
																background: "#f8fafc",
																border: "1px solid #e2e8f0",
																color: "#64748b",
																fontWeight: 700,
																fontSize: "13px",
																cursor: "pointer",
															}}
														>
															Reject
														</button>
														<button
															onClick={() =>
																setInterviewModal({
																	isOpen: true,
																	applicationId: app.id,
																	candidateName: app.user.name || "Candidate",
																	date: "",
																	time: "",
																	location: "",
																})
															}
															style={{
																flex: 1,
																padding: "12px",
																borderRadius: "12px",
																background: "#0B2444",
																border: "none",
																color: "white",
																fontWeight: 700,
																fontSize: "13px",
																cursor: "pointer",
															}}
														>
															Shortlist & Schedule
														</button>
													</div>
												) : app.status === "shortlisted" ? (
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: "6px",
															alignItems: "center",
															background: "#e6fcf5",
															border: "1px solid #a7f3d0",
															padding: "12px",
															borderRadius: "12px",
														}}
													>
														<div
															style={{
																color: "#1A8C7A",
																fontWeight: 800,
																fontSize: "13px",
															}}
														>
															✓ Interview Confirmed
														</div>
														{app.interviewDate && (
															<div
																style={{
																	fontSize: "12px",
																	fontWeight: 600,
																	color: "#64748b",
																}}
															>
																{app.interviewDate} @ {app.interviewTime}
															</div>
														)}
													</div>
												) : (
													<div
														style={{
															textAlign: "center",
															color: "#ef4444",
															fontWeight: 800,
															fontSize: "13px",
															background: "#fef2f2",
															padding: "12px",
															borderRadius: "12px",
															border: "1px solid #fecaca",
														}}
													>
														✕ Candidate Pipelines Terminated
													</div>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>,
					document.body,
				)}

			{/* Main Dashboard Render */}
			{view === "dashboard" && employer ? (
				<div
					style={{
						maxWidth: "1000px",
						margin: "0 auto",
						padding: "3rem 1.5rem",
						paddingBottom: "6rem",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "2.5rem",
						}}
					>
						<div>
							<h1
								style={{
									fontSize: "28px",
									fontWeight: 900,
									color: "#0B2444",
									margin: 0,
								}}
							>
								{employer.companyName} Portal
							</h1>
							<p
								style={{
									color: "#64748b",
									margin: "4px 0 0 0",
									fontSize: "14px",
								}}
							>
								Manage direct talent acquisition queues.
							</p>
						</div>
						<button
							onClick={handleLogout}
							style={{
								background: "#fef2f2",
								border: "1px solid #fecaca",
								color: "#ef4444",
								padding: "10px 20px",
								borderRadius: "8px",
								fontWeight: 700,
								cursor: "pointer",
							}}
						>
							Log Out
						</button>
					</div>

					{/* GLASS NAVIGATION SWITCHER FOR TAB MODE */}
					<div
						style={{
							display: "flex",
							background: "rgba(15, 23, 42, 0.04)",
							backdropFilter: "blur(8px)",
							padding: "6px",
							borderRadius: "14px",
							width: "100%",
							maxWidth: "360px",
							marginBottom: "2.5rem",
							border: "1px solid rgba(0,0,0,0.02)",
						}}
					>
						<button
							onClick={() => setActiveTab("broadcasts")}
							style={{
								flex: 1,
								padding: "10px",
								borderRadius: "10px",
								border: "none",
								fontSize: "13px",
								fontWeight: 800,
								cursor: "pointer",
								transition: "0.2s cubic-bezier(0.16, 1, 0.3, 1)",
								background:
									activeTab === "broadcasts" ? "white" : "transparent",
								color: activeTab === "broadcasts" ? "#0B2444" : "#64748b",
								boxShadow:
									activeTab === "broadcasts"
										? "0 4px 12px rgba(0,0,0,0.05)"
										: "none",
							}}
						>
							Active Broadcasts
						</button>
						<button
							onClick={() => setActiveTab("crm")}
							style={{
								flex: 1,
								padding: "10px",
								borderRadius: "10px",
								border: "none",
								fontSize: "13px",
								fontWeight: 800,
								cursor: "pointer",
								transition: "0.2s cubic-bezier(0.16, 1, 0.3, 1)",
								background: activeTab === "crm" ? "white" : "transparent",
								color: activeTab === "crm" ? "#0B2444" : "#64748b",
								boxShadow:
									activeTab === "crm" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
							}}
						>
							Scout Directory (CRM)
						</button>
					</div>

					{activeTab === "broadcasts" ? (
						<>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1.2fr",
									gap: "2rem",
									alignItems: "start",
								}}
							>
								<div
									style={{
										background: "white",
										borderRadius: "20px",
										padding: "2rem",
										border: "1px solid #f1f5f9",
										boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
									}}
								>
									<h2
										style={{
											fontSize: "18px",
											fontWeight: 800,
											color: "#0f172a",
											margin: "0 0 1.5rem 0",
										}}
									>
										Deploy Direct Match Listing
									</h2>
									<form onSubmit={handlePostJob}>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Target Assignment Role
										</label>
										<input
											type="text"
											placeholder="e.g. Intern Medical Laboratory Scientist"
											value={role}
											onChange={(e) => setRole(e.target.value)}
											style={inputStyle}
											required
										/>

										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Geographic Location Hub
										</label>
										<input
											type="text"
											placeholder="e.g. Garki, Abuja"
											value={loc}
											onChange={(e) => setLoc(e.target.value)}
											style={inputStyle}
											required
										/>

										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Compensatory Parameter (Monthly)
										</label>
										<input
											type="text"
											placeholder="e.g. ₦180,000"
											value={salary}
											onChange={(e) => setSalary(e.target.value)}
											style={inputStyle}
										/>

										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Core Skill Directives (Comma Separated)
										</label>
										<input
											type="text"
											placeholder="e.g. Hematology, Blood Bank, QMS"
											value={skills}
											onChange={(e) => setSkills(e.target.value)}
											style={inputStyle}
											required
										/>

										<div
											style={{
												display: "flex",
												gap: "1.5rem",
												marginBottom: "1.5rem",
												background: "#f8fafc",
												padding: "12px",
												borderRadius: "10px",
												border: "1px solid #e2e8f0",
											}}
										>
											<label
												style={{
													display: "flex",
													alignItems: "center",
													gap: "6px",
													fontSize: "13px",
													fontWeight: 700,
													color: "#475569",
													cursor: "pointer",
												}}
											>
												<input
													type="checkbox"
													checked={jobType === "internship"}
													onChange={(e) =>
														setJobType(
															e.target.checked ? "internship" : "full-time",
														)
													}
													style={{ accentColor: "#1A8C7A" }}
												/>{" "}
												Mark as Internship
											</label>
											{jobType === "internship" && (
												<label
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														fontSize: "13px",
														fontWeight: 700,
														color: "#1A8C7A",
														cursor: "pointer",
													}}
												>
													<input
														type="checkbox"
														checked={isMlscnApproved}
														onChange={(e) =>
															setIsMlscnApproved(e.target.checked)
														}
														style={{ accentColor: "#1A8C7A" }}
													/>{" "}
													MLSCN Approved Center
												</label>
											)}
										</div>

										<button
											type="submit"
											disabled={loading}
											style={{
												width: "100%",
												background: "#0B2444",
												color: "white",
												padding: "14px",
												border: "none",
												borderRadius: "10px",
												fontSize: "14px",
												fontWeight: 800,
												cursor: "pointer",
												boxShadow: "0 4px 12px rgba(11, 36, 68, 0.2)",
											}}
										>
											{loading
												? "Publishing Transaction..."
												: "Broadcast Native Placement"}
										</button>
									</form>
								</div>

								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "1.5rem",
									}}
								>
									<div
										style={{
											background: "rgba(26,140,122,0.04)",
											border: "1px solid rgba(26,140,122,0.2)",
											borderRadius: "16px",
											padding: "1.5rem",
										}}
									>
										<h3
											style={{
												fontSize: "14px",
												fontWeight: 800,
												color: "#0B2444",
												margin: "0 0 6px 0",
											}}
										>
											B2B Talent Visibility Monitor
										</h3>
										<p
											style={{
												margin: 0,
												fontSize: "13px",
												color: "#475569",
												lineHeight: "1.6",
											}}
										>
											Your listings are broadcast with an automatic **Verified
											Badge** priority flag. Only candidate pools with
											pre-extracted, verified MLSCN credentials will populate
											your candidate dispatch stack.
										</p>
									</div>
									<div
										style={{
											background: "#0f172a",
											borderRadius: "16px",
											padding: "1.5rem",
											fontFamily: "monospace",
											fontSize: "12px",
											color: "#e2e8f0",
										}}
									>
										<div
											style={{
												color: "#1A8C7A",
												fontWeight: 700,
												marginBottom: "8px",
											}}
										>
											[B2B_SYSTEM_READY] Core services streaming active...
										</div>
										<div>
											&gt; Syncing dashboard analytics for hospital node.
										</div>
										<div>
											&gt; Ready to catch direct credential verification
											pipelines.
										</div>
										{postedJobs.length > 0 && (
											<div style={{ color: "#fbbf24", marginTop: "8px" }}>
												&gt; Broadcasting {postedJobs.length} active placements
												to network.
											</div>
										)}
									</div>
								</div>
							</div>

							<div style={{ marginTop: "4rem" }}>
								<h2
									style={{
										fontSize: "20px",
										fontWeight: 800,
										color: "#0f172a",
										marginBottom: "1.5rem",
										display: "flex",
										alignItems: "center",
										gap: "10px",
									}}
								>
									Active Broadcasts{" "}
									<span
										style={{
											background: "#e2e8f0",
											color: "#475569",
											fontSize: "12px",
											padding: "2px 8px",
											borderRadius: "20px",
										}}
									>
										{postedJobs.length}
									</span>
								</h2>

								{loadingJobs ? (
									<div
										style={{
											padding: "3rem",
											textAlign: "center",
											color: "#64748b",
											fontSize: "14px",
											fontWeight: 600,
											background: "rgba(255,255,255,0.4)",
											borderRadius: "16px",
											border: "1px solid rgba(255,255,255,0.3)",
										}}
									>
										Syncing network listings...
									</div>
								) : postedJobs.length === 0 ? (
									<div
										style={{
											padding: "4rem",
											textAlign: "center",
											background: "rgba(255,255,255,0.4)",
											borderRadius: "16px",
											border: "1px solid rgba(255,255,255,0.3)",
										}}
									>
										<p
											style={{
												color: "#64748b",
												fontSize: "15px",
												margin: 0,
												fontWeight: 600,
											}}
										>
											No active listings broadcasted yet. Deploy a direct match
											above.
										</p>
									</div>
								) : (
									<div
										style={{
											background: "white",
											borderRadius: "20px",
											border: "1px solid #f1f5f9",
											boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
											overflow: "hidden",
										}}
									>
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												textAlign: "left",
											}}
										>
											<thead
												style={{
													background: "#f8fafc",
													borderBottom: "1px solid #e2e8f0",
												}}
											>
												<tr>
													<th
														style={{
															padding: "16px 24px",
															fontSize: "11px",
															fontWeight: 800,
															color: "#64748b",
															textTransform: "uppercase",
															letterSpacing: "0.5px",
														}}
													>
														Target Role
													</th>
													<th
														style={{
															padding: "16px 24px",
															fontSize: "11px",
															fontWeight: 800,
															color: "#64748b",
															textTransform: "uppercase",
															letterSpacing: "0.5px",
														}}
													>
														Location Hub
													</th>
													<th
														style={{
															padding: "16px 24px",
															fontSize: "11px",
															fontWeight: 800,
															color: "#64748b",
															textTransform: "uppercase",
															letterSpacing: "0.5px",
														}}
													>
														Status / Applicants
													</th>
													<th
														style={{
															padding: "16px 24px",
															fontSize: "11px",
															fontWeight: 800,
															color: "#64748b",
															textTransform: "uppercase",
															letterSpacing: "0.5px",
															textAlign: "right",
														}}
													>
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{postedJobs.map((job) => (
													<tr
														key={job.id}
														style={{ borderBottom: "1px solid #f1f5f9" }}
													>
														<td style={{ padding: "16px 24px" }}>
															<div
																style={{
																	fontWeight: 800,
																	color: "#0f172a",
																	fontSize: "14px",
																	marginBottom: "4px",
																}}
															>
																{job.role}
															</div>
															<div
																style={{
																	display: "flex",
																	gap: "4px",
																	flexWrap: "wrap",
																}}
															>
																{job.skills
																	.split(",")
																	.slice(0, 2)
																	.map((s: string, i: number) => (
																		<span
																			key={i}
																			style={{
																				background: "#f1f5f9",
																				color: "#475569",
																				padding: "2px 6px",
																				borderRadius: "4px",
																				fontSize: "10px",
																				fontWeight: 700,
																			}}
																		>
																			{s.trim()}
																		</span>
																	))}
															</div>
														</td>
														<td
															style={{
																padding: "16px 24px",
																color: "#475569",
																fontSize: "13px",
																fontWeight: 600,
															}}
														>
															{job.loc}
														</td>
														<td style={{ padding: "16px 24px" }}>
															<div
																style={{
																	display: "flex",
																	flexDirection: "column",
																	gap: "8px",
																	alignItems: "flex-start",
																}}
															>
																<span
																	style={{
																		background: "#e6fcf5",
																		color: "#1A8C7A",
																		border: "1px solid #a7f3d0",
																		padding: "4px 10px",
																		borderRadius: "20px",
																		fontSize: "11px",
																		fontWeight: 800,
																		display: "inline-flex",
																		alignItems: "center",
																		gap: "6px",
																	}}
																>
																	<span
																		style={{
																			width: "6px",
																			height: "6px",
																			background: "#1A8C7A",
																			borderRadius: "50%",
																			display: "block",
																		}}
																	></span>{" "}
																	Broadcasting
																</span>
																<button
																	onClick={() =>
																		openApplicantDrawer(job.id, job.role)
																	}
																	style={{
																		background: "none",
																		border: "none",
																		padding: 0,
																		fontSize: "12px",
																		fontWeight: 700,
																		color: "#0B2444",
																		display: "flex",
																		alignItems: "center",
																		gap: "6px",
																		cursor: "pointer",
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
																		<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
																		<circle cx="9" cy="7" r="4"></circle>
																		<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
																		<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
																	</svg>
																	<span
																		style={{
																			textDecoration: "underline",
																			textUnderlineOffset: "4px",
																		}}
																	>
																		{job._count?.applications || 0} Applicants
																		&rarr;
																	</span>
																</button>
															</div>
														</td>
														<td
															style={{
																padding: "16px 24px",
																textAlign: "right",
															}}
														>
															<div
																style={{
																	display: "flex",
																	gap: "8px",
																	justifyContent: "flex-end",
																}}
															>
																<button
																	onClick={() =>
																		setEditModal({
																			isOpen: true,
																			jobId: job.id,
																			role: job.role,
																			loc: job.loc,
																			salary: job.salary,
																			skills: job.skills,
																		})
																	}
																	style={{
																		background: "#f8fafc",
																		color: "#475569",
																		border: "1px solid #e2e8f0",
																		padding: "6px 12px",
																		borderRadius: "6px",
																		fontSize: "11px",
																		fontWeight: 700,
																		cursor: "pointer",
																		transition: "0.2s",
																	}}
																>
																	Edit
																</button>
																<button
																	onClick={() =>
																		setDeleteModal({
																			isOpen: true,
																			jobId: job.id,
																		})
																	}
																	style={{
																		background: "#fef2f2",
																		color: "#ef4444",
																		border: "1px solid #fecaca",
																		padding: "6px 12px",
																		borderRadius: "6px",
																		fontSize: "11px",
																		fontWeight: 700,
																		cursor: "pointer",
																		transition: "0.2s",
																	}}
																>
																	Terminate
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</>
					) : (
						/* SCOUT CRM DIRECTORY VIEW PANEL */
						<div
							style={{
								background: "white",
								borderRadius: "24px",
								padding: "2.5rem",
								border: "1px solid #f1f5f9",
								boxShadow: "0 4px 24px rgba(0,0,0,0.01)",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "2rem",
									flexWrap: "wrap",
									gap: "1rem",
								}}
							>
								<div>
									<h2
										style={{
											fontSize: "20px",
											fontWeight: 850,
											color: "#0B2444",
											margin: 0,
										}}
									>
										Talent Pipeline Registry
									</h2>
									<p
										style={{
											margin: "4px 0 0 0",
											fontSize: "13px",
											color: "#64748b",
										}}
									>
										Directly scout and invite verified clinicians across the
										platform infrastructure.
									</p>
								</div>

								<div style={{ position: "relative" }}>
									<select
										value={filterLocation}
										onChange={(e) => setFilterLocation(e.target.value)}
										style={{
											padding: "10px 36px 10px 16px",
											fontSize: "13px",
											fontWeight: 700,
											color: "#334155",
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "10px",
											outline: "none",
											cursor: "pointer",
											appearance: "none",
										}}
									>
										<option value="">Filter Location (All)</option>
										<option value="Abuja">Abuja, FCT</option>
										<option value="Lagos">Lagos</option>
										<option value="Rivers">Rivers</option>
										<option value="Enugu">Enugu</option>
									</select>
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#64748b"
										strokeWidth="3"
										style={{
											position: "absolute",
											right: "12px",
											top: "50%",
											transform: "translateY(-50%)",
											pointerEvents: "none",
										}}
									>
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</div>
							</div>

							{crmLoading ? (
								<div
									style={{
										textAlign: "center",
										padding: "4rem",
										color: "#64748b",
										fontWeight: 700,
										fontSize: "14px",
									}}
								>
									Scanning verified credential node registers...
								</div>
							) : talentPool.length === 0 ? (
								<div
									style={{
										textAlign: "center",
										padding: "4rem",
										background: "#f8fafc",
										borderRadius: "16px",
										border: "1px dashed #e2e8f0",
									}}
								>
									<p
										style={{
											margin: 0,
											color: "#64748b",
											fontSize: "14px",
											fontWeight: 600,
										}}
									>
										No passive candidate registers active for the selected
										filters right now.
									</p>
								</div>
							) : (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "12px",
									}}
								>
									{talentPool.map((user) => (
										<div
											key={user.id}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												padding: "1.25rem",
												background: "#f8fafc",
												borderRadius: "16px",
												border: "1px solid #e2e8f0",
												flexWrap: "wrap",
												gap: "1rem",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "1rem",
												}}
											>
												<div
													style={{
														width: "44px",
														height: "44px",
														borderRadius: "50%",
														background: "#0B2444",
														color: "white",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontWeight: 800,
														fontSize: "15px",
													}}
												>
													{user.name ? user.name.charAt(0).toUpperCase() : "S"}
												</div>
												<div>
													<div
														style={{
															fontSize: "15px",
															fontWeight: 800,
															color: "#0f172a",
															display: "flex",
															alignItems: "center",
															gap: "8px",
														}}
													>
														{user.name || "Verified Scientist"}
														{user.licenseUrl && (
															<span
																style={{
																	fontSize: "10px",
																	fontWeight: 800,
																	color: "#1A8C7A",
																	background: "#e6fcf5",
																	padding: "2px 6px",
																	borderRadius: "4px",
																}}
															>
																MLSCN VERIFIED ✓
															</span>
														)}
													</div>
													<div
														style={{
															fontSize: "12px",
															color: "#64748b",
															marginTop: "2px",
															fontWeight: 550,
														}}
													>
														{user.email}
													</div>
												</div>
											</div>

											<div
												style={{
													display: "flex",
													gap: "10px",
													alignItems: "center",
												}}
											>
												{user.resumeUrl && (
													<a
														href={user.resumeUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															textDecoration: "none",
															fontSize: "12px",
															fontWeight: 700,
															color: "#475569",
															background: "white",
															border: "1px solid #cbd5e1",
															padding: "8px 14px",
															borderRadius: "8px",
															transition: "0.2s",
														}}
													>
														View CV
													</a>
												)}
												<button
													onClick={() => handleInviteTalent(user)}
													disabled={invitingId === user.id}
													style={{
														padding: "8px 16px",
														borderRadius: "8px",
														border: "none",
														background: "#0B2444",
														color: "white",
														fontSize: "12px",
														fontWeight: 800,
														cursor: invitingId === user.id ? "wait" : "pointer",
														boxShadow: "0 4px 10px rgba(11, 36, 68, 0.15)",
														transition: "0.2s",
													}}
												>
													{invitingId === user.id
														? "Inviting Transmit..."
														: "Invite to Placement"}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			) : (
				<div
					style={{
						minHeight: "80vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "1.5rem",
					}}
				>
					<div style={boxStyle}>
						<div style={{ textAlign: "center", marginBottom: "2rem" }}>
							<h2
								style={{
									fontSize: "24px",
									fontWeight: 900,
									color: "#0B2444",
									margin: 0,
								}}
							>
								BenchScout B2B
							</h2>
							<p
								style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}
							>
								Deploy verified placement pipelines directly.
							</p>
						</div>
						{error && (
							<div
								style={{
									background: "#fef2f2",
									border: "1px solid #fca5a5",
									color: "#b91c1c",
									padding: "12px",
									borderRadius: "8px",
									fontSize: "13px",
									fontWeight: 600,
									marginBottom: "1.5rem",
									textAlign: "center",
								}}
							>
								{error}
							</div>
						)}
						<form onSubmit={handleAuth}>
							{view === "register" && (
								<>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										HOSPITAL / REGIONAL LABORATORY NAME
									</label>
									<input
										type="text"
										placeholder="e.g. National Hospital Abuja"
										value={companyName}
										onChange={(e) => setCompanyName(e.target.value)}
										style={inputStyle}
										required
									/>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										CONTACT PERSONNEL NAME
									</label>
									<input
										type="text"
										placeholder="e.g. Dr. Alabi John"
										value={contactName}
										onChange={(e) => setContactName(e.target.value)}
										style={inputStyle}
									/>
								</>
							)}
							<label
								style={{
									fontSize: "11px",
									fontWeight: 800,
									color: "#64748b",
									letterSpacing: "0.5px",
								}}
							>
								CORPORATE EMAIL ADDRESS
							</label>
							<input
								type="email"
								placeholder="admin@hospital.gov.ng"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								style={inputStyle}
								required
							/>
							<label
								style={{
									fontSize: "11px",
									fontWeight: 800,
									color: "#64748b",
									letterSpacing: "0.5px",
								}}
							>
								SECURE ENTRY ACCESS CREDENTIAL
							</label>
							<input
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								style={inputStyle}
								required
							/>
							<button
								type="submit"
								disabled={loading}
								style={{
									width: "100%",
									background: "#0B2444",
									color: "white",
									padding: "14px",
									border: "none",
									borderRadius: "10px",
									fontSize: "14px",
									fontWeight: 800,
									cursor: "pointer",
									marginTop: "1rem",
								}}
							>
								{loading
									? "Processing Network Event..."
									: view === "login"
										? "Secure Portal Entry"
										: "Register Acquisition Node"}
							</button>
						</form>
						<div
							style={{
								textAlign: "center",
								marginTop: "1.5rem",
								fontSize: "13px",
								fontWeight: 600,
							}}
						>
							<span style={{ color: "#64748b" }}>
								{view === "login"
									? "Need direct network credentials? "
									: "Already verified node? "}
							</span>
							<span
								onClick={() => setView(view === "login" ? "register" : "login")}
								style={{ color: "#1A8C7A", cursor: "pointer" }}
							>
								{view === "login" ? "Request Entry" : "Login Securely"}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
