import type { Viewport } from "next";
import "./globals.css";
import "./appearance-palette.css";
import "./appearance.css";
import { APPEARANCE_BOOTSTRAP } from "@/lib/appearance";
import NavigationScrollReset from "@/components/NavigationScrollReset";
import SessionGate from "@/components/SessionGate";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileSupportFooter from "@/components/FooterSupport";
import ScanStatus from "@/components/ScanStatus";
import ProfileModal from "@/components/ProfileModal";

export const metadata = {
	title: "BenchScout",
	description: "YOUR MLS CAREER HUB",
	applicationName: "BenchScout",
	// Keep Home Screen capability without pinning the native status-bar style.
	other: {
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-title": "BenchScout",
	},
};

// Owner-requested 90% starting scale; preserve manual pinch zoom.
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 0.9,
    viewportFit: "cover",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head><meta name="theme-color" content="#edf5fd" /><script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP }} /></head>
			<body
				style={{
					margin: 0,
					padding: 0,
					height: "100dvh",
					overflow: "hidden",
					fontFamily:
						"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					backgroundColor: "var(--appearance-surface-f8fafc)",
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
				<div className="app-background"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100dvh",
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
				<div className="app-background"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100dvh",
						zIndex: -1,
						/* Slightly more transparent so colors bleed through nicely */
						background:
							"linear-gradient(var(--appearance-surface-rgba24825025205), var(--appearance-surface-rgba248250252085))",
					}}
				/>

				<SessionGate>
				<ProfileModal />
                <ScanStatus />

				<div className="app-shell"
					style={{
						display: "flex",
						width: "100vw",
						height: "100dvh",
						overflow: "hidden",
					}}
				>
					<Sidebar />

					{/* 🚀 THE LAYOUT FIX: Moved the scroll zone to this parent wrapper */}
					<div id="page-scroll-pane"
						style={{
							flex: 1,
                            minHeight: 0,
							display: "flex",
							flexDirection: "column",
							height: "100dvh",
							minWidth: 0,
							overflowY:
								"auto" /* Now the entire right side scrolls together */,
							position:
								"relative" /* Required to allow the Topbar to "stick" to the top of this container */,
						}}
					>
						{/* The Topbar now floats naturally over the scrolling content */}
						<Topbar />
                        <NavigationScrollReset />

						<main
							className="main-wrapper"
							style={{
								flex: 1,
								width: "100%",
								/* overflowY: "auto" has been permanently removed from here */
							}}
						>
							<div style={{ width: "100%", maxWidth: "100%" }}>{children}</div>
						</main>
                        <MobileSupportFooter />
					</div>
				</div>
			</SessionGate>
			</body>
		</html>
	);
}
