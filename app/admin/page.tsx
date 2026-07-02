"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AdminCommandCenter() {
	const [mounted, setMounted] = useState(false);
	const [activeTab, setActiveTab] = useState<"inject" | "manage">("inject");
	const [passcode, setPasscode] = useState("");

	// Inject State
	const [role, setRole] = useState("");
	const [company, setCompany] = useState("");
	const [loc, setLoc] = useState("");
	const [url, setUrl] = useState("");
	const [salary, setSalary] = useState("");
	const [skills, setSkills] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ text: "", type: "" });

	// Manage State
	const [managedJobs, setManagedJobs] = useState<any[]>([]);
	const [loadingJobs, setLoadingJobs] = useState(false);

	// Edit Modal State
	const [editModal, setEditModal] = useState({
		isOpen: false,
		oldRole: "",
		oldCompany: "",
		role: "",
		company: "",
		loc: "",
		url: "",
		salary: "",
		skills: "",
	});

	useEffect(() => setMounted(true), []);

	const handleInject = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ text: "", type: "" });

		try {
			const res = await fetch("/api/admin/add-job", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					passcode,
					role,
					company,
					loc,
					url,
					salary,
					skills,
				}),
			});
			const data = await res.json();

			if (data.success) {
				setMessage({
					text: `✓ Job successfully injected into ${data.injectedCount} candidate feeds!`,
					type: "success",
				});
				setRole("");
				setCompany("");
				setLoc("");
				setUrl("");
				setSalary("");
				setSkills("");
			} else {
				setMessage({ text: `✕ ${data.error}`, type: "error" });
			}
		} catch (err) {
			setMessage({ text: "✕ Network error.", type: "error" });
		} finally {
			setLoading(false);
		}
	};

	const fetchManagedJobs = async () => {
		if (!passcode) {
			return setMessage({
				text: "✕ Please enter your Admin Passcode first.",
				type: "error",
			});
		}
		setLoadingJobs(true);
		setMessage({ text: "", type: "" });
		try {
			const res = await fetch(
				`/api/admin/jobs?passcode=${encodeURIComponent(passcode)}`,
			);
			const data = await res.json();
			if (data.success) {
				setManagedJobs(data.jobs);
				if (data.jobs.length === 0)
					setMessage({
						text: "No active admin injections found.",
						type: "success",
					});
			} else {
				setMessage({ text: `✕ ${data.error}`, type: "error" });
			}
		} catch (err) {
			setMessage({ text: "✕ Failed to load jobs.", type: "error" });
		} finally {
			setLoadingJobs(false);
		}
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch("/api/admin/jobs", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					passcode,
					oldRole: editModal.oldRole,
					oldCompany: editModal.oldCompany,
					role: editModal.role,
					company: editModal.company,
					loc: editModal.loc,
					url: editModal.url,
					salary: editModal.salary,
					skills: editModal.skills,
				}),
			});
			const data = await res.json();

			if (data.success) {
				setMessage({
					text: `✓ Successfully updated ${data.count} global job records.`,
					type: "success",
				});
				setEditModal({ ...editModal, isOpen: false });
				fetchManagedJobs(); // Reload the list
			} else {
				setMessage({ text: `✕ ${data.error}`, type: "error" });
			}
		} catch (err) {
			setMessage({ text: "✕ Network error updating job.", type: "error" });
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteJob = async (jobRole: string, jobCompany: string) => {
		if (
			!confirm(
				`Are you sure you want to wipe ${jobRole} at ${jobCompany} from the entire network?`,
			)
		)
			return;

		try {
			const res = await fetch("/api/admin/jobs", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passcode, role: jobRole, company: jobCompany }),
			});
			const data = await res.json();

			if (data.success) {
				setMessage({
					text: `✓ Wiped ${data.count} job copies from the network.`,
					type: "success",
				});
				fetchManagedJobs(); // Reload the list
			} else {
				setMessage({ text: `✕ ${data.error}`, type: "error" });
			}
		} catch (err) {
			setMessage({ text: "✕ Network error.", type: "error" });
		}
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

	return (
		<section className="pane active" style={{ paddingBottom: "4rem" }}>
			{mounted &&
				editModal.isOpen &&
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
								maxWidth: "500px",
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
									Edit Global Placement
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
							<form onSubmit={handleEditSubmit}>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "0 1rem",
									}}
								>
									<div>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
											}}
										>
											JOB ROLE
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
									</div>
									<div>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
											}}
										>
											COMPANY
										</label>
										<input
											type="text"
											value={editModal.company}
											onChange={(e) =>
												setEditModal({ ...editModal, company: e.target.value })
											}
											style={inputStyle}
											required
										/>
									</div>
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "0 1rem",
									}}
								>
									<div>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
											}}
										>
											LOCATION
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
									</div>
									<div>
										<label
											style={{
												fontSize: "11px",
												fontWeight: 800,
												color: "#64748b",
												letterSpacing: "0.5px",
											}}
										>
											SALARY
										</label>
										<input
											type="text"
											value={editModal.salary}
											onChange={(e) =>
												setEditModal({ ...editModal, salary: e.target.value })
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
									}}
								>
									URL / EMAIL
								</label>
								<input
									type="text"
									value={editModal.url}
									onChange={(e) =>
										setEditModal({ ...editModal, url: e.target.value })
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
									}}
								>
									SKILLS
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
										background: "#1A8C7A",
										color: "white",
										padding: "14px",
										border: "none",
										borderRadius: "10px",
										fontSize: "14px",
										fontWeight: 800,
										cursor: "pointer",
										boxShadow: "0 4px 12px rgba(26,140,122,0.2)",
										marginTop: "10px",
										transition: "0.2s",
									}}
								>
									{loading ? "Updating..." : "Save Network Changes"}
								</button>
							</form>
						</div>
					</div>,
					document.body,
				)}

			<div style={{ maxWidth: "750px", margin: "0 auto" }}>
				<div
					style={{
						marginBottom: "2.5rem",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
					}}
				>
					<div>
						<div
							className="page-title"
							style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}
						>
							Admin Override
						</div>
						<div
							className="page-sub"
							style={{ color: "#64748b", marginTop: "4px" }}
						>
							Manually command the global network.
						</div>
					</div>
				</div>

				{/* GLASS TABS */}
				<div
					style={{
						display: "flex",
						background: "rgba(255, 255, 255, 0.4)",
						backdropFilter: "blur(12px)",
						padding: "6px",
						borderRadius: "14px",
						width: "100%",
						maxWidth: "400px",
						marginBottom: "2rem",
						border: "1px solid rgba(0,0,0,0.05)",
					}}
				>
					<button
						onClick={() => {
							setActiveTab("inject");
							setMessage({ text: "", type: "" });
						}}
						style={{
							flex: 1,
							padding: "10px",
							borderRadius: "10px",
							border: "none",
							fontSize: "13px",
							fontWeight: 800,
							cursor: "pointer",
							transition: "0.2s",
							background: activeTab === "inject" ? "white" : "transparent",
							color: activeTab === "inject" ? "#0B2444" : "#64748b",
							boxShadow:
								activeTab === "inject" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
						}}
					>
						Inject Job
					</button>
					<button
						onClick={() => {
							setActiveTab("manage");
							setMessage({ text: "", type: "" });
						}}
						style={{
							flex: 1,
							padding: "10px",
							borderRadius: "10px",
							border: "none",
							fontSize: "13px",
							fontWeight: 800,
							cursor: "pointer",
							transition: "0.2s",
							background: activeTab === "manage" ? "white" : "transparent",
							color: activeTab === "manage" ? "#0B2444" : "#64748b",
							boxShadow:
								activeTab === "manage" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
						}}
					>
						Manage Network
					</button>
				</div>

				<div
					style={{
						background: "rgba(255, 255, 255, 0.6)",
						backdropFilter: "blur(24px)",
						borderRadius: "24px",
						border: "1px solid rgba(255, 255, 255, 0.5)",
						boxShadow: "0 10px 40px -10px rgba(11, 36, 68, 0.05)",
						padding: "2.5rem",
						width: "100%",
					}}
				>
					{/* GLOBAL PASSCODE FOR EITHER ACTION */}
					<div
						style={{
							marginBottom: "2rem",
							paddingBottom: "1.5rem",
							borderBottom: "1px solid rgba(0,0,0,0.05)",
						}}
					>
						<label
							style={{
								fontSize: "11px",
								fontWeight: 800,
								color: "#1A8C7A",
								letterSpacing: "0.5px",
							}}
						>
							AUTHORIZATION PASSCODE
						</label>
						<div style={{ display: "flex", gap: "10px" }}>
							<input
								type="password"
								placeholder="Enter Admin Secret to unlock features..."
								value={passcode}
								onChange={(e) => setPasscode(e.target.value)}
								style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
							/>
							{activeTab === "manage" && (
								<button
									onClick={fetchManagedJobs}
									disabled={loadingJobs}
									style={{
										background: "#0B2444",
										color: "white",
										border: "none",
										padding: "0 20px",
										borderRadius: "10px",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									{loadingJobs ? "Scanning..." : "Load Data"}
								</button>
							)}
						</div>
					</div>

					{message.text && (
						<div
							style={{
								padding: "12px",
								borderRadius: "8px",
								marginBottom: "1.5rem",
								textAlign: "center",
								fontSize: "13px",
								fontWeight: 700,
								background: message.type === "success" ? "#dcfce7" : "#fef2f2",
								color: message.type === "success" ? "#166534" : "#991b1b",
								border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fca5a5"}`,
							}}
						>
							{message.text}
						</div>
					)}

					{activeTab === "inject" ? (
						<form onSubmit={handleInject}>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "0 1.5rem",
								}}
							>
								<div>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										JOB ROLE / TITLE
									</label>
									<input
										type="text"
										placeholder="e.g. Senior MLS"
										value={role}
										onChange={(e) => setRole(e.target.value)}
										style={inputStyle}
										required
									/>
								</div>
								<div>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										COMPANY / LAB NAME
									</label>
									<input
										type="text"
										placeholder="e.g. Evercare Hospital"
										value={company}
										onChange={(e) => setCompany(e.target.value)}
										style={inputStyle}
										required
									/>
								</div>
							</div>

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "0 1.5rem",
								}}
							>
								<div>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										LOCATION
									</label>
									<input
										type="text"
										placeholder="e.g. Lekki, Lagos"
										value={loc}
										onChange={(e) => setLoc(e.target.value)}
										style={inputStyle}
										required
									/>
								</div>
								<div>
									<label
										style={{
											fontSize: "11px",
											fontWeight: 800,
											color: "#64748b",
											letterSpacing: "0.5px",
										}}
									>
										SALARY (OPTIONAL)
									</label>
									<input
										type="text"
										placeholder="e.g. Competitive"
										value={salary}
										onChange={(e) => setSalary(e.target.value)}
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
								}}
							>
								APPLICATION LINK / EMAIL INSTRUCTIONS
							</label>
							<input
								type="text"
								placeholder="https://external-link.com  OR  mailto:hr@hospital.com"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
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
								SKILLS TAGS (COMMA SEPARATED)
							</label>
							<input
								type="text"
								placeholder="e.g. Hematology, QA, Chemistry"
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								style={inputStyle}
								required
							/>

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
									marginTop: "1rem",
									transition: "0.2s",
									boxShadow: "0 4px 12px rgba(26, 140, 122, 0.2)",
								}}
							>
								{loading ? "Broadcasting..." : "Inject Global Placement"}
							</button>
						</form>
					) : (
						<div>
							{managedJobs.length > 0 && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "1rem",
									}}
								>
									{managedJobs.map((job, idx) => (
										<div
											key={idx}
											style={{
												background: "white",
												border: "1px solid #e2e8f0",
												padding: "1.25rem",
												borderRadius: "16px",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<div>
												<div
													style={{
														fontWeight: 800,
														color: "#0f172a",
														fontSize: "15px",
													}}
												>
													{job.role}
												</div>
												<div
													style={{
														color: "#64748b",
														fontSize: "13px",
														marginTop: "4px",
													}}
												>
													{job.company} • {job.loc}
												</div>
											</div>
											<div style={{ display: "flex", gap: "8px" }}>
												<button
													onClick={() =>
														setEditModal({
															isOpen: true,
															oldRole: job.role,
															oldCompany: job.company,
															role: job.role,
															company: job.company,
															loc: job.loc,
															url: job.url,
															salary: job.salary || "",
															skills: job.skills || "",
														})
													}
													style={{
														background: "#f8fafc",
														color: "#475569",
														border: "1px solid #e2e8f0",
														padding: "8px 16px",
														borderRadius: "8px",
														fontWeight: 700,
														fontSize: "12px",
														cursor: "pointer",
														transition: "0.2s",
													}}
												>
													Edit
												</button>
												<button
													onClick={() => handleDeleteJob(job.role, job.company)}
													style={{
														background: "#fef2f2",
														color: "#ef4444",
														border: "1px solid #fecaca",
														padding: "8px 16px",
														borderRadius: "8px",
														fontWeight: 700,
														fontSize: "12px",
														cursor: "pointer",
													}}
												>
													Wipe Job
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
