export const SkeletonRow = () => (
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

export const TableHeader = () => (
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