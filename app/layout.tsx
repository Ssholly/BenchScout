import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProfileModal from "@/components/ProfileModal";

export const metadata = {
	title: "BenchScout",
	description: "YOUR MLS CAREER HUB",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					padding: 0,
					height: "100vh",
					overflow: "hidden",
					fontFamily:
						"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					backgroundColor: "#f8fafc",
					position: "relative",
				}}
			>
				{/* ========================================================= */}
				{/* 🚀 GLOBAL LAYOUT CSS (Mobile Padding Fix)                 */}
				{/* ========================================================= */}
				<style
					dangerouslySetInnerHTML={{
						__html: `
            .main-wrapper {
              padding: 2.5rem;
            }
            @media (max-width: 768px) {
              .main-wrapper {
                padding: 1rem; /* Shrinks the walls on mobile so content can breathe */
              }
            }
          `,
					}}
				/>

				{/* ========================================================= */}
				{/* LAYER 1: Shifted & Centered Blurred Image                 */}
				{/* ========================================================= */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: -2,
						backgroundImage: "url('/IMG_5538.jpg')",
						/* FIX: Zoom in and shift the colors towards the center */
						backgroundSize: "140%",
						backgroundPosition: "30% 50%",
						filter: "blur(60px) saturate(200%)",
						transform: "scale(1.2)",
						opacity: 0.75 /* Slightly brighter */,
					}}
				/>

				{/* ========================================================= */}
				{/* LAYER 2: Softer Frosted Overlay                           */}
				{/* ========================================================= */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						zIndex: -1,
						/* Slightly more transparent so colors bleed through nicely */
						background:
							"linear-gradient(rgba(248, 250, 252, 0.5), rgba(248, 250, 252, 0.85))",
					}}
				/>

				<ProfileModal />

				<div
					style={{
						display: "flex",
						width: "100vw",
						height: "100vh",
						overflow: "hidden",
					}}
				>
					<Sidebar />

					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							height: "100vh",
							minWidth: 0,
						}}
					>
						<Topbar />

						<main
							className="main-wrapper" /* 🚀 Dynamic padding applied here */
							style={{
								flex: 1,
								overflowY: "auto",
								width: "100%",
							}}
						>
							<div style={{ width: "100%", maxWidth: "100%" }}>{children}</div>
						</main>
					</div>
				</div>
			</body>
		</html>
	);
}
