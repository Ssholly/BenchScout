"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// --- UTILITIES ---
const formatTimeAMPM = (time24: string) => {
	if (!time24) return "12:00 PM";
	const [h, m] = time24.split(":");
	let hours = parseInt(h, 10);
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12 || 12;
	return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
};

const convertAMPMTo24H = (ampmTime: string): string => {
	if (!ampmTime) return "12:00";
	const [time, period] = ampmTime.split(" ");
	if (!time || !period) return "12:00";
	let [hours, minutes] = time.split(":").map(Number);
	if (period === "PM" && hours !== 12) hours += 12;
	if (period === "AM" && hours === 12) hours = 0;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// --- TYPES & CONSTANTS ---
const DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];
const TIMEZONES = [
	{ id: "GMT", label: "Greenwich Mean Time (GMT)" },
	{ id: "WAT", label: "West Africa Time (WAT)" },
	{ id: "CAT", label: "Central Africa Time (CAT)" },
	{ id: "SAST", label: "South Africa Time (SAST)" },
	{ id: "EAT", label: "East Africa Time (EAT)" },
];

// 🚀 EXPANDED: All 36 States + FCT + Options
const LOCATIONS = [
	"All Nigeria",
	"Abia",
	"Abuja, FCT",
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
	"Remote",
];

type EventType = "interview" | "deadline" | "followup" | "action";
type ScheduledEvent = {
	id: string;
	date: number;
	time: string;
	title: string;
	company: string;
	type: EventType;
	location: string;
};

// Default dynamic examples if local storage is empty
const DEFAULT_EVENTS: ScheduledEvent[] = [
	{
		id: "e1",
		date: new Date().getDate(),
		time: "09:00 AM",
		title: "Submit Additional Documents",
		company: "Synlab Nigeria",
		type: "deadline",
		location: "Portal",
	},
	{
		id: "e2",
		date: new Date().getDate() + 1,
		time: "11:30 AM",
		title: "Technical Interview (Stage 1)",
		company: "EHA Clinics",
		type: "interview",
		location: "Google Meet",
	},
	{
		id: "e3",
		date: new Date().getDate() + 3,
		time: "02:00 PM",
		title: "Check Application Status",
		company: "Integra Diagnostics",
		type: "followup",
		location: "Email",
	},
	{
		id: "e4",
		date: new Date().getDate() + 7,
		time: "10:00 AM",
		title: "Final Hiring Manager Chat",
		company: "AMCE / Deloitte HC",
		type: "interview",
		location: "Abuja Office",
	},
];

