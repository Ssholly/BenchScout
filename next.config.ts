import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// This tells Next.js and Turbopack to NOT bundle or alter this specific legacy library
	serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
