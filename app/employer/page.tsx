"use client";
import { setClientIdentity } from "@/lib/client-identity";
import { signOutToHome } from "@/lib/client-logout";
import EmployerVerification from "@/components/EmployerVerification";
import ProfessionalSummary from "@/components/ProfessionalSummary";
import Toast from "@/components/Toast";
import { updateApplicant } from "@/lib/applicant-update";
import { loadEmployerTalent } from "@/lib/employer-talent";
import { interviewScheduleError } from "@/lib/interview-schedule";
import { useCallback } from "react";
import { csvCell } from "@/lib/csv";
import { startTransition } from "react";
import { useMounted } from "@/lib/use-mounted";
import { careerLabel, listingDetails } from "@/lib/candidate-profile";
import type { Candidate, ClientApplication, ClientEmployer, ClientJob } from "@/lib/types";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type InvitedRecord = {
	candidateId: string;
	candidateName: string;
	candidateEmail: string;
	resumeUrl: string;
	licenseUrl: string;
	jobId: string;
	jobRole: string;
	timestamp: number;
};

export default function EmployerGateway() {

	const mounted = useMounted();
	const [view, setView] = useState<"login" | "register" | "dashboard">("login");
	const [employer, setEmployer] = useState<ClientEmployer | null>(null);
	const handleVerificationStatus = useCallback((verified: boolean) => setEmployer(current => current && current.isVerified !== verified ? { ...current, isVerified: verified } : current), []);

	// ACTIVE PANEL SUB-TAB STATE
	const [activeTab, setActiveTab] = useState<"broadcasts" | "crm" | "invites">(
		"broadcasts",
	);

	const [companyName, setCompanyName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [contactName, setContactName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [noFees, setNoFees] = useState(false);
	const [role, setRole] = useState("");
	const [loc, setLoc] = useState("");
	const [salary, setSalary] = useState("");
	const [skills, setSkills] = useState("");
	const [deadline, setDeadline] = useState("");
 const [requiredDocuments, setRequiredDocuments] = useState("");
	const [jobType, setJobType] = useState("full-time");


	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "warning";
	} | null>(null);
	const [postedJobs, setPostedJobs] = useState<ClientJob[]>([]);
	const [loadingJobs, setLoadingJobs] = useState(false);

	// TALENT SOURCING CRM DIRECTORY STATE
	const [talentPool, setTalentPool] = useState<Candidate[]>([]);
	const [updatingApplicant, setUpdatingApplicant] = useState<string | null>(null);
	const [crmLoading, setCrmLoading] = useState(false);
	const [crmError, setCrmError] = useState("");
	const talentRequest = useRef(0);
	const [filterLocation, setFilterLocation] = useState("");
	const [invitingId, setInvitingId] = useState<string | null>(null);

	// 🚀 TRACK RICH INVITATION RECORDS
	const [invitedRecords, setInvitedRecords] = useState<InvitedRecord[]>([]);

	// MULTI-BROADCAST SELECTION PORTAL STATE
	const [scoutTargetModal, setScoutTargetModal] = useState<{
		isOpen: boolean;
		user: Candidate | null;
	}>({ isOpen: false, user: null });

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
        deadline:string;requiredDocuments:string;
	}>({ isOpen: false, jobId: "", role: "", loc: "", salary: "", skills: "", deadline:"", requiredDocuments:"" });

	const [drawer, setDrawer] = useState<{
		isOpen: boolean;
		jobTitle: string;
		applicants: ClientApplication[];
		loading: boolean;
		error: string;
	}>({ isOpen: false, jobTitle: "", applicants: [], loading: false, error: "" });

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
		} catch {
			console.error("Failed to load employer jobs.");
		} finally {
			setLoadingJobs(false);
		}
	};

	const fetchTalentDirectory = useCallback(async () => {
		const sequence = ++talentRequest.current;
		const identity = localStorage.getItem("benchscout_identity");
		const isCurrent = () => sequence === talentRequest.current && identity === localStorage.getItem("benchscout_identity");
		setCrmLoading(true);
		setCrmError("");
		setTalentPool([]);
		try {
			const users = await loadEmployerTalent(filterLocation);
			if (isCurrent()) setTalentPool(users);
		} catch (error) {
			if (isCurrent()) setCrmError(error instanceof Error ? error.message : "Could not load previous applicants. Please retry.");
		} finally {
			if (isCurrent()) setCrmLoading(false);
		}
	}, [filterLocation]);

	const handleInitiateSourcingInvite = (user: Candidate) => {
		if (!postedJobs.some(job => job.status === "active")) {
			return showToast(
				"You need an active vacancy before sending an invitation.",
				"warning",
			);
		}
		setScoutTargetModal({ isOpen: true, user });
	};

	const executeTargetedInvite = async (selectedJob: ClientJob) => {
		const targetUser = scoutTargetModal.user;
		if (!targetUser) return;

		setInvitingId(targetUser.id);

		try {
			const res = await fetch("/api/employer/talent", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					candidateId: targetUser.id,
					candidateEmail: targetUser.email,
					candidateName: targetUser.name,
					employerName: employer!.companyName,
					jobId: selectedJob.id,
					jobRole: selectedJob.role,
				}),
			});

			const invitation = await res.json();
			if (res.ok) {
				setScoutTargetModal({ isOpen: false, user: null });
				showToast(
					`Invitation sent for ${selectedJob.role}.`,
					"success",
				);

				// 🚀 SAVE RICH RECORD TO STATE & STORAGE
				const newRecord: InvitedRecord = {
					candidateId: targetUser.id,
					candidateName: targetUser.name || "Scientist",
					candidateEmail: targetUser.email,
					resumeUrl: targetUser.resumeUrl || "",
					licenseUrl: targetUser.licenseUrl || "",
					jobId: selectedJob.id,
					jobRole: selectedJob.role,
					timestamp: Date.parse(invitation.createdAt),
				};

				const updatedRecords = [...invitedRecords, newRecord];
				setInvitedRecords(updatedRecords);
				localStorage.setItem(
					`benchscout_invited_v2_${employer!.id}`,
					JSON.stringify(updatedRecords),
				);

				window.dispatchEvent(new Event("refreshNotifications"));
			} else {
				showToast(invitation.error || "Couldn’t send this invitation. Please try again.", "error");
			}
		} catch {
			showToast("Couldn’t connect to send the invitation. Please try again.", "error");
		} finally {
			setInvitingId(null);
		}
	};

	const invalidateTalentRequest = useCallback(() => { talentRequest.current++; }, []);

	useEffect(() => {
		if ((activeTab === "crm" || activeTab === "invites") && employer) {
			startTransition(() => { fetchTalentDirectory(); });
		}
		return invalidateTalentRequest;
	}, [activeTab, employer, fetchTalentDirectory, invalidateTalentRequest]);

	const openApplicantDrawer = async (jobId: string, jobTitle: string) => {
		setDrawer({ isOpen: true, jobTitle, applicants: [], loading: true, error: "" });
		try {
			const res = await fetch(`/api/jobs/applicants?jobId=${jobId}`);
			const data = await res.json();
			if (!res.ok) {
				setDrawer((prev) => ({ ...prev, loading: false, error: data.error || "Unable to load applicants. Please try again." }));
				return;
			}
			if (data.success) {
				setDrawer((prev) => ({
					...prev,
					applicants: data.applications || [],
					loading: false,
				}));
			} else {
				setDrawer((prev) => ({ ...prev, loading: false, error: "Unable to load applicants. Please try again." }));
			}
		} catch {
			setDrawer((prev) => ({ ...prev, loading: false, error: "Unable to connect. Please try again." }));
		}
	};

	const handleRejectApplicant = async (applicationId: string) => {
        if (updatingApplicant) return;
        const identity = localStorage.getItem("benchscout_identity");
        setUpdatingApplicant(applicationId);
        try {
            const { application } = await updateApplicant({ applicationId, status: "rejected" });
            if (identity !== localStorage.getItem("benchscout_identity")) return;
            setDrawer(previous => ({ ...previous, applicants: previous.applicants.map(app => app.id === applicationId ? { ...app, status: application.status } : app) }));
            showToast("Application marked as rejected. The candidate was notified in the app.", "warning");
        } catch (error) {
            if (identity === localStorage.getItem("benchscout_identity")) showToast(error instanceof Error ? error.message : "Could not update this application. Please retry.", "error");
        } finally { setUpdatingApplicant(null); }
    };

    const submitInterviewSchedule = async (event: React.FormEvent) => {
        event.preventDefault();
        if (updatingApplicant) return;
        const scheduleError = interviewScheduleError(interviewModal.date, interviewModal.time);
        if (scheduleError) { showToast(scheduleError, "error"); return; }
        const identity = localStorage.getItem("benchscout_identity");
        setUpdatingApplicant(interviewModal.applicationId);
        setLoading(true);
        try {
            const { application, emailDelivered } = await updateApplicant({
                applicationId: interviewModal.applicationId, status: "shortlisted",
                interviewDate: interviewModal.date, interviewTime: interviewModal.time, interviewLoc: interviewModal.location,
            });
            if (identity !== localStorage.getItem("benchscout_identity")) return;
            setDrawer(previous => ({ ...previous, applicants: previous.applicants.map(app => app.id === application.id ? { ...app, status: application.status, interviewDate: application.interviewDate, interviewTime: application.interviewTime, interviewLoc: application.interviewLoc } : app) }));
            showToast(emailDelivered ? "Interview saved. In-app notification created and email sent." : "Interview saved and candidate notified in the app. Email delivery failed; contact the candidate directly.", emailDelivered ? "success" : "warning");
            setInterviewModal({ isOpen: false, applicationId: "", date: "", time: "", location: "", candidateName: "" });
        } catch (error) {
            if (identity === localStorage.getItem("benchscout_identity")) showToast(error instanceof Error ? error.message : "Could not schedule this interview. Please retry.", "error");
        } finally { setLoading(false); setUpdatingApplicant(null); }
    };

	useEffect(() => {
		let cancelled = false;
		fetch("/api/auth/session").then(async response => {
			if (!response.ok) return;
			const data = await response.json();
			if (cancelled || data.session?.role !== "employer") return;
			const session = data.session;
			const account = { id: session.id, email: session.email, companyName: session.name, isVerified: session.verified };
			setEmployer(account);
			setView("dashboard");
			fetchEmployerJobs(account.id);
			try {
				const saved = JSON.parse(localStorage.getItem(`benchscout_invited_v2_${account.id}`) || "[]");
				if (Array.isArray(saved)) setInvitedRecords(saved);
			} catch { /* Ignore an invalid local invitation cache. */ }
		}).catch(() => setError("Unable to restore your session. Please sign in again."));
		return () => { cancelled = true; };
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
					setClientIdentity("employer", data.employer.id);
					localStorage.setItem(
						"benchscout_active_employer",
						JSON.stringify(data.employer),
					);
					window.location.replace("/employer");
					return;
				} else {
					setView("login");
					setCompanyName("");
					setPassword("");
					showToast(
						data.warning || data.message || "Confirm your email before signing in.",
						data.warning ? "warning" : "success",
					);
				}
			} else {
				setError(data.error || "An authentication error occurred.");
			}
		} catch {
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
					company: employer!.companyName,
					loc,
					salary,
					skills,
					jobType,
                    deadline, requiredDocuments, noFees,

					employerId: employer!.id,
				}),
			});
			const data = await res.json();

			if (data.success) {
				showToast(
					"Vacancy submitted for review. It will appear in matches after approval.",
					"success",
				);
				setRole("");
				setLoc("");
				setSalary("");
				setSkills("");
				fetchEmployerJobs(employer!.id);
			} else {
				showToast(data.error || "Could not submit vacancy.", "error");
			}
		} catch {
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
                    deadline:editModal.deadline,requiredDocuments:editModal.requiredDocuments,
				}),
			});
			const data = await res.json();

			if (data.success) {
				showToast("Vacancy updated and sent for review.", "success");
				setEditModal((prev) => ({ ...prev, isOpen: false }));
				fetchEmployerJobs(employer!.id);
			} else {
				showToast("Failed to update broadcast.", "error");
			}
		} catch {
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
					employerId: employer!.id,
				}),
			});
			if (res.ok) {
				showToast("Vacancy closed. Application history preserved.", "success");
				setDeleteModal({ isOpen: false, jobId: null });
				fetchEmployerJobs(employer!.id);
			} else {
				showToast("Failed to close vacancy.", "error");
			}
		} catch {
			showToast("Network error closing vacancy.", "error");
		}
	};

	const handleLogout = async () => {
		if (!(await signOutToHome())) showToast("Couldn’t sign out. Please try again.", "error");
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
		<div className="employer-page" style={{ width: "100%", minHeight: "100dvh" }}>
			<style
				dangerouslySetInnerHTML={{
					__html: `@keyframes slideDownToast { 0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; } 100% { transform: translate(-50%, 0) scale(1); opacity: 1; } } @keyframes modalFadeIn { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } } @keyframes slideInDrawer { 0% { transform: translateX(120%); } 100% { transform: translateX(0); } } @keyframes fadeOverlay { 0% { opacity: 0; } 100% { opacity: 1; } }`,
				}}
			/>

			{toast && <Toast message={toast.message} type={toast.type} />}

			{/* 🚀 UPGRADED: MULTI-BROADCAST SELECTION OVERLAY */}
			{scoutTargetModal.isOpen &&
				createPortal(
					<div
						className="employer-overlay"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100dvh",
							background: "rgba(15, 23, 42, 0.15)",
							backdropFilter: "blur(18px)",
							WebkitBackdropFilter: "blur(18px)",
							zIndex: 300002,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							padding: "1.5rem",
						}}
					>
						<div
							className="employer-dialog employer-panel" role="dialog" aria-modal="true" aria-label="Employer dialog"
							style={{
								background: "white",
								width: "100%",
								maxWidth: "420px",
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
								<div>
									<h3
										style={{
											fontSize: "18px",
											fontWeight: 850,
											color: "#0f172a",
											margin: 0,
										}}
									>
										Select a vacancy
									</h3>
									<p
										style={{
											margin: "4px 0 0 0",
											fontSize: "12px",
											color: "#64748b",
										}}
									>
										Choose an active vacancy for this candidate.
									</p>
								</div>
								<button
									onClick={() =>
										setScoutTargetModal({ isOpen: false, user: null })
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
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
									maxHeight: "300px",
									overflowY: "auto",
								}}
							>
								{postedJobs.map((job) => {
									const unavailable = job.status !== "active";
									const isAlreadySent = invitedRecords.some(
										(r) =>
											r.candidateId === scoutTargetModal.user?.id &&
											r.jobId === job.id,
									);
									return (
										<button type="button" disabled={unavailable || isAlreadySent || invitingId !== null}
											key={job.id}
											onClick={() =>
												!unavailable && !isAlreadySent && invitingId === null && executeTargetedInvite(job)
											}
											style={{
												font: "inherit", textAlign: "left", width: "100%",
												padding: "14px 16px",
												background: isAlreadySent
													? "rgba(241, 245, 249, 0.5)"
													: "#f8fafc",
												border: "1px solid",
												borderColor: isAlreadySent ? "transparent" : "#e2e8f0",
												borderRadius: "12px",
												cursor: unavailable || isAlreadySent || invitingId !== null ? "not-allowed" : "pointer",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												opacity: unavailable || isAlreadySent ? 0.6 : 1,
												transition: "0.2s",
											}}
											onMouseEnter={(e) => {
												if (!unavailable && !isAlreadySent) {
													e.currentTarget.style.borderColor = "#1A8C7A";
													e.currentTarget.style.background = "#e6fcf5";
												}
											}}
											onMouseLeave={(e) => {
												if (!unavailable && !isAlreadySent) {
													e.currentTarget.style.borderColor = "#e2e8f0";
													e.currentTarget.style.background = "#f8fafc";
												}
											}}
										>
											<div>
												<div
													style={{
														fontWeight: 800,
														color: "#0f172a",
														fontSize: "13.5px",
													}}
												>
													{job.role}
												</div>
												<div
													style={{
														fontSize: "11px",
														color: "#64748b",
														marginTop: "4px",
													}}
												>
													{job.loc} • {job.salary}
												</div>
											</div>
											{(isAlreadySent || unavailable) && (
												<span
													style={{
														fontSize: "11px",
														fontWeight: 800,
														color: "#1A8C7A",
														background: "#e6fcf5",
														padding: "4px 8px",
														borderRadius: "6px",
													}}
												>
													{isAlreadySent ? "Sent ✓" : "Not active"}
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>
					</div>,
					document.body,
				)}

			{/* SCHEDULE INTERVIEW MODAL */}
			{interviewModal.isOpen &&
				createPortal(
					<div
						className="employer-overlay"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100dvh",
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
							className="employer-dialog employer-panel" role="dialog" aria-modal="true" aria-label="Employer dialog"
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
								<div className="employer-interview-fields" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "12px" }}>
									<div style={{ minWidth: 0 }}>
										<label htmlFor="interview-date"
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Date (Africa/Lagos)
										</label>
										<input
											id="interview-date"
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
									<div style={{ minWidth: 0 }}>
										<label htmlFor="interview-time"
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
												textTransform: "uppercase",
											}}
										>
											Time (Africa/Lagos)
										</label>
										<input
											id="interview-time"
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
										Saving will automatically sync this to the candidate&apos;s
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
						className="employer-overlay"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100dvh",
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
							className="employer-dialog employer-panel" role="dialog" aria-modal="true" aria-label="Employer dialog"
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
									Edit vacancy
								</h3>
								<button
									aria-label="Close dialog" onClick={() => setEditModal({ ...editModal, isOpen: false })}
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
									Job title
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
									Location
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
									Monthly salary
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
									Skills (comma separated)
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
								<label style={{fontSize:12,color:"#64748b"}}>Deadline (optional)<input type="date" value={editModal.deadline} onChange={event=>setEditModal({...editModal,deadline:event.target.value})} style={inputStyle} /></label>
<label style={{fontSize:12,color:"#64748b"}}>Required documents<input value={editModal.requiredDocuments} maxLength={500} onChange={event=>setEditModal({...editModal,requiredDocuments:event.target.value})} style={inputStyle} /></label>
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
									{loading ? "Updating Node..." : "Save changes"}
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
						className="employer-overlay"
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100dvh",
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
							className="employer-dialog employer-panel" role="dialog" aria-modal="true" aria-label="Employer dialog"
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
								Close vacancy?
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
								This stops new applications and removes the vacancy from discovery. Existing applications and their history are preserved.
							</p>
							<div style={{ display: "flex", gap: "10px" }}>
								<button
									aria-label="Close dialog" onClick={() => setDeleteModal({ isOpen: false, jobId: null })}
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
									Close vacancy
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
							height: "100dvh",
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
							className="employer-drawer" role="dialog" aria-modal="true" aria-label="Applicant roster"
							style={{
								position: "relative",
								background: "rgba(248, 250, 252, 0.9)",
								backdropFilter: "blur(40px)",
								WebkitBackdropFilter: "blur(40px)",
								width: "100%",
								maxWidth: "460px",
								height: "100dvh",
								borderLeft: "1px solid rgba(255, 255, 255, 0.7)",
								display: "flex",
								flexDirection: "column",
								boxShadow: "-20px 0 60px rgba(15, 23, 42, 0.08)",
								animation:
									"slideInDrawer 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
								overflow: "hidden",
							}}
						>
							<div
								className="employer-panel employer-roster-header"
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
    app.user.name || "Candidate", app.user.email, app.status || "pending",
    app.user.resumeUrl || "None",
    app.user.isLicenseVerified ? "Reviewed" : (app.user.careerPhase === "internship" ? app.user.provisionalUrl : app.user.licenseUrl) ? "Not reviewed" : "Not shared / unavailable",
    app.user.degreeUrl ? "Uploaded, not reviewed" : "Not shared / unavailable",
  ].map(csvCell));
  const csvContent =
													"data:text/csv;charset=utf-8," +
													[
														headers.join(","),
														...rows.map((e) => e.join(",")),
													].join("\n");
												const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent.slice("data:text/csv;charset=utf-8,".length));
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
									<button aria-label="Close applicant roster"
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
							<div
								className="employer-panel employer-roster-body"
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
								) : drawer.error ? (
									<div role="alert" className="employer-panel" style={{ padding: "1.25rem", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "16px", color: "#9a3412", fontSize: "14px", lineHeight: 1.6, overflowWrap: "anywhere" }}>
										{drawer.error}
									</div>
								) : drawer.applicants.length === 0 ? (
									<div
										className="employer-panel"
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
											key={app.id} className="employer-applicant"
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "1.25rem",
											}}
										>
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
														{app.user.name || "Candidate"}
													</div>
													<div
														style={{
															fontSize: "11px",
															color: "#64748b",
															fontWeight: 600,
															marginTop: "1px",
														}}
													>
														{app.user.email}<div style={{fontSize:11,color:"#1A8C7A",marginTop:4}}>{careerLabel(app.user.careerPhase,{placementStage:app.user.placementStage})} · {app.user.isLicenseVerified ? "Credentials reviewed" : (app.user.careerPhase === "internship" ? app.user.provisionalUrl : app.user.licenseUrl) ? "Credentials self-reported" : "Credentials not shared"}</div>
													</div>
												</div>
											</div>
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
												<ProfessionalSummary summary={app.user.professionalSummary ?? null} />
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
													Shared application documents
												</h4>
												<p style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>Only documents selected for this application appear here. Replaced or deleted files are unavailable.</p>
{app.user.degreeUrl && <a href={app.user.degreeUrl} target="_blank" rel="noopener noreferrer">Degree certificate ↗</a>}
{app.user.placementLetterUrl && <a href={app.user.placementLetterUrl} target="_blank" rel="noopener noreferrer">Placement letter ↗</a>}
{app.user.certificateUrl && <a href={app.user.certificateUrl} target="_blank" rel="noopener noreferrer">Additional certificate ↗</a>}
{app.user.provisionalUrl && <a href={app.user.provisionalUrl} target="_blank" rel="noopener noreferrer" style={{color:"#1A8C7A",fontSize:13}}>Provisional license ↗</a>}
{app.user.statementOfResultUrl && <a href={app.user.statementOfResultUrl} target="_blank" rel="noopener noreferrer" style={{color:"#1A8C7A",fontSize:13}}>Statement of result ↗</a>}
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
												<a
														href={app.user.licenseUrl}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															textDecoration: "none",
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
															{app.user.isLicenseVerified ? "Reviewed" : "Not reviewed"} · View
														</span>
													</a>
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
															Uploaded
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
															Not shared / unavailable
														</span>
													</div>
												)}
											</div>
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
															disabled={updatingApplicant !== null}
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
					className="employer-panel employer-dashboard"
					style={{
						maxWidth: "1000px",
						margin: "0 auto",
						padding: "3rem 1.5rem",
						paddingBottom: "6rem",
					}}
				>
					<div
						className="employer-heading"
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
								{employer!.companyName} Portal
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

					<EmployerVerification key={employer.id} onStatusChange={handleVerificationStatus} />
					{/* GLASS NAVIGATION SWITCHER FOR TAB MODE */}
					<div
						className="employer-tabs"
						style={{
							display: "flex",
							background: "rgba(15, 23, 42, 0.04)",
							backdropFilter: "blur(8px)",
							padding: "6px",
							borderRadius: "14px",
							width: "100%",
							maxWidth: "480px",
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
							Vacancies
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
							Previous applicants
						</button>
						<button
							onClick={() => setActiveTab("invites")}
							style={{
								flex: 1,
								padding: "10px",
								borderRadius: "10px",
								border: "none",
								fontSize: "13px",
								fontWeight: 800,
								cursor: "pointer",
								transition: "0.2s cubic-bezier(0.16, 1, 0.3, 1)",
								background: activeTab === "invites" ? "white" : "transparent",
								color: activeTab === "invites" ? "#0B2444" : "#64748b",
								boxShadow:
									activeTab === "invites"
										? "0 4px 12px rgba(0,0,0,0.05)"
										: "none",
							}}
						>
							Sent Invites
						</button>
					</div>

					{activeTab === "broadcasts" ? (
						<>
							<div
								className="employer-grid"
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
									gap: "2rem",
									alignItems: "start",
								}}
							>
								<div
									className="employer-panel employer-post-card"
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
										Post a laboratory role
									</h2>
									<form className="employer-post-form" onSubmit={handlePostJob}>
										<div className="employer-post-fields">
											<div className="employer-post-field post-field-wide">
												<label htmlFor="post-role">Job title</label>
												<input id="post-role" type="text" placeholder="e.g. Laboratory Scientist" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} required />
											</div>
											<div className="employer-post-field">
												<label htmlFor="post-location">Location</label>
												<input id="post-location" type="text" placeholder="Garki, Abuja" value={loc} onChange={(e) => setLoc(e.target.value)} style={inputStyle} required />
											</div>
											<div className="employer-post-field">
												<label htmlFor="post-salary">Monthly salary</label>
												<input id="post-salary" type="text" placeholder="₦180,000" value={salary} onChange={(e) => setSalary(e.target.value)} style={inputStyle} />
											</div>
											<div className="employer-post-field post-field-wide">
												<label htmlFor="post-skills">Skills (comma separated)</label>
												<input id="post-skills" type="text" placeholder="e.g. Hematology, QMS" value={skills} onChange={(e) => setSkills(e.target.value)} style={inputStyle} required />
											</div>
										</div>
										<div className="employer-post-options"
											style={{
												display: "grid",
												gap: "12px",
												marginBottom: "1.5rem",
												background: "#f8fafc",
												padding: "12px",
												borderRadius: "10px",
												border: "1px solid #e2e8f0",
											}}
										>
											<div className="employer-vacancy-extra" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",gap:12,marginBottom:0}}>
<label style={{fontSize:12,color:"#64748b",minWidth:0}}>Deadline (optional)<input type="date" value={deadline} onChange={event=>setDeadline(event.target.value)} style={{display:"block",boxSizing:"border-box",width:"100%",minWidth:0,padding:10,border:"1px solid #e2e8f0",borderRadius:10,marginTop:6,font:"inherit"}} /></label>
<label style={{fontSize:12,color:"#64748b",minWidth:0}}>Required documents<input value={requiredDocuments} maxLength={500} onChange={event=>setRequiredDocuments(event.target.value)} placeholder="CV, provisional license…" style={{display:"block",boxSizing:"border-box",width:"100%",minWidth:0,padding:10,border:"1px solid #e2e8f0",borderRadius:10,marginTop:6,font:"inherit"}} /></label>
</div>
<label style={{display:"grid",gap:6,fontSize:12,color:"#64748b"}}>Vacancy type
<select value={jobType} onChange={event=>setJobType(event.target.value)} style={{minWidth:0,padding:"9px 12px",border:"1px solid #e2e8f0",borderRadius:10,background:"#f8fafc",color:"#0b2444",font:"inherit"}}>
<option value="full-time">Licensed scientist · Permanent</option><option value="internship">Internship placement</option><option value="locum">Licensed scientist · Locum</option><option value="contract">Licensed scientist · Contract</option><option value="part-time">Licensed scientist · Part-time</option>
</select></label>
											{jobType === "internship" && <p style={{fontSize:11,color:"#64748b",lineHeight:1.6,margin:0}}>Internship-site approval is shown only after independent review of official MLSCN evidence.</p>}
										</div>
										<label className="employer-no-fees" style={{display:"flex",gap:8,fontSize:12,lineHeight:1.6,marginBottom:14}}><input type="checkbox" required checked={noFees} onChange={event => setNoFees(event.target.checked)} />I am authorised to recruit for this role. Applicants will not be charged application, interview, placement or processing fees.</label>
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
												? "Submitting…"
												: "Submit for review"}
										</button>
									</form>
								</div>
								<aside className="employer-workspace-notes">
  <h3>Recruitment access</h3>
  <p>Company approval is required to publish vacancies and access applicants. Every new or edited vacancy also needs review.</p>
  <div className="employer-published-count"><strong>{postedJobs.filter(job => job.status === "active").length}</strong> published vacancies</div>
  <p>Only documents selected by the applicant are shared. Uploaded credentials are separate from independently reviewed qualifications.</p>
