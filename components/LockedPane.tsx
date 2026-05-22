export default function LockedPane({
	title,
	sub,
}: {
	title: string;
	sub: string;
}) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "4rem 2rem",
				background: "rgba(255,255,255,0.5)",
				borderRadius: "24px",
				minHeight: "60vh",
				textAlign: "center",
			}}
		>
			<div
				style={{
					background: "#f1f5f9",
					width: "80px",
					height: "80px",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginBottom: "1.5rem",
				}}
			>
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#64748b"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			</div>
			<h2
				style={{
					fontSize: "24px",
					fontWeight: 800,
					color: "#0f172a",
					marginBottom: "8px",
				}}
			>
				{title} Locked
			</h2>
			<p style={{ color: "#64748b", maxWidth: "400px", marginBottom: "2rem" }}>
				{sub}
			</p>
			<a
				href="/auth"
				style={{
					background: "#0058bc",
					color: "white",
					padding: "12px 24px",
					borderRadius: "12px",
					fontWeight: 800,
					textDecoration: "none",
				}}
			>
				Log In to Access
			</a>
		</div>
	);
}
