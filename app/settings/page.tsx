"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const NIGERIA_STATES = [
	"All Nigeria",
	"Abia",
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
	"FCT - Abuja",
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
];

type VaultDoc = {
	id: string;
	name: string;
	type: string;
	size: string;
	uploadedAt: string | null;
	url: string | null;
};

const DEFAULT_DOCS: VaultDoc[] = [
	{
		id: "cv",
		name: "Master Curriculum Vitae",
		type: "PDF",
		size: "-",
		uploadedAt: null,
		url: null,
	},
	{
		id: "license",
		name: "MLSCN Practicing License",
		type: "PDF / Image",
		size: "-",
		uploadedAt: null,
		url: null,
	},
	{
		id: "degree",
		name: "B.MLS Degree Certificate",
		type: "PDF / Image",
		size: "-",
		uploadedAt: null,
		url: null,
	},
];

export default function SettingsPage() {
	const [userData, setUserData] = useState({
		name: "",
		email: "",
		keywords: [] as string[],
		location: "All Nigeria",
		minScore: 85,
	});

	const [checkingAuth, setCheckingAuth] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);
	const [previewDoc, setPreviewDoc] = useState<VaultDoc | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
	const [documents, setDocuments] = useState<VaultDoc[]>(DEFAULT_DOCS);

	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [extractedData, setExtractedData] = useState({
		fullName: "",
		licenseNumber: "",
		expiryDate: "",
	});
	const [isVerifying, setIsVerifying] = useState(false);

	const showToast = (
		message: string,
		type: "success" | "error" = "success",
	) => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 3500);
	};

	const loadSettings = async () => {
		setCheckingAuth(true);
		const activeEmail = localStorage.getItem("labpro_active_user");

		if (!activeEmail) {
			setIsUserLoggedIn(false);
			setUserData({
				name: "",
				email: "",
				keywords: [],
				location: "All Nigeria",
				minScore: 85,
			});
			setDocuments(DEFAULT_DOCS);
			setCheckingAuth(false);
			return;
		}

		setIsUserLoggedIn(true);

		try {
			const res = await fetch(`/api/user?email=${activeEmail}`);
			const data = await res.json();
			if (data.success && data.user) {
				setUserData({
					name: data.user.name || "",
					email: data.user.email || "",
					keywords: data.user.keywords
						? data.user.keywords.split(",").map((k: string) => k.trim())
						: [],
					location: data.user.location || "All Nigeria",
					// 🚀 THE FIX: Used Nullish Coalescing (??) so 0 is safely accepted
					minScore: data.user.minScore ?? 85,
				});

				const updatedDocs = [...DEFAULT_DOCS];
				if (data.user.resumeUrl)
					updatedDocs[0] = {
						...updatedDocs[0],
						url: data.user.resumeUrl,
						size: "Secure",
						uploadedAt: "Cloud",
					};
				if (data.user.licenseUrl)
					updatedDocs[1] = {
						...updatedDocs[1],
						url: data.user.licenseUrl,
						size: "Secure",
						uploadedAt: "Cloud",
					};
				if (data.user.degreeUrl)
					updatedDocs[2] = {
						...updatedDocs[2],
						url: data.user.degreeUrl,
						size: "Secure",
						uploadedAt: "Cloud",
					};

				const savedMeta = localStorage.getItem(`labpro_vault_${activeEmail}`);
				if (savedMeta) {
					const parsedMeta = JSON.parse(savedMeta);
					const finalDocs = updatedDocs.map((doc) => {
						const meta = parsedMeta.find((m: VaultDoc) => m.id === doc.id);
						return meta && meta.url === doc.url
							? { ...doc, size: meta.size, uploadedAt: meta.uploadedAt }
							: doc;
					});
					setDocuments(finalDocs);
				} else {
					setDocuments(updatedDocs);
				}
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
		setCheckingAuth(false);
	};

	useEffect(() => {
		loadSettings();
		window.addEventListener("userStateChanged", loadSettings);
		return () => window.removeEventListener("userStateChanged", loadSettings);
	}, []);

	const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const newKeyword = e.currentTarget.value.trim();
			if (newKeyword && !userData.keywords.includes(newKeyword)) {
				setUserData({
					...userData,
					keywords: [...userData.keywords, newKeyword],
				});
				e.currentTarget.value = "";
			}
		}
	};

	const removeKeyword = (indexToRemove: number) => {
		setUserData({
			...userData,
			keywords: userData.keywords.filter((_, idx) => idx !== indexToRemove),
		});
	};

	const handleUpdateProfile = async () => {
		setIsSaving(true);
		try {
			const payload = { ...userData, keywords: userData.keywords.join(", ") };
			const res = await fetch("/api/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (data.success) {
				showToast("Profile updated successfully!");
				window.dispatchEvent(new Event("userStateChanged"));
			} else {
				showToast("Failed to update profile.", "error");
			}
		} catch (error) {
			showToast("Network error.", "error");
		}
		setIsSaving(false);
	};

	const triggerUpload = (id: string) => {
		setActiveUploadId(id);
		fileInputRef.current?.click();
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !activeUploadId) return;

		if (file.size > 10 * 1024 * 1024) {
			showToast("File is too large. Max 10MB allowed.", "error");
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}

		if (!userData.email) {
			showToast("Please log in to upload documents.", "error");
			return;
		}

		setIsUploading(true);
		showToast("Securing document and analyzing...", "success");

		const formData = new FormData();
		formData.append("file", file);
		formData.append("email", userData.email);

		const docTypeMap: Record<string, string> = {
			cv: "resume",
			license: "license",
			degree: "degree",
		};
		formData.append("documentType", docTypeMap[activeUploadId]);

		try {
			const uploadPromise = fetch("/api/upload", {
				method: "POST",
				body: formData,
			}).then((res) => res.json());

			let aiPromise: Promise<any> = Promise.resolve(null);
			if (activeUploadId === "license") {
				const scanForm = new FormData();
				scanForm.append("file", file);
				aiPromise = fetch("/api/extract-license", {
					method: "POST",
					body: scanForm,
				}).then((res) => res.json());
			}

			const [uploadData, scanData] = (await Promise.all([
				uploadPromise,
				aiPromise,
			])) as [any, any];

			if (uploadData.success) {
				const updatedDocs = documents.map((doc) => {
					if (doc.id === activeUploadId) {
						return {
							...doc,
							size: (file.size / 1024 / 1024).toFixed(2) + " MB",
							uploadedAt: new Date().toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short",
								year: "numeric",
							}),
							url: uploadData.url,
						};
					}
					return doc;
				});

				setDocuments(updatedDocs);
				localStorage.setItem(
					`labpro_vault_${userData.email}`,
					JSON.stringify(updatedDocs),
				);
				showToast("Document secured in Vault!");
			} else {
				throw new Error(uploadData.error || "Database update failed");
			}

			if (activeUploadId === "license" && scanData) {
				if (scanData.success && scanData.data) {
					setExtractedData({
						fullName: scanData.data.fullName || userData.name || "",
						licenseNumber: scanData.data.licenseNumber || "",
						expiryDate: scanData.data.expiryDate || "",
					});
					setShowVerificationModal(true);
				} else {
					showToast(
						`AI Error: ${scanData.error || "Could not read license."}`,
						"error",
					);
					console.error("Backend AI Error Details:", scanData);
				}
			}
		} catch (error: any) {
			console.error("Pipeline Error:", error);
			showToast(`Error: ${error.message}`, "error");
		} finally {
			setIsUploading(false);
			setActiveUploadId(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleDeleteDoc = async (id: string) => {
		const docToDelete = documents.find((d) => d.id === id);
		if (!docToDelete || !docToDelete.url || !userData.email) return;

		const updatedDocs = documents.map((doc) =>
			doc.id === id ? { ...doc, size: "-", uploadedAt: null, url: null } : doc,
		);
		setDocuments(updatedDocs);
		localStorage.setItem(
			`labpro_vault_${userData.email}`,
			JSON.stringify(updatedDocs),
		);
		showToast("Document unlinked from profile.");

		const docTypeMap: Record<string, string> = {
			cv: "resume",
			license: "license",
			degree: "degree",
		};

		try {
			const res = await fetch("/api/upload", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: userData.email,
					documentType: docTypeMap[id],
					fileUrl: docToDelete.url,
				}),
			});
			const data = await res.json();
			if (!data.success) {
				console.error("Failed to delete from server:", data.error);
			}
		} catch (error) {
			console.error("Delete request error:", error);
		}
	};

	const confirmAndSaveLicense = async () => {
		setIsVerifying(true);
		try {
			const res = await fetch("/api/user/compliance", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: userData.email,
					licenseNumber: extractedData.licenseNumber,
					expiryDate: extractedData.expiryDate,
					cpdPoints: 0,
				}),
			});
			const data = await res.json();
			if (data.success) {
				showToast("Compliance tracking activated!");
				setShowVerificationModal(false);
				window.dispatchEvent(new Event("userStateChanged"));
			} else {
				showToast("Failed to save compliance data.", "error");
			}
		} catch (error) {
			showToast("Network error during save.", "error");
		}
		setIsVerifying(false);
	};

	const inputStyle = {
		width: "100%",
		padding: "10px 14px",
		borderRadius: "10px",
		border: "1px solid rgba(0,0,0,0.1)",
		background: "rgba(255,255,255,0.8)",
		boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
		fontSize: "13px",
		color: "#0f172a",
		outline: "none",
		transition: "0.2s",
	};
	const labelStyle = {
		display: "block",
		fontSize: "10px",
		fontWeight: 800,
		color: "#64748b",
		letterSpacing: "1px",
		marginBottom: "6px",
		textTransform: "uppercase" as "uppercase",
	};

	return (
		<div style={{ padding: "0 1.5rem", width: "100%", position: "relative" }}>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileUpload}
				accept=".pdf,image/*"
				style={{ display: "none" }}
			/>

			{toast && (
				<div
					style={{
						position: "fixed",
						top: "40px",
						left: "50%",
						transform: "translateX(-50%)",
						background:
							toast.type === "success"
								? "rgba(15, 23, 42, 0.95)"
								: "rgba(153, 27, 27, 0.95)",
						backdropFilter: "blur(12px)",
						color: "white",
						padding: "14px 28px",
						borderRadius: "30px",
						fontSize: "14px",
						fontWeight: 700,
						display: "flex",
						alignItems: "center",
						gap: "10px",
						boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
						zIndex: 9999,
						border: "1px solid rgba(255,255,255,0.1)",
					}}
				>
					{toast.type === "success" ? "✓" : "✕"} {toast.message}
				</div>
			)}

			{showVerificationModal &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(248, 250, 252, 0.8)",
							backdropFilter: "blur(12px)",
							zIndex: 99999,
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
								borderRadius: "24px",
								overflow: "hidden",
								boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
								border: "1px solid rgba(0,0,0,0.05)",
							}}
						>
							<div
								style={{
									padding: "2rem",
									borderBottom: "1px solid #f1f5f9",
									textAlign: "center",
								}}
							>
								<div
									style={{
										width: "64px",
										height: "64px",
										background: "#eff6ff",
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										margin: "0 auto 16px auto",
										color: "#0058bc",
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
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
										<path d="m9 12 2 2 4-4"></path>
									</svg>
								</div>
								<h3
									style={{
										fontSize: "20px",
										fontWeight: 800,
										color: "#0f172a",
										margin: "0 0 8px 0",
									}}
								>
									Verify Your License
								</h3>
								<p
									style={{
										fontSize: "14px",
										color: "#64748b",
										margin: 0,
										lineHeight: "1.5",
									}}
								>
									BenchScout AI has extracted your details. Please confirm them
									to activate automated renewal tracking.
								</p>
							</div>

							<div style={{ padding: "2rem", background: "#f8fafc" }}>
								<div style={{ marginBottom: "1.5rem" }}>
									<label style={labelStyle}>Full Name on License</label>
									<input
										type="text"
										value={extractedData.fullName}
										onChange={(e) =>
											setExtractedData({
												...extractedData,
												fullName: e.target.value,
											})
										}
										style={inputStyle}
									/>
								</div>
								<div style={{ marginBottom: "1.5rem" }}>
									<label style={labelStyle}>MLSCN Registration Number</label>
									<input
										type="text"
										value={extractedData.licenseNumber}
										onChange={(e) =>
											setExtractedData({
												...extractedData,
												licenseNumber: e.target.value,
											})
										}
										placeholder="e.g. RA 12345"
										style={inputStyle}
									/>
								</div>
								<div style={{ marginBottom: "1.5rem" }}>
									<label style={labelStyle}>Expiry Date</label>
									<input
										type="date"
										value={extractedData.expiryDate}
										onChange={(e) =>
											setExtractedData({
												...extractedData,
												expiryDate: e.target.value,
											})
										}
										style={inputStyle}
									/>
								</div>

								<div
									style={{ display: "flex", gap: "12px", marginTop: "2rem" }}
								>
									<button
										onClick={() => setShowVerificationModal(false)}
										style={{
											flex: 1,
											padding: "12px",
											background: "white",
											border: "1px solid #cbd5e1",
											borderRadius: "10px",
											color: "#475569",
											fontWeight: 700,
											cursor: "pointer",
										}}
									>
										Cancel
									</button>
									<button
										onClick={confirmAndSaveLicense}
										disabled={isVerifying}
										style={{
											flex: 2,
											padding: "12px",
											background: "#0058bc",
											border: "none",
											borderRadius: "10px",
											color: "white",
											fontWeight: 700,
											cursor: isVerifying ? "wait" : "pointer",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "8px",
											boxShadow: "0 4px 12px rgba(0,88,188,0.2)",
										}}
									>
										{isVerifying ? "Saving..." : "Confirm & Activate"}
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}

			{previewDoc &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(248, 250, 252, 0.7)",
							backdropFilter: "blur(8px)",
							zIndex: 99999,
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
								maxWidth: "800px",
								borderRadius: "20px",
								overflow: "hidden",
								boxShadow: "0 20px 40px -4px rgba(0, 0, 0, 0.1)",
								border: "1px solid rgba(0,0,0,0.05)",
								display: "flex",
								flexDirection: "column",
								maxHeight: "90vh",
							}}
						>
							<div
								style={{
									padding: "1.25rem 1.5rem",
									borderBottom: "1px solid #f1f5f9",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "12px" }}
								>
									<div
										style={{
											width: "32px",
											height: "32px",
											borderRadius: "8px",
											background: "rgba(220, 252, 231, 0.6)",
											color: "#15803d",
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
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
											<polyline points="14 2 14 8 20 8"></polyline>
										</svg>
									</div>
									<div>
										<h3
											style={{
												fontSize: "16px",
												fontWeight: 800,
												color: "#0f172a",
												margin: "0 0 2px 0",
											}}
										>
											{previewDoc.name}
										</h3>
										<p
											style={{ fontSize: "12px", color: "#64748b", margin: 0 }}
										>
											Cloud Vault Preview
										</p>
									</div>
								</div>
								<button
									onClick={() => setPreviewDoc(null)}
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
								style={{
									padding: "1rem",
									flex: 1,
									overflow: "hidden",
									background: "#f8fafc",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									minHeight: "50vh",
								}}
							>
								{previewDoc.url?.toLowerCase().includes(".pdf") ? (
									<iframe
										src={previewDoc.url}
										style={{
											width: "100%",
											height: "100%",
											minHeight: "55vh",
											border: "none",
											borderRadius: "12px",
											background: "white",
											boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
										}}
										title="PDF Preview"
									/>
								) : (
									<img
										src={previewDoc.url || ""}
										alt={previewDoc.name}
										style={{
											maxWidth: "100%",
											maxHeight: "60vh",
											objectFit: "contain",
											borderRadius: "12px",
											boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
										}}
									/>
								)}
							</div>
							<div
								style={{
									padding: "1.25rem 1.5rem",
									display: "flex",
									justifyContent: "flex-end",
									gap: "12px",
									borderTop: "1px solid #f1f5f9",
									background: "white",
								}}
							>
								<button
									onClick={() => setPreviewDoc(null)}
									style={{
										padding: "10px 20px",
										borderRadius: "8px",
										border: "1px solid #e2e8f0",
										background: "white",
										color: "#475569",
										fontSize: "13px",
										fontWeight: 700,
										cursor: "pointer",
									}}
								>
									Close
								</button>
								<a
									href={previewDoc.url || "#"}
									target="_blank"
									rel="noopener noreferrer"
									style={{
										padding: "10px 20px",
										borderRadius: "8px",
										border: "none",
										background: "#0058bc",
										color: "white",
										fontSize: "13px",
										fontWeight: 700,
										cursor: "pointer",
										textDecoration: "none",
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
										stroke="currentColor"
										strokeWidth="2.5"
									>
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
										<polyline points="7 10 12 15 17 10"></polyline>
										<line x1="12" y1="15" x2="12" y2="3"></line>
									</svg>{" "}
									Open Original File
								</a>
							</div>
						</div>
					</div>,
					document.body,
				)}

			<div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
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
					System Settings
				</h1>
				<p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
					Manage your personal files, API keys, and application preferences.
				</p>
			</div>

			{checkingAuth ? (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "40vh",
						background: "rgba(255, 255, 255, 0.4)",
						backdropFilter: "blur(24px)",
						borderRadius: "20px",
						border: "1px solid rgba(255, 255, 255, 0.3)",
						gap: "12px",
						color: "#64748b",
					}}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						style={{ animation: "spin 1s linear infinite" }}
					>
						<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
					</svg>
					<span
						style={{
							fontSize: "14px",
							fontWeight: 700,
							letterSpacing: "-0.2px",
						}}
					>
						Awakening database connection...
					</span>
				</div>
			) : !isUserLoggedIn ? (
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
						System Settings Locked
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
						Log in to manage your API keys, documents, and search preferences.
					</p>
					<button
						onClick={() => window.dispatchEvent(new Event("openProfileModal"))}
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
					<div
						style={{
							background: "rgba(255, 255, 255, 0.4)",
							backdropFilter: "blur(24px)",
							WebkitBackdropFilter: "blur(24px)",
							borderRadius: "20px",
							border: "1px solid rgba(255, 255, 255, 0.3)",
							boxShadow: "0 4px 20px -2px rgba(0,0,0,0.03)",
							overflow: "hidden",
							marginBottom: "2rem",
						}}
					>
						<div
							style={{
								padding: "1.25rem 1.5rem",
								borderBottom: "1px solid rgba(0,0,0,0.05)",
								display: "flex",
								alignItems: "flex-start",
								gap: "12px",
							}}
						>
							<div style={{ color: "#0058bc", marginTop: "2px" }}>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
							</div>
							<div>
								<h2
									style={{
										margin: "0 0 2px 0",
										fontSize: "16px",
										color: "#0f172a",
										fontWeight: 800,
									}}
								>
									Profile & Search Preferences
								</h2>
								<p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
									Fine-tune how LabPro Connect identifies opportunities.
								</p>
							</div>
						</div>
						<div style={{ padding: "1.5rem" }}>
							<div
								className="mobile-grid"
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "1.5rem",
									marginBottom: "1.5rem",
								}}
							>
								<div>
									<label style={labelStyle}>FULL NAME</label>
									<input
										type="text"
										value={userData.name}
										onChange={(e) =>
											setUserData({ ...userData, name: e.target.value })
										}
										disabled={!userData.email}
										style={{
											...inputStyle,
											cursor: !userData.email ? "not-allowed" : "text",
											marginBottom: 0,
										}}
									/>
								</div>
								<div>
									<label style={labelStyle}>DEFAULT EMAIL</label>
									<input
										type="email"
										value={userData.email}
										readOnly
										placeholder="Please log in"
										style={{
											...inputStyle,
											cursor: "not-allowed",
											opacity: 0.7,
											marginBottom: 0,
										}}
									/>
								</div>
							</div>
							<div style={{ marginBottom: "1.5rem" }}>
								<label style={labelStyle}>ROLE KEYWORDS</label>
								<div
									style={{
										border: "1px solid rgba(0,0,0,0.1)",
										background: "rgba(255,255,255,0.5)",
										borderRadius: "10px",
										padding: "6px",
										minHeight: "42px",
										display: "flex",
										flexWrap: "wrap",
										gap: "6px",
										alignItems: "center",
									}}
								>
									{userData.keywords.map((kw, idx) => (
										<div
											key={idx}
											style={{
												background: "#0058bc",
												color: "white",
												padding: "4px 10px",
												borderRadius: "14px",
												fontSize: "12px",
												fontWeight: 600,
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											{kw}{" "}
											<span
												onClick={() => removeKeyword(idx)}
												style={{
													cursor: "pointer",
													fontSize: "14px",
													lineHeight: "1",
													opacity: 0.8,
												}}
											>
												×
											</span>
										</div>
									))}
									<input
										type="text"
										placeholder={
											userData.email ? "Add keyword (Press Enter)..." : ""
										}
										onKeyDown={handleAddKeyword}
										disabled={!userData.email}
										style={{
											border: "none",
											outline: "none",
											flex: 1,
											minWidth: "120px",
											fontSize: "13px",
											color: "#0f172a",
											padding: "4px 6px",
											background: "transparent",
											cursor: !userData.email ? "not-allowed" : "text",
										}}
									/>
								</div>
							</div>
							<div
								className="mobile-grid"
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "1.5rem",
									alignItems: "center",
								}}
							>
								<div>
									<label style={labelStyle}>PRIMARY LOCATION</label>
									<div style={{ position: "relative" }}>
										<div
											style={{
												position: "absolute",
												left: "12px",
												top: "50%",
												transform: "translateY(-50%)",
												color: "#64748b",
												pointerEvents: "none",
											}}
										>
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
												<circle cx="12" cy="10" r="3"></circle>
											</svg>
										</div>
										<select
											style={{
												...inputStyle,
												paddingLeft: "36px",
												appearance: "none",
												cursor: !userData.email ? "not-allowed" : "pointer",
												marginBottom: 0,
											}}
											value={userData.location}
											disabled={!userData.email}
											onChange={(e) =>
												setUserData({ ...userData, location: e.target.value })
											}
										>
											{NIGERIA_STATES.map((state) => (
												<option key={state} value={state}>
													{state}
												</option>
											))}
										</select>
									</div>
								</div>
								<div>
									<label style={labelStyle}>MINIMUM MATCH SCORE (%)</label>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "16px",
										}}
									>
										<input
											type="range"
											min="0"
											max="100"
											value={userData.minScore}
											disabled={!userData.email}
											onChange={(e) =>
												setUserData({
													...userData,
													minScore: parseInt(e.target.value),
												})
											}
											style={{
												flex: 1,
												accentColor: "#0058bc",
												cursor: !userData.email ? "not-allowed" : "pointer",
											}}
										/>
										<span
											style={{
												fontSize: "20px",
												fontWeight: 800,
												color: "#0058bc",
												width: "45px",
												textAlign: "right",
											}}
										>
											{userData.minScore}%
										</span>
									</div>
								</div>
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "flex-end",
									gap: "12px",
									marginTop: "24px",
									paddingTop: "1rem",
									borderTop: "1px solid rgba(0,0,0,0.05)",
								}}
							>
								<button
									disabled={!userData.email}
									style={{
										background: "rgba(255,255,255,0.8)",
										border: "1px solid rgba(0,0,0,0.1)",
										padding: "8px 24px",
										borderRadius: "8px",
										fontSize: "12px",
										fontWeight: 700,
										cursor: !userData.email ? "not-allowed" : "pointer",
										opacity: !userData.email ? 0.5 : 1,
									}}
								>
									Cancel
								</button>
								<button
									onClick={handleUpdateProfile}
									disabled={isSaving || !userData.email}
									style={{
										background: "#0058bc",
										color: "white",
										border: "none",
										padding: "8px 24px",
										borderRadius: "8px",
										fontSize: "12px",
										fontWeight: 700,
										cursor:
											isSaving || !userData.email ? "not-allowed" : "pointer",
										boxShadow: "0 4px 12px rgba(0, 88, 188, 0.2)",
										opacity: !userData.email ? 0.5 : 1,
									}}
								>
									{isSaving ? "Saving..." : "Update Profile"}
								</button>
							</div>
						</div>
					</div>

					<div
						className="mobile-stack"
						style={{
							display: "flex",
							gap: "1.5rem",
							alignItems: "flex-start",
							paddingBottom: "3rem",
						}}
					>
						<div
							style={{
								flex: 1.5,
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								width: "100%",
							}}
						>
							<div>
								<h2
									style={{
										fontSize: "16px",
										fontWeight: 800,
										color: "#0f172a",
										margin: "0 0 4px 0",
										display: "flex",
										alignItems: "center",
										gap: "8px",
									}}
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="#0058bc"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
									</svg>{" "}
									Secure Document Vault
								</h2>
								<p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
									Keep your standard files ready for deployment.
								</p>
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "10px",
								}}
							>
								{documents.map((doc) => (
									<div
										key={doc.id}
										className="mobile-stack"
										style={{
											background: "rgba(255, 255, 255, 0.5)",
											backdropFilter: "blur(16px)",
											border: "1px solid rgba(255, 255, 255, 0.4)",
											borderRadius: "12px",
											padding: "1rem",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
										}}
									>
										<div
											style={{
												flex: 1,
												display: "flex",
												alignItems: "center",
												gap: "12px",
												minWidth: 0,
											}}
										>
											<div
												style={{
													width: "32px",
													height: "32px",
													borderRadius: "8px",
													background: doc.url
														? "rgba(220, 252, 231, 0.6)"
														: "rgba(241, 245, 249, 0.6)",
													color: doc.url ? "#15803d" : "#94a3b8",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0,
												}}
											>
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
													<polyline points="14 2 14 8 20 8"></polyline>
												</svg>
											</div>
											<div style={{ flex: 1, minWidth: 0 }}>
												<h3
													style={{
														margin: "0 0 2px 0",
														fontSize: "12px",
														fontWeight: 800,
														color: "#0f172a",
														whiteSpace: "nowrap",
														overflow: "hidden",
														textOverflow: "ellipsis",
													}}
												>
													{doc.name}
												</h3>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														fontSize: "10px",
														color: "#64748b",
														fontWeight: 600,
														flexWrap: "wrap",
													}}
												>
													<span>{doc.type}</span>
													{doc.url ? (
														<>
															<span
																style={{
																	width: "3px",
																	height: "3px",
																	borderRadius: "50%",
																	background: "#cbd5e1",
																}}
															></span>
															<span>{doc.size}</span>
															<span
																style={{
																	width: "3px",
																	height: "3px",
																	borderRadius: "50%",
																	background: "#cbd5e1",
																}}
															></span>
															<span style={{ color: "#15803d" }}>
																Uploaded {doc.uploadedAt}
															</span>
														</>
													) : (
														<>
															<span
																style={{
																	width: "3px",
																	height: "3px",
																	borderRadius: "50%",
																	background: "#cbd5e1",
																}}
															></span>
															<span style={{ color: "#ef4444" }}>Missing</span>
														</>
													)}
												</div>
											</div>
										</div>
										<div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
											{doc.url ? (
												<>
													<button
														onClick={() => setPreviewDoc(doc)}
														style={{
															background: "rgba(255,255,255,0.8)",
															border: "1px solid rgba(0,0,0,0.05)",
															color: "#0f172a",
															padding: "6px 12px",
															borderRadius: "6px",
															fontSize: "11px",
															fontWeight: 700,
															cursor: "pointer",
															whiteSpace: "nowrap",
														}}
													>
														View
													</button>
													<button
														onClick={() => handleDeleteDoc(doc.id)}
														style={{
															background: "rgba(254, 242, 242, 0.8)",
															border: "1px solid rgba(254, 202, 202, 0.5)",
															color: "#ef4444",
															padding: "6px 12px",
															borderRadius: "6px",
															fontSize: "11px",
															fontWeight: 700,
															cursor: "pointer",
															whiteSpace: "nowrap",
														}}
													>
														Delete
													</button>
												</>
											) : (
												<button
													onClick={() => triggerUpload(doc.id)}
													disabled={!userData.email || isUploading}
													style={{
														background:
															!userData.email || isUploading
																? "#94a3b8"
																: "#0058bc",
														border: "none",
														color: "white",
														padding: "6px 16px",
														borderRadius: "6px",
														fontSize: "11px",
														fontWeight: 700,
														cursor:
															!userData.email || isUploading
																? "not-allowed"
																: "pointer",
														whiteSpace: "nowrap",
														boxShadow:
															!userData.email || isUploading
																? "none"
																: "0 4px 10px rgba(0, 88, 188, 0.2)",
													}}
												>
													{isUploading && activeUploadId === doc.id
														? "Uploading..."
														: "Upload File"}
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>

						<div
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								width: "100%",
							}}
						>
							<div>
								<h2
									style={{
										fontSize: "16px",
										fontWeight: 800,
										color: "#0f172a",
										margin: "0 0 4px 0",
									}}
								>
									System Integrations
								</h2>
								<p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
									API keys for AI parsing and delivery.
								</p>
							</div>
							<div
								style={{
									background: "rgba(255, 255, 255, 0.5)",
									backdropFilter: "blur(24px)",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									borderRadius: "12px",
									padding: "1.25rem",
									boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
									width: "100%",
								}}
							>
								<div style={{ marginBottom: "1rem" }}>
									<label style={labelStyle}>ANTHROPIC API KEY (CLAUDE)</label>
									<input
										type="password"
										placeholder="sk-ant-api03-..."
										defaultValue="sk-ant-api03-xxxx-xxxx-xxxx"
										style={inputStyle}
									/>
								</div>
								<div style={{ marginBottom: "1.25rem" }}>
									<label style={labelStyle}>GMAIL APP PASSWORD</label>
									<input
										type="password"
										placeholder="xxxx xxxx xxxx xxxx"
										style={inputStyle}
									/>
								</div>
								<div
									style={{
										display: "flex",
										justifyContent: "flex-end",
										marginTop: "1rem",
									}}
								>
									<button
										onClick={() => showToast("API Configuration Saved!")}
										style={{
											background: "#0f172a",
											color: "white",
											border: "none",
											padding: "10px 24px",
											borderRadius: "8px",
											fontSize: "12px",
											fontWeight: 700,
											cursor: "pointer",
										}}
									>
										Save Integrations
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
