"use client";
import Toast from "@/components/Toast";
import { startTransition } from "react";
import { useMounted } from "@/lib/use-mounted";
import { useState, useEffect } from "react";

interface SalaryData {
	average: number;
	count: number;
	recent: {
		id?: string;
		role: string;
		location: string;
		salary: number;
		experience: string;
	}[];
}

export default function SalaryIntelligencePage() {
	const mounted = useMounted();
	const [isLoggedIn, setIsLoggedIn] = useState(false);


	const [salaryData, setSalaryData] = useState<SalaryData>({
		average: 0,
		count: 0,
		recent: [],
	});

	const [formData, setFormData] = useState({
		role: "",
		location: "",
		salary: "",
		experience: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	const [mySubmissionId, setMySubmissionId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	const showToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	useEffect(() => {
		startTransition(() => { setIsLoggedIn(!!localStorage.getItem("labpro_active_user")); });

		const savedId = localStorage.getItem("labpro_my_salary_id");
		if (savedId) {
			startTransition(() => { setMySubmissionId(savedId); });
		}

		fetchSalaryData();

		window.addEventListener("userStateChanged", () => {
			setIsLoggedIn(!!localStorage.getItem("labpro_active_user"));
		});
	}, []);

	async function fetchSalaryData() {
		try {
			const res = await fetch("/api/salary");
			const data = await res.json();
			if (data && data.recent) {
				setSalaryData(data);
			}
		} catch (e) {
			console.error(e);
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const method = isEditing ? "PUT" : "POST";
			const payload = isEditing
				? { ...formData, id: mySubmissionId }
				: formData;

			const res = await fetch("/api/salary", {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (res.ok) {
				showToast(
					`Salary data ${isEditing ? "updated" : "submitted"} anonymously!`,
				);
				if (!isEditing && data.id) {
					localStorage.setItem("labpro_my_salary_id", data.id);
					setMySubmissionId(data.id);
				}
				setIsEditing(false);
				fetchSalaryData();
			} else {
				showToast("Failed to process data.", "error");
			}
		} catch {
			showToast("Network error.", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!mySubmissionId) return;
		setIsSubmitting(true);
		try {
			const res = await fetch("/api/salary", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: mySubmissionId }),
			});
			if (res.ok) {
				localStorage.removeItem("labpro_my_salary_id");
				setMySubmissionId(null);
				setFormData({ role: "", location: "", salary: "", experience: "" });
				setIsEditing(false);
				showToast("Submission deleted securely.");
				fetchSalaryData();
			}
		} catch {
			showToast("Failed to delete.", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	// 🚀 DYNAMIC CHART DATA GENERATOR
	const getChartData = () => {
		const locationStats = (salaryData.recent || []).reduce<Record<string, { name: string; total: number; count: number }>>((acc, curr) => {
			const loc = curr.location || "Unknown";
			if (!acc[loc]) acc[loc] = { name: loc, total: 0, count: 0 };
			acc[loc].total += curr.salary;
			acc[loc].count += 1;
			return acc;
		}, {});

		const chartData = Object.values(locationStats)
			.map((item) => ({
				name: item.name,
				salary: item.total / item.count,
			}))
			.sort((a, b) => b.salary - a.salary)
			.slice(0, 5); // Top 5 locations


		return chartData;
	};

	const chartData = getChartData();
	const maxChartSalary = Math.max(...chartData.map((d) => d.salary), 1);

	if (!mounted) return null;

	return (
		<section
			className="pane active salary-page"
			style={{ paddingBottom: "4rem", width: "100%" }}
		>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes growBar {
          from { width: 0; }
        }
        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 900px) {
          .responsive-grid { grid-template-columns: 1fr; }
        }
      `,
				}}
			/>

			{toast && <Toast message={toast.message} type={toast.type} />}

			<div style={{ marginBottom: "2.5rem" }}>
				<h1
					style={{
						fontSize: "28px",
						fontWeight: 900,
						color: "#0f172a",
						margin: 0,
					}}
				>
					Salary Intelligence
				</h1>
				<p style={{ color: "#64748b", marginTop: "4px" }}>
					Self-reported monthly salaries shared by the community.
				</p>
			</div>

			{!isLoggedIn ? (
				<div
					style={{
						padding: "4rem",
						textAlign: "center",
						background: "rgba(255,255,255,0.4)",
						backdropFilter: "blur(24px)",
						borderRadius: "20px",
						border: "1px solid rgba(255, 255, 255, 0.3)",
						boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
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
						Intelligence Locked
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
						Log in to contribute data and unlock real-time salary benchmarks for
						your region.
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
					<div
						className="mobile-stack salary-summary"
						style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}
					>
						<div
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.8)",
								backdropFilter: "blur(16px)",
								borderRadius: "20px",
								border: "1px solid rgba(255,255,255,0.9)",
								padding: "16px 20px",
								boxShadow: "0 10px 30px -10px rgba(11, 36, 68, 0.1)",
								display: "flex",
								flexDirection: "column",
								justifyContent: "flex-start",
								transition: "transform 0.3s ease",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.transform = "translateY(-4px)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.transform = "translateY(0)")
							}
						>
							<h3
								style={{
									fontSize: "12px",
									fontWeight: 800,
									color: "#94a3b8",
									textTransform: "uppercase",
									letterSpacing: "1px",
									margin: "0 0 16px 0",
								}}
							>
								Community sample size
							</h3>
							<div
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: "12px",
									marginBottom: "16px",
								}}
							>
								<span
									style={{
										fontSize: "32px",
										fontWeight: 900,
										color: "#0f172a",
										letterSpacing: "-1px",
									}}
								>
									{salaryData.count}
								</span>
								<span
									style={{
										fontSize: "13px",
										fontWeight: 800,
										color: "#1A8C7A",
										display: "flex",
										alignItems: "center",
										gap: "4px",
										background: "#e6fcf5",
										padding: "4px 10px",
										borderRadius: "20px",
									}}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="3"
									>
										<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
										<polyline points="17 6 23 6 23 12"></polyline>
									</svg>
									Reports
								</span>
							</div>
							<p
								style={{
									fontSize: "13px",
									color: "#64748b",
									margin: 0,
									lineHeight: "1.5",
									fontWeight: 500,
								}}
							>
								{salaryData.count < 5 ? "A small sample. These reports do not establish a market benchmark." : "Based on community contributions, not independently verified payslips."}
							</p>
						</div>

						<div
							style={{
								flex: 1,
								background: "rgba(255, 255, 255, 0.5)",
								backdropFilter: "blur(24px)",
								padding: "16px 20px",
								borderRadius: "20px",
								border: "1px solid rgba(255, 255, 255, 0.4)",
								boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
								display: "flex",
								flexDirection: "column",
								justifyContent: "flex-start",
							}}
						>
							<h3
								style={{
									fontSize: "11px",
									color: "#64748b",
									fontWeight: 800,
									textTransform: "uppercase",
									letterSpacing: "1px",
									margin: "0 0 8px 0",
								}}
							>
								Community Average (Monthly)
							</h3>
							<div
								style={{
									fontSize: "32px",
									fontWeight: 900,
									color: "#0f172a",
									letterSpacing: "-1px",
								}}
							>
								{salaryData.count >= 5 ? `₦${Math.round(salaryData.average / 1000)}k` : "—"}
							</div>
							<p
								style={{
									color: "#64748b",
									fontSize: "13px",
									margin: "8px 0 0 0",
									fontWeight: 500,
								}}
							>
								Aggregated from{" "}
								<strong style={{ color: "#1A8C7A" }}>
									{salaryData.count || 0}
								</strong>{" "}
								self-reported submissions. An average is shown once there are at least five reports.
							</p>
						</div>
					</div>

					<div className="responsive-grid salary-details">
						{/* LEFT COLUMN: THE FORM */}
						<div
							style={{
								background: "rgba(255, 255, 255, 0.6)",
								backdropFilter: "blur(24px)",
								padding: "20px",
								borderRadius: "20px",
								border: "1px solid rgba(255, 255, 255, 0.5)",
								boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
								display: "flex",
								flexDirection: "column",
								justifyContent: "flex-start",
							}}
						>
							{mySubmissionId && !isEditing ? (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										justifyContent: "flex-start",
										textAlign: "center",
										padding: "1rem 0",
									}}
								>
									<div
										style={{
											width: "48px",
											height: "48px",
											background: "#e6fcf5",
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											margin: "0 auto 16px auto",
											color: "#1A8C7A",
										}}
									>
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
									</div>
									<h3
										style={{
											fontSize: "18px",
											fontWeight: 800,
											marginBottom: "8px",
											color: "#0f172a",
										}}
									>
										Submission Active
									</h3>
									<p
										style={{
											color: "#64748b",
											fontSize: "13px",
											marginBottom: "24px",
										}}
									>
										Thank you for improving market transparency.
									</p>
									<div
										style={{
											display: "flex",
											gap: "12px",
											justifyContent: "center",
										}}
									>
										<button
											onClick={() => setIsEditing(true)}
											style={{
												padding: "10px 24px",
												background: "white",
												border: "1px solid #cbd5e1",
												borderRadius: "8px",
												color: "#0f172a",
												fontWeight: 700,
												cursor: "pointer",
												transition: "0.2s",
											}}
										>
											Edit Data
										</button>
										<button
											onClick={handleDelete}
											disabled={isSubmitting}
											style={{
												padding: "10px 24px",
												background: "#fef2f2",
												border: "1px solid #fecaca",
												borderRadius: "8px",
												color: "#ef4444",
												fontWeight: 700,
												cursor: isSubmitting ? "wait" : "pointer",
												transition: "0.2s",
											}}
										>
											Delete
										</button>
									</div>
								</div>
							) : (
								<form onSubmit={handleSubmit}>
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
													fontWeight: 800,
													margin: "0 0 4px 0",
													color: "#0f172a",
												}}
											>
												{isEditing ? "Update Your Data" : "Contribute Data"}
											</h3>
											<p
												style={{
													margin: 0,
													fontSize: "13px",
													color: "#64748b",
												}}
											>
												Strengthen the analytics securely.
											</p>
										</div>
										{isEditing && (
											<button
												type="button"
												onClick={() => setIsEditing(false)}
												style={{
													background: "none",
													border: "none",
													color: "#64748b",
													fontSize: "12px",
													fontWeight: 700,
													cursor: "pointer",
												}}
											>
												Cancel
											</button>
										)}
									</div>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
											gap: "12px",
										}}
									>
										<input
											required
											placeholder="Role (e.g. Hematologist)"
											value={formData.role}
											onChange={(e) =>
												setFormData({ ...formData, role: e.target.value })
											}
											style={{
												background: "rgba(255,255,255,0.9)",
												border: "1px solid rgba(0,0,0,0.05)",
												padding: "14px",
												borderRadius: "10px",
												color: "#0f172a",
												fontSize: "13px",
												outline: "none",
											}}
										/>
										<input
											required
											placeholder="Location (e.g. Lagos)"
											value={formData.location}
											onChange={(e) =>
												setFormData({ ...formData, location: e.target.value })
											}
											style={{
												background: "rgba(255,255,255,0.9)",
												border: "1px solid rgba(0,0,0,0.05)",
												padding: "14px",
												borderRadius: "10px",
												color: "#0f172a",
												fontSize: "13px",
												outline: "none",
											}}
										/>
										<input
											required
											type="number"
											placeholder="Monthly Salary (₦)"
											value={formData.salary}
											onChange={(e) =>
												setFormData({ ...formData, salary: e.target.value })
											}
											style={{
												background: "rgba(255,255,255,0.9)",
												border: "1px solid rgba(0,0,0,0.05)",
												padding: "14px",
												borderRadius: "10px",
												color: "#0f172a",
												fontSize: "13px",
												outline: "none",
											}}
										/>
										<input
											required
											placeholder="Experience (e.g. 3 yrs)"
											value={formData.experience}
											onChange={(e) =>
												setFormData({ ...formData, experience: e.target.value })
											}
											style={{
												background: "rgba(255,255,255,0.9)",
												border: "1px solid rgba(0,0,0,0.05)",
												padding: "14px",
												borderRadius: "10px",
												color: "#0f172a",
												fontSize: "13px",
												outline: "none",
											}}
										/>
									</div>
									<button
										disabled={isSubmitting}
										style={{
											marginTop: "1.5rem",
											width: "100%",
											padding: "14px",
											background: "#0B2444",
											border: "none",
											borderRadius: "10px",
											color: "white",
											fontWeight: 800,
											fontSize: "14px",
											cursor: isSubmitting ? "wait" : "pointer",
											boxShadow: "0 4px 12px rgba(11, 36, 68, 0.2)",
										}}
									>
										{isSubmitting
											? "Processing..."
											: isEditing
												? "Save Changes"
												: "Submit Anonymously"}
									</button>
								</form>
							)}
						</div>

						{/* RIGHT COLUMN: 🚀 NEW PURE CSS GLASS CHART */}
						<div
							style={{
								background: "rgba(255, 255, 255, 0.6)",
								backdropFilter: "blur(24px)",
								padding: "20px",
								borderRadius: "20px",
								border: "1px solid rgba(255, 255, 255, 0.5)",
								boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<h3
								style={{
									fontSize: "18px",
									fontWeight: 800,
									margin: "0 0 4px 0",
									color: "#0f172a",
								}}
							>
								Recent Reports by Location
							</h3>
							<p
								style={{
									margin: "0 0 1.5rem 0",
									fontSize: "13px",
									color: "#64748b",
								}}
							>
								Averages from the most recent reports, not market benchmarks.
							</p>

							<div
								style={{
									flex: 1,
									display: "flex",
									flexDirection: "column",
									justifyContent: "flex-start",
								}}
							>
								{chartData.map((data, idx) => (
									<div
										key={idx}
										style={{
											display: "flex",
											alignItems: "center",
											marginBottom: "16px",
										}}
									>
										<div
											style={{
												width: "110px",
												fontSize: "12px",
												fontWeight: 700,
												color: "#475569",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
												paddingRight: "10px",
											}}
										>
											{data.name}
										</div>
										<div
											style={{
												flex: 1,
												background: "rgba(0,0,0,0.04)",
												borderRadius: "8px",
												height: "20px",
												position: "relative",
											}}
										>
											<div
												style={{
													width: `${(data.salary / maxChartSalary) * 100}%`,
													background: idx === 0 ? "#0B2444" : "#1A8C7A",
													height: "100%",
													borderRadius: "8px",
													animation: `growBar 1s ease-out ${idx * 0.1}s forwards`,
													transformOrigin: "left",
												}}
											/>
										</div>
										<div
											style={{
												width: "80px",
												textAlign: "right",
												fontSize: "13px",
												fontWeight: 800,
												color: "#0f172a",
											}}
										>
											₦{(data.salary / 1000).toFixed(0)}k
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* RECENT SUBMISSIONS TABLE */}
					<div
						style={{
							background: "rgba(255, 255, 255, 0.4)",
							backdropFilter: "blur(24px)",
							padding: "20px",
							borderRadius: "20px",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
						}}
					>
						<h3
							style={{
								fontSize: "16px",
								fontWeight: 800,
								marginBottom: "1rem",
								color: "#0f172a",
							}}
						>
							Recent Community Submissions
						</h3>
						{salaryData.recent?.length === 0 ? (
							<div
								style={{
									padding: "20px",
									textAlign: "center",
									color: "#64748b",
									fontSize: "14px",
								}}
							>
								No recent submissions. Be the first to contribute!
							</div>
						) : (
							<div style={{ overflowX: "auto" }}>
								<table
									style={{
										width: "100%",
										textAlign: "left",
										borderCollapse: "collapse",
									}}
								>
									<thead>
										<tr
											style={{
												color: "#94a3b8",
												fontSize: "10px",
												textTransform: "uppercase",
												letterSpacing: "1px",
												borderBottom: "1px solid rgba(0,0,0,0.05)",
											}}
										>
											<th style={{ padding: "12px 10px", fontWeight: 800 }}>
												Role
											</th>
											<th style={{ padding: "12px 10px", fontWeight: 800 }}>
												Location
											</th>
											<th style={{ padding: "12px 10px", fontWeight: 800 }}>
												Experience
											</th>
											<th
												style={{
													padding: "12px 10px",
													fontWeight: 800,
													textAlign: "right",
												}}
											>
												Monthly Salary
											</th>
										</tr>
									</thead>
									<tbody>
										{salaryData.recent?.map((r, i) => (
											<tr
												key={i}
												style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}
											>
												<td
													style={{
														padding: "16px 10px",
														fontWeight: 800,
														color: "#0f172a",
														fontSize: "14px",
													}}
												>
													{r.role}
												</td>
												<td
													style={{
														padding: "16px 10px",
														color: "#64748b",
														fontSize: "13px",
													}}
												>
													{r.location}
												</td>
												<td
													style={{
														padding: "16px 10px",
														color: "#64748b",
														fontSize: "13px",
													}}
												>
													<span
														style={{
															background: "rgba(255,255,255,0.8)",
															padding: "4px 8px",
															borderRadius: "6px",
															border: "1px solid rgba(0,0,0,0.05)",
														}}
													>
														{r.experience || "N/A"}
													</span>
												</td>
												<td
													style={{
														padding: "16px 10px",
														fontWeight: 900,
														color: "#1A8C7A",
														fontSize: "15px",
														textAlign: "right",
													}}
												>
													₦{r.salary.toLocaleString()}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</>
			)}
		</section>
	);
}