</aside>
</div>
<div className="employer-vacancy-section" style={{ marginTop: "4rem" }}>
								<h2 className="employer-vacancy-heading"
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
									<span className="vacancy-heading-text">Vacancies</span>
									<span className="vacancy-count"
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
										className="employer-panel"
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
										className="employer-panel"
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
									<div className="employer-vacancies"
										style={{
											background: "white",
											borderRadius: "20px",
											border: "1px solid #f1f5f9",
											boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
											overflow: "hidden",
										}}
									>
										<table className="employer-jobs-table"
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
														<td className="vacancy-role" data-label="Role" style={{ padding: "16px 24px" }}>
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
														<td className="vacancy-location" data-label="Location"
															style={{
																padding: "16px 24px",
																color: "#475569",
																fontSize: "13px",
																fontWeight: 600,
															}}
														>
															<span>{job.loc}</span>
														<span className="vacancy-salary">Salary: {job.salary || "Not disclosed"}</span>
														</td>
														<td className="vacancy-activity" data-label="Status / Applicants" style={{ padding: "16px 24px" }}>
															<div
																style={{
																	display: "flex",
																	gap: "8px",
																	flexDirection: "column",
																	alignItems: "flex-start",
																}}
															>
																<span className="vacancy-status-badge" data-status={job.status}
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
																	{job.status === "active" ? "Active" : (job.status === "pending-review" ? "Awaiting review" : (job.status || "Unknown").replaceAll("_", " "))}
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
																		{job._count?.applications || 0}{" "}
														{job._count?.applications === 1 ? "Applicant" : "Applicants"}{" "}
																		&rarr;
																	</span>
																</button>
															</div>
														</td>
														<td className="vacancy-actions" data-label="Actions"
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
                                                        deadline:listingDetails(job.listingDetails).deadline,requiredDocuments:listingDetails(job.listingDetails).requiredDocuments,
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
																	Close vacancy
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
					) : activeTab === "crm" ? (
						/* SCOUT CRM DIRECTORY VIEW PANEL */
						<div
							className="employer-panel employer-talent-panel"
							style={{
								background: "white",
								borderRadius: "24px",
								padding: "2.5rem",
								border: "1px solid #f1f5f9",
								boxShadow: "0 4px 24px rgba(0,0,0,0.01)",
							}}
						>
							<div className="employer-talent-header"
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
										Invite previous applicants from your organization’s
										platform infrastructure.
									</p>
								</div>
								<div className="employer-talent-filter" style={{ position: "relative" }}>
									<select aria-label="Filter applicants by location"
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
										<option value="">All locations</option>
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
									className="employer-panel"
									style={{
										textAlign: "center",
										padding: "4rem",
										color: "#64748b",
										fontWeight: 700,
										fontSize: "14px",
									}}
								>
									Loading your applicant directory...
								</div>
							) : crmError ? (
                                <div role="alert" style={{padding:"1.25rem",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:12,color:"#9a3412"}}>
                                  <p style={{margin:"0 0 12px",lineHeight:1.5}}>{crmError}</p>
                                  <button type="button" onClick={fetchTalentDirectory} style={{padding:"8px 14px",border:"1px solid #fdba74",borderRadius:8,background:"white",color:"#9a3412",fontWeight:700,cursor:"pointer"}}>Retry loading applicants</button>
                                </div>
                            ) : talentPool.length === 0 ? (
								<div
									className="employer-panel"
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
										No previous applicants match this location.
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
									{talentPool.map((user) => {
										return (
											<div className="employer-talent-card"
												key={user.id}
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													padding: "1.25rem",
													background: "#f8fafc",
													border: "1px solid #e2e8f0",
													flexWrap: "wrap",
													gap: "1rem",
													borderRadius: "16px",
												}}
											>
												<div className="employer-talent-identity"
													style={{
														display: "flex",
														alignItems: "center",
														gap: "1rem",
													}}
												>
													<div className="employer-talent-avatar" aria-hidden="true"
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
														{user.name
															? user.name.charAt(0).toUpperCase()
															: "S"}
													</div>
													<div className="employer-talent-copy">
														<div className="employer-talent-name-row"
															style={{
																fontSize: "15px",
																fontWeight: 800,
																color: "#0f172a",
																display: "flex",
																alignItems: "center",
																gap: "8px",
															}}
														>
															<span className="employer-talent-name">{user.name || "Candidate"}</span>
															{(user.careerPhase === "internship" ? user.provisionalUrl : user.licenseUrl) && (
																<span className="employer-talent-credentials"
																	style={{
																		fontSize: "10px",
																		fontWeight: 800,
																		color: "#1A8C7A",
																		background: "#e6fcf5",
																		padding: "2px 6px",
																		borderRadius: "4px",
																	}}
																>
																	Credentials submitted
																</span>
															)}
														</div>
														<div className="employer-talent-email"
															style={{
																fontSize: "12px",
																color: "#64748b",
																marginTop: "2px",
																fontWeight: 550,
															}}
														>
															{user.email}<div style={{fontSize:11,color:"#1A8C7A",fontWeight:500,marginTop:3}}>{careerLabel(user.careerPhase,{placementStage:user.placementStage})}</div>
														</div>
													</div>
												</div>
												<div className="employer-talent-actions"
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
														onClick={() => handleInitiateSourcingInvite(user)}
														disabled={invitingId === user.id}
														style={{
															padding: "8px 16px",
															borderRadius: "8px",
															border: "none",
															background: "#0B2444",
															color: "white",
															fontSize: "12px",
															fontWeight: 800,
															cursor:
																invitingId === user.id ? "wait" : "pointer",
															boxShadow: "0 4px 10px rgba(11, 36, 68, 0.15)",
															transition: "0.2s",
														}}
													>
														{invitingId === user.id
															? "Inviting Transmit..."
															: "Invite to Placement"}
													</button>
												</div>
<div style={{flexBasis:"100%",minWidth:0}}><ProfessionalSummary summary={user.professionalSummary ?? null} /></div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					) : activeTab === "invites" ? (
						/* 🚀 NEW SENT INVITES TRACKER TAB */
						<div
							className="employer-panel"
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
										Sent Invitations
									</h2>
									<p
										style={{
											margin: "4px 0 0 0",
											fontSize: "13px",
											color: "#64748b",
										}}
									>
										Track your direct recruitment outreaches.
									</p>
								</div>
							</div>

							{crmLoading ? (
								<div
									className="employer-panel"
									style={{
										textAlign: "center",
										padding: "4rem",
										color: "#64748b",
										fontWeight: 700,
										fontSize: "14px",
									}}
								>
									Synchronizing outgoing records...
								</div>
							) : invitedRecords.length === 0 ? (
								<div
									className="employer-panel"
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
										No VIP invitations have been dispatched yet.
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
									{[...invitedRecords].reverse().map((record, idx) => (
										<div
											key={idx}
											style={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												padding: "1.25rem",
												background: "#f8fafc",
												border: "1px solid #e2e8f0",
												flexWrap: "wrap",
												gap: "1rem",
												borderRadius: "16px",
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
														background: "#1A8C7A",
														color: "white",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														fontWeight: 800,
														fontSize: "15px",
													}}
												>
													{record.candidateName
														? record.candidateName.charAt(0).toUpperCase()
														: "S"}
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
														{record.candidateName || "Scientist"}
														{record.licenseUrl && (
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
																CREDENTIALS SUBMITTED
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
														Invited for:{" "}
														<strong style={{ color: "#0f172a" }}>
															{record.jobRole}
														</strong>
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
												{record.resumeUrl && (
													<a
														href={record.resumeUrl}
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
												<div
													style={{
														padding: "8px 16px",
														borderRadius: "8px",
														border: "1px solid #a7f3d0",
														background: "#e6fcf5",
														color: "#1A8C7A",
														fontSize: "12px",
														fontWeight: 800,
													}}
												>
													Invite Dispatched ✓
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					) : null}
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
					<div className="employer-auth-card" style={boxStyle}>
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
								Post laboratory roles and manage applications from one workspace. Employer review is required before publishing.
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
								WORK EMAIL ADDRESS
							</label>
							<input
								type="email"
								placeholder="you@hospital.ng"
                                    aria-label="Work email address"
                                    autoComplete="email"
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
								PASSWORD
							</label>
							<input
								type="password"
								placeholder="Password"
                                    aria-label="Password"
                                    autoComplete={view === "login" ? "current-password" : "new-password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								style={inputStyle}
								required
							/>
							{view === "login" && <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("openProfileModal", { detail: { mode: "forgot", role: "employer", email } }))} style={{ display: "block", marginLeft: "auto", padding: "8px 0", border: "none", background: "none", color: "#1A8C7A", font: "inherit", fontSize: 13, cursor: "pointer" }}>Forgot password?</button>}
							{view === "login" && <button type="button" onClick={() => { if (!email) { setError("Enter your email address first."); return; } window.dispatchEvent(new CustomEvent("openProfileModal", { detail: { mode: "verify-sent", role: "employer", email } })); }} style={{ display: "block", marginLeft: "auto", padding: "8px 0", border: "none", background: "none", color: "#1A8C7A", font: "inherit", fontSize: 13, cursor: "pointer" }}>Resend confirmation</button>}
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
									? "Please wait…"
									: view === "login"
										? "Log in"
										: "Create employer account"}
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
									? "New to BenchScout? "
									: "Already verified node? "}
							</span>
							<span
								onClick={() => setView(view === "login" ? "register" : "login")}
								style={{ color: "#1A8C7A", cursor: "pointer" }}
							>
								{view === "login" ? "Create employer account" : "Log in"}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
