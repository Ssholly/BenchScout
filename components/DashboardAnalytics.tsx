"use client";
import { useEffect, useState } from "react";

export default function DashboardAnalytics() {
	const [chartData, setChartData] = useState<
		{ day: string; count: number; fullDate: string }[]
	>([
		{ day: "Mon", count: 0, fullDate: "" },
		{ day: "Tue", count: 0, fullDate: "" },
		{ day: "Wed", count: 0, fullDate: "" },
		{ day: "Thu", count: 0, fullDate: "" },
		{ day: "Fri", count: 0, fullDate: "" },
		{ day: "Sat", count: 0, fullDate: "" },
		{ day: "Sun", count: 0, fullDate: "" },
	]);
	const [maxCount, setMaxCount] = useState(10);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const loadGraphData = async () => {
		const activeEmail = localStorage.getItem("labpro_active_user");
		if (!activeEmail) return;

		try {
			const res = await fetch(`/api/jobs?email=${activeEmail}`);
			const jobs = await res.json();

			if (Array.isArray(jobs)) {
				// SMART DEDUPLICATION:
				// We only count active jobs based on their immutable creation date in the database.
				// Even if the user runs the scraper 50 times today, the exact same job won't be counted twice.
				const activeJobs = jobs.filter((j: any) => j.status !== "cleared");

				// 🚀 THE FIX: Explicitly tell TypeScript the structure of the objects in this array
				const days: { day: string; fullDate: string; count: number }[] = [];

				// Generate the last 7 days dynamically
				for (let i = 6; i >= 0; i--) {
					const d = new Date();
					d.setDate(d.getDate() - i);
					days.push({
						day: d.toLocaleDateString("en-US", { weekday: "short" }),
						fullDate: d.toLocaleDateString(),
						count: 0,
					});
				}

				activeJobs.forEach((job: any) => {
					if (job.createdAt) {
						const jobDate = new Date(job.createdAt).toLocaleDateString();
						const dayItem = days.find((d) => d.fullDate === jobDate);
						if (dayItem) {
							dayItem.count++;
						}
					} else {
						// Fallback to today if no date is provided by the DB
						days[6].count++;
					}
				});

				// Ensure the Y-axis scales cleanly to the nearest 10
				const max = Math.max(...days.map((d) => d.count), 10);
				const roundedMax = Math.ceil(max / 10) * 10;

				setMaxCount(roundedMax);
				setChartData(days);
			}
		} catch (e) {
			console.error("Failed to load graph data", e);
		}
	};

	useEffect(() => {
		loadGraphData();
		window.addEventListener("jobsUpdated", loadGraphData);
		window.addEventListener("userStateChanged", loadGraphData);

		return () => {
			window.removeEventListener("jobsUpdated", loadGraphData);
			window.removeEventListener("userStateChanged", loadGraphData);
		};
	}, []);

	const networks = [
		{ name: "Indeed", status: "ONLINE", color: "#22c55e" },
		{ name: "LinkedIn", status: "ONLINE", color: "#22c55e" },
		{ name: "MyJobMag", status: "SYNCING", color: "#0ea5e9" },
		{ name: "HotNigerianJobs", status: "ONLINE", color: "#22c55e" },
		{ name: "SmartRecruiters", status: "ONLINE", color: "#22c55e" },
	];

	return (
		<div
			className="mobile-stack"
			style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem" }}
		>
			{/* 🚀 THE SMART MATCH VOLUME GRAPH */}
			<div
				style={{
					flex: 2,
					background: "white",
					border: "1px solid #f1f5f9",
					borderRadius: "16px",
					padding: "1.75rem",
					boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "2rem",
					}}
				>
					<div>
						<h3
							style={{
								fontSize: "16px",
								fontWeight: 800,
								color: "#0f172a",
								margin: "0 0 4px 0",
							}}
						>
							Match Volume
						</h3>
						<p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
							Trailing 7-day activity
						</p>
					</div>
					<div style={{ fontSize: "16px", fontWeight: 800, color: "#0058bc" }}>
						Live
					</div>
				</div>

				<div
					style={{
						position: "relative",
						height: "200px",
						display: "flex",
						alignItems: "flex-end",
						gap: "1rem",
						paddingTop: "20px",
					}}
				>
					{/* Y-Axis Labels */}
					<div
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							paddingBottom: "30px",
							color: "#94a3b8",
							fontSize: "10px",
							fontWeight: 600,
						}}
					>
						<span>{maxCount}</span>
						<span>{Math.round(maxCount * 0.75)}</span>
						<span>{Math.round(maxCount * 0.5)}</span>
						<span>{Math.round(maxCount * 0.25)}</span>
						<span>0</span>
					</div>

					{/* Background Grid Lines */}
					<div
						style={{
							position: "absolute",
							left: "40px",
							right: 0,
							top: 0,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							paddingBottom: "30px",
							zIndex: 0,
						}}
					>
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								style={{
									width: "100%",
									height: "1px",
									borderTop: "1px dashed #e2e8f0",
								}}
							></div>
						))}
					</div>

					{/* Data Bars */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							flex: 1,
							height: "100%",
							marginLeft: "40px",
							zIndex: 1,
							paddingBottom: "30px",
							position: "relative",
						}}
					>
						{chartData.map((d, i) => {
							const heightPercent =
								maxCount > 0 ? (d.count / maxCount) * 100 : 0;
							return (
								<div
									key={i}
									style={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "flex-end",
										flex: 1,
										position: "relative",
									}}
								>
									{/* Hover Tooltip */}
									{hoveredIndex === i && d.count > 0 && (
										<div
											style={{
												position: "absolute",
												top: `calc(${100 - heightPercent}% - 35px)`,
												background: "#0f172a",
												color: "white",
												padding: "6px 10px",
												borderRadius: "6px",
												fontSize: "11px",
												fontWeight: 700,
												whiteSpace: "nowrap",
												zIndex: 10,
												boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
											}}
										>
											{d.count} {d.count === 1 ? "Match" : "Matches"}
										</div>
									)}

									<div
										onMouseEnter={() => setHoveredIndex(i)}
										onMouseLeave={() => setHoveredIndex(null)}
										style={{
											width: "24px",
											height: `${heightPercent}%`,
											background: d.count > 0 ? "#0058bc" : "transparent",
											borderRadius: "6px 6px 0 0",
											cursor: d.count > 0 ? "pointer" : "default",
											transition: "all 0.3s ease",
											minHeight: d.count > 0 ? "4px" : "0",
										}}
									></div>
									<div
										style={{
											position: "absolute",
											bottom: "-25px",
											fontSize: "11px",
											color: "#64748b",
											fontWeight: 600,
										}}
									>
										{d.day}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* 🚀 NETWORK TELEMETRY PANEL */}
			<div
				style={{
					flex: 1,
					background: "white",
					border: "1px solid #f1f5f9",
					borderRadius: "16px",
					padding: "1.75rem",
					boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
				}}
			>
				<h3
					style={{
						fontSize: "14px",
						fontWeight: 800,
						color: "#0f172a",
						margin: "0 0 1.5rem 0",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					Network Telemetry
					<span
						style={{
							background: "#fef2f2",
							color: "#ef4444",
							padding: "2px 6px",
							borderRadius: "4px",
							fontSize: "9px",
							letterSpacing: "1px",
							textTransform: "uppercase",
						}}
					>
						Live
					</span>
				</h3>

				<div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
					{networks.map((net) => (
						<div
							key={net.name}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								paddingBottom: "1rem",
								borderBottom: "1px solid #f1f5f9",
							}}
						>
							<span
								style={{ fontSize: "13px", fontWeight: 700, color: "#334155" }}
							>
								{net.name}
							</span>
							<div
								style={{ display: "flex", alignItems: "center", gap: "6px" }}
							>
								<span
									style={{
										fontSize: "10px",
										fontWeight: 800,
										color: net.color,
										letterSpacing: "0.5px",
									}}
								>
									{net.status}
								</span>
								<div
									style={{
										width: "8px",
										height: "8px",
										borderRadius: "50%",
										background: net.color,
										boxShadow: `0 0 8px ${net.color}80`,
									}}
								></div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