export default function SchedulerPage() {
	const [mounted, setMounted] = useState(false);

	// --- 1. DYNAMIC CALENDAR STATE ---
	const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
	const [selectedDay, setSelectedDay] = useState(new Date().getDate());
	const [newEventTitle, setNewEventTitle] = useState("");
	const [events, setEvents] = useState<ScheduledEvent[]>([]);

	// Event Modal State
	const [isEventModalOpen, setIsEventModalOpen] = useState(false);
	const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);

	const eventConfig = {
		interview: { color: "#eab308", bg: "#fef9c3", icon: "video" },
		deadline: { color: "#ef4444", bg: "#fee2e2", icon: "alert" },
		followup: { color: "#7e22ce", bg: "#f3e8ff", icon: "mail" },
		action: { color: "#0ea5e9", bg: "#e0f2fe", icon: "map-pin" },
	};

	const selectedDayEvents = events
		.filter((e) => e.date === selectedDay)
		.sort((a, b) => {
			const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
			const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
			return timeA - timeB;
		});

	// --- 2. AUTOMATION CONFIG STATE ---
	const [isActive, setIsActive] = useState(false);
	const [time, setTime] = useState("09:00");
	const [timezone, setTimezone] = useState("WAT");
	const [targetLocation, setTargetLocation] = useState("All Nigeria");
	const [selectedDays, setSelectedDays] = useState<string[]>([
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
	]);
	const [countdown, setCountdown] = useState("--:--:--");
	const [nextDate, setNextDate] = useState("—");
	const [nextTimeStr, setNextTimeStr] = useState("—");
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

	const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
	const [isAlertsActive, setIsAlertsActive] = useState(false);
	const [alertTier, setAlertTier] = useState("Tier 1 Only");
	const [alertKeywords, setAlertKeywords] = useState(
		"Blood Bank, AMCE, Manager",
	);

	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);

	// --- 3. EFFECTS & LIFECYCLE ---

	const loadScheduleData = () => {
		const activeEmail = localStorage.getItem("labpro_active_user");

		// DATA ISOLATION: Wipe everything for guests
		if (!activeEmail) {
			setIsUserLoggedIn(false);
			setIsActive(false);
			setTime("09:00");
			setTargetLocation("All Nigeria");
			setCountdown("--:--:--");
			setNextDate("—");
			setNextTimeStr("—");
			setEvents(DEFAULT_EVENTS);
			return;
		}

		setIsUserLoggedIn(true);

		const savedEvents = localStorage.getItem("labpro_events");
		if (savedEvents) {
			setEvents(JSON.parse(savedEvents));
		} else {
			setEvents(DEFAULT_EVENTS);
		}

		const savedActive = localStorage.getItem("labpro_scheduler_active");
		if (savedActive) setIsActive(savedActive === "true");

		const savedTime = localStorage.getItem("labpro_scheduler_time");
		if (savedTime) setTime(savedTime);

		const savedTz = localStorage.getItem("labpro_scheduler_tz");
		if (savedTz) setTimezone(savedTz);

		const savedLoc = localStorage.getItem("labpro_scheduler_location");
		if (savedLoc) setTargetLocation(savedLoc);

		const savedDays = localStorage.getItem("labpro_scheduler_days");
		if (savedDays) setSelectedDays(JSON.parse(savedDays));

		const savedAlertsActive = localStorage.getItem("labpro_alerts_active");
		if (savedAlertsActive) setIsAlertsActive(savedAlertsActive === "true");

		const savedAlertTier = localStorage.getItem("labpro_alerts_tier");
		if (savedAlertTier) setAlertTier(savedAlertTier);

		const savedAlertKeywords = localStorage.getItem("labpro_alerts_keywords");
		if (savedAlertKeywords) setAlertKeywords(savedAlertKeywords);
	};

	useEffect(() => {
		setMounted(true);
		loadScheduleData();
		window.addEventListener("userStateChanged", loadScheduleData);
		return () =>
			window.removeEventListener("userStateChanged", loadScheduleData);
	}, []);

	useEffect(() => {
		if (mounted && isUserLoggedIn) {
			localStorage.setItem("labpro_events", JSON.stringify(events));
		}
	}, [events, mounted, isUserLoggedIn]);

	const getNextRun = (t: string, d: string[]) => {
		if (!d || d.length === 0) return null;

		const dayIndices = d.map((dayName) => {
			const idx = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			].indexOf(dayName);
			return idx !== -1 ? idx : 1;
		});

		const [h, m] = t.split(":").map(Number);
		let date = new Date();
		date.setHours(h, m, 0, 0);

		for (let i = 0; i < 8; i++) {
			if (date > new Date() && dayIndices.includes(date.getDay())) return date;
			date = new Date(date.getTime() + 86400000);
			date.setHours(h, m, 0, 0);
		}
		return null;
	};

	// AUTOMATION EXECUTION LOGIC
	// Prevent duplicate runs within the same minute
	let lastRunTime = "";

	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (isActive && isUserLoggedIn) {
			timer = setInterval(() => {
				const next = getNextRun(time, selectedDays);
				if (!next) {
					setCountdown("--:--:--");
					setNextDate("—");
					setNextTimeStr("—");
					return;
				}

				const now = new Date();
				const diff = Math.max(0, next.getTime() - now.getTime());

				// THE TRIGGER: If diff is 0 or less, update the UI (Backend handles the actual scraping)
				if (diff <= 1000) {
					const currentMinuteString = `${now.getHours()}:${now.getMinutes()}`;
					if (lastRunTime !== currentMinuteString) {
						lastRunTime = currentMinuteString; // Lock it

						triggerToast(
							"Cloud Scanner is running in the background...",
							"success",
						);

						const timeNow = new Date().toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						});
						localStorage.setItem("labpro_last_run", timeNow);
						window.dispatchEvent(new Event("jobsUpdated")); // Update UI everywhere
					}
				}

				const hh = Math.floor(diff / 3600000);
				const mm = Math.floor((diff % 3600000) / 60000);
				const ss = Math.floor((diff % 60000) / 1000);
				setCountdown(
					`${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`,
				);
				setNextDate(
					next.toLocaleDateString("en-GB", {
						weekday: "long",
						day: "numeric",
						month: "short",
					}),
				);
				setNextTimeStr(formatTimeAMPM(time) + " WAT");
			}, 1000);
		} else {
			setCountdown("--:--:--");
			setNextDate("—");
			setNextTimeStr("—");
		}
		return () => clearInterval(timer);
	}, [isActive, time, selectedDays, isUserLoggedIn]);

	// --- 4. HANDLERS ---
	const triggerToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	const handleMonthChange = (direction: number) => {
		setCurrentMonthDate(
			new Date(
				currentMonthDate.getFullYear(),
				currentMonthDate.getMonth() + direction,
				1,
			),
		);
	};

	const toggleDay = (day: string) => {
		if (!isUserLoggedIn) return;
		setSelectedDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isUserLoggedIn) {
			triggerToast("Please log in to activate the scheduler.", "error");
			return;
		}
		const checked = e.target.checked;
		setIsActive(checked);
		localStorage.setItem("labpro_scheduler_active", String(checked));
		window.dispatchEvent(new Event("schedulerUpdated"));
		if (checked) triggerToast("Automated Scraper Activated!");
	};

	const handleSaveScheduler = async () => {
		if (!isUserLoggedIn) {
			triggerToast("Please log in to save a schedule.", "error");
			return;
		}

		// Keep local storage so the UI updates instantly
		localStorage.setItem("labpro_scheduler_time", time);
		localStorage.setItem("labpro_scheduler_tz", timezone);
		localStorage.setItem("labpro_scheduler_location", targetLocation);
		localStorage.setItem("labpro_scheduler_days", JSON.stringify(selectedDays));
		localStorage.setItem("labpro_scheduler_active", String(isActive));

		// Send the master switch AND Location to your Prisma Database
		try {
			const activeEmail = localStorage.getItem("labpro_active_user");
			await fetch("/api/user/preferences", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: activeEmail,
					jobAlertsEnabled: isActive,
					targetLocation: targetLocation,
				}),
			});
			triggerToast("Cloud Automation Schedule Saved!");
		} catch (error) {
			triggerToast("Failed to sync with cloud.", "error");
		}
	};

	const handleSaveAlerts = async () => {
		if (!isUserLoggedIn) return;

		localStorage.setItem("labpro_alerts_active", String(isAlertsActive));
		localStorage.setItem("labpro_alerts_tier", alertTier);
		localStorage.setItem("labpro_alerts_keywords", alertKeywords);

		try {
			const activeEmail = localStorage.getItem("labpro_active_user");
			await fetch("/api/user/preferences", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: activeEmail,
					alertKeywords: alertKeywords,
					alertTier: alertTier,
				}),
			});
			setIsAlertModalOpen(false);
			triggerToast("Priority Alerts Updated in Cloud!");
		} catch (error) {
			triggerToast("Failed to save alerts to cloud.", "error");
		}
	};

	// --- 5. EVENT CRUD LOGIC ---
	const openNewEventModal = () => {
		if (!isUserLoggedIn)
			return triggerToast("Please log in to add events.", "error");
		setEditingEvent({
			id: Math.random().toString(),
			date: selectedDay,
			time: "12:00 PM",
			title: "",
			company: "",
			type: "interview",
			location: "",
		});
		setIsEventModalOpen(true);
	};

	const openEditEventModal = (event: ScheduledEvent) => {
		if (!isUserLoggedIn) return;
		setEditingEvent({ ...event });
		setIsEventModalOpen(true);
	};

	const handleSaveEvent = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingEvent?.title.trim()) return;

		setEvents((prev) => {
			const exists = prev.find((ev) => ev.id === editingEvent.id);
			if (exists) {
				return prev.map((ev) =>
					ev.id === editingEvent.id ? editingEvent : ev,
				);
			}
			return [...prev, editingEvent];
		});

		setIsEventModalOpen(false);
		triggerToast("Agenda updated successfully!");
	};

	const handleDeleteEvent = () => {
		if (!editingEvent) return;
		setEvents((prev) => prev.filter((ev) => ev.id !== editingEvent.id));
		setIsEventModalOpen(false);
		triggerToast("Event deleted.");
	};

	// --- 6. RENDER HELPERS ---
	const renderCalendarGrid = () => {
		const year = currentMonthDate.getFullYear();
		const month = currentMonthDate.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const startOffset = new Date(year, month, 1).getDay();

		const today = new Date();
		const isCurrentMonth =
			today.getMonth() === month && today.getFullYear() === year;

		const days = [];
		for (let i = 0; i < startOffset; i++) {
			days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const isToday = isCurrentMonth && day === today.getDate();
			const isSelected = day === selectedDay;
			const dayEvents = events.filter((e) => e.date === day);

			days.push(
				<div
					key={day}
					onClick={() => setSelectedDay(day)}
					style={{
						height: "36px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "flex-start",
						paddingTop: "6px",
						borderRadius: "10px",
						cursor: "pointer",
						transition: "all 0.2s ease",
						background: isSelected ? "#0058bc" : "transparent",
						color: isSelected ? "white" : isToday ? "#0058bc" : "#475569",
						fontWeight: isSelected || isToday ? 800 : 600,
						border:
							isToday && !isSelected
								? "1px solid rgba(186, 230, 253, 0.5)"
								: "1px solid transparent",
					}}
					onMouseEnter={(e) => {
						if (!isSelected)
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
					}}
					onMouseLeave={(e) => {
						if (!isSelected) e.currentTarget.style.background = "transparent";
					}}
				>
					{day}
					{dayEvents.length > 0 && (
						<div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
							{dayEvents.slice(0, 3).map((ev, i) => (
								<div
									key={i}
									style={{
										width: "4px",
										height: "4px",
										borderRadius: "50%",
										background: isSelected
											? "white"
											: eventConfig[ev.type].color,
									}}
								></div>
							))}
						</div>
					)}
				</div>,
			);
		}
		return days;
	};

	const currentHour = parseInt(time.split(":")[0], 10);
	const insightsData = [
		{
			label: "Early AM (12a-7a)",
			range: [0, 7],
			height: "30%",
			text: "Early runs usually catch leftover postings from the previous night.",
		},
		{
			label: "Morning (8a-11a)",
			range: [8, 11],
			height: "90%",
			text: '"Morning runs (08:00-11:00) generally find 15% more new listings."',
		},
		{
			label: "Mid-Day (12p-2p)",
			range: [12, 14],
			height: "40%",
			text: "Mid-day runs are perfect for catching the first wave of HR updates.",
		},
		{
			label: "Afternoon (3p-5p)",
			range: [15, 17],
			height: "65%",
			text: "Late afternoon runs catch end-of-day recruiter postings.",
		},
		{
			label: "Evening (6p-11p)",
			range: [18, 23],
			height: "20%",
			text: "Evening runs have lower volume, but you face less applicant competition.",
		},
	];
	let activeIndex = 1;
	insightsData.forEach((data, index) => {
		if (currentHour >= data.range[0] && currentHour <= data.range[1]) {
			activeIndex = index;
		}
	});

	if (!mounted) return null;

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes slideDownToast {
          0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
        .pane.active {
          border-radius: 24px !important;
          border: none !important;
          box-shadow: none !important;
        }
        .sw input:checked + .sw-track { background: #0058bc !important; }
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

			<section className="pane active" style={{ position: "relative" }}>
				<div style={{ marginBottom: "2.5rem" }}>
					<div style={{ marginBottom: "1.25rem" }}>
						<h1
							className="page-title"
							style={{
								margin: 0,
								fontSize: "24px",
								fontWeight: 900,
								color: "#0f172a",
								letterSpacing: "-0.5px",
							}}
						>
							Master Scheduler
						</h1>
						<p
							className="page-sub"
							style={{
								margin: "4px 0 0 0",
								fontSize: "13px",
								color: "#64748b",
							}}
						>
							Track application deadlines, upcoming interviews, and personal
							follow-ups.
						</p>
					</div>
				</div>

				{/* 🚀 THE LOCKED OUT OVERLAY 🚀 */}
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
							Scheduler Locked
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
							Log in or create an account to configure automated background job
							scraping and manage your agenda.
						</p>
						<button
							onClick={() =>
								window.dispatchEvent(new Event("openProfileModal"))
							}
							style={{
								background: "#0058bc",
								color: "white",
								border: "none",
								padding: "12px 24px",
								borderRadius: "8px",
								fontWeight: 700,
								cursor: "pointer",
								boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
							}}
						>
							Log In to Access
						</button>
					</div>
				) : (
					<>
						{/* ========================================================= */}
						{/* LOGGED IN VIEW: CALENDAR & AGENDA                           */}
						{/* ========================================================= */}
						<div
							className="mobile-stack"
							style={{
								display: "flex",
								gap: "1.25rem",
								alignItems: "flex-start",
							}}
						>
							<div
								style={{
									flex: 1,
									maxWidth: "300px",
									background: "rgba(255, 255, 255, 0.4)",
									backdropFilter: "blur(24px)",
									WebkitBackdropFilter: "blur(24px)",
									borderRadius: "20px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									padding: "1.25rem",
									boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "1rem",
									}}
								>
									<h2
										style={{
											margin: 0,
											fontSize: "15px",
											fontWeight: 800,
											color: "#0f172a",
										}}
									>
										{currentMonthDate.toLocaleDateString("en-US", {
											month: "long",
											year: "numeric",
										})}
									</h2>
									<div style={{ display: "flex", gap: "6px" }}>
										<button
											onClick={() => handleMonthChange(-1)}
											style={{
												background: "rgba(255,255,255,0.6)",
												border: "1px solid rgba(255,255,255,0.4)",
												width: "26px",
												height: "26px",
												borderRadius: "6px",
												cursor: "pointer",
												color: "#64748b",
												transition: "all 0.2s",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											&larr;
										</button>
										<button
											onClick={() => handleMonthChange(1)}
											style={{
												background: "rgba(255,255,255,0.6)",
												border: "1px solid rgba(255,255,255,0.4)",
												width: "26px",
												height: "26px",
												borderRadius: "6px",
												cursor: "pointer",
												color: "#64748b",
												transition: "all 0.2s",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											&rarr;
										</button>
									</div>
								</div>

								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(7, 1fr)",
										gap: "4px",
										marginBottom: "6px",
										textAlign: "center",
										fontSize: "9px",
										fontWeight: 800,
										color: "#94a3b8",
									}}
								>
									<div>SU</div>
									<div>MO</div>
									<div>TU</div>
									<div>WE</div>
									<div>TH</div>
									<div>FR</div>
									<div>SA</div>
								</div>

								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(7, 1fr)",
										gap: "4px",
									}}
								>
									{renderCalendarGrid()}
								</div>

								{/* Legend */}
								<div
									style={{
										marginTop: "1rem",
										paddingTop: "1rem",
										borderTop: "1px solid rgba(0,0,0,0.05)",
										display: "flex",
										flexDirection: "column",
										gap: "8px",
									}}
								>
									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: "12px",
											fontSize: "10px",
											fontWeight: 600,
											color: "#475569",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<div
												style={{
													width: "5px",
													height: "5px",
													borderRadius: "50%",
													background: eventConfig.interview.color,
												}}
											></div>{" "}
											Interview
										</div>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<div
												style={{
													width: "5px",
													height: "5px",
													borderRadius: "50%",
													background: eventConfig.deadline.color,
												}}
											></div>{" "}
											Deadline
										</div>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<div
												style={{
													width: "5px",
													height: "5px",
													borderRadius: "50%",
													background: eventConfig.followup.color,
												}}
											></div>{" "}
											Follow-up
										</div>
									</div>
								</div>
							</div>

							<div
								style={{
									flex: 1.2,
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									WebkitBackdropFilter: "blur(24px)",
									borderRadius: "20px",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									padding: "1.25rem",
									boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
									display: "flex",
									flexDirection: "column",
									minHeight: "320px",
									width: "100%",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										marginBottom: "1rem",
										borderBottom: "1px solid rgba(0,0,0,0.05)",
										paddingBottom: "1rem",
										flexWrap: "wrap",
										gap: "1rem",
									}}
								>
									<div>
										<h2
											style={{
												margin: 0,
												fontSize: "18px",
												fontWeight: 800,
												color: "#0f172a",
											}}
										>
											{selectedDay === new Date().getDate() &&
											currentMonthDate.getMonth() === new Date().getMonth()
												? "Today's Agenda"
												: `${currentMonthDate.toLocaleDateString("en-US", { month: "short" })} ${selectedDay}`}
										</h2>
										<p
											style={{
												margin: "2px 0 0 0",
												fontSize: "12px",
												color: "#64748b",
												fontWeight: 500,
											}}
										>
											{selectedDayEvents.length}{" "}
											{selectedDayEvents.length === 1 ? "event" : "events"}{" "}
											scheduled
										</p>
									</div>

									<button
										onClick={openNewEventModal}
										style={{
											background: "#0f172a",
											color: "white",
											border: "none",
											padding: "8px 16px",
											borderRadius: "10px",
											fontSize: "11px",
											fontWeight: 700,
											cursor: "pointer",
											transition: "transform 0.1s",
										}}
										onMouseDown={(e) =>
											(e.currentTarget.style.transform = "scale(0.95)")
										}
										onMouseUp={(e) =>
											(e.currentTarget.style.transform = "scale(1)")
										}
									>
										+ Add Event
									</button>
								</div>

								<div
									style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}
								>
									{selectedDayEvents.length === 0 ? (
										<div
											style={{
												height: "100%",
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												justifyContent: "center",
												color: "#94a3b8",
												padding: "2rem 0",
											}}
										>
											<svg
												width="36"
												height="36"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												style={{ marginBottom: "8px", opacity: 0.5 }}
											>
												<rect
													x="3"
													y="4"
													width="18"
													height="18"
													rx="2"
													ry="2"
												></rect>
												<line x1="16" y1="2" x2="16" y2="6"></line>
												<line x1="8" y1="2" x2="8" y2="6"></line>
												<line x1="3" y1="10" x2="21" y2="10"></line>
											</svg>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Your schedule is clear.
											</div>
										</div>
									) : (
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "12px",
											}}
										>
											{selectedDayEvents.map((event) => (
												<div
													key={event.id}
													style={{ display: "flex", gap: "12px" }}
												>
													<div
														style={{
															width: "60px",
															textAlign: "right",
															paddingTop: "12px",
														}}
													>
														<span
															style={{
																fontSize: "11px",
																fontWeight: 800,
																color: "#64748b",
															}}
														>
															{event.time.split(" ")[0]}
														</span>
														<span
															style={{
																fontSize: "9px",
																fontWeight: 700,
																color: "#94a3b8",
																marginLeft: "2px",
															}}
														>
															{event.time.split(" ")[1]}
														</span>
													</div>
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															alignItems: "center",
															paddingTop: "14px",
														}}
													>
														<div
															style={{
																width: "10px",
																height: "10px",
																borderRadius: "50%",
																background: "white",
																border: `2px solid ${eventConfig[event.type].color}`,
																zIndex: 2,
															}}
														></div>
														<div
															style={{
																width: "2px",
																flex: 1,
																background: "rgba(0,0,0,0.05)",
																marginTop: "4px",
																minHeight: "30px",
															}}
														></div>
													</div>

													<div
														onClick={() => openEditEventModal(event)}
														style={{
															flex: 1,
															background: "rgba(255,255,255,0.7)",
															border: "1px solid rgba(255,255,255,0.5)",
															borderRadius: "16px",
															padding: "1rem",
															boxShadow: "0 2px 8px -2px rgba(0,0,0,0.02)",
															transition: "transform 0.2s, box-shadow 0.2s",
															cursor: "pointer",
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.transform =
																"translateX(4px)";
															e.currentTarget.style.boxShadow =
																"0 8px 16px -4px rgba(0,0,0,0.04)";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.transform = "translateX(0)";
															e.currentTarget.style.boxShadow =
																"0 2px 8px -2px rgba(0,0,0,0.02)";
														}}
													>
														<div
															style={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "flex-start",
																marginBottom: "6px",
															}}
														>
															<span
																style={{
																	fontSize: "9px",
																	fontWeight: 800,
																	textTransform: "uppercase",
																	letterSpacing: "0.5px",
																	color: eventConfig[event.type].color,
																	background: eventConfig[event.type].bg,
																	padding: "3px 6px",
																	borderRadius: "4px",
																}}
															>
																{event.type}
															</span>
															<span
																style={{
																	fontSize: "10px",
																	fontWeight: 700,
																	color: "#94a3b8",
																}}
															>
																Edit
															</span>
														</div>
														<h3
															style={{
																margin: "0 0 2px 0",
																fontSize: "13px",
																fontWeight: 800,
																color: "#0f172a",
															}}
														>
															{event.title}
														</h3>
														<p
															style={{
																margin: "0 0 10px 0",
																fontSize: "11px",
																color: "#64748b",
																fontWeight: 600,
															}}
														>
															{event.company}
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						<div
							style={{
								width: "100%",
								height: "1px",
								background: "rgba(0,0,0,0.05)",
								marginBottom: "2.5rem",
								marginTop: "1.25rem",
							}}
						></div>

						{/* ========================================================= */}
						{/* LOGGED IN VIEW: AUTOMATION CONFIGURATION                    */}
						{/* ========================================================= */}
						<div style={{ marginBottom: "1.25rem" }}>
							<h2
								style={{
									fontSize: "20px",
									fontWeight: 800,
									color: "#0f172a",
									margin: "0 0 4px 0",
								}}
							>
								Automation Configuration
							</h2>
							<p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
								Configure when BenchScout should scan listings and notify you.
							</p>
						</div>

						<div
							className="mobile-stack"
							style={{
								display: "flex",
								gap: "1.5rem",
								alignItems: "flex-start",
							}}
						>
							{/* LEFT COLUMN: Controls */}
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
										background: "rgba(255, 255, 255, 0.4)",
										backdropFilter: "blur(24px)",
										borderRadius: "20px",
										border: "1px solid rgba(255, 255, 255, 0.3)",
										padding: "1.25rem",
										boxShadow: "0 4px 20px -2px rgba(0,0,0,0.02)",
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											marginBottom: "1.5rem",
											flexWrap: "wrap",
											gap: "1rem",
										}}
									>
										<div>
											<h3
												style={{
													fontSize: "15px",
													fontWeight: 800,
													color: "#0f172a",
													margin: "0 0 2px 0",
												}}
											>
												Daily Scraper Schedule
											</h3>
											<p
												style={{
													fontSize: "12px",
													color: "#64748b",
													margin: 0,
												}}
											>
												Define your automated scanning window.
											</p>
										</div>
										<div
											style={{
												background: "rgba(255,255,255,0.6)",
												border: "1px solid rgba(226, 232, 240, 0.5)",
												borderRadius: "30px",
												padding: "4px 8px 4px 12px",
												display: "flex",
												alignItems: "center",
												gap: "10px",
											}}
										>
											<span
												style={{
													fontSize: "10px",
													fontWeight: 800,
													color: "#64748b",
													letterSpacing: "0.5px",
												}}
											>
												SCHEDULER ACTIVE
											</span>
											<label className="sw" style={{ margin: 0 }}>
												<input
													type="checkbox"
													checked={isActive}
													onChange={handleToggle}
												/>
												<span
													className="sw-track"
													style={{ transform: "scale(0.8)" }}
												></span>
											</label>
										</div>
									</div>

									<div style={{ marginBottom: "1.5rem" }}>
										<div
											style={{
												fontSize: "10px",
												fontWeight: 800,
												color: "#94a3b8",
												letterSpacing: "1px",
												marginBottom: "8px",
											}}
										>
											SCHEDULE & LOCATION
										</div>
										{/* 🚀 NEW: Consolidated Flex Row for Time, Timezone, and Location */}
										<div
											className="mobile-stack"
											style={{
												display: "flex",
												gap: "1rem",
												alignItems: "center",
												flexWrap: "wrap",
											}}
										>
											<input
												type="time"
												value={time}
												onChange={(e) => setTime(e.target.value)}
												style={{
													background: "rgba(255,255,255,0.7)",
													border: "2px solid rgba(224, 242, 254, 0.8)",
													borderRadius: "12px",
													padding: "10px 14px",
													fontSize: "16px",
													fontWeight: 800,
													color: "#0284c7",
													outline: "none",
													cursor: "pointer",
													fontFamily: "inherit",
													width: "100%",
													maxWidth: "160px",
												}}
											/>
											<svg
												className="hide-mobile"
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="#cbd5e1"
												strokeWidth="2"
											>
												<circle cx="12" cy="12" r="10" />
												<polyline points="12 6 12 12 16 14" />
											</svg>

											{/* Timezone Selector */}
											<div
												style={{
													background: "rgba(255,255,255,0.7)",
													border: "1px solid rgba(226, 232, 240, 0.5)",
													borderRadius: "12px",
													padding: "8px 12px",
													display: "flex",
													flexDirection: "column",
													justifyContent: "center",
													position: "relative",
													flex: 1,
													minWidth: "180px",
													maxWidth: "240px",
												}}
											>
												<label
													style={{
														fontSize: "9px",
														fontWeight: 800,
														color: "#0284c7",
														textTransform: "uppercase",
														letterSpacing: "1px",
														marginBottom: "2px",
													}}
												>
													Timezone
												</label>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
													}}
												>
													<select
														value={timezone}
														onChange={(e) => setTimezone(e.target.value)}
														style={{
															background: "transparent",
															border: "none",
															fontSize: "13px",
															fontWeight: 700,
															color: "#0f172a",
															outline: "none",
															cursor: "pointer",
															padding: 0,
															appearance: "none",
															WebkitAppearance: "none",
															width: "100%",
														}}
													>
														{TIMEZONES.map((tz) => (
															<option key={tz.id} value={tz.id}>
																{tz.label}
															</option>
														))}
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
															bottom: "12px",
															pointerEvents: "none",
														}}
													>
														<polyline points="6 9 12 15 18 9" />
													</svg>
												</div>
											</div>

											{/* 🚀 Location Selector (Moved beside Timezone) */}
											<div
												style={{
													background: "rgba(255,255,255,0.7)",
													border: "1px solid rgba(226, 232, 240, 0.5)",
													borderRadius: "12px",
													padding: "8px 12px",
													display: "flex",
													flexDirection: "column",
													justifyContent: "center",
													position: "relative",
													flex: 1,
													minWidth: "180px",
													maxWidth: "240px",
												}}
											>
												<label
													style={{
														fontSize: "9px",
														fontWeight: 800,
														color: "#0284c7",
														textTransform: "uppercase",
														letterSpacing: "1px",
														marginBottom: "2px",
													}}
												>
													Target Location
												</label>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
													}}
												>
													<select
														value={targetLocation}
														onChange={(e) => setTargetLocation(e.target.value)}
														style={{
															background: "transparent",
															border: "none",
															fontSize: "13px",
															fontWeight: 700,
															color: "#0f172a",
															outline: "none",
															cursor: "pointer",
															padding: 0,
															appearance: "none",
															WebkitAppearance: "none",
															width: "100%",
														}}
													>
														{LOCATIONS.map((loc) => (
															<option key={loc} value={loc}>
																{loc}
															</option>
														))}
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
															bottom: "12px",
															pointerEvents: "none",
														}}
													>
														<polyline points="6 9 12 15 18 9" />
													</svg>
												</div>
											</div>
										</div>
									</div>

									<div>
										<div
											style={{
												fontSize: "10px",
												fontWeight: 800,
												color: "#94a3b8",
												letterSpacing: "1px",
												marginBottom: "8px",
											}}
										>
											DAY SELECTION
										</div>
										<div
											style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
										>
											{DAYS.map((day) => {
												const isSel = selectedDays.includes(day);
												return (
													<button
														key={day}
														onClick={() => toggleDay(day)}
														style={{
															background: isSel
																? "#0058bc"
																: "rgba(255,255,255,0.7)",
															color: isSel ? "white" : "#64748b",
															border: isSel
																? "1px solid #0058bc"
																: "1px solid rgba(226, 232, 240, 0.8)",
															padding: "6px 12px",
															borderRadius: "16px",
															fontSize: "11px",
															fontWeight: 700,
															cursor: "pointer",
															transition: "all 0.2s",
														}}
													>
														{day.substring(0, 3)}
													</button>
												);
											})}
										</div>
									</div>
								</div>

								<div
									style={{
										background: "rgba(240, 249, 255, 0.5)",
										backdropFilter: "blur(16px)",
										border: "1px solid rgba(186, 230, 253, 0.6)",
										borderRadius: "20px",
										padding: "1.25rem",
										display: "flex",
										gap: "1rem",
									}}
								>
									<div style={{ color: "#0284c7", marginTop: "2px" }}>
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<circle cx="12" cy="12" r="10" />
											<line x1="12" y1="16" x2="12" y2="12" />
											<line x1="12" y1="8" x2="12.01" y2="8" />
										</svg>
									</div>
									<div>
										<h4
											style={{
												fontSize: "13px",
												fontWeight: 700,
												color: "#0369a1",
												margin: "0 0 8px 0",
											}}
										>
											How the Scraper Automates
										</h4>
										<ul
											style={{
												margin: 0,
												paddingLeft: "1.25rem",
												color: "#0f172a",
												fontSize: "12px",
												lineHeight: "1.6",
												display: "flex",
												flexDirection: "column",
												gap: "6px",
											}}
										>
											<li>
												Keep this browser tab open — runs fire at your set time.
											</li>
											<li>
												Results will be emailed to your registered address and
												logged in the History tab.
											</li>
											<li>
												Matches exceeding 88% (Tier 1) are highlighted and sent
												as priority notifications.
											</li>
										</ul>
									</div>
								</div>

								<div style={{ display: "flex", justifyContent: "flex-end" }}>
									<button
										onClick={handleSaveScheduler}
										style={{
											background: "#0058bc",
											color: "white",
											border: "none",
											padding: "12px 32px",
											borderRadius: "10px",
											fontSize: "14px",
											fontWeight: 700,
											cursor: "pointer",
											boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
											transition: "transform 0.1s",
										}}
										onMouseDown={(e) =>
											(e.currentTarget.style.transform = "scale(0.98)")
										}
										onMouseUp={(e) =>
											(e.currentTarget.style.transform = "scale(1)")
										}
									>
										Save Settings
									</button>
								</div>
							</div>

							{/* RIGHT COLUMN: Status & Insights */}
							<div
								style={{
									width: "100%",
									maxWidth: "300px",
									display: "flex",
									flexDirection: "column",
									gap: "1.25rem",
									flexShrink: 0,
								}}
							>
								{/* Countdown Status */}
								<div
									style={{
										background: "rgba(255, 255, 255, 0.4)",
										backdropFilter: "blur(24px)",
										borderRadius: "20px",
										border: "1px solid rgba(226, 232, 240, 0.5)",
										overflow: "hidden",
										boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
									}}
								>
									<div
										style={{
											background: isActive
												? "rgba(0, 88, 188, 0.8)"
												: "rgba(100, 116, 139, 0.8)",
											backdropFilter: "blur(12px)",
											color: "white",
											padding: "1.25rem",
										}}
									>
										<div
											style={{
												fontSize: "9px",
												fontWeight: 800,
												textTransform: "uppercase",
												letterSpacing: "1px",
												opacity: 0.8,
												marginBottom: "4px",
											}}
										>
											{isActive ? "Next Scheduled Run" : "Scheduler Offline"}
										</div>
										<div
											style={{
												fontSize: "32px",
												fontWeight: 800,
												fontFamily: "monospace",
												letterSpacing: "-1px",
											}}
										>
											{countdown}
										</div>
									</div>
									<div style={{ padding: "1.25rem" }}>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
												fontSize: "11px",
												fontWeight: 800,
												color: isActive ? "#15803d" : "#64748b",
												letterSpacing: "0.5px",
												marginBottom: "1rem",
											}}
										>
											<span
												style={{
													width: "6px",
													height: "6px",
													borderRadius: "50%",
													background: isActive ? "#22c55e" : "#cbd5e1",
												}}
											></span>
											SYSTEM STATUS: {isActive ? "ACTIVE" : "STANDBY"}
										</div>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "10px",
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													fontSize: "12px",
												}}
											>
												<span style={{ color: "#64748b" }}>Date</span>
												<span style={{ fontWeight: 700, color: "#0f172a" }}>
													{nextDate}
												</span>
											</div>
											<div
												style={{
													width: "100%",
													height: "1px",
													background: "rgba(0,0,0,0.05)",
												}}
											></div>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													fontSize: "12px",
												}}
											>
												<span style={{ color: "#64748b" }}>Time</span>
												<span style={{ fontWeight: 700, color: "#0f172a" }}>
													{nextTimeStr}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Performance Insights */}
								<div
									style={{
										background: "rgba(255, 255, 255, 0.4)",
										backdropFilter: "blur(24px)",
										borderRadius: "20px",
										border: "1px solid rgba(226, 232, 240, 0.5)",
										padding: "1.25rem",
										boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
									}}
								>
									<h3
										style={{
											fontSize: "13px",
											fontWeight: 800,
											color: "#0f172a",
											margin: "0 0 1rem 0",
										}}
									>
										Timing Insights
									</h3>
									<div
										style={{
											background: "rgba(255,255,255,0.6)",
											borderRadius: "12px",
											padding: "1rem",
											height: "80px",
											display: "flex",
											alignItems: "flex-end",
											justifyContent: "space-between",
											gap: "6px",
											marginBottom: "1rem",
										}}
									>
										{insightsData.map((data, i) => (
											<div
												key={i}
												title={data.label}
												style={{
													width: "100%",
													background: i === activeIndex ? "#0058bc" : "#e2e8f0",
													height: data.height,
													borderRadius: "4px",
													transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
													opacity: i === activeIndex ? 1 : 0.6,
												}}
											/>
										))}
									</div>
									<p
										style={{
											fontSize: "11px",
											color: "#64748b",
											fontStyle: "italic",
											margin: 0,
											lineHeight: "1.5",
											minHeight: "36px",
										}}
									>
										{insightsData[activeIndex].text}
									</p>
								</div>

								{/* Alerts */}
								<div
									style={{
										background: "rgba(15, 23, 42, 0.85)",
										backdropFilter: "blur(24px)",
										borderRadius: "20px",
										padding: "1.25rem",
										color: "white",
										border: "1px solid rgba(255,255,255,0.1)",
										position: "relative",
										overflow: "hidden",
										boxShadow: "0 4px 20px -2px rgba(0,0,0,0.1)",
									}}
								>
									{isAlertsActive && (
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "4px",
												height: "100%",
												background: "#22c55e",
											}}
										></div>
									)}
									<h3
										style={{
											fontSize: "13px",
											fontWeight: 800,
											margin: "0 0 6px 0",
											display: "flex",
											alignItems: "center",
											gap: "6px",
										}}
									>
										{isAlertsActive
											? "Priority Alerts Active"
											: "Priority Alerts"}
										{isAlertsActive && (
											<span
												style={{
													width: "6px",
													height: "6px",
													borderRadius: "50%",
													background: "#22c55e",
													display: "inline-block",
												}}
											></span>
										)}
									</h3>
									<p
										style={{
											fontSize: "11px",
											color: "#94a3b8",
											margin: "0 0 1rem 0",
											lineHeight: "1.5",
										}}
									>
										{isAlertsActive
											? `Monitoring for targets matching: ${alertKeywords.split(",")[0] || alertTier}`
											: "Try priority search alerts."}
									</p>
									<button
										onClick={() => setIsAlertModalOpen(true)}
										style={{
											background: isAlertsActive ? "#334155" : "transparent",
											color: "white",
											border: isAlertsActive
												? "none"
												: "1px solid rgba(255,255,255,0.2)",
											padding: "6px 12px",
											borderRadius: "8px",
											fontSize: "11px",
											fontWeight: 700,
											cursor: "pointer",
										}}
									>
										Configure Alerts
									</button>
								</div>
							</div>
						</div>
					</>
				)}
			</section>

			{/* --- EVENT EDIT/CREATE MODAL --- */}
			{isEventModalOpen &&
				editingEvent &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.6)",
							backdropFilter: "blur(8px)",
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
								maxWidth: "400px",
								borderRadius: "20px",
								overflow: "hidden",
								boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.2)",
							}}
						>
							<div
								style={{
									padding: "1.25rem",
									borderBottom: "1px solid #f1f5f9",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<h3
									style={{
										fontSize: "16px",
										fontWeight: 800,
										color: "#0f172a",
										margin: 0,
									}}
								>
									{events.find((e) => e.id === editingEvent.id)
										? "Edit Agenda Event"
										: "Add to Agenda"}
								</h3>
								<button
									onClick={() => setIsEventModalOpen(false)}
									style={{
										background: "#f1f5f9",
										border: "none",
										width: "28px",
										height: "28px",
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
										strokeWidth="2"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>

							<form
								onSubmit={handleSaveEvent}
								style={{
									padding: "1.25rem",
									display: "flex",
									flexDirection: "column",
									gap: "1rem",
								}}
							>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "11px",
											fontWeight: 800,
											color: "#475569",
											marginBottom: "4px",
										}}
									>
										EVENT TITLE
									</label>
									<input
										required
										type="text"
										value={editingEvent.title}
										onChange={(e) =>
											setEditingEvent({
												...editingEvent,
												title: e.target.value,
											})
										}
										placeholder="e.g. Technical Interview"
										style={{
											width: "100%",
											padding: "8px 12px",
											borderRadius: "8px",
											border: "1px solid #cbd5e1",
											fontSize: "13px",
											outline: "none",
										}}
									/>
								</div>
								<div style={{ display: "flex", gap: "1rem" }}>
									<div style={{ flex: 1 }}>
										<label
											style={{
												display: "block",
												fontSize: "11px",
												fontWeight: 800,
												color: "#475569",
												marginBottom: "4px",
											}}
										>
											DATE
										</label>
										<input
											required
											type="number"
											min="1"
											max="31"
											value={editingEvent.date}
											onChange={(e) =>
												setEditingEvent({
													...editingEvent,
													date: parseInt(e.target.value),
												})
											}
											style={{
												width: "100%",
												padding: "8px 12px",
												borderRadius: "8px",
												border: "1px solid #cbd5e1",
												fontSize: "13px",
												outline: "none",
											}}
										/>
									</div>
									<div style={{ flex: 1 }}>
										<label
											style={{
												display: "block",
												fontSize: "11px",
												fontWeight: 800,
												color: "#475569",
												marginBottom: "4px",
											}}
										>
											TIME
										</label>
										<input
											required
											type="time"
											value={convertAMPMTo24H(editingEvent.time)}
											onChange={(e) =>
												setEditingEvent({
													...editingEvent,
													time: formatTimeAMPM(e.target.value),
												})
											}
											style={{
												width: "100%",
												padding: "8px 12px",
												borderRadius: "8px",
												border: "1px solid #cbd5e1",
												fontSize: "13px",
												outline: "none",
											}}
										/>
									</div>
								</div>
								<div style={{ display: "flex", gap: "1rem" }}>
									<div style={{ flex: 1 }}>
										<label
											style={{
												display: "block",
												fontSize: "11px",
												fontWeight: 800,
												color: "#475569",
												marginBottom: "4px",
											}}
										>
											COMPANY
										</label>
										<input
											required
											type="text"
											value={editingEvent.company}
											onChange={(e) =>
												setEditingEvent({
													...editingEvent,
													company: e.target.value,
												})
											}
											style={{
												width: "100%",
												padding: "8px 12px",
												borderRadius: "8px",
												border: "1px solid #cbd5e1",
												fontSize: "13px",
												outline: "none",
											}}
										/>
									</div>
									<div style={{ flex: 1 }}>
										<label
											style={{
												display: "block",
												fontSize: "11px",
												fontWeight: 800,
												color: "#475569",
												marginBottom: "4px",
											}}
										>
											TYPE
										</label>
										<select
											value={editingEvent.type}
											onChange={(e) =>
												setEditingEvent({
													...editingEvent,
													type: e.target.value as EventType,
												})
											}
											style={{
												width: "100%",
												padding: "8px 12px",
												borderRadius: "8px",
												border: "1px solid #cbd5e1",
												fontSize: "13px",
												outline: "none",
												background: "white",
											}}
										>
											<option value="interview">Interview</option>
											<option value="deadline">Deadline</option>
											<option value="followup">Follow-up</option>
											<option value="action">Action</option>
										</select>
									</div>
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginTop: "0.5rem",
										paddingTop: "1rem",
										borderTop: "1px solid #f1f5f9",
									}}
								>
									{events.find((e) => e.id === editingEvent.id) ? (
										<button
											type="button"
											onClick={handleDeleteEvent}
											style={{
												color: "#ef4444",
												background: "transparent",
												border: "none",
												fontSize: "12px",
												fontWeight: 700,
												cursor: "pointer",
											}}
										>
											Delete
										</button>
									) : (
										<div></div>
									)}
									<div style={{ display: "flex", gap: "8px" }}>
										<button
											type="button"
											onClick={() => setIsEventModalOpen(false)}
											style={{
												padding: "8px 16px",
												borderRadius: "8px",
												border: "1px solid #cbd5e1",
												background: "white",
												color: "#475569",
												fontSize: "12px",
												fontWeight: 700,
												cursor: "pointer",
											}}
										>
											Cancel
										</button>
										<button
											type="submit"
											style={{
												padding: "8px 16px",
												borderRadius: "8px",
												border: "none",
												background: "#0058bc",
												color: "white",
												fontSize: "12px",
												fontWeight: 700,
												cursor: "pointer",
											}}
										>
											Save
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>,
					document.body,
				)}

			{/* --- ALERT MODAL OVERLAY --- */}
			{isAlertModalOpen &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100vw",
							height: "100vh",
							background: "rgba(15, 23, 42, 0.6)",
							backdropFilter: "blur(8px)",
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
								maxWidth: "450px",
								borderRadius: "20px",
								overflow: "hidden",
								boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.2)",
							}}
						>
							<div
								style={{
									padding: "1.25rem",
									borderBottom: "1px solid #f1f5f9",
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
											margin: "0 0 2px 0",
										}}
									>
										Priority Search Alerts
									</h3>
								</div>
								<button
									onClick={() => setIsAlertModalOpen(false)}
									style={{
										background: "#f1f5f9",
										border: "none",
										width: "28px",
										height: "28px",
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
										strokeWidth="2"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>

							<div
								style={{
									padding: "1.25rem",
									display: "flex",
									flexDirection: "column",
									gap: "1.25rem",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										background: "#f8fafc",
										padding: "12px",
										borderRadius: "12px",
										border: "1px solid #f1f5f9",
									}}
								>
									<div
										style={{
											fontWeight: 700,
											color: "#0f172a",
											fontSize: "13px",
										}}
									>
										Enable Priority Alerts
									</div>
									<label className="sw" style={{ margin: 0 }}>
										<input
											type="checkbox"
											checked={isAlertsActive}
											onChange={(e) => setIsAlertsActive(e.target.checked)}
										/>
										<span
											className="sw-track"
											style={{ transform: "scale(0.8)" }}
										></span>
									</label>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "11px",
											fontWeight: 800,
											color: "#475569",
											marginBottom: "6px",
										}}
									>
										TARGET QUALITY
									</label>
									<select
										value={alertTier}
										onChange={(e) => setAlertTier(e.target.value)}
										style={{
											width: "100%",
											padding: "10px",
											borderRadius: "10px",
											border: "1px solid #cbd5e1",
											fontSize: "13px",
											outline: "none",
											background: "white",
										}}
									>
										<option value="Tier 1 Only">
											Tier 1 Only (90%+ Match)
										</option>
										<option value="Tier 1 & Tier 2">
											Tier 1 & Tier 2 (75%+ Match)
										</option>
										<option value="All Roles">Any Laboratory Role</option>
									</select>
								</div>
								<div>
									<label
										style={{
											display: "block",
											fontSize: "11px",
											fontWeight: 800,
											color: "#475569",
											marginBottom: "6px",
										}}
									>
										SPECIFIC KEYWORDS
									</label>
									<input
										type="text"
										value={alertKeywords}
										onChange={(e) => setAlertKeywords(e.target.value)}
										style={{
											width: "100%",
											padding: "10px",
											borderRadius: "10px",
											border: "1px solid #cbd5e1",
											fontSize: "13px",
											outline: "none",
										}}
									/>
								</div>
							</div>

							<div
								style={{
									padding: "1.25rem",
									background: "#f8fafc",
									borderTop: "1px solid #f1f5f9",
									display: "flex",
									justifyContent: "flex-end",
									gap: "8px",
								}}
							>
								<button
									onClick={() => setIsAlertModalOpen(false)}
									style={{
										padding: "8px 16px",
										borderRadius: "8px",
										border: "1px solid #cbd5e1",
										background: "white",
										color: "#475569",
										fontSize: "12px",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									Cancel
								</button>
								<button
									onClick={handleSaveAlerts}
									style={{
										padding: "8px 16px",
										borderRadius: "8px",
										border: "none",
										background: "#0058bc",
										color: "white",
										fontSize: "12px",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									Save Alerts
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
