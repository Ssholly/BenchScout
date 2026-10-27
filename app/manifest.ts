import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "BenchScout",
        short_name: "BenchScout",
        description: "Your medical laboratory science career hub.",
        start_url: "/home",
        scope: "/",
        display: "standalone",
        background_color: "#edf5fd",
        theme_color: "#edf5fd",
        icons: [
            { src: "/icons/benchscout-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icons/benchscout-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icons/benchscout-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
