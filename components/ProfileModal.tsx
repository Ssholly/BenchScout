"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function ProfileModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [view, setView] = useState<
		"login" | "signup" | "profile" | "forgot" | "verify-sent"
	>("signup");
	const [isUploading, setIsUploading] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const [activeUser, setActiveUser] = useState<{
		name: string;
		email: string;
		keywords: string;
	} | null>(null);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [resumeName, setResumeName] = useState("MLS_Resume_Latest.pdf");

	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "warning";
	} | null>(null);
	const updateCvRef = useRef<HTMLInputElement>(null);
	const avatarUploadRef = useRef<HTMLInputElement>(null);
	const [mounted, setMounted] = useState(false);

	const showToast = (
		message: string,
		type: "success" | "error" | "warning" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	useEffect(() => {
		setMounted(true);
		const handleOpen = async () => {
			const activeEmail = localStorage.getItem("labpro_active_user");

			if (activeEmail) {
				const savedAvatar = localStorage.getItem(
					`labpro_avatar_${activeEmail}`,
				);
				if (savedAvatar) setAvatar(savedAvatar);
				else setAvatar(null);

				const savedResume = localStorage.getItem(
					`labpro_resume_name_${activeEmail}`,
				);
				if (savedResume) setResumeName(savedResume);
				else setResumeName("No Resume Attached");

				setView("profile");
				setEmail(activeEmail);
				try {
					const res = await fetch(`/api/user?email=${activeEmail}`);
					const data = await res.json();
					if (data.success && data.user) {
						setActiveUser(data.user);
					}
				} catch (error) {}
			} else {
				setView("signup");
			}
			setIsOpen(true);
		};

		window.addEventListener("openProfileModal", handleOpen);
		return () => window.removeEventListener("openProfileModal", handleOpen);
	}, []);

	if (!isOpen || !mounted) return null;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0)
			setSelectedFile(e.target.files[0]);
	};

	const handleUpdateCv = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0 && email) {
			const newFile = e.target.files[0];
			setResumeName(newFile.name);
			localStorage.setItem(`labpro_resume_name_${email}`, newFile.name);
			setIsUploading(true);

			setTimeout(() => {
				setIsUploading(false);
				showToast("Resume updated! AI skills recalibrated.");
				window.dispatchEvent(new Event("userStateChanged"));
			}, 2000);
		}
	};

	const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && email) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setAvatar(base64String);
				localStorage.setItem(`labpro_avatar_${email}`, base64String);
				window.dispatchEvent(new Event("userStateChanged"));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRegister = async () => {
		if (!name || !email || !password || !selectedFile)
			return showToast("Please fill all fields and select a resume.", "error");
		setIsUploading(true);
		const formData = new FormData();
		formData.append("name", name);
		formData.append("email", email);
		formData.append("password", password);
		formData.append("resume", selectedFile);

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (data.success) {
				localStorage.setItem(`labpro_resume_name_${email}`, selectedFile.name);
				setView("verify-sent");
				if (data.warning) {
					showToast(data.warning, "error"); // Show Resend API errors (e.g. unverified email)
				}
			} else {
				showToast(data.error, "error");
			}
		} catch (err: any) {
			showToast("Network error during registration.", "error");
		} finally {
			setIsUploading(false);
		}
	};

	// 🚀 Handle Resending the Verification Link
	const handleResendLink = async () => {
		setIsUploading(true);
		try {
			const res = await fetch("/api/auth/resend-verification", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();
			if (res.ok) {
				showToast("A new verification link has been sent.");
			} else {
				showToast(data.error || "Failed to resend link.", "error");
			}
		} catch (error) {
			showToast("Network error.", "error");
		} finally {
			setIsUploading(false);
		}
	};

	const handleLogin = async () => {
		if (!email || !password)
			return showToast("Please enter email and password.", "error");
		setIsUploading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (data.success) {
				localStorage.setItem("labpro_active_user", data.user.email);
				setActiveUser({
					name: data.user.name,
					email: data.user.email,
					keywords: data.user.keywords || "",
				});
				window.dispatchEvent(new Event("userStateChanged"));
				showToast("Welcome back!");
				setTimeout(() => setIsOpen(false), 1000);
			} else {
				showToast(data.error, "error");
			}
		} catch (err) {
			showToast("Network error during login.", "error");
		} finally {
			setIsUploading(false);
		}
	};

	const handleForgotPassword = async () => {
		if (!email)
			return showToast("Please enter your email address first.", "error");
		setIsUploading(true);

		try {
			const res = await fetch("/api/auth/forgot", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await res.json();

			showToast(data.message || "Request processed.");
			if (res.ok) setView("login");
		} catch (error) {
			showToast("Network error.", "error");
		} finally {
			setIsUploading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("labpro_active_user");
		localStorage.removeItem("labpro_results");
		localStorage.removeItem("labpro_history");
		localStorage.removeItem("labpro_scheduler_active");
		window.dispatchEvent(new Event("schedulerUpdated"));
		setActiveUser(null);
		setAvatar(null);
		setView("login");
		window.location.href = "/";
	};

	const inputStyle = {
		width: "100%",
		background: "#f8fafc",
		border: "1px solid #e2e8f0",
		borderRadius: "10px",
		padding: "14px",
		fontSize: "14px",
		outline: "none",
		color: "#0f172a",
		fontWeight: 600,
		marginBottom: "12px",
		transition: "0.2s",
	};

	return createPortal(
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				background: "rgba(15, 23, 42, 0.5)",
				backdropFilter: "blur(12px)",
				WebkitBackdropFilter: "blur(12px)",
				zIndex: 999999,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
			}}
		>
			{toast && (
				<div
					style={{
						position: "absolute",
						top: "24px",
						left: "50%",
						transform: "translateX(-50%)",
						background:
							toast.type === "success"
								? "rgba(15, 23, 42, 0.9)"
								: "rgba(153, 27, 27, 0.9)",
						color: "white",
						padding: "12px 24px",
						borderRadius: "30px",
						fontSize: "14px",
						fontWeight: 700,
						zIndex: 1000001,
						boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					{toast.type === "success" ? "✓" : "✕"} {toast.message}
				</div>
			)}

			<div
				style={{
					background: "white",
					width: "100%",
					maxWidth: "480px",
					borderRadius: "24px",
					overflow: "hidden",
					boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
					position: "relative",
					zIndex: 1,
					border: "1px solid rgba(255,255,255,0.8)",
				}}
			>
				{view === "verify-sent" ? (
					<div style={{ padding: "3rem 2.5rem", textAlign: "center" }}>
						<div
							style={{
								width: "64px",
								height: "64px",
								background: "#f0f9ff",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 24px auto",
								color: "#0ea5e9",
							}}
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
								<polyline points="3 7 12 13 21 7"></polyline>
							</svg>
						</div>

						<h2
							style={{
								fontSize: "24px",
								fontWeight: 900,
								color: "#0f172a",
								margin: "0 0 12px 0",
								letterSpacing: "-0.5px",
							}}
						>
							Check your email
						</h2>
						<p
							style={{
								color: "#64748b",
								fontSize: "15px",
								marginBottom: "32px",
								lineHeight: "1.5",
							}}
						>
							We just sent a verification link to <br />
							<span style={{ color: "#0f172a", fontWeight: 700 }}>{email}</span>
							.
						</p>

						<div
							style={{ display: "flex", flexDirection: "column", gap: "12px" }}
						>
							<button
								onClick={() => setView("login")}
								style={{
									width: "100%",
									background: "#f8fafc",
									color: "#0f172a",
									border: "1px solid #e2e8f0",
									padding: "14px",
									borderRadius: "12px",
									fontSize: "15px",
									fontWeight: 800,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "8px",
									transition: "0.2s",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = "#f1f5f9";
									e.currentTarget.style.borderColor = "#cbd5e1";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = "#f8fafc";
									e.currentTarget.style.borderColor = "#e2e8f0";
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
									<line x1="19" y1="12" x2="5" y2="12"></line>
									<polyline points="12 19 5 12 12 5"></polyline>
								</svg>
								Back to Login
							</button>

							<button
								onClick={handleResendLink}
								disabled={isUploading}
								style={{
									background: "none",
									border: "none",
									color: "#64748b",
									fontSize: "13px",
									fontWeight: 700,
									cursor: isUploading ? "wait" : "pointer",
									marginTop: "8px",
								}}
							>
								{isUploading ? "Sending..." : "Didn't receive it? Resend Link"}
							</button>
						</div>
					</div>
				) : (
					<>
						<div
							style={{
								padding: "2rem 2.5rem 1.5rem 2.5rem",
								borderBottom: "1px solid #f1f5f9",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}
						>
							<div>
								<div
									style={{
										width: "48px",
										height: "48px",
										background:
											"linear-gradient(135deg, #0058bc 0%, #0ea5e9 100%)",
										borderRadius: "14px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginBottom: "1rem",
										boxShadow: "0 4px 14px rgba(0, 88, 188, 0.2)",
									}}
								>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
											stroke="white"
											strokeWidth="2.5"
											strokeLinejoin="round"
										/>
										<circle cx="12" cy="12" r="3.5" fill="#22c55e" />
									</svg>
								</div>
								<h3
									style={{
										margin: 0,
										fontWeight: 900,
										color: "#0f172a",
										fontSize: "24px",
										letterSpacing: "-0.5px",
									}}
								>
									{view === "signup"
										? "Create Account"
										: view === "login"
											? "Welcome Back"
											: view === "forgot"
												? "Reset Password"
												: "Your Profile"}
								</h3>
								<p
									style={{
										margin: "6px 0 0 0",
										fontSize: "14px",
										color: "#64748b",
									}}
								>
									{view === "profile"
										? "Manage your AI-extracted career data."
										: view === "forgot"
											? "Enter your email to receive a reset link."
											: "Join BenchScout, your MLS Hub."}
								</p>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								style={{
									background: "#f1f5f9",
									border: "none",
									width: "36px",
									height: "36px",
									borderRadius: "50%",
									cursor: "pointer",
									color: "#64748b",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									transition: "0.2s",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background = "#e2e8f0")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "#f1f5f9")
								}
							>
								<svg
									width="18"
									height="18"
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

						<div style={{ padding: "2rem 2.5rem" }}>
							{(view === "signup" || view === "login") && (
								<div>
									{view === "signup" && (
										<input
											type="text"
											placeholder="Full Name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											style={inputStyle}
										/>
									)}
									<input
										type="email"
										placeholder="Email Address"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										style={inputStyle}
									/>

									<div style={{ position: "relative", marginBottom: "8px" }}>
										<input
											type={showPassword ? "text" : "password"}
											placeholder="Password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											style={{
												...inputStyle,
												marginBottom: 0,
												paddingRight: "40px",
											}}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											style={{
												position: "absolute",
												right: "12px",
												top: "50%",
												transform: "translateY(-50%)",
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "#94a3b8",
											}}
										>
											{showPassword ? "Hide" : "Show"}
										</button>
									</div>

									{view === "login" && (
										<div style={{ textAlign: "right", marginBottom: "16px" }}>
											<button
												onClick={() => setView("forgot")}
												style={{
													background: "none",
													border: "none",
													color: "#0058bc",
													fontSize: "12px",
													fontWeight: 700,
													cursor: "pointer",
													padding: 0,
												}}
											>
												Forgot password?
											</button>
										</div>
									)}

									{view === "signup" && (
										<div
											style={{
												background: "#f8fafc",
												padding: "1.5rem",
												borderRadius: "12px",
												border: "2px dashed #cbd5e1",
												textAlign: "center",
												marginTop: "1rem",
												transition: "0.2s",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.borderColor = "#93c5fd")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.borderColor = "#cbd5e1")
											}
										>
											<p
												style={{
													margin: "0 0 10px 0",
													fontSize: "11px",
													color: "#475569",
													fontWeight: 800,
													letterSpacing: "0.5px",
												}}
											>
												UPLOAD RESUME (AI SCAN)
											</p>
											<input
												type="file"
												id="resume"
												accept=".pdf,.doc,.docx"
												hidden
												onChange={handleFileChange}
												disabled={isUploading}
											/>
											<label
												htmlFor="resume"
												style={{
													cursor: isUploading ? "wait" : "pointer",
													color: "#0058bc",
													fontWeight: 800,
													fontSize: "14px",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													gap: "8px",
												}}
											>
												<svg
													width="18"
													height="18"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
												>
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
													<polyline points="17 8 12 3 7 8"></polyline>
													<line x1="12" y1="3" x2="12" y2="15"></line>
												</svg>
												{selectedFile
													? selectedFile.name
													: "Select PDF or Word Doc"}
											</label>
										</div>
									)}

									<button
										onClick={view === "signup" ? handleRegister : handleLogin}
										disabled={isUploading}
										style={{
											width: "100%",
											background: isUploading ? "#94a3b8" : "#0058bc",
											color: "white",
											border: "none",
											padding: "16px",
											borderRadius: "12px",
											fontSize: "15px",
											fontWeight: 800,
											cursor: isUploading ? "wait" : "pointer",
											marginTop: "1.5rem",
											boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
											transition: "0.2s",
										}}
										onMouseEnter={(e) =>
											!isUploading &&
											(e.currentTarget.style.transform = "translateY(-2px)")
										}
										onMouseLeave={(e) =>
											!isUploading &&
											(e.currentTarget.style.transform = "translateY(0)")
										}
									>
										{isUploading
											? "Processing..."
											: view === "signup"
												? "Create Account"
												: "Secure Login"}
									</button>

									<div
										style={{
											textAlign: "center",
											marginTop: "1.5rem",
											fontSize: "14px",
										}}
									>
										<span style={{ color: "#64748b" }}>
											{view === "signup"
												? "Already have an account? "
												: "Need an account? "}
										</span>
										<span
											onClick={() =>
												setView(view === "signup" ? "login" : "signup")
											}
											style={{
												color: "#0058bc",
												fontWeight: 800,
												cursor: "pointer",
											}}
										>
											{view === "signup" ? "Log in" : "Sign up"}
										</span>
									</div>
								</div>
							)}

							{view === "forgot" && (
								<div>
									<input
										type="email"
										placeholder="Email Address"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										style={{ ...inputStyle, marginBottom: "24px" }}
									/>
									<button
										onClick={handleForgotPassword}
										disabled={isUploading}
										style={{
											width: "100%",
											background: isUploading ? "#94a3b8" : "#0058bc",
											color: "white",
											border: "none",
											padding: "16px",
											borderRadius: "12px",
											fontSize: "15px",
											fontWeight: 800,
											cursor: isUploading ? "wait" : "pointer",
											boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
											transition: "0.2s",
										}}
									>
										{isUploading ? "Sending..." : "Send Reset Link"}
									</button>
									<div style={{ textAlign: "center", marginTop: "1.5rem" }}>
										<button
											onClick={() => setView("login")}
											style={{
												background: "none",
												border: "none",
												color: "#64748b",
												fontSize: "14px",
												fontWeight: 700,
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												gap: "6px",
												width: "100%",
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
												<line x1="19" y1="12" x2="5" y2="12"></line>
												<polyline points="12 19 5 12 12 5"></polyline>
											</svg>
											Back to Login
										</button>
									</div>
								</div>
							)}

							{view === "profile" && (
								<div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "16px",
											marginBottom: "2rem",
										}}
									>
										<div style={{ position: "relative" }}>
											<input
												type="file"
												accept="image/*"
												hidden
												ref={avatarUploadRef}
												onChange={handleAvatarUpload}
											/>
											<div
												onClick={() => avatarUploadRef.current?.click()}
												style={{
													width: "64px",
													height: "64px",
													borderRadius: "50%",
													background: "#0058bc",
													color: "white",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 900,
													fontSize: "24px",
													overflow: "hidden",
													boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
													cursor: "pointer",
												}}
											>
												{avatar ? (
													<img
														src={avatar}
														alt="Profile"
														style={{
															width: "100%",
															height: "100%",
															objectFit: "cover",
														}}
													/>
												) : activeUser?.name ? (
													activeUser.name.charAt(0).toUpperCase()
												) : (
													"U"
												)}
											</div>
											<div
												onClick={() => avatarUploadRef.current?.click()}
												style={{
													position: "absolute",
													bottom: 0,
													right: "-4px",
													background: "white",
													borderRadius: "50%",
													padding: "4px",
													boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<svg
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="#0058bc"
													strokeWidth="2.5"
												>
													<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
													<circle cx="12" cy="13" r="4"></circle>
												</svg>
											</div>
										</div>

										<div style={{ flex: 1, minWidth: 0 }}>
											<h2
												style={{
													margin: 0,
													fontSize: "20px",
													color: "#0f172a",
													fontWeight: 800,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{activeUser?.name || "User Profile"}
											</h2>
											<p
												style={{
													margin: "2px 0 0 0",
													color: "#64748b",
													fontSize: "14px",
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{email}
											</p>
										</div>
									</div>

									<div
										style={{
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "16px",
											padding: "16px",
											marginBottom: "1rem",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<div style={{ minWidth: 0, paddingRight: "12px" }}>
											<div
												style={{
													fontSize: "11px",
													color: "#94a3b8",
													fontWeight: 800,
													letterSpacing: "0.5px",
													marginBottom: "4px",
												}}
											>
												ACTIVE RESUME
											</div>
											<div
												style={{
													fontSize: "13px",
													fontWeight: 700,
													color: "#0f172a",
													display: "flex",
													alignItems: "center",
													gap: "6px",
												}}
											>
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="#64748b"
													strokeWidth="2.5"
												>
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
													<polyline points="14 2 14 8 20 8"></polyline>
												</svg>
												<span
													style={{
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
													}}
												>
													{resumeName}
												</span>
											</div>
										</div>
										<div>
											<input
												type="file"
												accept=".pdf,.doc,.docx"
												hidden
												ref={updateCvRef}
												onChange={handleUpdateCv}
											/>
											<button
												onClick={() => updateCvRef.current?.click()}
												disabled={isUploading}
												style={{
													background: "#eff6ff",
													color: "#0058bc",
													border: "1px solid #bfdbfe",
													padding: "8px 14px",
													borderRadius: "8px",
													fontSize: "12px",
													fontWeight: 800,
													cursor: isUploading ? "wait" : "pointer",
													flexShrink: 0,
												}}
											>
												{isUploading ? "Scanning..." : "Update"}
											</button>
										</div>
									</div>

									<div
										style={{
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "16px",
											padding: "16px",
											marginBottom: "1.5rem",
										}}
									>
										<div
											style={{
												fontSize: "11px",
												color: "#94a3b8",
												fontWeight: 800,
												letterSpacing: "0.5px",
												marginBottom: "10px",
												textTransform: "uppercase",
											}}
										>
											AI EXTRACTED SKILLS & ROLES
										</div>
										<div
											style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
										>
											{activeUser?.keywords &&
											activeUser.keywords.length > 0 ? (
												activeUser.keywords
													.split(",")
													.map((kw: string, idx: number) => (
														<span
															key={idx}
															style={{
																background: "white",
																color: "#0058bc",
																border: "1px solid #e2e8f0",
																padding: "6px 12px",
																borderRadius: "8px",
																fontSize: "12px",
																fontWeight: 700,
																boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
															}}
														>
															{kw.trim()}
														</span>
													))
											) : (
												<span
													style={{
														color: "#94a3b8",
														fontSize: "13px",
														fontStyle: "italic",
													}}
												>
													No skills found. Update in Settings.
												</span>
											)}
										</div>
									</div>

									<button
										onClick={handleLogout}
										style={{
											width: "100%",
											background: "#fef2f2",
											color: "#ef4444",
											border: "1px solid #fecaca",
											padding: "14px",
											borderRadius: "12px",
											fontSize: "14px",
											fontWeight: 800,
											cursor: "pointer",
											transition: "0.2s",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "#fee2e2")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "#fef2f2")
										}
									>
										Securely Log Out
									</button>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>,
		document.body,
	);
}
